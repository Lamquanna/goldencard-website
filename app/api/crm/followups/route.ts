import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logger } from '@/lib/logger';
import { requireAuth } from '@/lib/auth/middleware';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET - Fetch follow-up tasks
 * Query params: lead_id, user_id, status, priority, due_date
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authentication check
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('lead_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const dueDate = searchParams.get('due_date');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    logger.debug('Fetching follow-ups', { leadId, userId, status, priority, requestId });
    
    // Build dynamic query
    let query = `
      SELECT f.*, 
             l.name as lead_name, 
             l.email as lead_email,
             l.phone as lead_phone
      FROM crm_followups f
      LEFT JOIN leads l ON f.lead_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;
    
    if (leadId) {
      query += ` AND f.lead_id = $${paramIndex}`;
      params.push(leadId);
      paramIndex++;
    }
    
    if (userId) {
      query += ` AND f.assigned_to = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND f.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (priority) {
      query += ` AND f.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }
    
    if (dueDate) {
      query += ` AND f.due_date::date = $${paramIndex}`;
      params.push(dueDate);
      paramIndex++;
    }
    
    query += ` ORDER BY f.priority DESC, f.due_date ASC LIMIT ${limit}`;
    
    const dbStartTime = Date.now();
    const result = await sql.query(query, params);
    logger.dbQuery(query, Date.now() - dbStartTime);
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'GET', 
      url: '/api/crm/followups', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      followups: result.rows,
      count: result.rows.length 
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error fetching follow-ups', error, { requestId });
    return createErrorResponse(
      'Failed to fetch follow-ups',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * POST - Create follow-up task
 * Body: { lead_id, assigned_to, title, description, due_date, priority, type }
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authentication check
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const body = await request.json();
    const { lead_id, assigned_to, title, description, due_date, priority, type } = body;
    
    // Validation
    if (!lead_id || !title || !due_date) {
      return createErrorResponse(
        'lead_id, title, and due_date are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return createErrorResponse(
        'priority must be high, medium, or low',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (type && !['call', 'email', 'meeting', 'task', 'other'].includes(type)) {
      return createErrorResponse(
        'type must be call, email, meeting, task, or other',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Creating follow-up', { lead_id, title, requestId });
    
    const timestamp = new Date().toISOString();
    
    const dbStartTime = Date.now();
    const result = await sql`
      INSERT INTO crm_followups (
        lead_id,
        assigned_to,
        title,
        description,
        due_date,
        priority,
        type,
        status,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${lead_id},
        ${assigned_to || null},
        ${title},
        ${description || ''},
        ${due_date},
        ${priority || 'medium'},
        ${type || 'task'},
        'pending',
        ${user.userId},
        ${timestamp},
        ${timestamp}
      )
      RETURNING *
    `;
    logger.dbQuery('INSERT INTO crm_followups', Date.now() - dbStartTime);
    
    const followup = result.rows[0];
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'CREATE',
      entity_type: 'followup',
      entity_id: followup.id,
      metadata: { lead_id, title, priority, created_by_email: user.email }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'POST', 
      url: '/api/crm/followups', 
      statusCode: 201, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ followup }, requestId);
    
  } catch (error: any) {
    logger.error('Error creating follow-up', error, { requestId });
    return createErrorResponse(
      'Failed to create follow-up',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * PUT - Update follow-up task
 */
export async function PUT(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authentication check
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const body = await request.json();
    const { id, status, assigned_to, title, description, due_date, priority, completed_at } = body;
    
    if (!id) {
      return createErrorResponse(
        'id is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Updating follow-up', { id, status, requestId });
    
    // Build update query dynamically
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramIndex}`);
      params.push(assigned_to);
      paramIndex++;
    }
    
    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      params.push(title);
      paramIndex++;
    }
    
    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(description);
      paramIndex++;
    }
    
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      params.push(due_date);
      paramIndex++;
    }
    
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex}`);
      params.push(priority);
      paramIndex++;
    }
    
    if (completed_at !== undefined) {
      updates.push(`completed_at = $${paramIndex}`);
      params.push(completed_at);
      paramIndex++;
    }
    
    updates.push(`updated_by = $${paramIndex}`);
    params.push(user.userId);
    paramIndex++;
    
    updates.push(`updated_at = $${paramIndex}`);
    params.push(new Date().toISOString());
    paramIndex++;
    
    if (updates.length === 0) {
      return createErrorResponse(
        'No fields to update',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    params.push(id);
    const query = `
      UPDATE crm_followups 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const dbStartTime = Date.now();
    const result = await sql.query(query, params);
    logger.dbQuery('UPDATE crm_followups', Date.now() - dbStartTime);
    
    if (result.rows.length === 0) {
      return createErrorResponse(
        'Follow-up not found',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
      );
    }
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'UPDATE',
      entity_type: 'followup',
      entity_id: id,
      changes: { status, assigned_to, title, priority },
      metadata: { updated_by_email: user.email }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'PUT', 
      url: '/api/crm/followups', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ followup: result.rows[0] }, requestId);
    
  } catch (error: any) {
    logger.error('Error updating follow-up', error, { requestId });
    return createErrorResponse(
      'Failed to update follow-up',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

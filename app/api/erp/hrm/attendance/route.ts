import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/auth/middleware';
import { createAuditLog } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET - Fetch attendance records
 * Query params: user_id, start_date, end_date, status
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const status = searchParams.get('status');
    
    logger.debug('Fetching attendance records', { userId, startDate, endDate, status, requestId, authenticatedUser: user.userId });
    
    // Build query with filters
    let query = 'SELECT * FROM erp_attendance WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND check_in >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND check_in <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    query += ' ORDER BY check_in DESC LIMIT 100';
    
    const dbStartTime = Date.now();
    const result = await sql.query(query, params);
    logger.dbQuery(query, Date.now() - dbStartTime);
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'GET', 
      url: '/api/erp/hrm/attendance', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      records: result.rows,
      count: result.rows.length 
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error fetching attendance records', error, { requestId });
    return createErrorResponse(
      'Failed to fetch attendance records',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * POST - Create attendance record (check-in/check-out)
 * Body: { type: 'check-in' | 'check-out', location?, notes? }
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const body = await request.json();
    const { type, location, notes } = body;
    
    // Use authenticated user ID instead of request body
    const user_id = user.userId;
    
    if (!type) {
      return createErrorResponse(
        'type is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (!['check-in', 'check-out'].includes(type)) {
      return createErrorResponse(
        'type must be check-in or check-out',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Creating attendance record', { user_id, type, location, requestId, authenticatedUser: user.userId });
    
    const timestamp = new Date().toISOString();
    
    if (type === 'check-in') {
      // Create new attendance record
      const dbStartTime = Date.now();
      const result = await sql`
        INSERT INTO erp_attendance (
          user_id, 
          check_in, 
          location_check_in, 
          notes,
          status,
          created_at
        ) VALUES (
          ${user_id},
          ${timestamp},
          ${location || null},
          ${notes || null},
          'active',
          ${timestamp}
        )
        RETURNING *
      `;
      logger.dbQuery('INSERT INTO erp_attendance', Date.now() - dbStartTime);
      
      // Create audit log
      await createAuditLog({
        user_id: user.userId,
        action: 'CREATE',
        entity_type: 'attendance',
        entity_id: result.rows[0].id?.toString(),
        metadata: {
          email: user.email,
          location: location || null,
          notes: notes || null,
          timestamp,
          action_detail: 'check_in'
        }
      });
      
      const duration = Date.now() - startTime;
      logger.apiRequest({ 
        method: 'POST', 
        url: '/api/erp/hrm/attendance', 
        statusCode: 201, 
        duration, 
        requestId 
      });
      
      return createSuccessResponse({ 
        record: result.rows[0],
        message: 'Check-in successful'
      }, requestId);
      
    } else {
      // Update existing record with check-out
      const dbStartTime = Date.now();
      const result = await sql`
        UPDATE erp_attendance 
        SET 
          check_out = ${timestamp},
          location_check_out = ${location || null},
          status = 'completed',
          updated_at = ${timestamp}
        WHERE user_id = ${user_id}
          AND status = 'active'
          AND check_in::date = CURRENT_DATE
        RETURNING *
      `;
      logger.dbQuery('UPDATE erp_attendance', Date.now() - dbStartTime);
      
      if (result.rows.length === 0) {
        return createErrorResponse(
          'No active check-in found for today',
          ErrorCodes.NOT_FOUND,
          404,
          undefined,
          requestId
        );
      }
      
      // Calculate hours worked
      const record = result.rows[0];
      const checkIn = new Date(record.check_in);
      const checkOut = new Date(record.check_out);
      const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
      
      // Create audit log
      await createAuditLog({
        user_id: user.userId,
        action: 'UPDATE',
        entity_type: 'attendance',
        entity_id: record.id?.toString(),
        metadata: {
          email: user.email,
          location: location || null,
          timestamp,
          hoursWorked: hoursWorked.toFixed(2),
          action_detail: 'check_out'
        }
      });
      
      const duration = Date.now() - startTime;
      logger.apiRequest({ 
        method: 'POST', 
        url: '/api/erp/hrm/attendance', 
        statusCode: 200, 
        duration, 
        requestId 
      });
      
      return createSuccessResponse({ 
        record: { ...record, hours_worked: hoursWorked.toFixed(2) },
        message: 'Check-out successful'
      }, requestId);
    }
    
  } catch (error: any) {
    logger.error('Error creating attendance record', error, { requestId });
    return createErrorResponse(
      'Failed to create attendance record',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

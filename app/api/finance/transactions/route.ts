import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler';
import { createAuditLog } from '@/lib/audit-log';
import { requireAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET - Fetch all finance transactions
 * Query params: type, category, status, start_date, end_date, search, limit, offset
 * Optional auth: user can query their own transactions or all if admin
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Optional authentication - check if user is logged in
    let user = null;
    const authResult = requireAuth(request);
    if (!(authResult instanceof NextResponse)) {
      user = authResult.user;
    } else {
      // No authentication provided, continue without user context
      logger.debug('No authentication provided for GET transactions', { requestId });
    }
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // income, expense, transfer
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    logger.debug('Fetching finance transactions', { type, category, status, userId: user?.userId, requestId });
    
    let query = 'SELECT * FROM finance_transactions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    // If user is authenticated but not admin, filter by their transactions
    if (user && user.role !== 'admin') {
      query += ` AND created_by = $${paramIndex}`;
      params.push(user.userId);
      paramIndex++;
    }
    
    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }
    
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (startDate) {
      query += ` AND transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      query += ` AND transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (description ILIKE $${paramIndex} OR reference_number ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY transaction_date DESC, created_at DESC LIMIT ${limit} OFFSET ${offset}`;
    
    const dbStartTime = Date.now();
    const result = await sql.query(query, params);
    logger.dbQuery(query, Date.now() - dbStartTime);
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'GET', 
      url: '/api/finance/transactions', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      transactions: result.rows,
      count: result.rows.length,
      limit,
      offset
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error fetching transactions', error, { requestId });
    return createErrorResponse(
      'Failed to fetch transactions',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * POST - Create finance transaction
 * Body: { type, category, amount, transaction_date, description, reference_number, metadata }
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Require authentication
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
  
    const body = await request.json();
    const { type, category, amount, transaction_date, description, reference_number, metadata } = body;
    
    // Validation
    if (!type || !amount || !transaction_date) {
      return createErrorResponse(
        'type, amount, and transaction_date are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (!['income', 'expense', 'transfer'].includes(type)) {
      return createErrorResponse(
        'type must be income, expense, or transfer',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (amount <= 0) {
      return createErrorResponse(
        'amount must be greater than 0',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Creating transaction', { type, amount, category, userId: user.userId, requestId });
    
    const timestamp = new Date().toISOString();
    
    const dbStartTime = Date.now();
    const result = await sql`
      INSERT INTO finance_transactions (
        type,
        category,
        amount,
        transaction_date,
        description,
        reference_number,
        status,
        created_by,
        created_at,
        updated_at,
        metadata
      ) VALUES (
        ${type},
        ${category || 'uncategorized'},
        ${amount},
        ${transaction_date},
        ${description || ''},
        ${reference_number || null},
        'completed',
        ${user.userId},
        ${timestamp},
        ${timestamp},
        ${JSON.stringify(metadata || {})}
      )
      RETURNING *
    `;
    logger.dbQuery('INSERT INTO finance_transactions', Date.now() - dbStartTime);
    
    const transaction = result.rows[0];
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'CREATE',
      entity_type: 'finance_transaction',
      entity_id: transaction.id,
      metadata: { 
        type, 
        category, 
        amount,
        userEmail: user.email 
      }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'POST', 
      url: '/api/finance/transactions', 
      statusCode: 201, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ transaction }, requestId);
    
  } catch (error: any) {
    logger.error('Error creating transaction', error, { requestId });
    return createErrorResponse(
      'Failed to create transaction',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * DELETE - Delete transaction (soft delete)
 */
export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Require authentication
    const authResult = requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;
  
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return createErrorResponse(
        'id is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Deleting transaction', { id, userId: user.userId, requestId });
    
    const timestamp = new Date().toISOString();
    
    const dbStartTime = Date.now();
    const result = await sql`
      UPDATE finance_transactions 
      SET 
        status = 'deleted',
        deleted_at = ${timestamp},
        deleted_by = ${user.userId}
      WHERE id = ${id} AND status != 'deleted'
      RETURNING *
    `;
    logger.dbQuery('DELETE finance_transactions', Date.now() - dbStartTime);
    
    if (result.rows.length === 0) {
      return createErrorResponse(
        'Transaction not found or already deleted',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
      );
    }
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'DELETE',
      entity_type: 'finance_transaction',
      entity_id: id,
      metadata: {
        userEmail: user.email
      }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'DELETE', 
      url: '/api/finance/transactions', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      message: 'Transaction deleted successfully',
      transaction: result.rows[0]
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error deleting transaction', error, { requestId });
    return createErrorResponse(
      'Failed to delete transaction',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

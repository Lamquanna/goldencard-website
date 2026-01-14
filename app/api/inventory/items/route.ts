import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
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
 * GET - Fetch inventory items
 * Query params: category, location, status, search, limit, offset
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const lowStock = searchParams.get('low_stock') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    logger.debug('Fetching inventory items', { category, location, status, requestId });
    
    let query = 'SELECT * FROM inventory_items WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    if (location) {
      query += ` AND location = $${paramIndex}`;
      params.push(location);
      paramIndex++;
    }
    
    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (lowStock) {
      query += ' AND quantity <= reorder_level';
    }
    
    query += ` ORDER BY name ASC LIMIT ${limit} OFFSET ${offset}`;
    
    const dbStartTime = Date.now();
    const result = await sql.query(query, params);
    logger.dbQuery(query, Date.now() - dbStartTime);
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'GET', 
      url: '/api/inventory/items', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      items: result.rows,
      count: result.rows.length,
      limit,
      offset
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error fetching inventory items', error, { requestId });
    return createErrorResponse(
      'Failed to fetch inventory items',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * POST - Create inventory item
 * Body: { name, sku, category, quantity, unit, reorder_level, location }
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
    const { name, sku, category, quantity, unit, reorder_level, location, description, metadata } = body;
    
    // Validation
    if (!name || !sku || quantity === undefined) {
      return createErrorResponse(
        'name, sku, and quantity are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (quantity < 0) {
      return createErrorResponse(
        'quantity cannot be negative',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Creating inventory item', { name, sku, quantity, requestId });
    
    const timestamp = new Date().toISOString();
    
    const dbStartTime = Date.now();
    const result = await sql`
      INSERT INTO inventory_items (
        name,
        sku,
        category,
        quantity,
        unit,
        reorder_level,
        location,
        description,
        status,
        created_by,
        created_at,
        updated_at,
        metadata
      ) VALUES (
        ${name},
        ${sku},
        ${category || 'uncategorized'},
        ${quantity},
        ${unit || 'pcs'},
        ${reorder_level || 10},
        ${location || 'warehouse'},
        ${description || ''},
        'active',
        ${user.userId},
        ${timestamp},
        ${timestamp},
        ${JSON.stringify(metadata || {})}
      )
      RETURNING *
    `;
    logger.dbQuery('INSERT INTO inventory_items', Date.now() - dbStartTime);
    
    const item = result.rows[0];
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'CREATE',
      entity_type: 'inventory_item',
      entity_id: item.id,
      metadata: { 
        name, 
        sku, 
        quantity,
        user_email: user.email
      }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'POST', 
      url: '/api/inventory/items', 
      statusCode: 201, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ item }, requestId);
    
  } catch (error: any) {
    logger.error('Error creating inventory item', error, { requestId });
    
    // Check for duplicate SKU
    if (error.message?.includes('unique constraint')) {
      return createErrorResponse(
        'SKU already exists',
        ErrorCodes.VALIDATION_ERROR,
        400,
        'This SKU is already in use',
        requestId
      );
    }
    
    return createErrorResponse(
      'Failed to create inventory item',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

/**
 * PUT - Update inventory item quantity
 * Body: { id, quantity_change, type: 'add' | 'subtract' | 'set', reason }
 */
export async function PUT(request: NextRequest) {
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
    const { id, quantity_change, type, reason } = body;
    
    if (!id || quantity_change === undefined || !type) {
      return createErrorResponse(
        'id, quantity_change, and type are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    if (!['add', 'subtract', 'set'].includes(type)) {
      return createErrorResponse(
        'type must be add, subtract, or set',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.debug('Updating inventory quantity', { id, quantity_change, type, requestId });
    
    const timestamp = new Date().toISOString();
    
    let updateQuery = '';
    if (type === 'add') {
      updateQuery = `quantity = quantity + ${quantity_change}`;
    } else if (type === 'subtract') {
      updateQuery = `quantity = quantity - ${quantity_change}`;
    } else {
      updateQuery = `quantity = ${quantity_change}`;
    }
    
    const dbStartTime = Date.now();
    const result = await sql.query(`
      UPDATE inventory_items 
      SET 
        ${updateQuery},
        updated_by = $1,
        updated_at = $2
      WHERE id = $3
      RETURNING *
    `, [user.userId, timestamp, id]);
    logger.dbQuery('UPDATE inventory_items', Date.now() - dbStartTime);
    
    if (result.rows.length === 0) {
      return createErrorResponse(
        'Inventory item not found',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
      );
    }
    
    const item = result.rows[0];
    
    // Create inventory movement log
    await sql`
      INSERT INTO inventory_movements (
        item_id,
        type,
        quantity,
        reason,
        created_by,
        created_at
      ) VALUES (
        ${id},
        ${type},
        ${quantity_change},
        ${reason || 'Manual adjustment'},
        ${user.userId},
        ${timestamp}
      )
    `;
    
    // Audit log
    await createAuditLog({
      user_id: user.userId,
      action: 'UPDATE',
      entity_type: 'inventory_item',
      entity_id: id,
      changes: { 
        type, 
        quantity_change, 
        new_quantity: item.quantity,
        user_email: user.email
      }
    });
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'PUT', 
      url: '/api/inventory/items', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      item,
      message: `Quantity ${type === 'add' ? 'increased' : type === 'subtract' ? 'decreased' : 'updated'} successfully`
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error updating inventory item', error, { requestId });
    return createErrorResponse(
      'Failed to update inventory item',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

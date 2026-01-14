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

export const dynamic = 'force-dynamic';

/**
 * POST - Stock Out (Remove inventory quantity)
 * Body: { itemId, quantity, projectId, notes, recipientName, referenceNumber }
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
    const { itemId, quantity, projectId, notes, recipientName, referenceNumber } = body;
    
    // Validation
    if (!itemId) {
      return createErrorResponse('Item ID is required', ErrorCodes.VALIDATION_ERROR, 400);
    }
    
    if (!quantity || quantity <= 0) {
      return createErrorResponse('Quantity must be greater than 0', ErrorCodes.VALIDATION_ERROR, 400);
    }
    
    if (!projectId) {
      return createErrorResponse(
        'Project ID is required for stock-out transactions',
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
    
    logger.info('Processing stock-out transaction', { 
      itemId, 
      quantity, 
      projectId,
      userId: user.userId,
      requestId 
    });
    
    // Check if sufficient stock is available
    const stockCheck = await sql.query(
      'SELECT id, name, sku, quantity, unit, reorder_level FROM inventory_items WHERE id = $1',
      [itemId]
    );
    
    if (stockCheck.rows.length === 0) {
      return createErrorResponse('Item not found', ErrorCodes.NOT_FOUND, 404);
    }
    
    const item = stockCheck.rows[0];
    
    if (item.quantity < quantity) {
      return createErrorResponse(
        `Insufficient stock. Available: ${item.quantity} ${item.unit}, Requested: ${quantity} ${item.unit}`,
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
    
    // Use transaction to ensure atomicity
    const dbStartTime = Date.now();
    const result = await sql.query(`
      WITH updated_item AS (
        UPDATE inventory_items 
        SET 
          quantity = quantity - $1,
          last_stock_update = NOW(),
          updated_at = NOW()
        WHERE id = $2 AND quantity >= $1
        RETURNING id, name, sku, quantity, unit, reorder_level
      ),
      inserted_transaction AS (
        INSERT INTO inventory_transactions (
          item_id,
          transaction_type,
          quantity,
          project_id,
          user_id,
          notes,
          recipient_name,
          reference_number,
          created_at
        )
        VALUES ($2, 'stock-out', $1, $3, $4, $5, $6, $7, NOW())
        RETURNING id, transaction_type, quantity, project_id, created_at
      )
      SELECT 
        ui.id as item_id,
        ui.name,
        ui.sku,
        ui.quantity as new_quantity,
        ui.unit,
        ui.reorder_level,
        it.id as transaction_id,
        it.transaction_type,
        it.quantity as transaction_quantity,
        it.project_id,
        it.created_at as transaction_date
      FROM updated_item ui, inserted_transaction it
    `, [quantity, itemId, projectId, user.userId, notes || null, recipientName || null, referenceNumber || null]);
    
    logger.dbQuery('Stock-out transaction', Date.now() - dbStartTime);
    
    if (result.rows.length === 0) {
      return createErrorResponse(
        'Transaction failed - item may have been updated by another user',
        ErrorCodes.CONFLICT,
        409
      );
    }
    
    const transactionData = result.rows[0];
    
    // Check if item is now below reorder level
    const lowStockAlert = transactionData.new_quantity <= transactionData.reorder_level;
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'POST', 
      url: '/api/inventory/stock-out', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    // Log warning if stock is low
    if (lowStockAlert) {
      logger.warn('Low stock alert', {
        itemId: transactionData.item_id,
        itemName: transactionData.name,
        currentQuantity: transactionData.new_quantity,
        reorderLevel: transactionData.reorder_level
      });
    }
    
    return createSuccessResponse({ 
      message: 'Stock-out transaction completed successfully',
      item: {
        id: transactionData.item_id,
        name: transactionData.name,
        sku: transactionData.sku,
        newQuantity: transactionData.new_quantity,
        unit: transactionData.unit,
        reorderLevel: transactionData.reorder_level,
        lowStockAlert
      },
      transaction: {
        id: transactionData.transaction_id,
        type: transactionData.transaction_type,
        quantity: transactionData.transaction_quantity,
        projectId: transactionData.project_id,
        date: transactionData.transaction_date,
        performedBy: user.email
      }
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error processing stock-out transaction', error, { requestId });
    return createErrorResponse(
      error.message || 'Failed to process stock-out transaction',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

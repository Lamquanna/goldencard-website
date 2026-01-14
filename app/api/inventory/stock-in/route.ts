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
 * POST - Stock In (Add inventory quantity)
 * Body: { itemId, quantity, notes, supplierName, referenceNumber }
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
    const { itemId, quantity, notes, supplierName, referenceNumber } = body;
    
    // Validation
    if (!itemId) {
      return createErrorResponse('Item ID is required', ErrorCodes.VALIDATION_ERROR, 400);
    }
    
    if (!quantity || quantity <= 0) {
      return createErrorResponse('Quantity must be greater than 0', ErrorCodes.VALIDATION_ERROR, 400);
    }
    
    logger.info('Processing stock-in transaction', { 
      itemId, 
      quantity, 
      userId: user.userId,
      requestId 
    });
    
    // Use transaction to ensure atomicity
    const dbStartTime = Date.now();
    const result = await sql.query(`
      WITH updated_item AS (
        UPDATE inventory_items 
        SET 
          quantity = quantity + $1,
          last_stock_update = NOW(),
          updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, sku, quantity, unit
      ),
      inserted_transaction AS (
        INSERT INTO inventory_transactions (
          item_id,
          transaction_type,
          quantity,
          user_id,
          notes,
          supplier_name,
          reference_number,
          created_at
        )
        VALUES ($2, 'stock-in', $1, $3, $4, $5, $6, NOW())
        RETURNING id, transaction_type, quantity, created_at
      )
      SELECT 
        ui.id as item_id,
        ui.name,
        ui.sku,
        ui.quantity as new_quantity,
        ui.unit,
        it.id as transaction_id,
        it.transaction_type,
        it.quantity as transaction_quantity,
        it.created_at as transaction_date
      FROM updated_item ui, inserted_transaction it
    `, [quantity, itemId, user.userId, notes || null, supplierName || null, referenceNumber || null]);
    
    logger.dbQuery('Stock-in transaction', Date.now() - dbStartTime);
    
    if (result.rows.length === 0) {
      return createErrorResponse(
        'Item not found or transaction failed',
        ErrorCodes.NOT_FOUND,
        404
      );
    }
    
    const transactionData = result.rows[0];
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'POST', 
      url: '/api/inventory/stock-in', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      message: 'Stock-in transaction completed successfully',
      item: {
        id: transactionData.item_id,
        name: transactionData.name,
        sku: transactionData.sku,
        newQuantity: transactionData.new_quantity,
        unit: transactionData.unit
      },
      transaction: {
        id: transactionData.transaction_id,
        type: transactionData.transaction_type,
        quantity: transactionData.transaction_quantity,
        date: transactionData.transaction_date,
        performedBy: user.email
      }
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error processing stock-in transaction', error, { requestId });
    return createErrorResponse(
      error.message || 'Failed to process stock-in transaction',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

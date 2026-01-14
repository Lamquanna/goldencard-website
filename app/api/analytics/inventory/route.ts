import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/inventory
 * Inventory analytics dashboard data
 * Query params: category, location
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    let categoryFilter = '';
    let locationFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      categoryFilter = `AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (location) {
      locationFilter = `AND location = $${paramIndex}`;
      params.push(location);
      paramIndex++;
    }

    // Overall Inventory Statistics
    const overallStatsQuery = `
      SELECT 
        COUNT(*) as total_items,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_items,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN quantity = 0 THEN 1 END) as out_of_stock_items,
        SUM(quantity) as total_quantity
      FROM inventory_items
      WHERE 1=1 ${categoryFilter} ${locationFilter}
    `;

    const overallStats = await sql.query(overallStatsQuery, params);

    // Items by Category
    const categoryStatsQuery = `
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity
      FROM inventory_items
      WHERE status = 'active' ${locationFilter}
      GROUP BY category
      ORDER BY item_count DESC
    `;

    const categoryStats = await sql.query(
      categoryStatsQuery,
      location ? [location] : []
    );

    // Items by Location
    const locationStatsQuery = `
      SELECT 
        location,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity
      FROM inventory_items
      WHERE status = 'active' ${categoryFilter}
      GROUP BY location
      ORDER BY item_count DESC
    `;

    const locationStats = await sql.query(
      locationStatsQuery,
      category ? [category] : []
    );

    // Low Stock Alerts
    const lowStockQuery = `
      SELECT 
        id,
        name,
        sku,
        category,
        quantity,
        reorder_level,
        unit,
        location
      FROM inventory_items
      WHERE quantity <= reorder_level
      AND status = 'active'
      ${categoryFilter} ${locationFilter}
      ORDER BY (reorder_level - quantity) DESC
      LIMIT 20
    `;

    const lowStock = await sql.query(lowStockQuery, params);

    // Stock Movement Statistics (last 30 days)
    const movementStatsQuery = `
      SELECT 
        it.transaction_type,
        COUNT(*) as transaction_count,
        SUM(it.quantity) as total_quantity
      FROM inventory_transactions it
      WHERE it.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY it.transaction_type
    `;

    let movementStats;
    try {
      movementStats = await sql.query(movementStatsQuery);
    } catch (error) {
      // Table might not exist yet
      movementStats = { rows: [] };
    }

    // Recent Transactions
    const recentTransactionsQuery = `
      SELECT 
        it.id,
        it.item_id,
        i.name as item_name,
        i.sku,
        it.transaction_type,
        it.quantity,
        it.project_id,
        it.user_id,
        it.notes,
        it.created_at
      FROM inventory_transactions it
      JOIN inventory_items i ON it.item_id = i.id
      ORDER BY it.created_at DESC
      LIMIT 15
    `;

    let recentTransactions;
    try {
      recentTransactions = await sql.query(recentTransactionsQuery);
    } catch (error) {
      recentTransactions = { rows: [] };
    }

    // Daily Stock Movement Trends (last 30 days)
    const trendQuery = `
      SELECT 
        it.created_at::date as date,
        COUNT(CASE WHEN it.transaction_type = 'stock-in' THEN 1 END) as stock_in_count,
        COUNT(CASE WHEN it.transaction_type = 'stock-out' THEN 1 END) as stock_out_count,
        SUM(CASE WHEN it.transaction_type = 'stock-in' THEN it.quantity ELSE 0 END) as stock_in_qty,
        SUM(CASE WHEN it.transaction_type = 'stock-out' THEN it.quantity ELSE 0 END) as stock_out_qty
      FROM inventory_transactions it
      WHERE it.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY it.created_at::date
      ORDER BY date ASC
    `;

    let trends;
    try {
      trends = await sql.query(trendQuery);
    } catch (error) {
      trends = { rows: [] };
    }

    // Top Items by Quantity
    const topItemsQuery = `
      SELECT 
        id,
        name,
        sku,
        category,
        quantity,
        unit
      FROM inventory_items
      WHERE status = 'active'
      ${categoryFilter} ${locationFilter}
      ORDER BY quantity DESC
      LIMIT 10
    `;

    const topItems = await sql.query(topItemsQuery, params);

    // Stock Value (if cost information available in metadata)
    const valueQuery = `
      SELECT 
        category,
        COUNT(*) as items,
        SUM(quantity) as total_quantity
      FROM inventory_items
      WHERE status = 'active'
      GROUP BY category
      ORDER BY total_quantity DESC
    `;

    const valueStats = await sql.query(valueQuery);

    return createSuccessResponse({
      summary: {
        totalItems: parseInt(overallStats.rows[0]?.total_items || '0'),
        activeItems: parseInt(overallStats.rows[0]?.active_items || '0'),
        lowStockItems: parseInt(overallStats.rows[0]?.low_stock_items || '0'),
        outOfStockItems: parseInt(overallStats.rows[0]?.out_of_stock_items || '0'),
        totalQuantity: parseInt(overallStats.rows[0]?.total_quantity || '0')
      },
      movements: {
        stockIn: parseInt(movementStats.rows.find((r: any) => r.transaction_type === 'stock-in')?.transaction_count || '0'),
        stockOut: parseInt(movementStats.rows.find((r: any) => r.transaction_type === 'stock-out')?.transaction_count || '0'),
        stockInQty: parseInt(movementStats.rows.find((r: any) => r.transaction_type === 'stock-in')?.total_quantity || '0'),
        stockOutQty: parseInt(movementStats.rows.find((r: any) => r.transaction_type === 'stock-out')?.total_quantity || '0')
      },
      byCategory: categoryStats.rows.map((row: any) => ({
        category: row.category,
        itemCount: parseInt(row.item_count),
        totalQuantity: parseInt(row.total_quantity)
      })),
      byLocation: locationStats.rows.map((row: any) => ({
        location: row.location,
        itemCount: parseInt(row.item_count),
        totalQuantity: parseInt(row.total_quantity)
      })),
      lowStockAlerts: lowStock.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        quantity: parseInt(row.quantity),
        reorderLevel: parseInt(row.reorder_level),
        deficit: parseInt(row.reorder_level) - parseInt(row.quantity),
        unit: row.unit,
        location: row.location
      })),
      topItems: topItems.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        category: row.category,
        quantity: parseInt(row.quantity),
        unit: row.unit
      })),
      stockTrends: trends.rows.map((row: any) => ({
        date: row.date,
        stockInCount: parseInt(row.stock_in_count || '0'),
        stockOutCount: parseInt(row.stock_out_count || '0'),
        stockInQty: parseInt(row.stock_in_qty || '0'),
        stockOutQty: parseInt(row.stock_out_qty || '0')
      })),
      recentTransactions: recentTransactions.rows.map((row: any) => ({
        id: row.id,
        itemId: row.item_id,
        itemName: row.item_name,
        sku: row.sku,
        type: row.transaction_type,
        quantity: parseInt(row.quantity),
        projectId: row.project_id,
        userId: row.user_id,
        notes: row.notes,
        createdAt: row.created_at
      })),
      valueDistribution: valueStats.rows.map((row: any) => ({
        category: row.category,
        items: parseInt(row.items),
        totalQuantity: parseInt(row.total_quantity)
      })),
      generatedAt: new Date().toISOString()
    }, requestId);

  } catch (error: any) {
    logger.error('Error fetching inventory analytics', error, { requestId });
    return createErrorResponse(
      'Failed to fetch inventory analytics',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

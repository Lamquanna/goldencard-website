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
 * GET /api/analytics/finance
 * Financial analytics dashboard data
 * Query params: period (today|week|month|quarter|year), startDate, endDate
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = `WHERE transaction_date BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    } else {
      // Default date ranges based on period
      switch (period) {
        case 'today':
          dateFilter = `WHERE transaction_date = CURRENT_DATE`;
          break;
        case 'week':
          dateFilter = `WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateFilter = `WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
        case 'quarter':
          dateFilter = `WHERE transaction_date >= CURRENT_DATE - INTERVAL '90 days'`;
          break;
        case 'year':
          dateFilter = `WHERE transaction_date >= CURRENT_DATE - INTERVAL '365 days'`;
          break;
      }
    }

    // Total Revenue and Expenses
    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM finance_transactions
      ${dateFilter}
      AND status = 'completed'
    `;

    const summary = await sql.query(summaryQuery, params);
    const summaryData = summary.rows[0];

    // Revenue by Category
    const categoryQuery = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM finance_transactions
      ${dateFilter}
      AND type = 'income'
      AND status = 'completed'
      GROUP BY category
      ORDER BY total DESC
      LIMIT 10
    `;

    const categoryResult = await sql.query(categoryQuery, params);

    // Expenses by Category
    const expenseQuery = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM finance_transactions
      ${dateFilter}
      AND type = 'expense'
      AND status = 'completed'
      GROUP BY category
      ORDER BY total DESC
      LIMIT 10
    `;

    const expenseResult = await sql.query(expenseQuery, params);

    // Daily Trends (last 30 days)
    const trendsQuery = `
      SELECT 
        transaction_date::date as date,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as revenue,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM finance_transactions
      WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
      AND status = 'completed'
      GROUP BY transaction_date::date
      ORDER BY date ASC
    `;

    const trends = await sql.query(trendsQuery);

    // Invoice Statistics
    const invoiceStatsQuery = `
      SELECT 
        COUNT(*) as total_invoices,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
        COUNT(CASE WHEN status = 'pending' OR status = 'draft' THEN 1 END) as unpaid_invoices,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'paid' THEN 1 END) as overdue_invoices,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END) as outstanding_amount
      FROM erp_invoices
      ${dateFilter.replace('transaction_date', 'issue_date')}
    `;

    const invoiceStats = await sql.query(
      invoiceStatsQuery,
      dateFilter.includes('BETWEEN') ? params : []
    );

    // Recent Transactions
    const recentQuery = `
      SELECT 
        id,
        type,
        category,
        amount,
        transaction_date,
        description,
        reference_number
      FROM finance_transactions
      WHERE status = 'completed'
      ORDER BY transaction_date DESC, created_at DESC
      LIMIT 10
    `;

    const recent = await sql.query(recentQuery);

    const profit = parseFloat(summaryData.total_revenue || '0') - parseFloat(summaryData.total_expenses || '0');
    const profitMargin = summaryData.total_revenue > 0 
      ? ((profit / parseFloat(summaryData.total_revenue)) * 100).toFixed(2)
      : '0';

    return createSuccessResponse({
      summary: {
        totalRevenue: parseFloat(summaryData.total_revenue || '0'),
        totalExpenses: parseFloat(summaryData.total_expenses || '0'),
        profit,
        profitMargin: parseFloat(profitMargin),
        incomeTransactions: parseInt(summaryData.income_count || '0'),
        expenseTransactions: parseInt(summaryData.expense_count || '0')
      },
      invoices: {
        total: parseInt(invoiceStats.rows[0]?.total_invoices || '0'),
        paid: parseInt(invoiceStats.rows[0]?.paid_invoices || '0'),
        unpaid: parseInt(invoiceStats.rows[0]?.unpaid_invoices || '0'),
        overdue: parseInt(invoiceStats.rows[0]?.overdue_invoices || '0'),
        totalAmount: parseFloat(invoiceStats.rows[0]?.total_amount || '0'),
        paidAmount: parseFloat(invoiceStats.rows[0]?.paid_amount || '0'),
        outstandingAmount: parseFloat(invoiceStats.rows[0]?.outstanding_amount || '0')
      },
      revenueByCategory: categoryResult.rows.map((row: any) => ({
        category: row.category,
        total: parseFloat(row.total),
        count: parseInt(row.count)
      })),
      expensesByCategory: expenseResult.rows.map((row: any) => ({
        category: row.category,
        total: parseFloat(row.total),
        count: parseInt(row.count)
      })),
      dailyTrends: trends.rows.map((row: any) => ({
        date: row.date,
        revenue: parseFloat(row.revenue || '0'),
        expenses: parseFloat(row.expenses || '0'),
        profit: parseFloat(row.revenue || '0') - parseFloat(row.expenses || '0')
      })),
      recentTransactions: recent.rows.map((row: any) => ({
        id: row.id,
        type: row.type,
        category: row.category,
        amount: parseFloat(row.amount),
        date: row.transaction_date,
        description: row.description,
        referenceNumber: row.reference_number
      })),
      period,
      generatedAt: new Date().toISOString()
    }, requestId);

  } catch (error: any) {
    logger.error('Error fetching finance analytics', error, { requestId });
    return createErrorResponse(
      'Failed to fetch finance analytics',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

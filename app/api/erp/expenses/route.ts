import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { logger } from '@/lib/logger'
import { createSuccessResponse, createErrorResponse, generateRequestId, ErrorCodes } from '@/lib/api/error-handler'

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Ensure table exists
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS erp_expenses (
        id SERIAL PRIMARY KEY,
        expense_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        expense_date DATE,
        description TEXT,
        attachments JSONB,
        submitted_by INTEGER,
        approved_by INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (e: any) {
    logger.debug('Table check/create:', { error: e });
  }
}

// GET /api/erp/expenses - Get all expenses
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    await ensureTableExists();
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let result;
    
    // Simplified query handling with tagged template
    if (search) {
      const searchPattern = `%${search}%`;
      result = await sql`
        SELECT * FROM erp_expenses 
        WHERE title ILIKE ${searchPattern} OR expense_number ILIKE ${searchPattern}
        ORDER BY expense_date DESC, created_at DESC
      `;
    } else if (status && category) {
      result = await sql`
        SELECT * FROM erp_expenses 
        WHERE status = ${status} AND category = ${category}
        ORDER BY expense_date DESC, created_at DESC
      `;
    } else if (status) {
      result = await sql`
        SELECT * FROM erp_expenses 
        WHERE status = ${status}
        ORDER BY expense_date DESC, created_at DESC
      `;
    } else if (category) {
      result = await sql`
        SELECT * FROM erp_expenses 
        WHERE category = ${category}
        ORDER BY expense_date DESC, created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM erp_expenses 
        ORDER BY expense_date DESC, created_at DESC
      `;
    }
    
    // Transform snake_case to camelCase
    const expenses = result.map((row: any) => ({
      id: row.id,
      expenseNumber: row.expense_number,
      title: row.title,
      amount: parseFloat(row.amount),
      category: row.category,
      status: row.status,
      expenseDate: row.expense_date,
      description: row.description,
      attachments: row.attachments,
      submittedBy: row.submitted_by,
      approvedBy: row.approved_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: '/api/erp/expenses',
      statusCode: 200,
      duration,
      requestId,
      userId: undefined,
    });

    return createSuccessResponse(expenses);
  } catch (error: any) {
    logger.error('Error fetching expenses:', error);
    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: '/api/erp/expenses',
      statusCode: 500,
      duration,
      requestId,
      userId: undefined,
      error: error instanceof Error ? error : undefined,
    });

    return createErrorResponse(
      'Failed to fetch expenses',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

// POST /api/erp/expenses - Create new expense
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    await ensureTableExists();
    
    const body = await request.json()
    const { title, amount, category, expenseDate, description } = body

    if (!title || !amount || !category || !expenseDate) {
      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'POST',
        url: '/api/erp/expenses',
        statusCode: 400,
        duration,
        requestId,
        userId: undefined,
      });

      return createErrorResponse(
        'Missing required fields',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    // Generate expense number
    const expenseNumber = `EXP-${Date.now()}`
    const parsedAmount = parseFloat(amount);

    const result = await sql`
      INSERT INTO erp_expenses (
        expense_number, title, amount, category, status, 
        expense_date, description, submitted_by
      )
      VALUES (
        ${expenseNumber},
        ${title},
        ${parsedAmount},
        ${category},
        ${'draft'},
        ${expenseDate},
        ${description || null},
        ${1}
      )
      RETURNING *
    `;

    const expense = result[0]

    const responseData = {
      id: expense.id,
      expenseNumber: expense.expense_number,
      title: expense.title,
      amount: parseFloat(expense.amount),
      category: expense.category,
      status: expense.status,
      expenseDate: expense.expense_date,
      description: expense.description,
      submittedBy: expense.submitted_by,
      createdAt: expense.created_at,
    };

    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'POST',
      url: '/api/erp/expenses',
      statusCode: 201,
      duration,
      requestId,
      userId: undefined,
    });

    return createSuccessResponse(responseData, requestId);
  } catch (error: any) {
    logger.error('Error creating expense:', error);
    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'POST',
      url: '/api/erp/expenses',
      statusCode: 500,
      duration,
      requestId,
      userId: undefined,
      error: error instanceof Error ? error : undefined,
    });

    return createErrorResponse(
      'Failed to create expense',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

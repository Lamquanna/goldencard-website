import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/expenses - Get all expenses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM erp_expenses WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status) {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    if (category) {
      query += ` AND category = $${paramIndex++}`
      params.push(category)
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex++} OR expense_number ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY expense_date DESC, created_at DESC'

    const result = await sql(query, params)
    
    // Transform snake_case to camelCase
    const expenses = result.rows.map(row => ({
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

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// POST /api/erp/expenses - Create new expense
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, amount, category, expenseDate, description } = body

    if (!title || !amount || !category || !expenseDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate expense number
    const expenseNumber = `EXP-${Date.now()}`

    const query = `
      INSERT INTO erp_expenses (
        expense_number, title, amount, category, status, 
        expense_date, description, submitted_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await sql(query, [
      expenseNumber,
      title,
      parseFloat(amount),
      category,
      'draft', // Default status
      expenseDate,
      description || null,
      1, // TODO: Get from session
    ])

    const expense = result.rows[0]

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { rows } = await sql`
      SELECT * FROM erp_expenses
      WHERE id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, amount, category, expenseDate, description } = body

    // Validate required fields
    if (!title || !amount || !category || !expenseDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { rows } = await sql`
      UPDATE erp_expenses
      SET 
        title = ${title},
        amount = ${amount},
        category = ${category},
        expense_date = ${expenseDate},
        description = ${description || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { rows } = await sql`
      DELETE FROM erp_expenses
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM erp_payments WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    if (search) {
      query += ` AND (invoice_number ILIKE $${paramIndex++} OR customer ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY payment_date DESC, created_at DESC'

    const result = await sql(query, params)
    
    const payments = result.rows.map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customer: row.customer,
      amount: parseFloat(row.amount),
      status: row.status,
      paymentDate: row.payment_date,
      dueDate: row.due_date,
      method: row.method,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/erp/payments - Create new payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoiceNumber, customer, amount, paymentDate, dueDate, method } = body

    if (!invoiceNumber || !customer || !amount) {
      return NextResponse.json(
        { error: 'Invoice number, customer, and amount are required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO erp_payments (
        invoice_number, customer, amount, status,
        payment_date, due_date, method
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await sql(query, [
      invoiceNumber,
      customer,
      parseFloat(amount),
      'pending',
      paymentDate || new Date().toISOString().split('T')[0],
      dueDate || null,
      method || 'bank_transfer',
    ])

    const payment = result.rows[0]

    return NextResponse.json(
      {
        id: payment.id,
        invoiceNumber: payment.invoice_number,
        customer: payment.customer,
        amount: parseFloat(payment.amount),
        status: payment.status,
        paymentDate: payment.payment_date,
        dueDate: payment.due_date,
        method: payment.method,
        createdAt: payment.created_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

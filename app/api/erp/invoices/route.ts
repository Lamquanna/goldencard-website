import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/invoices - Get all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM erp_invoices WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    if (search) {
      query += ` AND (invoice_number ILIKE $${paramIndex++} OR customer_name ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY issue_date DESC, created_at DESC'

    const result = await sql(query, params)
    
    const invoices = result.rows.map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      customerName: row.customer_name,
      amount: parseFloat(row.amount),
      status: row.status,
      issueDate: row.issue_date,
      dueDate: row.due_date,
      items: row.items,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

// POST /api/erp/invoices - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, amount, issueDate, dueDate, items } = body

    if (!customerName || !amount) {
      return NextResponse.json(
        { error: 'Customer name and amount are required' },
        { status: 400 }
      )
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`

    const query = `
      INSERT INTO erp_invoices (
        invoice_number, customer_name, amount, status,
        issue_date, due_date, items
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `

    const result = await sql(query, [
      invoiceNumber,
      customerName,
      parseFloat(amount),
      'draft',
      issueDate || new Date().toISOString().split('T')[0],
      dueDate || null,
      items || [],
    ])

    const invoice = result.rows[0]

    return NextResponse.json(
      {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        amount: parseFloat(invoice.amount),
        status: invoice.status,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        items: invoice.items,
        createdAt: invoice.created_at,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

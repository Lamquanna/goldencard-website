import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { rows } = await sql`
      SELECT * FROM erp_payments
      WHERE id = ${id}
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { invoiceNumber, customer, company, amount, dueDate, paidDate, status, method } = body

    // Validate required fields
    if (!invoiceNumber || !customer || !amount || !dueDate || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { rows } = await sql`
      UPDATE erp_payments
      SET 
        invoice_number = ${invoiceNumber},
        customer = ${customer},
        company = ${company || null},
        amount = ${amount},
        due_date = ${dueDate},
        paid_date = ${paidDate || null},
        status = ${status},
        method = ${method || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { rows } = await sql`
      DELETE FROM erp_payments
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting payment:', error)
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 })
  }
}

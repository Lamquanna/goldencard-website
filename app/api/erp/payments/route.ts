import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Ensure table exists
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS erp_payments (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_date DATE,
        due_date DATE,
        method VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.log('Table check/create:', e);
  }
}

// GET /api/erp/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    await ensureTableExists();
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let result;
    
    if (status && status !== 'all' && search) {
      const searchPattern = `%${search}%`;
      result = await sql`
        SELECT * FROM erp_payments 
        WHERE status = ${status} 
          AND (invoice_number ILIKE ${searchPattern} OR customer ILIKE ${searchPattern})
        ORDER BY payment_date DESC, created_at DESC
      `;
    } else if (status && status !== 'all') {
      result = await sql`
        SELECT * FROM erp_payments 
        WHERE status = ${status}
        ORDER BY payment_date DESC, created_at DESC
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      result = await sql`
        SELECT * FROM erp_payments 
        WHERE invoice_number ILIKE ${searchPattern} OR customer ILIKE ${searchPattern}
        ORDER BY payment_date DESC, created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM erp_payments 
        ORDER BY payment_date DESC, created_at DESC
      `;
    }
    
    const payments = result.map((row: any) => ({
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
    await ensureTableExists();
    
    const body = await request.json()
    const { invoiceNumber, customer, amount, paymentDate, dueDate, method } = body

    if (!invoiceNumber || !customer || !amount) {
      return NextResponse.json(
        { error: 'Invoice number, customer, and amount are required' },
        { status: 400 }
      )
    }

    const parsedAmount = parseFloat(amount);

    const result = await sql`
      INSERT INTO erp_payments (
        invoice_number, customer, amount, status,
        payment_date, due_date, method
      )
      VALUES (
        ${invoiceNumber},
        ${customer},
        ${parsedAmount},
        ${'pending'},
        ${paymentDate || new Date().toISOString().split('T')[0]},
        ${dueDate || null},
        ${method || 'bank_transfer'}
      )
      RETURNING *
    `;

    const payment = result[0]

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

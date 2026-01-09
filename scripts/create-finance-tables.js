const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createFinanceTables() {
  try {
    // Create invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS erp_invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        issue_date DATE NOT NULL,
        due_date DATE,
        items JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Table erp_invoices created/verified')

    // Create payments table
    await sql`
      CREATE TABLE IF NOT EXISTS erp_payments (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL,
        customer VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        payment_date DATE NOT NULL,
        due_date DATE,
        method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Table erp_payments created/verified')

    // Insert sample invoices
    const sampleInvoices = [
      {
        invoice_number: 'INV-2024-001',
        customer_name: 'Công ty TNHH ABC Solar',
        amount: 181500000,
        status: 'paid',
        issue_date: '2024-01-15',
        due_date: '2024-02-15',
      },
      {
        invoice_number: 'INV-2024-002',
        customer_name: 'Công ty Cổ phần XYZ Energy',
        amount: 187500000,
        status: 'overdue',
        issue_date: '2024-01-10',
        due_date: '2024-01-25',
      },
    ]

    for (const invoice of sampleInvoices) {
      await sql`
        INSERT INTO erp_invoices (
          invoice_number, customer_name, amount, status,
          issue_date, due_date
        )
        VALUES (
          ${invoice.invoice_number}, ${invoice.customer_name}, ${invoice.amount},
          ${invoice.status}, ${invoice.issue_date}, ${invoice.due_date}
        )
        ON CONFLICT (invoice_number) DO NOTHING
      `
    }
    console.log('✅ Sample invoices inserted')

    // Insert sample payments
    const samplePayments = [
      {
        invoice_number: 'INV-2024-001',
        customer: 'Công ty TNHH ABC Solar',
        amount: 181500000,
        status: 'paid',
        payment_date: '2024-02-10',
        due_date: '2024-02-15',
        method: 'bank_transfer',
      },
      {
        invoice_number: 'INV-2024-002',
        customer: 'Công ty Cổ phần XYZ Energy',
        amount: 187500000,
        status: 'overdue',
        payment_date: '2024-01-20',
        due_date: '2024-01-25',
        method: 'bank_transfer',
      },
    ]

    for (const payment of samplePayments) {
      await sql`
        INSERT INTO erp_payments (
          invoice_number, customer, amount, status,
          payment_date, due_date, method
        )
        VALUES (
          ${payment.invoice_number}, ${payment.customer}, ${payment.amount},
          ${payment.status}, ${payment.payment_date}, ${payment.due_date}, ${payment.method}
        )
      `
    }
    console.log('✅ Sample payments inserted')

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createFinanceTables()

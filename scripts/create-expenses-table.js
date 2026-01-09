const { neon } = require('@neondatabase/serverless')
require('dotenv').config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

async function createExpensesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS erp_expenses (
        id SERIAL PRIMARY KEY,
        expense_number VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'draft',
        expense_date DATE NOT NULL,
        description TEXT,
        attachments JSONB,
        submitted_by INTEGER,
        approved_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    console.log('✅ Table erp_expenses created/verified')
    
    // Insert sample data
    const sampleExpenses = [
      {
        expense_number: 'EXP-2024-001',
        title: 'Văn phòng phẩm tháng 1',
        amount: 2500000,
        category: 'office',
        status: 'approved',
        expense_date: '2024-01-15',
        description: 'Mua bút, giấy, mực in cho văn phòng',
        submitted_by: 2
      },
      {
        expense_number: 'EXP-2024-002',
        title: 'Chi phí đi lại công tác Hà Nội',
        amount: 8500000,
        category: 'travel',
        status: 'pending_approval',
        expense_date: '2024-01-20',
        description: 'Vé máy bay, khách sạn 3 ngày tại Hà Nội',
        submitted_by: 3
      }
    ]

    for (const expense of sampleExpenses) {
      await sql`
        INSERT INTO erp_expenses (
          expense_number, title, amount, category, status, 
          expense_date, description, submitted_by
        )
        VALUES (
          ${expense.expense_number}, ${expense.title}, ${expense.amount},
          ${expense.category}, ${expense.status}, ${expense.expense_date},
          ${expense.description}, ${expense.submitted_by}
        )
        ON CONFLICT (expense_number) DO NOTHING
      `
    }
    
    console.log('✅ Sample expenses inserted')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

createExpensesTable()

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAuth } from '@/lib/auth/middleware'
import { logger } from '@/lib/logger'
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler'

// Ensure table exists
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS erp_invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        issue_date DATE,
        due_date DATE,
        items JSONB,
        project_id INTEGER,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.log('Table check/create:', e);
  }
}

// GET /api/erp/invoices - Get all invoices
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    await ensureTableExists();
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let result;
    
    if (status && status !== 'all' && search) {
      const searchPattern = `%${search}%`;
      result = await sql`
        SELECT * FROM erp_invoices 
        WHERE status = ${status} 
          AND (invoice_number ILIKE ${searchPattern} OR customer_name ILIKE ${searchPattern})
        ORDER BY issue_date DESC, created_at DESC
      `;
    } else if (status && status !== 'all') {
      result = await sql`
        SELECT * FROM erp_invoices 
        WHERE status = ${status}
        ORDER BY issue_date DESC, created_at DESC
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      result = await sql`
        SELECT * FROM erp_invoices 
        WHERE invoice_number ILIKE ${searchPattern} OR customer_name ILIKE ${searchPattern}
        ORDER BY issue_date DESC, created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM erp_invoices 
        ORDER BY issue_date DESC, created_at DESC
      `;
    }
    
    const invoices = result.map((row: any) => ({
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
  const requestId = generateRequestId();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    await ensureTableExists();
    
    const body = await request.json()
    const { customerName, amount, issueDate, dueDate, items, projectId } = body

    if (!customerName || !amount) {
      return createErrorResponse(
        'Customer name and amount are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        requestId
      );
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}`
    const parsedAmount = parseFloat(amount);
    const itemsJson = JSON.stringify(items || []);

    logger.info('Creating invoice', { 
      invoiceNumber, 
      customerName, 
      amount: parsedAmount, 
      userId: user.userId,
      requestId 
    });

    const result = await sql`
      INSERT INTO erp_invoices (
        invoice_number, customer_name, amount, status,
        issue_date, due_date, items, project_id, created_by
      )
      VALUES (
        ${invoiceNumber},
        ${customerName},
        ${parsedAmount},
        ${'draft'},
        ${issueDate || new Date().toISOString().split('T')[0]},
        ${dueDate || null},
        ${itemsJson},
        ${projectId || null},
        ${user.userId}
      )
      RETURNING *
    `;

    const invoice = result[0]

    return createSuccessResponse(
      {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        amount: parseFloat(invoice.amount),
        status: invoice.status,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        items: invoice.items,
        projectId: invoice.project_id,
        createdBy: invoice.created_by,
        createdAt: invoice.created_at,
      },
      requestId
    );
  } catch (error: any) {
    logger.error('Error creating invoice', error, { requestId });
    return createErrorResponse(
      'Failed to create invoice',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

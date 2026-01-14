import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler';

/**
 * POST - Record invoice payment
 * Body: { paymentDate, paymentMethod, paymentAmount, notes }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentDate, paymentMethod, paymentAmount, notes } = body;

    if (!paymentDate) {
      return createErrorResponse(
        'Payment date is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        requestId
      );
    }

    logger.info('Recording invoice payment', { 
      invoiceId: id, 
      paymentMethod, 
      userId: user.userId,
      requestId 
    });

    // Ensure invoice_payments table exists
    await sql`
      CREATE TABLE IF NOT EXISTS invoice_payments (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER REFERENCES erp_invoices(id) ON DELETE CASCADE,
        payment_amount DECIMAL(15, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(100),
        recorded_by VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Get invoice details
    const invoiceResult = await sql`
      SELECT id, invoice_number, amount, status 
      FROM erp_invoices 
      WHERE id = ${id}
    `;

    if (invoiceResult.rows.length === 0) {
      return createErrorResponse('Invoice not found', ErrorCodes.NOT_FOUND, 404, requestId);
    }

    const invoice = invoiceResult.rows[0];
    const amountToPay = paymentAmount !== undefined ? parseFloat(paymentAmount) : parseFloat(invoice.amount);

    // Use transaction to ensure atomicity
    const result = await sql.query(`
      WITH updated_invoice AS (
        UPDATE erp_invoices 
        SET 
          status = 'paid',
          updated_at = NOW()
        WHERE id = $1
        RETURNING id, invoice_number, amount, status, updated_at
      ),
      inserted_payment AS (
        INSERT INTO invoice_payments (
          invoice_id,
          payment_amount,
          payment_date,
          payment_method,
          recorded_by,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, payment_amount, payment_date, payment_method, created_at
      )
      SELECT 
        ui.id as invoice_id,
        ui.invoice_number,
        ui.amount as invoice_amount,
        ui.status as invoice_status,
        ui.updated_at as invoice_updated_at,
        ip.id as payment_id,
        ip.payment_amount,
        ip.payment_date,
        ip.payment_method,
        ip.created_at as payment_created_at
      FROM updated_invoice ui, inserted_payment ip
    `, [id, amountToPay, paymentDate, paymentMethod || 'unspecified', user.userId, notes || null]);

    if (result.rows.length === 0) {
      return createErrorResponse(
        'Payment recording failed',
        ErrorCodes.DATABASE_ERROR,
        500,
        requestId
      );
    }

    const paymentData = result.rows[0];

    logger.info('Invoice payment recorded successfully', {
      invoiceId: id,
      paymentId: paymentData.payment_id,
      amount: paymentData.payment_amount,
      requestId
    });

    return createSuccessResponse({
      message: 'Payment recorded successfully',
      invoice: {
        id: paymentData.invoice_id,
        invoiceNumber: paymentData.invoice_number,
        totalAmount: parseFloat(paymentData.invoice_amount),
        status: paymentData.invoice_status,
        updatedAt: paymentData.invoice_updated_at
      },
      payment: {
        id: paymentData.payment_id,
        amount: parseFloat(paymentData.payment_amount),
        date: paymentData.payment_date,
        method: paymentData.payment_method,
        recordedBy: user.email,
        recordedAt: paymentData.payment_created_at
      }
    }, requestId);

  } catch (error: any) {
    logger.error('Error recording invoice payment', error, { requestId });
    return createErrorResponse(
      error.message || 'Failed to record payment',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

/**
 * GET - Get payment history for an invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  
  // Authenticate user
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const { id } = await params;

    const result = await sql`
      SELECT 
        ip.id,
        ip.payment_amount,
        ip.payment_date,
        ip.payment_method,
        ip.recorded_by,
        ip.notes,
        ip.created_at,
        u.email as recorded_by_email
      FROM invoice_payments ip
      LEFT JOIN users u ON ip.recorded_by = u.id::text
      WHERE ip.invoice_id = ${id}
      ORDER BY ip.payment_date DESC, ip.created_at DESC
    `;

    const payments = result.rows.map((row: any) => ({
      id: row.id,
      amount: parseFloat(row.payment_amount),
      date: row.payment_date,
      method: row.payment_method,
      recordedBy: row.recorded_by_email || row.recorded_by,
      notes: row.notes,
      createdAt: row.created_at
    }));

    return createSuccessResponse({ payments }, requestId);

  } catch (error: any) {
    logger.error('Error fetching payment history', error, { requestId });
    return createErrorResponse(
      'Failed to fetch payment history',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

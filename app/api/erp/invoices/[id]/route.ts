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

/**
 * PUT - Update invoice
 */
export async function PUT(
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
    const { customerName, amount, status, issueDate, dueDate, items, projectId } = body;

    if (!customerName && !amount && !status && !issueDate && !dueDate && !items && !projectId) {
      return createErrorResponse(
        'At least one field is required for update',
        ErrorCodes.VALIDATION_ERROR,
        400,
        requestId
      );
    }

    logger.info('Updating invoice', { invoiceId: id, userId: user.userId, requestId });

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (customerName !== undefined) {
      updates.push(`customer_name = $${paramIndex}`);
      values.push(customerName);
      paramIndex++;
    }
    
    if (amount !== undefined) {
      updates.push(`amount = $${paramIndex}`);
      values.push(parseFloat(amount));
      paramIndex++;
    }
    
    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    
    if (issueDate !== undefined) {
      updates.push(`issue_date = $${paramIndex}`);
      values.push(issueDate);
      paramIndex++;
    }
    
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex}`);
      values.push(dueDate);
      paramIndex++;
    }
    
    if (items !== undefined) {
      updates.push(`items = $${paramIndex}`);
      values.push(JSON.stringify(items));
      paramIndex++;
    }
    
    if (projectId !== undefined) {
      updates.push(`project_id = $${paramIndex}`);
      values.push(projectId);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE erp_invoices 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(query, values);

    if (result.rows.length === 0) {
      return createErrorResponse('Invoice not found', ErrorCodes.NOT_FOUND, 404, requestId);
    }

    const invoice = result.rows[0];

    return createSuccessResponse({
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
      updatedAt: invoice.updated_at,
    }, requestId);

  } catch (error: any) {
    logger.error('Error updating invoice', error, { requestId });
    return createErrorResponse(
      'Failed to update invoice',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

/**
 * DELETE - Delete invoice (role-based: accountant, manager, admin only)
 */
export async function DELETE(
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
  
  // Role-based access control
  const allowedRoles = ['accountant', 'manager', 'admin'];
  if (!user.role || !allowedRoles.includes(user.role.toLowerCase())) {
    logger.warn('Unauthorized invoice deletion attempt', { 
      userId: user.userId, 
      role: user.role || 'undefined', 
      requestId 
    });
    return createErrorResponse(
      'Only accountants, managers, or admins can delete invoices',
      ErrorCodes.FORBIDDEN,
      403,
      requestId
    );
  }
  
  try {
    const { id } = await params;

    logger.info('Deleting invoice', { invoiceId: id, userId: user.userId, requestId });

    const { rows } = await sql`
      DELETE FROM erp_invoices
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return createErrorResponse('Invoice not found', ErrorCodes.NOT_FOUND, 404, requestId);
    }

    return createSuccessResponse({ 
      message: 'Invoice deleted successfully',
      deletedBy: user.email 
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error deleting invoice', error, { requestId });
    return createErrorResponse(
      'Failed to delete invoice',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

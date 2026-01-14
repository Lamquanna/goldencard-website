import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';
import { createErrorResponse, createSuccessResponse, generateRequestId, ErrorCodes } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

// PUT - Update leave request (approve, reject, cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = generateRequestId();
  
  // Verify authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;
  
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, rejectReason } = body;

    if (!action || !['approve', 'reject', 'cancel'].includes(action)) {
      return createErrorResponse(
        'Invalid action',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { validActions: ['approve', 'reject', 'cancel'] },
        requestId
      );
    }

    // Get leave request details
    const leaveRequest = await sql`
      SELECT lr.*, e.full_name, e.employee_code
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      WHERE lr.id = ${id}
    `;

    if (leaveRequest.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }

    const request_data = leaveRequest[0];

    if (action === 'cancel') {
      // Only allow canceling pending requests
      if (request_data.status !== 'pending') {
        return NextResponse.json(
          { success: false, error: 'Can only cancel pending requests' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE leave_requests
        SET status = 'cancelled', updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Leave request cancelled'
      });
    }

    if (action === 'approve') {
      // ✅ Verify user has manager or director role
      if (!user.role || !['manager', 'director', 'admin'].includes(user.role.toLowerCase())) {
        return createErrorResponse(
          'Only managers, directors, or admins can approve leave requests',
          ErrorCodes.FORBIDDEN,
          403,
          { userRole: user.role },
          requestId
        );
      }

      // Check project conflicts for approval
      const projectConflicts = await sql`
        SELECT 
          p.project_name,
          p.start_date,
          p.end_date
        FROM projects p
        JOIN project_members pm ON pm.project_id = p.id
        WHERE pm.employee_id = ${request_data.employee_id}
          AND p.status = 'active'
          AND (
            (${request_data.start_date}::date BETWEEN p.start_date AND p.end_date)
            OR (${request_data.end_date}::date BETWEEN p.start_date AND p.end_date)
            OR (p.start_date BETWEEN ${request_data.start_date}::date AND ${request_data.end_date}::date)
          )
      `;

      // ✅ Use transaction to ensure atomic update of request + balance
      await sql.begin(async (transaction: any) => {
        // Update leave request
        await transaction`
          UPDATE leave_requests
          SET 
            status = 'approved',
            approved_by = ${user.userId},
            approved_at = NOW(),
            updated_at = NOW()
          WHERE id = ${id}
        `;

        // ✅ Deduct leave balance if annual or sick leave
        if (request_data.leave_type === 'annual') {
          const balanceResult = await transaction`
            UPDATE leave_balances
            SET 
              annual_used = annual_used + ${request_data.total_days},
              annual_remaining = annual_remaining - ${request_data.total_days},
              updated_at = NOW()
            WHERE employee_id = ${request_data.employee_id}
              AND year = EXTRACT(YEAR FROM ${request_data.start_date}::date)
              AND annual_remaining >= ${request_data.total_days}
            RETURNING *
          `;
          
          if (balanceResult.length === 0) {
            throw new Error('Insufficient annual leave balance');
          }
        } else if (request_data.leave_type === 'sick') {
          const balanceResult = await transaction`
            UPDATE leave_balances
            SET 
              sick_used = sick_used + ${request_data.total_days},
              sick_remaining = sick_remaining - ${request_data.total_days},
              updated_at = NOW()
            WHERE employee_id = ${request_data.employee_id}
              AND year = EXTRACT(YEAR FROM ${request_data.start_date}::date)
              AND sick_remaining >= ${request_data.total_days}
            RETURNING *
          `;
          
          if (balanceResult.length === 0) {
            throw new Error('Insufficient sick leave balance');
          }
        }
      });

      return createSuccessResponse(
        {
          message: 'Leave request approved successfully',
          leaveId: id,
          approvedBy: user.email,
          warnings: projectConflicts.length > 0 ? {
            hasProjectConflict: true,
            projects: projectConflicts
          } : null
        },
        requestId
      );
    }

    if (action === 'reject') {
      // ✅ Verify user has manager or director role
      if (!user.role || !['manager', 'director', 'admin'].includes(user.role.toLowerCase())) {
        return createErrorResponse(
          'Only managers, directors, or admins can reject leave requests',
          ErrorCodes.FORBIDDEN,
          403,
          { userRole: user.role },
          requestId
        );
      }

      // ✅ Just update status - no balance deduction for rejected requests
      await sql`
        UPDATE leave_requests
        SET 
          status = 'rejected',
          approved_by = ${user.userId},
          approved_at = NOW(),
          reject_reason = ${rejectReason || 'No reason provided'},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      return createSuccessResponse(
        {
          message: 'Leave request rejected successfully',
          leaveId: id,
          rejectedBy: user.email,
          reason: rejectReason || 'No reason provided'
        },
        requestId
      );
    }

  } catch (error: any) {
    console.error('Error updating leave request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete leave request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if request exists and is pending
    const leaveRequest = await sql`
      SELECT * FROM leave_requests WHERE id = ${id}
    `;

    if (leaveRequest.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }

    if (leaveRequest[0].status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Can only delete pending requests' },
        { status: 400 }
      );
    }

    await sql`DELETE FROM leave_requests WHERE id = ${id}`;

    return NextResponse.json({
      success: true,
      message: 'Leave request deleted'
    });

  } catch (error: any) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

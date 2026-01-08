import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PUT - Update leave request (approve, reject, cancel)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, approverId, rejectReason } = body;

    if (!action || !['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
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
      if (!approverId) {
        return NextResponse.json(
          { success: false, error: 'Approver ID required' },
          { status: 400 }
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

      // Update leave request
      await sql`
        UPDATE leave_requests
        SET 
          status = 'approved',
          approved_by = ${approverId},
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = ${id}
      `;

      // Update leave balance if annual leave
      if (request_data.leave_type === 'annual') {
        await sql`
          UPDATE leave_balances
          SET 
            annual_used = annual_used + ${request_data.total_days},
            annual_remaining = annual_remaining - ${request_data.total_days},
            updated_at = NOW()
          WHERE employee_id = ${request_data.employee_id}
            AND year = EXTRACT(YEAR FROM ${request_data.start_date}::date)
        `;
      } else if (request_data.leave_type === 'sick') {
        await sql`
          UPDATE leave_balances
          SET 
            sick_used = sick_used + ${request_data.total_days},
            sick_remaining = sick_remaining - ${request_data.total_days},
            updated_at = NOW()
          WHERE employee_id = ${request_data.employee_id}
            AND year = EXTRACT(YEAR FROM ${request_data.start_date}::date)
        `;
      }

      return NextResponse.json({
        success: true,
        message: 'Leave request approved',
        warnings: projectConflicts.length > 0 ? {
          hasProjectConflict: true,
          projects: projectConflicts
        } : null
      });
    }

    if (action === 'reject') {
      if (!approverId) {
        return NextResponse.json(
          { success: false, error: 'Approver ID required' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE leave_requests
        SET 
          status = 'rejected',
          approved_by = ${approverId},
          approved_at = NOW(),
          reject_reason = ${rejectReason || ''},
          updated_at = NOW()
        WHERE id = ${id}
      `;

      return NextResponse.json({
        success: true,
        message: 'Leave request rejected'
      });
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

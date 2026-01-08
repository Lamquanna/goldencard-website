import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    // Get leave summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        SUM(total_days) FILTER (WHERE status = 'approved') as total_days_taken
      FROM leave_requests
      WHERE start_date >= ${from}::date AND end_date <= ${to}::date
    `;

    // Get leave by type
    const byType = await sql`
      SELECT 
        lt.name as leave_type,
        COUNT(*) as count,
        SUM(lr.total_days) as total_days
      FROM leave_requests lr
      JOIN leave_types lt ON lt.id = lr.leave_type_id
      WHERE lr.start_date >= ${from}::date AND lr.end_date <= ${to}::date
        AND lr.status = 'approved'
      GROUP BY lt.name
      ORDER BY total_days DESC
    `;

    // Get leave by department
    const byDepartment = await sql`
      SELECT 
        d.name as department,
        COUNT(*) as count,
        SUM(lr.total_days) as total_days
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      JOIN departments d ON d.id = e.department_id
      WHERE lr.start_date >= ${from}::date AND lr.end_date <= ${to}::date
        AND lr.status = 'approved'
      GROUP BY d.name
      ORDER BY total_days DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        summary: summary[0] || {
          total_requests: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          total_days_taken: 0
        },
        byType: byType,
        byDepartment: byDepartment
      }
    });

  } catch (error: any) {
    console.error('Error fetching leave report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    // Get overtime summary
    const summary = await sql`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        SUM(total_hours) FILTER (WHERE status = 'approved') as total_hours,
        SUM(total_hours * hourly_rate) FILTER (WHERE status = 'approved') as total_cost
      FROM overtime_requests
      WHERE request_date >= ${from}::date AND request_date <= ${to}::date
    `;

    // Get overtime by employee
    const byEmployee = await sql`
      SELECT 
        e.full_name as employee_name,
        e.employee_code,
        COUNT(*) as request_count,
        SUM(ot.total_hours) as total_hours,
        SUM(ot.total_hours * ot.hourly_rate) as total_amount
      FROM overtime_requests ot
      JOIN employees e ON e.id = ot.employee_id
      WHERE ot.request_date >= ${from}::date AND ot.request_date <= ${to}::date
        AND ot.status = 'approved'
      GROUP BY e.id, e.full_name, e.employee_code
      ORDER BY total_hours DESC
      LIMIT 10
    `;

    // Get overtime by department
    const byDepartment = await sql`
      SELECT 
        d.name as department,
        COUNT(*) as request_count,
        SUM(ot.total_hours) as total_hours,
        SUM(ot.total_hours * ot.hourly_rate) as total_amount
      FROM overtime_requests ot
      JOIN employees e ON e.id = ot.employee_id
      JOIN departments d ON d.id = e.department_id
      WHERE ot.request_date >= ${from}::date AND ot.request_date <= ${to}::date
        AND ot.status = 'approved'
      GROUP BY d.name
      ORDER BY total_hours DESC
    `;

    return NextResponse.json({
      success: true,
      data: {
        summary: summary[0] || {
          total_requests: 0,
          pending: 0,
          approved: 0,
          total_hours: 0,
          total_cost: 0
        },
        byEmployee: byEmployee,
        byDepartment: byDepartment
      }
    });

  } catch (error: any) {
    console.error('Error fetching overtime report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

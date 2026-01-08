import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    // Current headcount by status
    const byStatus = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM employees
      WHERE created_at <= ${to}::date
      GROUP BY status
    `;

    // Headcount by department
    const byDepartment = await sql`
      SELECT 
        d.name as department,
        COUNT(*) as count
      FROM employees e
      JOIN departments d ON d.id = e.department_id
      WHERE e.status = 'active'
      GROUP BY d.name
      ORDER BY count DESC
    `;

    // New hires in period
    const newHires = await sql`
      SELECT COUNT(*) as count
      FROM employees
      WHERE hire_date BETWEEN ${from}::date AND ${to}::date
    `;

    // Terminations in period
    const terminations = await sql`
      SELECT COUNT(*) as count
      FROM employees
      WHERE termination_date BETWEEN ${from}::date AND ${to}::date
    `;

    // Monthly trend
    const monthlyTrend = await sql`
      SELECT 
        TO_CHAR(month_date, 'YYYY-MM') as month,
        (
          SELECT COUNT(*)
          FROM employees
          WHERE hire_date <= month_date
            AND (termination_date IS NULL OR termination_date > month_date)
        ) as headcount
      FROM generate_series(
        ${from}::date,
        ${to}::date,
        '1 month'::interval
      ) month_date
      ORDER BY month_date
    `;

    return NextResponse.json({
      success: true,
      data: {
        byStatus: byStatus,
        byDepartment: byDepartment,
        newHires: newHires[0]?.count || 0,
        terminations: terminations[0]?.count || 0,
        monthlyTrend: monthlyTrend
      }
    });

  } catch (error: any) {
    console.error('Error fetching headcount report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

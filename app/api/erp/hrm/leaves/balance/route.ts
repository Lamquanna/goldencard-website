import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch leave balance for employee(s)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (employeeId) {
      // Get balance for specific employee
      const balance = await sql`
        SELECT 
          lb.*,
          e.full_name,
          e.employee_code,
          e.department
        FROM leave_balances lb
        JOIN employees e ON e.id = lb.employee_id
        WHERE lb.employee_id = ${employeeId}
          AND lb.year = ${year}
      `;

      if (balance.length === 0) {
        // Create default balance if not exists
        const newBalance = await sql`
          INSERT INTO leave_balances (
            employee_id,
            year,
            annual_total,
            annual_used,
            annual_remaining,
            sick_total,
            sick_used,
            sick_remaining,
            unpaid_used,
            created_at,
            updated_at
          ) VALUES (
            ${employeeId},
            ${year},
            12,
            0,
            12,
            30,
            0,
            30,
            0,
            NOW(),
            NOW()
          )
          RETURNING *
        `;

        const employee = await sql`
          SELECT full_name, employee_code, department
          FROM employees
          WHERE id = ${employeeId}
        `;

        return NextResponse.json({
          success: true,
          data: { ...newBalance[0], ...employee[0] }
        });
      }

      return NextResponse.json({
        success: true,
        data: balance[0]
      });

    } else {
      // Get balances for all employees
      const balances = await sql`
        SELECT 
          lb.*,
          e.full_name,
          e.employee_code,
          e.department
        FROM leave_balances lb
        JOIN employees e ON e.id = lb.employee_id
        WHERE lb.year = ${year}
        ORDER BY e.employee_code
      `;

      return NextResponse.json({
        success: true,
        data: balances
      });
    }

  } catch (error: any) {
    console.error('Error fetching leave balance:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

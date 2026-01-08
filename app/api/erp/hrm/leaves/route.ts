import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - Fetch leave requests with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const type = searchParams.get('type');

    let query = `
      SELECT 
        lr.*,
        e.full_name as employee_name,
        e.employee_code,
        e.department,
        e.email,
        a.full_name as approver_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      LEFT JOIN employees a ON a.id = lr.approved_by
      WHERE EXTRACT(YEAR FROM lr.start_date) = ${year}
    `;

    if (employeeId) {
      query += ` AND lr.employee_id = ${employeeId}`;
    }

    if (status) {
      query += ` AND lr.status = '${status}'`;
    }

    if (type) {
      query += ` AND lr.leave_type = '${type}'`;
    }

    query += ` ORDER BY lr.created_at DESC`;

    const result = await sql.unsafe(query);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new leave request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, reason, totalDays } = body;

    // Validate required fields
    if (!employeeId || !leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if there are project conflicts
    const projectConflicts = await sql`
      SELECT 
        p.project_name,
        p.start_date,
        p.end_date
      FROM projects p
      JOIN project_members pm ON pm.project_id = p.id
      WHERE pm.employee_id = ${employeeId}
        AND p.status = 'active'
        AND (
          (${startDate}::date BETWEEN p.start_date AND p.end_date)
          OR (${endDate}::date BETWEEN p.start_date AND p.end_date)
          OR (p.start_date BETWEEN ${startDate}::date AND ${endDate}::date)
        )
    `;

    // Insert leave request
    const result = await sql`
      INSERT INTO leave_requests (
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        reason,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${employeeId},
        ${leaveType},
        ${startDate},
        ${endDate},
        ${totalDays},
        ${reason},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: result[0],
      warnings: projectConflicts.length > 0 ? {
        hasProjectConflict: true,
        projects: projectConflicts
      } : null
    });

  } catch (error: any) {
    console.error('Error creating leave request:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

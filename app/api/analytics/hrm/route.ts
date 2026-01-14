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

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/hrm
 * HRM analytics dashboard data
 * Query params: period (today|week|month|quarter|year), startDate, endDate
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = '';
    const params: any[] = [];

    if (startDate && endDate) {
      dateFilter = `WHERE check_in::date BETWEEN $1 AND $2`;
      params.push(startDate, endDate);
    } else {
      switch (period) {
        case 'today':
          dateFilter = `WHERE check_in::date = CURRENT_DATE`;
          break;
        case 'week':
          dateFilter = `WHERE check_in::date >= CURRENT_DATE - INTERVAL '7 days'`;
          break;
        case 'month':
          dateFilter = `WHERE check_in::date >= CURRENT_DATE - INTERVAL '30 days'`;
          break;
        case 'quarter':
          dateFilter = `WHERE check_in::date >= CURRENT_DATE - INTERVAL '90 days'`;
          break;
        case 'year':
          dateFilter = `WHERE check_in::date >= CURRENT_DATE - INTERVAL '365 days'`;
          break;
      }
    }

    // Employee Statistics
    const employeeStatsQuery = `
      SELECT 
        COUNT(DISTINCT id) as total_employees,
        COUNT(DISTINCT CASE WHEN status = 'active' THEN id END) as active_employees,
        COUNT(DISTINCT CASE WHEN status = 'inactive' THEN id END) as inactive_employees
      FROM erp_employees
    `;

    const employeeStats = await sql.query(employeeStatsQuery);

    // Attendance Statistics
    const attendanceStatsQuery = `
      SELECT 
        COUNT(DISTINCT user_id) as employees_checked_in_today,
        COUNT(*) as total_attendance_records,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/3600) as avg_hours_worked
      FROM erp_attendance
      WHERE check_in::date = CURRENT_DATE
      AND check_out IS NOT NULL
    `;

    const attendanceStats = await sql.query(attendanceStatsQuery);

    // Daily Attendance Trends (last 30 days)
    const attendanceTrendsQuery = `
      SELECT 
        check_in::date as date,
        COUNT(DISTINCT user_id) as employees_present,
        AVG(EXTRACT(EPOCH FROM (check_out - check_in))/3600) as avg_hours
      FROM erp_attendance
      WHERE check_in::date >= CURRENT_DATE - INTERVAL '30 days'
      AND check_out IS NOT NULL
      GROUP BY check_in::date
      ORDER BY date ASC
    `;

    const attendanceTrends = await sql.query(attendanceTrendsQuery);

    // Leave Statistics
    const leaveStatsQuery = `
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
        SUM(CASE WHEN status = 'approved' THEN total_days ELSE 0 END) as total_days_taken
      FROM leave_requests
      WHERE EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
    `;

    const leaveStats = await sql.query(leaveStatsQuery);

    // Leave Requests by Type
    const leaveTypeQuery = `
      SELECT 
        leave_type,
        COUNT(*) as count,
        SUM(total_days) as total_days
      FROM leave_requests
      WHERE status = 'approved'
      AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY leave_type
      ORDER BY count DESC
    `;

    const leaveTypes = await sql.query(leaveTypeQuery);

    // Department Statistics (if departments table exists)
    const departmentStatsQuery = `
      SELECT 
        d.name as department,
        COUNT(e.id) as employee_count
      FROM departments d
      LEFT JOIN erp_employees e ON e.department_id = d.id
      WHERE e.status = 'active'
      GROUP BY d.name
      ORDER BY employee_count DESC
      LIMIT 10
    `;

    let departmentStats;
    try {
      departmentStats = await sql.query(departmentStatsQuery);
    } catch (error) {
      // Table might not exist
      departmentStats = { rows: [] };
    }

    // Recent Leave Requests
    const recentLeavesQuery = `
      SELECT 
        id,
        employee_id,
        leave_type,
        start_date,
        end_date,
        total_days,
        status,
        reason
      FROM leave_requests
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentLeaves = await sql.query(recentLeavesQuery);

    // Attendance Rate Calculation
    const totalEmployees = parseInt(employeeStats.rows[0]?.active_employees || '0');
    const presentToday = parseInt(attendanceStats.rows[0]?.employees_checked_in_today || '0');
    const attendanceRate = totalEmployees > 0 
      ? ((presentToday / totalEmployees) * 100).toFixed(2)
      : '0';

    return createSuccessResponse({
      employees: {
        total: parseInt(employeeStats.rows[0]?.total_employees || '0'),
        active: parseInt(employeeStats.rows[0]?.active_employees || '0'),
        inactive: parseInt(employeeStats.rows[0]?.inactive_employees || '0')
      },
      attendance: {
        presentToday: presentToday,
        totalRecords: parseInt(attendanceStats.rows[0]?.total_attendance_records || '0'),
        avgHoursWorked: parseFloat(attendanceStats.rows[0]?.avg_hours_worked || '0').toFixed(2),
        attendanceRate: parseFloat(attendanceRate)
      },
      leaves: {
        totalRequests: parseInt(leaveStats.rows[0]?.total_requests || '0'),
        pending: parseInt(leaveStats.rows[0]?.pending_requests || '0'),
        approved: parseInt(leaveStats.rows[0]?.approved_requests || '0'),
        rejected: parseInt(leaveStats.rows[0]?.rejected_requests || '0'),
        totalDaysTaken: parseFloat(leaveStats.rows[0]?.total_days_taken || '0')
      },
      leavesByType: leaveTypes.rows.map((row: any) => ({
        type: row.leave_type,
        count: parseInt(row.count),
        totalDays: parseFloat(row.total_days || '0')
      })),
      departmentDistribution: departmentStats.rows.map((row: any) => ({
        department: row.department,
        employeeCount: parseInt(row.employee_count)
      })),
      attendanceTrends: attendanceTrends.rows.map((row: any) => ({
        date: row.date,
        present: parseInt(row.employees_present),
        avgHours: parseFloat(row.avg_hours || '0').toFixed(2)
      })),
      recentLeaveRequests: recentLeaves.rows.map((row: any) => ({
        id: row.id,
        employeeId: row.employee_id,
        type: row.leave_type,
        startDate: row.start_date,
        endDate: row.end_date,
        totalDays: parseFloat(row.total_days),
        status: row.status,
        reason: row.reason
      })),
      period,
      generatedAt: new Date().toISOString()
    }, requestId);

  } catch (error: any) {
    logger.error('Error fetching HRM analytics', error, { requestId });
    return createErrorResponse(
      'Failed to fetch HRM analytics',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

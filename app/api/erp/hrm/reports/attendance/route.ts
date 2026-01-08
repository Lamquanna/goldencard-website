import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    // Get attendance summary
    const summary = await sql`
      SELECT 
        COUNT(DISTINCT attendance_date) as total_working_days,
        COUNT(*) FILTER (WHERE status = 'present' OR status = 'late') as total_present,
        COUNT(*) FILTER (WHERE status = 'late') as total_late,
        COUNT(*) FILTER (WHERE status = 'absent') as total_absent,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'present')::DECIMAL / 
          NULLIF(COUNT(*) FILTER (WHERE status IN ('present', 'late', 'absent')), 0)) * 100, 
          1
        ) as on_time_rate,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'late')::DECIMAL / 
          NULLIF(COUNT(*) FILTER (WHERE status IN ('present', 'late', 'absent')), 0)) * 100, 
          1
        ) as late_rate,
        ROUND(
          (COUNT(*) FILTER (WHERE status = 'absent')::DECIMAL / 
          NULLIF(COUNT(*) FILTER (WHERE status IN ('present', 'late', 'absent')), 0)) * 100, 
          1
        ) as absent_rate
      FROM attendance
      WHERE attendance_date BETWEEN ${from}::date AND ${to}::date
    `;

    // Get weekly breakdown
    const weeklyData = await sql`
      SELECT 
        DATE_TRUNC('week', attendance_date) as week_start,
        TO_CHAR(DATE_TRUNC('week', attendance_date), 'W') as week_number,
        COUNT(*) FILTER (WHERE status = 'present') as on_time,
        COUNT(*) FILTER (WHERE status = 'late') as late,
        COUNT(*) FILTER (WHERE status = 'absent') as absent
      FROM attendance
      WHERE attendance_date BETWEEN ${from}::date AND ${to}::date
      GROUP BY DATE_TRUNC('week', attendance_date)
      ORDER BY DATE_TRUNC('week', attendance_date)
    `;

    return NextResponse.json({
      success: true,
      data: {
        summary: summary[0] || {
          total_working_days: 0,
          total_present: 0,
          total_late: 0,
          total_absent: 0,
          on_time_rate: 0,
          late_rate: 0,
          absent_rate: 0
        },
        weeklyData: weeklyData.map((row: any) => ({
          week: `Tuần ${row.week_number}`,
          onTime: row.on_time,
          late: row.late,
          absent: row.absent
        }))
      }
    });

  } catch (error: any) {
    console.error('Error fetching attendance report:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

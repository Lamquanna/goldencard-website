import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  handleDatabaseError,
  ErrorCodes,
  addNoCacheHeaders,
} from '@/lib/api/error-handler';
import { requireAuth } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch leave requests with filters
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Check authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const type = searchParams.get('type');

    // ✅ FIXED: Use parameterized queries to prevent SQL injection
    const yearNum = parseInt(year, 10);
    if (isNaN(yearNum)) {
      return createErrorResponse(
        'Invalid year parameter',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { year },
        requestId
      );
    }

    // Build safe parameterized query
    let query = sql`
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
      WHERE EXTRACT(YEAR FROM lr.start_date) = ${yearNum}
    `;

    if (employeeId) {
      query = sql`${query} AND lr.employee_id = ${employeeId}`;
    }

    if (status) {
      query = sql`${query} AND lr.status = ${status}`;
    }

    if (type) {
      query = sql`${query} AND lr.leave_type = ${type}`;
    }

    query = sql`${query} ORDER BY lr.created_at DESC`;

    const result = await query;

    console.log(`[API] GET /api/erp/hrm/leaves - ${requestId} (${Date.now() - startTime}ms)`);

    const response = createSuccessResponse(result, requestId);
    return addNoCacheHeaders(response);

  } catch (error: any) {
    console.error('[GET /api/erp/hrm/leaves] Error:', {
      requestId,
      error: error.message,
    });

    return handleDatabaseError(error, requestId);
  }
}

// POST - Create new leave request
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Check authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, reason, totalDays } = body;

    // ✅ Validate required fields
    const requiredFields = ['employeeId', 'leaveType', 'startDate', 'endDate', 'reason'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return createErrorResponse(
        `Missing required fields: ${missingFields.join(', ')}`,
        ErrorCodes.VALIDATION_ERROR,
        400,
        { missingFields },
        requestId
      );
    }

    // Validate leave type
    const validLeaveTypes = ['annual', 'sick', 'unpaid', 'maternity', 'paternity'];
    if (!validLeaveTypes.includes(leaveType)) {
      return createErrorResponse(
        'Invalid leave type',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { validTypes: validLeaveTypes },
        requestId
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
        ${totalDays || 1},
        ${reason},
        'pending',
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    // Create audit log entry
    await sql`
      INSERT INTO audit_logs (
        user_id,
        action,
        resource_type,
        resource_id,
        metadata,
        created_at
      ) VALUES (
        ${user.userId},
        'create',
        'leave_request',
        ${result[0].id},
        ${JSON.stringify({
          employeeId,
          leaveType,
          startDate,
          endDate,
          totalDays: totalDays || 1,
          email: user.email
        })},
        NOW()
      )
    `;

    console.log(`[API] POST /api/erp/hrm/leaves - ${requestId} (${Date.now() - startTime}ms)`);

    // Return with warnings if project conflicts exist
    const responseData = {
      ...result[0],
      warnings: projectConflicts.length > 0 ? {
        hasProjectConflict: true,
        projects: projectConflicts
      } : null
    };

    return createSuccessResponse(responseData, requestId);

  } catch (error: any) {
    console.error('[POST /api/erp/hrm/leaves] Error:', {
      requestId,
      error: error.message,
    });

    return handleDatabaseError(error, requestId);
  }
}

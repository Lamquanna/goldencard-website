// ============================================================================
// EMPLOYEE DETAIL API - GET, PUT, DELETE by ID
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/employees/[id] - Lấy thông tin chi tiết nhân viên
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    const result = await sql`
      SELECT 
        e.*,
        d.name as "departmentName",
        d.code as "departmentCode",
        p.name as "positionName",
        p.code as "positionCode",
        p.level as "positionLevel",
        p."minSalary",
        p."maxSalary",
        m.id as "managerId",
        m."firstName" as "managerFirstName",
        m."lastName" as "managerLastName",
        m.avatar as "managerAvatar"
      FROM employees e
      LEFT JOIN departments d ON e."departmentId" = d.id
      LEFT JOIN positions p ON e."positionId" = p.id
      LEFT JOIN employees m ON e."managerId" = m.id
      WHERE e.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin nhân viên' },
      { status: 500 }
    )
  }
}

// PUT /api/employees/[id] - Cập nhật thông tin nhân viên
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const now = new Date().toISOString()

    // Check if employee exists
    const existing = await sql`SELECT id FROM employees WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      )
    }

    const result = await sql`
      UPDATE employees SET
        "firstName" = COALESCE(${body.firstName}, "firstName"),
        "lastName" = COALESCE(${body.lastName}, "lastName"),
        email = COALESCE(${body.email}, email),
        phone = COALESCE(${body.phone}, phone),
        gender = COALESCE(${body.gender}, gender),
        "birthDate" = COALESCE(${body.birthDate}, "birthDate"),
        "nationalId" = COALESCE(${body.nationalId}, "nationalId"),
        address = COALESCE(${body.address}, address),
        city = COALESCE(${body.city}, city),
        country = COALESCE(${body.country}, country),
        "departmentId" = COALESCE(${body.departmentId}, "departmentId"),
        "positionId" = COALESCE(${body.positionId}, "positionId"),
        "managerId" = COALESCE(${body.managerId}, "managerId"),
        "employmentType" = COALESCE(${body.employmentType}, "employmentType"),
        "startDate" = COALESCE(${body.startDate}, "startDate"),
        "endDate" = COALESCE(${body.endDate}, "endDate"),
        status = COALESCE(${body.status}, status),
        salary = COALESCE(${body.salary}, salary),
        currency = COALESCE(${body.currency}, currency),
        "bankAccount" = COALESCE(${body.bankAccount}, "bankAccount"),
        "bankName" = COALESCE(${body.bankName}, "bankName"),
        "emergencyName" = COALESCE(${body.emergencyName}, "emergencyName"),
        "emergencyPhone" = COALESCE(${body.emergencyPhone}, "emergencyPhone"),
        "emergencyRelation" = COALESCE(${body.emergencyRelation}, "emergencyRelation"),
        avatar = COALESCE(${body.avatar}, avatar),
        "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật thông tin nhân viên' },
      { status: 500 }
    )
  }
}

// DELETE /api/employees/[id] - Xóa nhân viên
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    // Check if employee exists
    const existing = await sql`SELECT id FROM employees WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy nhân viên' },
        { status: 404 }
      )
    }

    await sql`DELETE FROM employees WHERE id = ${id}`

    return NextResponse.json({ success: true, message: 'Đã xóa nhân viên thành công' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xóa nhân viên' },
      { status: 500 }
    )
  }
}

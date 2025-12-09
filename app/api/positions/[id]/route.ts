// ============================================================================
// POSITION DETAIL API - GET, PUT, DELETE by ID
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/positions/[id] - Lấy thông tin chi tiết chức vụ
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    const result = await sql`
      SELECT 
        p.*,
        d.name as "departmentName",
        d.code as "departmentCode",
        (SELECT COUNT(*) FROM employees e WHERE e."positionId" = p.id) as "employeeCount"
      FROM positions p
      LEFT JOIN departments d ON p."departmentId" = d.id
      WHERE p.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chức vụ' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error fetching position:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin chức vụ' },
      { status: 500 }
    )
  }
}

// PUT /api/positions/[id] - Cập nhật thông tin chức vụ
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const now = new Date().toISOString()

    // Check if position exists
    const existing = await sql`SELECT id FROM positions WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chức vụ' },
        { status: 404 }
      )
    }

    // Check if code is being changed to an existing one
    if (body.code) {
      const codeExists = await sql`
        SELECT id FROM positions WHERE code = ${body.code} AND id != ${id}
      `
      if (codeExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Mã chức vụ đã tồn tại' },
          { status: 400 }
        )
      }
    }

    const result = await sql`
      UPDATE positions SET
        name = COALESCE(${body.name}, name),
        code = COALESCE(${body.code}, code),
        "departmentId" = COALESCE(${body.departmentId}, "departmentId"),
        level = COALESCE(${body.level}, level),
        description = COALESCE(${body.description}, description),
        "minSalary" = COALESCE(${body.minSalary}, "minSalary"),
        "maxSalary" = COALESCE(${body.maxSalary}, "maxSalary"),
        "isActive" = COALESCE(${body.isActive}, "isActive"),
        "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error updating position:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật thông tin chức vụ' },
      { status: 500 }
    )
  }
}

// DELETE /api/positions/[id] - Xóa chức vụ
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    // Check if position exists
    const existing = await sql`SELECT id FROM positions WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy chức vụ' },
        { status: 404 }
      )
    }

    // Check if position is being used
    const employees = await sql`SELECT id FROM employees WHERE "positionId" = ${id} LIMIT 1`
    if (employees.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa chức vụ đang có nhân viên' },
        { status: 400 }
      )
    }

    await sql`DELETE FROM positions WHERE id = ${id}`

    return NextResponse.json({ success: true, message: 'Đã xóa chức vụ thành công' })
  } catch (error) {
    console.error('Error deleting position:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xóa chức vụ' },
      { status: 500 }
    )
  }
}

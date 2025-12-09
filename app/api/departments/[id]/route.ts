// ============================================================================
// DEPARTMENT DETAIL API - GET, PUT, DELETE by ID
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/departments/[id] - Lấy thông tin chi tiết phòng ban
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    const result = await sql`
      SELECT 
        d.*,
        pd.name as "parentName",
        pd.code as "parentCode",
        m.id as "managerId",
        m."firstName" as "managerFirstName",
        m."lastName" as "managerLastName",
        m.avatar as "managerAvatar",
        (SELECT COUNT(*) FROM employees e WHERE e."departmentId" = d.id) as "employeeCount",
        (SELECT COUNT(*) FROM positions p WHERE p."departmentId" = d.id) as "positionCount",
        (SELECT COUNT(*) FROM departments c WHERE c."parentId" = d.id) as "childCount"
      FROM departments d
      LEFT JOIN departments pd ON d."parentId" = pd.id
      LEFT JOIN employees m ON d."managerId" = m.id
      WHERE d.id = ${id}
    `

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      )
    }

    // Get child departments
    const children = await sql`
      SELECT id, name, code FROM departments WHERE "parentId" = ${id}
    `

    // Get positions in this department
    const positions = await sql`
      SELECT id, name, code, level FROM positions WHERE "departmentId" = ${id} ORDER BY level ASC
    `

    return NextResponse.json({
      success: true,
      data: {
        ...result[0],
        children,
        positions
      }
    })
  } catch (error) {
    console.error('Error fetching department:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin phòng ban' },
      { status: 500 }
    )
  }
}

// PUT /api/departments/[id] - Cập nhật thông tin phòng ban
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params
    const body = await request.json()
    const now = new Date().toISOString()

    // Check if department exists
    const existing = await sql`SELECT id FROM departments WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      )
    }

    // Check if code is being changed to an existing one
    if (body.code) {
      const codeExists = await sql`
        SELECT id FROM departments WHERE code = ${body.code} AND id != ${id}
      `
      if (codeExists.length > 0) {
        return NextResponse.json(
          { success: false, error: 'Mã phòng ban đã tồn tại' },
          { status: 400 }
        )
      }
    }

    // Prevent circular parent reference
    if (body.parentId === id) {
      return NextResponse.json(
        { success: false, error: 'Phòng ban không thể là cha của chính nó' },
        { status: 400 }
      )
    }

    const result = await sql`
      UPDATE departments SET
        name = COALESCE(${body.name}, name),
        code = COALESCE(${body.code}, code),
        description = COALESCE(${body.description}, description),
        "parentId" = COALESCE(${body.parentId}, "parentId"),
        "managerId" = COALESCE(${body.managerId}, "managerId"),
        "isActive" = COALESCE(${body.isActive}, "isActive"),
        "updatedAt" = ${now}
      WHERE id = ${id}
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] })
  } catch (error) {
    console.error('Error updating department:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật thông tin phòng ban' },
      { status: 500 }
    )
  }
}

// DELETE /api/departments/[id] - Xóa phòng ban
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { id } = await params

    // Check if department exists
    const existing = await sql`SELECT id FROM departments WHERE id = ${id}`
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy phòng ban' },
        { status: 404 }
      )
    }

    // Check if department has employees
    const employees = await sql`SELECT id FROM employees WHERE "departmentId" = ${id} LIMIT 1`
    if (employees.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa phòng ban đang có nhân viên' },
        { status: 400 }
      )
    }

    // Check if department has children
    const children = await sql`SELECT id FROM departments WHERE "parentId" = ${id} LIMIT 1`
    if (children.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Không thể xóa phòng ban đang có phòng ban con' },
        { status: 400 }
      )
    }

    // Delete positions in this department first
    await sql`DELETE FROM positions WHERE "departmentId" = ${id}`

    // Delete department
    await sql`DELETE FROM departments WHERE id = ${id}`

    return NextResponse.json({ success: true, message: 'Đã xóa phòng ban thành công' })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể xóa phòng ban' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DEPARTMENTS API - CRUD Operations
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { randomUUID } from 'crypto'

function generateCuid() {
  return 'c' + randomUUID().replace(/-/g, '').substring(0, 24)
}

// GET /api/departments - Lấy danh sách phòng ban
export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search') || ''

    let query = `
      SELECT 
        d.*,
        pd.name as "parentName",
        pd.code as "parentCode",
        m."firstName" as "managerFirstName",
        m."lastName" as "managerLastName",
        m.avatar as "managerAvatar",
        (SELECT COUNT(*) FROM employees e WHERE e."departmentId" = d.id) as "employeeCount",
        (SELECT COUNT(*) FROM positions p WHERE p."departmentId" = d.id) as "positionCount"
      FROM departments d
      LEFT JOIN departments pd ON d."parentId" = pd.id
      LEFT JOIN employees m ON d."managerId" = m.id
      WHERE 1=1
    `

    if (search) {
      query += ` AND (d.name ILIKE '%${search}%' OR d.code ILIKE '%${search}%')`
    }
    
    if (parentId === 'null') {
      query += ` AND d."parentId" IS NULL`
    } else if (parentId) {
      query += ` AND d."parentId" = '${parentId}'`
    }

    if (isActive !== null && isActive !== undefined) {
      query += ` AND d."isActive" = ${isActive === 'true'}`
    }

    query += ` ORDER BY d.name ASC`

    const departments = await sql(query)

    return NextResponse.json({
      success: true,
      data: departments
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách phòng ban' },
      { status: 500 }
    )
  }
}

// POST /api/departments - Tạo phòng ban mới
export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const id = generateCuid()
    const now = new Date().toISOString()

    // Validate required fields
    if (!body.name || !body.code) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc: name, code' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await sql`SELECT id FROM departments WHERE code = ${body.code}`
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Mã phòng ban đã tồn tại' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO departments (
        id, name, code, description, "parentId", "managerId",
        "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${body.name},
        ${body.code},
        ${body.description || null},
        ${body.parentId || null},
        ${body.managerId || null},
        ${body.isActive !== false},
        ${now},
        ${now}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo phòng ban mới' },
      { status: 500 }
    )
  }
}

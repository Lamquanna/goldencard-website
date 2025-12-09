// ============================================================================
// POSITIONS API - CRUD Operations
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { randomUUID } from 'crypto'

function generateCuid() {
  return 'c' + randomUUID().replace(/-/g, '').substring(0, 24)
}

// GET /api/positions - Lấy danh sách chức vụ
export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search') || ''

    let query = `
      SELECT 
        p.*,
        d.name as "departmentName",
        d.code as "departmentCode",
        (SELECT COUNT(*) FROM employees e WHERE e."positionId" = p.id) as "employeeCount"
      FROM positions p
      LEFT JOIN departments d ON p."departmentId" = d.id
      WHERE 1=1
    `

    if (search) {
      query += ` AND (p.name ILIKE '%${search}%' OR p.code ILIKE '%${search}%')`
    }
    
    if (departmentId) {
      query += ` AND p."departmentId" = '${departmentId}'`
    }

    if (isActive !== null && isActive !== undefined) {
      query += ` AND p."isActive" = ${isActive === 'true'}`
    }

    query += ` ORDER BY p.level ASC, p.name ASC`

    const positions = await sql(query)

    return NextResponse.json({
      success: true,
      data: positions
    })
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách chức vụ' },
      { status: 500 }
    )
  }
}

// POST /api/positions - Tạo chức vụ mới
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
    const existing = await sql`SELECT id FROM positions WHERE code = ${body.code}`
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Mã chức vụ đã tồn tại' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO positions (
        id, name, code, "departmentId", level, description,
        "minSalary", "maxSalary", "isActive", "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${body.name},
        ${body.code},
        ${body.departmentId || null},
        ${body.level || 1},
        ${body.description || null},
        ${body.minSalary || null},
        ${body.maxSalary || null},
        ${body.isActive !== false},
        ${now},
        ${now}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating position:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo chức vụ mới' },
      { status: 500 }
    )
  }
}

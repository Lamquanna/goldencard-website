// ============================================================================
// EMPLOYEES API - CRUD Operations
// GoldenEnergy ERP Platform
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { randomUUID } from 'crypto'

function generateCuid() {
  return 'c' + randomUUID().replace(/-/g, '').substring(0, 24)
}

// GET /api/employees - Lấy danh sách nhân viên
export async function GET(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const departmentId = searchParams.get('departmentId')
    const positionId = searchParams.get('positionId')
    const status = searchParams.get('status')

    const offset = (page - 1) * limit

    // Build base query
    let query = `
      SELECT 
        e.*,
        d.name as "departmentName",
        d.code as "departmentCode",
        p.name as "positionName",
        p.code as "positionCode",
        p.level as "positionLevel",
        m."firstName" as "managerFirstName",
        m."lastName" as "managerLastName",
        m.avatar as "managerAvatar"
      FROM employees e
      LEFT JOIN departments d ON e."departmentId" = d.id
      LEFT JOIN positions p ON e."positionId" = p.id
      LEFT JOIN employees m ON e."managerId" = m.id
      WHERE 1=1
    `
    
    let countQuery = `SELECT COUNT(*) as total FROM employees e WHERE 1=1`

    if (search) {
      const searchCondition = ` AND (
        e."firstName" ILIKE '%${search}%' OR 
        e."lastName" ILIKE '%${search}%' OR 
        e.email ILIKE '%${search}%' OR 
        e."employeeCode" ILIKE '%${search}%'
      )`
      query += searchCondition
      countQuery += searchCondition
    }
    
    if (departmentId) {
      query += ` AND e."departmentId" = '${departmentId}'`
      countQuery += ` AND e."departmentId" = '${departmentId}'`
    }

    if (positionId) {
      query += ` AND e."positionId" = '${positionId}'`
      countQuery += ` AND e."positionId" = '${positionId}'`
    }
    
    if (status) {
      query += ` AND e.status = '${status}'`
      countQuery += ` AND e.status = '${status}'`
    }

    query += ` ORDER BY e."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`

    const [employees, countResult] = await Promise.all([
      sql(query),
      sql(countQuery)
    ])

    const total = parseInt(countResult[0]?.total || '0')

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách nhân viên' },
      { status: 500 }
    )
  }
}

// POST /api/employees - Tạo nhân viên mới
export async function POST(request: NextRequest) {
  try {
    if (!sql) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const body = await request.json()
    const id = generateCuid()
    const now = new Date().toISOString()

    // Validate required fields
    if (!body.employeeCode || !body.firstName || !body.lastName || !body.email || !body.startDate) {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin bắt buộc: employeeCode, firstName, lastName, email, startDate' },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO employees (
        id, "workspaceId", "employeeCode", "firstName", "lastName", email, phone,
        gender, "birthDate", "nationalId", address, city, country,
        "departmentId", "positionId", "managerId", "employmentType",
        "startDate", "endDate", status, salary, currency,
        "bankAccount", "bankName", "emergencyName", "emergencyPhone", 
        "emergencyRelation", avatar, "createdAt", "updatedAt"
      ) VALUES (
        ${id},
        ${body.workspaceId || 'default'},
        ${body.employeeCode},
        ${body.firstName},
        ${body.lastName},
        ${body.email},
        ${body.phone || null},
        ${body.gender || null},
        ${body.birthDate || null},
        ${body.nationalId || null},
        ${body.address || null},
        ${body.city || null},
        ${body.country || null},
        ${body.departmentId || null},
        ${body.positionId || null},
        ${body.managerId || null},
        ${body.employmentType || 'FULL_TIME'},
        ${body.startDate},
        ${body.endDate || null},
        ${body.status || 'ACTIVE'},
        ${body.salary || null},
        ${body.currency || 'VND'},
        ${body.bankAccount || null},
        ${body.bankName || null},
        ${body.emergencyName || null},
        ${body.emergencyPhone || null},
        ${body.emergencyRelation || null},
        ${body.avatar || null},
        ${now},
        ${now}
      )
      RETURNING *
    `

    return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Không thể tạo nhân viên mới' },
      { status: 500 }
    )
  }
}

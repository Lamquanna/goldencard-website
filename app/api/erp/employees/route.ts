import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        id,
        employee_code as "employeeCode",
        full_name,
        email,
        phone,
        role as position,
        department,
        is_active as status,
        created_at as "joinDate"
      FROM erp_users
      ORDER BY created_at DESC
    `

    // Transform DB data to Employee format expected by component
    const employees = rows.map(row => {
      const nameParts = row.full_name.split(' ')
      const lastName = nameParts[0]
      const firstName = nameParts.slice(1).join(' ')
      
      return {
        id: row.id.toString(),
        employeeCode: row.employeeCode,
        firstName,
        lastName,
        email: row.email || `${row.employeeCode.toLowerCase()}@goldenenergy.vn`,
        phone: row.phone || '',
        avatar: '',
        departmentId: row.department || 'd1',
        position: row.position || 'Staff',
        level: row.position === 'admin' ? 'Director' : 'Staff',
        employmentType: 'full_time',
        status: row.status ? 'active' : 'inactive',
        joinDate: row.joinDate,
        baseSalary: 20000000,
        currency: 'VND',
        isRemote: false,
        createdAt: row.joinDate,
        updatedAt: row.joinDate,
      }
    })

    return NextResponse.json({ employees })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/employees/[id] - Get single employee
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const rows = await sql`
      SELECT * FROM employees WHERE id = ${parseInt(id)}
    ` as any[];

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 })
    }

    const row = rows[0];
    return NextResponse.json({
      employee: {
        id: row.id.toString(),
        employeeCode: row.employee_code,
        firstName: row.first_name,
        lastName: row.last_name,
        fullName: `${row.last_name} ${row.first_name}`,
        email: row.email,
        phone: row.phone,
        department: row.department,
        position: row.position,
        status: row.status,
        startDate: row.start_date,
        salary: parseFloat(row.salary) || 0,
      }
    })
  } catch (error: any) {
    console.error('Error fetching employee:', error)
    return NextResponse.json({ error: 'Lỗi: ' + error.message }, { status: 500 })
  }
}

// PUT /api/erp/employees/[id] - Update employee
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json()
    const { 
      firstName, lastName, email, phone, gender,
      department, position, employmentType, salary, status
    } = body

    const result = await sql`
      UPDATE employees SET
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        gender = COALESCE(${gender}, gender),
        department = COALESCE(${department}, department),
        position = COALESCE(${position}, position),
        employment_type = COALESCE(${employmentType}, employment_type),
        salary = COALESCE(${salary}, salary),
        status = COALESCE(${status}, status),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    ` as any[];

    if (result.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 })
    }

    const employee = result[0];
    return NextResponse.json({
      success: true,
      message: 'Cập nhật thành công',
      employee: {
        id: employee.id.toString(),
        employeeCode: employee.employee_code,
        firstName: employee.first_name,
        lastName: employee.last_name,
        fullName: `${employee.last_name} ${employee.first_name}`,
      }
    })
  } catch (error: any) {
    console.error('Error updating employee:', error)
    return NextResponse.json({ error: 'Lỗi: ' + error.message }, { status: 500 })
  }
}

// DELETE /api/erp/employees/[id] - Soft delete employee
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const result = await sql`
      UPDATE employees SET 
        status = 'deleted',
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING id, employee_code
    ` as any[];

    if (result.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy nhân viên' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Đã xóa nhân viên ' + result[0].employee_code
    })
  } catch (error: any) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Lỗi: ' + error.message }, { status: 500 })
  }
}

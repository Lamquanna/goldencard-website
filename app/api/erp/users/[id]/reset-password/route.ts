import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import bcrypt from 'bcryptjs'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { newPassword } = body

    // Get user info
    const { rows: userRows } = await sql`
      SELECT employee_code FROM erp_users WHERE id = ${id}
    `

    if (userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const employeeCode = userRows[0].employee_code

    // Determine password: use provided or default
    const password = newPassword || `${employeeCode}@2025`

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update password
    await sql`
      UPDATE erp_users
      SET password_hash = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ 
      success: true, 
      message: 'Đặt lại mật khẩu thành công',
      newPassword: password 
    })
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { full_name, email, phone, role, department } = body

    const { rows } = await sql`
      UPDATE erp_users
      SET 
        full_name = ${full_name},
        email = ${email || null},
        phone = ${phone || null},
        role = ${role},
        department = ${department || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: rows[0] })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { rows } = await sql`
      DELETE FROM erp_users
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Đã xóa người dùng thành công' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

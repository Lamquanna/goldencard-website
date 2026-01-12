import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { rows } = await sql`
      DELETE FROM erp_invoices
      WHERE id = ${id}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}

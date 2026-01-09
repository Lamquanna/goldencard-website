import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/tasks/:id - Get single task
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await sql(
      'SELECT * FROM erp_tasks WHERE id = $1',
      [parseInt(id)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const task = result.rows[0]
    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      projectId: task.project_id,
      tags: task.tags,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PATCH /api/erp/tasks/:id - Update task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, status, priority, dueDate, assigneeId, projectId, tags } = body

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`)
      values.push(title)
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`)
      values.push(description)
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`)
      values.push(status)
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`)
      values.push(priority)
    }
    if (dueDate !== undefined) {
      updates.push(`due_date = $${paramIndex++}`)
      values.push(dueDate)
    }
    if (assigneeId !== undefined) {
      updates.push(`assignee_id = $${paramIndex++}`)
      values.push(assigneeId)
    }
    if (projectId !== undefined) {
      updates.push(`project_id = $${paramIndex++}`)
      values.push(projectId)
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`)
      values.push(tags)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`)
    values.push(parseInt(id))

    const query = `
      UPDATE erp_tasks 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await sql(query, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const task = result.rows[0]
    return NextResponse.json({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      assigneeId: task.assignee_id,
      projectId: task.project_id,
      tags: task.tags,
      updatedAt: task.updated_at,
    })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/erp/tasks/:id - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await sql(
      'DELETE FROM erp_tasks WHERE id = $1 RETURNING id',
      [parseInt(id)]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/tasks - Get all tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const assignee = searchParams.get('assignee')

    let query = 'SELECT * FROM erp_tasks WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    if (priority) {
      query += ` AND priority = $${paramIndex++}`
      params.push(priority)
    }

    if (assignee) {
      query += ` AND assignee_id = $${paramIndex++}`
      params.push(parseInt(assignee))
    }

    if (search) {
      query += ` AND (title ILIKE $${paramIndex++} OR description ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await sql(query, params)
    
    const tasks = result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      priority: row.priority,
      dueDate: row.due_date,
      assigneeId: row.assignee_id,
      projectId: row.project_id,
      tags: row.tags,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/erp/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, priority, dueDate, assigneeId, projectId, tags } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO erp_tasks (
        title, description, status, priority, 
        due_date, assignee_id, project_id, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const result = await sql(query, [
      title,
      description || null,
      'todo', // Default status
      priority || 'medium',
      dueDate || null,
      assigneeId || null,
      projectId || null,
      tags || [],
    ])

    const task = result.rows[0]

    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}

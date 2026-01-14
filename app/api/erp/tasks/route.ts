import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  handleDatabaseError,
  ErrorCodes,
  addNoCacheHeaders,
} from '@/lib/api/error-handler'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/erp/tasks - Get all tasks
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const assignee = searchParams.get('assignee')

    // Simple query - get all tasks first
    let result;
    
    if (status && status !== 'all') {
      result = await sql`SELECT * FROM erp_tasks WHERE status = ${status} ORDER BY created_at DESC`;
    } else if (priority) {
      result = await sql`SELECT * FROM erp_tasks WHERE priority = ${priority} ORDER BY created_at DESC`;
    } else if (search) {
      const searchPattern = `%${search}%`;
      result = await sql`SELECT * FROM erp_tasks WHERE title ILIKE ${searchPattern} OR description ILIKE ${searchPattern} ORDER BY created_at DESC`;
    } else {
      result = await sql`SELECT * FROM erp_tasks ORDER BY created_at DESC`;
    }

    const tasks = result.map((row: any) => ({
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

    const response = createSuccessResponse(tasks, requestId)
    return addNoCacheHeaders(response)

  } catch (error: any) {
    console.error('[GET /api/erp/tasks] Error:', {
      requestId,
      error: error.message,
    })

    return handleDatabaseError(error, requestId)
  }
}

// POST /api/erp/tasks - Create new task
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    const { title, description, priority, dueDate, assigneeId, projectId, tags } = body

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return createErrorResponse(
        'Title is required and cannot be empty',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { field: 'title' },
        requestId
      )
    }

    if (title.length > 255) {
      return createErrorResponse(
        'Title must be less than 255 characters',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { field: 'title', maxLength: 255 },
        requestId
      )
    }

    const result = await sql`
      INSERT INTO erp_tasks (
        title, description, status, priority, 
        due_date, assignee_id, project_id, tags
      )
      VALUES (
        ${title},
        ${description || null},
        'todo',
        ${priority || 'medium'},
        ${dueDate || null},
        ${assigneeId || null},
        ${projectId || null},
        ${tags || []}
      )
      RETURNING *
    `

    const task = {
      id: result[0].id,
      title: result[0].title,
      description: result[0].description,
      status: result[0].status,
      priority: result[0].priority,
      dueDate: result[0].due_date,
      assigneeId: result[0].assignee_id,
      projectId: result[0].project_id,
      tags: result[0].tags,
      createdAt: result[0].created_at,
      updatedAt: result[0].updated_at,
    }

    return createSuccessResponse(task, requestId)

  } catch (error: any) {
    console.error('[POST /api/erp/tasks] Error:', {
      requestId,
      error: error.message,
    })

    return handleDatabaseError(error, requestId)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/projects/[id] - Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const projects = await sql`
      SELECT * FROM erp_projects WHERE id = ${parseInt(id)}
    `
    
    if (projects.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    const row = projects[0]
    return NextResponse.json({
      id: row.id,
      name: row.name,
      projectKey: row.project_key,
      description: row.description,
      color: row.color,
      status: row.status,
      location: row.location,
      startDate: row.start_date,
      endDate: row.end_date,
      progress: row.progress,
      ownerId: row.owner_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/erp/projects/[id] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, color, status, location, startDate, endDate, progress } = body

    const result = await sql`
      UPDATE erp_projects SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        color = COALESCE(${color}, color),
        status = COALESCE(${status}, status),
        location = COALESCE(${location}, location),
        start_date = COALESCE(${startDate}, start_date),
        end_date = COALESCE(${endDate}, end_date),
        progress = COALESCE(${progress}, progress),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result[0]
    })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/erp/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const result = await sql`
      DELETE FROM erp_projects WHERE id = ${parseInt(id)}
      RETURNING id, name
    `

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Project "${result[0].name}" deleted successfully`,
      deletedId: result[0].id
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}

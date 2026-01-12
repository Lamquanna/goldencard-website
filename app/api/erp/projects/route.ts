import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// GET /api/erp/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    let query = 'SELECT * FROM erp_projects WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (status && status !== 'all') {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }

    if (location) {
      query += ` AND location = $${paramIndex++}`
      params.push(location)
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex++} OR project_key ILIKE $${paramIndex++})`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ' ORDER BY created_at DESC'

    const result = await sql.query(query, params)
    
    const projects = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      projectKey: row.project_key,
      description: row.description,
      color: row.color,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      progress: row.progress,
      ownerId: row.owner_id,
      location: row.location,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/erp/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, projectKey, description, color, location, startDate, endDate } = body

    if (!name || !projectKey) {
      return NextResponse.json(
        { error: 'Name and project key are required' },
        { status: 400 }
      )
    }

    const query = `
      INSERT INTO erp_projects (
        name, project_key, description, color, status,
        location, start_date, end_date, progress
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `

    const result = await sql.query(query, [
      name,
      projectKey,
      description || null,
      color || '#3B82F6',
      'active',
      location || null,
      startDate || null,
      endDate || null,
      0, // Initial progress
    ])

    const project = result.rows[0]

    return NextResponse.json(
      {
        id: project.id,
        name: project.name,
        projectKey: project.project_key,
        description: project.description,
        color: project.color,
        status: project.status,
        location: project.location,
        startDate: project.start_date,
        endDate: project.end_date,
        progress: project.progress,
        createdAt: project.created_at,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Error creating project:', error)
    if (error.code === '23505') { // Unique violation
      return NextResponse.json(
        { error: 'Project key already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}

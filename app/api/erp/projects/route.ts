import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Ensure table exists
async function ensureTableExists() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS erp_projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        project_key VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#3B82F6',
        status VARCHAR(50) DEFAULT 'active',
        location VARCHAR(255),
        start_date DATE,
        end_date DATE,
        progress INTEGER DEFAULT 0,
        owner_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (e) {
    console.log('Table check/create:', e);
  }
}

// GET /api/erp/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    await ensureTableExists();
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    // Use simple query with tagged template
    let projects;
    
    if (search) {
      const searchPattern = `%${search}%`;
      projects = await sql`
        SELECT * FROM erp_projects 
        WHERE name ILIKE ${searchPattern} OR project_key ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else if (status && status !== 'all') {
      projects = await sql`
        SELECT * FROM erp_projects 
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 100
      `;
    } else {
      projects = await sql`
        SELECT * FROM erp_projects 
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }
    
    const result = projects.map((row: any) => ({
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
    await ensureTableExists();
    
    const body = await request.json()
    const { name, projectKey, description, color, location, startDate, endDate } = body

    if (!name || !projectKey) {
      return NextResponse.json(
        { error: 'Name and project key are required' },
        { status: 400 }
      )
    }

    // Use tagged template literal for SQL
    const result = await sql`
      INSERT INTO erp_projects (
        name, project_key, description, color, status,
        location, start_date, end_date, progress
      )
      VALUES (
        ${name},
        ${projectKey},
        ${description || null},
        ${color || '#3B82F6'},
        ${'active'},
        ${location || null},
        ${startDate || null},
        ${endDate || null},
        ${0}
      )
      RETURNING *
    `;

    const project = result[0]

    return NextResponse.json(
      {
        success: true,
        data: {
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
        }
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
      { error: 'Failed to create project: ' + error.message },
      { status: 500 }
    )
  }
}

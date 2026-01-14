// Project Management API Routes
// Handles CRUD operations for projects, tasks, and related entities

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { rateLimiters, getClientIdentifier } from '@/lib/rate-limit';
import type { Project } from '@/lib/types/project';
import { logger } from '@/lib/logger';
import { createSuccessResponse, createErrorResponse, generateRequestId, ErrorCodes } from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List all projects
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Rate limiting check
  const identifier = getClientIdentifier(request);
  const rateCheck = rateLimiters.standard.check(identifier);
  
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
    const duration = Date.now() - startTime;
    
    logger.apiRequest({
      method: 'GET',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 429,
    });
    
    return NextResponse.json(
      { success: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }
  try {
    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const lead_id = searchParams.get('lead_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build query with filters
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (lead_id) {
      query += ` AND lead_id = $${paramIndex++}`;
      params.push(lead_id);
    }

    query += ' ORDER BY updated_at DESC';

    // Get total count
    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await sql(countQuery, params);
    const total = parseInt(countResult[0]?.total || '0');

    // Add pagination
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, (page - 1) * limit);

    const result = await sql(query, params);
    const projects = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      priority: row.priority,
      start_date: row.start_date,
      end_date: row.end_date,
      expected_completion: row.expected_completion,
      budget: row.budget,
      client_name: row.client_name,
      client_email: row.client_email,
      client_phone: row.client_phone,
      lead_id: row.lead_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project: any) => {
        const tasksResult = await sql(
          'SELECT status FROM tasks WHERE project_id = $1',
          [project.id]
        );
        const completedTasks = tasksResult.filter((t: any) => t.status === 'done').length;
        
        return {
          ...project,
          task_count: tasksResult.length,
          completed_task_count: completedTasks,
          progress_percentage: tasksResult.length > 0 
            ? Math.round((completedTasks / tasksResult.length) * 100) 
            : 0,
        };
      })
    );
    
    const duration = Date.now() - startTime;
    
    logger.apiRequest({
      method: 'GET',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 200,
    });
    
    return createSuccessResponse({
      data: projectsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Error fetching projects:', error);
    logger.apiRequest({
      method: 'GET',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 500,
      error: error instanceof Error ? error : undefined,
    });
    
    return createErrorResponse(
      'Không thể tải danh sách dự án',
      ErrorCodes.DATABASE_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  // Rate limiting check
  const identifier = getClientIdentifier(request);
  const rateCheck = rateLimiters.standard.check(identifier);
  
  if (!rateCheck.allowed) {
    const retryAfter = Math.ceil((rateCheck.resetTime - Date.now()) / 1000);
    const duration = Date.now() - startTime;
    
    logger.apiRequest({
      method: 'POST',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 429,
    });
    
    return NextResponse.json(
      { success: false, error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '0',
        }
      }
    );
  }
  try {
    if (!sql) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validation
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tên dự án là bắt buộc' },
        { status: 400 }
      );
    }
    
    const result = await sql`
      INSERT INTO projects (
        name, description, lead_id, status, priority,
        start_date, end_date, expected_completion, budget,
        client_name, client_email, client_phone,
        created_at, updated_at
      ) VALUES (
        ${body.name},
        ${body.description || ''},
        ${body.lead_id || null},
        ${body.status || 'planning'},
        ${body.priority || 'medium'},
        ${body.start_date || null},
        ${body.end_date || null},
        ${body.expected_completion || body.end_date || null},
        ${body.budget || null},
        ${body.client_name || null},
        ${body.client_email || null},
        ${body.client_phone || null},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const project = result[0];
    
    const duration = Date.now() - startTime;
    
    logger.apiRequest({
      method: 'POST',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 200,
    });
    
    return createSuccessResponse({
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        start_date: project.start_date,
        end_date: project.end_date,
        budget: project.budget,
        client_name: project.client_name,
        client_email: project.client_email,
        client_phone: project.client_phone,
        lead_id: project.lead_id,
        created_at: project.created_at,
        updated_at: project.updated_at,
      },
      message: 'Tạo dự án thành công',
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Error creating project:', error);
    logger.apiRequest({
      method: 'POST',
      url: '/api/projects',
      requestId,
      duration,
      statusCode: 500,
      error: error instanceof Error ? error : undefined,
    });
    
    return createErrorResponse(
      'Không thể tạo dự án',
      ErrorCodes.DATABASE_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

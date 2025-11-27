// Project Management API Routes
// Handles CRUD operations for projects, tasks, and related entities

import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-supabase';
import type { Project } from '@/lib/types/project';

// GET - List all projects
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const lead_id = searchParams.get('lead_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    let projects = mockDb.projects.getAll();
    
    // Filter by status
    if (status) {
      projects = projects.filter(p => p.status === status);
    }
    
    // Filter by lead
    if (lead_id) {
      projects = projects.filter(p => p.lead_id === lead_id);
    }
    
    // Sort by updated_at desc
    projects.sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    
    // Pagination
    const total = projects.length;
    const start = (page - 1) * limit;
    const paginatedProjects = projects.slice(start, start + limit);
    
    // Add task counts
    const projectsWithCounts = paginatedProjects.map(project => {
      const tasks = mockDb.tasks.findByProjectId(project.id);
      const completedTasks = tasks.filter(t => t.status === 'done').length;
      
      return {
        ...project,
        task_count: tasks.length,
        completed_task_count: completedTasks,
        progress_percentage: tasks.length > 0 
          ? Math.round((completedTasks / tasks.length) * 100) 
          : 0,
      };
    });
    
    return NextResponse.json({
      success: true,
      data: projectsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách dự án' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Tên dự án là bắt buộc' },
        { status: 400 }
      );
    }
    
    const result = await mockDb.projects.insert({
      name: body.name,
      description: body.description || '',
      lead_id: body.lead_id,
      status: body.status || 'planning',
      priority: body.priority || 'medium',
      start_date: body.start_date,
      end_date: body.expected_completion || body.end_date,
      budget: body.budget,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone,
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Tạo dự án thành công',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo dự án' },
      { status: 500 }
    );
  }
}

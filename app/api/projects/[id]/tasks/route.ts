// Project Tasks API Routes
// Handles CRUD operations for tasks within a project

import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-supabase';
import type { ProjectTask, TaskStatus } from '@/lib/types/project';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List tasks for a project
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status') as TaskStatus | null;
    const assignee = searchParams.get('assignee');
    const priority = searchParams.get('priority');
    const groupBy = searchParams.get('groupBy') || 'status';
    
    // Check if project exists
    const project = mockDb.projects.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    let tasks = mockDb.tasks.findByProjectId(projectId);
    
    // Apply filters
    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }
    if (assignee) {
      tasks = tasks.filter(t => t.assigned_to === assignee);
    }
    if (priority) {
      tasks = tasks.filter(t => t.priority === priority);
    }
    
    // Sort by created_at desc
    tasks.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Group tasks if requested
    let groupedTasks: Record<string, ProjectTask[]> | null = null;
    if (groupBy === 'status') {
      groupedTasks = {
        todo: tasks.filter(t => t.status === 'todo'),
        in_progress: tasks.filter(t => t.status === 'in_progress'),
        review: tasks.filter(t => t.status === 'review'),
        done: tasks.filter(t => t.status === 'done'),
      };
    } else if (groupBy === 'priority') {
      groupedTasks = {
        urgent: tasks.filter(t => t.priority === 'urgent'),
        high: tasks.filter(t => t.priority === 'high'),
        medium: tasks.filter(t => t.priority === 'medium'),
        low: tasks.filter(t => t.priority === 'low'),
      };
    }
    
    return NextResponse.json({
      success: true,
      data: groupedTasks || tasks,
      meta: {
        total: tasks.length,
        grouped: !!groupedTasks,
        groupBy: groupBy,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách công việc' },
      { status: 500 }
    );
  }
}

// POST - Create new task
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    // Check if project exists
    const project = mockDb.projects.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    // Validation
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Tiêu đề công việc là bắt buộc' },
        { status: 400 }
      );
    }
    
    const result = await mockDb.tasks.insert({
      project_id: projectId,
      title: body.title,
      description: body.description || '',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      assigned_to: body.assigned_to,
      due_date: body.due_date,
    });
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Tạo công việc thành công',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo công việc' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update tasks (for drag & drop)
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    
    // Check if project exists
    const project = mockDb.projects.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    const { taskIds, updates } = body;
    
    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Danh sách công việc không hợp lệ' },
        { status: 400 }
      );
    }
    
    // Bulk update tasks
    const bulkUpdates = taskIds.map((taskId: string) => ({
      id: taskId,
      ...updates,
    }));
    
    const result = await mockDb.tasks.bulkUpdate(bulkUpdates);
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: `Cập nhật ${result.data?.length || 0} công việc thành công`,
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật công việc' },
      { status: 500 }
    );
  }
}

// Single Project API Routes
// Handles individual project operations

import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get project by ID with full details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const project = mockDb.projects.findById(id);
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    // Get related data
    const tasks = mockDb.tasks.findByProjectId(id);
    const milestones = mockDb.milestonesArray?.filter(m => m.project_id === id) || [];
    
    // Calculate statistics
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length,
    };
    
    const completedMilestones = milestones.filter(m => m.completed).length;
    
    return NextResponse.json({
      success: true,
      data: {
        ...project,
        tasks,
        milestones,
        stats: {
          tasks: taskStats,
          milestones: {
            total: milestones.length,
            completed: completedMilestones,
          },
          progress: tasks.length > 0 
            ? Math.round((taskStats.done / tasks.length) * 100) 
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải thông tin dự án' },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const existingProject = mockDb.projects.findById(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    const result = await mockDb.projects.update(id, body);
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Cập nhật dự án thành công',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật dự án' },
      { status: 500 }
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    const existingProject = mockDb.projects.findById(id);
    
    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy dự án' },
        { status: 404 }
      );
    }
    
    const result = await mockDb.projects.delete(id);
    
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Xóa dự án thành công',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa dự án' },
      { status: 500 }
    );
  }
}

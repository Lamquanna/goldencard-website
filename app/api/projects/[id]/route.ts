// Single Project API Routes
// Handles individual project operations

import { NextRequest, NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-supabase';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId, 
  ErrorCodes 
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get project by ID with full details
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const { id } = await params;

  try {
    logger.info('Fetching project by ID', { requestId, projectId: id });
    
    const project = mockDb.projects.findById(id);
    
    if (!project) {
      logger.warn('Project not found', { requestId, projectId: id });
      logger.apiRequest({
        method: 'GET',
        url: '/api/projects/[id]',
        statusCode: 404,
        duration: Date.now() - startTime,
        requestId
      });
      return createErrorResponse(
        'Không tìm thấy dự án',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
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
    
    const data = {
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
    };

    logger.info('Project fetched successfully', { 
      requestId, 
      projectId: id,
      taskCount: tasks.length,
      milestoneCount: milestones.length
    });
    
    logger.apiRequest({
      method: 'GET',
      url: '/api/projects/[id]',
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    });

    return createSuccessResponse(data, requestId);
  } catch (error: any) {
    logger.error('Error fetching project', { 
      requestId, 
      projectId: id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    logger.apiRequest({
      method: 'GET',
      url: '/api/projects/[id]',
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
      error: error instanceof Error ? error : undefined
    });

    return createErrorResponse(
      'Không thể tải thông tin dự án',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const { id } = await params;

  try {
    const body = await request.json();
    
    logger.info('Updating project', { requestId, projectId: id, updates: body });
    
    const existingProject = mockDb.projects.findById(id);
    
    if (!existingProject) {
      logger.warn('Project not found for update', { requestId, projectId: id });
      logger.apiRequest({
        method: 'PUT',
        url: '/api/projects/[id]',
        statusCode: 404,
        duration: Date.now() - startTime,
        requestId
      });
      return createErrorResponse(
        'Không tìm thấy dự án',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
      );
    }
    
    const result = await mockDb.projects.update(id, body);
    
    if (result.error) {
      logger.error('Error updating project', { 
        requestId, 
        projectId: id, 
        error: result.error.message 
      });
      logger.apiRequest({
        method: 'PUT',
        url: '/api/projects/[id]',
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId
      });
      return createErrorResponse(
        result.error.message,
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.info('Project updated successfully', { 
      requestId, 
      projectId: id 
    });
    
    logger.apiRequest({
      method: 'PUT',
      url: '/api/projects/[id]',
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    });

    return createSuccessResponse(
      result.data,
      requestId
    );
  } catch (error: any) {
    logger.error('Error updating project', { 
      requestId, 
      projectId: id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    logger.apiRequest({
      method: 'PUT',
      url: '/api/projects/[id]',
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
      error: error instanceof Error ? error : undefined
    });

    return createErrorResponse(
      'Không thể cập nhật dự án',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const { id } = await params;

  try {
    logger.info('Deleting project', { requestId, projectId: id });
    
    const existingProject = mockDb.projects.findById(id);
    
    if (!existingProject) {
      logger.warn('Project not found for deletion', { requestId, projectId: id });
      logger.apiRequest({
        method: 'DELETE',
        url: '/api/projects/[id]',
        statusCode: 404,
        duration: Date.now() - startTime,
        requestId
      });
      return createErrorResponse(
        'Không tìm thấy dự án',
        ErrorCodes.NOT_FOUND,
        404,
        undefined,
        requestId
      );
    }
    
    const result = await mockDb.projects.delete(id);
    
    if (result.error) {
      logger.error('Error deleting project', { 
        requestId, 
        projectId: id, 
        error: result.error.message 
      });
      logger.apiRequest({
        method: 'DELETE',
        url: '/api/projects/[id]',
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId
      });
      return createErrorResponse(
        result.error.message,
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
    
    logger.info('Project deleted successfully', { 
      requestId, 
      projectId: id 
    });
    
    logger.apiRequest({
      method: 'DELETE',
      url: '/api/projects/[id]',
      statusCode: 200,
      duration: Date.now() - startTime,
      requestId
    });

    return createSuccessResponse(
      null,
      requestId
    );
  } catch (error: any) {
    logger.error('Error deleting project', { 
      requestId, 
      projectId: id, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    logger.apiRequest({
      method: 'DELETE',
      url: '/api/projects/[id]',
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
      error: error instanceof Error ? error : undefined
    });

    return createErrorResponse(
      'Không thể xóa dự án',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

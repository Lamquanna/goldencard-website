import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAuth } from '@/lib/auth/middleware';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/projects
 * Projects analytics dashboard data
 * Query params: status, priority
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let statusFilter = '';
    let priorityFilter = '';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      statusFilter = `AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      priorityFilter = `AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Overall Project Statistics
    const projectStatsQuery = `
      SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as active_projects,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_projects,
        COUNT(CASE WHEN status = 'on-hold' THEN 1 END) as on_hold_projects,
        COUNT(CASE WHEN status = 'planning' THEN 1 END) as planning_projects,
        COUNT(CASE WHEN end_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_projects
      FROM projects
      WHERE 1=1 ${statusFilter} ${priorityFilter}
    `;

    const projectStats = await sql.query(projectStatsQuery, params);

    // Projects by Status
    const statusDistQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM projects
      WHERE 1=1 ${priorityFilter}
      GROUP BY status
      ORDER BY count DESC
    `;

    const statusDist = await sql.query(
      statusDistQuery,
      priority ? [priority] : []
    );

    // Projects by Priority
    const priorityDistQuery = `
      SELECT 
        priority,
        COUNT(*) as count
      FROM projects
      WHERE 1=1 ${statusFilter}
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
          ELSE 5
        END
    `;

    const priorityDist = await sql.query(
      priorityDistQuery,
      status ? [status] : []
    );

    // Task Statistics
    const taskStatsQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
        COUNT(CASE WHEN status = 'in-progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 END) as overdue_tasks
      FROM tasks
    `;

    let taskStats;
    try {
      taskStats = await sql.query(taskStatsQuery);
    } catch (error) {
      taskStats = { rows: [{ total_tasks: 0, completed_tasks: 0, in_progress_tasks: 0, todo_tasks: 0, overdue_tasks: 0 }] };
    }

    // Project Completion Rate by Month (last 6 months)
    const completionTrendQuery = `
      SELECT 
        DATE_TRUNC('month', updated_at)::date as month,
        COUNT(*) as completed_count
      FROM projects
      WHERE status = 'completed'
      AND updated_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', updated_at)
      ORDER BY month ASC
    `;

    const completionTrend = await sql.query(completionTrendQuery);

    // Recent Projects
    const recentProjectsQuery = `
      SELECT 
        id,
        name,
        status,
        priority,
        start_date,
        end_date,
        progress,
        budget
      FROM projects
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const recentProjects = await sql.query(recentProjectsQuery);

    // Projects with Budget Information
    const budgetStatsQuery = `
      SELECT 
        SUM(budget) as total_budget,
        AVG(budget) as avg_budget,
        COUNT(CASE WHEN budget > 0 THEN 1 END) as projects_with_budget
      FROM projects
      WHERE status != 'cancelled'
      ${statusFilter} ${priorityFilter}
    `;

    const budgetStats = await sql.query(budgetStatsQuery, params);

    // Team Member Distribution (if project_members table exists)
    const memberStatsQuery = `
      SELECT 
        COUNT(DISTINCT pm.user_id) as total_members,
        AVG(project_count) as avg_projects_per_member
      FROM (
        SELECT user_id, COUNT(*) as project_count
        FROM project_members
        GROUP BY user_id
      ) pm
    `;

    let memberStats;
    try {
      memberStats = await sql.query(memberStatsQuery);
    } catch (error) {
      memberStats = { rows: [{ total_members: 0, avg_projects_per_member: 0 }] };
    }

    // Projects Timeline (upcoming deadlines)
    const upcomingDeadlinesQuery = `
      SELECT 
        id,
        name,
        status,
        priority,
        end_date,
        progress
      FROM projects
      WHERE end_date >= CURRENT_DATE
      AND status NOT IN ('completed', 'cancelled')
      ORDER BY end_date ASC
      LIMIT 10
    `;

    const upcomingDeadlines = await sql.query(upcomingDeadlinesQuery);

    // Progress Distribution
    const progressDistQuery = `
      SELECT 
        CASE 
          WHEN progress = 0 THEN 'Not Started'
          WHEN progress > 0 AND progress < 25 THEN '1-25%'
          WHEN progress >= 25 AND progress < 50 THEN '25-50%'
          WHEN progress >= 50 AND progress < 75 THEN '50-75%'
          WHEN progress >= 75 AND progress < 100 THEN '75-99%'
          WHEN progress = 100 THEN 'Completed'
        END as progress_range,
        COUNT(*) as count
      FROM projects
      WHERE status NOT IN ('cancelled')
      GROUP BY progress_range
      ORDER BY 
        CASE progress_range
          WHEN 'Not Started' THEN 1
          WHEN '1-25%' THEN 2
          WHEN '25-50%' THEN 3
          WHEN '50-75%' THEN 4
          WHEN '75-99%' THEN 5
          WHEN 'Completed' THEN 6
        END
    `;

    const progressDist = await sql.query(progressDistQuery);

    // Calculate task completion rate
    const totalTasks = parseInt(taskStats.rows[0]?.total_tasks || '0');
    const completedTasks = parseInt(taskStats.rows[0]?.completed_tasks || '0');
    const taskCompletionRate = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100).toFixed(2)
      : '0';

    return createSuccessResponse({
      summary: {
        totalProjects: parseInt(projectStats.rows[0]?.total_projects || '0'),
        activeProjects: parseInt(projectStats.rows[0]?.active_projects || '0'),
        completedProjects: parseInt(projectStats.rows[0]?.completed_projects || '0'),
        onHoldProjects: parseInt(projectStats.rows[0]?.on_hold_projects || '0'),
        planningProjects: parseInt(projectStats.rows[0]?.planning_projects || '0'),
        overdueProjects: parseInt(projectStats.rows[0]?.overdue_projects || '0')
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: parseInt(taskStats.rows[0]?.in_progress_tasks || '0'),
        todo: parseInt(taskStats.rows[0]?.todo_tasks || '0'),
        overdue: parseInt(taskStats.rows[0]?.overdue_tasks || '0'),
        completionRate: parseFloat(taskCompletionRate)
      },
      budget: {
        total: parseFloat(budgetStats.rows[0]?.total_budget || '0'),
        average: parseFloat(budgetStats.rows[0]?.avg_budget || '0'),
        projectsWithBudget: parseInt(budgetStats.rows[0]?.projects_with_budget || '0')
      },
      team: {
        totalMembers: parseInt(memberStats.rows[0]?.total_members || '0'),
        avgProjectsPerMember: parseFloat(memberStats.rows[0]?.avg_projects_per_member || '0').toFixed(2)
      },
      byStatus: statusDist.rows.map(row => ({
        status: row.status,
        count: parseInt(row.count)
      })),
      byPriority: priorityDist.rows.map(row => ({
        priority: row.priority,
        count: parseInt(row.count)
      })),
      byProgress: progressDist.rows.map(row => ({
        range: row.progress_range,
        count: parseInt(row.count)
      })),
      completionTrend: completionTrend.rows.map(row => ({
        month: row.month,
        completed: parseInt(row.completed_count)
      })),
      recentProjects: recentProjects.rows.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status,
        priority: row.priority,
        startDate: row.start_date,
        endDate: row.end_date,
        progress: parseInt(row.progress || '0'),
        budget: parseFloat(row.budget || '0')
      })),
      upcomingDeadlines: upcomingDeadlines.rows.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status,
        priority: row.priority,
        endDate: row.end_date,
        progress: parseInt(row.progress || '0'),
        daysUntilDeadline: Math.ceil((new Date(row.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      })),
      generatedAt: new Date().toISOString()
    }, requestId);

  } catch (error: any) {
    logger.error('Error fetching projects analytics', error, { requestId });
    return createErrorResponse(
      'Failed to fetch projects analytics',
      ErrorCodes.DATABASE_ERROR,
      500,
      requestId
    );
  }
}

// ============================================================================
// DASHBOARD API - AGGREGATED DATA FETCHING
// GoldenEnergy HOME Platform - Dashboard API Helpers
// ============================================================================

import { api } from '@/core/api';
import type {
  TaskSummary,
  RecentActivity,
  KPIValue,
  DashboardLayout,
  DashboardPreferences,
  Widget,
  ActivityType,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface SystemOverviewData {
  totalEmployees: number;
  newLeadsToday: number;
  lowStockCount: number;
  pendingApprovals: number;
  revenueThisMonth: number;
  activeProjects: number;
}

export interface ModuleAnalyticsData {
  moduleId: string;
  trendData: Array<{ date: string; value: number }>;
  distributionData: Array<{ label: string; value: number }>;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  type: 'meeting' | 'task' | 'event' | 'reminder';
  moduleId?: string;
}

export interface DashboardOverviewResponse {
  systemOverview: SystemOverviewData;
  taskSummary: TaskSummary;
  recentActivities: RecentActivity[];
  upcomingEvents: CalendarEvent[];
}

// ============================================================================
// DASHBOARD API CLASS
// ============================================================================

class DashboardAPI {
  private basePath = '/api/dashboard';

  /**
   * Fetch all dashboard overview data in parallel
   * Uses Promise.all for batched requests
   */
  async fetchOverview(userId: string): Promise<DashboardOverviewResponse> {
    try {
      const [systemOverview, taskSummary, recentActivities, upcomingEvents] = 
        await Promise.all([
          this.fetchSystemOverview(),
          this.fetchTaskSummary(userId),
          this.fetchRecentActivities(20),
          this.fetchUpcomingEvents(userId, 7),
        ]);

      return {
        systemOverview,
        taskSummary,
        recentActivities,
        upcomingEvents,
      };
    } catch (error) {
      console.error('[DashboardAPI] fetchOverview failed:', error);
      throw error;
    }
  }

  /**
   * Fetch system overview KPIs
   * Aggregates data from multiple modules
   */
  async fetchSystemOverview(): Promise<SystemOverviewData> {
    try {
      return await api.get<SystemOverviewData>(`${this.basePath}/overview`);
    } catch {
      // Return mock data if endpoint unavailable
      return this.getMockSystemOverview();
    }
  }

  /**
   * Fetch task summary for a user
   */
  async fetchTaskSummary(userId: string): Promise<TaskSummary> {
    try {
      return await api.get<TaskSummary>(`${this.basePath}/tasks/summary?userId=${userId}`);
    } catch {
      return this.getMockTaskSummary();
    }
  }

  /**
   * Fetch recent activities from audit log
   */
  async fetchRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
    try {
      const response = await api.get<{ data: RecentActivity[] }>(
        `${this.basePath}/activities?limit=${limit}`
      );
      return response.data || [];
    } catch {
      return this.getMockRecentActivities();
    }
  }

  /**
   * Fetch upcoming calendar events
   */
  async fetchUpcomingEvents(userId: string, days: number = 7): Promise<CalendarEvent[]> {
    try {
      return await api.get<CalendarEvent[]>(
        `${this.basePath}/calendar/upcoming?userId=${userId}&days=${days}`
      );
    } catch {
      return this.getMockUpcomingEvents();
    }
  }

  /**
   * Fetch module-specific analytics
   */
  async fetchModuleAnalytics(
    moduleId: string,
    timeRange: '7d' | '30d' | '90d' = '30d'
  ): Promise<ModuleAnalyticsData> {
    try {
      return await api.get<ModuleAnalyticsData>(
        `${this.basePath}/analytics/${moduleId}?range=${timeRange}`
      );
    } catch {
      return this.getMockModuleAnalytics(moduleId);
    }
  }

  /**
   * Fetch KPI values
   */
  async fetchKPIs(): Promise<KPIValue[]> {
    try {
      return await api.get<KPIValue[]>(`${this.basePath}/kpis`);
    } catch {
      return this.getMockKPIs();
    }
  }

  /**
   * Save dashboard layout
   */
  async saveLayout(layout: DashboardLayout): Promise<DashboardLayout> {
    return api.put<DashboardLayout>(`${this.basePath}/layouts/${layout.id}`, layout);
  }

  /**
   * Save user preferences
   */
  async savePreferences(preferences: DashboardPreferences): Promise<DashboardPreferences> {
    return api.put<DashboardPreferences>(`${this.basePath}/preferences`, preferences);
  }

  /**
   * Save widget configuration
   */
  async saveWidget(widget: Widget): Promise<Widget> {
    return api.put<Widget>(`${this.basePath}/widgets/${widget.id}`, widget);
  }

  // ============================================================================
  // MOCK DATA (fallback when API unavailable)
  // ============================================================================

  private getMockSystemOverview(): SystemOverviewData {
    return {
      totalEmployees: 48,
      newLeadsToday: 12,
      lowStockCount: 5,
      pendingApprovals: 8,
      revenueThisMonth: 285000000,
      activeProjects: 15,
    };
  }

  private getMockTaskSummary(): TaskSummary {
    return {
      total: 24,
      overdue: 3,
      dueToday: 5,
      upcoming: 12,
      completed: 4,
      byPriority: {
        urgent: 2,
        high: 6,
        medium: 10,
        low: 6,
      },
      byStatus: {
        todo: 8,
        in_progress: 10,
        review: 4,
        done: 2,
      },
    };
  }

  private getMockRecentActivities(): RecentActivity[] {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'lead_converted' as ActivityType,
        actor: {
          id: 'user-1',
          name: 'Nguyễn Văn A',
          avatar: '/Team/member-1.jpg',
        },
        action: 'đã tạo',
        target: {
          type: 'lead',
          id: 'lead-1',
          name: 'Công ty ABC',
        },
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      },
      {
        id: '2',
        type: 'task_completed' as ActivityType,
        actor: {
          id: 'user-2',
          name: 'Trần Thị B',
          avatar: '/Team/member-2.jpg',
        },
        action: 'đã hoàn thành',
        target: {
          type: 'task',
          id: 'task-1',
          name: 'Review thiết kế UI',
        },
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      },
      {
        id: '3',
        type: 'employee_joined' as ActivityType,
        actor: {
          id: 'user-3',
          name: 'Lê Văn C',
          avatar: '/Team/member-3.jpg',
        },
        action: 'đã phê duyệt',
        target: {
          type: 'leave_request',
          id: 'leave-1',
          name: 'Nghỉ phép 3 ngày',
        },
        timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      },
      {
        id: '4',
        type: 'invoice_sent' as ActivityType,
        actor: {
          id: 'user-1',
          name: 'Nguyễn Văn A',
          avatar: '/Team/member-1.jpg',
        },
        action: 'đã cập nhật',
        target: {
          type: 'invoice',
          id: 'inv-1',
          name: 'Hóa đơn #INV-2024-001',
        },
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      },
      {
        id: '5',
        type: 'file_uploaded' as ActivityType,
        actor: {
          id: 'user-4',
          name: 'Phạm Thị D',
          avatar: '/Team/member-4.jpg',
        },
        action: 'đã tạo',
        target: {
          type: 'product',
          id: 'prod-1',
          name: 'Pin năng lượng mặt trời 500W',
        },
        timestamp: new Date(now.getTime() - 60 * 60000).toISOString(),
      },
    ];
  }

  private getMockUpcomingEvents(): CalendarEvent[] {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60000);
    
    return [
      {
        id: 'evt-1',
        title: 'Họp team dự án Solar Farm',
        start: new Date(now.getTime() + 2 * 60 * 60000).toISOString(),
        end: new Date(now.getTime() + 3 * 60 * 60000).toISOString(),
        type: 'meeting',
        moduleId: 'projects',
      },
      {
        id: 'evt-2',
        title: 'Review báo cáo tài chính Q4',
        start: tomorrow.toISOString(),
        end: new Date(tomorrow.getTime() + 60 * 60000).toISOString(),
        type: 'task',
        moduleId: 'finance',
      },
      {
        id: 'evt-3',
        title: 'Demo sản phẩm cho khách hàng',
        start: dayAfter.toISOString(),
        end: new Date(dayAfter.getTime() + 2 * 60 * 60000).toISOString(),
        type: 'meeting',
        moduleId: 'crm',
      },
    ];
  }

  private getMockModuleAnalytics(moduleId: string): ModuleAnalyticsData {
    const days = 30;
    const trendData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50,
      };
    });

    const distributionLabels: Record<string, string[]> = {
      crm: ['Mới', 'Đang theo dõi', 'Đàm phán', 'Thành công', 'Thất bại'],
      hrm: ['Toàn thời gian', 'Bán thời gian', 'Hợp đồng', 'Thực tập'],
      projects: ['Chưa bắt đầu', 'Đang thực hiện', 'Review', 'Hoàn thành'],
      inventory: ['Còn hàng', 'Sắp hết', 'Hết hàng', 'Đặt trước'],
      finance: ['Chờ thanh toán', 'Đã thanh toán', 'Quá hạn', 'Hủy bỏ'],
    };

    const labels = distributionLabels[moduleId] || ['A', 'B', 'C', 'D'];
    const distributionData = labels.map((label) => ({
      label,
      value: Math.floor(Math.random() * 50) + 10,
    }));

    return {
      moduleId,
      trendData,
      distributionData,
    };
  }

  private getMockKPIs(): KPIValue[] {
    const now = new Date().toISOString();
    return [
      {
        kpiId: 'kpi-employees',
        value: 48,
        previousValue: 45,
        change: 3,
        changePercent: 6.67,
        trend: 'up',
        status: 'success',
        timestamp: now,
      },
      {
        kpiId: 'kpi-leads',
        value: 12,
        previousValue: 8,
        change: 4,
        changePercent: 50,
        trend: 'up',
        status: 'success',
        timestamp: now,
      },
      {
        kpiId: 'kpi-lowstock',
        value: 5,
        previousValue: 3,
        change: 2,
        changePercent: 66.67,
        trend: 'up',
        status: 'warning',
        timestamp: now,
      },
      {
        kpiId: 'kpi-approvals',
        value: 8,
        previousValue: 12,
        change: -4,
        changePercent: -33.33,
        trend: 'down',
        status: 'success',
        timestamp: now,
      },
      {
        kpiId: 'kpi-revenue',
        value: 285000000,
        previousValue: 250000000,
        change: 35000000,
        changePercent: 14,
        trend: 'up',
        status: 'success',
        timestamp: now,
      },
      {
        kpiId: 'kpi-projects',
        value: 15,
        previousValue: 12,
        change: 3,
        changePercent: 25,
        trend: 'up',
        status: 'success',
        timestamp: now,
      },
    ];
  }
}

// Singleton instance
export const dashboardAPI = new DashboardAPI();

// Export class for testing
export { DashboardAPI };

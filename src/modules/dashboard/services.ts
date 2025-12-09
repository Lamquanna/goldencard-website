// ============================================================================
// DASHBOARD HOME MODULE - API SERVICES
// GoldenEnergy HOME Platform - Dashboard API Layer
// ============================================================================

import { api, type QueryParams, type PaginatedResponse } from '@/core/api';
import type {
  Widget,
  DashboardLayout,
  TaskSummary,
  RecentActivity,
  DashboardNotification,
  KPIValue,
  KPIDefinition,
  QuickReport,
  DashboardPreferences,
  DashboardFilter,
  CreateWidgetDto,
  UpdateWidgetDto,
  CreateLayoutDto,
  UpdateLayoutDto,
  UpdatePreferencesDto,
} from './types';

// ============================================================================
// DASHBOARD SERVICE
// ============================================================================

export class DashboardService {
  private basePath = '/dashboard';

  /**
   * Get dashboard overview data
   */
  async getOverview(filter?: DashboardFilter): Promise<{
    taskSummary: TaskSummary;
    recentActivities: RecentActivity[];
    kpiValues: KPIValue[];
  }> {
    return api.post<{
      taskSummary: TaskSummary;
      recentActivities: RecentActivity[];
      kpiValues: KPIValue[];
    }>(`${this.basePath}/overview`, filter);
  }

  /**
   * Get task summary
   */
  async getTaskSummary(userId?: string): Promise<TaskSummary> {
    const params = userId ? `?userId=${userId}` : '';
    return api.get<TaskSummary>(`${this.basePath}/tasks/summary${params}`);
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(params?: QueryParams): Promise<PaginatedResponse<RecentActivity>> {
    const queryString = params
      ? `?page=${params.page || 1}&limit=${params.limit || 20}`
      : '';
    return api.get<PaginatedResponse<RecentActivity>>(
      `${this.basePath}/activities${queryString}`
    );
  }

  /**
   * Refresh all dashboard data
   */
  async refresh(filter?: DashboardFilter): Promise<void> {
    return api.post(`${this.basePath}/refresh`, filter);
  }
}

// ============================================================================
// LAYOUT SERVICE
// ============================================================================

export class LayoutService {
  private basePath = '/dashboard/layouts';

  /**
   * Get all layouts for current user
   */
  async getAll(): Promise<DashboardLayout[]> {
    return api.get<DashboardLayout[]>(this.basePath);
  }

  /**
   * Get layout by ID
   */
  async getById(id: string): Promise<DashboardLayout> {
    return api.get<DashboardLayout>(`${this.basePath}/${id}`);
  }

  /**
   * Get default layout
   */
  async getDefault(): Promise<DashboardLayout> {
    return api.get<DashboardLayout>(`${this.basePath}/default`);
  }

  /**
   * Get system layouts (templates)
   */
  async getSystemLayouts(): Promise<DashboardLayout[]> {
    return api.get<DashboardLayout[]>(`${this.basePath}/system`);
  }

  /**
   * Create layout
   */
  async create(dto: CreateLayoutDto): Promise<DashboardLayout> {
    return api.post<DashboardLayout>(this.basePath, dto);
  }

  /**
   * Update layout
   */
  async update(id: string, dto: UpdateLayoutDto): Promise<DashboardLayout> {
    return api.put<DashboardLayout>(`${this.basePath}/${id}`, dto);
  }

  /**
   * Delete layout
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${this.basePath}/${id}`);
  }

  /**
   * Set layout as default
   */
  async setDefault(id: string): Promise<DashboardLayout> {
    return api.patch<DashboardLayout>(`${this.basePath}/${id}/default`);
  }

  /**
   * Duplicate layout
   */
  async duplicate(id: string, name: string): Promise<DashboardLayout> {
    return api.post<DashboardLayout>(`${this.basePath}/${id}/duplicate`, { name });
  }

  /**
   * Lock/unlock layout
   */
  async toggleLock(id: string): Promise<DashboardLayout> {
    return api.patch<DashboardLayout>(`${this.basePath}/${id}/lock`);
  }

  /**
   * Save widget positions
   */
  async saveWidgetPositions(
    id: string,
    widgets: Array<{ id: string; position: Widget['position'] }>
  ): Promise<void> {
    return api.patch(`${this.basePath}/${id}/positions`, { widgets });
  }
}

// ============================================================================
// WIDGET SERVICE
// ============================================================================

export class WidgetService {
  private basePath = '/dashboard/widgets';

  /**
   * Get all available widget types
   */
  async getAvailableTypes(): Promise<
    Array<{
      type: string;
      name: string;
      description: string;
      icon: string;
      defaultConfig: Record<string, unknown>;
    }>
  > {
    return api.get<
      Array<{
        type: string;
        name: string;
        description: string;
        icon: string;
        defaultConfig: Record<string, unknown>;
      }>
    >(`${this.basePath}/types`);
  }

  /**
   * Get widget data
   */
  async getWidgetData(widgetId: string, config: Widget['config']): Promise<unknown> {
    return api.post<unknown>(`${this.basePath}/${widgetId}/data`, config);
  }

  /**
   * Add widget to layout
   */
  async addToLayout(layoutId: string, dto: CreateWidgetDto): Promise<Widget> {
    return api.post<Widget>(`/dashboard/layouts/${layoutId}/widgets`, dto);
  }

  /**
   * Update widget
   */
  async update(layoutId: string, widgetId: string, dto: UpdateWidgetDto): Promise<Widget> {
    return api.put<Widget>(`/dashboard/layouts/${layoutId}/widgets/${widgetId}`, dto);
  }

  /**
   * Remove widget from layout
   */
  async removeFromLayout(layoutId: string, widgetId: string): Promise<void> {
    return api.delete(`/dashboard/layouts/${layoutId}/widgets/${widgetId}`);
  }

  /**
   * Refresh widget data
   */
  async refresh(widgetId: string): Promise<unknown> {
    return api.post<unknown>(`${this.basePath}/${widgetId}/refresh`);
  }
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class DashboardNotificationService {
  private basePath = '/dashboard/notifications';

  /**
   * Get notifications
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<DashboardNotification>> {
    const queryString = params
      ? `?page=${params.page || 1}&limit=${params.limit || 50}`
      : '';
    return api.get<PaginatedResponse<DashboardNotification>>(`${this.basePath}${queryString}`);
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return api.get<{ count: number }>(`${this.basePath}/unread/count`);
  }

  /**
   * Mark as read
   */
  async markAsRead(id: string): Promise<DashboardNotification> {
    return api.patch<DashboardNotification>(`${this.basePath}/${id}/read`);
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    return api.patch(`${this.basePath}/read-all`);
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${this.basePath}/${id}`);
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<void> {
    return api.delete(`${this.basePath}/read`);
  }
}

// ============================================================================
// KPI SERVICE
// ============================================================================

export class KPIService {
  private basePath = '/dashboard/kpis';

  /**
   * Get KPI definitions
   */
  async getDefinitions(): Promise<KPIDefinition[]> {
    return api.get<KPIDefinition[]>(`${this.basePath}/definitions`);
  }

  /**
   * Get KPI values
   */
  async getValues(kpiIds?: string[]): Promise<KPIValue[]> {
    const params = kpiIds?.length ? `?ids=${kpiIds.join(',')}` : '';
    return api.get<KPIValue[]>(`${this.basePath}/values${params}`);
  }

  /**
   * Get KPI history
   */
  async getHistory(
    kpiId: string,
    period: 'day' | 'week' | 'month' | 'quarter' | 'year'
  ): Promise<Array<{ date: string; value: number }>> {
    return api.get<Array<{ date: string; value: number }>>(
      `${this.basePath}/${kpiId}/history?period=${period}`
    );
  }

  /**
   * Refresh KPI value
   */
  async refresh(kpiId: string): Promise<KPIValue> {
    return api.post<KPIValue>(`${this.basePath}/${kpiId}/refresh`);
  }
}

// ============================================================================
// QUICK REPORT SERVICE
// ============================================================================

export class QuickReportService {
  private basePath = '/dashboard/reports';

  /**
   * Get available quick reports
   */
  async getAll(): Promise<QuickReport[]> {
    return api.get<QuickReport[]>(this.basePath);
  }

  /**
   * Run quick report
   */
  async run(reportId: string, params?: Record<string, unknown>): Promise<{
    data: unknown;
    generatedAt: string;
  }> {
    return api.post<{ data: unknown; generatedAt: string }>(
      `${this.basePath}/${reportId}/run`,
      params
    );
  }

  /**
   * Export quick report
   */
  async export(
    reportId: string,
    format: 'pdf' | 'excel' | 'csv',
    params?: Record<string, unknown>
  ): Promise<Blob> {
    return api.post<Blob>(
      `${this.basePath}/${reportId}/export`,
      { format, ...params },
      { responseType: 'blob' }
    );
  }

  /**
   * Schedule quick report
   */
  async schedule(
    reportId: string,
    schedule: QuickReport['schedule']
  ): Promise<QuickReport> {
    return api.patch<QuickReport>(`${this.basePath}/${reportId}/schedule`, schedule);
  }
}

// ============================================================================
// PREFERENCE SERVICE
// ============================================================================

export class PreferenceService {
  private basePath = '/dashboard/preferences';

  /**
   * Get user preferences
   */
  async get(): Promise<DashboardPreferences> {
    return api.get<DashboardPreferences>(this.basePath);
  }

  /**
   * Update preferences
   */
  async update(dto: UpdatePreferencesDto): Promise<DashboardPreferences> {
    return api.patch<DashboardPreferences>(this.basePath, dto);
  }

  /**
   * Reset preferences to defaults
   */
  async reset(): Promise<DashboardPreferences> {
    return api.post<DashboardPreferences>(`${this.basePath}/reset`);
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const dashboardService = new DashboardService();
export const layoutService = new LayoutService();
export const widgetService = new WidgetService();
export const dashboardNotificationService = new DashboardNotificationService();
export const kpiService = new KPIService();
export const quickReportService = new QuickReportService();
export const preferenceService = new PreferenceService();

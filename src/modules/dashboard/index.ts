// ============================================================================
// DASHBOARD HOME MODULE - INDEX (BARREL EXPORTS)
// GoldenEnergy HOME Platform - Dashboard Module Entry Point
// ============================================================================

// Types
export * from './types';

// Store
export {
  useDashboardStore,
  selectCurrentLayout,
  selectVisibleWidgets,
  selectWidgetById,
  selectWidgetData,
  selectIsWidgetLoading,
  selectUnreadNotifications,
  selectNotificationsByCategory,
  selectKPIValue,
  selectIsEditMode,
  selectPinnedActions,
} from './store';

// Services
export {
  DashboardService,
  LayoutService,
  WidgetService,
  DashboardNotificationService,
  KPIService,
  QuickReportService,
  PreferenceService,
  dashboardService,
  layoutService,
  widgetService,
  dashboardNotificationService,
  kpiService,
  quickReportService,
  preferenceService,
} from './services';

// API Helpers
export { dashboardAPI, DashboardAPI } from './api';
export type { SystemOverviewData, ModuleAnalyticsData, CalendarEvent } from './api';

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================

export interface ModuleConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  permissions: string[];
  routes: Array<{
    path: string;
    name: string;
    icon: string;
    permission?: string;
  }>;
  initialize?: () => Promise<boolean>;
  cleanup?: () => Promise<void>;
}

export const moduleConfig: ModuleConfig = {
  id: 'dashboard',
  name: 'Dashboard',
  description: 'Trang chủ và bảng điều khiển tổng quan',
  version: '1.0.0',
  dependencies: ['core'],
  permissions: [
    'dashboard:view',
    'dashboard:customize',
    'dashboard:admin',
    'widget:add',
    'widget:edit',
    'widget:delete',
    'layout:create',
    'layout:edit',
    'layout:delete',
    'kpi:view',
    'report:view',
    'report:export',
  ],
  routes: [
    {
      path: '/dashboard',
      name: 'Trang chủ',
      icon: 'Home',
      permission: 'dashboard:view',
    },
    {
      path: '/dashboard/customize',
      name: 'Tùy chỉnh Dashboard',
      icon: 'Settings',
      permission: 'dashboard:customize',
    },
    {
      path: '/dashboard/widgets',
      name: 'Quản lý Widget',
      icon: 'LayoutGrid',
      permission: 'dashboard:admin',
    },
    {
      path: '/dashboard/reports',
      name: 'Báo cáo nhanh',
      icon: 'FileBarChart',
      permission: 'report:view',
    },
  ],
  initialize: async () => {
    console.log('[Dashboard Module] Initializing...');
    // Initialization logic will be added here
    return true;
  },
  cleanup: async () => {
    console.log('[Dashboard Module] Cleaning up...');
    // Cleanup logic will be added here
  },
};

export default moduleConfig;

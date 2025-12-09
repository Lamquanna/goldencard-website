// ============================================================================
// DASHBOARD HOME MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Dashboard Types
// ============================================================================

// ============================================================================
// WIDGET TYPES
// ============================================================================

/** Widget size */
export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

/** Widget position */
export interface WidgetPosition {
  x: number;
  y: number;
  w: number; // width in grid units
  h: number; // height in grid units
}

/** Base widget configuration */
export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  description?: string;
  size: WidgetSize;
  position: WidgetPosition;
  config: WidgetConfig;
  isVisible: boolean;
  refreshInterval?: number; // in seconds
  lastRefreshed?: string;
  permissions?: string[];
}

/** Widget types available */
export type WidgetType =
  | 'task_summary'
  | 'notification_feed'
  | 'quick_actions'
  | 'calendar_preview'
  | 'recent_activities'
  | 'kpi_card'
  | 'chart'
  | 'table'
  | 'metric'
  | 'progress'
  | 'countdown'
  | 'weather'
  | 'clock'
  | 'notes'
  | 'shortcuts'
  | 'team_status'
  | 'project_overview'
  | 'sales_funnel'
  | 'revenue_chart'
  | 'custom';

/** Widget configuration based on type */
export type WidgetConfig =
  | TaskSummaryConfig
  | NotificationFeedConfig
  | QuickActionsConfig
  | CalendarPreviewConfig
  | KPICardConfig
  | ChartConfig
  | TableConfig
  | MetricConfig
  | CustomWidgetConfig;

/** Task summary widget config */
export interface TaskSummaryConfig {
  type: 'task_summary';
  showOverdue: boolean;
  showDueToday: boolean;
  showUpcoming: boolean;
  upcomingDays: number;
  filterByAssignee?: string;
  filterByProject?: string;
  maxItems: number;
}

/** Notification feed widget config */
export interface NotificationFeedConfig {
  type: 'notification_feed';
  categories: string[];
  showUnreadOnly: boolean;
  maxItems: number;
  showTimestamp: boolean;
}

/** Quick actions widget config */
export interface QuickActionsConfig {
  type: 'quick_actions';
  actions: QuickAction[];
  layout: 'grid' | 'list';
  showLabels: boolean;
}

/** Calendar preview widget config */
export interface CalendarPreviewConfig {
  type: 'calendar_preview';
  view: 'day' | 'week' | 'agenda';
  showAllDay: boolean;
  calendars: string[];
  maxEvents: number;
}

/** KPI card widget config */
export interface KPICardConfig {
  type: 'kpi_card';
  metric: string;
  source: string;
  format: 'number' | 'currency' | 'percentage';
  comparison?: {
    enabled: boolean;
    period: 'day' | 'week' | 'month' | 'year';
  };
  thresholds?: {
    warning: number;
    danger: number;
  };
  trend?: boolean;
}

/** Chart widget config */
export interface ChartConfig {
  type: 'chart';
  chartType: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'radar';
  dataSource: string;
  xAxis?: string;
  yAxis?: string | string[];
  colors?: string[];
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
}

/** Table widget config */
export interface TableConfig {
  type: 'table';
  dataSource: string;
  columns: TableColumn[];
  sortable: boolean;
  pagination: boolean;
  pageSize: number;
  showSearch: boolean;
}

/** Table column definition */
export interface TableColumn {
  key: string;
  label: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'date' | 'status';
  sortable?: boolean;
}

/** Metric widget config */
export interface MetricConfig {
  type: 'metric';
  value: string;
  label: string;
  icon?: string;
  color?: string;
  suffix?: string;
  prefix?: string;
  format?: 'number' | 'currency' | 'percentage';
}

/** Custom widget config */
export interface CustomWidgetConfig {
  type: 'custom';
  component: string;
  props?: Record<string, unknown>;
}

// ============================================================================
// QUICK ACTION TYPES
// ============================================================================

/** Quick action */
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: QuickActionType;
  params?: Record<string, unknown>;
  permission?: string;
  color?: string;
  shortcut?: string;
}

/** Quick action types */
export type QuickActionType =
  | 'navigate'
  | 'modal'
  | 'api_call'
  | 'workflow'
  | 'command';

// ============================================================================
// DASHBOARD LAYOUT TYPES
// ============================================================================

/** Dashboard layout */
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  userId?: string; // null for system/default layouts
  isDefault: boolean;
  isLocked: boolean;
  widgets: Widget[];
  gridConfig: GridConfig;
  createdAt: string;
  updatedAt: string;
}

/** Grid configuration */
export interface GridConfig {
  columns: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
  breakpoints: Record<string, number>;
  cols: Record<string, number>;
  compactType: 'vertical' | 'horizontal' | null;
  preventCollision: boolean;
  isDraggable: boolean;
  isResizable: boolean;
}

/** Default grid configuration */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  columns: 12,
  rowHeight: 100,
  margin: [16, 16],
  containerPadding: [16, 16],
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  compactType: 'vertical',
  preventCollision: false,
  isDraggable: true,
  isResizable: true,
};

// ============================================================================
// TASK & ACTIVITY TYPES
// ============================================================================

/** Task summary */
export interface TaskSummary {
  total: number;
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
  byPriority: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  byStatus: Record<string, number>;
}

/** Recent activity */
export interface RecentActivity {
  id: string;
  type: ActivityType;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  action: string;
  target?: {
    type: string;
    id: string;
    name: string;
  };
  metadata?: Record<string, unknown>;
  timestamp: string;
}

/** Activity types */
export type ActivityType =
  | 'task_created'
  | 'task_completed'
  | 'task_assigned'
  | 'comment_added'
  | 'file_uploaded'
  | 'project_created'
  | 'lead_converted'
  | 'deal_won'
  | 'invoice_sent'
  | 'payment_received'
  | 'employee_joined'
  | 'leave_approved'
  | 'system';

// ============================================================================
// NOTIFICATION TYPES FOR DASHBOARD
// ============================================================================

/** Dashboard notification */
export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
  expiresAt?: string;
}

/** Notification types */
export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'task'
  | 'mention'
  | 'assignment'
  | 'reminder'
  | 'system';

/** Notification categories */
export type NotificationCategory =
  | 'general'
  | 'tasks'
  | 'projects'
  | 'crm'
  | 'hrm'
  | 'finance'
  | 'inventory'
  | 'system';

// ============================================================================
// KPI & METRICS TYPES
// ============================================================================

/** KPI definition */
export interface KPIDefinition {
  id: string;
  name: string;
  description?: string;
  category: string;
  dataSource: string;
  calculation: string;
  unit: string;
  format: 'number' | 'currency' | 'percentage';
  target?: number;
  thresholds?: {
    warning: number;
    danger: number;
  };
  trend?: 'higher_better' | 'lower_better' | 'neutral';
}

/** KPI value */
export interface KPIValue {
  kpiId: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger';
  timestamp: string;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

/** Quick report */
export interface QuickReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  module: string;
  params?: Record<string, unknown>;
  schedule?: ReportSchedule;
  lastRun?: string;
  permissions?: string[];
}

/** Report types */
export type ReportType =
  | 'summary'
  | 'detailed'
  | 'comparison'
  | 'trend'
  | 'distribution';

/** Report schedule */
export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
}

// ============================================================================
// FILTER & PREFERENCE TYPES
// ============================================================================

/** Dashboard filter */
export interface DashboardFilter {
  dateRange: DateRange;
  departments?: string[];
  projects?: string[];
  users?: string[];
}

/** Date range */
export interface DateRange {
  start: string;
  end: string;
  preset?: DateRangePreset;
}

/** Date range presets */
export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'custom';

/** User dashboard preferences */
export interface DashboardPreferences {
  userId: string;
  defaultLayoutId: string;
  refreshInterval: number; // in seconds
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showWelcomeMessage: boolean;
  favoriteWidgets: string[];
  pinnedActions: string[];
  hiddenNotificationCategories: NotificationCategory[];
}

// ============================================================================
// DTO TYPES
// ============================================================================

/** Create widget DTO */
export interface CreateWidgetDto {
  type: WidgetType;
  title: string;
  description?: string;
  size?: WidgetSize;
  config: WidgetConfig;
  position?: Partial<WidgetPosition>;
}

/** Update widget DTO */
export interface UpdateWidgetDto {
  title?: string;
  description?: string;
  size?: WidgetSize;
  config?: Partial<WidgetConfig>;
  position?: Partial<WidgetPosition>;
  isVisible?: boolean;
  refreshInterval?: number;
}

/** Create layout DTO */
export interface CreateLayoutDto {
  name: string;
  description?: string;
  widgets?: CreateWidgetDto[];
  gridConfig?: Partial<GridConfig>;
  isDefault?: boolean;
}

/** Update layout DTO */
export interface UpdateLayoutDto {
  name?: string;
  description?: string;
  gridConfig?: Partial<GridConfig>;
  isDefault?: boolean;
  isLocked?: boolean;
}

/** Update preferences DTO */
export interface UpdatePreferencesDto {
  defaultLayoutId?: string;
  refreshInterval?: number;
  theme?: 'light' | 'dark' | 'system';
  compactMode?: boolean;
  showWelcomeMessage?: boolean;
  favoriteWidgets?: string[];
  pinnedActions?: string[];
  hiddenNotificationCategories?: NotificationCategory[];
}

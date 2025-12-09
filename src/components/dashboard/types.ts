// ============================================================================
// DASHBOARD HOME COMPONENTS - TYPE DEFINITIONS
// GoldenEnergy HOME Platform
// ============================================================================

import type { ReactNode } from 'react';
import type { 
  RecentActivity, 
  DashboardNotification, 
  KPIValue,
  QuickAction,
  TaskSummary 
} from '@/src/modules/dashboard/types';

// ============================================================================
// SUMMARY CARD TYPES
// ============================================================================

export type SummaryCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: SummaryCardVariant;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// CHART CARD TYPES
// ============================================================================

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'sparkline';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  chartType: ChartType;
  data: ChartDataPoint[] | ChartSeries[];
  labels?: string[];
  height?: number;
  showLegend?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// ============================================================================
// TASK LIST TYPES
// ============================================================================

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface TaskListProps {
  tasks: TaskItem[];
  title?: string;
  maxItems?: number;
  showPriority?: boolean;
  showAssignee?: boolean;
  showProject?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onTaskClick?: (task: TaskItem) => void;
  onViewAll?: () => void;
  className?: string;
}

// ============================================================================
// ACTIVITY FEED TYPES
// ============================================================================

export type ActivityModule = 'crm' | 'hrm' | 'projects' | 'inventory' | 'finance' | 'system';

export interface ActivityItem {
  id: string;
  type: string;
  module: ActivityModule;
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

export interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  groupByTime?: boolean;
  moduleFilter?: ActivityModule[];
  loading?: boolean;
  emptyMessage?: string;
  onActivityClick?: (activity: ActivityItem) => void;
  onViewAll?: () => void;
  onFilterChange?: (modules: ActivityModule[]) => void;
  className?: string;
}

// ============================================================================
// QUICK ACTIONS TYPES
// ============================================================================

export interface QuickActionItem {
  id: string;
  label: string;
  icon: ReactNode;
  description?: string;
  shortcut?: string;
  color?: string;
  permission?: string;
  onClick: () => void;
}

export interface QuickActionsProps {
  actions: QuickActionItem[];
  title?: string;
  layout?: 'grid' | 'list';
  columns?: 2 | 3 | 4;
  showLabels?: boolean;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// WIDGET WRAPPER TYPES
// ============================================================================

export interface WidgetWrapperProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onSettings?: () => void;
  children: ReactNode;
  className?: string;
  draggable?: boolean;
}

// ============================================================================
// DASHBOARD SECTION TYPES
// ============================================================================

export interface DashboardSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// ============================================================================
// KPI TYPES
// ============================================================================

export interface KPICardData {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number;
  format: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'danger';
  icon?: ReactNode;
  module: string;
  permission?: string;
}

// ============================================================================
// NOTIFICATION PANEL TYPES
// ============================================================================

export interface NotificationPanelProps {
  notifications: DashboardNotification[];
  unreadCount: number;
  maxItems?: number;
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onNotificationClick?: (notification: DashboardNotification) => void;
  onViewAll?: () => void;
  className?: string;
}

// ============================================================================
// CALENDAR PREVIEW TYPES
// ============================================================================

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  color?: string;
  type?: string;
}

export interface CalendarPreviewProps {
  events: CalendarEvent[];
  title?: string;
  view?: 'day' | 'week' | 'agenda';
  maxEvents?: number;
  loading?: boolean;
  emptyMessage?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onViewAll?: () => void;
  className?: string;
}

// ============================================================================
// PROGRESS WIDGET TYPES
// ============================================================================

export interface ProgressItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export interface ProgressWidgetProps {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
  showPercentage?: boolean;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// STATS COMPARISON TYPES
// ============================================================================

export interface ComparisonItem {
  id: string;
  label: string;
  current: number;
  previous: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface StatsComparisonProps {
  title: string;
  period: string;
  previousPeriod: string;
  items: ComparisonItem[];
  loading?: boolean;
  className?: string;
}

// ============================================================================
// TEAM OVERVIEW TYPES
// ============================================================================

export type TeamMemberStatus = 'online' | 'away' | 'busy' | 'offline';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department?: string;
  status: TeamMemberStatus;
  currentTask?: string;
  lastActive?: Date;
}

export interface TeamOverviewProps {
  title?: string;
  members: TeamMember[];
  showCurrentTask?: boolean;
  maxDisplay?: number;
  loading?: boolean;
  className?: string;
  onMemberClick?: (member: TeamMember) => void;
}

// ============================================================================
// NOTIFICATION ITEM TYPES (Extended)
// ============================================================================

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  category?: string;
  actionUrl?: string;
}

// ============================================================================
// SUMMARY CARD DATA (for useModuleData)
// ============================================================================

export interface SummaryCardData {
  id: string;
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
  format?: 'number' | 'currency' | 'percentage';
}

// ============================================================================
// CHART DATA (for useModuleData)
// ============================================================================

export interface ChartData {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'donut' | 'area';
  title: string;
  data: ChartDataPoint[];
  color?: string;
  colors?: string[];
}

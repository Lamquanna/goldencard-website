// ============================================================================
// DASHBOARD HOME COMPONENTS - BARREL EXPORTS
// GoldenEnergy HOME Platform
// ============================================================================

// Types
export * from './types';

// Hooks
export * from './hooks';
export { useModuleData } from './useModuleData';

// Core Components
export { SummaryCard } from './SummaryCard';
export { ChartCard } from './ChartCard';
export { TaskList } from './TaskList';
export { ActivityFeed } from './ActivityFeed';
export { QuickActions } from './QuickActions';
export { WidgetWrapper } from './WidgetWrapper';

// Extended Widgets
export { NotificationPanel } from './NotificationPanel';
export { CalendarPreview } from './CalendarPreview';
export { ProgressWidget } from './ProgressWidget';
export { StatsComparison } from './StatsComparison';
export { TeamOverview } from './TeamOverview';
export { DashboardSettings } from './DashboardSettings';

// Localization
export { dashboardLocale } from './locale';

// Main Dashboard Pages
export { DashboardHome } from './DashboardHome';
export { EnhancedDashboardHome } from './EnhancedDashboardHome';

// Default export
export { DashboardHome as default } from './DashboardHome';

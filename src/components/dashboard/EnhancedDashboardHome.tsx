// ============================================================================
// ENHANCED DASHBOARD HOME PAGE
// GoldenEnergy HOME Platform - Main Dashboard with All Widgets
// ============================================================================

'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/src/modules/dashboard/store';

// Import all dashboard components
import { SummaryCard } from './SummaryCard';
import { ChartCard } from './ChartCard';
import { TaskList } from './TaskList';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';
import { WidgetWrapper } from './WidgetWrapper';
import { NotificationPanel } from './NotificationPanel';
import { CalendarPreview } from './CalendarPreview';
import { ProgressWidget } from './ProgressWidget';
import { StatsComparison } from './StatsComparison';
import { TeamOverview } from './TeamOverview';
import { useModuleData } from './useModuleData';
import { useLayoutPersistence, usePermissions } from './hooks';

// Icons
import {
  LayoutDashboard,
  Users,
  Target,
  FolderKanban,
  Package,
  DollarSign,
  Bell,
  Calendar,
  TrendingUp,
  BarChart3,
  CheckSquare,
  Activity,
  Settings,
  RefreshCcw,
  Grid,
  List,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'list';
type DashboardSection = 'overview' | 'workspace' | 'analytics' | 'activity';

// ============================================================================
// CONSTANTS
// ============================================================================

const SECTION_CONFIG = {
  overview: {
    title: 'Tổng quan hệ thống',
    description: 'KPIs và thống kê chính',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
    adminOnly: true,
  },
  workspace: {
    title: 'Không gian làm việc',
    description: 'Tasks, lịch và thông báo cá nhân',
    icon: CheckSquare,
    permission: 'dashboard.view',
    adminOnly: false,
  },
  analytics: {
    title: 'Phân tích theo module',
    description: 'Charts và báo cáo từ các module',
    icon: BarChart3,
    permission: 'reports.view',
    adminOnly: false,
  },
  activity: {
    title: 'Hoạt động gần đây',
    description: 'Lịch sử và audit log',
    icon: Activity,
    permission: 'dashboard.view',
    adminOnly: false,
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function EnhancedDashboardHome() {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [collapsedSections, setCollapsedSections] = useState<Set<DashboardSection>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  
  // Hooks
  const { layout, updateLayout } = useLayoutPersistence('enhanced-dashboard');
  const { hasPermission, isAdmin, currentRole } = usePermissions();
  const moduleData = useModuleData();
  const dashboardStore = useDashboardStore();
  
  // Toggle section collapse
  const toggleSection = useCallback((section: DashboardSection) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);
  
  // Refresh dashboard data
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh - in real app would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);
  
  // Quick actions based on permissions
  const quickActions = useMemo(() => {
    const actions = [
      {
        id: 'new-task',
        label: 'Tạo Task',
        icon: <Plus className="w-4 h-4" />,
        permission: 'projects.create',
        onClick: () => console.log('New task'),
      },
      {
        id: 'new-lead',
        label: 'Thêm Lead',
        icon: <Target className="w-4 h-4" />,
        permission: 'crm.create',
        onClick: () => console.log('New lead'),
      },
      {
        id: 'new-employee',
        label: 'Thêm nhân viên',
        icon: <Users className="w-4 h-4" />,
        permission: 'hrm.create',
        onClick: () => console.log('New employee'),
      },
      {
        id: 'create-invoice',
        label: 'Tạo hóa đơn',
        icon: <DollarSign className="w-4 h-4" />,
        permission: 'finance.create',
        onClick: () => console.log('New invoice'),
      },
    ];
    
    return actions.filter(a => hasPermission(a.permission));
  }, [hasPermission]);
  
  // Render section header
  const renderSectionHeader = (section: DashboardSection) => {
    const config = SECTION_CONFIG[section];
    const Icon = config.icon;
    const isCollapsed = collapsedSections.has(section);
    
    // Check permissions
    if (config.adminOnly && !isAdmin) return null;
    if (!hasPermission(config.permission)) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 cursor-pointer"
        onClick={() => toggleSection(section)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {config.description}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          {isCollapsed ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </Button>
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Xin chào! Đây là tổng quan hoạt động của bạn
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCcw className={cn(
                  'w-4 h-4 mr-2',
                  refreshing && 'animate-spin'
                )} />
                Làm mới
              </Button>
              
              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Tùy chỉnh widgets</DropdownMenuItem>
                  <DropdownMenuItem>Cài đặt thông báo</DropdownMenuItem>
                  <DropdownMenuItem>Xuất báo cáo</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Role badge */}
          <Badge variant="secondary" className="mt-2">
            {currentRole}
          </Badge>
        </div>
      </header>
      
      {/* Main content */}
      <main className="p-6 space-y-8">
        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <QuickActions actions={quickActions} layout="grid" columns={4} />
          </motion.div>
        )}
        
        {/* Section 1: System Overview (Admin only) */}
        {isAdmin && (
          <section>
            {renderSectionHeader('overview')}
            <AnimatePresence>
              {!collapsedSections.has('overview') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {moduleData.summaryCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <SummaryCard
                        title={card.title}
                        value={card.format === 'currency' 
                          ? `${(card.value / 1e6).toFixed(0)}M ₫`
                          : card.value.toLocaleString('vi-VN')
                        }
                        trend={{
                          value: Math.abs(card.change),
                          isPositive: card.changeType === 'positive',
                          label: 'vs tháng trước'
                        }}
                        variant={
                          card.changeType === 'positive' ? 'success' :
                          card.changeType === 'negative' ? 'danger' : 'default'
                        }
                        icon={
                          card.icon === 'users' ? <Users className="w-5 h-5" /> :
                          card.icon === 'target' ? <Target className="w-5 h-5" /> :
                          card.icon === 'folder' ? <FolderKanban className="w-5 h-5" /> :
                          card.icon === 'dollar-sign' ? <DollarSign className="w-5 h-5" /> :
                          card.icon === 'alert-triangle' ? <Package className="w-5 h-5" /> :
                          <Calendar className="w-5 h-5" />
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
        
        {/* Section 2: Personal Workspace */}
        <section>
          {renderSectionHeader('workspace')}
          <AnimatePresence>
            {!collapsedSections.has('workspace') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid' 
                    ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {/* Tasks */}
                <WidgetWrapper
                  id="tasks"
                  title="Tasks của tôi"
                  icon={<CheckSquare className="w-4 h-4" />}
                  loading={moduleData.loading}
                >
                  <TaskList
                    tasks={moduleData.tasks}
                    maxItems={5}
                    showPriority
                    showAssignee
                    emptyMessage="Không có task nào"
                  />
                </WidgetWrapper>
                
                {/* Calendar */}
                <WidgetWrapper
                  id="calendar"
                  title="Lịch sắp tới"
                  icon={<Calendar className="w-4 h-4" />}
                  loading={moduleData.loading}
                >
                  <CalendarPreview
                    events={moduleData.events}
                    view="week"
                    maxEvents={5}
                  />
                </WidgetWrapper>
                
                {/* Notifications */}
                <WidgetWrapper
                  id="notifications"
                  title="Thông báo"
                  icon={<Bell className="w-4 h-4" />}
                  loading={moduleData.loading}
                >
                  <NotificationPanel
                    notifications={moduleData.notifications.map(n => {
                      const category = n.category === 'hrm' ? 'hrm' as const : 
                                       n.category === 'projects' ? 'projects' as const :
                                       n.category === 'inventory' ? 'inventory' as const :
                                       n.category === 'finance' ? 'finance' as const : 'system' as const;
                      const priority = n.priority === 'urgent' ? 'urgent' as const : 
                                       n.priority === 'high' ? 'high' as const :
                                       n.priority === 'medium' ? 'normal' as const : 'low' as const;
                      const type = n.type === 'alert' ? 'warning' as const : 
                                   n.type === 'reminder' ? 'reminder' as const : 'info' as const;
                      return {
                        id: n.id,
                        type,
                        title: n.title,
                        message: n.message,
                        isRead: n.read,
                        createdAt: n.timestamp.toISOString(),
                        actionUrl: n.actionUrl,
                        category,
                        priority,
                      };
                    })}
                    unreadCount={moduleData.notifications.filter(n => !n.read).length}
                    maxItems={5}
                  />
                </WidgetWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        
        {/* Section 3: Module Analytics */}
        {hasPermission('reports.view') && (
          <section>
            {renderSectionHeader('analytics')}
            <AnimatePresence>
              {!collapsedSections.has('analytics') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Charts row */}
                  <div className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}>
                    {moduleData.charts.map((chart) => (
                      <ChartCard
                        key={chart.id}
                        title={chart.title}
                        chartType={chart.type}
                        data={chart.data}
                        loading={moduleData.loading}
                      />
                    ))}
                  </div>
                  
                  {/* Progress and comparison row */}
                  <div className={cn(
                    'grid gap-4',
                    viewMode === 'grid'
                      ? 'grid-cols-1 lg:grid-cols-2'
                      : 'grid-cols-1'
                  )}>
                    <ProgressWidget
                      title="Mục tiêu tháng này"
                      subtitle="Tiến độ hoàn thành KPIs"
                      items={moduleData.progressItems}
                      loading={moduleData.loading}
                    />
                    
                    <StatsComparison
                      title="So sánh với tháng trước"
                      period="Tháng này"
                      previousPeriod="Tháng trước"
                      items={moduleData.comparisonItems}
                      loading={moduleData.loading}
                    />
                  </div>
                  
                  {/* Team overview (managers and above) */}
                  {hasPermission('hrm.view') && (
                    <TeamOverview
                      title="Đội ngũ của tôi"
                      members={moduleData.teamMembers}
                      showCurrentTask
                      maxDisplay={8}
                      loading={moduleData.loading}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
        
        {/* Section 4: Activity Feed */}
        <section>
          {renderSectionHeader('activity')}
          <AnimatePresence>
            {!collapsedSections.has('activity') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <WidgetWrapper
                  id="activity-feed"
                  title="Hoạt động gần đây"
                  icon={<Activity className="w-4 h-4" />}
                  loading={moduleData.loading}
                >
                  <ActivityFeed
                    activities={moduleData.activities}
                    maxItems={15}
                    groupByTime
                    emptyMessage="Chưa có hoạt động nào"
                  />
                </WidgetWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default EnhancedDashboardHome;

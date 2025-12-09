// ============================================================================
// DASHBOARD HOME COMPONENT
// GoldenEnergy HOME Platform - Main Dashboard Page
// ============================================================================

'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Package, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Bell,
  Briefcase,
  FileText,
  Plus,
  BarChart3,
  PieChart,
  Settings,
  HelpCircle,
  FolderPlus,
  UserCircle,
  FileSpreadsheet,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Components
import { SummaryCard } from './SummaryCard';
import { ChartCard } from './ChartCard';
import { TaskList } from './TaskList';
import { ActivityFeed } from './ActivityFeed';
import { QuickActions } from './QuickActions';

// Hooks
import {
  useCurrentUser,
  useIsAdmin,
  useHasModuleAccess,
  useSystemOverviewKPIs,
  usePersonalTasks,
  useRecentActivities,
  useCRMAnalytics,
  useHRMAnalytics,
  useProjectAnalytics,
  useInventoryAnalytics,
  useFinanceAnalytics,
  useDashboardLayout,
} from './hooks';

import type { QuickActionItem, ActivityModule, ChartDataPoint } from './types';

// ============================================================================
// SECTION COMPONENT
// ============================================================================

interface DashboardSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function DashboardSection({ title, description, children, className }: DashboardSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('space-y-4', className)}
    >
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </motion.section>
  );
}

// ============================================================================
// SYSTEM OVERVIEW SECTION (Admin Only)
// ============================================================================

function SystemOverviewSection() {
  const { kpis, loading, refetch } = useSystemOverviewKPIs();
  const hasCRM = useHasModuleAccess('crm');
  const hasHRM = useHasModuleAccess('hrm');
  const hasInventory = useHasModuleAccess('inventory');
  const hasFinance = useHasModuleAccess('finance');
  
  // Map KPIs to icon components
  const kpiIcons: Record<string, React.ReactNode> = {
    'total-employees': <Users className="w-5 h-5" />,
    'new-leads-today': <UserPlus className="w-5 h-5" />,
    'low-stock-alerts': <Package className="w-5 h-5" />,
    'revenue-this-month': <DollarSign className="w-5 h-5" />,
  };
  
  // Map KPI status to variant
  const getVariant = (status?: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      default: return 'default';
    }
  };
  
  // Filter KPIs based on permissions
  const visibleKPIs = kpis.filter((kpi) => {
    if (kpi.module === 'crm') return hasCRM;
    if (kpi.module === 'hrm') return hasHRM;
    if (kpi.module === 'inventory') return hasInventory;
    if (kpi.module === 'finance') return hasFinance;
    return true;
  });
  
  if (visibleKPIs.length === 0) return null;
  
  return (
    <DashboardSection
      title="Tổng quan hệ thống"
      description="Các chỉ số quan trọng của doanh nghiệp"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleKPIs.map((kpi) => (
          <SummaryCard
            key={kpi.id}
            title={kpi.title}
            value={
              kpi.format === 'currency'
                ? `${(Number(kpi.value) / 1000000).toFixed(1)} tr`
                : kpi.format === 'percentage'
                ? `${kpi.value}%`
                : kpi.value
            }
            icon={kpiIcons[kpi.id]}
            variant={getVariant(kpi.status)}
            trend={
              kpi.previousValue !== undefined
                ? {
                    value: Math.round(
                      ((Number(kpi.value) - kpi.previousValue) / kpi.previousValue) * 100
                    ),
                    isPositive: Number(kpi.value) >= kpi.previousValue,
                    label: 'vs tháng trước',
                  }
                : undefined
            }
            loading={loading}
          />
        ))}
      </div>
    </DashboardSection>
  );
}

// ============================================================================
// PERSONAL WORKSPACE SECTION
// ============================================================================

function PersonalWorkspaceSection() {
  const user = useCurrentUser();
  const { tasks, summary, loading } = usePersonalTasks();
  
  // Quick actions based on role
  const quickActions: QuickActionItem[] = useMemo(() => [
    {
      id: 'new-task',
      label: 'Tạo công việc',
      icon: <Plus className="w-5 h-5" />,
      description: 'Tạo công việc mới',
      shortcut: 'Ctrl+T',
      onClick: () => alert('Mở form tạo công việc mới'),
    },
    {
      id: 'new-lead',
      label: 'Thêm Lead',
      icon: <UserPlus className="w-5 h-5" />,
      description: 'Thêm khách hàng tiềm năng',
      permission: 'crm:create',
      onClick: () => alert('Mở form thêm khách hàng tiềm năng'),
    },
    {
      id: 'new-project',
      label: 'Tạo dự án',
      icon: <FolderPlus className="w-5 h-5" />,
      description: 'Tạo dự án mới',
      permission: 'projects:create',
      onClick: () => alert('Mở form tạo dự án mới'),
    },
    {
      id: 'new-invoice',
      label: 'Tạo hóa đơn',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: 'Lập hóa đơn mới',
      permission: 'finance:create',
      onClick: () => alert('Mở form tạo hóa đơn mới'),
    },
    {
      id: 'view-reports',
      label: 'Báo cáo',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Xem báo cáo tổng hợp',
      onClick: () => alert('Mở trang báo cáo tổng hợp'),
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: <Settings className="w-5 h-5" />,
      description: 'Cài đặt tài khoản',
      onClick: () => alert('Mở cài đặt tài khoản'),
    },
  ], []);
  
  return (
    <DashboardSection
      title={`Xin chào, ${user.name}!`}
      description="Công việc và thao tác nhanh của bạn"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <TaskList
            tasks={tasks}
            title="Công việc của tôi"
            maxItems={5}
            showPriority
            showProject
            loading={loading}
            onTaskClick={(task) => alert(`Mở chi tiết công việc: ${task.title}`)}
            onViewAll={() => alert('Chuyển đến danh sách tất cả công việc')}
          />
        </div>
        
        {/* Quick Actions */}
        <div>
          <QuickActions
            actions={quickActions}
            title="Thao tác nhanh"
            layout="grid"
            columns={2}
          />
        </div>
      </div>
    </DashboardSection>
  );
}

// ============================================================================
// MODULE ANALYTICS SECTION
// ============================================================================

function ModuleAnalyticsSection() {
  const hasCRM = useHasModuleAccess('crm');
  const hasHRM = useHasModuleAccess('hrm');
  const hasProjects = useHasModuleAccess('projects');
  const hasInventory = useHasModuleAccess('inventory');
  const hasFinance = useHasModuleAccess('finance');
  
  const crmAnalytics = useCRMAnalytics();
  const hrmAnalytics = useHRMAnalytics();
  const projectAnalytics = useProjectAnalytics();
  const inventoryAnalytics = useInventoryAnalytics();
  const financeAnalytics = useFinanceAnalytics();
  
  // CRM chart data
  const crmChartData: ChartDataPoint[] = useMemo(() => [
    { label: 'Leads', value: crmAnalytics.totalLeads, color: '#3b82f6' },
    { label: 'Qualified', value: crmAnalytics.qualifiedLeads, color: '#22c55e' },
    { label: 'Deals', value: crmAnalytics.totalDeals, color: '#eab308' },
    { label: 'Won', value: crmAnalytics.wonDeals, color: '#10b981' },
  ], [crmAnalytics]);
  
  // HRM chart data
  const hrmChartData: ChartDataPoint[] = useMemo(() => 
    hrmAnalytics.employeesByDept.slice(0, 6).map((dept, index) => ({
      label: dept.name,
      value: dept.count,
      color: ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#f97316'][index],
    })),
  [hrmAnalytics.employeesByDept]);
  
  // Project chart data
  const projectChartData: ChartDataPoint[] = useMemo(() => [
    { label: 'Hoạt động', value: projectAnalytics.activeProjects, color: '#3b82f6' },
    { label: 'Hoàn thành', value: projectAnalytics.completedProjects, color: '#22c55e' },
    { label: 'Chờ', value: projectAnalytics.totalProjects - projectAnalytics.activeProjects - projectAnalytics.completedProjects, color: '#9ca3af' },
  ], [projectAnalytics]);
  
  // Finance chart data (monthly revenue - mock)
  const financeChartData: ChartDataPoint[] = useMemo(() => [
    { label: 'T1', value: 120 },
    { label: 'T2', value: 150 },
    { label: 'T3', value: 180 },
    { label: 'T4', value: 165 },
    { label: 'T5', value: 200 },
    { label: 'T6', value: 185 },
    { label: 'T7', value: 220 },
    { label: 'T8', value: 250 },
    { label: 'T9', value: 230 },
    { label: 'T10', value: 280 },
    { label: 'T11', value: 310 },
    { label: 'T12', value: 350 },
  ], []);
  
  const hasAnyModule = hasCRM || hasHRM || hasProjects || hasInventory || hasFinance;
  
  if (!hasAnyModule) return null;
  
  return (
    <DashboardSection
      title="Phân tích theo module"
      description="Thống kê chi tiết từ các module"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CRM Analytics */}
        {hasCRM && (
          <ChartCard
            title="CRM Analytics"
            subtitle={`Tỷ lệ chuyển đổi: ${crmAnalytics.conversionRate.toFixed(1)}%`}
            chartType="bar"
            data={crmChartData}
            height={200}
            showLegend={false}
          />
        )}
        
        {/* HRM Analytics */}
        {hasHRM && hrmChartData.length > 0 && (
          <ChartCard
            title="Nhân sự theo phòng ban"
            subtitle={`Tổng: ${hrmAnalytics.totalEmployees} nhân viên`}
            chartType="donut"
            data={hrmChartData}
            height={200}
            showLegend
          />
        )}
        
        {/* Project Analytics */}
        {hasProjects && (
          <ChartCard
            title="Tình trạng dự án"
            subtitle={`Hoàn thành: ${projectAnalytics.completionRate.toFixed(1)}%`}
            chartType="pie"
            data={projectChartData}
            height={200}
            showLegend
          />
        )}
        
        {/* Finance Analytics */}
        {hasFinance && (
          <ChartCard
            title="Doanh thu theo tháng"
            subtitle={`Tổng: ${(financeAnalytics.totalRevenue / 1000000).toFixed(1)} triệu`}
            chartType="bar"
            data={financeChartData}
            height={200}
            showLegend={false}
          />
        )}
        
        {/* Inventory Summary */}
        {hasInventory && (
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard
              title="Tổng sản phẩm"
              value={inventoryAnalytics.totalProducts}
              icon={<Package className="w-5 h-5" />}
              variant="default"
            />
            <SummaryCard
              title="Tổng tồn kho"
              value={inventoryAnalytics.totalStock}
              icon={<ClipboardList className="w-5 h-5" />}
              variant="info"
            />
            <SummaryCard
              title="Giá trị tồn kho"
              value={`${(inventoryAnalytics.totalValue / 1000000).toFixed(1)} tr`}
              icon={<DollarSign className="w-5 h-5" />}
              variant="success"
            />
            <SummaryCard
              title="Cảnh báo tồn"
              value={inventoryAnalytics.lowStockCount}
              icon={<Package className="w-5 h-5" />}
              variant={inventoryAnalytics.lowStockCount > 0 ? 'danger' : 'success'}
            />
          </div>
        )}
      </div>
    </DashboardSection>
  );
}

// ============================================================================
// ACTIVITY FEED SECTION
// ============================================================================

function ActivityFeedSection() {
  const { activities, loading, refetch } = useRecentActivities({ limit: 15 });
  
  const handleFilterChange = useCallback((modules: ActivityModule[]) => {
    // Filter activities by selected modules
  }, []);
  
  return (
    <DashboardSection
      title="Hoạt động gần đây"
      description="Theo dõi các hoạt động trong hệ thống"
    >
      <ActivityFeed
        activities={activities}
        maxItems={15}
        groupByTime
        loading={loading}
        onFilterChange={handleFilterChange}
        onActivityClick={(activity) => alert(`Xem chi tiết hoạt động: ${activity.action}`)}
        onViewAll={() => alert('Chuyển đến danh sách tất cả hoạt động')}
      />
    </DashboardSection>
  );
}

// ============================================================================
// MAIN DASHBOARD HOME COMPONENT
// ============================================================================

export function DashboardHome() {
  const isAdmin = useIsAdmin();
  const { isEditMode, toggleEditMode, resetLayout } = useDashboardLayout();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                GoldenEnergy HOME Platform
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Edit mode toggle */}
              <button
                onClick={toggleEditMode}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  isEditMode
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                )}
              >
                {isEditMode ? 'Lưu bố cục' : 'Tùy chỉnh'}
              </button>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              {/* Help */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* System Overview (Admin only) */}
          {isAdmin && <SystemOverviewSection />}
          
          {/* Personal Workspace */}
          <PersonalWorkspaceSection />
          
          {/* Module Analytics */}
          <ModuleAnalyticsSection />
          
          {/* Activity Feed */}
          <ActivityFeedSection />
        </div>
      </main>
      
      {/* Edit Mode Indicator */}
      {isEditMode && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-yellow-500 text-white rounded-full shadow-lg">
            <span className="text-sm font-medium">Chế độ chỉnh sửa</span>
            <button
              onClick={resetLayout}
              className="text-xs underline hover:no-underline"
            >
              Đặt lại
            </button>
            <button
              onClick={toggleEditMode}
              className="px-2 py-0.5 bg-white text-yellow-600 rounded text-xs font-medium"
            >
              Xong
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DashboardHome;

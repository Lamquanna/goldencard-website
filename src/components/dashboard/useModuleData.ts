// ============================================================================
// MODULE DATA INTEGRATION HOOK
// GoldenEnergy HOME Platform - Dashboard Data Aggregation
// ============================================================================

'use client';

import { useMemo } from 'react';
import { useCRMStore } from '@/src/modules/crm/store';
import { useHRMStore } from '@/src/modules/hrm/store';
import { useProjectStore } from '@/src/modules/projects/store';
import { useInventoryStore } from '@/src/modules/inventory/store';
import { useFinanceStore } from '@/src/modules/finance/store';
import type { 
  SummaryCardData, 
  ChartData, 
  TaskItem, 
  ActivityItem,
  NotificationItem,
  CalendarEvent,
  ProgressItem,
  ComparisonItem,
  TeamMember,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface ModuleDataSummary {
  crm: {
    totalContacts: number;
    newLeads: number;
    conversions: number;
    revenue: number;
  };
  hrm: {
    totalEmployees: number;
    activeEmployees: number;
    pendingLeaves: number;
    attendance: number;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedTasks: number;
    overdueCount: number;
  };
  inventory: {
    totalItems: number;
    lowStockAlerts: number;
    totalValue: number;
    pendingOrders: number;
  };
  finance: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    pendingInvoices: number;
  };
}

export interface DashboardAggregatedData {
  summary: ModuleDataSummary;
  summaryCards: SummaryCardData[];
  charts: ChartData[];
  tasks: TaskItem[];
  activities: ActivityItem[];
  notifications: NotificationItem[];
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  progressItems: ProgressItem[];
  comparisonItems: ComparisonItem[];
  loading: boolean;
  error: string | null;
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useModuleData(): DashboardAggregatedData {
  // Connect to module stores - using safe access
  const crmStore = useCRMStore();
  const hrmStore = useHRMStore();
  const projectStore = useProjectStore();
  const inventoryStore = useInventoryStore();
  const financeStore = useFinanceStore();
  
  // Aggregate summary data from all modules (using correct UPPERCASE status values)
  const summary = useMemo<ModuleDataSummary>(() => {
    // Safe arrays with fallbacks
    const contacts = crmStore.contacts ?? [];
    const leads = crmStore.leads ?? [];
    const deals = crmStore.deals ?? [];
    const employees = hrmStore.employees ?? [];
    const leaveRequests = hrmStore.leaveRequests ?? [];
    const projects = projectStore.projects ?? [];
    const tasks = projectStore.tasks ?? [];
    const products = inventoryStore.products ?? [];
    const alerts = inventoryStore.alerts ?? [];
    const invoices = financeStore.invoices ?? [];
    const transactions = financeStore.transactions ?? [];
    
    return {
      crm: {
        totalContacts: contacts.length,
        newLeads: leads.filter((l) => l.status === 'NEW').length,
        conversions: leads.filter((l) => l.status === 'WON').length,
        revenue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
      },
      hrm: {
        totalEmployees: employees.length,
        activeEmployees: employees.filter((e) => e.status === 'ACTIVE').length,
        pendingLeaves: leaveRequests.filter((l) => l.status === 'PENDING').length,
        attendance: 0, // Will be calculated separately if attendance data exists
      },
      projects: {
        totalProjects: projects.length,
        activeProjects: projects.filter((p) => p.status === 'IN_PROGRESS').length,
        completedTasks: tasks.filter((t) => t.status === 'DONE').length,
        overdueCount: tasks.filter((t) => 
          t.status !== 'DONE' && t.status !== 'CANCELLED' && 
          t.dueDate && new Date(t.dueDate) < new Date()
        ).length,
      },
      inventory: {
        totalItems: products.length,
        lowStockAlerts: alerts.filter((a) => a.type === 'LOW_STOCK' && !a.resolvedAt).length,
        totalValue: products.reduce((sum, p: any) => sum + ((p.stock || 0) * (p.price || 0)), 0),
        pendingOrders: 0, // Would need orders data
      },
      finance: {
        totalRevenue: transactions
          .filter((t) => t.type === 'INCOME')
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        totalExpenses: transactions
          .filter((t) => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + (t.amount || 0), 0),
        profit: 0, // Will be calculated
        pendingInvoices: invoices.filter((i) => i.status === 'PENDING').length,
      },
    };
  }, [crmStore, hrmStore, projectStore, inventoryStore, financeStore]);
  
  // Calculate profit
  const summaryWithProfit = useMemo(() => ({
    ...summary,
    finance: {
      ...summary.finance,
      profit: summary.finance.totalRevenue - summary.finance.totalExpenses,
    }
  }), [summary]);
  
  // Generate summary cards for dashboard
  const summaryCards = useMemo<SummaryCardData[]>(() => [
    {
      id: 'employees',
      title: 'Nhân viên',
      value: summaryWithProfit.hrm.totalEmployees,
      change: 5.2,
      changeType: 'positive',
      icon: 'users',
      color: '#6366f1',
    },
    {
      id: 'leads',
      title: 'Leads mới',
      value: summaryWithProfit.crm.newLeads,
      change: 12.5,
      changeType: 'positive',
      icon: 'target',
      color: '#22c55e',
    },
    {
      id: 'projects',
      title: 'Dự án đang chạy',
      value: summaryWithProfit.projects.activeProjects,
      change: -2.3,
      changeType: 'negative',
      icon: 'folder',
      color: '#f59e0b',
    },
    {
      id: 'revenue',
      title: 'Doanh thu tháng',
      value: summaryWithProfit.finance.totalRevenue,
      format: 'currency',
      change: 8.7,
      changeType: 'positive',
      icon: 'dollar-sign',
      color: '#10b981',
    },
    {
      id: 'stock-alerts',
      title: 'Cảnh báo tồn kho',
      value: summaryWithProfit.inventory.lowStockAlerts,
      change: summaryWithProfit.inventory.lowStockAlerts > 5 ? 15 : -10,
      changeType: summaryWithProfit.inventory.lowStockAlerts > 5 ? 'negative' : 'positive',
      icon: 'alert-triangle',
      color: '#ef4444',
    },
    {
      id: 'pending-leaves',
      title: 'Nghỉ phép chờ duyệt',
      value: summaryWithProfit.hrm.pendingLeaves,
      change: 0,
      changeType: 'neutral',
      icon: 'calendar',
      color: '#8b5cf6',
    },
  ], [summaryWithProfit]);
  
  // Generate chart data
  const charts = useMemo<ChartData[]>(() => [
    {
      id: 'revenue-chart',
      type: 'line',
      title: 'Doanh thu theo tháng',
      data: [
        { label: 'T1', value: 120000000 },
        { label: 'T2', value: 150000000 },
        { label: 'T3', value: 180000000 },
        { label: 'T4', value: 165000000 },
        { label: 'T5', value: 200000000 },
        { label: 'T6', value: summaryWithProfit.finance.totalRevenue || 220000000 },
      ],
      color: '#22c55e',
    },
    {
      id: 'project-status',
      type: 'pie',
      title: 'Trạng thái dự án',
      data: [
        { label: 'Đang chạy', value: summaryWithProfit.projects.activeProjects || 8 },
        { label: 'Hoàn thành', value: 12 },
        { label: 'Tạm dừng', value: 3 },
        { label: 'Hủy', value: 1 },
      ],
      colors: ['#22c55e', '#6366f1', '#f59e0b', '#ef4444'],
    },
    {
      id: 'leads-funnel',
      type: 'bar',
      title: 'Lead Funnel',
      data: [
        { label: 'Mới', value: summaryWithProfit.crm.newLeads || 45 },
        { label: 'Liên hệ', value: 32 },
        { label: 'Đàm phán', value: 18 },
        { label: 'Chốt deal', value: summaryWithProfit.crm.conversions || 8 },
      ],
      color: '#6366f1',
    },
  ], [summaryWithProfit]);
  
  // Generate task items from projects - using correct types
  const tasks = useMemo<TaskItem[]>(() => {
    const projectTasks = projectStore.tasks ?? [];
    return projectTasks.slice(0, 10).map((task): TaskItem => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority?.toLowerCase() as TaskItem['priority'] || 'medium',
      status: task.status === 'DONE' ? 'completed' : 
              task.status === 'IN_PROGRESS' ? 'in_progress' : 
              task.status === 'CANCELLED' ? 'completed' : 'pending',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
      assignee: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.name,
        avatar: task.assignee.avatar,
      } : undefined,
      project: task.projectId ? {
        id: task.projectId,
        name: projectStore.projects?.find(p => p.id === task.projectId)?.name || 'Dự án',
      } : undefined,
    }));
  }, [projectStore.tasks, projectStore.projects]);
  
  // Generate activity items - mock data since activityLog doesn't exist
  const activities = useMemo<ActivityItem[]>(() => {
    // Generate mock activities based on recent data
    const mockActivities: ActivityItem[] = [];
    
    // Add recent lead activities
    const recentLeads = (crmStore.leads ?? []).slice(0, 3);
    recentLeads.forEach((lead, index) => {
      mockActivities.push({
        id: `lead-${lead.id}`,
        type: 'create',
        module: 'crm',
        actor: {
          id: lead.createdById || 'system',
          name: lead.createdBy?.name || 'Hệ thống',
          avatar: lead.createdBy?.avatar,
        },
        action: 'Tạo lead mới',
        target: {
          type: 'lead',
          id: lead.id,
          name: lead.name,
        },
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
      });
    });
    
    // Add recent project activities
    const recentProjects = (projectStore.projects ?? []).slice(0, 3);
    recentProjects.forEach((project, index) => {
      mockActivities.push({
        id: `project-${project.id}`,
        type: 'update',
        module: 'projects',
        actor: {
          id: project.managerId || 'system',
          name: project.manager?.name || 'PM',
        },
        action: 'Cập nhật dự án',
        target: {
          type: 'project',
          id: project.id,
          name: project.name,
        },
        timestamp: new Date(Date.now() - (index + 3) * 3600000).toISOString(),
      });
    });
    
    return mockActivities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [crmStore.leads, projectStore.projects]);
  
  // Generate notifications
  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = [];
    
    // Low stock alerts
    if (summaryWithProfit.inventory.lowStockAlerts > 0) {
      items.push({
        id: 'stock-alert',
        title: 'Cảnh báo tồn kho',
        message: `${summaryWithProfit.inventory.lowStockAlerts} sản phẩm sắp hết hàng`,
        type: 'alert',
        priority: 'high',
        timestamp: new Date(),
        read: false,
        category: 'inventory',
      });
    }
    
    // Pending leave requests
    if (summaryWithProfit.hrm.pendingLeaves > 0) {
      items.push({
        id: 'leave-pending',
        title: 'Yêu cầu nghỉ phép',
        message: `${summaryWithProfit.hrm.pendingLeaves} yêu cầu đang chờ duyệt`,
        type: 'reminder',
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        category: 'hrm',
      });
    }
    
    // Overdue tasks
    if (summaryWithProfit.projects.overdueCount > 0) {
      items.push({
        id: 'overdue-tasks',
        title: 'Task quá hạn',
        message: `${summaryWithProfit.projects.overdueCount} task đã quá hạn`,
        type: 'alert',
        priority: 'high',
        timestamp: new Date(),
        read: false,
        category: 'projects',
      });
    }
    
    // Pending invoices
    if (summaryWithProfit.finance.pendingInvoices > 0) {
      items.push({
        id: 'pending-invoices',
        title: 'Hóa đơn chờ thanh toán',
        message: `${summaryWithProfit.finance.pendingInvoices} hóa đơn chưa thanh toán`,
        type: 'reminder',
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        category: 'finance',
      });
    }
    
    return items;
  }, [summaryWithProfit]);
  
  // Generate calendar events - using correct CalendarEvent type with start/end
  const events = useMemo<CalendarEvent[]>(() => {
    const today = new Date();
    const eventList: CalendarEvent[] = [];
    
    // Add task deadlines as events
    const upcomingTasks = (projectStore.tasks ?? [])
      .filter((t) => {
        if (!t.dueDate) return false;
        const due = new Date(t.dueDate);
        return due >= today && due <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      })
      .slice(0, 5);
    
    upcomingTasks.forEach((task) => {
      const dueDate = new Date(task.dueDate!);
      eventList.push({
        id: `task-${task.id}`,
        title: task.title,
        start: dueDate.toISOString(),
        end: new Date(dueDate.getTime() + 3600000).toISOString(), // +1 hour
        type: 'deadline',
        color: '#ef4444',
      });
    });
    
    // Add leave requests as events
    const approvedLeaves = (hrmStore.leaveRequests ?? [])
      .filter((l) => l.status === 'APPROVED');
    
    approvedLeaves.forEach((leave) => {
      eventList.push({
        id: `leave-${leave.id}`,
        title: `${leave.employee?.name || 'Nhân viên'} - Nghỉ phép`,
        start: new Date(leave.startDate).toISOString(),
        end: new Date(leave.endDate).toISOString(),
        allDay: true,
        type: 'event',
        color: '#8b5cf6',
      });
    });
    
    return eventList.sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [projectStore.tasks, hrmStore.leaveRequests]);
  
  // Generate team members from HRM
  const teamMembers = useMemo<TeamMember[]>(() => {
    const employees = hrmStore.employees ?? [];
    return employees.slice(0, 10).map((emp): TeamMember => ({
      id: emp.id,
      name: emp.name,
      avatar: emp.avatar,
      role: emp.position?.name || '',
      department: emp.department?.name || '',
      status: emp.status === 'ACTIVE' ? 'online' : 
              emp.status === 'ON_LEAVE' ? 'away' : 'offline',
      currentTask: undefined,
      lastActive: emp.updatedAt ? new Date(emp.updatedAt) : undefined,
    }));
  }, [hrmStore.employees]);
  
  // Generate progress items
  const progressItems = useMemo<ProgressItem[]>(() => [
    {
      id: 'revenue-target',
      label: 'Mục tiêu doanh thu',
      current: summaryWithProfit.finance.totalRevenue || 220000000,
      target: 300000000,
      unit: '₫',
      color: '#22c55e',
    },
    {
      id: 'lead-target',
      label: 'Leads chuyển đổi',
      current: summaryWithProfit.crm.conversions || 8,
      target: 20,
      color: '#6366f1',
    },
    {
      id: 'project-completion',
      label: 'Hoàn thành dự án',
      current: 12,
      target: summaryWithProfit.projects.totalProjects || 24,
      color: '#f59e0b',
    },
  ], [summaryWithProfit]);
  
  // Generate comparison items
  const comparisonItems = useMemo<ComparisonItem[]>(() => [
    {
      id: 'revenue-compare',
      label: 'Doanh thu',
      current: summaryWithProfit.finance.totalRevenue || 220000000,
      previous: 180000000,
      format: 'currency',
    },
    {
      id: 'leads-compare',
      label: 'Leads mới',
      current: summaryWithProfit.crm.newLeads || 45,
      previous: 38,
    },
    {
      id: 'employees-compare',
      label: 'Nhân viên',
      current: summaryWithProfit.hrm.totalEmployees || 50,
      previous: 48,
    },
    {
      id: 'projects-compare',
      label: 'Dự án hoàn thành',
      current: 12,
      previous: 10,
    },
  ], [summaryWithProfit]);
  
  // Determine loading state - using correct property names for each store
  const loading = useMemo(() => {
    return (
      crmStore.isLoading ||
      hrmStore.isLoadingEmployees ||
      projectStore.isLoadingProjects ||
      projectStore.isLoadingTasks ||
      inventoryStore.isLoading ||
      financeStore.isLoading ||
      false
    );
  }, [
    crmStore.isLoading, 
    hrmStore.isLoadingEmployees, 
    projectStore.isLoadingProjects,
    projectStore.isLoadingTasks,
    inventoryStore.isLoading, 
    financeStore.isLoading
  ]);
  
  // Combine errors - only stores that have error property
  const error = useMemo(() => {
    return (
      crmStore.error ||
      inventoryStore.error ||
      financeStore.error ||
      null
    );
  }, [crmStore.error, inventoryStore.error, financeStore.error]);
  
  return {
    summary: summaryWithProfit,
    summaryCards,
    charts,
    tasks,
    activities,
    notifications,
    events,
    teamMembers,
    progressItems,
    comparisonItems,
    loading,
    error,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useModuleData;

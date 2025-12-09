// ============================================================================
// DASHBOARD HOME COMPONENTS - HOOKS
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useDashboardStore } from '@/src/modules/dashboard/store';
import { useCRMStore } from '@/src/modules/crm/store';
import { useHRMStore } from '@/src/modules/hrm/store';
import { useProjectStore } from '@/src/modules/projects/store';
import { useInventoryStore } from '@/src/modules/inventory/store';
import { useFinanceStore } from '@/src/modules/finance/store';
import type { 
  KPICardData, 
  TaskItem, 
  ActivityItem,
  ActivityModule 
} from './types';

// ============================================================================
// CURRENT USER HOOK (Mock - integrate with real auth)
// ============================================================================

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  roleType: 'super_admin' | 'admin' | 'manager' | 'staff';
  departmentId?: string;
  permissions: string[];
}

export function useCurrentUser(): CurrentUser {
  // TODO: Replace with real auth hook
  return {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@goldenenergy.vn',
    avatar: undefined,
    roleId: 'super_admin',
    roleType: 'super_admin',
    departmentId: 'dept-1',
    permissions: ['*'], // Super admin has all permissions
  };
}

// ============================================================================
// PERMISSION CHECK HOOK
// ============================================================================

export function usePermission(permission: string): boolean {
  const user = useCurrentUser();
  
  return useMemo(() => {
    // Super admin has all permissions
    if (user.roleType === 'super_admin' || user.permissions.includes('*')) {
      return true;
    }
    
    return user.permissions.includes(permission);
  }, [user.roleType, user.permissions, permission]);
}

export function useHasModuleAccess(moduleId: string): boolean {
  return usePermission(`${moduleId}:view`);
}

export function useIsAdmin(): boolean {
  const user = useCurrentUser();
  return user.roleType === 'super_admin' || user.roleType === 'admin';
}

// ============================================================================
// COMBINED PERMISSIONS HOOK
// ============================================================================

export function usePermissions() {
  const user = useCurrentUser();
  
  const hasPermission = useCallback((permission: string) => {
    if (user.roleType === 'super_admin' || user.permissions.includes('*')) {
      return true;
    }
    return user.permissions.includes(permission);
  }, [user.roleType, user.permissions]);
  
  const isAdmin = useMemo(() => {
    return user.roleType === 'super_admin' || user.roleType === 'admin';
  }, [user.roleType]);
  
  const isManager = useMemo(() => {
    return user.roleType === 'super_admin' || user.roleType === 'admin' || user.roleType === 'manager';
  }, [user.roleType]);
  
  return {
    hasPermission,
    isAdmin,
    isManager,
    currentRole: user.roleType,
    currentUser: user,
  };
}

// ============================================================================
// LAYOUT PERSISTENCE HOOK
// ============================================================================

interface WidgetLayoutConfig {
  id: string;
  order: number;
  visible: boolean;
  collapsed: boolean;
  width?: string;
}

interface LayoutConfig {
  widgets: WidgetLayoutConfig[];
  gridColumns: number;
  theme: 'light' | 'dark' | 'system';
}

const DEFAULT_LAYOUT: LayoutConfig = {
  widgets: [],
  gridColumns: 3,
  theme: 'system',
};

export function useLayoutPersistence(key: string) {
  const [layout, setLayoutState] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dashboard-layout-${key}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setLayoutState(parsed);
        } catch (e) {
          console.error('Failed to parse saved layout:', e);
        }
      }
      setIsLoaded(true);
    }
  }, [key]);
  
  // Save to localStorage
  const updateLayout = useCallback((updates: Partial<LayoutConfig>) => {
    setLayoutState(prev => {
      const newLayout = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`dashboard-layout-${key}`, JSON.stringify(newLayout));
      }
      return newLayout;
    });
  }, [key]);
  
  // Update widget order
  const reorderWidgets = useCallback((widgets: WidgetLayoutConfig[]) => {
    updateLayout({ widgets });
  }, [updateLayout]);
  
  // Toggle widget visibility
  const toggleWidget = useCallback((widgetId: string) => {
    setLayoutState(prev => {
      const widgets = prev.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      );
      const newLayout = { ...prev, widgets };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`dashboard-layout-${key}`, JSON.stringify(newLayout));
      }
      return newLayout;
    });
  }, [key]);
  
  // Toggle widget collapse
  const toggleCollapse = useCallback((widgetId: string) => {
    setLayoutState(prev => {
      const widgets = prev.widgets.map(w => 
        w.id === widgetId ? { ...w, collapsed: !w.collapsed } : w
      );
      const newLayout = { ...prev, widgets };
      if (typeof window !== 'undefined') {
        localStorage.setItem(`dashboard-layout-${key}`, JSON.stringify(newLayout));
      }
      return newLayout;
    });
  }, [key]);
  
  // Reset layout
  const resetLayout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`dashboard-layout-${key}`);
    }
    setLayoutState(DEFAULT_LAYOUT);
  }, [key]);
  
  return {
    layout,
    updateLayout,
    reorderWidgets,
    toggleWidget,
    toggleCollapse,
    resetLayout,
    isLoaded,
  };
}

// ============================================================================
// SYSTEM OVERVIEW KPIs (Admin Only)
// ============================================================================

export function useSystemOverviewKPIs(): {
  kpis: KPICardData[];
  loading: boolean;
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  
  // Get data from module stores
  const employees = useHRMStore((state) => state.employees);
  const leads = useCRMStore((state) => state.leads);
  const products = useInventoryStore((state) => state.products);
  const invoices = useFinanceStore((state) => state.invoices);
  const alerts = useInventoryStore((state) => state.alerts);
  
  // Calculate KPIs
  const kpis = useMemo<KPICardData[]>(() => {
    const today = new Date().toDateString();
    
    // Total employees
    const totalEmployees = employees.length;
    
    // New leads today
    const newLeadsToday = leads.filter(
      (lead) => new Date(lead.createdAt).toDateString() === today
    ).length;
    
    // Low stock alerts - using correct UPPERCASE type
    const lowStockAlerts = alerts.filter(
      (alert) => alert.type === 'LOW_STOCK' && !alert.resolvedAt
    ).length;
    
    // Revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const revenueThisMonth = invoices
      .filter((inv) => 
        inv.status === 'PAID' && 
        new Date(inv.paidDate || inv.createdAt) >= startOfMonth
      )
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    return [
      {
        id: 'total-employees',
        title: 'Tổng nhân viên',
        value: totalEmployees,
        format: 'number',
        trend: 'stable',
        status: 'success',
        module: 'hrm',
        permission: 'hrm:view',
      },
      {
        id: 'new-leads-today',
        title: 'Lead mới hôm nay',
        value: newLeadsToday,
        format: 'number',
        trend: newLeadsToday > 0 ? 'up' : 'stable',
        status: newLeadsToday > 5 ? 'success' : 'warning',
        module: 'crm',
        permission: 'crm:view',
      },
      {
        id: 'low-stock-alerts',
        title: 'Cảnh báo tồn kho',
        value: lowStockAlerts,
        format: 'number',
        trend: lowStockAlerts > 0 ? 'up' : 'stable',
        status: lowStockAlerts > 0 ? 'danger' : 'success',
        module: 'inventory',
        permission: 'inventory:view',
      },
      {
        id: 'revenue-this-month',
        title: 'Doanh thu tháng này',
        value: revenueThisMonth,
        format: 'currency',
        trend: 'up',
        status: 'success',
        module: 'finance',
        permission: 'finance:view',
      },
    ];
  }, [employees, leads, alerts, invoices]);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  const refetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  }, []);
  
  return { kpis, loading, refetch };
}

// ============================================================================
// PERSONAL TASKS HOOK
// ============================================================================

export function usePersonalTasks(): {
  tasks: TaskItem[];
  summary: { total: number; overdue: number; dueToday: number };
  loading: boolean;
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();
  const projectTasks = useProjectStore((state) => state.tasks);
  
  const { tasks, summary } = useMemo(() => {
    const now = new Date();
    const today = now.toDateString();
    
    // Filter tasks assigned to current user
    const userTasks = projectTasks
      .filter((task) => task.assigneeId === user.id)
      .map((task): TaskItem => {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        let status: TaskItem['status'] = 'pending';
        
        // Use correct UPPERCASE status values
        if (task.status === 'DONE') {
          status = 'completed';
        } else if (task.status === 'IN_PROGRESS') {
          status = 'in_progress';
        } else if (dueDate && dueDate < now) {
          status = 'overdue';
        }
        
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          priority: (task.priority?.toLowerCase() as TaskItem['priority']) || 'medium',
          status,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
          project: task.projectId ? {
            id: task.projectId,
            name: 'Project',
          } : undefined,
        };
      })
      .sort((a, b) => {
        // Sort by priority then due date
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    
    const overdue = userTasks.filter((t) => t.status === 'overdue').length;
    const dueToday = userTasks.filter((t) => 
      t.dueDate && new Date(t.dueDate).toDateString() === today
    ).length;
    
    return {
      tasks: userTasks.slice(0, 10),
      summary: {
        total: userTasks.length,
        overdue,
        dueToday,
      },
    };
  }, [projectTasks, user.id]);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  
  const refetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, []);
  
  return { tasks, summary, loading, refetch };
}

// ============================================================================
// RECENT ACTIVITIES HOOK
// ============================================================================

export function useRecentActivities(options?: {
  moduleFilter?: ActivityModule[];
  limit?: number;
}): {
  activities: ActivityItem[];
  loading: boolean;
  refetch: () => void;
} {
  const [loading, setLoading] = useState(true);
  const dashboardActivities = useDashboardStore((state) => state.recentActivities);
  
  const activities = useMemo(() => {
    let filtered = dashboardActivities.map((activity): ActivityItem => ({
      id: activity.id,
      type: activity.type,
      module: (activity.target?.type?.split('_')[0] || 'system') as ActivityModule,
      actor: activity.actor,
      action: activity.action,
      target: activity.target,
      metadata: activity.metadata,
      timestamp: activity.timestamp,
    }));
    
    // Apply module filter
    if (options?.moduleFilter && options.moduleFilter.length > 0) {
      filtered = filtered.filter((a) => options.moduleFilter!.includes(a.module));
    }
    
    // Apply limit
    const limit = options?.limit || 20;
    return filtered.slice(0, limit);
  }, [dashboardActivities, options?.moduleFilter, options?.limit]);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  
  const refetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  }, []);
  
  return { activities, loading, refetch };
}

// ============================================================================
// MODULE ANALYTICS HOOKS
// ============================================================================

export function useCRMAnalytics() {
  const leads = useCRMStore((state) => state.leads);
  const deals = useCRMStore((state) => state.deals);
  
  return useMemo(() => {
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter((l) => l.status === 'QUALIFIED').length;
    const totalDeals = deals.length;
    const wonDeals = deals.filter((d) => d.stage === 'CLOSED_WON').length;
    const totalDealValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonDealValue = deals
      .filter((d) => d.stage === 'CLOSED_WON')
      .reduce((sum, d) => sum + (d.value || 0), 0);
    
    return {
      totalLeads,
      qualifiedLeads,
      conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      totalDeals,
      wonDeals,
      winRate: totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0,
      totalDealValue,
      wonDealValue,
    };
  }, [leads, deals]);
}

export function useHRMAnalytics() {
  const employees = useHRMStore((state) => state.employees);
  const departments = useHRMStore((state) => state.departments);
  const leaveRequests = useHRMStore((state) => state.leaveRequests);
  
  return useMemo(() => {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;
    const totalDepartments = departments.length;
    const pendingLeaves = leaveRequests.filter((l) => l.status === 'PENDING').length;
    
    // Group by department
    const employeesByDept = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      count: employees.filter((e) => e.departmentId === dept.id).length,
    }));
    
    return {
      totalEmployees,
      activeEmployees,
      totalDepartments,
      pendingLeaves,
      employeesByDept,
    };
  }, [employees, departments, leaveRequests]);
}

export function useProjectAnalytics() {
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  
  return useMemo(() => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(
      (p) => p.status === 'IN_PROGRESS'
    ).length;
    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) => t.status === 'DONE'
    ).length;
    
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    };
  }, [projects, tasks]);
}

export function useInventoryAnalytics() {
  const products = useInventoryStore((state) => state.products);
  const warehouses = useInventoryStore((state) => state.warehouses);
  const alerts = useInventoryStore((state) => state.alerts);
  
  return useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p: any) => sum + (p.stock || 0), 0);
    const totalValue = products.reduce(
      (sum, p: any) => sum + (p.stock || 0) * (p.price || 0), 
      0
    );
    const lowStockCount = alerts.filter(
      (a) => a.type === 'LOW_STOCK' && !a.resolvedAt
    ).length;
    const totalWarehouses = warehouses.length;
    
    return {
      totalProducts,
      totalStock,
      totalValue,
      lowStockCount,
      totalWarehouses,
    };
  }, [products, warehouses, alerts]);
}

export function useFinanceAnalytics() {
  const invoices = useFinanceStore((state) => state.invoices);
  const expenses = useFinanceStore((state) => state.expenses);
  const transactions = useFinanceStore((state) => state.transactions);
  
  return useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.status === 'PAID').length;
    const pendingInvoices = invoices.filter((i) => i.status === 'PENDING').length;
    const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE').length;
    
    const totalRevenue = invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + (i.total || 0), 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    
    const netIncome = totalRevenue - totalExpenses;
    
    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      totalExpenses,
      netIncome,
      profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
    };
  }, [invoices, expenses, transactions]);
}

// ============================================================================
// DASHBOARD LAYOUT HOOK
// ============================================================================

const LAYOUT_STORAGE_KEY = 'dashboard-layout';

export interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useDashboardLayout() {
  const [layouts, setLayouts] = useState<WidgetLayout[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Load from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (saved) {
        try {
          setLayouts(JSON.parse(saved));
        } catch {
          // Invalid JSON, use defaults
        }
      }
    }
  }, []);
  
  // Save to localStorage
  const saveLayout = useCallback((newLayouts: WidgetLayout[]) => {
    setLayouts(newLayouts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));
    }
  }, []);
  
  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);
  
  const resetLayout = useCallback(() => {
    setLayouts([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
    }
  }, []);
  
  return {
    layouts,
    isEditMode,
    saveLayout,
    toggleEditMode,
    resetLayout,
  };
}

// ============================================================================
// NOTIFICATIONS HOOK
// ============================================================================

export function useDashboardNotifications() {
  const notifications = useDashboardStore((state) => state.notifications);
  const unreadCount = useDashboardStore((state) => state.unreadCount);
  const markNotificationRead = useDashboardStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useDashboardStore((state) => state.markAllNotificationsRead);
  
  return {
    notifications,
    unreadCount,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
  };
}

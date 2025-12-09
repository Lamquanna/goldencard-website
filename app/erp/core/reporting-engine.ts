/**
 * HOME Platform - Reporting & Dashboard Engine
 * Dynamic reports and dashboards
 */

// =============================================================================
// REPORT TYPES
// =============================================================================

export type ReportType = 
  | 'table'
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'area-chart'
  | 'kpi-card'
  | 'funnel'
  | 'heatmap'
  | 'calendar'
  | 'timeline'

export type AggregationType = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'unique'

export type DateRangePreset = 
  | 'today'
  | 'yesterday'
  | 'last-7-days'
  | 'last-30-days'
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'last-year'
  | 'custom'

export interface ReportFilter {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'between'
  value: unknown
}

export interface ReportColumn {
  field: string
  label: string
  labelVi: string
  type: 'string' | 'number' | 'currency' | 'date' | 'boolean' | 'percentage'
  aggregation?: AggregationType
  format?: string
}

export interface ReportConfig {
  id: string
  name: string
  nameVi: string
  description?: string
  descriptionVi?: string
  module: string
  type: ReportType
  
  // Data source
  dataSource: string
  columns: ReportColumn[]
  groupBy?: string[]
  orderBy?: { field: string; direction: 'asc' | 'desc' }[]
  
  // Filters
  filters?: ReportFilter[]
  dateRange?: DateRangePreset
  customDateRange?: { from: Date; to: Date }
  
  // Display
  chartConfig?: {
    xAxis?: string
    yAxis?: string[]
    colors?: string[]
    showLegend?: boolean
    showGrid?: boolean
    stacked?: boolean
  }
  
  // Schedule
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
    format: 'pdf' | 'excel' | 'csv'
  }
  
  // Permissions
  createdBy: string
  createdAt: Date
  isPublic: boolean
  sharedWith?: string[]
}

export interface DashboardWidget {
  id: string
  reportId?: string
  type: ReportType | 'custom'
  title: string
  titleVi: string
  
  // Layout (grid position)
  x: number
  y: number
  width: number
  height: number
  
  // Custom data
  customData?: Record<string, unknown>
  customComponent?: string
}

export interface Dashboard {
  id: string
  name: string
  nameVi: string
  description?: string
  module?: string
  
  widgets: DashboardWidget[]
  
  // Layout
  columns: number // default 12
  rowHeight: number // default 100px
  
  // Permissions
  createdBy: string
  createdAt: Date
  isDefault?: boolean
  isPublic: boolean
  sharedWith?: string[]
}

// =============================================================================
// REPORT DATA
// =============================================================================

export interface ReportData {
  columns: ReportColumn[]
  rows: Record<string, unknown>[]
  summary?: Record<string, number>
  total: number
}

// =============================================================================
// PRESET REPORTS
// =============================================================================

export const presetReports: Omit<ReportConfig, 'createdBy' | 'createdAt'>[] = [
  // CRM Reports
  {
    id: 'crm-leads-by-status',
    name: 'Leads by Status',
    nameVi: 'Lead theo trạng thái',
    module: 'crm',
    type: 'pie-chart',
    dataSource: 'leads',
    columns: [
      { field: 'status', label: 'Status', labelVi: 'Trạng thái', type: 'string' },
      { field: 'count', label: 'Count', labelVi: 'Số lượng', type: 'number', aggregation: 'count' },
    ],
    groupBy: ['status'],
    isPublic: true,
  },
  {
    id: 'crm-sales-pipeline',
    name: 'Sales Pipeline',
    nameVi: 'Pipeline bán hàng',
    module: 'crm',
    type: 'funnel',
    dataSource: 'deals',
    columns: [
      { field: 'stage', label: 'Stage', labelVi: 'Giai đoạn', type: 'string' },
      { field: 'value', label: 'Value', labelVi: 'Giá trị', type: 'currency', aggregation: 'sum' },
      { field: 'count', label: 'Count', labelVi: 'Số lượng', type: 'number', aggregation: 'count' },
    ],
    groupBy: ['stage'],
    isPublic: true,
  },
  {
    id: 'crm-revenue-trend',
    name: 'Revenue Trend',
    nameVi: 'Xu hướng doanh thu',
    module: 'crm',
    type: 'line-chart',
    dataSource: 'deals',
    columns: [
      { field: 'month', label: 'Month', labelVi: 'Tháng', type: 'date' },
      { field: 'revenue', label: 'Revenue', labelVi: 'Doanh thu', type: 'currency', aggregation: 'sum' },
    ],
    groupBy: ['month'],
    chartConfig: {
      xAxis: 'month',
      yAxis: ['revenue'],
      showLegend: true,
      showGrid: true,
    },
    isPublic: true,
  },
  
  // HRM Reports
  {
    id: 'hrm-attendance-summary',
    name: 'Attendance Summary',
    nameVi: 'Tổng hợp chấm công',
    module: 'hrm',
    type: 'table',
    dataSource: 'attendance',
    columns: [
      { field: 'employeeName', label: 'Employee', labelVi: 'Nhân viên', type: 'string' },
      { field: 'workDays', label: 'Work Days', labelVi: 'Ngày công', type: 'number', aggregation: 'count' },
      { field: 'lateDays', label: 'Late Days', labelVi: 'Đi trễ', type: 'number', aggregation: 'count' },
      { field: 'absentDays', label: 'Absent', labelVi: 'Vắng', type: 'number', aggregation: 'count' },
    ],
    groupBy: ['employeeId'],
    dateRange: 'this-month',
    isPublic: true,
  },
  {
    id: 'hrm-leave-balance',
    name: 'Leave Balance',
    nameVi: 'Số ngày phép còn lại',
    module: 'hrm',
    type: 'bar-chart',
    dataSource: 'employees',
    columns: [
      { field: 'department', label: 'Department', labelVi: 'Phòng ban', type: 'string' },
      { field: 'totalLeave', label: 'Total Leave', labelVi: 'Tổng phép', type: 'number', aggregation: 'sum' },
      { field: 'usedLeave', label: 'Used', labelVi: 'Đã sử dụng', type: 'number', aggregation: 'sum' },
      { field: 'remainingLeave', label: 'Remaining', labelVi: 'Còn lại', type: 'number', aggregation: 'sum' },
    ],
    groupBy: ['department'],
    chartConfig: {
      xAxis: 'department',
      yAxis: ['totalLeave', 'usedLeave', 'remainingLeave'],
      stacked: true,
    },
    isPublic: true,
  },
  
  // Project Reports
  {
    id: 'project-status-overview',
    name: 'Project Status Overview',
    nameVi: 'Tổng quan trạng thái dự án',
    module: 'project',
    type: 'pie-chart',
    dataSource: 'projects',
    columns: [
      { field: 'status', label: 'Status', labelVi: 'Trạng thái', type: 'string' },
      { field: 'count', label: 'Count', labelVi: 'Số lượng', type: 'number', aggregation: 'count' },
    ],
    groupBy: ['status'],
    isPublic: true,
  },
  {
    id: 'project-task-completion',
    name: 'Task Completion Rate',
    nameVi: 'Tỷ lệ hoàn thành task',
    module: 'project',
    type: 'bar-chart',
    dataSource: 'tasks',
    columns: [
      { field: 'assignee', label: 'Assignee', labelVi: 'Người phụ trách', type: 'string' },
      { field: 'completed', label: 'Completed', labelVi: 'Hoàn thành', type: 'number', aggregation: 'count' },
      { field: 'inProgress', label: 'In Progress', labelVi: 'Đang làm', type: 'number', aggregation: 'count' },
      { field: 'todo', label: 'To Do', labelVi: 'Chưa làm', type: 'number', aggregation: 'count' },
    ],
    groupBy: ['assignee'],
    isPublic: true,
  },
  
  // Finance Reports
  {
    id: 'finance-income-expense',
    name: 'Income vs Expense',
    nameVi: 'Thu chi',
    module: 'finance',
    type: 'area-chart',
    dataSource: 'transactions',
    columns: [
      { field: 'month', label: 'Month', labelVi: 'Tháng', type: 'date' },
      { field: 'income', label: 'Income', labelVi: 'Thu', type: 'currency', aggregation: 'sum' },
      { field: 'expense', label: 'Expense', labelVi: 'Chi', type: 'currency', aggregation: 'sum' },
    ],
    groupBy: ['month'],
    chartConfig: {
      xAxis: 'month',
      yAxis: ['income', 'expense'],
      colors: ['#22c55e', '#ef4444'],
      showLegend: true,
    },
    isPublic: true,
  },
  {
    id: 'finance-expense-category',
    name: 'Expense by Category',
    nameVi: 'Chi phí theo danh mục',
    module: 'finance',
    type: 'pie-chart',
    dataSource: 'expenses',
    columns: [
      { field: 'category', label: 'Category', labelVi: 'Danh mục', type: 'string' },
      { field: 'amount', label: 'Amount', labelVi: 'Số tiền', type: 'currency', aggregation: 'sum' },
    ],
    groupBy: ['category'],
    isPublic: true,
  },
  
  // Inventory Reports
  {
    id: 'inventory-stock-level',
    name: 'Stock Level by Category',
    nameVi: 'Tồn kho theo danh mục',
    module: 'inventory',
    type: 'bar-chart',
    dataSource: 'products',
    columns: [
      { field: 'category', label: 'Category', labelVi: 'Danh mục', type: 'string' },
      { field: 'inStock', label: 'In Stock', labelVi: 'Tồn kho', type: 'number', aggregation: 'sum' },
      { field: 'minStock', label: 'Min Stock', labelVi: 'Tồn tối thiểu', type: 'number', aggregation: 'sum' },
    ],
    groupBy: ['category'],
    isPublic: true,
  },
  {
    id: 'inventory-low-stock',
    name: 'Low Stock Alert',
    nameVi: 'Cảnh báo tồn kho thấp',
    module: 'inventory',
    type: 'table',
    dataSource: 'products',
    columns: [
      { field: 'sku', label: 'SKU', labelVi: 'SKU', type: 'string' },
      { field: 'name', label: 'Product', labelVi: 'Sản phẩm', type: 'string' },
      { field: 'quantity', label: 'Quantity', labelVi: 'Số lượng', type: 'number' },
      { field: 'minStock', label: 'Min Stock', labelVi: 'Tồn tối thiểu', type: 'number' },
    ],
    filters: [{ field: 'isLowStock', operator: 'eq', value: true }],
    isPublic: true,
  },
]

// =============================================================================
// REPORT ENGINE
// =============================================================================

class ReportEngine {
  private reports: Map<string, ReportConfig> = new Map()
  private dashboards: Map<string, Dashboard> = new Map()

  constructor() {
    // Initialize preset reports
    presetReports.forEach(report => {
      this.reports.set(report.id, {
        ...report,
        createdBy: 'system',
        createdAt: new Date(),
      })
    })
  }

  // Get all reports
  getAllReports(): ReportConfig[] {
    return Array.from(this.reports.values())
  }

  // Get reports by module
  getReportsByModule(module: string): ReportConfig[] {
    return Array.from(this.reports.values())
      .filter(r => r.module === module)
  }

  // Get report by ID
  getReport(id: string): ReportConfig | undefined {
    return this.reports.get(id)
  }

  // Create custom report
  createReport(report: Omit<ReportConfig, 'id' | 'createdAt'>): ReportConfig {
    const newReport: ReportConfig = {
      ...report,
      id: `report_${Date.now()}`,
      createdAt: new Date(),
    }
    this.reports.set(newReport.id, newReport)
    return newReport
  }

  // Update report
  updateReport(id: string, updates: Partial<ReportConfig>): boolean {
    const report = this.reports.get(id)
    if (!report) return false
    
    Object.assign(report, updates)
    return true
  }

  // Delete report
  deleteReport(id: string): boolean {
    return this.reports.delete(id)
  }

  // Execute report (fetch data)
  async executeReport(id: string): Promise<ReportData | null> {
    const report = this.reports.get(id)
    if (!report) return null

    // TODO: Replace with actual data fetching
    // This is a simulation
    await new Promise(resolve => setTimeout(resolve, 500))

    return {
      columns: report.columns,
      rows: [],
      total: 0,
    }
  }

  // Get all dashboards
  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values())
  }

  // Get dashboard by ID
  getDashboard(id: string): Dashboard | undefined {
    return this.dashboards.get(id)
  }

  // Create dashboard
  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt'>): Dashboard {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: `dashboard_${Date.now()}`,
      createdAt: new Date(),
    }
    this.dashboards.set(newDashboard.id, newDashboard)
    return newDashboard
  }

  // Update dashboard
  updateDashboard(id: string, updates: Partial<Dashboard>): boolean {
    const dashboard = this.dashboards.get(id)
    if (!dashboard) return false
    
    Object.assign(dashboard, updates)
    return true
  }

  // Add widget to dashboard
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): boolean {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const newWidget: DashboardWidget = {
      ...widget,
      id: `widget_${Date.now()}`,
    }
    dashboard.widgets.push(newWidget)
    return true
  }

  // Remove widget from dashboard
  removeWidget(dashboardId: string, widgetId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const index = dashboard.widgets.findIndex(w => w.id === widgetId)
    if (index === -1) return false

    dashboard.widgets.splice(index, 1)
    return true
  }

  // Update widget position
  updateWidgetPosition(dashboardId: string, widgetId: string, position: { x: number; y: number; width: number; height: number }): boolean {
    const dashboard = this.dashboards.get(dashboardId)
    if (!dashboard) return false

    const widget = dashboard.widgets.find(w => w.id === widgetId)
    if (!widget) return false

    Object.assign(widget, position)
    return true
  }
}

// =============================================================================
// DATE RANGE HELPERS
// =============================================================================

export function getDateRangeFromPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (preset) {
    case 'today':
      return { from: today, to: now }
    case 'yesterday':
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { from: yesterday, to: today }
    case 'last-7-days':
      const last7 = new Date(today)
      last7.setDate(last7.getDate() - 7)
      return { from: last7, to: now }
    case 'last-30-days':
      const last30 = new Date(today)
      last30.setDate(last30.getDate() - 30)
      return { from: last30, to: now }
    case 'this-month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
    case 'last-month':
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0),
      }
    case 'this-quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      return { from: new Date(now.getFullYear(), quarterStart, 1), to: now }
    case 'last-quarter':
      const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3
      return {
        from: new Date(now.getFullYear(), lastQuarterStart, 1),
        to: new Date(now.getFullYear(), lastQuarterStart + 3, 0),
      }
    case 'this-year':
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    case 'last-year':
      return {
        from: new Date(now.getFullYear() - 1, 0, 1),
        to: new Date(now.getFullYear() - 1, 11, 31),
      }
    default:
      return { from: today, to: now }
  }
}

// =============================================================================
// FORMAT HELPERS
// =============================================================================

export function formatReportValue(value: unknown, type: ReportColumn['type']): string {
  if (value === null || value === undefined) return '-'
  
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value))
    case 'number':
      return new Intl.NumberFormat('vi-VN').format(Number(value))
    case 'percentage':
      return `${Number(value).toFixed(1)}%`
    case 'date':
      return new Date(value as string).toLocaleDateString('vi-VN')
    case 'boolean':
      return value ? 'Có' : 'Không'
    default:
      return String(value)
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const reportEngine = new ReportEngine()

// =============================================================================
// REACT HOOKS
// =============================================================================

import { useState, useEffect } from 'react'

export function useReport(id: string) {
  const [report, setReport] = useState<ReportConfig | undefined>()
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const r = reportEngine.getReport(id)
    setReport(r)
    
    if (r) {
      setLoading(true)
      reportEngine.executeReport(id).then(d => {
        setData(d)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [id])

  return { report, data, loading }
}

export function useReports(module?: string) {
  const [reports, setReports] = useState<ReportConfig[]>([])

  useEffect(() => {
    if (module) {
      setReports(reportEngine.getReportsByModule(module))
    } else {
      setReports(reportEngine.getAllReports())
    }
  }, [module])

  return reports
}

export function useDashboard(id: string) {
  const [dashboard, setDashboard] = useState<Dashboard | undefined>()

  useEffect(() => {
    setDashboard(reportEngine.getDashboard(id))
  }, [id])

  return dashboard
}

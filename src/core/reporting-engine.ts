/**
 * Reporting Engine - Dynamic Dashboards and Report Builder
 * 
 * Supports custom report definitions, dynamic filtering,
 * and export to CSV/XLSX/PDF.
 */

import { 
  ReportDefinition, 
  ReportConfig, 
  ReportColumn, 
  ReportFilter, 
  ReportAggregation,
  ReportType,
  ChartType,
  PaginatedResponse,
  User,
} from './types';
import { auditLog } from './audit-log';

// ============================================
// Types
// ============================================

interface ReportData {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  aggregations?: Record<string, number>;
  total: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
  }[];
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  numberFormat?: string;
}

interface DataSource {
  id: string;
  name: string;
  moduleId: string;
  query: (filters: ReportFilter[], pagination?: { page: number; pageSize: number }) => Promise<{
    data: Record<string, unknown>[];
    total: number;
  }>;
  getColumns: () => ReportColumn[];
}

interface DashboardWidget {
  id: string;
  type: 'report' | 'chart' | 'metric' | 'custom';
  reportId?: string;
  title: string;
  config: Record<string, unknown>;
  position: { x: number; y: number; w: number; h: number };
}

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: DashboardWidget[];
  isDefault?: boolean;
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Report Engine Class
// ============================================

class ReportingEngine {
  private reports: Map<string, ReportDefinition> = new Map();
  private dashboards: Map<string, Dashboard> = new Map();
  private dataSources: Map<string, DataSource> = new Map();
  private chartColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];

  // ============================================
  // Data Source Management
  // ============================================

  /**
   * Register a data source
   */
  registerDataSource(dataSource: DataSource): void {
    this.dataSources.set(dataSource.id, dataSource);
  }

  /**
   * Get data source
   */
  getDataSource(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  /**
   * Get all data sources
   */
  getAllDataSources(): DataSource[] {
    return Array.from(this.dataSources.values());
  }

  /**
   * Get data sources for a module
   */
  getModuleDataSources(moduleId: string): DataSource[] {
    return this.getAllDataSources().filter(ds => ds.moduleId === moduleId);
  }

  // ============================================
  // Report Management
  // ============================================

  /**
   * Create a report definition
   */
  createReport(report: Omit<ReportDefinition, 'id' | 'createdAt' | 'updatedAt'>): ReportDefinition {
    const newReport: ReportDefinition = {
      ...report,
      id: this.generateId('report'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reports.set(newReport.id, newReport);
    return newReport;
  }

  /**
   * Update a report
   */
  updateReport(reportId: string, updates: Partial<ReportDefinition>): ReportDefinition {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report "${reportId}" not found`);
    }

    const updated: ReportDefinition = {
      ...report,
      ...updates,
      id: reportId,
      updatedAt: new Date(),
    };

    this.reports.set(reportId, updated);
    return updated;
  }

  /**
   * Delete a report
   */
  deleteReport(reportId: string): boolean {
    return this.reports.delete(reportId);
  }

  /**
   * Get a report
   */
  getReport(reportId: string): ReportDefinition | undefined {
    return this.reports.get(reportId);
  }

  /**
   * Get all reports
   */
  getAllReports(): ReportDefinition[] {
    return Array.from(this.reports.values());
  }

  /**
   * Get reports by module
   */
  getModuleReports(moduleId: string): ReportDefinition[] {
    return this.getAllReports().filter(r => r.moduleId === moduleId);
  }

  /**
   * Get public reports
   */
  getPublicReports(): ReportDefinition[] {
    return this.getAllReports().filter(r => r.isPublic);
  }

  /**
   * Get user's reports
   */
  getUserReports(userId: string): ReportDefinition[] {
    return this.getAllReports().filter(r => r.createdBy === userId || r.isPublic);
  }

  // ============================================
  // Report Execution
  // ============================================

  /**
   * Execute a report
   */
  async executeReport(
    reportId: string,
    filters?: ReportFilter[],
    pagination?: { page: number; pageSize: number }
  ): Promise<ReportData> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report "${reportId}" not found`);
    }

    const dataSource = this.dataSources.get(report.config.dataSource);
    if (!dataSource) {
      throw new Error(`Data source "${report.config.dataSource}" not found`);
    }

    // Merge report filters with provided filters
    const allFilters = [...report.filters, ...(filters || [])];

    // Query data
    const { data, total } = await dataSource.query(allFilters, pagination);

    // Apply grouping if configured
    let processedData = data;
    if (report.config.groupBy && report.config.groupBy.length > 0) {
      processedData = this.groupData(data, report.config.groupBy);
    }

    // Apply sorting if configured
    if (report.config.sortBy && report.config.sortBy.length > 0) {
      processedData = this.sortData(processedData, report.config.sortBy);
    }

    // Calculate aggregations
    const aggregations = report.config.aggregations
      ? this.calculateAggregations(data, report.config.aggregations)
      : undefined;

    return {
      columns: report.config.columns || dataSource.getColumns(),
      rows: processedData,
      aggregations,
      total,
    };
  }

  /**
   * Execute a report and return chart data
   */
  async executeChartReport(
    reportId: string,
    filters?: ReportFilter[]
  ): Promise<ChartData> {
    const report = this.reports.get(reportId);
    if (!report || report.type !== 'chart') {
      throw new Error(`Chart report "${reportId}" not found`);
    }

    const reportData = await this.executeReport(reportId, filters);
    return this.transformToChartData(reportData, report.config);
  }

  private groupData(
    data: Record<string, unknown>[],
    groupBy: string[]
  ): Record<string, unknown>[] {
    const groups = new Map<string, Record<string, unknown>[]>();

    data.forEach(row => {
      const key = groupBy.map(field => String(row[field])).join('|');
      const group = groups.get(key) || [];
      group.push(row);
      groups.set(key, group);
    });

    // Return grouped data with first row of each group
    // In real implementation, would aggregate numeric values
    return Array.from(groups.values()).map(group => group[0]);
  }

  private sortData(
    data: Record<string, unknown>[],
    sortBy: { field: string; direction: 'asc' | 'desc' }[]
  ): Record<string, unknown>[] {
    return [...data].sort((a, b) => {
      for (const { field, direction } of sortBy) {
        const aVal = String(a[field] ?? '');
        const bVal = String(b[field] ?? '');

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;

        if (comparison !== 0) {
          return direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }

  private calculateAggregations(
    data: Record<string, unknown>[],
    aggregations: ReportAggregation[]
  ): Record<string, number> {
    const result: Record<string, number> = {};

    for (const agg of aggregations) {
      const values = data.map(row => Number(row[agg.field]) || 0);

      switch (agg.function) {
        case 'sum':
          result[agg.label] = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result[agg.label] = values.length > 0
            ? values.reduce((a, b) => a + b, 0) / values.length
            : 0;
          break;
        case 'count':
          result[agg.label] = values.length;
          break;
        case 'min':
          result[agg.label] = Math.min(...values);
          break;
        case 'max':
          result[agg.label] = Math.max(...values);
          break;
      }
    }

    return result;
  }

  private transformToChartData(data: ReportData, config: ReportConfig): ChartData {
    const labelField = config.groupBy?.[0] || 'label';
    const dataFields = config.columns?.filter(c => c.type === 'number').map(c => c.field) || [];

    const labels = data.rows.map(row => String(row[labelField]));
    const datasets = dataFields.map((field, index) => ({
      label: config.columns?.find(c => c.field === field)?.label || field,
      data: data.rows.map(row => Number(row[field]) || 0),
      backgroundColor: this.chartColors[index % this.chartColors.length],
      borderColor: this.chartColors[index % this.chartColors.length],
    }));

    return { labels, datasets };
  }

  // ============================================
  // Export Functions
  // ============================================

  /**
   * Export report to specified format
   */
  async exportReport(
    reportId: string,
    options: ExportOptions,
    filters?: ReportFilter[],
    user?: User
  ): Promise<Blob> {
    const reportData = await this.executeReport(reportId, filters);
    const report = this.reports.get(reportId)!;

    // Log export action
    if (user) {
      await auditLog.logExport(
        user,
        report.moduleId,
        'report',
        `Exported report "${report.name}" to ${options.format}`
      );
    }

    switch (options.format) {
      case 'csv':
        return this.exportToCSV(reportData, options);
      case 'xlsx':
        return this.exportToXLSX(reportData, options);
      case 'pdf':
        return this.exportToPDF(reportData, report, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private exportToCSV(data: ReportData, options: ExportOptions): Blob {
    const lines: string[] = [];

    // Headers
    if (options.includeHeaders !== false) {
      lines.push(data.columns.map(c => this.escapeCSV(c.label)).join(','));
    }

    // Data rows
    for (const row of data.rows) {
      const values = data.columns.map(col => {
        const value = row[col.field];
        return this.escapeCSV(this.formatValue(value, col, options));
      });
      lines.push(values.join(','));
    }

    // Aggregations
    if (data.aggregations) {
      lines.push(''); // Empty line
      for (const [label, value] of Object.entries(data.aggregations)) {
        lines.push(`${label},${value}`);
      }
    }

    return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  }

  private exportToXLSX(data: ReportData, options: ExportOptions): Blob {
    // In real implementation, would use a library like xlsx
    // For now, return CSV as placeholder
    return this.exportToCSV(data, options);
  }

  private exportToPDF(data: ReportData, report: ReportDefinition, options: ExportOptions): Blob {
    // In real implementation, would use a library like pdfmake or jspdf
    // For now, return placeholder
    const content = `Report: ${report.name}\n\n${JSON.stringify(data, null, 2)}`;
    return new Blob([content], { type: 'application/pdf' });
  }

  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private formatValue(value: unknown, column: ReportColumn, options: ExportOptions): string {
    if (value === null || value === undefined) {
      return '';
    }

    switch (column.type) {
      case 'date':
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return String(value);
      case 'number':
        return String(value);
      case 'currency':
        return String(value);
      case 'boolean':
        return value ? 'Yes' : 'No';
      default:
        return String(value);
    }
  }

  // ============================================
  // Dashboard Management
  // ============================================

  /**
   * Create a dashboard
   */
  createDashboard(dashboard: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Dashboard {
    const newDashboard: Dashboard = {
      ...dashboard,
      id: this.generateId('dashboard'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.dashboards.set(newDashboard.id, newDashboard);
    return newDashboard;
  }

  /**
   * Update a dashboard
   */
  updateDashboard(dashboardId: string, updates: Partial<Dashboard>): Dashboard {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard "${dashboardId}" not found`);
    }

    const updated: Dashboard = {
      ...dashboard,
      ...updates,
      id: dashboardId,
      updatedAt: new Date(),
    };

    this.dashboards.set(dashboardId, updated);
    return updated;
  }

  /**
   * Delete a dashboard
   */
  deleteDashboard(dashboardId: string): boolean {
    return this.dashboards.delete(dashboardId);
  }

  /**
   * Get a dashboard
   */
  getDashboard(dashboardId: string): Dashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  /**
   * Get all dashboards
   */
  getAllDashboards(): Dashboard[] {
    return Array.from(this.dashboards.values());
  }

  /**
   * Get user's dashboards
   */
  getUserDashboards(userId: string): Dashboard[] {
    return this.getAllDashboards().filter(d => d.createdBy === userId || d.isPublic);
  }

  /**
   * Get default dashboard
   */
  getDefaultDashboard(userId: string): Dashboard | undefined {
    return this.getUserDashboards(userId).find(d => d.isDefault);
  }

  /**
   * Add widget to dashboard
   */
  addWidget(dashboardId: string, widget: Omit<DashboardWidget, 'id'>): Dashboard {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard "${dashboardId}" not found`);
    }

    const newWidget: DashboardWidget = {
      ...widget,
      id: this.generateId('widget'),
    };

    return this.updateDashboard(dashboardId, {
      widgets: [...dashboard.widgets, newWidget],
    });
  }

  /**
   * Update widget
   */
  updateWidget(dashboardId: string, widgetId: string, updates: Partial<DashboardWidget>): Dashboard {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard "${dashboardId}" not found`);
    }

    const widgets = dashboard.widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates, id: widgetId } : w
    );

    return this.updateDashboard(dashboardId, { widgets });
  }

  /**
   * Remove widget
   */
  removeWidget(dashboardId: string, widgetId: string): Dashboard {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      throw new Error(`Dashboard "${dashboardId}" not found`);
    }

    return this.updateDashboard(dashboardId, {
      widgets: dashboard.widgets.filter(w => w.id !== widgetId),
    });
  }

  // ============================================
  // Quick Metrics
  // ============================================

  /**
   * Get quick metric value
   */
  async getMetric(
    dataSourceId: string,
    field: string,
    aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max',
    filters?: ReportFilter[]
  ): Promise<number> {
    const dataSource = this.dataSources.get(dataSourceId);
    if (!dataSource) {
      throw new Error(`Data source "${dataSourceId}" not found`);
    }

    const { data } = await dataSource.query(filters || []);
    const values = data.map(row => Number(row[field]) || 0);

    switch (aggregation) {
      case 'sum':
        return values.reduce((a, b) => a + b, 0);
      case 'avg':
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'count':
        return values.length;
      case 'min':
        return values.length > 0 ? Math.min(...values) : 0;
      case 'max':
        return values.length > 0 ? Math.max(...values) : 0;
    }
  }

  /**
   * Compare metrics over time periods
   */
  async compareMetrics(
    dataSourceId: string,
    field: string,
    aggregation: 'sum' | 'avg' | 'count',
    dateField: string,
    currentPeriod: { from: Date; to: Date },
    previousPeriod: { from: Date; to: Date }
  ): Promise<{ current: number; previous: number; change: number; changePercent: number }> {
    const current = await this.getMetric(dataSourceId, field, aggregation, [
      { field: dateField, operator: 'gte', value: currentPeriod.from, label: '' },
      { field: dateField, operator: 'lte', value: currentPeriod.to, label: '' },
    ]);

    const previous = await this.getMetric(dataSourceId, field, aggregation, [
      { field: dateField, operator: 'gte', value: previousPeriod.from, label: '' },
      { field: dateField, operator: 'lte', value: previousPeriod.to, label: '' },
    ]);

    const change = current - previous;
    const changePercent = previous !== 0 ? (change / previous) * 100 : 0;

    return { current, previous, change, changePercent };
  }

  // ============================================
  // Utility
  // ============================================

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const reportingEngine = new ReportingEngine();

export type { 
  ReportData, 
  ChartData, 
  ExportOptions, 
  DataSource, 
  DashboardWidget, 
  Dashboard,
};

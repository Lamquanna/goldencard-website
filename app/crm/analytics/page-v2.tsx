'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Briefcase, DollarSign, Package,
  Calendar, ArrowUpRight, ArrowDownRight, Activity, Target, Clock, MapPin,
  Sun, Wind, Zap, PieChart, LineChart as LineChartIcon, Filter, Download,
  ChevronDown, Eye, RefreshCcw, Plus, Settings, Maximize2, MoreHorizontal,
  FileText, Share2, Bell, AlertTriangle, CheckCircle, XCircle, Building,
  Truck, ShoppingCart, UserCheck, Percent, Globe, Layers, LayoutGrid,
  Table as TableIcon, Gauge, ChevronRight, Play, Pause, Edit2, Trash2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface KPI {
  id: string;
  name: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'currency' | 'percentage' | 'capacity';
  icon: React.ElementType;
  color: string;
  target?: number;
}

interface Widget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'kpi' | 'funnel' | 'map' | 'gauge' | 'list';
  chartType?: 'bar' | 'line' | 'pie' | 'donut' | 'area';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
}

interface Report {
  id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  lastGenerated: string;
  schedule: string;
  status: 'ready' | 'generating' | 'scheduled';
  recipients: string[];
}

interface Alert {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'critical' | 'info' | 'success';
  timestamp: string;
  acknowledged: boolean;
}

// ============================================
// MOCK DATA
// ============================================

const kpis: KPI[] = [
  {
    id: 'revenue',
    name: 'Doanh thu tháng',
    value: 12500000000,
    previousValue: 10800000000,
    change: 15.7,
    changeType: 'increase',
    format: 'currency',
    icon: DollarSign,
    color: 'green',
    target: 15000000000,
  },
  {
    id: 'projects',
    name: 'Dự án đang thực hiện',
    value: 12,
    previousValue: 10,
    change: 20,
    changeType: 'increase',
    format: 'number',
    icon: Briefcase,
    color: 'blue',
  },
  {
    id: 'leads',
    name: 'Leads mới',
    value: 156,
    previousValue: 142,
    change: 9.9,
    changeType: 'increase',
    format: 'number',
    icon: Users,
    color: 'purple',
  },
  {
    id: 'conversion',
    name: 'Tỷ lệ chuyển đổi',
    value: 22.8,
    previousValue: 20.5,
    change: 11.2,
    changeType: 'increase',
    format: 'percentage',
    icon: Percent,
    color: 'indigo',
  },
  {
    id: 'capacity',
    name: 'Tổng công suất',
    value: 850,
    previousValue: 750,
    change: 13.3,
    changeType: 'increase',
    format: 'capacity',
    icon: Zap,
    color: 'yellow',
  },
  {
    id: 'inventory_value',
    name: 'Giá trị tồn kho',
    value: 45000000000,
    previousValue: 42000000000,
    change: 7.1,
    changeType: 'increase',
    format: 'currency',
    icon: Package,
    color: 'orange',
  },
  {
    id: 'employees',
    name: 'Nhân sự hiện tại',
    value: 145,
    previousValue: 138,
    change: 5.1,
    changeType: 'increase',
    format: 'number',
    icon: UserCheck,
    color: 'teal',
  },
  {
    id: 'clients',
    name: 'Khách hàng',
    value: 89,
    previousValue: 82,
    change: 8.5,
    changeType: 'increase',
    format: 'number',
    icon: Building,
    color: 'cyan',
  },
];

const revenueByMonth = [
  { month: 'T1', actual: 8.5, target: 9, lastYear: 7.2 },
  { month: 'T2', actual: 9.2, target: 9, lastYear: 7.8 },
  { month: 'T3', actual: 10.1, target: 10, lastYear: 8.5 },
  { month: 'T4', actual: 9.8, target: 10, lastYear: 8.1 },
  { month: 'T5', actual: 11.5, target: 11, lastYear: 9.2 },
  { month: 'T6', actual: 12.5, target: 12, lastYear: 10.1 },
  { month: 'T7', actual: 0, target: 13, lastYear: 10.8 },
  { month: 'T8', actual: 0, target: 14, lastYear: 11.5 },
  { month: 'T9', actual: 0, target: 14, lastYear: 12.2 },
  { month: 'T10', actual: 0, target: 15, lastYear: 13.0 },
  { month: 'T11', actual: 0, target: 15, lastYear: 14.5 },
  { month: 'T12', actual: 0, target: 16, lastYear: 15.2 },
];

const projectsByStatus = [
  { status: 'Hoàn thành', count: 28, color: '#22c55e', percentage: 62 },
  { status: 'Đang thực hiện', count: 12, color: '#3b82f6', percentage: 27 },
  { status: 'Lên kế hoạch', count: 5, color: '#f59e0b', percentage: 11 },
];

const leadsBySource = [
  { source: 'Website', count: 420, percentage: 34 },
  { source: 'Facebook', count: 310, percentage: 25 },
  { source: 'Zalo', count: 248, percentage: 20 },
  { source: 'Giới thiệu', count: 155, percentage: 12 },
  { source: 'Khác', count: 117, percentage: 9 },
];

const salesFunnel = [
  { stage: 'Leads mới', count: 1250, value: 125000000000, percentage: 100 },
  { stage: 'Đã liên hệ', count: 890, value: 98000000000, percentage: 71 },
  { stage: 'Qualified', count: 423, value: 52000000000, percentage: 34 },
  { stage: 'Đề xuất báo giá', count: 380, value: 48000000000, percentage: 30 },
  { stage: 'Đàm phán', count: 320, value: 42000000000, percentage: 26 },
  { stage: 'Ký hợp đồng', count: 285, value: 38000000000, percentage: 23 },
];

const topProducts = [
  { name: 'JA Solar 550W Mono', sold: 12500, revenue: 43750000000, growth: 25 },
  { name: 'Huawei SUN2000-100KTL', sold: 85, revenue: 12750000000, growth: 18 },
  { name: 'LONGi Hi-MO 5', sold: 8200, revenue: 28700000000, growth: 32 },
  { name: 'SMA Sunny Tripower', sold: 45, revenue: 5850000000, growth: 15 },
  { name: 'Canadian Solar BiHiKu', sold: 6800, revenue: 23800000000, growth: 22 },
];

const regionPerformance = [
  { region: 'Miền Nam', projects: 28, revenue: 85000000000, growth: 18, capacity: 520 },
  { region: 'Miền Trung', projects: 12, revenue: 30000000000, growth: 25, capacity: 230 },
  { region: 'Miền Bắc', projects: 5, revenue: 10000000000, growth: 12, capacity: 100 },
];

const scheduledReports: Report[] = [
  {
    id: 'RPT001',
    name: 'Báo cáo doanh thu hàng ngày',
    type: 'daily',
    lastGenerated: '2024-01-15 06:00',
    schedule: '06:00 hàng ngày',
    status: 'ready',
    recipients: ['ceo@goldenenergy.vn', 'sales@goldenenergy.vn'],
  },
  {
    id: 'RPT002',
    name: 'Báo cáo hiệu suất tuần',
    type: 'weekly',
    lastGenerated: '2024-01-13 08:00',
    schedule: 'Thứ 2 hàng tuần',
    status: 'ready',
    recipients: ['management@goldenenergy.vn'],
  },
  {
    id: 'RPT003',
    name: 'Báo cáo tổng hợp tháng',
    type: 'monthly',
    lastGenerated: '2024-01-01 09:00',
    schedule: 'Ngày 1 hàng tháng',
    status: 'scheduled',
    recipients: ['board@goldenenergy.vn'],
  },
  {
    id: 'RPT004',
    name: 'Phân tích leads chi tiết',
    type: 'custom',
    lastGenerated: '2024-01-14 14:30',
    schedule: 'Theo yêu cầu',
    status: 'generating',
    recipients: ['marketing@goldenenergy.vn'],
  },
];

const alerts: Alert[] = [
  {
    id: 'ALT001',
    title: 'Tồn kho thấp',
    message: 'JA Solar 550W còn dưới 100 tấm - cần đặt hàng bổ sung',
    type: 'warning',
    timestamp: '10 phút trước',
    acknowledged: false,
  },
  {
    id: 'ALT002',
    title: 'Doanh thu vượt mục tiêu',
    message: 'Doanh thu tháng 6 vượt 4.2% so với mục tiêu',
    type: 'success',
    timestamp: '2 giờ trước',
    acknowledged: false,
  },
  {
    id: 'ALT003',
    title: 'Lead chưa xử lý',
    message: '12 leads quá hạn SLA 24h chưa được liên hệ',
    type: 'critical',
    timestamp: '3 giờ trước',
    acknowledged: false,
  },
];

const teamPerformance = [
  { name: 'Trần Minh Quân', role: 'Sales Manager', deals: 15, revenue: 18500000000, target: 20000000000, avatar: 'TMQ' },
  { name: 'Lê Thị Hương', role: 'Senior Sales', deals: 12, revenue: 14200000000, target: 15000000000, avatar: 'LTH' },
  { name: 'Nguyễn Văn A', role: 'Sales Executive', deals: 8, revenue: 9800000000, target: 10000000000, avatar: 'NVA' },
  { name: 'Phạm Thị B', role: 'Sales Executive', deals: 6, revenue: 7200000000, target: 8000000000, avatar: 'PTB' },
];

// ============================================
// COMPONENT
// ============================================

type TimeRange = '7d' | '30d' | '90d' | 'ytd' | '1y' | 'custom';
type ViewMode = 'overview' | 'sales' | 'operations' | 'hr' | 'custom';

export default function AnalyticsPageV2() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showAlerts, setShowAlerts] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [selectedKpis, setSelectedKpis] = useState<string[]>(['revenue', 'projects', 'leads', 'conversion']);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} tỷ`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)} triệu`;
    return amount.toLocaleString('vi-VN');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const getKpiValue = (kpi: KPI) => {
    switch (kpi.format) {
      case 'currency':
        return formatCurrency(kpi.value as number);
      case 'percentage':
        return `${kpi.value}%`;
      case 'capacity':
        return `${kpi.value} MW`;
      default:
        return formatNumber(kpi.value as number);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; light: string }> = {
      green: { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-100' },
      blue: { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-100' },
      purple: { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-100' },
      indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-100' },
      yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-100' },
      orange: { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-100' },
      teal: { bg: 'bg-teal-500', text: 'text-teal-600', light: 'bg-teal-100' },
      cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-100' },
    };
    return colors[color] || colors.blue;
  };

  const displayedKpis = useMemo(() => {
    return kpis.filter(kpi => selectedKpis.includes(kpi.id));
  }, [selectedKpis]);

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics & Business Intelligence</h1>
                <p className="text-sm text-gray-500">
                  Real-time insights & performance metrics
                </p>
              </div>
              
              {/* View Mode Tabs */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1 ml-6">
                {[
                  { key: 'overview', label: 'Tổng quan' },
                  { key: 'sales', label: 'Sales' },
                  { key: 'operations', label: 'Vận hành' },
                  { key: 'hr', label: 'Nhân sự' },
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key as ViewMode)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      viewMode === mode.key
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
                <option value="90d">90 ngày qua</option>
                <option value="ytd">Từ đầu năm</option>
                <option value="1y">1 năm qua</option>
                <option value="custom">Tùy chỉnh...</option>
              </select>

              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  isAutoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                }`}
                title={isAutoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              >
                {isAutoRefresh ? <Play size={18} /> : <Pause size={18} />}
              </button>

              {/* Alerts */}
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Bell size={20} />
                {unacknowledgedAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unacknowledgedAlerts.length}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => setShowWidgetSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <Settings size={20} />
              </button>

              {/* Export */}
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <Download size={18} />
                <span className="hidden sm:inline">Xuất báo cáo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Alerts Panel */}
        {showAlerts && unacknowledgedAlerts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell size={18} className="text-yellow-500" />
                Cảnh báo hệ thống
              </h3>
              <button
                onClick={() => setShowAlerts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {unacknowledgedAlerts.map(alert => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    alert.type === 'critical' ? 'bg-red-50 border border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {alert.type === 'critical' && <AlertTriangle className="text-red-500" size={20} />}
                    {alert.type === 'warning' && <AlertTriangle className="text-yellow-500" size={20} />}
                    {alert.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                    {alert.type === 'info' && <Activity className="text-blue-500" size={20} />}
                    <div>
                      <p className="font-medium text-gray-900">{alert.title}</p>
                      <p className="text-sm text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{alert.timestamp}</span>
                    <button className="text-gray-400 hover:text-gray-600">
                      <CheckCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayedKpis.map(kpi => {
            const Icon = kpi.icon;
            const colors = getColorClasses(kpi.color);
            const targetPercent = kpi.target ? ((kpi.value as number) / kpi.target) * 100 : null;
            
            return (
              <div key={kpi.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className={`p-2 ${colors.light} rounded-lg`}>
                    <Icon className={colors.text} size={24} />
                  </div>
                  {kpi.change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${
                      kpi.changeType === 'increase' ? 'text-green-600' : 
                      kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {kpi.changeType === 'increase' ? <TrendingUp size={16} /> : 
                       kpi.changeType === 'decrease' ? <TrendingDown size={16} /> : null}
                      <span>{Math.abs(kpi.change)}%</span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-sm text-gray-500">{kpi.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getKpiValue(kpi)}</p>
                  {targetPercent !== null && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Mục tiêu</span>
                        <span>{targetPercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${colors.bg} rounded-full transition-all`}
                          style={{ width: `${Math.min(targetPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart - Large */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">Doanh thu theo tháng</h3>
                <p className="text-sm text-gray-500">So sánh thực tế vs mục tiêu vs năm trước</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-500">Thực tế</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500">Mục tiêu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                  <span className="text-gray-500">Năm trước</span>
                </div>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="h-72 flex items-end justify-around gap-2">
              {revenueByMonth.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex justify-center gap-0.5 items-end h-56">
                    {data.actual > 0 && (
                      <div 
                        className="w-5 bg-yellow-500 rounded-t transition-all hover:bg-yellow-600 cursor-pointer"
                        style={{ height: `${(data.actual / 18) * 100}%` }}
                        title={`Thực tế: ${data.actual} tỷ`}
                      />
                    )}
                    <div 
                      className="w-2 bg-gray-200 rounded-t"
                      style={{ height: `${(data.target / 18) * 100}%` }}
                      title={`Mục tiêu: ${data.target} tỷ`}
                    />
                    <div 
                      className="w-2 bg-blue-200 rounded-t"
                      style={{ height: `${(data.lastYear / 18) * 100}%` }}
                      title={`Năm trước: ${data.lastYear} tỷ`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Tổng YTD</p>
                <p className="text-lg font-bold text-gray-900">61.6 tỷ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mục tiêu YTD</p>
                <p className="text-lg font-bold text-gray-500">61 tỷ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Đạt</p>
                <p className="text-lg font-bold text-green-600">101%</p>
              </div>
            </div>
          </div>

          {/* Project Status Donut */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Tình trạng dự án</h3>
            
            {/* Simple Donut Chart */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Background circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="15" />
                {/* Segments */}
                {projectsByStatus.reduce((acc, item, idx) => {
                  const prevTotal = acc.offset;
                  const circumference = 2 * Math.PI * 40;
                  const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                  
                  acc.elements.push(
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={-prevTotal}
                      className="transition-all duration-500"
                    />
                  );
                  
                  acc.offset += (item.percentage / 100) * circumference;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">45</span>
                <span className="text-sm text-gray-500">Dự án</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {projectsByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.status}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Funnel */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Phễu chuyển đổi Sales</h3>
            <div className="space-y-3">
              {salesFunnel.map((stage, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{stage.stage}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-900">{stage.count}</span>
                      <span className="text-xs text-gray-500 w-20 text-right">{formatCurrency(stage.value)}</span>
                    </div>
                  </div>
                  <div className="h-8 bg-gray-100 rounded relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded transition-all flex items-center justify-end pr-2"
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.percentage > 15 && (
                        <span className="text-xs font-medium text-white">{stage.percentage}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="text-sm text-gray-500">Tỷ lệ chuyển đổi tổng</span>
              <span className="text-lg font-bold text-green-600">22.8%</span>
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Nguồn leads</h3>
            <div className="space-y-4">
              {leadsBySource.map((source, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{source.count}</span>
                      <span className="text-xs text-gray-500">({source.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">1,250</p>
                  <p className="text-xs text-gray-500">Tổng leads tháng</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+12%</p>
                  <p className="text-xs text-gray-500">So với tháng trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top sản phẩm bán chạy</h3>
              <button className="text-sm text-yellow-600 hover:text-yellow-700">Xem tất cả</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Sản phẩm</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Đã bán</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Doanh thu</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-500">Tăng trưởng</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 text-sm text-gray-600">{formatNumber(product.sold)}</td>
                      <td className="text-right py-3 text-sm font-medium text-gray-900">{formatCurrency(product.revenue)}</td>
                      <td className="text-right py-3">
                        <span className="text-sm text-green-600 flex items-center justify-end gap-1">
                          <TrendingUp size={14} />
                          {product.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Hiệu suất nhân viên</h3>
            <div className="space-y-4">
              {teamPerformance.map((member, idx) => {
                const targetPercent = (member.revenue / member.target) * 100;
                return (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">
                        {member.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{member.deals}</p>
                        <p className="text-xs text-gray-500">deals</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{formatCurrency(member.revenue)}</span>
                      <span>{targetPercent.toFixed(0)}% mục tiêu</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          targetPercent >= 90 ? 'bg-green-500' : 
                          targetPercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(targetPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Region Performance */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Hiệu suất theo khu vực</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionPerformance.map((region, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-yellow-500" size={20} />
                    <span className="font-semibold text-gray-900">{region.region}</span>
                  </div>
                  <span className={`text-sm font-medium ${region.growth >= 20 ? 'text-green-600' : 'text-blue-600'}`}>
                    +{region.growth}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Dự án</p>
                    <p className="text-xl font-bold text-gray-900">{region.projects}</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg">
                    <p className="text-xs text-gray-500">Công suất</p>
                    <p className="text-xl font-bold text-yellow-600">{region.capacity} MW</p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-white rounded-lg">
                  <p className="text-xs text-gray-500">Doanh thu</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(region.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Báo cáo định kỳ</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 text-sm">
              <Plus size={16} />
              Tạo báo cáo mới
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Tên báo cáo</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Loại</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Lịch</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Lần cuối</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Trạng thái</th>
                  <th className="text-right py-3 text-sm font-medium text-gray-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {scheduledReports.map(report => (
                  <tr key={report.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="text-gray-400" size={18} />
                        <span className="text-sm font-medium text-gray-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.type === 'daily' ? 'bg-blue-100 text-blue-600' :
                        report.type === 'weekly' ? 'bg-purple-100 text-purple-600' :
                        report.type === 'monthly' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {report.type === 'daily' ? 'Hàng ngày' :
                         report.type === 'weekly' ? 'Hàng tuần' :
                         report.type === 'monthly' ? 'Hàng tháng' : 'Tùy chỉnh'}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-600">{report.schedule}</td>
                    <td className="py-3 text-sm text-gray-600">{report.lastGenerated}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        report.status === 'ready' ? 'bg-green-100 text-green-600' :
                        report.status === 'generating' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {report.status === 'ready' ? 'Sẵn sàng' :
                         report.status === 'generating' ? 'Đang tạo...' : 'Đã lên lịch'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <Download size={16} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <Share2 size={16} />
                        </button>
                        <button className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Generation Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Xuất báo cáo</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại báo cáo</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <option>Báo cáo tổng quan</option>
                  <option>Báo cáo doanh thu chi tiết</option>
                  <option>Báo cáo leads & chuyển đổi</option>
                  <option>Báo cáo dự án</option>
                  <option>Báo cáo tồn kho</option>
                  <option>Báo cáo nhân sự</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng thời gian</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  <input type="date" className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Định dạng</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" defaultChecked className="text-yellow-500" />
                    <span className="text-sm">PDF</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" className="text-yellow-500" />
                    <span className="text-sm">Excel</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" className="text-yellow-500" />
                    <span className="text-sm">CSV</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-yellow-500" />
                  <span className="text-sm text-gray-700">Gửi email khi hoàn thành</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                Tạo báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Widget Settings Modal */}
      {showWidgetSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tùy chỉnh Dashboard</h3>
              <button onClick={() => setShowWidgetSettings(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={20} />
              </button>
            </div>
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Chọn KPIs hiển thị</h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {kpis.map(kpi => {
                  const Icon = kpi.icon;
                  const isSelected = selectedKpis.includes(kpi.id);
                  return (
                    <label
                      key={kpi.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedKpis([...selectedKpis, kpi.id]);
                          } else {
                            setSelectedKpis(selectedKpis.filter(id => id !== kpi.id));
                          }
                        }}
                        className="rounded text-yellow-500"
                      />
                      <Icon size={18} className={getColorClasses(kpi.color).text} />
                      <span className="text-sm font-medium text-gray-900">{kpi.name}</span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Tự động làm mới</h4>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isAutoRefresh}
                      onChange={(e) => setIsAutoRefresh(e.target.checked)}
                      className="rounded text-yellow-500"
                    />
                    <span className="text-sm text-gray-600">Bật</span>
                  </label>
                  {isAutoRefresh && (
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value={30}>30 giây</option>
                      <option value={60}>1 phút</option>
                      <option value={300}>5 phút</option>
                      <option value={600}>10 phút</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, TrendingDown, Users, Briefcase, DollarSign, Package,
  Calendar, ArrowUpRight, ArrowDownRight, Activity, Target, Clock, MapPin,
  Sun, Wind, Zap, PieChart, LineChart as LineChartIcon, Filter, Download,
  ChevronDown, Eye, RefreshCcw
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

// ============================================
// MOCK DATA
// ============================================

const revenueData = {
  total: 125000000000,
  thisMonth: 12500000000,
  lastMonth: 10800000000,
  growth: 15.7,
};

const projectStats = {
  total: 45,
  inProgress: 12,
  completed: 28,
  planned: 5,
  onHold: 0,
};

const leadStats = {
  total: 1250,
  new: 156,
  qualified: 423,
  converted: 285,
  conversionRate: 22.8,
};

const capacityStats = {
  totalMW: 850,
  solarMW: 620,
  windMW: 230,
  thisYearMW: 125,
};

const monthlyRevenue = [
  { month: 'T1', value: 8.5, target: 9 },
  { month: 'T2', value: 9.2, target: 9 },
  { month: 'T3', value: 10.1, target: 10 },
  { month: 'T4', value: 9.8, target: 10 },
  { month: 'T5', value: 11.5, target: 11 },
  { month: 'T6', value: 12.5, target: 12 },
];

const projectsByCategory = [
  { name: 'Solar Rooftop', count: 18, capacity: 125, color: 'bg-yellow-500' },
  { name: 'Solar Farm', count: 8, capacity: 450, color: 'bg-orange-500' },
  { name: 'Wind Onshore', count: 5, capacity: 150, color: 'bg-cyan-500' },
  { name: 'Wind Offshore', count: 2, capacity: 80, color: 'bg-blue-500' },
  { name: 'EPC', count: 7, capacity: 0, color: 'bg-purple-500' },
  { name: 'O&M', count: 5, capacity: 0, color: 'bg-green-500' },
];

const recentActivities = [
  { id: 1, type: 'project', action: 'Milestone hoàn thành', target: 'Solar Farm Bình Thuận', user: 'Trần Minh Quân', time: '2 giờ trước' },
  { id: 2, type: 'lead', action: 'Lead mới từ website', target: 'AEON Mall Long Biên', user: 'Hệ thống', time: '3 giờ trước' },
  { id: 3, type: 'inventory', action: 'Nhập kho 500 tấm pin', target: 'JA Solar 550W', user: 'Nguyễn Văn A', time: '5 giờ trước' },
  { id: 4, type: 'deal', action: 'Ký hợp đồng', target: 'AEON Mall Tân Phú - 2.5MW', user: 'Lê Thị Hương', time: '1 ngày trước' },
  { id: 5, type: 'project', action: 'Dự án mới khởi tạo', target: 'Wind Farm Ninh Thuận', user: 'Phạm Văn Đức', time: '2 ngày trước' },
];

const topClients = [
  { name: 'EVN', projects: 5, revenue: 45000000000, status: 'active' },
  { name: 'AEON Vietnam', projects: 3, revenue: 28000000000, status: 'active' },
  { name: 'Vingroup', projects: 4, revenue: 22000000000, status: 'active' },
  { name: 'Samsung Vietnam', projects: 2, revenue: 18000000000, status: 'potential' },
  { name: 'Long An Solar JSC', projects: 2, revenue: 15000000000, status: 'active' },
];

const regionData = [
  { region: 'Miền Nam', projects: 28, revenue: 85000000000 },
  { region: 'Miền Trung', projects: 12, revenue: 30000000000 },
  { region: 'Miền Bắc', projects: 5, revenue: 10000000000 },
];

// ============================================
// COMPONENT
// ============================================

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const { hasPermission } = useAuthStore();
  
  const canExport = hasPermission('analytics', 'export');

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(1)} tỷ`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)} triệu`;
    return amount.toLocaleString('vi-VN');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổng quan hiệu suất kinh doanh GoldenEnergy
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {[
                  { key: '7d', label: '7 ngày' },
                  { key: '30d', label: '30 ngày' },
                  { key: '90d', label: '90 ngày' },
                  { key: '1y', label: '1 năm' },
                ].map(range => (
                  <button
                    key={range.key}
                    onClick={() => setTimeRange(range.key as TimeRange)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      timeRange === range.key
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                <RefreshCcw size={20} />
              </button>
              
              {canExport && (
                <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                  <Download size={18} />
                  <span>Xuất báo cáo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="text-green-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${revenueData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueData.growth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{Math.abs(revenueData.growth)}%</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-500">Doanh thu tháng này</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(revenueData.thisMonth)}</p>
              <p className="text-xs text-gray-400 mt-1">vs {formatCurrency(revenueData.lastMonth)} tháng trước</p>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="text-blue-600" size={24} />
              </div>
              <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {projectStats.inProgress} đang thực hiện
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-500">Tổng dự án</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{projectStats.total}</p>
              <p className="text-xs text-gray-400 mt-1">{projectStats.completed} hoàn thành · {projectStats.planned} lên kế hoạch</p>
            </div>
          </div>

          {/* Leads */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="text-purple-600" size={24} />
              </div>
              <span className="text-sm text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                +{leadStats.new} mới
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-500">Tổng leads</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(leadStats.total)}</p>
              <p className="text-xs text-gray-400 mt-1">Tỷ lệ chuyển đổi: {leadStats.conversionRate}%</p>
            </div>
          </div>

          {/* Capacity */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="text-yellow-600" size={24} />
              </div>
              <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                +{capacityStats.thisYearMW} MW năm nay
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm text-gray-500">Tổng công suất</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{capacityStats.totalMW} MW</p>
              <p className="text-xs text-gray-400 mt-1">
                <Sun size={12} className="inline mr-1" />{capacityStats.solarMW} MW · 
                <Wind size={12} className="inline mx-1" />{capacityStats.windMW} MW
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Doanh thu theo tháng</h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-500">Thực tế</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-gray-500">Mục tiêu</span>
                </div>
              </div>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="h-64 flex items-end justify-around gap-4">
              {monthlyRevenue.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-full flex justify-center gap-1 items-end h-48">
                    <div 
                      className="w-8 bg-yellow-500 rounded-t-md transition-all hover:bg-yellow-600"
                      style={{ height: `${(data.value / 15) * 100}%` }}
                      title={`${data.value} tỷ`}
                    ></div>
                    <div 
                      className="w-2 bg-gray-200 rounded-t-md"
                      style={{ height: `${(data.target / 15) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects by Category */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Dự án theo loại</h3>
            <div className="space-y-3">
              {projectsByCategory.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{cat.name}</span>
                    <span className="font-medium">{cat.count} dự án</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${cat.color}`}
                      style={{ width: `${(cat.count / 20) * 100}%` }}
                    ></div>
                  </div>
                  {cat.capacity > 0 && (
                    <p className="text-xs text-gray-400 mt-0.5">{cat.capacity} MW</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
              <button className="text-sm text-yellow-600 hover:text-yellow-700">Xem tất cả</button>
            </div>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'project' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'lead' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'inventory' ? 'bg-green-100 text-green-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {activity.type === 'project' && <Briefcase size={16} />}
                    {activity.type === 'lead' && <Users size={16} />}
                    {activity.type === 'inventory' && <Package size={16} />}
                    {activity.type === 'deal' && <DollarSign size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span>
                      {' - '}
                      <span className="text-gray-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.user} · {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Khách hàng lớn nhất</h3>
            </div>
            <div className="space-y-3">
              {topClients.map((client, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.projects} dự án</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(client.revenue)}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      client.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {client.status === 'active' ? 'Đang hợp tác' : 'Tiềm năng'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region Stats */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Phân bố theo khu vực</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionData.map((region, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="text-gray-400" size={18} />
                  <span className="font-medium text-gray-900">{region.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{region.projects}</p>
                    <p className="text-xs text-gray-500">dự án</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(region.revenue)}</p>
                    <p className="text-xs text-gray-500">doanh thu</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Phễu chuyển đổi Leads</h3>
          <div className="flex items-center justify-between">
            {[
              { stage: 'Leads mới', count: leadStats.total, percent: 100, color: 'bg-gray-400' },
              { stage: 'Đã liên hệ', count: 890, percent: 71, color: 'bg-blue-400' },
              { stage: 'Qualified', count: leadStats.qualified, percent: 34, color: 'bg-purple-400' },
              { stage: 'Đề xuất báo giá', count: 380, percent: 30, color: 'bg-orange-400' },
              { stage: 'Ký hợp đồng', count: leadStats.converted, percent: 23, color: 'bg-green-500' },
            ].map((stage, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="relative h-20 flex items-end justify-center">
                  <div 
                    className={`w-full max-w-[120px] ${stage.color} rounded-t-lg transition-all`}
                    style={{ height: `${stage.percent}%` }}
                  ></div>
                </div>
                <p className="mt-2 font-semibold text-gray-900">{stage.count.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{stage.stage}</p>
                <p className="text-xs text-gray-400">{stage.percent}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

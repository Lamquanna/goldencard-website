'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Users,
  DollarSign,
  Package,
  FolderKanban,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

// =============================================================================
// TYPES & DATA
// =============================================================================

interface ReportCategory {
  id: string;
  name: string;
  nameVi: string;
  icon: React.ElementType;
  color: string;
  reports: ReportItem[];
}

interface ReportItem {
  id: string;
  name: string;
  description: string;
  type: 'chart' | 'table' | 'summary';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastGenerated?: string;
}

const reportCategories: ReportCategory[] = [
  {
    id: 'sales',
    name: 'Sales & CRM',
    nameVi: 'Kinh doanh',
    icon: TrendingUp,
    color: 'text-blue-500',
    reports: [
      { id: 'sales-overview', name: 'Tổng quan doanh số', description: 'Doanh thu, đơn hàng theo thời gian', type: 'chart', frequency: 'daily', lastGenerated: '2025-12-17 08:00' },
      { id: 'lead-conversion', name: 'Chuyển đổi Lead', description: 'Tỷ lệ chuyển đổi từ lead sang khách hàng', type: 'chart', frequency: 'weekly' },
      { id: 'pipeline-analysis', name: 'Phân tích Pipeline', description: 'Phễu bán hàng và giá trị cơ hội', type: 'summary', frequency: 'weekly' },
      { id: 'sales-team', name: 'Hiệu suất Sales', description: 'Doanh số theo nhân viên kinh doanh', type: 'table', frequency: 'monthly' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    nameVi: 'Tài chính',
    icon: DollarSign,
    color: 'text-green-500',
    reports: [
      { id: 'revenue', name: 'Báo cáo Doanh thu', description: 'Thu chi và lợi nhuận', type: 'chart', frequency: 'monthly', lastGenerated: '2025-12-15 10:00' },
      { id: 'cashflow', name: 'Dòng tiền', description: 'Báo cáo luồng tiền vào ra', type: 'chart', frequency: 'weekly' },
      { id: 'invoice-aging', name: 'Công nợ', description: 'Phân tích tuổi nợ khách hàng', type: 'table', frequency: 'weekly' },
      { id: 'expense-analysis', name: 'Phân tích Chi phí', description: 'Chi phí theo danh mục', type: 'chart', frequency: 'monthly' },
    ]
  },
  {
    id: 'hrm',
    name: 'Human Resources',
    nameVi: 'Nhân sự',
    icon: Users,
    color: 'text-purple-500',
    reports: [
      { id: 'attendance', name: 'Chấm công', description: 'Tỷ lệ chuyên cần, đi trễ', type: 'chart', frequency: 'daily', lastGenerated: '2025-12-17 07:00' },
      { id: 'leave-summary', name: 'Nghỉ phép', description: 'Tổng hợp nghỉ phép theo phòng ban', type: 'table', frequency: 'monthly' },
      { id: 'headcount', name: 'Biến động NS', description: 'Tuyển dụng, nghỉ việc theo thời gian', type: 'chart', frequency: 'monthly' },
      { id: 'payroll', name: 'Bảng lương', description: 'Chi phí lương theo phòng ban', type: 'summary', frequency: 'monthly' },
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    nameVi: 'Kho vận',
    icon: Package,
    color: 'text-orange-500',
    reports: [
      { id: 'stock-level', name: 'Mức tồn kho', description: 'Số lượng tồn kho hiện tại', type: 'table', frequency: 'daily', lastGenerated: '2025-12-17 06:00' },
      { id: 'stock-movement', name: 'Xuất nhập tồn', description: 'Biến động kho theo thời gian', type: 'chart', frequency: 'weekly' },
      { id: 'low-stock', name: 'Cảnh báo tồn kho', description: 'Sản phẩm sắp hết hàng', type: 'table', frequency: 'daily' },
      { id: 'inventory-value', name: 'Giá trị tồn kho', description: 'Giá trị hàng tồn theo danh mục', type: 'summary', frequency: 'monthly' },
    ]
  },
  {
    id: 'projects',
    name: 'Projects',
    nameVi: 'Dự án',
    icon: FolderKanban,
    color: 'text-indigo-500',
    reports: [
      { id: 'project-status', name: 'Tiến độ dự án', description: 'Tổng quan tiến độ các dự án', type: 'chart', frequency: 'weekly', lastGenerated: '2025-12-16 14:00' },
      { id: 'task-completion', name: 'Hoàn thành Task', description: 'Tỷ lệ hoàn thành công việc', type: 'chart', frequency: 'weekly' },
      { id: 'resource-allocation', name: 'Phân bổ nguồn lực', description: 'Công suất làm việc theo nhân viên', type: 'table', frequency: 'weekly' },
      { id: 'project-profitability', name: 'Lợi nhuận dự án', description: 'Doanh thu và chi phí theo dự án', type: 'summary', frequency: 'monthly' },
    ]
  },
];

// Mock summary data
const summaryStats = [
  { label: 'Doanh thu tháng', value: '₫2.4 tỷ', change: '+12.5%', trend: 'up' },
  { label: 'Đơn hàng mới', value: '156', change: '+8.2%', trend: 'up' },
  { label: 'Khách hàng mới', value: '42', change: '+15.3%', trend: 'up' },
  { label: 'Tỷ lệ chuyển đổi', value: '23.5%', change: '-2.1%', trend: 'down' },
];

const recentReports = [
  { name: 'Báo cáo doanh thu Q4', type: 'finance', date: '2025-12-15', status: 'ready' },
  { name: 'Chấm công tháng 12', type: 'hrm', date: '2025-12-17', status: 'processing' },
  { name: 'Tồn kho cuối tháng', type: 'inventory', date: '2025-12-16', status: 'ready' },
  { name: 'Pipeline CRM', type: 'sales', date: '2025-12-16', status: 'ready' },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [activeCategory, setActiveCategory] = useState('sales');

  const currentCategory = reportCategories.find(c => c.id === activeCategory);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trung tâm Báo cáo</h1>
          <p className="text-muted-foreground">Xem và xuất các báo cáo phân tích</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm nay</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <Badge variant={stat.trend === 'up' ? 'default' : 'destructive'} className="text-xs">
                  {stat.change}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Danh mục</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="space-y-1">
              {reportCategories.map(category => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${category.color}`} />
                    <div className="flex-1">
                      <p className="font-medium">{category.nameVi}</p>
                      <p className="text-xs text-muted-foreground">{category.reports.length} báo cáo</p>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="lg:col-span-3 space-y-6">
          {currentCategory && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  {React.createElement(currentCategory.icon, { className: `h-5 w-5 ${currentCategory.color}` })}
                  {currentCategory.nameVi}
                </h2>
                <Button variant="outline" size="sm">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Xuất tất cả
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCategory.reports.map(report => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{report.name}</CardTitle>
                          <CardDescription className="mt-1">{report.description}</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.type === 'chart' ? 'Biểu đồ' : report.type === 'table' ? 'Bảng' : 'Tổng hợp'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {report.lastGenerated ? (
                            <span>Cập nhật: {report.lastGenerated}</span>
                          ) : (
                            <span className="text-yellow-600">Chưa tạo</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Báo cáo gần đây</CardTitle>
              <CardDescription>Các báo cáo đã tạo gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.name}</p>
                        <p className="text-xs text-muted-foreground">{report.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                        {report.status === 'ready' ? 'Sẵn sàng' : 'Đang xử lý'}
                      </Badge>
                      {report.status === 'ready' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

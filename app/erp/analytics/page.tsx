'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart,
  Target,
  HelpCircle,
  X,
  Info
} from 'lucide-react';

// Help guide content
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Phân tích',
  description: 'Trang này giúp bạn theo dõi và phân tích hiệu suất kinh doanh của công ty một cách toàn diện.',
  icons: [
    { icon: 'DollarSign', meaning: 'Tổng doanh thu' },
    { icon: 'Users', meaning: 'Số lượng khách hàng mới' },
    { icon: 'ShoppingCart', meaning: 'Số đơn hàng' },
    { icon: 'Target', meaning: 'Tỷ lệ chuyển đổi' },
    { icon: 'TrendingUp (xanh)', meaning: 'Xu hướng tăng so với kỳ trước' },
    { icon: 'TrendingDown (đỏ)', meaning: 'Xu hướng giảm so với kỳ trước' },
    { icon: 'Cột vàng', meaning: 'Doanh thu thực tế' },
    { icon: 'Cột xám', meaning: 'Mục tiêu doanh thu' },
    { icon: 'Badge %', meaning: 'Phần trăm thay đổi' },
  ],
  sections: [
    {
      title: 'Tổng quan số liệu',
      content: 'Hiển thị các chỉ số quan trọng như tổng doanh thu, khách hàng mới, đơn hàng và tỷ lệ chuyển đổi. Mũi tên xanh/đỏ cho biết xu hướng tăng/giảm so với kỳ trước.'
    },
    {
      title: 'Biểu đồ doanh thu',
      content: 'So sánh doanh thu thực tế (màu vàng) với mục tiêu đề ra (màu xám) theo từng tháng, giúp đánh giá tiến độ hoàn thành KPI.'
    },
    {
      title: 'Doanh số theo vùng',
      content: 'Phân bố doanh số theo khu vực địa lý, giúp xác định thị trường tiềm năng và vùng cần tập trung phát triển.'
    },
    {
      title: 'Sản phẩm bán chạy',
      content: 'Danh sách top sản phẩm có doanh số cao nhất, bao gồm số lượng bán, doanh thu và tỷ lệ tăng trưởng.'
    }
  ]
};

const overviewStats = [
  { 
    label: 'Tổng doanh thu', 
    value: '₫2.4B', 
    change: '+12.5%', 
    trend: 'up' as const,
    icon: DollarSign 
  },
  { 
    label: 'Khách hàng mới', 
    value: '1,234', 
    change: '+8.2%', 
    trend: 'up' as const,
    icon: Users 
  },
  { 
    label: 'Đơn hàng', 
    value: '5,678', 
    change: '+15.3%', 
    trend: 'up' as const,
    icon: ShoppingCart 
  },
  { 
    label: 'Tỷ lệ chuyển đổi', 
    value: '3.2%', 
    change: '+0.8%', 
    trend: 'up' as const,
    icon: Target 
  },
];

const revenueByMonth = [
  { month: 'T1', revenue: 1200, target: 1000 },
  { month: 'T2', revenue: 1350, target: 1100 },
  { month: 'T3', revenue: 1100, target: 1200 },
  { month: 'T4', revenue: 1500, target: 1300 },
  { month: 'T5', revenue: 1650, target: 1400 },
  { month: 'T6', revenue: 1800, target: 1500 },
];

const salesByRegion = [
  { region: 'Miền Nam', value: 45, color: 'bg-[#D4AF37]' },
  { region: 'Miền Bắc', value: 30, color: 'bg-[#B8941F]' },
  { region: 'Miền Trung', value: 15, color: 'bg-[#8B7355]' },
  { region: 'Tây Nguyên', value: 10, color: 'bg-gray-400' },
];

const topProducts = [
  { name: 'Tấm pin mặt trời 550W', sales: 1234, revenue: '₫1.2B', growth: '+25%' },
  { name: 'Inverter hòa lưới 10kW', sales: 856, revenue: '₫856M', growth: '+18%' },
  { name: 'Hệ thống lưu trữ 20kWh', sales: 432, revenue: '₫650M', growth: '+32%' },
  { name: 'Khung giá đỡ nhôm', sales: 2156, revenue: '₫430M', growth: '+12%' },
  { name: 'Cáp DC chuyên dụng', sales: 5678, revenue: '₫280M', growth: '+8%' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7days');
  const [showHelp, setShowHelp] = useState(false);

  // Filter data based on time range
  const filteredStats = useMemo(() => {
    // Mock filtering - in real app, this would fetch from API with time range parameter
    const multiplier = timeRange === '7days' ? 0.15 : 
                       timeRange === '30days' ? 1 :
                       timeRange === 'quarter' ? 2.5 :
                       3.2; // year

    return overviewStats.map(stat => ({
      ...stat,
      value: stat.label === 'Tỷ lệ chuyển đổi' 
        ? stat.value // Keep percentage as is
        : stat.label === 'Tổng doanh thu'
          ? `₫${(2.4 * multiplier).toFixed(1)}B`
          : stat.label === 'Khách hàng mới'
            ? Math.round(1234 * multiplier).toLocaleString()
            : Math.round(5678 * multiplier).toLocaleString(),
      change: timeRange === '7days' ? '+2.1%' :
              timeRange === '30days' ? '+8.5%' :
              timeRange === 'quarter' ? '+18.3%' :
              '+25.7%',
    }));
  }, [timeRange]);

  const filteredRevenue = useMemo(() => {
    // Filter revenue data based on time range
    if (timeRange === '7days') {
      return [
        { month: 'CN', revenue: 180, target: 200 },
        { month: 'T2', revenue: 220, target: 200 },
        { month: 'T3', revenue: 195, target: 200 },
        { month: 'T4', revenue: 240, target: 200 },
        { month: 'T5', revenue: 210, target: 200 },
        { month: 'T6', revenue: 230, target: 200 },
        { month: 'T7', revenue: 250, target: 200 },
      ];
    } else if (timeRange === '30days') {
      return [
        { month: 'T1', revenue: 1200, target: 1000 },
        { month: 'T2', revenue: 1350, target: 1100 },
        { month: 'T3', revenue: 1100, target: 1200 },
        { month: 'T4', revenue: 1500, target: 1300 },
      ];
    } else if (timeRange === 'quarter') {
      return [
        { month: 'Tháng 1', revenue: 2500, target: 2200 },
        { month: 'Tháng 2', revenue: 2800, target: 2400 },
        { month: 'Tháng 3', revenue: 3200, target: 2800 },
      ];
    } else {
      return revenueByMonth;
    }
  }, [timeRange]);

  return (
    <div className="space-y-6">
      {/* Header với nút trợ giúp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phân tích</h1>
            <p className="text-gray-600">Tổng quan hiệu suất kinh doanh và các chỉ số quan trọng</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowHelp(true)}
            className="text-gray-500 hover:text-[#D4AF37]"
            title="Xem hướng dẫn sử dụng"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <select 
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="7days">7 ngày qua</option>
          <option value="30days">30 ngày qua</option>
          <option value="quarter">Quý này</option>
          <option value="year">Năm nay</option>
        </select>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <Card className="bg-gradient-to-br from-amber-50 to-white border-[#D4AF37]/30">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D4AF37]" />
                <CardTitle className="text-lg text-gray-900">{helpGuide.title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 -mt-2 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>{helpGuide.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Icons explanation */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Ý nghĩa các biểu tượng (Icons)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {helpGuide.icons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-600 border">{item.icon}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sections */}
            <div className="grid gap-3 sm:grid-cols-2">
              {helpGuide.sections.map((section, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{section.title}</h4>
                  <p className="text-xs text-gray-600">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredStats.map((stat, index) => (
          <Card key={index} className="bg-white border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4" />
                    {stat.change}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gray-100">
                  <stat.icon className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Phần biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ doanh thu */}
        <Card className="lg:col-span-2 bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Doanh thu theo tháng</CardTitle>
            <CardDescription>So sánh doanh thu thực tế và mục tiêu đề ra</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {filteredRevenue.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-0.5 h-48">
                    <div 
                      className="flex-1 bg-[#D4AF37] rounded-t"
                      style={{ height: `${(item.revenue / 2000) * 100}%` }}
                    />
                    <div 
                      className="flex-1 bg-gray-300 rounded-t"
                      style={{ height: `${(item.target / 2000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#D4AF37]" />
                <span className="text-sm text-gray-600">Thực tế</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-gray-300" />
                <span className="text-sm text-gray-600">Mục tiêu</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doanh số theo vùng */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Doanh số theo vùng</CardTitle>
            <CardDescription>Phân bố doanh số theo khu vực địa lý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByRegion.map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{region.region}</span>
                    <span className="font-medium text-gray-900">{region.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${region.color} rounded-full`}
                      style={{ width: `${region.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sản phẩm bán chạy */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Sản phẩm bán chạy</CardTitle>
          <CardDescription>Top 5 sản phẩm có doanh số cao nhất trong kỳ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sản phẩm</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Số lượng</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Doanh thu</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Tăng trưởng</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-4 text-gray-900">{product.name}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{product.sales}</td>
                    <td className="py-3 px-4 text-right text-gray-700">{product.revenue}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        {product.growth}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

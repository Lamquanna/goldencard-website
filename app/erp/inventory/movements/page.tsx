'use client';

import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  RefreshCw,
  Search,
  Download,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Lịch sử xuất nhập kho',
  description: 'Trang này giúp bạn theo dõi toàn bộ lịch sử giao dịch xuất nhập kho, chuyển kho và điều chỉnh tồn kho.',
  icons: [
    { icon: 'ArrowDownToLine (xanh)', meaning: 'Giao dịch Nhập kho' },
    { icon: 'ArrowUpFromLine (đỏ)', meaning: 'Giao dịch Xuất kho' },
    { icon: 'ArrowLeftRight (xanh dương)', meaning: 'Giao dịch Chuyển kho' },
    { icon: 'RefreshCw (vàng)', meaning: 'Điều chỉnh tồn kho' },
    { icon: '+100', meaning: 'Số lượng tăng (nhập vào)' },
    { icon: '-50', meaning: 'Số lượng giảm (xuất ra)' },
    { icon: 'Badge xanh lá', meaning: 'Giao dịch hoàn thành' },
    { icon: 'Badge vàng', meaning: 'Đang xử lý' },
    { icon: 'Badge đỏ', meaning: 'Đã hủy' },
    { icon: 'Search', meaning: 'Tìm kiếm theo mã phiếu/sản phẩm' },
    { icon: 'Download', meaning: 'Xuất báo cáo Excel' },
  ],
  sections: [
    {
      title: 'Các loại giao dịch',
      content: 'Nhập kho (xanh): Hàng từ nhà cung cấp vào. Xuất kho (đỏ): Hàng xuất đi cho dự án/khách. Chuyển kho (xanh dương): Di chuyển giữa các kho. Điều chỉnh (vàng): Cập nhật sau kiểm kê.'
    },
    {
      title: 'Tìm kiếm và lọc',
      content: 'Nhập mã phiếu hoặc tên sản phẩm để tìm kiếm nhanh. Sử dụng dropdown để lọc theo loại giao dịch cụ thể.'
    },
    {
      title: 'Xuất báo cáo',
      content: 'Nhấn nút "Xuất báo cáo" để tải xuống file Excel chứa toàn bộ lịch sử giao dịch theo bộ lọc hiện tại.'
    },
    {
      title: 'Chi tiết giao dịch',
      content: 'Bảng hiển thị: Mã phiếu (số hiệu), loại giao dịch, sản phẩm, số lượng (+/-), kho, thời gian, người thực hiện và ghi chú.'
    }
  ]
};

// Dữ liệu mẫu
const mockMovements = [
  {
    id: '1',
    code: 'NK-2025-001',
    type: 'in',
    product: 'Tấm pin JA Solar 545W',
    quantity: 100,
    warehouse: 'Kho chính',
    date: '2025-12-16 09:30',
    user: 'Nguyễn Văn A',
    note: 'Nhập từ nhà cung cấp',
    status: 'completed',
  },
  {
    id: '2',
    code: 'XK-2025-045',
    type: 'out',
    product: 'Inverter Huawei 5kW',
    quantity: 10,
    warehouse: 'Kho chính',
    date: '2025-12-15 14:20',
    user: 'Trần Thị B',
    note: 'Xuất cho dự án ABC',
    status: 'completed',
  },
  {
    id: '3',
    code: 'CK-2025-012',
    type: 'transfer',
    product: 'Dây cáp DC 6mm2',
    quantity: 500,
    warehouse: 'Kho phụ → Kho chính',
    date: '2025-12-14 16:45',
    user: 'Lê Văn C',
    note: 'Chuyển kho nội bộ',
    status: 'completed',
  },
  {
    id: '4',
    code: 'DC-2025-003',
    type: 'adjustment',
    product: 'Khung nhôm solar',
    quantity: -5,
    warehouse: 'Kho chính',
    date: '2025-12-13 11:00',
    user: 'Phạm D',
    note: 'Điều chỉnh sau kiểm kê',
    status: 'completed',
  },
  {
    id: '5',
    code: 'NK-2025-002',
    type: 'in',
    product: 'Pin lưu trữ BYD 10kWh',
    quantity: 20,
    warehouse: 'Kho chính',
    date: '2025-12-12 08:15',
    user: 'Nguyễn Văn A',
    note: 'Nhập bổ sung',
    status: 'completed',
  },
];

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  in: { label: 'Nhập kho', color: 'text-green-600', bgColor: 'bg-green-100', icon: ArrowDownToLine },
  out: { label: 'Xuất kho', color: 'text-red-600', bgColor: 'bg-red-100', icon: ArrowUpFromLine },
  transfer: { label: 'Chuyển kho', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: ArrowLeftRight },
  adjustment: { label: 'Điều chỉnh', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: RefreshCw },
};

export default function StockMovementsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showHelp, setShowHelp] = useState(false);

  const filteredMovements = mockMovements.filter((m) => {
    const matchesSearch = search === '' || 
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.product.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    in: mockMovements.filter((m) => m.type === 'in').length,
    out: mockMovements.filter((m) => m.type === 'out').length,
    transfer: mockMovements.filter((m) => m.type === 'transfer').length,
    adjustment: mockMovements.filter((m) => m.type === 'adjustment').length,
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử xuất nhập kho</h1>
            <p className="text-gray-600 mt-1">Theo dõi các giao dịch xuất nhập tồn kho</p>
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
        <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white" onClick={() => {
          alert('Đang xuất báo cáo biến động kho...\n\nFile Excel sẽ chứa:\n- Lịch sử nhập/xuất kho theo bộ lọc\n- Thông tin sản phẩm\n- Số lượng và loại giao dịch\n- Thời gian và người thực hiện\n\nTính năng xuất file thực tế sẽ được tích hợp khi kết nối database.');
        }}>
          <Download className="w-4 h-4 mr-2" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Help Guide */}
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([type, count]) => {
          const config = typeConfig[type];
          const Icon = config.icon;
          return (
            <Card key={type} className={`bg-white border-gray-200 cursor-pointer hover:shadow-md ${
              typeFilter === type ? 'ring-2 ring-[#D4AF37]' : ''
            }`}
              onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã phiếu, sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại giao dịch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="in">Nhập kho</SelectItem>
            <SelectItem value="out">Xuất kho</SelectItem>
            <SelectItem value="transfer">Chuyển kho</SelectItem>
            <SelectItem value="adjustment">Điều chỉnh</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Movements Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã phiếu</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Loại</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản phẩm</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Số lượng</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Kho</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Thời gian</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Người thực hiện</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.map((movement) => {
                  const config = typeConfig[movement.type];
                  const Icon = config.icon;
                  return (
                    <tr key={movement.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm text-gray-900">{movement.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${config.bgColor} ${config.color} border-0`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-900">{movement.product}</td>
                      <td className={`px-4 py-3 text-right font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{movement.warehouse}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">{movement.date}</td>
                      <td className="px-4 py-3 text-gray-700">{movement.user}</td>
                      <td className="px-4 py-3 text-gray-500 text-sm">{movement.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

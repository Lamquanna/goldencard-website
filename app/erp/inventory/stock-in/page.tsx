'use client';

import React, { useState } from 'react';
import {
  ArrowDownToLine,
  Plus,
  Search,
  Download,
  Package,
  Truck,
  Calendar,
  User,
  FileText,
  HelpCircle,
  X,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Nhập kho',
  description: 'Trang này giúp bạn quản lý và theo dõi các phiếu nhập kho từ nhà cung cấp vào hệ thống.',
  sections: [
    {
      title: 'Tạo phiếu nhập kho',
      content: 'Nhấn nút "Tạo phiếu nhập" để tạo phiếu mới. Điền đầy đủ: mã phiếu, nhà cung cấp, sản phẩm, số lượng, giá nhập và ghi chú.'
    },
    {
      title: 'Trạng thái phiếu',
      content: '🟢 Hoàn thành: Đã nhập kho thành công. 🟡 Đang xử lý: Đang kiểm tra/nhập hàng. 🔵 Chờ duyệt: Chờ quản lý phê duyệt.'
    },
    {
      title: 'Tìm kiếm và lọc',
      content: 'Sử dụng thanh tìm kiếm để tìm theo mã phiếu hoặc tên sản phẩm. Lọc theo trạng thái hoặc thời gian.'
    },
    {
      title: 'Xuất báo cáo',
      content: 'Nhấn "Xuất báo cáo" để tải xuống file Excel chứa danh sách phiếu nhập theo bộ lọc hiện tại.'
    }
  ],
  icons: [
    { icon: '📦', meaning: 'Package - Sản phẩm/Hàng hóa' },
    { icon: '🚚', meaning: 'Truck - Nhà cung cấp/Vận chuyển' },
    { icon: '📅', meaning: 'Calendar - Ngày nhập kho' },
    { icon: '👤', meaning: 'User - Người thực hiện' },
  ]
};

// Dữ liệu mẫu phiếu nhập kho
const mockStockInOrders = [
  {
    id: '1',
    code: 'NK-2025-001',
    supplier: 'JA Solar Vietnam',
    products: [
      { name: 'Tấm pin JA Solar 545W', quantity: 100, price: 3500000 },
    ],
    totalValue: 350000000,
    warehouse: 'Kho chính',
    date: '2025-12-16',
    status: 'completed',
    createdBy: 'Nguyễn Văn A',
    note: 'Nhập theo PO-2025-089',
  },
  {
    id: '2',
    code: 'NK-2025-002',
    supplier: 'Huawei Tech Vietnam',
    products: [
      { name: 'Inverter Huawei 10kW', quantity: 20, price: 25000000 },
      { name: 'Inverter Huawei 5kW', quantity: 30, price: 15000000 },
    ],
    totalValue: 950000000,
    warehouse: 'Kho chính',
    date: '2025-12-15',
    status: 'completed',
    createdBy: 'Trần Thị B',
    note: 'Đợt nhập tháng 12',
  },
  {
    id: '3',
    code: 'NK-2025-003',
    supplier: 'BYD Energy',
    products: [
      { name: 'Pin lưu trữ BYD 10kWh', quantity: 15, price: 85000000 },
    ],
    totalValue: 1275000000,
    warehouse: 'Kho chính',
    date: '2025-12-14',
    status: 'processing',
    createdBy: 'Lê Văn C',
    note: 'Đang kiểm tra chất lượng',
  },
  {
    id: '4',
    code: 'NK-2025-004',
    supplier: 'Cable Vietnam',
    products: [
      { name: 'Cáp DC 6mm2 (cuộn 100m)', quantity: 50, price: 2500000 },
      { name: 'Cáp AC 4mm2 (cuộn 100m)', quantity: 30, price: 1800000 },
    ],
    totalValue: 179000000,
    warehouse: 'Kho phụ',
    date: '2025-12-13',
    status: 'pending',
    createdBy: 'Phạm D',
    note: 'Chờ duyệt từ quản lý',
  },
];

const statusConfig = {
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  processing: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending: { label: 'Chờ duyệt', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
};

// Component tạo phiếu nhập mới
function CreateStockInDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tạo phiếu nhập
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo phiếu nhập kho mới</DialogTitle>
          <DialogDescription>
            Điền thông tin phiếu nhập kho. Các trường có dấu (*) là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mã phiếu *</Label>
              <Input placeholder="NK-2025-XXX" />
            </div>
            <div className="space-y-2">
              <Label>Ngày nhập *</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Nhà cung cấp *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhà cung cấp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja-solar">JA Solar Vietnam</SelectItem>
                <SelectItem value="huawei">Huawei Tech Vietnam</SelectItem>
                <SelectItem value="byd">BYD Energy</SelectItem>
                <SelectItem value="cable-vn">Cable Vietnam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kho nhập *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Kho chính</SelectItem>
                <SelectItem value="sub">Kho phụ</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sản phẩm *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn sản phẩm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="panel-545">Tấm pin JA Solar 545W</SelectItem>
                <SelectItem value="inv-10k">Inverter Huawei 10kW</SelectItem>
                <SelectItem value="inv-5k">Inverter Huawei 5kW</SelectItem>
                <SelectItem value="battery">Pin lưu trữ BYD 10kWh</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số lượng *</Label>
              <Input type="number" placeholder="0" min="1" />
            </div>
            <div className="space-y-2">
              <Label>Đơn giá (VNĐ) *</Label>
              <Input type="number" placeholder="0" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea placeholder="Nhập ghi chú (nếu có)..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white" onClick={() => setOpen(false)}>
            Tạo phiếu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StockInPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showHelp, setShowHelp] = useState(false);

  const filteredOrders = mockStockInOrders.filter((order) => {
    const matchesSearch = search === '' || 
      order.code.toLowerCase().includes(search.toLowerCase()) ||
      order.supplier.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockStockInOrders.length,
    completed: mockStockInOrders.filter(o => o.status === 'completed').length,
    processing: mockStockInOrders.filter(o => o.status === 'processing').length,
    pending: mockStockInOrders.filter(o => o.status === 'pending').length,
  };

  const totalValue = mockStockInOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalValue, 0);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nhập kho</h1>
            <p className="text-gray-600 mt-1">Quản lý phiếu nhập hàng từ nhà cung cấp</p>
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
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-200" onClick={() => {
            alert('Đang xuất báo cáo nhập kho...\n\nFile Excel sẽ chứa:\n- Danh sách phiếu nhập theo bộ lọc\n- Thông tin nhà cung cấp\n- Chi tiết sản phẩm và số lượng\n- Tổng giá trị nhập kho\n\nTính năng xuất file thực tế sẽ được tích hợp khi kết nối database.');
          }}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <CreateStockInDialog />
        </div>
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
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {helpGuide.sections.map((section, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{section.title}</h4>
                  <p className="text-xs text-gray-600">{section.content}</p>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-100">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Ý nghĩa các biểu tượng:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {helpGuide.icons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{item.icon}</span>
                    <span>{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng phiếu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chờ duyệt</p>
                <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng giá trị</p>
                <p className="text-xl font-bold text-[#D4AF37]">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                    maximumFractionDigits: 1,
                  }).format(totalValue)}
                </p>
              </div>
              <Package className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã phiếu, nhà cung cấp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="completed">Hoàn thành</SelectItem>
            <SelectItem value="processing">Đang xử lý</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Mã phiếu</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nhà cung cấp</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sản phẩm</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Giá trị</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Kho</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ngày nhập</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Người tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const config = statusConfig[order.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-gray-900">{order.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-900">{order.supplier}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {order.products.map((product, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-gray-900">{product.name}</span>
                              <span className="text-gray-500 ml-2">x{product.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                          notation: 'compact',
                          maximumFractionDigits: 0,
                        }).format(order.totalValue)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{order.warehouse}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {order.date}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${config.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="w-4 h-4" />
                          {order.createdBy}
                        </div>
                      </td>
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

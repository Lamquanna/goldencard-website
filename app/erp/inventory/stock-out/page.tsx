'use client';

import React, { useState } from 'react';
import {
  ArrowUpFromLine,
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
  title: 'Hướng dẫn sử dụng trang Xuất kho',
  description: 'Trang này giúp bạn quản lý và theo dõi các phiếu xuất kho cho dự án, khách hàng.',
  icons: [
    { icon: 'ArrowUpFromLine', meaning: 'Biểu tượng xuất kho' },
    { icon: 'Package', meaning: 'Sản phẩm/Hàng hóa' },
    { icon: 'Truck', meaning: 'Vận chuyển/Giao hàng' },
    { icon: 'Calendar', meaning: 'Ngày xuất kho' },
    { icon: 'User', meaning: 'Người thực hiện' },
    { icon: 'CheckCircle2 (xanh)', meaning: 'Đã xuất kho thành công' },
    { icon: 'Clock (vàng)', meaning: 'Đang xử lý xuất kho' },
    { icon: 'AlertCircle (xanh)', meaning: 'Chờ duyệt xuất kho' },
  ],
  sections: [
    {
      title: 'Tạo phiếu xuất kho',
      content: 'Nhấn nút "Tạo phiếu xuất" để tạo phiếu mới. Điền đầy đủ: mã phiếu, khách hàng/dự án, sản phẩm, số lượng và ghi chú.'
    },
    {
      title: 'Trạng thái phiếu',
      content: '🟢 Hoàn thành: Đã xuất kho thành công. 🟡 Đang xử lý: Đang đóng gói/vận chuyển. 🔵 Chờ duyệt: Chờ quản lý phê duyệt.'
    },
    {
      title: 'Tìm kiếm và lọc',
      content: 'Sử dụng thanh tìm kiếm để tìm theo mã phiếu hoặc tên khách hàng. Lọc theo trạng thái hoặc thời gian.'
    },
    {
      title: 'Xuất báo cáo',
      content: 'Nhấn "Xuất báo cáo" để tải xuống file Excel chứa danh sách phiếu xuất theo bộ lọc hiện tại.'
    }
  ]
};

// Dữ liệu mẫu khách hàng/dự án
const mockCustomers = [
  { id: '1', name: 'Dự án Solar Farm Bình Dương', type: 'project' },
  { id: '2', name: 'Khách hàng ABC Corporation', type: 'customer' },
  { id: '3', name: 'Dự án Nhà máy Long An', type: 'project' },
  { id: '4', name: 'Khách hàng XYZ Trading', type: 'customer' },
];

// Dữ liệu mẫu sản phẩm
const mockProducts = [
  { id: '1', name: 'Tấm pin JA Solar 545W', stock: 500 },
  { id: '2', name: 'Inverter Huawei 10kW', stock: 50 },
  { id: '3', name: 'Inverter Huawei 5kW', stock: 80 },
  { id: '4', name: 'Pin lưu trữ BYD 5kWh', stock: 30 },
  { id: '5', name: 'Cáp DC 6mm²', stock: 10000 },
];

// Dữ liệu mẫu kho
const mockWarehouses = [
  { id: '1', name: 'Kho chính' },
  { id: '2', name: 'Kho phụ Quận 7' },
  { id: '3', name: 'Kho Bình Dương' },
];

// Dữ liệu mẫu phiếu xuất kho
const mockStockOutOrders = [
  {
    id: '1',
    code: 'XK-2025-001',
    customer: 'Dự án Solar Farm Bình Dương',
    customerType: 'project',
    products: [
      { name: 'Tấm pin JA Solar 545W', quantity: 200 },
      { name: 'Inverter Huawei 10kW', quantity: 5 },
    ],
    totalItems: 205,
    warehouse: 'Kho chính',
    date: '2025-12-16',
    status: 'completed',
    createdBy: 'Nguyễn Văn A',
    note: 'Xuất cho giai đoạn 1',
  },
  {
    id: '2',
    code: 'XK-2025-002',
    customer: 'Khách hàng ABC Corporation',
    customerType: 'customer',
    products: [
      { name: 'Inverter Huawei 5kW', quantity: 10 },
      { name: 'Pin lưu trữ BYD 5kWh', quantity: 5 },
    ],
    totalItems: 15,
    warehouse: 'Kho chính',
    date: '2025-12-15',
    status: 'processing',
    createdBy: 'Trần Thị B',
    note: 'Đơn hàng #DH2025-089',
  },
  {
    id: '3',
    code: 'XK-2025-003',
    customer: 'Dự án Nhà máy Long An',
    customerType: 'project',
    products: [
      { name: 'Cáp DC 6mm²', quantity: 2000 },
    ],
    totalItems: 2000,
    warehouse: 'Kho Bình Dương',
    date: '2025-12-14',
    status: 'pending',
    createdBy: 'Lê Văn C',
    note: 'Chờ xác nhận từ quản lý dự án',
  },
  {
    id: '4',
    code: 'XK-2025-004',
    customer: 'Khách hàng XYZ Trading',
    customerType: 'customer',
    products: [
      { name: 'Tấm pin JA Solar 545W', quantity: 50 },
    ],
    totalItems: 50,
    warehouse: 'Kho chính',
    date: '2025-12-13',
    status: 'completed',
    createdBy: 'Nguyễn Văn A',
    note: '',
  },
];

// Component tạo phiếu xuất kho
function CreateStockOutDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: `XK-2025-${String(mockStockOutOrders.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customer: '',
    warehouse: '',
    product: '',
    quantity: 0,
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Tạo phiếu xuất kho:', formData);
    alert('Đã tạo phiếu xuất kho thành công!');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tạo phiếu xuất
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Tạo phiếu xuất kho mới</DialogTitle>
          <DialogDescription>
            Điền thông tin phiếu xuất kho. Các trường có dấu (*) là bắt buộc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-700">Mã phiếu *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  readOnly
                  className="border-gray-300 bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-gray-700">Ngày xuất *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer" className="text-gray-700">Khách hàng/Dự án *</Label>
              <Select
                value={formData.customer}
                onValueChange={(value) => setFormData({ ...formData, customer: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn khách hàng hoặc dự án" />
                </SelectTrigger>
                <SelectContent>
                  {mockCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex items-center gap-2">
                        {c.type === 'project' ? (
                          <FileText className="w-4 h-4 text-blue-500" />
                        ) : (
                          <User className="w-4 h-4 text-green-500" />
                        )}
                        {c.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="warehouse" className="text-gray-700">Kho xuất *</Label>
              <Select
                value={formData.warehouse}
                onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn kho" />
                </SelectTrigger>
                <SelectContent>
                  {mockWarehouses.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product" className="text-gray-700">Sản phẩm *</Label>
              <Select
                value={formData.product}
                onValueChange={(value) => setFormData({ ...formData, product: value })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Chọn sản phẩm" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{p.name}</span>
                        <Badge variant="outline" className="ml-2">Tồn: {p.stock}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-gray-700">Số lượng *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note" className="text-gray-700">Ghi chú</Label>
              <Textarea
                id="note"
                placeholder="Nhập ghi chú (nếu có)..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="border-gray-300"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8960A] text-white">
              Tạo phiếu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StockOutPage() {
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    processing: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    pending: { label: 'Chờ duyệt', color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
  };

  const filteredOrders = mockStockOutOrders.filter((order) => {
    const matchesSearch = 
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockStockOutOrders.length,
    completed: mockStockOutOrders.filter((o) => o.status === 'completed').length,
    processing: mockStockOutOrders.filter((o) => o.status === 'processing').length,
    pending: mockStockOutOrders.filter((o) => o.status === 'pending').length,
    totalItems: mockStockOutOrders.reduce((acc, o) => acc + o.totalItems, 0),
  };

  const handleExportReport = () => {
    alert('Đang xuất báo cáo... Tính năng sẽ được hoàn thiện sau.');
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Xuất kho</h1>
            <p className="text-gray-600 mt-1">Quản lý phiếu xuất hàng cho dự án, khách hàng</p>
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
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <CreateStockOutDialog />
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
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Ý nghĩa các biểu tượng (Icons)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {helpGuide.icons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-600 border">{item.icon}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
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
              <CheckCircle2 className="w-8 h-8 text-green-500" />
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
              <Clock className="w-8 h-8 text-yellow-500" />
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
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng SP xuất</p>
                <p className="text-2xl font-bold text-[#D4AF37]">{stats.totalItems.toLocaleString()}</p>
              </div>
              <Package className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm theo mã phiếu, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-gray-300"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] border-gray-300">
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

      {/* Table */}
      <Card className="bg-white border-gray-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã phiếu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng/Dự án</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày xuất</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{order.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {order.customerType === 'project' ? (
                            <FileText className="w-4 h-4 text-blue-500" />
                          ) : (
                            <User className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-gray-900">{order.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-600">
                          {order.products.map((p, i) => (
                            <div key={i}>{p.name}</div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{order.totalItems.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.warehouse}</td>
                      <td className="px-4 py-3 text-gray-600">{order.date}</td>
                      <td className="px-4 py-3">
                        <Badge className={status.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{order.createdBy}</td>
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

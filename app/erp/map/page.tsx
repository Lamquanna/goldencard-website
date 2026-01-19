'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Building2,
  Users,
  Package,
  Truck,
  Navigation,
  Phone,
  Mail,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Bản đồ',
  description: 'Trang này giúp bạn xem vị trí trực quan của kho hàng, dự án, khách hàng và các chuyến giao hàng trên bản đồ.',
  icons: [
    { icon: 'Building2 (xanh)', meaning: 'Kho hàng/Trụ sở' },
    { icon: 'MapPin (tím)', meaning: 'Dự án đang triển khai' },
    { icon: 'Users (xanh lá)', meaning: 'Khách hàng' },
    { icon: 'Truck (cam)', meaning: 'Xe vận chuyển/giao hàng' },
    { icon: 'Badge xanh', meaning: 'Trạng thái Hoạt động' },
    { icon: 'Badge vàng', meaning: 'Đang triển khai' },
    { icon: 'Badge đỏ', meaning: 'Trạng thái Chờ/Quá hạn' },
    { icon: 'Navigation', meaning: 'Chỉ đường đến địa điểm' },
    { icon: 'Phone', meaning: 'Số điện thoại liên hệ' },
    { icon: 'Mail', meaning: 'Email liên hệ' },
    { icon: '+/-', meaning: 'Phóng to/thu nhỏ bản đồ' },
  ],
  sections: [
    {
      title: 'Thống kê nhanh',
      content: 'Nhấp vào các thẻ thống kê (Kho hàng, Dự án, Khách hàng, Vận chuyển) để lọc và chỉ hiển thị loại địa điểm tương ứng trên danh sách.'
    },
    {
      title: 'Bản đồ tương tác',
      content: 'Bản đồ Google Maps hiển thị vị trí trụ sở chính của công ty. Sử dụng các nút +/- để phóng to/thu nhỏ, kéo để di chuyển bản đồ.'
    },
    {
      title: 'Danh sách địa điểm',
      content: 'Bên phải hiển thị chi tiết các địa điểm bao gồm: tên, địa chỉ, trạng thái và thông tin liên quan như số hàng tồn hoặc tiến độ dự án.'
    },
    {
      title: 'Chỉ đường',
      content: 'Nhấn "Chỉ đường đến công ty" để mở Google Maps và nhận hướng dẫn đường đi từ vị trí hiện tại của bạn đến trụ sở công ty.'
    }
  ]
};

// Tọa độ trụ sở công ty
const COMPANY_HQ = {
  name: 'Golden Energy Solutions',
  address: 'Sunrise Riverside, Block A, Nguyễn Hữu Thọ/Đ. D1 ấp 5, Phước Kiển, Nhà Bè, Thành phố Hồ Chí Minh 70000',
  lat: 10.740842,
  lng: 106.703168,
  phone: '+84 3333 142 88',
  email: 'sales@goldenenergy.vn',
};

// Dữ liệu mẫu cho các địa điểm
const mockLocations = [
  {
    id: '1',
    type: 'warehouse',
    name: 'Kho chính',
    address: 'Sunrise Riverside, Quận 7',
    lat: 10.740842,
    lng: 106.703168,
    status: 'active',
    items: 1250,
  },
  {
    id: '2',
    type: 'project',
    name: 'Dự án Solar Farm Bình Dương',
    address: 'KCN VSIP, Bình Dương',
    lat: 10.9850,
    lng: 106.6500,
    status: 'in_progress',
    progress: 75,
  },
  {
    id: '3',
    type: 'project',
    name: 'Dự án nhà máy ABC',
    address: 'KCN Long Thành, Đồng Nai',
    lat: 10.8200,
    lng: 107.0000,
    status: 'completed',
    progress: 100,
  },
  {
    id: '4',
    type: 'customer',
    name: 'Khách hàng VIP - Công ty XYZ',
    address: 'Quận 1, TP.HCM',
    lat: 10.7769,
    lng: 106.7009,
    status: 'active',
    totalOrders: 15,
  },
  {
    id: '5',
    type: 'delivery',
    name: 'Vận chuyển ĐH-2025-123',
    address: 'Đang giao hàng - Bình Thạnh',
    lat: 10.8010,
    lng: 106.7100,
    status: 'in_transit',
    driver: 'Nguyễn Văn A',
  },
];

const typeConfig: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  warehouse: { label: 'Kho hàng', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Package },
  project: { label: 'Dự án', color: 'text-green-600', bgColor: 'bg-green-100', icon: Building2 },
  customer: { label: 'Khách hàng', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Users },
  delivery: { label: 'Vận chuyển', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Truck },
};

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  in_progress: 'Đang thực hiện',
  completed: 'Hoàn thành',
  in_transit: 'Đang vận chuyển',
};

export default function MapPage() {
  const [filter, setFilter] = useState('all');
  const [showHelp, setShowHelp] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<typeof mockLocations[0] | null>(null);

  const filteredLocations = filter === 'all' 
    ? mockLocations 
    : mockLocations.filter(l => l.type === filter);

  const stats = {
    warehouse: mockLocations.filter(l => l.type === 'warehouse').length,
    project: mockLocations.filter(l => l.type === 'project').length,
    customer: mockLocations.filter(l => l.type === 'customer').length,
    delivery: mockLocations.filter(l => l.type === 'delivery').length,
  };

  // URL nhúng Google Maps
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0423!2d${COMPANY_HQ.lng}!3d${COMPANY_HQ.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzE4LjMiTiAxMDbCsDQyJzA5LjAiRQ!5e0!3m2!1svi!2s!4v1`;

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bản đồ</h1>
            <p className="text-gray-600 mt-1">Xem vị trí kho hàng, dự án và khách hàng</p>
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
        <Button 
          className="bg-[#D4AF37] hover:bg-[#B8960A] text-white"
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${COMPANY_HQ.lat},${COMPANY_HQ.lng}`, '_blank')}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Chỉ đường đến công ty
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
            <Card 
              key={type} 
              className={`bg-white border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                filter === type ? 'ring-2 ring-[#D4AF37]' : ''
              }`}
              onClick={() => setFilter(filter === type ? 'all' : type)}
            >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-gray-200 h-[600px]">
            <CardContent className="p-0 h-full">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>

        {/* Locations List */}
        <div className="space-y-4">
          {/* Company HQ */}
          <Card className="bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-[#D4AF37]/30">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">{COMPANY_HQ.name}</CardTitle>
                  <p className="text-sm text-gray-600">Trụ sở chính</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{COMPANY_HQ.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{COMPANY_HQ.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{COMPANY_HQ.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Filtered Locations */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {filteredLocations.map((location) => {
              const config = typeConfig[location.type];
              const Icon = config.icon;
              return (
                <Card 
                  key={location.id} 
                  className={`bg-white border-gray-200 cursor-pointer hover:shadow-md transition-shadow ${
                    selectedLocation?.id === location.id ? 'ring-2 ring-[#D4AF37]' : ''
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">{location.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {statusLabels[location.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{location.address}</p>
                        <div className="mt-2 text-xs text-gray-500">
                          {location.type === 'warehouse' && `${location.items} sản phẩm trong kho`}
                          {location.type === 'project' && `Tiến độ: ${location.progress}%`}
                          {location.type === 'customer' && `${location.totalOrders} đơn hàng`}
                          {location.type === 'delivery' && `Tài xế: ${location.driver}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

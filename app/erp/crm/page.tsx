'use client';

import React, { useState } from 'react';
import {
  Users,
  Target,
  Handshake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  Clock,
  Plus,
  Flame,
  ThermometerSun,
  Snowflake,
  HelpCircle,
  X,
  Info,
  Building2,
  Globe,
  Share2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang CRM',
  description: 'Trang này giúp bạn quản lý quan hệ khách hàng, theo dõi leads và cơ hội kinh doanh (deals) một cách hiệu quả.',
  icons: [
    { icon: 'Users', meaning: 'Tổng số leads trong hệ thống' },
    { icon: 'Handshake', meaning: 'Số liên hệ (contacts) đã xác nhận' },
    { icon: 'Target', meaning: 'Số deals đang theo đuổi' },
    { icon: 'DollarSign', meaning: 'Tổng giá trị pipeline' },
    { icon: 'TrendingUp/Down', meaning: 'Xu hướng tăng/giảm so với tháng trước' },
    { icon: 'Flame', meaning: 'Lead nóng - Cơ hội cao, cần ưu tiên' },
    { icon: 'ThermometerSun', meaning: 'Lead ấm - Tiềm năng tốt' },
    { icon: 'Snowflake', meaning: 'Lead lạnh - Cần nuôi dưỡng thêm' },
    { icon: 'Phone', meaning: 'Hoạt động gọi điện' },
    { icon: 'Mail', meaning: 'Hoạt động gửi email' },
    { icon: 'Calendar', meaning: 'Cuộc họp/lịch hẹn' },
    { icon: 'Plus', meaning: 'Thêm mới lead/deal' },
  ],
  sections: [
    {
      title: 'Tổng quan chỉ số',
      content: 'Hiển thị KPIs quan trọng: Tổng leads, liên hệ, deals đang theo đuổi và giá trị pipeline. Mũi tên xanh/đỏ cho biết xu hướng so với tháng trước.'
    },
    {
      title: 'Pipeline Funnel',
      content: 'Biểu đồ phễu hiển thị số lượng và giá trị leads theo từng giai đoạn: Mới → Đã liên hệ → Đủ điều kiện → Đã gửi báo giá → Đang đàm phán.'
    },
    {
      title: 'Đánh giá Lead',
      content: 'Mỗi lead được đánh giá "nhiệt độ": Nóng (Hot - màu đỏ): Cơ hội cao, cần ưu tiên. Ấm (Warm - màu cam): Tiềm năng tốt. Lạnh (Cold - màu xanh): Cần nuôi dưỡng thêm.'
    },
    {
      title: 'Hoạt động gần đây',
      content: 'Theo dõi các tương tác với khách hàng: cuộc gọi, email, cuộc họp. Giúp đảm bảo không bỏ lỡ follow-up quan trọng.'
    },
    {
      title: 'Thêm Lead mới',
      content: 'Nhấn nút "Thêm Lead mới" để mở form nhập thông tin khách hàng tiềm năng. Điền đầy đủ thông tin và chọn mức độ quan tâm phù hợp.'
    }
  ]
};

// Cấu hình trạng thái lead
const LEAD_STATUS_CONFIG = [
  { id: 'new', nameVi: 'Mới', color: '#3B82F6' },
  { id: 'contacted', nameVi: 'Đã liên hệ', color: '#8B5CF6' },
  { id: 'qualified', nameVi: 'Đủ điều kiện', color: '#10B981' },
  { id: 'proposal', nameVi: 'Đã gửi báo giá', color: '#F59E0B' },
  { id: 'negotiation', nameVi: 'Đang đàm phán', color: '#EF4444' },
];

const DEAL_STAGE_CONFIG = [
  { id: 'qualification', nameVi: 'Tìm hiểu' },
  { id: 'needs_analysis', nameVi: 'Phân tích nhu cầu' },
  { id: 'proposal', nameVi: 'Báo giá' },
  { id: 'negotiation', nameVi: 'Đàm phán' },
  { id: 'decision_makers', nameVi: 'Quyết định' },
];

// Dữ liệu mẫu
const mockStats = {
  totalLeads: 156,
  leadsThisMonth: 42,
  leadsChange: 12.5,
  totalContacts: 89,
  contactsThisMonth: 15,
  contactsChange: 8.3,
  totalDeals: 34,
  dealsThisMonth: 8,
  dealsChange: -5.2,
  pipelineValue: 2450000000,
  wonValue: 850000000,
  conversionRate: 23.5,
};

const mockLeadsByStatus = [
  { status: 'new', count: 28, value: 450000000 },
  { status: 'contacted', count: 35, value: 620000000 },
  { status: 'qualified', count: 22, value: 380000000 },
  { status: 'proposal', count: 18, value: 520000000 },
  { status: 'negotiation', count: 12, value: 480000000 },
];

const mockRecentLeads = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    company: 'ABC Corporation',
    email: 'an.nguyen@abc.com',
    phone: '0901234567',
    status: 'new',
    rating: 'hot',
    score: 85,
    source: 'Website',
    createdAt: 'Hôm nay',
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    company: 'XYZ Trading',
    email: 'binh.tran@xyz.vn',
    phone: '0912345678',
    status: 'contacted',
    rating: 'warm',
    score: 65,
    source: 'Giới thiệu',
    createdAt: '1 ngày trước',
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    company: 'Tech Solutions',
    email: 'cuong.le@tech.vn',
    phone: '0923456789',
    status: 'qualified',
    rating: 'hot',
    score: 92,
    source: 'Triển lãm',
    createdAt: '2 ngày trước',
  },
  {
    id: '4',
    name: 'Phạm Thu Hằng',
    company: 'Delta Industries',
    email: 'hang.pham@delta.vn',
    phone: '0934567890',
    status: 'proposal',
    rating: 'warm',
    score: 78,
    source: 'Facebook',
    createdAt: '3 ngày trước',
  },
];

const mockActivities = [
  {
    id: '1',
    type: 'call',
    title: 'Gọi điện tư vấn',
    description: 'Tư vấn giải pháp năng lượng mặt trời cho nhà máy',
    time: '30 phút trước',
    icon: Phone,
    color: 'text-green-600 bg-green-100',
  },
  {
    id: '2',
    type: 'meeting',
    title: 'Họp trình bày giải pháp',
    description: 'Trình bày proposal cho dự án 500kW',
    time: 'Ngày mai, 14:00',
    icon: Calendar,
    color: 'text-blue-600 bg-blue-100',
  },
  {
    id: '3',
    type: 'email',
    title: 'Gửi báo giá',
    description: 'Báo giá hệ thống điện mặt trời 100kW',
    time: '1 giờ trước',
    icon: Mail,
    color: 'text-purple-600 bg-purple-100',
  },
];

const mockTopDeals = [
  {
    id: '1',
    name: 'Dự án Solar Farm 5MW',
    value: 850000000,
    stage: 'negotiation',
    probability: 90,
    closeDate: '7 ngày nữa',
  },
  {
    id: '2',
    name: 'Hệ thống mái nhà xưởng 500kW',
    value: 420000000,
    stage: 'proposal',
    probability: 75,
    closeDate: '14 ngày nữa',
  },
  {
    id: '3',
    name: 'Điện mặt trời gia đình Premium',
    value: 180000000,
    stage: 'decision_makers',
    probability: 60,
    closeDate: '10 ngày nữa',
  },
];

// Component hiển thị thẻ thống kê
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  format?: 'number' | 'currency' | 'percent';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
          notation: 'compact',
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('vi-VN');
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatValue(value)}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={cn('text-sm font-medium', change >= 0 ? 'text-green-600' : 'text-red-600')}>
                  {change > 0 && '+'}
                  {change}%
                </span>
                {changeLabel && <span className="text-xs text-gray-500">{changeLabel}</span>}
              </div>
            )}
          </div>
          <div className="p-3 rounded-full" style={{ backgroundColor: `${iconColor}15` }}>
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component biểu đồ phễu Pipeline
function PipelineFunnel() {
  const maxCount = Math.max(...mockLeadsByStatus.map((s) => s.count));

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900">Pipeline Funnel</CardTitle>
        <CardDescription>Phân bố leads theo giai đoạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockLeadsByStatus.map((item) => {
            const config = LEAD_STATUS_CONFIG.find((s) => s.id === item.status);
            if (!config) return null;

            const widthPercent = (item.count / maxCount) * 100;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
                    <span className="text-gray-700">{config.nameVi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.count}</Badge>
                    <span className="text-gray-500 text-xs">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact',
                        maximumFractionDigits: 0,
                      }).format(item.value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPercent}%`, backgroundColor: config.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Component danh sách leads gần đây
function RecentLeads() {
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'hot':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="w-4 h-4 text-orange-500" />;
      default:
        return <Snowflake className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-gray-900">Leads gần đây</CardTitle>
            <CardDescription>Các lead mới nhất cần follow-up</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Xem tất cả
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentLeads.map((lead) => {
            const statusConfig = LEAD_STATUS_CONFIG.find((s) => s.id === lead.status);
            return (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-gray-200">
                      {lead.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{lead.name}</span>
                      {getRatingIcon(lead.rating)}
                    </div>
                    <p className="text-sm text-gray-500">{lead.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    style={{ backgroundColor: `${statusConfig?.color}20`, color: statusConfig?.color }}
                  >
                    {statusConfig?.nameVi}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{lead.createdAt}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Component hoạt động gần đây
function RecentActivities() {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900">Hoạt động gần đây</CardTitle>
        <CardDescription>Tương tác với khách hàng và leads</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockActivities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${activity.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Component top deals
function TopDeals() {
  return (
    <Card className="bg-white border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-gray-900">Deals tiềm năng</CardTitle>
        <CardDescription>Cơ hội có xác suất thắng cao nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTopDeals.map((deal) => {
            const stageConfig = DEAL_STAGE_CONFIG.find((s) => s.id === deal.stage);
            return (
              <div key={deal.id} className="p-3 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{deal.name}</span>
                  <span className="text-sm font-semibold text-[#D4AF37]">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      notation: 'compact',
                      maximumFractionDigits: 0,
                    }).format(deal.value)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>{stageConfig?.nameVi}</span>
                  <span>{deal.closeDate}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Xác suất thắng</span>
                    <span className="font-medium text-gray-700">{deal.probability}%</span>
                  </div>
                  <Progress value={deal.probability} className="h-1.5" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Component dialog thêm khách hàng tiềm năng mới
function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: '',
    rating: 'medium',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/erp/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          company: formData.company || null,
          email: formData.email || null,
          phone: formData.phone || null,
          source: formData.source || 'manual',
          message: formData.notes || null,
          priority: formData.rating,
          status: 'new',
          locale: 'vi',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create lead');
      }

      const result = await response.json();
      console.log('Lead created successfully:', result);
      
      alert('✅ Đã thêm khách hàng tiềm năng thành công!');
      
      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        source: '',
        rating: 'medium',
        notes: '',
      });
      setOpen(false);
      
      // Reload page to show new lead
      window.location.reload();
    } catch (error) {
      console.error('Error creating lead:', error);
      alert('❌ Có lỗi xảy ra khi thêm khách hàng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Thêm khách hàng tiềm năng
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Thêm khách hàng tiềm năng</DialogTitle>
          <DialogDescription>
            Nhập thông tin khách hàng tiềm năng mới vào hệ thống CRM
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-gray-700">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Công ty
                </Label>
                <Input
                  id="company"
                  placeholder="ABC Corp"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-700">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Số điện thoại
                </Label>
                <Input
                  id="phone"
                  placeholder="0901234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source" className="text-gray-700">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Nguồn khách hàng
                </Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        <span>Website công ty</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-blue-600" />
                        <span>Mạng xã hội (Facebook, Zalo)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="referral">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span>Giới thiệu từ khách hàng</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="exhibition">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-500" />
                        <span>Triển lãm / Hội thảo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cold_call">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-500" />
                        <span>Telesales / Gọi điện trực tiếp</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="partner">
                      <div className="flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-[#D4AF37]" />
                        <span>Đối tác giới thiệu</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        <span>Nguồn khác</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating" className="text-gray-700">
                  Đánh giá mức độ quan tâm
                </Label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) => setFormData({ ...formData, rating: value })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Chọn mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span>Rất quan tâm - Khẩn cấp</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <ThermometerSun className="w-4 h-4 text-orange-500" />
                        <span>Quan tâm - Cần theo dõi</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-blue-500" />
                        <span>Ít quan tâm - Nuôi dưỡng</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-700">
                Ghi chú
              </Label>
              <Textarea
                id="notes"
                placeholder="Thông tin bổ sung về khách hàng..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="border-gray-300"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8962E] text-white" disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Đang thêm...' : 'Thêm khách hàng'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CRMPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý khách hàng (CRM)</h1>
            <p className="text-gray-600 mt-1">Theo dõi leads, contacts và cơ hội kinh doanh</p>
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
        <AddLeadDialog />
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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Leads"
          value={mockStats.totalLeads}
          change={mockStats.leadsChange}
          changeLabel="so với tháng trước"
          icon={Users}
          iconColor="#3B82F6"
        />
        <StatCard
          title="Liên hệ"
          value={mockStats.totalContacts}
          change={mockStats.contactsChange}
          changeLabel="so với tháng trước"
          icon={Handshake}
          iconColor="#8B5CF6"
        />
        <StatCard
          title="Deals đang theo"
          value={mockStats.totalDeals}
          change={mockStats.dealsChange}
          changeLabel="so với tháng trước"
          icon={Target}
          iconColor="#10B981"
        />
        <StatCard
          title="Giá trị Pipeline"
          value={mockStats.pipelineValue}
          icon={DollarSign}
          iconColor="#D4AF37"
          format="currency"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activities">Hoạt động</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <PipelineFunnel />
              <RecentLeads />
            </div>
            <div className="space-y-6">
              <TopDeals />
              <RecentActivities />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <RecentLeads />
        </TabsContent>

        <TabsContent value="deals" className="mt-6">
          <TopDeals />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <RecentActivities />
        </TabsContent>
      </Tabs>
    </div>
  );
}

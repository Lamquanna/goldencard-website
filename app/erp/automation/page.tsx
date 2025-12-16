'use client';

import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle2,
  Mail,
  Bell,
  FileText,
  Users,
  Calendar,
  MoreHorizontal,
  Workflow,
  GitBranch,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Tự động hóa',
  description: 'Trang này giúp bạn tạo và quản lý các quy trình tự động, giảm thiểu công việc thủ công lặp đi lặp lại.',
  icons: [
    { icon: 'Zap', meaning: 'Trang tự động hóa workflow' },
    { icon: 'Play (xanh)', meaning: 'Workflow đang hoạt động' },
    { icon: 'Pause (vàng)', meaning: 'Workflow đang tạm dừng' },
    { icon: 'Switch bật/tắt', meaning: 'Bật hoặc tắt workflow' },
    { icon: 'Workflow', meaning: 'Biểu đồ quy trình' },
    { icon: 'GitBranch', meaning: 'Nhánh điều kiện trong workflow' },
    { icon: 'Mail', meaning: 'Hành động gửi email' },
    { icon: 'Bell', meaning: 'Hành động gửi thông báo' },
    { icon: 'FileText', meaning: 'Hành động tạo tài liệu/báo cáo' },
    { icon: 'Users', meaning: 'Hành động liên quan đến nhân sự' },
    { icon: 'Calendar', meaning: 'Trigger theo lịch/thời gian' },
    { icon: 'Clock', meaning: 'Thời gian chạy cuối' },
    { icon: 'CheckCircle2', meaning: 'Workflow chạy thành công' },
    { icon: 'Settings', meaning: 'Cài đặt workflow' },
    { icon: 'Plus', meaning: 'Tạo workflow mới' },
  ],
  sections: [
    {
      title: 'Workflow là gì?',
      content: 'Workflow là chuỗi hành động tự động được kích hoạt bởi một sự kiện. Ví dụ: Khi có khách hàng mới → Tự động gửi email chào mừng.'
    },
    {
      title: 'Mẫu có sẵn',
      content: 'Sử dụng các mẫu workflow phổ biến để bắt đầu nhanh: Email Marketing, Lead Nurturing, Task Automation, Report Generation.'
    },
    {
      title: 'Bật/Tắt workflow',
      content: 'Dùng công tắc bật/tắt để kích hoạt hoặc tạm dừng workflow. Workflow tạm dừng sẽ không chạy cho đến khi được bật lại.'
    },
    {
      title: 'Theo dõi hoạt động',
      content: '"Tổng lần chạy" cho biết workflow đã được thực thi bao nhiêu lần. "Lần chạy cuối" giúp bạn kiểm tra workflow có hoạt động đúng không.'
    }
  ]
};

// Mock automation workflows
const mockWorkflows = [
  {
    id: '1',
    name: 'Gửi email chào mừng khách hàng mới',
    description: 'Tự động gửi email khi có lead mới từ website',
    trigger: 'Lead mới từ website',
    actions: ['Gửi email chào mừng', 'Tạo task follow-up', 'Thông báo cho Sales'],
    status: 'active',
    runs: 156,
    lastRun: '2025-12-16 09:30',
    icon: Mail,
  },
  {
    id: '2',
    name: 'Nhắc nhở công việc quá hạn',
    description: 'Gửi thông báo khi task gần đến hạn',
    trigger: 'Task còn 1 ngày',
    actions: ['Gửi thông báo', 'Gửi email nhắc nhở'],
    status: 'active',
    runs: 89,
    lastRun: '2025-12-16 08:00',
    icon: Bell,
  },
  {
    id: '3',
    name: 'Tạo báo cáo hàng tuần',
    description: 'Tự động tạo báo cáo doanh thu mỗi tuần',
    trigger: 'Mỗi Chủ nhật 18:00',
    actions: ['Tổng hợp dữ liệu', 'Tạo báo cáo PDF', 'Gửi email cho quản lý'],
    status: 'active',
    runs: 24,
    lastRun: '2025-12-15 18:00',
    icon: FileText,
  },
  {
    id: '4',
    name: 'Phân công nhân viên mới',
    description: 'Tự động thiết lập khi có nhân viên mới',
    trigger: 'Nhân viên mới được thêm',
    actions: ['Tạo tài khoản', 'Gửi thông tin đăng nhập', 'Thêm vào nhóm'],
    status: 'paused',
    runs: 12,
    lastRun: '2025-12-10 14:30',
    icon: Users,
  },
  {
    id: '5',
    name: 'Nhắc lịch họp',
    description: 'Gửi thông báo trước cuộc họp 15 phút',
    trigger: '15 phút trước họp',
    actions: ['Gửi thông báo', 'Gửi email nhắc nhở'],
    status: 'active',
    runs: 234,
    lastRun: '2025-12-16 10:45',
    icon: Calendar,
  },
];

const workflowTemplates = [
  { name: 'Email Marketing', description: 'Tự động gửi email theo lịch', icon: Mail },
  { name: 'Lead Nurturing', description: 'Chăm sóc lead tự động', icon: Users },
  { name: 'Task Automation', description: 'Tự động hóa công việc', icon: CheckCircle2 },
  { name: 'Report Generation', description: 'Tạo báo cáo tự động', icon: FileText },
];

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState(mockWorkflows);
  const [showHelp, setShowHelp] = useState(false);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id 
        ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
        : w
    ));
  };

  const activeCount = workflows.filter(w => w.status === 'active').length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.runs, 0);

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tự động hóa</h1>
            <p className="text-gray-600 mt-1">Tạo và quản lý các quy trình tự động</p>
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
        <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white">
          <Plus className="w-4 h-4 mr-2" />
          Tạo workflow mới
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng workflow</p>
                <p className="text-2xl font-bold text-gray-900">{workflows.length}</p>
              </div>
              <Workflow className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang hoạt động</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tạm dừng</p>
                <p className="text-2xl font-bold text-yellow-600">{workflows.length - activeCount}</p>
              </div>
              <Pause className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng lần chạy</p>
                <p className="text-2xl font-bold text-blue-600">{totalRuns}</p>
              </div>
              <Zap className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Mẫu có sẵn</CardTitle>
          <CardDescription>Bắt đầu nhanh với các mẫu workflow phổ biến</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workflowTemplates.map((template, index) => (
              <div 
                key={index} 
                className="p-4 border border-gray-200 rounded-lg hover:border-[#D4AF37] hover:shadow-sm transition-all cursor-pointer"
              >
                <template.icon className="w-8 h-8 text-[#D4AF37] mb-3" />
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflows List */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Workflow của bạn</CardTitle>
          <CardDescription>Quản lý và theo dõi các workflow đã tạo</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      workflow.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <workflow.icon className={`w-6 h-6 ${
                        workflow.status === 'active' ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                        <Badge className={
                          workflow.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }>
                          {workflow.status === 'active' ? 'Đang chạy' : 'Tạm dừng'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <GitBranch className="w-4 h-4" />
                          {workflow.trigger}
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          {workflow.runs} lần chạy
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workflow.lastRun}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={workflow.status === 'active'}
                      onCheckedChange={() => toggleWorkflow(workflow.id)}
                    />
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-400">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

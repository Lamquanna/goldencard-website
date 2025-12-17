'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Plus,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  Search,
  MoreVertical,
  Zap,
  Mail,
  Bell,
  FileText,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// =============================================================================
// TYPES
// =============================================================================

interface WorkflowAction {
  id: string;
  type: 'email' | 'notification' | 'create_task' | 'update_field' | 'webhook';
  config: any;
}

interface WorkflowTrigger {
  type: 'manual' | 'schedule' | 'event';
  config: any;
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  status: 'active' | 'paused' | 'draft';
  totalRuns: number;
  successRate: number;
  lastRun?: string;
  createdBy: string;
  createdAt: string;
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockWorkflows: WorkflowItem[] = [
  {
    id: '1',
    name: 'Chào mừng khách hàng mới',
    description: 'Tự động gửi email chào mừng khi có lead mới từ website',
    trigger: { type: 'event', config: { event: 'lead.created', source: 'website' } },
    actions: [
      { id: 'a1', type: 'email', config: { template: 'welcome', to: '{{lead.email}}' } },
      { id: 'a2', type: 'create_task', config: { title: 'Follow-up lead mới', assignee: 'sales_team' } },
      { id: 'a3', type: 'notification', config: { message: 'Lead mới: {{lead.name}}', to: 'sales_team' } },
    ],
    status: 'active',
    totalRuns: 245,
    successRate: 98.4,
    lastRun: '2025-12-17 08:30',
    createdBy: 'Admin',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Nhắc nhở công việc quá hạn',
    description: 'Gửi thông báo khi task sắp đến hạn hoặc quá hạn',
    trigger: { type: 'schedule', config: { cron: '0 8 * * *' } },
    actions: [
      { id: 'a1', type: 'notification', config: { message: 'Task {{task.title}} sắp đến hạn', to: '{{task.assignee}}' } },
      { id: 'a2', type: 'email', config: { template: 'task_reminder', to: '{{task.assignee.email}}' } },
    ],
    status: 'active',
    totalRuns: 89,
    successRate: 100,
    lastRun: '2025-12-17 08:00',
    createdBy: 'Admin',
    createdAt: '2025-02-01',
  },
  {
    id: '3',
    name: 'Báo cáo doanh thu tuần',
    description: 'Tạo và gửi báo cáo doanh thu mỗi thứ 2',
    trigger: { type: 'schedule', config: { cron: '0 9 * * 1' } },
    actions: [
      { id: 'a1', type: 'webhook', config: { url: '/api/reports/generate', method: 'POST', data: { type: 'weekly_revenue' } } },
      { id: 'a2', type: 'email', config: { template: 'weekly_report', to: 'management@goldenenergy.vn', attachment: '{{report.url}}' } },
    ],
    status: 'active',
    totalRuns: 42,
    successRate: 97.6,
    lastRun: '2025-12-16 09:00',
    createdBy: 'Admin',
    createdAt: '2025-01-20',
  },
  {
    id: '4',
    name: 'Cập nhật trạng thái đơn hàng',
    description: 'Tự động cập nhật trạng thái khi nhận webhook từ hệ thống vận chuyển',
    trigger: { type: 'event', config: { event: 'webhook.received', source: 'shipping_provider' } },
    actions: [
      { id: 'a1', type: 'update_field', config: { model: 'order', field: 'status', value: '{{webhook.status}}' } },
      { id: 'a2', type: 'notification', config: { message: 'Đơn hàng {{order.code}} đã {{webhook.status}}', to: '{{order.customer}}' } },
    ],
    status: 'paused',
    totalRuns: 156,
    successRate: 94.2,
    lastRun: '2025-12-15 14:22',
    createdBy: 'Admin',
    createdAt: '2025-03-10',
  },
  {
    id: '5',
    name: 'Xử lý nghỉ phép tự động',
    description: 'Duyệt tự động đơn nghỉ phép dưới 1 ngày',
    trigger: { type: 'event', config: { event: 'leave_request.created' } },
    actions: [
      { id: 'a1', type: 'update_field', config: { model: 'leave_request', field: 'status', value: 'approved', condition: 'days <= 1' } },
      { id: 'a2', type: 'notification', config: { message: 'Đơn nghỉ phép của bạn đã được duyệt tự động', to: '{{leave_request.employee}}' } },
      { id: 'a3', type: 'email', config: { template: 'leave_approved', to: '{{leave_request.employee.email}}' } },
    ],
    status: 'draft',
    totalRuns: 0,
    successRate: 0,
    createdBy: 'Admin',
    createdAt: '2025-12-10',
  },
];

const workflowTemplates = [
  {
    id: 't1',
    name: 'Lead nurturing',
    description: 'Chuỗi email tự động cho lead chưa chuyển đổi',
    category: 'sales',
    icon: Mail,
  },
  {
    id: 't2',
    name: 'Onboarding nhân viên',
    description: 'Quy trình onboarding tự động cho nhân viên mới',
    category: 'hr',
    icon: CheckCircle2,
  },
  {
    id: 't3',
    name: 'Cảnh báo tồn kho',
    description: 'Thông báo khi tồn kho dưới mức tối thiểu',
    category: 'inventory',
    icon: AlertCircle,
  },
  {
    id: 't4',
    name: 'Thu hồi công nợ',
    description: 'Nhắc nhở thanh toán cho hóa đơn quá hạn',
    category: 'finance',
    icon: Clock,
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function WorkflowCard({ workflow, onToggle, onEdit, onDelete, onClone }: {
  workflow: WorkflowItem;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClone: () => void;
}) {
  const getTriggerLabel = () => {
    switch (workflow.trigger.type) {
      case 'manual': return 'Thủ công';
      case 'schedule': return 'Theo lịch';
      case 'event': return 'Sự kiện';
      default: return workflow.trigger.type;
    }
  };

  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'draft': return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">{workflow.name}</CardTitle>
              <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
                {getStatusIcon()}
                <span className="ml-1">{workflow.status === 'active' ? 'Đang chạy' : workflow.status === 'paused' ? 'Tạm dừng' : 'Nháp'}</span>
              </Badge>
            </div>
            <CardDescription className="mt-1">{workflow.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={workflow.status === 'active'}
              onCheckedChange={onToggle}
              disabled={workflow.status === 'draft'}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onClone}>
                  <Copy className="h-4 w-4 mr-2" />
                  Nhân bản
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Trigger */}
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="text-muted-foreground">Kích hoạt:</span>
            <Badge variant="secondary" className="text-xs">{getTriggerLabel()}</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 text-sm">
            <GitBranch className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">Hành động:</span>
            <div className="flex gap-1">
              {workflow.actions.map((action, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {action.type === 'email' ? '📧' : action.type === 'notification' ? '🔔' : action.type === 'create_task' ? '✅' : '🔄'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-4">
              <span>Đã chạy: <strong className="text-foreground">{workflow.totalRuns}</strong></span>
              <span>Thành công: <strong className="text-green-600">{workflow.successRate}%</strong></span>
            </div>
            {workflow.lastRun && (
              <span>Chạy lần cuối: {workflow.lastRun}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = search === '' || w.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'active').length,
    paused: workflows.filter(w => w.status === 'paused').length,
    draft: workflows.filter(w => w.status === 'draft').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Workflow</h1>
          <p className="text-muted-foreground">Tự động hóa quy trình làm việc</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Mẫu có sẵn
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tạo workflow
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tổng workflow</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Đang chạy</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.paused}</div>
            <p className="text-xs text-muted-foreground">Tạm dừng</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Nháp</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm workflow..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'paused', 'draft'].map(status => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'Tất cả' : status === 'active' ? 'Đang chạy' : status === 'paused' ? 'Tạm dừng' : 'Nháp'}
            </Button>
          ))}
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredWorkflows.map(workflow => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            onToggle={() => alert(`Toggle workflow: ${workflow.name}`)}
            onEdit={() => alert(`Edit workflow: ${workflow.name}`)}
            onDelete={() => {
              if (confirm(`Xóa workflow "${workflow.name}"?`)) {
                setWorkflows(workflows.filter(w => w.id !== workflow.id));
              }
            }}
            onClone={() => alert(`Clone workflow: ${workflow.name}`)}
          />
        ))}
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Mẫu workflow có sẵn</DialogTitle>
            <DialogDescription>Chọn mẫu để bắt đầu nhanh</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {workflowTemplates.map(template => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

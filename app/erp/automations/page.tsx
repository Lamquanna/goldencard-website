'use client';

import { useState, useMemo } from 'react';
import { 
  Zap, Plus, Play, Pause, Trash2, Edit2, Copy, MoreHorizontal,
  ChevronRight, ChevronDown, Filter, Search, Clock, AlertTriangle,
  CheckCircle, XCircle, Settings, ArrowRight, Mail, Bell, MessageSquare,
  FileText, Database, User, Calendar, Package, Briefcase, DollarSign,
  TrendingUp, Users, Building, MapPin, Send, Webhook, RefreshCcw,
  Eye, EyeOff, Activity, GitBranch, Layers, Target, Timer, Cpu
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type TriggerType = 
  | 'lead_created' | 'lead_status_changed' | 'lead_score_changed'
  | 'project_created' | 'project_status_changed' | 'project_milestone'
  | 'task_created' | 'task_completed' | 'task_overdue'
  | 'stock_low' | 'stock_in' | 'stock_out_approved'
  | 'attendance_late' | 'leave_request' | 'overtime_request'
  | 'schedule' | 'webhook';

type ActionType =
  | 'send_email' | 'send_sms' | 'send_notification' | 'send_slack'
  | 'create_task' | 'assign_user' | 'update_field' | 'add_tag'
  | 'move_stage' | 'calculate_score' | 'webhook_call'
  | 'create_record' | 'approve_auto' | 'send_report';

type ConditionOperator = 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';

interface Condition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: string;
}

interface Action {
  id: string;
  type: ActionType;
  config: Record<string, any>;
  delay?: number; // delay in minutes
}

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: TriggerType;
    config?: Record<string, any>;
  };
  conditions: Condition[];
  actions: Action[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  executionCount: number;
  lastExecuted?: string;
  category: 'leads' | 'projects' | 'inventory' | 'hr' | 'notifications' | 'custom';
}

interface ExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  status: 'success' | 'failed' | 'partial';
  executionTime: number; // ms
  details: string;
  affectedRecords: number;
}

// ============================================
// MOCK DATA
// ============================================

const triggerOptions: { type: TriggerType; label: string; icon: React.ElementType; category: string }[] = [
  // Leads
  { type: 'lead_created', label: 'Lead mới được tạo', icon: Users, category: 'Leads' },
  { type: 'lead_status_changed', label: 'Lead chuyển trạng thái', icon: GitBranch, category: 'Leads' },
  { type: 'lead_score_changed', label: 'Điểm lead thay đổi', icon: Target, category: 'Leads' },
  // Projects
  { type: 'project_created', label: 'Dự án mới được tạo', icon: Briefcase, category: 'Dự án' },
  { type: 'project_status_changed', label: 'Dự án chuyển trạng thái', icon: GitBranch, category: 'Dự án' },
  { type: 'project_milestone', label: 'Milestone hoàn thành', icon: Target, category: 'Dự án' },
  // Tasks
  { type: 'task_created', label: 'Task mới được tạo', icon: FileText, category: 'Tasks' },
  { type: 'task_completed', label: 'Task hoàn thành', icon: CheckCircle, category: 'Tasks' },
  { type: 'task_overdue', label: 'Task quá hạn', icon: AlertTriangle, category: 'Tasks' },
  // Inventory
  { type: 'stock_low', label: 'Tồn kho thấp', icon: Package, category: 'Kho' },
  { type: 'stock_in', label: 'Nhập kho mới', icon: Package, category: 'Kho' },
  { type: 'stock_out_approved', label: 'Xuất kho được duyệt', icon: Package, category: 'Kho' },
  // HR
  { type: 'attendance_late', label: 'Nhân viên đi trễ', icon: Clock, category: 'HR' },
  { type: 'leave_request', label: 'Yêu cầu nghỉ phép', icon: Calendar, category: 'HR' },
  { type: 'overtime_request', label: 'Yêu cầu OT', icon: Timer, category: 'HR' },
  // System
  { type: 'schedule', label: 'Lịch định kỳ', icon: Clock, category: 'Hệ thống' },
  { type: 'webhook', label: 'Webhook nhận được', icon: Webhook, category: 'Hệ thống' },
];

const actionOptions: { type: ActionType; label: string; icon: React.ElementType; category: string }[] = [
  // Notifications
  { type: 'send_email', label: 'Gửi email', icon: Mail, category: 'Thông báo' },
  { type: 'send_sms', label: 'Gửi SMS', icon: MessageSquare, category: 'Thông báo' },
  { type: 'send_notification', label: 'Gửi thông báo app', icon: Bell, category: 'Thông báo' },
  { type: 'send_slack', label: 'Gửi tin Slack', icon: MessageSquare, category: 'Thông báo' },
  // Data
  { type: 'create_task', label: 'Tạo task mới', icon: FileText, category: 'Dữ liệu' },
  { type: 'assign_user', label: 'Gán người phụ trách', icon: User, category: 'Dữ liệu' },
  { type: 'update_field', label: 'Cập nhật trường', icon: Edit2, category: 'Dữ liệu' },
  { type: 'add_tag', label: 'Thêm tag', icon: Layers, category: 'Dữ liệu' },
  { type: 'move_stage', label: 'Chuyển stage', icon: GitBranch, category: 'Dữ liệu' },
  { type: 'calculate_score', label: 'Tính điểm', icon: Target, category: 'Dữ liệu' },
  // Integration
  { type: 'webhook_call', label: 'Gọi webhook', icon: Webhook, category: 'Tích hợp' },
  { type: 'create_record', label: 'Tạo bản ghi mới', icon: Database, category: 'Tích hợp' },
  { type: 'approve_auto', label: 'Tự động duyệt', icon: CheckCircle, category: 'Tích hợp' },
  { type: 'send_report', label: 'Gửi báo cáo', icon: FileText, category: 'Tích hợp' },
];

const mockRules: AutomationRule[] = [
  {
    id: 'AUTO001',
    name: 'Lead scoring tự động',
    description: 'Tự động tính điểm lead khi có tương tác mới',
    trigger: { type: 'lead_status_changed' },
    conditions: [
      { id: 'c1', field: 'status', operator: 'equals', value: 'qualified' },
    ],
    actions: [
      { id: 'a1', type: 'calculate_score', config: { formula: 'engagement_based' } },
      { id: 'a2', type: 'send_notification', config: { to: 'assigned_user', message: 'Lead {{lead.name}} đã qualified!' } },
    ],
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-15',
    createdBy: 'Admin',
    executionCount: 1523,
    lastExecuted: '2024-01-15 14:32',
    category: 'leads',
  },
  {
    id: 'AUTO002',
    name: 'Cảnh báo tồn kho thấp',
    description: 'Gửi email khi số lượng tồn kho dưới mức tối thiểu',
    trigger: { type: 'stock_low', config: { threshold_percent: 20 } },
    conditions: [],
    actions: [
      { id: 'a1', type: 'send_email', config: { to: ['warehouse@goldenenergy.vn', 'purchasing@goldenenergy.vn'], subject: 'Cảnh báo tồn kho thấp', template: 'low_stock_alert' } },
      { id: 'a2', type: 'create_task', config: { title: 'Đặt hàng bổ sung {{item.name}}', assignee: 'purchasing_manager' }, delay: 30 },
    ],
    isActive: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12',
    createdBy: 'Warehouse Manager',
    executionCount: 45,
    lastExecuted: '2024-01-15 09:15',
    category: 'inventory',
  },
  {
    id: 'AUTO003',
    name: 'Task quá hạn - Escalation',
    description: 'Tự động escalate khi task quá hạn 24h',
    trigger: { type: 'task_overdue' },
    conditions: [
      { id: 'c1', field: 'overdue_hours', operator: 'greater_than', value: '24' },
      { id: 'c2', field: 'priority', operator: 'equals', value: 'high' },
    ],
    actions: [
      { id: 'a1', type: 'send_notification', config: { to: 'manager', message: 'Task {{task.title}} đã quá hạn hơn 24h!' } },
      { id: 'a2', type: 'send_email', config: { to: 'manager', subject: 'Escalation: Task quá hạn', template: 'task_escalation' } },
      { id: 'a3', type: 'add_tag', config: { tag: 'escalated' } },
    ],
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-14',
    createdBy: 'Project Manager',
    executionCount: 28,
    lastExecuted: '2024-01-15 08:00',
    category: 'projects',
  },
  {
    id: 'AUTO004',
    name: 'Welcome email cho lead mới',
    description: 'Gửi email chào mừng khi có lead mới từ website',
    trigger: { type: 'lead_created' },
    conditions: [
      { id: 'c1', field: 'source', operator: 'equals', value: 'website' },
    ],
    actions: [
      { id: 'a1', type: 'send_email', config: { to: '{{lead.email}}', subject: 'Cảm ơn bạn đã quan tâm GoldenEnergy', template: 'lead_welcome' } },
      { id: 'a2', type: 'assign_user', config: { rule: 'round_robin', team: 'sales' }, delay: 5 },
    ],
    isActive: true,
    createdAt: '2024-01-03',
    updatedAt: '2024-01-15',
    createdBy: 'Marketing',
    executionCount: 312,
    lastExecuted: '2024-01-15 16:45',
    category: 'leads',
  },
  {
    id: 'AUTO005',
    name: 'Thông báo đi trễ',
    description: 'Gửi thông báo cho quản lý khi nhân viên đi trễ',
    trigger: { type: 'attendance_late' },
    conditions: [
      { id: 'c1', field: 'late_minutes', operator: 'greater_than', value: '15' },
    ],
    actions: [
      { id: 'a1', type: 'send_notification', config: { to: 'direct_manager', message: '{{employee.name}} đi trễ {{late_minutes}} phút' } },
    ],
    isActive: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-10',
    createdBy: 'HR Manager',
    executionCount: 156,
    lastExecuted: '2024-01-10 08:30',
    category: 'hr',
  },
  {
    id: 'AUTO006',
    name: 'Báo cáo doanh thu hàng ngày',
    description: 'Tự động gửi báo cáo doanh thu mỗi ngày lúc 18:00',
    trigger: { type: 'schedule', config: { cron: '0 18 * * *', timezone: 'Asia/Ho_Chi_Minh' } },
    conditions: [],
    actions: [
      { id: 'a1', type: 'send_report', config: { report: 'daily_revenue', to: ['ceo@goldenenergy.vn', 'cfo@goldenenergy.vn'] } },
    ],
    isActive: true,
    createdAt: '2023-12-20',
    updatedAt: '2024-01-01',
    createdBy: 'Admin',
    executionCount: 25,
    lastExecuted: '2024-01-15 18:00',
    category: 'notifications',
  },
];

const mockExecutionLogs: ExecutionLog[] = [
  { id: 'LOG001', ruleId: 'AUTO001', ruleName: 'Lead scoring tự động', triggeredAt: '2024-01-15 14:32:15', status: 'success', executionTime: 234, details: 'Lead ID: L-2024-156 scored to 85 points', affectedRecords: 1 },
  { id: 'LOG002', ruleId: 'AUTO004', ruleName: 'Welcome email cho lead mới', triggeredAt: '2024-01-15 14:30:00', status: 'success', executionTime: 1250, details: 'Email sent to nguyenvana@example.com', affectedRecords: 1 },
  { id: 'LOG003', ruleId: 'AUTO002', ruleName: 'Cảnh báo tồn kho thấp', triggeredAt: '2024-01-15 09:15:30', status: 'success', executionTime: 890, details: 'Alert sent for JA Solar 550W (Stock: 85/500)', affectedRecords: 2 },
  { id: 'LOG004', ruleId: 'AUTO003', ruleName: 'Task quá hạn - Escalation', triggeredAt: '2024-01-15 08:00:00', status: 'partial', executionTime: 1500, details: 'Notification sent, email failed (SMTP error)', affectedRecords: 3 },
  { id: 'LOG005', ruleId: 'AUTO006', ruleName: 'Báo cáo doanh thu hàng ngày', triggeredAt: '2024-01-14 18:00:00', status: 'success', executionTime: 5200, details: 'Report generated and sent to 2 recipients', affectedRecords: 0 },
];

// ============================================
// COMPONENT
// ============================================

type ViewMode = 'list' | 'builder';
type FilterCategory = 'all' | 'leads' | 'projects' | 'inventory' | 'hr' | 'notifications' | 'custom';

export default function AutomationsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());

  // New rule builder state
  const [newRule, setNewRule] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: { type: 'lead_created' },
    conditions: [],
    actions: [],
    category: 'leads',
    isActive: true,
  });

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           rule.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || rule.category === filterCategory;
      const matchesStatus = filterStatus === 'all' ||
                           (filterStatus === 'active' && rule.isActive) ||
                           (filterStatus === 'inactive' && !rule.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [rules, searchQuery, filterCategory, filterStatus]);

  const toggleRuleActive = (ruleId: string) => {
    setRules(rules.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r));
  };

  const toggleRuleExpanded = (ruleId: string) => {
    const newExpanded = new Set(expandedRules);
    if (newExpanded.has(ruleId)) {
      newExpanded.delete(ruleId);
    } else {
      newExpanded.add(ruleId);
    }
    setExpandedRules(newExpanded);
  };

  const deleteRule = (ruleId: string) => {
    if (confirm('Bạn có chắc muốn xóa automation này?')) {
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const duplicateRule = (rule: AutomationRule) => {
    const newRuleData: AutomationRule = {
      ...rule,
      id: `AUTO${String(rules.length + 1).padStart(3, '0')}`,
      name: `${rule.name} (Copy)`,
      isActive: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      lastExecuted: undefined,
    };
    setRules([...rules, newRuleData]);
  };

  const getTriggerInfo = (type: TriggerType) => {
    return triggerOptions.find(t => t.type === type);
  };

  const getActionInfo = (type: ActionType) => {
    return actionOptions.find(a => a.type === type);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      leads: 'bg-purple-100 text-purple-700',
      projects: 'bg-blue-100 text-blue-700',
      inventory: 'bg-green-100 text-green-700',
      hr: 'bg-orange-100 text-orange-700',
      notifications: 'bg-yellow-100 text-yellow-700',
      custom: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.custom;
  };

  const categoryLabels: Record<string, string> = {
    leads: 'Leads',
    projects: 'Dự án',
    inventory: 'Kho',
    hr: 'Nhân sự',
    notifications: 'Thông báo',
    custom: 'Tùy chỉnh',
  };

  // Stats
  const stats = useMemo(() => {
    const active = rules.filter(r => r.isActive).length;
    const totalExecutions = rules.reduce((sum, r) => sum + r.executionCount, 0);
    return { total: rules.length, active, inactive: rules.length - active, totalExecutions };
  }, [rules]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Zap className="text-yellow-600" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Automations</h1>
                <p className="text-sm text-gray-500">Tự động hóa quy trình làm việc</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogsModal(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Activity size={18} />
                <span className="hidden sm:inline">Execution Logs</span>
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <Plus size={18} />
                <span>Tạo Automation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Layers className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Tổng automations</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-sm text-gray-500">Đang hoạt động</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Pause className="text-gray-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                <p className="text-sm text-gray-500">Tạm dừng</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Cpu className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Tổng lượt chạy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm automation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {(['all', 'leads', 'projects', 'inventory', 'hr', 'notifications'] as FilterCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    filterCategory === cat
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'Tất cả' : categoryLabels[cat]}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm dừng</option>
            </select>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredRules.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Zap className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có automation</h3>
              <p className="text-gray-500 mb-4">Bắt đầu bằng cách tạo automation đầu tiên</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                <Plus size={18} className="inline mr-2" />
                Tạo Automation
              </button>
            </div>
          ) : (
            filteredRules.map(rule => {
              const triggerInfo = getTriggerInfo(rule.trigger.type);
              const TriggerIcon = triggerInfo?.icon || Zap;
              const isExpanded = expandedRules.has(rule.id);

              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                    !rule.isActive ? 'opacity-60' : ''
                  }`}
                >
                  {/* Rule Header */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Toggle & Icon */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRuleExpanded(rule.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                        <div className={`p-2 rounded-lg ${rule.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <TriggerIcon className={rule.isActive ? 'text-green-600' : 'text-gray-400'} size={20} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{rule.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(rule.category)}`}>
                            {categoryLabels[rule.category]}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Cập nhật: {rule.updatedAt}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity size={12} />
                            {rule.executionCount.toLocaleString()} lần chạy
                          </span>
                          {rule.lastExecuted && (
                            <span className="flex items-center gap-1">
                              <CheckCircle size={12} />
                              Lần cuối: {rule.lastExecuted}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {/* Toggle Switch */}
                        <button
                          onClick={() => toggleRuleActive(rule.id)}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            rule.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              rule.isActive ? 'left-7' : 'left-1'
                            }`}
                          />
                        </button>

                        <button
                          onClick={() => duplicateRule(rule)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                          title="Nhân bản"
                        >
                          <Copy size={18} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRule(rule);
                            setShowCreateModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button
                          onClick={() => deleteRule(rule.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-gray-500 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="py-4 space-y-4">
                        {/* Workflow visualization */}
                        <div className="flex items-start gap-4">
                          {/* Trigger */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Khi</p>
                            <div className="p-3 bg-white rounded-lg border-2 border-blue-200">
                              <div className="flex items-center gap-2">
                                <TriggerIcon className="text-blue-500" size={18} />
                                <span className="font-medium text-gray-900">{triggerInfo?.label}</span>
                              </div>
                              {rule.trigger.config && (
                                <div className="mt-2 text-xs text-gray-500">
                                  {JSON.stringify(rule.trigger.config)}
                                </div>
                              )}
                            </div>
                          </div>

                          <ArrowRight className="mt-8 text-gray-400" size={24} />

                          {/* Conditions */}
                          {rule.conditions.length > 0 && (
                            <>
                              <div className="flex-1">
                                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Nếu</p>
                                <div className="space-y-2">
                                  {rule.conditions.map((cond, idx) => (
                                    <div key={cond.id} className="p-3 bg-white rounded-lg border-2 border-yellow-200">
                                      <span className="text-sm">
                                        <span className="font-medium">{cond.field}</span>
                                        <span className="text-gray-500"> {cond.operator} </span>
                                        <span className="font-medium text-yellow-600">{cond.value}</span>
                                      </span>
                                      {idx < rule.conditions.length - 1 && (
                                        <span className="block text-xs text-gray-400 mt-1">AND</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <ArrowRight className="mt-8 text-gray-400" size={24} />
                            </>
                          )}

                          {/* Actions */}
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Thì</p>
                            <div className="space-y-2">
                              {rule.actions.map((action, idx) => {
                                const actionInfo = getActionInfo(action.type);
                                const ActionIcon = actionInfo?.icon || Zap;
                                return (
                                  <div key={action.id} className="p-3 bg-white rounded-lg border-2 border-green-200">
                                    <div className="flex items-center gap-2">
                                      <ActionIcon className="text-green-500" size={18} />
                                      <span className="font-medium text-gray-900">{actionInfo?.label}</span>
                                    </div>
                                    {action.delay && (
                                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                        <Clock size={12} />
                                        Delay: {action.delay} phút
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold">
                {selectedRule ? 'Chỉnh sửa Automation' : 'Tạo Automation mới'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRule(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên automation *</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="VD: Welcome email cho lead mới"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Mô tả ngắn gọn về automation này..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <select
                      value={newRule.category}
                      onChange={(e) => setNewRule({ ...newRule, category: e.target.value as any })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="leads">Leads</option>
                      <option value="projects">Dự án</option>
                      <option value="inventory">Kho</option>
                      <option value="hr">Nhân sự</option>
                      <option value="notifications">Thông báo</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRule.isActive}
                        onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                        className="rounded text-yellow-500"
                      />
                      <span className="text-sm text-gray-700">Kích hoạt ngay</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Trigger Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                  Chọn Trigger (Khi nào chạy?)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {triggerOptions.map(trigger => {
                    const Icon = trigger.icon;
                    const isSelected = newRule.trigger?.type === trigger.type;
                    return (
                      <button
                        key={trigger.type}
                        onClick={() => setNewRule({ ...newRule, trigger: { type: trigger.type } })}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                        <p className="text-sm font-medium text-gray-900 mt-1">{trigger.label}</p>
                        <p className="text-xs text-gray-500">{trigger.category}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditions Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs">2</span>
                  Điều kiện (Tùy chọn)
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Filter size={18} />
                    <span className="text-sm">Thêm điều kiện để lọc khi nào automation chạy</span>
                  </div>
                  <button className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 flex items-center gap-1">
                    <Plus size={16} />
                    Thêm điều kiện
                  </button>
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">3</span>
                  Actions (Làm gì?)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {actionOptions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.type}
                        className="p-3 rounded-lg text-left bg-gray-50 border-2 border-transparent hover:bg-gray-100 transition-colors"
                      >
                        <Icon size={18} className="text-gray-400" />
                        <p className="text-sm font-medium text-gray-900 mt-1">{action.label}</p>
                        <p className="text-xs text-gray-500">{action.category}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedRule(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                {selectedRule ? 'Lưu thay đổi' : 'Tạo Automation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execution Logs Modal */}
      {showLogsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="text-yellow-500" size={20} />
                Execution Logs
              </h3>
              <button
                onClick={() => setShowLogsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Thời gian</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Automation</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Trạng thái</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Thời gian chạy</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mockExecutionLogs.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">{log.triggeredAt}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">{log.ruleName}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                          log.status === 'success' ? 'bg-green-100 text-green-700' :
                          log.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {log.status === 'success' && <CheckCircle size={12} />}
                          {log.status === 'failed' && <XCircle size={12} />}
                          {log.status === 'partial' && <AlertTriangle size={12} />}
                          {log.status === 'success' ? 'Thành công' :
                           log.status === 'failed' ? 'Thất bại' : 'Một phần'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">
                        {log.executionTime}ms
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t flex items-center justify-between shrink-0">
              <span className="text-sm text-gray-500">
                Hiển thị {mockExecutionLogs.length} logs gần nhất
              </span>
              <button
                onClick={() => setShowLogsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

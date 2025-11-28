'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CheckCircle, Search, Plus, MoreHorizontal,
  Edit2, Trash2, Calendar, ArrowRight,
  AlertTriangle, CheckSquare, Square, Circle, Timer,
  Download, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, canViewAll as checkCanViewAll, hasPermission } from '@/lib/permissions';
import { getAuthUser } from '@/lib/auth-utils';
import { exportToExcel, tasksExportColumns } from '@/lib/excel-export';

// ============================================
// TYPES
// ============================================
interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'site_visit' | 'follow_up' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  assignedTo?: { id: string; name: string; avatar?: string };
  relatedTo?: { type: 'lead' | 'project' | 'deal'; id: string; name: string };
  tags: string[];
  createdAt: Date;
  completedAt?: Date;
  reminder?: number; // minutes before
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    title: 'Gọi điện tư vấn khách hàng ABC Solar',
    description: 'Liên hệ lại để xác nhận báo giá và thời gian lắp đặt',
    type: 'call',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    assignedTo: { id: 'admin', name: 'Admin User' },
    relatedTo: { type: 'lead', id: 'lead-001', name: 'Công ty TNHH ABC Solar' },
    tags: ['Urgent', 'Solar Rooftop'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    reminder: 30,
  },
  {
    id: 'task-002',
    title: 'Gửi email báo giá chi tiết cho XYZ Manufacturing',
    description: 'Soạn và gửi bảng báo giá chi tiết cho hệ thống 100kW',
    type: 'email',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 min from now
    assignedTo: { id: 'sale', name: 'Nhân viên Sale' },
    relatedTo: { type: 'deal', id: 'deal-001', name: 'Dự án Solar XYZ' },
    tags: ['Hot Lead', 'Industrial'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    reminder: 15,
  },
  {
    id: 'task-003',
    title: 'Khảo sát hiện trường Long Hậu IP',
    description: 'Đo đạc mái nhà, kiểm tra hạ tầng điện, chụp ảnh',
    type: 'site_visit',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    assignedTo: { id: 'engineer', name: 'Kỹ thuật viên' },
    relatedTo: { type: 'project', id: 'project-001', name: 'KCN Long Hậu' },
    tags: ['Mega Project', 'Industrial Park'],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    reminder: 60,
  },
  {
    id: 'task-004',
    title: 'Họp demo hệ thống monitoring',
    description: 'Trình diễn app giám sát năng lượng qua điện thoại',
    type: 'demo',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    assignedTo: { id: 'admin', name: 'Admin User' },
    relatedTo: { type: 'lead', id: 'lead-002', name: 'Trường ĐH Bách Khoa' },
    tags: ['Education'],
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
  {
    id: 'task-005',
    title: 'Follow up khách hàng sau lắp đặt',
    description: 'Kiểm tra hài lòng và hỗ trợ vấn đề nếu có',
    type: 'follow_up',
    status: 'pending',
    priority: 'low',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    assignedTo: { id: 'sale', name: 'Nhân viên Sale' },
    relatedTo: { type: 'project', id: 'project-002', name: 'Nhà máy DEF' },
    tags: ['After Sales'],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'task-006',
    title: 'Kiểm tra tồn kho thiết bị',
    description: 'Đối chiếu số liệu tồn kho với hệ thống',
    type: 'other',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    assignedTo: { id: 'warehouse', name: 'Nhân viên Kho' },
    tags: ['Inventory'],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
  },
];

// ============================================
// HELPERS
// ============================================
const formatTimeRemaining = (date: Date) => {
  const diff = date.getTime() - Date.now();
  if (diff < 0) return 'Quá hạn';
  
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} phút`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ`;
  
  const days = Math.floor(hours / 24);
  return `${days} ngày`;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle };
    case 'in_progress':
      return { label: 'Đang thực hiện', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Timer };
    case 'completed':
      return { label: 'Hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    case 'cancelled':
      return { label: 'Đã hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: AlertTriangle };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Circle };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return { label: 'Khẩn cấp', color: 'text-red-400', bg: 'bg-red-500' };
    case 'high':
      return { label: 'Cao', color: 'text-orange-400', bg: 'bg-orange-500' };
    case 'medium':
      return { label: 'Trung bình', color: 'text-amber-400', bg: 'bg-amber-500' };
    case 'low':
      return { label: 'Thấp', color: 'text-gray-400', bg: 'bg-gray-500' };
    default:
      return { label: priority, color: 'text-gray-400', bg: 'bg-gray-500' };
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'call':
      return { label: 'Gọi điện', icon: '📞', color: 'bg-blue-100 text-blue-700' };
    case 'email':
      return { label: 'Email', icon: '📧', color: 'bg-purple-100 text-purple-700' };
    case 'meeting':
      return { label: 'Họp', icon: '🤝', color: 'bg-green-100 text-green-700' };
    case 'demo':
      return { label: 'Demo', icon: '🎥', color: 'bg-yellow-100 text-yellow-700' };
    case 'site_visit':
      return { label: 'Khảo sát', icon: '🏗️', color: 'bg-orange-100 text-orange-700' };
    case 'follow_up':
      return { label: 'Follow Up', icon: '🔄', color: 'bg-pink-100 text-pink-700' };
    default:
      return { label: 'Khác', icon: '📋', color: 'bg-gray-100 text-gray-700' };
  }
};

// ============================================
// TASK ROW COMPONENT
// ============================================
function TaskRow({ task, onToggle, onEdit, onDelete, canEdit = true, canDelete = true }: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(task.status);
  const priorityConfig = getPriorityConfig(task.priority);
  const typeConfig = getTypeConfig(task.type);
  const StatusIcon = statusConfig.icon;
  
  const isOverdue = task.dueDate.getTime() < Date.now() && task.status !== 'completed';

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-4 py-4">
        <button onClick={onToggle} className="p-1" disabled={!canEdit}>
          {task.status === 'completed' ? (
            <CheckSquare className="w-5 h-5 text-emerald-400" />
          ) : (
            <Square className={`w-5 h-5 ${canEdit ? 'text-white/40 hover:text-white/60' : 'text-white/20 cursor-not-allowed'} transition-colors`} />
          )}
        </button>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
          <div>
            <p className={`font-medium ${task.status === 'completed' ? 'line-through text-white/40' : 'text-white'}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-white/50 mt-0.5 truncate max-w-md">{task.description}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </span>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold text-white ${priorityConfig.bg}`}>
          {priorityConfig.label}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-400' : 'text-white/60'}`}>
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.dueDate)}</span>
          {isOverdue && <AlertTriangle className="w-4 h-4" />}
        </div>
        <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-400 font-bold' : 'text-white/40'}`}>
          {formatTimeRemaining(task.dueDate)}
        </p>
      </td>

      <td className="px-4 py-4">
        {task.assignedTo ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                          flex items-center justify-center text-xs text-white font-medium">
              {task.assignedTo.name.charAt(0)}
            </div>
            <span className="text-sm text-white/70">{task.assignedTo.name}</span>
          </div>
        ) : (
          <span className="text-white/30 text-sm">Chưa phân công</span>
        )}
      </td>

      <td className="px-4 py-4">
        {task.relatedTo && (
          <Link href={`/erp/${task.relatedTo.type}s/${task.relatedTo.id}`}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors">
            <span>{task.relatedTo.name}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </td>

      <td className="px-4 py-4">
        {(canEdit || canDelete) ? (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-white/60" />
            </button>

            <AnimatePresence>
              {showActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 z-20 w-40 py-1 rounded-xl 
                               bg-[#1a1a2e] border border-white/10 shadow-2xl"
                  >
                    {canEdit && (
                      <button
                        onClick={() => { onEdit(); setShowActions(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                                   hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Chỉnh sửa</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => { onDelete(); setShowActions(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 
                                   hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="p-2 text-white/20">
            <Lock className="w-4 h-4" />
          </div>
        )}
      </td>
    </motion.tr>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // User auth state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('staff');

  // Permission checks
  const canViewAllTasks = useMemo(() => checkCanViewAll(userRole, 'tasks'), [userRole]);
  const canCreate = useMemo(() => hasPermission(userRole, 'tasks', 'create'), [userRole]);
  const canEdit = useMemo(() => hasPermission(userRole, 'tasks', 'edit'), [userRole]);
  const canDelete = useMemo(() => hasPermission(userRole, 'tasks', 'delete'), [userRole]);
  const canExport = useMemo(() => hasPermission(userRole, 'tasks', 'export'), [userRole]);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setCurrentUserId(authUser.id);
      setUserRole(authUser.role);
    }
  }, []);

  // Stats (based on visible tasks)
  const visibleTasks = useMemo(() => {
    if (canViewAllTasks) return tasks;
    return tasks.filter(t => t.assignedTo?.id === currentUserId);
  }, [tasks, canViewAllTasks, currentUserId]);

  const stats = useMemo(() => ({
    total: visibleTasks.length,
    pending: visibleTasks.filter(t => t.status === 'pending').length,
    inProgress: visibleTasks.filter(t => t.status === 'in_progress').length,
    completed: visibleTasks.filter(t => t.status === 'completed').length,
    overdue: visibleTasks.filter(t => t.dueDate.getTime() < Date.now() && t.status !== 'completed').length,
  }), [visibleTasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = [...visibleTasks];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(t => t.status === selectedStatus);
    }

    if (selectedPriority !== 'all') {
      result = result.filter(t => t.priority === selectedPriority);
    }

    if (selectedType !== 'all') {
      result = result.filter(t => t.type === selectedType);
    }

    // Sort by due date
    result.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return result;
  }, [visibleTasks, search, selectedStatus, selectedPriority, selectedType]);

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    // Check if user can edit this task
    const task = tasks.find(t => t.id === taskId);
    const isOwner = task?.assignedTo?.id === currentUserId;
    if (!canEdit && !isOwner) {
      alert('Bạn không có quyền cập nhật task này');
      return;
    }
    
    setTasks(tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: t.status === 'completed' ? 'pending' : 'completed',
            completedAt: t.status === 'completed' ? undefined : new Date(),
          }
        : t
    ));
  };

  // Export to Excel handler
  const handleExportExcel = useCallback(() => {
    const exportData = filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      typeLabel: getTypeConfig(task.type).label,
      statusLabel: getStatusConfig(task.status).label,
      priorityLabel: getPriorityConfig(task.priority).label,
      dueDate: task.dueDate,
      assignedToName: task.assignedTo?.name || '',
      relatedToName: task.relatedTo?.name || '',
      tags: task.tags,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
    }));
    
    const filename = `tasks_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(exportData, tasksExportColumns, filename);
  }, [filteredTasks]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <CheckCircle className="w-7 h-7 text-emerald-400" />
              {canViewAllTasks ? 'Quản lý Công việc' : 'Công việc của tôi'}
            </h1>
            <p className="text-white/60 mt-1">
              {stats.total} công việc · {stats.overdue > 0 && <span className="text-red-400">{stats.overdue} quá hạn</span>}
            </p>
            {!canViewAllTasks && (
              <div className="flex items-center gap-1 text-sm text-amber-400 mt-1">
                <Lock className="w-4 h-4" />
                <span>Bạn chỉ xem được các task được phân công cho mình</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canExport && (
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 
                               border border-white/10 text-white/70 hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
            )}

            {canCreate && (
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                              bg-gradient-to-r from-emerald-500 to-cyan-500
                              text-white font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                <span>Tạo Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng Tasks</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400/80 text-sm">Chờ xử lý</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Đang thực hiện</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400/80 text-sm">Quá hạn</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.overdue}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, mô tả..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="call">Gọi điện</option>
            <option value="email">Email</option>
            <option value="meeting">Họp</option>
            <option value="demo">Demo</option>
            <option value="site_visit">Khảo sát</option>
            <option value="follow_up">Follow Up</option>
          </select>
        </div>

        {/* Content */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 w-12"></th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Công việc</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Ưu tiên</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Hạn chót</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Phụ trách</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Liên quan</th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTasks.map((task) => {
                  const isOwner = task.assignedTo?.id === currentUserId;
                  const taskCanEdit = canEdit || isOwner;
                  const taskCanDelete = canDelete;
                  
                  return (
                    <TaskRow
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id)}
                      onEdit={() => {
                        if (taskCanEdit) {
                          console.log('Edit', task);
                        } else {
                          alert('Bạn không có quyền chỉnh sửa task này');
                        }
                      }}
                      onDelete={() => {
                        if (taskCanDelete) {
                          console.log('Delete', task);
                        } else {
                          alert('Bạn không có quyền xóa task');
                        }
                      }}
                      canEdit={taskCanEdit}
                      canDelete={taskCanDelete}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTasks.length === 0 && (
            <div className="py-20 text-center">
              <CheckCircle className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/60">Không tìm thấy task</h3>
              <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

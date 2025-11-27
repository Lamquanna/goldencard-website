'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/lib/crm-advanced-features';

interface TaskManagerProps {
  leadId?: string;
  dealId?: string;
  onClose: () => void;
}

export default function TaskManager({ leadId, dealId, onClose }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Gọi điện tư vấn ban đầu',
      description: 'Liên hệ khách hàng để tìm hiểu nhu cầu và giới thiệu giải pháp',
      type: 'call',
      related_to: { type: 'lead', id: leadId || '1' },
      assigned_to: 'agent-001',
      priority: 'high',
      status: 'completed',
      due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder_before: 30,
      completed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Gửi email báo giá chi tiết',
      description: 'Soạn và gửi bảng báo giá cho hệ thống 50kW',
      type: 'email',
      related_to: { type: 'lead', id: leadId || '1' },
      assigned_to: 'agent-001',
      priority: 'high',
      status: 'completed',
      due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder_before: 60,
      completed_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Lên lịch khảo sát hiện trường',
      description: 'Đo đạc mái nhà, kiểm tra hạ tầng điện, chụp ảnh',
      type: 'site_visit',
      related_to: { type: 'lead', id: leadId || '1' },
      assigned_to: 'agent-002',
      priority: 'high',
      status: 'in_progress',
      due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder_before: 120,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      title: 'Họp demo hệ thống monitoring',
      description: 'Trình diễn app giám sát qua điện thoại',
      type: 'demo',
      related_to: { type: 'deal', id: dealId || '1' },
      assigned_to: 'agent-001',
      priority: 'medium',
      status: 'pending',
      due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reminder_before: 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    type: 'call',
    priority: 'medium',
    status: 'pending',
    reminder_before: 60,
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date');

  const TASK_TYPES = [
    { value: 'call', label: 'Gọi Điện', icon: '📞', color: 'bg-blue-100 text-blue-700' },
    { value: 'email', label: 'Email', icon: '📧', color: 'bg-purple-100 text-purple-700' },
    { value: 'meeting', label: 'Họp', icon: '🤝', color: 'bg-green-100 text-green-700' },
    { value: 'demo', label: 'Demo', icon: '🎥', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'site_visit', label: 'Khảo Sát', icon: '🏗️', color: 'bg-orange-100 text-orange-700' },
    { value: 'follow_up', label: 'Follow Up', icon: '🔄', color: 'bg-pink-100 text-pink-700' },
    { value: 'other', label: 'Khác', icon: '📋', color: 'bg-gray-100 text-gray-700' },
  ];

  const PRIORITIES = [
    { value: 'low', label: 'Thấp', color: 'bg-gray-100 text-gray-700', badge: 'bg-gray-500' },
    { value: 'medium', label: 'Trung Bình', color: 'bg-blue-100 text-blue-700', badge: 'bg-blue-500' },
    { value: 'high', label: 'Cao', color: 'bg-orange-100 text-orange-700', badge: 'bg-orange-500' },
    { value: 'urgent', label: 'Khẩn Cấp', color: 'bg-red-100 text-red-700', badge: 'bg-red-500' },
  ];

  const STATUSES = [
    { value: 'pending', label: 'Chờ Xử Lý', color: 'bg-gray-100 text-gray-700' },
    { value: 'in_progress', label: 'Đang Thực Hiện', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Hoàn Thành', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Đã Hủy', color: 'bg-red-100 text-red-700' },
  ];

  // Filter and sort tasks
  let filteredTasks = tasks;
  if (filterStatus !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.status === filterStatus);
  }
  if (filterPriority !== 'all') {
    filteredTasks = filteredTasks.filter(t => t.priority === filterPriority);
  }

  filteredTasks.sort((a, b) => {
    if (sortBy === 'due_date') {
      return new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    }
  });

  const handleCreateTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title || '',
      description: newTask.description || '',
      type: newTask.type || 'call',
      related_to: newTask.related_to || { type: 'lead', id: leadId || '' },
      assigned_to: 'agent-001',
      priority: newTask.priority || 'medium',
      status: 'pending',
      due_date: newTask.due_date || '',
      reminder_before: newTask.reminder_before || 60,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTasks([...tasks, task]);
    setShowCreateForm(false);
    setNewTask({ type: 'call', priority: 'medium', status: 'pending', reminder_before: 60 });
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, completed_date: newStatus === 'completed' ? new Date().toISOString() : undefined, updated_at: new Date().toISOString() }
        : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Xóa task này?')) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const getTaskTypeConfig = (type: string) => TASK_TYPES.find(t => t.value === type) || TASK_TYPES[0];
  const getPriorityConfig = (priority: string) => PRIORITIES.find(p => p.value === priority) || PRIORITIES[1];
  const getStatusConfig = (status: string) => STATUSES.find(s => s.value === status) || STATUSES[0];

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">✅ Task Manager</h2>
              <p className="text-blue-100 text-sm">Quản lý công việc & theo dõi tiến độ</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
              >
                ➕ Tạo Task
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tất Cả</option>
                {STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Priority</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Tất Cả</option>
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-600 mb-1 block">Sắp Xếp</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="due_date">Hạn Chót</option>
                <option value="priority">Độ Ưu Tiên</option>
                <option value="created_at">Mới Nhất</option>
              </select>
            </div>

            <div className="ml-auto flex items-end">
              <div className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{filteredTasks.length}</span> task(s)
              </div>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence>
            {filteredTasks.map(task => {
              const typeConfig = getTaskTypeConfig(task.type);
              const priorityConfig = getPriorityConfig(task.priority);
              const statusConfig = getStatusConfig(task.status);
              const daysUntil = getDaysUntilDue(task.due_date || '');
              const isOverdue = daysUntil < 0 && task.status !== 'completed';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`mb-4 rounded-xl border-2 ${
                    isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                  } p-4 hover:shadow-lg transition-shadow`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={(e) => handleStatusChange(task.id, e.target.checked ? 'completed' : 'pending')}
                      className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />

                    {/* Task Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
                            {typeConfig.icon} {typeConfig.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${priorityConfig.badge} text-white`}>
                            {priorityConfig.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      </div>

                      <h3 className={`text-lg font-bold mb-1 ${
                        task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {task.due_date && (
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                            📅
                            <span>{new Date(task.due_date).toLocaleDateString('vi-VN')}</span>
                            {isOverdue && <span className="text-xs">(Quá hạn {Math.abs(daysUntil)} ngày)</span>}
                            {!isOverdue && daysUntil === 0 && <span className="text-orange-600 font-bold">(Hôm nay!)</span>}
                            {!isOverdue && daysUntil === 1 && <span className="text-yellow-600">(Ngày mai)</span>}
                          </div>
                        )}
                        {task.reminder_before && (
                          <div className="flex items-center gap-1">
                            ⏰ Nhắc trước {task.reminder_before} phút
                          </div>
                        )}
                        {task.assigned_to && (
                          <div className="flex items-center gap-1">
                            👤 {task.assigned_to}
                          </div>
                        )}
                      </div>

                      {task.completed_date && (
                        <div className="mt-2 text-xs text-green-600">
                          ✓ Hoàn thành: {new Date(task.completed_date).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg">Không có task nào</p>
            </div>
          )}
        </div>

        {/* Create Task Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Tạo Task Mới</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu Đề</label>
                    <input
                      type="text"
                      value={newTask.title || ''}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Gọi điện tư vấn khách hàng"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô Tả</label>
                    <textarea
                      value={newTask.description || ''}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Chi tiết công việc..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Loại Task</label>
                      <select
                        value={newTask.type}
                        onChange={(e) => setNewTask({ ...newTask, type: e.target.value as Task['type'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {TASK_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.icon} {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Độ Ưu Tiên</label>
                      <select
                        value={newTask.priority}
                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {PRIORITIES.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hạn Chót</label>
                      <input
                        type="date"
                        value={newTask.due_date || ''}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nhắc Trước (phút)</label>
                      <input
                        type="number"
                        value={newTask.reminder_before || 60}
                        onChange={(e) => setNewTask({ ...newTask, reminder_before: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleCreateTask}
                    disabled={!newTask.title}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-lg hover:from-blue-700 hover:to-purple-800 disabled:opacity-50"
                  >
                    ✅ Tạo Task
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

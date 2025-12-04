'use client';

import { useState } from 'react';
import { X, Calendar, User, Tag, AlertCircle } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
}

interface TaskFormData {
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'site_visit' | 'follow_up' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo?: string;
  relatedTo?: { type: 'lead' | 'project' | 'deal'; id: string; name: string };
  tags: string[];
  reminder?: number;
}

const TASK_TYPES = [
  { value: 'call', label: 'Gọi điện', icon: '📞' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'meeting', label: 'Họp', icon: '🤝' },
  { value: 'demo', label: 'Demo', icon: '🎥' },
  { value: 'site_visit', label: 'Khảo sát', icon: '🏗️' },
  { value: 'follow_up', label: 'Follow Up', icon: '🔄' },
  { value: 'other', label: 'Khác', icon: '📋' },
];

const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-500' },
  { value: 'medium', label: 'Trung bình', color: 'bg-amber-500' },
  { value: 'high', label: 'Cao', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-500' },
];

export default function TaskCreationModal({ isOpen, onClose, onSubmit }: TaskCreationModalProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    type: 'call',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: [],
    reminder: 30,
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData({ ...formData, tags: [...formData.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Tạo Task Mới</h2>
            <Tooltip 
              content="Task là công việc cần làm trong hệ thống ERP. Bạn có thể tạo task để theo dõi các hoạt động như gọi điện, gửi email, họp, khảo sát hiện trường, v.v. Mỗi task có thể được phân công cho nhân viên và liên kết với lead, dự án hoặc deal tương ứng."
              position="right"
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              Tiêu đề <span className="text-red-400">*</span>
              <Tooltip content="Nhập tên ngắn gọn mô tả công việc cần làm" />
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                       placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
              placeholder="VD: Gọi điện tư vấn khách hàng ABC"
              required
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                Loại công việc
                <Tooltip content="Chọn loại công việc phù hợp để dễ dàng phân loại và theo dõi" />
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {TASK_TYPES.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-800">
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                Độ ưu tiên
                <Tooltip content="Đánh dấu mức độ khẩn cấp của công việc để ưu tiên xử lý" />
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value} className="bg-gray-800">
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              Mô tả chi tiết
              <Tooltip content="Ghi chú thêm thông tin chi tiết về công việc này" />
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                       placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 resize-none"
              placeholder="Mô tả chi tiết về công việc..."
            />
          </div>

          {/* Due Date & Reminder */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4" />
                Hạn chót <span className="text-red-400">*</span>
                <Tooltip content="Chọn ngày cần hoàn thành công việc" />
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                Nhắc nhở trước
                <Tooltip content="Hệ thống sẽ gửi thông báo nhắc nhở trước thời hạn" />
              </label>
              <select
                value={formData.reminder || 30}
                onChange={(e) => setFormData({ ...formData, reminder: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value={15} className="bg-gray-800">15 phút</option>
                <option value={30} className="bg-gray-800">30 phút</option>
                <option value={60} className="bg-gray-800">1 giờ</option>
                <option value={120} className="bg-gray-800">2 giờ</option>
                <option value={1440} className="bg-gray-800">1 ngày</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <Tag className="w-4 h-4" />
              Nhãn
              <Tooltip content="Thêm các nhãn để phân loại và tìm kiếm task dễ dàng hơn" />
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50"
                placeholder="Nhập nhãn và nhấn Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-400/80">
                <li>Bạn có thể phân công task cho nhân viên sau khi tạo</li>
                <li>Task có thể được liên kết với Lead, Deal hoặc Dự án</li>
                <li>Hệ thống sẽ gửi thông báo nhắc nhở theo thời gian đã chọn</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 
                       hover:bg-white/5 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500
                       text-white font-medium hover:opacity-90 transition-opacity"
            >
              Tạo Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

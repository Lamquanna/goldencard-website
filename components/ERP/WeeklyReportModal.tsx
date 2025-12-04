'use client';

import { useState } from 'react';
import { X, Calendar, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: WeeklyReportData) => void;
}

interface WeeklyReportData {
  weekStart: string;
  weekEnd: string;
  achievements: string[];
  challenges: string[];
  nextWeekPlan: string[];
  notes?: string;
}

export default function WeeklyReportModal({ isOpen, onClose, onSubmit }: WeeklyReportModalProps) {
  const [formData, setFormData] = useState<WeeklyReportData>({
    weekStart: '',
    weekEnd: '',
    achievements: [''],
    challenges: [''],
    nextWeekPlan: [''],
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty items
    const cleanedData = {
      ...formData,
      achievements: formData.achievements.filter(a => a.trim()),
      challenges: formData.challenges.filter(c => c.trim()),
      nextWeekPlan: formData.nextWeekPlan.filter(p => p.trim()),
    };
    onSubmit(cleanedData);
    onClose();
  };

  const addItem = (field: 'achievements' | 'challenges' | 'nextWeekPlan') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateItem = (field: 'achievements' | 'challenges' | 'nextWeekPlan', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  const removeItem = (field: 'achievements' | 'challenges' | 'nextWeekPlan', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Tạo Báo Cáo Tuần</h2>
            <Tooltip 
              content="Báo cáo tuần giúp tổng kết công việc đã làm, những khó khăn gặp phải và kế hoạch tuần tới. Đây là công cụ quan trọng để theo dõi tiến độ và điều chỉnh chiến lược."
              position="right"
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Week Period */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4" />
                Từ ngày <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.weekStart}
                onChange={(e) => setFormData({ ...formData, weekStart: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-blue-500/50"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Calendar className="w-4 h-4" />
                Đến ngày <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.weekEnd}
                onChange={(e) => setFormData({ ...formData, weekEnd: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-blue-500/50"
                required
              />
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              Công việc đã hoàn thành
              <Tooltip content="Liệt kê các công việc, dự án hoặc mục tiêu đã đạt được trong tuần" />
            </label>
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={achievement}
                    onChange={(e) => updateItem('achievements', index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white
                             placeholder:text-white/40 focus:outline-none focus:border-green-500/50"
                    placeholder="VD: Hoàn thành thiết kế cho dự án Solar XYZ"
                  />
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('achievements', index)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('achievements')}
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                + Thêm mục
              </button>
            </div>
          </div>

          {/* Challenges */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              Khó khăn gặp phải
              <Tooltip content="Những vấn đề, trở ngại hoặc thách thức cần giải quyết" />
            </label>
            <div className="space-y-2">
              {formData.challenges.map((challenge, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={challenge}
                    onChange={(e) => updateItem('challenges', index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white
                             placeholder:text-white/40 focus:outline-none focus:border-orange-500/50"
                    placeholder="VD: Chậm tiến độ do thiếu thiết bị"
                  />
                  {formData.challenges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('challenges', index)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('challenges')}
                className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                + Thêm mục
              </button>
            </div>
          </div>

          {/* Next Week Plan */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Kế hoạch tuần tới
              <Tooltip content="Những việc dự định thực hiện trong tuần tiếp theo" />
            </label>
            <div className="space-y-2">
              {formData.nextWeekPlan.map((plan, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={plan}
                    onChange={(e) => updateItem('nextWeekPlan', index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white
                             placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                    placeholder="VD: Bắt đầu lắp đặt tấm pin tại hiện trường"
                  />
                  {formData.nextWeekPlan.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('nextWeekPlan', index)}
                      className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addItem('nextWeekPlan')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                + Thêm mục
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              Ghi chú thêm
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                       placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 resize-none"
              placeholder="Các thông tin bổ sung khác..."
            />
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium mb-1">Lưu ý:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-400/80">
                <li>Báo cáo tuần sẽ được gửi đến người quản lý trực tiếp</li>
                <li>Hệ thống sẽ tự động tổng hợp báo cáo của toàn bộ</li>
                <li>Bạn có thể chỉnh sửa báo cáo sau khi tạo</li>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500
                       text-white font-medium hover:opacity-90 transition-opacity"
            >
              Tạo Báo Cáo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

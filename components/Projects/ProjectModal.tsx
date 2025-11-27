'use client';

// Create/Edit Project Modal Component
// Full form for project creation and editing

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectStatus } from '@/lib/types/project';

interface ProjectFormData {
  name: string;
  description: string;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  budget: number | null;
  client_name: string;
  client_email: string;
  client_phone: string;
}

interface ProjectModalProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProjectFormData) => Promise<void>;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
  { value: 'active', label: 'Đang hoạt động', color: '#10B981' },
  { value: 'planning', label: 'Đang lên kế hoạch', color: '#3B82F6' },
  { value: 'on_hold', label: 'Tạm dừng', color: '#F59E0B' },
  { value: 'completed', label: 'Hoàn thành', color: '#6B7280' },
  { value: 'cancelled', label: 'Đã hủy', color: '#EF4444' },
];

export default function ProjectModal({
  project,
  isOpen,
  onClose,
  onSave,
}: ProjectModalProps) {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    budget: null,
    client_name: '',
    client_email: '',
    client_phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with project data
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date?.split('T')[0] || '',
        end_date: project.end_date?.split('T')[0] || '',
        budget: project.budget ?? null,
        client_name: project.client_name || '',
        client_email: project.client_email || '',
        client_phone: project.client_phone || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        budget: null,
        client_name: '',
        client_email: '',
        client_phone: '',
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên dự án là bắt buộc';
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Email không hợp lệ';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {project ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Thông tin cơ bản
                </h3>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên dự án <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Nhập tên dự án"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                    placeholder="Mô tả dự án..."
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STATUS_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: option.value })}
                        className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                          formData.status === option.value
                            ? 'border-sky-500 bg-sky-50 text-sky-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: option.color }}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Thời gian
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                        errors.end_date ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors.end_date && (
                      <p className="mt-1 text-sm text-red-500">{errors.end_date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Ngân sách
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân sách dự án (VNĐ)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budget || ''}
                      onChange={e => setFormData({ 
                        ...formData, 
                        budget: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      className="w-full p-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="0"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  Thông tin khách hàng
                </h3>

                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên khách hàng
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Client Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.client_email}
                      onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                        errors.client_email ? 'border-red-500' : 'border-gray-200'
                      }`}
                      placeholder="email@example.com"
                    />
                    {errors.client_email && (
                      <p className="mt-1 text-sm text-red-500">{errors.client_email}</p>
                    )}
                  </div>

                  {/* Client Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.client_phone}
                      onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="0123 456 789"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang lưu...
                </>
              ) : (
                project ? 'Cập nhật' : 'Tạo dự án'
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

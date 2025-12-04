'use client';

import { useState } from 'react';
import { X, User, Phone, Mail, Building, MapPin, DollarSign, AlertCircle, Lightbulb } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface LeadCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lead: LeadFormData) => void;
}

interface LeadFormData {
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value?: number;
  tags: string[];
  notes?: string;
}

const LEAD_SOURCES = [
  'Website', 'Facebook', 'Google Ads', 'Referral', 'Cold Call', 'Event', 'Partner', 'LinkedIn'
];

const PRIORITIES = [
  { value: 'low', label: 'Thấp', color: 'bg-gray-500' },
  { value: 'medium', label: 'Trung bình', color: 'bg-amber-500' },
  { value: 'high', label: 'Cao', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Khẩn cấp', color: 'bg-red-500' },
];

export default function LeadCreationModal({ isOpen, onClose, onSubmit }: LeadCreationModalProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    company: '',
    email: '',
    phone: '',
    source: 'Website',
    priority: 'medium',
    tags: [],
    notes: '',
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
      <div className="bg-[#1a1a2e] rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">Thêm Lead Mới</h2>
            <Tooltip 
              content="Lead là khách hàng tiềm năng - những người quan tâm đến sản phẩm/dịch vụ của bạn nhưng chưa chốt deal. Hệ thống sẽ giúp bạn theo dõi và chuyển đổi lead thành khách hàng thực tế."
              position="right"
            />
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        {/* Explanation Banner */}
        <div className="mx-6 mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 
                      border border-blue-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-blue-400 mb-2">Lead là gì?</h3>
              <p className="text-sm text-white/70 mb-2">
                <strong className="text-white">Lead (Khách hàng tiềm năng)</strong> là những người/doanh nghiệp đã thể hiện sự quan tâm 
                đến sản phẩm hoặc dịch vụ của bạn. Họ có thể đến từ nhiều nguồn như:
              </p>
              <ul className="text-sm text-white/70 space-y-1 ml-4 list-disc">
                <li>Khách hàng điền form liên hệ trên website</li>
                <li>Người tương tác trên Facebook, Google Ads</li>
                <li>Được giới thiệu từ khách hàng cũ</li>
                <li>Gặp gỡ tại sự kiện, hội chợ</li>
              </ul>
              <p className="text-sm text-emerald-400 mt-2 font-medium">
                ✨ Quản lý Lead giúp bạn theo dõi và chuyển đổi họ thành khách hàng, tăng doanh số!
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <User className="w-4 h-4" />
                Tên liên hệ <span className="text-red-400">*</span>
                <Tooltip content="Tên người liên hệ hoặc tên công ty nếu không có người cụ thể" />
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="VD: Nguyễn Văn A"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Building className="w-4 h-4" />
                Công ty
                <Tooltip content="Tên công ty nếu lead là doanh nghiệp" />
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="VD: Công ty TNHH ABC"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Mail className="w-4 h-4" />
                Email
                <Tooltip content="Địa chỉ email để liên hệ với khách hàng" />
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <Phone className="w-4 h-4" />
                Số điện thoại
                <Tooltip content="Số điện thoại liên hệ" />
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="0901234567"
              />
            </div>
          </div>

          {/* Source & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                <MapPin className="w-4 h-4" />
                Nguồn lead <span className="text-red-400">*</span>
                <Tooltip content="Lead đến từ nguồn nào? Website, Facebook, giới thiệu,..." />
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-blue-500/50 cursor-pointer"
                required
              >
                {LEAD_SOURCES.map(source => (
                  <option key={source} value={source} className="bg-gray-800">
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                Độ ưu tiên
                <Tooltip content="Đánh giá mức độ tiềm năng của lead để ưu tiên chăm sóc" />
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as typeof formData.priority })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                         focus:outline-none focus:border-blue-500/50 cursor-pointer"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value} className="bg-gray-800">
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Estimated Value */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              <DollarSign className="w-4 h-4" />
              Giá trị ước tính (VND)
              <Tooltip content="Ước tính giá trị deal có thể đạt được nếu chốt thành công" />
            </label>
            <input
              type="number"
              value={formData.value || ''}
              onChange={(e) => setFormData({ ...formData, value: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                       placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
              placeholder="VD: 50000000"
              min="0"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              Nhãn
              <Tooltip content="Thêm các nhãn để phân loại lead dễ dàng hơn" />
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white
                         placeholder:text-white/40 focus:outline-none focus:border-blue-500/50"
                placeholder="VD: Solar Rooftop, Hot Lead..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
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

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
              Ghi chú
              <Tooltip content="Thông tin bổ sung về lead này" />
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white
                       placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 resize-none"
              placeholder="VD: Khách hàng quan tâm đến hệ thống Solar 50kW cho nhà máy..."
            />
          </div>

          {/* Info Alert */}
          <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-400">
              <p className="font-medium mb-1">Sau khi tạo Lead:</p>
              <ul className="list-disc list-inside space-y-1 text-emerald-400/80">
                <li>Lead sẽ được gán trạng thái "Mới" và điểm số ban đầu</li>
                <li>Bạn có thể phân công nhân viên phụ trách chăm sóc</li>
                <li>Tạo các task liên quan như gọi điện, gửi email, khảo sát</li>
                <li>Theo dõi tiến độ chuyển đổi từ Lead → Qualified → Deal → Won</li>
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
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500
                       text-white font-medium hover:opacity-90 transition-opacity"
            >
              Thêm Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

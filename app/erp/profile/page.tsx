"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface UserProfile {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate: string;
  avatar?: string;
  bio?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    // Load user profile from localStorage token
    const token = localStorage.getItem('crm_auth');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1] || token));
        setProfile({
          id: decoded.id || '1',
          employeeCode: decoded.employeeCode || 'GES001',
          fullName: decoded.fullName || decoded.username || 'User',
          email: decoded.email || 'user@goldenenergy.vn',
          phone: decoded.phone || '0909 xxx xxx',
          position: decoded.position || 'Nhân viên',
          department: decoded.department || 'Chưa xác định',
          joinDate: decoded.joinDate || '2024-01-01',
          bio: decoded.bio || '',
        });
      } catch (e) {
        // Fallback profile
        setProfile({
          id: '1',
          employeeCode: 'GES001',
          fullName: 'User',
          email: 'user@goldenenergy.vn',
          phone: '0909 xxx xxx',
          position: 'Nhân viên',
          department: 'Chưa xác định',
          joinDate: '2024-01-01',
        });
      }
    }
  }, []);

  const handleEdit = () => {
    setEditForm(profile || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    if (profile && editForm) {
      setProfile({ ...profile, ...editForm });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({});
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 mt-1">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-[#D4AF37] to-[#B8960A]">
          <div className="absolute -bottom-16 left-6">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.fullName}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#D4AF37] to-[#B8960A] flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profile.fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-4 right-4">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Chỉnh sửa
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-white text-[#D4AF37] rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Lưu
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.fullName || ''}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="text-2xl font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
              )}
              <p className="text-gray-500">{profile.position} • {profile.department}</p>
              <p className="text-sm text-gray-400 mt-1">Mã NV: {profile.employeeCode}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">Đang làm việc</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin liên hệ</h3>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                ) : (
                  <p className="text-gray-900">{profile.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                ) : (
                  <p className="text-gray-900">{profile.phone}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Thông tin công việc</h3>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Chức vụ</label>
                <p className="text-gray-900">{profile.position}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phòng ban</label>
                <p className="text-gray-900">{profile.department}</p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Ngày vào làm</label>
                <p className="text-gray-900">{new Date(profile.joinDate).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Giới thiệu</h3>
            {isEditing ? (
              <textarea
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 resize-none"
              />
            ) : (
              <p className="text-gray-700">{profile.bio || 'Chưa có thông tin giới thiệu'}</p>
            )}
          </div>

          {/* Activity */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-3">
              {[
                { action: 'Hoàn thành task', target: 'Báo cáo tuần Solar Farm', time: '2 giờ trước' },
                { action: 'Bình luận', target: 'Dự án Nhà máy điện mặt trời Bình Thuận', time: '5 giờ trước' },
                { action: 'Cập nhật', target: 'Thông tin khách hàng ABC Corp', time: '1 ngày trước' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
                  <div className="flex-1">
                    <span className="text-gray-900">{activity.action}</span>
                    <span className="text-gray-500"> • </span>
                    <span className="text-[#D4AF37]">{activity.target}</span>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

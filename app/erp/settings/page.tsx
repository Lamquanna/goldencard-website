"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const settingsSections = [
  { id: 'general', name: 'Cài đặt chung', icon: '⚙️' },
  { id: 'notifications', name: 'Thông báo', icon: '🔔' },
  { id: 'security', name: 'Bảo mật', icon: '🔐' },
  { id: 'display', name: 'Hiển thị', icon: '🎨' },
  { id: 'integrations', name: 'Tích hợp', icon: '🔗' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    notifyTasks: true,
    notifyMentions: true,
    notifyUpdates: false,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // Display
    compactMode: false,
    showAvatars: true,
    animationsEnabled: true,
  });

  const updateSetting = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-gray-500 mt-1">Quản lý cài đặt tài khoản và ứng dụng</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-xl border border-gray-200 p-2">
            {settingsSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === section.id
                    ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">Cài đặt chung</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    >
                      <option value="vi">Tiếng Việt</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Múi giờ</label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => updateSetting('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    >
                      <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
                      <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
                      <option value="Asia/Singapore">Singapore (GMT+8)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng ngày</label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => updateSetting('dateFormat', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">Thông báo</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Thông báo qua Email', desc: 'Nhận thông báo qua email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Nhận thông báo đẩy trên thiết bị' },
                    { key: 'desktopNotifications', label: 'Desktop Notifications', desc: 'Hiển thị thông báo trên desktop' },
                    { key: 'notifyTasks', label: 'Thông báo công việc', desc: 'Khi có công việc mới hoặc cập nhật' },
                    { key: 'notifyMentions', label: 'Thông báo nhắc đến', desc: 'Khi có người nhắc đến bạn' },
                    { key: 'notifyUpdates', label: 'Cập nhật hệ thống', desc: 'Thông báo về cập nhật và bảo trì' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(item.key, !settings[item.key as keyof typeof settings])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings[item.key as keyof typeof settings] ? 'bg-[#D4AF37]' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">Bảo mật</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Xác thực 2 yếu tố</p>
                      <p className="text-sm text-gray-500">Bảo vệ tài khoản với xác thực 2 bước</p>
                    </div>
                    <button
                      onClick={() => updateSetting('twoFactorAuth', !settings.twoFactorAuth)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.twoFactorAuth ? 'bg-[#D4AF37]' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        settings.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian hết phiên (phút)</label>
                    <select
                      value={settings.sessionTimeout}
                      onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                    >
                      <option value="15">15 phút</option>
                      <option value="30">30 phút</option>
                      <option value="60">1 giờ</option>
                      <option value="120">2 giờ</option>
                    </select>
                  </div>
                  
                  <div className="pt-4">
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'display' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">Hiển thị</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'compactMode', label: 'Chế độ thu gọn', desc: 'Giảm khoảng cách giữa các phần tử' },
                    { key: 'showAvatars', label: 'Hiển thị avatar', desc: 'Hiển thị hình đại diện trong danh sách' },
                    { key: 'animationsEnabled', label: 'Hiệu ứng chuyển động', desc: 'Bật hiệu ứng animation trong giao diện' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSetting(item.key, !settings[item.key as keyof typeof settings])}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          settings[item.key as keyof typeof settings] ? 'bg-[#D4AF37]' : 'bg-gray-200'
                        }`}
                      >
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          settings[item.key as keyof typeof settings] ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'integrations' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 pb-4 border-b border-gray-200">Tích hợp</h2>
                
                <div className="space-y-4">
                  {[
                    { name: 'Google Calendar', icon: '📅', connected: true },
                    { name: 'Slack', icon: '💬', connected: false },
                    { name: 'Microsoft Teams', icon: '👥', connected: false },
                    { name: 'Zapier', icon: '⚡', connected: false },
                  ].map(integration => (
                    <div key={integration.name} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <span className="font-medium text-gray-900">{integration.name}</span>
                      </div>
                      <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        integration.connected
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-[#D4AF37] text-white hover:bg-[#B8960A]'
                      }`}>
                        {integration.connected ? 'Ngắt kết nối' : 'Kết nối'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button className="px-6 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8960A] transition-colors font-medium">
                Lưu thay đổi
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

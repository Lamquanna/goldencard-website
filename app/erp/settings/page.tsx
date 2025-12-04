'use client';

import { useState } from 'react';
import { Save, Building2, MapPin, Phone, Mail, Globe, Clock, Users, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompanySettings {
  name: string;
  nameEn: string;
  taxCode: string;
  
  // Addresses
  headquarterAddress: string;
  representativeOfficeAddress: string;
  warehouseAddress: string;
  
  // Contact
  hotline: string;
  phone2: string;
  email: string;
  salesEmail: string;
  website: string;
  
  // Working hours
  workingHours: string;
  workingDays: string;
  
  // Business info
  businessType: string;
  establishedYear: string;
  numberOfEmployees: string;
  
  // Social media
  facebook: string;
  linkedin: string;
  zalo: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'Công ty Golden Energy Vietnam',
  nameEn: 'Golden Energy Vietnam Co., Ltd',
  taxCode: '0316897856',
  
  // Current addresses from README
  headquarterAddress: '625 Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
  representativeOfficeAddress: 'A2206-A2207 Tháp A, Sunrise Riverside, Xã Nhà Bè, TP. Hồ Chí Minh',
  warehouseAddress: '354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP. Hồ Chí Minh',
  
  hotline: '03333 142 88',
  phone2: '0903 117 277',
  email: 'sales@goldenenergy.vn',
  salesEmail: 'sales@goldenenergy.vn',
  website: 'https://www.goldenenergy.vn',
  
  workingHours: '8:00 - 17:30',
  workingDays: 'Thứ 2 - Thứ 7',
  
  businessType: 'Năng lượng tái tạo - Solar & Wind',
  establishedYear: '2020',
  numberOfEmployees: '50-100',
  
  facebook: 'https://facebook.com/goldenenergyvn',
  linkedin: 'https://linkedin.com/company/goldenenergyvn',
  zalo: '03333142880',
};

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'addresses'>('general');

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Call API to save settings
      // await fetch('/api/erp/company-settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for now
      localStorage.setItem('company_settings', JSON.stringify(settings));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general' as const, name: 'Thông tin chung', icon: Building2 },
    { id: 'addresses' as const, name: 'Địa chỉ', icon: MapPin },
    { id: 'contact' as const, name: 'Liên hệ', icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                           flex items-center justify-center">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt công ty</h1>
                <p className="text-sm text-gray-500">Quản lý thông tin công ty và cấu hình hệ thống</p>
              </div>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg
                       hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-800 font-medium">Đã lưu thành công!</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin doanh nghiệp</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên công ty (Tiếng Việt)
                    </label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên công ty (English)
                    </label>
                    <input
                      type="text"
                      value={settings.nameEn}
                      onChange={(e) => handleChange('nameEn', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã số thuế
                    </label>
                    <input
                      type="text"
                      value={settings.taxCode}
                      onChange={(e) => handleChange('taxCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lĩnh vực kinh doanh
                    </label>
                    <input
                      type="text"
                      value={settings.businessType}
                      onChange={(e) => handleChange('businessType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Năm thành lập
                    </label>
                    <input
                      type="text"
                      value={settings.establishedYear}
                      onChange={(e) => handleChange('establishedYear', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quy mô nhân sự
                    </label>
                    <select
                      value={settings.numberOfEmployees}
                      onChange={(e) => handleChange('numberOfEmployees', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1-10">1-10 nhân viên</option>
                      <option value="10-50">10-50 nhân viên</option>
                      <option value="50-100">50-100 nhân viên</option>
                      <option value="100-500">100-500 nhân viên</option>
                      <option value="500+">500+ nhân viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giờ làm việc
                    </label>
                    <input
                      type="text"
                      value={settings.workingHours}
                      onChange={(e) => handleChange('workingHours', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="8:00 - 17:30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày làm việc
                    </label>
                    <input
                      type="text"
                      value={settings.workingDays}
                      onChange={(e) => handleChange('workingDays', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Thứ 2 - Thứ 7"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Địa chỉ trụ sở và văn phòng
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <span className="text-blue-600">★</span> Trụ sở chính
                    </label>
                    <textarea
                      value={settings.headquarterAddress}
                      onChange={(e) => handleChange('headquarterAddress', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ trụ sở chính"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Địa chỉ này sẽ hiển thị trên website, hóa đơn và tất cả tài liệu chính thức
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Văn phòng đại diện
                    </label>
                    <textarea
                      value={settings.representativeOfficeAddress}
                      onChange={(e) => handleChange('representativeOfficeAddress', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ văn phòng đại diện"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ kho
                    </label>
                    <textarea
                      value={settings.warehouseAddress}
                      onChange={(e) => handleChange('warehouseAddress', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nhập địa chỉ kho hàng"
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> Khi cập nhật địa chỉ trụ sở chính, thông tin sẽ tự động cập nhật trên:
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
                    <li>Trang liên hệ trên website</li>
                    <li>Footer của website</li>
                    <li>Hóa đơn và báo giá</li>
                    <li>Email tự động gửi khách hàng</li>
                    <li>Tất cả tài liệu công ty</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Hotline
                    </label>
                    <input
                      type="tel"
                      value={settings.hotline}
                      onChange={(e) => handleChange('hotline', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Số điện thoại phụ
                    </label>
                    <input
                      type="tel"
                      value={settings.phone2}
                      onChange={(e) => handleChange('phone2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email chính
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email bán hàng
                    </label>
                    <input
                      type="email"
                      value={settings.salesEmail}
                      onChange={(e) => handleChange('salesEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website
                    </label>
                    <input
                      type="url"
                      value={settings.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mạng xã hội</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={settings.facebook}
                      onChange={(e) => handleChange('facebook', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={settings.linkedin}
                      onChange={(e) => handleChange('linkedin', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zalo
                    </label>
                    <input
                      type="text"
                      value={settings.zalo}
                      onChange={(e) => handleChange('zalo', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Số điện thoại Zalo"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

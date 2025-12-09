// ============================================================================
// SETTINGS MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [companyInfo, setCompanyInfo] = useState({
    name: 'GoldenEnergy Vietnam',
    taxCode: '0123456789',
    email: 'contact@goldenenergy.vn',
    phone: '1900 1234',
    address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM'
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const navItems = [
    { id: 'company', name: 'Thông tin công ty', icon: '🏢' },
    { id: 'users', name: 'Người dùng', icon: '👥' },
    { id: 'permissions', name: 'Phân quyền', icon: '🔐' },
    { id: 'notifications', name: 'Thông báo', icon: '🔔' },
    { id: 'integrations', name: 'Tích hợp', icon: '🔗' },
    { id: 'backup', name: 'Sao lưu', icon: '💾' },
    { id: 'logs', name: 'Nhật ký', icon: '📋' },
  ];

  const handleSaveCompanyInfo = () => {
    alert('Đã lưu thông tin công ty thành công!');
  };

  const handleAddUser = () => {
    setShowAddUserModal(true);
    alert('Mở form thêm người dùng mới');
  };

  const handleEditUser = (userName: string) => {
    alert(`Mở form chỉnh sửa người dùng: ${userName}`);
  };

  const handleDeleteUser = (userName: string) => {
    if (confirm(`Bạn có chắc muốn xóa người dùng ${userName}?`)) {
      alert(`Đã xóa người dùng: ${userName}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="text-gray-500 mt-1">Quản lý người dùng, phân quyền và cấu hình hệ thống</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-yellow-50 text-yellow-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Company Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên công ty</label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                <input
                  type="text"
                  value={companyInfo.taxCode}
                  onChange={(e) => setCompanyInfo({...companyInfo, taxCode: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({...companyInfo, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                <input
                  type="tel"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({...companyInfo, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input
                  type="text"
                  value={companyInfo.address}
                  onChange={(e) => setCompanyInfo({...companyInfo, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleSaveCompanyInfo}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Quản lý người dùng</h3>
              <button 
                onClick={handleAddUser}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
              >
                + Thêm người dùng
              </button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { name: 'Admin', email: 'admin@goldenenergy.vn', role: 'Super Admin', status: 'Hoạt động' },
                    { name: 'Nguyễn Văn A', email: 'nva@goldenenergy.vn', role: 'Manager', status: 'Hoạt động' },
                    { name: 'Trần Thị B', email: 'ttb@goldenenergy.vn', role: 'Staff', status: 'Hoạt động' },
                    { name: 'Lê Văn C', email: 'lvc@goldenenergy.vn', role: 'Staff', status: 'Tạm khóa' },
                  ].map((user, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-medium text-yellow-700">
                            {user.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'Manager' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditUser(user.name)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.name)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Phân quyền vai trò</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dashboard</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CRM</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">HRM</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Dự án</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Kho</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tài chính</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cài đặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { role: 'Super Admin', perms: [true, true, true, true, true, true, true] },
                    { role: 'Manager', perms: [true, true, true, true, true, true, false] },
                    { role: 'Staff', perms: [true, true, false, true, true, false, false] },
                    { role: 'Viewer', perms: [true, false, false, false, false, false, false] },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.role}</td>
                      {row.perms.map((perm, j) => (
                        <td key={j} className="px-4 py-3 text-center">
                          {perm ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 text-green-600 rounded-full">✓</span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 text-gray-400 rounded-full">−</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin hệ thống</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Phiên bản</span>
                <span className="font-medium text-gray-900">GoldenEnergy HOME v2.0.0</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Cập nhật lần cuối</span>
                <span className="font-medium text-gray-900">20/01/2024</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Dung lượng sử dụng</span>
                <span className="font-medium text-gray-900">2.5 GB / 10 GB</span>
              </div>
              <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Sao lưu gần nhất</span>
                <span className="font-medium text-gray-900">19/01/2024 23:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

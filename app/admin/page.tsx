// ============================================================================
// ADMIN DASHBOARD - HOME PAGE
// GoldenEnergy HOME Platform - Main Dashboard
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, change, changeType = 'neutral', icon, color }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${changeColors[changeType]}`}>
              {changeType === 'positive' && '↑ '}
              {changeType === 'negative' && '↓ '}
              {change}
            </span>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

function QuickAction({ title, description, href, icon, color }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}

// ============================================================================
// RECENT ACTIVITY
// ============================================================================

const recentActivities = [
  { id: 1, action: 'Tạo dự án mới', target: 'Solar Farm Bình Dương', user: 'Nguyễn Văn A', time: '5 phút trước', type: 'project' },
  { id: 2, action: 'Cập nhật khách hàng', target: 'Công ty ABC', user: 'Trần Thị B', time: '15 phút trước', type: 'crm' },
  { id: 3, action: 'Nhập kho', target: '100 tấm pin JinkoSolar', user: 'Lê Văn C', time: '1 giờ trước', type: 'inventory' },
  { id: 4, action: 'Thanh toán', target: 'Hóa đơn #INV-2024-001', user: 'Phạm Thị D', time: '2 giờ trước', type: 'finance' },
  { id: 5, action: 'Thêm nhân viên', target: 'Nguyễn Văn E', user: 'Admin', time: '3 giờ trước', type: 'hrm' },
];

function RecentActivity() {
  const typeColors: Record<string, string> = {
    project: 'bg-blue-100 text-blue-600',
    crm: 'bg-purple-100 text-purple-600',
    inventory: 'bg-orange-100 text-orange-600',
    finance: 'bg-green-100 text-green-600',
    hrm: 'bg-pink-100 text-pink-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Hoạt động gần đây</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {recentActivities.map((activity) => (
          <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${typeColors[activity.type]}`}>
                {activity.user.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-medium text-gray-700">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100">
        <button className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
          Xem tất cả hoạt động →
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE STATUS
// ============================================================================

const modules = [
  { name: 'CRM', status: 'active', items: 156, color: 'bg-purple-500' },
  { name: 'HRM', status: 'active', items: 24, color: 'bg-pink-500' },
  { name: 'Projects', status: 'active', items: 12, color: 'bg-blue-500' },
  { name: 'Inventory', status: 'active', items: 1250, color: 'bg-orange-500' },
  { name: 'Finance', status: 'active', items: 89, color: 'bg-green-500' },
];

function ModuleStatus() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">Trạng thái Module</h3>
      </div>
      <div className="p-4 space-y-3">
        {modules.map((module) => (
          <div key={module.name} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${module.color}`} />
            <span className="flex-1 text-sm text-gray-700">{module.name}</span>
            <span className="text-sm font-medium text-gray-900">{module.items}</span>
            <span className="w-2 h-2 rounded-full bg-green-500" title="Active" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ICONS
// ============================================================================

const DashboardIcons = {
  users: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  project: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  money: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  box: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  plus: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  userPlus: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
  document: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  chart: <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
};

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Chào mừng trở lại! Đây là tổng quan hệ thống.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Quý này</option>
            <option>Năm nay</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng khách hàng"
          value="1,234"
          change="+12% so với tháng trước"
          changeType="positive"
          icon={DashboardIcons.users}
          color="bg-purple-500"
        />
        <StatCard
          title="Dự án đang triển khai"
          value="23"
          change="5 hoàn thành trong tháng"
          changeType="positive"
          icon={DashboardIcons.project}
          color="bg-blue-500"
        />
        <StatCard
          title="Doanh thu tháng"
          value="2.5 tỷ"
          change="+8% so với tháng trước"
          changeType="positive"
          icon={DashboardIcons.money}
          color="bg-green-500"
        />
        <StatCard
          title="Tồn kho"
          value="1,250"
          change="15 cần bổ sung"
          changeType="neutral"
          icon={DashboardIcons.box}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            title="Thêm khách hàng"
            description="Tạo khách hàng mới"
            href="/admin/crm/customers/new"
            icon={DashboardIcons.userPlus}
            color="bg-purple-500"
          />
          <QuickAction
            title="Tạo dự án"
            description="Khởi tạo dự án mới"
            href="/admin/projects/new"
            icon={DashboardIcons.plus}
            color="bg-blue-500"
          />
          <QuickAction
            title="Tạo báo giá"
            description="Lập báo giá cho khách"
            href="/admin/crm/quotes/new"
            icon={DashboardIcons.document}
            color="bg-green-500"
          />
          <QuickAction
            title="Xem báo cáo"
            description="Phân tích dữ liệu"
            href="/admin/reports"
            icon={DashboardIcons.chart}
            color="bg-yellow-500"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <ModuleStatus />
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {DashboardIcons.chart}
            </div>
            <p className="text-gray-500">Biểu đồ doanh thu sẽ hiển thị ở đây</p>
            <p className="text-xs text-gray-400 mt-1">Tích hợp với thư viện charts</p>
          </div>
        </div>
      </div>
    </div>
  );
}

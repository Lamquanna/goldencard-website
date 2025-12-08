"use client";

// =============================================================================
// HOME PLATFORM - Dashboard Page
// Main dashboard with module overview
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppShell } from './components/AppShell';

// Icons
const Icons = {
  trendUp: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  trendDown: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link: string;
}

function KPICard({ title, value, change, changeLabel, icon, color, bgColor, link }: KPICardProps) {
  return (
    <Link href={link}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-xl ${bgColor}`}>
            <div className={color}>{icon}</div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? Icons.trendUp : Icons.trendDown}
            {Math.abs(change)}%
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{changeLabel}</p>
        </div>
        <div className="mt-3 flex items-center text-sm text-[#D4AF37] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Xem chi tiết {Icons.arrowRight}
        </div>
      </motion.div>
    </Link>
  );
}

// Module Card Component
interface ModuleCardProps {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  link: string;
  stats?: { label: string; value: string }[];
}

function ModuleCard({ id, name, nameVi, description, icon, color, link, stats }: ModuleCardProps) {
  return (
    <Link href={link}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{nameVi}</h3>
            <p className="text-xs text-gray-500">{name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{description}</p>
        {stats && stats.length > 0 && (
          <div className="flex gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// Activity Item Component
interface ActivityItemProps {
  type: string;
  title: string;
  description: string;
  time: string;
  user: string;
}

function ActivityItem({ type, title, description, time, user }: ActivityItemProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30';
      case 'task': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30';
      case 'project': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30';
      case 'inventory': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700';
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className={`w-10 h-10 rounded-full ${getTypeColor(type)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-sm">
          {type === 'lead' && '👤'}
          {type === 'task' && '✓'}
          {type === 'project' && '📁'}
          {type === 'inventory' && '📦'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
        <p className="text-sm text-gray-500 truncate">{description}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{user}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function HomePage() {
  const { user, activeModules } = useAppShell();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // Mock KPI data
  const kpiData = [
    {
      title: 'Tổng Doanh thu',
      value: '₫12.5 tỷ',
      change: 15.7,
      changeLabel: 'so với tháng trước',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      link: '/home/finance',
    },
    {
      title: 'Leads mới',
      value: '156',
      change: 23.4,
      changeLabel: 'tuần này',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      link: '/home/crm/leads',
    },
    {
      title: 'Dự án hoạt động',
      value: '12',
      change: 8.2,
      changeLabel: 'so với quý trước',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      link: '/home/projects',
    },
    {
      title: 'Tasks hoàn thành',
      value: '89%',
      change: 5.3,
      changeLabel: 'tháng này',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      link: '/home/tasks',
    },
  ];

  // Mock activity data
  const activities = [
    { type: 'lead', title: 'Lead mới từ website', description: 'Công ty ABC Solar đã gửi form liên hệ', time: '5 phút trước', user: 'Hệ thống' },
    { type: 'task', title: 'Task hoàn thành', description: 'Khảo sát mái nhà xưởng XYZ hoàn tất', time: '15 phút trước', user: 'Nguyễn Văn A' },
    { type: 'project', title: 'Milestone đạt được', description: 'Solar Farm Bình Thuận - Lắp đặt 50%', time: '1 giờ trước', user: 'Trần Thị B' },
    { type: 'inventory', title: 'Nhập kho mới', description: '500 tấm pin JA Solar 550W', time: '2 giờ trước', user: 'Lê Văn C' },
  ];

  // Featured modules
  const featuredModules = [
    {
      id: 'crm',
      name: 'CRM',
      nameVi: 'Quản lý Khách hàng',
      description: 'Pipeline, Leads, Deals, Contacts',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      color: 'bg-blue-500',
      link: '/home/crm',
      stats: [{ label: 'Leads', value: '156' }, { label: 'Deals', value: '42' }],
    },
    {
      id: 'hrm',
      name: 'HRM',
      nameVi: 'Nhân sự',
      description: 'Nhân viên, Chấm công, Nghỉ phép',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
      color: 'bg-emerald-500',
      link: '/home/hrm',
      stats: [{ label: 'Nhân viên', value: '85' }, { label: 'Check-in', value: '78' }],
    },
    {
      id: 'projects',
      name: 'Projects',
      nameVi: 'Dự án',
      description: 'Gantt, Timeline, Resources',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'bg-indigo-500',
      link: '/home/projects',
      stats: [{ label: 'Dự án', value: '12' }, { label: 'Tasks', value: '234' }],
    },
    {
      id: 'inventory',
      name: 'Inventory',
      nameVi: 'Kho hàng',
      description: 'Stock, Warehouses, Transfers',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      color: 'bg-amber-500',
      link: '/home/inventory',
      stats: [{ label: 'SKUs', value: '1,234' }, { label: 'Kho', value: '5' }],
    },
    {
      id: 'finance',
      name: 'Finance',
      nameVi: 'Kế toán',
      description: 'Hóa đơn, Thanh toán, Chi phí',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'bg-violet-500',
      link: '/home/finance',
      stats: [{ label: 'Hóa đơn', value: '89' }, { label: 'Thu', value: '₫5.2 tỷ' }],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#C4A030] to-[#B8960A] rounded-2xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting}, {user?.fullName || user?.username || 'Người dùng'}! 👋
            </h1>
            <p className="mt-1 text-yellow-100/90">
              Chào mừng đến với GoldenHome - Nền tảng quản lý tổng hợp
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            {Icons.calendar}
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </motion.div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <KPICard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Modules</h2>
            <Link href="/home/settings/modules" className="text-sm text-[#D4AF37] hover:underline">
              Quản lý modules →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <ModuleCard {...module} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Hoạt động gần đây</h2>
            <Link href="/home/activity" className="text-sm text-[#D4AF37] hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-0">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <ActivityItem {...activity} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Tạo Task', icon: '✓', color: 'bg-emerald-100 text-emerald-600', link: '/home/tasks?action=create' },
            { label: 'Thêm Lead', icon: '👤', color: 'bg-blue-100 text-blue-600', link: '/home/crm/leads?action=create' },
            { label: 'Dự án mới', icon: '📁', color: 'bg-purple-100 text-purple-600', link: '/home/projects?action=create' },
            { label: 'Check-in', icon: '📍', color: 'bg-pink-100 text-pink-600', link: '/home/hrm/attendance' },
            { label: 'Nhập kho', icon: '📦', color: 'bg-orange-100 text-orange-600', link: '/home/inventory/stock-in' },
            { label: 'Báo cáo', icon: '📊', color: 'bg-indigo-100 text-indigo-600', link: '/home/analytics' },
          ].map((action, index) => (
            <Link key={index} href={action.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`${action.color} dark:bg-opacity-20 rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-2xl mb-1">{action.icon}</div>
                <p className="text-sm font-medium">{action.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

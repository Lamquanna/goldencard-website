"use client";

// =============================================================================
// HOME PLATFORM - Dashboard Page
// Main dashboard with module overview - Using real data from API + Analytics Charts
// =============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppShell } from './components/AppShell';
import { authFetch } from '@/lib/hooks/useAuthFetch';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Chart colors
const CHART_COLORS = {
  revenue: '#10b981',
  expenses: '#ef4444',
  profit: '#D4AF37',
  primary: '#D4AF37',
  secondary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const PIE_COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

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
        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
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
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2.5 rounded-xl ${color}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{nameVi}</h3>
            <p className="text-xs text-gray-500">{name}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-3">{description}</p>
        {stats && stats.length > 0 && (
          <div className="flex gap-4 pt-3 border-t border-gray-100">
            {stats.map((stat, i) => (
              <div key={i}>
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
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
      case 'lead': return 'bg-blue-100 text-blue-600';
      case 'task': return 'bg-emerald-100 text-emerald-600';
      case 'project': return 'bg-purple-100 text-purple-600';
      case 'inventory': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lead': return '👤';
      case 'task': return '✓';
      case 'project': return '📋';
      case 'inventory': return '📦';
      default: return '•';
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className={`w-10 h-10 rounded-full ${getTypeColor(type)} flex items-center justify-center flex-shrink-0`}>
        <span className="text-sm">{getTypeIcon(type)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 text-sm">{title}</p>
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
  const [totalEmployees, setTotalEmployees] = useState(0);
  
  // Analytics state
  const [financeData, setFinanceData] = useState<any>(null);
  const [hrmData, setHrmData] = useState<any>(null);
  const [inventoryData, setInventoryData] = useState<any>(null);
  const [projectsData, setProjectsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real employee count from API
  useEffect(() => {
    authFetch('/api/erp/employees')
      .then(res => res.json())
      .then(data => {
        setTotalEmployees(data.employees?.length || 0);
      })
      .catch(() => setTotalEmployees(0));
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [finance, hrm, inventory, projects] = await Promise.all([
          authFetch('/api/analytics/finance?period=month').then(r => r.json()),
          authFetch('/api/analytics/hrm?period=month').then(r => r.json()),
          authFetch('/api/analytics/inventory').then(r => r.json()),
          authFetch('/api/analytics/projects').then(r => r.json()),
        ]);

        setFinanceData(finance.data);
        setHrmData(hrm.data);
        setInventoryData(inventory.data);
        setProjectsData(projects.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');
  }, []);

  // KPI data - Real-time analytics from API
  const kpiData = [
    {
      title: 'Tổng Doanh thu',
      value: financeData?.summary?.totalRevenue 
        ? `₫${(financeData.summary.totalRevenue / 1000000000).toFixed(1)} tỷ`
        : '₫0',
      change: financeData?.summary?.profitMargin || 0,
      changeLabel: 'lợi nhuận ròng',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/erp/finance',
    },
    {
      title: 'Nhân viên',
      value: hrmData?.employees?.total?.toString() || totalEmployees.toString(),
      change: hrmData?.attendance?.attendanceRate || 0,
      changeLabel: 'tỷ lệ check-in hôm nay',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/erp/hrm',
    },
    {
      title: 'Dự án hoạt động',
      value: projectsData?.summary?.activeProjects?.toString() || '0',
      change: projectsData?.tasks?.completionRate || 0,
      changeLabel: 'tasks hoàn thành',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/erp/projects',
    },
    {
      title: 'Kho hàng',
      value: inventoryData?.summary?.totalItems?.toString() || '0',
      change: inventoryData?.lowStockAlerts?.length || 0,
      changeLabel: 'sản phẩm sắp hết',
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      link: '/erp/inventory',
    },
  ];

  // Activity data - hardcoded for demo (will connect to real API later)
  const activities = [
    { type: 'lead', title: 'Lead mới từ website', description: 'Công ty ABC Solar đã gửi form liên hệ', time: '5 phút trước', user: 'Hệ thống' },
    { type: 'task', title: 'Task hoàn thành', description: 'Khảo sát mái nhà xưởng XYZ hoàn tất', time: '15 phút trước', user: 'Nhân viên' },
    { type: 'project', title: 'Milestone đạt được', description: 'Solar Farm Bình Thuận - Lắp đặt 50%', time: '1 giờ trước', user: 'Quản lý' },
    { type: 'inventory', title: 'Nhập kho mới', description: '500 tấm pin JA Solar 550W', time: '2 giờ trước', user: 'Kho' },
  ];

  // Featured modules with real employee count
  const featuredModules = [
    {
      id: 'crm',
      name: 'CRM',
      nameVi: 'Quản lý Khách hàng',
      description: 'Pipeline, Leads, Deals, Contacts',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
      color: 'bg-blue-500',
      link: '/erp/crm',
      stats: [{ label: 'Leads', value: '156' }, { label: 'Deals', value: '42' }],
    },
    {
      id: 'hrm',
      name: 'HRM',
      nameVi: 'Nhân sự',
      description: 'Nhân viên, Chấm công, Nghỉ phép',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>,
      color: 'bg-emerald-500',
      link: '/erp/hrm',
      stats: [{ label: 'Nhân viên', value: totalEmployees.toString() }, { label: 'Check-in', value: totalEmployees.toString() }],
    },
    {
      id: 'projects',
      name: 'Projects',
      nameVi: 'Dự án',
      description: 'Gantt, Timeline, Resources',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
      color: 'bg-indigo-500',
      link: '/erp/projects',
      stats: [{ label: 'Dự án', value: '12' }, { label: 'Tasks', value: '234' }],
    },
    {
      id: 'inventory',
      name: 'Inventory',
      nameVi: 'Kho hàng',
      description: 'Stock, Warehouses, Transfers',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      color: 'bg-amber-500',
      link: '/erp/inventory',
      stats: [{ label: 'SKUs', value: '1,234' }, { label: 'Kho', value: '5' }],
    },
    {
      id: 'finance',
      name: 'Finance',
      nameVi: 'Kế toán',
      description: 'Hóa đơn, Thanh toán, Chi phí',
      icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      color: 'bg-violet-500',
      link: '/erp/finance',
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
            <h2 className="text-lg font-semibold text-gray-900">Modules</h2>
            <Link href="/erp/settings/modules" className="text-sm text-[#D4AF37] hover:underline">
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
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Hoạt động gần đây</h2>
            <Link href="/erp/dashboard" className="text-sm text-[#D4AF37] hover:underline">
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

      {/* Analytics Charts */}
      {!loading && (financeData || hrmData || inventoryData || projectsData) && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Phân tích dữ liệu</h2>

          {/* Finance Charts */}
          {financeData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Doanh thu & Chi phí (30 ngày)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financeData.dailyTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value: any) => `₫${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke={CHART_COLORS.revenue} name="Doanh thu" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke={CHART_COLORS.expenses} name="Chi phí" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke={CHART_COLORS.profit} name="Lợi nhuận" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo danh mục</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={financeData.revenueByCategory || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.category}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                    >
                      {(financeData.revenueByCategory || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `₫${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* HRM & Inventory Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hrmData && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Chấm công (30 ngày)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={hrmData.attendanceTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="present" stroke={CHART_COLORS.success} name="Có mặt" strokeWidth={2} />
                    <Line type="monotone" dataKey="avgHours" stroke={CHART_COLORS.primary} name="Giờ TB" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {inventoryData && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Nhập xuất kho (30 ngày)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryData.stockTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stockInQty" fill={CHART_COLORS.success} name="Nhập kho" />
                    <Bar dataKey="stockOutQty" fill={CHART_COLORS.danger} name="Xuất kho" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Projects Chart */}
          {projectsData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Trạng thái dự án</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectsData.byStatus || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.status}: ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="status"
                    >
                      {(projectsData.byStatus || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Dự án hoàn thành (6 tháng)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectsData.completionTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill={CHART_COLORS.primary} name="Hoàn thành" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Access */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: 'Tạo Task', icon: '✓', color: 'bg-emerald-100 text-emerald-600', link: '/erp/tasks?action=create' },
            { label: 'Thêm Lead', icon: '👤', color: 'bg-blue-100 text-blue-600', link: '/erp/crm/leads?action=create' },
            { label: 'Dự án mới', icon: '📋', color: 'bg-purple-100 text-purple-600', link: '/erp/projects?action=create' },
            { label: 'Check-in', icon: '📍', color: 'bg-pink-100 text-pink-600', link: '/erp/hrm/attendance' },
            { label: 'Nhập kho', icon: '📦', color: 'bg-orange-100 text-orange-600', link: '/erp/inventory/stock-in' },
            { label: 'Báo cáo', icon: '📊', color: 'bg-indigo-100 text-indigo-600', link: '/erp/analytics' },
          ].map((action, index) => (
            <Link key={index} href={action.link}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className={`${action.color} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}
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

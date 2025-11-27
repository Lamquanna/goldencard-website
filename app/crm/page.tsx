"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Icons
const Icons = {
  tasks: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  leads: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  inventory: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  analytics: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  attendance: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  automations: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  maps: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  dashboard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 6a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zM4 13a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
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
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  wind: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

// Types
interface KPIMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  type: 'task' | 'lead' | 'project' | 'inventory' | 'attendance';
  title: string;
  description: string;
  time: string;
  user: string;
}

interface UpcomingTask {
  id: string;
  title: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
}

// Mock data
const kpiMetrics: KPIMetric[] = [
  {
    label: 'Tổng Doanh thu',
    value: '₫12.5 tỷ',
    change: 15.7,
    changeLabel: 'so với tháng trước',
    icon: Icons.analytics,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    link: '/crm/analytics'
  },
  {
    label: 'Leads mới',
    value: '156',
    change: 23.4,
    changeLabel: 'tuần này',
    icon: Icons.leads,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    link: '/crm/leads'
  },
  {
    label: 'Dự án đang chạy',
    value: '12',
    change: -5.2,
    changeLabel: 'so với Q3',
    icon: Icons.projects,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    link: '/crm/projects'
  },
  {
    label: 'Tasks hoàn thành',
    value: '89%',
    change: 8.3,
    changeLabel: 'tháng này',
    icon: Icons.tasks,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    link: '/crm/tasks'
  }
];

const quickActions: QuickAction[] = [
  {
    label: 'Tạo Task mới',
    description: 'Thêm công việc cần làm',
    icon: Icons.tasks,
    href: '/crm/tasks',
    color: 'text-blue-600',
    bgColor: 'bg-blue-500'
  },
  {
    label: 'Thêm Lead',
    description: 'Nhập khách hàng tiềm năng',
    icon: Icons.leads,
    href: '/crm/leads',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500'
  },
  {
    label: 'Xem Analytics',
    description: 'Báo cáo & thống kê',
    icon: Icons.analytics,
    href: '/crm/analytics',
    color: 'text-purple-600',
    bgColor: 'bg-purple-500'
  },
  {
    label: 'Quản lý Kho',
    description: 'Kiểm tra tồn kho',
    icon: Icons.inventory,
    href: '/crm/inventory',
    color: 'text-orange-600',
    bgColor: 'bg-orange-500'
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'lead',
    title: 'Lead mới từ website',
    description: 'Công ty ABC Solar đã gửi form liên hệ',
    time: '5 phút trước',
    user: 'Hệ thống'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task hoàn thành',
    description: 'Khảo sát mái nhà xưởng XYZ hoàn tất',
    time: '15 phút trước',
    user: 'Nguyễn Văn A'
  },
  {
    id: '3',
    type: 'project',
    title: 'Milestone đạt được',
    description: 'Solar Farm Bình Thuận - Lắp đặt 50% panels',
    time: '1 giờ trước',
    user: 'Trần Thị B'
  },
  {
    id: '4',
    type: 'inventory',
    title: 'Nhập kho mới',
    description: '500 tấm pin JA Solar 550W',
    time: '2 giờ trước',
    user: 'Lê Văn C'
  },
  {
    id: '5',
    type: 'attendance',
    title: 'Check-in',
    description: '12/15 nhân viên đã check-in hôm nay',
    time: '3 giờ trước',
    user: 'Hệ thống'
  }
];

const upcomingTasks: UpcomingTask[] = [
  {
    id: '1',
    title: 'Gọi điện khách hàng Solar Farm Bình Dương',
    dueDate: 'Hôm nay',
    priority: 'urgent',
    project: 'Solar Farm BD'
  },
  {
    id: '2',
    title: 'Hoàn thiện báo giá hệ thống 100kWp',
    dueDate: 'Ngày mai',
    priority: 'high',
    project: 'AEON Mall'
  },
  {
    id: '3',
    title: 'Review thiết kế hệ thống IoT',
    dueDate: '2 ngày nữa',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Họp với đối tác Huawei',
    dueDate: '3 ngày nữa',
    priority: 'high'
  }
];

const projectStats = [
  { name: 'Solar Rooftop', count: 18, capacity: '125 MW', color: 'bg-yellow-500' },
  { name: 'Solar Farm', count: 8, capacity: '450 MW', color: 'bg-orange-500' },
  { name: 'Wind Onshore', count: 5, capacity: '150 MW', color: 'bg-cyan-500' },
  { name: 'Wind Offshore', count: 2, capacity: '80 MW', color: 'bg-blue-500' }
];

// Helper functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) return `₫${(value / 1000000000).toFixed(1)} tỷ`;
  if (value >= 1000000) return `₫${(value / 1000000).toFixed(0)} triệu`;
  return `₫${value.toLocaleString('vi-VN')}`;
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'lead': return Icons.leads;
    case 'task': return Icons.tasks;
    case 'project': return Icons.projects;
    case 'inventory': return Icons.inventory;
    case 'attendance': return Icons.attendance;
    default: return Icons.bell;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case 'lead': return 'bg-blue-100 text-blue-600';
    case 'task': return 'bg-emerald-100 text-emerald-600';
    case 'project': return 'bg-purple-100 text-purple-600';
    case 'inventory': return 'bg-orange-100 text-orange-600';
    case 'attendance': return 'bg-cyan-100 text-cyan-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

// CRM Home Page - Main Dashboard
export default function CRMHomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Check auth first
    const token = localStorage.getItem("crm_auth");
    if (!token) {
      router.replace("/crm/login");
      return;
    }

    // Get time-based greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Chào buổi sáng');
    else if (hour < 18) setGreeting('Chào buổi chiều');
    else setGreeting('Chào buổi tối');

    // Verify token
    const verifyAuth = async () => {
      try {
        const response = await fetch('/api/crm/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUsername(data.user.username);
        } else {
          localStorage.removeItem('crm_auth');
          router.replace('/crm/login');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
      setIsLoading(false);
    };
    
    verifyAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-[#D4AF37] via-[#C4A030] to-[#B8960A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {greeting}, {username || 'Người dùng'}! 👋
              </h1>
              <p className="mt-1 text-yellow-100/90">
                Đây là tổng quan hoạt động CRM của GoldenEnergy hôm nay
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                {Icons.calendar}
                <span className="text-sm font-medium">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={metric.link}>
                <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                      <div className={metric.color}>{metric.icon}</div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${metric.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.change >= 0 ? Icons.trendUp : Icons.trendDown}
                      {Math.abs(metric.change)}%
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">{metric.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{metric.changeLabel}</p>
                  </div>
                  <div className="mt-3 flex items-center text-sm text-[#D4AF37] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Xem chi tiết {Icons.arrowRight}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {Icons.plus}
            Thao tác nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={action.label} href={action.href}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 p-4 hover:border-[#D4AF37]/50 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${action.bgColor}`} />
                  <div className={`inline-flex p-2 rounded-lg ${action.bgColor} text-white mb-3`}>
                    {action.icon}
                  </div>
                  <h3 className="font-medium text-gray-900">{action.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h2>
              <Link href="/crm/dashboard" className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1">
                Xem tất cả {Icons.arrowRight}
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks sắp đến hạn</h2>
              <Link href="/crm/tasks" className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1">
                Xem tất cả {Icons.arrowRight}
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-3 rounded-lg border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</h3>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'urgent' ? 'Gấp' : task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {Icons.clock}
                      {task.dueDate}
                    </span>
                    {task.project && (
                      <span className="text-[#D4AF37]">{task.project}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Project Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Thống kê dự án theo loại</h2>
            <Link href="/crm/projects" className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1">
              Xem dự án {Icons.arrowRight}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {projectStats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4"
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
                <div className="flex items-center gap-2 mb-2">
                  {stat.name.includes('Solar') ? Icons.sun : Icons.wind}
                  <span className="font-medium text-gray-700">{stat.name}</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
                    <p className="text-xs text-gray-500">dự án</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-700">{stat.capacity}</p>
                    <p className="text-xs text-gray-500">công suất</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Module Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-br from-[#D4AF37]/5 to-[#D4AF37]/10 rounded-xl border border-[#D4AF37]/20 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Truy cập nhanh các module</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { name: 'Dashboard', icon: Icons.dashboard, href: '/crm/dashboard' },
              { name: 'Tasks', icon: Icons.tasks, href: '/crm/tasks' },
              { name: 'Leads', icon: Icons.leads, href: '/crm/leads' },
              { name: 'Projects', icon: Icons.projects, href: '/crm/projects' },
              { name: 'Inventory', icon: Icons.inventory, href: '/crm/inventory' },
              { name: 'Analytics', icon: Icons.analytics, href: '/crm/analytics' },
              { name: 'Maps', icon: Icons.maps, href: '/crm/maps' },
              { name: 'Automations', icon: Icons.automations, href: '/crm/automations' },
            ].map((item) => (
              <Link key={item.name} href={item.href}>
                <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 hover:border-[#D4AF37] hover:shadow-md transition-all cursor-pointer group">
                  <div className="p-2 rounded-lg bg-gray-50 text-gray-600 group-hover:bg-[#D4AF37]/10 group-hover:text-[#D4AF37] transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 group-hover:text-[#D4AF37] transition-colors">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

'use client';

// CRM Dashboard with KPI Metrics
// Comprehensive business analytics for CRM

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface KPIData {
  revenue: {
    current: number;
    previous: number;
    target: number;
    currency: string;
  };
  leads: {
    total: number;
    new: number;
    converted: number;
    conversionRate: number;
  };
  projects: {
    active: number;
    completed: number;
    onHold: number;
    overdue: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  team: {
    totalMembers: number;
    activeToday: number;
    avgTasksPerMember: number;
  };
}

interface RevenueData {
  month: string;
  revenue: number;
  target: number;
}

interface LeadSource {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  tasksCompleted: number;
  tasksTotal: number;
  status: 'online' | 'away' | 'offline';
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'project' | 'task' | 'message';
  title: string;
  description: string;
  user: string;
  timestamp: Date;
}

// Mock data generator
const generateMockData = (): {
  kpi: KPIData;
  revenueData: RevenueData[];
  leadSources: LeadSource[];
  teamMembers: TeamMember[];
  recentActivities: RecentActivity[];
} => {
  const kpi: KPIData = {
    revenue: {
      current: 2450000000,
      previous: 2100000000,
      target: 3000000000,
      currency: 'VNĐ',
    },
    leads: {
      total: 245,
      new: 42,
      converted: 28,
      conversionRate: 11.4,
    },
    projects: {
      active: 12,
      completed: 45,
      onHold: 3,
      overdue: 2,
    },
    tasks: {
      total: 156,
      completed: 89,
      inProgress: 45,
      overdue: 22,
    },
    team: {
      totalMembers: 15,
      activeToday: 12,
      avgTasksPerMember: 10.4,
    },
  };

  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const revenueData: RevenueData[] = months.map((month, i) => ({
    month,
    revenue: 150000000 + Math.random() * 200000000,
    target: 250000000,
  }));

  const leadSources: LeadSource[] = [
    { source: 'Website', count: 89, percentage: 36, color: '#3B82F6' },
    { source: 'Google Ads', count: 65, percentage: 27, color: '#EF4444' },
    { source: 'Facebook', count: 42, percentage: 17, color: '#8B5CF6' },
    { source: 'Giới thiệu', count: 32, percentage: 13, color: '#10B981' },
    { source: 'Khác', count: 17, percentage: 7, color: '#6B7280' },
  ];

  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Nguyễn Văn A', role: 'Project Manager', tasksCompleted: 24, tasksTotal: 28, status: 'online' },
    { id: '2', name: 'Trần Thị B', role: 'Developer', tasksCompleted: 18, tasksTotal: 22, status: 'online' },
    { id: '3', name: 'Lê Văn C', role: 'Designer', tasksCompleted: 15, tasksTotal: 20, status: 'away' },
    { id: '4', name: 'Phạm Thị D', role: 'Sales', tasksCompleted: 32, tasksTotal: 35, status: 'online' },
    { id: '5', name: 'Hoàng Văn E', role: 'Support', tasksCompleted: 45, tasksTotal: 50, status: 'offline' },
  ];

  const recentActivities: RecentActivity[] = [
    { id: '1', type: 'lead', title: 'Lead mới', description: 'Công ty ABC đã gửi form liên hệ', user: 'Hệ thống', timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: '2', type: 'project', title: 'Dự án cập nhật', description: 'Solar Farm Bình Định đã hoàn thành 75%', user: 'Nguyễn Văn A', timestamp: new Date(Date.now() - 15 * 60 * 1000) },
    { id: '3', type: 'task', title: 'Task hoàn thành', description: 'Thiết kế wireframe hoàn thành', user: 'Lê Văn C', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    { id: '4', type: 'message', title: 'Tin nhắn mới', description: 'Cuộc trò chuyện với khách hàng XYZ', user: 'Phạm Thị D', timestamp: new Date(Date.now() - 45 * 60 * 1000) },
    { id: '5', type: 'lead', title: 'Lead chuyển đổi', description: 'Lead #123 đã trở thành khách hàng', user: 'Phạm Thị D', timestamp: new Date(Date.now() - 60 * 60 * 1000) },
  ];

  return { kpi, revenueData, leadSources, teamMembers, recentActivities };
};

export default function CRMDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReturnType<typeof generateMockData> | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'year'>('30d');

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setData(generateMockData());
      setIsLoading(false);
    }, 500);
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
      </div>
    );
  }

  const { kpi, revenueData, leadSources, teamMembers, recentActivities } = data!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/erp" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Dashboard KPI</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Date Range */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['7d', '30d', '90d', 'year'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      dateRange === range
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {range === '7d' ? '7 ngày' : range === '30d' ? '30 ngày' : range === '90d' ? '90 ngày' : 'Năm'}
                  </button>
                ))}
              </div>

              {/* Export button */}
              <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Xuất báo cáo
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard
            title="Doanh thu"
            value={formatCurrency(kpi.revenue.current)}
            change={((kpi.revenue.current - kpi.revenue.previous) / kpi.revenue.previous) * 100}
            icon="💰"
            color="green"
            subtext={`Mục tiêu: ${formatCurrency(kpi.revenue.target)}`}
            progress={(kpi.revenue.current / kpi.revenue.target) * 100}
          />
          <KPICard
            title="Leads mới"
            value={kpi.leads.new.toString()}
            change={12.5}
            icon="📈"
            color="blue"
            subtext={`Tổng: ${kpi.leads.total}`}
          />
          <KPICard
            title="Dự án hoạt động"
            value={kpi.projects.active.toString()}
            icon="📁"
            color="purple"
            subtext={`${kpi.projects.overdue} quá hạn`}
            isAlert={kpi.projects.overdue > 0}
          />
          <KPICard
            title="Tasks hoàn thành"
            value={`${kpi.tasks.completed}/${kpi.tasks.total}`}
            icon="✅"
            color="amber"
            progress={(kpi.tasks.completed / kpi.tasks.total) * 100}
          />
          <KPICard
            title="Team hoạt động"
            value={`${kpi.team.activeToday}/${kpi.team.totalMembers}`}
            icon="👥"
            color="sky"
            subtext={`TB: ${kpi.team.avgTasksPerMember} task/người`}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo tháng</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-sky-500 rounded" /> Thực tế
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-gray-300 rounded" /> Mục tiêu
                </span>
              </div>
            </div>
            <RevenueChart data={revenueData} />
          </div>

          {/* Lead Sources */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nguồn Lead</h3>
            <LeadSourcesChart data={leadSources} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phễu chuyển đổi</h3>
            <ConversionFunnel leads={kpi.leads} />
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất team</h3>
            <TeamPerformance members={teamMembers} />
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <RecentActivityList activities={recentActivities} />
          </div>
        </div>

        {/* Task Status Overview */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan Tasks</h3>
          <TaskStatusOverview tasks={kpi.tasks} />
        </div>
      </main>
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  change,
  icon,
  color,
  subtext,
  progress,
  isAlert = false,
}: {
  title: string;
  value: string;
  change?: number;
  icon: string;
  color: 'green' | 'blue' | 'purple' | 'amber' | 'sky';
  subtext?: string;
  progress?: number;
  isAlert?: boolean;
}) {
  const colorClasses = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600',
  };

  const progressColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl border p-4 ${isAlert ? 'border-red-200' : 'border-gray-200'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-2xl p-2 rounded-lg ${colorClasses[color]}`}>{icon}</span>
        {change !== undefined && (
          <span className={`text-sm font-medium flex items-center gap-0.5 ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>

      {progress !== undefined && (
        <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className={`h-full rounded-full ${progressColors[color]}`}
          />
        </div>
      )}

      {subtext && (
        <p className={`text-xs mt-2 ${isAlert ? 'text-red-500' : 'text-gray-400'}`}>
          {subtext}
        </p>
      )}
    </motion.div>
  );
}

// Revenue Chart Component
function RevenueChart({ data }: { data: RevenueData[] }) {
  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.target)));

  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((item, index) => (
        <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end justify-center gap-1 h-48">
            {/* Target bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.target / maxValue) * 100}%` }}
              transition={{ delay: index * 0.05 }}
              className="w-4 bg-gray-200 rounded-t"
            />
            {/* Revenue bar */}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxValue) * 100}%` }}
              transition={{ delay: index * 0.05 + 0.1 }}
              className={`w-4 rounded-t ${
                item.revenue >= item.target ? 'bg-green-500' : 'bg-sky-500'
              }`}
            />
          </div>
          <span className="text-xs text-gray-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}

// Lead Sources Chart
function LeadSourcesChart({ data }: { data: LeadSource[] }) {
  return (
    <div className="space-y-3">
      {data.map((source, index) => (
        <motion.div
          key={source.source}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{source.source}</span>
            <span className="text-sm text-gray-500">{source.count} ({source.percentage}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${source.percentage}%` }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: source.color }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Conversion Funnel
function ConversionFunnel({ leads }: { leads: KPIData['leads'] }) {
  const stages = [
    { name: 'Tổng Lead', value: leads.total, color: '#3B82F6' },
    { name: 'Đang tư vấn', value: Math.floor(leads.total * 0.6), color: '#8B5CF6' },
    { name: 'Quan tâm', value: Math.floor(leads.total * 0.35), color: '#EC4899' },
    { name: 'Chuyển đổi', value: leads.converted, color: '#10B981' },
  ];

  const maxValue = stages[0].value;

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const isLast = index === stages.length - 1;

        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: index * 0.15 }}
            className="relative"
          >
            <div
              className="h-10 rounded flex items-center justify-between px-3 text-white text-sm"
              style={{
                width: `${width}%`,
                backgroundColor: stage.color,
                marginLeft: `${(100 - width) / 2}%`,
              }}
            >
              <span>{stage.name}</span>
              <span className="font-bold">{stage.value}</span>
            </div>
            {!isLast && (
              <div className="text-xs text-gray-400 text-center mt-1">
                ↓ {((stages[index + 1].value / stage.value) * 100).toFixed(0)}%
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// Team Performance
function TeamPerformance({ members }: { members: TeamMember[] }) {
  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-400',
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {members.map(member => {
        const progress = (member.tasksCompleted / member.tasksTotal) * 100;

        return (
          <div key={member.id} className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                {member.name.charAt(0)}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[member.status]}`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <span className="text-xs text-gray-500">
                  {member.tasksCompleted}/{member.tasksTotal}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full ${
                    progress >= 80 ? 'bg-green-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Recent Activity List
function RecentActivityList({ activities }: { activities: RecentActivity[] }) {
  const typeIcons = {
    lead: '📋',
    project: '📁',
    task: '✅',
    message: '💬',
  };

  const typeColors = {
    lead: 'bg-blue-100 text-blue-600',
    project: 'bg-purple-100 text-purple-600',
    task: 'bg-green-100 text-green-600',
    message: 'bg-amber-100 text-amber-600',
  };

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {activities.map(activity => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-start gap-3"
        >
          <span className={`p-1.5 rounded-lg text-sm ${typeColors[activity.type]}`}>
            {typeIcons[activity.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{activity.title}</p>
            <p className="text-xs text-gray-500 truncate">{activity.description}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {activity.user} • {formatTimeAgo(activity.timestamp)}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Task Status Overview
function TaskStatusOverview({ tasks }: { tasks: KPIData['tasks'] }) {
  const statuses = [
    { label: 'Hoàn thành', value: tasks.completed, color: '#10B981', icon: '✅' },
    { label: 'Đang làm', value: tasks.inProgress, color: '#F59E0B', icon: '🔄' },
    { label: 'Chưa làm', value: tasks.total - tasks.completed - tasks.inProgress - tasks.overdue, color: '#3B82F6', icon: '📋' },
    { label: 'Quá hạn', value: tasks.overdue, color: '#EF4444', icon: '⚠️' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statuses.map(status => (
        <motion.div
          key={status.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: status.color + '20' }}
          >
            {status.icon}
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: status.color }}>
              {status.value}
            </p>
            <p className="text-sm text-gray-500">{status.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

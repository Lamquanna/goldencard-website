'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface StatCard {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  link?: string;
}

interface QuickStatsProps {
  stats?: StatCard[];
}

// Default icons
const Icons = {
  revenue: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  tasks: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  inventory: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  capacity: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  conversion: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
};

const defaultStats: StatCard[] = [
  {
    label: 'Doanh thu Q4',
    value: '₫12.5 tỷ',
    change: 15.7,
    changeLabel: 'vs Q3',
    icon: Icons.revenue,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    link: '/erp/analytics'
  },
  {
    label: 'Leads mới',
    value: 156,
    change: 23.4,
    changeLabel: 'tuần này',
    icon: Icons.leads,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    link: '/erp/leads'
  },
  {
    label: 'Dự án đang chạy',
    value: 12,
    change: -5.2,
    changeLabel: 'so với Q3',
    icon: Icons.projects,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    link: '/erp/projects'
  },
  {
    label: 'Tasks hoàn thành',
    value: '89%',
    change: 8.3,
    changeLabel: 'tháng này',
    icon: Icons.tasks,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    link: '/erp/tasks'
  },
  {
    label: 'Tổng công suất',
    value: '850 MW',
    change: 12.8,
    changeLabel: 'năm 2024',
    icon: Icons.capacity,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    link: '/erp/projects'
  },
  {
    label: 'Tỷ lệ chuyển đổi',
    value: '22.8%',
    change: 3.5,
    changeLabel: 'trung bình',
    icon: Icons.conversion,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    link: '/erp/analytics'
  },
  {
    label: 'Hàng tồn kho',
    value: '₫8.2 tỷ',
    change: -2.1,
    changeLabel: 'giá trị',
    icon: Icons.inventory,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    link: '/erp/inventory'
  },
  {
    label: 'Nhân viên',
    value: '15/15',
    change: 100,
    changeLabel: 'online hôm nay',
    icon: Icons.users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    link: '/erp/attendance'
  },
];

export default function QuickStats({ stats = defaultStats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {stat.link ? (
            <Link href={stat.link}>
              <StatCardContent stat={stat} />
            </Link>
          ) : (
            <StatCardContent stat={stat} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function StatCardContent({ stat }: { stat: StatCard }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-[#D4AF37]/30 transition-all cursor-pointer group h-full">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${stat.bgColor}`}>
          <div className={stat.color}>{stat.icon}</div>
        </div>
        {stat.change !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {stat.change >= 0 ? Icons.trendUp : Icons.trendDown}
            {Math.abs(stat.change)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs text-gray-500 truncate">{stat.label}</p>
        <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
        {stat.changeLabel && (
          <p className="text-xs text-gray-400 mt-0.5">{stat.changeLabel}</p>
        )}
      </div>
    </div>
  );
}

// Export a mini version for sidebar or compact areas
export function QuickStatsMini({ stats = defaultStats.slice(0, 4) }: QuickStatsProps) {
  return (
    <div className="space-y-2">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {stat.link ? (
            <Link href={stat.link}>
              <MiniStatCard stat={stat} />
            </Link>
          ) : (
            <MiniStatCard stat={stat} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

function MiniStatCard({ stat }: { stat: StatCard }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all cursor-pointer">
      <div className={`p-2 rounded-lg ${stat.bgColor} shrink-0`}>
        <div className={`${stat.color} w-5 h-5`}>{stat.icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{stat.label}</p>
        <p className="text-sm font-semibold text-gray-900">{stat.value}</p>
      </div>
      {stat.change !== undefined && (
        <div className={`flex items-center gap-0.5 text-xs font-medium shrink-0 ${stat.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {stat.change >= 0 ? Icons.trendUp : Icons.trendDown}
          {Math.abs(stat.change)}%
        </div>
      )}
    </div>
  );
}

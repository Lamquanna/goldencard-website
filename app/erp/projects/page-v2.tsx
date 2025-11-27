'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Briefcase, Search, Plus, Filter, MoreHorizontal, Eye, Edit2, Trash2,
  Calendar, Clock, Users, DollarSign, MapPin, Target, AlertTriangle,
  CheckCircle, XCircle, PlayCircle, PauseCircle, ChevronRight, Zap,
  TrendingUp, TrendingDown, Award, BarChart3, PieChart, Activity,
  List, Kanban, GanttChartSquare, Flag, Milestone, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================
interface ProjectMilestone {
  id: string;
  name: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
}

interface ProjectRisk {
  id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'mitigated' | 'closed';
}

interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: 'solar_farm' | 'solar_rooftop' | 'solar_home' | 'wind' | 'hybrid' | 'ess';
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  client: {
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
  };
  location: {
    address: string;
    province: string;
    country: string;
  };
  capacityKw: number;
  budget: number;
  spentAmount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  teamLead?: { id: string; name: string };
  teamSize: number;
  milestones: ProjectMilestone[];
  risks: ProjectRisk[];
  tasksTotal: number;
  tasksCompleted: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    code: 'GE-2024-001',
    name: 'Solar Farm Bình Thuận 50MW',
    description: 'Dự án điện mặt trời công suất 50MW tại Bình Thuận',
    category: 'solar_farm',
    status: 'in_progress',
    priority: 'high',
    client: { name: 'Tập đoàn EVN', contact: 'Ông Nguyễn Văn A', phone: '0912345678' },
    location: { address: 'Xã Sông Bình, Huyện Bắc Bình', province: 'Bình Thuận', country: 'Vietnam' },
    capacityKw: 50000,
    budget: 1200000000000,
    spentAmount: 450000000000,
    currency: 'VND',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-12-31'),
    progress: 38,
    teamLead: { id: 'user-1', name: 'Trần Minh Quân' },
    teamSize: 25,
    milestones: [
      { id: 'm1', name: 'Khảo sát địa hình', dueDate: new Date('2024-02-15'), status: 'completed', progress: 100 },
      { id: 'm2', name: 'Thiết kế kỹ thuật', dueDate: new Date('2024-04-30'), status: 'completed', progress: 100 },
      { id: 'm3', name: 'Thi công hạ tầng', dueDate: new Date('2024-07-31'), status: 'in_progress', progress: 65 },
      { id: 'm4', name: 'Lắp đặt panels', dueDate: new Date('2024-10-31'), status: 'pending', progress: 0 },
    ],
    risks: [
      { id: 'r1', title: 'Thiếu nguồn cung panels', severity: 'high', status: 'open' },
      { id: 'r2', title: 'Thời tiết mưa bão', severity: 'medium', status: 'mitigated' },
    ],
    tasksTotal: 45,
    tasksCompleted: 17,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: 'proj-002',
    code: 'GE-2024-002',
    name: 'Solar Rooftop AEON Mall',
    description: 'Hệ thống điện mặt trời áp mái cho AEON Mall Tân Phú',
    category: 'solar_rooftop',
    status: 'in_progress',
    priority: 'medium',
    client: { name: 'AEON Vietnam', contact: 'Ms. Tanaka' },
    location: { address: '30 Bờ Bao Tân Thắng', province: 'TP. HCM', country: 'Vietnam' },
    capacityKw: 2500,
    budget: 45000000000,
    spentAmount: 32000000000,
    currency: 'VND',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-08-31'),
    progress: 71,
    teamLead: { id: 'user-2', name: 'Nguyễn Thị Hoa' },
    teamSize: 12,
    milestones: [
      { id: 'm5', name: 'Khảo sát mái', dueDate: new Date('2024-03-15'), status: 'completed', progress: 100 },
      { id: 'm6', name: 'Lắp đặt khung', dueDate: new Date('2024-06-30'), status: 'completed', progress: 100 },
      { id: 'm7', name: 'Lắp đặt panels', dueDate: new Date('2024-07-31'), status: 'in_progress', progress: 45 },
    ],
    risks: [
      { id: 'r3', title: 'Trễ cung cấp inverter', severity: 'medium', status: 'open' },
    ],
    tasksTotal: 28,
    tasksCompleted: 20,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-06-14'),
  },
  {
    id: 'proj-003',
    code: 'GE-2024-003',
    name: 'Nhà máy Điện gió Trà Vinh',
    description: 'Dự án điện gió công suất 100MW tại Trà Vinh',
    category: 'wind',
    status: 'planning',
    priority: 'critical',
    client: { name: 'Vietnam Electricity Corp', contact: 'Mr. Trần' },
    location: { address: 'Xã Trường Long Hòa', province: 'Trà Vinh', country: 'Vietnam' },
    capacityKw: 100000,
    budget: 3500000000000,
    spentAmount: 150000000000,
    currency: 'VND',
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-12-31'),
    progress: 5,
    teamLead: { id: 'user-3', name: 'Lê Văn Đức' },
    teamSize: 8,
    milestones: [
      { id: 'm8', name: 'Nghiên cứu tiền khả thi', dueDate: new Date('2024-06-30'), status: 'in_progress', progress: 80 },
    ],
    risks: [],
    tasksTotal: 15,
    tasksCompleted: 3,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: 'proj-004',
    code: 'GE-2024-004',
    name: 'ESS Nhà máy Samsung HCMC',
    description: 'Hệ thống lưu trữ năng lượng cho Samsung',
    category: 'ess',
    status: 'completed',
    priority: 'high',
    client: { name: 'Samsung Electronics Vietnam', contact: 'Mr. Kim' },
    location: { address: 'KCN Thủ Đức', province: 'TP. HCM', country: 'Vietnam' },
    capacityKw: 5000,
    budget: 85000000000,
    spentAmount: 82000000000,
    currency: 'VND',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-05-31'),
    progress: 100,
    teamLead: { id: 'user-4', name: 'Phạm Văn Hùng' },
    teamSize: 15,
    milestones: [],
    risks: [],
    tasksTotal: 32,
    tasksCompleted: 32,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-06-01'),
  },
];

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value: number) => {
  if (value >= 1000000000000) return (value / 1000000000000).toFixed(1) + ' nghìn tỷ';
  if (value >= 1000000000) return (value / 1000000000).toFixed(0) + ' tỷ';
  if (value >= 1000000) return (value / 1000000).toFixed(0) + ' triệu';
  return value.toLocaleString('vi-VN');
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'planning':
      return { label: 'Lên kế hoạch', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Calendar };
    case 'in_progress':
      return { label: 'Đang thực hiện', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: PlayCircle };
    case 'on_hold':
      return { label: 'Tạm dừng', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: PauseCircle };
    case 'completed':
      return { label: 'Hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    case 'cancelled':
      return { label: 'Đã hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Activity };
  }
};

const getCategoryConfig = (category: string) => {
  switch (category) {
    case 'solar_farm':
      return { label: 'Solar Farm', color: 'text-amber-400', icon: '☀️' };
    case 'solar_rooftop':
      return { label: 'Solar Rooftop', color: 'text-orange-400', icon: '🏠' };
    case 'solar_home':
      return { label: 'Solar Home', color: 'text-yellow-400', icon: '🏡' };
    case 'wind':
      return { label: 'Điện gió', color: 'text-cyan-400', icon: '💨' };
    case 'hybrid':
      return { label: 'Hybrid', color: 'text-purple-400', icon: '⚡' };
    case 'ess':
      return { label: 'Lưu trữ năng lượng', color: 'text-green-400', icon: '🔋' };
    default:
      return { label: category, color: 'text-gray-400', icon: '📦' };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'critical':
      return { label: 'Cực kỳ quan trọng', color: 'text-red-400 bg-red-500/10' };
    case 'high':
      return { label: 'Cao', color: 'text-orange-400 bg-orange-500/10' };
    case 'medium':
      return { label: 'Trung bình', color: 'text-amber-400 bg-amber-500/10' };
    case 'low':
      return { label: 'Thấp', color: 'text-gray-400 bg-gray-500/10' };
    default:
      return { label: priority, color: 'text-gray-400 bg-gray-500/10' };
  }
};

// ============================================
// PROGRESS BAR
// ============================================
function ProgressBar({ progress, size = 'md' }: { progress: number; size?: 'sm' | 'md' | 'lg' }) {
  const getColor = (p: number) => {
    if (p >= 80) return 'bg-emerald-500';
    if (p >= 50) return 'bg-blue-500';
    if (p >= 25) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className={`w-full ${heights[size]} bg-white/10 rounded-full overflow-hidden`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`h-full ${getColor(progress)} rounded-full`}
      />
    </div>
  );
}

// ============================================
// PROJECT CARD
// ============================================
function ProjectCard({ project, onView }: { project: Project; onView: () => void }) {
  const statusConfig = getStatusConfig(project.status);
  const categoryConfig = getCategoryConfig(project.category);
  const priorityConfig = getPriorityConfig(project.priority);
  const StatusIcon = statusConfig.icon;

  const budgetUsed = (project.spentAmount / project.budget) * 100;
  const openRisks = project.risks.filter(r => r.status === 'open').length;
  const daysRemaining = Math.ceil((project.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onView}
      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 
                 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryConfig.icon}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
          </div>
          <h3 className="font-semibold text-white mt-2 group-hover:text-amber-400 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-white/50 mt-1 font-mono">{project.code}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </div>

      {/* Client & Location */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Users className="w-4 h-4" />
          <span>{project.client.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <MapPin className="w-4 h-4" />
          <span>{project.location.province}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/60">Tiến độ</span>
          <span className="text-white font-medium">{project.progress}%</span>
        </div>
        <ProgressBar progress={project.progress} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
        <div className="text-center">
          <p className="text-xs text-white/40">Tasks</p>
          <p className="text-sm font-medium text-white">
            {project.tasksCompleted}/{project.tasksTotal}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40">Budget</p>
          <p className="text-sm font-medium text-white">{budgetUsed.toFixed(0)}%</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-white/40">Còn lại</p>
          <p className={`text-sm font-medium ${daysRemaining < 30 ? 'text-amber-400' : 'text-white'}`}>
            {daysRemaining > 0 ? `${daysRemaining}d` : 'Quá hạn'}
          </p>
        </div>
      </div>

      {/* Risks Alert */}
      {openRisks > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
          <AlertTriangle className="w-4 h-4" />
          <span>{openRisks} rủi ro đang mở</span>
        </div>
      )}

      {/* Team Lead */}
      {project.teamLead && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                          flex items-center justify-center text-xs text-white font-medium">
              {project.teamLead.name.charAt(0)}
            </div>
            <span className="text-sm text-white/60">{project.teamLead.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <Users className="w-3.5 h-3.5" />
            <span>{project.teamSize}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// GANTT CHART MINI
// ============================================
function GanttChartMini({ projects }: { projects: Project[] }) {
  const today = new Date();
  const startMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endMonth = new Date(today.getFullYear(), today.getMonth() + 6, 0);
  const totalDays = Math.ceil((endMonth.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24));

  const months = [];
  for (let i = -1; i <= 6; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push(d.toLocaleDateString('vi-VN', { month: 'short' }));
  }

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <GanttChartSquare className="w-5 h-5 text-purple-400" />
        Timeline dự án
      </h3>

      {/* Month Headers */}
      <div className="grid grid-cols-8 gap-1 mb-2">
        <div className="col-span-1"></div>
        {months.map((month, i) => (
          <div key={i} className="text-xs text-center text-white/40">{month}</div>
        ))}
      </div>

      {/* Project Bars */}
      <div className="space-y-2">
        {projects.slice(0, 5).map((project) => {
          const startOffset = Math.max(0, 
            ((project.startDate.getTime() - startMonth.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
          );
          const duration = Math.min(100 - startOffset,
            ((project.endDate.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100
          );
          const statusConfig = getStatusConfig(project.status);

          return (
            <div key={project.id} className="grid grid-cols-8 gap-1 items-center">
              <div className="col-span-1 truncate text-xs text-white/60">{project.code}</div>
              <div className="col-span-7 relative h-6 bg-white/5 rounded">
                <div
                  className={`absolute h-full rounded ${
                    project.status === 'completed' ? 'bg-emerald-500/60' :
                    project.status === 'in_progress' ? 'bg-blue-500/60' :
                    project.status === 'planning' ? 'bg-gray-500/60' : 'bg-amber-500/60'
                  }`}
                  style={{ left: `${startOffset}%`, width: `${duration}%` }}
                >
                  <div 
                    className="h-full bg-current opacity-50 rounded"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectsPage() {
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'gantt'>('grid');

  // Stats
  const stats = useMemo(() => ({
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalCapacity: projects.reduce((sum, p) => sum + p.capacityKw, 0),
    avgProgress: Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length),
  }), [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.client.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(p => p.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [projects, search, selectedStatus, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-purple-400" />
              Quản lý Dự án
            </h1>
            <p className="text-white/60 mt-1">
              {stats.total} dự án · Tổng công suất: {(stats.totalCapacity / 1000).toFixed(0)} MW
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Kanban className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'gantt' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <GanttChartSquare className="w-4 h-4" />
              </button>
            </div>

            <Link href="/erp/projects/new"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                           bg-gradient-to-r from-purple-500 to-pink-500
                           text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span>Tạo dự án</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng dự án</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Đang thực hiện</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400/80 text-sm">Tổng công suất</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{(stats.totalCapacity / 1000).toFixed(0)} MW</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-purple-400/80 text-sm">Tổng budget</p>
            <p className="text-xl font-bold text-purple-400 mt-1">{formatCurrency(stats.totalBudget)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-cyan-400/80 text-sm">Tiến độ TB</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.avgProgress}%</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, mã dự án, khách hàng..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors cursor-pointer min-w-[160px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="planning">Lên kế hoạch</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="on_hold">Tạm dừng</option>
            <option value="completed">Hoàn thành</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors cursor-pointer min-w-[160px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả loại</option>
            <option value="solar_farm">Solar Farm</option>
            <option value="solar_rooftop">Solar Rooftop</option>
            <option value="wind">Điện gió</option>
            <option value="ess">Lưu trữ năng lượng</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* Content */}
        {viewMode === 'gantt' ? (
          <GanttChartMini projects={filteredProjects} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => console.log('View', project)}
              />
            ))}
          </div>
        ) : (
          /* List View - Table */
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Dự án</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Khách hàng</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Công suất</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Budget</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Tiến độ</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map((project) => {
                  const statusConfig = getStatusConfig(project.status);
                  const categoryConfig = getCategoryConfig(project.category);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{categoryConfig.icon}</span>
                          <div>
                            <p className="font-medium text-white">{project.name}</p>
                            <p className="text-sm text-white/50 font-mono">{project.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-white/70">{project.client.name}</td>
                      <td className="px-4 py-4 text-white/70">
                        {project.capacityKw >= 1000 
                          ? `${(project.capacityKw / 1000).toFixed(0)} MW` 
                          : `${project.capacityKw} kW`}
                      </td>
                      <td className="px-4 py-4 text-white/70">{formatCurrency(project.budget)}</td>
                      <td className="px-4 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-white/60">{project.progress}%</span>
                          </div>
                          <ProgressBar progress={project.progress} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                          <Eye className="w-4 h-4 text-white/60" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="py-20 text-center rounded-2xl bg-white/5 border border-white/10">
            <Briefcase className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60">Không tìm thấy dự án</h3>
            <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}

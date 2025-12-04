'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Plus, Search, Filter, LayoutGrid, List, Calendar, ChevronDown, Eye, Edit2, Trash2, Users, MapPin, Clock, DollarSign, AlertTriangle, MoreHorizontal } from 'lucide-react';
import { 
  Project, 
  ProjectCategory, 
  ProjectStatus, 
  PROJECT_CATEGORIES, 
} from '@/lib/types/project-management';
import { useAuthStore } from '@/lib/stores/auth-store';
import Link from 'next/link';

// ============================================
// MOCK DATA
// ============================================

const mockProjects: Project[] = [
  {
    id: 'proj-001',
    project_code: 'GE-2024-001',
    name: 'Solar Farm Bình Thuận 50MW',
    description: 'Dự án điện mặt trời công suất 50MW tại Bình Thuận',
    category: 'solar_farm',
    status: 'in_progress',
    priority: 'high',
    client_name: 'Tập đoàn EVN',
    client_contact: 'Ông Nguyễn Văn A',
    client_phone: '0912345678',
    client_email: 'evn@example.com',
    location_address: 'Xã Sông Bình, Huyện Bắc Bình',
    location_province: 'Bình Thuận',
    location_country: 'Vietnam',
    location_lat: 11.4285,
    location_lng: 108.2394,
    capacity_kw: 50000,
    budget: 1200000000000,
    currency: 'VND',
    spent_amount: 450000000000,
    start_date: '2024-01-15',
    expected_end_date: '2024-12-31',
    progress_percent: 38,
    team_lead_id: 'user-001',
    team_lead_name: 'Trần Minh Quân',
    created_by: 'admin',
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    milestones_count: 7,
    milestones_completed: 2,
    tasks_count: 45,
    tasks_completed: 17,
    risks_count: 3,
    open_risks_count: 2,
  },
  {
    id: 'proj-002',
    project_code: 'GE-2024-002',
    name: 'Solar Rooftop AEON Mall',
    description: 'Hệ thống điện mặt trời áp mái cho AEON Mall Tân Phú',
    category: 'solar_rooftop',
    status: 'in_progress',
    priority: 'medium',
    client_name: 'AEON Vietnam',
    client_contact: 'Ms. Tanaka',
    client_phone: '0287654321',
    client_email: 'aeon@example.com',
    location_address: '30 Bờ Bao Tân Thắng',
    location_province: 'TP. Hồ Chí Minh',
    location_country: 'Vietnam',
    location_lat: 10.8001,
    location_lng: 106.6297,
    capacity_kw: 2500,
    budget: 45000000000,
    currency: 'VND',
    spent_amount: 32000000000,
    start_date: '2024-03-01',
    expected_end_date: '2024-08-31',
    progress_percent: 71,
    team_lead_id: 'user-002',
    team_lead_name: 'Lê Thị Hương',
    created_by: 'admin',
    created_at: '2024-02-20T00:00:00Z',
    updated_at: '2024-06-14T00:00:00Z',
    milestones_count: 5,
    milestones_completed: 3,
    tasks_count: 28,
    tasks_completed: 20,
    risks_count: 1,
    open_risks_count: 0,
  },
  {
    id: 'proj-003',
    project_code: 'GE-2024-003',
    name: 'Wind Farm Ninh Thuận 30MW',
    description: 'Dự án điện gió onshore tại Ninh Thuận',
    category: 'wind_onshore',
    status: 'planning',
    priority: 'high',
    client_name: 'GoldenEnergy Group',
    location_address: 'Xã Phước Hữu, Huyện Ninh Phước',
    location_province: 'Ninh Thuận',
    location_country: 'Vietnam',
    location_lat: 11.5642,
    location_lng: 108.9877,
    capacity_kw: 30000,
    budget: 950000000000,
    currency: 'VND',
    spent_amount: 0,
    start_date: '2024-09-01',
    expected_end_date: '2025-12-31',
    progress_percent: 5,
    team_lead_id: 'user-003',
    team_lead_name: 'Phạm Văn Đức',
    created_by: 'admin',
    created_at: '2024-05-01T00:00:00Z',
    updated_at: '2024-06-10T00:00:00Z',
    milestones_count: 7,
    milestones_completed: 0,
    tasks_count: 12,
    tasks_completed: 2,
    risks_count: 5,
    open_risks_count: 5,
  },
  {
    id: 'proj-004',
    project_code: 'GE-2023-015',
    name: 'O&M Nhà máy Long An',
    description: 'Vận hành và bảo trì nhà máy điện mặt trời Long An',
    category: 'om',
    status: 'in_progress',
    priority: 'medium',
    client_name: 'Long An Solar JSC',
    location_province: 'Long An',
    location_country: 'Vietnam',
    capacity_kw: 100000,
    budget: 5000000000,
    currency: 'VND',
    spent_amount: 3200000000,
    start_date: '2023-06-01',
    expected_end_date: '2026-05-31',
    progress_percent: 64,
    team_lead_id: 'user-004',
    team_lead_name: 'Nguyễn Thành Long',
    created_by: 'admin',
    created_at: '2023-05-15T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
    milestones_count: 12,
    milestones_completed: 8,
    tasks_count: 156,
    tasks_completed: 100,
    risks_count: 2,
    open_risks_count: 1,
  },
  {
    id: 'proj-005',
    project_code: 'GE-2024-004',
    name: 'IoT Monitoring System',
    description: 'Hệ thống giám sát IoT cho các nhà máy điện mặt trời',
    category: 'iot',
    status: 'completed',
    priority: 'low',
    client_name: 'Internal Project',
    location_province: 'TP. Hồ Chí Minh',
    location_country: 'Vietnam',
    budget: 2500000000,
    currency: 'VND',
    spent_amount: 2350000000,
    start_date: '2024-02-01',
    expected_end_date: '2024-05-31',
    actual_end_date: '2024-05-25',
    progress_percent: 100,
    team_lead_id: 'user-005',
    team_lead_name: 'Võ Minh Tuấn',
    created_by: 'admin',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-05-25T00:00:00Z',
    milestones_count: 4,
    milestones_completed: 4,
    tasks_count: 32,
    tasks_completed: 32,
    risks_count: 0,
    open_risks_count: 0,
  },
];

// ============================================
// PLAN LOG TYPES & DEFAULT DATA
// ============================================

type PlanLogStatus = 'planned' | 'in_progress' | 'completed';

interface PlanLogEntry {
  id: string;
  projectId: string;
  title: string;
  note?: string;
  owner: string;
  plannedDate: string; // YYYY-MM-DD
  status: PlanLogStatus;
  progress: number;
  lastUpdated: string;
}

type PlanLogInput = Omit<PlanLogEntry, 'id' | 'lastUpdated'>;

const planLogStatusConfig: Record<PlanLogStatus, { label: string; color: string; bg: string }> = {
  planned: { label: 'Đã lập kế hoạch', color: 'text-gray-700', bg: 'bg-gray-100' },
  in_progress: { label: 'Đang triển khai', color: 'text-blue-700', bg: 'bg-blue-100' },
  completed: { label: 'Hoàn tất', color: 'text-green-700', bg: 'bg-green-100' },
};

const defaultPlanLogs: PlanLogEntry[] = [
  {
    id: 'plan-001',
    projectId: 'proj-001',
    owner: 'Trần Minh Quân',
    title: 'Tuần 25 - Hạ tầng',
    note: 'Hoàn tất san lấp khu B3, chuẩn bị đổ bê tông móng khung.',
    plannedDate: '2024-06-17',
    status: 'in_progress',
    progress: 45,
    lastUpdated: '2024-06-16T08:00:00Z',
  },
  {
    id: 'plan-002',
    projectId: 'proj-002',
    owner: 'Lê Thị Hương',
    title: 'Triển khai lắp inverter',
    note: 'Điều phối đội bảo trì trực ca đêm, kiểm tra tồn kho phụ kiện.',
    plannedDate: '2024-06-20',
    status: 'planned',
    progress: 30,
    lastUpdated: '2024-06-15T04:00:00Z',
  },
  {
    id: 'plan-003',
    projectId: 'proj-003',
    owner: 'Phạm Văn Đức',
    title: 'Hoàn thiện hồ sơ EPC',
    note: 'Gửi bộ hồ sơ cho ban pháp lý và chuẩn bị buổi review với EVN.',
    plannedDate: '2024-06-25',
    status: 'planned',
    progress: 10,
    lastUpdated: '2024-06-14T10:30:00Z',
  },
];

// ============================================
// COMPONENT
// ============================================

type ViewMode = 'grid' | 'list' | 'calendar';

const statusConfig: Record<ProjectStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Nháp', color: 'text-gray-600', bg: 'bg-gray-100' },
  planning: { label: 'Lên kế hoạch', color: 'text-blue-600', bg: 'bg-blue-100' },
  approved: { label: 'Đã duyệt', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  in_progress: { label: 'Đang thực hiện', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  on_hold: { label: 'Tạm dừng', color: 'text-orange-600', bg: 'bg-orange-100' },
  completed: { label: 'Hoàn thành', color: 'text-green-600', bg: 'bg-green-100' },
  cancelled: { label: 'Đã hủy', color: 'text-red-600', bg: 'bg-red-100' },
};

const priorityConfig = {
  low: { label: 'Thấp', color: 'text-gray-500', dot: 'bg-gray-400' },
  medium: { label: 'Trung bình', color: 'text-blue-500', dot: 'bg-blue-400' },
  high: { label: 'Cao', color: 'text-orange-500', dot: 'bg-orange-400' },
  urgent: { label: 'Khẩn cấp', color: 'text-red-500', dot: 'bg-red-500' },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<ProjectCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [planLogs, setPlanLogs] = useState<PlanLogEntry[]>([]);
  const [planLogsLoaded, setPlanLogsLoaded] = useState(false);
  
  const { user, hasPermission } = useAuthStore();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('erp_plan_logs');
      if (stored) {
        const parsed = JSON.parse(stored) as PlanLogEntry[];
        setPlanLogs(parsed);
      } else {
        localStorage.setItem('erp_plan_logs', JSON.stringify(defaultPlanLogs));
        setPlanLogs(defaultPlanLogs);
      }
    } catch (error) {
      console.error('Failed to load plan logs from storage', error);
      setPlanLogs(defaultPlanLogs);
    } finally {
      setPlanLogsLoaded(true);
    }
  }, []);

  const updatePlanLogs = useCallback((updater: PlanLogEntry[] | ((prev: PlanLogEntry[]) => PlanLogEntry[])) => {
    setPlanLogs((prev) => {
      const next = typeof updater === 'function' ? (updater as (prev: PlanLogEntry[]) => PlanLogEntry[])(prev) : updater;
      try {
        localStorage.setItem('erp_plan_logs', JSON.stringify(next));
      } catch (error) {
        console.error('Failed to persist plan logs', error);
      }
      return next;
    });
  }, []);

  const handleAddPlanLog = useCallback((input: PlanLogInput) => {
    updatePlanLogs((prev) => {
      const entry: PlanLogEntry = {
        id: `plan-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        ...input,
      };
      return [entry, ...prev].slice(0, 50);
    });
  }, [updatePlanLogs]);

  const handleDeletePlanLog = useCallback((id: string) => {
    updatePlanLogs((prev) => prev.filter((log) => log.id !== id));
  }, [updatePlanLogs]);
  
  const canCreate = hasPermission('projects', 'create');
  const canEdit = hasPermission('projects', 'edit');
  const canDelete = hasPermission('projects', 'delete');

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       project.project_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       project.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || project.category === categoryFilter;
    return matchSearch && matchStatus && matchCategory;
  });

  // Stats
  const stats = {
    total: projects.length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    total_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)} triệu`;
    }
    return amount.toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Dự án</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} dự án · {stats.in_progress} đang thực hiện
              </p>
            </div>
            {canCreate && (
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                <Plus size={20} />
                <span>Tạo dự án</span>
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="text-blue-600 text-sm font-medium">Tổng dự án</div>
              <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <div className="text-yellow-600 text-sm font-medium">Đang thực hiện</div>
              <div className="text-2xl font-bold text-yellow-700">{stats.in_progress}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-green-600 text-sm font-medium">Hoàn thành</div>
              <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-purple-600 text-sm font-medium">Tổng ngân sách</div>
              <div className="text-2xl font-bold text-purple-700">{formatCurrency(stats.total_budget)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <Filter size={18} />
                <span>Lọc</span>
                <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border p-4 z-20">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="all">Tất cả</option>
                        {Object.entries(statusConfig).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại dự án</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value as ProjectCategory | 'all')}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      >
                        <option value="all">Tất cả</option>
                        {Object.entries(PROJECT_CATEGORIES).map(([key, val]) => (
                          <option key={key} value={key}>{val.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode */}
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <LayoutGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 ${viewMode === 'calendar' ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                <Calendar size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Dự án</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Khách hàng</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tiến độ</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngân sách</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredProjects.map((project) => (
                  <ProjectRow 
                    key={project.id} 
                    project={project}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-center text-gray-500 py-12">
              📅 Timeline/Gantt view sẽ được triển khai...
            </p>
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900">Không tìm thấy dự án</h3>
            <p className="text-gray-500 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {planLogsLoaded && (
          <div className="mt-10">
            <PlanLogPanel
              projects={projects}
              logs={planLogs}
              onAddLog={handleAddPlanLog}
              onDeleteLog={handleDeletePlanLog}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ProjectCard({ project, canEdit, canDelete }: { project: Project; canEdit: boolean; canDelete: boolean }) {
  const status = statusConfig[project.status];
  const priority = project.priority ? priorityConfig[project.priority] : priorityConfig.medium;
  const category = PROJECT_CATEGORIES[project.category];
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(0)}M`;
    }
    return amount.toLocaleString('vi-VN');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow overflow-hidden group">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{category?.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                {status.label}
              </span>
            </div>
            <Link 
              href={`/erp/projects/${project.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-yellow-600 line-clamp-1"
            >
              {project.name}
            </Link>
            <p className="text-sm text-gray-500">{project.project_code}</p>
          </div>
          
          <div className="relative group/menu">
            <button className="p-1 rounded-lg hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal size={18} className="text-gray-400" />
            </button>
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border py-1 hidden group-hover/menu:block z-10">
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                <Eye size={14} /> Xem chi tiết
              </button>
              {canEdit && (
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              )}
              {canDelete && (
                <button className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                  <Trash2 size={14} /> Xóa
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Client */}
        {project.client_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users size={14} className="text-gray-400" />
            <span className="truncate">{project.client_name}</span>
          </div>
        )}

        {/* Location */}
        {project.location_province && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-gray-400" />
            <span className="truncate">{project.location_province}</span>
          </div>
        )}

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Tiến độ</span>
            <span className="font-medium">{project.progress_percent}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                project.progress_percent >= 100 ? 'bg-green-500' :
                project.progress_percent >= 70 ? 'bg-yellow-500' :
                project.progress_percent >= 30 ? 'bg-blue-500' :
                'bg-gray-300'
              }`}
              style={{ width: `${project.progress_percent}%` }}
            />
          </div>
        </div>

        {/* Budget */}
        {project.budget && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1">
              <DollarSign size={14} />
              Ngân sách
            </span>
            <span className="font-medium">{formatCurrency(project.budget)} VND</span>
          </div>
        )}

        {/* Capacity */}
        {project.capacity_kw && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Công suất</span>
            <span className="font-medium">
              {project.capacity_kw >= 1000 ? `${project.capacity_kw / 1000} MW` : `${project.capacity_kw} kW`}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} />
          <span>
            {project.expected_end_date ? new Date(project.expected_end_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {(project.open_risks_count ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
              <AlertTriangle size={12} />
              {project.open_risks_count}
            </span>
          )}
          <span className="text-xs text-gray-500">
            {project.tasks_completed ?? 0}/{project.tasks_count ?? 0} tasks
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectRow({ project, canEdit, canDelete }: { project: Project; canEdit: boolean; canDelete: boolean }) {
  const status = statusConfig[project.status];
  const category = PROJECT_CATEGORIES[project.category];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ`;
    }
    return `${(amount / 1000000).toFixed(0)}M`;
  };

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{category?.icon}</span>
          <div>
            <Link 
              href={`/erp/projects/${project.id}`}
              className="font-medium text-gray-900 hover:text-yellow-600"
            >
              {project.name}
            </Link>
            <p className="text-xs text-gray-500">{project.project_code}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {project.client_name || '-'}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                project.progress_percent >= 100 ? 'bg-green-500' :
                project.progress_percent >= 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${project.progress_percent}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{project.progress_percent}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {project.budget ? formatCurrency(project.budget) : '-'}
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
            <Eye size={16} />
          </button>
          {canEdit && (
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
              <Edit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function PlanLogPanel({
  projects,
  logs,
  onAddLog,
  onDeleteLog,
}: {
  projects: Project[];
  logs: PlanLogEntry[];
  onAddLog: (entry: PlanLogInput) => void;
  onDeleteLog: (id: string) => void;
}) {
  const projectOptions = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        label: `${project.project_code} · ${project.name}`,
        lead: project.team_lead_name,
      })),
    [projects]
  );

  const projectLookup = useMemo(() => {
    const map = new Map<string, { name?: string; code?: string }>();
    projects.forEach((project) => {
      map.set(project.id, { name: project.name, code: project.project_code });
    });
    return map;
  }, [projects]);

  const [form, setForm] = useState({
    projectId: projectOptions[0]?.id ?? '',
    owner: projectOptions[0]?.lead ?? '',
    title: '',
    note: '',
    plannedDate: new Date().toISOString().split('T')[0],
    status: 'planned' as PlanLogStatus,
    progress: 0,
  });

  useEffect(() => {
    if (!form.projectId && projectOptions.length) {
      setForm((prev) => ({
        ...prev,
        projectId: projectOptions[0].id,
        owner: projectOptions[0].lead ?? prev.owner,
      }));
    }
  }, [projectOptions, form.projectId]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const latestA = new Date(a.lastUpdated || a.plannedDate).getTime();
      const latestB = new Date(b.lastUpdated || b.plannedDate).getTime();
      return latestB - latestA;
    });
  }, [logs]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.projectId || !form.title.trim()) {
      return;
    }

    const selected = projectOptions.find((option) => option.id === form.projectId);
    const sanitizedProgress = Math.max(0, Math.min(100, Number(form.progress) || 0));

    onAddLog({
      projectId: form.projectId,
      owner: form.owner.trim() || selected?.lead || 'PM Office',
      title: form.title.trim(),
      note: form.note.trim(),
      plannedDate: form.plannedDate,
      status: form.status,
      progress: sanitizedProgress,
    });

    setForm((prev) => ({
      ...prev,
      title: '',
      note: '',
      progress: 0,
    }));
  };

  const handleProjectChange = (value: string) => {
    const selected = projectOptions.find((option) => option.id === value);
    setForm((prev) => ({
      ...prev,
      projectId: value,
      owner: selected?.lead ?? prev.owner,
    }));
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-2xl border border-yellow-100 p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <form onSubmit={handleSubmit} className="w-full lg:w-1/3 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Nhật ký kế hoạch</h3>
            <p className="text-sm text-gray-500">Ghi lại tiến độ giống Fastcons và lưu ngay trên trình duyệt.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Dự án</label>
              <select
                value={form.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {projectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Người phụ trách</label>
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm((prev) => ({ ...prev, owner: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Trưởng dự án"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ngày kế hoạch</label>
                <input
                  type="date"
                  value={form.plannedDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, plannedDate: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tiêu đề</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Ví dụ: Tuần 25 - Thi công móng"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={3}
                placeholder="Liệt kê công việc, vật tư, vấn đề cần theo dõi..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as PlanLogStatus }))}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="planned">Đã lập kế hoạch</option>
                  <option value="in_progress">Đang triển khai</option>
                  <option value="completed">Hoàn tất</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Tiến độ (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm((prev) => ({ ...prev, progress: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
          >
            <Plus size={18} />
            Lưu nhật ký
          </button>
        </form>

        <div className="flex-1 space-y-4 max-h-[540px] overflow-auto pr-1">
          {sortedLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-16 border border-dashed border-gray-200 rounded-2xl">
              <p className="font-medium">Chưa có nhật ký kế hoạch nào</p>
              <p className="text-sm mt-1">Bắt đầu ghi nhận để theo dõi thay đổi giống Fastcons.</p>
            </div>
          ) : (
            sortedLogs.map((log) => {
              const status = planLogStatusConfig[log.status];
              const projectInfo = projectLookup.get(log.projectId);
              const projectLabel = projectInfo
                ? `${projectInfo.code ?? ''} ${projectInfo.name ?? ''}`.trim()
                : 'Dự án chưa xác định';

              return (
                <div
                  key={log.id}
                  className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50 hover:bg-white transition-shadow flex flex-col gap-3 lg:flex-row lg:items-center"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{log.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {projectLabel} · {log.owner}
                    </p>
                    {log.note && (
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">{log.note}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(log.plannedDate)}</p>
                      <p className="text-sm font-semibold text-gray-900">{log.progress}%</p>
                      <div className="mt-1 h-2 w-28 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: `${Math.min(log.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteLog(log.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Xóa nhật ký"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

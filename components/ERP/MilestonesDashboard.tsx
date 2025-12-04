'use client';

import { useState, useMemo } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Image as ImageIcon, BarChart3, Table } from 'lucide-react';
import { motion } from 'framer-motion';

interface Milestone {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  completionImages?: string[];
  deliverables: string[];
  notes?: string;
}

const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'ms-001',
    projectId: 'proj-001',
    projectName: 'Solar Farm Bình Thuận 50MW',
    name: 'Hoàn thành thiết kế kỹ thuật',
    description: 'Thiết kế chi tiết hệ thống điện, cấu trúc giá đỡ, và hệ thống giám sát',
    targetDate: new Date('2024-03-31'),
    completedDate: new Date('2024-03-28'),
    status: 'completed',
    progress: 100,
    completionImages: ['/images/milestone-1.jpg'],
    deliverables: ['Bản vẽ kỹ thuật', 'Danh mục thiết bị', 'Phương án thi công'],
  },
  {
    id: 'ms-002',
    projectId: 'proj-001',
    projectName: 'Solar Farm Bình Thuận 50MW',
    name: 'Xây dựng móng và kết cấu',
    description: 'Thi công móng cho inverter và transformer, lắp đặt giá đỡ tấm pin',
    targetDate: new Date('2024-05-31'),
    completedDate: new Date('2024-06-05'),
    status: 'completed',
    progress: 100,
    completionImages: ['/images/milestone-2a.jpg', '/images/milestone-2b.jpg'],
    deliverables: ['Móng bê tông', 'Giá đỡ tấm pin', 'Hệ thống cáp ngầm'],
  },
  {
    id: 'ms-003',
    projectId: 'proj-001',
    projectName: 'Solar Farm Bình Thuận 50MW',
    name: 'Lắp đặt tấm pin và inverter',
    description: 'Lắp 120,000 tấm pin và 50 inverter 1MW',
    targetDate: new Date('2024-08-15'),
    status: 'in_progress',
    progress: 68,
    deliverables: ['Tấm pin solar', 'Inverter', 'Hệ thống DC cabling'],
  },
  {
    id: 'ms-004',
    projectId: 'proj-002',
    projectName: 'Solar Rooftop AEON Mall',
    name: 'Khảo sát và thiết kế',
    targetDate: new Date('2024-03-15'),
    completedDate: new Date('2024-03-10'),
    status: 'completed',
    progress: 100,
    deliverables: ['Báo cáo khảo sát', 'Thiết kế 3D'],
  },
  {
    id: 'ms-005',
    projectId: 'proj-002',
    projectName: 'Solar Rooftop AEON Mall',
    name: 'Lắp đặt hệ thống',
    targetDate: new Date('2024-07-31'),
    status: 'in_progress',
    progress: 85,
    completionImages: ['/images/aeon-progress.jpg'],
    deliverables: ['Tấm pin', 'Inverter', 'Monitoring system'],
  },
  {
    id: 'ms-006',
    projectId: 'proj-003',
    projectName: 'Wind Farm Ninh Thuận 30MW',
    name: 'Nghiên cứu địa chất',
    targetDate: new Date('2024-09-30'),
    status: 'pending',
    progress: 0,
    deliverables: ['Báo cáo địa chất', 'Phân tích gió'],
  },
  {
    id: 'ms-007',
    projectId: 'proj-001',
    projectName: 'Solar Farm Bình Thuận 50MW',
    name: 'Chạy thử nghiệm',
    targetDate: new Date('2024-09-30'),
    status: 'pending',
    progress: 0,
    deliverables: ['Báo cáo commissioning', 'Certificates'],
  },
];

export default function MilestonesDashboard() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    return MOCK_MILESTONES.filter(m => {
      const matchProject = selectedProject === 'all' || m.projectId === selectedProject;
      const matchStatus = selectedStatus === 'all' || m.status === selectedStatus;
      return matchProject && matchStatus;
    });
  }, [selectedProject, selectedStatus]);

  // Get unique projects
  const projects = useMemo(() => {
    const projectMap = new Map();
    MOCK_MILESTONES.forEach(m => {
      if (!projectMap.has(m.projectId)) {
        projectMap.set(m.projectId, m.projectName);
      }
    });
    return Array.from(projectMap.entries()).map(([id, name]) => ({ id, name }));
  }, []);

  // Stats
  const stats = {
    total: filteredMilestones.length,
    completed: filteredMilestones.filter(m => m.status === 'completed').length,
    inProgress: filteredMilestones.filter(m => m.status === 'in_progress').length,
    pending: filteredMilestones.filter(m => m.status === 'pending').length,
    delayed: filteredMilestones.filter(m => m.status === 'delayed').length,
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Hoàn thành', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle };
      case 'in_progress':
        return { label: 'Đang thực hiện', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: Clock };
      case 'pending':
        return { label: 'Chờ bắt đầu', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: Calendar };
      case 'delayed':
        return { label: 'Trễ hạn', color: 'bg-red-500/10 text-red-600 border-red-500/20', icon: AlertTriangle };
      default:
        return { label: status, color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: Calendar };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-7 h-7 text-purple-400" />
              Tổng quan Mốc tiến độ
            </h1>
            <p className="text-white/60 mt-1">
              {stats.total} mốc · {stats.completed} hoàn thành · {stats.inProgress} đang thực hiện
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'chart' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng mốc</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Đang thực hiện</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inProgress}</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-500/10 border border-gray-500/20">
            <p className="text-gray-400/80 text-sm">Chờ bắt đầu</p>
            <p className="text-2xl font-bold text-gray-400 mt-1">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400/80 text-sm">Trễ hạn</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.delayed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors cursor-pointer min-w-[200px]"
          >
            <option value="all">Tất cả dự án</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors cursor-pointer min-w-[180px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="pending">Chờ bắt đầu</option>
            <option value="delayed">Trễ hạn</option>
          </select>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Mốc tiến độ</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Dự án</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Tiến độ</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày mục tiêu</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Hoàn thành</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Hình ảnh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMilestones.map((milestone) => {
                    const statusConfig = getStatusConfig(milestone.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <motion.tr
                        key={milestone.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-white">{milestone.name}</p>
                            {milestone.description && (
                              <p className="text-sm text-white/50 mt-0.5">{milestone.description}</p>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-white/70">{milestone.projectName}</span>
                        </td>

                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-white/70 font-medium min-w-[3rem] text-right">
                              {milestone.progress}%
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm text-white/70">
                            {formatDate(milestone.targetDate)}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {milestone.completedDate ? (
                            <span className="text-sm text-emerald-400">
                              {formatDate(milestone.completedDate)}
                            </span>
                          ) : (
                            <span className="text-sm text-white/30">-</span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {milestone.completionImages && milestone.completionImages.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-4 h-4 text-blue-400" />
                              <span className="text-sm text-blue-400">
                                {milestone.completionImages.length} ảnh
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-white/30">Chưa có</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Chart View - Timeline */
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="space-y-6">
              {projects.map(project => {
                const projectMilestones = filteredMilestones.filter(m => m.projectId === project.id);
                if (projectMilestones.length === 0) return null;

                return (
                  <div key={project.id} className="space-y-3">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <div className="space-y-2">
                      {projectMilestones.map(milestone => {
                        const statusConfig = getStatusConfig(milestone.status);
                        return (
                          <div key={milestone.id} className="flex items-center gap-4">
                            <div className="w-48 text-sm text-white/70 flex-shrink-0">
                              {milestone.name}
                            </div>
                            <div className="flex-1 relative h-8">
                              <div className="absolute inset-0 bg-white/5 rounded-lg" />
                              <div
                                className={`absolute inset-y-0 left-0 rounded-lg ${
                                  milestone.status === 'completed' ? 'bg-emerald-500' :
                                  milestone.status === 'in_progress' ? 'bg-blue-500' :
                                  milestone.status === 'delayed' ? 'bg-red-500' :
                                  'bg-gray-500'
                                } opacity-80`}
                                style={{ width: `${milestone.progress}%` }}
                              />
                              <div className="absolute inset-0 flex items-center px-3">
                                <span className="text-xs text-white font-medium">
                                  {milestone.progress}%
                                </span>
                              </div>
                            </div>
                            <div className="w-32 text-sm text-white/60 flex-shrink-0 text-right">
                              {formatDate(milestone.targetDate)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

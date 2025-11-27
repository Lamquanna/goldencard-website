'use client';

// Projects List Page
// Display all projects with filters and create new project

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Project, ProjectStatus } from '@/lib/types/project';
import ProjectModal from '@/components/Projects/ProjectModal';

const STATUS_FILTERS: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'planning', label: 'Lên kế hoạch' },
  { value: 'on_hold', label: 'Tạm dừng' },
  { value: 'completed', label: 'Hoàn thành' },
];

const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'active': return '#10B981';
    case 'planning': return '#3B82F6';
    case 'on_hold': return '#F59E0B';
    case 'completed': return '#6B7280';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
  }
};

const getStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case 'active': return 'Đang hoạt động';
    case 'planning': return 'Lên kế hoạch';
    case 'on_hold': return 'Tạm dừng';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    default: return status;
  }
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter projects by search
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle create/update project
  const handleSaveProject = async (formData: any) => {
    try {
      const url = editingProject 
        ? `/api/projects/${editingProject.id}`
        : '/api/projects';
      
      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchProjects();
        setIsModalOpen(false);
        setEditingProject(null);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  };

  // Calculate project stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/crm" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Quản lý Dự án</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Create button */}
              <button
                onClick={() => {
                  setEditingProject(null);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Dự án mới
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng dự án"
            value={stats.total}
            icon="📁"
            color="sky"
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.active}
            icon="🚀"
            color="green"
          />
          <StatCard
            title="Hoàn thành"
            value={stats.completed}
            icon="✅"
            color="gray"
          />
          <StatCard
            title="Tổng ngân sách"
            value={formatCurrency(stats.totalBudget)}
            icon="💰"
            color="amber"
            isNumber={false}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm dự án..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Status filters */}
          <div className="flex gap-2">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-sky-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Project List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dự án</h3>
            <p className="text-gray-500 mb-4">Bắt đầu tạo dự án đầu tiên của bạn</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo dự án mới
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={() => {
                    setEditingProject(project);
                    setIsModalOpen(true);
                  }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dự án</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến độ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map(project => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onEdit={() => {
                      setEditingProject(project);
                      setIsModalOpen(true);
                    }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <ProjectModal
        project={editingProject}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
      />
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  isNumber = true 
}: { 
  title: string; 
  value: string | number; 
  icon: string; 
  color: 'sky' | 'green' | 'gray' | 'amber';
  isNumber?: boolean;
}) {
  const colorClasses = {
    sky: 'bg-sky-50 text-sky-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${isNumber ? 'text-gray-900' : 'text-lg'}`}>
            {value}
          </p>
        </div>
        <span className={`text-2xl p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

// Project Card Component
function ProjectCard({ 
  project, 
  onEdit, 
  onClick 
}: { 
  project: Project; 
  onEdit: () => void; 
  onClick: () => void;
}) {
  const progress = project.progress || 0;
  const daysLeft = project.end_date 
    ? Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:shadow-lg hover:border-sky-300 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
          {project.client_name && (
            <p className="text-sm text-gray-500">{project.client_name}</p>
          )}
        </div>
        <span
          className="px-2 py-1 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: getStatusColor(project.status) }}
        >
          {getStatusLabel(project.status)}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">Tiến độ</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          {daysLeft !== null && (
            <span className={`flex items-center gap-1 ${
              daysLeft < 0 ? 'text-red-500' : daysLeft < 7 ? 'text-amber-500' : 'text-gray-500'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {daysLeft < 0 ? 'Quá hạn' : `${daysLeft} ngày`}
            </span>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

// Project Row Component (List view)
function ProjectRow({ 
  project, 
  onEdit, 
  onClick 
}: { 
  project: Project; 
  onEdit: () => void; 
  onClick: () => void;
}) {
  const progress = project.progress || 0;

  return (
    <tr 
      onClick={onClick}
      className="hover:bg-gray-50 cursor-pointer"
    >
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-gray-900">{project.name}</p>
          {project.description && (
            <p className="text-sm text-gray-500 truncate max-w-xs">{project.description}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {project.client_name || '-'}
      </td>
      <td className="px-4 py-3">
        <span
          className="px-2 py-1 text-xs font-medium rounded-full text-white"
          style={{ backgroundColor: getStatusColor(project.status) }}
        >
          {getStatusLabel(project.status)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">{progress}%</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {project.end_date 
          ? new Date(project.end_date).toLocaleDateString('vi-VN')
          : '-'
        }
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={e => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </td>
    </tr>
  );
}

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

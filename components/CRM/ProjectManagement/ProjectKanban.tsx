'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Project, ProjectStatus } from '@/lib/types/project';

interface ProjectKanbanProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onStatusChange: (projectId: string, newStatus: ProjectStatus) => void;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; icon: string }> = {
  active: { label: 'Đang hoạt động', color: 'green', icon: '🟢' },
  planning: { label: 'Lên kế hoạch', color: 'blue', icon: '📋' },
  in_progress: { label: 'Đang thực hiện', color: 'yellow', icon: '⚙️' },
  on_hold: { label: 'Tạm dừng', color: 'orange', icon: '⏸️' },
  completed: { label: 'Hoàn thành', color: 'green', icon: '✅' },
  cancelled: { label: 'Hủy bỏ', color: 'red', icon: '❌' },
};

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const daysUntilDeadline = project.expected_completion 
    ? Math.ceil((new Date(project.expected_completion).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md border border-gray-200 cursor-pointer mb-3"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-gray-900 line-clamp-2">{project.name}</h4>
        <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[project.priority]}`}>
          {project.priority.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Tiến độ</span>
          <span className="font-semibold">{project.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              project.progress_percentage >= 100 ? 'bg-green-500' :
              project.progress_percentage >= 75 ? 'bg-blue-500' :
              project.progress_percentage >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
            }`}
            style={{ width: `${Math.min(project.progress_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {project.project_manager && (
            <div className="flex items-center gap-1">
              <span>👤</span>
              <span>{project.project_manager}</span>
            </div>
          )}
        </div>
        {daysUntilDeadline !== null && (
          <div className={`flex items-center gap-1 ${
            daysUntilDeadline < 0 ? 'text-red-600 font-semibold' :
            daysUntilDeadline < 7 ? 'text-orange-600' : ''
          }`}>
            <span>📅</span>
            <span>
              {daysUntilDeadline < 0 ? `Trễ ${Math.abs(daysUntilDeadline)} ngày` :
               daysUntilDeadline === 0 ? 'Hôm nay' :
               `${daysUntilDeadline} ngày`}
            </span>
          </div>
        )}
      </div>

      {/* Budget indicator */}
      {project.budget && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">Ngân sách:</span>
            <span className="font-semibold text-gray-900">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(project.budget)}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatusColumn({ 
  status, 
  projects, 
  onProjectClick 
}: { 
  status: ProjectStatus; 
  projects: Project[];
  onProjectClick: (project: Project) => void;
}) {
  const config = STATUS_CONFIG[status];
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="flex-shrink-0 w-80 bg-gray-50 rounded-xl p-4">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <h3 className="font-bold text-gray-900">{config.label}</h3>
          </div>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${config.color}-100 text-${config.color}-700`}>
            {projects.length}
          </span>
        </div>
        {totalBudget > 0 && (
          <div className="text-xs text-gray-600">
            Tổng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact' }).format(totalBudget)}
          </div>
        )}
      </div>

      {/* Projects */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Chưa có dự án
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onClick={() => onProjectClick(project)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function ProjectKanban({ projects, onProjectClick, onStatusChange }: ProjectKanbanProps) {
  const statuses: ProjectStatus[] = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
  
  const projectsByStatus = statuses.reduce((acc, status) => {
    acc[status] = projects.filter(p => p.status === status);
    return acc;
  }, {} as Record<ProjectStatus, Project[]>);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length > 0 
      ? Math.round(projects.reduce((sum, p) => sum + p.progress_percentage, 0) / projects.length)
      : 0,
  };

  return (
    <div className="w-full">
      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.total}</div>
          <div className="text-sm opacity-90">Tổng dự án</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.active}</div>
          <div className="text-sm opacity-90">Đang thực hiện</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.completed}</div>
          <div className="text-sm opacity-90">Hoàn thành</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="text-3xl font-bold">{stats.avgProgress}%</div>
          <div className="text-sm opacity-90">Tiến độ TB</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {statuses.map(status => (
          <StatusColumn
            key={status}
            status={status}
            projects={projectsByStatus[status]}
            onProjectClick={onProjectClick}
          />
        ))}
      </div>
    </div>
  );
}

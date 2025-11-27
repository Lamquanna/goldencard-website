'use client';

// Project Detail Page
// Shows Kanban, Gantt, and task management for a single project

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Project, ProjectTask, TaskStatus } from '@/lib/types/project';
import ProjectKanban from '@/components/Projects/ProjectKanban';
import GanttChart from '@/components/Projects/GanttChart';
import TaskDetailModal from '@/components/Projects/TaskDetailModal';

type ViewMode = 'kanban' | 'gantt' | 'list';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');

  // Fetch project and tasks
  useEffect(() => {
    fetchProject();
    fetchTasks();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    }
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`);
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle task move (Kanban drag & drop)
  const handleTaskMove = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => 
      prev.map(t => 
        t.id === taskId ? { ...t, status: newStatus } : t
      )
    );

    try {
      await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: [{ id: taskId, status: newStatus }],
        }),
      });
    } catch (error) {
      console.error('Failed to move task:', error);
      fetchTasks(); // Revert on error
    }
  }, [projectId]);

  // Handle task click
  const handleTaskClick = useCallback((task: ProjectTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  }, []);

  // Handle add task
  const handleAddTask = useCallback((status: TaskStatus) => {
    setNewTaskStatus(status);
    setIsCreatingTask(true);
  }, []);

  // Handle task update
  const handleTaskUpdate = useCallback(async (updates: Partial<ProjectTask>) => {
    if (!selectedTask) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: [{ id: selectedTask.id, ...updates }],
        }),
      });

      if (response.ok) {
        setTasks(prev =>
          prev.map(t =>
            t.id === selectedTask.id ? { ...t, ...updates } : t
          )
        );
        setSelectedTask(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, [projectId, selectedTask]);

  // Handle task delete
  const handleTaskDelete = useCallback(async () => {
    if (!selectedTask) return;

    try {
      await fetch(`/api/projects/${projectId}/tasks?taskId=${selectedTask.id}`, {
        method: 'DELETE',
      });
      
      setTasks(prev => prev.filter(t => t.id !== selectedTask.id));
      setIsTaskModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  }, [projectId, selectedTask]);

  // Calculate stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
    progress: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
      : 0,
  };

  // Calculate date range for Gantt
  const dateRange = React.useMemo(() => {
    const now = new Date();
    const start = project?.start_date 
      ? new Date(project.start_date) 
      : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = project?.end_date 
      ? new Date(project.end_date) 
      : new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    return { start, end };
  }, [project]);

  if (!project && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy dự án</h2>
          <button
            onClick={() => router.push('/projects')}
            className="text-sky-500 hover:text-sky-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/projects')}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {project?.name || 'Loading...'}
                </h1>
                {project?.client_name && (
                  <p className="text-sm text-gray-500">{project.client_name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress */}
              <div className="hidden md:flex items-center gap-2">
                <span className="text-sm text-gray-500">Tiến độ:</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full transition-all"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{stats.progress}%</span>
              </div>

              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['kanban', 'gantt', 'list'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                      viewMode === mode
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'kanban' ? 'Kanban' : mode === 'gantt' ? 'Gantt' : 'Danh sách'}
                  </button>
                ))}
              </div>

              {/* Add task button */}
              <button
                onClick={() => handleAddTask('todo')}
                className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Thêm task
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Cần làm: <strong>{stats.todo}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Đang làm: <strong>{stats.inProgress}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Xem xét: <strong>{stats.review}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Hoàn thành: <strong>{stats.done}</strong>
            </span>
            <span className="text-gray-400">|</span>
            <span>Tổng: <strong>{stats.total}</strong> task</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500" />
          </div>
        ) : (
          <>
            {viewMode === 'kanban' && (
              <ProjectKanban
                projectId={projectId}
                tasks={tasks}
                onTaskMove={handleTaskMove}
                onTaskClick={handleTaskClick}
                onAddTask={handleAddTask}
              />
            )}

            {viewMode === 'gantt' && (
              <div className="h-full p-4">
                <GanttChart
                  projectId={projectId}
                  tasks={tasks}
                  startDate={dateRange.start}
                  endDate={dateRange.end}
                  onTaskClick={handleTaskClick}
                />
              </div>
            )}

            {viewMode === 'list' && (
              <TaskListView
                tasks={tasks}
                onTaskClick={handleTaskClick}
              />
            )}
          </>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}

      {/* Create Task Modal */}
      {isCreatingTask && (
        <CreateTaskModal
          projectId={projectId}
          defaultStatus={newTaskStatus}
          onClose={() => setIsCreatingTask(false)}
          onCreated={task => {
            setTasks(prev => [...prev, task]);
            setIsCreatingTask(false);
          }}
        />
      )}
    </div>
  );
}

// Task List View Component
function TaskListView({ 
  tasks, 
  onTaskClick 
}: { 
  tasks: ProjectTask[]; 
  onTaskClick: (task: ProjectTask) => void;
}) {
  const getStatusBadge = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      todo: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      review: 'bg-purple-100 text-purple-700',
      done: 'bg-green-100 text-green-700',
    };
    const labels: Record<TaskStatus, string> = {
      todo: 'Cần làm',
      in_progress: 'Đang làm',
      review: 'Xem xét',
      done: 'Hoàn thành',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người thực hiện</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiến độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map(task => (
              <tr
                key={task.id}
                onClick={() => onTaskClick(task)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-900">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-500 truncate max-w-md">{task.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(task.status)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.assigned_to || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {task.due_date 
                    ? new Date(task.due_date).toLocaleDateString('vi-VN')
                    : '-'
                  }
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{task.progress || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Chưa có task nào
          </div>
        )}
      </div>
    </div>
  );
}

// Create Task Modal
function CreateTaskModal({
  projectId,
  defaultStatus,
  onClose,
  onCreated,
}: {
  projectId: string;
  defaultStatus: TaskStatus;
  onClose: () => void;
  onCreated: (task: ProjectTask) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status: defaultStatus,
          priority: 'medium',
          type: 'task',
        }),
      });

      const data = await response.json();
      if (data.success) {
        onCreated(data.data);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">Tạo task mới</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              placeholder="Nhập tiêu đề task..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              placeholder="Mô tả task..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isLoading}
              className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

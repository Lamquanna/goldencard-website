/**
 * Project Module - Quản lý dự án
 * Board view, Gantt view, Timeline, Milestones, Dependencies
 */

import type { ModuleManifest } from '../../types'

// =============================================================================
// MODULE MANIFEST
// =============================================================================

export const ProjectModuleManifest: ModuleManifest = {
  id: 'project',
  name: 'Project Management',
  nameVi: 'Quản lý dự án',
  version: '1.0.0',
  description: 'Project management, tasks and progress tracking',
  descriptionVi: 'Quản lý dự án, công việc và tiến độ',
  icon: 'FolderKanban',
  color: '#6366F1', // Indigo
  category: 'operations',
  basePath: '/home/projects',
  author: 'Golden Energy',
  routes: [
    { path: '/home/projects', name: 'Projects', nameVi: 'Dự án', icon: 'FolderKanban' },
    { path: '/home/projects/board', name: 'Board View', nameVi: 'Kanban Board', icon: 'Columns' },
    { path: '/home/projects/timeline', name: 'Timeline', nameVi: 'Timeline', icon: 'GitBranch' },
    { path: '/home/projects/gantt', name: 'Gantt Chart', nameVi: 'Gantt Chart', icon: 'GanttChart' },
    { path: '/home/projects/calendar', name: 'Calendar', nameVi: 'Lịch', icon: 'Calendar' },
  ],
  permissions: [
    { 
      id: 'project.view', 
      name: 'View Projects', 
      nameVi: 'Xem dự án',
      description: 'View all projects and tasks',
      resource: 'project',
      actions: ['read']
    },
    { 
      id: 'project.create', 
      name: 'Create Project', 
      nameVi: 'Tạo dự án mới',
      description: 'Create new projects',
      resource: 'project',
      actions: ['create']
    },
    { 
      id: 'project.edit', 
      name: 'Edit Project', 
      nameVi: 'Sửa dự án',
      description: 'Edit project details',
      resource: 'project',
      actions: ['update']
    },
    { 
      id: 'project.delete', 
      name: 'Delete Project', 
      nameVi: 'Xóa dự án',
      description: 'Delete projects',
      resource: 'project',
      actions: ['delete']
    },
    { 
      id: 'project.task.manage', 
      name: 'Manage Tasks', 
      nameVi: 'Quản lý công việc',
      description: 'Create, edit, assign tasks',
      resource: 'task',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'project.milestone.manage', 
      name: 'Manage Milestones', 
      nameVi: 'Quản lý mốc dự án',
      description: 'Create and manage project milestones',
      resource: 'milestone',
      actions: ['create', 'update', 'delete']
    },
  ],
  settings: [
    {
      key: 'default_view',
      type: 'select',
      label: 'Default View',
      labelVi: 'Hiển thị mặc định',
      defaultValue: 'board',
      options: [
        { value: 'board', label: 'Kanban Board' },
        { value: 'list', label: 'List View' },
        { value: 'gantt', label: 'Gantt Chart' },
        { value: 'calendar', label: 'Calendar' },
      ]
    },
    {
      key: 'auto_assign_tasks',
      type: 'boolean',
      label: 'Auto-assign tasks to creator',
      labelVi: 'Tự động giao việc cho người tạo',
      defaultValue: true,
    },
    {
      key: 'require_due_date',
      type: 'boolean',
      label: 'Require due date for tasks',
      labelVi: 'Bắt buộc ngày deadline',
      defaultValue: false,
    },
    {
      key: 'enable_time_tracking',
      type: 'boolean',
      label: 'Enable time tracking',
      labelVi: 'Bật theo dõi thời gian',
      defaultValue: true,
    },
  ],
  hooks: {
    onActivate: async () => { console.log('Project module activated') },
    onDeactivate: async () => { console.log('Project module deactivated') },
  },
  defaultRoles: ['project_manager', 'team_member', 'viewer'],
  dependencies: [],
}

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'
export type TaskType = 'feature' | 'bug' | 'improvement' | 'task' | 'epic' | 'story'

// =============================================================================
// INTERFACES
// =============================================================================

export interface Project {
  id: string
  name: string
  key: string // Short code like "PRJ"
  description?: string
  color: string
  icon?: string
  
  // Status & Dates
  status: ProjectStatus
  startDate?: Date
  endDate?: Date
  dueDate?: Date
  
  // Progress
  progress: number // 0-100
  totalTasks: number
  completedTasks: number
  
  // Team
  ownerId: string
  owner?: { id: string; name: string; avatar?: string }
  members: ProjectMember[]
  
  // Settings
  isPublic: boolean
  allowComments: boolean
  workspaceId: string
  
  createdAt: Date
  updatedAt: Date
}

export interface ProjectMember {
  userId: string
  user?: { id: string; name: string; avatar?: string; email: string }
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joinedAt: Date
}

export interface Task {
  id: string
  taskNumber: number // Auto-incrementing within project
  key: string // e.g., "PRJ-123"
  title: string
  description?: string
  
  projectId: string
  project?: Project
  
  // Status & Priority
  status: TaskStatus
  priority: TaskPriority
  type: TaskType
  
  // Assignment
  assigneeId?: string
  assignee?: { id: string; name: string; avatar?: string }
  reporterId: string
  reporter?: { id: string; name: string; avatar?: string }
  
  // Dates
  startDate?: Date
  dueDate?: Date
  completedAt?: Date
  
  // Time Tracking
  estimatedHours?: number
  loggedHours: number
  
  // Hierarchy
  parentId?: string
  parent?: Task
  subtasks?: Task[]
  
  // Dependencies
  blockedBy?: string[]
  blocks?: string[]
  
  // Organization
  labels: TaskLabel[]
  milestoneId?: string
  milestone?: Milestone
  sprintId?: string
  
  // Position for Kanban
  order: number
  
  // Attachments & Comments
  attachmentCount: number
  commentCount: number
  
  createdAt: Date
  updatedAt: Date
}

export interface TaskLabel {
  id: string
  name: string
  color: string
}

export interface Milestone {
  id: string
  projectId: string
  name: string
  description?: string
  startDate?: Date
  dueDate: Date
  status: 'active' | 'completed' | 'overdue'
  progress: number
  taskCount: number
  completedTaskCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Sprint {
  id: string
  projectId: string
  name: string
  goal?: string
  startDate: Date
  endDate: Date
  status: 'planning' | 'active' | 'completed'
  tasks?: Task[]
  createdAt: Date
  updatedAt: Date
}

export interface TimeEntry {
  id: string
  taskId: string
  task?: Task
  userId: string
  user?: { id: string; name: string; avatar?: string }
  description?: string
  hours: number
  date: Date
  billable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  user?: { id: string; name: string; avatar?: string }
  content: string
  mentions?: string[]
  attachments?: string[]
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// CONFIG
// =============================================================================

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; labelVi: string; color: string }> = {
  planning: { label: 'Planning', labelVi: 'Lên kế hoạch', color: 'bg-gray-500' },
  active: { label: 'Active', labelVi: 'Đang thực hiện', color: 'bg-green-500' },
  on_hold: { label: 'On Hold', labelVi: 'Tạm dừng', color: 'bg-yellow-500' },
  completed: { label: 'Completed', labelVi: 'Hoàn thành', color: 'bg-blue-500' },
  cancelled: { label: 'Cancelled', labelVi: 'Đã hủy', color: 'bg-red-500' },
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; labelVi: string; color: string; order: number }> = {
  backlog: { label: 'Backlog', labelVi: 'Backlog', color: 'bg-gray-400', order: 0 },
  todo: { label: 'To Do', labelVi: 'Cần làm', color: 'bg-gray-500', order: 1 },
  in_progress: { label: 'In Progress', labelVi: 'Đang làm', color: 'bg-blue-500', order: 2 },
  review: { label: 'Review', labelVi: 'Đang review', color: 'bg-purple-500', order: 3 },
  done: { label: 'Done', labelVi: 'Hoàn thành', color: 'bg-green-500', order: 4 },
  blocked: { label: 'Blocked', labelVi: 'Bị chặn', color: 'bg-red-500', order: 5 },
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; labelVi: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', labelVi: 'Khẩn cấp', color: 'text-red-600 bg-red-100', icon: '🔴' },
  high: { label: 'High', labelVi: 'Cao', color: 'text-orange-600 bg-orange-100', icon: '🟠' },
  medium: { label: 'Medium', labelVi: 'Trung bình', color: 'text-yellow-600 bg-yellow-100', icon: '🟡' },
  low: { label: 'Low', labelVi: 'Thấp', color: 'text-green-600 bg-green-100', icon: '🟢' },
}

export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; labelVi: string; color: string; icon: string }> = {
  epic: { label: 'Epic', labelVi: 'Epic', color: 'bg-purple-500', icon: '⚡' },
  story: { label: 'Story', labelVi: 'Story', color: 'bg-green-500', icon: '📖' },
  feature: { label: 'Feature', labelVi: 'Tính năng', color: 'bg-blue-500', icon: '✨' },
  task: { label: 'Task', labelVi: 'Công việc', color: 'bg-cyan-500', icon: '✅' },
  bug: { label: 'Bug', labelVi: 'Lỗi', color: 'bg-red-500', icon: '🐛' },
  improvement: { label: 'Improvement', labelVi: 'Cải tiến', color: 'bg-yellow-500', icon: '📈' },
}

// Default labels for new projects
export const DEFAULT_LABELS: TaskLabel[] = [
  { id: 'l1', name: 'Frontend', color: '#3B82F6' },
  { id: 'l2', name: 'Backend', color: '#10B981' },
  { id: 'l3', name: 'Design', color: '#8B5CF6' },
  { id: 'l4', name: 'Documentation', color: '#F59E0B' },
  { id: 'l5', name: 'Testing', color: '#EF4444' },
]

// Kanban column configuration
export const KANBAN_COLUMNS: { status: TaskStatus; title: string; titleVi: string }[] = [
  { status: 'backlog', title: 'Backlog', titleVi: 'Backlog' },
  { status: 'todo', title: 'To Do', titleVi: 'Cần làm' },
  { status: 'in_progress', title: 'In Progress', titleVi: 'Đang làm' },
  { status: 'review', title: 'Review', titleVi: 'Đang review' },
  { status: 'done', title: 'Done', titleVi: 'Hoàn thành' },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate task key from project key and task number
 */
export function generateTaskKey(projectKey: string, taskNumber: number): string {
  return `${projectKey}-${taskNumber}`
}

/**
 * Calculate project progress from tasks
 */
export function calculateProjectProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0
  return Math.round((completedTasks / totalTasks) * 100)
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === 'done') return false
  return new Date(task.dueDate) < new Date()
}

/**
 * Check if milestone is overdue
 */
export function isMilestoneOverdue(milestone: Milestone): boolean {
  if (milestone.status === 'completed') return false
  return new Date(milestone.dueDate) < new Date()
}

/**
 * Get tasks by status for Kanban board
 */
export function getTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const result: Record<TaskStatus, Task[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
    blocked: [],
  }

  tasks.forEach(task => {
    result[task.status].push(task)
  })

  // Sort by order within each column
  Object.keys(result).forEach(status => {
    result[status as TaskStatus].sort((a, b) => a.order - b.order)
  })

  return result
}

/**
 * Calculate time remaining until due date
 */
export function getTimeRemaining(dueDate: Date): string {
  const now = new Date()
  const due = new Date(dueDate)
  const diffMs = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return `Trễ ${Math.abs(diffDays)} ngày`
  } else if (diffDays === 0) {
    return 'Hôm nay'
  } else if (diffDays === 1) {
    return 'Ngày mai'
  } else if (diffDays <= 7) {
    return `${diffDays} ngày nữa`
  } else {
    return `${Math.ceil(diffDays / 7)} tuần nữa`
  }
}

/**
 * Get priority color class
 */
export function getPriorityColor(priority: TaskPriority): string {
  return TASK_PRIORITY_CONFIG[priority].color
}

/**
 * Get status color class
 */
export function getStatusColor(status: TaskStatus): string {
  return TASK_STATUS_CONFIG[status].color
}

/**
 * Sort tasks by priority (urgent first)
 */
export function sortByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Filter tasks by multiple criteria
 */
export function filterTasks(
  tasks: Task[],
  filters: {
    status?: TaskStatus[]
    priority?: TaskPriority[]
    assigneeId?: string
    labelIds?: string[]
    search?: string
  }
): Task[] {
  return tasks.filter(task => {
    // Status filter
    if (filters.status?.length && !filters.status.includes(task.status)) {
      return false
    }

    // Priority filter
    if (filters.priority?.length && !filters.priority.includes(task.priority)) {
      return false
    }

    // Assignee filter
    if (filters.assigneeId && task.assigneeId !== filters.assigneeId) {
      return false
    }

    // Label filter
    if (filters.labelIds?.length) {
      const taskLabelIds = task.labels.map(l => l.id)
      if (!filters.labelIds.some(id => taskLabelIds.includes(id))) {
        return false
      }
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(searchLower)
      const matchesKey = task.key.toLowerCase().includes(searchLower)
      const matchesDescription = task.description?.toLowerCase().includes(searchLower)
      if (!matchesTitle && !matchesKey && !matchesDescription) {
        return false
      }
    }

    return true
  })
}

export default ProjectModuleManifest

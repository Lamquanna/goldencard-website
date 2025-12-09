// ============================================================================
// PROJECT MANAGEMENT MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME Enterprise Platform
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type ProjectStatus = 
  | 'PLANNING' 
  | 'IN_PROGRESS' 
  | 'ON_HOLD' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type TaskStatus = 
  | 'BACKLOG' 
  | 'TODO' 
  | 'IN_PROGRESS' 
  | 'IN_REVIEW' 
  | 'DONE' 
  | 'CANCELLED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskType = 'TASK' | 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'EPIC' | 'STORY';

export type MilestoneStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';

// ============================================================================
// PROJECT TYPES
// ============================================================================

export interface ProjectMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  joinedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: ProjectStatus;
  
  // Dates
  startDate: Date;
  endDate?: Date;
  actualEndDate?: Date;
  
  // Team
  ownerId: string;
  owner?: Pick<ProjectMember, 'id' | 'name' | 'avatar' | 'email'>;
  managerId?: string;
  manager?: Pick<ProjectMember, 'id' | 'name' | 'avatar' | 'email'>;
  members: ProjectMember[];
  
  // Progress
  progress: number; // 0-100
  completedTasks: number;
  totalTasks: number;
  
  // Budget
  budget?: number;
  spent?: number;
  currency?: string;
  
  // Metadata
  tags?: string[];
  color?: string;
  thumbnail?: string;
  clientId?: string;
  clientName?: string;
  
  // Settings
  isPublic: boolean;
  allowComments: boolean;
  enableTimeTracking: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTimeLog {
  id: string;
  taskId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  description?: string;
  isBillable: boolean;
  createdAt: Date;
}

export interface TaskChecklist {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
}

export interface Task {
  id: string;
  projectId: string;
  project?: Pick<Project, 'id' | 'name' | 'code' | 'color'>;
  
  // Basic Info
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignments
  assigneeId?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  reporterId: string;
  reporter?: {
    id: string;
    name: string;
    avatar?: string;
  };
  watchers?: string[];
  
  // Dates
  startDate?: Date;
  dueDate?: Date;
  completedAt?: Date;
  
  // Progress & Time
  estimatedHours?: number;
  loggedHours?: number;
  progress?: number; // 0-100
  
  // Hierarchy
  parentTaskId?: string;
  subtasks?: Task[];
  
  // Milestones & Sprints
  milestoneId?: string;
  milestone?: Pick<Milestone, 'id' | 'name'>;
  sprintId?: string;
  sprint?: Pick<Sprint, 'id' | 'name'>;
  
  // Details
  tags?: string[];
  checklist?: TaskChecklist[];
  attachments?: string[];
  comments?: TaskComment[];
  timeLogs?: TaskTimeLog[];
  
  // Position (for Kanban)
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MILESTONE & SPRINT TYPES
// ============================================================================

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: MilestoneStatus;
  dueDate: Date;
  completedAt?: Date;
  
  // Progress
  totalTasks: number;
  completedTasks: number;
  progress: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: Date;
  endDate: Date;
  
  // Progress
  totalPoints: number;
  completedPoints: number;
  totalTasks: number;
  completedTasks: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CHAT TYPES
// ============================================================================

export interface ChatMessage {
  id: string;
  projectId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: MessageType;
  content: string;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  replyToId?: string;
  replyTo?: ChatMessage;
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  isEdited: boolean;
  editedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
}

// ============================================================================
// RESOURCE TYPES
// ============================================================================

export interface ResourceAllocation {
  id: string;
  projectId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    position?: string;
  };
  role: string;
  allocation: number; // percentage 0-100
  startDate: Date;
  endDate?: Date;
  hourlyRate?: number;
  isActive: boolean;
}

export interface ResourceCapacity {
  userId: string;
  name: string;
  avatar?: string;
  position?: string;
  totalCapacity: number; // hours per day/week
  allocatedCapacity: number;
  availableCapacity: number;
  allocations: {
    projectId: string;
    projectName: string;
    allocation: number;
  }[];
}

// ============================================================================
// GANTT CHART TYPES
// ============================================================================

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'project' | 'task' | 'milestone';
  dependencies?: string[];
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  color?: string;
  isCollapsed?: boolean;
  children?: GanttTask[];
}

// ============================================================================
// FILTER & FORM TYPES
// ============================================================================

export interface ProjectFilters {
  search?: string;
  status?: ProjectStatus;
  ownerId?: string;
  managerId?: string;
  memberId?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  tags?: string[];
}

export interface TaskFilters {
  search?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assigneeId?: string;
  reporterId?: string;
  milestoneId?: string;
  sprintId?: string;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  tags?: string[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  startDate?: Date;
  dueDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  parentTaskId?: string;
  milestoneId?: string;
  sprintId?: string;
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bgColor: string }> = {
  PLANNING: { label: 'Lập kế hoạch', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  ON_HOLD: { label: 'Tạm dừng', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-purple-700', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  CANCELLED: { label: 'Đã hủy', color: 'text-zinc-500', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  BACKLOG: { label: 'Backlog', color: 'text-zinc-600', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
  TODO: { label: 'Cần làm', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  IN_PROGRESS: { label: 'Đang làm', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  IN_REVIEW: { label: 'Đang review', color: 'text-purple-700', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  DONE: { label: 'Hoàn thành', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
};

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string; icon: string }> = {
  CRITICAL: { label: 'Khẩn cấp', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950', icon: '🔴' },
  HIGH: { label: 'Cao', color: 'text-orange-700', bgColor: 'bg-orange-50 dark:bg-orange-950', icon: '🟠' },
  MEDIUM: { label: 'Trung bình', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950', icon: '🟡' },
  LOW: { label: 'Thấp', color: 'text-green-700', bgColor: 'bg-green-50 dark:bg-green-950', icon: '🟢' },
};

export const TASK_TYPE_CONFIG: Record<TaskType, { label: string; color: string; icon: string }> = {
  TASK: { label: 'Công việc', color: 'text-blue-600', icon: '📋' },
  BUG: { label: 'Lỗi', color: 'text-red-600', icon: '🐛' },
  FEATURE: { label: 'Tính năng', color: 'text-emerald-600', icon: '✨' },
  IMPROVEMENT: { label: 'Cải tiến', color: 'text-purple-600', icon: '📈' },
  EPIC: { label: 'Epic', color: 'text-amber-600', icon: '⚡' },
  STORY: { label: 'User Story', color: 'text-pink-600', icon: '📖' },
};

export const MILESTONE_STATUS_CONFIG: Record<MilestoneStatus, { label: string; color: string; bgColor: string }> = {
  UPCOMING: { label: 'Sắp tới', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  COMPLETED: { label: 'Hoàn thành', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  MISSED: { label: 'Quá hạn', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
};

// ============================================================================
// KANBAN BOARD CONFIG
// ============================================================================

export const KANBAN_COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', color: '#71717a' },
  { id: 'TODO', title: 'Cần làm', color: '#3b82f6' },
  { id: 'IN_PROGRESS', title: 'Đang làm', color: '#f59e0b' },
  { id: 'IN_REVIEW', title: 'Đang review', color: '#a855f7' },
  { id: 'DONE', title: 'Hoàn thành', color: '#10b981' },
];

// Project Management Types for CRM

export type ProjectStatus = 
  | 'planning'      // Lên kế hoạch
  | 'active'        // Đang hoạt động
  | 'in_progress'   // Đang thực hiện
  | 'on_hold'       // Tạm dừng
  | 'completed'     // Hoàn thành
  | 'cancelled';    // Hủy bỏ

export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Project {
  id: string;
  lead_id?: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  
  // Timeline
  start_date?: string;
  end_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  
  // Financial
  estimated_cost?: number;
  actual_cost?: number;
  budget?: number;
  
  // Team
  project_manager?: string;
  team_members?: string[];
  
  // Progress
  progress_percentage: number;
  progress?: number;
  
  // Client info
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  
  // System info
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: ProjectPriority;
  type?: TaskType;
  task_code?: string;
  assigned_to?: string;
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  progress?: number;
  estimated_hours?: number;
  actual_hours?: number;
  subtask_count?: number;
  comment_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  target_date: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
}

// Lead Qualification Types
export type QualificationCriteria = 
  | 'budget'        // Ngân sách
  | 'authority'     // Quyền quyết định
  | 'need'          // Nhu cầu thực tế
  | 'timeline';     // Thời gian triển khai

export type QualificationScore = 1 | 2 | 3 | 4 | 5; // 1: Very Low, 5: Very High

export interface LeadQualification {
  id: string;
  lead_id: string;
  
  // BANT Framework (Budget, Authority, Need, Timeline)
  budget_score: QualificationScore;
  budget_notes?: string;
  
  authority_score: QualificationScore;
  authority_notes?: string;
  
  need_score: QualificationScore;
  need_notes?: string;
  
  timeline_score: QualificationScore;
  timeline_notes?: string;
  
  // Overall
  overall_score: number; // Average of 4 criteria
  qualification_status: 'unqualified' | 'qualified' | 'highly_qualified';
  
  // Additional info
  decision_makers?: string[];
  competitors?: string[];
  pain_points?: string[];
  
  evaluated_by?: string;
  evaluated_at: string;
  created_at: string;
  updated_at: string;
}

export interface QualificationHistory {
  id: string;
  lead_id: string;
  criteria: QualificationCriteria;
  old_score?: QualificationScore;
  new_score: QualificationScore;
  notes?: string;
  changed_by: string;
  changed_at: string;
}

// ============================================
// EXTENDED TASK TYPES
// ============================================

export type TaskType = 'feature' | 'bug' | 'improvement' | 'task' | 'epic' | 'story';

export type Priority = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

export interface TaskDependency {
  taskId: string;
  taskCode: string;
  type: 'blocks' | 'blocked_by' | 'relates_to';
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  is_completed?: boolean;
  assigneeId?: string;
  dueDate?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  user_id?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentions: string[];
  attachments: Attachment[];
  reactions: Record<string, string[]>;
  parentId?: string;
  edited: boolean;
  created_at?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  file_name?: string;
  type: string;
  size: number;
  file_size?: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// ============================================
// ACTIVITY LOG
// ============================================

export type ActivityAction = 
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'commented'
  | 'attached'
  | 'completed'
  | 'reopened'
  | 'moved';

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  entityType: 'project' | 'task' | 'milestone' | 'comment';
  entityId: string;
  changes?: ActivityChange[];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ActivityChange {
  field: string;
  fieldLabel: string;
  oldValue?: any;
  newValue?: any;
}

// ============================================
// KANBAN BOARD TYPES
// ============================================

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  wipLimit?: number;
  tasks: ProjectTask[];
}

export interface KanbanBoard {
  projectId: string;
  columns: KanbanColumn[];
  settings: {
    showSubtasks: boolean;
    showAssignee: boolean;
    showPriority: boolean;
    showDueDate: boolean;
    showEstimate: boolean;
    groupBy?: 'none' | 'assignee' | 'priority' | 'type';
  };
}

export const DEFAULT_KANBAN_COLUMNS: Omit<KanbanColumn, 'tasks'>[] = [
  { id: 'todo', title: 'Cần làm', color: '#3B82F6' },
  { id: 'in_progress', title: 'Đang làm', color: '#F59E0B' },
  { id: 'review', title: 'Đang xem xét', color: '#8B5CF6' },
  { id: 'done', title: 'Hoàn thành', color: '#10B981' },
];

// ============================================
// GANTT CHART TYPES
// ============================================

export interface GanttTask {
  id: string;
  code: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  type: 'task' | 'milestone' | 'project';
  dependencies?: string[];
  assignee?: string;
  color?: string;
  isDisabled?: boolean;
  children?: GanttTask[];
}

export interface GanttConfig {
  viewMode: 'hour' | 'day' | 'week' | 'month' | 'year';
  showProgress: boolean;
  showDependencies: boolean;
  showToday: boolean;
  columnWidth: number;
}

// ============================================
// TIME TRACKING
// ============================================

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  description?: string;
  hours: number;
  date: string;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PROJECT ANALYTICS
// ============================================

export interface ProjectAnalytics {
  projectId: string;
  overview: {
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    progressPercentage: number;
  };
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<ProjectPriority, number>;
  tasksByAssignee: {
    userId: string;
    userName: string;
    total: number;
    completed: number;
  }[];
  burndownData: {
    date: string;
    remaining: number;
    ideal: number;
  }[];
  velocityData: {
    week: string;
    completed: number;
    added: number;
  }[];
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getStatusLabel(status: TaskStatus): string {
  const labels: Record<TaskStatus, string> = {
    todo: 'Cần làm',
    in_progress: 'Đang làm',
    review: 'Đang xem xét',
    done: 'Hoàn thành',
  };
  return labels[status];
}

export function getPriorityLabel(priority: ProjectPriority): string {
  const labels: Record<ProjectPriority, string> = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp',
  };
  return labels[priority];
}

export function getTypeLabel(type: TaskType): string {
  const labels: Record<TaskType, string> = {
    feature: 'Tính năng',
    bug: 'Lỗi',
    improvement: 'Cải tiến',
    task: 'Công việc',
    epic: 'Epic',
    story: 'Story',
  };
  return labels[type];
}

export function getTypeIcon(type: TaskType): string {
  const icons: Record<TaskType, string> = {
    feature: '✨',
    bug: '🐛',
    improvement: '🔧',
    task: '📋',
    epic: '🏔️',
    story: '📖',
  };
  return icons[type];
}

export function getPriorityColor(priority: ProjectPriority): string {
  const colors: Record<ProjectPriority, string> = {
    low: '#22C55E',
    medium: '#F59E0B',
    high: '#F97316',
    urgent: '#EF4444',
  };
  return colors[priority];
}

export function getStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: '#3B82F6',
    in_progress: '#F59E0B',
    review: '#8B5CF6',
    done: '#10B981',
  };
  return colors[status];
}

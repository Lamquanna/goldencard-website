// TypeScript types for Project Management Module
// Designed for Renewable Energy industry (GoldenEnergy)

import { Timestamp } from 'firebase/firestore';

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type ProjectCategory = 
  | 'solar_rooftop'
  | 'solar_farm'
  | 'wind_onshore'
  | 'wind_offshore'
  | 'epc_construction'
  | 'om_service'        // Operation & Maintenance
  | 'om'                // Alias for om_service
  | 'iot_integration'
  | 'iot'               // Alias for iot_integration
  | 'substation_infra'
  | 'hybrid_energy';

export type ProjectStatus = 
  | 'draft'
  | 'planning'
  | 'approved'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type MilestonePhase = 
  | 'survey'
  | 'design'
  | 'procurement'
  | 'build'
  | 'commission'
  | 'handover'
  | 'om';              // Operation & Maintenance

export type TaskStatus = 
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'done'
  | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskStatus = 'identified' | 'mitigating' | 'resolved' | 'accepted';

// ============================================
// PROJECT
// ============================================

export interface Project {
  id: string;
  name: string;
  project_code: string;            // e.g., "GE-2024-001" (renamed from code)
  description?: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // Client info
  client_name: string;
  client_contact?: string;
  client_phone?: string;
  client_email?: string;
  
  // Location (updated to match page.tsx)
  location_address?: string;
  location_province?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  
  // Capacity & specs
  capacity_kw?: number;            // e.g., 500 kW
  capacity_unit?: string;          // kW, MW, kWh
  panel_count?: number;
  inverter_count?: number;
  
  // Timeline
  start_date: string;
  expected_end_date?: string;
  actual_end_date?: string;
  
  // Budget
  budget?: number;
  currency?: string;
  spent_amount?: number;
  
  // Progress
  progress_percent: number;        // 0-100
  current_milestone?: MilestonePhase;
  
  // Team
  team_lead_id?: string;
  team_lead_name?: string;
  team_member_ids?: string[];
  
  // Counts for UI
  milestones_count?: number;
  milestones_completed?: number;
  tasks_count?: number;
  tasks_completed?: number;
  risks_count?: number;
  open_risks_count?: number;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Computed (populated)
  project_manager?: ProjectMember;
  team_members?: ProjectMember[];
  milestones?: Milestone[];
}

// ============================================
// PROJECT MEMBER
// ============================================

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'manager' | 'engineer' | 'technician' | 'supervisor' | 'viewer';
  joined_at: string;
  
  // Populated
  user_name?: string;
  user_email?: string;
  user_avatar?: string;
}

// ============================================
// MILESTONE
// ============================================

export interface Milestone {
  id: string;
  project_id: string;
  phase: MilestonePhase;
  name: string;
  description?: string;
  
  start_date: string;
  target_date: string;
  actual_date?: string;
  
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress_percent: number;
  
  deliverables?: string[];
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================
// TASK
// ============================================

export interface Task {
  id: string;
  project_id: string;
  milestone_id?: string;
  parent_task_id?: string;         // For subtasks
  
  title: string;
  description?: string;
  
  status: TaskStatus;
  priority: TaskPriority;
  
  assignee_id?: string;
  assignee_ids?: string[];         // Multiple assignees
  
  start_date?: string;
  due_date?: string;
  completed_at?: string;
  
  estimated_hours?: number;
  actual_hours?: number;
  
  // Inventory link
  required_items?: TaskInventoryItem[];
  
  // Attachments
  attachments?: TaskAttachment[];
  
  // Comments count
  comment_count?: number;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Computed
  assignee?: ProjectMember;
  subtasks?: Task[];
  milestone?: Milestone;
}

export interface TaskInventoryItem {
  item_id: string;
  item_name?: string;
  quantity: number;
  unit?: string;
  issued: boolean;                 // Has been issued from inventory
  issued_at?: string;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_by: string;
  uploaded_at: string;
}

// ============================================
// TASK COMMENT
// ============================================

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  message: string;
  attachments?: TaskAttachment[];
  created_at: string;
  updated_at?: string;
  
  // Populated
  user_name?: string;
  user_avatar?: string;
}

// ============================================
// RISK LOG
// ============================================

export interface ProjectRisk {
  id: string;
  project_id: string;
  
  title: string;
  description: string;
  
  level: RiskLevel;
  status: RiskStatus;
  
  probability: number;             // 1-5
  impact: number;                  // 1-5
  risk_score?: number;             // probability * impact
  
  category: 'technical' | 'financial' | 'schedule' | 'resource' | 'external' | 'safety';
  
  mitigation_plan?: string;
  contingency_plan?: string;
  
  owner_id?: string;
  identified_date: string;
  target_resolution_date?: string;
  resolved_date?: string;
  
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Populated
  owner?: ProjectMember;
}

// ============================================
// PROJECT MESSAGE (Firebase)
// ============================================

export interface ProjectMessage {
  id: string;
  project_id: string;
  task_id?: string;                // Optional - for task-specific chat
  
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  
  message: string;
  message_type: 'text' | 'file' | 'image' | 'system';
  
  attachments?: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  
  seen_by: string[];               // User IDs who have seen
  
  created_at: Timestamp;
  updated_at?: Timestamp;
}

// ============================================
// PROJECT ACTIVITY LOG
// ============================================

export interface ProjectActivity {
  id: string;
  project_id: string;
  task_id?: string;
  
  action: 'created' | 'updated' | 'deleted' | 'status_changed' | 'assigned' | 'commented' | 'file_uploaded';
  entity_type: 'project' | 'task' | 'milestone' | 'risk' | 'member';
  entity_id: string;
  
  description: string;
  old_value?: string;
  new_value?: string;
  
  user_id: string;
  user_name?: string;
  
  created_at: string;
}

// ============================================
// API INPUT TYPES
// ============================================

export interface CreateProjectInput {
  name: string;
  code?: string;
  description?: string;
  category: ProjectCategory;
  client_name: string;
  client_contact?: string;
  client_phone?: string;
  client_email?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  province?: string;
  capacity_kw?: number;
  start_date: string;
  target_end_date: string;
  budget?: number;
  project_manager_id?: string;
  team_member_ids?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  location?: string;
  capacity_kw?: number;
  target_end_date?: string;
  actual_end_date?: string;
  budget?: number;
  actual_cost?: number;
  progress_percent?: number;
  current_milestone?: MilestonePhase;
  project_manager_id?: string;
}

export interface CreateTaskInput {
  project_id: string;
  milestone_id?: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  assignee_ids?: string[];
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  required_items?: { item_id: string; quantity: number }[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string;
  assignee_ids?: string[];
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

// ============================================
// CONSTANTS
// ============================================

export const PROJECT_CATEGORIES: Record<ProjectCategory, { name: string; icon: string; color: string }> = {
  solar_rooftop: { name: 'Solar Rooftop', icon: '🏠', color: 'bg-yellow-100 text-yellow-800' },
  solar_farm: { name: 'Solar Farm', icon: '☀️', color: 'bg-orange-100 text-orange-800' },
  wind_onshore: { name: 'Wind Onshore', icon: '💨', color: 'bg-cyan-100 text-cyan-800' },
  wind_offshore: { name: 'Wind Offshore', icon: '🌊', color: 'bg-blue-100 text-blue-800' },
  epc_construction: { name: 'EPC Construction', icon: '🏗️', color: 'bg-gray-100 text-gray-800' },
  om_service: { name: 'O&M Service', icon: '🔧', color: 'bg-green-100 text-green-800' },
  om: { name: 'O&M Service', icon: '🔧', color: 'bg-green-100 text-green-800' },
  iot_integration: { name: 'IoT Integration', icon: '📡', color: 'bg-purple-100 text-purple-800' },
  iot: { name: 'IoT Integration', icon: '📡', color: 'bg-purple-100 text-purple-800' },
  substation_infra: { name: 'Substation Infra', icon: '⚡', color: 'bg-red-100 text-red-800' },
  hybrid_energy: { name: 'Hybrid Energy', icon: '🔋', color: 'bg-teal-100 text-teal-800' },
};

export const MILESTONE_PHASES: Record<MilestonePhase, { name: string; icon: string; order: number }> = {
  survey: { name: 'Khảo sát', icon: '🔍', order: 1 },
  design: { name: 'Thiết kế', icon: '📐', order: 2 },
  procurement: { name: 'Mua sắm', icon: '🛒', order: 3 },
  build: { name: 'Thi công', icon: '🏗️', order: 4 },
  commission: { name: 'Vận hành thử', icon: '⚡', order: 5 },
  handover: { name: 'Bàn giao', icon: '🤝', order: 6 },
  om: { name: 'Vận hành & Bảo trì', icon: '🔧', order: 7 },
};

export const TASK_STATUS_CONFIG: Record<TaskStatus, { name: string; color: string; bgColor: string }> = {
  todo: { name: 'Chờ làm', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  in_progress: { name: 'Đang làm', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  review: { name: 'Đang review', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  done: { name: 'Hoàn thành', color: 'text-green-600', bgColor: 'bg-green-100' },
  blocked: { name: 'Bị chặn', color: 'text-red-600', bgColor: 'bg-red-100' },
};

export const RISK_LEVEL_CONFIG: Record<RiskLevel, { name: string; color: string; bgColor: string }> = {
  low: { name: 'Thấp', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { name: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { name: 'Cao', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  critical: { name: 'Nghiêm trọng', color: 'text-red-600', bgColor: 'bg-red-100' },
};

// Core types for GoldenEnergy HOME Platform

// ============================================
// Module Registry Types
// ============================================
export interface ModuleManifest {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  version: string;
  enabled: boolean;
  permissions: ModulePermission[];
  dependencies?: string[];
  order: number;
}

export interface ModulePermission {
  resource: string;
  actions: PermissionAction[];
}

export type PermissionAction = 
  | 'view' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'assign' 
  | 'export' 
  | 'view_sensitive'
  | 'manage';

// ============================================
// RBAC Types
// ============================================
export type RoleType = 'super_admin' | 'admin' | 'manager' | 'staff';

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description: string;
  permissions: RolePermission[];
  parentRoleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RolePermission {
  moduleId: string;
  resource: string;
  actions: PermissionAction[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roleId: string;
  role?: Role;
  departmentId?: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Role hierarchy levels
export const ROLE_HIERARCHY: Record<RoleType, number> = {
  super_admin: 4,
  admin: 3,
  manager: 2,
  staff: 1,
};

// ============================================
// Notification Types
// ============================================
export type NotificationCategory = 
  | 'system'
  | 'task'
  | 'deadline'
  | 'invoice'
  | 'lead'
  | 'hr'
  | 'approval'
  | 'mention'
  | 'comment'
  | 'alert';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

// ============================================
// Workflow Types
// ============================================
export type WorkflowStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'on_hold';

export type WorkflowStepType = 'approval' | 'task' | 'notification' | 'condition' | 'action';

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  triggerEvent: string;
  steps: WorkflowStep[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  order: number;
  config: WorkflowStepConfig;
  conditions?: WorkflowCondition[];
  nextStepId?: string;
  onRejectStepId?: string;
}

export interface WorkflowStepConfig {
  assigneeType?: 'user' | 'role' | 'manager' | 'dynamic';
  assigneeId?: string;
  assigneeField?: string;
  timeoutHours?: number;
  autoApprove?: boolean;
  notificationTemplate?: string;
  actionType?: string;
  actionPayload?: Record<string, unknown>;
}

export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value: unknown;
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  entityType: string;
  entityId: string;
  status: WorkflowStatus;
  currentStepId: string;
  data: Record<string, unknown>;
  history: WorkflowHistoryEntry[];
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkflowHistoryEntry {
  stepId: string;
  stepName: string;
  action: 'started' | 'approved' | 'rejected' | 'completed' | 'skipped';
  performedBy: string;
  comment?: string;
  timestamp: Date;
}

// ============================================
// Audit Log Types
// ============================================
export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export' 
  | 'login' 
  | 'logout'
  | 'approve'
  | 'reject'
  | 'assign';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  moduleId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  description: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  diff?: AuditDiff[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface AuditDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// ============================================
// File Manager Types
// ============================================
export type FileType = 'file' | 'folder';

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  mimeType?: string;
  size?: number;
  path: string;
  parentId?: string;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
  url?: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Search Types
// ============================================
export interface SearchResult {
  id: string;
  type: string;
  moduleId: string;
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  score: number;
}

export interface SearchQuery {
  query: string;
  modules?: string[];
  types?: string[];
  limit?: number;
  offset?: number;
}

// ============================================
// Integration Types
// ============================================
export type IntegrationProvider = 
  | 'misa'
  | 'zalo_oa'
  | 'gmail'
  | 'google_drive'
  | 'vnpay'
  | 'firebase';

export interface IntegrationConfig {
  id: string;
  provider: IntegrationProvider;
  name: string;
  isEnabled: boolean;
  credentials: Record<string, string>;
  settings: Record<string, unknown>;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Report Types
// ============================================
export type ReportType = 'table' | 'chart' | 'summary' | 'custom';

export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  moduleId: string;
  type: ReportType;
  config: ReportConfig;
  filters: ReportFilter[];
  createdBy: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportConfig {
  dataSource: string;
  columns?: ReportColumn[];
  chartType?: ChartType;
  groupBy?: string[];
  aggregations?: ReportAggregation[];
  sortBy?: { field: string; direction: 'asc' | 'desc' }[];
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency';
  format?: string;
  width?: number;
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: unknown;
  label: string;
}

export interface ReportAggregation {
  field: string;
  function: 'sum' | 'avg' | 'count' | 'min' | 'max';
  label: string;
}

// ============================================
// Common Types
// ============================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
}

export interface Money {
  amount: number;
  currency: string;
}

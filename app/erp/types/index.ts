// =============================================================================
// HOME PLATFORM - Core Types
// Enterprise Plugin Architecture for GoldenEnergy
// =============================================================================

// -----------------------------------------------------------------------------
// Module & Plugin Types
// -----------------------------------------------------------------------------

export type ModuleStatus = 'active' | 'inactive' | 'installing' | 'error';

export interface ModuleManifest {
  id: string;
  name: string;
  nameVi: string;
  version: string;
  description: string;
  descriptionVi: string;
  icon: string;
  color: string;
  author: string;
  category: ModuleCategory;
  
  // Routes & Navigation
  basePath: string;
  routes: ModuleRoute[];
  
  // Permissions
  permissions: PermissionDefinition[];
  defaultRoles: string[];
  
  // Dependencies
  dependencies?: string[];
  optionalDependencies?: string[];
  
  // Settings
  settings?: ModuleSetting[];
  
  // Hooks
  hooks?: ModuleHooks;
  
  // API
  apiPrefix?: string;
  
  // Status
  status?: ModuleStatus;
  installedAt?: Date;
  updatedAt?: Date;
}

export type ModuleCategory = 
  | 'core'
  | 'sales'
  | 'hr'
  | 'operations'
  | 'finance'
  | 'analytics'
  | 'communication'
  | 'productivity'
  | 'integration';

export interface ModuleRoute {
  path: string;
  name: string;
  nameVi: string;
  icon?: string;
  showInSidebar?: boolean;
  showInSearch?: boolean;
  permission?: string;
  badge?: string | number;
  children?: ModuleRoute[];
}

export interface ModuleSetting {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  label: string;
  labelVi: string;
  defaultValue: unknown;
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ModuleHooks {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onActivate?: () => Promise<void>;
  onDeactivate?: () => Promise<void>;
  onUpgrade?: (fromVersion: string) => Promise<void>;
}

// -----------------------------------------------------------------------------
// Permission Types (RBAC)
// -----------------------------------------------------------------------------

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'export' | 'import';

export interface PermissionDefinition {
  id: string;
  name: string;
  nameVi: string;
  description?: string;
  resource: string;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  nameVi: string;
  description?: string;
  permissions: string[]; // Permission IDs
  isSystem?: boolean;
  level: number; // 0 = highest (admin), higher = lower access
}

export interface UserPermissions {
  userId: string;
  roles: string[];
  directPermissions: string[];
  deniedPermissions: string[];
  workspaceId?: string;
}

// -----------------------------------------------------------------------------
// Workspace & Multi-tenant Types
// -----------------------------------------------------------------------------

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  settings: WorkspaceSettings;
  subscription: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  timezone: string;
  dateFormat: string;
  currency: string;
  enabledModules: string[];
  customBranding?: {
    primaryColor: string;
    logo: string;
    favicon: string;
  };
}

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise';

// -----------------------------------------------------------------------------
// User & Auth Types
// -----------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  roles: string[];
  workspaces: UserWorkspace[];
  preferences: UserPreferences;
  status: 'active' | 'inactive' | 'pending';
  lastLoginAt?: Date;
  createdAt: Date;
}

export interface UserWorkspace {
  workspaceId: string;
  role: string;
  joinedAt: Date;
  isDefault?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'vi' | 'en';
  notifications: NotificationPreferences;
  sidebar: {
    collapsed: boolean;
    pinnedModules: string[];
  };
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  sound: boolean;
  channels: {
    tasks: boolean;
    mentions: boolean;
    updates: boolean;
    marketing: boolean;
  };
}

// -----------------------------------------------------------------------------
// Notification Types
// -----------------------------------------------------------------------------

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'task'
  | 'mention'
  | 'approval'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  moduleId?: string;
  userId: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// Search Types
// -----------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  type: 'module' | 'page' | 'record' | 'action' | 'user' | 'file';
  title: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  moduleId?: string;
  moduleName?: string;
  link: string;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface SearchOptions {
  query: string;
  modules?: string[];
  types?: SearchResult['type'][];
  limit?: number;
  offset?: number;
}

// -----------------------------------------------------------------------------
// Activity & Audit Types
// -----------------------------------------------------------------------------

export interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  moduleId: string;
  userId: string;
  userName: string;
  workspaceId: string;
  metadata?: Record<string, unknown>;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// UI Component Types
// -----------------------------------------------------------------------------

export interface MenuItem {
  id: string;
  label: string;
  labelVi: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  badgeColor?: string;
  children?: MenuItem[];
  permission?: string;
  dividerAfter?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  labelVi: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// -----------------------------------------------------------------------------
// Event Types (for plugin communication)
// -----------------------------------------------------------------------------

export interface PlatformEvent<T = unknown> {
  type: string;
  moduleId: string;
  payload: T;
  timestamp: Date;
  userId?: string;
}

export type EventHandler<T = unknown> = (event: PlatformEvent<T>) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe: () => void;
}

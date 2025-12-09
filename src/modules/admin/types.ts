// ============================================================================
// ADMINHUB MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME - Enterprise Admin Hub System
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

/** User status */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
}

/** User role */
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  EMPLOYEE = 'EMPLOYEE',
  GUEST = 'GUEST',
}

/** Module type */
export enum ModuleType {
  CRM = 'CRM',
  HRM = 'HRM',
  PROJECTS = 'PROJECTS',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  ADMIN = 'ADMIN',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS',
}

/** Permission action */
export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  MANAGE = 'MANAGE',
}

/** Audit action */
export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
}

/** Setting category */
export enum SettingCategory {
  GENERAL = 'GENERAL',
  SECURITY = 'SECURITY',
  NOTIFICATIONS = 'NOTIFICATIONS',
  INTEGRATIONS = 'INTEGRATIONS',
  APPEARANCE = 'APPEARANCE',
  EMAIL = 'EMAIL',
  STORAGE = 'STORAGE',
  BACKUP = 'BACKUP',
}

/** Setting type */
export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
  ENUM = 'ENUM',
  SECRET = 'SECRET',
}

/** Backup status */
export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/** Backup type */
export enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  DIFFERENTIAL = 'DIFFERENTIAL',
}

// ============================================================================
// CONFIG MAPS
// ============================================================================

export const USER_STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bgColor: string }> = {
  [UserStatus.ACTIVE]: { label: 'Hoạt động', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  [UserStatus.INACTIVE]: { label: 'Không hoạt động', color: 'text-zinc-700', bgColor: 'bg-zinc-100' },
  [UserStatus.PENDING]: { label: 'Chờ kích hoạt', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  [UserStatus.SUSPENDED]: { label: 'Tạm khóa', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  [UserStatus.LOCKED]: { label: 'Bị khóa', color: 'text-red-700', bgColor: 'bg-red-100' },
};

export const USER_ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string; level: number }> = {
  [UserRole.SUPER_ADMIN]: { label: 'Super Admin', color: 'text-violet-700', bgColor: 'bg-violet-100', level: 100 },
  [UserRole.ADMIN]: { label: 'Admin', color: 'text-blue-700', bgColor: 'bg-blue-100', level: 80 },
  [UserRole.MANAGER]: { label: 'Quản lý', color: 'text-indigo-700', bgColor: 'bg-indigo-100', level: 60 },
  [UserRole.TEAM_LEAD]: { label: 'Trưởng nhóm', color: 'text-cyan-700', bgColor: 'bg-cyan-100', level: 40 },
  [UserRole.EMPLOYEE]: { label: 'Nhân viên', color: 'text-emerald-700', bgColor: 'bg-emerald-100', level: 20 },
  [UserRole.GUEST]: { label: 'Khách', color: 'text-zinc-700', bgColor: 'bg-zinc-100', level: 10 },
};

export const MODULE_CONFIG: Record<ModuleType, { label: string; icon: string; color: string }> = {
  [ModuleType.CRM]: { label: 'CRM', icon: 'users', color: 'text-blue-600' },
  [ModuleType.HRM]: { label: 'Nhân sự', icon: 'user-check', color: 'text-emerald-600' },
  [ModuleType.PROJECTS]: { label: 'Dự án', icon: 'folder-kanban', color: 'text-violet-600' },
  [ModuleType.INVENTORY]: { label: 'Kho', icon: 'package', color: 'text-amber-600' },
  [ModuleType.FINANCE]: { label: 'Tài chính', icon: 'dollar-sign', color: 'text-emerald-600' },
  [ModuleType.ADMIN]: { label: 'Admin', icon: 'shield', color: 'text-red-600' },
  [ModuleType.REPORTS]: { label: 'Báo cáo', icon: 'bar-chart', color: 'text-indigo-600' },
  [ModuleType.SETTINGS]: { label: 'Cài đặt', icon: 'settings', color: 'text-zinc-600' },
};

export const AUDIT_ACTION_CONFIG: Record<AuditAction, { label: string; color: string }> = {
  [AuditAction.LOGIN]: { label: 'Đăng nhập', color: 'text-blue-600' },
  [AuditAction.LOGOUT]: { label: 'Đăng xuất', color: 'text-zinc-600' },
  [AuditAction.CREATE]: { label: 'Tạo mới', color: 'text-emerald-600' },
  [AuditAction.UPDATE]: { label: 'Cập nhật', color: 'text-amber-600' },
  [AuditAction.DELETE]: { label: 'Xóa', color: 'text-red-600' },
  [AuditAction.VIEW]: { label: 'Xem', color: 'text-zinc-600' },
  [AuditAction.EXPORT]: { label: 'Xuất dữ liệu', color: 'text-indigo-600' },
  [AuditAction.IMPORT]: { label: 'Nhập dữ liệu', color: 'text-violet-600' },
  [AuditAction.APPROVE]: { label: 'Phê duyệt', color: 'text-emerald-600' },
  [AuditAction.REJECT]: { label: 'Từ chối', color: 'text-red-600' },
  [AuditAction.SETTINGS_CHANGE]: { label: 'Thay đổi cài đặt', color: 'text-orange-600' },
  [AuditAction.PERMISSION_CHANGE]: { label: 'Thay đổi quyền', color: 'text-violet-600' },
};

export const SETTING_CATEGORY_CONFIG: Record<SettingCategory, { label: string; icon: string }> = {
  [SettingCategory.GENERAL]: { label: 'Tổng quan', icon: 'settings' },
  [SettingCategory.SECURITY]: { label: 'Bảo mật', icon: 'shield' },
  [SettingCategory.NOTIFICATIONS]: { label: 'Thông báo', icon: 'bell' },
  [SettingCategory.INTEGRATIONS]: { label: 'Tích hợp', icon: 'plug' },
  [SettingCategory.APPEARANCE]: { label: 'Giao diện', icon: 'palette' },
  [SettingCategory.EMAIL]: { label: 'Email', icon: 'mail' },
  [SettingCategory.STORAGE]: { label: 'Lưu trữ', icon: 'hard-drive' },
  [SettingCategory.BACKUP]: { label: 'Sao lưu', icon: 'database' },
};

export const BACKUP_STATUS_CONFIG: Record<BackupStatus, { label: string; color: string; bgColor: string }> = {
  [BackupStatus.PENDING]: { label: 'Chờ xử lý', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  [BackupStatus.IN_PROGRESS]: { label: 'Đang chạy', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  [BackupStatus.COMPLETED]: { label: 'Hoàn thành', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  [BackupStatus.FAILED]: { label: 'Thất bại', color: 'text-red-700', bgColor: 'bg-red-100' },
  [BackupStatus.CANCELLED]: { label: 'Đã hủy', color: 'text-zinc-700', bgColor: 'bg-zinc-100' },
};

// ============================================================================
// INTERFACES
// ============================================================================

/** User account */
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  status: UserStatus;
  role: UserRole;
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  permissions: Permission[];
  metadata?: Record<string, unknown>;
  lastLoginAt?: string;
  lastActiveAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
}

/** Permission */
export interface Permission {
  id: string;
  module: ModuleType;
  action: PermissionAction;
  resource?: string;
  conditions?: Record<string, unknown>;
}

/** Role with permissions */
export interface Role {
  id: string;
  name: string;
  slug: UserRole;
  description?: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Audit log entry */
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  module: ModuleType;
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  details?: Record<string, unknown>;
  changes?: {
    before: Record<string, unknown>;
    after: Record<string, unknown>;
  };
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/** System setting */
export interface SystemSetting {
  id: string;
  key: string;
  value: string | number | boolean | object;
  type: SettingType;
  category: SettingCategory;
  label: string;
  description?: string;
  options?: string[]; // For ENUM type
  isRequired: boolean;
  isPublic: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  updatedAt: string;
  updatedById?: string;
}

/** Backup record */
export interface Backup {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number; // bytes
  modules: ModuleType[];
  location: string;
  startedAt: string;
  completedAt?: string;
  error?: string;
  createdById: string;
  createdByName: string;
}

/** System stats */
export interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalAuditLogs: number;
  storageUsed: number;
  storageTotal: number;
  lastBackup?: string;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

/** User filters */
export interface UserFilters {
  search?: string;
  status?: UserStatus;
  role?: UserRole;
  departmentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

/** Audit filters */
export interface AuditFilters {
  search?: string;
  userId?: string;
  action?: AuditAction;
  module?: ModuleType;
  dateFrom?: string;
  dateTo?: string;
}

/** Admin Hub state */
export interface AdminState {
  // Data
  users: User[];
  roles: Role[];
  auditLogs: AuditLog[];
  settings: SystemSetting[];
  backups: Backup[];
  
  // Selection
  selectedUser: User | null;
  selectedRole: Role | null;
  selectedAuditLog: AuditLog | null;
  
  // Filters
  userFilters: UserFilters;
  auditFilters: AuditFilters;
  
  // UI
  isLoading: boolean;
  error: string | null;
  
  // Stats
  systemStats: SystemStats | null;
}

/** Admin Hub actions */
export interface AdminActions {
  // Users
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  selectUser: (user: User | null) => void;
  setUserFilters: (filters: Partial<UserFilters>) => void;
  clearUserFilters: () => void;
  
  // Roles
  setRoles: (roles: Role[]) => void;
  addRole: (role: Role) => void;
  updateRole: (id: string, data: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  selectRole: (role: Role | null) => void;
  
  // Audit Logs
  setAuditLogs: (logs: AuditLog[]) => void;
  addAuditLog: (log: AuditLog) => void;
  selectAuditLog: (log: AuditLog | null) => void;
  setAuditFilters: (filters: Partial<AuditFilters>) => void;
  clearAuditFilters: () => void;
  
  // Settings
  setSettings: (settings: SystemSetting[]) => void;
  updateSetting: (id: string, value: SystemSetting['value']) => void;
  
  // Backups
  setBackups: (backups: Backup[]) => void;
  addBackup: (backup: Backup) => void;
  updateBackup: (id: string, data: Partial<Backup>) => void;
  
  // Stats
  setSystemStats: (stats: SystemStats) => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export type AdminStore = AdminState & AdminActions;

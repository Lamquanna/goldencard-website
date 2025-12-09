// ============================================================================
// USER MANAGEMENT MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - User & Permission Management
// ============================================================================

import { RolePermission as Permission, Role } from '@/core/types';

// ============================================================================
// ENUMS
// ============================================================================

/** User account status */
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
}

/** Two-factor authentication method */
export enum TwoFactorMethod {
  NONE = 'NONE',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  AUTHENTICATOR = 'AUTHENTICATOR',
  HARDWARE_KEY = 'HARDWARE_KEY',
}

/** User invitation status */
export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

/** Password reset status */
export enum PasswordResetStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}

// ============================================================================
// CONFIG MAPS
// ============================================================================

export const USER_STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bgColor: string }> = {
  [UserStatus.ACTIVE]: { label: 'Hoạt động', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  [UserStatus.INACTIVE]: { label: 'Không hoạt động', color: 'text-zinc-700', bgColor: 'bg-zinc-100' },
  [UserStatus.PENDING]: { label: 'Chờ xác nhận', color: 'text-amber-700', bgColor: 'bg-amber-100' },
  [UserStatus.SUSPENDED]: { label: 'Tạm khóa', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  [UserStatus.LOCKED]: { label: 'Bị khóa', color: 'text-red-700', bgColor: 'bg-red-100' },
  [UserStatus.DELETED]: { label: 'Đã xóa', color: 'text-zinc-500', bgColor: 'bg-zinc-50' },
};

export const TWO_FACTOR_CONFIG: Record<TwoFactorMethod, { label: string; icon: string }> = {
  [TwoFactorMethod.NONE]: { label: 'Không có', icon: 'shield-off' },
  [TwoFactorMethod.EMAIL]: { label: 'Email OTP', icon: 'mail' },
  [TwoFactorMethod.SMS]: { label: 'SMS OTP', icon: 'smartphone' },
  [TwoFactorMethod.AUTHENTICATOR]: { label: 'Authenticator App', icon: 'key' },
  [TwoFactorMethod.HARDWARE_KEY]: { label: 'Hardware Key', icon: 'usb' },
};

// ============================================================================
// INTERFACES
// ============================================================================

/** User profile */
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: UserAddress;
  bio?: string;
  timezone?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

/** User address */
export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/** User account (extends profile with account data) */
export interface User extends UserProfile {
  status: UserStatus;
  roleIds: string[];
  roles: Role[];
  permissions: Permission[];
  departmentId?: string;
  departmentName?: string;
  positionId?: string;
  positionName?: string;
  managerId?: string;
  managerName?: string;
  
  // Security
  twoFactorEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  lastPasswordChange?: string;
  passwordExpiresAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  
  // Sessions
  lastLoginAt?: string;
  lastLoginIp?: string;
  lastActiveAt?: string;
  currentSessionId?: string;
  
  // Audit
  emailVerifiedAt?: string;
  phoneVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  deletedAt?: string;
}

/** User session */
export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken?: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
  location?: SessionLocation;
  createdAt: string;
  expiresAt: string;
  lastActivityAt: string;
  isCurrentSession: boolean;
}

/** Device information */
export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  deviceId?: string;
}

/** Session location */
export interface SessionLocation {
  city?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
}

/** User invitation */
export interface UserInvitation {
  id: string;
  email: string;
  roleIds: string[];
  departmentId?: string;
  invitedById: string;
  invitedByName: string;
  status: InvitationStatus;
  token: string;
  message?: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

/** Password reset request */
export interface PasswordResetRequest {
  id: string;
  userId: string;
  userEmail: string;
  token: string;
  status: PasswordResetStatus;
  requestedAt: string;
  requestedIp?: string;
  expiresAt: string;
  completedAt?: string;
}

/** Two-factor setup */
export interface TwoFactorSetup {
  userId: string;
  method: TwoFactorMethod;
  secret?: string;
  qrCode?: string;
  backupCodes?: string[];
  verifiedAt?: string;
}

/** User activity log */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

/** Create user payload */
export interface CreateUserPayload {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  password?: string;
  phone?: string;
  roleIds: string[];
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  sendInvitation?: boolean;
}

/** Update user payload */
export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: UserAddress;
  bio?: string;
  timezone?: string;
  locale?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
}

/** Update user roles payload */
export interface UpdateUserRolesPayload {
  userId: string;
  roleIds: string[];
}

/** Update user permissions payload */
export interface UpdateUserPermissionsPayload {
  userId: string;
  permissions: Permission[];
}

/** Change password payload */
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/** Reset password payload (admin) */
export interface AdminResetPasswordPayload {
  userId: string;
  newPassword?: string;
  sendEmail: boolean;
  forceChangeOnLogin: boolean;
}

/** Invite user payload */
export interface InviteUserPayload {
  email: string;
  roleIds: string[];
  departmentId?: string;
  message?: string;
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/** User filters */
export interface UserFilters {
  search?: string;
  status?: UserStatus;
  roleId?: string;
  departmentId?: string;
  twoFactorEnabled?: boolean;
  createdFrom?: string;
  createdTo?: string;
  lastLoginFrom?: string;
  lastLoginTo?: string;
}

/** User sort options */
export interface UserSortOptions {
  field: 'fullName' | 'email' | 'createdAt' | 'lastLoginAt' | 'status';
  direction: 'asc' | 'desc';
}

/** User query params */
export interface UserQueryParams {
  filters?: UserFilters;
  sort?: UserSortOptions;
  page?: number;
  limit?: number;
}

// ============================================================================
// STATE TYPES
// ============================================================================

/** User management state */
export interface UserManagementState {
  // Data
  users: User[];
  selectedUser: User | null;
  sessions: UserSession[];
  invitations: UserInvitation[];
  activities: UserActivity[];
  
  // Filters & Pagination
  filters: UserFilters;
  sort: UserSortOptions;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  
  // Modals
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteModal: boolean;
  showRolesModal: boolean;
  showPermissionsModal: boolean;
  showResetPasswordModal: boolean;
  showTwoFactorModal: boolean;
  showSessionsModal: boolean;
  showInviteModal: boolean;
}

/** User management actions */
export interface UserManagementActions {
  // CRUD
  fetchUsers: (params?: UserQueryParams) => Promise<void>;
  createUser: (payload: CreateUserPayload) => Promise<User>;
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  
  // Selection
  selectUser: (user: User | null) => void;
  
  // Roles & Permissions
  updateUserRoles: (payload: UpdateUserRolesPayload) => Promise<void>;
  updateUserPermissions: (payload: UpdateUserPermissionsPayload) => Promise<void>;
  
  // Status Management
  activateUser: (id: string) => Promise<void>;
  deactivateUser: (id: string) => Promise<void>;
  suspendUser: (id: string, reason?: string) => Promise<void>;
  unlockUser: (id: string) => Promise<void>;
  
  // Password Management
  resetPassword: (payload: AdminResetPasswordPayload) => Promise<void>;
  forcePasswordChange: (userId: string) => Promise<void>;
  
  // Two-Factor
  enableTwoFactor: (userId: string, method: TwoFactorMethod) => Promise<TwoFactorSetup>;
  disableTwoFactor: (userId: string) => Promise<void>;
  
  // Sessions
  fetchUserSessions: (userId: string) => Promise<void>;
  terminateSession: (sessionId: string) => Promise<void>;
  terminateAllSessions: (userId: string) => Promise<void>;
  
  // Invitations
  inviteUser: (payload: InviteUserPayload) => Promise<UserInvitation>;
  resendInvitation: (invitationId: string) => Promise<void>;
  cancelInvitation: (invitationId: string) => Promise<void>;
  
  // Activities
  fetchUserActivities: (userId: string) => Promise<void>;
  
  // Filters & Sort
  setFilters: (filters: Partial<UserFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: UserSortOptions) => void;
  setPage: (page: number) => void;
  
  // Modals
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openEditModal: (user: User) => void;
  closeEditModal: () => void;
  openDeleteModal: (user: User) => void;
  closeDeleteModal: () => void;
  openRolesModal: (user: User) => void;
  closeRolesModal: () => void;
  openPermissionsModal: (user: User) => void;
  closePermissionsModal: () => void;
  openResetPasswordModal: (user: User) => void;
  closeResetPasswordModal: () => void;
  openTwoFactorModal: (user: User) => void;
  closeTwoFactorModal: () => void;
  openSessionsModal: (user: User) => void;
  closeSessionsModal: () => void;
  openInviteModal: () => void;
  closeInviteModal: () => void;
  
  // Reset
  reset: () => void;
}

export type UserManagementStore = UserManagementState & UserManagementActions;

// ============================================================================
// USER MANAGEMENT MODULE - API SERVICE
// GoldenEnergy HOME Platform - User API Integration
// ============================================================================

import { BaseAPI } from '@/core/api/base-api';
import {
  User,
  UserSession,
  UserInvitation,
  UserActivity,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRolesPayload,
  UpdateUserPermissionsPayload,
  AdminResetPasswordPayload,
  InviteUserPayload,
  TwoFactorSetup,
  TwoFactorMethod,
} from './types';

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class UserApiService extends BaseAPI {
  private readonly basePath = '/users';

  // ====================================================================
  // CRUD OPERATIONS
  // ====================================================================

  /**
   * Get paginated list of users
   */
  async getUsers(params?: UserQueryParams) {
    return this.get<{
      data: User[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(this.basePath, { params: params as unknown as Record<string, unknown> });
  }

  /**
   * Get single user by ID
   */
  async getUser(id: string) {
    return this.get<User>(`${this.basePath}/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(payload: CreateUserPayload) {
    return this.post<User>(this.basePath, payload);
  }

  /**
   * Update user
   */
  async updateUser(id: string, payload: UpdateUserPayload) {
    return this.patch<User>(`${this.basePath}/${id}`, payload);
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(id: string) {
    return this.delete<void>(`${this.basePath}/${id}`);
  }

  // ====================================================================
  // ROLES & PERMISSIONS
  // ====================================================================

  /**
   * Update user roles
   */
  async updateUserRoles(userId: string, roleIds: string[]) {
    return this.put<void>(`${this.basePath}/${userId}/roles`, { roleIds });
  }

  /**
   * Update user permissions
   */
  async updateUserPermissions(userId: string, payload: UpdateUserPermissionsPayload) {
    return this.put<void>(`${this.basePath}/${userId}/permissions`, payload);
  }

  /**
   * Get user's effective permissions (computed from roles + direct)
   */
  async getUserPermissions(userId: string) {
    return this.get<{ permissions: string[] }>(`${this.basePath}/${userId}/permissions`);
  }

  // ====================================================================
  // STATUS MANAGEMENT
  // ====================================================================

  /**
   * Activate user
   */
  async activateUser(id: string) {
    return this.post<void>(`${this.basePath}/${id}/activate`);
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string) {
    return this.post<void>(`${this.basePath}/${id}/deactivate`);
  }

  /**
   * Suspend user
   */
  async suspendUser(id: string, reason?: string) {
    return this.post<void>(`${this.basePath}/${id}/suspend`, { reason });
  }

  /**
   * Unlock user account
   */
  async unlockUser(id: string) {
    return this.post<void>(`${this.basePath}/${id}/unlock`);
  }

  // ====================================================================
  // PASSWORD MANAGEMENT
  // ====================================================================

  /**
   * Admin reset password
   */
  async resetPassword(payload: AdminResetPasswordPayload) {
    return this.post<void>(`${this.basePath}/${payload.userId}/reset-password`, payload);
  }

  /**
   * Force password change on next login
   */
  async forcePasswordChange(userId: string) {
    return this.post<void>(`${this.basePath}/${userId}/force-password-change`);
  }

  /**
   * Request password reset link (for user)
   */
  async requestPasswordReset(email: string) {
    return this.post<void>('/auth/forgot-password', { email });
  }

  // ====================================================================
  // TWO-FACTOR AUTHENTICATION
  // ====================================================================

  /**
   * Initialize 2FA setup
   */
  async initTwoFactor(userId: string, method: TwoFactorMethod) {
    return this.post<TwoFactorSetup>(`${this.basePath}/${userId}/2fa/init`, { method });
  }

  /**
   * Verify and enable 2FA
   */
  async verifyTwoFactor(userId: string, code: string) {
    return this.post<{ backupCodes: string[] }>(`${this.basePath}/${userId}/2fa/verify`, { code });
  }

  /**
   * Disable 2FA
   */
  async disableTwoFactor(userId: string, code: string) {
    return this.post<void>(`${this.basePath}/${userId}/2fa/disable`, { code });
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string) {
    return this.post<{ backupCodes: string[] }>(`${this.basePath}/${userId}/2fa/backup-codes`);
  }

  // ====================================================================
  // SESSIONS
  // ====================================================================

  /**
   * Get user sessions
   */
  async getUserSessions(userId: string) {
    return this.get<UserSession[]>(`${this.basePath}/${userId}/sessions`);
  }

  /**
   * Terminate a specific session
   */
  async terminateSession(userId: string, sessionId: string) {
    return this.delete<void>(`${this.basePath}/${userId}/sessions/${sessionId}`);
  }

  /**
   * Terminate all sessions except current
   */
  async terminateAllSessions(userId: string) {
    return this.post<void>(`${this.basePath}/${userId}/sessions/terminate-all`);
  }

  // ====================================================================
  // INVITATIONS
  // ====================================================================

  /**
   * Get all invitations
   */
  async getInvitations() {
    return this.get<UserInvitation[]>('/invitations');
  }

  /**
   * Send user invitation
   */
  async inviteUser(payload: InviteUserPayload) {
    return this.post<UserInvitation>('/invitations', payload);
  }

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId: string) {
    return this.post<void>(`/invitations/${invitationId}/resend`);
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(invitationId: string) {
    return this.delete<void>(`/invitations/${invitationId}`);
  }

  /**
   * Accept invitation (for invited user)
   */
  async acceptInvitation(token: string, password: string) {
    return this.post<User>('/invitations/accept', { token, password });
  }

  // ====================================================================
  // ACTIVITIES
  // ====================================================================

  /**
   * Get user activity log
   */
  async getUserActivities(userId: string, params?: { page?: number; limit?: number }) {
    return this.get<{
      data: UserActivity[];
      pagination: { page: number; limit: number; total: number };
    }>(`${this.basePath}/${userId}/activities`, { params });
  }

  // ====================================================================
  // BULK OPERATIONS
  // ====================================================================

  /**
   * Bulk activate users
   */
  async bulkActivate(userIds: string[]) {
    return this.post<void>(`${this.basePath}/bulk/activate`, { userIds });
  }

  /**
   * Bulk deactivate users
   */
  async bulkDeactivate(userIds: string[]) {
    return this.post<void>(`${this.basePath}/bulk/deactivate`, { userIds });
  }

  /**
   * Bulk delete users
   */
  async bulkDelete(userIds: string[]) {
    return this.post<void>(`${this.basePath}/bulk/delete`, { userIds });
  }

  /**
   * Bulk assign role
   */
  async bulkAssignRole(userIds: string[], roleId: string) {
    return this.post<void>(`${this.basePath}/bulk/assign-role`, { userIds, roleId });
  }

  // ====================================================================
  // IMPORT / EXPORT
  // ====================================================================

  /**
   * Export users to CSV/Excel
   */
  async exportUsers(format: 'csv' | 'xlsx', filters?: UserQueryParams['filters']) {
    return this.get<Blob>(`${this.basePath}/export`, {
      params: { format, ...filters },
      responseType: 'blob',
    });
  }

  /**
   * Import users from CSV/Excel
   */
  async importUsers(file: File, options?: { sendInvitations?: boolean }) {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.sendInvitations) {
      formData.append('sendInvitations', 'true');
    }
    return this.post<{
      imported: number;
      failed: number;
      errors: Array<{ row: number; error: string }>;
    }>(`${this.basePath}/import`, formData);
  }

  /**
   * Get import template
   */
  async getImportTemplate() {
    return this.get<Blob>(`${this.basePath}/import/template`, {
      responseType: 'blob',
    });
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const userApi = new UserApiService();

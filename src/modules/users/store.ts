// ============================================================================
// USER MANAGEMENT MODULE - ZUSTAND STORE
// GoldenEnergy HOME Platform - User & Permission Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';

import {
  UserManagementStore,
  UserManagementState,
  User,
  UserSession,
  UserInvitation,
  UserActivity,
  UserFilters,
  UserSortOptions,
  UserQueryParams,
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserRolesPayload,
  UpdateUserPermissionsPayload,
  AdminResetPasswordPayload,
  InviteUserPayload,
  TwoFactorSetup,
  TwoFactorMethod,
  UserStatus,
  InvitationStatus,
} from './types';

// Import core systems for integration
// import { auditLogger } from '@/core/audit-log';
// import { notificationBus } from '@/core/notification-system';
// import { rbacChecker } from '@/core/rbac';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UserManagementState = {
  users: [],
  selectedUser: null,
  sessions: [],
  invitations: [],
  activities: [],
  
  filters: {},
  sort: { field: 'createdAt', direction: 'desc' },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showRolesModal: false,
  showPermissionsModal: false,
  showResetPasswordModal: false,
  showTwoFactorModal: false,
  showSessionsModal: false,
  showInviteModal: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useUserManagementStore = create<UserManagementStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ====================================================================
        // CRUD OPERATIONS
        // ====================================================================

        fetchUsers: async (params?: UserQueryParams) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            // TODO: Replace with actual API call
            // const response = await userApi.getUsers(params);
            // Simulated response
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            set((state: WritableDraft<UserManagementState>) => {
              // state.users = response.data;
              // state.pagination = response.pagination;
              state.isLoading = false;
            });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to fetch users';
            });
          }
        },

        createUser: async (payload: CreateUserPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isCreating = true;
            state.error = null;
          });

          try {
            // TODO: Replace with actual API call
            // const user = await userApi.createUser(payload);
            
            const newUser: User = {
              id: `user_${Date.now()}`,
              email: payload.email,
              username: payload.username || payload.email.split('@')[0],
              firstName: payload.firstName,
              lastName: payload.lastName,
              fullName: `${payload.firstName} ${payload.lastName}`,
              phone: payload.phone,
              status: payload.sendInvitation ? UserStatus.PENDING : UserStatus.ACTIVE,
              roleIds: payload.roleIds,
              roles: [],
              permissions: [],
              departmentId: payload.departmentId,
              positionId: payload.positionId,
              managerId: payload.managerId,
              twoFactorEnabled: false,
              twoFactorMethod: TwoFactorMethod.NONE,
              failedLoginAttempts: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            set((state: WritableDraft<UserManagementState>) => {
              state.users.unshift(newUser as WritableDraft<User>);
              state.isCreating = false;
              state.showCreateModal = false;
            });

            // Log to audit
            // auditLogger.log({
            //   action: 'CREATE',
            //   module: 'USERS',
            //   resourceType: 'User',
            //   resourceId: newUser.id,
            //   after: newUser,
            // });

            // Send notification if invitation
            // if (payload.sendInvitation) {
            //   notificationBus.emit('user.invited', { user: newUser });
            // }

            return newUser;
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isCreating = false;
              state.error = error instanceof Error ? error.message : 'Failed to create user';
            });
            throw error;
          }
        },

        updateUser: async (id: string, payload: UpdateUserPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isUpdating = true;
            state.error = null;
          });

          try {
            const currentUser = get().users.find((u) => u.id === id);
            
            set((state: WritableDraft<UserManagementState>) => {
              const index = state.users.findIndex((u) => u.id === id);
              if (index !== -1) {
                const updatedUser = {
                  ...state.users[index],
                  ...payload,
                  fullName: payload.firstName && payload.lastName
                    ? `${payload.firstName} ${payload.lastName}`
                    : state.users[index].fullName,
                  updatedAt: new Date().toISOString(),
                };
                state.users[index] = updatedUser as WritableDraft<User>;
                
                if (state.selectedUser?.id === id) {
                  state.selectedUser = updatedUser as WritableDraft<User>;
                }
              }
              state.isUpdating = false;
              state.showEditModal = false;
            });

            // auditLogger.log({
            //   action: 'UPDATE',
            //   module: 'USERS',
            //   resourceType: 'User',
            //   resourceId: id,
            //   before: currentUser,
            //   after: get().users.find((u) => u.id === id),
            // });

            return get().users.find((u) => u.id === id)!;
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isUpdating = false;
              state.error = error instanceof Error ? error.message : 'Failed to update user';
            });
            throw error;
          }
        },

        deleteUser: async (id: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isDeleting = true;
            state.error = null;
          });

          try {
            const deletedUser = get().users.find((u) => u.id === id);
            
            set((state: WritableDraft<UserManagementState>) => {
              state.users = state.users.filter((u) => u.id !== id);
              if (state.selectedUser?.id === id) {
                state.selectedUser = null;
              }
              state.isDeleting = false;
              state.showDeleteModal = false;
            });

            // auditLogger.log({
            //   action: 'DELETE',
            //   module: 'USERS',
            //   resourceType: 'User',
            //   resourceId: id,
            //   before: deletedUser,
            // });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isDeleting = false;
              state.error = error instanceof Error ? error.message : 'Failed to delete user';
            });
            throw error;
          }
        },

        // ====================================================================
        // SELECTION
        // ====================================================================

        selectUser: (user: User | null) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.selectedUser = user as WritableDraft<User> | null;
          });
        },

        // ====================================================================
        // ROLES & PERMISSIONS
        // ====================================================================

        updateUserRoles: async (payload: UpdateUserRolesPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isUpdating = true;
          });

          try {
            set((state: WritableDraft<UserManagementState>) => {
              const index = state.users.findIndex((u) => u.id === payload.userId);
              if (index !== -1) {
                state.users[index].roleIds = payload.roleIds;
                state.users[index].updatedAt = new Date().toISOString();
              }
              state.isUpdating = false;
              state.showRolesModal = false;
            });

            // auditLogger.log({
            //   action: 'PERMISSION_CHANGE',
            //   module: 'USERS',
            //   resourceType: 'UserRoles',
            //   resourceId: payload.userId,
            //   details: { roleIds: payload.roleIds },
            // });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isUpdating = false;
              state.error = error instanceof Error ? error.message : 'Failed to update roles';
            });
            throw error;
          }
        },

        updateUserPermissions: async (payload: UpdateUserPermissionsPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isUpdating = true;
          });

          try {
            set((state: WritableDraft<UserManagementState>) => {
              const index = state.users.findIndex((u) => u.id === payload.userId);
              if (index !== -1) {
                state.users[index].permissions = payload.permissions as WritableDraft<typeof payload.permissions>;
                state.users[index].updatedAt = new Date().toISOString();
              }
              state.isUpdating = false;
              state.showPermissionsModal = false;
            });

            // auditLogger.log({
            //   action: 'PERMISSION_CHANGE',
            //   module: 'USERS',
            //   resourceType: 'UserPermissions',
            //   resourceId: payload.userId,
            //   details: { permissions: payload.permissions },
            // });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isUpdating = false;
              state.error = error instanceof Error ? error.message : 'Failed to update permissions';
            });
            throw error;
          }
        },

        // ====================================================================
        // STATUS MANAGEMENT
        // ====================================================================

        activateUser: async (id: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === id);
            if (index !== -1) {
              state.users[index].status = UserStatus.ACTIVE;
              state.users[index].updatedAt = new Date().toISOString();
            }
          });

          // notificationBus.emit('user.activated', { userId: id });
        },

        deactivateUser: async (id: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === id);
            if (index !== -1) {
              state.users[index].status = UserStatus.INACTIVE;
              state.users[index].updatedAt = new Date().toISOString();
            }
          });

          // notificationBus.emit('user.deactivated', { userId: id });
        },

        suspendUser: async (id: string, reason?: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === id);
            if (index !== -1) {
              state.users[index].status = UserStatus.SUSPENDED;
              state.users[index].updatedAt = new Date().toISOString();
            }
          });

          // auditLogger.log({
          //   action: 'UPDATE',
          //   module: 'USERS',
          //   resourceType: 'UserStatus',
          //   resourceId: id,
          //   details: { status: 'SUSPENDED', reason },
          // });
        },

        unlockUser: async (id: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === id);
            if (index !== -1) {
              state.users[index].status = UserStatus.ACTIVE;
              state.users[index].failedLoginAttempts = 0;
              state.users[index].lockedUntil = undefined;
              state.users[index].updatedAt = new Date().toISOString();
            }
          });
        },

        // ====================================================================
        // PASSWORD MANAGEMENT
        // ====================================================================

        resetPassword: async (payload: AdminResetPasswordPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isUpdating = true;
          });

          try {
            // TODO: API call to reset password
            
            set((state: WritableDraft<UserManagementState>) => {
              const index = state.users.findIndex((u) => u.id === payload.userId);
              if (index !== -1) {
                state.users[index].lastPasswordChange = new Date().toISOString();
                if (payload.forceChangeOnLogin) {
                  // Mark password as expired
                  state.users[index].passwordExpiresAt = new Date().toISOString();
                }
              }
              state.isUpdating = false;
              state.showResetPasswordModal = false;
            });

            // if (payload.sendEmail) {
            //   notificationBus.emit('password.reset', { userId: payload.userId });
            // }

            // auditLogger.log({
            //   action: 'UPDATE',
            //   module: 'USERS',
            //   resourceType: 'Password',
            //   resourceId: payload.userId,
            //   details: { forceChangeOnLogin: payload.forceChangeOnLogin },
            // });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isUpdating = false;
              state.error = error instanceof Error ? error.message : 'Failed to reset password';
            });
            throw error;
          }
        },

        forcePasswordChange: async (userId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === userId);
            if (index !== -1) {
              state.users[index].passwordExpiresAt = new Date().toISOString();
            }
          });
        },

        // ====================================================================
        // TWO-FACTOR AUTHENTICATION
        // ====================================================================

        enableTwoFactor: async (userId: string, method: TwoFactorMethod) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isUpdating = true;
          });

          try {
            // TODO: API call to setup 2FA
            const setup: TwoFactorSetup = {
              userId,
              method,
              secret: 'GENERATED_SECRET',
              qrCode: 'data:image/png;base64,...',
              backupCodes: ['CODE1', 'CODE2', 'CODE3', 'CODE4', 'CODE5'],
            };

            set((state: WritableDraft<UserManagementState>) => {
              const index = state.users.findIndex((u) => u.id === userId);
              if (index !== -1) {
                state.users[index].twoFactorEnabled = true;
                state.users[index].twoFactorMethod = method;
              }
              state.isUpdating = false;
            });

            // notificationBus.emit('2fa.enabled', { userId, method });

            // auditLogger.log({
            //   action: 'UPDATE',
            //   module: 'USERS',
            //   resourceType: 'TwoFactor',
            //   resourceId: userId,
            //   details: { method, enabled: true },
            // });

            return setup;
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isUpdating = false;
              state.error = error instanceof Error ? error.message : 'Failed to enable 2FA';
            });
            throw error;
          }
        },

        disableTwoFactor: async (userId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.users.findIndex((u) => u.id === userId);
            if (index !== -1) {
              state.users[index].twoFactorEnabled = false;
              state.users[index].twoFactorMethod = TwoFactorMethod.NONE;
            }
          });

          // notificationBus.emit('2fa.disabled', { userId });

          // auditLogger.log({
          //   action: 'UPDATE',
          //   module: 'USERS',
          //   resourceType: 'TwoFactor',
          //   resourceId: userId,
          //   details: { enabled: false },
          // });
        },

        // ====================================================================
        // SESSIONS
        // ====================================================================

        fetchUserSessions: async (userId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isLoading = true;
          });

          try {
            // TODO: API call to fetch sessions
            await new Promise((resolve) => setTimeout(resolve, 300));

            set((state: WritableDraft<UserManagementState>) => {
              // state.sessions = response.data;
              state.isLoading = false;
            });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isLoading = false;
              state.error = error instanceof Error ? error.message : 'Failed to fetch sessions';
            });
          }
        },

        terminateSession: async (sessionId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.sessions = state.sessions.filter((s) => s.id !== sessionId);
          });

          // auditLogger.log({
          //   action: 'DELETE',
          //   module: 'USERS',
          //   resourceType: 'Session',
          //   resourceId: sessionId,
          // });
        },

        terminateAllSessions: async (userId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.sessions = state.sessions.filter((s) => s.userId !== userId || s.isCurrentSession);
          });

          // auditLogger.log({
          //   action: 'DELETE',
          //   module: 'USERS',
          //   resourceType: 'AllSessions',
          //   resourceId: userId,
          // });
        },

        // ====================================================================
        // INVITATIONS
        // ====================================================================

        inviteUser: async (payload: InviteUserPayload) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isCreating = true;
          });

          try {
            const invitation: UserInvitation = {
              id: `inv_${Date.now()}`,
              email: payload.email,
              roleIds: payload.roleIds,
              departmentId: payload.departmentId,
              invitedById: 'current_user_id',
              invitedByName: 'Current User',
              status: InvitationStatus.PENDING,
              token: `token_${Date.now()}`,
              message: payload.message,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString(),
            };

            set((state: WritableDraft<UserManagementState>) => {
              state.invitations.unshift(invitation as WritableDraft<UserInvitation>);
              state.isCreating = false;
              state.showInviteModal = false;
            });

            // notificationBus.emit('user.invited', { invitation });

            return invitation;
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isCreating = false;
              state.error = error instanceof Error ? error.message : 'Failed to send invitation';
            });
            throw error;
          }
        },

        resendInvitation: async (invitationId: string) => {
          // TODO: API call to resend invitation
          // notificationBus.emit('invitation.resent', { invitationId });
        },

        cancelInvitation: async (invitationId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            const index = state.invitations.findIndex((i) => i.id === invitationId);
            if (index !== -1) {
              state.invitations[index].status = InvitationStatus.CANCELLED;
            }
          });
        },

        // ====================================================================
        // ACTIVITIES
        // ====================================================================

        fetchUserActivities: async (userId: string) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.isLoading = true;
          });

          try {
            // TODO: API call
            await new Promise((resolve) => setTimeout(resolve, 300));

            set((state: WritableDraft<UserManagementState>) => {
              state.isLoading = false;
            });
          } catch (error) {
            set((state: WritableDraft<UserManagementState>) => {
              state.isLoading = false;
            });
          }
        },

        // ====================================================================
        // FILTERS & SORT
        // ====================================================================

        setFilters: (filters: Partial<UserFilters>) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.filters = { ...state.filters, ...filters };
            state.pagination.page = 1;
          });
        },

        clearFilters: () => {
          set((state: WritableDraft<UserManagementState>) => {
            state.filters = {};
            state.pagination.page = 1;
          });
        },

        setSort: (sort: UserSortOptions) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.sort = sort;
          });
        },

        setPage: (page: number) => {
          set((state: WritableDraft<UserManagementState>) => {
            state.pagination.page = page;
          });
        },

        // ====================================================================
        // MODALS
        // ====================================================================

        openCreateModal: () => set((state: WritableDraft<UserManagementState>) => { state.showCreateModal = true; }),
        closeCreateModal: () => set((state: WritableDraft<UserManagementState>) => { state.showCreateModal = false; }),
        
        openEditModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showEditModal = true;
        }),
        closeEditModal: () => set((state: WritableDraft<UserManagementState>) => { state.showEditModal = false; }),
        
        openDeleteModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showDeleteModal = true;
        }),
        closeDeleteModal: () => set((state: WritableDraft<UserManagementState>) => { state.showDeleteModal = false; }),
        
        openRolesModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showRolesModal = true;
        }),
        closeRolesModal: () => set((state: WritableDraft<UserManagementState>) => { state.showRolesModal = false; }),
        
        openPermissionsModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showPermissionsModal = true;
        }),
        closePermissionsModal: () => set((state: WritableDraft<UserManagementState>) => { state.showPermissionsModal = false; }),
        
        openResetPasswordModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showResetPasswordModal = true;
        }),
        closeResetPasswordModal: () => set((state: WritableDraft<UserManagementState>) => { state.showResetPasswordModal = false; }),
        
        openTwoFactorModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showTwoFactorModal = true;
        }),
        closeTwoFactorModal: () => set((state: WritableDraft<UserManagementState>) => { state.showTwoFactorModal = false; }),
        
        openSessionsModal: (user: User) => set((state: WritableDraft<UserManagementState>) => {
          state.selectedUser = user as WritableDraft<User>;
          state.showSessionsModal = true;
        }),
        closeSessionsModal: () => set((state: WritableDraft<UserManagementState>) => { state.showSessionsModal = false; }),
        
        openInviteModal: () => set((state: WritableDraft<UserManagementState>) => { state.showInviteModal = true; }),
        closeInviteModal: () => set((state: WritableDraft<UserManagementState>) => { state.showInviteModal = false; }),

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => set(() => initialState),
      })),
      {
        name: 'home-user-management-store',
        partialize: (state) => ({
          filters: state.filters,
          sort: state.sort,
        }),
      }
    ),
    { name: 'UserManagementStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Filter users based on current filters */
export const selectFilteredUsers = (state: UserManagementState): User[] => {
  const { users, filters, sort } = state;
  
  let filtered = [...users];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(filters.search!))
    );
  }

  // Status filter
  if (filters.status) {
    filtered = filtered.filter((user) => user.status === filters.status);
  }

  // Role filter
  if (filters.roleId) {
    filtered = filtered.filter((user) => user.roleIds.includes(filters.roleId!));
  }

  // Department filter
  if (filters.departmentId) {
    filtered = filtered.filter((user) => user.departmentId === filters.departmentId);
  }

  // 2FA filter
  if (filters.twoFactorEnabled !== undefined) {
    filtered = filtered.filter((user) => user.twoFactorEnabled === filters.twoFactorEnabled);
  }

  // Sort
  filtered.sort((a, b) => {
    let comparison = 0;
    switch (sort.field) {
      case 'fullName':
        comparison = a.fullName.localeCompare(b.fullName);
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'lastLoginAt':
        comparison = (a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0) -
                    (b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0);
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    return sort.direction === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

/** Get user stats */
export const selectUserStats = (state: UserManagementState) => {
  const { users } = state;
  
  return {
    total: users.length,
    active: users.filter((u) => u.status === UserStatus.ACTIVE).length,
    pending: users.filter((u) => u.status === UserStatus.PENDING).length,
    suspended: users.filter((u) => u.status === UserStatus.SUSPENDED).length,
    locked: users.filter((u) => u.status === UserStatus.LOCKED).length,
    with2FA: users.filter((u) => u.twoFactorEnabled).length,
  };
};

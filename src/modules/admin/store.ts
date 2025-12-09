// ============================================================================
// ADMINHUB MODULE - ZUSTAND STORE
// GoldenEnergy HOME - Enterprise Admin Hub State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Draft } from 'immer';
type WritableDraft<T> = Draft<T>;
import {
  AdminStore,
  AdminState,
  User,
  Role,
  AuditLog,
  SystemSetting,
  Backup,
  SystemStats,
  UserFilters,
  AuditFilters,
  UserStatus,
  UserRole,
  AuditAction,
  ModuleType,
} from './types';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: AdminState = {
  users: [],
  roles: [],
  auditLogs: [],
  settings: [],
  backups: [],
  selectedUser: null,
  selectedRole: null,
  selectedAuditLog: null,
  userFilters: {},
  auditFilters: {},
  isLoading: false,
  error: null,
  systemStats: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      immer((set) => ({
        ...initialState,

        // ====================================================================
        // USERS ACTIONS
        // ====================================================================

        setUsers: (users: User[]) =>
          set((state: WritableDraft<AdminState>) => {
            state.users = users as WritableDraft<User[]>;
          }),

        addUser: (user: User) =>
          set((state: WritableDraft<AdminState>) => {
            state.users.unshift(user as WritableDraft<User>);
          }),

        updateUser: (id: string, data: Partial<User>) =>
          set((state: WritableDraft<AdminState>) => {
            const index = state.users.findIndex((u: Draft<User>) => u.id === id);
            if (index !== -1) {
              Object.assign(state.users[index], data);
            }
            if (state.selectedUser?.id === id) {
              Object.assign(state.selectedUser, data);
            }
          }),

        deleteUser: (id: string) =>
          set((state: WritableDraft<AdminState>) => {
            state.users = state.users.filter((u: Draft<User>) => u.id !== id);
            if (state.selectedUser?.id === id) {
              state.selectedUser = null;
            }
          }),

        selectUser: (user: User | null) =>
          set((state: WritableDraft<AdminState>) => {
            state.selectedUser = user as WritableDraft<User> | null;
          }),

        setUserFilters: (filters: Partial<UserFilters>) =>
          set((state: WritableDraft<AdminState>) => {
            state.userFilters = { ...state.userFilters, ...filters };
          }),

        clearUserFilters: () =>
          set((state: WritableDraft<AdminState>) => {
            state.userFilters = {};
          }),

        // ====================================================================
        // ROLES ACTIONS
        // ====================================================================

        setRoles: (roles: Role[]) =>
          set((state: WritableDraft<AdminState>) => {
            state.roles = roles as WritableDraft<Role[]>;
          }),

        addRole: (role: Role) =>
          set((state: WritableDraft<AdminState>) => {
            state.roles.unshift(role as WritableDraft<Role>);
          }),

        updateRole: (id: string, data: Partial<Role>) =>
          set((state: WritableDraft<AdminState>) => {
            const index = state.roles.findIndex((r) => r.id === id);
            if (index !== -1) {
              Object.assign(state.roles[index], data);
            }
            if (state.selectedRole?.id === id) {
              Object.assign(state.selectedRole, data);
            }
          }),

        deleteRole: (id: string) =>
          set((state: WritableDraft<AdminState>) => {
            state.roles = state.roles.filter((r) => r.id !== id);
            if (state.selectedRole?.id === id) {
              state.selectedRole = null;
            }
          }),

        selectRole: (role: Role | null) =>
          set((state: WritableDraft<AdminState>) => {
            state.selectedRole = role as WritableDraft<Role> | null;
          }),

        // ====================================================================
        // AUDIT LOGS ACTIONS
        // ====================================================================

        setAuditLogs: (logs: AuditLog[]) =>
          set((state: WritableDraft<AdminState>) => {
            state.auditLogs = logs as WritableDraft<AuditLog[]>;
          }),

        addAuditLog: (log: AuditLog) =>
          set((state: WritableDraft<AdminState>) => {
            state.auditLogs.unshift(log as WritableDraft<AuditLog>);
          }),

        selectAuditLog: (log: AuditLog | null) =>
          set((state: WritableDraft<AdminState>) => {
            state.selectedAuditLog = log as WritableDraft<AuditLog> | null;
          }),

        setAuditFilters: (filters: Partial<AuditFilters>) =>
          set((state: WritableDraft<AdminState>) => {
            state.auditFilters = { ...state.auditFilters, ...filters };
          }),

        clearAuditFilters: () =>
          set((state: WritableDraft<AdminState>) => {
            state.auditFilters = {};
          }),

        // ====================================================================
        // SETTINGS ACTIONS
        // ====================================================================

        setSettings: (settings: SystemSetting[]) =>
          set((state: WritableDraft<AdminState>) => {
            state.settings = settings as WritableDraft<SystemSetting[]>;
          }),

        updateSetting: (id: string, value: SystemSetting['value']) =>
          set((state: WritableDraft<AdminState>) => {
            const index = state.settings.findIndex((s) => s.id === id);
            if (index !== -1) {
              state.settings[index].value = value as WritableDraft<typeof value>;
              state.settings[index].updatedAt = new Date().toISOString();
            }
          }),

        // ====================================================================
        // BACKUPS ACTIONS
        // ====================================================================

        setBackups: (backups: Backup[]) =>
          set((state: WritableDraft<AdminState>) => {
            state.backups = backups as WritableDraft<Backup[]>;
          }),

        addBackup: (backup: Backup) =>
          set((state: WritableDraft<AdminState>) => {
            state.backups.unshift(backup as WritableDraft<Backup>);
          }),

        updateBackup: (id: string, data: Partial<Backup>) =>
          set((state: WritableDraft<AdminState>) => {
            const index = state.backups.findIndex((b) => b.id === id);
            if (index !== -1) {
              Object.assign(state.backups[index], data);
            }
          }),

        // ====================================================================
        // STATS ACTIONS
        // ====================================================================

        setSystemStats: (stats: SystemStats) =>
          set((state: WritableDraft<AdminState>) => {
            state.systemStats = stats;
          }),

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        setLoading: (loading: boolean) =>
          set((state: WritableDraft<AdminState>) => {
            state.isLoading = loading;
          }),

        setError: (error: string | null) =>
          set((state: WritableDraft<AdminState>) => {
            state.error = error;
          }),

        reset: () =>
          set((state: WritableDraft<AdminState>) => {
            Object.assign(state, initialState);
          }),
      })),
      {
        name: 'goldenenergy-admin-store',
        partialize: (state) => ({
          userFilters: state.userFilters,
          auditFilters: state.auditFilters,
        }),
      }
    ),
    { name: 'AdminStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Filter users based on current filters */
export const selectFilteredUsers = (state: AdminState): User[] => {
  const { users, userFilters } = state;
  
  return users.filter((user) => {
    // Search filter
    if (userFilters.search) {
      const searchLower = userFilters.search.toLowerCase();
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        (user.phone && user.phone.includes(userFilters.search));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (userFilters.status && user.status !== userFilters.status) {
      return false;
    }

    // Role filter
    if (userFilters.role && user.role !== userFilters.role) {
      return false;
    }

    // Department filter
    if (userFilters.departmentId && user.departmentId !== userFilters.departmentId) {
      return false;
    }

    // Date filters
    if (userFilters.dateFrom) {
      const createdDate = new Date(user.createdAt);
      const fromDate = new Date(userFilters.dateFrom);
      if (createdDate < fromDate) return false;
    }

    if (userFilters.dateTo) {
      const createdDate = new Date(user.createdAt);
      const toDate = new Date(userFilters.dateTo);
      if (createdDate > toDate) return false;
    }

    return true;
  });
};

/** Filter audit logs based on current filters */
export const selectFilteredAuditLogs = (state: AdminState): AuditLog[] => {
  const { auditLogs, auditFilters } = state;
  
  return auditLogs.filter((log) => {
    // Search filter
    if (auditFilters.search) {
      const searchLower = auditFilters.search.toLowerCase();
      const matchesSearch =
        log.userName.toLowerCase().includes(searchLower) ||
        log.userEmail.toLowerCase().includes(searchLower) ||
        (log.resourceName && log.resourceName.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // User filter
    if (auditFilters.userId && log.userId !== auditFilters.userId) {
      return false;
    }

    // Action filter
    if (auditFilters.action && log.action !== auditFilters.action) {
      return false;
    }

    // Module filter
    if (auditFilters.module && log.module !== auditFilters.module) {
      return false;
    }

    // Date filters
    if (auditFilters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(auditFilters.dateFrom);
      if (logDate < fromDate) return false;
    }

    if (auditFilters.dateTo) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(auditFilters.dateTo);
      if (logDate > toDate) return false;
    }

    return true;
  });
};

/** Get system stats */
export const selectAdminStats = (state: AdminState) => {
  const { users, roles, auditLogs, backups } = state;

  const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE).length;
  const pendingUsers = users.filter((u) => u.status === UserStatus.PENDING).length;
  const lockedUsers = users.filter((u) => u.status === UserStatus.LOCKED || u.status === UserStatus.SUSPENDED).length;

  // User by role breakdown
  const usersByRole = Object.values(UserRole).reduce((acc, role) => {
    acc[role] = users.filter((u) => u.role === role).length;
    return acc;
  }, {} as Record<UserRole, number>);

  // Recent activity count (last 24h)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const recentActivity = auditLogs.filter(
    (log) => new Date(log.timestamp) > yesterday
  ).length;

  // Last backup
  const completedBackups = backups.filter((b) => b.status === 'COMPLETED');
  const lastBackup = completedBackups.length > 0
    ? completedBackups.sort((a, b) =>
        new Date(b.completedAt || b.startedAt).getTime() -
        new Date(a.completedAt || a.startedAt).getTime()
      )[0]
    : null;

  return {
    totalUsers: users.length,
    activeUsers,
    pendingUsers,
    lockedUsers,
    totalRoles: roles.length,
    usersByRole,
    totalAuditLogs: auditLogs.length,
    recentActivity,
    lastBackup,
    totalBackups: backups.length,
  };
};

/** Get settings by category */
export const selectSettingsByCategory = (state: AdminState) => {
  const { settings } = state;
  
  return settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);
};

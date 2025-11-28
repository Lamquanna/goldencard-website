'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import {
  UserRole,
  ModuleId,
  Permission,
  hasPermission,
  canAccessModule,
  canViewAll,
  canEditAll,
  getAccessibleModules,
  getRolePermissions,
  canPerformAction,
  ModulePermission,
} from '@/lib/permissions';

// =====================================================
// TYPES
// =====================================================

export interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
}

interface PermissionContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  // Permission checks
  hasPermission: (moduleId: ModuleId, permission: Permission) => boolean;
  canAccessModule: (moduleId: ModuleId) => boolean;
  canViewAll: (moduleId: ModuleId) => boolean;
  canEditAll: (moduleId: ModuleId) => boolean;
  canPerformAction: (moduleId: ModuleId, action: Permission, isOwner?: boolean) => boolean;
  getAccessibleModules: () => ModuleId[];
  getModulePermissions: (moduleId: ModuleId) => ModulePermission | null;
  // Data ownership
  isOwner: (resourceOwnerId: string | undefined | null) => boolean;
  // Auth
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

// =====================================================
// CONTEXT
// =====================================================

const PermissionContext = createContext<PermissionContextValue | null>(null);

// =====================================================
// PROVIDER
// =====================================================

interface PermissionProviderProps {
  children: ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('crm_auth');
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/erp/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user.id || data.user.username,
          username: data.user.username,
          email: data.user.email,
          fullName: data.user.fullName || data.user.full_name,
          role: data.user.role as UserRole,
          department: data.user.department,
          avatarUrl: data.user.avatarUrl,
        });
        setError(null);
      } else {
        localStorage.removeItem('crm_auth');
        setUser(null);
        setError('Session expired');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setUser(null);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Permission check functions
  const checkPermission = useCallback(
    (moduleId: ModuleId, permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, moduleId, permission);
    },
    [user]
  );

  const checkCanAccessModule = useCallback(
    (moduleId: ModuleId): boolean => {
      if (!user) return false;
      return canAccessModule(user.role, moduleId);
    },
    [user]
  );

  const checkCanViewAll = useCallback(
    (moduleId: ModuleId): boolean => {
      if (!user) return false;
      return canViewAll(user.role, moduleId);
    },
    [user]
  );

  const checkCanEditAll = useCallback(
    (moduleId: ModuleId): boolean => {
      if (!user) return false;
      return canEditAll(user.role, moduleId);
    },
    [user]
  );

  const checkCanPerformAction = useCallback(
    (moduleId: ModuleId, action: Permission, isOwner: boolean = false): boolean => {
      if (!user) return false;
      return canPerformAction(user.role, moduleId, action, isOwner);
    },
    [user]
  );

  const getUserAccessibleModules = useCallback((): ModuleId[] => {
    if (!user) return [];
    return getAccessibleModules(user.role);
  }, [user]);

  const getModulePermissions = useCallback(
    (moduleId: ModuleId): ModulePermission | null => {
      if (!user) return null;
      const rolePerms = getRolePermissions(user.role);
      return rolePerms.modules[moduleId] || null;
    },
    [user]
  );

  const checkIsOwner = useCallback(
    (resourceOwnerId: string | undefined | null): boolean => {
      if (!user || !resourceOwnerId) return false;
      return user.id === resourceOwnerId || user.username === resourceOwnerId;
    },
    [user]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('crm_auth');
    setUser(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    await fetchUser();
  }, [fetchUser]);

  const value: PermissionContextValue = {
    user,
    loading,
    error,
    hasPermission: checkPermission,
    canAccessModule: checkCanAccessModule,
    canViewAll: checkCanViewAll,
    canEditAll: checkCanEditAll,
    canPerformAction: checkCanPerformAction,
    getAccessibleModules: getUserAccessibleModules,
    getModulePermissions,
    isOwner: checkIsOwner,
    logout,
    refreshAuth,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function usePermissions() {
  const context = useContext(PermissionContext);
  
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  
  return context;
}

// =====================================================
// COMPONENT WRAPPERS
// =====================================================

interface RequirePermissionProps {
  moduleId: ModuleId;
  permission?: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally render children based on permission
 */
export function RequirePermission({
  moduleId,
  permission = 'view',
  children,
  fallback = null,
}: RequirePermissionProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) return null;

  if (hasPermission(moduleId, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

interface IfOwnerOrPermissionProps {
  moduleId: ModuleId;
  permission: Permission;
  resourceOwnerId: string | undefined | null;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Render children if user is owner OR has permission to edit all
 */
export function IfOwnerOrPermission({
  moduleId,
  permission,
  resourceOwnerId,
  children,
  fallback = null,
}: IfOwnerOrPermissionProps) {
  const { canPerformAction, isOwner, loading } = usePermissions();

  if (loading) return null;

  const isResourceOwner = isOwner(resourceOwnerId);
  
  if (canPerformAction(moduleId, permission, isResourceOwner)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// =====================================================
// READ-ONLY MODE HELPER
// =====================================================

interface UseReadOnlyModeOptions {
  moduleId: ModuleId;
  resourceOwnerId?: string | null;
}

/**
 * Hook to determine if current view should be read-only
 */
export function useReadOnlyMode({ moduleId, resourceOwnerId }: UseReadOnlyModeOptions) {
  const { canPerformAction, isOwner, loading, user } = usePermissions();

  if (loading || !user) {
    return { isReadOnly: true, loading };
  }

  const resourceOwner = isOwner(resourceOwnerId);
  const canEdit = canPerformAction(moduleId, 'edit', resourceOwner);

  return {
    isReadOnly: !canEdit,
    loading,
    canView: canPerformAction(moduleId, 'view', resourceOwner),
    canCreate: canPerformAction(moduleId, 'create', resourceOwner),
    canEdit,
    canDelete: canPerformAction(moduleId, 'delete', resourceOwner),
    canExport: canPerformAction(moduleId, 'export', resourceOwner),
    canApprove: canPerformAction(moduleId, 'approve', resourceOwner),
  };
}

// =====================================================
// DATA FILTERING HELPERS
// =====================================================

interface FilterDataByOwnershipOptions<T> {
  data: T[];
  ownerField: keyof T;
  userId: string;
  canViewAll: boolean;
}

/**
 * Filter data array based on ownership
 */
export function filterDataByOwnership<T>({
  data,
  ownerField,
  userId,
  canViewAll,
}: FilterDataByOwnershipOptions<T>): T[] {
  if (canViewAll) return data;
  
  return data.filter((item) => {
    const ownerId = item[ownerField];
    return ownerId === userId;
  });
}

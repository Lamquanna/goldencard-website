// RBAC (Role-Based Access Control) Store using Zustand
// Manages user authentication, roles, and module permissions

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type UserRole = 'admin' | 'manager' | 'sale' | 'staff';

export type CRMModule = 
  | 'dashboard'
  | 'leads'
  | 'projects'
  | 'tasks'
  | 'inventory'
  | 'accounting'
  | 'analytics'
  | 'attendance'
  | 'chat'
  | 'maps'
  | 'users'
  | 'settings';

export type Permission = 
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'export'
  | 'assign';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  displayName?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface ModulePermission {
  module: CRMModule;
  permissions: Permission[];
}

// ============================================
// ROLE PERMISSIONS MATRIX
// ============================================

export const ROLE_PERMISSIONS: Record<UserRole, ModulePermission[]> = {
  admin: [
    { module: 'dashboard', permissions: ['view', 'export'] },
    { module: 'leads', permissions: ['view', 'create', 'edit', 'delete', 'assign', 'export'] },
    { module: 'projects', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'assign', 'export'] },
    { module: 'tasks', permissions: ['view', 'create', 'edit', 'delete', 'assign'] },
    { module: 'inventory', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { module: 'accounting', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { module: 'analytics', permissions: ['view', 'export'] },
    { module: 'attendance', permissions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
    { module: 'chat', permissions: ['view', 'create', 'delete'] },
    { module: 'maps', permissions: ['view', 'create', 'edit', 'delete'] },
    { module: 'users', permissions: ['view', 'create', 'edit', 'delete'] },
    { module: 'settings', permissions: ['view', 'edit'] },
  ],
  manager: [
    { module: 'dashboard', permissions: ['view', 'export'] },
    { module: 'leads', permissions: ['view', 'create', 'edit', 'assign', 'export'] },
    { module: 'projects', permissions: ['view', 'create', 'edit', 'approve', 'assign', 'export'] },
    { module: 'tasks', permissions: ['view', 'create', 'edit', 'assign'] },
    { module: 'inventory', permissions: ['view', 'create', 'edit', 'approve', 'export'] },
    { module: 'accounting', permissions: ['view', 'create', 'edit', 'approve', 'export'] },
    { module: 'analytics', permissions: ['view', 'export'] },
    { module: 'attendance', permissions: ['view', 'create', 'edit', 'approve', 'export'] },
    { module: 'chat', permissions: ['view', 'create'] },
    { module: 'maps', permissions: ['view'] },
    { module: 'users', permissions: ['view', 'create', 'edit'] },
    { module: 'settings', permissions: ['view'] },
  ],
  sale: [
    { module: 'dashboard', permissions: ['view'] },
    { module: 'leads', permissions: ['view', 'create', 'edit'] },
    { module: 'projects', permissions: ['view'] },
    { module: 'tasks', permissions: ['view', 'edit'] },
    { module: 'inventory', permissions: ['view', 'create'] },
    { module: 'accounting', permissions: [] },
    { module: 'analytics', permissions: [] },
    { module: 'attendance', permissions: ['view', 'create'] },
    { module: 'chat', permissions: ['view', 'create'] },
    { module: 'maps', permissions: ['view'] },
    { module: 'users', permissions: [] },
    { module: 'settings', permissions: [] },
  ],
  staff: [
    { module: 'dashboard', permissions: [] },
    { module: 'leads', permissions: [] },
    { module: 'projects', permissions: ['view'] },
    { module: 'tasks', permissions: ['view', 'edit'] },
    { module: 'inventory', permissions: ['view'] },
    { module: 'accounting', permissions: [] },
    { module: 'analytics', permissions: [] },
    { module: 'attendance', permissions: ['view', 'create'] },
    { module: 'chat', permissions: ['view', 'create'] },
    { module: 'maps', permissions: ['view'] },
    { module: 'users', permissions: [] },
    { module: 'settings', permissions: [] },
  ],
};

// ============================================
// MODULE METADATA
// ============================================

export const MODULE_INFO: Record<CRMModule, { 
  name: string; 
  icon: string; 
  path: string;
  description: string;
}> = {
  dashboard: { 
    name: 'Dashboard', 
    icon: '📊', 
    path: '/erp',
    description: 'Tổng quan CRM'
  },
  leads: { 
    name: 'Leads', 
    icon: '👥', 
    path: '/erp/leads',
    description: 'Quản lý khách hàng tiềm năng'
  },
  projects: { 
    name: 'Dự án', 
    icon: '🏗️', 
    path: '/erp/projects',
    description: 'Quản lý dự án năng lượng'
  },
  tasks: { 
    name: 'Công việc', 
    icon: '✅', 
    path: '/erp/tasks',
    description: 'Quản lý công việc & nhiệm vụ'
  },
  inventory: { 
    name: 'Kho', 
    icon: '📦', 
    path: '/erp/inventory',
    description: 'Quản lý kho vật tư thiết bị'
  },
  accounting: { 
    name: 'Kế toán', 
    icon: '🧮', 
    path: '/erp/accounting',
    description: 'Quản lý tài chính & kế toán'
  },
  analytics: { 
    name: 'Phân tích', 
    icon: '📈', 
    path: '/erp/analytics',
    description: 'Phân tích & báo cáo'
  },
  attendance: { 
    name: 'Chấm công', 
    icon: '🕐', 
    path: '/erp/attendance',
    description: 'Chấm công & theo dõi giờ làm'
  },
  chat: { 
    name: 'Chat', 
    icon: '💬', 
    path: '/erp/chat',
    description: 'Chat nội bộ'
  },
  maps: { 
    name: 'Bản đồ', 
    icon: '🗺️', 
    path: '/erp/maps',
    description: 'Bản đồ vị trí'
  },
  users: { 
    name: 'Nhân sự', 
    icon: '👤', 
    path: '/erp/users',
    description: 'Quản lý người dùng'
  },
  settings: { 
    name: 'Cài đặt', 
    icon: '⚙️', 
    path: '/erp/settings',
    description: 'Cấu hình hệ thống'
  },
};

// ============================================
// AUTH STORE
// ============================================

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  
  // Permission checks
  hasPermission: (module: CRMModule, permission: Permission) => boolean;
  hasAnyPermission: (module: CRMModule, permissions: Permission[]) => boolean;
  hasAllPermissions: (module: CRMModule, permissions: Permission[]) => boolean;
  canAccessModule: (module: CRMModule) => boolean;
  getModulePermissions: (module: CRMModule) => Permission[];
  getAccessibleModules: () => CRMModule[];
  
  // Role checks
  isAdmin: () => boolean;
  isManager: () => boolean;
  isManagerOrAbove: () => boolean;
  isSaleOrAbove: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true,
        isLoading: false,
      }),
      
      logout: () => {
        localStorage.removeItem('crm_auth');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
        });
      },
      
      // Check if user has specific permission on a module
      hasPermission: (module, permission) => {
        const { user } = get();
        if (!user) return false;
        
        const rolePermissions = ROLE_PERMISSIONS[user.role];
        const modulePerms = rolePermissions.find(p => p.module === module);
        
        return modulePerms?.permissions.includes(permission) ?? false;
      },
      
      // Check if user has ANY of the given permissions
      hasAnyPermission: (module, permissions) => {
        const { hasPermission } = get();
        return permissions.some(p => hasPermission(module, p));
      },
      
      // Check if user has ALL of the given permissions
      hasAllPermissions: (module, permissions) => {
        const { hasPermission } = get();
        return permissions.every(p => hasPermission(module, p));
      },
      
      // Check if user can access a module (has at least 'view' permission)
      canAccessModule: (module) => {
        const { user } = get();
        if (!user) return false;
        
        const rolePermissions = ROLE_PERMISSIONS[user.role];
        const modulePerms = rolePermissions.find(p => p.module === module);
        
        return (modulePerms?.permissions.length ?? 0) > 0;
      },
      
      // Get all permissions for a module
      getModulePermissions: (module) => {
        const { user } = get();
        if (!user) return [];
        
        const rolePermissions = ROLE_PERMISSIONS[user.role];
        const modulePerms = rolePermissions.find(p => p.module === module);
        
        return modulePerms?.permissions ?? [];
      },
      
      // Get list of modules user can access
      getAccessibleModules: () => {
        const { user, canAccessModule } = get();
        if (!user) return [];
        
        return (Object.keys(MODULE_INFO) as CRMModule[])
          .filter(module => canAccessModule(module));
      },
      
      // Role helper methods
      isAdmin: () => get().user?.role === 'admin',
      isManager: () => get().user?.role === 'manager',
      isManagerOrAbove: () => ['admin', 'manager'].includes(get().user?.role || ''),
      isSaleOrAbove: () => ['admin', 'manager', 'sale'].includes(get().user?.role || ''),
    }),
    {
      name: 'crm-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getRoleBadge(role: UserRole): { label: string; color: string; icon: string } {
  const badges: Record<UserRole, { label: string; color: string; icon: string }> = {
    admin: { 
      label: 'Quản trị viên', 
      color: 'bg-purple-100 text-purple-700 border-purple-300',
      icon: '👑'
    },
    manager: { 
      label: 'Quản lý', 
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: '🏢'
    },
    sale: { 
      label: 'Nhân viên bán hàng', 
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: '💼'
    },
    staff: { 
      label: 'Nhân viên', 
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      icon: '👤'
    },
  };
  
  return badges[role];
}

export function getRoleHierarchy(role: UserRole): number {
  const hierarchy: Record<UserRole, number> = {
    admin: 4,
    manager: 3,
    sale: 2,
    staff: 1,
  };
  return hierarchy[role];
}

export function canManageRole(currentRole: UserRole, targetRole: UserRole): boolean {
  // Admin can manage everyone
  if (currentRole === 'admin') return true;
  
  // Manager can manage sale and staff
  if (currentRole === 'manager') {
    return ['sale', 'staff'].includes(targetRole);
  }
  
  // Others can't manage anyone
  return false;
}

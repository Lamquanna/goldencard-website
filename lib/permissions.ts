// =====================================================
// GOLDEN ENERGY ERP - ROLE-BASED ACCESS CONTROL (RBAC)
// =====================================================
// Permission system for ERP modules
// Based on FastCons and industry-standard ERP patterns

export type UserRole = 'admin' | 'manager' | 'sale' | 'staff' | 'hr' | 'warehouse' | 'engineer';

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export type ModuleId = 
  | 'dashboard'
  | 'tasks'
  | 'leads'
  | 'projects'
  | 'inventory'
  | 'accounting'
  | 'analytics'
  | 'attendance'
  | 'maps'
  | 'automations'
  | 'users'
  | 'chat';

export interface ModulePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  approve: boolean;
  // Special permissions
  viewAll: boolean;      // Can view all data (vs only own data)
  editAll: boolean;      // Can edit all data (vs only own data)
}

export interface RolePermissions {
  role: UserRole;
  label: string;
  description: string;
  modules: Record<ModuleId, ModulePermission>;
}

// Default permission set (no access)
const NO_ACCESS: ModulePermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false,
  approve: false,
  viewAll: false,
  editAll: false,
};

// View only permission
const VIEW_ONLY: ModulePermission = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  export: false,
  approve: false,
  viewAll: false,
  editAll: false,
};

// View own data only
const VIEW_OWN: ModulePermission = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  export: false,
  approve: false,
  viewAll: false,
  editAll: false,
};

// View and create (can be used for specific permission patterns)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const VIEW_CREATE: ModulePermission = {
  view: true,
  create: true,
  edit: false,
  delete: false,
  export: false,
  approve: false,
  viewAll: false,
  editAll: false,
};

// Full access to own data
const FULL_OWN: ModulePermission = {
  view: true,
  create: true,
  edit: true,
  delete: false,
  export: true,
  approve: false,
  viewAll: false,
  editAll: false,
};

// Full access
const FULL_ACCESS: ModulePermission = {
  view: true,
  create: true,
  edit: true,
  delete: true,
  export: true,
  approve: true,
  viewAll: true,
  editAll: true,
};

// Manager access (can view/edit all but no delete)
const MANAGER_ACCESS: ModulePermission = {
  view: true,
  create: true,
  edit: true,
  delete: false,
  export: true,
  approve: true,
  viewAll: true,
  editAll: true,
};

// =====================================================
// ROLE DEFINITIONS
// =====================================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // =====================================================
  // ADMIN - Full system access
  // =====================================================
  admin: {
    role: 'admin',
    label: '👑 Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    modules: {
      dashboard: FULL_ACCESS,
      tasks: FULL_ACCESS,
      leads: FULL_ACCESS,
      projects: FULL_ACCESS,
      inventory: FULL_ACCESS,
      accounting: FULL_ACCESS,
      analytics: FULL_ACCESS,
      attendance: FULL_ACCESS,
      maps: FULL_ACCESS,
      automations: FULL_ACCESS,
      users: FULL_ACCESS,
      chat: FULL_ACCESS,
    },
  },

  // =====================================================
  // MANAGER - CRM + User management (except admin)
  // =====================================================
  manager: {
    role: 'manager',
    label: '🏢 Quản lý',
    description: 'Quản lý CRM + Nhân viên (trừ admin)',
    modules: {
      dashboard: MANAGER_ACCESS,
      tasks: MANAGER_ACCESS,
      leads: MANAGER_ACCESS,
      projects: MANAGER_ACCESS,
      inventory: { ...MANAGER_ACCESS, delete: false },
      accounting: { ...VIEW_ONLY, viewAll: true, export: true },
      analytics: { ...MANAGER_ACCESS, delete: false },
      attendance: MANAGER_ACCESS,
      maps: { ...VIEW_ONLY, viewAll: true },
      automations: { ...VIEW_ONLY, viewAll: true },
      users: { ...MANAGER_ACCESS, delete: false }, // Can't delete users
      chat: FULL_ACCESS,
    },
  },

  // =====================================================
  // SALE - CRM access only (leads, pipeline)
  // =====================================================
  sale: {
    role: 'sale',
    label: '💼 Nhân viên bán hàng',
    description: 'CRM: Quản lý leads, pipeline bán hàng',
    modules: {
      dashboard: { ...VIEW_ONLY, viewAll: false },
      tasks: { ...FULL_OWN, viewAll: false, editAll: false },
      leads: { 
        view: true,
        create: true,
        edit: true,
        delete: false,
        export: true,
        approve: false,
        viewAll: true,  // Sales can see all leads
        editAll: false, // But only edit assigned leads
      },
      projects: { ...VIEW_ONLY, viewAll: true },
      inventory: VIEW_ONLY,
      accounting: NO_ACCESS,
      analytics: { ...VIEW_ONLY, viewAll: false }, // Own performance only
      attendance: { ...VIEW_OWN, create: true }, // Can check-in/out
      maps: VIEW_ONLY,
      automations: NO_ACCESS,
      users: NO_ACCESS,
      chat: FULL_ACCESS,
    },
  },

  // =====================================================
  // STAFF - Basic employee access
  // =====================================================
  staff: {
    role: 'staff',
    label: '👤 Nhân viên',
    description: 'Chức năng cơ bản: Chấm công, chat nội bộ',
    modules: {
      dashboard: NO_ACCESS,
      tasks: { ...VIEW_OWN, create: false }, // View assigned tasks only
      leads: NO_ACCESS,
      projects: { ...VIEW_OWN }, // View assigned projects only
      inventory: NO_ACCESS,
      accounting: NO_ACCESS,
      analytics: NO_ACCESS,
      attendance: { 
        view: true,
        create: true,  // Can check-in/out
        edit: false,
        delete: false,
        export: false,
        approve: false,
        viewAll: false, // Only own attendance
        editAll: false,
      },
      maps: NO_ACCESS,
      automations: NO_ACCESS,
      users: NO_ACCESS,
      chat: FULL_ACCESS, // Internal chat
    },
  },

  // =====================================================
  // HR - Human Resources
  // =====================================================
  hr: {
    role: 'hr',
    label: '👔 Nhân sự',
    description: 'Quản lý nhân sự, chấm công, nghỉ phép',
    modules: {
      dashboard: { ...VIEW_ONLY, viewAll: true },
      tasks: FULL_OWN,
      leads: NO_ACCESS,
      projects: VIEW_ONLY,
      inventory: NO_ACCESS,
      accounting: { ...VIEW_ONLY, viewAll: false }, // Payroll info only
      analytics: { ...VIEW_ONLY, viewAll: true },
      attendance: FULL_ACCESS, // Full attendance management
      maps: VIEW_ONLY,
      automations: NO_ACCESS,
      users: { ...MANAGER_ACCESS, delete: false }, // Can manage users
      chat: FULL_ACCESS,
    },
  },

  // =====================================================
  // WAREHOUSE - Inventory management
  // =====================================================
  warehouse: {
    role: 'warehouse',
    label: '📦 Kho',
    description: 'Quản lý kho hàng, xuất nhập',
    modules: {
      dashboard: { ...VIEW_ONLY, viewAll: false },
      tasks: FULL_OWN,
      leads: NO_ACCESS,
      projects: { ...VIEW_ONLY, viewAll: true },
      inventory: { ...FULL_ACCESS, delete: false }, // Full inventory but no delete
      accounting: NO_ACCESS,
      analytics: { ...VIEW_ONLY, viewAll: false },
      attendance: { ...VIEW_OWN, create: true },
      maps: { ...VIEW_ONLY, viewAll: true },
      automations: NO_ACCESS,
      users: NO_ACCESS,
      chat: FULL_ACCESS,
    },
  },

  // =====================================================
  // ENGINEER - Technical staff
  // =====================================================
  engineer: {
    role: 'engineer',
    label: '🔧 Kỹ thuật',
    description: 'Quản lý dự án kỹ thuật, lắp đặt',
    modules: {
      dashboard: { ...VIEW_ONLY, viewAll: false },
      tasks: FULL_OWN,
      leads: { ...VIEW_ONLY, viewAll: false }, // View assigned leads only
      projects: {
        view: true,
        create: false,
        edit: true,  // Can update project progress
        delete: false,
        export: true,
        approve: false,
        viewAll: false, // Only assigned projects
        editAll: false,
      },
      inventory: { ...VIEW_ONLY, viewAll: true }, // View all inventory
      accounting: NO_ACCESS,
      analytics: { ...VIEW_ONLY, viewAll: false },
      attendance: { ...VIEW_OWN, create: true },
      maps: { ...VIEW_ONLY, viewAll: true },
      automations: NO_ACCESS,
      users: NO_ACCESS,
      chat: FULL_ACCESS,
    },
  },
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff;
}

/**
 * Check if a role has specific permission on a module
 */
export function hasPermission(
  role: UserRole,
  moduleId: ModuleId,
  permission: Permission
): boolean {
  const rolePerms = getRolePermissions(role);
  const modulePerms = rolePerms.modules[moduleId];
  
  if (!modulePerms) return false;
  
  return modulePerms[permission] === true;
}

/**
 * Check if a role can access a module at all
 */
export function canAccessModule(role: UserRole, moduleId: ModuleId): boolean {
  return hasPermission(role, moduleId, 'view');
}

/**
 * Check if user can view all data in a module
 */
export function canViewAll(role: UserRole, moduleId: ModuleId): boolean {
  const rolePerms = getRolePermissions(role);
  const modulePerms = rolePerms.modules[moduleId];
  
  return modulePerms?.viewAll === true;
}

/**
 * Check if user can edit all data in a module
 */
export function canEditAll(role: UserRole, moduleId: ModuleId): boolean {
  const rolePerms = getRolePermissions(role);
  const modulePerms = rolePerms.modules[moduleId];
  
  return modulePerms?.editAll === true;
}

/**
 * Get all accessible modules for a role
 */
export function getAccessibleModules(role: UserRole): ModuleId[] {
  const rolePerms = getRolePermissions(role);
  
  return (Object.keys(rolePerms.modules) as ModuleId[]).filter(
    (moduleId) => rolePerms.modules[moduleId].view
  );
}

/**
 * Check if user can perform action on specific data
 */
export function canPerformAction(
  role: UserRole,
  moduleId: ModuleId,
  action: Permission,
  isOwner: boolean = false
): boolean {
  const rolePerms = getRolePermissions(role);
  const modulePerms = rolePerms.modules[moduleId];
  
  if (!modulePerms) return false;
  
  // Admin always has access
  if (role === 'admin') return true;
  
  // Check if action is allowed
  if (!modulePerms[action]) return false;
  
  // For edit/delete, check if user needs to be owner
  if (action === 'edit' || action === 'delete') {
    if (modulePerms.editAll) return true;
    return isOwner;
  }
  
  return true;
}

// =====================================================
// MODULE METADATA
// =====================================================

export interface ModuleInfo {
  id: ModuleId;
  name: string;
  nameVi: string;
  icon: string;
  href: string;
  description: string;
  descriptionVi: string;
}

export const MODULES: Record<ModuleId, ModuleInfo> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    nameVi: 'Bảng điều khiển',
    icon: '📊',
    href: '/erp/dashboard',
    description: 'Overview and statistics',
    descriptionVi: 'Tổng quan và thống kê',
  },
  tasks: {
    id: 'tasks',
    name: 'Tasks',
    nameVi: 'Công việc',
    icon: '✅',
    href: '/erp/tasks',
    description: 'Task management',
    descriptionVi: 'Quản lý công việc',
  },
  leads: {
    id: 'leads',
    name: 'Leads',
    nameVi: 'Khách hàng tiềm năng',
    icon: '👥',
    href: '/erp/leads',
    description: 'Lead management and CRM',
    descriptionVi: 'Quản lý khách hàng tiềm năng',
  },
  projects: {
    id: 'projects',
    name: 'Projects',
    nameVi: 'Dự án',
    icon: '🏗️',
    href: '/erp/projects',
    description: 'Project management',
    descriptionVi: 'Quản lý dự án',
  },
  inventory: {
    id: 'inventory',
    name: 'Inventory',
    nameVi: 'Kho hàng',
    icon: '📦',
    href: '/erp/inventory',
    description: 'Inventory and stock management',
    descriptionVi: 'Quản lý kho hàng',
  },
  accounting: {
    id: 'accounting',
    name: 'Accounting',
    nameVi: 'Kế toán',
    icon: '🧮',
    href: '/erp/accounting',
    description: 'Financial management',
    descriptionVi: 'Quản lý tài chính',
  },
  analytics: {
    id: 'analytics',
    name: 'Analytics',
    nameVi: 'Báo cáo',
    icon: '📈',
    href: '/erp/analytics',
    description: 'Reports and analytics',
    descriptionVi: 'Báo cáo và phân tích',
  },
  attendance: {
    id: 'attendance',
    name: 'Attendance',
    nameVi: 'Chấm công',
    icon: '⏰',
    href: '/erp/attendance',
    description: 'Time tracking and attendance',
    descriptionVi: 'Chấm công và theo dõi giờ làm',
  },
  maps: {
    id: 'maps',
    name: 'Maps',
    nameVi: 'Bản đồ',
    icon: '🗺️',
    href: '/erp/map',
    description: 'Location and mapping',
    descriptionVi: 'Vị trí và bản đồ',
  },
  automations: {
    id: 'automations',
    name: 'Automations',
    nameVi: 'Tự động hóa',
    icon: '⚙️',
    href: '/erp/automations',
    description: 'Workflow automation',
    descriptionVi: 'Tự động hóa quy trình',
  },
  users: {
    id: 'users',
    name: 'Users',
    nameVi: 'Người dùng',
    icon: '👤',
    href: '/erp/users',
    description: 'User management',
    descriptionVi: 'Quản lý người dùng',
  },
  chat: {
    id: 'chat',
    name: 'Chat',
    nameVi: 'Tin nhắn',
    icon: '💬',
    href: '/erp/chat',
    description: 'Internal chat',
    descriptionVi: 'Tin nhắn nội bộ',
  },
};

/**
 * Get modules accessible by role with their info
 */
export function getAccessibleModulesWithInfo(role: UserRole): ModuleInfo[] {
  const accessibleModuleIds = getAccessibleModules(role);
  return accessibleModuleIds.map((id) => MODULES[id]).filter(Boolean);
}

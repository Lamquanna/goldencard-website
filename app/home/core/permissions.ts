// =============================================================================
// HOME PLATFORM - RBAC Permission Engine
// Role-Based Access Control with fine-grained permissions
// =============================================================================

import { 
  Role, 
  UserPermissions, 
  PermissionAction, 
  PermissionDefinition 
} from '../types';

// -----------------------------------------------------------------------------
// Default Roles
// -----------------------------------------------------------------------------

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    nameVi: 'Quản trị viên cao cấp',
    description: 'Full access to everything',
    permissions: ['*'], // Wildcard - all permissions
    isSystem: true,
    level: 0,
  },
  {
    id: 'admin',
    name: 'Admin',
    nameVi: 'Quản trị viên',
    description: 'Manage workspace settings and users',
    permissions: [
      'workspace:manage',
      'users:manage',
      'modules:manage',
      'settings:manage',
    ],
    isSystem: true,
    level: 1,
  },
  {
    id: 'manager',
    name: 'Manager',
    nameVi: 'Quản lý',
    description: 'Manage team and projects',
    permissions: [
      'team:manage',
      'projects:manage',
      'tasks:manage',
      'reports:read',
      'reports:export',
    ],
    isSystem: true,
    level: 2,
  },
  {
    id: 'team_lead',
    name: 'Team Lead',
    nameVi: 'Trưởng nhóm',
    description: 'Lead a team',
    permissions: [
      'team:read',
      'projects:read',
      'projects:update',
      'tasks:manage',
    ],
    isSystem: true,
    level: 3,
  },
  {
    id: 'member',
    name: 'Member',
    nameVi: 'Thành viên',
    description: 'Regular team member',
    permissions: [
      'projects:read',
      'tasks:read',
      'tasks:update',
      'chat:use',
    ],
    isSystem: true,
    level: 4,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    nameVi: 'Xem',
    description: 'Read-only access',
    permissions: [
      'projects:read',
      'tasks:read',
      'reports:read',
    ],
    isSystem: true,
    level: 5,
  },
];

// -----------------------------------------------------------------------------
// Department-specific Roles
// -----------------------------------------------------------------------------

export const DEPARTMENT_ROLES: Role[] = [
  {
    id: 'sales_manager',
    name: 'Sales Manager',
    nameVi: 'Quản lý Kinh doanh',
    permissions: [
      'crm:manage',
      'leads:manage',
      'deals:manage',
      'customers:manage',
      'reports:sales',
    ],
    level: 2,
  },
  {
    id: 'sales_rep',
    name: 'Sales Representative',
    nameVi: 'Nhân viên Kinh doanh',
    permissions: [
      'leads:read',
      'leads:create',
      'leads:update',
      'deals:read',
      'deals:create',
      'customers:read',
    ],
    level: 4,
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    nameVi: 'Quản lý Nhân sự',
    permissions: [
      'hrm:manage',
      'employees:manage',
      'attendance:manage',
      'payroll:manage',
      'leaves:manage',
    ],
    level: 2,
  },
  {
    id: 'hr_staff',
    name: 'HR Staff',
    nameVi: 'Nhân viên Nhân sự',
    permissions: [
      'employees:read',
      'attendance:read',
      'leaves:read',
      'leaves:approve_basic',
    ],
    level: 4,
  },
  {
    id: 'warehouse_manager',
    name: 'Warehouse Manager',
    nameVi: 'Quản lý Kho',
    permissions: [
      'inventory:manage',
      'stock:manage',
      'transfers:manage',
      'reports:inventory',
    ],
    level: 2,
  },
  {
    id: 'warehouse_staff',
    name: 'Warehouse Staff',
    nameVi: 'Nhân viên Kho',
    permissions: [
      'inventory:read',
      'stock:read',
      'stock:create',
      'stock:update',
    ],
    level: 4,
  },
  {
    id: 'finance_manager',
    name: 'Finance Manager',
    nameVi: 'Quản lý Tài chính',
    permissions: [
      'finance:manage',
      'invoices:manage',
      'payments:manage',
      'reports:finance',
    ],
    level: 2,
  },
  {
    id: 'accountant',
    name: 'Accountant',
    nameVi: 'Kế toán',
    permissions: [
      'invoices:read',
      'invoices:create',
      'payments:read',
      'payments:create',
      'reports:finance:read',
    ],
    level: 4,
  },
  {
    id: 'project_manager',
    name: 'Project Manager',
    nameVi: 'Quản lý Dự án',
    permissions: [
      'projects:manage',
      'tasks:manage',
      'resources:manage',
      'reports:projects',
    ],
    level: 2,
  },
  {
    id: 'engineer',
    name: 'Engineer',
    nameVi: 'Kỹ sư',
    permissions: [
      'projects:read',
      'tasks:read',
      'tasks:update',
      'documents:read',
      'documents:upload',
    ],
    level: 4,
  },
];

// -----------------------------------------------------------------------------
// Permission Engine
// -----------------------------------------------------------------------------

class PermissionEngine {
  private roles: Map<string, Role> = new Map();
  private userPermissions: Map<string, UserPermissions> = new Map();
  private permissionDefinitions: Map<string, PermissionDefinition> = new Map();

  constructor() {
    // Load default roles
    [...DEFAULT_ROLES, ...DEPARTMENT_ROLES].forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // -----------------------------------------------------------------------------
  // Role Management
  // -----------------------------------------------------------------------------

  addRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  removeRole(roleId: string): boolean {
    const role = this.roles.get(roleId);
    if (role?.isSystem) {
      throw new Error('Cannot remove system role');
    }
    return this.roles.delete(roleId);
  }

  // -----------------------------------------------------------------------------
  // Permission Definition Management
  // -----------------------------------------------------------------------------

  registerPermission(definition: PermissionDefinition): void {
    this.permissionDefinitions.set(definition.id, definition);
  }

  registerPermissions(definitions: PermissionDefinition[]): void {
    definitions.forEach(d => this.registerPermission(d));
  }

  getPermissionDefinition(permissionId: string): PermissionDefinition | undefined {
    return this.permissionDefinitions.get(permissionId);
  }

  // -----------------------------------------------------------------------------
  // User Permission Management
  // -----------------------------------------------------------------------------

  setUserPermissions(userId: string, permissions: UserPermissions): void {
    this.userPermissions.set(userId, permissions);
  }

  getUserPermissions(userId: string): UserPermissions | undefined {
    return this.userPermissions.get(userId);
  }

  // -----------------------------------------------------------------------------
  // Permission Checking
  // -----------------------------------------------------------------------------

  /**
   * Check if user has a specific permission
   * Format: "resource:action" or "module:resource:action"
   */
  can(userId: string, permission: string): boolean {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return false;

    // Check denied permissions first
    if (userPerms.deniedPermissions.includes(permission)) {
      return false;
    }

    // Check direct permissions
    if (userPerms.directPermissions.includes(permission)) {
      return true;
    }

    // Check role permissions
    for (const roleId of userPerms.roles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      // Check wildcard (super admin)
      if (role.permissions.includes('*')) {
        return true;
      }

      // Check exact match
      if (role.permissions.includes(permission)) {
        return true;
      }

      // Check wildcard patterns (e.g., "crm:*" matches "crm:leads:read")
      const [module, resource, action] = permission.split(':');
      
      // Module wildcard (e.g., "crm:*")
      if (role.permissions.includes(`${module}:*`)) {
        return true;
      }

      // Resource wildcard (e.g., "crm:leads:*")
      if (resource && role.permissions.includes(`${module}:${resource}:*`)) {
        return true;
      }

      // Manage permission includes all CRUD
      if (action && role.permissions.includes(`${module}:${resource}:manage`)) {
        return true;
      }
      if (role.permissions.includes(`${module}:manage`)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check multiple permissions (AND logic)
   */
  canAll(userId: string, permissions: string[]): boolean {
    return permissions.every(p => this.can(userId, p));
  }

  /**
   * Check multiple permissions (OR logic)
   */
  canAny(userId: string, permissions: string[]): boolean {
    return permissions.some(p => this.can(userId, p));
  }

  /**
   * Check CRUD permissions for a resource
   */
  canCRUD(userId: string, resource: string): Record<PermissionAction, boolean> {
    return {
      create: this.can(userId, `${resource}:create`),
      read: this.can(userId, `${resource}:read`),
      update: this.can(userId, `${resource}:update`),
      delete: this.can(userId, `${resource}:delete`),
      manage: this.can(userId, `${resource}:manage`),
      export: this.can(userId, `${resource}:export`),
      import: this.can(userId, `${resource}:import`),
    };
  }

  /**
   * Get all effective permissions for a user
   */
  getEffectivePermissions(userId: string): string[] {
    const userPerms = this.userPermissions.get(userId);
    if (!userPerms) return [];

    const permissions = new Set<string>();

    // Add direct permissions
    userPerms.directPermissions.forEach(p => permissions.add(p));

    // Add role permissions
    for (const roleId of userPerms.roles) {
      const role = this.roles.get(roleId);
      if (role) {
        role.permissions.forEach(p => permissions.add(p));
      }
    }

    // Remove denied permissions
    userPerms.deniedPermissions.forEach(p => permissions.delete(p));

    return Array.from(permissions);
  }

  /**
   * Check if user has access to a module
   */
  canAccessModule(userId: string, moduleId: string): boolean {
    return this.canAny(userId, [
      `${moduleId}:*`,
      `${moduleId}:read`,
      `${moduleId}:manage`,
    ]);
  }

  /**
   * Get accessible modules for a user
   */
  getAccessibleModules(userId: string, moduleIds: string[]): string[] {
    return moduleIds.filter(id => this.canAccessModule(userId, id));
  }
}

// -----------------------------------------------------------------------------
// Permission Helpers
// -----------------------------------------------------------------------------

/**
 * Create permission string
 */
export function createPermission(
  module: string,
  resource: string,
  action: PermissionAction
): string {
  return `${module}:${resource}:${action}`;
}

/**
 * Parse permission string
 */
export function parsePermission(permission: string): {
  module: string;
  resource?: string;
  action?: string;
} {
  const parts = permission.split(':');
  return {
    module: parts[0],
    resource: parts[1],
    action: parts[2],
  };
}

/**
 * Check if permission matches a pattern
 */
export function matchesPattern(permission: string, pattern: string): boolean {
  if (pattern === '*') return true;
  
  const permParts = permission.split(':');
  const patternParts = pattern.split(':');

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i] === '*') return true;
    if (patternParts[i] !== permParts[i]) return false;
  }

  return permParts.length === patternParts.length;
}

// -----------------------------------------------------------------------------
// Singleton Instance
// -----------------------------------------------------------------------------

let permissionEngineInstance: PermissionEngine | null = null;

export function getPermissionEngine(): PermissionEngine {
  if (!permissionEngineInstance) {
    permissionEngineInstance = new PermissionEngine();
  }
  return permissionEngineInstance;
}

// Export class for type usage
export { PermissionEngine };

// -----------------------------------------------------------------------------
// React Hook for Permissions
// -----------------------------------------------------------------------------

export function usePermission() {
  const engine = getPermissionEngine();
  
  return {
    can: (userId: string, permission: string) => engine.can(userId, permission),
    canAll: (userId: string, permissions: string[]) => engine.canAll(userId, permissions),
    canAny: (userId: string, permissions: string[]) => engine.canAny(userId, permissions),
    canCRUD: (userId: string, resource: string) => engine.canCRUD(userId, resource),
    canAccessModule: (userId: string, moduleId: string) => engine.canAccessModule(userId, moduleId),
  };
}

/**
 * RBAC - Role-Based Access Control System
 * 
 * Full role-based access control with resource/action model.
 * Hierarchy: SuperAdmin → Admin → Manager → Staff
 * Manager automatically manages roles & users under them.
 */

import { 
  Role, 
  RoleType, 
  RolePermission, 
  User, 
  PermissionAction,
  ROLE_HIERARCHY 
} from './types';
import { moduleRegistry } from './module-registry';

// Default role definitions
const defaultRoles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    type: 'super_admin',
    description: 'Full system access with all permissions',
    permissions: [], // Super admin has all permissions by default
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'admin',
    name: 'Administrator',
    type: 'admin',
    description: 'System administrator with broad access',
    permissions: [],
    parentRoleId: 'super_admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'manager',
    name: 'Manager',
    type: 'manager',
    description: 'Department manager with team management access',
    permissions: [],
    parentRoleId: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'staff',
    name: 'Staff',
    type: 'staff',
    description: 'Regular staff member with basic access',
    permissions: [],
    parentRoleId: 'manager',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface PermissionCheck {
  moduleId: string;
  resource: string;
  action: PermissionAction;
}

interface AccessContext {
  user: User;
  targetUserId?: string;
  targetDepartmentId?: string;
  ownerId?: string;
}

class RBACSystem {
  private roles: Map<string, Role> = new Map();
  private userRoleCache: Map<string, Role> = new Map();

  constructor() {
    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }

  // ============================================
  // Role Management
  // ============================================

  /**
   * Get all roles
   */
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  /**
   * Get role by ID
   */
  getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Create a new role
   */
  createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>, creatorRole: RoleType): Role {
    // Check if creator can create this role type
    if (!this.canManageRoleType(creatorRole, role.type)) {
      throw new Error(`${creatorRole} cannot create ${role.type} roles`);
    }

    const newRole: Role = {
      ...role,
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.roles.set(newRole.id, newRole);
    return newRole;
  }

  /**
   * Update a role
   */
  updateRole(roleId: string, updates: Partial<Role>, updaterRole: RoleType): Role {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found`);
    }

    if (!this.canManageRoleType(updaterRole, role.type)) {
      throw new Error(`${updaterRole} cannot update ${role.type} roles`);
    }

    const updatedRole: Role = {
      ...role,
      ...updates,
      id: roleId,
      updatedAt: new Date(),
    };

    this.roles.set(roleId, updatedRole);
    this.clearCache();
    return updatedRole;
  }

  /**
   * Delete a role
   */
  deleteRole(roleId: string, deleterRole: RoleType): boolean {
    const role = this.roles.get(roleId);
    if (!role) {
      return false;
    }

    // Prevent deleting default roles
    if (defaultRoles.some(r => r.id === roleId)) {
      throw new Error('Cannot delete default system roles');
    }

    if (!this.canManageRoleType(deleterRole, role.type)) {
      throw new Error(`${deleterRole} cannot delete ${role.type} roles`);
    }

    this.roles.delete(roleId);
    this.clearCache();
    return true;
  }

  /**
   * Check if a role type can manage another role type
   */
  canManageRoleType(managerType: RoleType, targetType: RoleType): boolean {
    return ROLE_HIERARCHY[managerType] > ROLE_HIERARCHY[targetType];
  }

  /**
   * Get roles that a user can assign (lower hierarchy only)
   */
  getAssignableRoles(userRoleType: RoleType): Role[] {
    const userLevel = ROLE_HIERARCHY[userRoleType];
    return this.getAllRoles().filter(role => 
      ROLE_HIERARCHY[role.type] < userLevel
    );
  }

  // ============================================
  // Permission Checking
  // ============================================

  /**
   * Check if user has permission
   */
  hasPermission(context: AccessContext, check: PermissionCheck): boolean {
    const { user } = context;
    const role = user.role || this.getRole(user.roleId);
    
    if (!role) {
      return false;
    }

    // Super admin has all permissions
    if (role.type === 'super_admin') {
      return true;
    }

    // Check module is enabled
    if (!moduleRegistry.isEnabled(check.moduleId)) {
      return false;
    }

    // Check role permissions
    const modulePermission = role.permissions.find(
      p => p.moduleId === check.moduleId && p.resource === check.resource
    );

    if (modulePermission?.actions.includes(check.action)) {
      return true;
    }

    // Check ownership for staff
    if (role.type === 'staff' && context.ownerId === user.id) {
      // Staff can always view/update their own items
      if (['view', 'update'].includes(check.action)) {
        return true;
      }
    }

    // Manager can access their team's data
    if (role.type === 'manager') {
      if (context.targetDepartmentId === user.departmentId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check multiple permissions at once
   */
  hasAnyPermission(context: AccessContext, checks: PermissionCheck[]): boolean {
    return checks.some(check => this.hasPermission(context, check));
  }

  /**
   * Check all permissions required
   */
  hasAllPermissions(context: AccessContext, checks: PermissionCheck[]): boolean {
    return checks.every(check => this.hasPermission(context, check));
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user: User): RolePermission[] {
    const role = user.role || this.getRole(user.roleId);
    if (!role) {
      return [];
    }

    // Super admin gets all permissions
    if (role.type === 'super_admin') {
      return moduleRegistry.getAllPermissions().flatMap(mp => 
        mp.permissions.map(p => ({
          moduleId: mp.moduleId,
          resource: p.resource,
          actions: p.actions,
        }))
      );
    }

    return role.permissions;
  }

  /**
   * Check if user can manage another user
   */
  canManageUser(manager: User, targetUser: User): boolean {
    const managerRole = manager.role || this.getRole(manager.roleId);
    const targetRole = targetUser.role || this.getRole(targetUser.roleId);

    if (!managerRole || !targetRole) {
      return false;
    }

    // Super admin can manage everyone
    if (managerRole.type === 'super_admin') {
      return true;
    }

    // Check hierarchy
    if (ROLE_HIERARCHY[managerRole.type] <= ROLE_HIERARCHY[targetRole.type]) {
      return false;
    }

    // Manager can only manage users in their department
    if (managerRole.type === 'manager') {
      return manager.departmentId === targetUser.departmentId;
    }

    return true;
  }

  /**
   * Check if user can assign a specific role to another user
   */
  canAssignRole(assigner: User, roleId: string): boolean {
    const assignerRole = assigner.role || this.getRole(assigner.roleId);
    const targetRole = this.getRole(roleId);

    if (!assignerRole || !targetRole) {
      return false;
    }

    return this.canManageRoleType(assignerRole.type, targetRole.type);
  }

  // ============================================
  // Permission Assignment
  // ============================================

  /**
   * Set permissions for a role
   */
  setRolePermissions(roleId: string, permissions: RolePermission[], updaterRole: RoleType): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found`);
    }

    if (!this.canManageRoleType(updaterRole, role.type)) {
      throw new Error(`${updaterRole} cannot modify ${role.type} role permissions`);
    }

    // Validate permissions against module registry
    for (const perm of permissions) {
      if (!moduleRegistry.isEnabled(perm.moduleId)) {
        throw new Error(`Module "${perm.moduleId}" is not enabled`);
      }

      const modulePerms = moduleRegistry.getPermissions(perm.moduleId);
      const resourcePerm = modulePerms.find(mp => mp.resource === perm.resource);
      
      if (!resourcePerm) {
        throw new Error(`Resource "${perm.resource}" not found in module "${perm.moduleId}"`);
      }

      for (const action of perm.actions) {
        if (!resourcePerm.actions.includes(action)) {
          throw new Error(`Action "${action}" not available for resource "${perm.resource}"`);
        }
      }
    }

    this.updateRole(roleId, { permissions }, updaterRole);
  }

  /**
   * Add permission to role
   */
  addRolePermission(roleId: string, permission: RolePermission, updaterRole: RoleType): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found`);
    }

    const existingIndex = role.permissions.findIndex(
      p => p.moduleId === permission.moduleId && p.resource === permission.resource
    );

    const newPermissions = [...role.permissions];
    if (existingIndex >= 0) {
      // Merge actions
      const existing = newPermissions[existingIndex];
      const mergedActions = [...new Set([...existing.actions, ...permission.actions])];
      newPermissions[existingIndex] = { ...existing, actions: mergedActions as PermissionAction[] };
    } else {
      newPermissions.push(permission);
    }

    this.setRolePermissions(roleId, newPermissions, updaterRole);
  }

  /**
   * Remove permission from role
   */
  removeRolePermission(
    roleId: string, 
    moduleId: string, 
    resource: string, 
    actions?: PermissionAction[],
    updaterRole: RoleType = 'super_admin'
  ): void {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role "${roleId}" not found`);
    }

    let newPermissions = [...role.permissions];

    if (actions) {
      // Remove specific actions
      newPermissions = newPermissions.map(p => {
        if (p.moduleId === moduleId && p.resource === resource) {
          return {
            ...p,
            actions: p.actions.filter(a => !actions.includes(a)),
          };
        }
        return p;
      }).filter(p => p.actions.length > 0);
    } else {
      // Remove entire resource permission
      newPermissions = newPermissions.filter(
        p => !(p.moduleId === moduleId && p.resource === resource)
      );
    }

    this.setRolePermissions(roleId, newPermissions, updaterRole);
  }

  // ============================================
  // Utility Methods
  // ============================================

  private clearCache(): void {
    this.userRoleCache.clear();
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(roleType: RoleType): number {
    return ROLE_HIERARCHY[roleType];
  }

  /**
   * Get parent roles in hierarchy
   */
  getParentRoles(roleType: RoleType): RoleType[] {
    const level = ROLE_HIERARCHY[roleType];
    return (Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
      .filter(([, l]) => l > level)
      .sort((a, b) => a[1] - b[1])
      .map(([type]) => type);
  }

  /**
   * Get child roles in hierarchy
   */
  getChildRoles(roleType: RoleType): RoleType[] {
    const level = ROLE_HIERARCHY[roleType];
    return (Object.entries(ROLE_HIERARCHY) as [RoleType, number][])
      .filter(([, l]) => l < level)
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
  }

  /**
   * Check if role is at or above a certain level
   */
  isAtLeast(roleType: RoleType, minimumType: RoleType): boolean {
    return ROLE_HIERARCHY[roleType] >= ROLE_HIERARCHY[minimumType];
  }

  /**
   * Export RBAC state
   */
  export(): Role[] {
    return this.getAllRoles();
  }

  /**
   * Import RBAC state
   */
  import(roles: Role[]): void {
    this.roles.clear();
    roles.forEach(role => this.roles.set(role.id, role));
    this.clearCache();
  }
}

// Singleton instance
export const rbac = new RBACSystem();

// Permission guard helper
export function requirePermission(
  user: User,
  moduleId: string,
  resource: string,
  action: PermissionAction,
  context?: Partial<AccessContext>
): void {
  const hasAccess = rbac.hasPermission(
    { user, ...context },
    { moduleId, resource, action }
  );

  if (!hasAccess) {
    throw new Error(`Access denied: ${action} on ${moduleId}/${resource}`);
  }
}

// Export types
export type { PermissionCheck, AccessContext };

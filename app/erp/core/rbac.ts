/**
 * HOME Platform - RBAC Permission System
 * Resource-Action based permissions with role hierarchy
 */

// =============================================================================
// PERMISSION TYPES
// =============================================================================

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'assign' | 'export'

export interface Permission {
  id: string
  resource: string
  action: PermissionAction
  conditions?: PermissionCondition[]
}

export interface PermissionCondition {
  field: string
  operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'lt' | 'contains' | 'own'
  value: unknown
}

export interface Role {
  id: string
  name: string
  nameVi: string
  description?: string
  level: number // Hierarchy level (0 = highest)
  permissions: string[] // Permission IDs
  parentRoleId?: string
  moduleAccess: string[] // Module IDs
  createdAt: Date
  updatedAt: Date
}

export interface UserPermissions {
  userId: string
  roles: string[]
  directPermissions: string[]
  teamId?: string
  departmentId?: string
}

// =============================================================================
// BUILT-IN ROLES
// =============================================================================

export const BUILT_IN_ROLES: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    nameVi: 'Quản trị viên cao cấp',
    description: 'Full system access',
    level: 0,
    permissions: ['*'], // All permissions
    moduleAccess: ['*'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'admin',
    name: 'Admin',
    nameVi: 'Quản trị viên',
    description: 'Administrative access',
    level: 1,
    permissions: ['*'],
    parentRoleId: 'super_admin',
    moduleAccess: ['crm', 'hrm', 'project', 'inventory', 'finance'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'manager',
    name: 'Manager',
    nameVi: 'Quản lý',
    description: 'Department management',
    level: 2,
    permissions: [
      // CRM
      'crm.lead.*', 'crm.pipeline.*', 'crm.activity.*',
      // HRM
      'hrm.employee.view', 'hrm.attendance.*', 'hrm.leave.approve',
      // Project
      'project.task.*', 'project.milestone.*',
      // Inventory
      'inventory.product.view', 'inventory.stock.*',
      // Finance
      'finance.invoice.view', 'finance.expense.approve',
    ],
    parentRoleId: 'admin',
    moduleAccess: ['crm', 'hrm', 'project', 'inventory', 'finance'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'staff',
    name: 'Staff',
    nameVi: 'Nhân viên',
    description: 'Basic staff access',
    level: 3,
    permissions: [
      'crm.lead.view', 'crm.lead.create', 'crm.lead.update.own',
      'hrm.attendance.view.own', 'hrm.attendance.create.own',
      'hrm.leave.view.own', 'hrm.leave.create.own',
      'project.task.view', 'project.task.update.own',
      'inventory.product.view',
      'finance.expense.view.own', 'finance.expense.create.own',
    ],
    parentRoleId: 'manager',
    moduleAccess: ['crm', 'hrm', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// RESOURCE DEFINITIONS
// =============================================================================

export const RESOURCES = {
  // CRM
  'crm.lead': { name: 'Leads', nameVi: 'Khách hàng tiềm năng', module: 'crm' },
  'crm.contact': { name: 'Contacts', nameVi: 'Liên hệ', module: 'crm' },
  'crm.deal': { name: 'Deals', nameVi: 'Cơ hội', module: 'crm' },
  'crm.pipeline': { name: 'Pipeline', nameVi: 'Pipeline', module: 'crm' },
  'crm.activity': { name: 'Activities', nameVi: 'Hoạt động', module: 'crm' },
  
  // HRM
  'hrm.employee': { name: 'Employees', nameVi: 'Nhân viên', module: 'hrm' },
  'hrm.attendance': { name: 'Attendance', nameVi: 'Chấm công', module: 'hrm' },
  'hrm.leave': { name: 'Leave', nameVi: 'Nghỉ phép', module: 'hrm' },
  'hrm.salary': { name: 'Salary', nameVi: 'Lương', module: 'hrm' },
  'hrm.contract': { name: 'Contract', nameVi: 'Hợp đồng', module: 'hrm' },
  
  // Project
  'project.project': { name: 'Projects', nameVi: 'Dự án', module: 'project' },
  'project.task': { name: 'Tasks', nameVi: 'Công việc', module: 'project' },
  'project.milestone': { name: 'Milestones', nameVi: 'Mốc dự án', module: 'project' },
  'project.document': { name: 'Documents', nameVi: 'Tài liệu', module: 'project' },
  
  // Inventory
  'inventory.product': { name: 'Products', nameVi: 'Sản phẩm', module: 'inventory' },
  'inventory.warehouse': { name: 'Warehouses', nameVi: 'Kho', module: 'inventory' },
  'inventory.stock': { name: 'Stock', nameVi: 'Tồn kho', module: 'inventory' },
  'inventory.transfer': { name: 'Transfers', nameVi: 'Chuyển kho', module: 'inventory' },
  
  // Finance
  'finance.invoice': { name: 'Invoices', nameVi: 'Hóa đơn', module: 'finance' },
  'finance.expense': { name: 'Expenses', nameVi: 'Chi phí', module: 'finance' },
  'finance.payment': { name: 'Payments', nameVi: 'Thanh toán', module: 'finance' },
  'finance.budget': { name: 'Budgets', nameVi: 'Ngân sách', module: 'finance' },
  
  // System
  'system.user': { name: 'Users', nameVi: 'Người dùng', module: 'system' },
  'system.role': { name: 'Roles', nameVi: 'Vai trò', module: 'system' },
  'system.setting': { name: 'Settings', nameVi: 'Cài đặt', module: 'system' },
  'system.audit': { name: 'Audit Logs', nameVi: 'Nhật ký', module: 'system' },
  'system.workflow': { name: 'Workflows', nameVi: 'Quy trình', module: 'system' },
} as const

// =============================================================================
// PERMISSION CHECKER
// =============================================================================

export class PermissionChecker {
  private userPermissions: UserPermissions
  private roleCache: Map<string, Role> = new Map()

  constructor(userPermissions: UserPermissions, roles: Role[] = BUILT_IN_ROLES) {
    this.userPermissions = userPermissions
    roles.forEach(role => this.roleCache.set(role.id, role))
  }

  // Check if user has permission
  can(resource: string, action: PermissionAction, context?: Record<string, unknown>): boolean {
    const permissionKey = `${resource}.${action}`
    
    // Check direct permissions
    if (this.userPermissions.directPermissions.includes(permissionKey)) {
      return true
    }
    if (this.userPermissions.directPermissions.includes(`${resource}.*`)) {
      return true
    }

    // Check role permissions
    for (const roleId of this.userPermissions.roles) {
      if (this.roleHasPermission(roleId, permissionKey, context)) {
        return true
      }
    }

    return false
  }

  // Check if user can access module
  canAccessModule(moduleId: string): boolean {
    for (const roleId of this.userPermissions.roles) {
      const role = this.roleCache.get(roleId)
      if (role) {
        if (role.moduleAccess.includes('*') || role.moduleAccess.includes(moduleId)) {
          return true
        }
      }
    }
    return false
  }

  // Get all permissions for user
  getAllPermissions(): string[] {
    const permissions = new Set<string>(this.userPermissions.directPermissions)

    for (const roleId of this.userPermissions.roles) {
      const role = this.roleCache.get(roleId)
      if (role) {
        role.permissions.forEach(p => permissions.add(p))
      }
    }

    return Array.from(permissions)
  }

  private roleHasPermission(roleId: string, permissionKey: string, context?: Record<string, unknown>): boolean {
    const role = this.roleCache.get(roleId)
    if (!role) return false

    // Wildcard permission
    if (role.permissions.includes('*')) return true

    // Exact match
    if (role.permissions.includes(permissionKey)) return true

    // Resource wildcard (e.g., crm.lead.*)
    const [module, resource] = permissionKey.split('.')
    if (role.permissions.includes(`${module}.${resource}.*`)) return true

    // Check "own" permission with context
    if (role.permissions.includes(`${permissionKey}.own`) && context) {
      if (context.ownerId === this.userPermissions.userId) {
        return true
      }
    }

    // Check parent role
    if (role.parentRoleId) {
      return this.roleHasPermission(role.parentRoleId, permissionKey, context)
    }

    return false
  }
}

// =============================================================================
// PERMISSION HOOK
// =============================================================================

import { useCallback, useMemo } from 'react'

export function usePermissions(userPermissions: UserPermissions) {
  const checker = useMemo(
    () => new PermissionChecker(userPermissions),
    [userPermissions]
  )

  const can = useCallback(
    (resource: string, action: PermissionAction, context?: Record<string, unknown>) => 
      checker.can(resource, action, context),
    [checker]
  )

  const canAccessModule = useCallback(
    (moduleId: string) => checker.canAccessModule(moduleId),
    [checker]
  )

  return { can, canAccessModule, checker }
}

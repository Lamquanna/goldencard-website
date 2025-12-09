/**
 * Module Registry - Dynamic Plugin Engine
 * 
 * Handles registration, enabling/disabling of modules,
 * and provides manifest information for the GoldenEnergy HOME platform.
 */

import { ModuleManifest, ModulePermission } from './types';

// Module definitions
const moduleDefinitions: ModuleManifest[] = [
  {
    id: 'crm',
    name: 'CRM',
    description: 'Customer Relationship Management - Leads, Contacts, Deals',
    icon: 'Users',
    route: '/home/modules/crm',
    version: '1.0.0',
    enabled: true,
    order: 1,
    permissions: [
      { resource: 'leads', actions: ['view', 'create', 'update', 'delete', 'assign', 'export'] },
      { resource: 'contacts', actions: ['view', 'create', 'update', 'delete', 'export'] },
      { resource: 'companies', actions: ['view', 'create', 'update', 'delete', 'export'] },
      { resource: 'deals', actions: ['view', 'create', 'update', 'delete', 'approve', 'export'] },
      { resource: 'activities', actions: ['view', 'create', 'update', 'delete'] },
      { resource: 'analytics', actions: ['view', 'export'] },
    ],
  },
  {
    id: 'hrm',
    name: 'HRM',
    description: 'Human Resource Management - Employees, Attendance, Leave',
    icon: 'UserCheck',
    route: '/home/modules/hrm',
    version: '1.0.0',
    enabled: true,
    order: 2,
    permissions: [
      { resource: 'employees', actions: ['view', 'create', 'update', 'delete', 'view_sensitive', 'export'] },
      { resource: 'attendance', actions: ['view', 'create', 'update', 'approve', 'export'] },
      { resource: 'leave', actions: ['view', 'create', 'update', 'approve', 'delete'] },
      { resource: 'contracts', actions: ['view', 'create', 'update', 'delete', 'view_sensitive'] },
      { resource: 'departments', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'org_chart', actions: ['view', 'manage'] },
    ],
  },
  {
    id: 'project',
    name: 'Project Management',
    description: 'Projects, Tasks, Kanban, Gantt Charts',
    icon: 'FolderKanban',
    route: '/home/modules/project',
    version: '1.0.0',
    enabled: true,
    order: 3,
    permissions: [
      { resource: 'projects', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'tasks', actions: ['view', 'create', 'update', 'delete', 'assign'] },
      { resource: 'milestones', actions: ['view', 'create', 'update', 'delete'] },
      { resource: 'resources', actions: ['view', 'assign', 'manage'] },
      { resource: 'project_chat', actions: ['view', 'create'] },
    ],
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Products, Stock, Warehouses, Movements',
    icon: 'Package',
    route: '/home/modules/inventory',
    version: '1.0.0',
    enabled: true,
    order: 4,
    permissions: [
      { resource: 'products', actions: ['view', 'create', 'update', 'delete', 'export'] },
      { resource: 'stock', actions: ['view', 'update', 'export'] },
      { resource: 'warehouses', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'movements', actions: ['view', 'create', 'approve', 'export'] },
      { resource: 'suppliers', actions: ['view', 'create', 'update', 'delete'] },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Invoices, Expenses, Payments, Cashflow',
    icon: 'DollarSign',
    route: '/home/modules/finance',
    version: '1.0.0',
    enabled: true,
    order: 5,
    permissions: [
      { resource: 'invoices', actions: ['view', 'create', 'update', 'delete', 'approve', 'export'] },
      { resource: 'expenses', actions: ['view', 'create', 'update', 'delete', 'approve', 'export'] },
      { resource: 'payments', actions: ['view', 'create', 'approve', 'export'] },
      { resource: 'cashflow', actions: ['view', 'export'] },
      { resource: 'reports', actions: ['view', 'create', 'export'] },
    ],
  },
  {
    id: 'adminhub',
    name: 'AdminHub',
    description: 'System Administration, Users, Roles, Audit Logs',
    icon: 'Settings',
    route: '/home/modules/adminhub',
    version: '1.0.0',
    enabled: true,
    order: 6,
    permissions: [
      { resource: 'users', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'roles', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'permissions', actions: ['view', 'manage'] },
      { resource: 'audit_logs', actions: ['view', 'export'] },
      { resource: 'integrations', actions: ['view', 'create', 'update', 'delete', 'manage'] },
      { resource: 'settings', actions: ['view', 'update'] },
    ],
  },
];

class ModuleRegistry {
  private modules: Map<string, ModuleManifest> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialize with default modules
    moduleDefinitions.forEach(module => {
      this.modules.set(module.id, module);
    });
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleManifest[] {
    return Array.from(this.modules.values()).sort((a, b) => a.order - b.order);
  }

  /**
   * Get only enabled modules
   */
  getEnabled(): ModuleManifest[] {
    return this.getAll().filter(m => m.enabled);
  }

  /**
   * Get a specific module by ID
   */
  get(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId);
  }

  /**
   * Register a new module
   */
  register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.id)) {
      throw new Error(`Module "${manifest.id}" is already registered`);
    }

    // Validate dependencies
    if (manifest.dependencies) {
      for (const depId of manifest.dependencies) {
        if (!this.modules.has(depId)) {
          throw new Error(`Module "${manifest.id}" depends on "${depId}" which is not registered`);
        }
      }
    }

    this.modules.set(manifest.id, manifest);
    this.notifyListeners();
  }

  /**
   * Unregister a module
   */
  unregister(moduleId: string): boolean {
    // Check if other modules depend on this
    const dependents = this.getAll().filter(m => 
      m.dependencies?.includes(moduleId)
    );

    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister "${moduleId}". The following modules depend on it: ${dependents.map(d => d.id).join(', ')}`
      );
    }

    const result = this.modules.delete(moduleId);
    if (result) {
      this.notifyListeners();
    }
    return result;
  }

  /**
   * Enable a module
   */
  enable(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module "${moduleId}" not found`);
    }

    // Enable dependencies first
    if (module.dependencies) {
      for (const depId of module.dependencies) {
        const dep = this.modules.get(depId);
        if (dep && !dep.enabled) {
          this.enable(depId);
        }
      }
    }

    if (!module.enabled) {
      this.modules.set(moduleId, { ...module, enabled: true });
      this.notifyListeners();
    }
  }

  /**
   * Disable a module
   */
  disable(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module "${moduleId}" not found`);
    }

    // Check dependents
    const dependents = this.getEnabled().filter(m => 
      m.dependencies?.includes(moduleId)
    );

    if (dependents.length > 0) {
      throw new Error(
        `Cannot disable "${moduleId}". The following enabled modules depend on it: ${dependents.map(d => d.id).join(', ')}`
      );
    }

    if (module.enabled) {
      this.modules.set(moduleId, { ...module, enabled: false });
      this.notifyListeners();
    }
  }

  /**
   * Check if a module is enabled
   */
  isEnabled(moduleId: string): boolean {
    return this.modules.get(moduleId)?.enabled ?? false;
  }

  /**
   * Get permissions for a module
   */
  getPermissions(moduleId: string): ModulePermission[] {
    return this.modules.get(moduleId)?.permissions ?? [];
  }

  /**
   * Get all available permissions across all modules
   */
  getAllPermissions(): { moduleId: string; moduleName: string; permissions: ModulePermission[] }[] {
    return this.getAll().map(m => ({
      moduleId: m.id,
      moduleName: m.name,
      permissions: m.permissions,
    }));
  }

  /**
   * Subscribe to registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Update module configuration
   */
  updateModule(moduleId: string, updates: Partial<ModuleManifest>): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module "${moduleId}" not found`);
    }

    this.modules.set(moduleId, { ...module, ...updates, id: moduleId });
    this.notifyListeners();
  }

  /**
   * Get module by route
   */
  getByRoute(route: string): ModuleManifest | undefined {
    return this.getAll().find(m => route.startsWith(m.route));
  }

  /**
   * Export registry state for persistence
   */
  export(): ModuleManifest[] {
    return this.getAll();
  }

  /**
   * Import registry state
   */
  import(modules: ModuleManifest[]): void {
    this.modules.clear();
    modules.forEach(m => this.modules.set(m.id, m));
    this.notifyListeners();
  }
}

// Singleton instance
export const moduleRegistry = new ModuleRegistry();

// Export types
export type { ModuleManifest, ModulePermission };

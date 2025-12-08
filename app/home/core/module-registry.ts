/**
 * HOME Platform - Module Registry
 * Central registry for all platform modules with dynamic loading
 */

import { ModuleManifest } from '../types'

// =============================================================================
// MODULE REGISTRY - Singleton Pattern
// =============================================================================

class ModuleRegistry {
  private static instance: ModuleRegistry
  private modules: Map<string, ModuleManifest> = new Map()
  private activeModules: Set<string> = new Set()
  private listeners: Set<() => void> = new Set()

  private constructor() {}

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry()
    }
    return ModuleRegistry.instance
  }

  // Register a module
  register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.id)) {
      console.warn(`Module ${manifest.id} is already registered`)
      return
    }
    this.modules.set(manifest.id, manifest)
    this.notifyListeners()
  }

  // Unregister a module
  unregister(moduleId: string): void {
    this.modules.delete(moduleId)
    this.activeModules.delete(moduleId)
    this.notifyListeners()
  }

  // Activate a module
  async activate(moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId)
    if (!module) {
      console.error(`Module ${moduleId} not found`)
      return false
    }

    // Check dependencies
    if (module.dependencies?.length) {
      for (const dep of module.dependencies) {
        if (!this.activeModules.has(dep)) {
          console.error(`Dependency ${dep} is not active for module ${moduleId}`)
          return false
        }
      }
    }

    // Run activation hook
    if (module.hooks?.onActivate) {
      try {
        await module.hooks.onActivate()
      } catch (error) {
        console.error(`Failed to activate module ${moduleId}:`, error)
        return false
      }
    }

    this.activeModules.add(moduleId)
    this.notifyListeners()
    return true
  }

  // Deactivate a module
  async deactivate(moduleId: string): Promise<boolean> {
    const module = this.modules.get(moduleId)
    if (!module) return false

    // Check if other modules depend on this
    for (const [id, m] of this.modules) {
      if (m.dependencies?.includes(moduleId) && this.activeModules.has(id)) {
        console.error(`Cannot deactivate ${moduleId}: module ${id} depends on it`)
        return false
      }
    }

    // Run deactivation hook
    if (module.hooks?.onDeactivate) {
      try {
        await module.hooks.onDeactivate()
      } catch (error) {
        console.error(`Failed to deactivate module ${moduleId}:`, error)
        return false
      }
    }

    this.activeModules.delete(moduleId)
    this.notifyListeners()
    return true
  }

  // Get module by ID
  getModule(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId)
  }

  // Get all registered modules
  getAllModules(): ModuleManifest[] {
    return Array.from(this.modules.values())
  }

  // Get active modules
  getActiveModules(): ModuleManifest[] {
    return Array.from(this.modules.values()).filter(m => this.activeModules.has(m.id))
  }

  // Check if module is active
  isActive(moduleId: string): boolean {
    return this.activeModules.has(moduleId)
  }

  // Get modules by category
  getModulesByCategory(category: string): ModuleManifest[] {
    return Array.from(this.modules.values()).filter(m => m.category === category)
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener())
  }

  // Generate navigation menu from active modules
  generateNavigation(): NavigationItem[] {
    const activeModules = this.getActiveModules()
    return activeModules
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(module => ({
        id: module.id,
        name: module.name,
        nameVi: module.nameVi,
        icon: module.icon,
        path: module.basePath,
        color: module.color,
        children: module.routes?.map(route => ({
          id: route.path,
          name: route.name,
          nameVi: route.nameVi,
          icon: route.icon,
          path: route.path,
        }))
      }))
  }
}

// Navigation item type
export interface NavigationItem {
  id: string
  name: string
  nameVi?: string
  icon?: string
  path: string
  color?: string
  children?: NavigationItem[]
}

// Export singleton instance
export const moduleRegistry = ModuleRegistry.getInstance()

// =============================================================================
// AUTO-REGISTER ALL MODULES
// =============================================================================

export async function initializeModules() {
  // Import all module manifests
  const modules = await Promise.all([
    import('../modules/crm').then(m => m.CRM_MODULE),
    import('../modules/hrm').then(m => m.HRMModuleManifest),
    import('../modules/project').then(m => m.ProjectModuleManifest),
    import('../modules/inventory').then(m => m.InventoryModuleManifest),
    import('../modules/finance').then(m => m.FinanceModuleManifest),
  ])

  // Register all modules
  modules.forEach(manifest => {
    if (manifest) {
      moduleRegistry.register(manifest)
    }
  })

  // Activate default modules
  const defaultModules = ['crm', 'hrm', 'project', 'inventory', 'finance']
  for (const moduleId of defaultModules) {
    await moduleRegistry.activate(moduleId)
  }

  return moduleRegistry
}

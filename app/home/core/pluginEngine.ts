// =============================================================================
// HOME PLATFORM - Plugin Engine
// Dynamic module loading and lifecycle management
// Inspired by: Notion, Salesforce AppExchange, Odoo
// =============================================================================

import { 
  ModuleManifest, 
  ModuleStatus, 
  PlatformEvent, 
  EventHandler,
  EventSubscription 
} from '../types';

// -----------------------------------------------------------------------------
// Plugin Registry - Central store for all modules
// -----------------------------------------------------------------------------

class PluginRegistry {
  private modules: Map<string, ModuleManifest> = new Map();
  private loadedComponents: Map<string, React.ComponentType> = new Map();
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private moduleConfigs: Map<string, Record<string, unknown>> = new Map();

  // Register a module
  register(manifest: ModuleManifest): void {
    if (this.modules.has(manifest.id)) {
      console.warn(`Module ${manifest.id} is already registered. Updating...`);
    }
    this.modules.set(manifest.id, {
      ...manifest,
      status: 'inactive',
      installedAt: new Date(),
    });
    console.log(`✅ Module registered: ${manifest.id} (${manifest.name})`);
  }

  // Unregister a module
  unregister(moduleId: string): boolean {
    const module = this.modules.get(moduleId);
    if (!module) return false;
    
    // Check dependencies
    const dependents = this.getDependents(moduleId);
    if (dependents.length > 0) {
      throw new Error(
        `Cannot unregister ${moduleId}: required by ${dependents.join(', ')}`
      );
    }

    this.modules.delete(moduleId);
    this.loadedComponents.delete(moduleId);
    console.log(`🗑️ Module unregistered: ${moduleId}`);
    return true;
  }

  // Get a module by ID
  get(moduleId: string): ModuleManifest | undefined {
    return this.modules.get(moduleId);
  }

  // Get all modules
  getAll(): ModuleManifest[] {
    return Array.from(this.modules.values());
  }

  // Get active modules
  getActive(): ModuleManifest[] {
    return this.getAll().filter(m => m.status === 'active');
  }

  // Get modules by category
  getByCategory(category: string): ModuleManifest[] {
    return this.getAll().filter(m => m.category === category);
  }

  // Check if module is registered
  has(moduleId: string): boolean {
    return this.modules.has(moduleId);
  }

  // Get modules that depend on a specific module
  getDependents(moduleId: string): string[] {
    return this.getAll()
      .filter(m => m.dependencies?.includes(moduleId))
      .map(m => m.id);
  }

  // Update module status
  updateStatus(moduleId: string, status: ModuleStatus): void {
    const module = this.modules.get(moduleId);
    if (module) {
      module.status = status;
      module.updatedAt = new Date();
      this.modules.set(moduleId, module);
    }
  }

  // Store module config
  setConfig(moduleId: string, config: Record<string, unknown>): void {
    this.moduleConfigs.set(moduleId, config);
  }

  // Get module config
  getConfig(moduleId: string): Record<string, unknown> | undefined {
    return this.moduleConfigs.get(moduleId);
  }
}

// -----------------------------------------------------------------------------
// Plugin Engine - Handles module lifecycle
// -----------------------------------------------------------------------------

class PluginEngine {
  private registry: PluginRegistry;
  private eventBus: EventBus;
  private initialized: boolean = false;

  constructor() {
    this.registry = new PluginRegistry();
    this.eventBus = new EventBus();
  }

  // Initialize the plugin engine
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Plugin Engine...');
    
    // Load core modules first
    await this.loadCoreModules();
    
    // Load installed modules from storage/database
    await this.loadInstalledModules();
    
    this.initialized = true;
    console.log('✅ Plugin Engine initialized');
  }

  // Load core modules (always required)
  private async loadCoreModules(): Promise<void> {
    const coreModules = ['dashboard', 'settings', 'users'];
    // Core modules are loaded by default
    console.log(`📦 Core modules ready: ${coreModules.join(', ')}`);
  }

  // Load installed modules from database
  private async loadInstalledModules(): Promise<void> {
    // In production, this would fetch from database
    // For now, we'll register available modules
    console.log('📦 Loading installed modules...');
  }

  // Install a module
  async install(manifest: ModuleManifest): Promise<boolean> {
    try {
      console.log(`📥 Installing module: ${manifest.id}...`);
      
      // Check dependencies
      if (manifest.dependencies) {
        for (const dep of manifest.dependencies) {
          if (!this.registry.has(dep)) {
            throw new Error(`Missing dependency: ${dep}`);
          }
          const depModule = this.registry.get(dep);
          if (depModule?.status !== 'active') {
            throw new Error(`Dependency not active: ${dep}`);
          }
        }
      }

      // Register module
      this.registry.register(manifest);
      this.registry.updateStatus(manifest.id, 'installing');

      // Run install hook
      if (manifest.hooks?.onInstall) {
        await manifest.hooks.onInstall();
      }

      // Activate module
      await this.activate(manifest.id);

      // Emit event
      this.eventBus.emit({
        type: 'module:installed',
        moduleId: manifest.id,
        payload: { manifest },
        timestamp: new Date(),
      });

      console.log(`✅ Module installed: ${manifest.id}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to install ${manifest.id}:`, error);
      this.registry.updateStatus(manifest.id, 'error');
      return false;
    }
  }

  // Uninstall a module
  async uninstall(moduleId: string): Promise<boolean> {
    try {
      const module = this.registry.get(moduleId);
      if (!module) {
        throw new Error(`Module not found: ${moduleId}`);
      }

      console.log(`🗑️ Uninstalling module: ${moduleId}...`);

      // Deactivate first
      await this.deactivate(moduleId);

      // Run uninstall hook
      if (module.hooks?.onUninstall) {
        await module.hooks.onUninstall();
      }

      // Unregister
      this.registry.unregister(moduleId);

      // Emit event
      this.eventBus.emit({
        type: 'module:uninstalled',
        moduleId,
        payload: {},
        timestamp: new Date(),
      });

      console.log(`✅ Module uninstalled: ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to uninstall ${moduleId}:`, error);
      return false;
    }
  }

  // Activate a module
  async activate(moduleId: string): Promise<boolean> {
    try {
      const module = this.registry.get(moduleId);
      if (!module) {
        throw new Error(`Module not found: ${moduleId}`);
      }

      if (module.status === 'active') {
        return true;
      }

      console.log(`⚡ Activating module: ${moduleId}...`);

      // Run activate hook
      if (module.hooks?.onActivate) {
        await module.hooks.onActivate();
      }

      this.registry.updateStatus(moduleId, 'active');

      // Emit event
      this.eventBus.emit({
        type: 'module:activated',
        moduleId,
        payload: {},
        timestamp: new Date(),
      });

      console.log(`✅ Module activated: ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to activate ${moduleId}:`, error);
      this.registry.updateStatus(moduleId, 'error');
      return false;
    }
  }

  // Deactivate a module
  async deactivate(moduleId: string): Promise<boolean> {
    try {
      const module = this.registry.get(moduleId);
      if (!module) {
        throw new Error(`Module not found: ${moduleId}`);
      }

      // Check if other active modules depend on this
      const dependents = this.registry.getDependents(moduleId)
        .filter(id => this.registry.get(id)?.status === 'active');
      
      if (dependents.length > 0) {
        throw new Error(
          `Cannot deactivate: active modules depend on it (${dependents.join(', ')})`
        );
      }

      console.log(`💤 Deactivating module: ${moduleId}...`);

      // Run deactivate hook
      if (module.hooks?.onDeactivate) {
        await module.hooks.onDeactivate();
      }

      this.registry.updateStatus(moduleId, 'inactive');

      // Emit event
      this.eventBus.emit({
        type: 'module:deactivated',
        moduleId,
        payload: {},
        timestamp: new Date(),
      });

      console.log(`✅ Module deactivated: ${moduleId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to deactivate ${moduleId}:`, error);
      return false;
    }
  }

  // Get registry
  getRegistry(): PluginRegistry {
    return this.registry;
  }

  // Get event bus
  getEventBus(): EventBus {
    return this.eventBus;
  }

  // Dynamic import a module component
  async loadComponent(moduleId: string, componentPath: string): Promise<React.ComponentType | null> {
    try {
      const module = this.registry.get(moduleId);
      if (!module || module.status !== 'active') {
        throw new Error(`Module ${moduleId} is not active`);
      }

      // Dynamic import
      const imported = await import(`../modules/${moduleId}/${componentPath}`);
      return imported.default || imported;
    } catch (error) {
      console.error(`Failed to load component ${moduleId}/${componentPath}:`, error);
      return null;
    }
  }
}

// -----------------------------------------------------------------------------
// Event Bus - Cross-module communication
// -----------------------------------------------------------------------------

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private wildcardHandlers: Set<EventHandler> = new Set();

  // Subscribe to events
  on<T = unknown>(eventType: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler as EventHandler);

    return {
      unsubscribe: () => {
        this.handlers.get(eventType)?.delete(handler as EventHandler);
      },
    };
  }

  // Subscribe to all events
  onAny(handler: EventHandler): EventSubscription {
    this.wildcardHandlers.add(handler);
    return {
      unsubscribe: () => {
        this.wildcardHandlers.delete(handler);
      },
    };
  }

  // Emit an event
  emit<T = unknown>(event: PlatformEvent<T>): void {
    // Notify specific handlers
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event as PlatformEvent);
        } catch (error) {
          console.error(`Event handler error for ${event.type}:`, error);
        }
      });
    }

    // Notify wildcard handlers
    this.wildcardHandlers.forEach(handler => {
      try {
        handler(event as PlatformEvent);
      } catch (error) {
        console.error(`Wildcard handler error for ${event.type}:`, error);
      }
    });
  }

  // Remove all handlers for an event type
  off(eventType: string): void {
    this.handlers.delete(eventType);
  }

  // Clear all handlers
  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
  }
}

// -----------------------------------------------------------------------------
// Singleton instance
// -----------------------------------------------------------------------------

let pluginEngineInstance: PluginEngine | null = null;

export function getPluginEngine(): PluginEngine {
  if (!pluginEngineInstance) {
    pluginEngineInstance = new PluginEngine();
  }
  return pluginEngineInstance;
}

export function getEventBus(): EventBus {
  return getPluginEngine().getEventBus();
}

export function getRegistry(): PluginRegistry {
  return getPluginEngine().getRegistry();
}

// -----------------------------------------------------------------------------
// Module Definition Helper
// -----------------------------------------------------------------------------

export function defineModule(manifest: Omit<ModuleManifest, 'status' | 'installedAt' | 'updatedAt'>): ModuleManifest {
  return manifest as ModuleManifest;
}

// Export classes for type usage
export { PluginEngine, PluginRegistry, EventBus };

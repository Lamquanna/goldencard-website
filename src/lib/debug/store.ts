// ============================================================================
// DEVELOPER DEBUG PANEL - STORE
// GoldenEnergy HOME Platform - Debug State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  DebugPanelState,
  DebugPanelActions,
  DebugPanelConfig,
  LogLevel,
  LogEntry,
  LogFilter,
  NetworkRequest,
  RegisteredStore,
  StoreSnapshot,
  StateDiff,
  PerformanceMetric,
  ComponentRenderInfo,
  MemoryInfo,
  FeatureFlag,
  FeatureFlagOverride,
  PanelPosition,
  DebugTab,
} from './types';

// ============================================================================
// UTILITIES
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function computeDiff(oldState: unknown, newState: unknown, path: string = ''): StateDiff[] {
  const diffs: StateDiff[] = [];
  
  if (oldState === newState) return diffs;
  
  if (typeof oldState !== typeof newState) {
    diffs.push({ path: path || 'root', oldValue: oldState, newValue: newState, type: 'change' });
    return diffs;
  }
  
  if (typeof oldState !== 'object' || oldState === null || newState === null) {
    diffs.push({ path: path || 'root', oldValue: oldState, newValue: newState, type: 'change' });
    return diffs;
  }
  
  const oldObj = oldState as Record<string, unknown>;
  const newObj = newState as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key;
    
    if (!(key in oldObj)) {
      diffs.push({ path: newPath, oldValue: undefined, newValue: newObj[key], type: 'add' });
    } else if (!(key in newObj)) {
      diffs.push({ path: newPath, oldValue: oldObj[key], newValue: undefined, type: 'remove' });
    } else if (oldObj[key] !== newObj[key]) {
      if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
        diffs.push(...computeDiff(oldObj[key], newObj[key], newPath));
      } else {
        diffs.push({ path: newPath, oldValue: oldObj[key], newValue: newObj[key], type: 'change' });
      }
    }
  }
  
  return diffs;
}

// ============================================================================
// DEFAULT CONFIG
// ============================================================================

const defaultConfig: DebugPanelConfig = {
  enabled: process.env.NODE_ENV === 'development',
  position: 'bottom',
  expanded: false,
  height: 300,
  width: 400,
  activeTab: 'console',
  pinnedTabs: ['console', 'network'],
  console: {
    maxEntries: 500,
    showTimestamp: true,
    showCategory: true,
    preserveOnNavigate: true,
  },
  network: {
    maxEntries: 200,
    preserveOnNavigate: false,
    captureRequestBody: true,
    captureResponseBody: true,
  },
  state: {
    maxSnapshots: 50,
    autoCapture: true,
  },
  performance: {
    enableRenderTracking: true,
    enableMemoryTracking: true,
    sampleRate: 1000, // ms
  },
};

const defaultLogFilter: LogFilter = {
  levels: ['debug', 'info', 'warn', 'error', 'trace'],
  categories: [],
  searchQuery: '',
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: DebugPanelState = {
  config: defaultConfig,
  logs: [],
  logFilter: defaultLogFilter,
  requests: [],
  stores: new Map(),
  snapshots: [],
  metrics: [],
  componentRenders: new Map(),
  memoryHistory: [],
  featureFlags: new Map(),
  flagOverrides: new Map(),
};

// ============================================================================
// STORE DEFINITION
// ============================================================================

type DebugStore = DebugPanelState & DebugPanelActions;

export const useDebugStore = create<DebugStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ========================================
        // CONFIG ACTIONS
        // ========================================
        
        setConfig: (config) => {
          set(
            (state) => ({
              config: { ...state.config, ...config },
            }),
            false,
            'debug/setConfig'
          );
        },

        togglePanel: () => {
          set(
            (state) => ({
              config: { ...state.config, expanded: !state.config.expanded },
            }),
            false,
            'debug/togglePanel'
          );
        },

        setActiveTab: (tab) => {
          set(
            (state) => ({
              config: { ...state.config, activeTab: tab },
            }),
            false,
            'debug/setActiveTab'
          );
        },

        setPosition: (position) => {
          set(
            (state) => ({
              config: { ...state.config, position },
            }),
            false,
            'debug/setPosition'
          );
        },

        // ========================================
        // LOG ACTIONS
        // ========================================

        log: (level, category, message, data) => {
          const entry: LogEntry = {
            id: generateId(),
            timestamp: new Date(),
            level,
            category,
            message,
            data,
            source: typeof window !== 'undefined' ? window.location.pathname : undefined,
          };

          set(
            (state) => {
              const logs = [entry, ...state.logs];
              if (logs.length > state.config.console.maxEntries) {
                logs.pop();
              }
              return { logs };
            },
            false,
            'debug/log'
          );

          // Also log to console in development
          if (process.env.NODE_ENV === 'development') {
            const consoleFn = console[level] || console.log;
            consoleFn(`[${category}]`, message, data !== undefined ? data : '');
          }
        },

        clearLogs: () => {
          set({ logs: [] }, false, 'debug/clearLogs');
        },

        setLogFilter: (filter) => {
          set(
            (state) => ({
              logFilter: { ...state.logFilter, ...filter },
            }),
            false,
            'debug/setLogFilter'
          );
        },

        exportLogs: () => {
          const { logs, logFilter } = get();
          const filtered = logs.filter((log) => {
            if (!logFilter.levels.includes(log.level)) return false;
            if (logFilter.categories.length > 0 && !logFilter.categories.includes(log.category)) return false;
            if (logFilter.searchQuery && !log.message.toLowerCase().includes(logFilter.searchQuery.toLowerCase())) return false;
            return true;
          });
          return JSON.stringify(filtered, null, 2);
        },

        // ========================================
        // NETWORK ACTIONS
        // ========================================

        trackRequest: (request) => {
          const id = generateId();
          const entry: NetworkRequest = { ...request, id };

          set(
            (state) => {
              const requests = [entry, ...state.requests];
              if (requests.length > state.config.network.maxEntries) {
                requests.pop();
              }
              return { requests };
            },
            false,
            'debug/trackRequest'
          );

          return id;
        },

        updateRequest: (id, update) => {
          set(
            (state) => ({
              requests: state.requests.map((req) =>
                req.id === id ? { ...req, ...update } : req
              ),
            }),
            false,
            'debug/updateRequest'
          );
        },

        clearRequests: () => {
          set({ requests: [] }, false, 'debug/clearRequests');
        },

        // ========================================
        // STATE ACTIONS
        // ========================================

        registerStore: (store) => {
          set(
            (state) => {
              const stores = new Map(state.stores);
              stores.set(store.name, store);
              return { stores };
            },
            false,
            'debug/registerStore'
          );
        },

        unregisterStore: (name) => {
          set(
            (state) => {
              const stores = new Map(state.stores);
              stores.delete(name);
              return { stores };
            },
            false,
            'debug/unregisterStore'
          );
        },

        captureSnapshot: (storeName, action) => {
          const store = get().stores.get(storeName);
          if (!store) return;

          const currentState = store.getState();
          const lastSnapshot = get().snapshots.find((s) => s.storeName === storeName);
          
          const snapshot: StoreSnapshot = {
            id: generateId(),
            timestamp: new Date(),
            storeName,
            state: currentState,
            action,
            diff: lastSnapshot ? computeDiff(lastSnapshot.state, currentState) : undefined,
          };

          set(
            (state) => {
              const snapshots = [snapshot, ...state.snapshots];
              if (snapshots.length > state.config.state.maxSnapshots) {
                snapshots.pop();
              }
              return { snapshots };
            },
            false,
            'debug/captureSnapshot'
          );
        },

        clearSnapshots: () => {
          set({ snapshots: [] }, false, 'debug/clearSnapshots');
        },

        // ========================================
        // PERFORMANCE ACTIONS
        // ========================================

        recordMetric: (metric) => {
          const entry: PerformanceMetric = {
            ...metric,
            id: generateId(),
            timestamp: new Date(),
          };

          set(
            (state) => ({
              metrics: [entry, ...state.metrics].slice(0, 1000),
            }),
            false,
            'debug/recordMetric'
          );
        },

        recordRender: (componentName, renderTime) => {
          set(
            (state) => {
              const renders = new Map(state.componentRenders);
              const existing = renders.get(componentName);
              
              if (existing) {
                const newCount = existing.renderCount + 1;
                const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;
                renders.set(componentName, {
                  ...existing,
                  renderCount: newCount,
                  lastRenderTime: renderTime,
                  averageRenderTime: newAverage,
                });
              } else {
                renders.set(componentName, {
                  componentName,
                  renderCount: 1,
                  lastRenderTime: renderTime,
                  averageRenderTime: renderTime,
                });
              }
              
              return { componentRenders: renders };
            },
            false,
            'debug/recordRender'
          );
        },

        clearMetrics: () => {
          set(
            {
              metrics: [],
              componentRenders: new Map(),
              memoryHistory: [],
            },
            false,
            'debug/clearMetrics'
          );
        },

        // ========================================
        // FEATURE FLAG ACTIONS
        // ========================================

        registerFlag: (flag) => {
          set(
            (state) => {
              const flags = new Map(state.featureFlags);
              flags.set(flag.id, flag);
              return { featureFlags: flags };
            },
            false,
            'debug/registerFlag'
          );
        },

        setFlagOverride: (flagId, enabled, expiresAt) => {
          set(
            (state) => {
              const overrides = new Map(state.flagOverrides);
              overrides.set(flagId, { flagId, enabled, expiresAt });
              return { flagOverrides: overrides };
            },
            false,
            'debug/setFlagOverride'
          );
        },

        clearFlagOverride: (flagId) => {
          set(
            (state) => {
              const overrides = new Map(state.flagOverrides);
              overrides.delete(flagId);
              return { flagOverrides: overrides };
            },
            false,
            'debug/clearFlagOverride'
          );
        },

        clearAllOverrides: () => {
          set({ flagOverrides: new Map() }, false, 'debug/clearAllOverrides');
        },

        isFlagEnabled: (flagId) => {
          const { featureFlags, flagOverrides } = get();
          const flag = featureFlags.get(flagId);
          const override = flagOverrides.get(flagId);

          // Check if override is expired
          if (override && override.expiresAt && new Date() > override.expiresAt) {
            return flag?.enabled ?? flag?.defaultValue ?? false;
          }

          // Use override if exists
          if (override) {
            return override.enabled;
          }

          // Use flag value
          return flag?.enabled ?? flag?.defaultValue ?? false;
        },

        // ========================================
        // RESET
        // ========================================

        reset: () => {
          set(
            {
              ...initialState,
              config: get().config, // Preserve config
            },
            false,
            'debug/reset'
          );
        },
      }),
      {
        name: 'debug-storage',
        partialize: (state) => ({
          config: state.config,
          featureFlags: Array.from(state.featureFlags.entries()),
          flagOverrides: Array.from(state.flagOverrides.entries()),
        }),
        merge: (persisted, current) => {
          const persistedState = persisted as Partial<DebugPanelState> & {
            featureFlags?: [string, FeatureFlag][];
            flagOverrides?: [string, FeatureFlagOverride][];
          };
          return {
            ...current,
            ...persistedState,
            featureFlags: new Map(persistedState.featureFlags || []),
            flagOverrides: new Map(persistedState.flagOverrides || []),
          };
        },
      }
    ),
    { name: 'DebugStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectIsEnabled = (state: DebugStore) => state.config.enabled;
export const selectIsExpanded = (state: DebugStore) => state.config.expanded;
export const selectActiveTab = (state: DebugStore) => state.config.activeTab;
export const selectPosition = (state: DebugStore) => state.config.position;

export const selectFilteredLogs = (state: DebugStore) => {
  const { logs, logFilter } = state;
  return logs.filter((log) => {
    if (!logFilter.levels.includes(log.level)) return false;
    if (logFilter.categories.length > 0 && !logFilter.categories.includes(log.category)) return false;
    if (logFilter.searchQuery && !log.message.toLowerCase().includes(logFilter.searchQuery.toLowerCase())) return false;
    return true;
  });
};

export const selectRequestsByStatus = (state: DebugStore) => {
  return {
    pending: state.requests.filter((r) => r.status === 'pending'),
    success: state.requests.filter((r) => r.status === 'success'),
    error: state.requests.filter((r) => r.status === 'error'),
  };
};

export const selectRegisteredStores = (state: DebugStore) => 
  Array.from(state.stores.keys());

export const selectEnabledFlags = (state: DebugStore) => {
  const flags: string[] = [];
  for (const [id, flag] of state.featureFlags) {
    if (state.isFlagEnabled(id)) {
      flags.push(id);
    }
  }
  return flags;
};

// ============================================================================
// DEVELOPER DEBUG PANEL - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Debug & Developer Tools Types
// ============================================================================

// ============================================================================
// DEBUG LOG TYPES
// ============================================================================

/** Log levels */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'trace';

/** Log entry */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
  source?: string;
  stackTrace?: string;
}

/** Log filter options */
export interface LogFilter {
  levels: LogLevel[];
  categories: string[];
  searchQuery: string;
  startDate?: Date;
  endDate?: Date;
}

// ============================================================================
// NETWORK REQUEST TYPES
// ============================================================================

/** HTTP method */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

/** Request status */
export type RequestStatus = 'pending' | 'success' | 'error' | 'cancelled';

/** Network request entry */
export interface NetworkRequest {
  id: string;
  url: string;
  method: HttpMethod;
  status: RequestStatus;
  statusCode?: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: string;
  size?: number;
}

// ============================================================================
// STATE INSPECTION TYPES
// ============================================================================

/** Store snapshot */
export interface StoreSnapshot {
  id: string;
  timestamp: Date;
  storeName: string;
  state: unknown;
  action?: string;
  diff?: StateDiff[];
}

/** State difference */
export interface StateDiff {
  path: string;
  oldValue: unknown;
  newValue: unknown;
  type: 'add' | 'remove' | 'change';
}

/** Registered store info */
export interface RegisteredStore {
  name: string;
  getState: () => unknown;
  subscribe?: (callback: () => void) => () => void;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

/** Performance metric */
export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'render' | 'network' | 'memory' | 'custom';
  metadata?: Record<string, unknown>;
}

/** Component render info */
export interface ComponentRenderInfo {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  props?: Record<string, unknown>;
}

/** Memory info */
export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: Date;
}

// ============================================================================
// FEATURE FLAGS TYPES
// ============================================================================

/** Feature flag */
export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue: boolean;
  environment?: string[];
  metadata?: Record<string, unknown>;
}

/** Feature flag override */
export interface FeatureFlagOverride {
  flagId: string;
  enabled: boolean;
  expiresAt?: Date;
}

// ============================================================================
// DEBUG PANEL CONFIGURATION
// ============================================================================

/** Debug panel position */
export type PanelPosition = 'bottom' | 'right' | 'left' | 'floating';

/** Debug panel tab */
export type DebugTab = 'console' | 'network' | 'state' | 'performance' | 'flags' | 'settings';

/** Debug panel configuration */
export interface DebugPanelConfig {
  /** Is panel enabled */
  enabled: boolean;
  /** Panel position */
  position: PanelPosition;
  /** Is panel expanded */
  expanded: boolean;
  /** Panel height (for bottom position) */
  height: number;
  /** Panel width (for side positions) */
  width: number;
  /** Active tab */
  activeTab: DebugTab;
  /** Pinned tabs */
  pinnedTabs: DebugTab[];
  /** Console settings */
  console: {
    maxEntries: number;
    showTimestamp: boolean;
    showCategory: boolean;
    preserveOnNavigate: boolean;
  };
  /** Network settings */
  network: {
    maxEntries: number;
    preserveOnNavigate: boolean;
    captureRequestBody: boolean;
    captureResponseBody: boolean;
  };
  /** State settings */
  state: {
    maxSnapshots: number;
    autoCapture: boolean;
  };
  /** Performance settings */
  performance: {
    enableRenderTracking: boolean;
    enableMemoryTracking: boolean;
    sampleRate: number;
  };
}

// ============================================================================
// DEBUG PANEL STATE
// ============================================================================

/** Debug panel state */
export interface DebugPanelState {
  /** Configuration */
  config: DebugPanelConfig;
  /** Log entries */
  logs: LogEntry[];
  /** Log filter */
  logFilter: LogFilter;
  /** Network requests */
  requests: NetworkRequest[];
  /** Registered stores */
  stores: Map<string, RegisteredStore>;
  /** State snapshots */
  snapshots: StoreSnapshot[];
  /** Performance metrics */
  metrics: PerformanceMetric[];
  /** Component renders */
  componentRenders: Map<string, ComponentRenderInfo>;
  /** Memory history */
  memoryHistory: MemoryInfo[];
  /** Feature flags */
  featureFlags: Map<string, FeatureFlag>;
  /** Feature flag overrides */
  flagOverrides: Map<string, FeatureFlagOverride>;
}

/** Debug panel actions */
export interface DebugPanelActions {
  // Config
  setConfig: (config: Partial<DebugPanelConfig>) => void;
  togglePanel: () => void;
  setActiveTab: (tab: DebugTab) => void;
  setPosition: (position: PanelPosition) => void;
  
  // Logs
  log: (level: LogLevel, category: string, message: string, data?: unknown) => void;
  clearLogs: () => void;
  setLogFilter: (filter: Partial<LogFilter>) => void;
  exportLogs: () => string;
  
  // Network
  trackRequest: (request: Omit<NetworkRequest, 'id'>) => string;
  updateRequest: (id: string, update: Partial<NetworkRequest>) => void;
  clearRequests: () => void;
  
  // State
  registerStore: (store: RegisteredStore) => void;
  unregisterStore: (name: string) => void;
  captureSnapshot: (storeName: string, action?: string) => void;
  clearSnapshots: () => void;
  
  // Performance
  recordMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void;
  recordRender: (componentName: string, renderTime: number) => void;
  clearMetrics: () => void;
  
  // Feature flags
  registerFlag: (flag: FeatureFlag) => void;
  setFlagOverride: (flagId: string, enabled: boolean, expiresAt?: Date) => void;
  clearFlagOverride: (flagId: string) => void;
  clearAllOverrides: () => void;
  isFlagEnabled: (flagId: string) => boolean;
  
  // Reset
  reset: () => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Environment detection */
export interface EnvironmentInfo {
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  userAgent: string;
  platform: string;
  language: string;
  timezone: string;
  screenSize: { width: number; height: number };
  viewportSize: { width: number; height: number };
  devicePixelRatio: number;
  online: boolean;
}

/** Debug command */
export interface DebugCommand {
  name: string;
  description: string;
  shortcut?: string;
  handler: (...args: unknown[]) => void;
}

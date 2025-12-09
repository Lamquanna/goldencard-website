// ============================================================================
// DEVELOPER DEBUG PANEL - BARREL EXPORTS
// GoldenEnergy HOME Platform - Debug & Developer Tools
// ============================================================================

// Types
export type {
  LogLevel,
  LogEntry,
  LogFilter,
  HttpMethod,
  RequestStatus,
  NetworkRequest,
  StoreSnapshot,
  StateDiff,
  RegisteredStore,
  PerformanceMetric,
  ComponentRenderInfo,
  MemoryInfo,
  FeatureFlag,
  FeatureFlagOverride,
  PanelPosition,
  DebugTab,
  DebugPanelConfig,
  DebugPanelState,
  DebugPanelActions,
  EnvironmentInfo,
  DebugCommand,
} from './types';

// Store
import { useDebugStore as _useDebugStore } from './store';

export {
  useDebugStore,
  selectIsEnabled,
  selectIsExpanded,
  selectActiveTab,
  selectPosition,
  selectFilteredLogs,
  selectRequestsByStatus,
  selectRegisteredStores,
  selectEnabledFlags,
} from './store';

// Hooks
export {
  useDebugLogger,
  useNetworkTracker,
  useRenderTracker,
  usePerformanceMetric,
  useStoreTracker,
  useFeatureFlag,
  useFeatureFlagOverride,
  useDebugPanel,
  useMemoryTracker,
} from './hooks';

// Components
export {
  DebugPanel,
  ConsoleTab,
  NetworkTab,
  StateTab,
  PerformanceTab,
  FlagsTab,
  SettingsTab,
} from './components';

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick log function for debug messages
 */
export function debugLog(category: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    const { log } = _useDebugStore.getState();
    log('debug', category, message, data);
  }
}

/**
 * Quick log function for info messages
 */
export function infoLog(category: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    const { log } = _useDebugStore.getState();
    log('info', category, message, data);
  }
}

/**
 * Quick log function for warning messages
 */
export function warnLog(category: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    const { log } = _useDebugStore.getState();
    log('warn', category, message, data);
  }
}

/**
 * Quick log function for error messages
 */
export function errorLog(category: string, message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    const { log } = _useDebugStore.getState();
    log('error', category, message, data);
  }
}

/**
 * Check if a feature flag is enabled
 */
export function isFeatureEnabled(flagId: string): boolean {
  return _useDebugStore.getState().isFlagEnabled(flagId);
}

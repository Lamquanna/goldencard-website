// ============================================================================
// DEVELOPER DEBUG PANEL - HOOK UTILITIES
// GoldenEnergy HOME Platform - Debug Hooks
// ============================================================================

import { useCallback, useEffect, useRef } from 'react';
import { useDebugStore } from './store';
import type { HttpMethod, PerformanceMetric } from './types';

// ============================================================================
// LOGGING HOOK
// ============================================================================

export interface UseDebugLoggerOptions {
  category: string;
  enabled?: boolean;
}

export function useDebugLogger(options: UseDebugLoggerOptions) {
  const { category, enabled = true } = options;
  const log = useDebugStore((state) => state.log);
  const config = useDebugStore((state) => state.config);

  const isEnabled = enabled && config.enabled;

  return {
    debug: useCallback(
      (message: string, data?: unknown) => {
        if (isEnabled) log('debug', category, message, data);
      },
      [isEnabled, log, category]
    ),
    info: useCallback(
      (message: string, data?: unknown) => {
        if (isEnabled) log('info', category, message, data);
      },
      [isEnabled, log, category]
    ),
    warn: useCallback(
      (message: string, data?: unknown) => {
        if (isEnabled) log('warn', category, message, data);
      },
      [isEnabled, log, category]
    ),
    error: useCallback(
      (message: string, data?: unknown) => {
        if (isEnabled) log('error', category, message, data);
      },
      [isEnabled, log, category]
    ),
    trace: useCallback(
      (message: string, data?: unknown) => {
        if (isEnabled) log('trace', category, message, data);
      },
      [isEnabled, log, category]
    ),
  };
}

// ============================================================================
// NETWORK TRACKING HOOK
// ============================================================================

export function useNetworkTracker() {
  const trackRequest = useDebugStore((state) => state.trackRequest);
  const updateRequest = useDebugStore((state) => state.updateRequest);
  const config = useDebugStore((state) => state.config);

  const track = useCallback(
    async <T>(
      url: string,
      method: HttpMethod,
      fetchFn: () => Promise<Response>
    ): Promise<{ response: Response; data: T }> => {
      if (!config.enabled) {
        const response = await fetchFn();
        const data = await response.json();
        return { response, data };
      }

      const startTime = performance.now();
      const id = trackRequest({
        url,
        method,
        startTime: new Date(),
        status: 'pending',
      });

      try {
        const response = await fetchFn();
        const endTime = performance.now();
        const data = await response.json();

        updateRequest(id, {
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          duration: endTime - startTime,
          responseBody: config.network.captureResponseBody ? data : undefined,
          endTime: new Date(),
        });

        return { response, data };
      } catch (error) {
        const endTime = performance.now();
        updateRequest(id, {
          status: 'error',
          duration: endTime - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date(),
        });
        throw error;
      }
    },
    [config, trackRequest, updateRequest]
  );

  return { track };
}

// ============================================================================
// RENDER TRACKING HOOK
// ============================================================================

export function useRenderTracker(componentName: string) {
  const recordRender = useDebugStore((state) => state.recordRender);
  const config = useDebugStore((state) => state.config);
  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    if (config.enabled && config.performance.enableRenderTracking) {
      const renderTime = performance.now() - renderStartRef.current;
      recordRender(componentName, renderTime);
    }
  });

  // Mark render start
  renderStartRef.current = performance.now();
}

// ============================================================================
// PERFORMANCE METRIC HOOK
// ============================================================================

export function usePerformanceMetric(defaultCategory: PerformanceMetric['category'] = 'custom') {
  const recordMetric = useDebugStore((state) => state.recordMetric);
  const config = useDebugStore((state) => state.config);

  const record = useCallback(
    (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => {
      if (config.enabled) {
        recordMetric(metric);
      }
    },
    [config.enabled, recordMetric]
  );

  const measure = useCallback(
    async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
      if (!config.enabled) {
        return fn();
      }

      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        record({ name, value: duration, unit: 'ms', category: defaultCategory });
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        record({ name, value: duration, unit: 'ms', category: defaultCategory, metadata: { error: true } });
        throw error;
      }
    },
    [config.enabled, record, defaultCategory]
  );

  return { record, measure };
}

// ============================================================================
// STORE TRACKING HOOK
// ============================================================================

export interface UseStoreTrackerOptions {
  name: string;
  getState: () => unknown;
  subscribe?: (listener: () => void) => () => void;
}

export function useStoreTracker(options: UseStoreTrackerOptions) {
  const { name, getState, subscribe } = options;
  const registerStore = useDebugStore((state) => state.registerStore);
  const unregisterStore = useDebugStore((state) => state.unregisterStore);
  const captureSnapshot = useDebugStore((state) => state.captureSnapshot);
  const config = useDebugStore((state) => state.config);

  useEffect(() => {
    if (!config.enabled) return;

    registerStore({ name, getState });

    // Initial snapshot
    captureSnapshot(name, 'init');

    // Subscribe to changes
    if (subscribe && config.state.autoCapture) {
      const unsubscribe = subscribe(() => {
        captureSnapshot(name, 'update');
      });
      return () => {
        unsubscribe();
        unregisterStore(name);
      };
    }

    return () => {
      unregisterStore(name);
    };
  }, [name, getState, subscribe, config.enabled, config.state.autoCapture, registerStore, unregisterStore, captureSnapshot]);
}

// ============================================================================
// FEATURE FLAG HOOK
// ============================================================================

export function useFeatureFlag(flagId: string): boolean {
  const isFlagEnabled = useDebugStore((state) => state.isFlagEnabled);
  return isFlagEnabled(flagId);
}

export function useFeatureFlagOverride(flagId: string) {
  const setFlagOverride = useDebugStore((state) => state.setFlagOverride);
  const clearFlagOverride = useDebugStore((state) => state.clearFlagOverride);
  const flagOverrides = useDebugStore((state) => state.flagOverrides);

  const override = flagOverrides.get(flagId);

  return {
    hasOverride: !!override,
    overrideValue: override?.enabled,
    setOverride: (enabled: boolean, expiresAt?: Date) => 
      setFlagOverride(flagId, enabled, expiresAt),
    clearOverride: () => clearFlagOverride(flagId),
  };
}

// ============================================================================
// DEBUG PANEL VISIBILITY HOOK
// ============================================================================

export function useDebugPanel() {
  const isEnabled = useDebugStore((state) => state.config.enabled);
  const isExpanded = useDebugStore((state) => state.config.expanded);
  const activeTab = useDebugStore((state) => state.config.activeTab);
  const position = useDebugStore((state) => state.config.position);
  const togglePanel = useDebugStore((state) => state.togglePanel);
  const setActiveTab = useDebugStore((state) => state.setActiveTab);
  const setPosition = useDebugStore((state) => state.setPosition);

  return {
    isEnabled,
    isExpanded,
    activeTab,
    position,
    toggle: togglePanel,
    setTab: setActiveTab,
    setPosition,
  };
}

// ============================================================================
// MEMORY TRACKING (Client-side only)
// ============================================================================

export function useMemoryTracker(intervalMs: number = 5000) {
  const config = useDebugStore((state) => state.config);

  useEffect(() => {
    if (!config.enabled || !config.performance.enableMemoryTracking) return;
    if (typeof window === 'undefined') return;

    // Check if performance.memory is available (Chrome only)
    const perf = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    };

    if (!perf.memory) return;

    const interval = setInterval(() => {
      const memory = perf.memory;
      if (memory) {
        useDebugStore.setState((state) => ({
          memoryHistory: [
            ...state.memoryHistory.slice(-100),
            {
              timestamp: new Date(),
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
              jsHeapSizeLimit: memory.jsHeapSizeLimit,
            },
          ],
        }));
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [config.enabled, config.performance.enableMemoryTracking, intervalMs]);
}

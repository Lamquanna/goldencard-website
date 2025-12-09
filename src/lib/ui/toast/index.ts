// ============================================================================
// UI LIBRARY - TOAST NOTIFICATIONS - TYPE DEFINITIONS & STORE
// GoldenEnergy HOME Platform - Toast System
// ============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';
import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

/** Toast types */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';

/** Toast position */
export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** Toast ID */
export type ToastId = string;

/** Toast configuration */
export interface ToastConfig {
  /** Toast type */
  type?: ToastType;
  /** Toast title */
  title?: string;
  /** Toast message */
  message: string | React.ReactNode;
  /** Duration in ms (0 = persistent) */
  duration?: number;
  /** Position */
  position?: ToastPosition;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Action button */
  action?: ToastAction;
  /** Can be dismissed */
  dismissible?: boolean;
  /** Custom class name */
  className?: string;
  /** On dismiss callback */
  onDismiss?: () => void;
  /** On click callback */
  onClick?: () => void;
  /** Promise for loading toast */
  promise?: Promise<unknown>;
  /** Loading message */
  loadingMessage?: string;
  /** Success message */
  successMessage?: string | ((data: unknown) => string);
  /** Error message */
  errorMessage?: string | ((error: unknown) => string);
}

/** Toast action button */
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

/** Toast state */
export interface ToastState {
  id: ToastId;
  type: ToastType;
  title?: string;
  message: string | React.ReactNode;
  duration: number;
  position: ToastPosition;
  icon?: React.ReactNode;
  action?: ToastAction;
  dismissible: boolean;
  className?: string;
  createdAt: number;
  pausedAt?: number;
  remainingTime?: number;
  onDismiss?: () => void;
  onClick?: () => void;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0, // Persistent until manually dismissed
  custom: 4000,
};

const DEFAULT_POSITION: ToastPosition = 'top-right';

// ============================================================================
// STORE STATE & ACTIONS
// ============================================================================

interface ToastStoreState {
  toasts: ToastState[];
  position: ToastPosition;
  maxToasts: number;
  pauseOnHover: boolean;
  pauseOnFocusLoss: boolean;
}

interface ToastStoreActions {
  // Toast management
  show: (config: ToastConfig) => ToastId;
  success: (message: string, options?: Partial<ToastConfig>) => ToastId;
  error: (message: string, options?: Partial<ToastConfig>) => ToastId;
  warning: (message: string, options?: Partial<ToastConfig>) => ToastId;
  info: (message: string, options?: Partial<ToastConfig>) => ToastId;
  loading: (message: string, options?: Partial<ToastConfig>) => ToastId;
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: Partial<ToastConfig>
  ) => Promise<T>;
  custom: (content: React.ReactNode, options?: Partial<ToastConfig>) => ToastId;
  
  // Toast control
  dismiss: (id: ToastId) => void;
  dismissAll: () => void;
  update: (id: ToastId, config: Partial<ToastConfig>) => void;
  pause: (id: ToastId) => void;
  resume: (id: ToastId) => void;
  
  // Global settings
  setPosition: (position: ToastPosition) => void;
  setMaxToasts: (max: number) => void;
  setPauseOnHover: (pause: boolean) => void;
  setPauseOnFocusLoss: (pause: boolean) => void;
  
  // Internal
  removeToast: (id: ToastId) => void;
}

type ToastStore = ToastStoreState & ToastStoreActions;

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const initialState: ToastStoreState = {
  toasts: [],
  position: DEFAULT_POSITION,
  maxToasts: 5,
  pauseOnHover: true,
  pauseOnFocusLoss: true,
};

function generateToastId(): ToastId {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useToastStore = create<ToastStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      show: (config) => {
        const id = generateToastId();
        const type = config.type || 'info';
        const duration = config.duration ?? DEFAULT_DURATION[type];
        const position = config.position || get().position;

        const toast: ToastState = {
          id,
          type,
          title: config.title,
          message: config.message,
          duration,
          position,
          icon: config.icon,
          action: config.action,
          dismissible: config.dismissible ?? true,
          className: config.className,
          createdAt: Date.now(),
          onDismiss: config.onDismiss,
          onClick: config.onClick,
        };

        set(
          (state: WritableDraft<ToastStoreState>) => {
            // Remove oldest if at max
            if (state.toasts.length >= state.maxToasts) {
              const toRemove = state.toasts[0];
              toRemove?.onDismiss?.();
              state.toasts.shift();
            }
            state.toasts.push(toast as WritableDraft<ToastState>);
          },
          false,
          'toast/show'
        );

        // Auto dismiss if duration > 0
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }

        return id;
      },

      success: (message, options) => {
        return get().show({ ...options, type: 'success', message });
      },

      error: (message, options) => {
        return get().show({ ...options, type: 'error', message });
      },

      warning: (message, options) => {
        return get().show({ ...options, type: 'warning', message });
      },

      info: (message, options) => {
        return get().show({ ...options, type: 'info', message });
      },

      loading: (message, options) => {
        return get().show({ ...options, type: 'loading', message, duration: 0 });
      },

      promise: async <T>(
        promise: Promise<T>,
        messages: {
          loading: string;
          success: string | ((data: T) => string);
          error: string | ((error: unknown) => string);
        },
        options?: Partial<ToastConfig>
      ): Promise<T> => {
        const id = get().loading(messages.loading, options);

        try {
          const result = await promise;
          const successMessage =
            typeof messages.success === 'function'
              ? messages.success(result)
              : messages.success;
          
          get().update(id, {
            type: 'success',
            message: successMessage,
            duration: DEFAULT_DURATION.success,
          });

          // Auto dismiss success
          setTimeout(() => {
            get().removeToast(id);
          }, DEFAULT_DURATION.success);

          return result;
        } catch (error) {
          const errorMessage =
            typeof messages.error === 'function'
              ? messages.error(error)
              : messages.error;
          
          get().update(id, {
            type: 'error',
            message: errorMessage,
            duration: DEFAULT_DURATION.error,
          });

          // Auto dismiss error
          setTimeout(() => {
            get().removeToast(id);
          }, DEFAULT_DURATION.error);

          throw error;
        }
      },

      custom: (content, options) => {
        return get().show({
          ...options,
          type: 'custom',
          message: content,
        });
      },

      dismiss: (id) => {
        const toast = get().toasts.find((t) => t.id === id);
        toast?.onDismiss?.();
        get().removeToast(id);
      },

      dismissAll: () => {
        const toasts = get().toasts;
        toasts.forEach((t) => t.onDismiss?.());
        
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.toasts = [];
          },
          false,
          'toast/dismissAll'
        );
      },

      update: (id, config) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            const index = state.toasts.findIndex((t) => t.id === id);
            if (index !== -1) {
              const toast = state.toasts[index];
              if (config.type !== undefined) toast.type = config.type;
              if (config.title !== undefined) toast.title = config.title;
              if (config.message !== undefined) toast.message = config.message as string;
              if (config.duration !== undefined) toast.duration = config.duration;
              if (config.icon !== undefined) toast.icon = config.icon;
              if (config.action !== undefined) toast.action = config.action;
              if (config.dismissible !== undefined) toast.dismissible = config.dismissible;
              if (config.className !== undefined) toast.className = config.className;
            }
          },
          false,
          'toast/update'
        );
      },

      pause: (id) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            const toast = state.toasts.find((t) => t.id === id);
            if (toast && !toast.pausedAt) {
              toast.pausedAt = Date.now();
              toast.remainingTime = toast.duration - (Date.now() - toast.createdAt);
            }
          },
          false,
          'toast/pause'
        );
      },

      resume: (id) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            const toast = state.toasts.find((t) => t.id === id);
            if (toast && toast.pausedAt) {
              toast.createdAt = Date.now() - (toast.duration - (toast.remainingTime || 0));
              toast.pausedAt = undefined;
              toast.remainingTime = undefined;
            }
          },
          false,
          'toast/resume'
        );
      },

      setPosition: (position) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.position = position;
          },
          false,
          'toast/setPosition'
        );
      },

      setMaxToasts: (max) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.maxToasts = max;
          },
          false,
          'toast/setMaxToasts'
        );
      },

      setPauseOnHover: (pause) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.pauseOnHover = pause;
          },
          false,
          'toast/setPauseOnHover'
        );
      },

      setPauseOnFocusLoss: (pause) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.pauseOnFocusLoss = pause;
          },
          false,
          'toast/setPauseOnFocusLoss'
        );
      },

      removeToast: (id) => {
        set(
          (state: WritableDraft<ToastStoreState>) => {
            state.toasts = state.toasts.filter((t) => t.id !== id);
          },
          false,
          'toast/removeToast'
        );
      },
    })),
    { name: 'ToastStore' }
  )
);

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/** Show toast */
export const toast = {
  show: (config: ToastConfig) => useToastStore.getState().show(config),
  success: (message: string, options?: Partial<ToastConfig>) =>
    useToastStore.getState().success(message, options),
  error: (message: string, options?: Partial<ToastConfig>) =>
    useToastStore.getState().error(message, options),
  warning: (message: string, options?: Partial<ToastConfig>) =>
    useToastStore.getState().warning(message, options),
  info: (message: string, options?: Partial<ToastConfig>) =>
    useToastStore.getState().info(message, options),
  loading: (message: string, options?: Partial<ToastConfig>) =>
    useToastStore.getState().loading(message, options),
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: Partial<ToastConfig>
  ) => useToastStore.getState().promise(promise, messages, options),
  custom: (content: React.ReactNode, options?: Partial<ToastConfig>) =>
    useToastStore.getState().custom(content, options),
  dismiss: (id: ToastId) => useToastStore.getState().dismiss(id),
  dismissAll: () => useToastStore.getState().dismissAll(),
};

// ============================================================================
// HOOKS
// ============================================================================

import { useCallback } from 'react';

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const store = useToastStore();

  return {
    show: useCallback((config: ToastConfig) => store.show(config), [store]),
    success: useCallback(
      (message: string, options?: Partial<ToastConfig>) =>
        store.success(message, options),
      [store]
    ),
    error: useCallback(
      (message: string, options?: Partial<ToastConfig>) =>
        store.error(message, options),
      [store]
    ),
    warning: useCallback(
      (message: string, options?: Partial<ToastConfig>) =>
        store.warning(message, options),
      [store]
    ),
    info: useCallback(
      (message: string, options?: Partial<ToastConfig>) =>
        store.info(message, options),
      [store]
    ),
    loading: useCallback(
      (message: string, options?: Partial<ToastConfig>) =>
        store.loading(message, options),
      [store]
    ),
    promise: useCallback(
      <T>(
        promise: Promise<T>,
        messages: {
          loading: string;
          success: string | ((data: T) => string);
          error: string | ((error: unknown) => string);
        },
        options?: Partial<ToastConfig>
      ) => store.promise(promise, messages, options),
      [store]
    ),
    dismiss: useCallback((id: ToastId) => store.dismiss(id), [store]),
    dismissAll: useCallback(() => store.dismissAll(), [store]),
    toasts: store.toasts,
  };
}

// ============================================================================
// SELECTORS
// ============================================================================

/** Select toasts by position */
export const selectToastsByPosition = (position: ToastPosition) => (state: ToastStore) =>
  state.toasts.filter((t) => t.position === position);

/** Select toast count */
export const selectToastCount = (state: ToastStore) => state.toasts.length;

/** Select has toasts */
export const selectHasToasts = (state: ToastStore) => state.toasts.length > 0;

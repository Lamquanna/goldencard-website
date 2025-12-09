// ============================================================================
// UI LIBRARY - MODAL MANAGER - ZUSTAND STORE
// GoldenEnergy HOME Platform - Modal State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';
import type {
  ModalId,
  ModalConfig,
  ModalState,
  ConfirmConfig,
  ConfirmResult,
  AlertConfig,
  PromptConfig,
  PromptResult,
} from './types';

// ============================================================================
// STORE STATE
// ============================================================================

interface ModalStoreState {
  /** All modals */
  modals: Map<ModalId, ModalState>;
  /** Modal stack for z-index */
  stack: ModalId[];
  /** Base z-index */
  baseZIndex: number;
  /** Counter for generating unique IDs */
  idCounter: number;
  /** Pending promises for async modals */
  pendingPromises: Map<ModalId, { resolve: (value: unknown) => void }>;
}

interface ModalStoreActions {
  /** Open modal */
  open: (config: ModalConfig) => ModalId;
  /** Open modal and return promise */
  openAsync: <T = unknown>(config: ModalConfig) => Promise<T | undefined>;
  /** Close modal */
  close: (id: ModalId, data?: unknown) => void;
  /** Close all modals */
  closeAll: () => void;
  /** Update modal config */
  update: (id: ModalId, config: Partial<ModalConfig>) => void;
  /** Start closing animation */
  startClosing: (id: ModalId) => void;
  /** Finish closing (remove from DOM) */
  finishClosing: (id: ModalId) => void;
  /** Bring modal to front */
  bringToFront: (id: ModalId) => void;
  /** Set base z-index */
  setBaseZIndex: (zIndex: number) => void;
  /** Check if modal is open */
  isOpen: (id: ModalId) => boolean;
  /** Get modal */
  getModal: (id: ModalId) => ModalState | undefined;
  /** Get open modals */
  getOpenModals: () => ModalState[];
  /** Get top modal */
  getTopModal: () => ModalState | undefined;
  /** Confirm dialog helper */
  confirm: (config: ConfirmConfig) => Promise<ConfirmResult>;
  /** Alert dialog helper */
  alert: (config: AlertConfig) => Promise<void>;
  /** Prompt dialog helper */
  prompt: (config: PromptConfig) => Promise<PromptResult>;
  /** Reset store */
  reset: () => void;
}

type ModalStore = ModalStoreState & ModalStoreActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ModalStoreState = {
  modals: new Map(),
  stack: [],
  baseZIndex: 1000,
  idCounter: 0,
  pendingPromises: new Map(),
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateModalId(counter: number): ModalId {
  return `modal-${counter}-${Date.now()}`;
}

function calculateZIndex(baseZIndex: number, stackIndex: number): number {
  return baseZIndex + (stackIndex * 10);
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useModalStore = create<ModalStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        open: (config) => {
          const id = config.id || generateModalId(get().idCounter);
          
          set(
            (state: WritableDraft<ModalStoreState>) => {
              state.idCounter++;
              
              const zIndex = config.zIndex || calculateZIndex(
                state.baseZIndex,
                state.stack.length
              );

              const modalState: ModalState = {
                id,
                config: config as WritableDraft<ModalConfig>,
                isOpen: true,
                isClosing: false,
                openedAt: Date.now(),
                zIndex,
              };

              state.modals.set(id, modalState);
              state.stack.push(id);
            },
            false,
            'modal/open'
          );

          // Call onOpen callback
          config.onOpen?.();

          return id;
        },

        openAsync: <T = unknown>(config: ModalConfig): Promise<T | undefined> => {
          return new Promise((resolve) => {
            const id = get().open(config);
            
            set(
              (state: WritableDraft<ModalStoreState>) => {
                state.pendingPromises.set(id, { resolve: resolve as (value: unknown) => void });
              },
              false,
              'modal/openAsync'
            );
          });
        },

        close: (id, data) => {
          const state = get();
          const modal = state.modals.get(id);
          
          if (!modal || modal.isClosing) return;

          // Check onBeforeClose
          const beforeClose = modal.config.onBeforeClose;
          if (beforeClose) {
            const result = beforeClose();
            if (result instanceof Promise) {
              result.then((canClose) => {
                if (canClose !== false) {
                  get().startClosing(id);
                  setTimeout(() => get().finishClosing(id), 200);
                }
              });
              return;
            } else if (result === false) {
              return;
            }
          }

          // Resolve pending promise
          const pending = state.pendingPromises.get(id);
          if (pending) {
            pending.resolve(data);
          }

          get().startClosing(id);
          
          // Wait for animation then remove
          setTimeout(() => {
            get().finishClosing(id);
          }, 200);
        },

        closeAll: () => {
          const state = get();
          const ids = [...state.stack].reverse();
          
          ids.forEach((id, index) => {
            setTimeout(() => {
              get().close(id);
            }, index * 50);
          });
        },

        update: (id, config) => {
          set(
            (state: WritableDraft<ModalStoreState>) => {
              const modal = state.modals.get(id);
              if (modal) {
                Object.assign(modal.config, config);
              }
            },
            false,
            'modal/update'
          );
        },

        startClosing: (id) => {
          set(
            (state: WritableDraft<ModalStoreState>) => {
              const modal = state.modals.get(id);
              if (modal) {
                modal.isClosing = true;
              }
            },
            false,
            'modal/startClosing'
          );
        },

        finishClosing: (id) => {
          const modal = get().modals.get(id);
          
          set(
            (state: WritableDraft<ModalStoreState>) => {
              state.modals.delete(id);
              state.stack = state.stack.filter((stackId) => stackId !== id);
              state.pendingPromises.delete(id);
            },
            false,
            'modal/finishClosing'
          );

          // Call onClose callback
          modal?.config.onClose?.();
        },

        bringToFront: (id) => {
          set(
            (state: WritableDraft<ModalStoreState>) => {
              const index = state.stack.indexOf(id);
              if (index > -1 && index !== state.stack.length - 1) {
                state.stack.splice(index, 1);
                state.stack.push(id);
                
                // Update z-index for all modals
                state.stack.forEach((stackId, i) => {
                  const modal = state.modals.get(stackId);
                  if (modal) {
                    modal.zIndex = calculateZIndex(state.baseZIndex, i);
                  }
                });
              }
            },
            false,
            'modal/bringToFront'
          );
        },

        setBaseZIndex: (zIndex) => {
          set(
            (state: WritableDraft<ModalStoreState>) => {
              state.baseZIndex = zIndex;
              
              // Recalculate all z-indices
              state.stack.forEach((id, i) => {
                const modal = state.modals.get(id);
                if (modal) {
                  modal.zIndex = calculateZIndex(zIndex, i);
                }
              });
            },
            false,
            'modal/setBaseZIndex'
          );
        },

        isOpen: (id) => {
          const modal = get().modals.get(id);
          return modal?.isOpen ?? false;
        },

        getModal: (id) => {
          return get().modals.get(id);
        },

        getOpenModals: () => {
          const state = get();
          return state.stack
            .map((id) => state.modals.get(id))
            .filter((modal): modal is ModalState => !!modal && modal.isOpen);
        },

        getTopModal: () => {
          const state = get();
          const topId = state.stack[state.stack.length - 1];
          return topId ? state.modals.get(topId) : undefined;
        },

        confirm: (config): Promise<ConfirmResult> => {
          return new Promise((resolve) => {
            const id = get().open({
              id: `confirm-${Date.now()}`,
              title: config.title || 'Xác nhận',
              content: config.message,
              size: 'sm',
              closeOnBackdrop: false,
              closeOnEscape: false,
              showClose: false,
              data: {
                type: 'confirm',
                config,
                onConfirm: (inputValue?: string) => {
                  resolve({ confirmed: true, inputValue });
                  get().close(id);
                },
                onCancel: () => {
                  resolve({ confirmed: false });
                  get().close(id);
                },
              },
            });
          });
        },

        alert: (config): Promise<void> => {
          return new Promise((resolve) => {
            const id = get().open({
              id: `alert-${Date.now()}`,
              title: config.title || 'Thông báo',
              content: config.message,
              size: 'sm',
              closeOnBackdrop: true,
              closeOnEscape: true,
              showClose: true,
              data: {
                type: 'alert',
                config,
                onOk: () => {
                  resolve();
                  get().close(id);
                },
              },
              onClose: () => {
                resolve();
              },
            });
          });
        },

        prompt: (config): Promise<PromptResult> => {
          return new Promise((resolve) => {
            const id = get().open({
              id: `prompt-${Date.now()}`,
              title: config.title || 'Nhập thông tin',
              content: config.message,
              size: 'sm',
              closeOnBackdrop: false,
              closeOnEscape: true,
              showClose: true,
              data: {
                type: 'prompt',
                config,
                onSubmit: (value: string) => {
                  resolve({ submitted: true, value });
                  get().close(id);
                },
                onCancel: () => {
                  resolve({ submitted: false });
                  get().close(id);
                },
              },
              onClose: () => {
                resolve({ submitted: false });
              },
            });
          });
        },

        reset: () => {
          // Close all modals first
          get().closeAll();
          
          set(
            () => initialState,
            false,
            'modal/reset'
          );
        },
      }))
    ),
    { name: 'ModalStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Select all modals */
export const selectModals = (state: ModalStore) => state.modals;

/** Select modal stack */
export const selectStack = (state: ModalStore) => state.stack;

/** Select if any modal is open */
export const selectHasOpenModal = (state: ModalStore) => state.stack.length > 0;

/** Select modal count */
export const selectModalCount = (state: ModalStore) => state.stack.length;

/** Select top modal ID */
export const selectTopModalId = (state: ModalStore) => 
  state.stack[state.stack.length - 1] || null;

// ============================================================================
// HOOKS
// ============================================================================

import { useCallback } from 'react';

/**
 * Hook to use modal manager
 */
export function useModal() {
  const store = useModalStore();
  
  const open = useCallback((config: ModalConfig) => {
    return store.open(config);
  }, [store]);

  const openAsync = useCallback(<T = unknown>(config: ModalConfig) => {
    return store.openAsync<T>(config);
  }, [store]);

  const close = useCallback((id: ModalId, data?: unknown) => {
    store.close(id, data);
  }, [store]);

  const closeAll = useCallback(() => {
    store.closeAll();
  }, [store]);

  const confirm = useCallback((config: ConfirmConfig) => {
    return store.confirm(config);
  }, [store]);

  const alert = useCallback((config: AlertConfig) => {
    return store.alert(config);
  }, [store]);

  const prompt = useCallback((config: PromptConfig) => {
    return store.prompt(config);
  }, [store]);

  return {
    open,
    openAsync,
    close,
    closeAll,
    confirm,
    alert,
    prompt,
    isOpen: store.isOpen,
    getModal: store.getModal,
    getOpenModals: store.getOpenModals,
    update: store.update,
    bringToFront: store.bringToFront,
  };
}

/**
 * Hook to get specific modal state
 */
export function useModalState(id: ModalId) {
  return useModalStore((state) => state.modals.get(id));
}

/**
 * Hook to check if modal is open
 */
export function useIsModalOpen(id: ModalId) {
  return useModalStore((state) => {
    const modal = state.modals.get(id);
    return modal?.isOpen ?? false;
  });
}

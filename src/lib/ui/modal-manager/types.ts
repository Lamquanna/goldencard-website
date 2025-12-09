// ============================================================================
// UI LIBRARY - MODAL MANAGER - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Modal Management Types
// ============================================================================

import React from 'react';

// ============================================================================
// MODAL TYPES
// ============================================================================

/** Modal size options */
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'auto';

/** Modal position */
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

/** Modal ID */
export type ModalId = string;

// ============================================================================
// MODAL CONFIGURATION
// ============================================================================

/** Base modal configuration */
export interface ModalConfig {
  /** Unique modal ID */
  id: ModalId;
  /** Modal title */
  title?: string | React.ReactNode;
  /** Modal content */
  content: React.ReactNode | ((props: ModalRenderProps) => React.ReactNode);
  /** Modal size */
  size?: ModalSize;
  /** Modal position */
  position?: ModalPosition;
  /** Custom width */
  width?: number | string;
  /** Custom height */
  height?: number | string;
  /** Show close button */
  showClose?: boolean;
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Show backdrop/overlay */
  showBackdrop?: boolean;
  /** Backdrop opacity */
  backdropOpacity?: number;
  /** Animation type */
  animation?: ModalAnimation;
  /** Custom class name */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Header content */
  header?: React.ReactNode | ((props: ModalRenderProps) => React.ReactNode);
  /** Footer content */
  footer?: React.ReactNode | ((props: ModalRenderProps) => React.ReactNode);
  /** On open callback */
  onOpen?: () => void;
  /** On close callback */
  onClose?: () => void;
  /** Before close callback (return false to prevent close) */
  onBeforeClose?: () => boolean | Promise<boolean>;
  /** Z-index */
  zIndex?: number;
  /** Is draggable */
  draggable?: boolean;
  /** Is resizable */
  resizable?: boolean;
  /** Minimum width (for resizable) */
  minWidth?: number;
  /** Minimum height (for resizable) */
  minHeight?: number;
  /** Data to pass to modal */
  data?: unknown;
  /** Keep modal mounted when closed */
  keepMounted?: boolean;
}

/** Modal animation types */
export type ModalAnimation =
  | 'fade'
  | 'scale'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'zoom'
  | 'flip'
  | 'none';

// ============================================================================
// MODAL RENDER PROPS
// ============================================================================

/** Props passed to modal render functions */
export interface ModalRenderProps {
  /** Modal ID */
  id: ModalId;
  /** Close modal */
  close: () => void;
  /** Close modal with data */
  closeWithData: (data: unknown) => void;
  /** Modal data */
  data: unknown;
  /** Is modal closing */
  isClosing: boolean;
}

// ============================================================================
// MODAL STATE
// ============================================================================

/** Single modal state */
export interface ModalState {
  /** Modal ID */
  id: ModalId;
  /** Modal configuration */
  config: ModalConfig;
  /** Is modal open */
  isOpen: boolean;
  /** Is modal closing (for animation) */
  isClosing: boolean;
  /** Modal result data */
  result?: unknown;
  /** Open timestamp */
  openedAt: number;
  /** Z-index for stacking */
  zIndex: number;
}

/** Modal manager state */
export interface ModalManagerState {
  /** All modals */
  modals: Map<ModalId, ModalState>;
  /** Modal stack (for z-index management) */
  stack: ModalId[];
  /** Base z-index */
  baseZIndex: number;
}

// ============================================================================
// CONFIRM DIALOG
// ============================================================================

/** Confirm dialog configuration */
export interface ConfirmConfig {
  /** Dialog title */
  title?: string;
  /** Dialog message */
  message: string | React.ReactNode;
  /** Confirm button text */
  confirmText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Confirm button variant */
  confirmVariant?: 'default' | 'destructive' | 'outline';
  /** Dialog type (affects icon and colors) */
  type?: 'info' | 'warning' | 'danger' | 'success';
  /** Custom icon */
  icon?: React.ReactNode;
  /** Show cancel button */
  showCancel?: boolean;
  /** Input for confirmation (e.g., type "DELETE" to confirm) */
  confirmInput?: {
    label: string;
    value: string;
    placeholder?: string;
  };
}

/** Confirm dialog result */
export interface ConfirmResult {
  confirmed: boolean;
  inputValue?: string;
}

// ============================================================================
// ALERT DIALOG
// ============================================================================

/** Alert dialog configuration */
export interface AlertConfig {
  /** Dialog title */
  title?: string;
  /** Dialog message */
  message: string | React.ReactNode;
  /** OK button text */
  okText?: string;
  /** Dialog type */
  type?: 'info' | 'warning' | 'error' | 'success';
  /** Custom icon */
  icon?: React.ReactNode;
}

// ============================================================================
// PROMPT DIALOG
// ============================================================================

/** Prompt dialog configuration */
export interface PromptConfig {
  /** Dialog title */
  title?: string;
  /** Dialog message */
  message?: string | React.ReactNode;
  /** Input label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Default value */
  defaultValue?: string;
  /** Input type */
  inputType?: 'text' | 'textarea' | 'number' | 'email' | 'password';
  /** Validation pattern */
  pattern?: RegExp;
  /** Validation error message */
  patternError?: string;
  /** Required */
  required?: boolean;
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Max length */
  maxLength?: number;
}

/** Prompt dialog result */
export interface PromptResult {
  submitted: boolean;
  value?: string;
}

// ============================================================================
// MODAL MANAGER CONTEXT
// ============================================================================

/** Modal manager context value */
export interface ModalManagerContextValue {
  /** Open a modal */
  open: (config: ModalConfig) => ModalId;
  /** Open a modal and wait for result */
  openAsync: <T = unknown>(config: ModalConfig) => Promise<T | undefined>;
  /** Close a modal */
  close: (id: ModalId, data?: unknown) => void;
  /** Close all modals */
  closeAll: () => void;
  /** Update modal config */
  update: (id: ModalId, config: Partial<ModalConfig>) => void;
  /** Check if modal is open */
  isOpen: (id: ModalId) => boolean;
  /** Get modal state */
  getModal: (id: ModalId) => ModalState | undefined;
  /** Get all open modals */
  getOpenModals: () => ModalState[];
  /** Confirm dialog */
  confirm: (config: ConfirmConfig) => Promise<ConfirmResult>;
  /** Alert dialog */
  alert: (config: AlertConfig) => Promise<void>;
  /** Prompt dialog */
  prompt: (config: PromptConfig) => Promise<PromptResult>;
}

// ============================================================================
// DRAWER CONFIGURATION
// ============================================================================

/** Drawer position */
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/** Drawer configuration */
export interface DrawerConfig extends Omit<ModalConfig, 'position' | 'size'> {
  /** Drawer position */
  position?: DrawerPosition;
  /** Drawer size */
  size?: number | string;
  /** Show handle for resizing */
  showHandle?: boolean;
}

// ============================================================================
// SHEET CONFIGURATION (Mobile-friendly bottom sheet)
// ============================================================================

/** Sheet snap point */
export type SheetSnapPoint = number | 'content' | 'full';

/** Sheet configuration */
export interface SheetConfig extends Omit<ModalConfig, 'position' | 'size' | 'draggable'> {
  /** Snap points for the sheet */
  snapPoints?: SheetSnapPoint[];
  /** Initial snap point index */
  initialSnap?: number;
  /** Close threshold (0-1) */
  closeThreshold?: number;
  /** Show drag handle */
  showHandle?: boolean;
}

// ============================================================================
// MODAL COMPONENT PROPS
// ============================================================================

/** Modal component props */
export interface ModalProps {
  /** Modal state */
  state: ModalState;
  /** On close handler */
  onClose: () => void;
  /** On close with data handler */
  onCloseWithData: (data: unknown) => void;
}

/** Modal header props */
export interface ModalHeaderProps {
  /** Title */
  title?: React.ReactNode;
  /** Show close button */
  showClose?: boolean;
  /** On close handler */
  onClose?: () => void;
  /** Custom class name */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

/** Modal body props */
export interface ModalBodyProps {
  /** Custom class name */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

/** Modal footer props */
export interface ModalFooterProps {
  /** Custom class name */
  className?: string;
  /** Children */
  children?: React.ReactNode;
}

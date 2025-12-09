// ============================================================================
// THEMES & LAYOUTS - LAYOUT ENGINE
// GoldenEnergy HOME Platform - Dynamic Layout Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  LayoutType,
  SidebarPosition,
  SidebarState,
  Breakpoints,
} from './types';

// ============================================================================
// SIMPLIFIED LAYOUT CONFIG TYPES (Internal Use)
// ============================================================================

export interface InternalSidebarConfig {
  visible: boolean;
  position: SidebarPosition;
  width: number;
  collapsedWidth: number;
  state: SidebarState;
  collapsible: boolean;
  collapseOnMobile: boolean;
}

export interface InternalHeaderConfig {
  visible: boolean;
  height: number;
  fixed: boolean;
  background: 'solid' | 'transparent' | 'blur';
  showShadow: boolean;
}

export interface InternalFooterConfig {
  visible: boolean;
  height: number;
  fixed: boolean;
}

export interface InternalMainConfig {
  padding: string;
  paddingMobile: string;
  maxWidth: string;
  centered: boolean;
}

// ============================================================================
// LAYOUT STORE STATE
// ============================================================================

export interface LayoutStoreState {
  /** Current layout type */
  layoutType: LayoutType;
  /** Sidebar configuration */
  sidebar: InternalSidebarConfig;
  /** Header configuration */
  header: InternalHeaderConfig;
  /** Footer configuration */
  footer: InternalFooterConfig;
  /** Main content configuration */
  main: InternalMainConfig;
  /** Is sidebar open (mobile overlay) */
  isSidebarOpen: boolean;
  /** Current breakpoint */
  breakpoint: keyof Breakpoints;
  /** Is fullscreen mode */
  isFullscreen: boolean;
}

export interface LayoutStoreActions {
  /** Set layout type */
  setLayoutType: (type: LayoutType) => void;
  /** Toggle sidebar state */
  toggleSidebar: () => void;
  /** Set sidebar state */
  setSidebarState: (state: SidebarState) => void;
  /** Open sidebar (mobile) */
  openSidebar: () => void;
  /** Close sidebar (mobile) */
  closeSidebar: () => void;
  /** Show/hide header */
  setHeaderVisible: (visible: boolean) => void;
  /** Show/hide footer */
  setFooterVisible: (visible: boolean) => void;
  /** Update sidebar config */
  updateSidebar: (config: Partial<InternalSidebarConfig>) => void;
  /** Update header config */
  updateHeader: (config: Partial<InternalHeaderConfig>) => void;
  /** Update footer config */
  updateFooter: (config: Partial<InternalFooterConfig>) => void;
  /** Update main config */
  updateMain: (config: Partial<InternalMainConfig>) => void;
  /** Set breakpoint */
  setBreakpoint: (breakpoint: keyof Breakpoints) => void;
  /** Toggle fullscreen */
  toggleFullscreen: () => void;
  /** Reset to defaults */
  reset: () => void;
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

const defaultSidebar: InternalSidebarConfig = {
  visible: true,
  position: 'left',
  width: 280,
  collapsedWidth: 64,
  state: 'expanded',
  collapsible: true,
  collapseOnMobile: true,
};

const defaultHeader: InternalHeaderConfig = {
  visible: true,
  height: 64,
  fixed: true,
  background: 'solid',
  showShadow: true,
};

const defaultFooter: InternalFooterConfig = {
  visible: false,
  height: 48,
  fixed: false,
};

const defaultMain: InternalMainConfig = {
  padding: '1.5rem',
  paddingMobile: '1rem',
  maxWidth: '100%',
  centered: false,
};

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: LayoutStoreState = {
  layoutType: 'sidebar',
  sidebar: defaultSidebar,
  header: defaultHeader,
  footer: defaultFooter,
  main: defaultMain,
  isSidebarOpen: false,
  breakpoint: 'lg',
  isFullscreen: false,
};

// ============================================================================
// STORE DEFINITION
// ============================================================================

type LayoutStore = LayoutStoreState & LayoutStoreActions;

export const useLayoutStore = create<LayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setLayoutType: (type) => {
          set({ layoutType: type }, false, 'layout/setLayoutType');
        },

        toggleSidebar: () => {
          const currentState = get().sidebar.state;
          const newState = currentState === 'collapsed' ? 'expanded' : 'collapsed';
          set(
            { sidebar: { ...get().sidebar, state: newState } },
            false,
            'layout/toggleSidebar'
          );
        },

        setSidebarState: (sidebarState) => {
          set(
            { sidebar: { ...get().sidebar, state: sidebarState } },
            false,
            'layout/setSidebarState'
          );
        },

        openSidebar: () => {
          set({ isSidebarOpen: true }, false, 'layout/openSidebar');
        },

        closeSidebar: () => {
          set({ isSidebarOpen: false }, false, 'layout/closeSidebar');
        },

        setHeaderVisible: (visible) => {
          set(
            { header: { ...get().header, visible } },
            false,
            'layout/setHeaderVisible'
          );
        },

        setFooterVisible: (visible) => {
          set(
            { footer: { ...get().footer, visible } },
            false,
            'layout/setFooterVisible'
          );
        },

        updateSidebar: (config) => {
          set(
            { sidebar: { ...get().sidebar, ...config } },
            false,
            'layout/updateSidebar'
          );
        },

        updateHeader: (config) => {
          set(
            { header: { ...get().header, ...config } },
            false,
            'layout/updateHeader'
          );
        },

        updateFooter: (config) => {
          set(
            { footer: { ...get().footer, ...config } },
            false,
            'layout/updateFooter'
          );
        },

        updateMain: (config) => {
          set(
            { main: { ...get().main, ...config } },
            false,
            'layout/updateMain'
          );
        },

        setBreakpoint: (breakpoint) => {
          set({ breakpoint }, false, 'layout/setBreakpoint');
        },

        toggleFullscreen: () => {
          set(
            { isFullscreen: !get().isFullscreen },
            false,
            'layout/toggleFullscreen'
          );
        },

        reset: () => {
          set({ ...initialState }, false, 'layout/reset');
        },
      }),
      {
        name: 'layout-storage',
        partialize: (state) => ({
          layoutType: state.layoutType,
          sidebar: state.sidebar,
          header: state.header,
          footer: state.footer,
          main: state.main,
        }),
      }
    ),
    { name: 'LayoutStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Select sidebar state */
export const selectSidebar = (state: LayoutStore) => state.sidebar;

/** Select header state */
export const selectHeader = (state: LayoutStore) => state.header;

/** Select footer state */
export const selectFooter = (state: LayoutStore) => state.footer;

/** Select is sidebar collapsed */
export const selectIsSidebarCollapsed = (state: LayoutStore) => 
  state.sidebar.state === 'collapsed';

/** Select is mobile breakpoint */
export const selectIsMobile = (state: LayoutStore) => 
  ['xs', 'sm'].includes(state.breakpoint);

/** Select is tablet breakpoint */
export const selectIsTablet = (state: LayoutStore) => 
  state.breakpoint === 'md';

/** Select computed sidebar width */
export const selectSidebarWidth = (state: LayoutStore) => 
  state.sidebar.state === 'collapsed' 
    ? state.sidebar.collapsedWidth 
    : state.sidebar.width;

// ============================================================================
// HOOKS
// ============================================================================

import { useEffect } from 'react';

/**
 * Hook to use layout engine
 */
export function useLayout() {
  const store = useLayoutStore();

  // Listen for window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const breakpoints: Record<keyof Breakpoints, number> = {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    };

    const getBreakpoint = (width: number): keyof Breakpoints => {
      if (width >= breakpoints['2xl']) return '2xl';
      if (width >= breakpoints.xl) return 'xl';
      if (width >= breakpoints.lg) return 'lg';
      if (width >= breakpoints.md) return 'md';
      if (width >= breakpoints.sm) return 'sm';
      return 'xs';
    };

    const handleResize = () => {
      const breakpoint = getBreakpoint(window.innerWidth);
      store.setBreakpoint(breakpoint);
      
      // Auto-close mobile sidebar on resize to desktop
      if (['lg', 'xl', '2xl'].includes(breakpoint) && store.isSidebarOpen) {
        store.closeSidebar();
      }
    };

    handleResize(); // Initial call
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [store]);

  const isMobile = selectIsMobile(store);
  const isTablet = selectIsTablet(store);
  const isSidebarCollapsed = selectIsSidebarCollapsed(store);

  return {
    // State
    layoutType: store.layoutType,
    sidebar: store.sidebar,
    header: store.header,
    footer: store.footer,
    main: store.main,
    isSidebarOpen: store.isSidebarOpen,
    isSidebarCollapsed,
    isFullscreen: store.isFullscreen,
    breakpoint: store.breakpoint,
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    
    // Computed
    sidebarWidth: selectSidebarWidth(store),
    
    // Actions
    setLayoutType: store.setLayoutType,
    toggleSidebar: store.toggleSidebar,
    setSidebarState: store.setSidebarState,
    openSidebar: store.openSidebar,
    closeSidebar: store.closeSidebar,
    setHeaderVisible: store.setHeaderVisible,
    setFooterVisible: store.setFooterVisible,
    updateSidebar: store.updateSidebar,
    updateHeader: store.updateHeader,
    updateFooter: store.updateFooter,
    updateMain: store.updateMain,
    toggleFullscreen: store.toggleFullscreen,
    reset: store.reset,
  };
}

/**
 * Hook to use sidebar state
 */
export function useSidebar() {
  const store = useLayoutStore();
  
  return {
    config: store.sidebar,
    isCollapsed: store.sidebar.state === 'collapsed',
    isOpen: store.isSidebarOpen,
    width: selectSidebarWidth(store),
    toggle: store.toggleSidebar,
    open: store.openSidebar,
    close: store.closeSidebar,
    setState: store.setSidebarState,
    update: store.updateSidebar,
  };
}

/**
 * Hook for responsive behavior
 */
export function useResponsive() {
  const store = useLayoutStore();
  const isMobile = selectIsMobile(store);
  const isTablet = selectIsTablet(store);
  
  return {
    breakpoint: store.breakpoint,
    isMobile,
    isTablet,
    isDesktop: ['lg', 'xl', '2xl'].includes(store.breakpoint),
    isLarge: ['xl', '2xl'].includes(store.breakpoint),
  };
}

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

export type LayoutPreset = {
  id: string;
  name: string;
  description?: string;
  layoutType: LayoutType;
  sidebar: Partial<InternalSidebarConfig>;
  header: Partial<InternalHeaderConfig>;
  footer: Partial<InternalFooterConfig>;
  main: Partial<InternalMainConfig>;
};

export const layoutPresets: Record<string, LayoutPreset> = {
  default: {
    id: 'default',
    name: 'Default Layout',
    description: 'Standard sidebar layout with fixed header',
    layoutType: 'sidebar',
    sidebar: { ...defaultSidebar },
    header: { ...defaultHeader },
    footer: { ...defaultFooter },
    main: { ...defaultMain },
  },
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard Layout',
    description: 'Full-featured dashboard layout',
    layoutType: 'dashboard',
    sidebar: { ...defaultSidebar, width: 260 },
    header: { ...defaultHeader },
    footer: { visible: false },
    main: { padding: '1.5rem' },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Layout',
    description: 'Clean layout with minimal chrome',
    layoutType: 'centered',
    sidebar: { visible: false },
    header: { visible: true, background: 'transparent', showShadow: false },
    footer: { visible: false },
    main: { maxWidth: '1200px', centered: true },
  },
  fullWidth: {
    id: 'fullWidth',
    name: 'Full Width Layout',
    description: 'No sidebar, full width content',
    layoutType: 'full-width',
    sidebar: { visible: false },
    header: { ...defaultHeader },
    footer: { visible: true },
    main: { maxWidth: '100%', padding: '2rem' },
  },
};

/**
 * Apply a layout preset
 */
export function applyLayoutPreset(preset: LayoutPreset) {
  const store = useLayoutStore.getState();
  store.setLayoutType(preset.layoutType);
  store.updateSidebar(preset.sidebar);
  store.updateHeader(preset.header);
  store.updateFooter(preset.footer);
  store.updateMain(preset.main);
}

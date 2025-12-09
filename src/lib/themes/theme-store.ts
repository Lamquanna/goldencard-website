// ============================================================================
// THEMES & LAYOUTS - THEME ENGINE STORE
// GoldenEnergy HOME Platform - Theme State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import type {
  Theme,
  ThemePair,
  ThemeMode,
  ThemeEngineState,
  ThemeEngineActions,
} from './types';
import { createDefaultTheme, createDefaultDarkTheme } from './default-theme';

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ThemeEngineState = {
  mode: 'system',
  resolvedMode: 'light',
  currentThemeId: 'default',
  themes: new Map([
    ['default', { id: 'default', name: 'Default', light: createDefaultTheme(), dark: createDefaultDarkTheme() }],
  ]),
  overrides: {},
  systemPreference: 'light',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get system color scheme preference
 */
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve theme mode to light or dark
 */
function resolveMode(mode: ThemeMode, systemPreference: 'light' | 'dark'): 'light' | 'dark' {
  if (mode === 'system') {
    return systemPreference;
  }
  return mode;
}

/**
 * Convert theme to CSS variables
 */
function themeToCSSVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    variables[`--${cssKey}`] = value;
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    const cssKey = key === 'DEFAULT' ? 'radius' : `radius-${key}`;
    variables[`--${cssKey}`] = value;
  });

  // Custom variables
  if (theme.cssVariables) {
    Object.entries(theme.cssVariables).forEach(([key, value]) => {
      variables[key.startsWith('--') ? key : `--${key}`] = value;
    });
  }

  return variables;
}

/**
 * Apply CSS variables to document
 */
function applyCSSVariables(variables: Record<string, string>): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Apply theme class to document
 */
function applyThemeClass(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

type ThemeStore = ThemeEngineState & ThemeEngineActions;

export const useThemeStore = create<ThemeStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        (set, get) => ({
          ...initialState,

          setMode: (mode) => {
            const systemPreference = getSystemPreference();
            const resolvedMode = resolveMode(mode, systemPreference);

            set(
              {
                mode,
                resolvedMode,
                systemPreference,
              },
              false,
              'theme/setMode'
            );

            // Apply theme
            get().applyTheme();
          },

          setTheme: (themeId) => {
            const themes = get().themes;
            if (!themes.has(themeId)) {
              console.warn(`Theme "${themeId}" not found`);
              return;
            }

            set(
              { currentThemeId: themeId },
              false,
              'theme/setTheme'
            );

            // Apply theme
            get().applyTheme();
          },

          registerTheme: (theme) => {
            const themes = new Map(get().themes);
            themes.set(theme.id, theme);
            set({ themes }, false, 'theme/registerTheme');
          },

          removeTheme: (themeId) => {
            if (themeId === 'default') {
              console.warn('Cannot remove default theme');
              return;
            }

            const themes = new Map(get().themes);
            themes.delete(themeId);
            
            const updates: Partial<ThemeEngineState> = { themes };
            if (get().currentThemeId === themeId) {
              updates.currentThemeId = 'default';
            }
            
            set(updates, false, 'theme/removeTheme');

            // Apply theme if current was removed
            if (get().currentThemeId === 'default') {
              get().applyTheme();
            }
          },

          setOverrides: (overrides) => {
            set({ overrides }, false, 'theme/setOverrides');
            get().applyTheme();
          },

          clearOverrides: () => {
            set({ overrides: {} }, false, 'theme/clearOverrides');
            get().applyTheme();
          },

          getCurrentTheme: () => {
            const state = get();
            const themePair = state.themes.get(state.currentThemeId);
            
            if (!themePair) {
              const defaultPair = state.themes.get('default')!;
              return state.resolvedMode === 'dark' ? defaultPair.dark : defaultPair.light;
            }

            const baseTheme = state.resolvedMode === 'dark' ? themePair.dark : themePair.light;

            // Apply overrides
            if (Object.keys(state.overrides).length > 0) {
              return {
                ...baseTheme,
                ...state.overrides,
                colors: {
                  ...baseTheme.colors,
                  ...(state.overrides.colors || {}),
                },
              } as Theme;
            }

            return baseTheme;
          },

          getCSSVariables: () => {
            const theme = get().getCurrentTheme();
            return themeToCSSVariables(theme);
          },

          applyTheme: () => {
            const state = get();
            const variables = state.getCSSVariables();
            
            applyCSSVariables(variables);
            applyThemeClass(state.resolvedMode);
          },

          reset: () => {
            set(
              {
                ...initialState,
                themes: new Map([
                  ['default', { id: 'default', name: 'Default', light: createDefaultTheme(), dark: createDefaultDarkTheme() }],
                ]),
              },
              false,
              'theme/reset'
            );

            get().applyTheme();
          },
        })
      ),
      {
        name: 'theme-storage',
        partialize: (state) => ({
          mode: state.mode,
          currentThemeId: state.currentThemeId,
        }),
      }
    ),
    { name: 'ThemeStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Select theme mode */
export const selectMode = (state: ThemeStore) => state.mode;

/** Select resolved mode */
export const selectResolvedMode = (state: ThemeStore) => state.resolvedMode;

/** Select current theme ID */
export const selectCurrentThemeId = (state: ThemeStore) => state.currentThemeId;

/** Select is dark mode */
export const selectIsDarkMode = (state: ThemeStore) => state.resolvedMode === 'dark';

/** Select available themes */
export const selectAvailableThemes = (state: ThemeStore) => 
  Array.from(state.themes.values()).map((t) => ({ id: t.id, name: t.name }));

// ============================================================================
// HOOKS
// ============================================================================

import { useEffect, useCallback } from 'react';

/**
 * Hook to use theme engine
 */
export function useTheme() {
  const store = useThemeStore();

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (store.mode === 'system') {
        store.setMode('system'); // This will recalculate resolved mode
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [store]);

  // Apply theme on mount
  useEffect(() => {
    store.applyTheme();
  }, [store]);

  return {
    mode: store.mode,
    resolvedMode: store.resolvedMode,
    isDark: store.resolvedMode === 'dark',
    setMode: store.setMode,
    setTheme: store.setTheme,
    currentTheme: store.getCurrentTheme(),
    availableThemes: selectAvailableThemes(store),
    toggleMode: useCallback(() => {
      store.setMode(store.resolvedMode === 'dark' ? 'light' : 'dark');
    }, [store]),
  };
}

/**
 * Hook to use theme colors
 */
export function useThemeColors() {
  const store = useThemeStore();
  return store.getCurrentTheme().colors;
}

/**
 * Hook to get specific color
 */
export function useThemeColor(colorKey: string) {
  const colors = useThemeColors();
  return colors[colorKey as keyof typeof colors];
}

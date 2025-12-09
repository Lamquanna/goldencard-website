// ============================================================================
// THEMES & LAYOUTS - DEFAULT THEMES
// GoldenEnergy HOME Platform - Default Light & Dark Themes
// ============================================================================

import type { 
  Theme, 
  Typography, 
  SpacingScale, 
  BorderRadiusScale, 
  ShadowScale, 
  TransitionTiming, 
  AnimationPresets,
  SemanticColors,
  StatusColors,
  ChartColors,
} from './types';

// ============================================================================
// SHARED CONFIGURATIONS
// ============================================================================

const sharedTypography: Typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
    serif: 'Georgia, Cambria, serif',
    mono: 'var(--font-geist-mono), Consolas, monospace',
    display: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
    body: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
};

const sharedSpacing: SpacingScale = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

const sharedBorderRadius: BorderRadiusScale = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

const sharedTransitions: TransitionTiming = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

const sharedAnimations: AnimationPresets = {
  none: 'none',
  spin: 'spin 1s linear infinite',
  ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  bounce: 'bounce 1s infinite',
  fadeIn: 'fadeIn 0.3s ease-in-out',
  fadeOut: 'fadeOut 0.3s ease-in-out',
  slideIn: 'slideIn 0.3s ease-out',
  slideOut: 'slideOut 0.3s ease-in',
  scaleIn: 'scaleIn 0.2s ease-out',
  scaleOut: 'scaleOut 0.2s ease-in',
};

// ============================================================================
// LIGHT THEME COLORS
// ============================================================================

const lightSemanticColors: SemanticColors = {
  background: '#ffffff',
  foreground: '#1a1a1a',
  card: '#ffffff',
  cardForeground: '#1a1a1a',
  popover: '#ffffff',
  popoverForeground: '#1a1a1a',
  primary: '#d4a574',
  primaryForeground: '#ffffff',
  secondary: '#1a1a1a',
  secondaryForeground: '#ffffff',
  muted: '#f5f5f5',
  mutedForeground: '#666666',
  accent: '#f5f5f5',
  accentForeground: '#1a1a1a',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e5e5e5',
  input: '#e5e5e5',
  ring: '#d4a574',
};

const lightStatusColors: StatusColors = {
  success: '#22c55e',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  error: '#ef4444',
  errorForeground: '#ffffff',
  info: '#3b82f6',
  infoForeground: '#ffffff',
};

const lightChartColors: ChartColors = {
  chart1: '#d4a574',
  chart2: '#1a1a1a',
  chart3: '#666666',
  chart4: '#22c55e',
  chart5: '#3b82f6',
};

const lightShadows: ShadowScale = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
};

// ============================================================================
// DARK THEME COLORS
// ============================================================================

const darkSemanticColors: SemanticColors = {
  background: '#0a0a0a',
  foreground: '#fafafa',
  card: '#141414',
  cardForeground: '#fafafa',
  popover: '#141414',
  popoverForeground: '#fafafa',
  primary: '#d4a574',
  primaryForeground: '#1a1a1a',
  secondary: '#e5e5e5',
  secondaryForeground: '#1a1a1a',
  muted: '#2a2a2a',
  mutedForeground: '#a3a3a3',
  accent: '#2a2a2a',
  accentForeground: '#ffffff',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#2a2a2a',
  input: '#2a2a2a',
  ring: '#d4a574',
};

const darkStatusColors: StatusColors = {
  success: '#22c55e',
  successForeground: '#ffffff',
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  error: '#ef4444',
  errorForeground: '#ffffff',
  info: '#3b82f6',
  infoForeground: '#ffffff',
};

const darkChartColors: ChartColors = {
  chart1: '#d4a574',
  chart2: '#fafafa',
  chart3: '#a3a3a3',
  chart4: '#22c55e',
  chart5: '#3b82f6',
};

const darkShadows: ShadowScale = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.4)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
};

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/** Create default light theme */
export function createDefaultTheme(): Theme {
  return {
    id: 'golden-light',
    name: 'GoldenEnergy Light',
    description: 'Default light theme for GoldenEnergy platform',
    mode: 'light',
    colors: {
      ...lightSemanticColors,
      ...lightStatusColors,
      ...lightChartColors,
    },
    typography: sharedTypography,
    spacing: sharedSpacing,
    borderRadius: sharedBorderRadius,
    shadows: lightShadows,
    transitions: sharedTransitions,
    animations: sharedAnimations,
  };
}

/** Create default dark theme */
export function createDefaultDarkTheme(): Theme {
  return {
    id: 'golden-dark',
    name: 'GoldenEnergy Dark',
    description: 'Default dark theme for GoldenEnergy platform',
    mode: 'dark',
    colors: {
      ...darkSemanticColors,
      ...darkStatusColors,
      ...darkChartColors,
    },
    typography: sharedTypography,
    spacing: sharedSpacing,
    borderRadius: sharedBorderRadius,
    shadows: darkShadows,
    transitions: sharedTransitions,
    animations: sharedAnimations,
  };
}

// Export singleton instances for convenience
export const defaultTheme = createDefaultTheme();
export const defaultDarkTheme = createDefaultDarkTheme();

// ============================================================================
// THEMES & LAYOUTS - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Theme Engine Types
// ============================================================================

// ============================================================================
// COLOR TYPES
// ============================================================================

/** Color value (hex, rgb, hsl, css variable) */
export type ColorValue = string;

/** Color scale */
export interface ColorScale {
  50: ColorValue;
  100: ColorValue;
  200: ColorValue;
  300: ColorValue;
  400: ColorValue;
  500: ColorValue;
  600: ColorValue;
  700: ColorValue;
  800: ColorValue;
  900: ColorValue;
  950: ColorValue;
}

/** Semantic colors */
export interface SemanticColors {
  background: ColorValue;
  foreground: ColorValue;
  card: ColorValue;
  cardForeground: ColorValue;
  popover: ColorValue;
  popoverForeground: ColorValue;
  primary: ColorValue;
  primaryForeground: ColorValue;
  secondary: ColorValue;
  secondaryForeground: ColorValue;
  muted: ColorValue;
  mutedForeground: ColorValue;
  accent: ColorValue;
  accentForeground: ColorValue;
  destructive: ColorValue;
  destructiveForeground: ColorValue;
  border: ColorValue;
  input: ColorValue;
  ring: ColorValue;
}

/** Status colors */
export interface StatusColors {
  success: ColorValue;
  successForeground: ColorValue;
  warning: ColorValue;
  warningForeground: ColorValue;
  error: ColorValue;
  errorForeground: ColorValue;
  info: ColorValue;
  infoForeground: ColorValue;
}

/** Chart colors */
export interface ChartColors {
  chart1: ColorValue;
  chart2: ColorValue;
  chart3: ColorValue;
  chart4: ColorValue;
  chart5: ColorValue;
}

// ============================================================================
// TYPOGRAPHY TYPES
// ============================================================================

/** Font family configuration */
export interface FontFamily {
  sans: string;
  serif: string;
  mono: string;
  display?: string;
  body?: string;
}

/** Font size scale */
export interface FontSizeScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
  '7xl': string;
  '8xl': string;
  '9xl': string;
}

/** Font weight scale */
export interface FontWeightScale {
  thin: number;
  extralight: number;
  light: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold: number;
  black: number;
}

/** Line height scale */
export interface LineHeightScale {
  none: number;
  tight: number;
  snug: number;
  normal: number;
  relaxed: number;
  loose: number;
}

/** Letter spacing scale */
export interface LetterSpacingScale {
  tighter: string;
  tight: string;
  normal: string;
  wide: string;
  wider: string;
  widest: string;
}

/** Typography configuration */
export interface Typography {
  fontFamily: FontFamily;
  fontSize: FontSizeScale;
  fontWeight: FontWeightScale;
  lineHeight: LineHeightScale;
  letterSpacing: LetterSpacingScale;
}

// ============================================================================
// SPACING & SIZING TYPES
// ============================================================================

/** Spacing scale */
export interface SpacingScale {
  0: string;
  px: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;
  10: string;
  11: string;
  12: string;
  14: string;
  16: string;
  20: string;
  24: string;
  28: string;
  32: string;
  36: string;
  40: string;
  44: string;
  48: string;
  52: string;
  56: string;
  60: string;
  64: string;
  72: string;
  80: string;
  96: string;
}

/** Border radius scale */
export interface BorderRadiusScale {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

/** Shadow scale */
export interface ShadowScale {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
}

// ============================================================================
// BREAKPOINTS & RESPONSIVE
// ============================================================================

/** Breakpoint configuration */
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

/** Container widths */
export interface ContainerWidths {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

// ============================================================================
// ANIMATION & TRANSITION
// ============================================================================

/** Transition timing */
export interface TransitionTiming {
  duration: {
    75: string;
    100: string;
    150: string;
    200: string;
    300: string;
    500: string;
    700: string;
    1000: string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    inOut: string;
  };
}

/** Animation presets */
export interface AnimationPresets {
  none: string;
  spin: string;
  ping: string;
  pulse: string;
  bounce: string;
  fadeIn: string;
  fadeOut: string;
  slideIn: string;
  slideOut: string;
  scaleIn: string;
  scaleOut: string;
}

// ============================================================================
// THEME DEFINITION
// ============================================================================

/** Theme mode */
export type ThemeMode = 'light' | 'dark' | 'system';

/** Theme definition */
export interface Theme {
  /** Theme identifier */
  id: string;
  /** Theme name */
  name: string;
  /** Theme description */
  description?: string;
  /** Theme mode */
  mode: 'light' | 'dark';
  /** Semantic colors */
  colors: SemanticColors & StatusColors & ChartColors;
  /** Color palette */
  palette?: {
    primary: ColorScale;
    secondary: ColorScale;
    gray: ColorScale;
    [key: string]: ColorScale;
  };
  /** Typography */
  typography: Typography;
  /** Spacing */
  spacing: SpacingScale;
  /** Border radius */
  borderRadius: BorderRadiusScale;
  /** Shadows */
  shadows: ShadowScale;
  /** Transitions */
  transitions: TransitionTiming;
  /** Animations */
  animations: AnimationPresets;
  /** Custom CSS variables */
  cssVariables?: Record<string, string>;
}

/** Theme pair (light + dark) */
export interface ThemePair {
  id: string;
  name: string;
  light: Theme;
  dark: Theme;
}

// ============================================================================
// THEME ENGINE STATE
// ============================================================================

/** Theme engine state */
export interface ThemeEngineState {
  /** Current theme mode */
  mode: ThemeMode;
  /** Resolved mode (light or dark) */
  resolvedMode: 'light' | 'dark';
  /** Current theme ID */
  currentThemeId: string;
  /** Available themes */
  themes: Map<string, ThemePair>;
  /** Custom theme overrides */
  overrides: Partial<Theme>;
  /** System preference */
  systemPreference: 'light' | 'dark';
}

/** Theme engine actions */
export interface ThemeEngineActions {
  /** Set theme mode */
  setMode: (mode: ThemeMode) => void;
  /** Set theme */
  setTheme: (themeId: string) => void;
  /** Register theme */
  registerTheme: (theme: ThemePair) => void;
  /** Remove theme */
  removeTheme: (themeId: string) => void;
  /** Set overrides */
  setOverrides: (overrides: Partial<Theme>) => void;
  /** Clear overrides */
  clearOverrides: () => void;
  /** Get current theme */
  getCurrentTheme: () => Theme;
  /** Get CSS variables */
  getCSSVariables: () => Record<string, string>;
  /** Apply theme to document */
  applyTheme: () => void;
  /** Reset to default */
  reset: () => void;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

/** Layout type */
export type LayoutType = 
  | 'default'
  | 'sidebar'
  | 'header-sidebar'
  | 'double-sidebar'
  | 'horizontal'
  | 'full-width'
  | 'centered'
  | 'dashboard';

/** Sidebar position */
export type SidebarPosition = 'left' | 'right';

/** Sidebar state */
export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

/** Layout configuration */
export interface LayoutConfig {
  /** Layout type */
  type: LayoutType;
  /** Header configuration */
  header?: HeaderConfig;
  /** Sidebar configuration */
  sidebar?: SidebarConfig;
  /** Secondary sidebar configuration */
  secondarySidebar?: SidebarConfig;
  /** Footer configuration */
  footer?: FooterConfig;
  /** Main content configuration */
  main?: MainConfig;
}

/** Header configuration */
export interface HeaderConfig {
  /** Is header visible */
  visible: boolean;
  /** Header height */
  height: number | string;
  /** Is header fixed/sticky */
  fixed: boolean;
  /** Header background */
  background?: 'solid' | 'transparent' | 'blur';
  /** Show border */
  border?: boolean;
  /** Custom class name */
  className?: string;
}

/** Sidebar configuration */
export interface SidebarConfig {
  /** Is sidebar visible */
  visible: boolean;
  /** Sidebar position */
  position: SidebarPosition;
  /** Sidebar width (expanded) */
  width: number | string;
  /** Sidebar width (collapsed) */
  collapsedWidth: number | string;
  /** Current state */
  state: SidebarState;
  /** Can be collapsed */
  collapsible: boolean;
  /** Collapse on mobile */
  collapseOnMobile: boolean;
  /** Mobile breakpoint */
  mobileBreakpoint: keyof Breakpoints;
  /** Background variant */
  variant?: 'default' | 'floating' | 'inset';
  /** Show border */
  border?: boolean;
  /** Custom class name */
  className?: string;
}

/** Footer configuration */
export interface FooterConfig {
  /** Is footer visible */
  visible: boolean;
  /** Footer height */
  height: number | string;
  /** Is footer fixed */
  fixed: boolean;
  /** Custom class name */
  className?: string;
}

/** Main content configuration */
export interface MainConfig {
  /** Padding */
  padding?: string | number;
  /** Max width */
  maxWidth?: string | number;
  /** Center content */
  centered?: boolean;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// LAYOUT ENGINE STATE
// ============================================================================

/** Layout engine state */
export interface LayoutEngineState {
  /** Current layout configuration */
  config: LayoutConfig;
  /** Sidebar state */
  sidebarState: SidebarState;
  /** Secondary sidebar state */
  secondarySidebarState: SidebarState;
  /** Is mobile view */
  isMobile: boolean;
  /** Is tablet view */
  isTablet: boolean;
  /** Current breakpoint */
  breakpoint: keyof Breakpoints;
}

/** Layout engine actions */
export interface LayoutEngineActions {
  /** Set layout config */
  setConfig: (config: Partial<LayoutConfig>) => void;
  /** Set layout type */
  setLayoutType: (type: LayoutType) => void;
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Set sidebar state */
  setSidebarState: (state: SidebarState) => void;
  /** Toggle secondary sidebar */
  toggleSecondarySidebar: () => void;
  /** Set secondary sidebar state */
  setSecondarySidebarState: (state: SidebarState) => void;
  /** Show header */
  showHeader: () => void;
  /** Hide header */
  hideHeader: () => void;
  /** Show footer */
  showFooter: () => void;
  /** Hide footer */
  hideFooter: () => void;
  /** Set breakpoint */
  setBreakpoint: (breakpoint: keyof Breakpoints) => void;
  /** Reset to default */
  reset: () => void;
}

// ============================================================================
// APP SHELL TYPES
// ============================================================================

/** App shell props */
export interface AppShellProps {
  /** Children content */
  children: React.ReactNode;
  /** Header content */
  header?: React.ReactNode;
  /** Sidebar content */
  sidebar?: React.ReactNode;
  /** Secondary sidebar content */
  secondarySidebar?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
  /** Layout configuration */
  layout?: Partial<LayoutConfig>;
  /** Theme mode */
  themeMode?: ThemeMode;
  /** Theme ID */
  themeId?: string;
  /** Custom class name */
  className?: string;
}

/** Navigation item */
export interface NavItem {
  /** Item ID */
  id: string;
  /** Display label */
  label: string;
  /** Icon */
  icon?: string | React.ReactNode;
  /** Route path */
  href?: string;
  /** On click handler */
  onClick?: () => void;
  /** Is active */
  active?: boolean;
  /** Is disabled */
  disabled?: boolean;
  /** Badge content */
  badge?: string | number;
  /** Children items (for nested nav) */
  children?: NavItem[];
  /** Required permission */
  permission?: string;
  /** Is separator */
  separator?: boolean;
  /** Group label */
  group?: string;
}

/** Breadcrumb item */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path */
  href?: string;
  /** Icon */
  icon?: string | React.ReactNode;
  /** Is current page */
  current?: boolean;
}

import React from 'react';

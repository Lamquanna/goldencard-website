// ============================================================================
// THEMES & LAYOUTS - MODULE INDEX
// GoldenEnergy HOME Platform - Theme Engine Barrel Exports
// ============================================================================

// Types
export * from './types';

// Default themes
export { defaultTheme, defaultDarkTheme } from './default-theme';

// Theme store and hooks
export {
  useThemeStore,
  useTheme,
  useThemeColors,
  useThemeColor,
  selectMode,
  selectResolvedMode,
  selectCurrentThemeId,
  selectIsDarkMode,
  selectAvailableThemes,
} from './theme-store';

// Layout engine and hooks
export {
  useLayoutStore,
  useLayout,
  useSidebar,
  useResponsive,
  layoutPresets,
  applyLayoutPreset,
  selectSidebar,
  selectHeader,
  selectFooter,
  selectIsSidebarCollapsed,
  selectIsMobile,
  selectIsTablet,
  selectSidebarWidth,
} from './layout-engine';

export type {
  InternalSidebarConfig,
  InternalHeaderConfig,
  InternalFooterConfig,
  InternalMainConfig,
  LayoutStoreState,
  LayoutStoreActions,
  LayoutPreset,
} from './layout-engine';

// AppShell components
export {
  AppShell,
  useAppShell,
  SidebarToggle,
  ThemeToggle,
  Breadcrumbs,
  PageHeader,
} from './AppShell';

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

export type {
  // Theme types
  Theme,
  ThemePair,
  ThemeMode,
  ColorValue,
  ColorScale,
  SemanticColors,
  StatusColors,
  ChartColors,
  Typography,
  FontFamily,
  FontSizeScale,
  FontWeightScale,
  LineHeightScale,
  LetterSpacingScale,
  SpacingScale,
  BorderRadiusScale,
  ShadowScale,
  Breakpoints,
  ContainerWidths,
  TransitionTiming,
  AnimationPresets,
  ThemeEngineState,
  ThemeEngineActions,
  
  // Layout types
  LayoutType,
  LayoutConfig,
  HeaderConfig,
  SidebarConfig,
  FooterConfig,
  MainConfig,
  SidebarPosition,
  SidebarState,
  LayoutEngineState,
  LayoutEngineActions,
  
  // App shell types
  AppShellProps,
  NavItem,
  BreadcrumbItem,
} from './types';

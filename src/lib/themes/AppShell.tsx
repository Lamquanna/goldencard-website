// ============================================================================
// THEMES & LAYOUTS - APP SHELL COMPONENT
// GoldenEnergy HOME Platform - Application Shell Layout
// ============================================================================

'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import type { AppShellProps, NavItem, BreadcrumbItem } from './types';
import { useTheme } from './theme-store';
import { useLayout, useSidebar, useResponsive } from './layout-engine';

// ============================================================================
// APP SHELL CONTEXT
// ============================================================================

interface AppShellContextValue {
  /** Toggle sidebar */
  toggleSidebar: () => void;
  /** Close sidebar */
  closeSidebar: () => void;
  /** Open sidebar */
  openSidebar: () => void;
  /** Is sidebar collapsed */
  isSidebarCollapsed: boolean;
  /** Is sidebar open (mobile) */
  isSidebarOpen: boolean;
  /** Is mobile */
  isMobile: boolean;
  /** Current theme mode */
  themeMode: 'light' | 'dark';
  /** Toggle theme */
  toggleTheme: () => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShell');
  }
  return context;
}

// ============================================================================
// APP SHELL COMPONENT
// ============================================================================

export function AppShell({
  children,
  header,
  sidebar,
  secondarySidebar,
  footer,
  layout,
  themeMode: initialThemeMode,
  themeId,
  className,
}: AppShellProps) {
  const theme = useTheme();
  const layoutState = useLayout();
  const sidebarState = useSidebar();
  const responsive = useResponsive();

  // Initialize theme if provided
  useEffect(() => {
    if (initialThemeMode) {
      theme.setMode(initialThemeMode);
    }
    if (themeId) {
      theme.setTheme(themeId);
    }
  }, [initialThemeMode, themeId, theme]);

  // Apply layout preset if provided
  useEffect(() => {
    if (layout) {
      // Apply partial layout config
      if (layout.sidebar) layoutState.updateSidebar(layout.sidebar as Parameters<typeof layoutState.updateSidebar>[0]);
      if (layout.header) layoutState.updateHeader(layout.header as Parameters<typeof layoutState.updateHeader>[0]);
      if (layout.footer) layoutState.updateFooter(layout.footer as Parameters<typeof layoutState.updateFooter>[0]);
    }
  }, [layout, layoutState]);

  // Context value
  const contextValue: AppShellContextValue = {
    toggleSidebar: sidebarState.toggle,
    closeSidebar: sidebarState.close,
    openSidebar: sidebarState.open,
    isSidebarCollapsed: sidebarState.isCollapsed,
    isSidebarOpen: sidebarState.isOpen,
    isMobile: responsive.isMobile,
    themeMode: theme.resolvedMode,
    toggleTheme: theme.toggleMode,
  };

  // Computed styles
  const currentSidebarWidth = sidebarState.width;

  const mainStyle: React.CSSProperties = {
    marginLeft: !responsive.isMobile && sidebar && layoutState.sidebar.visible
      ? currentSidebarWidth
      : 0,
    marginTop: header ? layoutState.header.height : 0,
    marginBottom: footer && layoutState.footer.visible ? layoutState.footer.height : 0,
    minHeight: `calc(100vh - ${layoutState.header.height}px)`,
    transition: 'margin-left 300ms ease-in-out',
  };

  return (
    <AppShellContext.Provider value={contextValue}>
      <div
        className={cn(
          'app-shell min-h-screen bg-background text-foreground',
          `layout-${layoutState.layoutType}`,
          sidebarState.isCollapsed && 'sidebar-collapsed',
          layoutState.isFullscreen && 'fullscreen',
          responsive.isMobile && 'mobile',
          theme.isDark && 'dark',
          className
        )}
      >
        {/* Header */}
        {header && layoutState.header.visible && (
          <AppShellHeader
            height={layoutState.header.height}
            fixed={layoutState.header.fixed}
            background={layoutState.header.background}
            showShadow={layoutState.header.showShadow}
            sidebarWidth={currentSidebarWidth}
            isMobile={responsive.isMobile}
          >
            {header}
          </AppShellHeader>
        )}

        {/* Sidebar */}
        {sidebar && layoutState.sidebar.visible && (
          <AppShellSidebar
            width={layoutState.sidebar.width}
            collapsedWidth={layoutState.sidebar.collapsedWidth}
            isCollapsed={sidebarState.isCollapsed}
            isOpen={sidebarState.isOpen}
            position={layoutState.sidebar.position}
            isMobile={responsive.isMobile}
            headerHeight={layoutState.header.height}
            onClose={sidebarState.close}
          >
            {sidebar}
          </AppShellSidebar>
        )}

        {/* Main Content */}
        <main
          className={cn('app-main', layoutState.main.centered && 'flex justify-center')}
          style={mainStyle}
        >
          <div
            className={cn(
              'app-content-inner w-full',
              layoutState.main.centered && 'mx-auto',
            )}
            style={{
              maxWidth: layoutState.main.maxWidth,
              padding: responsive.isMobile
                ? layoutState.main.paddingMobile
                : layoutState.main.padding,
            }}
          >
            {children}
          </div>
        </main>

        {/* Secondary Sidebar */}
        {secondarySidebar && (
          <AppShellSidebar
            width={240}
            collapsedWidth={0}
            isCollapsed={false}
            isOpen={true}
            position="right"
            isMobile={responsive.isMobile}
            headerHeight={layoutState.header.height}
          >
            {secondarySidebar}
          </AppShellSidebar>
        )}

        {/* Footer */}
        {footer && layoutState.footer.visible && (
          <AppShellFooter
            height={layoutState.footer.height}
            fixed={layoutState.footer.fixed}
            sidebarWidth={currentSidebarWidth}
            isMobile={responsive.isMobile}
          >
            {footer}
          </AppShellFooter>
        )}

        {/* Mobile Sidebar Overlay */}
        {responsive.isMobile && sidebarState.isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={sidebarState.close}
          />
        )}
      </div>
    </AppShellContext.Provider>
  );
}

// ============================================================================
// APP SHELL HEADER
// ============================================================================

interface AppShellHeaderProps {
  children: React.ReactNode;
  height: number;
  fixed: boolean;
  background: 'solid' | 'transparent' | 'blur';
  showShadow: boolean;
  sidebarWidth: number;
  isMobile: boolean;
}

function AppShellHeader({
  children,
  height,
  fixed,
  background,
  showShadow,
  sidebarWidth,
  isMobile,
}: AppShellHeaderProps) {
  return (
    <header
      className={cn(
        'app-header w-full z-30 border-b',
        fixed && 'fixed top-0',
        !fixed && 'sticky top-0',
        background === 'solid' && 'bg-card',
        background === 'transparent' && 'bg-transparent',
        background === 'blur' && 'bg-card/80 backdrop-blur-md',
        showShadow && 'shadow-sm',
      )}
      style={{
        height,
        left: isMobile ? 0 : sidebarWidth,
        right: 0,
        transition: 'left 300ms ease-in-out',
      }}
    >
      {children}
    </header>
  );
}

// ============================================================================
// APP SHELL SIDEBAR
// ============================================================================

interface AppShellSidebarProps {
  children: React.ReactNode;
  width: number;
  collapsedWidth: number;
  isCollapsed: boolean;
  isOpen: boolean;
  position: 'left' | 'right';
  isMobile: boolean;
  headerHeight: number;
  onClose?: () => void;
}

function AppShellSidebar({
  children,
  width,
  collapsedWidth,
  isCollapsed,
  isOpen,
  position,
  isMobile,
  headerHeight,
  onClose,
}: AppShellSidebarProps) {
  const currentWidth = isCollapsed ? collapsedWidth : width;

  // Mobile sidebar (drawer)
  if (isMobile) {
    return (
      <aside
        className={cn(
          'app-sidebar fixed top-0 h-full z-50 bg-sidebar border-r',
          position === 'left' ? 'left-0' : 'right-0',
          'transition-transform duration-300 ease-in-out',
          isOpen
            ? 'translate-x-0'
            : position === 'left'
            ? '-translate-x-full'
            : 'translate-x-full',
        )}
        style={{ width }}
      >
        {children}
      </aside>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'app-sidebar fixed top-0 h-full z-20 bg-sidebar border-r',
        position === 'left' ? 'left-0' : 'right-0',
        'transition-all duration-300 ease-in-out overflow-hidden',
      )}
      style={{
        width: currentWidth,
        paddingTop: headerHeight,
      }}
    >
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </aside>
  );
}

// ============================================================================
// APP SHELL FOOTER
// ============================================================================

interface AppShellFooterProps {
  children: React.ReactNode;
  height: number;
  fixed: boolean;
  sidebarWidth: number;
  isMobile: boolean;
}

function AppShellFooter({
  children,
  height,
  fixed,
  sidebarWidth,
  isMobile,
}: AppShellFooterProps) {
  return (
    <footer
      className={cn(
        'app-footer w-full border-t bg-card',
        fixed && 'fixed bottom-0',
      )}
      style={{
        height,
        left: isMobile ? 0 : sidebarWidth,
        right: 0,
        transition: 'left 300ms ease-in-out',
      }}
    >
      {children}
    </footer>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Sidebar toggle button
 */
export function SidebarToggle({ className }: { className?: string }) {
  const { toggleSidebar, isSidebarCollapsed, isMobile, openSidebar } = useAppShell();

  return (
    <button
      type="button"
      className={cn(
        'p-2 rounded-md hover:bg-accent transition-colors',
        className
      )}
      onClick={isMobile ? openSidebar : toggleSidebar}
      aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}

/**
 * Theme toggle button
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { themeMode, toggleTheme } = useAppShell();

  return (
    <button
      type="button"
      className={cn(
        'p-2 rounded-md hover:bg-accent transition-colors',
        className
      )}
      onClick={toggleTheme}
      aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {themeMode === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * Breadcrumbs component
 */
export function Breadcrumbs({
  items,
  separator = '/',
  className,
}: {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}) {
  return (
    <nav className={cn('flex items-center text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-muted-foreground">{separator}</span>
            )}
            {item.href && !item.current ? (
              <a
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </a>
            ) : (
              <span className={cn(item.current && 'text-foreground font-medium')}>
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Page header with title and breadcrumbs
 */
export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      )}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

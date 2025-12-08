"use client";

// =============================================================================
// HOME PLATFORM - App Shell Layout
// Main application shell with sidebar, header, workspace switcher
// =============================================================================

import React, { useState, useEffect, createContext, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getRegistry } from '../core/pluginEngine';
import { getPermissionEngine } from '../core/permissions';
import { getNotificationService } from '../core/notifications';
import type { ModuleManifest, User, Workspace, MenuItem } from '../types';

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

interface AppShellContextType {
  user: User | null;
  workspace: Workspace | null;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  activeModules: ModuleManifest[];
  unreadNotifications: number;
}

const AppShellContext = createContext<AppShellContextType | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider');
  }
  return context;
}

// -----------------------------------------------------------------------------
// Icons
// -----------------------------------------------------------------------------

const Icons = {
  menu: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  ),
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  sun: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  moon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
};

// Module Icons Map
const ModuleIcons: Record<string, React.ReactNode> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 6a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zM4 13a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
    </svg>
  ),
  crm: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  hrm: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  tasks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  inventory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  finance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  maps: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  automation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  documents: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  workflow: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

function getModuleIcon(moduleId: string): React.ReactNode {
  return ModuleIcons[moduleId] || ModuleIcons.dashboard;
}

// -----------------------------------------------------------------------------
// Sidebar Component
// -----------------------------------------------------------------------------

interface SidebarProps {
  modules: ModuleManifest[];
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

function Sidebar({ modules, collapsed, onCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/home') {
      return pathname === '/home';
    }
    return pathname.startsWith(href);
  };

  // Group modules by category
  const groupedModules = modules.reduce((acc, module) => {
    const category = module.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(module);
    return acc;
  }, {} as Record<string, ModuleManifest[]>);

  const categoryLabels: Record<string, string> = {
    core: 'Tổng quan',
    sales: 'Kinh doanh',
    hr: 'Nhân sự',
    operations: 'Vận hành',
    finance: 'Tài chính',
    analytics: 'Phân tích',
    communication: 'Giao tiếp',
    productivity: 'Năng suất',
    integration: 'Tích hợp',
  };

  const categoryOrder = ['core', 'sales', 'hr', 'operations', 'finance', 'analytics', 'communication', 'productivity', 'integration'];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 transition-all duration-300 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!collapsed && (
          <Link href="/home" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8960A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-xl font-bold">
              <span className="text-[#D4AF37]">Golden</span>
              <span className="text-gray-900 dark:text-white">Home</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/home" className="mx-auto">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8960A] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => onCollapse(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {Icons.chevronLeft}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Home */}
        <Link
          href="/home"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
            pathname === '/home'
              ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title={collapsed ? 'Trang chủ' : undefined}
        >
          {Icons.home}
          {!collapsed && <span className="font-medium">Trang chủ</span>}
        </Link>

        {/* Modules by category */}
        {categoryOrder.map(category => {
          const categoryModules = groupedModules[category];
          if (!categoryModules || categoryModules.length === 0) return null;

          return (
            <div key={category} className="pt-4 first:pt-0">
              {!collapsed && (
                <div className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {categoryLabels[category] || category}
                </div>
              )}
              {collapsed && <div className="border-t border-gray-200 dark:border-gray-700 my-2" />}
              
              {categoryModules.map(module => (
                <Link
                  key={module.id}
                  href={module.basePath}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                    isActive(module.basePath)
                      ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={collapsed ? module.nameVi : undefined}
                >
                  <span className={isActive(module.basePath) ? 'text-[#D4AF37]' : ''}>
                    {getModuleIcon(module.id)}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="font-medium flex-1">{module.nameVi}</span>
                      {/* Badge if any */}
                    </>
                  )}
                  {/* Tooltip for collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {module.nameVi}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onCollapse(false)}
            className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
          >
            {Icons.chevronRight}
          </button>
        </div>
      )}

      {/* Settings & Logout */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <Link
            href="/home/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              isActive('/home/settings')
                ? 'bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {Icons.settings}
            <span className="font-medium">Cài đặt</span>
          </Link>
        </div>
      )}
    </aside>
  );
}

// -----------------------------------------------------------------------------
// Header Component
// -----------------------------------------------------------------------------

interface HeaderProps {
  user: User | null;
  onMenuClick: () => void;
  unreadNotifications: number;
}

function Header({ user, onMenuClick, unreadNotifications }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
      {/* Left - Menu button (mobile) & Search */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {Icons.menu}
        </button>

        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-[200px] lg:min-w-[300px]"
        >
          {Icons.search}
          <span className="text-sm">Tìm kiếm...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Create */}
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
          {Icons.plus}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
          >
            {Icons.bell}
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <span className="text-[#D4AF37] font-bold text-sm">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.fullName || user?.username || 'User'}
            </span>
          </button>

          {/* User Dropdown */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="font-medium text-gray-900 dark:text-white">{user?.fullName || user?.username}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/home/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    href="/home/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Cài đặt
                  </Link>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                  <button
                    onClick={() => {
                      localStorage.removeItem('crm_auth');
                      router.push('/home/login');
                    }}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
                  >
                    {Icons.logout}
                    Đăng xuất
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-[15vh]"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                {Icons.search}
                <input
                  type="text"
                  placeholder="Tìm kiếm modules, trang, dữ liệu..."
                  className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-2">
                {/* Search results would go here */}
                <div className="text-center py-8 text-gray-500">
                  Nhập để tìm kiếm...
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// -----------------------------------------------------------------------------
// App Shell Provider
// -----------------------------------------------------------------------------

interface AppShellProviderProps {
  children: React.ReactNode;
}

export function AppShellProvider({ children }: AppShellProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [activeModules, setActiveModules] = useState<ModuleManifest[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if on login page
  const isLoginPage = pathname === '/home/login';

  useEffect(() => {
    const initializeApp = async () => {
      if (isLoginPage) {
        setLoading(false);
        return;
      }

      // Check auth
      const token = localStorage.getItem('crm_auth');
      if (!token) {
        router.push('/home/login');
        return;
      }

      try {
        // Verify token
        const response = await fetch('/api/erp/auth/verify', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            username: data.user.username,
            fullName: data.user.fullName || data.user.username,
            roles: [data.user.role],
            workspaces: [],
            preferences: {
              theme: 'light',
              language: 'vi',
              notifications: {
                email: true,
                push: true,
                desktop: true,
                sound: true,
                channels: { tasks: true, mentions: true, updates: true, marketing: false },
              },
              sidebar: { collapsed: false, pinnedModules: [] },
            },
            status: 'active',
            createdAt: new Date(),
          });

          // Load active modules
          // In production, this would come from database
          setActiveModules(getDefaultModules());
        } else {
          localStorage.removeItem('crm_auth');
          router.push('/home/login');
          return;
        }
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('crm_auth');
        router.push('/home/login');
        return;
      }

      setLoading(false);
    };

    initializeApp();
  }, [isLoginPage, router]);

  // Apply theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const contextValue: AppShellContextType = {
    user,
    workspace,
    sidebarCollapsed,
    setSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
    theme,
    setTheme,
    activeModules,
    unreadNotifications,
  };

  // Login page - no shell
  if (isLoginPage) {
    return (
      <AppShellContext.Provider value={contextValue}>
        {children}
      </AppShellContext.Provider>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShellContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Sidebar
            modules={activeModules}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden"
              >
                <Sidebar
                  modules={activeModules}
                  collapsed={false}
                  onCollapse={() => {}}
                />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {Icons.close}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <Header
            user={user}
            onMenuClick={() => setSidebarOpen(true)}
            unreadNotifications={unreadNotifications}
          />
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// Default Modules Configuration
// -----------------------------------------------------------------------------

function getDefaultModules(): ModuleManifest[] {
  return [
    {
      id: 'dashboard',
      name: 'Dashboard',
      nameVi: 'Bảng điều khiển',
      version: '1.0.0',
      description: 'Overview dashboard',
      descriptionVi: 'Bảng tổng quan',
      icon: 'dashboard',
      color: '#D4AF37',
      author: 'GoldenEnergy',
      category: 'core',
      basePath: '/home/dashboard',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'member'],
      status: 'active',
    },
    {
      id: 'crm',
      name: 'CRM',
      nameVi: 'CRM',
      version: '1.0.0',
      description: 'Customer Relationship Management',
      descriptionVi: 'Quản lý quan hệ khách hàng',
      icon: 'crm',
      color: '#3B82F6',
      author: 'GoldenEnergy',
      category: 'sales',
      basePath: '/home/crm',
      routes: [
        { path: '/leads', name: 'Leads', nameVi: 'Leads', showInSidebar: true },
        { path: '/deals', name: 'Deals', nameVi: 'Deals', showInSidebar: true },
        { path: '/contacts', name: 'Contacts', nameVi: 'Liên hệ', showInSidebar: true },
      ],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'sales_rep'],
      status: 'active',
    },
    {
      id: 'hrm',
      name: 'HRM',
      nameVi: 'Nhân sự',
      version: '1.0.0',
      description: 'Human Resource Management',
      descriptionVi: 'Quản lý nhân sự',
      icon: 'hrm',
      color: '#EC4899',
      author: 'GoldenEnergy',
      category: 'hr',
      basePath: '/home/hrm',
      routes: [
        { path: '/employees', name: 'Employees', nameVi: 'Nhân viên', showInSidebar: true },
        { path: '/attendance', name: 'Attendance', nameVi: 'Chấm công', showInSidebar: true },
        { path: '/leaves', name: 'Leaves', nameVi: 'Nghỉ phép', showInSidebar: true },
      ],
      permissions: [],
      defaultRoles: ['admin', 'hr_manager'],
      status: 'active',
    },
    {
      id: 'projects',
      name: 'Projects',
      nameVi: 'Dự án',
      version: '1.0.0',
      description: 'Project Management',
      descriptionVi: 'Quản lý dự án',
      icon: 'projects',
      color: '#8B5CF6',
      author: 'GoldenEnergy',
      category: 'operations',
      basePath: '/home/projects',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'project_manager'],
      status: 'active',
    },
    {
      id: 'tasks',
      name: 'Tasks',
      nameVi: 'Công việc',
      version: '1.0.0',
      description: 'Task Management',
      descriptionVi: 'Quản lý công việc',
      icon: 'tasks',
      color: '#10B981',
      author: 'GoldenEnergy',
      category: 'productivity',
      basePath: '/home/tasks',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'member'],
      status: 'active',
    },
    {
      id: 'inventory',
      name: 'Inventory',
      nameVi: 'Kho hàng',
      version: '1.0.0',
      description: 'Inventory Management',
      descriptionVi: 'Quản lý kho hàng',
      icon: 'inventory',
      color: '#F59E0B',
      author: 'GoldenEnergy',
      category: 'operations',
      basePath: '/home/inventory',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'warehouse_manager'],
      status: 'active',
    },
    {
      id: 'finance',
      name: 'Finance',
      nameVi: 'Tài chính',
      version: '1.0.0',
      description: 'Financial Management',
      descriptionVi: 'Quản lý tài chính',
      icon: 'finance',
      color: '#059669',
      author: 'GoldenEnergy',
      category: 'finance',
      basePath: '/home/finance',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'finance_manager'],
      status: 'active',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      nameVi: 'Phân tích',
      version: '1.0.0',
      description: 'Business Analytics',
      descriptionVi: 'Phân tích kinh doanh',
      icon: 'analytics',
      color: '#6366F1',
      author: 'GoldenEnergy',
      category: 'analytics',
      basePath: '/home/analytics',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager'],
      status: 'active',
    },
    {
      id: 'chat',
      name: 'Chat',
      nameVi: 'Chat',
      version: '1.0.0',
      description: 'Team Communication',
      descriptionVi: 'Giao tiếp nhóm',
      icon: 'chat',
      color: '#0EA5E9',
      author: 'GoldenEnergy',
      category: 'communication',
      basePath: '/home/chat',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'member'],
      status: 'active',
    },
    {
      id: 'maps',
      name: 'Maps',
      nameVi: 'Bản đồ',
      version: '1.0.0',
      description: 'Location & Maps',
      descriptionVi: 'Vị trí & Bản đồ',
      icon: 'maps',
      color: '#14B8A6',
      author: 'GoldenEnergy',
      category: 'operations',
      basePath: '/home/maps',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager'],
      status: 'active',
    },
    {
      id: 'automation',
      name: 'Automation',
      nameVi: 'Tự động hóa',
      version: '1.0.0',
      description: 'Workflow Automation',
      descriptionVi: 'Tự động hóa quy trình',
      icon: 'automation',
      color: '#F97316',
      author: 'GoldenEnergy',
      category: 'productivity',
      basePath: '/home/automation',
      routes: [],
      permissions: [],
      defaultRoles: ['admin'],
      status: 'active',
    },
    {
      id: 'documents',
      name: 'Documents',
      nameVi: 'Tài liệu',
      version: '1.0.0',
      description: 'Document Management',
      descriptionVi: 'Quản lý tài liệu',
      icon: 'documents',
      color: '#64748B',
      author: 'GoldenEnergy',
      category: 'productivity',
      basePath: '/home/documents',
      routes: [],
      permissions: [],
      defaultRoles: ['admin', 'manager', 'member'],
      status: 'active',
    },
  ];
}

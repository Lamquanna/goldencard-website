'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  CubeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  MapIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  BoltIcon,
  ChevronDownIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, CRMModule, UserRole } from '@/lib/stores/auth-store';

interface NavItem {
  id: CRMModule;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: number | string;
  children?: { name: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/erp',
    icon: HomeIcon,
    description: 'Tổng quan CRM',
  },
  {
    id: 'leads',
    name: 'Khách hàng',
    href: '/erp/leads',
    icon: UsersIcon,
    description: 'Quản lý leads',
    badge: 'New',
  },
  {
    id: 'projects',
    name: 'Dự án',
    href: '/erp/projects',
    icon: FolderIcon,
    description: 'Quản lý dự án',
  },
  {
    id: 'inventory',
    name: 'Kho hàng',
    href: '/erp/inventory',
    icon: CubeIcon,
    description: 'Quản lý tồn kho',
  },
  {
    id: 'tasks',
    name: 'Công việc',
    href: '/erp/tasks',
    icon: ClipboardDocumentListIcon,
    description: 'Danh sách tasks',
  },
  {
    id: 'attendance',
    name: 'Chấm công',
    href: '/erp/attendance',
    icon: CalendarDaysIcon,
    description: 'Quản lý chấm công',
  },
  {
    id: 'analytics',
    name: 'Báo cáo',
    href: '/erp/analytics',
    icon: ChartBarIcon,
    description: 'Thống kê & phân tích',
  },
  {
    id: 'maps',
    name: 'Bản đồ',
    href: '/erp/maps',
    icon: MapIcon,
    description: 'Vị trí kho & dự án',
  },
  {
    id: 'chat',
    name: 'Chat',
    href: '/erp/chat',
    icon: ChatBubbleLeftRightIcon,
    description: 'Tin nhắn nội bộ',
    badge: 3,
  },
  {
    id: 'users',
    name: 'Người dùng',
    href: '/erp/users',
    icon: Cog6ToothIcon,
    description: 'Quản lý tài khoản',
  },
];

const ROLE_LABELS: Record<UserRole, { label: string; color: string; icon: string }> = {
  admin: { label: 'Quản trị viên', color: 'bg-purple-500', icon: '👑' },
  manager: { label: 'Quản lý', color: 'bg-blue-500', icon: '🏢' },
  sale: { label: 'Sale', color: 'bg-green-500', icon: '💼' },
  staff: { label: 'Nhân viên', color: 'bg-gray-500', icon: '👤' },
};

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auth store
  const { 
    user, 
    isAuthenticated, 
    hasPermission, 
    setUser, 
    logout 
  } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('crm_auth');
    
    if (!token) {
      router.push('/erp/login');
      return;
    }

    try {
      const response = await fetch('/api/erp/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          id: data.user.id,
          username: data.user.username,
          role: data.user.role,
          email: data.user.email,
        });
        setIsLoading(false);
      } else {
        localStorage.removeItem('crm_auth');
        router.push('/erp/login');
      }
    } catch (error) {
      localStorage.removeItem('crm_auth');
      router.push('/erp/login');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('crm_auth');
    router.push('/erp/login');
  };

  // Filter nav items based on permissions
  const visibleNavItems = NAV_ITEMS.filter(item => {
    if (!user) return false;
    return hasPermission(item.id, 'view');
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-green-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
            <SunIcon className="absolute inset-3 w-14 h-14 text-green-500 animate-pulse" />
          </div>
          <p className="text-gray-600 font-medium">Đang tải GoldenCRM...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleInfo = ROLE_LABELS[user.role];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <Link href="/erp" className="flex items-center gap-2">
            <BoltIcon className="w-8 h-8 text-green-500" />
            <span className="text-xl font-bold">
              <span className="text-amber-500">Golden</span>
              <span className="text-green-600">CRM</span>
            </span>
          </Link>

          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent
                user={user}
                roleInfo={roleInfo}
                visibleNavItems={visibleNavItems}
                pathname={pathname}
                onLogout={handleLogout}
                onClose={() => setIsMobileMenuOpen(false)}
                isMobile
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-gray-200 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <SidebarContent
          user={user}
          roleInfo={roleInfo}
          visibleNavItems={visibleNavItems}
          pathname={pathname}
          onLogout={handleLogout}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 pt-16 lg:pt-0 ${
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Sidebar Content Component
interface SidebarContentProps {
  user: { id: string; username: string; role: UserRole; email?: string };
  roleInfo: { label: string; color: string; icon: string };
  visibleNavItems: NavItem[];
  pathname: string;
  onLogout: () => void;
  onClose?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({
  user,
  roleInfo,
  visibleNavItems,
  pathname,
  onLogout,
  onClose,
  isMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarContentProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <Link href="/erp" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
            <BoltIcon className="w-6 h-6 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold">
                <span className="text-amber-500">Golden</span>
                <span className="text-green-600">CRM</span>
              </span>
              <p className="text-xs text-gray-400">Energy Management</p>
            </div>
          )}
        </Link>
        
        {isMobile && (
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
        
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${roleInfo.color} flex items-center justify-center text-white font-bold`}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{user.username}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>{roleInfo.icon}</span>
                {roleInfo.label}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/erp' && pathname.startsWith(item.href));
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.id);

          return (
            <div key={item.id}>
              <Link
                href={item.href}
                onClick={(e) => {
                  if (hasChildren) {
                    e.preventDefault();
                    toggleExpand(item.id);
                  } else if (isMobile && onClose) {
                    onClose();
                  }
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isActive 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                {!isCollapsed && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400 truncate">{item.description}</p>
                      )}
                    </div>
                    
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        typeof item.badge === 'number'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {hasChildren && (
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                  </>
                )}
              </Link>

              {/* Children */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-12 mt-1 space-y-1">
                  {item.children!.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => isMobile && onClose?.()}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        pathname === child.href
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      }`}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </div>
          {!isCollapsed && <span className="font-medium text-sm">Đăng xuất</span>}
        </button>
      </div>
    </div>
  );
}

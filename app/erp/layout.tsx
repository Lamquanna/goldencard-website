"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UserRole, 
  ModuleId, 
  canAccessModule as checkModuleAccess,
} from "@/lib/permissions";

// Dynamic import EnhancedChatWidget with video call support
const EnhancedChatWidget = dynamic(() => import("@/components/EnhancedChatWidget"), {
  ssr: false,
  loading: () => null,
});

// Icons for navigation
const Icons = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 6a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5zM4 13a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
    </svg>
  ),
  tasks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  leads: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  inventory: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  analytics: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  attendance: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  automations: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  logout: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
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
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  accounting: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

// All navigation items with module IDs for permission filtering
const allNavItems: { moduleId: ModuleId; name: string; nameVi: string; href: string; icon: React.ReactNode; badge: string | null }[] = [
  { moduleId: "tasks", name: "Tasks", nameVi: "Công việc", href: "/erp/tasks", icon: Icons.tasks, badge: null },
  { moduleId: "leads", name: "Leads", nameVi: "Khách hàng", href: "/erp/leads", icon: Icons.leads, badge: null },
  { moduleId: "projects", name: "Projects", nameVi: "Dự án", href: "/erp/projects", icon: Icons.projects, badge: null },
  { moduleId: "inventory", name: "Inventory", nameVi: "Kho hàng", href: "/erp/inventory", icon: Icons.inventory, badge: null },
  { moduleId: "accounting", name: "Accounting", nameVi: "Kế toán", href: "/erp/accounting", icon: Icons.accounting, badge: null },
  { moduleId: "analytics", name: "Analytics", nameVi: "Báo cáo", href: "/erp/analytics", icon: Icons.analytics, badge: null },
  { moduleId: "attendance", name: "Attendance", nameVi: "Chấm công", href: "/erp/attendance", icon: Icons.attendance, badge: null },
  { moduleId: "maps", name: "Maps", nameVi: "Bản đồ", href: "/erp/maps", icon: Icons.maps, badge: null },
  { moduleId: "automations", name: "Automations", nameVi: "Tự động hóa", href: "/erp/automations", icon: Icons.automations, badge: null },
  { moduleId: "users", name: "Users", nameVi: "Người dùng", href: "/erp/users", icon: Icons.users, badge: null },
];

// Role labels for display
const roleLabels: Record<UserRole, { label: string; color: string }> = {
  admin: { label: "Quản trị viên", color: "bg-purple-500" },
  manager: { label: "Quản lý", color: "bg-blue-500" },
  sale: { label: "Bán hàng", color: "bg-green-500" },
  staff: { label: "Nhân viên", color: "bg-gray-500" },
  hr: { label: "Nhân sự", color: "bg-pink-500" },
  warehouse: { label: "Kho", color: "bg-orange-500" },
  engineer: { label: "Kỹ thuật", color: "bg-cyan-500" },
};

export default function ERPLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Skip auth check for login page
  const isLoginPage = pathname === "/erp/login";

  useEffect(() => {
    const doCheckAuth = async () => {
      const token = localStorage.getItem("crm_auth");

      if (!token) {
        router.push("/erp/login");
        return;
      }

      try {
        const response = await fetch("/api/erp/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserRole(data.user.role);
          setUsername(data.user.username);
        } else {
          localStorage.removeItem("crm_auth");
          router.push("/erp/login");
        }
      } catch {
        localStorage.removeItem("crm_auth");
        router.push("/erp/login");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoginPage) {
      doCheckAuth();
    } else {
      setLoading(false);
    }
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("crm_auth");
    router.push("/erp/login");
  };

  // If on login page, render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render
  if (!isAuthenticated) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/erp/tasks") {
      return pathname === "/erp" || pathname === "/erp/tasks";
    }
    return pathname.startsWith(href);
  };

  // Filter navigation items based on user permissions
  const getAccessibleNavItems = () => {
    const role = (userRole as UserRole) || 'staff';
    return allNavItems.filter((item) => {
      // Special case: users module only for admin/manager
      if (item.moduleId === 'users') {
        return role === 'admin' || role === 'manager';
      }
      return checkModuleAccess(role, item.moduleId);
    });
  };

  const accessibleNavItems = getAccessibleNavItems();
  const regularNavItems = accessibleNavItems.filter(item => item.moduleId !== 'users');
  const adminNavItems = accessibleNavItems.filter(item => item.moduleId === 'users');

  // Get role display info
  const roleDisplay = roleLabels[(userRole as UserRole) || 'staff'] || roleLabels.staff;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {Icons.menu}
        </button>
        <Link href="/erp/tasks" className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-[#D4AF37]">Golden</span>
            <span className="text-gray-900">ERP</span>
          </span>
        </Link>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <Link href="/erp/tasks" className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    <span className="text-[#D4AF37]">Golden</span>
                    <span className="text-gray-900">ERP</span>
                  </span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {Icons.close}
                </button>
              </div>
              <nav className="p-4 space-y-1">
                {regularNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive(item.href)
                        ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.nameVi}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
                {adminNavItems.length > 0 && (
                  <>
                    <div className="border-t border-gray-200 my-4" />
                    <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Quản trị
                    </div>
                    {adminNavItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive(item.href)
                            ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium">{item.nameVi}</span>
                      </Link>
                    ))}
                  </>
                )}
              </nav>
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                    <span className="text-[#D4AF37] font-bold">
                      {username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{username}</div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleDisplay.color}`}>
                        {roleDisplay.label}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {Icons.home}
                    <span>Website</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    {Icons.logout}
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 flex-col bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <Link href="/erp/tasks" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                <span className="text-[#D4AF37]">Golden</span>
                <span className="text-gray-900">ERP</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {regularNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group relative ${
                isActive(item.href)
                  ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title={sidebarCollapsed ? item.nameVi : undefined}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">{item.nameVi}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {sidebarCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <>
              <div className="border-t border-gray-200 my-4" />
              {!sidebarCollapsed && (
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Quản trị
                </div>
              )}
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive(item.href)
                      ? "bg-[#D4AF37]/10 text-[#D4AF37]"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title={sidebarCollapsed ? item.nameVi : undefined}
                >
                  {item.icon}
                  {!sidebarCollapsed && <span className="font-medium">{item.nameVi}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <span className="text-[#D4AF37] font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{username}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${roleDisplay.color}`}>
                    {roleDisplay.label}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                >
                  {Icons.home}
                  <span>Website</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                >
                  {Icons.logout}
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                <span className="text-[#D4AF37] font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                {Icons.logout}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        } pt-16 lg:pt-0`}
      >
        {children}
      </main>

      {/* Enhanced Chat Widget with Video Call & Group Chat */}
      <EnhancedChatWidget />
    </div>
  );
}

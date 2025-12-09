// ============================================================================
// ENTERPRISE COMMAND CENTER - MAIN ENTRY POINT
// GoldenEnergy Enterprise Platform - Unified Business Management
// LIGHT THEME ONLY - White background, Black text
// ============================================================================

'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  FolderKanban,
  Package,
  DollarSign,
  Building2,
  Shield,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Sparkles,
  TrendingUp,
  BarChart3,
  FileText,
  Calendar,
  Clock,
  Truck,
  Receipt,
  UserCheck,
  Kanban,
  GanttChart,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Dashboard Components
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';

// ============================================================================
// MODULE DEFINITIONS WITH SUB-MODULES
// ============================================================================

interface SubModule {
  id: string;
  title: string;
  route: string;
  icon: React.ElementType;
}

interface ModuleItem {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  bgColor: string;
  borderColor: string;
  enabled: boolean;
  subModules?: SubModule[];
}

const MODULES: ModuleItem[] = [
  {
    id: 'crm',
    title: 'CRM',
    titleVi: 'Quản lý Khách hàng',
    description: 'Quản lý leads, contacts, deals và pipeline bán hàng',
    icon: Users,
    route: '/erp/crm',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'hover:border-blue-400',
    enabled: true,
    subModules: [
      { id: 'leads', title: 'Leads', route: '/erp/crm/leads', icon: TrendingUp },
      { id: 'contacts', title: 'Contacts', route: '/erp/crm/contacts', icon: Users },
      { id: 'deals', title: 'Deals', route: '/erp/crm/deals', icon: BarChart3 },
    ],
  },
  {
    id: 'projects',
    title: 'Projects',
    titleVi: 'Quản lý Dự án',
    description: 'Kanban board, Gantt chart và quản lý tiến độ dự án',
    icon: FolderKanban,
    route: '/erp/projects',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'hover:border-purple-400',
    enabled: true,
    subModules: [
      { id: 'board', title: 'Kanban Board', route: '/erp/projects/board', icon: Kanban },
      { id: 'gantt', title: 'Gantt Chart', route: '/erp/projects/gantt', icon: GanttChart },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    titleVi: 'Quản lý Kho',
    description: 'Sản phẩm, tồn kho và quản lý xuất nhập',
    icon: Package,
    route: '/erp/inventory',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'hover:border-orange-400',
    enabled: true,
    subModules: [
      { id: 'products', title: 'Products', route: '/erp/inventory/products', icon: Boxes },
      { id: 'movements', title: 'Stock Movements', route: '/erp/inventory/movements', icon: Truck },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    titleVi: 'Quản lý Tài chính',
    description: 'Hóa đơn, chi phí và báo cáo tài chính',
    icon: DollarSign,
    route: '/erp/finance',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'hover:border-green-400',
    enabled: true,
    subModules: [
      { id: 'invoices', title: 'Invoices', route: '/erp/finance/invoices', icon: Receipt },
      { id: 'expenses', title: 'Expenses', route: '/erp/finance/expenses', icon: FileSpreadsheet },
    ],
  },
  {
    id: 'hrm',
    title: 'HRM',
    titleVi: 'Quản lý Nhân sự',
    description: 'Nhân viên, chấm công, nghỉ phép và phúc lợi',
    icon: Building2,
    route: '/erp/hrm',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'hover:border-teal-400',
    enabled: true,
    subModules: [
      { id: 'employees', title: 'Employees', route: '/erp/hrm/employees', icon: UserCheck },
      { id: 'attendance', title: 'Attendance', route: '/erp/hrm/attendance', icon: Clock },
      { id: 'leaves', title: 'Leaves', route: '/erp/hrm/leaves', icon: Calendar },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    titleVi: 'Quản trị Hệ thống',
    description: 'Users, roles, permissions và audit logs',
    icon: Shield,
    route: '/admin',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'hover:border-red-400',
    enabled: true,
  },
  {
    id: 'settings',
    title: 'Settings',
    titleVi: 'Cài đặt',
    description: 'Cấu hình hệ thống và tùy chỉnh',
    icon: Settings,
    route: '/admin/settings',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'hover:border-gray-400',
    enabled: true,
  },
];

// ============================================================================
// MODULE CARD COMPONENT - WITH SUB-MODULES
// ============================================================================

interface ModuleCardProps {
  module: ModuleItem;
  index: number;
  onClick: (route: string) => void;
}

function ModuleCard({ module, index, onClick }: ModuleCardProps) {
  const Icon = module.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer group relative overflow-hidden bg-white',
          'border border-gray-200',
          module.borderColor,
          'hover:shadow-lg',
          'transition-all duration-300'
        )}
        onClick={() => onClick(module.route)}
        role="button"
        tabIndex={0}
        aria-label={`Mở module ${module.title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(module.route);
          }
        }}
      >
        {/* Gradient overlay on hover */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          'bg-gradient-to-br from-gray-50/50 to-transparent'
        )} />
        
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className={cn('p-3 rounded-xl', module.bgColor)}>
              <Icon className={cn('w-6 h-6', module.color)} />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <div className="mt-3">
            <CardTitle className="text-lg font-bold text-gray-900">
              {module.title}
            </CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">{module.titleVi}</p>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-4">
          <CardDescription className="text-sm text-gray-600 line-clamp-2 mb-3">
            {module.description}
          </CardDescription>
          
          {/* Sub-modules quick links */}
          {module.subModules && module.subModules.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {module.subModules.map((sub) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(sub.route);
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md',
                      'bg-gray-100 text-gray-600',
                      'hover:bg-gray-200 hover:text-gray-900',
                      'transition-colors duration-200'
                    )}
                  >
                    <SubIcon className="w-3 h-3" />
                    {sub.title}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// ENTERPRISE COMMAND CENTER - MAIN COMPONENT
// ============================================================================

export default function EnterpriseCommandCenter() {
  const router = useRouter();

  const handleModuleClick = (route: string) => {
    router.push(route);
  };

  const handleDashboardClick = (type: 'classic' | 'enhanced') => {
    if (type === 'enhanced') {
      router.push('/erp/dashboard/enhanced');
    } else {
      router.push('/erp/dashboard');
    }
  };

  const totalSubModules = MODULES.reduce((acc, m) => acc + (m.subModules?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  GoldenEnergy
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  Enterprise Command Center
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <DashboardSettings />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Xin chào, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Admin</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Trung tâm điều hành doanh nghiệp thống nhất
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
                <Building2 className="w-3 h-3 mr-1" />
                {MODULES.filter(m => m.enabled).length} Modules
              </Badge>
              <Badge variant="outline" className="bg-white text-gray-600 border-gray-200">
                <FileText className="w-3 h-3 mr-1" />
                {totalSubModules} Sub-modules
              </Badge>
            </div>
          </div>
        </motion.section>

        {/* Quick Access Dashboards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Dashboard & Analytics
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-white border-amber-200 text-gray-900 hover:bg-amber-50 hover:border-amber-400 shadow-sm"
              onClick={() => handleDashboardClick('classic')}
            >
              <LayoutDashboard className="w-5 h-5 text-amber-500" />
              <span>
                <span className="font-semibold">Classic Dashboard</span>
                <span className="text-xs text-gray-500 ml-2">Overview</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-white border-purple-200 text-gray-900 hover:bg-purple-50 hover:border-purple-400 shadow-sm"
              onClick={() => handleDashboardClick('enhanced')}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>
                <span className="font-semibold">Enhanced Dashboard</span>
                <span className="text-xs text-gray-500 ml-2">Advanced</span>
              </span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 bg-white border-green-200 text-gray-900 hover:bg-green-50 hover:border-green-400 shadow-sm"
              onClick={() => router.push('/erp')}
            >
              <BarChart3 className="w-5 h-5 text-green-500" />
              <span>
                <span className="font-semibold">ERP Overview</span>
                <span className="text-xs text-gray-500 ml-2">All Modules</span>
              </span>
            </Button>
          </div>
        </motion.section>

        {/* Module Grid */}
        <section>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex items-center justify-between mb-4"
          >
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Business Modules
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MODULES.filter(m => m.enabled).map((module, index) => (
              <ModuleCard
                key={module.id}
                module={module}
                index={index}
                onClick={handleModuleClick}
              />
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: 'Total Leads', value: '156', change: '+12%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Active Projects', value: '23', change: '+5%', icon: FolderKanban, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Inventory Items', value: '1,234', change: '+8%', icon: Package, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Revenue (MTD)', value: '₫2.5B', change: '+15%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn('p-2 rounded-lg', stat.bg)}>
                    <StatIcon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2024 GoldenEnergy Enterprise Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Enterprise Command Center</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}
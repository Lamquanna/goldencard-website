// ============================================================================
// HOME PAGE - MODULE CARD GRID
// GoldenEnergy HOME Platform - Main Entry Point at /
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// Dashboard Components
import { DashboardSettings } from '@/components/dashboard/DashboardSettings';
import { dashboardLocale as t } from '@/components/dashboard/locale';

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  bgColor: string;
  enabled: boolean;
}

const MODULES: ModuleItem[] = [
  {
    id: 'crm',
    title: 'CRM',
    description: 'Quản lý khách hàng, leads, deals và pipeline bán hàng',
    icon: Users,
    route: '/admin/crm',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    enabled: true,
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Quản lý dự án, tasks, Kanban board và Gantt chart',
    icon: FolderKanban,
    route: '/admin/projects',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    enabled: true,
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Quản lý kho hàng, sản phẩm và stock movements',
    icon: Package,
    route: '/admin/inventory',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    enabled: true,
  },
  {
    id: 'finance',
    title: 'Finance',
    description: 'Quản lý tài chính, hóa đơn và chi phí',
    icon: DollarSign,
    route: '/admin/finance',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    enabled: true,
  },
  {
    id: 'hrm',
    title: 'Organization',
    description: 'Quản lý nhân sự, chấm công và nghỉ phép',
    icon: Building2,
    route: '/admin/hrm',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    enabled: true,
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Quản trị hệ thống, users và audit logs',
    icon: Shield,
    route: '/admin',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    enabled: true,
  },
  {
    id: 'settings',
    title: 'System',
    description: 'Cài đặt hệ thống và cấu hình chung',
    icon: Settings,
    route: '/admin/settings',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/50',
    enabled: true,
  },
];

// ============================================================================
// MODULE CARD COMPONENT
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
          'cursor-pointer group relative overflow-hidden',
          'border-gray-200 dark:border-gray-700',
          'hover:border-amber-400 dark:hover:border-amber-500',
          'hover:shadow-lg hover:shadow-amber-500/10',
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
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-300" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={cn('p-3 rounded-xl', module.bgColor)}>
              <Icon className={cn('w-6 h-6', module.color)} />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mt-3">
            {module.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {module.description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// MAIN HOME PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const router = useRouter();

  const handleModuleClick = (route: string) => {
    router.push(route);
  };

  const handleDashboardClick = (type: 'classic' | 'enhanced') => {
    if (type === 'enhanced') {
      router.push('/home/dashboard/enhanced');
    } else {
      router.push('/home/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-amber-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-amber-950/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  GoldenEnergy
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  HOME Platform
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {t.welcome}, <span className="text-amber-500">Admin</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t.subtitle}
          </p>
        </motion.section>

        {/* Quick Access Dashboards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2 border-amber-200 hover:bg-amber-50 hover:border-amber-400 dark:border-amber-800 dark:hover:bg-amber-900/20"
              onClick={() => handleDashboardClick('classic')}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              Dashboard Classic
            </Button>
            <Button
              variant="outline"
              className="gap-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
              onClick={() => handleDashboardClick('enhanced')}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              Dashboard Enhanced
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t.modules?.crm ? 'Modules' : 'Modules'}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {MODULES.filter(m => m.enabled).length} module khả dụng
            </span>
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

        {/* Footer Stats */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 GoldenEnergy HOME Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <span>Version 2.0.0</span>
              <span>•</span>
              <span>Powered by Next.js</span>
            </div>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}

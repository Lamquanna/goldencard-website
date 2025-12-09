// ============================================================================
// ACTIVITY FEED COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity,
  UserPlus,
  FileText,
  DollarSign,
  Package,
  FolderOpen,
  Settings,
  CheckCircle,
  XCircle,
  MessageSquare,
  Upload,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { ActivityFeedProps, ActivityItem, ActivityModule } from './types';

// ============================================================================
// MODULE CONFIG
// ============================================================================

const moduleConfig: Record<ActivityModule, {
  label: string;
  icon: typeof Activity;
  color: string;
  bgColor: string;
}> = {
  crm: {
    label: 'CRM',
    icon: UserPlus,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  hrm: {
    label: 'Nhân sự',
    icon: UserPlus,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  projects: {
    label: 'Dự án',
    icon: FolderOpen,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  inventory: {
    label: 'Kho hàng',
    icon: Package,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  finance: {
    label: 'Tài chính',
    icon: DollarSign,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  system: {
    label: 'Hệ thống',
    icon: Settings,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
};

// ============================================================================
// ACTIVITY TYPE ICONS
// ============================================================================

const activityTypeIcons: Record<string, typeof Activity> = {
  task_created: FileText,
  task_completed: CheckCircle,
  task_assigned: UserPlus,
  comment_added: MessageSquare,
  file_uploaded: Upload,
  project_created: FolderOpen,
  lead_converted: CheckCircle,
  deal_won: DollarSign,
  deal_lost: XCircle,
  invoice_sent: FileText,
  payment_received: DollarSign,
  employee_joined: UserPlus,
  leave_approved: CheckCircle,
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TIME GROUP HEADER
// ============================================================================

function TimeGroupHeader({ date }: { date: Date }) {
  let label = format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  
  if (isToday(date)) {
    label = 'Hôm nay';
  } else if (isYesterday(date)) {
    label = 'Hôm qua';
  }
  
  return (
    <div className="sticky top-0 z-10 py-2 bg-white dark:bg-gray-900">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemCardProps {
  activity: ActivityItem;
  onClick?: () => void;
  index: number;
}

function ActivityItemCard({ activity, onClick, index }: ActivityItemCardProps) {
  const moduleStyle = moduleConfig[activity.module];
  const TypeIcon = activityTypeIcons[activity.type] || Activity;
  
  const timestamp = new Date(activity.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true, locale: vi });
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="flex gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      onClick={onClick}
    >
      {/* Avatar / Icon */}
      <div className="relative flex-shrink-0">
        {activity.actor.avatar ? (
          <img
            src={activity.actor.avatar}
            alt={activity.actor.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            moduleStyle.bgColor,
            moduleStyle.color
          )}>
            {activity.actor.name.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Type badge */}
        <div className={cn(
          'absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center',
          moduleStyle.bgColor
        )}>
          <TypeIcon className={cn('w-2.5 h-2.5', moduleStyle.color)} />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{activity.actor.name}</span>{' '}
          <span className="text-gray-600 dark:text-gray-400">{activity.action}</span>
          {activity.target && (
            <>
              {' '}
              <span className="font-medium text-yellow-600 dark:text-yellow-400">
                {activity.target.name}
              </span>
            </>
          )}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            moduleStyle.bgColor,
            moduleStyle.color
          )}>
            {moduleStyle.label}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MODULE FILTER
// ============================================================================

interface ModuleFilterProps {
  selected: ActivityModule[];
  onChange: (modules: ActivityModule[]) => void;
}

function ModuleFilter({ selected, onChange }: ModuleFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const modules: ActivityModule[] = ['crm', 'hrm', 'projects', 'inventory', 'finance', 'system'];
  
  const toggleModule = (module: ActivityModule) => {
    if (selected.includes(module)) {
      onChange(selected.filter((m) => m !== module));
    } else {
      onChange([...selected, module]);
    }
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 text-sm px-2 py-1 rounded transition-colors',
          selected.length > 0 
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
        )}
      >
        <Filter className="w-3 h-3" />
        {selected.length > 0 && (
          <span className="text-xs font-medium">{selected.length}</span>
        )}
        <ChevronDown className={cn('w-3 h-3 transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20"
          >
            {modules.map((module) => {
              const style = moduleConfig[module];
              const isSelected = selected.includes(module);
              
              return (
                <button
                  key={module}
                  onClick={() => toggleModule(module)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                    isSelected 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <div className={cn('w-4 h-4 rounded border flex items-center justify-center', 
                    isSelected ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300'
                  )}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <style.icon className={cn('w-4 h-4', style.color)} />
                  <span className="text-gray-700 dark:text-gray-300">{style.label}</span>
                </button>
              );
            })}
            
            {selected.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2 px-3">
                <button
                  onClick={() => onChange([])}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityFeed({
  activities,
  title = 'Hoạt động gần đây',
  maxItems = 20,
  groupByTime = true,
  moduleFilter = [],
  loading = false,
  emptyMessage = 'Không có hoạt động nào',
  onActivityClick,
  onViewAll,
  onFilterChange,
  className,
}: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityModule[]>(moduleFilter);
  
  // Filter and group activities
  const { grouped, flat } = useMemo(() => {
    let filtered = activities;
    
    if (filter.length > 0) {
      filtered = activities.filter((a) => filter.includes(a.module));
    }
    
    filtered = filtered.slice(0, maxItems);
    
    if (!groupByTime) {
      return { grouped: null, flat: filtered };
    }
    
    // Group by date
    const groups = new Map<string, ActivityItem[]>();
    
    filtered.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const key = format(date, 'yyyy-MM-dd');
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(activity);
    });
    
    return { 
      grouped: Array.from(groups.entries()).map(([date, items]) => ({
        date: new Date(date),
        items,
      })),
      flat: null,
    };
  }, [activities, filter, maxItems, groupByTime]);
  
  const handleFilterChange = (modules: ActivityModule[]) => {
    setFilter(modules);
    onFilterChange?.(modules);
  };
  
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <ActivityFeedSkeleton count={5} />
      </div>
    );
  }
  
  const isEmpty = (grouped?.length === 0) || (flat?.length === 0);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <Activity className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          {onFilterChange && (
            <ModuleFilter selected={filter} onChange={handleFilterChange} />
          )}
          
          {onViewAll && !isEmpty && (
            <button
              onClick={onViewAll}
              className="text-sm font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
            >
              Xem tất cả
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      {isEmpty ? (
        <div className="py-8 text-center text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : groupByTime && grouped ? (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {grouped.map((group, groupIndex) => (
            <div key={group.date.toISOString()}>
              <TimeGroupHeader date={group.date} />
              <div className="space-y-1">
                {group.items.map((activity, index) => (
                  <ActivityItemCard
                    key={activity.id}
                    activity={activity}
                    onClick={() => onActivityClick?.(activity)}
                    index={groupIndex * 10 + index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : flat ? (
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {flat.map((activity, index) => (
            <ActivityItemCard
              key={activity.id}
              activity={activity}
              onClick={() => onActivityClick?.(activity)}
              index={index}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ActivityFeed;

// ============================================================================
// QUICK ACTIONS COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { usePermission } from './hooks';
import type { QuickActionsProps, QuickActionItem } from './types';

// ============================================================================
// SKELETON LOADER
// ============================================================================

function QuickActionsSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: number }) {
  return (
    <div className={cn('grid gap-3', `grid-cols-${columns}`)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto mb-2" />
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

interface QuickActionButtonProps {
  action: QuickActionItem;
  layout: 'grid' | 'list';
  showLabels: boolean;
  index: number;
}

function QuickActionButton({ action, layout, showLabels, index }: QuickActionButtonProps) {
  const hasPermission = usePermission(action.permission || '*');
  
  if (!hasPermission) {
    return null;
  }
  
  const isGrid = layout === 'grid';
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={action.onClick}
      className={cn(
        'group relative flex items-center gap-3 p-4 rounded-xl transition-all duration-200',
        'border border-transparent',
        'hover:border-yellow-200 hover:bg-yellow-50 dark:hover:border-yellow-800 dark:hover:bg-yellow-900/20',
        'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2',
        isGrid ? 'flex-col justify-center' : 'justify-start',
        action.color || 'bg-gray-50 dark:bg-gray-800/50'
      )}
      title={action.description}
    >
      {/* Icon */}
      <div className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
        'bg-white dark:bg-gray-800 shadow-sm',
        'group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30',
        'text-gray-600 dark:text-gray-400',
        'group-hover:text-yellow-600 dark:group-hover:text-yellow-400'
      )}>
        {action.icon}
      </div>
      
      {/* Label */}
      {showLabels && (
        <div className={cn(isGrid ? 'text-center' : 'flex-1')}>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
            {action.label}
          </p>
          {!isGrid && action.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {action.description}
            </p>
          )}
        </div>
      )}
      
      {/* Shortcut badge */}
      {action.shortcut && (
        <span className={cn(
          'text-xs font-mono px-1.5 py-0.5 rounded',
          'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
          isGrid ? 'absolute top-2 right-2' : 'ml-auto'
        )}>
          {action.shortcut}
        </span>
      )}
    </motion.button>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function QuickActions({
  actions,
  title = 'Thao tác nhanh',
  layout = 'grid',
  columns = 3,
  showLabels = true,
  loading = false,
  className,
}: QuickActionsProps) {
  // Filter actions based on permissions
  const visibleActions = actions.filter((action) => {
    if (!action.permission) return true;
    // Permission check happens in QuickActionButton
    return true;
  });
  
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        <QuickActionsSkeleton count={6} columns={columns} />
      </div>
    );
  }
  
  if (visibleActions.length === 0) {
    return null;
  }
  
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
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      
      {/* Actions */}
      <div className={cn(
        layout === 'grid' 
          ? `grid gap-3 grid-cols-2 sm:grid-cols-${columns}` 
          : 'space-y-2'
      )}>
        {visibleActions.map((action, index) => (
          <QuickActionButton
            key={action.id}
            action={action}
            layout={layout}
            showLabels={showLabels}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default QuickActions;

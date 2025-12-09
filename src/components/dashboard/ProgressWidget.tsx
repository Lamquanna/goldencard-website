// ============================================================================
// PROGRESS WIDGET COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressItem {
  id: string;
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
}

export interface ProgressWidgetProps {
  title: string;
  subtitle?: string;
  items: ProgressItem[];
  showPercentage?: boolean;
  loading?: boolean;
  className?: string;
}

// ============================================================================
// PROGRESS BAR COMPONENT
// ============================================================================

interface ProgressBarProps {
  item: ProgressItem;
  showPercentage: boolean;
  index: number;
}

function ProgressBar({ item, showPercentage, index }: ProgressBarProps) {
  const percentage = Math.min((item.current / item.target) * 100, 100);
  const isComplete = percentage >= 100;
  const isLow = percentage < 30;
  
  const defaultColor = isComplete ? '#22c55e' : isLow ? '#ef4444' : '#eab308';
  const color = item.color || defaultColor;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {item.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-white font-medium">
            {item.current.toLocaleString('vi-VN')}{item.unit ? ` ${item.unit}` : ''}
          </span>
          <span className="text-xs text-gray-400">
            / {item.target.toLocaleString('vi-VN')}{item.unit ? ` ${item.unit}` : ''}
          </span>
        </div>
      </div>
      
      <div className="relative h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      
      {showPercentage && (
        <div className="flex items-center justify-between">
          <span className={cn(
            'text-xs font-medium',
            isComplete ? 'text-green-600 dark:text-green-400' :
            isLow ? 'text-red-600 dark:text-red-400' :
            'text-yellow-600 dark:text-yellow-400'
          )}>
            {percentage.toFixed(1)}%
          </span>
          {isComplete && (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ Đạt mục tiêu
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProgressWidget({
  title,
  subtitle,
  items,
  showPercentage = true,
  loading = false,
  className,
}: ProgressWidgetProps) {
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Calculate overall progress
  const totalCurrent = items.reduce((sum, item) => sum + item.current, 0);
  const totalTarget = items.reduce((sum, item) => sum + item.target, 0);
  const overallPercentage = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
  
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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Target className="w-4 h-4 text-gray-400" />
          <span className={cn(
            'text-sm font-medium',
            overallPercentage >= 100 ? 'text-green-600' :
            overallPercentage < 50 ? 'text-red-600' :
            'text-yellow-600'
          )}>
            {overallPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
      
      {/* Progress bars */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <ProgressBar
            key={item.id}
            item={item}
            showPercentage={showPercentage}
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

export default ProgressWidget;

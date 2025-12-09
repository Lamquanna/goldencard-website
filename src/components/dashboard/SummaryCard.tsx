// ============================================================================
// SUMMARY CARD COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SummaryCardProps, SummaryCardVariant } from './types';

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles: Record<SummaryCardVariant, {
  bg: string;
  border: string;
  iconBg: string;
  iconColor: string;
}> = {
  default: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-gray-100 dark:border-gray-800',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  success: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-green-100 dark:border-green-900/30',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  warning: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-yellow-100 dark:border-yellow-900/30',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-red-100 dark:border-red-900/30',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-white dark:bg-gray-900',
    border: 'border-blue-100 dark:border-blue-900/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

function SummaryCardSkeleton() {
  return (
    <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  loading = false,
  onClick,
  className,
}: SummaryCardProps) {
  const styles = variantStyles[variant];
  
  if (loading) {
    return <SummaryCardSkeleton />;
  }
  
  // Format value if number
  const displayValue = typeof value === 'number' 
    ? value.toLocaleString('vi-VN')
    : value;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      className={cn(
        'p-5 rounded-xl border transition-all duration-200',
        styles.bg,
        styles.border,
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Content */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {displayValue}
          </p>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center gap-1">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : trend.value === 0 ? (
                <Minus className="w-4 h-4 text-gray-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-green-600' : 
                trend.value === 0 ? 'text-gray-500' : 'text-red-600'
              )}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-xs text-gray-400 ml-1">
                  {trend.label}
                </span>
              )}
            </div>
          )}
          
          {/* Subtitle */}
          {subtitle && !trend && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Icon */}
        {icon && (
          <div className={cn(
            'p-3 rounded-xl',
            styles.iconBg
          )}>
            <div className={styles.iconColor}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default SummaryCard;

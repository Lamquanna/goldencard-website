// ============================================================================
// STATS COMPARISON WIDGET COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ComparisonItem {
  id: string;
  label: string;
  current: number;
  previous: number;
  unit?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export interface StatsComparisonProps {
  title: string;
  period: string;
  previousPeriod: string;
  items: ComparisonItem[];
  loading?: boolean;
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatValue(value: number, format?: 'number' | 'currency' | 'percentage'): string {
  switch (format) {
    case 'currency':
      if (value >= 1e9) return `${(value / 1e9).toFixed(1)} tỷ`;
      if (value >= 1e6) return `${(value / 1e6).toFixed(1)} triệu`;
      return value.toLocaleString('vi-VN') + ' ₫';
    case 'percentage':
      return value.toFixed(1) + '%';
    default:
      return value.toLocaleString('vi-VN');
  }
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ============================================================================
// COMPARISON ROW COMPONENT
// ============================================================================

interface ComparisonRowProps {
  item: ComparisonItem;
  index: number;
}

function ComparisonRow({ item, index }: ComparisonRowProps) {
  const change = calculateChange(item.current, item.previous);
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        'p-3 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        'hover:bg-gray-100 dark:hover:bg-gray-800',
        'transition-colors duration-200'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {item.label}
        </span>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
          isPositive && 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
          isNegative && 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
          isNeutral && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        )}>
          {isPositive && <TrendingUp className="w-3 h-3" />}
          {isNegative && <TrendingDown className="w-3 h-3" />}
          {isNeutral && <Minus className="w-3 h-3" />}
          <span>{isPositive ? '+' : ''}{change.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {formatValue(item.previous, item.format)}{item.unit ? ` ${item.unit}` : ''}
          </span>
          <ArrowRight className="w-3 h-3 text-gray-300" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatValue(item.current, item.format)}{item.unit ? ` ${item.unit}` : ''}
          </span>
        </div>
        
        <span className={cn(
          'text-xs',
          isPositive && 'text-green-600 dark:text-green-400',
          isNegative && 'text-red-600 dark:text-red-400',
          isNeutral && 'text-gray-400'
        )}>
          {isPositive ? '+' : ''}{(item.current - item.previous).toLocaleString('vi-VN')}
        </span>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StatsComparison({
  title,
  period,
  previousPeriod,
  items,
  loading = false,
  className,
}: StatsComparisonProps) {
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Calculate overall stats
  const totalCurrent = items.reduce((sum, item) => sum + item.current, 0);
  const totalPrevious = items.reduce((sum, item) => sum + item.previous, 0);
  const overallChange = calculateChange(totalCurrent, totalPrevious);
  
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
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {previousPeriod} → {period}
          </p>
        </div>
        
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
          overallChange > 0 && 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
          overallChange < 0 && 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
          overallChange === 0 && 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        )}>
          {overallChange > 0 && <TrendingUp className="w-4 h-4" />}
          {overallChange < 0 && <TrendingDown className="w-4 h-4" />}
          {overallChange === 0 && <Minus className="w-4 h-4" />}
          <span>{overallChange > 0 ? '+' : ''}{overallChange.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Comparison rows */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <ComparisonRow key={item.id} item={item} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default StatsComparison;

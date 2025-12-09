// ============================================================================
// WIDGET WRAPPER COMPONENT
// GoldenEnergy HOME Platform - Draggable Widget Container
// ============================================================================

'use client';

import { forwardRef, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, 
  RefreshCw, 
  Settings, 
  X,
  AlertCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WidgetWrapperProps } from './types';

// ============================================================================
// LOADING SPINNER
// ============================================================================

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 flex items-center justify-center z-10">
      <RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" />
    </div>
  );
}

// ============================================================================
// ERROR DISPLAY
// ============================================================================

function ErrorDisplay({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex flex-col items-center justify-center z-10 p-4">
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const WidgetWrapper = forwardRef<HTMLDivElement, WidgetWrapperProps>(
  function WidgetWrapper(
    {
      id,
      title,
      subtitle,
      icon,
      actions,
      loading = false,
      error,
      onRefresh,
      onSettings,
      children,
      className,
      draggable = false,
      ...props
    },
    ref
  ) {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative rounded-xl border border-gray-100 dark:border-gray-800',
          'bg-white dark:bg-gray-900',
          'overflow-hidden',
          draggable && 'cursor-move',
          className
        )}
        data-widget-id={id}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {/* Drag handle */}
            {draggable && (
              <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            
            {/* Icon */}
            {icon && (
              <div className="text-gray-400">
                {icon}
              </div>
            )}
            
            {/* Title */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            {actions}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'dark:hover:text-gray-300 dark:hover:bg-gray-800',
                  loading && 'animate-spin'
                )}
                title="Làm mới"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            
            {onSettings && (
              <button
                onClick={onSettings}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'dark:hover:text-gray-300 dark:hover:bg-gray-800'
                )}
                title="Cài đặt"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="relative p-5">
          {children}
          
          {/* Loading overlay */}
          {loading && <LoadingSpinner />}
          
          {/* Error overlay */}
          {error && <ErrorDisplay message={error} onRetry={onRefresh} />}
        </div>
      </motion.div>
    );
  }
);

// ============================================================================
// EXPORTS
// ============================================================================

export default WidgetWrapper;

// ============================================================================
// NOTIFICATION PANEL COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Calendar,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { NotificationPanelProps } from './types';
import type { DashboardNotification } from '@/src/modules/dashboard/types';

// ============================================================================
// TYPE ICON MAPPING
// ============================================================================

const typeIcons: Record<string, typeof Bell> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  task: FileText,
  mention: MessageSquare,
  assignment: FileText,
  reminder: Calendar,
  system: Bell,
};

const typeColors: Record<string, string> = {
  info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  success: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30',
  error: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  task: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  mention: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30',
  assignment: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  reminder: 'text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30',
  system: 'text-gray-500 bg-gray-100 dark:bg-gray-800',
};

// ============================================================================
// NOTIFICATION ITEM COMPONENT
// ============================================================================

interface NotificationItemProps {
  notification: DashboardNotification;
  onMarkRead?: () => void;
  onClick?: () => void;
  index: number;
}

function NotificationItem({ notification, onMarkRead, onClick, index }: NotificationItemProps) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || typeColors.info;
  
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { 
    addSuffix: true, 
    locale: vi 
  });
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        'flex gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        notification.isRead 
          ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' 
          : 'bg-yellow-50/50 dark:bg-yellow-900/10 hover:bg-yellow-50 dark:hover:bg-yellow-900/20',
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', colorClass)}>
        <Icon className="w-4 h-4" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm',
            notification.isRead 
              ? 'text-gray-600 dark:text-gray-400' 
              : 'text-gray-900 dark:text-white font-medium'
          )}>
            {notification.title}
          </p>
          
          {!notification.isRead && onMarkRead && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead();
              }}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Đánh dấu đã đọc"
            >
              <Check className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{timeAgo}</span>
          {notification.priority === 'urgent' && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              Khẩn cấp
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function NotificationPanel({
  notifications,
  unreadCount,
  maxItems = 10,
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onNotificationClick,
  onViewAll,
  className,
}: NotificationPanelProps) {
  const displayNotifications = notifications.slice(0, maxItems);
  
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
            Thông báo
          </h3>
          {unreadCount > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {unreadCount} mới
            </span>
          )}
        </div>
        
        {unreadCount > 0 && onMarkAllRead && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <CheckCheck className="w-3 h-3" />
            Đọc tất cả
          </button>
        )}
      </div>
      
      {/* Notifications list */}
      <div className="max-h-[400px] overflow-y-auto">
        {displayNotifications.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có thông báo nào</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {displayNotifications.map((notification, index) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkRead={() => onMarkRead?.(notification.id)}
                onClick={() => onNotificationClick?.(notification)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      {onViewAll && notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default NotificationPanel;

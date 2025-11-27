'use client';

// Notification Bell Component
// Shows notification count and dropdown with recent notifications

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '@/lib/types/chat';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from '@/lib/firebase/firestore';
import { getNotificationIcon } from '@/lib/firebase/messaging';

interface NotificationBellProps {
  userId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationBell({ userId, onNotificationClick }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Subscribe to notifications
  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToNotifications(userId, (newNotifications) => {
      setNotifications(newNotifications);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(userId, notification.id);
    }
    onNotificationClick?.(notification);
    
    // Navigate if link exists
    if (notification.link) {
      window.location.href = notification.link;
    }
    
    setIsOpen(false);
  }, [userId, onNotificationClick]);

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(userId);
  };

  // Format time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Vừa xong';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="w-6 h-6 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">Không có thông báo mới</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    window.location.href = '/notifications';
                    setIsOpen(false);
                  }}
                  className="w-full py-2 text-sm text-center text-sky-600 hover:bg-sky-50 rounded-lg transition-colors font-medium"
                >
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  formatTime: (timestamp: any) => string;
}

function NotificationItem({ notification, onClick, formatTime }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      new_message: 'bg-blue-100 text-blue-600',
      mention: 'bg-purple-100 text-purple-600',
      task_assigned: 'bg-amber-100 text-amber-600',
      task_completed: 'bg-green-100 text-green-600',
      task_due_soon: 'bg-orange-100 text-orange-600',
      task_overdue: 'bg-red-100 text-red-600',
      lead_assigned: 'bg-sky-100 text-sky-600',
      lead_status_changed: 'bg-indigo-100 text-indigo-600',
      system: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  return (
    <motion.button
      layout
      onClick={onClick}
      className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-sky-50/50' : ''
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getTypeColor(notification.type)}`}>
        {notification.icon || icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
            {notification.title}
          </p>
          {!notification.read && (
            <span className="flex-shrink-0 w-2 h-2 bg-sky-500 rounded-full mt-1.5" />
          )}
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
          {notification.body}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {formatTime(notification.createdAt)}
        </p>
      </div>
    </motion.button>
  );
}

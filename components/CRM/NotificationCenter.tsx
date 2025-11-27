'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Types
interface Notification {
  id: string;
  type: 'lead' | 'task' | 'project' | 'inventory' | 'attendance' | 'system' | 'deal' | 'alert';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

interface NotificationCenterProps {
  notifications?: Notification[];
  maxDisplay?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
}

// Icons
const Icons = {
  bell: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  checkAll: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  lead: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  task: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  project: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  inventory: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  attendance: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  deal: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  alert: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  system: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

// Default mock notifications
const defaultNotifications: Notification[] = [
  {
    id: '1',
    type: 'lead',
    title: 'Lead mới từ website',
    message: 'Công ty ABC Solar đã gửi form liên hệ yêu cầu báo giá hệ thống 100kWp',
    time: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    link: '/crm/leads',
    priority: 'high'
  },
  {
    id: '2',
    type: 'task',
    title: 'Task sắp hết hạn',
    message: 'Gọi điện khách hàng Solar Farm Bình Dương còn 2 giờ nữa',
    time: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    link: '/crm/tasks',
    priority: 'urgent'
  },
  {
    id: '3',
    type: 'project',
    title: 'Milestone hoàn thành',
    message: 'Dự án Solar Farm Bình Thuận - Lắp đặt 50% panels đã hoàn thành',
    time: new Date(Date.now() - 60 * 60 * 1000),
    read: false,
    link: '/crm/projects',
    priority: 'medium'
  },
  {
    id: '4',
    type: 'inventory',
    title: 'Cảnh báo tồn kho',
    message: 'Inverter Huawei 100kW còn dưới mức tối thiểu (5 bộ)',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    link: '/crm/inventory',
    priority: 'high'
  },
  {
    id: '5',
    type: 'deal',
    title: 'Deal thắng',
    message: 'AEON Mall Tân Phú - 2.5MW đã ký hợp đồng thành công!',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    link: '/crm/leads',
    priority: 'low'
  },
  {
    id: '6',
    type: 'attendance',
    title: 'Chấm công',
    message: '12/15 nhân viên đã check-in hôm nay',
    time: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: true,
    link: '/crm/attendance',
  },
  {
    id: '7',
    type: 'system',
    title: 'Hệ thống',
    message: 'Đã tự động backup dữ liệu CRM lúc 02:00 AM',
    time: new Date(Date.now() - 8 * 60 * 60 * 1000),
    read: true,
  },
];

const getTypeConfig = (type: Notification['type']) => {
  switch (type) {
    case 'lead': return { icon: Icons.lead, color: 'bg-blue-100 text-blue-600', label: 'Lead' };
    case 'task': return { icon: Icons.task, color: 'bg-amber-100 text-amber-600', label: 'Task' };
    case 'project': return { icon: Icons.project, color: 'bg-purple-100 text-purple-600', label: 'Dự án' };
    case 'inventory': return { icon: Icons.inventory, color: 'bg-orange-100 text-orange-600', label: 'Kho' };
    case 'attendance': return { icon: Icons.attendance, color: 'bg-cyan-100 text-cyan-600', label: 'Chấm công' };
    case 'deal': return { icon: Icons.deal, color: 'bg-emerald-100 text-emerald-600', label: 'Deal' };
    case 'alert': return { icon: Icons.alert, color: 'bg-red-100 text-red-600', label: 'Cảnh báo' };
    case 'system': return { icon: Icons.system, color: 'bg-gray-100 text-gray-600', label: 'Hệ thống' };
    default: return { icon: Icons.bell, color: 'bg-gray-100 text-gray-600', label: 'Thông báo' };
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case 'urgent': return 'border-l-red-500 bg-red-50/30';
    case 'high': return 'border-l-orange-500 bg-orange-50/30';
    case 'medium': return 'border-l-blue-500';
    default: return 'border-l-gray-300';
  }
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

export default function NotificationCenter({ 
  notifications = defaultNotifications,
  maxDisplay = 10,
  onMarkRead,
  onMarkAllRead,
  onDismiss
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  
  const unreadCount = localNotifications.filter(n => !n.read).length;
  const displayNotifications = localNotifications.slice(0, maxDisplay);

  const handleMarkRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    onMarkRead?.(id);
  };

  const handleMarkAllRead = () => {
    setLocalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllRead?.();
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
    onDismiss?.(id);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="text-gray-600">{Icons.bell}</div>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5">
                <div className="flex items-center gap-2">
                  <div className="text-[#D4AF37]">{Icons.bell}</div>
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                  >
                    {Icons.checkAll}
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {displayNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      {Icons.bell}
                    </div>
                    <p>Không có thông báo mới</p>
                  </div>
                ) : (
                  displayNotifications.map((notification, index) => {
                    const config = getTypeConfig(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (!notification.read) handleMarkRead(notification.id);
                        }}
                        className={`
                          relative p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer
                          border-l-4 transition-colors
                          ${!notification.read ? getPriorityColor(notification.priority) : 'border-l-transparent'}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg shrink-0 ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                {notification.title}
                              </h4>
                              <button
                                onClick={(e) => handleDismiss(notification.id, e)}
                                className="shrink-0 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                              >
                                {Icons.close}
                              </button>
                            </div>
                            <p className={`text-sm mt-0.5 line-clamp-2 ${!notification.read ? 'text-gray-600' : 'text-gray-500'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-400">
                                {formatTime(notification.time)}
                              </span>
                              {notification.link && (
                                <Link
                                  href={notification.link}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsOpen(false);
                                  }}
                                  className="flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                                >
                                  Xem chi tiết {Icons.arrowRight}
                                </Link>
                              )}
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="absolute top-4 right-12 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              {localNotifications.length > maxDisplay && (
                <div className="p-3 border-t bg-gray-50 text-center">
                  <Link
                    href="/crm/notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-[#D4AF37] hover:underline font-medium"
                  >
                    Xem tất cả thông báo ({localNotifications.length})
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Export standalone notification list component
export function NotificationList({ 
  notifications = defaultNotifications,
  maxDisplay
}: NotificationCenterProps) {
  const displayNotifications = maxDisplay ? notifications.slice(0, maxDisplay) : notifications;

  return (
    <div className="space-y-2">
      {displayNotifications.map((notification, index) => {
        const config = getTypeConfig(notification.type);
        return (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`
              p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-all
              ${!notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-lg shrink-0 ${config.color}`}>
                {config.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                  {notification.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-400 mt-1 block">
                  {formatTime(notification.time)}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

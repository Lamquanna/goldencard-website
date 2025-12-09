'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  X,
  Trash2
} from 'lucide-react'
import { useNotificationStore, type NotificationCategory, type Notification } from '@/app/erp/core/notification-system'

// Define categories as array (since NotificationCategory is a type union, not enum)
const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'crm',
  'hrm', 
  'project',
  'inventory',
  'finance',
  'workflow',
  'system'
]

const categoryLabels: Record<NotificationCategory, string> = {
  crm: 'CRM',
  hrm: 'HRM',
  project: 'Dự án',
  inventory: 'Kho',
  finance: 'Tài chính',
  workflow: 'Workflow',
  system: 'Hệ thống',
}

const categoryIcons: Record<NotificationCategory, string> = {
  crm: '💼',
  hrm: '👥',
  project: '📁',
  inventory: '📦',
  finance: '💰',
  workflow: '🔄',
  system: '⚙️',
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<NotificationCategory | 'all'>('all')
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAll
  } = useNotificationStore()

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.category === filter
  )

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-red-500 text-white text-xs font-bold rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 top-full mt-2 w-[380px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Thông báo
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-sm"
                      title="Đánh dấu tất cả đã đọc"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => clearAll()}
                    className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    title="Xóa tất cả"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                  }`}
                >
                  Tất cả
                </button>
                {NOTIFICATION_CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                      filter === category
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    <span>{categoryIcons[category]}</span>
                    <span>{categoryLabels[category]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[400px] overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-gray-500">Không có thông báo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredNotifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => markAsRead(notification.id)}
                      onRemove={() => deleteNotification(notification.id)}
                      categoryIcon={categoryIcons[notification.category]}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium">
                Xem tất cả thông báo
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Single Notification Item
function NotificationItem({ 
  notification, 
  onRead, 
  onRemove,
  categoryIcon 
}: { 
  notification: Notification
  onRead: () => void
  onRemove: () => void
  categoryIcon: string
}) {
  const priorityColors = {
    low: 'border-l-gray-300',
    normal: 'border-l-blue-400',
    high: 'border-l-orange-400',
    urgent: 'border-l-red-500',
  }

  return (
    <div 
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-l-4 ${
        priorityColors[notification.priority]
      } ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-2xl">{categoryIcon}</div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              {notification.title}
            </div>
            {!notification.isRead && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          
          {notification.message && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {notification.message}
            </p>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {format(notification.createdAt, 'HH:mm dd/MM')}
            </span>
            
            <div className="flex items-center gap-1">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRead()
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  title="Đánh dấu đã đọc"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                title="Xóa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

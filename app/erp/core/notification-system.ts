/**
 * HOME Platform - Notification System
 * Real-time notifications with categories and preferences
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type NotificationCategory = 
  | 'crm' 
  | 'hrm' 
  | 'project' 
  | 'inventory' 
  | 'finance' 
  | 'workflow' 
  | 'system'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export type NotificationType =
  // CRM
  | 'lead.new'
  | 'lead.assigned'
  | 'lead.status_changed'
  | 'deal.won'
  | 'deal.lost'
  // HRM
  | 'attendance.checkin'
  | 'attendance.checkout'
  | 'leave.requested'
  | 'leave.approved'
  | 'leave.rejected'
  // Project
  | 'task.assigned'
  | 'task.completed'
  | 'task.overdue'
  | 'milestone.reached'
  | 'project.deadline'
  // Inventory
  | 'stock.low'
  | 'stock.movement'
  | 'transfer.completed'
  // Finance
  | 'invoice.created'
  | 'invoice.paid'
  | 'invoice.overdue'
  | 'expense.pending_approval'
  | 'expense.approved'
  // Workflow
  | 'workflow.pending'
  | 'workflow.approved'
  | 'workflow.rejected'
  // System
  | 'system.update'
  | 'system.maintenance'

export interface Notification {
  id: string
  type: NotificationType
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  message: string
  
  // Metadata
  userId: string
  resourceType?: string
  resourceId?: string
  link?: string
  
  // Status
  isRead: boolean
  isArchived: boolean
  
  // Actor
  actorId?: string
  actorName?: string
  actorAvatar?: string
  
  // Timestamps
  createdAt: Date
  readAt?: Date
}

export interface NotificationPreferences {
  enabled: boolean
  email: boolean
  push: boolean
  sound: boolean
  categories: Record<NotificationCategory, boolean>
  types: Partial<Record<NotificationType, boolean>>
}

// =============================================================================
// NOTIFICATION STORE
// =============================================================================

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  preferences: NotificationPreferences
  isOpen: boolean
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead' | 'isArchived'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  archiveNotification: (id: string) => void
  deleteNotification: (id: string) => void
  clearAll: () => void
  setOpen: (open: boolean) => void
  updatePreferences: (prefs: Partial<NotificationPreferences>) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isOpen: false,
      preferences: {
        enabled: true,
        email: true,
        push: true,
        sound: true,
        categories: {
          crm: true,
          hrm: true,
          project: true,
          inventory: true,
          finance: true,
          workflow: true,
          system: true,
        },
        types: {},
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          isRead: false,
          isArchived: false,
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100
          unreadCount: state.unreadCount + 1,
        }))

        // Play sound if enabled
        const prefs = get().preferences
        if (prefs.enabled && prefs.sound && prefs.categories[notification.category]) {
          playNotificationSound()
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.isRead) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, isRead: true, readAt: new Date() } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }
          }
          return state
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({
            ...n,
            isRead: true,
            readAt: n.readAt || new Date(),
          })),
          unreadCount: 0,
        }))
      },

      archiveNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isArchived: true } : n
          ),
        }))
      },

      deleteNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.isRead 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        })
      },

      clearAll: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      setOpen: (open) => {
        set({ isOpen: open })
      },

      updatePreferences: (prefs) => {
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        }))
      },
    }),
    {
      name: 'home-notifications',
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50),
        preferences: state.preferences,
      }),
    }
  )
)

// =============================================================================
// NOTIFICATION HELPERS
// =============================================================================

function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch(() => {}) // Ignore autoplay restrictions
  } catch {
    // Ignore errors
  }
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Partial<Record<NotificationType, string>> = {
    'lead.new': '👤',
    'lead.assigned': '📋',
    'deal.won': '🎉',
    'task.assigned': '✅',
    'task.overdue': '⚠️',
    'stock.low': '📦',
    'invoice.overdue': '💰',
    'workflow.pending': '🔄',
    'system.update': '🔔',
  }
  return icons[type] || '📬'
}

export function getNotificationColor(priority: NotificationPriority): string {
  const colors: Record<NotificationPriority, string> = {
    low: 'bg-gray-100 text-gray-600',
    normal: 'bg-blue-100 text-blue-600',
    high: 'bg-yellow-100 text-yellow-600',
    urgent: 'bg-red-100 text-red-600',
  }
  return colors[priority]
}

export function getCategoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    crm: '👥',
    hrm: '🏢',
    project: '📁',
    inventory: '📦',
    finance: '💰',
    workflow: '🔄',
    system: '⚙️',
  }
  return icons[category]
}

// =============================================================================
// NOTIFICATION EVENT HANDLERS
// =============================================================================

export const NotificationEvents = {
  // CRM Events
  onLeadCreated: (lead: { id: string; name: string; assigneeId?: string }) => {
    const store = useNotificationStore.getState()
    if (lead.assigneeId) {
      store.addNotification({
        type: 'lead.assigned',
        category: 'crm',
        priority: 'normal',
        title: 'Lead mới được giao',
        message: `Bạn được giao lead mới: ${lead.name}`,
        userId: lead.assigneeId,
        resourceType: 'lead',
        resourceId: lead.id,
        link: `/erp/crm/leads/${lead.id}`,
      })
    }
  },

  // Task Events
  onTaskAssigned: (task: { id: string; title: string; assigneeId: string; projectId: string }) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'task.assigned',
      category: 'project',
      priority: 'normal',
      title: 'Task mới',
      message: `Bạn được giao task: ${task.title}`,
      userId: task.assigneeId,
      resourceType: 'task',
      resourceId: task.id,
      link: `/erp/projects/${task.projectId}/tasks/${task.id}`,
    })
  },

  // Stock Events
  onStockLow: (product: { id: string; name: string; currentStock: number; minStock: number }) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'stock.low',
      category: 'inventory',
      priority: 'high',
      title: 'Tồn kho thấp',
      message: `${product.name} còn ${product.currentStock}/${product.minStock}`,
      userId: 'warehouse_manager', // Should be dynamic
      resourceType: 'product',
      resourceId: product.id,
      link: `/erp/inventory/products/${product.id}`,
    })
  },

  // Invoice Events
  onInvoiceOverdue: (invoice: { id: string; number: string; customerId: string; daysOverdue: number }) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'invoice.overdue',
      category: 'finance',
      priority: 'urgent',
      title: 'Hóa đơn quá hạn',
      message: `Hóa đơn ${invoice.number} quá hạn ${invoice.daysOverdue} ngày`,
      userId: 'finance_manager',
      resourceType: 'invoice',
      resourceId: invoice.id,
      link: `/erp/finance/invoices/${invoice.id}`,
    })
  },

  // Workflow Events
  onWorkflowPending: (workflow: { id: string; name: string; approverId: string; requesterId: string; requesterName: string }) => {
    const store = useNotificationStore.getState()
    store.addNotification({
      type: 'workflow.pending',
      category: 'workflow',
      priority: 'high',
      title: 'Yêu cầu phê duyệt',
      message: `${workflow.requesterName} yêu cầu duyệt: ${workflow.name}`,
      userId: workflow.approverId,
      resourceType: 'workflow',
      resourceId: workflow.id,
      link: `/erp/workflows/${workflow.id}`,
      actorId: workflow.requesterId,
      actorName: workflow.requesterName,
    })
  },
}

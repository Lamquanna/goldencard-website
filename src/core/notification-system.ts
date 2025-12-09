/**
 * Notification System - Real-time Notification Center
 * 
 * Handles notifications across the platform with support for:
 * - Multiple categories
 * - Priority levels
 * - Real-time delivery via WebSocket/Firebase
 * - Persistence via Prisma
 */

import { 
  Notification, 
  NotificationCategory, 
  NotificationPriority,
  User 
} from './types';

// Notification templates for common scenarios
export const NotificationTemplates = {
  // Task notifications
  TASK_ASSIGNED: {
    category: 'task' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'New Task Assigned',
    messageTemplate: '{{assignerName}} assigned you the task "{{taskName}}"',
  },
  TASK_COMPLETED: {
    category: 'task' as NotificationCategory,
    priority: 'low' as NotificationPriority,
    titleTemplate: 'Task Completed',
    messageTemplate: '{{userName}} completed the task "{{taskName}}"',
  },
  TASK_DUE_SOON: {
    category: 'deadline' as NotificationCategory,
    priority: 'high' as NotificationPriority,
    titleTemplate: 'Task Due Soon',
    messageTemplate: 'Task "{{taskName}}" is due in {{timeRemaining}}',
  },

  // Lead notifications
  LEAD_ASSIGNED: {
    category: 'lead' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'New Lead Assigned',
    messageTemplate: 'You have been assigned a new lead: {{leadName}}',
  },
  LEAD_CONVERTED: {
    category: 'lead' as NotificationCategory,
    priority: 'low' as NotificationPriority,
    titleTemplate: 'Lead Converted',
    messageTemplate: 'Lead "{{leadName}}" has been converted to a deal',
  },

  // Invoice notifications
  INVOICE_CREATED: {
    category: 'invoice' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'New Invoice Created',
    messageTemplate: 'Invoice #{{invoiceNumber}} has been created for {{amount}}',
  },
  INVOICE_OVERDUE: {
    category: 'invoice' as NotificationCategory,
    priority: 'urgent' as NotificationPriority,
    titleTemplate: 'Invoice Overdue',
    messageTemplate: 'Invoice #{{invoiceNumber}} is overdue by {{daysPastDue}} days',
  },
  PAYMENT_RECEIVED: {
    category: 'invoice' as NotificationCategory,
    priority: 'low' as NotificationPriority,
    titleTemplate: 'Payment Received',
    messageTemplate: 'Payment of {{amount}} received for Invoice #{{invoiceNumber}}',
  },

  // HR notifications
  LEAVE_REQUEST: {
    category: 'hr' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'Leave Request',
    messageTemplate: '{{employeeName}} has requested {{leaveType}} leave from {{startDate}} to {{endDate}}',
  },
  LEAVE_APPROVED: {
    category: 'hr' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'Leave Approved',
    messageTemplate: 'Your {{leaveType}} leave request has been approved',
  },
  LEAVE_REJECTED: {
    category: 'hr' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'Leave Rejected',
    messageTemplate: 'Your {{leaveType}} leave request has been rejected: {{reason}}',
  },

  // Approval notifications
  APPROVAL_REQUIRED: {
    category: 'approval' as NotificationCategory,
    priority: 'high' as NotificationPriority,
    titleTemplate: 'Approval Required',
    messageTemplate: '{{itemType}} "{{itemName}}" requires your approval',
  },
  APPROVAL_GRANTED: {
    category: 'approval' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'Approved',
    messageTemplate: 'Your {{itemType}} "{{itemName}}" has been approved',
  },

  // System notifications
  SYSTEM_UPDATE: {
    category: 'system' as NotificationCategory,
    priority: 'low' as NotificationPriority,
    titleTemplate: 'System Update',
    messageTemplate: '{{message}}',
  },
  SYSTEM_ALERT: {
    category: 'alert' as NotificationCategory,
    priority: 'urgent' as NotificationPriority,
    titleTemplate: 'System Alert',
    messageTemplate: '{{message}}',
  },

  // Mention/Comment notifications
  MENTIONED: {
    category: 'mention' as NotificationCategory,
    priority: 'medium' as NotificationPriority,
    titleTemplate: 'You were mentioned',
    messageTemplate: '{{mentionerName}} mentioned you in {{context}}',
  },
  NEW_COMMENT: {
    category: 'comment' as NotificationCategory,
    priority: 'low' as NotificationPriority,
    titleTemplate: 'New Comment',
    messageTemplate: '{{commenterName}} commented on {{itemType}} "{{itemName}}"',
  },
};

type NotificationHandler = (notification: Notification) => void | Promise<void>;
type NotificationFilter = (notification: Notification) => boolean;

interface NotificationOptions {
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

interface BroadcastOptions extends NotificationOptions {
  userIds: string[];
}

class NotificationSystem {
  private handlers: Map<string, Set<NotificationHandler>> = new Map();
  private globalHandlers: Set<NotificationHandler> = new Set();
  private filters: NotificationFilter[] = [];
  private pendingNotifications: Map<string, Notification[]> = new Map();

  // ============================================
  // Notification Creation
  // ============================================

  /**
   * Create a notification for a single user
   */
  async createNotification(userId: string, options: NotificationOptions): Promise<Notification> {
    const notification: Notification = {
      id: this.generateId(),
      userId,
      title: options.title,
      message: options.message,
      category: options.category,
      priority: options.priority || 'medium',
      moduleId: options.moduleId,
      entityType: options.entityType,
      entityId: options.entityId,
      actionUrl: options.actionUrl,
      isRead: false,
      createdAt: new Date(),
      metadata: options.metadata,
    };

    // Apply filters
    if (this.filters.some(filter => !filter(notification))) {
      return notification; // Filtered out, don't deliver
    }

    // Deliver to handlers
    await this.deliverNotification(notification);

    return notification;
  }

  /**
   * Create notifications for multiple users (broadcast)
   */
  async broadcast(options: BroadcastOptions): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const userId of options.userIds) {
      const notification = await this.createNotification(userId, options);
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create notification from template
   */
  async createFromTemplate<T extends keyof typeof NotificationTemplates>(
    userId: string,
    templateKey: T,
    variables: Record<string, string>,
    overrides?: Partial<NotificationOptions>
  ): Promise<Notification> {
    const template = NotificationTemplates[templateKey];
    
    const title = this.interpolate(template.titleTemplate, variables);
    const message = this.interpolate(template.messageTemplate, variables);

    return this.createNotification(userId, {
      title,
      message,
      category: template.category,
      priority: template.priority,
      ...overrides,
    });
  }

  /**
   * Broadcast from template to multiple users
   */
  async broadcastFromTemplate<T extends keyof typeof NotificationTemplates>(
    userIds: string[],
    templateKey: T,
    variables: Record<string, string>,
    overrides?: Partial<NotificationOptions>
  ): Promise<Notification[]> {
    const template = NotificationTemplates[templateKey];
    
    const title = this.interpolate(template.titleTemplate, variables);
    const message = this.interpolate(template.messageTemplate, variables);

    return this.broadcast({
      userIds,
      title,
      message,
      category: template.category,
      priority: template.priority,
      ...overrides,
    });
  }

  // ============================================
  // Notification Delivery
  // ============================================

  private async deliverNotification(notification: Notification): Promise<void> {
    // Store in pending for offline users
    const pending = this.pendingNotifications.get(notification.userId) || [];
    pending.push(notification);
    this.pendingNotifications.set(notification.userId, pending);

    // Notify global handlers
    for (const handler of this.globalHandlers) {
      try {
        await handler(notification);
      } catch (error) {
        console.error('Notification handler error:', error);
      }
    }

    // Notify user-specific handlers
    const userHandlers = this.handlers.get(notification.userId);
    if (userHandlers) {
      for (const handler of userHandlers) {
        try {
          await handler(notification);
        } catch (error) {
          console.error('User notification handler error:', error);
        }
      }
    }
  }

  // ============================================
  // Subscription Management
  // ============================================

  /**
   * Subscribe to notifications for a specific user
   */
  subscribe(userId: string, handler: NotificationHandler): () => void {
    if (!this.handlers.has(userId)) {
      this.handlers.set(userId, new Set());
    }
    this.handlers.get(userId)!.add(handler);

    // Deliver pending notifications
    const pending = this.pendingNotifications.get(userId) || [];
    pending.forEach(notification => handler(notification));
    this.pendingNotifications.delete(userId);

    // Return unsubscribe function
    return () => {
      this.handlers.get(userId)?.delete(handler);
    };
  }

  /**
   * Subscribe to all notifications (for admin/system use)
   */
  subscribeGlobal(handler: NotificationHandler): () => void {
    this.globalHandlers.add(handler);
    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Add a notification filter
   */
  addFilter(filter: NotificationFilter): () => void {
    this.filters.push(filter);
    return () => {
      const index = this.filters.indexOf(filter);
      if (index > -1) {
        this.filters.splice(index, 1);
      }
    };
  }

  // ============================================
  // Notification Management
  // ============================================

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    // This would typically update the database
    // For now, just emit an event
    const pending = this.pendingNotifications.get(userId);
    if (pending) {
      const notification = pending.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        notification.readAt = new Date();
      }
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    const pending = this.pendingNotifications.get(userId);
    if (pending) {
      const now = new Date();
      pending.forEach(n => {
        n.isRead = true;
        n.readAt = now;
      });
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const pending = this.pendingNotifications.get(userId);
    if (pending) {
      const index = pending.findIndex(n => n.id === notificationId);
      if (index > -1) {
        pending.splice(index, 1);
      }
    }
  }

  /**
   * Clear all notifications for a user
   */
  async clearAll(userId: string): Promise<void> {
    this.pendingNotifications.delete(userId);
  }

  /**
   * Get unread count for a user
   */
  getUnreadCount(userId: string): number {
    const pending = this.pendingNotifications.get(userId) || [];
    return pending.filter(n => !n.isRead).length;
  }

  /**
   * Get notifications by category
   */
  getByCategory(userId: string, category: NotificationCategory): Notification[] {
    const pending = this.pendingNotifications.get(userId) || [];
    return pending.filter(n => n.category === category);
  }

  // ============================================
  // Utility Methods
  // ============================================

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
  }

  /**
   * Get notification statistics
   */
  getStats(userId: string): {
    total: number;
    unread: number;
    byCategory: Record<NotificationCategory, number>;
    byPriority: Record<NotificationPriority, number>;
  } {
    const pending = this.pendingNotifications.get(userId) || [];
    
    const byCategory = {} as Record<NotificationCategory, number>;
    const byPriority = {} as Record<NotificationPriority, number>;

    pending.forEach(n => {
      byCategory[n.category] = (byCategory[n.category] || 0) + 1;
      byPriority[n.priority] = (byPriority[n.priority] || 0) + 1;
    });

    return {
      total: pending.length,
      unread: pending.filter(n => !n.isRead).length,
      byCategory,
      byPriority,
    };
  }
}

// Singleton instance
export const notificationSystem = new NotificationSystem();

// Convenience functions
export const notify = {
  user: (userId: string, options: NotificationOptions) => 
    notificationSystem.createNotification(userId, options),
  
  broadcast: (userIds: string[], options: Omit<BroadcastOptions, 'userIds'>) => 
    notificationSystem.broadcast({ ...options, userIds }),
  
  template: <T extends keyof typeof NotificationTemplates>(
    userId: string, 
    templateKey: T, 
    variables: Record<string, string>
  ) => notificationSystem.createFromTemplate(userId, templateKey, variables),
};

export type { NotificationHandler, NotificationFilter, NotificationOptions, BroadcastOptions };

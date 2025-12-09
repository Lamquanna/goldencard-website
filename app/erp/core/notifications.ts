// =============================================================================
// HOME PLATFORM - Notification Service
// Universal notifications across all modules
// =============================================================================

import type { Notification as AppNotification, NotificationType, PlatformEvent } from '../types';

// Re-export type to avoid conflicts with browser Notification API
export type Notification = AppNotification;
import { getEventBus } from './pluginEngine';

// -----------------------------------------------------------------------------
// Notification Service
// -----------------------------------------------------------------------------

class NotificationService {
  private notifications: Map<string, Notification[]> = new Map(); // userId -> notifications
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private unreadCounts: Map<string, number> = new Map();

  constructor() {
    // Subscribe to notification events
    const eventBus = getEventBus();
    eventBus.on('notification:create', this.handleNotificationEvent.bind(this));
  }

  private handleNotificationEvent(event: PlatformEvent<Notification>): void {
    if (event.payload) {
      this.addNotification(event.payload.userId, event.payload);
    }
  }

  // Create and send a notification
  async send(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      read: false,
      createdAt: new Date(),
    };

    this.addNotification(notification.userId, newNotification);

    // Emit event for real-time updates
    getEventBus().emit({
      type: 'notification:new',
      moduleId: notification.moduleId || 'system',
      payload: newNotification,
      timestamp: new Date(),
      userId: notification.userId,
    });

    // Trigger push notification if enabled
    await this.sendPushNotification(newNotification);

    return newNotification;
  }

  // Add notification to user's list
  private addNotification(userId: string, notification: Notification): void {
    if (!this.notifications.has(userId)) {
      this.notifications.set(userId, []);
    }

    const userNotifications = this.notifications.get(userId)!;
    userNotifications.unshift(notification);

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.pop();
    }

    // Update unread count
    this.updateUnreadCount(userId);

    // Notify listeners
    this.notifyListeners(userId, notification);
  }

  // Get notifications for a user
  getNotifications(
    userId: string, 
    options?: { 
      unreadOnly?: boolean;
      type?: NotificationType;
      moduleId?: string;
      limit?: number;
      offset?: number;
    }
  ): Notification[] {
    let notifications = this.notifications.get(userId) || [];

    if (options?.unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }

    if (options?.type) {
      notifications = notifications.filter(n => n.type === options.type);
    }

    if (options?.moduleId) {
      notifications = notifications.filter(n => n.moduleId === options.moduleId);
    }

    const offset = options?.offset || 0;
    const limit = options?.limit || 20;

    return notifications.slice(offset, offset + limit);
  }

  // Mark notification as read
  markAsRead(userId: string, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return false;

    notification.read = true;
    notification.readAt = new Date();

    this.updateUnreadCount(userId);
    return true;
  }

  // Mark all notifications as read
  markAllAsRead(userId: string): void {
    const notifications = this.notifications.get(userId);
    if (!notifications) return;

    notifications.forEach(n => {
      if (!n.read) {
        n.read = true;
        n.readAt = new Date();
      }
    });

    this.updateUnreadCount(userId);
  }

  // Delete a notification
  delete(userId: string, notificationId: string): boolean {
    const notifications = this.notifications.get(userId);
    if (!notifications) return false;

    const index = notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;

    notifications.splice(index, 1);
    this.updateUnreadCount(userId);
    return true;
  }

  // Clear all notifications for a user
  clearAll(userId: string): void {
    this.notifications.set(userId, []);
    this.unreadCounts.set(userId, 0);
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    return this.unreadCounts.get(userId) || 0;
  }

  private updateUnreadCount(userId: string): void {
    const notifications = this.notifications.get(userId) || [];
    const unreadCount = notifications.filter(n => !n.read).length;
    this.unreadCounts.set(userId, unreadCount);
  }

  // Subscribe to new notifications
  subscribe(userId: string, callback: (notification: Notification) => void): () => void {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }

    this.listeners.get(userId)!.add(callback);

    return () => {
      this.listeners.get(userId)?.delete(callback);
    };
  }

  private notifyListeners(userId: string, notification: Notification): void {
    const listeners = this.listeners.get(userId);
    if (listeners) {
      listeners.forEach(callback => callback(notification));
    }
  }

  // Send push notification
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Check browser support
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Check permission
    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/images/logo-icon.png',
        badge: '/images/badge.png',
        tag: notification.id,
        data: {
          link: notification.link,
          moduleId: notification.moduleId,
        },
      });
    } catch (error) {
      console.error('Push notification error:', error);
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// -----------------------------------------------------------------------------
// Notification Helpers
// -----------------------------------------------------------------------------

export interface NotificationBuilder {
  type: NotificationType;
  title: string;
  message: string;
  userId: string;
  link?: string;
  moduleId?: string;
  actorId?: string;
  actorName?: string;
  actorAvatar?: string;
  metadata?: Record<string, unknown>;
}

export function createNotification(builder: NotificationBuilder): Omit<Notification, 'id' | 'read' | 'createdAt'> {
  return {
    type: builder.type,
    title: builder.title,
    message: builder.message,
    userId: builder.userId,
    link: builder.link,
    moduleId: builder.moduleId,
    actorId: builder.actorId,
    actorName: builder.actorName,
    actorAvatar: builder.actorAvatar,
    metadata: builder.metadata,
  };
}

// Quick notification creators
export const notify = {
  info: (userId: string, title: string, message: string, link?: string) =>
    createNotification({ type: 'info', userId, title, message, link }),

  success: (userId: string, title: string, message: string, link?: string) =>
    createNotification({ type: 'success', userId, title, message, link }),

  warning: (userId: string, title: string, message: string, link?: string) =>
    createNotification({ type: 'warning', userId, title, message, link }),

  error: (userId: string, title: string, message: string, link?: string) =>
    createNotification({ type: 'error', userId, title, message, link }),

  task: (userId: string, title: string, message: string, taskLink: string, actorName?: string) =>
    createNotification({ 
      type: 'task', 
      userId, 
      title, 
      message, 
      link: taskLink,
      moduleId: 'tasks',
      actorName,
    }),

  mention: (userId: string, title: string, message: string, link: string, actorName: string, actorAvatar?: string) =>
    createNotification({ 
      type: 'mention', 
      userId, 
      title, 
      message, 
      link,
      actorName,
      actorAvatar,
    }),

  approval: (userId: string, title: string, message: string, link: string, moduleId: string) =>
    createNotification({ 
      type: 'approval', 
      userId, 
      title, 
      message, 
      link,
      moduleId,
    }),
};

// -----------------------------------------------------------------------------
// Singleton Instance
// -----------------------------------------------------------------------------

let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}

export { NotificationService };

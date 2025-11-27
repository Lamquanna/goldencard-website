// Firebase Cloud Messaging (FCM) Operations
// Handles push notifications via Firebase

import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { getAppInstance } from './config';
import { updateFCMToken } from './firestore';

let messaging: Messaging | null = null;

// Initialize messaging (client-side only)
export function initializeMessaging(): Messaging | null {
  if (typeof window === 'undefined') {
    console.warn('FCM can only be initialized on the client side');
    return null;
  }
  
  if (!messaging) {
    try {
      const app = getAppInstance();
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Failed to initialize FCM:', error);
      return null;
    }
  }
  
  return messaging;
}

// ============================================
// TOKEN MANAGEMENT
// ============================================

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(userId: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    const fcmMessaging = initializeMessaging();
    if (!fcmMessaging) return null;
    
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error('VAPID key not configured');
      return null;
    }
    
    const token = await getToken(fcmMessaging, { vapidKey });
    
    if (token) {
      // Store token in Firestore
      await updateFCMToken(userId, token);
      console.log('FCM token registered:', token.substring(0, 20) + '...');
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
}

/**
 * Get current FCM token without requesting permission
 */
export async function getCurrentToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const fcmMessaging = initializeMessaging();
    if (!fcmMessaging) return null;
    
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) return null;
    
    return await getToken(fcmMessaging, { vapidKey });
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

// ============================================
// MESSAGE HANDLING
// ============================================

export interface FCMMessage {
  notification?: {
    title?: string;
    body?: string;
    icon?: string;
    image?: string;
  };
  data?: Record<string, string>;
}

export type MessageHandler = (message: FCMMessage) => void;

/**
 * Subscribe to foreground messages
 */
export function onForegroundMessage(handler: MessageHandler): () => void {
  const fcmMessaging = initializeMessaging();
  if (!fcmMessaging) {
    console.warn('FCM not initialized');
    return () => {};
  }
  
  const unsubscribe = onMessage(fcmMessaging, (payload) => {
    console.log('Foreground message received:', payload);
    handler({
      notification: payload.notification,
      data: payload.data,
    });
  });
  
  return unsubscribe;
}

// ============================================
// NOTIFICATION DISPLAY
// ============================================

/**
 * Show browser notification
 */
export function showNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined') return;
  
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/images/logo-icon.png',
      badge: '/images/logo-icon.png',
      ...options,
    });
    
    notification.onclick = () => {
      window.focus();
      notification.close();
      
      // Handle click action
      if (options?.data?.link) {
        window.location.href = options.data.link;
      }
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}

/**
 * Show toast notification (for foreground)
 */
export interface ToastOptions {
  title: string;
  body: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

type ToastCallback = (options: ToastOptions) => void;
let toastCallback: ToastCallback | null = null;

export function registerToastCallback(callback: ToastCallback): void {
  toastCallback = callback;
}

export function showToast(options: ToastOptions): void {
  if (toastCallback) {
    toastCallback(options);
  } else {
    // Fallback to browser notification
    showNotification(options.title, { body: options.body });
  }
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Format notification from FCM payload
 */
export function formatNotification(message: FCMMessage): ToastOptions {
  const type = (message.data?.type || 'info') as ToastOptions['type'];
  
  return {
    title: message.notification?.title || 'Thông báo mới',
    body: message.notification?.body || '',
    type,
  };
}

/**
 * Get notification type icon
 */
export function getNotificationIcon(type: string): string {
  const icons: Record<string, string> = {
    new_message: '💬',
    mention: '@',
    reaction: '👍',
    group_invite: '👥',
    task_assigned: '📋',
    task_completed: '✅',
    task_due_soon: '⏰',
    task_overdue: '⚠️',
    project_update: '📁',
    comment: '💭',
    lead_assigned: '🎯',
    lead_status_changed: '🔄',
    system: 'ℹ️',
  };
  
  return icons[type] || '🔔';
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

export interface NotificationPreferences {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  categories: {
    messages: boolean;
    mentions: boolean;
    tasks: boolean;
    leads: boolean;
    system: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "07:00"
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  sound: true,
  desktop: true,
  categories: {
    messages: true,
    mentions: true,
    tasks: true,
    leads: true,
    system: true,
  },
};

/**
 * Get notification preferences from localStorage
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  
  const stored = localStorage.getItem('notificationPreferences');
  if (stored) {
    try {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  }
  
  return DEFAULT_PREFERENCES;
}

/**
 * Save notification preferences to localStorage
 */
export function saveNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') return;
  
  const current = getNotificationPreferences();
  const updated = { ...current, ...preferences };
  localStorage.setItem('notificationPreferences', JSON.stringify(updated));
}

/**
 * Check if notifications should be shown based on preferences
 */
export function shouldShowNotification(type: string, preferences?: NotificationPreferences): boolean {
  const prefs = preferences || getNotificationPreferences();
  
  if (!prefs.enabled) return false;
  
  // Check quiet hours
  if (prefs.quietHours?.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startHour, startMin] = prefs.quietHours.start.split(':').map(Number);
    const [endHour, endMin] = prefs.quietHours.end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    } else {
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    }
  }
  
  // Check category
  const categoryMap: Record<string, keyof NotificationPreferences['categories']> = {
    new_message: 'messages',
    mention: 'mentions',
    reaction: 'messages',
    group_invite: 'messages',
    task_assigned: 'tasks',
    task_completed: 'tasks',
    task_due_soon: 'tasks',
    task_overdue: 'tasks',
    project_update: 'tasks',
    comment: 'messages',
    lead_assigned: 'leads',
    lead_status_changed: 'leads',
    system: 'system',
  };
  
  const category = categoryMap[type];
  if (category && !prefs.categories[category]) {
    return false;
  }
  
  return true;
}

// ============================================
// SERVICE WORKER REGISTRATION
// ============================================

/**
 * Register service worker for background notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('Service Worker registered:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

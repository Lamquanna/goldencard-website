/**
 * Real-time Features Library
 * Handles WebSocket connections, Server-Sent Events, and real-time updates
 * for the GoldenCard ERP system
 */

import { create } from 'zustand';

// =====================================================
// TYPES & INTERFACES
// =====================================================

export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export type MessageType = 'text' | 'image' | 'file' | 'video' | 'audio' | 'system';

export type NotificationType = 
  | 'task_assigned' 
  | 'task_due' 
  | 'task_completed'
  | 'project_update' 
  | 'project_milestone'
  | 'lead_assigned' 
  | 'lead_activity'
  | 'chat_message' 
  | 'chat_mention'
  | 'approval_request' 
  | 'approval_response'
  | 'system_alert' 
  | 'inventory_low_stock';

export interface UserPresence {
  id: string;
  userId: string;
  status: UserStatus;
  lastSeen: Date;
  lastActivity: Date;
  deviceInfo?: Record<string, any>;
  sessionId?: string;
}

export interface OnlineUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string;
  status: UserStatus;
  lastSeen: Date;
  lastActivity: Date;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'channel' | 'project' | 'support';
  projectId?: string;
  leadId?: string;
  description?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: MessageType;
  parentId?: string;
  threadCount: number;
  attachments: any[];
  mentions: string[];
  reactions: Record<string, string[]>;
  edited: boolean;
  editedAt?: Date;
  deleted: boolean;
  deletedAt?: Date;
  readBy: string[];
  readCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields
  sender?: {
    id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  icon?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    link?: string;
    action?: string;
  }>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface TypingIndicator {
  roomId: string;
  userId: string;
  username: string;
  expiresAt: Date;
}

export interface ActivityFeedItem {
  id: string;
  userId?: string;
  actorName: string;
  actorAvatar?: string;
  action: string;
  verb: string;
  targetType: string;
  targetId: string;
  targetName?: string;
  context?: Record<string, any>;
  visibility: 'public' | 'team' | 'private';
  createdAt: Date;
}

export interface VisitorSession {
  id: string;
  sessionId: string;
  visitorId?: string;
  userId?: string;
  userAgent?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  pageViews: number;
  totalTimeSeconds: number;
  isBounce: boolean;
  startedAt: Date;
  lastActivityAt: Date;
  endedAt?: Date;
}

// =====================================================
// REAL-TIME STORE (Zustand)
// =====================================================

interface RealtimeState {
  // Connection
  isConnected: boolean;
  connectionError?: string;
  
  // Online users
  onlineUsers: OnlineUser[];
  
  // Chat
  chatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>; // roomId -> messages
  typingIndicators: TypingIndicator[];
  unreadCounts: Record<string, number>; // roomId -> count
  
  // Notifications
  notifications: Notification[];
  unreadNotificationCount: number;
  
  // Activity feed
  activityFeed: ActivityFeedItem[];
  
  // Actions
  setConnected: (connected: boolean, error?: string) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  addOnlineUser: (user: OnlineUser) => void;
  removeOnlineUser: (userId: string) => void;
  updateUserStatus: (userId: string, status: UserStatus) => void;
  
  // Chat actions
  setChatRooms: (rooms: ChatRoom[]) => void;
  addChatRoom: (room: ChatRoom) => void;
  setMessages: (roomId: string, messages: ChatMessage[]) => void;
  addMessage: (roomId: string, message: ChatMessage) => void;
  updateMessage: (roomId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  deleteMessage: (roomId: string, messageId: string) => void;
  
  // Typing indicators
  setTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (roomId: string, userId: string) => void;
  clearExpiredTypingIndicators: () => void;
  
  // Unread counts
  setUnreadCount: (roomId: string, count: number) => void;
  incrementUnreadCount: (roomId: string) => void;
  markRoomAsRead: (roomId: string) => void;
  
  // Notifications
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  
  // Activity feed
  setActivityFeed: (items: ActivityFeedItem[]) => void;
  addActivityFeedItem: (item: ActivityFeedItem) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  // Initial state
  isConnected: false,
  onlineUsers: [],
  chatRooms: [],
  messages: {},
  typingIndicators: [],
  unreadCounts: {},
  notifications: [],
  unreadNotificationCount: 0,
  activityFeed: [],
  
  // Connection actions
  setConnected: (connected, error) => set({ isConnected: connected, connectionError: error }),
  
  // Online users actions
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  addOnlineUser: (user) => set((state) => ({
    onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user]
  })),
  removeOnlineUser: (userId) => set((state) => ({
    onlineUsers: state.onlineUsers.filter(u => u.id !== userId)
  })),
  updateUserStatus: (userId, status) => set((state) => ({
    onlineUsers: state.onlineUsers.map(u => 
      u.id === userId ? { ...u, status, lastActivity: new Date() } : u
    )
  })),
  
  // Chat room actions
  setChatRooms: (rooms) => set({ chatRooms: rooms }),
  addChatRoom: (room) => set((state) => ({
    chatRooms: [...state.chatRooms.filter(r => r.id !== room.id), room]
  })),
  
  // Message actions
  setMessages: (roomId, messages) => set((state) => ({
    messages: { ...state.messages, [roomId]: messages }
  })),
  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message]
    }
  })),
  updateMessage: (roomId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).map(m =>
        m.id === messageId ? { ...m, ...updates } : m
      )
    }
  })),
  deleteMessage: (roomId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: (state.messages[roomId] || []).filter(m => m.id !== messageId)
    }
  })),
  
  // Typing indicator actions
  setTypingIndicator: (indicator) => set((state) => ({
    typingIndicators: [
      ...state.typingIndicators.filter(
        t => !(t.roomId === indicator.roomId && t.userId === indicator.userId)
      ),
      indicator
    ]
  })),
  removeTypingIndicator: (roomId, userId) => set((state) => ({
    typingIndicators: state.typingIndicators.filter(
      t => !(t.roomId === roomId && t.userId === userId)
    )
  })),
  clearExpiredTypingIndicators: () => set((state) => ({
    typingIndicators: state.typingIndicators.filter(
      t => new Date(t.expiresAt) > new Date()
    )
  })),
  
  // Unread count actions
  setUnreadCount: (roomId, count) => set((state) => ({
    unreadCounts: { ...state.unreadCounts, [roomId]: count }
  })),
  incrementUnreadCount: (roomId) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: (state.unreadCounts[roomId] || 0) + 1
    }
  })),
  markRoomAsRead: (roomId) => set((state) => ({
    unreadCounts: { ...state.unreadCounts, [roomId]: 0 }
  })),
  
  // Notification actions
  setNotifications: (notifications) => set({
    notifications,
    unreadNotificationCount: notifications.filter(n => !n.isRead).length
  }),
  addNotification: (notification) => set((state) => {
    const newNotifications = [notification, ...state.notifications];
    return {
      notifications: newNotifications,
      unreadNotificationCount: newNotifications.filter(n => !n.isRead).length
    };
  }),
  markNotificationAsRead: (notificationId) => set((state) => {
    const newNotifications = state.notifications.map(n =>
      n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
    );
    return {
      notifications: newNotifications,
      unreadNotificationCount: newNotifications.filter(n => !n.isRead).length
    };
  }),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({
      ...n,
      isRead: true,
      readAt: n.readAt || new Date()
    })),
    unreadNotificationCount: 0
  })),
  removeNotification: (notificationId) => set((state) => {
    const newNotifications = state.notifications.filter(n => n.id !== notificationId);
    return {
      notifications: newNotifications,
      unreadNotificationCount: newNotifications.filter(n => !n.isRead).length
    };
  }),
  
  // Activity feed actions
  setActivityFeed: (items) => set({ activityFeed: items }),
  addActivityFeedItem: (item) => set((state) => ({
    activityFeed: [item, ...state.activityFeed].slice(0, 100) // Keep last 100
  }))
}));

// =====================================================
// REAL-TIME CONNECTION MANAGER
// =====================================================

class RealtimeManager {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private typingCleanupInterval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize real-time connection
   */
  connect(userId: string) {
    if (this.eventSource) {
      console.warn('Real-time connection already exists');
      return;
    }
    
    // Using Server-Sent Events (SSE) for real-time updates
    // For production, consider using WebSocket for bidirectional communication
    this.eventSource = new EventSource(`/api/realtime/stream?userId=${userId}`);
    
    this.eventSource.onopen = () => {
      console.log('✅ Real-time connection established');
      useRealtimeStore.getState().setConnected(true);
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.startTypingCleanup();
    };
    
    this.eventSource.onerror = (error) => {
      console.error('❌ Real-time connection error:', error);
      this.handleConnectionError();
    };
    
    // Handle different event types
    this.eventSource.addEventListener('user_status', this.handleUserStatus);
    this.eventSource.addEventListener('chat_message', this.handleChatMessage);
    this.eventSource.addEventListener('typing_indicator', this.handleTypingIndicator);
    this.eventSource.addEventListener('notification', this.handleNotification);
    this.eventSource.addEventListener('activity_feed', this.handleActivityFeed);
  }
  
  /**
   * Disconnect from real-time service
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    if (this.typingCleanupInterval) {
      clearInterval(this.typingCleanupInterval);
      this.typingCleanupInterval = null;
    }
    
    useRealtimeStore.getState().setConnected(false);
    console.log('🔌 Real-time connection closed');
  }
  
  /**
   * Handle connection errors and reconnection
   */
  private handleConnectionError() {
    useRealtimeStore.getState().setConnected(false, 'Connection lost');
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`⏳ Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        // Reconnect logic would go here
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      useRealtimeStore.getState().setConnected(false, 'Failed to reconnect');
    }
  }
  
  /**
   * Send heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Clean up expired typing indicators
   */
  private startTypingCleanup() {
    this.typingCleanupInterval = setInterval(() => {
      useRealtimeStore.getState().clearExpiredTypingIndicators();
    }, 5000); // Every 5 seconds
  }
  
  /**
   * Send heartbeat ping
   */
  private sendHeartbeat() {
    // This would be implemented with WebSocket
    // For SSE, the server handles keep-alive
    console.log('💓 Heartbeat sent');
  }
  
  /**
   * Handle user status updates
   */
  private handleUserStatus = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const store = useRealtimeStore.getState();
    
    if (data.action === 'online') {
      store.addOnlineUser(data.user);
    } else if (data.action === 'offline') {
      store.removeOnlineUser(data.userId);
    } else if (data.action === 'status_change') {
      store.updateUserStatus(data.userId, data.status);
    }
  };
  
  /**
   * Handle incoming chat messages
   */
  private handleChatMessage = (event: MessageEvent) => {
    const message: ChatMessage = JSON.parse(event.data);
    const store = useRealtimeStore.getState();
    
    store.addMessage(message.roomId, message);
    store.incrementUnreadCount(message.roomId);
    
    // Play notification sound
    this.playNotificationSound();
  };
  
  /**
   * Handle typing indicators
   */
  private handleTypingIndicator = (event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const store = useRealtimeStore.getState();
    
    if (data.action === 'start') {
      store.setTypingIndicator({
        roomId: data.roomId,
        userId: data.userId,
        username: data.username,
        expiresAt: new Date(Date.now() + 5000) // 5 seconds
      });
    } else if (data.action === 'stop') {
      store.removeTypingIndicator(data.roomId, data.userId);
    }
  };
  
  /**
   * Handle notifications
   */
  private handleNotification = (event: MessageEvent) => {
    const notification: Notification = JSON.parse(event.data);
    const store = useRealtimeStore.getState();
    
    store.addNotification(notification);
    
    // Show browser notification if permitted
    this.showBrowserNotification(notification);
    
    // Play notification sound
    this.playNotificationSound();
  };
  
  /**
   * Handle activity feed updates
   */
  private handleActivityFeed = (event: MessageEvent) => {
    const activity: ActivityFeedItem = JSON.parse(event.data);
    const store = useRealtimeStore.getState();
    
    store.addActivityFeedItem(activity);
  };
  
  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: notification.icon || '/icon.svg',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      });
    }
  }
  
  /**
   * Play notification sound
   */
  private playNotificationSound() {
    // Implement sound playing logic
    // const audio = new Audio('/sounds/notification.mp3');
    // audio.play().catch(err => console.log('Could not play sound:', err));
  }
}

// Export singleton instance
export const realtimeManager = new RealtimeManager();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
}

/**
 * Format time ago string
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  
  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
  
  return new Date(date).toLocaleDateString('vi-VN');
}

/**
 * Get user status color
 */
export function getStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    online: 'bg-green-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
    offline: 'bg-gray-400'
  };
  return colors[status] || colors.offline;
}

/**
 * Get notification icon
 */
export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    task_assigned: '📋',
    task_due: '⏰',
    task_completed: '✅',
    project_update: '📊',
    project_milestone: '🎯',
    lead_assigned: '👤',
    lead_activity: '📞',
    chat_message: '💬',
    chat_mention: '🔔',
    approval_request: '✋',
    approval_response: '👍',
    system_alert: '⚠️',
    inventory_low_stock: '📦'
  };
  return icons[type] || '🔔';
}

/**
 * Debounce function for typing indicators
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// =====================================================
// API FUNCTIONS
// =====================================================

/**
 * Fetch online users
 */
export async function fetchOnlineUsers(): Promise<OnlineUser[]> {
  try {
    const response = await fetch('/api/realtime/online-users');
    if (!response.ok) throw new Error('Failed to fetch online users');
    return await response.json();
  } catch (error) {
    console.error('Error fetching online users:', error);
    return [];
  }
}

/**
 * Update user presence
 */
export async function updateUserPresence(status: UserStatus): Promise<void> {
  try {
    await fetch('/api/realtime/presence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
}

/**
 * Send chat message
 */
export async function sendChatMessage(
  roomId: string,
  content: string,
  type: MessageType = 'text',
  parentId?: string
): Promise<ChatMessage | null> {
  try {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, content, type, parentId })
    });
    
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Mark room as read
 */
export async function markRoomAsRead(roomId: string): Promise<void> {
  try {
    await fetch(`/api/chat/rooms/${roomId}/read`, {
      method: 'POST'
    });
    
    useRealtimeStore.getState().markRoomAsRead(roomId);
  } catch (error) {
    console.error('Error marking room as read:', error);
  }
}

/**
 * Send typing indicator
 */
export const sendTypingIndicator = debounce(async (roomId: string, isTyping: boolean) => {
  try {
    await fetch('/api/chat/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, isTyping })
    });
  } catch (error) {
    console.error('Error sending typing indicator:', error);
  }
}, 500);

/**
 * Fetch notifications
 */
export async function fetchNotifications(): Promise<Notification[]> {
  try {
    const response = await fetch('/api/notifications');
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await fetch(`/api/notifications/${notificationId}/read`, {
      method: 'POST'
    });
    
    useRealtimeStore.getState().markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Track visitor page view
 */
export async function trackPageView(data: {
  pageUrl: string;
  pageTitle: string;
  referrer?: string;
}): Promise<void> {
  try {
    await fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

/**
 * Track custom event
 */
export async function trackEvent(data: {
  eventType: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  data?: Record<string, any>;
}): Promise<void> {
  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

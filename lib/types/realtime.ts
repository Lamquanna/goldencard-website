/**
 * Type definitions for real-time features and database schema
 */

// =====================================================
// DATABASE SCHEMA TYPES
// =====================================================

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: Date;
  last_activity: Date;
  device_info?: Record<string, any>;
  session_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ChatRoom {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'channel' | 'project' | 'support';
  project_id?: string;
  lead_id?: string;
  description?: string;
  avatar_url?: string;
  is_private: boolean;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  archived_at?: Date;
}

export interface ChatRoomMember {
  id: string;
  room_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  notifications_enabled: boolean;
  mute_until?: Date;
  last_read_at?: Date;
  last_read_message_id?: string;
  joined_at: Date;
  left_at?: Date;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'system';
  parent_id?: string;
  thread_count: number;
  attachments: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
  mentions: string[];
  reactions: Record<string, string[]>;
  edited: boolean;
  edited_at?: Date;
  deleted: boolean;
  deleted_at?: Date;
  read_by: string[];
  read_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface ChatTypingIndicator {
  id: string;
  room_id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  icon?: string;
  link?: string;
  entity_type?: string;
  entity_id?: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: Date;
  is_archived: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    link?: string;
    action?: string;
  }>;
  created_at: Date;
  expires_at?: Date;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  preferences?: Record<string, any>;
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  quiet_hours_timezone: string;
  digest_enabled: boolean;
  digest_frequency: 'hourly' | 'daily' | 'weekly';
  created_at: Date;
  updated_at: Date;
}

export interface VisitorSession {
  id: string;
  session_id: string;
  visitor_id?: string;
  user_id?: string;
  user_agent?: string;
  browser?: string;
  browser_version?: string;
  os?: string;
  os_version?: string;
  device_type?: string;
  device_vendor?: string;
  ip_address?: string;
  country?: string;
  country_code?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  referrer?: string;
  referrer_domain?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page?: string;
  landing_page_title?: string;
  exit_page?: string;
  page_views: number;
  total_time_seconds: number;
  is_bounce: boolean;
  started_at: Date;
  last_activity_at: Date;
  ended_at?: Date;
}

export interface PageView {
  id: string;
  session_id: string;
  page_url: string;
  page_title?: string;
  page_path?: string;
  previous_page_url?: string;
  time_on_page_seconds?: number;
  scroll_depth_percentage?: number;
  clicks: number;
  metadata?: Record<string, any>;
  viewed_at: Date;
}

export interface VisitorEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_category?: string;
  event_action?: string;
  event_label?: string;
  event_value?: number;
  page_url?: string;
  page_path?: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  data?: Record<string, any>;
  created_at: Date;
}

export interface ActivityFeed {
  id: string;
  user_id?: string;
  actor_name: string;
  actor_avatar?: string;
  action: string;
  verb: string;
  target_type: string;
  target_id: string;
  target_name?: string;
  context?: Record<string, any>;
  visibility: 'public' | 'team' | 'private';
  visible_to_users: string[];
  aggregation_key?: string;
  created_at: Date;
}

// =====================================================
// VIEW TYPES
// =====================================================

export interface UnreadMessageCount {
  user_id: string;
  room_id: string;
  unread_count: number;
  last_message_at: Date;
}

export interface OnlineUser {
  id: string;
  username: string;
  full_name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen: Date;
  last_activity: Date;
}

export interface NotificationSummary {
  user_id: string;
  total_notifications: number;
  unread_count: number;
  urgent_count: number;
  last_notification_at?: Date;
}

export interface VisitorAnalytics {
  date: Date;
  total_sessions: number;
  unique_visitors: number;
  logged_in_users: number;
  avg_page_views: number;
  avg_session_duration: number;
  bounce_rate: number;
  countries_count: number;
}

export interface PopularPage {
  page_path: string;
  page_title?: string;
  view_count: number;
  unique_sessions: number;
  avg_time_on_page: number;
  avg_scroll_depth: number;
}

export interface RecentActivity {
  id: string;
  user_id?: string;
  actor_name: string;
  actor_avatar?: string;
  username?: string;
  avatar?: string;
  action: string;
  verb: string;
  target_type: string;
  target_id: string;
  target_name?: string;
  context?: Record<string, any>;
  visibility: 'public' | 'team' | 'private';
  created_at: Date;
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================

export interface SendMessageRequest {
  roomId: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'video' | 'audio' | 'system';
  parentId?: string;
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
  mentions?: string[];
}

export interface SendMessageResponse {
  success: boolean;
  message?: ChatMessage;
  error?: string;
}

export interface UpdatePresenceRequest {
  status: 'online' | 'away' | 'busy' | 'offline';
  deviceInfo?: Record<string, any>;
}

export interface UpdatePresenceResponse {
  success: boolean;
  presence?: UserPresence;
  error?: string;
}

export interface MarkAsReadRequest {
  roomId: string;
  messageId?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  error?: string;
}

export interface TrackPageViewRequest {
  pageUrl: string;
  pageTitle: string;
  pagePath?: string;
  previousPageUrl?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface TrackEventRequest {
  eventType: string;
  eventCategory?: string;
  eventAction?: string;
  eventLabel?: string;
  eventValue?: number;
  pageUrl?: string;
  pagePath?: string;
  data?: Record<string, any>;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message?: string;
  icon?: string;
  link?: string;
  entityType?: string;
  entityId?: string;
  data?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  actions?: Array<{
    label: string;
    link?: string;
    action?: string;
  }>;
}

// =====================================================
// REALTIME EVENT TYPES
// =====================================================

export type RealtimeEventType = 
  | 'user_status'
  | 'chat_message'
  | 'typing_indicator'
  | 'notification'
  | 'activity_feed'
  | 'presence_update'
  | 'room_update';

export interface RealtimeEvent<T = any> {
  type: RealtimeEventType;
  timestamp: Date;
  data: T;
}

export interface UserStatusEvent {
  action: 'online' | 'offline' | 'status_change';
  userId: string;
  user?: OnlineUser;
  status?: 'online' | 'away' | 'busy' | 'offline';
}

export interface ChatMessageEvent {
  message: ChatMessage;
  roomId: string;
}

export interface TypingIndicatorEvent {
  action: 'start' | 'stop';
  roomId: string;
  userId: string;
  username: string;
}

export interface NotificationEvent {
  notification: Notification;
}

export interface ActivityFeedEvent {
  activity: ActivityFeed;
}

// =====================================================
// CONFIGURATION TYPES
// =====================================================

export interface RealtimeConfig {
  apiUrl: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  typingIndicatorTimeout: number;
  enableNotifications: boolean;
  enableSounds: boolean;
  enableBrowserNotifications: boolean;
}

export interface VisitorTrackingConfig {
  enabled: boolean;
  trackPageViews: boolean;
  trackEvents: boolean;
  trackUserSession: boolean;
  anonymizeIp: boolean;
  respectDoNotTrack: boolean;
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type MessageReaction = {
  emoji: string;
  users: string[];
  count: number;
};

export type ChatAttachment = {
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string;
  mimeType?: string;
};

export type NotificationAction = {
  label: string;
  link?: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'danger';
};

export type DeviceInfo = {
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  screenResolution?: string;
  language?: string;
  timezone?: string;
};

export type LocationInfo = {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
};

export type UTMParameters = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

// =====================================================
// FILTER & QUERY TYPES
// =====================================================

export interface NotificationFilter {
  isRead?: boolean;
  type?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  startDate?: Date;
  endDate?: Date;
}

export interface VisitorSessionFilter {
  startDate?: Date;
  endDate?: Date;
  country?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  utmSource?: string;
  utmCampaign?: string;
}

export interface ChatRoomFilter {
  type?: 'direct' | 'group' | 'channel' | 'project' | 'support';
  projectId?: string;
  isArchived?: boolean;
}

export interface ActivityFeedFilter {
  userId?: string;
  targetType?: string;
  visibility?: 'public' | 'team' | 'private';
  startDate?: Date;
  endDate?: Date;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================

export interface VisitorMetrics {
  totalSessions: number;
  uniqueVisitors: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  newVisitors: number;
  returningVisitors: number;
}

export interface EngagementMetrics {
  avgTimeOnPage: number;
  avgScrollDepth: number;
  totalClicks: number;
  totalEvents: number;
  conversionRate: number;
}

export interface TrafficSources {
  direct: number;
  organic: number;
  social: number;
  referral: number;
  email: number;
  paid: number;
}

export interface GeographicData {
  country: string;
  countryCode: string;
  sessions: number;
  pageViews: number;
  avgDuration: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface BrowserStats {
  browser: string;
  sessions: number;
  percentage: number;
}

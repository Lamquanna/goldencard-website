// Chat System Types
// Types for Firebase Firestore chat, groups, messages, and notifications

import { Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'manager' | 'employee' | 'client';
  department?: string;
  jobTitle?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: Timestamp;
  fcmTokens?: string[];
  preferences?: {
    notifications: boolean;
    emailDigest: 'daily' | 'weekly' | 'never';
    soundEnabled: boolean;
    desktopNotifications: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPresence {
  online: boolean;
  lastSeen: Timestamp;
  currentPage?: string;
}

// ============================================
// CHAT TYPES (Direct Messages)
// ============================================

export interface Chat {
  id: string;
  type: 'direct';
  participants: string[]; // 2 user IDs
  participantDetails: Record<string, ParticipantDetail>;
  lastMessage?: LastMessage;
  unreadCount: Record<string, number>;
  muted?: Record<string, boolean>;
  archived?: Record<string, boolean>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ParticipantDetail {
  uid: string;
  displayName: string;
  photoURL?: string;
  role?: string;
}

export interface LastMessage {
  text: string;
  senderId: string;
  timestamp: Timestamp;
}

// ============================================
// GROUP TYPES
// ============================================

export interface Group {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: 'group' | 'project' | 'department';
  projectId?: string; // Link to project if type is 'project'
  owner: string;
  admins: string[];
  members: string[];
  memberDetails: Record<string, ParticipantDetail>;
  settings: GroupSettings;
  lastMessage?: LastMessage;
  pinnedMessages: string[];
  isArchived?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface GroupSettings {
  onlyAdminsCanPost: boolean;
  onlyAdminsCanAddMembers: boolean;
  allowReactions: boolean;
  allowReplies: boolean;
  allowEditing: boolean;
  messageRetention?: number; // days, 0 = forever
}

// ============================================
// MESSAGE TYPES
// ============================================

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'text' | 'image' | 'file' | 'video' | 'audio' | 'system' | 'reply';
  text?: string;
  attachments?: Attachment[];
  replyTo?: ReplyReference;
  reactions?: Record<string, string[]>; // { '👍': ['user1', 'user2'] }
  mentions?: string[]; // user IDs
  edited?: boolean;
  editedAt?: Timestamp;
  deleted?: boolean;
  readBy?: string[]; // user IDs who have read
  createdAt: Timestamp;
}

export interface Attachment {
  id: string;
  name: string;
  type: string; // MIME type
  size: number;
  url: string;
  thumbnailUrl?: string; // For images/videos
  path: string; // Storage path for deletion
}

export interface ReplyReference {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: Message['type'];
}

// System message types
export type SystemMessageAction = 
  | 'member_joined'
  | 'member_left'
  | 'member_added'
  | 'member_removed'
  | 'group_created'
  | 'group_renamed'
  | 'group_avatar_changed'
  | 'admin_promoted'
  | 'admin_demoted'
  | 'settings_changed';

export interface SystemMessage extends Message {
  type: 'system';
  action: SystemMessageAction;
  targetUserId?: string;
  targetUserName?: string;
  metadata?: Record<string, any>;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  link?: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}

export type NotificationType = 
  | 'new_message'
  | 'mention'
  | 'reaction'
  | 'group_invite'
  | 'task_assigned'
  | 'task_completed'
  | 'task_due_soon'
  | 'task_overdue'
  | 'project_update'
  | 'comment'
  | 'lead_assigned'
  | 'lead_status_changed'
  | 'system';

// ============================================
// UI STATE TYPES
// ============================================

export interface ChatUIState {
  activeChat: Chat | Group | null;
  activeChatType: 'direct' | 'group' | null;
  sidebarOpen: boolean;
  detailsOpen: boolean;
  replyingTo: Message | null;
  editingMessage: Message | null;
  searchQuery: string;
  searchResults: Message[];
  isSearching: boolean;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  timestamp: Timestamp;
}

// ============================================
// CONVERSATION (Union Type for UI)
// ============================================

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string; // For direct: other person's name, for group: group name
  avatar?: string;
  lastMessage?: LastMessage;
  unreadCount: number;
  muted: boolean;
  archived: boolean;
  // Additional data
  participants?: string[];
  memberCount?: number;
  isOnline?: boolean; // For direct chats - other person's status
  updatedAt: Timestamp;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SendMessageRequest {
  conversationType: 'chat' | 'group';
  conversationId: string;
  text?: string;
  attachments?: File[];
  replyTo?: string; // message ID
  mentions?: string[]; // user IDs
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  type: 'group' | 'project' | 'department';
  projectId?: string;
  memberIds: string[];
  avatar?: File;
}

export interface SearchMessagesRequest {
  conversationType: 'chat' | 'group';
  conversationId: string;
  query: string;
  limit?: number;
}

// ============================================
// REALTIME UPDATE EVENTS
// ============================================

export type ChatEvent = 
  | { type: 'message_received'; data: Message }
  | { type: 'message_updated'; data: Message }
  | { type: 'message_deleted'; data: { messageId: string } }
  | { type: 'typing_start'; data: { userId: string; userName: string } }
  | { type: 'typing_stop'; data: { userId: string } }
  | { type: 'presence_changed'; data: { userId: string; online: boolean } }
  | { type: 'unread_count_changed'; data: { conversationId: string; count: number } };

// ============================================
// HELPER TYPES
// ============================================

export type ConversationListFilter = 'all' | 'unread' | 'direct' | 'groups' | 'archived';

export interface MessageFilter {
  type?: Message['type'];
  senderId?: string;
  hasAttachments?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Pagination
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

// Error types
export interface ChatError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// TypeScript types for CRM Mini
// Auto-generated from Supabase schema

// User roles hierarchy: admin > manager > sale > staff
// admin: Full access - manage everything
// manager: CRM access + user management (except admin)
// sale: CRM access only (leads, pipeline)
// staff: Chat only - no CRM access
export type UserRole = 'admin' | 'manager' | 'sale' | 'staff';

export type LeadStatus = 'new' | 'in_progress' | 'done' | 'overdue' | 'archived';

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export type LeadSource = 'zalo' | 'messenger' | 'phone' | 'email' | 'contact_form' | 'other';

export type LeadEventType = 
  | 'created' 
  | 'assigned' 
  | 'status_changed' 
  | 'note_added' 
  | 'call_made' 
  | 'email_sent' 
  | 'meeting_scheduled' 
  | 'other';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  
  // Source tracking
  source: LeadSource;
  source_url?: string;
  
  // UTM & Device
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type?: string;
  browser?: string;
  locale?: string;
  ip_address?: string;
  
  // Assignment & Status
  assigned_to?: string;
  assigned_user?: User; // Populated via join
  status: LeadStatus;
  priority: LeadPriority;
  
  // Timestamps
  created_at: string;
  last_activity: string;
  archived_at?: string;
  deleted_at?: string;
  
  // Chat tracking
  has_unread_messages?: boolean;
  customer_last_message_at?: string;
  admin_last_read_at?: string;
  
  // Contact info indicator
  has_contact_info?: boolean;
  is_anonymous?: boolean;
  
  // Metadata
  metadata?: Record<string, unknown>;
  
  // Computed
  events_count?: number;
}

export interface LeadEvent {
  id: string;
  lead_id: string;
  user_id?: string;
  user?: User; // Populated via join
  
  event_type: LeadEventType;
  description: string;
  metadata?: Record<string, unknown>;
  
  created_at: string;
}

export interface LeadStats {
  new_count: number;
  in_progress_count: number;
  done_count: number;
  overdue_count: number;
  archived_count: number;
  total_count: number;
  last_7_days: number;
  last_30_days: number;
}

export interface CreateLeadInput {
  name: string;
  phone?: string;
  email?: string;
  message?: string;
  source: LeadSource;
  source_url?: string;
  
  // Auto-captured
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  device_type?: string;
  browser?: string;
  locale?: string;
  ip_address?: string;
  
  metadata?: Record<string, unknown>;
}

export interface UpdateLeadInput {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  assigned_to?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateLeadEventInput {
  lead_id: string;
  event_type: LeadEventType;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  assigned_to?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  search?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

// Chat message types
export interface ChatMessage {
  id: string;
  lead_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id?: string;
  sender_name: string;
  message: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  read_at?: string;
}

export interface CreateChatMessageInput {
  lead_id: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  message: string;
  metadata?: Record<string, unknown>;
}


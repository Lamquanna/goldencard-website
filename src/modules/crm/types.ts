/**
 * CRM Module Types
 * Type definitions for CRM functionality
 */

// Lead Types
export type LeadSource = 
  | 'WEBSITE'
  | 'REFERRAL'
  | 'SOCIAL_MEDIA'
  | 'COLD_CALL'
  | 'EXHIBITION'
  | 'ADVERTISEMENT'
  | 'PARTNER'
  | 'OTHER';

export type LeadStatus = 
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'
  | 'NURTURING';

export type LeadRating = 'HOT' | 'WARM' | 'COLD';

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  rating: LeadRating;
  budget?: number;
  notes?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastContactAt?: Date;
  nextFollowUp?: Date;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Types
export interface Contact {
  id: string;
  workspaceId: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  avatar?: string;
  birthday?: Date;
  notes?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  isActive: boolean;
  leadId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Company Types
export interface Company {
  id: string;
  workspaceId: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  taxCode?: string;
  size?: string;
  revenue?: number;
  logo?: string;
  notes?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  isActive: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

// Deal Types
export type DealStage = 
  | 'PROSPECTING'
  | 'QUALIFICATION'
  | 'NEEDS_ANALYSIS'
  | 'VALUE_PROPOSITION'
  | 'DECISION_MAKERS'
  | 'PERCEPTION_ANALYSIS'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

export interface Deal {
  id: string;
  workspaceId: string;
  name: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  lostReason?: string;
  notes?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  contactId: string;
  contact?: Contact;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Activity Types
export type ActivityType = 
  | 'CALL'
  | 'EMAIL'
  | 'MEETING'
  | 'TASK'
  | 'NOTE'
  | 'SYSTEM'
  | 'STATUS_CHANGE'
  | 'ASSIGNMENT'
  | 'FILE_UPLOAD';

export interface Activity {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: ActivityType;
  entityType: 'lead' | 'contact' | 'deal';
  entityId: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  scheduledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Pipeline Types
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  color: string;
  probability: number;
  isWon?: boolean;
  isLost?: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
}

// Analytics Types
export interface DealForecast {
  month: string;
  expected: number;
  weighted: number;
  closed: number;
}

export interface LeadConversion {
  source: LeadSource;
  total: number;
  converted: number;
  conversionRate: number;
}

export interface SalesByOwner {
  ownerId: string;
  ownerName: string;
  totalDeals: number;
  totalValue: number;
  closedDeals: number;
  closedValue: number;
  winRate: number;
}

export interface CRMAnalytics {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  totalPipelineValue: number;
  wonValue: number;
  averageDealSize: number;
  winRate: number;
  averageSalesCycle: number;
  leadsBySource: Record<LeadSource, number>;
  dealsByStage: Record<DealStage, number>;
  forecast: DealForecast[];
  leadConversion: LeadConversion[];
  salesByOwner: SalesByOwner[];
}

// Form Types
export interface LeadFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source: LeadSource;
  budget?: number;
  notes?: string;
  tags?: string[];
  assignedToId?: string;
  nextFollowUp?: Date;
}

export interface ContactFormData {
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  birthday?: Date;
  notes?: string;
  tags?: string[];
}

export interface DealFormData {
  name: string;
  value: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  notes?: string;
  tags?: string[];
  contactId: string;
}

// Filter Types
export interface LeadFilters {
  status?: LeadStatus[];
  source?: LeadSource[];
  rating?: LeadRating[];
  assignedToId?: string;
  tags?: string[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface DealFilters {
  stage?: DealStage[];
  ownerId?: string;
  minValue?: number;
  maxValue?: number;
  tags?: string[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// =====================================================
// CRM MODULE - Module Definition
// Golden Home Platform
// =====================================================

import type { ModuleManifest, PermissionDefinition, ModuleRoute } from '../../types';

// CRM Routes
const crmRoutes: ModuleRoute[] = [
  { 
    path: '/home/crm', 
    name: 'Dashboard',
    nameVi: 'Tổng quan',
    icon: 'LayoutDashboard',
    showInSidebar: true,
    showInSearch: true,
  },
  { 
    path: '/home/crm/leads', 
    name: 'Leads',
    nameVi: 'Khách hàng tiềm năng',
    icon: 'Target',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:leads:read',
  },
  { 
    path: '/home/crm/pipeline', 
    name: 'Pipeline',
    nameVi: 'Pipeline bán hàng',
    icon: 'GitBranch',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:deals:read',
  },
  { 
    path: '/home/crm/contacts', 
    name: 'Contacts',
    nameVi: 'Danh bạ',
    icon: 'Users',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:contacts:read',
  },
  { 
    path: '/home/crm/deals', 
    name: 'Deals',
    nameVi: 'Cơ hội',
    icon: 'Handshake',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:deals:read',
  },
  { 
    path: '/home/crm/activities', 
    name: 'Activities',
    nameVi: 'Hoạt động',
    icon: 'Activity',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:activities:read',
  },
  { 
    path: '/home/crm/reports', 
    name: 'Reports',
    nameVi: 'Báo cáo',
    icon: 'PieChart',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:reports:read',
  },
  { 
    path: '/home/crm/automations', 
    name: 'Automations',
    nameVi: 'Tự động hóa',
    icon: 'Zap',
    showInSidebar: true,
    showInSearch: true,
    permission: 'crm:settings:manage',
  },
  { 
    path: '/home/crm/settings', 
    name: 'Settings',
    nameVi: 'Cài đặt',
    icon: 'Settings',
    showInSidebar: true,
    showInSearch: false,
    permission: 'crm:settings:manage',
  },
];

// CRM Permissions
const crmPermissions: PermissionDefinition[] = [
  // Lead permissions
  { 
    id: 'crm:leads:read', 
    name: 'View Leads',
    nameVi: 'Xem leads',
    resource: 'leads',
    actions: ['read'],
  },
  { 
    id: 'crm:leads:create', 
    name: 'Create Leads',
    nameVi: 'Tạo leads',
    resource: 'leads',
    actions: ['create'],
  },
  { 
    id: 'crm:leads:update', 
    name: 'Edit Leads',
    nameVi: 'Sửa leads',
    resource: 'leads',
    actions: ['update'],
  },
  { 
    id: 'crm:leads:delete', 
    name: 'Delete Leads',
    nameVi: 'Xóa leads',
    resource: 'leads',
    actions: ['delete'],
  },
  { 
    id: 'crm:leads:manage', 
    name: 'Manage Leads',
    nameVi: 'Quản lý leads',
    resource: 'leads',
    actions: ['manage'],
  },
  { 
    id: 'crm:leads:export', 
    name: 'Export Leads',
    nameVi: 'Xuất leads',
    resource: 'leads',
    actions: ['export'],
  },
  
  // Contact permissions
  { 
    id: 'crm:contacts:read', 
    name: 'View Contacts',
    nameVi: 'Xem liên hệ',
    resource: 'contacts',
    actions: ['read'],
  },
  { 
    id: 'crm:contacts:create', 
    name: 'Create Contacts',
    nameVi: 'Tạo liên hệ',
    resource: 'contacts',
    actions: ['create'],
  },
  { 
    id: 'crm:contacts:update', 
    name: 'Edit Contacts',
    nameVi: 'Sửa liên hệ',
    resource: 'contacts',
    actions: ['update'],
  },
  { 
    id: 'crm:contacts:delete', 
    name: 'Delete Contacts',
    nameVi: 'Xóa liên hệ',
    resource: 'contacts',
    actions: ['delete'],
  },
  
  // Deal permissions
  { 
    id: 'crm:deals:read', 
    name: 'View Deals',
    nameVi: 'Xem cơ hội',
    resource: 'deals',
    actions: ['read'],
  },
  { 
    id: 'crm:deals:create', 
    name: 'Create Deals',
    nameVi: 'Tạo cơ hội',
    resource: 'deals',
    actions: ['create'],
  },
  { 
    id: 'crm:deals:update', 
    name: 'Edit Deals',
    nameVi: 'Sửa cơ hội',
    resource: 'deals',
    actions: ['update'],
  },
  { 
    id: 'crm:deals:delete', 
    name: 'Delete Deals',
    nameVi: 'Xóa cơ hội',
    resource: 'deals',
    actions: ['delete'],
  },
  
  // Activity permissions
  { 
    id: 'crm:activities:read', 
    name: 'View Activities',
    nameVi: 'Xem hoạt động',
    resource: 'activities',
    actions: ['read'],
  },
  { 
    id: 'crm:activities:create', 
    name: 'Create Activities',
    nameVi: 'Tạo hoạt động',
    resource: 'activities',
    actions: ['create'],
  },
  
  // Report permissions
  { 
    id: 'crm:reports:read', 
    name: 'View Reports',
    nameVi: 'Xem báo cáo',
    resource: 'reports',
    actions: ['read'],
  },
  { 
    id: 'crm:reports:export', 
    name: 'Export Reports',
    nameVi: 'Xuất báo cáo',
    resource: 'reports',
    actions: ['export'],
  },
  
  // Settings permissions
  { 
    id: 'crm:settings:read', 
    name: 'View Settings',
    nameVi: 'Xem cài đặt',
    resource: 'settings',
    actions: ['read'],
  },
  { 
    id: 'crm:settings:manage', 
    name: 'Manage Settings',
    nameVi: 'Quản lý cài đặt',
    resource: 'settings',
    actions: ['manage'],
  },
];

// CRM Module Definition
export const CRM_MODULE: ModuleManifest = {
  id: 'crm',
  name: 'CRM',
  nameVi: 'Quản lý khách hàng',
  version: '1.0.0',
  description: 'Customer Relationship Management - Sales Pipeline, Leads, Deals',
  descriptionVi: 'Quản lý quan hệ khách hàng - Pipeline bán hàng, Leads, Cơ hội',
  icon: 'Users',
  color: '#3B82F6', // Blue
  author: 'GoldenEnergy',
  category: 'sales',
  
  basePath: '/home/crm',
  routes: crmRoutes,
  permissions: crmPermissions,
  defaultRoles: ['admin', 'sales_manager', 'sales_rep'],
  
  settings: [
    {
      key: 'leadSources',
      type: 'json',
      label: 'Lead Sources',
      labelVi: 'Nguồn khách hàng',
      defaultValue: ['Website', 'Referral', 'Social Media', 'Cold Call', 'Exhibition', 'Partner'],
    },
    {
      key: 'autoAssignment',
      type: 'boolean',
      label: 'Auto Assignment',
      labelVi: 'Tự động phân công',
      defaultValue: true,
    },
    {
      key: 'leadScoring',
      type: 'boolean',
      label: 'Lead Scoring',
      labelVi: 'Chấm điểm lead',
      defaultValue: true,
    },
    {
      key: 'defaultCurrency',
      type: 'select',
      label: 'Default Currency',
      labelVi: 'Tiền tệ mặc định',
      defaultValue: 'VND',
      options: [
        { value: 'VND', label: 'VND - Việt Nam Đồng' },
        { value: 'USD', label: 'USD - US Dollar' },
        { value: 'EUR', label: 'EUR - Euro' },
      ],
    },
  ],
  
  hooks: {
    onInstall: async () => {
      console.log('CRM Module installed');
    },
    onActivate: async () => {
      console.log('CRM Module activated');
    },
    onDeactivate: async () => {
      console.log('CRM Module deactivated');
    },
  },
  
  apiPrefix: '/api/home/crm',
};

// =====================================================
// CRM Types
// =====================================================

export type LeadSource = 
  | 'website'
  | 'referral'
  | 'social_media'
  | 'cold_call'
  | 'exhibition'
  | 'advertisement'
  | 'partner'
  | 'other';

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'
  | 'nurturing';

export type LeadRating = 'hot' | 'warm' | 'cold';

export type DealStage = 
  | 'prospecting'
  | 'qualification'
  | 'needs_analysis'
  | 'value_proposition'
  | 'decision_makers'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface Lead {
  id: string;
  workspaceId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  rating: LeadRating;
  budget?: number;
  notes?: string;
  tags: string[];
  customFields: Record<string, unknown>;
  assignedToId?: string;
  createdById: string;
  lastContactAt?: Date;
  nextFollowUp?: Date;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
  leadId?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

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
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note';
  title: string;
  description?: string;
  entityType: 'lead' | 'contact' | 'deal';
  entityId: string;
  userId: string;
  scheduledAt?: Date;
  completedAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// =====================================================
// CRM Configuration
// =====================================================

export const LEAD_STATUS_CONFIG = [
  { id: 'new', name: 'New', nameVi: 'Mới', color: '#3B82F6', order: 0 },
  { id: 'contacted', name: 'Contacted', nameVi: 'Đã liên hệ', color: '#8B5CF6', order: 1 },
  { id: 'qualified', name: 'Qualified', nameVi: 'Đủ điều kiện', color: '#10B981', order: 2 },
  { id: 'proposal', name: 'Proposal', nameVi: 'Báo giá', color: '#F59E0B', order: 3 },
  { id: 'negotiation', name: 'Negotiation', nameVi: 'Thương thảo', color: '#EF4444', order: 4 },
  { id: 'won', name: 'Won', nameVi: 'Thành công', color: '#22C55E', order: 5 },
  { id: 'lost', name: 'Lost', nameVi: 'Thất bại', color: '#6B7280', order: 6 },
  { id: 'nurturing', name: 'Nurturing', nameVi: 'Nuôi dưỡng', color: '#06B6D4', order: 7 },
] as const;

export const DEAL_STAGE_CONFIG = [
  { id: 'prospecting', name: 'Prospecting', nameVi: 'Tìm kiếm', probability: 10, order: 0 },
  { id: 'qualification', name: 'Qualification', nameVi: 'Đánh giá', probability: 20, order: 1 },
  { id: 'needs_analysis', name: 'Needs Analysis', nameVi: 'Phân tích nhu cầu', probability: 40, order: 2 },
  { id: 'value_proposition', name: 'Value Proposition', nameVi: 'Đề xuất giá trị', probability: 50, order: 3 },
  { id: 'decision_makers', name: 'Decision Makers', nameVi: 'Người quyết định', probability: 60, order: 4 },
  { id: 'proposal', name: 'Proposal', nameVi: 'Báo giá', probability: 75, order: 5 },
  { id: 'negotiation', name: 'Negotiation', nameVi: 'Thương thảo', probability: 90, order: 6 },
  { id: 'closed_won', name: 'Closed Won', nameVi: 'Thành công', probability: 100, order: 7 },
  { id: 'closed_lost', name: 'Closed Lost', nameVi: 'Thất bại', probability: 0, order: 8 },
] as const;

export const LEAD_SOURCE_CONFIG = [
  { id: 'website', name: 'Website', nameVi: 'Website', icon: 'Globe' },
  { id: 'referral', name: 'Referral', nameVi: 'Giới thiệu', icon: 'Users' },
  { id: 'social_media', name: 'Social Media', nameVi: 'Mạng xã hội', icon: 'Share2' },
  { id: 'cold_call', name: 'Cold Call', nameVi: 'Gọi điện', icon: 'Phone' },
  { id: 'exhibition', name: 'Exhibition', nameVi: 'Triển lãm', icon: 'Calendar' },
  { id: 'advertisement', name: 'Advertisement', nameVi: 'Quảng cáo', icon: 'Megaphone' },
  { id: 'partner', name: 'Partner', nameVi: 'Đối tác', icon: 'Handshake' },
  { id: 'other', name: 'Other', nameVi: 'Khác', icon: 'MoreHorizontal' },
] as const;

// =====================================================
// Lead Scoring Engine
// =====================================================

export interface LeadScoringRule {
  field: string;
  condition: 'exists' | 'equals' | 'contains' | 'gt' | 'lt' | 'corporate_email';
  value?: string | number;
  score: number;
}

export const DEFAULT_SCORING_RULES: LeadScoringRule[] = [
  { field: 'company', condition: 'exists', score: 10 },
  { field: 'phone', condition: 'exists', score: 5 },
  { field: 'email', condition: 'corporate_email', score: 15 },
  { field: 'budget', condition: 'gt', value: 100000000, score: 20 },
  { field: 'budget', condition: 'gt', value: 500000000, score: 15 },
  { field: 'source', condition: 'equals', value: 'referral', score: 25 },
  { field: 'source', condition: 'equals', value: 'website', score: 10 },
];

export function calculateLeadScore(lead: Partial<Lead>, rules: LeadScoringRule[] = DEFAULT_SCORING_RULES): number {
  let score = 0;
  
  for (const rule of rules) {
    const fieldValue = lead[rule.field as keyof Lead];
    
    switch (rule.condition) {
      case 'exists':
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          score += rule.score;
        }
        break;
        
      case 'corporate_email':
        if (typeof fieldValue === 'string') {
          const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
          const domain = fieldValue.split('@')[1]?.toLowerCase();
          if (domain && !freeEmailDomains.includes(domain)) {
            score += rule.score;
          }
        }
        break;
        
      case 'equals':
        if (fieldValue === rule.value) {
          score += rule.score;
        }
        break;
        
      case 'contains':
        if (typeof fieldValue === 'string' && typeof rule.value === 'string') {
          if (fieldValue.toLowerCase().includes(rule.value.toLowerCase())) {
            score += rule.score;
          }
        }
        break;
        
      case 'gt':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          if (fieldValue > rule.value) {
            score += rule.score;
          }
        }
        break;
        
      case 'lt':
        if (typeof fieldValue === 'number' && typeof rule.value === 'number') {
          if (fieldValue < rule.value) {
            score += rule.score;
          }
        }
        break;
    }
  }
  
  return Math.min(score, 100); // Cap at 100
}

export function getLeadRating(score: number): LeadRating {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function getRatingColor(rating: LeadRating): string {
  switch (rating) {
    case 'hot': return '#EF4444';
    case 'warm': return '#F59E0B';
    case 'cold': return '#3B82F6';
  }
}

// =====================================================
// Auto Assignment Engine
// =====================================================

export type AssignmentMethod = 'round_robin' | 'load_balanced' | 'territory' | 'skill_based';

export interface AssignmentConfig {
  method: AssignmentMethod;
  enabled: boolean;
  salesReps: string[];
  territories?: Record<string, string[]>; // territory -> salesRep IDs
  skills?: Record<string, string[]>; // skill -> salesRep IDs
}

let roundRobinIndex = 0;

export function getNextAssignee(
  config: AssignmentConfig,
  lead?: Partial<Lead>,
  currentLoads?: Record<string, number>
): string | null {
  if (!config.enabled || config.salesReps.length === 0) {
    return null;
  }
  
  switch (config.method) {
    case 'round_robin':
      const assignee = config.salesReps[roundRobinIndex % config.salesReps.length];
      roundRobinIndex++;
      return assignee;
      
    case 'load_balanced':
      if (!currentLoads) return config.salesReps[0];
      
      let minLoad = Infinity;
      let minLoadRep = config.salesReps[0];
      
      for (const rep of config.salesReps) {
        const load = currentLoads[rep] || 0;
        if (load < minLoad) {
          minLoad = load;
          minLoadRep = rep;
        }
      }
      return minLoadRep;
      
    case 'territory':
      if (!config.territories || !lead?.city) return null;
      
      for (const [territory, reps] of Object.entries(config.territories)) {
        if (lead.city.toLowerCase().includes(territory.toLowerCase())) {
          return reps[0] || null;
        }
      }
      return null;
      
    case 'skill_based':
      // Would need more context to implement properly
      return config.salesReps[0];
      
    default:
      return null;
  }
}

export default CRM_MODULE;

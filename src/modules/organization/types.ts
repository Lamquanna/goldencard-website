// ============================================================================
// ORGANIZATION/COMPANY SETTINGS MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Organization Management Types
// ============================================================================

// ============================================================================
// BASE TYPES & ENUMS
// ============================================================================

/** Organization status */
export enum OrganizationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
}

/** Department status */
export enum DepartmentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/** Subscription tier */
export enum SubscriptionTier {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

/** Currency codes */
export type CurrencyCode = 'VND' | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'KRW';

/** Timezone options */
export type TimezoneOption =
  | 'Asia/Ho_Chi_Minh'
  | 'Asia/Bangkok'
  | 'Asia/Singapore'
  | 'Asia/Tokyo'
  | 'Asia/Seoul'
  | 'Asia/Shanghai'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'Europe/London'
  | 'Europe/Paris'
  | 'UTC';

/** Date format options */
export type DateFormatOption = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'DD-MM-YYYY';

/** Time format options */
export type TimeFormatOption = '24h' | '12h';

/** Number format options */
export interface NumberFormat {
  decimalSeparator: '.' | ',';
  thousandSeparator: '.' | ',' | ' ';
  decimalPlaces: number;
}

// ============================================================================
// ORGANIZATION TYPES
// ============================================================================

/** Organization (Company) */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  email: string;
  phone?: string;
  website?: string;
  taxId?: string;
  businessLicense?: string;
  status: OrganizationStatus;
  subscriptionTier: SubscriptionTier;
  settings: OrganizationSettings;
  billingInfo?: BillingInfo;
  storageQuota: StorageQuota;
  createdAt: string;
  updatedAt: string;
}

/** Organization settings */
export interface OrganizationSettings {
  // Localization
  timezone: TimezoneOption;
  locale: string;
  currency: CurrencyCode;
  dateFormat: DateFormatOption;
  timeFormat: TimeFormatOption;
  numberFormat: NumberFormat;
  firstDayOfWeek: 0 | 1 | 6; // 0: Sunday, 1: Monday, 6: Saturday

  // Business settings
  fiscalYearStart: number; // Month (1-12)
  workingDays: number[]; // 0-6 (Sunday-Saturday)
  workingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };

  // Branding
  branding: BrandingSettings;

  // Security
  security: SecuritySettings;

  // Notifications
  notifications: NotificationSettings;

  // Integrations
  integrations: IntegrationSettings;
}

/** Branding settings */
export interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
  customCss?: string;
}

/** Security settings */
export interface SecuritySettings {
  // Password policy
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  passwordExpirationDays: number;
  passwordHistoryCount: number;

  // Session
  sessionTimeoutMinutes: number;
  maxConcurrentSessions: number;
  enforceIpWhitelist: boolean;
  ipWhitelist: string[];

  // Two-factor authentication
  require2FA: boolean;
  allowed2FAMethods: ('totp' | 'sms' | 'email')[];

  // Login
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

/** Notification settings */
export interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
  digestTime: string; // HH:mm
}

/** Integration settings */
export interface IntegrationSettings {
  enabledProviders: string[];
  webhookUrl?: string;
  slackWebhookUrl?: string;
  teamsWebhookUrl?: string;
}

/** Billing information */
export interface BillingInfo {
  companyName: string;
  address: Address;
  taxId: string;
  email: string;
  phone?: string;
  paymentMethod?: PaymentMethod;
}

/** Address */
export interface Address {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

/** Payment method */
export interface PaymentMethod {
  type: 'credit_card' | 'bank_transfer' | 'invoice';
  details?: Record<string, string>;
  lastFour?: string;
  expiryDate?: string;
}

/** Storage quota */
export interface StorageQuota {
  totalBytes: number;
  usedBytes: number;
  documentBytes: number;
  imageBytes: number;
  videoBytes: number;
  otherBytes: number;
  quotaWarningThreshold: number; // percentage (0-100)
}

// ============================================================================
// DEPARTMENT TYPES
// ============================================================================

/** Department */
export interface Department {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  status: DepartmentStatus;
  order: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Department with children (tree structure) */
export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
  depth: number;
  path: string[]; // Array of parent IDs
}

/** Department member */
export interface DepartmentMember {
  departmentId: string;
  userId: string;
  role: 'manager' | 'member';
  isPrimary: boolean;
  assignedAt: string;
}

// ============================================================================
// HIERARCHY & APPROVAL TYPES
// ============================================================================

/** Position/Job title */
export interface Position {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  level: number; // Hierarchy level (1 = highest)
  departmentId?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

/** Organizational hierarchy node */
export interface HierarchyNode {
  userId: string;
  positionId: string;
  departmentId: string;
  reportsTo?: string; // userId of manager
  level: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

/** Approval chain */
export interface ApprovalChain {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  workflowType: string;
  levels: ApprovalLevel[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Approval level */
export interface ApprovalLevel {
  level: number;
  name: string;
  approverType: 'user' | 'role' | 'department_head' | 'manager';
  approverId?: string; // userId or roleId depending on type
  canSkip: boolean;
  timeoutHours?: number;
  escalateTo?: string; // userId to escalate if timeout
}

// ============================================================================
// WORKFLOW MAPPING TYPES
// ============================================================================

/** Workflow trigger */
export interface WorkflowTrigger {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  eventType: string; // e.g., 'leave_request', 'expense_claim', 'purchase_order'
  conditions: WorkflowCondition[];
  workflowId: string;
  approvalChainId?: string;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Workflow condition */
export interface WorkflowCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: unknown;
}

// ============================================================================
// AUDIT & COMPLIANCE TYPES
// ============================================================================

/** Organization audit log entry */
export interface OrganizationAuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/** Compliance requirement */
export interface ComplianceRequirement {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  category: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigneeId?: string;
  evidence?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DTO TYPES
// ============================================================================

/** Create organization DTO */
export interface CreateOrganizationDto {
  name: string;
  email: string;
  phone?: string;
  description?: string;
  timezone?: TimezoneOption;
  currency?: CurrencyCode;
}

/** Update organization DTO */
export interface UpdateOrganizationDto {
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  logo?: string;
}

/** Update organization settings DTO */
export interface UpdateOrganizationSettingsDto {
  timezone?: TimezoneOption;
  locale?: string;
  currency?: CurrencyCode;
  dateFormat?: DateFormatOption;
  timeFormat?: TimeFormatOption;
  numberFormat?: Partial<NumberFormat>;
  firstDayOfWeek?: 0 | 1 | 6;
  fiscalYearStart?: number;
  workingDays?: number[];
  workingHours?: { start: string; end: string };
}

/** Create department DTO */
export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  managerId?: string;
}

/** Update department DTO */
export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  status?: DepartmentStatus;
  order?: number;
}

/** Create position DTO */
export interface CreatePositionDto {
  name: string;
  code: string;
  level: number;
  departmentId?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
}

/** Update position DTO */
export interface UpdatePositionDto {
  name?: string;
  code?: string;
  level?: number;
  departmentId?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
}

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/** Department filter */
export interface DepartmentFilter {
  status?: DepartmentStatus;
  parentId?: string;
  managerId?: string;
  search?: string;
}

/** Position filter */
export interface PositionFilter {
  departmentId?: string;
  level?: number;
  search?: string;
}

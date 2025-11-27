// =====================================================
// GOLDEN ENERGY CRM - TYPE DEFINITIONS
// =====================================================

// =====================================================
// COMMON TYPES
// =====================================================
export type UUID = string;

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: Pagination;
}

export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

export type Status = 'active' | 'inactive' | 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';

// =====================================================
// USER & AUTH TYPES
// =====================================================
export interface User {
  id: UUID;
  username: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'manager' | 'sales' | 'engineer' | 'warehouse' | 'hr' | 'user';
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// LEAD TYPES
// =====================================================
export interface LeadSource {
  id: UUID;
  code: string;
  name: string;
  icon: string;
  color: string;
  category: 'online' | 'offline' | 'referral' | 'partner';
  isActive: boolean;
}

export interface LeadStage {
  id: UUID;
  code: string;
  name: string;
  color: string;
  sortOrder: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
}

export interface Lead {
  id: UUID;
  leadNumber: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  whatsapp?: string;
  zalo?: string;
  companyName?: string;
  companySize?: string;
  industry?: string;
  jobTitle?: string;
  website?: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  sourceId?: UUID;
  source?: LeadSource;
  sourceDetail?: string;
  stageId?: UUID;
  stage?: LeadStage;
  productInterest: string[];
  projectType?: 'solar' | 'wind' | 'epc' | 'hybrid';
  estimatedCapacity?: number;
  estimatedValue?: number;
  currency: string;
  leadScore: number;
  scoreBreakdown?: Record<string, number>;
  temperature: 'cold' | 'warm' | 'hot';
  assignedTo?: UUID;
  assignee?: User;
  assignedAt?: Date;
  lastContactedAt?: Date;
  lastActivityAt?: Date;
  nextFollowUp?: Date;
  totalActivities: number;
  totalEmails: number;
  totalCalls: number;
  totalMeetings: number;
  convertedAt?: Date;
  convertedToProjectId?: UUID;
  lostReason?: string;
  lostToCompetitor?: string;
  tags: string[];
  customFields?: Record<string, unknown>;
  status: 'active' | 'inactive' | 'converted' | 'lost' | 'duplicate';
  doNotContact: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  description?: string;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadActivity {
  id: UUID;
  leadId: UUID;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'stage_change' | 'sms' | 'whatsapp';
  subtype?: 'inbound' | 'outbound' | 'scheduled';
  subject?: string;
  description?: string;
  callDuration?: number;
  callOutcome?: 'connected' | 'voicemail' | 'no_answer' | 'busy';
  callRecordingUrl?: string;
  emailSubject?: string;
  emailOpened?: boolean;
  emailClicked?: boolean;
  emailReplied?: boolean;
  meetingLocation?: string;
  meetingStart?: Date;
  meetingEnd?: Date;
  meetingType?: 'in_person' | 'video' | 'phone';
  attendees?: string[];
  fromStageId?: UUID;
  toStageId?: UUID;
  outcome?: string;
  nextSteps?: string;
  attachments?: Attachment[];
  createdBy?: UUID;
  creator?: User;
  createdAt: Date;
}

export interface LeadImport {
  id: UUID;
  fileName: string;
  fileUrl?: string;
  fileType: 'csv' | 'xlsx' | 'json';
  fieldMapping: Record<string, string>;
  duplicateHandling: 'skip' | 'update' | 'create_new';
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  duplicateCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  errors?: { row: number; message: string }[];
  createdBy?: UUID;
  createdAt: Date;
  completedAt?: Date;
}

// =====================================================
// PROJECT TYPES
// =====================================================
export interface ProjectCategory {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProjectPhase {
  id: UUID;
  categoryId?: UUID;
  code: string;
  name: string;
  description?: string;
  sortOrder: number;
  defaultDays: number;
  isMilestone: boolean;
}

export interface Project {
  id: UUID;
  projectNumber: string;
  name: string;
  description?: string;
  categoryId?: UUID;
  category?: ProjectCategory;
  currentPhaseId?: UUID;
  currentPhase?: ProjectPhase;
  leadId?: UUID;
  customerId?: UUID;
  systemCapacityKw?: number;
  annualProductionKwh?: number;
  co2ReductionTons?: number;
  budget?: number;
  actualCost?: number;
  profitMargin?: number;
  currency: string;
  plannedStart?: Date;
  plannedEnd?: Date;
  actualStart?: Date;
  actualEnd?: Date;
  progressPercent: number;
  healthStatus: 'on_track' | 'at_risk' | 'delayed' | 'on_hold';
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  siteAddress?: string;
  siteCity?: string;
  siteProvince?: string;
  siteCountry: string;
  siteLatitude?: number;
  siteLongitude?: number;
  projectManagerId?: UUID;
  projectManager?: User;
  teamMembers?: UUID[];
  attachments?: Attachment[];
  coverImage?: string;
  customFields?: Record<string, unknown>;
  tags: string[];
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMilestone {
  id: UUID;
  projectId: UUID;
  phaseId?: UUID;
  name: string;
  description?: string;
  plannedDate: Date;
  actualDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  dependsOnId?: UUID;
  deliverables?: string[];
  completedBy?: UUID;
  completionNotes?: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectRisk {
  id: UUID;
  projectId: UUID;
  riskNumber?: string;
  title: string;
  description?: string;
  category: 'technical' | 'financial' | 'schedule' | 'resource' | 'external';
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number;
  mitigationStrategy?: string;
  contingencyPlan?: string;
  riskOwnerId?: UUID;
  riskOwner?: User;
  status: 'open' | 'mitigating' | 'monitoring' | 'occurred' | 'closed';
  occurredAt?: Date;
  actualImpact?: string;
  lessonsLearned?: string;
  identifiedBy?: UUID;
  identifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// TASK TYPES
// =====================================================
export interface Task {
  id: UUID;
  taskNumber?: string;
  title: string;
  description?: string;
  projectId?: UUID;
  project?: Project;
  milestoneId?: UUID;
  milestone?: ProjectMilestone;
  parentTaskId?: UUID;
  parentTask?: Task;
  subtasks?: Task[];
  assignedTo?: UUID;
  assignee?: User;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'in_review' | 'completed' | 'blocked' | 'cancelled';
  dueDate?: Date;
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  progressPercent: number;
  dependencies?: UUID[];
  blockers?: { id: UUID; description: string }[];
  slaId?: UUID;
  slaDueAt?: Date;
  slaStatus: 'none' | 'pending' | 'at_risk' | 'breached' | 'met';
  checklist?: { id: string; text: string; completed: boolean }[];
  tags: string[];
  customFields?: Record<string, unknown>;
  watchers?: UUID[];
  collaborators?: UUID[];
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskComment {
  id: UUID;
  taskId: UUID;
  parentId?: UUID;
  content: string;
  mentions?: UUID[];
  attachments?: Attachment[];
  reactions?: Record<string, UUID[]>;
  isEdited: boolean;
  editedAt?: Date;
  createdBy: UUID;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
  replies?: TaskComment[];
}

export interface TaskTimeEntry {
  id: UUID;
  taskId: UUID;
  userId: UUID;
  user?: User;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  description?: string;
  isBillable: boolean;
  hourlyRate?: number;
  createdAt: Date;
}

// =====================================================
// INVENTORY TYPES
// =====================================================
export interface ItemCategory {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  parentId?: UUID;
  parent?: ItemCategory;
  children?: ItemCategory[];
  sortOrder: number;
}

export interface Supplier {
  id: UUID;
  code: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  taxId?: string;
  paymentTerms: number;
  rating: number;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: UUID;
  code: string;
  name: string;
  type: 'warehouse' | 'office' | 'site' | 'virtual';
  address?: string;
  city?: string;
  province?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  managerId?: UUID;
  manager?: User;
  capacitySqm?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: UUID;
  code: string;
  barcode?: string;
  qrCode?: string;
  name: string;
  description?: string;
  categoryId?: UUID;
  category?: ItemCategory;
  brand?: string;
  model?: string;
  specifications?: Record<string, unknown>;
  unit: string;
  unitPrice: number;
  currency: string;
  openingStock: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStockAlert: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQty: number;
  trackSerial: boolean;
  trackLotBatch: boolean;
  defaultSupplierId?: UUID;
  defaultSupplier?: Supplier;
  defaultWarehouseId?: UUID;
  defaultWarehouse?: Warehouse;
  status: 'active' | 'inactive' | 'discontinued';
  imageUrl?: string;
  attachments?: Attachment[];
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
  // Computed
  stockStatus?: 'normal' | 'low' | 'critical' | 'out_of_stock';
  stockValue?: number;
}

export interface ItemLot {
  id: UUID;
  itemId: UUID;
  item?: InventoryItem;
  lotNumber: string;
  batchNumber?: string;
  warehouseId?: UUID;
  warehouse?: Warehouse;
  quantity: number;
  reservedQty: number;
  manufactureDate?: Date;
  expiryDate?: Date;
  receivedDate: Date;
  unitCost: number;
  status: 'available' | 'reserved' | 'quarantine' | 'expired';
  createdAt: Date;
}

export interface StockIn {
  id: UUID;
  referenceNo: string;
  type: 'purchase' | 'return' | 'transfer_in' | 'adjustment' | 'initial';
  supplierId?: UUID;
  supplier?: Supplier;
  sourceWarehouseId?: UUID;
  warehouseId: UUID;
  warehouse?: Warehouse;
  receiptDate: Date;
  poNumber?: string;
  invoiceNumber?: string;
  deliveryNote?: string;
  totalItems: number;
  totalQty: number;
  totalValue: number;
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled';
  notes?: string;
  attachments?: Attachment[];
  items?: StockInItem[];
  createdBy: UUID;
  creator?: User;
  approvedBy?: UUID;
  approvedAt?: Date;
  completedBy?: UUID;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockInItem {
  id: UUID;
  stockInId: UUID;
  itemId: UUID;
  item?: InventoryItem;
  lotNumber?: string;
  batchNumber?: string;
  qtyOrdered: number;
  qtyReceived: number;
  qtyRejected: number;
  unitCost: number;
  totalCost: number;
  qualityStatus: 'pending' | 'passed' | 'failed' | 'partial';
  qualityNotes?: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
}

export interface StockOut {
  id: UUID;
  referenceNo: string;
  type: 'issue' | 'transfer_out' | 'disposal' | 'adjustment' | 'return_supplier';
  warehouseId: UUID;
  warehouse?: Warehouse;
  receiverId?: UUID;
  receiver?: Receiver;
  projectId?: UUID;
  project?: Project;
  destWarehouseId?: UUID;
  issueDate: Date;
  requiredDate?: Date;
  requestedBy?: UUID;
  requestNotes?: string;
  totalItems: number;
  totalQty: number;
  totalValue: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  approvalLevel: number;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
  rejectionReason?: string;
  attachments?: Attachment[];
  items?: StockOutItem[];
  approvals?: StockApproval[];
  createdBy: UUID;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockOutItem {
  id: UUID;
  stockOutId: UUID;
  itemId: UUID;
  item?: InventoryItem;
  lotId?: UUID;
  lot?: ItemLot;
  qtyRequested: number;
  qtyApproved: number;
  qtyIssued: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
  createdAt: Date;
}

export interface StockApproval {
  id: UUID;
  stockOutId: UUID;
  approvalLevel: number;
  approverId: UUID;
  approver?: User;
  approverRole?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  decisionAt?: Date;
  comments?: string;
  minValue?: number;
  maxValue?: number;
  createdAt: Date;
}

export interface StockHistory {
  id: UUID;
  itemId: UUID;
  item?: InventoryItem;
  warehouseId?: UUID;
  warehouse?: Warehouse;
  lotId?: UUID;
  movementType: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST' | 'RESERVE' | 'UNRESERVE';
  referenceType?: string;
  referenceId?: UUID;
  referenceNo?: string;
  qtyBefore: number;
  qtyChange: number;
  qtyAfter: number;
  unitCost?: number;
  totalCost?: number;
  projectId?: UUID;
  supplierId?: UUID;
  notes?: string;
  createdBy?: UUID;
  creator?: User;
  createdAt: Date;
}

export interface Receiver {
  id: UUID;
  type: 'project' | 'department' | 'employee' | 'external';
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  projectId?: UUID;
  department?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

// =====================================================
// HR & ATTENDANCE TYPES
// =====================================================
export interface Department {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  parentId?: UUID;
  parent?: Department;
  managerId?: UUID;
  manager?: User;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: UUID;
  userId?: UUID;
  user?: User;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  nationalId?: string;
  taxId?: string;
  personalEmail?: string;
  workEmail?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  departmentId?: UUID;
  department?: Department;
  position?: string;
  jobTitle?: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance';
  hireDate?: Date;
  probationEndDate?: Date;
  terminationDate?: Date;
  managerId?: UUID;
  manager?: Employee;
  workScheduleId?: UUID;
  defaultWarehouseId?: UUID;
  baseSalary?: number;
  salaryCurrency: string;
  annualLeaveBalance: number;
  sickLeaveBalance: number;
  status: 'active' | 'on_leave' | 'suspended' | 'terminated';
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  id: UUID;
  name: string;
  code: string;
  description?: string;
  schedule: {
    day: string;
    start: string | null;
    end: string | null;
    break: number;
  }[];
  hoursPerDay: number;
  hoursPerWeek: number;
  overtimeAfterHours: number;
  weekendMultiplier: number;
  holidayMultiplier: number;
  nightMultiplier: number;
  status: 'active' | 'inactive';
  createdAt: Date;
}

export interface Attendance {
  id: UUID;
  employeeId: UUID;
  employee?: Employee;
  attendanceDate: Date;
  punchIn?: Date;
  punchOut?: Date;
  workHours: number;
  breakHours: number;
  overtimeHours: number;
  nightHours: number;
  punchInLocation?: GeoLocation;
  punchOutLocation?: GeoLocation;
  punchInDevice?: string;
  punchOutDevice?: string;
  punchInPhotoUrl?: string;
  punchOutPhotoUrl?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'on_leave' | 'holiday' | 'weekend';
  projectId?: UUID;
  siteLocation?: string;
  notes?: string;
  adjustedBy?: UUID;
  adjustmentReason?: string;
  otStatus: 'none' | 'pending' | 'approved' | 'rejected';
  otApprovedBy?: UUID;
  otApprovedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
  accuracy?: number;
}

export interface OvertimeRequest {
  id: UUID;
  employeeId: UUID;
  employee?: Employee;
  requestDate: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  otType: 'regular' | 'weekend' | 'holiday' | 'night';
  multiplier: number;
  reason: string;
  projectId?: UUID;
  project?: Project;
  taskId?: UUID;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: UUID;
  approver?: User;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveType {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  defaultDays: number;
  isPaid: boolean;
  requiresApproval: boolean;
  color: string;
}

export interface LeaveRequest {
  id: UUID;
  employeeId: UUID;
  employee?: Employee;
  leaveTypeId: UUID;
  leaveType?: LeaveType;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType?: 'first' | 'second';
  reason?: string;
  emergencyContact?: string;
  attachments?: Attachment[];
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy?: UUID;
  approver?: User;
  approvedAt?: Date;
  rejectionReason?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holiday {
  id: UUID;
  name: string;
  date: Date;
  year: number;
  isRecurring: boolean;
  isHalfDay: boolean;
  description?: string;
  country: string;
}

export interface Timesheet {
  id: UUID;
  employeeId: UUID;
  employee?: Employee;
  periodType: 'weekly' | 'biweekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalNightHours: number;
  totalLeaveHours: number;
  daysPresent: number;
  daysAbsent: number;
  daysLate: number;
  daysLeave: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked';
  submittedAt?: Date;
  approvedBy?: UUID;
  approvedAt?: Date;
  employeeNotes?: string;
  managerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// AUTOMATION TYPES
// =====================================================
export interface AutomationTrigger {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  entityType: string;
  eventType: string;
  configSchema?: Record<string, unknown>;
  isActive: boolean;
}

export interface AutomationAction {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  category: 'notification' | 'assignment' | 'update' | 'approval' | 'integration' | 'control';
  configSchema?: Record<string, unknown>;
  handlerFunction?: string;
  isActive: boolean;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'in';
  value?: string | number;
  values?: (string | number)[];
}

export interface AutomationRule {
  id: UUID;
  name: string;
  description?: string;
  triggerId: UUID;
  trigger?: AutomationTrigger;
  triggerConfig?: Record<string, unknown>;
  conditions: AutomationCondition[];
  conditionLogic: 'AND' | 'OR';
  actions: {
    actionId: UUID;
    order: number;
    config: Record<string, unknown>;
  }[];
  scheduleCron?: string;
  scheduleTimezone: string;
  runOncePerRecord: boolean;
  delaySeconds: number;
  priority: number;
  stopOnFirstMatch: boolean;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: Date;
  errorCount: number;
  lastError?: string;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationExecution {
  id: UUID;
  ruleId: UUID;
  rule?: AutomationRule;
  triggerEntityType: string;
  triggerEntityId: UUID;
  triggerEventData?: Record<string, unknown>;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  actionsExecuted: number;
  actionsFailed: number;
  actionResults?: {
    action: string;
    status: 'success' | 'failed';
    result?: Record<string, unknown>;
    error?: string;
  }[];
  errorMessage?: string;
  errorStack?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
}

export interface ApprovalWorkflow {
  id: UUID;
  name: string;
  description?: string;
  entityType: string;
  levels: {
    level: number;
    name: string;
    approverType: 'manager' | 'role' | 'specific_user' | 'any_of_group';
    approverValue?: string;
    thresholdField?: string;
    thresholdMin?: number;
    thresholdMax?: number;
    autoApproveConditions?: AutomationCondition[];
    escalationHours?: number;
  }[];
  allowParallel: boolean;
  requireAllLevels: boolean;
  notifyOnSubmit: boolean;
  notifyOnApprove: boolean;
  notifyOnReject: boolean;
  notifyOnEscalate: boolean;
  isActive: boolean;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlaDefinition {
  id: UUID;
  name: string;
  description?: string;
  entityType: string;
  conditions: AutomationCondition[];
  responseTimeHours?: number;
  resolutionTimeHours?: number;
  warningThresholdPercent: number;
  useBusinessHours: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  includeWeekends: boolean;
  excludeHolidays: boolean;
  escalationActions?: {
    atPercent: number;
    action: 'notify' | 'escalate';
    target: string;
  }[];
  priority: number;
  isActive: boolean;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// =====================================================
// ANALYTICS TYPES
// =====================================================
export interface AnalyticsDashboard {
  id: UUID;
  name: string;
  description?: string;
  userId?: UUID;
  isDefault: boolean;
  isShared: boolean;
  layout: {
    widgetId: UUID;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
  refreshIntervalSeconds: number;
  dateRangePreset: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsWidget {
  id: UUID;
  name: string;
  description?: string;
  type: 'number' | 'chart' | 'table' | 'gauge' | 'map' | 'funnel';
  chartType?: 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter';
  dataSource: string;
  metrics: { field: string; alias: string }[];
  dimensions?: { field: string; alias: string }[];
  filters?: AutomationCondition[];
  displayConfig?: {
    title?: string;
    colors?: string[];
    showLegend?: boolean;
    showValues?: boolean;
    format?: 'currency' | 'number' | 'percent';
  };
  enableComparison: boolean;
  comparisonType?: 'previous_period' | 'same_period_last_year';
  drillDownConfig?: Record<string, unknown>;
  alertRules?: Record<string, unknown>[];
  isActive: boolean;
  isTemplate: boolean;
  createdBy?: UUID;
  createdAt: Date;
  updatedAt: Date;
}

export interface KpiDefinition {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  category: 'sales' | 'projects' | 'inventory' | 'hr' | 'finance';
  formula: string;
  dataSource: string;
  targetType: 'higher_better' | 'lower_better' | 'target_value';
  defaultTarget?: number;
  format: 'number' | 'currency' | 'percent' | 'duration';
  decimalPlaces: number;
  unit?: string;
  calculationFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

export interface KpiActual {
  id: UUID;
  kpiId: UUID;
  kpi?: KpiDefinition;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  periodStart: Date;
  periodEnd: Date;
  actualValue: number;
  targetValue?: number;
  previousValue?: number;
  achievementPercent?: number;
  trendDirection?: 'up' | 'down' | 'flat';
  trendPercent?: number;
  departmentId?: UUID;
  userId?: UUID;
  projectId?: UUID;
  notes?: string;
  createdAt: Date;
}

export interface FunnelSnapshot {
  id: UUID;
  snapshotDate: Date;
  funnelType: string;
  stages: {
    stage: string;
    count: number;
    value: number;
  }[];
  totalLeads: number;
  totalValue: number;
  conversionRate: number;
  avgDealSize: number;
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  filters?: Record<string, unknown>;
  createdAt: Date;
}

// =====================================================
// COMMON TYPES
// =====================================================
export interface Attachment {
  id?: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedBy?: UUID;
  uploadedAt?: Date;
}

export interface NotificationTemplate {
  id: UUID;
  code: string;
  name: string;
  description?: string;
  channel: 'email' | 'sms' | 'push' | 'chat' | 'slack' | 'teams';
  subject?: string;
  body: string;
  availableVariables?: string[];
  locale: string;
  isActive: boolean;
}

// =====================================================
// REQUEST/RESPONSE TYPES
// =====================================================
export interface LeadFilters {
  search?: string;
  status?: string[];
  stageId?: UUID[];
  sourceId?: UUID[];
  assignedTo?: UUID[];
  temperature?: string[];
  city?: string;
  province?: string;
  dateRange?: DateRange;
  leadScoreMin?: number;
  leadScoreMax?: number;
  tags?: string[];
}

export interface ProjectFilters {
  search?: string;
  status?: string[];
  categoryId?: UUID[];
  phaseId?: UUID[];
  projectManagerId?: UUID[];
  healthStatus?: string[];
  city?: string;
  province?: string;
  dateRange?: DateRange;
  tags?: string[];
}

export interface InventoryFilters {
  search?: string;
  categoryId?: UUID[];
  warehouseId?: UUID[];
  supplierId?: UUID[];
  stockStatus?: string[];
  status?: string[];
}

export interface AttendanceFilters {
  employeeId?: UUID[];
  departmentId?: UUID[];
  status?: string[];
  dateRange?: DateRange;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

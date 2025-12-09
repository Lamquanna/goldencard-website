// ============================================================================
// HRM MODULE - TYPE DEFINITIONS
// GoldenEnergy HOME Enterprise Platform
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED' | 'SUSPENDED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'FREELANCE';

export type LeaveType = 
  | 'ANNUAL' 
  | 'SICK' 
  | 'MATERNITY' 
  | 'PATERNITY' 
  | 'BEREAVEMENT' 
  | 'UNPAID' 
  | 'PERSONAL'
  | 'WORK_FROM_HOME';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE' | 'HALF_DAY' | 'ON_LEAVE' | 'HOLIDAY' | 'WEEKEND';

export type PayrollStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';

// ============================================================================
// EMPLOYEE TYPES
// ============================================================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  managerId?: string;
  manager?: Pick<Employee, 'id' | 'name' | 'avatar'>;
  parentId?: string;
  parent?: Department;
  children?: Department[];
  employeeCount: number;
  budget?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  department?: Department;
  level: number; // 1: Entry, 2: Junior, 3: Mid, 4: Senior, 5: Lead, 6: Manager, 7: Director, 8: C-Level
  minSalary?: number;
  maxSalary?: number;
  requirements?: string[];
  responsibilities?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  branch?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  
  // Personal Info
  dateOfBirth?: Date;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationalId?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  
  // Employment Info
  departmentId: string;
  department?: Department;
  positionId: string;
  position?: Position;
  managerId?: string;
  manager?: Pick<Employee, 'id' | 'name' | 'avatar' | 'email'>;
  directReports?: Pick<Employee, 'id' | 'name' | 'avatar'>[];
  
  status: EmployeeStatus;
  employmentType: EmploymentType;
  hireDate: Date;
  probationEndDate?: Date;
  terminationDate?: Date;
  
  // Compensation
  baseSalary?: number;
  currency?: string;
  bankInfo?: BankInfo;
  
  // Additional Info
  emergencyContact?: EmergencyContact;
  skills?: string[];
  certifications?: string[];
  notes?: string;
  
  // Leave Balance
  leaveBalance?: LeaveBalance;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  employeeId: string;
  year: number;
  annualTotal: number;
  annualUsed: number;
  annualRemaining: number;
  sickTotal: number;
  sickUsed: number;
  sickRemaining: number;
  personalTotal: number;
  personalUsed: number;
  personalRemaining: number;
  unpaidUsed: number;
}

// ============================================================================
// LEAVE REQUEST TYPES
// ============================================================================

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employee?: Pick<Employee, 'id' | 'name' | 'avatar' | 'email' | 'department' | 'position'>;
  
  type: LeaveType;
  status: LeaveStatus;
  
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayType?: 'MORNING' | 'AFTERNOON';
  
  reason: string;
  attachments?: string[];
  
  approverId?: string;
  approver?: Pick<Employee, 'id' | 'name' | 'avatar'>;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ATTENDANCE TYPES
// ============================================================================

export interface Attendance {
  id: string;
  employeeId: string;
  employee?: Pick<Employee, 'id' | 'name' | 'avatar' | 'department' | 'position'>;
  
  date: Date;
  status: AttendanceStatus;
  
  checkIn?: Date;
  checkOut?: Date;
  
  scheduledStart: Date;
  scheduledEnd: Date;
  
  breakDuration?: number; // in minutes
  overtimeMinutes?: number;
  lateMinutes?: number;
  earlyLeaveMinutes?: number;
  
  workingHours?: number;
  location?: string;
  ipAddress?: string;
  deviceInfo?: string;
  
  notes?: string;
  approvedOvertime?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceSummary {
  employeeId: string;
  employee?: Pick<Employee, 'id' | 'name' | 'avatar'>;
  month: number;
  year: number;
  
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  halfDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  
  totalWorkingHours: number;
  overtimeHours: number;
  lateMinutesTotal: number;
  earlyLeaveMinutesTotal: number;
  
  attendanceRate: number; // percentage
}

// ============================================================================
// PAYROLL TYPES
// ============================================================================

export interface PayrollItem {
  description: string;
  amount: number;
  type: 'EARNING' | 'DEDUCTION' | 'TAX' | 'BONUS';
  category?: string;
}

export interface Payroll {
  id: string;
  employeeId: string;
  employee?: Pick<Employee, 'id' | 'name' | 'avatar' | 'email' | 'department' | 'position' | 'bankInfo'>;
  
  month: number;
  year: number;
  periodStart: Date;
  periodEnd: Date;
  
  status: PayrollStatus;
  
  // Earnings
  baseSalary: number;
  overtimePay: number;
  allowances: number;
  bonus: number;
  commission: number;
  totalEarnings: number;
  
  // Deductions
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  personalIncomeTax: number;
  otherDeductions: number;
  totalDeductions: number;
  
  // Net Pay
  netSalary: number;
  
  // Details
  items: PayrollItem[];
  workingDays: number;
  actualWorkingDays: number;
  overtimeHours: number;
  
  notes?: string;
  
  approvedBy?: string;
  approvedAt?: Date;
  paidAt?: Date;
  paymentMethod?: string;
  transactionRef?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORGANIZATION CHART TYPES
// ============================================================================

export interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar?: string;
  email?: string;
  children: OrgChartNode[];
  isExpanded?: boolean;
}

// ============================================================================
// FILTER & FORM TYPES
// ============================================================================

export interface EmployeeFilters {
  search?: string;
  departmentId?: string;
  positionId?: string;
  status?: EmployeeStatus;
  employmentType?: EmploymentType;
  managerId?: string;
}

export interface LeaveFilters {
  search?: string;
  employeeId?: string;
  type?: LeaveType;
  status?: LeaveStatus;
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
}

export interface AttendanceFilters {
  employeeId?: string;
  departmentId?: string;
  status?: AttendanceStatus;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
}

export interface PayrollFilters {
  employeeId?: string;
  departmentId?: string;
  status?: PayrollStatus;
  month?: number;
  year?: number;
}

export interface EmployeeFormData {
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  nationalId?: string;
  taxId?: string;
  address?: string;
  city?: string;
  country?: string;
  departmentId: string;
  positionId: string;
  managerId?: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  hireDate: Date;
  probationEndDate?: Date;
  baseSalary?: number;
  currency?: string;
  bankInfo?: BankInfo;
  emergencyContact?: EmergencyContact;
  skills?: string[];
}

export interface LeaveRequestFormData {
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  isHalfDay: boolean;
  halfDayType?: 'MORNING' | 'AFTERNOON';
  reason: string;
  attachments?: File[];
}

// ============================================================================
// CONFIG TYPES
// ============================================================================

export const EMPLOYEE_STATUS_CONFIG: Record<EmployeeStatus, { label: string; color: string; bgColor: string }> = {
  ACTIVE: { label: 'Đang làm việc', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  ON_LEAVE: { label: 'Đang nghỉ phép', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  PROBATION: { label: 'Thử việc', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  TERMINATED: { label: 'Đã nghỉ việc', color: 'text-zinc-500', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
  SUSPENDED: { label: 'Tạm ngừng', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
};

export const EMPLOYMENT_TYPE_CONFIG: Record<EmploymentType, { label: string; color: string }> = {
  FULL_TIME: { label: 'Toàn thời gian', color: 'text-emerald-600' },
  PART_TIME: { label: 'Bán thời gian', color: 'text-blue-600' },
  CONTRACT: { label: 'Hợp đồng', color: 'text-purple-600' },
  INTERN: { label: 'Thực tập', color: 'text-amber-600' },
  FREELANCE: { label: 'Freelance', color: 'text-pink-600' },
};

export const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; color: string; icon: string }> = {
  ANNUAL: { label: 'Nghỉ phép năm', color: 'text-blue-600', icon: '🏖️' },
  SICK: { label: 'Nghỉ ốm', color: 'text-red-600', icon: '🏥' },
  MATERNITY: { label: 'Thai sản', color: 'text-pink-600', icon: '👶' },
  PATERNITY: { label: 'Nghỉ phép cha', color: 'text-blue-600', icon: '👨‍👧' },
  BEREAVEMENT: { label: 'Tang lễ', color: 'text-zinc-600', icon: '🕯️' },
  UNPAID: { label: 'Nghỉ không lương', color: 'text-amber-600', icon: '📋' },
  PERSONAL: { label: 'Việc riêng', color: 'text-purple-600', icon: '👤' },
  WORK_FROM_HOME: { label: 'Làm việc từ xa', color: 'text-emerald-600', icon: '🏠' },
};

export const LEAVE_STATUS_CONFIG: Record<LeaveStatus, { label: string; color: string; bgColor: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  APPROVED: { label: 'Đã duyệt', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  REJECTED: { label: 'Từ chối', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
  CANCELLED: { label: 'Đã hủy', color: 'text-zinc-500', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
};

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string }> = {
  PRESENT: { label: 'Có mặt', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  ABSENT: { label: 'Vắng mặt', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
  LATE: { label: 'Đi muộn', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  EARLY_LEAVE: { label: 'Về sớm', color: 'text-orange-700', bgColor: 'bg-orange-50 dark:bg-orange-950' },
  HALF_DAY: { label: 'Nửa ngày', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  ON_LEAVE: { label: 'Nghỉ phép', color: 'text-purple-700', bgColor: 'bg-purple-50 dark:bg-purple-950' },
  HOLIDAY: { label: 'Ngày lễ', color: 'text-pink-700', bgColor: 'bg-pink-50 dark:bg-pink-950' },
  WEEKEND: { label: 'Cuối tuần', color: 'text-zinc-500', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
};

export const PAYROLL_STATUS_CONFIG: Record<PayrollStatus, { label: string; color: string; bgColor: string }> = {
  DRAFT: { label: 'Nháp', color: 'text-zinc-600', bgColor: 'bg-zinc-100 dark:bg-zinc-800' },
  PENDING: { label: 'Chờ duyệt', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950' },
  APPROVED: { label: 'Đã duyệt', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  PAID: { label: 'Đã thanh toán', color: 'text-emerald-700', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  CANCELLED: { label: 'Đã hủy', color: 'text-red-700', bgColor: 'bg-red-50 dark:bg-red-950' },
};

export const POSITION_LEVEL_CONFIG: Record<number, { label: string; color: string }> = {
  1: { label: 'Entry Level', color: 'text-zinc-600' },
  2: { label: 'Junior', color: 'text-blue-600' },
  3: { label: 'Mid-Level', color: 'text-emerald-600' },
  4: { label: 'Senior', color: 'text-purple-600' },
  5: { label: 'Team Lead', color: 'text-amber-600' },
  6: { label: 'Manager', color: 'text-orange-600' },
  7: { label: 'Director', color: 'text-red-600' },
  8: { label: 'C-Level', color: 'text-pink-600' },
};

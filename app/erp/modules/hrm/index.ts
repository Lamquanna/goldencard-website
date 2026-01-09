/**
 * HRM Module - Human Resource Management
 * Hồ sơ nhân sự, Chấm công, Nghỉ phép, Lương
 */

import type { ModuleManifest, PermissionDefinition } from '../../types'

// =============================================================================
// MODULE MANIFEST
// =============================================================================

// HRM Routes
const hrmRoutes = [
  { path: '/erp/hrm', name: 'Dashboard', nameVi: 'Tổng quan', icon: 'LayoutDashboard', showInSidebar: true },
  { path: '/erp/hrm/employees', name: 'Employees', nameVi: 'Nhân viên', icon: 'Users', showInSidebar: true },
  { path: '/erp/hrm/attendance', name: 'Attendance', nameVi: 'Chấm công', icon: 'Clock', showInSidebar: true },
  { path: '/erp/hrm/leaves', name: 'Leave Management', nameVi: 'Nghỉ phép', icon: 'Calendar', showInSidebar: true },
  { path: '/erp/hrm/payroll', name: 'Payroll', nameVi: 'Bảng lương', icon: 'Wallet', showInSidebar: true },
  { path: '/erp/hrm/departments', name: 'Departments', nameVi: 'Phòng ban', icon: 'Building2', showInSidebar: true },
  { path: '/erp/hrm/reports', name: 'HR Reports', nameVi: 'Báo cáo', icon: 'FileText', showInSidebar: true },
];

// HRM Permissions
const hrmPermissions: PermissionDefinition[] = [
  { id: 'hrm.view', name: 'View HR', nameVi: 'Xem nhân sự', resource: 'hrm', actions: ['read'] },
  { id: 'hrm.employee.manage', name: 'Manage Employees', nameVi: 'Quản lý nhân viên', resource: 'hrm.employee', actions: ['create', 'read', 'update', 'delete'] },
  { id: 'hrm.attendance.manage', name: 'Manage Attendance', nameVi: 'Quản lý chấm công', resource: 'hrm.attendance', actions: ['create', 'read', 'update'] },
  { id: 'hrm.leave.manage', name: 'Manage Leave', nameVi: 'Quản lý nghỉ phép', resource: 'hrm.leave', actions: ['create', 'read', 'update', 'manage'] },
  { id: 'hrm.payroll.view', name: 'View Payroll', nameVi: 'Xem bảng lương', resource: 'hrm.payroll', actions: ['read'] },
  { id: 'hrm.payroll.manage', name: 'Manage Payroll', nameVi: 'Quản lý lương', resource: 'hrm.payroll', actions: ['create', 'read', 'update', 'manage'] },
];

export const HRMModuleManifest: ModuleManifest = {
  id: 'hrm',
  name: 'HRM',
  nameVi: 'Quản lý nhân sự',
  version: '1.0.0',
  description: 'Human Resource Management - Employees, Attendance, Leave, Payroll',
  descriptionVi: 'Quản lý nhân sự, chấm công, nghỉ phép và lương',
  icon: 'Users',
  color: '#10B981', // Green
  author: 'Golden Energy',
  category: 'hr',
  
  basePath: '/erp/hrm',
  routes: hrmRoutes,
  permissions: hrmPermissions,
  defaultRoles: ['admin', 'hr_manager', 'hr_staff'],
  
  settings: [
    {
      key: 'workingHours',
      type: 'number',
      label: 'Working Hours',
      labelVi: 'Số giờ làm việc/ngày',
      defaultValue: 8,
    },
    {
      key: 'annualLeave',
      type: 'number',
      label: 'Annual Leave Days',
      labelVi: 'Số ngày phép năm',
      defaultValue: 12,
    },
    {
      key: 'geofenceRadius',
      type: 'number',
      label: 'Geofence Radius (meters)',
      labelVi: 'Bán kính Geofence (m)',
      defaultValue: 100,
    },
  ],
}

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'resigned' | 'terminated'
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern' | 'freelance'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'work_from_home'
export type CheckInMethod = 'gps' | 'wifi' | 'face_id' | 'manual' | 'qr_code' | 'biometric'

// Work Mode Types - Chế độ làm việc
export type WorkMode = 'office' | 'field_work' | 'construction_site' | 'remote'

export const WORK_MODE_CONFIG = {
  office: {
    label: 'Office Work',
    labelVi: 'Làm việc văn phòng',
    icon: 'Building2',
    color: 'bg-blue-500',
    description: 'Fixed location, periodic location checks',
    descriptionVi: 'Vị trí cố định, kiểm tra định kỳ',
    requiresLocation: true,
    allowMovement: false,
    checkInterval: 2 * 60 * 60 * 1000, // 2 hours
  },
  field_work: {
    label: 'Field Work',
    labelVi: 'Công tác ngoài',
    icon: 'Car',
    color: 'bg-green-500',
    description: 'Mobile work (sales, meetings, site visits)',
    descriptionVi: 'Công việc di động (sale, họp khách, thăm công trường)',
    requiresLocation: true,
    allowMovement: true,
    checkInterval: 4 * 60 * 60 * 1000, // 4 hours - longer interval
  },
  construction_site: {
    label: 'Construction Site',
    labelVi: 'Công trường xây dựng',
    icon: 'HardHat',
    color: 'bg-orange-500',
    description: 'Project site work with multiple locations',
    descriptionVi: 'Làm việc tại công trường, nhiều địa điểm dự án',
    requiresLocation: true,
    allowMovement: true,
    checkInterval: 3 * 60 * 60 * 1000, // 3 hours
  },
  remote: {
    label: 'Remote Work',
    labelVi: 'Làm việc từ xa',
    icon: 'Home',
    color: 'bg-purple-500',
    description: 'Work from home or remote location',
    descriptionVi: 'Làm việc tại nhà hoặc địa điểm từ xa',
    requiresLocation: false,
    allowMovement: true,
    checkInterval: null, // No location check
  },
}

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'paternity' | 'bereavement' | 'marriage' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type PayrollStatus = 'draft' | 'processing' | 'approved' | 'paid' | 'cancelled'

// =============================================================================
// INTERFACES
// =============================================================================

export interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  
  // Personal Info
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  nationalId?: string
  address?: string
  city?: string
  emergencyContact?: string
  emergencyPhone?: string
  
  // Employment Info
  departmentId: string
  department?: Department
  position: string
  level?: string
  managerId?: string
  manager?: Employee
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: Date
  probationEndDate?: Date
  terminationDate?: Date
  
  // Compensation
  baseSalary: number
  currency: string
  bankName?: string
  bankAccount?: string
  
  // Work Location
  workLocationId?: string
  workLocation?: GeofenceSite
  isRemote: boolean
  
  // System
  userId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Department {
  id: string
  name: string
  nameVi: string
  code: string
  description?: string
  parentId?: string
  parent?: Department
  children?: Department[]
  managerId?: string
  manager?: Employee
  employeeCount?: number
  budget?: number
  createdAt: Date
  updatedAt: Date
}

export interface GeofenceSite {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  radius: number // in meters
  wifiSSIDs?: string[] // WiFi networks for check-in
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// PROJECT LOCATION INTERFACE
// =============================================================================

export interface ProjectLocation {
  id: string
  projectName: string
  projectCode: string
  
  // Location
  address: string
  latitude: number
  longitude: number
  radius: number // Default 200m for construction sites
  
  // Project Info
  description?: string
  startDate: Date
  endDate?: Date
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
  
  // Management
  projectManagerId: string
  projectManager?: Employee
  
  // Team Members
  teamMembers?: ProjectMember[]
  
  // Check-in History
  checkIns?: Attendance[]
  
  // Photos/Documents
  photos?: string[]
  documents?: string[]
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface ProjectMember {
  id: string
  projectId: string
  employeeId: string
  employee?: Employee
  role: 'manager' | 'supervisor' | 'engineer' | 'technician' | 'worker'
  roleVi: string
  joinDate: Date
  leaveDate?: Date
  isActive: boolean
}

export const PROJECT_STATUS_CONFIG = {
  planning: {
    label: 'Planning',
    labelVi: 'Đang lên kế hoạch',
    color: 'bg-gray-500',
    icon: 'FileText',
  },
  active: {
    label: 'Active',
    labelVi: 'Đang triển khai',
    color: 'bg-green-500',
    icon: 'Play',
  },
  on_hold: {
    label: 'On Hold',
    labelVi: 'Tạm dừng',
    color: 'bg-yellow-500',
    icon: 'Pause',
  },
  completed: {
    label: 'Completed',
    labelVi: 'Hoàn thành',
    color: 'bg-blue-500',
    icon: 'CheckCircle2',
  },
  cancelled: {
    label: 'Cancelled',
    labelVi: 'Đã hủy',
    color: 'bg-red-500',
    icon: 'XCircle',
  },
}

export interface Attendance {
  id: string
  employeeId: string
  employee?: Employee
  date: Date
  
  // Work Mode - CHẾ ĐỘ LÀM VIỆC
  workMode: WorkMode
  workModeReason?: string // Lý do chọn chế độ công tác/công trường
  projectId?: string // ID dự án (cho construction_site)
  projectLocation?: string // Địa điểm dự án
  clientName?: string // Tên khách hàng (cho field_work)
  
  // Check In
  checkInTime?: Date
  checkInMethod?: CheckInMethod
  checkInLocation?: { lat: number; lng: number }
  checkInSiteId?: string
  checkInPhoto?: string // Face ID photo
  
  // Location Tracking History
  locationChecks?: {
    timestamp: Date
    location: { lat: number; lng: number }
    isValid: boolean
    distance?: number // Distance from original check-in point
  }[]
  
  // Check Out - KHÔNG CẦN THIẾT NỮA
  checkOutTime?: Date
  checkOutMethod?: CheckInMethod
  checkOutLocation?: { lat: number; lng: number }
  checkOutSiteId?: string
  checkOutPhoto?: string
  
  // Auto-cancel if out of range
  cancelledAt?: Date
  cancelReason?: string
  
  // Status & Notes
  status: AttendanceStatus
  workingHours?: number
  overtimeHours?: number
  notes?: string
  approvedBy?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface LeaveRequest {
  id: string
  employeeId: string
  employee?: Employee
  
  type: LeaveType
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  
  status: LeaveStatus
  approvedBy?: string
  approver?: Employee
  approvedAt?: Date
  rejectionReason?: string
  
  // Attachments (medical certificates, etc.)
  attachments?: string[]
  
  createdAt: Date
  updatedAt: Date
}

export interface LeaveBalance {
  id: string
  employeeId: string
  employee?: Employee
  year: number
  
  annualTotal: number
  annualUsed: number
  annualRemaining: number
  
  sickTotal: number
  sickUsed: number
  sickRemaining: number
  
  unpaidUsed: number
  
  updatedAt: Date
}

export interface PayrollRecord {
  id: string
  employeeId: string
  employee?: Employee
  
  period: string // YYYY-MM
  
  // Earnings
  baseSalary: number
  overtimePay: number
  allowances: PayrollItem[]
  bonuses: PayrollItem[]
  totalEarnings: number
  
  // Deductions
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  incomeTax: number
  otherDeductions: PayrollItem[]
  totalDeductions: number
  
  // Net
  netSalary: number
  currency: string
  
  // Status
  status: PayrollStatus
  processedBy?: string
  processedAt?: Date
  paidAt?: Date
  paymentRef?: string
  
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PayrollItem {
  name: string
  nameVi: string
  amount: number
  description?: string
}

export interface OvertimeRequest {
  id: string
  employeeId: string
  employee?: Employee
  date: Date
  startTime: Date
  endTime: Date
  hours: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  approvedAt?: Date
  rate: number // multiplier, e.g., 1.5, 2.0
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// CONFIG
// =============================================================================

export const EMPLOYEE_STATUS_CONFIG: Record<EmployeeStatus, { label: string; labelVi: string; color: string }> = {
  active: { label: 'Active', labelVi: 'Đang làm việc', color: 'bg-green-500' },
  on_leave: { label: 'On Leave', labelVi: 'Đang nghỉ', color: 'bg-yellow-500' },
  probation: { label: 'Probation', labelVi: 'Thử việc', color: 'bg-blue-500' },
  resigned: { label: 'Resigned', labelVi: 'Nghỉ việc', color: 'bg-gray-500' },
  terminated: { label: 'Terminated', labelVi: 'Đã chấm dứt', color: 'bg-red-500' },
}

export const EMPLOYMENT_TYPE_CONFIG: Record<EmploymentType, { label: string; labelVi: string }> = {
  full_time: { label: 'Full Time', labelVi: 'Toàn thời gian' },
  part_time: { label: 'Part Time', labelVi: 'Bán thời gian' },
  contract: { label: 'Contract', labelVi: 'Hợp đồng' },
  intern: { label: 'Intern', labelVi: 'Thực tập sinh' },
  freelance: { label: 'Freelance', labelVi: 'Tự do' },
}

export const ATTENDANCE_STATUS_CONFIG: Record<AttendanceStatus, { label: string; labelVi: string; color: string }> = {
  present: { label: 'Present', labelVi: 'Có mặt', color: 'bg-green-500' },
  absent: { label: 'Absent', labelVi: 'Vắng mặt', color: 'bg-red-500' },
  late: { label: 'Late', labelVi: 'Đi trễ', color: 'bg-yellow-500' },
  early_leave: { label: 'Early Leave', labelVi: 'Về sớm', color: 'bg-orange-500' },
  half_day: { label: 'Half Day', labelVi: 'Nửa ngày', color: 'bg-blue-500' },
  work_from_home: { label: 'WFH', labelVi: 'Làm việc tại nhà', color: 'bg-purple-500' },
}

export const CHECKIN_METHOD_CONFIG: Record<CheckInMethod, { label: string; labelVi: string; icon: string }> = {
  gps: { label: 'GPS Location', labelVi: 'Định vị GPS', icon: 'MapPin' },
  wifi: { label: 'WiFi Network', labelVi: 'Mạng WiFi', icon: 'Wifi' },
  face_id: { label: 'Face Recognition', labelVi: 'Nhận diện khuôn mặt', icon: 'Scan' },
  manual: { label: 'Manual Entry', labelVi: 'Nhập thủ công', icon: 'Edit' },
  qr_code: { label: 'QR Code', labelVi: 'Mã QR', icon: 'QrCode' },
  biometric: { label: 'Biometric', labelVi: 'Sinh trắc học', icon: 'Fingerprint' },
}

export const LEAVE_TYPE_CONFIG: Record<LeaveType, { label: string; labelVi: string; color: string; paidDays: number }> = {
  annual: { label: 'Annual Leave', labelVi: 'Nghỉ phép năm', color: 'bg-blue-500', paidDays: 12 },
  sick: { label: 'Sick Leave', labelVi: 'Nghỉ ốm', color: 'bg-red-500', paidDays: 30 },
  unpaid: { label: 'Unpaid Leave', labelVi: 'Nghỉ không lương', color: 'bg-gray-500', paidDays: 0 },
  maternity: { label: 'Maternity Leave', labelVi: 'Nghỉ thai sản', color: 'bg-pink-500', paidDays: 180 },
  paternity: { label: 'Paternity Leave', labelVi: 'Nghỉ thai sản (nam)', color: 'bg-indigo-500', paidDays: 5 },
  bereavement: { label: 'Bereavement', labelVi: 'Nghỉ tang', color: 'bg-slate-500', paidDays: 3 },
  marriage: { label: 'Marriage Leave', labelVi: 'Nghỉ cưới', color: 'bg-rose-500', paidDays: 3 },
  other: { label: 'Other', labelVi: 'Khác', color: 'bg-amber-500', paidDays: 0 },
}

export const LEAVE_STATUS_CONFIG: Record<LeaveStatus, { label: string; labelVi: string; color: string }> = {
  pending: { label: 'Pending', labelVi: 'Chờ duyệt', color: 'bg-yellow-500' },
  approved: { label: 'Approved', labelVi: 'Đã duyệt', color: 'bg-green-500' },
  rejected: { label: 'Rejected', labelVi: 'Từ chối', color: 'bg-red-500' },
  cancelled: { label: 'Cancelled', labelVi: 'Đã hủy', color: 'bg-gray-500' },
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Calculate working hours from check-in and check-out times
 */
export function calculateWorkingHours(checkIn: Date, checkOut: Date, breakMinutes = 60): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  const workHours = diffHours - breakMinutes / 60
  return Math.max(0, Math.round(workHours * 100) / 100)
}

/**
 * Calculate overtime hours (anything over 8 hours)
 */
export function calculateOvertimeHours(workingHours: number, standardHours = 8): number {
  return Math.max(0, workingHours - standardHours)
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}

/**
 * Check if location is within geofence
 */
export function isWithinGeofence(
  lat: number,
  lng: number,
  site: GeofenceSite
): boolean {
  const distance = calculateDistance(lat, lng, site.latitude, site.longitude)
  return distance <= site.radius
}

/**
 * Calculate leave days excluding weekends
 */
export function calculateLeaveDays(startDate: Date, endDate: Date, excludeWeekends = true): number {
  let days = 0
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    if (!excludeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      days++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return days
}

/**
 * Calculate gross salary
 */
export function calculateGrossSalary(
  baseSalary: number,
  overtimeHours: number,
  overtimeRate: number,
  allowances: PayrollItem[],
  bonuses: PayrollItem[]
): number {
  const hourlyRate = baseSalary / 176 // Standard working hours per month
  const overtimePay = overtimeHours * hourlyRate * overtimeRate
  const totalAllowances = allowances.reduce((sum, item) => sum + item.amount, 0)
  const totalBonuses = bonuses.reduce((sum, item) => sum + item.amount, 0)
  
  return baseSalary + overtimePay + totalAllowances + totalBonuses
}

/**
 * Calculate Vietnam social insurance contributions
 */
export function calculateVietnamInsurance(grossSalary: number): {
  socialInsurance: number
  healthInsurance: number
  unemploymentInsurance: number
  total: number
} {
  // Vietnam rates (employee contribution)
  const maxInsurableSalary = 36000000 // 36 million VND cap
  const insurableSalary = Math.min(grossSalary, maxInsurableSalary)
  
  const socialInsurance = insurableSalary * 0.08 // 8%
  const healthInsurance = insurableSalary * 0.015 // 1.5%
  const unemploymentInsurance = insurableSalary * 0.01 // 1%
  
  return {
    socialInsurance: Math.round(socialInsurance),
    healthInsurance: Math.round(healthInsurance),
    unemploymentInsurance: Math.round(unemploymentInsurance),
    total: Math.round(socialInsurance + healthInsurance + unemploymentInsurance),
  }
}

/**
 * Calculate Vietnam personal income tax
 */
export function calculateVietnamPIT(
  taxableIncome: number,
  dependents: number = 0
): number {
  // Vietnam PIT calculation
  const personalDeduction = 11000000 // 11 million VND
  const dependentDeduction = 4400000 * dependents // 4.4 million VND per dependent
  
  const taxable = Math.max(0, taxableIncome - personalDeduction - dependentDeduction)
  
  // Progressive tax rates
  let tax = 0
  const brackets = [
    { limit: 5000000, rate: 0.05 },
    { limit: 10000000, rate: 0.1 },
    { limit: 18000000, rate: 0.15 },
    { limit: 32000000, rate: 0.2 },
    { limit: 52000000, rate: 0.25 },
    { limit: 80000000, rate: 0.3 },
    { limit: Infinity, rate: 0.35 },
  ]
  
  let remaining = taxable
  let previousLimit = 0
  
  for (const bracket of brackets) {
    const bracketAmount = Math.min(remaining, bracket.limit - previousLimit)
    if (bracketAmount > 0) {
      tax += bracketAmount * bracket.rate
      remaining -= bracketAmount
    }
    previousLimit = bracket.limit
    if (remaining <= 0) break
  }
  
  return Math.round(tax)
}

/**
 * Format currency in Vietnamese Dong
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Get employee full name
 */
export function getEmployeeFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`
}

/**
 * Generate employee code
 */
export function generateEmployeeCode(departmentCode: string, sequence: number): string {
  return `${departmentCode}${String(sequence).padStart(4, '0')}`
}

// =============================================================================
// DEFAULT GEOFENCE SITES
// =============================================================================

export const DEFAULT_GEOFENCE_SITES: GeofenceSite[] = [
  {
    id: 'site-1',
    name: 'Trụ sở chính - Sunrise Riverside',
    address: 'Sunrise Riverside, Block A, Nguyễn Hữu Thọ/Đ. D1 ấp 5, Phước Kiển, Nhà Bè, Thành phố Hồ Chí Minh 70000',
    latitude: 10.740842,
    longitude: 106.703168,
    radius: 100,
    wifiSSIDs: ['GoldenEnergy-5G', 'GoldenEnergy-2.4G'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'site-2',
    name: 'Văn phòng đại diện - Quận 7',
    address: '625 Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP.HCM',
    latitude: 10.7367,
    longitude: 106.7062,
    radius: 100,
    wifiSSIDs: ['GoldenEnergy-Q7-5G', 'GoldenEnergy-Q7-2.4G'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'site-3',
    name: 'Kho - Nguyễn Văn Linh',
    address: '354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP.HCM',
    latitude: 10.7253,
    longitude: 106.7044,
    radius: 150,
    wifiSSIDs: ['GoldenEnergy-Kho'],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// CHECK-IN LOCATION MANAGEMENT (Like WiFi Manager on iPhone)
// =============================================================================

export type LocationType = 'office' | 'project_site' | 'task_location' | 'event' | 'business_trip' | 'teambuilding'
export type LocationStatus = 'active' | 'disabled' | 'archived'

export interface CheckInLocation {
  id: string                          // "loc-001"
  locationCode: string                // "GES-LOC-001"
  locationName: string                // "Văn phòng HCM", "Công trường Bình Dương"
  locationType: LocationType          // Type of location
  address: string                     // Full address
  latitude: number                    // GPS coordinates
  longitude: number                   // GPS coordinates
  radius: number                      // Check-in radius in meters (default 200m)
  status: LocationStatus              // active, disabled, archived
  
  // Association
  projectId?: string                  // Link to project if applicable
  taskId?: string                     // Link to task if applicable
  eventId?: string                    // Link to event (teambuilding, business trip)
  
  // Usage tracking
  usageCount: number                  // How many times used for check-in
  lastUsedDate?: Date                 // Last time someone checked in here
  
  // Management
  createdBy: string                   // Employee ID who created this location
  createdByName: string               // Employee name
  createdAt: Date
  updatedAt: Date
  
  // Permissions - who can use this location
  allowedEmployees?: string[]         // Empty = all employees can use
  allowedDepartments?: string[]       // Empty = all departments can use
  
  // Settings
  allowCheckOut: boolean              // Can check-out at this location?
  requirePhoto: boolean               // Require photo at check-in?
  notes?: string                      // Additional notes
}

export const LOCATION_TYPE_CONFIG: Record<LocationType, { 
  labelVi: string
  descriptionVi: string
  icon: string
  color: string 
}> = {
  office: {
    labelVi: 'Văn phòng',
    descriptionVi: 'Văn phòng công ty cố định',
    icon: 'Building2',
    color: 'bg-blue-500'
  },
  project_site: {
    labelVi: 'Công trường dự án',
    descriptionVi: 'Địa điểm thi công dự án',
    icon: 'HardHat',
    color: 'bg-orange-500'
  },
  task_location: {
    labelVi: 'Địa điểm task',
    descriptionVi: 'Địa điểm thực hiện công việc cụ thể',
    icon: 'MapPin',
    color: 'bg-purple-500'
  },
  event: {
    labelVi: 'Sự kiện',
    descriptionVi: 'Họp, hội thảo, sự kiện công ty',
    icon: 'Calendar',
    color: 'bg-pink-500'
  },
  business_trip: {
    labelVi: 'Công tác',
    descriptionVi: 'Chuyến công tác, khảo sát',
    icon: 'Plane',
    color: 'bg-green-500'
  },
  teambuilding: {
    labelVi: 'Team Building',
    descriptionVi: 'Hoạt động team building',
    icon: 'Users',
    color: 'bg-yellow-500'
  }
}

// =============================================================================
// TASK MANAGEMENT WITH LOCATION
// =============================================================================

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled'

export interface Task {
  id: string                          // "task-001"
  taskCode: string                    // "GES-TASK-001"
  taskName: string                    // Task title
  description?: string                // Task description
  
  // Association
  projectId?: string                  // Parent project
  parentTaskId?: string               // Parent task (for subtasks)
  
  // Assignment
  assignedTo: string[]                // Employee IDs
  assignedBy: string                  // Manager ID
  
  // Status & Priority
  status: TaskStatus
  priority: TaskPriority
  
  // Timeline
  startDate: Date
  dueDate: Date
  completedDate?: Date
  
  // Location requirement
  requiresLocation: boolean           // Does this task require physical presence?
  checkInLocationId?: string          // Link to CheckInLocation
  estimatedTravelTime?: number        // Minutes to travel to location
  
  // Progress
  progress: number                    // 0-100
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, {
  labelVi: string
  color: string
  badgeColor: string
}> = {
  low: { labelVi: 'Thấp', color: 'bg-gray-500', badgeColor: 'bg-gray-100 text-gray-700' },
  medium: { labelVi: 'Trung bình', color: 'bg-blue-500', badgeColor: 'bg-blue-100 text-blue-700' },
  high: { labelVi: 'Cao', color: 'bg-orange-500', badgeColor: 'bg-orange-100 text-orange-700' },
  urgent: { labelVi: 'Khẩn cấp', color: 'bg-red-500', badgeColor: 'bg-red-100 text-red-700' }
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  labelVi: string
  color: string
}> = {
  todo: { labelVi: 'Chưa làm', color: 'bg-gray-500' },
  in_progress: { labelVi: 'Đang làm', color: 'bg-blue-500' },
  review: { labelVi: 'Đang review', color: 'bg-yellow-500' },
  completed: { labelVi: 'Hoàn thành', color: 'bg-green-500' },
  cancelled: { labelVi: 'Đã hủy', color: 'bg-red-500' }
}

// =============================================================================
// AUTO-DETECT TRAVEL MODE
// =============================================================================

export interface LocationCheckHistory {
  timestamp: Date
  latitude: number
  longitude: number
  locationId?: string                 // If checked at a known location
  distanceFromPrevious?: number       // Meters from previous check
  speed?: number                      // Estimated speed (m/s)
}

export interface AttendanceWithTravel extends Attendance {
  locationHistory: LocationCheckHistory[]
  isTravelMode: boolean               // Auto-detected travel mode
  travelStartTime?: Date
  travelEndTime?: Date
  totalTravelDistance?: number        // Total distance traveled (meters)
  checkInLocationId?: string          // Location ID where checked in
  checkOutLocationId?: string         // Location ID where checked out
}

export default HRMModuleManifest

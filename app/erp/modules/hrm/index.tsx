// =============================================================================
// LEAVE MANAGEMENT TYPES & UTILITIES
// =============================================================================

export type LeaveType = 'annual' | 'sick' | 'unpaid'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  id: string
  employeeId: string
  type: LeaveType
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  status: LeaveStatus
  approvedBy?: string
  approvedAt?: Date
  rejectReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface LeaveBalance {
  id: string
  employeeId: string
  year: number
  annualTotal: number
  annualUsed: number
  annualRemaining: number
  sickTotal: number
  sickUsed: number
  sickRemaining: number
  unpaidUsed: number
  createdAt: Date
  updatedAt: Date
}

export const LEAVE_TYPE_CONFIG = {
  annual: {
    labelVi: 'Phép năm',
    labelEn: 'Annual Leave',
    color: 'bg-blue-500',
    icon: '🏖️',
  },
  sick: {
    labelVi: 'Nghỉ ốm',
    labelEn: 'Sick Leave',
    color: 'bg-red-500',
    icon: '🤒',
  },
  unpaid: {
    labelVi: 'Không lương',
    labelEn: 'Unpaid Leave',
    color: 'bg-gray-500',
    icon: '📅',
  },
}

export const LEAVE_STATUS_CONFIG = {
  pending: {
    labelVi: 'Chờ duyệt',
    labelEn: 'Pending',
    color: 'bg-yellow-500',
    icon: '⏳',
  },
  approved: {
    labelVi: 'Đã duyệt',
    labelEn: 'Approved',
    color: 'bg-green-500',
    icon: '✅',
  },
  rejected: {
    labelVi: 'Từ chối',
    labelEn: 'Rejected',
    color: 'bg-red-500',
    icon: '❌',
  },
  cancelled: {
    labelVi: 'Đã hủy',
    labelEn: 'Cancelled',
    color: 'bg-gray-500',
    icon: '🚫',
  },
}

/**
 * Calculate working days excluding weekends
 */
export function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  excludeWeekends: boolean = true
): number {
  let days = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    if (!excludeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
      days++
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}

/**
 * Check if a date range overlaps with another
 */
export function hasDateOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && end1 >= start2
}

/**
 * Format leave duration for display
 */
export function formatLeaveDuration(startDate: Date, endDate: Date): string {
  const days = calculateLeaveDays(startDate, endDate, true)
  
  if (days === 1) {
    return '1 ngày'
  }
  
  return `${days} ngày`
}

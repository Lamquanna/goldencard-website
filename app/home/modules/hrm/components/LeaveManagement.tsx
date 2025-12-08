'use client'

import React, { useState } from 'react'
import { format, differenceInDays, isWeekend, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  X,
  Clock,
  FileText,
  User,
  Search,
  Filter,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  LeaveStatus,
  LEAVE_TYPE_CONFIG,
  LEAVE_STATUS_CONFIG,
  calculateLeaveDays,
} from '../index'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockLeaveBalance: LeaveBalance = {
  id: '1',
  employeeId: 'emp-1',
  year: 2025,
  annualTotal: 12,
  annualUsed: 4,
  annualRemaining: 8,
  sickTotal: 30,
  sickUsed: 2,
  sickRemaining: 28,
  unpaidUsed: 0,
  updatedAt: new Date(),
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'emp-1',
    type: 'annual',
    startDate: new Date(2025, 0, 15),
    endDate: new Date(2025, 0, 17),
    totalDays: 3,
    reason: 'Về quê thăm gia đình',
    status: 'approved',
    approvedBy: 'emp-2',
    approvedAt: new Date(2025, 0, 10),
    createdAt: new Date(2025, 0, 8),
    updatedAt: new Date(2025, 0, 10),
  },
  {
    id: '2',
    employeeId: 'emp-1',
    type: 'sick',
    startDate: new Date(2025, 1, 3),
    endDate: new Date(2025, 1, 4),
    totalDays: 2,
    reason: 'Bị cảm, cần nghỉ điều trị',
    status: 'approved',
    approvedBy: 'emp-2',
    approvedAt: new Date(2025, 1, 3),
    createdAt: new Date(2025, 1, 3),
    updatedAt: new Date(2025, 1, 3),
  },
  {
    id: '3',
    employeeId: 'emp-1',
    type: 'annual',
    startDate: new Date(2025, 2, 20),
    endDate: new Date(2025, 2, 21),
    totalDays: 2,
    reason: 'Xử lý việc cá nhân',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

interface PendingApproval extends Omit<LeaveRequest, 'employee'> {
  employeeInfo?: { name: string; avatar?: string; department: string }
}

const mockPendingApprovals: PendingApproval[] = [
  {
    id: 'p1',
    employeeId: 'emp-3',
    employeeInfo: { name: 'Trần Thị B', department: 'Kinh doanh' },
    type: 'annual',
    startDate: new Date(2025, 1, 25),
    endDate: new Date(2025, 1, 27),
    totalDays: 3,
    reason: 'Du lịch cùng gia đình',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    employeeId: 'emp-4',
    employeeInfo: { name: 'Lê Văn C', department: 'Kỹ thuật' },
    type: 'sick',
    startDate: new Date(2025, 1, 24),
    endDate: new Date(2025, 1, 24),
    totalDays: 1,
    reason: 'Đi khám bệnh định kỳ',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// LEAVE BALANCE CARD
// =============================================================================

function LeaveBalanceCard({ balance }: { balance: LeaveBalance }) {
  const balanceItems = [
    {
      type: 'annual',
      label: 'Phép năm',
      used: balance.annualUsed,
      total: balance.annualTotal,
      remaining: balance.annualRemaining,
      color: 'bg-blue-500',
    },
    {
      type: 'sick',
      label: 'Nghỉ ốm',
      used: balance.sickUsed,
      total: balance.sickTotal,
      remaining: balance.sickRemaining,
      color: 'bg-red-500',
    },
    {
      type: 'unpaid',
      label: 'Không lương',
      used: balance.unpaidUsed,
      total: 0,
      remaining: null,
      color: 'bg-gray-500',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Số ngày nghỉ {balance.year}</CardTitle>
        <CardDescription>Tổng quan số ngày phép còn lại</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {balanceItems.map(item => (
            <div key={item.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">
                  {item.remaining !== null ? (
                    <>
                      <span className="font-semibold text-foreground">{item.remaining}</span>/{item.total} ngày
                    </>
                  ) : (
                    <>{item.used} ngày đã dùng</>
                  )}
                </span>
              </div>
              {item.total > 0 && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} transition-all`}
                    style={{ width: `${(item.used / item.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// NEW LEAVE REQUEST DIALOG
// =============================================================================

interface NewLeaveRequestProps {
  balance: LeaveBalance
  onSubmit: (request: Partial<LeaveRequest>) => void
}

function NewLeaveRequestDialog({ balance, onSubmit }: NewLeaveRequestProps) {
  const [open, setOpen] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>('annual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [calculatedDays, setCalculatedDays] = useState(0)

  // Calculate working days when dates change
  React.useEffect(() => {
    if (startDate && endDate) {
      const days = calculateLeaveDays(new Date(startDate), new Date(endDate), true)
      setCalculatedDays(days)
    }
  }, [startDate, endDate])

  const handleSubmit = () => {
    onSubmit({
      type: leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: calculatedDays,
      reason,
      status: 'pending',
    })
    setOpen(false)
    // Reset form
    setLeaveType('annual')
    setStartDate('')
    setEndDate('')
    setReason('')
  }

  const isValid = startDate && endDate && reason.trim() && calculatedDays > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Xin nghỉ phép
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đơn xin nghỉ phép</DialogTitle>
          <DialogDescription>
            Điền thông tin đơn nghỉ phép. Đơn sẽ được gửi đến quản lý để duyệt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Loại nghỉ phép</Label>
            <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LEAVE_TYPE_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.color}`} />
                      {config.labelVi}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>

          {calculatedDays > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">
                Số ngày nghỉ: <span className="font-semibold">{calculatedDays} ngày làm việc</span>
              </p>
              {leaveType === 'annual' && balance.annualRemaining < calculatedDays && (
                <p className="text-sm text-destructive mt-1">
                  ⚠️ Số ngày phép còn lại không đủ ({balance.annualRemaining} ngày)
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label>Lý do</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do xin nghỉ..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Gửi đơn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// LEAVE REQUESTS LIST
// =============================================================================

interface LeaveRequestsListProps {
  requests: LeaveRequest[]
  onCancel?: (id: string) => void
}

function LeaveRequestsList({ requests, onCancel }: LeaveRequestsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Đơn nghỉ phép của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có đơn nghỉ phép nào</p>
        ) : (
          <div className="space-y-3">
            {requests.map(request => {
              const typeConfig = LEAVE_TYPE_CONFIG[request.type]
              const statusConfig = LEAVE_STATUS_CONFIG[request.status]

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${typeConfig.color}/10`}>
                        <Calendar className={`h-5 w-5 ${typeConfig.color.replace('bg-', 'text-')}`} />
                      </div>
                      <div>
                        <p className="font-medium">{typeConfig.labelVi}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(request.startDate), 'dd/MM/yyyy')}
                          {!isSameDay(new Date(request.startDate), new Date(request.endDate)) &&
                            ` - ${format(new Date(request.endDate), 'dd/MM/yyyy')}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${statusConfig.color} text-white border-0`}>
                      {statusConfig.labelVi}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">{request.reason}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {request.totalDays} ngày • Tạo {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                    </span>
                    {request.status === 'pending' && onCancel && (
                      <Button variant="ghost" size="sm" onClick={() => onCancel(request.id)}>
                        Hủy đơn
                      </Button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// PENDING APPROVALS (FOR MANAGERS)
// =============================================================================

interface PendingApprovalsProps {
  requests: PendingApproval[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

function PendingApprovals({ requests, onApprove, onReject }: PendingApprovalsProps) {
  if (requests.length === 0) {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-orange-500" />
          Chờ duyệt ({requests.length})
        </CardTitle>
        <CardDescription>Các đơn nghỉ phép cần bạn phê duyệt</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map(request => {
            const typeConfig = LEAVE_TYPE_CONFIG[request.type]

            return (
              <div
                key={request.id}
                className="p-4 rounded-lg bg-white border"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.employeeInfo?.avatar} />
                      <AvatarFallback>{request.employeeInfo?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.employeeInfo?.name}</p>
                      <p className="text-sm text-muted-foreground">{request.employeeInfo?.department}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`${typeConfig.color} text-white border-0`}>
                    {typeConfig.labelVi}
                  </Badge>
                </div>

                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Thời gian:</strong>{' '}
                    {format(new Date(request.startDate), 'dd/MM/yyyy')}
                    {!isSameDay(new Date(request.startDate), new Date(request.endDate)) &&
                      ` - ${format(new Date(request.endDate), 'dd/MM/yyyy')}`}
                    {' '}({request.totalDays} ngày)
                  </p>
                  <p className="text-sm mt-1">
                    <strong>Lý do:</strong> {request.reason}
                  </p>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onApprove(request.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Duyệt
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive"
                    onClick={() => onReject(request.id)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Từ chối
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// LEAVE CALENDAR
// =============================================================================

interface LeaveCalendarProps {
  requests: LeaveRequest[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}

function LeaveCalendar({ requests, currentMonth, onMonthChange }: LeaveCalendarProps) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Pad start to align with weekday
  const startPadding = monthStart.getDay()
  const paddedDays = [...Array(startPadding).fill(null), ...days]

  const getLeavesForDate = (date: Date) => {
    return requests.filter(r => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      return date >= start && date <= end && r.status === 'approved'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lịch nghỉ phép</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMonthChange(addDays(currentMonth, -30))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onMonthChange(addDays(currentMonth, 30))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddedDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="p-2" />
            }

            const leaves = getLeavesForDate(day)
            const isWeekendDay = isWeekend(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)

            return (
              <div
                key={day.toISOString()}
                className={`p-2 min-h-[60px] rounded-lg border ${
                  isWeekendDay ? 'bg-muted/50' : ''
                } ${!isCurrentMonth ? 'opacity-50' : ''}`}
              >
                <p className={`text-sm font-medium ${leaves.length > 0 ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </p>
                {leaves.length > 0 && (
                  <div className="mt-1 space-y-1">
                    {leaves.slice(0, 2).map((leave, i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full ${LEAVE_TYPE_CONFIG[leave.type].color}`}
                      />
                    ))}
                    {leaves.length > 2 && (
                      <p className="text-xs text-muted-foreground">+{leaves.length - 2}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface LeaveManagementProps {
  balance?: LeaveBalance
  requests?: LeaveRequest[]
  pendingApprovals?: PendingApproval[]
  isManager?: boolean
  onSubmitRequest?: (request: Partial<LeaveRequest>) => void
  onCancelRequest?: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function LeaveManagement({
  balance = mockLeaveBalance,
  requests = mockLeaveRequests,
  pendingApprovals = mockPendingApprovals,
  isManager = true,
  onSubmitRequest = () => {},
  onCancelRequest = () => {},
  onApprove = () => {},
  onReject = () => {},
}: LeaveManagementProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  return (
    <div className="space-y-6">
      {/* Header with action */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Quản lý nghỉ phép</h2>
        <NewLeaveRequestDialog balance={balance} onSubmit={onSubmitRequest} />
      </div>

      {/* Pending Approvals for Managers */}
      {isManager && (
        <PendingApprovals
          requests={pendingApprovals}
          onApprove={onApprove}
          onReject={onReject}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Leave Balance */}
        <LeaveBalanceCard balance={balance} />

        {/* Leave Calendar */}
        <div className="lg:col-span-2">
          <LeaveCalendar
            requests={requests}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        </div>
      </div>

      {/* My Leave Requests */}
      <LeaveRequestsList requests={requests} onCancel={onCancelRequest} />
    </div>
  )
}

export default LeaveManagement

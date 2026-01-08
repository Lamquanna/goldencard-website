'use client'

import React, { useState, useEffect } from 'react'
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
  AlertTriangle,
  Users,
  TrendingUp,
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
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
// TYPES
// =============================================================================

interface LeaveRequestWithEmployee extends LeaveRequest {
  employee_name?: string
  employee_code?: string
  department?: string
  email?: string
  approver_name?: string
}

interface LeaveBalanceWithEmployee extends LeaveBalance {
  full_name?: string
  employee_code?: string
  department?: string
}

interface ProjectConflict {
  project_name: string
  start_date: string
  end_date: string
}

// =============================================================================
// LEAVE BALANCE CARD
// =============================================================================

interface LeaveBalanceCardProps {
  balance: LeaveBalanceWithEmployee
  onClick?: () => void
}

function LeaveBalanceCard({ balance, onClick }: LeaveBalanceCardProps) {
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
    <Card className={onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} onClick={onClick}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Số ngày nghỉ {balance.year}</span>
          {balance.full_name && (
            <Badge variant="outline">{balance.employee_code}</Badge>
          )}
        </CardTitle>
        {balance.full_name && (
          <CardDescription>
            {balance.full_name} • {balance.department}
          </CardDescription>
        )}
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
                    style={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
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

interface NewLeaveRequestDialogProps {
  balance: LeaveBalance
  employeeId: string
  onSubmit: (request: Partial<LeaveRequest>, warnings?: { hasProjectConflict: boolean; projects: ProjectConflict[] }) => void
}

function NewLeaveRequestDialog({ balance, employeeId, onSubmit }: NewLeaveRequestDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [leaveType, setLeaveType] = useState<LeaveType>('annual')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [calculatedDays, setCalculatedDays] = useState(0)
  const [projectWarnings, setProjectWarnings] = useState<ProjectConflict[] | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Calculate working days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateLeaveDays(new Date(startDate), new Date(endDate), true)
      setCalculatedDays(days)
    }
  }, [startDate, endDate])

  const handleSubmit = async () => {
    if (showConfirmation) {
      // Final submission after confirmation
      const request = {
        type: leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: calculatedDays,
        reason,
        status: 'pending' as LeaveStatus,
      }
      onSubmit(request, projectWarnings ? { hasProjectConflict: true, projects: projectWarnings } : undefined)
      setOpen(false)
      resetForm()
    } else {
      // Initial submission - check for conflicts
      setLoading(true)
      try {
        const response = await fetch('/api/erp/hrm/leaves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId,
            leaveType,
            startDate,
            endDate,
            totalDays: calculatedDays,
            reason,
          }),
        })

        const data = await response.json()

        if (data.warnings?.hasProjectConflict) {
          setProjectWarnings(data.warnings.projects)
          setShowConfirmation(true)
        } else {
          onSubmit({
            type: leaveType,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            totalDays: calculatedDays,
            reason,
            status: 'pending',
          })
          setOpen(false)
          resetForm()
        }
      } catch (error) {
        console.error('Error submitting leave request:', error)
        alert('Có lỗi xảy ra khi gửi đơn nghỉ phép')
      } finally {
        setLoading(false)
      }
    }
  }

  const resetForm = () => {
    setLeaveType('annual')
    setStartDate('')
    setEndDate('')
    setReason('')
    setProjectWarnings(null)
    setShowConfirmation(false)
  }

  const isValid = startDate && endDate && reason.trim() && calculatedDays > 0

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Xin nghỉ phép
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đơn xin nghỉ phép</DialogTitle>
          <DialogDescription>
            {showConfirmation 
              ? 'Xác nhận nghỉ phép trong thời gian có dự án'
              : 'Điền thông tin đơn nghỉ phép. Đơn sẽ được gửi đến quản lý để duyệt.'
            }
          </DialogDescription>
        </DialogHeader>

        {showConfirmation && projectWarnings ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cảnh báo xung đột dự án</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Bạn đang tham gia các dự án trong khoảng thời gian nghỉ:</p>
              <ul className="list-disc pl-5 space-y-1">
                {projectWarnings.map((p, i) => (
                  <li key={i}>
                    <strong>{p.project_name}</strong>
                    <br />
                    <span className="text-sm">
                      {format(new Date(p.start_date), 'dd/MM/yyyy')} - {format(new Date(p.end_date), 'dd/MM/yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2">Bạn có chắc chắn muốn tiếp tục xin nghỉ phép không?</p>
            </AlertDescription>
          </Alert>
        ) : (
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
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              if (showConfirmation) {
                setShowConfirmation(false)
                setProjectWarnings(null)
              } else {
                setOpen(false)
                resetForm()
              }
            }}
          >
            {showConfirmation ? 'Quay lại' : 'Hủy'}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {loading ? 'Đang xử lý...' : showConfirmation ? 'Xác nhận và gửi' : 'Gửi đơn'}
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
  requests: LeaveRequestWithEmployee[]
  onCancel?: (id: string) => void
  currentUserId?: string
}

function LeaveRequestsList({ requests, onCancel, currentUserId }: LeaveRequestsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lịch sử nghỉ phép</CardTitle>
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
                    <Badge 
                      variant="outline" 
                      className={`${statusConfig.color} ${
                        request.status === 'pending' ? 'bg-yellow-500' : ''
                      } text-white border-0`}
                    >
                      {statusConfig.labelVi}
                    </Badge>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">{request.reason}</p>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <span className="text-sm text-muted-foreground">
                      {request.totalDays} ngày • Tạo {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                    </span>
                    {request.status === 'pending' && onCancel && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onCancel(request.id)}
                        className="text-destructive hover:text-destructive"
                      >
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
  requests: LeaveRequestWithEmployee[]
  onApprove: (id: string, hasConflict: boolean, projects?: ProjectConflict[]) => void
  onReject: (id: string) => void
}

function PendingApprovals({ requests, onApprove, onReject }: PendingApprovalsProps) {
  const [confirmDialog, setConfirmDialog] = useState<{
    requestId: string
    action: 'approve' | 'reject'
    conflicts?: ProjectConflict[]
  } | null>(null)

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    // Check for project conflicts
    const response = await fetch(`/api/erp/hrm/leaves?employeeId=${request.employeeId}&status=pending`)
    const data = await response.json()
    
    // For now, just call onApprove
    onApprove(requestId, false)
  }

  if (requests.length === 0) {
    return null
  }

  return (
    <>
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
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
                        <AvatarFallback className="bg-yellow-100 text-yellow-700">
                          {request.employee_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{request.employee_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.employee_code} • {request.department}
                        </p>
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
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(request.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
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

      {confirmDialog && (
        <Dialog open onOpenChange={() => setConfirmDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmDialog.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
              </DialogTitle>
              <DialogDescription>
                {confirmDialog.conflicts && confirmDialog.conflicts.length > 0 ? (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Cảnh báo xung đột dự án</AlertTitle>
                    <AlertDescription>
                      <p>Nhân viên đang tham gia các dự án:</p>
                      <ul className="list-disc pl-5 mt-2">
                        {confirmDialog.conflicts.map((p, i) => (
                          <li key={i}>
                            <strong>{p.project_name}</strong> ({format(new Date(p.start_date), 'dd/MM/yyyy')} - {format(new Date(p.end_date), 'dd/MM/yyyy')})
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2">Bạn có chắc chắn muốn duyệt nghỉ phép không?</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p>Bạn có chắc chắn muốn {confirmDialog.action === 'approve' ? 'duyệt' : 'từ chối'} đơn nghỉ phép này?</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDialog(null)}>
                Hủy
              </Button>
              <Button
                onClick={() => {
                  if (confirmDialog.action === 'approve') {
                    onApprove(confirmDialog.requestId, !!confirmDialog.conflicts, confirmDialog.conflicts)
                  } else {
                    onReject(confirmDialog.requestId)
                  }
                  setConfirmDialog(null)
                }}
                className={confirmDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                Xác nhận
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

// =============================================================================
// EMPLOYEE LEAVE HISTORY DIALOG
// =============================================================================

interface EmployeeLeaveHistoryProps {
  employee: LeaveBalanceWithEmployee
  requests: LeaveRequestWithEmployee[]
  open: boolean
  onClose: () => void
}

function EmployeeLeaveHistoryDialog({ employee, requests, open, onClose }: EmployeeLeaveHistoryProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Lịch sử nghỉ phép - {employee.full_name}
          </DialogTitle>
          <DialogDescription>
            {employee.employee_code} • {employee.department}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Balance summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Phép năm</p>
              <p className="text-2xl font-bold text-blue-700">{employee.annualRemaining}/{employee.annualTotal}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Nghỉ ốm</p>
              <p className="text-2xl font-bold text-red-700">{employee.sickRemaining}/{employee.sickTotal}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 font-medium">Không lương</p>
              <p className="text-2xl font-bold text-gray-700">{employee.unpaidUsed}</p>
            </div>
          </div>

          {/* Requests timeline */}
          <div className="max-h-[400px] overflow-y-auto">
            <h4 className="font-medium mb-3">Các ngày đã xin nghỉ ({requests.length})</h4>
            {requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Chưa có đơn nghỉ phép nào</p>
            ) : (
              <div className="space-y-2">
                {requests.map(request => {
                  const typeConfig = LEAVE_TYPE_CONFIG[request.type]
                  const statusConfig = LEAVE_STATUS_CONFIG[request.status]

                  return (
                    <div key={request.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge className={`${typeConfig.color} text-white text-xs`}>
                            {typeConfig.labelVi}
                          </Badge>
                          <p className="text-sm font-medium mt-1">
                            {format(new Date(request.startDate), 'dd/MM/yyyy')}
                            {!isSameDay(new Date(request.startDate), new Date(request.endDate)) &&
                              ` - ${format(new Date(request.endDate), 'dd/MM/yyyy')}`}
                          </p>
                        </div>
                        <Badge variant="outline" className={statusConfig.color}>
                          {statusConfig.labelVi}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// ALL EMPLOYEES VIEW
// =============================================================================

interface AllEmployeesViewProps {
  balances: LeaveBalanceWithEmployee[]
  onSelectEmployee: (employeeId: string) => void
}

function AllEmployeesView({ balances, onSelectEmployee }: AllEmployeesViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBalances = balances.filter(b => 
    b.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Tất cả nhân viên ({balances.length})
        </CardTitle>
        <div className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {filteredBalances.map(balance => (
            <LeaveBalanceCard
              key={balance.id}
              balance={balance}
              onClick={() => onSelectEmployee(balance.employeeId)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface LeaveManagementEnhancedProps {
  employeeId: string
  isManager?: boolean
}

export function LeaveManagementEnhanced({ employeeId, isManager = false }: LeaveManagementEnhancedProps) {
  const [loading, setLoading] = useState(true)
  const [myBalance, setMyBalance] = useState<LeaveBalanceWithEmployee | null>(null)
  const [myRequests, setMyRequests] = useState<LeaveRequestWithEmployee[]>([])
  const [pendingRequests, setPendingRequests] = useState<LeaveRequestWithEmployee[]>([])
  const [allBalances, setAllBalances] = useState<LeaveBalanceWithEmployee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<{ balance: LeaveBalanceWithEmployee, requests: LeaveRequestWithEmployee[] } | null>(null)
  const [currentTab, setCurrentTab] = useState('my-leaves')

  useEffect(() => {
    loadData()
  }, [employeeId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load my balance
      const balanceRes = await fetch(`/api/erp/hrm/leaves/balance?employeeId=${employeeId}`)
      const balanceData = await balanceRes.json()
      if (balanceData.success) {
        setMyBalance(balanceData.data)
      }

      // Load my requests
      const requestsRes = await fetch(`/api/erp/hrm/leaves?employeeId=${employeeId}`)
      const requestsData = await requestsRes.json()
      if (requestsData.success) {
        setMyRequests(requestsData.data)
      }

      // Load pending approvals (if manager)
      if (isManager) {
        const pendingRes = await fetch('/api/erp/hrm/leaves?status=pending')
        const pendingData = await pendingRes.json()
        if (pendingData.success) {
          setPendingRequests(pendingData.data)
        }

        // Load all employees' balances
        const allBalancesRes = await fetch('/api/erp/hrm/leaves/balance')
        const allBalancesData = await allBalancesRes.json()
        if (allBalancesData.success) {
          setAllBalances(allBalancesData.data)
        }
      }
    } catch (error) {
      console.error('Error loading leave data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async (request: Partial<LeaveRequest>) => {
    try {
      const response = await fetch('/api/erp/hrm/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId,
          leaveType: request.type,
          startDate: request.startDate,
          endDate: request.endDate,
          totalDays: request.totalDays,
          reason: request.reason,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Đơn nghỉ phép đã được gửi!')
        loadData()
      } else {
        alert('Có lỗi xảy ra: ' + data.error)
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('Có lỗi xảy ra khi gửi đơn')
    }
  }

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return

    try {
      const response = await fetch(`/api/erp/hrm/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Đã hủy đơn nghỉ phép')
        loadData()
      }
    } catch (error) {
      console.error('Error canceling request:', error)
    }
  }

  const handleApprove = async (id: string, hasConflict: boolean, projects?: ProjectConflict[]) => {
    try {
      const response = await fetch(`/api/erp/hrm/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'approve',
          approverId: employeeId,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Đã duyệt đơn nghỉ phép')
        loadData()
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async (id: string) => {
    const reason = prompt('Lý do từ chối (tùy chọn):')
    
    try {
      const response = await fetch(`/api/erp/hrm/leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject',
          approverId: employeeId,
          rejectReason: reason,
        }),
      })

      const data = await response.json()
      if (data.success) {
        alert('Đã từ chối đơn nghỉ phép')
        loadData()
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const handleSelectEmployee = async (empId: string) => {
    try {
      const [balanceRes, requestsRes] = await Promise.all([
        fetch(`/api/erp/hrm/leaves/balance?employeeId=${empId}`),
        fetch(`/api/erp/hrm/leaves?employeeId=${empId}`)
      ])

      const balanceData = await balanceRes.json()
      const requestsData = await requestsRes.json()

      if (balanceData.success && requestsData.success) {
        setSelectedEmployee({
          balance: balanceData.data,
          requests: requestsData.data
        })
      }
    } catch (error) {
      console.error('Error loading employee data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!myBalance) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không thể tải dữ liệu nghỉ phép</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý nghỉ phép</h2>
          <p className="text-muted-foreground">Theo dõi và quản lý nghỉ phép của bạn</p>
        </div>
        <NewLeaveRequestDialog 
          balance={myBalance} 
          employeeId={employeeId}
          onSubmit={handleSubmitRequest} 
        />
      </div>

      {/* Tabs */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList>
          <TabsTrigger value="my-leaves">Nghỉ phép của tôi</TabsTrigger>
          {isManager && <TabsTrigger value="approvals">Chờ duyệt ({pendingRequests.length})</TabsTrigger>}
          {isManager && <TabsTrigger value="all-employees">Tất cả nhân viên</TabsTrigger>}
        </TabsList>

        <TabsContent value="my-leaves" className="space-y-6">
          {/* My balance */}
          <LeaveBalanceCard balance={myBalance} />

          {/* My requests */}
          <LeaveRequestsList 
            requests={myRequests} 
            onCancel={handleCancelRequest}
            currentUserId={employeeId}
          />
        </TabsContent>

        {isManager && (
          <TabsContent value="approvals" className="space-y-6">
            <PendingApprovals
              requests={pendingRequests}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </TabsContent>
        )}

        {isManager && (
          <TabsContent value="all-employees">
            <AllEmployeesView
              balances={allBalances}
              onSelectEmployee={handleSelectEmployee}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Employee detail dialog */}
      {selectedEmployee && (
        <EmployeeLeaveHistoryDialog
          employee={selectedEmployee.balance}
          requests={selectedEmployee.requests}
          open={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  )
}

export default LeaveManagementEnhanced

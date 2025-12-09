'use client'

import React, { useState } from 'react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Wifi, 
  Camera, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Home,
  QrCode,
  Fingerprint
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Attendance, 
  AttendanceStatus, 
  CheckInMethod,
  ATTENDANCE_STATUS_CONFIG,
  CHECKIN_METHOD_CONFIG,
  calculateWorkingHours,
  calculateOvertimeHours,
  DEFAULT_GEOFENCE_SITES
} from '../index'

// =============================================================================
// TYPES
// =============================================================================

interface AttendanceRecord extends Attendance {
  employeeName?: string
  employeeAvatar?: string
  employeeCode?: string
  department?: string
}

interface AttendanceTrackerProps {
  currentUser: {
    id: string
    name: string
    avatar?: string
    employeeCode: string
    department: string
  }
  attendanceHistory: AttendanceRecord[]
  geofenceSites: { id: string; name: string; address: string; latitude: number; longitude: number; radius: number }[]
  onCheckIn: (method: CheckInMethod, location?: { lat: number; lng: number }) => void
  onCheckOut: (method: CheckInMethod, location?: { lat: number; lng: number }) => void
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockAttendanceHistory: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: 'emp-1',
    employeeName: 'Nguyễn Văn A',
    employeeCode: 'NV001',
    department: 'Kỹ thuật',
    date: new Date(),
    checkInTime: new Date(new Date().setHours(8, 15)),
    checkInMethod: 'gps',
    checkOutTime: new Date(new Date().setHours(17, 30)),
    checkOutMethod: 'gps',
    status: 'present',
    workingHours: 8.25,
    overtimeHours: 0.25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    employeeId: 'emp-1',
    employeeName: 'Nguyễn Văn A',
    date: new Date(Date.now() - 86400000),
    checkInTime: new Date(new Date(Date.now() - 86400000).setHours(8, 45)),
    checkInMethod: 'wifi',
    checkOutTime: new Date(new Date(Date.now() - 86400000).setHours(17, 0)),
    checkOutMethod: 'wifi',
    status: 'late',
    workingHours: 7.25,
    overtimeHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    employeeId: 'emp-1',
    employeeName: 'Nguyễn Văn A',
    date: new Date(Date.now() - 86400000 * 2),
    status: 'work_from_home',
    checkInTime: new Date(new Date(Date.now() - 86400000 * 2).setHours(9, 0)),
    checkInMethod: 'manual',
    checkOutTime: new Date(new Date(Date.now() - 86400000 * 2).setHours(18, 0)),
    checkOutMethod: 'manual',
    workingHours: 8,
    overtimeHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// CHECK-IN METHOD ICON
// =============================================================================

const CheckInMethodIcon = ({ method }: { method: CheckInMethod }) => {
  const icons = {
    gps: MapPin,
    wifi: Wifi,
    face_id: Camera,
    manual: Clock,
    qr_code: QrCode,
    biometric: Fingerprint,
  }
  const Icon = icons[method]
  return <Icon className="h-4 w-4" />
}

// =============================================================================
// STATUS BADGE
// =============================================================================

const StatusBadge = ({ status }: { status: AttendanceStatus }) => {
  const config = ATTENDANCE_STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={`${config.color} text-white border-0`}>
      {config.labelVi}
    </Badge>
  )
}

// =============================================================================
// QUICK CHECK-IN CARD
// =============================================================================

interface QuickCheckInProps {
  isCheckedIn: boolean
  checkInTime?: Date
  onCheckIn: (method: CheckInMethod) => void
  onCheckOut: (method: CheckInMethod) => void
}

function QuickCheckIn({ isCheckedIn, checkInTime, onCheckIn, onCheckOut }: QuickCheckInProps) {
  const [selectedMethod, setSelectedMethod] = useState<CheckInMethod>('gps')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleAction = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    if (isCheckedIn) {
      onCheckOut(selectedMethod)
    } else {
      onCheckIn(selectedMethod)
    }
    setIsLoading(false)
  }

  const methods: { method: CheckInMethod; icon: React.ReactNode; label: string }[] = [
    { method: 'gps', icon: <MapPin className="h-5 w-5" />, label: 'GPS' },
    { method: 'wifi', icon: <Wifi className="h-5 w-5" />, label: 'WiFi' },
    { method: 'face_id', icon: <Camera className="h-5 w-5" />, label: 'Face ID' },
    { method: 'qr_code', icon: <QrCode className="h-5 w-5" />, label: 'QR Code' },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${isCheckedIn ? 'bg-green-500' : 'bg-blue-500'} text-white`}>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {isCheckedIn ? 'Đang làm việc' : 'Chưa check-in'}
        </CardTitle>
        <CardDescription className="text-white/80">
          {format(currentTime, 'HH:mm:ss - EEEE, dd/MM/yyyy', { locale: vi })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {isCheckedIn && checkInTime && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Giờ check-in</p>
            <p className="text-xl font-semibold">{format(checkInTime, 'HH:mm')}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-sm font-medium mb-3">Chọn phương thức</p>
          <div className="grid grid-cols-4 gap-2">
            {methods.map(({ method, icon, label }) => (
              <button
                key={method}
                onClick={() => setSelectedMethod(method)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  selectedMethod === method
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent bg-muted hover:border-muted-foreground/20'
                }`}
              >
                {icon}
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          variant={isCheckedIn ? 'destructive' : 'default'}
          onClick={handleAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xử lý...
            </span>
          ) : isCheckedIn ? (
            'Check-out'
          ) : (
            'Check-in'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// WEEKLY CALENDAR
// =============================================================================

interface WeeklyCalendarProps {
  selectedDate: Date
  attendanceData: AttendanceRecord[]
  onDateSelect: (date: Date) => void
  onWeekChange: (direction: 'prev' | 'next') => void
}

function WeeklyCalendar({ selectedDate, attendanceData, onDateSelect, onWeekChange }: WeeklyCalendarProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find(a => isSameDay(new Date(a.date), date))
  }

  const getStatusColor = (status?: AttendanceStatus) => {
    if (!status) return 'bg-gray-100'
    return ATTENDANCE_STATUS_CONFIG[status]?.color || 'bg-gray-100'
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lịch tuần</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onWeekChange('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, 'dd/MM')} - {format(weekEnd, 'dd/MM/yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={() => onWeekChange('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map(day => {
            const attendance = getAttendanceForDate(day)
            const isSelected = isSameDay(day, selectedDate)
            const today = isToday(day)
            const isWeekend = day.getDay() === 0 || day.getDay() === 6

            return (
              <button
                key={day.toISOString()}
                onClick={() => onDateSelect(day)}
                className={`p-2 rounded-lg text-center transition-all ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${today ? 'bg-primary/10' : ''} ${isWeekend ? 'opacity-50' : ''}`}
              >
                <p className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: vi })}
                </p>
                <p className={`text-lg font-semibold ${today ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </p>
                {attendance && (
                  <div className={`mt-1 h-2 w-2 mx-auto rounded-full ${getStatusColor(attendance.status)}`} />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
          {Object.entries(ATTENDANCE_STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full ${config.color}`} />
              <span className="text-xs text-muted-foreground">{config.labelVi}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// ATTENDANCE HISTORY
// =============================================================================

interface AttendanceHistoryProps {
  records: AttendanceRecord[]
}

function AttendanceHistory({ records }: AttendanceHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lịch sử chấm công</CardTitle>
        <CardDescription>7 ngày gần nhất</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {records.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu chấm công</p>
          ) : (
            records.map(record => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-bold">{format(new Date(record.date), 'd')}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(record.date), 'EEE', { locale: vi })}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={record.status} />
                      {record.checkInMethod && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckInMethodIcon method={record.checkInMethod} />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      {record.checkInTime && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {format(new Date(record.checkInTime), 'HH:mm')}
                        </span>
                      )}
                      {record.checkOutTime && (
                        <span className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-500" />
                          {format(new Date(record.checkOutTime), 'HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {record.workingHours !== undefined && (
                    <p className="font-semibold">{record.workingHours.toFixed(1)}h</p>
                  )}
                  {record.overtimeHours !== undefined && record.overtimeHours > 0 && (
                    <p className="text-xs text-orange-500">+{record.overtimeHours.toFixed(1)}h OT</p>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// STATS SUMMARY
// =============================================================================

interface StatsSummaryProps {
  records: AttendanceRecord[]
}

function StatsSummary({ records }: StatsSummaryProps) {
  const stats = React.useMemo(() => {
    const totalDays = records.length
    const presentDays = records.filter(r => r.status === 'present' || r.status === 'work_from_home').length
    const lateDays = records.filter(r => r.status === 'late').length
    const absentDays = records.filter(r => r.status === 'absent').length
    const totalHours = records.reduce((sum, r) => sum + (r.workingHours || 0), 0)
    const overtimeHours = records.reduce((sum, r) => sum + (r.overtimeHours || 0), 0)

    return { totalDays, presentDays, lateDays, absentDays, totalHours, overtimeHours }
  }, [records])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Có mặt</p>
              <p className="text-2xl font-bold text-green-500">{stats.presentDays}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500/30" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đi trễ</p>
              <p className="text-2xl font-bold text-yellow-500">{stats.lateDays}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500/30" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng giờ làm</p>
              <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</p>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground/30" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tăng ca</p>
              <p className="text-2xl font-bold text-orange-500">{stats.overtimeHours.toFixed(1)}h</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AttendanceTracker({
  currentUser,
  attendanceHistory = mockAttendanceHistory,
  geofenceSites = DEFAULT_GEOFENCE_SITES,
  onCheckIn,
  onCheckOut,
}: Partial<AttendanceTrackerProps>) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekOffset, setWeekOffset] = useState(0)

  // Check if user has checked in today
  const todayAttendance = attendanceHistory.find(a => isSameDay(new Date(a.date), new Date()))
  const isCheckedIn = !!todayAttendance?.checkInTime && !todayAttendance?.checkOutTime

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setWeekOffset(prev => (direction === 'prev' ? prev - 1 : prev + 1))
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + (weekOffset + (direction === 'prev' ? -1 : 1)) * 7)
    setSelectedDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <StatsSummary records={attendanceHistory} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Check-in */}
        <QuickCheckIn
          isCheckedIn={isCheckedIn}
          checkInTime={todayAttendance?.checkInTime ? new Date(todayAttendance.checkInTime) : undefined}
          onCheckIn={method => onCheckIn?.(method)}
          onCheckOut={method => onCheckOut?.(method)}
        />

        {/* Weekly Calendar */}
        <div className="lg:col-span-2">
          <WeeklyCalendar
            selectedDate={selectedDate}
            attendanceData={attendanceHistory}
            onDateSelect={setSelectedDate}
            onWeekChange={handleWeekChange}
          />
        </div>
      </div>

      {/* Attendance History */}
      <AttendanceHistory records={attendanceHistory} />
    </div>
  )
}

export default AttendanceTracker

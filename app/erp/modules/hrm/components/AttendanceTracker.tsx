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
  Fingerprint,
  Building2,
  Car,
  HardHat,
  MapPinned
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Attendance, 
  AttendanceStatus, 
  CheckInMethod,
  WorkMode,
  ProjectLocation,
  WORK_MODE_CONFIG,
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
  workMode: WorkMode
  workModeReason?: string
  projectId?: string // Added for construction_site mode
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
  projectList?: ProjectLocation[] // Added for construction_site mode
  onCheckIn: (method: CheckInMethod, workMode: WorkMode, reason?: string, location?: { lat: number; lng: number }, projectId?: string) => void
}

// Work Mode Icon Helper
const WorkModeIcon = ({ mode }: { mode: WorkMode }) => {
  const icons = {
    office: Building2,
    field_work: Car,
    construction_site: HardHat,
    remote: Home,
  }
  const Icon = icons[mode]
  return <Icon className="h-4 w-4" />
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
    workMode: 'office',
    checkInTime: new Date(new Date().setHours(8, 15)),
    checkInMethod: 'gps',
    status: 'present',
    workingHours: 8.25,
    overtimeHours: 0.25,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    employeeId: 'emp-2',
    employeeName: 'Trần Thị B',
    employeeCode: 'NV002',
    date: new Date(Date.now() - 86400000),
    workMode: 'field_work',
    workModeReason: 'Gặp khách hàng tại công ty ABC',
    checkInTime: new Date(new Date(Date.now() - 86400000).setHours(8, 30)),
    checkInMethod: 'gps',
    status: 'present',
    workingHours: 8,
    overtimeHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    employeeId: 'emp-3',
    employeeName: 'Lê Văn C',
    employeeCode: 'NV003',
    date: new Date(Date.now() - 86400000 * 2),
    workMode: 'construction_site',
    workModeReason: 'Thi công dự án Nhà máy điện mặt trời Ninh Thuận',
    projectLocation: 'Ninh Thuận',
    status: 'present',
    checkInTime: new Date(new Date(Date.now() - 86400000 * 2).setHours(7, 30)),
    checkInMethod: 'gps',
    workingHours: 9,
    overtimeHours: 1,
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
// PROJECT SELECTOR FOR CONSTRUCTION SITE
// =============================================================================

interface ProjectSelectorProps {
  projects: ProjectLocation[]
  selectedProjectId: string | null
  onProjectSelect: (projectId: string) => void
  currentUserId: string
}

function ProjectSelector({ projects, selectedProjectId, onProjectSelect, currentUserId }: ProjectSelectorProps) {
  // Filter projects where user is a team member
  const userProjects = projects.filter(p => 
    p.teamMembers?.some(m => m.employeeId === currentUserId && m.isActive)
  )

  if (userProjects.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          ⚠️ Bạn chưa được thêm vào dự án nào. Vui lòng liên hệ trưởng dự án.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Chọn dự án công trường</Label>
      <div className="space-y-2">
        {userProjects.map((project) => {
          const isSelected = selectedProjectId === project.id
          const memberCount = project.teamMembers?.filter(m => m.isActive).length || 0
          
          return (
            <button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {project.projectCode}
                    </Badge>
                    <Badge className="bg-green-500 text-white text-xs">
                      {project.status === 'active' ? 'Đang triển khai' : 'Planning'}
                    </Badge>
                  </div>
                  <p className="font-semibold text-sm mb-1">{project.projectName}</p>
                  <div className="flex items-start gap-1 text-xs text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{project.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {memberCount} thành viên
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPinned className="h-3 w-3" />
                      Bán kính {project.radius}m
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        💡 Bạn chỉ được check-in trong bán kính cho phép từ địa điểm dự án
      </p>
    </div>
  )
}

// =============================================================================
// WORK MODE SELECTOR
// =============================================================================

interface WorkModeSelectorProps {
  selectedMode: WorkMode
  onModeChange: (mode: WorkMode) => void
  reason: string
  onReasonChange: (reason: string) => void
  // Project selection for construction_site mode
  projects?: ProjectLocation[]
  selectedProjectId?: string | null
  onProjectSelect?: (projectId: string) => void
  currentUserId?: string
}

function WorkModeSelector({ 
  selectedMode, 
  onModeChange, 
  reason, 
  onReasonChange,
  projects = [],
  selectedProjectId = null,
  onProjectSelect,
  currentUserId,
}: WorkModeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Chọn chế độ làm việc</Label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(WORK_MODE_CONFIG).map(([key, config]) => {
            const mode = key as WorkMode
            const Icon = mode === 'office' ? Building2 :
                        mode === 'field_work' ? Car :
                        mode === 'construction_site' ? HardHat : Home
            
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedMode === mode
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${config.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{config.labelVi}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {config.descriptionVi}
                    </p>
                  </div>
                  {selectedMode === mode && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Project Selector for Construction Site */}
      {selectedMode === 'construction_site' && projects.length > 0 && currentUserId && onProjectSelect && (
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectSelect={onProjectSelect}
          currentUserId={currentUserId}
        />
      )}

      {/* Reason input for field_work */}
      {selectedMode === 'field_work' && (
        <div>
          <Label htmlFor="reason" className="text-sm font-medium">
            Mục đích công tác
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="reason"
            placeholder="VD: Gặp khách hàng ABC, họp tại văn phòng XYZ, khảo sát địa điểm..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="mt-2 min-h-[80px]"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            💡 Ghi rõ mục đích và địa điểm để quản lý dễ theo dõi
          </p>
        </div>
      )}

      {/* Note for construction_site - reason is from project */}
      {selectedMode === 'construction_site' && selectedProjectId && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            ℹ️ Địa điểm và thông tin dự án đã được setup sẵn bởi trưởng dự án.
            Bạn chỉ cần check-in trong phạm vi cho phép.
          </p>
        </div>
      )}

      {/* Info badges */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-lg border ${WORK_MODE_CONFIG[selectedMode].color} bg-opacity-10`}>
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Kiểm tra vị trí</p>
              <p className="text-xs text-muted-foreground">
                {WORK_MODE_CONFIG[selectedMode].requiresLocation 
                  ? WORK_MODE_CONFIG[selectedMode].allowMovement 
                    ? 'Cho phép di chuyển' 
                    : 'Cố định' 
                  : 'Không yêu cầu'}
              </p>
            </div>
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${WORK_MODE_CONFIG[selectedMode].color} bg-opacity-10`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Tần suất check</p>
              <p className="text-xs text-muted-foreground">
                {WORK_MODE_CONFIG[selectedMode].checkInterval
                  ? `${Math.floor(WORK_MODE_CONFIG[selectedMode].checkInterval! / (60 * 60 * 1000))}h`
                  : 'Không'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// QUICK CHECK-IN CARD
// =============================================================================

interface QuickCheckInProps {
  isCheckedIn: boolean
  checkInTime?: Date
  lastLocationCheck?: Date
  currentWorkMode?: WorkMode
  workModeReason?: string
  onCheckIn: (method: CheckInMethod, workMode: WorkMode, reason?: string, projectId?: string) => void
  onCancelCheckIn: () => void
  // Projects for construction site mode
  availableProjects?: ProjectLocation[]
  currentUserId?: string
}

function QuickCheckIn({ 
  isCheckedIn, 
  checkInTime, 
  lastLocationCheck, 
  currentWorkMode,
  workModeReason,
  onCheckIn, 
  onCancelCheckIn,
  availableProjects = [],
  currentUserId,
}: QuickCheckInProps) {
  const [selectedMethod, setSelectedMethod] = useState<CheckInMethod>('gps')
  const [selectedWorkMode, setSelectedWorkMode] = useState<WorkMode>('office')
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [locationStatus, setLocationStatus] = useState<'valid' | 'checking' | 'invalid'>('valid')
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null)
  const [showWorkModeDialog, setShowWorkModeDialog] = useState(false)

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto location check based on work mode
  React.useEffect(() => {
    if (!isCheckedIn || !currentWorkMode) return

    const config = WORK_MODE_CONFIG[currentWorkMode]
    
    // No location check for remote work
    if (!config.checkInterval) return

    // Don't check location for field_work mode (they're allowed to move)
    if (config.allowMovement && currentWorkMode === 'field_work') {
      // For field work, just log location periodically without validation
      const logInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('📍 Field work location:', position.coords.latitude, position.coords.longitude)
          },
          (error) => console.error('Location error:', error)
        )
      }, config.checkInterval)
      
      return () => clearInterval(logInterval)
    }

    const checkInterval = config.checkInterval
    const nextCheck = new Date(Date.now() + checkInterval)
    setNextCheckTime(nextCheck)

    const checkLocation = async () => {
      setLocationStatus('checking')
      
      // Simulate location check
      const isInRange = await new Promise<boolean>((resolve) => {
        setTimeout(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // For construction sites, allow some movement within larger radius
              const allowedMovement = currentWorkMode === 'construction_site'
              const inRange = allowedMovement ? Math.random() > 0.05 : Math.random() > 0.1
              resolve(inRange)
            },
            () => {
              resolve(false)
            }
          )
        }, 1000)
      })
// Validate reason for field_work and construction_site
    if ((selectedWorkMode === 'field_work' || selectedWorkMode === 'construction_site') && !reason.trim()) {
      alert('⚠️ Vui lòng nhập mục đích/địa điểm công tác')
      return
    }

    setIsLoading(true)
    setShowWorkModeDialog(false)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onCheckIn(selectedMethod, selectedWorkMode, reason || undefinew Date(Date.now() + nextInterval))
      } else {
        setLocationStatus('invalid')
        setTimeout(() => {
          onCancelCheckIn()
        }, 5000)
      }
    }

    const timer = setTimeout(checkLocation, checkInterval)
    return () => clearTimeout(timer)
  }, [isCheckedIn, currentWorkMode, onCancelCheckIn])

  const handleAction = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    onCheckIn(selectedMethod)
    setIsLoading(false)
  }

  const calculateTimeUntilNextCheck = () => {
    if (!nextCheckTime) return null
    const diff = nextCheckTime.getTime() - currentTime.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const methods: { method: CheckInMethod; icon: React.ReactNode; label: string }[] = [
    { method: 'gps', icon: <MapPin className="h-5 w-5" />, label: 'GPS' },
    { method: 'wifi', icon: <Wifi className="h-5 w-5" />, label: 'WiFi' },
    { method: 'face_id', icon: <Camera className="h-5 w-5" />, label: 'Face ID' },
    { method: 'qr_code', icon: <QrCode className="h-5 w-5" />, label: 'QR Code' },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${
        locationStatus === 'invalid' 
          ? 'bg-red-500' 
          : isCheckedIn 
            ? 'bg-green-500' 
            : 'bg-blue-500'
      } text-white`}>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {locationStatus === 'invalid' 
            ? '⚠️ Rời khỏi vị trí' 
            : isCheckedIn 
              ? '✓ Đang làm việc' 
              : 'Chưa check-in'}
        </CardTitle>
        <CardDescription className="text-white/80">
          {format(currentTime, 'HH:mm:ss - EEEE, dd/MM/yyyy', { locale: vi })}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {/* Location Status Warning */}
        {locationStatus === 'invalid' && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Phát hiện rời khỏi vị trí làm việc</p>
                <p className="text-xs text-red-700 mt-1">
                  Check-in sẽ bị hủy trong 5 giây. Vui lòng quay lại vị trí hoặc check-in lại.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location Checking */}
        {locationStatus === 'checking' && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm text-blue-900">Đang kiểm tra vị trí...</p>
            </div>
          </div>
        )}

        {/* Work Mode & Check-in Info */}
        {isCheckedIn && checkInTime && locationStatus !== 'invalid' && (
          <div className="mb-4 space-y-3">
            {/* Current Work Mode */}
            {currentWorkMode && (
              <div className={`p-3 border rounded-lg ${WORK_MODE_CONFIG[currentWorkMode].color} bg-opacity-10`}>
                <div className="flex items-start gap-2">
                  <WorkModeIcon mode={currentWorkMode} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{WORK_MODE_CONFIG[currentWorkMode].labelVi}</p>
                    {workModeReason && (
                      <p className="text-xs text-muted-foreground mt-1">{workModeReason}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Check-in Time */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs text-green-700 font-medium">Giờ check-in</p>
              <p className="text-2xl font-bold text-green-900">{format(checkInTime, 'HH:mm')}</p>
            </div>
            
            {/* Next Location Check */}
            {nextCheckTime && currentWorkMode !== 'field_work' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-700">Kiểm tra vị trí tiếp theo sau</p>
                    <p className="text-sm font-semibold text-blue-900">{calculateTimeUntilNextCheck()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Field Work - No location check needed */}
            {currentWorkMode === 'field_work' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-amber-600" />
                  <p className="text-xs text-amber-700">
                    Bạn được phép di chuyển tự do. Vị trí được ghi nhận định kỳ để theo dõi.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Method Selection - Only show when not checked in */}
        {!isCheckedIn && (
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
        )}

        {/* Info when checked in */}
        {isCheckedIn && locationStatus === 'valid' && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Bạn đã check-in thành công</p>
                <p className="text-xs text-green-700 mt-1">
                  Hệ thống sẽ tự động kiểm tra vị trí mỗi 2-3 tiếng. Vui lòng ở trong phạm vi làm việc.
                </p>
                <p className="text-xs text-green-600 mt-2 italic">
                  💡 Không cần check-out. Hệ thống tự động tính giờ làm việc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Check-in Button with Work Mode Dialog */}
        {!isCheckedIn && (
          <Dialog open={showWorkModeDialog} onOpenChange={setShowWorkModeDialog}>
            <DialogTrigger asChild>
              <Button
                className="w-full"
                size="lg"
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
                ) : (
                  'Check-in ngay'
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Check-in - Chọn chế độ làm việc</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Work Mode Selector */}
                <WorkModeSelector
                  selectedMode={selectedWorkMode}
                  onModeChange={setSelectedWorkMode}
                  reason={reason}
                  onReasonChange={setReason}
                  projects={availableProjects}
                  selectedProjectId={selectedProjectId}
                  onProjectSelect={setSelectedProjectId}
                  currentUserId={currentUserId}
                />

                {/* Check-in Method */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Phương thức check-in</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { method: 'gps' as CheckInMethod, icon: <MapPin className="h-5 w-5" />, label: 'GPS' },
                      { method: 'wifi' as CheckInMethod, icon: <Wifi className="h-5 w-5" />, label: 'WiFi' },
                      { method: 'face_id' as CheckInMethod, icon: <Camera className="h-5 w-5" />, label: 'Face ID' },
                      { method: 'qr_code' as CheckInMethod, icon: <QrCode className="h-5 w-5" />, label: 'QR Code' },
                    ].map(({ method, icon, label }) => (
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

                {/* Confirm Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleAction}
                  disabled={isLoading}
                >
                  Xác nhận Check-in
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
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
        <CardCoancelCheckIn = () => {
    if (!todayRecord) return
    
    console.log('🚫 Check-in bị hủy do rời khỏi vị trí làm việc')
    
    // Remove today's record
    setTodayRecord(null)
    setAttendanceHistory(prev => prev.filter(a => a.id !== todayRecord.id))
    
    // Show notification
    alert('⚠️ Check-in đã bị hủy do bạn rời khỏi vị trí làm việc. Vui lòng check-in lại.'
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AttendanceTracker({
  currentUser,
  attendanceHistory: initialHistory = mockAttendanceHistory,
  geofenceSites = DEFAULT_GEOFENCE_SITES,
  projectList = [], // Projects for construction_site mode
  onCheckIn: externalCheckIn,
  onCheckOut: externalCheckOut,
}: Partial<AttendanceTrackerProps>) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [weekOffset, setWeekOffset] = useState(0)
  const [attendanceHistory, setAttendanceHistory] = useState(initialHistory)
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(() => {
    return initialHistory.find(a => isSameDay(new Date(a.date), new Date())) || null
  })

  // Check if user has checked in today
  const isCheckedIn = !!todayRecord?.checkInTime && !todayRecord?.checkOutTime
  const isCheckedOut = !!todayRecord?.checkInTime && !!todayRecord?.checkOutTime

  const handleCheckIn = (method: CheckInMethod, workMode: WorkMode, reason?: string, projectId?: string) => {
    const now = new Date()
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: currentUser?.id || 'emp-1',
      employeeName: currentUser?.name || 'Nguyen Van Admin',
      employeeCode: currentUser?.employeeCode || 'GES001',
      department: currentUser?.department || 'Ban Giam Doc',
      date: now,
      workMode,
      workModeReason: reason,
      projectId, // Save project ID for construction_site mode
      checkInTime: now,
      checkInMethod: method,
      status: now.getHours() >= 9 ? 'late' : 'present',
      workingHours: 0,
      overtimeHours: 0,
      createdAt: now,
      updatedAt: now,
    }
    
    setTodayRecord(newRecord)
    setAttendanceHistory(prev => [newRecord, ...prev.filter(a => !isSameDay(new Date(a.date), now))])
    
    // Call external callback if provided
    externalCheckIn?.(method, workMode, reason, projectId)
  }

  const handleCheckOut = (method: CheckInMethod) => {
    if (!todayRecord) return
    
    const now = new Date()
    const checkInTime = new Date(todayRecord.checkInTime!)
    const workingHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
    const overtimeHours = Math.max(0, workingHours - 8)
    
    const updatedRecord: AttendanceRecord = {
      ...todayRecord,
      checkOutTime: now,
      checkOutMethod: method,
      workingHours: Math.round(workingHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      updatedAt: now,
    }
    
    setTodayRecord(updatedRecord)
    setAttendanceHistory(prev => [updatedRecord, ...prev.filter(a => a.id !== todayRecord.id)])
    
    // Call external callback if provided
    externalCheckOut?.(method)
  }

  const handleCancelCheckIn = () => {
    if (!todayRecord) return
    
    console.log('🚫 Check-in bị hủy do rời khỏi vị trí làm việc')
    
    // Remove today's record
    setTodayRecord(null)
    setAttendanceHistory(prev => prev.filter(a => a.id !== todayRecord.id))
    
    // Show notification
    alert('⚠️ Check-in đã bị hủy do bạn rời khỏi vị trí làm việc. Vui lòng check-in lại.')
  }

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
          checkInTime={todayRecord?.checkInTime ? new Date(todayRecord.checkInTime) : undefined}
          currentWorkMode={todayRecord?.workMode}
          workModeReason={todayRecord?.workModeReason}
          onCheckIn={handleCheckIn}
          onCancelCheckIn={handleCancelCheckIn}
          availableProjects={projectList}
          currentUserId={currentUser?.id}
        />

        {/* Weekly Calendar */}
        <div className="lg:col-span-2">
          <WeeklyCalendar
            selectedDate={selectedDate}
            attendanceData={attendanceHistory}
            onDateSelect={setSelectedDate}
            onWeekChange={handleWeekChange}
          />
        </divancelCheckIn={handleCancelCheckIn
      </div>

      {/* Today's Status */}
      {todayRecord && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Hom nay</h3>
                <p className="text-sm text-gray-600">
                  Check-in: {todayRecord.checkInTime ? format(new Date(todayRecord.checkInTime), 'HH:mm') : '-'}
                  {todayRecord.checkOutTime && ` | Check-out: ${format(new Date(todayRecord.checkOutTime), 'HH:mm')}`}
                </p>
              </div>
              <StatusBadge status={todayRecord.status} />
            </div>
          </CardContent>
        </Card>
      )}
 flex items-center gap-2">
                  Hôm nay
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Đang làm việc
                  </Badge>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  ✓ Check-in: {todayRecord.checkInTime ? format(new Date(todayRecord.checkInTime), 'HH:mm') : '-'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  💡 Hệ thống sẽ tự động kiểm tra vị trí định kỳ
  )
}

export default AttendanceTracker

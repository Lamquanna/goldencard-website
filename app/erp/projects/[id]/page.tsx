'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Bell,
  BellOff,
  BarChart3,
  MessageSquare,
  FileText,
  Settings,
  MoreHorizontal,
} from 'lucide-react'
import { format, differenceInDays, isAfter, isBefore } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Project, ProjectStatus, PROJECT_STATUS_CONFIG } from '@/app/erp/modules/project'

// =============================================================================
// TYPES
// =============================================================================

interface DeadlineAlert {
  type: 'danger' | 'warning' | 'info'
  message: string
  daysLeft: number
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getProgressColor(progress: number, daysLeft: number, deadline: Date): string {
  const now = new Date()
  const isNearDeadline = daysLeft <= 7 && isAfter(deadline, now)
  
  // Đỏ: Gần deadline (≤7 ngày) và tiến độ < 80%
  if (isNearDeadline && progress < 80) {
    return 'bg-red-500'
  }
  
  // Vàng: Gần deadline và tiến độ 80-90%
  if (isNearDeadline && progress >= 80 && progress < 90) {
    return 'bg-yellow-500'
  }
  
  // Xanh: Tiến độ ≥ 90% hoặc còn nhiều thời gian
  if (progress >= 90 || !isNearDeadline) {
    return 'bg-green-500'
  }
  
  // Xanh dương: Mặc định
  return 'bg-blue-500'
}

function getDeadlineAlert(
  progress: number, 
  startDate: Date, 
  endDate: Date
): DeadlineAlert | null {
  const now = new Date()
  const daysLeft = differenceInDays(endDate, now)
  const totalDays = differenceInDays(endDate, startDate)
  const expectedProgress = ((totalDays - daysLeft) / totalDays) * 100

  // Đã quá deadline
  if (daysLeft < 0) {
    return {
      type: 'danger',
      message: `Dự án đã quá deadline ${Math.abs(daysLeft)} ngày! Tiến độ hiện tại: ${progress}%`,
      daysLeft,
    }
  }

  // Còn ≤ 7 ngày và tiến độ < 80%
  if (daysLeft <= 7 && progress < 80) {
    return {
      type: 'danger',
      message: `Chỉ còn ${daysLeft} ngày đến deadline nhưng tiến độ mới ${progress}%! Cần tăng tốc ngay.`,
      daysLeft,
    }
  }

  // Còn ≤ 7 ngày và tiến độ 80-89%
  if (daysLeft <= 7 && progress >= 80 && progress < 90) {
    return {
      type: 'warning',
      message: `Còn ${daysLeft} ngày đến deadline, tiến độ ${progress}%. Cần hoàn thành sớm.`,
      daysLeft,
    }
  }

  // Tiến độ chậm so với kế hoạch
  if (progress < expectedProgress - 20 && daysLeft > 0) {
    return {
      type: 'warning',
      message: `Tiến độ chậm hơn kế hoạch! Tiến độ thực tế: ${progress}%, tiến độ dự kiến: ${Math.round(expectedProgress)}%`,
      daysLeft,
    }
  }

  return null
}

// Mock notification function (in production, call API)
async function sendProjectNotification(projectId: string, message: string, memberIds: string[]) {
  console.log('📤 Sending notification:', { projectId, message, memberIds })
  // TODO: Call API endpoint to send notifications
  // await fetch('/api/notifications/send', {
  //   method: 'POST',
  //   body: JSON.stringify({ projectId, message, memberIds })
  // })
}

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    key: 'WEB',
    description: 'Thiết kế lại giao diện website công ty với công nghệ mới nhất',
    color: '#3B82F6',
    status: 'active',
    startDate: new Date(2026, 0, 5), // 5/1/2026
    endDate: new Date(2026, 0, 20),  // 20/1/2026 - Gần deadline!
    progress: 65,
    totalTasks: 24,
    completedTasks: 16,
    ownerId: 'u1',
    owner: { id: 'u1', name: 'Nguyễn Văn A' },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date() },
      { userId: 'u2', role: 'member', joinedAt: new Date() },
      { userId: 'u3', role: 'member', joinedAt: new Date() },
    ],
    isPublic: true,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    name: 'Mobile App Development',
    key: 'APP',
    description: 'Phát triển ứng dụng di động cho khách hàng',
    color: '#10B981',
    status: 'active',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 0, 15),  // Rất gần deadline
    progress: 45, // Tiến độ thấp!
    totalTasks: 48,
    completedTasks: 22,
    ownerId: 'u2',
    owner: { id: 'u2', name: 'Trần Thị B' },
    members: [
      { userId: 'u2', role: 'owner', joinedAt: new Date() },
      { userId: 'u1', role: 'admin', joinedAt: new Date() },
      { userId: 'u4', role: 'member', joinedAt: new Date() },
    ],
    isPublic: false,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p3',
    name: 'CRM Implementation',
    key: 'CRM',
    description: 'Triển khai hệ thống CRM mới',
    color: '#8B5CF6',
    status: 'planning',
    startDate: new Date(2026, 1, 1),
    endDate: new Date(2026, 5, 30),
    progress: 10,
    totalTasks: 16,
    completedTasks: 2,
    ownerId: 'u1',
    owner: { id: 'u1', name: 'Nguyễn Văn A' },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date() },
      { userId: 'u3', role: 'member', joinedAt: new Date() },
    ],
    isPublic: true,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundProject = mockProjects.find(p => p.id === projectId)
    setProject(foundProject || null)
    setLoading(false)

    // Load notification preference from localStorage
    const savedPref = localStorage.getItem(`project_${projectId}_notifications`)
    if (savedPref !== null) {
      setNotificationsEnabled(savedPref === 'true')
    }
  }, [projectId])

  useEffect(() => {
    if (!project || !project.startDate || !project.endDate) return

    // Check if we need to send alerts
    const alert = getDeadlineAlert(project.progress, project.startDate, project.endDate)
    
    if (alert && alert.type === 'danger' && notificationsEnabled) {
      // Send notification to all members
      const memberIds = project.members.map(m => m.userId)
      sendProjectNotification(
        project.id,
        `🚨 ${project.name}: ${alert.message}`,
        memberIds
      )
    }
  }, [project, notificationsEnabled])

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    localStorage.setItem(`project_${projectId}_notifications`, enabled.toString())
    
    if (enabled) {
      window.alert('✅ Đã bật thông báo cho dự án này')
    } else {
      window.alert('🔕 Đã tắt thông báo cho dự án này')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dự án...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy dự án</h2>
          <p className="text-muted-foreground mb-6">Dự án với ID "{projectId}" không tồn tại.</p>
          <Button onClick={() => router.push('/erp/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const daysLeft = project.endDate ? differenceInDays(project.endDate, new Date()) : 0
  const progressColor = project.endDate ? getProgressColor(project.progress, daysLeft, project.endDate) : 'bg-blue-500'
  const deadlineAlert = project.startDate && project.endDate ? getDeadlineAlert(project.progress, project.startDate, project.endDate) : null

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <div>
        <Link href="/erp/projects">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dự án
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/erp/projects')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: project.color }}
              >
                {project.key.substring(0, 2)}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground">{project.key}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`${statusConfig.color} text-white border-0 text-sm px-4 py-2`}>
            {statusConfig.labelVi}
          </Badge>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Deadline Alert */}
      {deadlineAlert && (
        <Alert variant={deadlineAlert.type === 'danger' ? 'destructive' : 'default'} className={deadlineAlert.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : ''}>
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold">
            {deadlineAlert.type === 'danger' ? 'Cảnh báo khẩn cấp!' : 'Lưu ý tiến độ'}
          </AlertTitle>
          <AlertDescription className="text-base">
            {deadlineAlert.message}
            {notificationsEnabled && (
              <span className="block mt-2 text-sm opacity-80">
                📱 Thông báo đã được gửi đến tất cả thành viên dự án
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ngày bắt đầu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{project.startDate ? format(project.startDate, 'dd/MM', { locale: vi }) : 'N/A'}</p>
                <p className="text-xs text-muted-foreground">{project.startDate ? format(project.startDate, 'yyyy', { locale: vi }) : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Deadline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${daysLeft <= 7 ? 'text-red-500' : 'text-orange-500'}`} />
              <div>
                <p className="text-2xl font-bold">{project.endDate ? format(project.endDate, 'dd/MM', { locale: vi }) : 'N/A'}</p>
                <p className={`text-xs font-medium ${daysLeft <= 7 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? 'Hôm nay!' : `Quá ${Math.abs(daysLeft)} ngày`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tiến độ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-5 w-5 ${progressColor.replace('bg-', 'text-')}`} />
              <div className="flex-1">
                <p className="text-2xl font-bold">{project.progress}%</p>
                <Progress value={project.progress} className={`h-2 mt-1 ${progressColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{project.completedTasks}/{project.totalTasks}</p>
                <p className="text-xs text-muted-foreground">Hoàn thành</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Mô tả dự án
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description}</p>
            </CardContent>
          </Card>

          {/* Progress Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Chi tiết tiến độ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tiến độ tổng thể</span>
                  <span className="text-2xl font-bold">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className={`h-4 ${progressColor}`} />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Đã hoàn thành {project.completedTasks} công việc</span>
                  <span>Còn lại {project.totalTasks - project.completedTasks} công việc</span>
                </div>
              </div>

              {/* Progress Color Legend */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium mb-3">Ý nghĩa màu sắc:</p>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span>Xanh lá: Tiến độ tốt (≥90% hoặc còn nhiều thời gian)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-blue-500"></div>
                    <span>Xanh dương: Tiến độ ổn định</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-yellow-500"></div>
                    <span>Vàng: Cần chú ý (gần deadline, 80-90%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span>Đỏ: Khẩn cấp (gần deadline, &lt;80%)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs for additional content */}
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="tasks">Công việc</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="files">Tài liệu</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Danh sách công việc đang được phát triển...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="timeline">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Timeline dự án đang được phát triển...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="files">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground py-8">
                    Quản lý tài liệu đang được phát triển...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5" />
                Cài đặt thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notificationsEnabled ? (
                    <Bell className="h-4 w-4 text-blue-500" />
                  ) : (
                    <BellOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="notifications" className="cursor-pointer">
                    Thông báo tự động
                  </Label>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {notificationsEnabled
                  ? '✅ Bạn sẽ nhận thông báo khi dự án gần deadline và tiến độ chậm'
                  : '🔕 Thông báo đã tắt. Bạn sẽ không nhận cảnh báo tự động'}
              </p>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5" />
                Thành viên ({project.members.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.members.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {member.userId.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">User {member.userId}</p>
                      <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                    </div>
                    {member.role === 'owner' && (
                      <Badge variant="outline" className="text-xs">Owner</Badge>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Thêm thành viên
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Thảo luận
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Báo cáo
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

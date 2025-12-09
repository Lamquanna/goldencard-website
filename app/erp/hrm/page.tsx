'use client'

import React from 'react'
import { 
  Users, 
  Clock, 
  Calendar, 
  Wallet, 
  Building2,
  TrendingUp,
  UserPlus,
  UserMinus,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

// =============================================================================
// MOCK DATA
// =============================================================================

const stats = {
  totalEmployees: 32,
  activeEmployees: 28,
  onLeave: 3,
  newHires: 4,
  resignations: 1,
  attendanceRate: 94.5,
  leaveRequests: 5,
  pendingApprovals: 3,
}

const departmentBreakdown = [
  { name: 'Kỹ thuật', count: 12, color: 'bg-blue-500' },
  { name: 'Kinh doanh', count: 8, color: 'bg-green-500' },
  { name: 'Marketing', count: 5, color: 'bg-purple-500' },
  { name: 'Tài chính', count: 4, color: 'bg-yellow-500' },
  { name: 'Nhân sự', count: 3, color: 'bg-pink-500' },
]

const recentActivities = [
  { id: '1', type: 'check_in', employee: 'Nguyễn Văn A', time: '08:15', status: 'on_time' },
  { id: '2', type: 'leave_request', employee: 'Trần Thị B', time: '09:30', status: 'pending' },
  { id: '3', type: 'check_in', employee: 'Lê Văn C', time: '08:45', status: 'late' },
  { id: '4', type: 'leave_approved', employee: 'Phạm Thị D', time: '10:00', status: 'approved' },
  { id: '5', type: 'check_out', employee: 'Hoàng Văn E', time: '17:30', status: 'on_time' },
]

const upcomingLeaves = [
  { employee: 'Nguyễn Thị F', department: 'Marketing', startDate: '20/02', endDate: '22/02', days: 3 },
  { employee: 'Trần Văn G', department: 'Kỹ thuật', startDate: '25/02', endDate: '25/02', days: 1 },
  { employee: 'Lê Thị H', department: 'Kinh doanh', startDate: '01/03', endDate: '05/03', days: 5 },
]

const quickActions = [
  { label: 'Thêm nhân viên', icon: UserPlus, href: '/erp/hrm/employees?action=new', color: 'text-blue-500' },
  { label: 'Chấm công hôm nay', icon: Clock, href: '/erp/hrm/attendance', color: 'text-green-500' },
  { label: 'Duyệt nghỉ phép', icon: Calendar, href: '/erp/hrm/leaves?filter=pending', color: 'text-orange-500' },
  { label: 'Xử lý lương', icon: Wallet, href: '/erp/hrm/payroll', color: 'text-purple-500' },
]

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor 
}: { 
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: React.ElementType
  iconColor: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                changeType === 'up' ? 'text-green-500' : 'text-red-500'
              }`}>
                {changeType === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {change}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconColor}/10`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityIcon({ type, status }: { type: string; status: string }) {
  const getIcon = () => {
    switch (type) {
      case 'check_in':
        return <Clock className={`h-4 w-4 ${status === 'late' ? 'text-yellow-500' : 'text-green-500'}`} />
      case 'check_out':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'leave_request':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'leave_approved':
        return <Calendar className="h-4 w-4 text-green-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="p-2 rounded-full bg-muted">
      {getIcon()}
    </div>
  )
}

function ActivityLabel({ type, status }: { type: string; status: string }) {
  const labels: Record<string, string> = {
    check_in: status === 'late' ? 'Check-in trễ' : 'Check-in',
    check_out: 'Check-out',
    leave_request: 'Xin nghỉ phép',
    leave_approved: 'Duyệt nghỉ phép',
  }
  return <span className="text-sm text-muted-foreground">{labels[type]}</span>
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function HRMDashboard() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân sự</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động nhân sự</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/erp/hrm/reports">
              <TrendingUp className="h-4 w-4 mr-2" />
              Báo cáo
            </Link>
          </Button>
          <Button asChild>
            <Link href="/erp/hrm/employees?action=new">
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm nhân viên
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng nhân viên"
          value={stats.totalEmployees}
          change="+4 tháng này"
          changeType="up"
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Tỷ lệ chuyên cần"
          value={`${stats.attendanceRate}%`}
          change="+2.1%"
          changeType="up"
          icon={Clock}
          iconColor="text-green-500"
        />
        <StatCard
          title="Đơn nghỉ phép"
          value={stats.leaveRequests}
          change={`${stats.pendingApprovals} chờ duyệt`}
          icon={Calendar}
          iconColor="text-orange-500"
        />
        <StatCard
          title="Đang nghỉ"
          value={stats.onLeave}
          icon={UserMinus}
          iconColor="text-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors"
              >
                <action.icon className={`h-8 w-8 ${action.color}`} />
                <span className="text-sm font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Department Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân bổ phòng ban</CardTitle>
            <CardDescription>{stats.totalEmployees} nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentBreakdown.map(dept => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.count} người</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dept.color}`}
                      style={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/erp/hrm/departments">
                Xem chi tiết phòng ban
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
            <CardDescription>Hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-center gap-3">
                  <ActivityIcon type={activity.type} status={activity.status} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{activity.employee}</p>
                    <ActivityLabel type={activity.type} status={activity.status} />
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/erp/hrm/attendance">
                Xem tất cả
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Leaves */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lịch nghỉ sắp tới</CardTitle>
            <CardDescription>7 ngày tới</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingLeaves.map((leave, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{leave.employee.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{leave.employee}</p>
                    <p className="text-sm text-muted-foreground">{leave.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {leave.startDate === leave.endDate 
                        ? leave.startDate 
                        : `${leave.startDate} - ${leave.endDate}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{leave.days} ngày</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/erp/hrm/leaves">
                Xem tất cả
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {stats.pendingApprovals > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Có {stats.pendingApprovals} đơn nghỉ phép đang chờ duyệt</p>
                <p className="text-sm text-muted-foreground">Vui lòng xử lý các đơn chờ duyệt</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/erp/hrm/leaves?filter=pending">
                Xem ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

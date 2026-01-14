'use client'

import React, { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { 
  Users, 
  Clock, 
  Calendar, 
  Wallet, 
  UserPlus,
  UserMinus,
  AlertCircle,
  ChevronRight,
  ArrowUpRight,
  ArrowLeft,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { toast } from 'sonner'

// =============================================================================
// COMPONENTS
// =============================================================================

function StatCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor,
  loading 
}: { 
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  icon: React.ElementType
  iconColor: string
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin mt-2" />
            ) : (
              <>
                <p className="text-2xl font-bold mt-1">{value}</p>
                {change && (
                  <div className={`flex items-center gap-1 mt-1 text-sm ${
                    changeType === 'up' ? 'text-green-500' : 'text-orange-500'
                  }`}>
                    <ArrowUpRight className="h-4 w-4" />
                    {change}
                  </div>
                )}
              </>
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

const quickActions = [
  { label: 'Thêm nhân viên', icon: UserPlus, href: '/erp/hrm/employees?action=new', color: 'text-blue-500' },
  { label: 'Chấm công hôm nay', icon: Clock, href: '/erp/hrm/attendance', color: 'text-green-500' },
  { label: 'Duyệt nghỉ phép', icon: Calendar, href: '/erp/hrm/leaves?filter=pending', color: 'text-orange-500' },
  { label: 'Xử lý lương', icon: Wallet, href: '/erp/hrm/payroll', color: 'text-purple-500' },
]

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function HRMDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    departments: [] as { name: string; count: number }[],
  })

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await authFetch('/api/erp/employees')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      const employees = data.employees || []
      
      // Calculate stats from real data
      const activeCount = employees.filter((e: any) => e.status === 'active').length
      const onLeaveCount = employees.filter((e: any) => e.status === 'on_leave').length
      
      // Group by department
      const deptMap = new Map<string, number>()
      employees.forEach((e: any) => {
        const dept = e.department || 'Chưa phân công'
        deptMap.set(dept, (deptMap.get(dept) || 0) + 1)
      })
      
      const departments = Array.from(deptMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)

      setStats({
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        onLeave: onLeaveCount,
        departments,
      })
    } catch (error) {
      console.error('Error loading stats:', error)
      toast.error('Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500']

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <div className="mb-4">
        <Link href="/erp/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý nhân sự</h1>
          <p className="text-muted-foreground">Dữ liệu nhân viên thực tế từ hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
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
          change={stats.totalEmployees > 0 ? "Dữ liệu thực" : undefined}
          changeType="up"
          icon={Users}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatCard
          title="Đang làm việc"
          value={stats.activeEmployees}
          icon={Clock}
          iconColor="text-green-500"
          loading={loading}
        />
        <StatCard
          title="Đang nghỉ phép"
          value={stats.onLeave}
          icon={Calendar}
          iconColor="text-orange-500"
          loading={loading}
        />
        <StatCard
          title="Phòng ban"
          value={stats.departments.length}
          icon={UserMinus}
          iconColor="text-purple-500"
          loading={loading}
        />
      </div>

      {/* Empty State */}
      {!loading && stats.totalEmployees === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có nhân viên nào</h3>
            <p className="text-gray-500 mb-6">Bắt đầu thêm nhân viên đầu tiên vào hệ thống</p>
            <Button asChild size="lg">
              <Link href="/erp/hrm/employees?action=new">
                <UserPlus className="h-5 w-5 mr-2" />
                Thêm nhân viên đầu tiên
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-2 border-gray-300 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Thao tác nhanh</CardTitle>
          <CardDescription>Các chức năng chính của hệ thống HRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map(action => (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-gray-400 hover:border-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-200 bg-white"
              >
                <action.icon className={`h-10 w-10 ${action.color}`} />
                <span className="text-sm font-bold text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown - Only show if have data */}
      {stats.departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân bổ theo phòng ban</CardTitle>
            <CardDescription>{stats.totalEmployees} nhân viên</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.departments.map((dept, idx) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.count} người</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[idx % colors.length]}`}
                      style={{ width: `${(dept.count / stats.totalEmployees) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" asChild>
              <Link href="/erp/hrm/employees">
                Xem danh sách nhân viên
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Direct Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/erp/hrm/employees">
            <CardContent className="pt-6 flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Danh sách nhân viên</h3>
                <p className="text-sm text-muted-foreground">Xem và quản lý tất cả nhân viên</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/erp/hrm/attendance">
            <CardContent className="pt-6 flex items-center gap-4">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Chấm công</h3>
                <p className="text-sm text-muted-foreground">Quản lý thời gian làm việc</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </CardContent>
          </Link>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/erp/hrm/leaves">
            <CardContent className="pt-6 flex items-center gap-4">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <h3 className="font-semibold">Nghỉ phép</h3>
                <p className="text-sm text-muted-foreground">Duyệt đơn xin nghỉ</p>
              </div>
              <ChevronRight className="h-5 w-5 ml-auto" />
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}

'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  UserPlus,
  Loader2,
  Users,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api/client'

// =============================================================================
// TYPES - Matching API response (camelCase)
// =============================================================================

interface Employee {
  id: string
  employeeCode: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  phone?: string
  avatar?: string
  department?: string
  departmentId?: string
  position?: string
  level?: string
  employmentType?: string
  startDate?: string
  joinDate?: string
  salary?: number
  baseSalary?: number
  status: string
  createdAt?: string
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string }> = {
    active: { label: 'Đang làm', color: 'bg-green-500' },
    probation: { label: 'Thử việc', color: 'bg-yellow-500' },
    on_leave: { label: 'Nghỉ phép', color: 'bg-orange-500' },
    resigned: { label: 'Đã nghỉ', color: 'bg-gray-500' },
    terminated: { label: 'Chấm dứt', color: 'bg-red-500' },
  }
  
  const { label, color } = config[status] || { label: status, color: 'bg-gray-400' }
  
  return (
    <Badge variant="outline" className={`${color} text-white border-0`}>
      {label}
    </Badge>
  )
}

// =============================================================================
// ADD EMPLOYEE DIALOG
// =============================================================================

interface AddEmployeeDialogProps {
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

function AddEmployeeDialog({ onSubmit, loading }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employmentType: 'full_time',
    salary: '',
  })

  const departments = [
    'Ban Giám đốc',
    'Phòng Kỹ thuật',
    'Phòng Kinh doanh',
    'Phòng Kế toán',
    'Phòng Nhân sự',
    'Phòng Marketing',
    'Phòng Dự án',
    'Bộ phận Vận hành',
  ]

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }
    
    setSaving(true)
    try {
      await onSubmit({
        ...formData,
        salary: formData.salary ? parseInt(formData.salary) : null,
      })
      setOpen(false)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        employmentType: 'full_time',
        salary: '',
      })
      toast.success('Đã thêm nhân viên mới')
    } catch (error) {
      toast.error('Không thể thêm nhân viên')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm nhân viên mới</DialogTitle>
          <DialogDescription>
            Điền thông tin nhân viên. Mã nhân viên sẽ được tạo tự động.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ <span className="text-red-500">*</span></Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nguyễn"
              />
            </div>
            <div className="space-y-2">
              <Label>Tên <span className="text-red-500">*</span></Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Văn A"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901234567"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phòng ban</Label>
              <Select
                value={formData.department}
                onValueChange={(v) => setFormData({ ...formData, department: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Chức vụ</Label>
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Nhân viên"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại hợp đồng</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(v) => setFormData({ ...formData, employmentType: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Toàn thời gian</SelectItem>
                  <SelectItem value="part_time">Bán thời gian</SelectItem>
                  <SelectItem value="contract">Hợp đồng</SelectItem>
                  <SelectItem value="intern">Thực tập</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lương cơ bản (VND)</Label>
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                placeholder="15000000"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Thêm nhân viên
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// EMPLOYEE CARD (GRID VIEW)
// =============================================================================

function EmployeeCard({ 
  employee, 
  onView, 
  onEdit, 
  onDelete 
}: { 
  employee: Employee
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const fullName = employee.fullName || `${employee.lastName} ${employee.firstName}`
  const initials = `${employee.lastName?.charAt(0) || ''}${employee.firstName?.charAt(0) || ''}`
  
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold truncate">{fullName}</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-muted-foreground">{employee.position || 'Chưa có chức vụ'}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={employee.status} />
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">
              {employee.employeeCode}
            </span>
          </div>
          {employee.department && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{employee.department}</span>
            </div>
          )}
          {employee.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// EMPLOYEE TABLE (LIST VIEW)
// =============================================================================

function EmployeeTable({ 
  employees,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onView,
  onEdit,
  onDelete,
}: { 
  employees: Employee[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
  onView: (emp: Employee) => void
  onEdit: (emp: Employee) => void
  onDelete: (emp: Employee) => void
}) {
  const formatSalary = (amount?: number) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), 'dd/MM/yyyy')
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedIds.length === employees.length && employees.length > 0}
                onCheckedChange={onSelectAll}
              />
            </TableHead>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Chức vụ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày vào</TableHead>
            <TableHead className="text-right">Lương</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                Chưa có nhân viên nào
              </TableCell>
            </TableRow>
          ) : (
            employees.map(employee => {
              const fullName = employee.fullName || `${employee.lastName} ${employee.firstName}`
              const initials = `${employee.lastName?.charAt(0) || ''}${employee.firstName?.charAt(0) || ''}`
              
              return (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(employee.id)}
                      onCheckedChange={(checked) => onSelectOne(employee.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{fullName}</p>
                        <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.department || '-'}</TableCell>
                  <TableCell>{employee.position || '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={employee.status} />
                  </TableCell>
                  <TableCell>{formatDate(employee.startDate || employee.joinDate)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatSalary(employee.salary)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(employee)}>
                          <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                          <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(employee)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface EmployeeDirectoryProps {
  employees: Employee[]
  onRefresh: () => void
  loading?: boolean
}

export function EmployeeDirectory({ employees, onRefresh, loading }: EmployeeDirectoryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Get unique departments from employees
  const departments = useMemo(() => {
    const depts = new Set<string>()
    employees.forEach(emp => {
      if (emp.department) depts.add(emp.department)
    })
    return Array.from(depts).sort()
  }, [employees])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const fullName = (emp.fullName || `${emp.lastName} ${emp.firstName}`).toLowerCase()
      
      // Search
      const searchMatch =
        searchQuery === '' ||
        fullName.includes(searchQuery.toLowerCase()) ||
        (emp.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase()))

      // Department filter
      const deptMatch = filterDepartment === 'all' || emp.department === filterDepartment

      // Status filter
      const statusMatch = filterStatus === 'all' || emp.status === filterStatus

      return searchMatch && deptMatch && statusMatch
    })
  }, [employees, searchQuery, filterDepartment, filterStatus])

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredEmployees.map(e => e.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, id] : prev.filter(i => i !== id)
    )
  }

  // CRUD handlers
  const handleAddEmployee = async (data: any) => {
    const response = await fetch('/api/erp/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) throw new Error('Failed to add employee')
    
    onRefresh()
  }

  const handleViewEmployee = (emp: Employee) => {
    const fullName = emp.fullName || `${emp.lastName} ${emp.firstName}`
    alert(`Chi tiết nhân viên:\n\n` +
      `Mã NV: ${emp.employeeCode}\n` +
      `Họ tên: ${fullName}\n` +
      `Email: ${emp.email || 'Chưa có'}\n` +
      `Điện thoại: ${emp.phone || 'Chưa có'}\n` +
      `Phòng ban: ${emp.department || 'Chưa phân công'}\n` +
      `Chức vụ: ${emp.position || 'Chưa có'}\n` +
      `Trạng thái: ${emp.status}`)
  }

  const handleEditEmployee = (emp: Employee) => {
    // TODO: Open edit dialog
    toast.info('Tính năng chỉnh sửa đang phát triển')
  }

  const handleDeleteEmployee = async (emp: Employee) => {
    const fullName = emp.fullName || `${emp.lastName} ${emp.firstName}`
    if (!confirm(`Bạn có chắc muốn xóa nhân viên ${fullName}?`)) return
    
    try {
      const response = await fetch(`/api/erp/employees/${emp.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete')
      
      toast.success('Đã xóa nhân viên')
      onRefresh()
    } catch (error) {
      toast.error('Không thể xóa nhân viên')
    }
  }

  // Stats
  const stats = useMemo(() => {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      onLeave: employees.filter(e => e.status === 'on_leave').length,
      probation: employees.filter(e => e.status === 'probation').length,
    }
  }, [employees])

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Đang làm việc</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{stats.onLeave}</p>
              <p className="text-sm text-muted-foreground">Đang nghỉ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.probation}</p>
              <p className="text-sm text-muted-foreground">Thử việc</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {departments.length > 0 && (
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang làm</SelectItem>
              <SelectItem value="probation">Thử việc</SelectItem>
              <SelectItem value="on_leave">Nghỉ phép</SelectItem>
              <SelectItem value="resigned">Đã nghỉ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          {/* View Toggle */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <AddEmployeeDialog onSubmit={handleAddEmployee} loading={saving} />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            Đã chọn {selectedIds.length} nhân viên
          </span>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Bỏ chọn
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && employees.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Chưa có nhân viên nào</h3>
            <p className="text-gray-500 mb-6">Bấm nút "Thêm nhân viên" để thêm nhân viên đầu tiên</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}

      {/* Employee List/Grid */}
      {!loading && employees.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEmployees.map(employee => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onView={() => handleViewEmployee(employee)}
                onEdit={() => handleEditEmployee(employee)}
                onDelete={() => handleDeleteEmployee(employee)}
              />
            ))}
          </div>
        ) : (
          <EmployeeTable
            employees={filteredEmployees}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onView={handleViewEmployee}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        )
      )}

      {/* No Results */}
      {!loading && employees.length > 0 && filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy nhân viên nào phù hợp</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory

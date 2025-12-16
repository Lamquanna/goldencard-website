'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  UserPlus,
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  ChevronDown,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuLabel,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Employee,
  Department,
  EmployeeStatus,
  EmploymentType,
  EMPLOYEE_STATUS_CONFIG,
  EMPLOYMENT_TYPE_CONFIG,
  getEmployeeFullName,
  formatVND,
} from '../index'
import { teamData } from '@/lib/team-data'

// =============================================================================
// REAL DATA - GOLDEN ENERGY EMPLOYEES
// =============================================================================

const mockDepartments: Department[] = [
  { id: 'd1', name: 'Board of Directors', nameVi: 'Ban Giám đốc', code: 'BOD', employeeCount: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd2', name: 'Project Management', nameVi: 'Phòng Dự án', code: 'PM', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd3', name: 'Technical', nameVi: 'Phòng Kỹ thuật', code: 'TECH', employeeCount: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd4', name: 'Project Development', nameVi: 'Phòng Phát triển Dự án', code: 'PD', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd5', name: 'Accounting', nameVi: 'Phòng Kế toán', code: 'ACC', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd6', name: 'Transportation', nameVi: 'Bộ phận Vận chuyển', code: 'TRANS', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd7', name: 'Sales', nameVi: 'Phòng Kinh doanh', code: 'SALES', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'd8', name: 'Marketing', nameVi: 'Bộ phận Marketing', code: 'MKT', employeeCount: 1, createdAt: new Date(), updatedAt: new Date() },
]

// Map department names to IDs
const departmentMap: Record<string, string> = {
  'Ban Giám đốc': 'd1',
  'Phòng Dự án': 'd2',
  'Phòng Kỹ thuật': 'd3',
  'Phòng Phát triển Dự án': 'd4',
  'Phòng Kế toán': 'd5',
  'Bộ phận Vận chuyển': 'd6',
  'Phòng Kinh doanh': 'd7',
  'Bộ phận Marketing': 'd8',
}

// Convert team data to Employee format
const mockEmployees: Employee[] = teamData.map((member, index) => {
  // Parse name into first and last name
  const nameParts = member.nameVi.split(' ')
  const lastName = nameParts[0] // Vietnamese: họ ở đầu
  const firstName = nameParts.slice(1).join(' ')
  
  return {
    id: member.id,
    employeeCode: member.employeeCode,
    firstName,
    lastName,
    email: member.email || `${member.employeeCode.toLowerCase()}@goldenenergy.vn`,
    phone: `0333314288${index}`,
    avatar: member.avatar,
    departmentId: departmentMap[member.department || 'Ban Giám đốc'] || 'd1',
    position: member.roleVi,
    level: member.category === 'leadership' ? 'Director' : member.category === 'management' ? 'Manager' : 'Staff',
    employmentType: 'full_time' as EmploymentType,
    status: 'active' as EmployeeStatus,
    joinDate: new Date(2023, 0, 1), // Default join date
    baseSalary: member.category === 'leadership' ? 50000000 : member.category === 'management' ? 35000000 : 20000000,
    currency: 'VND',
    isRemote: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})

// =============================================================================
// STATUS BADGE
// =============================================================================

function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  const config = EMPLOYEE_STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={`${config.color} text-white border-0`}>
      {config.labelVi}
    </Badge>
  )
}

// =============================================================================
// EMPLOYEE CARD (GRID VIEW)
// =============================================================================

function EmployeeCard({ employee, department }: { employee: Employee; department?: Department }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.avatar} />
              <AvatarFallback>
                {employee.firstName.charAt(0)}
                {employee.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{getEmployeeFullName(employee)}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert(`Chi tiết nhân viên:\n- Họ tên: ${getEmployeeFullName(employee)}\n- Mã NV: ${employee.employeeCode}\n- Email: ${employee.email}\n- Phòng ban: ${employee.department}\n- Chức vụ: ${employee.position}`)}>
                      <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Chỉnh sửa thông tin: ${getEmployeeFullName(employee)}`)}>
                      <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { if(confirm(`Bạn có chắc muốn xóa nhân viên ${getEmployeeFullName(employee)}?`)) { alert('Đã xóa nhân viên'); } }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-sm text-muted-foreground">{employee.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <EmployeeStatusBadge status={employee.status} />
                {employee.isRemote && (
                  <Badge variant="outline" className="text-xs">Remote</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{department?.nameVi || employee.departmentId}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{employee.phone}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================================
// EMPLOYEE TABLE (LIST VIEW)
// =============================================================================

interface EmployeeTableProps {
  employees: Employee[]
  departments: Department[]
  selectedIds: string[]
  onSelectAll: (checked: boolean) => void
  onSelectOne: (id: string, checked: boolean) => void
}

function EmployeeTable({ employees, departments, selectedIds, onSelectAll, onSelectOne }: EmployeeTableProps) {
  const getDepartmentName = (deptId: string) => {
    return departments.find(d => d.id === deptId)?.nameVi || deptId
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
            <TableHead>Loại hợp đồng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày vào</TableHead>
            <TableHead className="text-right">Lương cơ bản</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map(employee => (
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
                    <AvatarImage src={employee.avatar} />
                    <AvatarFallback>
                      {employee.firstName.charAt(0)}
                      {employee.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getEmployeeFullName(employee)}</p>
                    <p className="text-xs text-muted-foreground">{employee.employeeCode}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{getDepartmentName(employee.departmentId)}</TableCell>
              <TableCell>
                <div>
                  <p>{employee.position}</p>
                  {employee.level && (
                    <p className="text-xs text-muted-foreground">{employee.level}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {EMPLOYMENT_TYPE_CONFIG[employee.employmentType].labelVi}
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge status={employee.status} />
              </TableCell>
              <TableCell>
                {format(new Date(employee.joinDate), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatVND(employee.baseSalary)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => alert(`Chi tiết nhân viên:\n- Họ tên: ${getEmployeeFullName(employee)}\n- Mã NV: ${employee.employeeCode}\n- Email: ${employee.email}\n- Phòng ban: ${employee.department}\n- Chức vụ: ${employee.position}`)}>
                      <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert(`Chỉnh sửa thông tin: ${getEmployeeFullName(employee)}`)}>
                      <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => { if(confirm(`Bạn có chắc muốn xóa nhân viên ${getEmployeeFullName(employee)}?`)) { alert('Đã xóa nhân viên'); } }}>
                      <Trash2 className="h-4 w-4 mr-2" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

// =============================================================================
// ADD EMPLOYEE DIALOG
// =============================================================================

interface AddEmployeeDialogProps {
  departments: Department[]
  onSubmit: (employee: Partial<Employee>) => void
}

function AddEmployeeDialog({ departments, onSubmit }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    position: '',
    employmentType: 'full_time' as EmploymentType,
    baseSalary: '',
  })

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      baseSalary: parseInt(formData.baseSalary) || 0,
      status: 'probation',
      joinDate: new Date(),
      currency: 'VND',
      isRemote: false,
    })
    setOpen(false)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      departmentId: '',
      position: '',
      employmentType: 'full_time',
      baseSalary: '',
    })
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
            Điền thông tin cơ bản của nhân viên. Bạn có thể cập nhật thêm sau.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Nguyễn"
              />
            </div>
            <div className="space-y-2">
              <Label>Tên</Label>
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
                value={formData.departmentId}
                onValueChange={(v) => setFormData({ ...formData, departmentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng ban" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.nameVi}
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
                placeholder="Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại hợp đồng</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(v) => setFormData({ ...formData, employmentType: v as EmploymentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EMPLOYMENT_TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.labelVi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Lương cơ bản (VND)</Label>
              <Input
                type="number"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder="15000000"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Thêm nhân viên</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface EmployeeDirectoryProps {
  employees?: Employee[]
  departments?: Department[]
  onAddEmployee?: (employee: Partial<Employee>) => void
  onEditEmployee?: (id: string, data: Partial<Employee>) => void
  onDeleteEmployee?: (id: string) => void
}

export function EmployeeDirectory({
  employees = mockEmployees,
  departments = mockDepartments,
  onAddEmployee = () => {},
  onEditEmployee = () => {},
  onDeleteEmployee = () => {},
}: EmployeeDirectoryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDepartment, setFilterDepartment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Search
      const searchMatch =
        searchQuery === '' ||
        getEmployeeFullName(emp).toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())

      // Department filter
      const deptMatch = filterDepartment === 'all' || emp.departmentId === filterDepartment

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
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả phòng ban</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.nameVi} ({dept.employeeCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(EMPLOYEE_STATUS_CONFIG).map(([key, config]) => (
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

        <div className="flex items-center gap-2">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Xuất
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Xuất Excel</DropdownMenuItem>
              <DropdownMenuItem>Xuất PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AddEmployeeDialog departments={departments} onSubmit={onAddEmployee} />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            Đã chọn {selectedIds.length} nhân viên
          </span>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Gửi email
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Xóa
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
            Bỏ chọn
          </Button>
        </div>
      )}

      {/* Employee List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredEmployees.map(employee => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              department={departments.find(d => d.id === employee.departmentId)}
            />
          ))}
        </div>
      ) : (
        <EmployeeTable
          employees={filteredEmployees}
          departments={departments}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
        />
      )}

      {/* Empty State */}
      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy nhân viên nào</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory

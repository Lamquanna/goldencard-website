'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Users,
  Grid3X3,
  List,
  ChevronDown,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useHRMStore, selectFilteredEmployees, selectEmployeeStats } from '../store';
import {
  Employee,
  EMPLOYEE_STATUS_CONFIG,
  EMPLOYMENT_TYPE_CONFIG,
  EmployeeStatus,
  EmploymentType,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'table';

interface EmployeeDirectoryProps {
  onEmployeeClick?: (employee: Employee) => void;
  onAddEmployee?: () => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================================================
// EMPLOYEE CARD COMPONENT
// ============================================================================

interface EmployeeCardProps {
  employee: Employee;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function EmployeeCard({ employee, onView, onEdit, onDelete }: EmployeeCardProps) {
  const statusConfig = EMPLOYEE_STATUS_CONFIG[employee.status];
  const typeConfig = EMPLOYMENT_TYPE_CONFIG[employee.employmentType];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <CardContent className="p-4">
          {/* Header with Actions */}
          <div className="flex items-start justify-between mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.avatar} alt={employee.name} />
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Employee Info */}
          <div onClick={onView}>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {employee.name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
              {employee.employeeCode}
            </p>
            
            {/* Position & Department */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Briefcase className="h-3.5 w-3.5 text-zinc-400" />
                <span className="truncate">{employee.position?.name || 'Chưa xác định'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
                <Building2 className="h-3.5 w-3.5 text-zinc-400" />
                <span className="truncate">{employee.department?.name || 'Chưa xác định'}</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-3 space-y-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Mail className="h-3 w-3" />
                <span className="truncate">{employee.email}</span>
              </div>
              {employee.phone && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Phone className="h-3 w-3" />
                  <span>{employee.phone}</span>
                </div>
              )}
            </div>

            {/* Status & Type Badges */}
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', typeConfig.color)}>
                {typeConfig.label}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// EMPLOYEE TABLE ROW
// ============================================================================

interface EmployeeTableRowProps {
  employee: Employee;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function EmployeeTableRow({ employee, onView, onEdit, onDelete }: EmployeeTableRowProps) {
  const statusConfig = EMPLOYEE_STATUS_CONFIG[employee.status];
  const typeConfig = EMPLOYMENT_TYPE_CONFIG[employee.employmentType];

  return (
    <TableRow className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900" onClick={onView}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={employee.avatar} alt={employee.name} />
            <AvatarFallback className="text-sm bg-primary/10 text-primary">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-100">{employee.name}</p>
            <p className="text-xs text-zinc-500">{employee.employeeCode}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-sm text-zinc-900 dark:text-zinc-100">{employee.position?.name || '-'}</p>
          <p className="text-xs text-zinc-500">{employee.department?.name || '-'}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-0.5">
          <p className="text-sm text-zinc-600 dark:text-zinc-300">{employee.email}</p>
          {employee.phone && (
            <p className="text-xs text-zinc-500">{employee.phone}</p>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('text-xs', typeConfig.color)}>
          {typeConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {format(new Date(employee.hireDate), 'dd/MM/yyyy', { locale: vi })}
        </span>
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// STATS CARDS
// ============================================================================

function EmployeeStatsCards() {
  const stats = useHRMStore(selectEmployeeStats);

  const items = [
    { label: 'Tổng nhân viên', value: stats.total, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' },
    { label: 'Đang làm việc', value: stats.active, icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' },
    { label: 'Đang nghỉ phép', value: stats.onLeave, icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' },
    { label: 'Thử việc', value: stats.probation, icon: Briefcase, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </p>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function EmployeeDirectory({
  onEmployeeClick,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeeDirectoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    departments,
    positions,
    employeeFilters,
    setEmployeeFilters,
    clearEmployeeFilters,
    selectEmployee,
  } = useHRMStore();
  
  const employees = useHRMStore(selectFilteredEmployees);

  const handleEmployeeView = useCallback((employee: Employee) => {
    selectEmployee(employee);
    onEmployeeClick?.(employee);
  }, [selectEmployee, onEmployeeClick]);

  const handleSearch = useCallback((value: string) => {
    setEmployeeFilters({ search: value || undefined });
  }, [setEmployeeFilters]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      employeeFilters.search ||
      employeeFilters.departmentId ||
      employeeFilters.positionId ||
      employeeFilters.status ||
      employeeFilters.employmentType
    );
  }, [employeeFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <EmployeeStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
              value={employeeFilters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearEmployeeFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Employee */}
          <Button onClick={onAddEmployee}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Department Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Phòng ban
                    </label>
                    <Select
                      value={employeeFilters.departmentId || 'all'}
                      onValueChange={(value) => 
                        setEmployeeFilters({ departmentId: value === 'all' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả phòng ban" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Position Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Chức vụ
                    </label>
                    <Select
                      value={employeeFilters.positionId || 'all'}
                      onValueChange={(value) => 
                        setEmployeeFilters({ positionId: value === 'all' ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả chức vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả chức vụ</SelectItem>
                        {positions.map((pos) => (
                          <SelectItem key={pos.id} value={pos.id}>
                            {pos.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Trạng thái
                    </label>
                    <Select
                      value={employeeFilters.status || 'all'}
                      onValueChange={(value) => 
                        setEmployeeFilters({ status: value === 'all' ? undefined : value as EmployeeStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(EMPLOYEE_STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Employment Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Loại hợp đồng
                    </label>
                    <Select
                      value={employeeFilters.employmentType || 'all'}
                      onValueChange={(value) => 
                        setEmployeeFilters({ employmentType: value === 'all' ? undefined : value as EmploymentType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        {Object.entries(EMPLOYMENT_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Employee List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onView={() => handleEmployeeView(employee)}
                onEdit={() => onEditEmployee?.(employee)}
                onDelete={() => onDeleteEmployee?.(employee)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Nhân viên</TableHead>
                <TableHead>Chức vụ / Phòng ban</TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Loại HĐ</TableHead>
                <TableHead>Ngày vào</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {employees.map((employee) => (
                  <EmployeeTableRow
                    key={employee.id}
                    employee={employee}
                    onView={() => handleEmployeeView(employee)}
                    onEdit={() => onEditEmployee?.(employee)}
                    onDelete={() => onDeleteEmployee?.(employee)}
                  />
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {employees.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có nhân viên nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy nhân viên phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách thêm nhân viên đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddEmployee}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhân viên
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  X,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  UserCheck,
  UserX,
  UserCog,
  Mail,
  Phone,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Key,
  Send,
  Download,
  Upload,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAdminStore, selectFilteredUsers, selectAdminStats } from '../store';
import {
  User,
  UserStatus,
  UserRole,
  USER_STATUS_CONFIG,
  USER_ROLE_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface UserManagementProps {
  onUserClick?: (user: User) => void;
  onAddUser?: () => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
  onSuspendUser?: (user: User) => void;
  onActivateUser?: (user: User) => void;
  onResetPassword?: (user: User) => void;
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

const getStatusIcon = (status: UserStatus) => {
  const icons: Record<UserStatus, React.ReactNode> = {
    [UserStatus.ACTIVE]: <UserCheck className="h-4 w-4" />,
    [UserStatus.INACTIVE]: <UserX className="h-4 w-4" />,
    [UserStatus.PENDING]: <Clock className="h-4 w-4" />,
    [UserStatus.SUSPENDED]: <ShieldAlert className="h-4 w-4" />,
    [UserStatus.LOCKED]: <Lock className="h-4 w-4" />,
  };
  return icons[status];
};

const getRoleIcon = (role: UserRole) => {
  const icons: Record<UserRole, React.ReactNode> = {
    [UserRole.SUPER_ADMIN]: <Shield className="h-4 w-4" />,
    [UserRole.ADMIN]: <ShieldCheck className="h-4 w-4" />,
    [UserRole.MANAGER]: <UserCog className="h-4 w-4" />,
    [UserRole.TEAM_LEAD]: <Users className="h-4 w-4" />,
    [UserRole.EMPLOYEE]: <UserCheck className="h-4 w-4" />,
    [UserRole.GUEST]: <ShieldOff className="h-4 w-4" />,
  };
  return icons[role];
};

// ============================================================================
// STATS CARDS
// ============================================================================

function UserStatsCards() {
  const stats = useAdminStore(selectAdminStats);

  const items = [
    {
      label: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Đang hoạt động',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Chờ kích hoạt',
      value: stats.pendingUsers,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Đã khóa',
      value: stats.lockedUsers,
      icon: Lock,
      color: 'text-red-600 bg-red-50 dark:bg-red-950',
    },
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
                <div className="min-w-0">
                  <p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
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

export default function UserManagement({
  onUserClick,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onSuspendUser,
  onActivateUser,
  onResetPassword,
}: UserManagementProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { userFilters, setUserFilters, clearUserFilters, selectUser } =
    useAdminStore();

  const users = useAdminStore(selectFilteredUsers);

  const handleUserView = useCallback(
    (user: User) => {
      selectUser(user);
      onUserClick?.(user);
    },
    [selectUser, onUserClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setUserFilters({ search: value || undefined });
    },
    [setUserFilters]
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(new Set(users.map((u) => u.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [users]
  );

  const handleSelectOne = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return !!(
      userFilters.search ||
      userFilters.status ||
      userFilters.role
    );
  }, [userFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <UserStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm người dùng..."
              value={userFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearUserFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất
          </Button>

          {/* Import */}
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Nhập
          </Button>

          {/* Add User */}
          <Button onClick={onAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm người dùng
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
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Trạng thái
                    </label>
                    <Select
                      value={userFilters.status || 'all'}
                      onValueChange={(value) =>
                        setUserFilters({
                          status: value === 'all' ? undefined : (value as UserStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(USER_STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Vai trò
                    </label>
                    <Select
                      value={userFilters.role || 'all'}
                      onValueChange={(value) =>
                        setUserFilters({
                          role: value === 'all' ? undefined : (value as UserRole),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                        {Object.entries(USER_ROLE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Ngày tạo từ
                    </label>
                    <Input
                      type="date"
                      value={userFilters.dateFrom || ''}
                      onChange={(e) =>
                        setUserFilters({ dateFrom: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Ngày tạo đến
                    </label>
                    <Input
                      type="date"
                      value={userFilters.dateTo || ''}
                      onChange={(e) =>
                        setUserFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === users.length && users.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Phòng ban</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Lần đăng nhập cuối</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const statusConfig = USER_STATUS_CONFIG[user.status];
              const roleConfig = USER_ROLE_CONFIG[user.role];

              return (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => handleUserView(user)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(user.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.fullName} />}
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', roleConfig.bgColor, roleConfig.color)}>
                      {getRoleIcon(user.role)}
                      <span className="ml-1">{roleConfig.label}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {user.departmentName || '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                      {getStatusIcon(user.status)}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {user.lastLoginAt
                        ? formatDistanceToNow(new Date(user.lastLoginAt), {
                            addSuffix: true,
                            locale: vi,
                          })
                        : 'Chưa đăng nhập'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleUserView(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditUser?.(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === UserStatus.ACTIVE && (
                          <DropdownMenuItem onClick={() => onSuspendUser?.(user)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Tạm khóa
                          </DropdownMenuItem>
                        )}
                        {(user.status === UserStatus.SUSPENDED ||
                          user.status === UserStatus.LOCKED ||
                          user.status === UserStatus.INACTIVE) && (
                          <DropdownMenuItem onClick={() => onActivateUser?.(user)}>
                            <Unlock className="mr-2 h-4 w-4" />
                            Kích hoạt
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onResetPassword?.(user)}>
                          <Key className="mr-2 h-4 w-4" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Send className="mr-2 h-4 w-4" />
                          Gửi email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteUser?.(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Empty State */}
      {users.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có người dùng nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy người dùng phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách thêm người dùng đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddUser}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm người dùng
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4"
          >
            <span className="text-sm">
              Đã chọn <strong>{selectedIds.size}</strong> người dùng
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Lock className="h-4 w-4 mr-2" />
                Khóa
              </Button>
              <Button variant="secondary" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Gửi email
              </Button>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:text-white hover:bg-zinc-800"
                onClick={() => setSelectedIds(new Set())}
              >
                Bỏ chọn
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

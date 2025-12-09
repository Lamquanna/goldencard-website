'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Check,
  X,
  Eye,
  Calendar,
  Clock,
  FileText,
  ChevronDown,
  AlertCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useHRMStore, selectFilteredLeaveRequests, selectLeaveStats } from '../store';
import {
  LeaveRequest,
  LeaveType,
  LeaveStatus,
  LEAVE_TYPE_CONFIG,
  LEAVE_STATUS_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface LeaveManagementProps {
  canApprove?: boolean;
  onRequestClick?: (request: LeaveRequest) => void;
  onAddRequest?: () => void;
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
// STATS CARDS
// ============================================================================

function LeaveStatsCards() {
  const stats = useHRMStore(selectLeaveStats);

  const items = [
    { 
      label: 'Tổng đơn', 
      value: stats.total, 
      icon: FileText, 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' 
    },
    { 
      label: 'Chờ duyệt', 
      value: stats.pending, 
      icon: Clock, 
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' 
    },
    { 
      label: 'Đã duyệt', 
      value: stats.approved, 
      icon: Check, 
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' 
    },
    { 
      label: 'Tháng này', 
      value: stats.thisMonth, 
      icon: Calendar, 
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' 
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
// PENDING REQUESTS PANEL
// ============================================================================

interface PendingRequestsPanelProps {
  requests: LeaveRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onView?: (request: LeaveRequest) => void;
}

function PendingRequestsPanel({ requests, onApprove, onReject, onView }: PendingRequestsPanelProps) {
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-base text-amber-900 dark:text-amber-100">
            Đơn chờ duyệt ({pendingRequests.length})
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.slice(0, 5).map((request) => {
            const typeConfig = LEAVE_TYPE_CONFIG[request.type];
            const days = differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1;

            return (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={request.employee?.avatar} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(request.employee?.name || 'NV')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {request.employee?.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>{typeConfig.icon}</span>
                      <span>{typeConfig.label}</span>
                      <span>•</span>
                      <span>{days} ngày</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => onView?.(request)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => onApprove?.(request.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onReject?.(request.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// LEAVE REQUEST TABLE
// ============================================================================

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  canApprove?: boolean;
  onView?: (request: LeaveRequest) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

function LeaveRequestTable({
  requests,
  canApprove,
  onView,
  onApprove,
  onReject,
}: LeaveRequestTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Nhân viên</TableHead>
            <TableHead>Loại nghỉ phép</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead>Số ngày</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => {
            const typeConfig = LEAVE_TYPE_CONFIG[request.type];
            const statusConfig = LEAVE_STATUS_CONFIG[request.status];
            const days = differenceInDays(new Date(request.endDate), new Date(request.startDate)) + 1;

            return (
              <TableRow 
                key={request.id} 
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                onClick={() => onView?.(request)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={request.employee?.avatar} />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(request.employee?.name || 'NV')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {request.employee?.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {request.employee?.department?.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{typeConfig.icon}</span>
                    <span className={cn('text-sm', typeConfig.color)}>{typeConfig.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="text-zinc-900 dark:text-zinc-100">
                      {format(new Date(request.startDate), 'dd/MM/yyyy')}
                    </p>
                    <p className="text-xs text-zinc-500">
                      đến {format(new Date(request.endDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {request.isHalfDay ? '0.5 ngày' : `${days} ngày`}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-zinc-500">
                    {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                  </span>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onView?.(request)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      {canApprove && request.status === 'PENDING' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onApprove?.(request.id)}
                            className="text-emerald-600 focus:text-emerald-600"
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Phê duyệt
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReject?.(request.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Từ chối
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

// ============================================================================
// REJECT DIALOG
// ============================================================================

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function RejectDialog({ open, onClose, onConfirm }: RejectDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối đơn nghỉ phép</DialogTitle>
          <DialogDescription>
            Vui lòng nhập lý do từ chối đơn nghỉ phép này.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Nhập lý do từ chối..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Xác nhận từ chối
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LeaveManagement({
  canApprove = false,
  onRequestClick,
  onAddRequest,
}: LeaveManagementProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const {
    leaveFilters,
    setLeaveFilters,
    clearLeaveFilters,
    selectLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
  } = useHRMStore();

  const requests = useHRMStore(selectFilteredLeaveRequests);

  const handleApprove = useCallback((id: string) => {
    // In real app, would get current user ID
    approveLeaveRequest(id, 'current-user-id');
  }, [approveLeaveRequest]);

  const handleRejectConfirm = useCallback((reason: string) => {
    if (rejectingId) {
      rejectLeaveRequest(rejectingId, reason);
      setRejectingId(null);
    }
  }, [rejectingId, rejectLeaveRequest]);

  const handleRequestView = useCallback((request: LeaveRequest) => {
    selectLeaveRequest(request);
    onRequestClick?.(request);
  }, [selectLeaveRequest, onRequestClick]);

  const handleSearch = useCallback((value: string) => {
    setLeaveFilters({ search: value || undefined });
  }, [setLeaveFilters]);

  const hasActiveFilters = useMemo(() => {
    return !!(
      leaveFilters.search ||
      leaveFilters.type ||
      leaveFilters.status
    );
  }, [leaveFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <LeaveStatsCards />

      {/* Pending Requests (for approvers) */}
      {canApprove && (
        <PendingRequestsPanel
          requests={requests}
          onApprove={handleApprove}
          onReject={(id) => setRejectingId(id)}
          onView={handleRequestView}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={leaveFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearLeaveFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Add Request */}
        <Button onClick={onAddRequest}>
          <Plus className="h-4 w-4 mr-2" />
          Tạo đơn nghỉ phép
        </Button>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Loại nghỉ phép
                    </label>
                    <Select
                      value={leaveFilters.type || 'all'}
                      onValueChange={(value) => 
                        setLeaveFilters({ type: value === 'all' ? undefined : value as LeaveType })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {Object.entries(LEAVE_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
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
                      value={leaveFilters.status || 'all'}
                      onValueChange={(value) => 
                        setLeaveFilters({ status: value === 'all' ? undefined : value as LeaveStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        {Object.entries(LEAVE_STATUS_CONFIG).map(([key, config]) => (
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

      {/* Leave Requests Table */}
      {requests.length > 0 ? (
        <LeaveRequestTable
          requests={requests}
          canApprove={canApprove}
          onView={handleRequestView}
          onApprove={handleApprove}
          onReject={(id) => setRejectingId(id)}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có đơn nghỉ phép
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy đơn phù hợp với bộ lọc'
                : 'Bạn chưa có đơn nghỉ phép nào'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddRequest}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo đơn nghỉ phép
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <RejectDialog
        open={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
}

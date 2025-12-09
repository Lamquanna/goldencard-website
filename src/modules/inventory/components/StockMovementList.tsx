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
  CheckCircle,
  XCircle,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  Repeat,
  AlertTriangle,
  Undo,
  Package,
  X,
  FileText,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInventoryStore, selectFilteredMovements, selectInventoryStats } from '../store';
import {
  StockMovement,
  MovementType,
  MovementStatus,
  MOVEMENT_TYPE_CONFIG,
  MOVEMENT_STATUS_CONFIG,
  UNIT_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface StockMovementListProps {
  onMovementClick?: (movement: StockMovement) => void;
  onAddMovement?: () => void;
  onEditMovement?: (movement: StockMovement) => void;
  onApproveMovement?: (movement: StockMovement) => void;
  onCancelMovement?: (movement: StockMovement) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getMovementIcon = (type: MovementType) => {
  const icons: Record<MovementType, React.ReactNode> = {
    [MovementType.IN]: <ArrowDownCircle className="h-5 w-5" />,
    [MovementType.OUT]: <ArrowUpCircle className="h-5 w-5" />,
    [MovementType.TRANSFER]: <Repeat className="h-5 w-5" />,
    [MovementType.ADJUSTMENT]: <Edit className="h-5 w-5" />,
    [MovementType.RETURN]: <Undo className="h-5 w-5" />,
    [MovementType.DAMAGE]: <AlertTriangle className="h-5 w-5" />,
  };
  return icons[type];
};

const getStatusIcon = (status: MovementStatus) => {
  const icons: Record<MovementStatus, React.ReactNode> = {
    [MovementStatus.PENDING]: <Clock className="h-4 w-4" />,
    [MovementStatus.APPROVED]: <CheckCircle className="h-4 w-4" />,
    [MovementStatus.COMPLETED]: <CheckCircle className="h-4 w-4" />,
    [MovementStatus.CANCELLED]: <XCircle className="h-4 w-4" />,
  };
  return icons[status];
};

// ============================================================================
// STATS CARDS
// ============================================================================

function MovementStatsCards() {
  const stats = useInventoryStore(selectInventoryStats);
  const movements = useInventoryStore((state) => state.movements);

  const todayMovements = useMemo(() => {
    const today = new Date().toDateString();
    return movements.filter(
      (m) => new Date(m.createdAt).toDateString() === today
    ).length;
  }, [movements]);

  const completedThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return movements.filter(
      (m) =>
        m.status === MovementStatus.COMPLETED &&
        new Date(m.completedDate || m.createdAt) >= startOfMonth
    ).length;
  }, [movements]);

  const items = [
    {
      label: 'Chờ duyệt',
      value: stats.pendingMovements,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Hôm nay',
      value: todayMovements,
      icon: Package,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Hoàn thành tháng này',
      value: completedThisMonth,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Tổng phiếu',
      value: movements.length,
      icon: FileText,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
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
// MOVEMENT DETAIL DIALOG
// ============================================================================

interface MovementDetailDialogProps {
  movement: StockMovement | null;
  open: boolean;
  onClose: () => void;
  onApprove?: () => void;
  onCancel?: () => void;
}

function MovementDetailDialog({
  movement,
  open,
  onClose,
  onApprove,
  onCancel,
}: MovementDetailDialogProps) {
  if (!movement) return null;

  const typeConfig = MOVEMENT_TYPE_CONFIG[movement.type];
  const statusConfig = MOVEMENT_STATUS_CONFIG[movement.status];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', typeConfig.bgColor, typeConfig.color)}>
              {getMovementIcon(movement.type)}
            </div>
            <span>{movement.code}</span>
            <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {typeConfig.label} - {format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Warehouses */}
          <div className="grid grid-cols-2 gap-4">
            {movement.sourceWarehouseName && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Kho nguồn</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {movement.sourceWarehouseName}
                </p>
              </div>
            )}
            {movement.destinationWarehouseName && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                <p className="text-xs text-zinc-500 mb-1">Kho đích</p>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {movement.destinationWarehouseName}
                </p>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
              Danh sách sản phẩm ({movement.totalItems} mục)
            </h4>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movement.items.map((item) => {
                    const unitConfig = UNIT_CONFIG[item.unit];
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-zinc-500">{item.productSku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity} {unitConfig.abbr}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice ? formatCurrency(item.unitPrice) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.totalPrice ? formatCurrency(item.totalPrice) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-2">
              <div className="text-right">
                <p className="text-sm text-zinc-500">Tổng cộng</p>
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(movement.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(movement.requestedByName || 'N/A')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-zinc-500">Yêu cầu bởi</p>
                <p className="text-sm font-medium">{movement.requestedByName || 'N/A'}</p>
              </div>
            </div>
            {movement.approvedByName && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(movement.approvedByName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-zinc-500">Duyệt bởi</p>
                  <p className="text-sm font-medium">{movement.approvedByName}</p>
                </div>
              </div>
            )}
            {movement.completedByName && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials(movement.completedByName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs text-zinc-500">Hoàn thành bởi</p>
                  <p className="text-sm font-medium">{movement.completedByName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {movement.notes && (
            <div>
              <p className="text-sm text-zinc-500 mb-1">Ghi chú</p>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                {movement.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          {movement.status === MovementStatus.PENDING && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onCancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
              <Button onClick={onApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Duyệt
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function StockMovementList({
  onMovementClick,
  onAddMovement,
  onEditMovement,
  onApproveMovement,
  onCancelMovement,
}: StockMovementListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const { movementFilters, setMovementFilters, clearMovementFilters, selectMovement } =
    useInventoryStore();

  const movements = useInventoryStore(selectFilteredMovements);

  const handleMovementView = useCallback(
    (movement: StockMovement) => {
      setSelectedMovement(movement);
      setShowDetail(true);
      selectMovement(movement);
      onMovementClick?.(movement);
    },
    [selectMovement, onMovementClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setMovementFilters({ search: value || undefined });
    },
    [setMovementFilters]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      movementFilters.search ||
      movementFilters.type ||
      movementFilters.status
    );
  }, [movementFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <MovementStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm theo mã phiếu..."
              value={movementFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearMovementFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </Button>

          {/* Add Movement */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo phiếu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onAddMovement}>
                <ArrowDownCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Phiếu nhập kho
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddMovement}>
                <ArrowUpCircle className="mr-2 h-4 w-4 text-blue-600" />
                Phiếu xuất kho
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddMovement}>
                <Repeat className="mr-2 h-4 w-4 text-purple-600" />
                Phiếu chuyển kho
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAddMovement}>
                <Edit className="mr-2 h-4 w-4 text-amber-600" />
                Phiếu điều chỉnh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Loại phiếu
                    </label>
                    <Select
                      value={movementFilters.type || 'all'}
                      onValueChange={(value) =>
                        setMovementFilters({
                          type: value === 'all' ? undefined : (value as MovementType),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        {Object.entries(MOVEMENT_TYPE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
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
                      value={movementFilters.status || 'all'}
                      onValueChange={(value) =>
                        setMovementFilters({
                          status: value === 'all' ? undefined : (value as MovementStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(MOVEMENT_STATUS_CONFIG).map(([key, config]) => (
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
                      Từ ngày
                    </label>
                    <Input
                      type="date"
                      value={movementFilters.dateFrom || ''}
                      onChange={(e) =>
                        setMovementFilters({ dateFrom: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Đến ngày
                    </label>
                    <Input
                      type="date"
                      value={movementFilters.dateTo || ''}
                      onChange={(e) =>
                        setMovementFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Movement Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mã phiếu</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Kho</TableHead>
              <TableHead className="text-center">Số mục</TableHead>
              <TableHead className="text-right">Giá trị</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((movement) => {
              const typeConfig = MOVEMENT_TYPE_CONFIG[movement.type];
              const statusConfig = MOVEMENT_STATUS_CONFIG[movement.status];

              return (
                <TableRow
                  key={movement.id}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => handleMovementView(movement)}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn('p-1.5 rounded', typeConfig.bgColor, typeConfig.color)}>
                        {getMovementIcon(movement.type)}
                      </div>
                      <span className="font-mono font-medium">{movement.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(typeConfig.color)}>
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {movement.sourceWarehouseName && (
                        <p className="text-zinc-500">
                          Từ: {movement.sourceWarehouseName}
                        </p>
                      )}
                      {movement.destinationWarehouseName && (
                        <p className="text-zinc-700 dark:text-zinc-300">
                          Đến: {movement.destinationWarehouseName}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {movement.totalItems}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(movement.totalValue)}
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                      <span className="mr-1">{getStatusIcon(movement.status)}</span>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {format(new Date(movement.createdAt), 'dd/MM/yyyy')}
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
                        <DropdownMenuItem onClick={() => handleMovementView(movement)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        {movement.status === MovementStatus.PENDING && (
                          <>
                            <DropdownMenuItem onClick={() => onEditMovement?.(movement)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onApproveMovement?.(movement)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                              Duyệt
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onCancelMovement?.(movement)}
                              className="text-red-600"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Hủy phiếu
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

      {/* Empty State */}
      {movements.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có phiếu kho nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy phiếu phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách tạo phiếu nhập/xuất kho'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddMovement}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo phiếu kho
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <MovementDetailDialog
        movement={selectedMovement}
        open={showDetail}
        onClose={() => setShowDetail(false)}
        onApprove={() => {
          if (selectedMovement) {
            onApproveMovement?.(selectedMovement);
          }
          setShowDetail(false);
        }}
        onCancel={() => {
          if (selectedMovement) {
            onCancelMovement?.(selectedMovement);
          }
          setShowDetail(false);
        }}
      />
    </div>
  );
}

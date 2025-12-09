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
  Warehouse as WarehouseIcon,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  TrendingUp,
  X,
  Grid3X3,
  List,
  Map,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Switch } from '@/components/ui/switch';
import { useInventoryStore, selectFilteredWarehouses, selectInventoryStats } from '../store';
import { Warehouse, WarehouseType } from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'table' | 'map';

interface WarehouseOverviewProps {
  onWarehouseClick?: (warehouse: Warehouse) => void;
  onAddWarehouse?: () => void;
  onEditWarehouse?: (warehouse: Warehouse) => void;
  onDeleteWarehouse?: (warehouse: Warehouse) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WAREHOUSE_TYPE_CONFIG: Record<
  WarehouseType,
  { label: string; color: string; bgColor: string }
> = {
  [WarehouseType.MAIN]: {
    label: 'Kho chính',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  [WarehouseType.BRANCH]: {
    label: 'Kho chi nhánh',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  [WarehouseType.TEMPORARY]: {
    label: 'Kho tạm',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  [WarehouseType.VIRTUAL]: {
    label: 'Kho ảo',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
};

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

// ============================================================================
// STATS CARDS
// ============================================================================

function WarehouseStatsCards() {
  const stats = useInventoryStore(selectInventoryStats);
  const warehouses = useInventoryStore((state) => state.warehouses);

  const totalCapacity = useMemo(() => {
    return warehouses.reduce((sum, w) => sum + (w.totalCapacity || 0), 0);
  }, [warehouses]);

  const usedCapacity = useMemo(() => {
    return warehouses.reduce((sum, w) => sum + (w.usedCapacity || 0), 0);
  }, [warehouses]);

  const totalValue = useMemo(() => {
    return warehouses.reduce((sum, w) => sum + w.totalValue, 0);
  }, [warehouses]);

  const items = [
    {
      label: 'Tổng kho',
      value: stats.totalWarehouses,
      icon: WarehouseIcon,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Đang hoạt động',
      value: stats.activeWarehouses,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Tổng sản phẩm',
      value: stats.totalItems.toLocaleString(),
      icon: Package,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Tổng giá trị',
      value: formatCurrency(totalValue),
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
      isLarge: true,
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
                  <p className={cn(
                    'font-bold text-zinc-900 dark:text-zinc-100 truncate',
                    item.isLarge ? 'text-lg' : 'text-2xl'
                  )}>
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
// WAREHOUSE CARD
// ============================================================================

interface WarehouseCardProps {
  warehouse: Warehouse;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
}

function WarehouseCard({
  warehouse,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: WarehouseCardProps) {
  const typeConfig = WAREHOUSE_TYPE_CONFIG[warehouse.type];
  const capacityPercentage = warehouse.totalCapacity
    ? Math.round((warehouse.usedCapacity || 0) / warehouse.totalCapacity * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group"
    >
      <Card
        className={cn(
          'h-full cursor-pointer hover:shadow-lg transition-all',
          !warehouse.isActive && 'opacity-60'
        )}
        onClick={onView}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <WarehouseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {warehouse.name}
                  </h3>
                  <Badge variant="outline" className="text-xs font-mono">
                    {warehouse.code}
                  </Badge>
                </div>
                <Badge className={cn('text-xs mt-1', typeConfig.bgColor, typeConfig.color)}>
                  {typeConfig.label}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
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
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 mb-4 text-sm text-zinc-500">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p className="line-clamp-2">{warehouse.address}, {warehouse.city}</p>
          </div>

          {/* Capacity */}
          {warehouse.totalCapacity && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-500">Sức chứa</span>
                <span className="font-medium">
                  {warehouse.usedCapacity?.toLocaleString() || 0} / {warehouse.totalCapacity.toLocaleString()} {warehouse.capacityUnit || 'đơn vị'}
                </span>
              </div>
              <Progress
                value={capacityPercentage}
                className={cn(
                  'h-2',
                  capacityPercentage >= 90 && '[&>div]:bg-red-500',
                  capacityPercentage >= 70 && capacityPercentage < 90 && '[&>div]:bg-amber-500'
                )}
              />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {warehouse.totalProducts.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500">Sản phẩm</p>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(warehouse.totalValue)}
              </p>
              <p className="text-xs text-zinc-500">Giá trị</p>
            </div>
          </div>

          {/* Contact & Status */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* Manager */}
            {warehouse.managerName && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {getInitials(warehouse.managerName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-zinc-500">{warehouse.managerName}</span>
              </div>
            )}

            {/* Active Toggle */}
            <div
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-zinc-500">
                {warehouse.isActive ? 'Hoạt động' : 'Tạm đóng'}
              </span>
              <Switch
                checked={warehouse.isActive}
                onCheckedChange={onToggleActive}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// WAREHOUSE TABLE ROW
// ============================================================================

interface WarehouseTableRowProps {
  warehouse: Warehouse;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleActive?: (active: boolean) => void;
}

function WarehouseTableRow({
  warehouse,
  onView,
  onEdit,
  onDelete,
  onToggleActive,
}: WarehouseTableRowProps) {
  const typeConfig = WAREHOUSE_TYPE_CONFIG[warehouse.type];
  const capacityPercentage = warehouse.totalCapacity
    ? Math.round((warehouse.usedCapacity || 0) / warehouse.totalCapacity * 100)
    : 0;

  return (
    <TableRow
      className={cn(
        'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
        !warehouse.isActive && 'opacity-60'
      )}
      onClick={onView}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <WarehouseIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {warehouse.name}
              </p>
              <Badge variant="outline" className="text-xs font-mono h-5">
                {warehouse.code}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">
              {warehouse.address}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', typeConfig.bgColor, typeConfig.color)}>
          {typeConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-zinc-600 dark:text-zinc-300">{warehouse.city}</span>
      </TableCell>
      <TableCell className="text-center">
        {warehouse.totalProducts.toLocaleString()}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(warehouse.totalValue)}
      </TableCell>
      <TableCell>
        {warehouse.totalCapacity ? (
          <div className="w-24">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-500">{capacityPercentage}%</span>
            </div>
            <Progress value={capacityPercentage} className="h-1.5" />
          </div>
        ) : (
          <span className="text-zinc-400">-</span>
        )}
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Switch
          checked={warehouse.isActive}
          onCheckedChange={onToggleActive}
        />
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
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
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
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
// MAIN COMPONENT
// ============================================================================

export default function WarehouseOverview({
  onWarehouseClick,
  onAddWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
}: WarehouseOverviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    warehouseFilters,
    setWarehouseFilters,
    clearWarehouseFilters,
    selectWarehouse,
    updateWarehouse,
  } = useInventoryStore();

  const warehouses = useInventoryStore(selectFilteredWarehouses);

  const handleWarehouseView = useCallback(
    (warehouse: Warehouse) => {
      selectWarehouse(warehouse);
      onWarehouseClick?.(warehouse);
    },
    [selectWarehouse, onWarehouseClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setWarehouseFilters({ search: value || undefined });
    },
    [setWarehouseFilters]
  );

  const handleToggleActive = useCallback(
    (id: string, active: boolean) => {
      updateWarehouse(id, { isActive: active });
    },
    [updateWarehouse]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      warehouseFilters.search ||
      warehouseFilters.type ||
      warehouseFilters.isActive !== undefined
    );
  }, [warehouseFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <WarehouseStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kho hàng..."
              value={warehouseFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearWarehouseFilters}>
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
            <Button
              variant={viewMode === 'map' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('map')}
            >
              <Map className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Warehouse */}
          <Button onClick={onAddWarehouse}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm kho
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Loại kho
                    </label>
                    <Select
                      value={warehouseFilters.type || 'all'}
                      onValueChange={(value) =>
                        setWarehouseFilters({
                          type: value === 'all' ? undefined : (value as WarehouseType),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        {Object.entries(WAREHOUSE_TYPE_CONFIG).map(([key, config]) => (
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
                      value={
                        warehouseFilters.isActive === undefined
                          ? 'all'
                          : warehouseFilters.isActive
                          ? 'active'
                          : 'inactive'
                      }
                      onValueChange={(value) =>
                        setWarehouseFilters({
                          isActive:
                            value === 'all'
                              ? undefined
                              : value === 'active'
                              ? true
                              : false,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="active">Đang hoạt động</SelectItem>
                        <SelectItem value="inactive">Tạm đóng</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warehouse List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {warehouses.map((warehouse) => (
              <WarehouseCard
                key={warehouse.id}
                warehouse={warehouse}
                onView={() => handleWarehouseView(warehouse)}
                onEdit={() => onEditWarehouse?.(warehouse)}
                onDelete={() => onDeleteWarehouse?.(warehouse)}
                onToggleActive={(active) => handleToggleActive(warehouse.id, active)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Kho hàng</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Thành phố</TableHead>
                <TableHead className="text-center">Sản phẩm</TableHead>
                <TableHead className="text-right">Giá trị</TableHead>
                <TableHead>Sức chứa</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <WarehouseTableRow
                  key={warehouse.id}
                  warehouse={warehouse}
                  onView={() => handleWarehouseView(warehouse)}
                  onEdit={() => onEditWarehouse?.(warehouse)}
                  onDelete={() => onDeleteWarehouse?.(warehouse)}
                  onToggleActive={(active) => handleToggleActive(warehouse.id, active)}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="h-[500px] flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <Map className="h-12 w-12 mx-auto mb-4 text-zinc-300" />
            <p>Bản đồ kho hàng</p>
            <p className="text-sm">Tích hợp Google Maps / Mapbox</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {warehouses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <WarehouseIcon className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có kho hàng nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy kho phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách thêm kho hàng đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddWarehouse}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm kho hàng
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

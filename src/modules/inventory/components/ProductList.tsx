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
  Download,
  Upload,
  Grid3X3,
  List,
  Package,
  AlertTriangle,
  X,
  Sun,
  Zap,
  Battery,
  Layers,
  Cable,
  Wrench,
  Box,
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
import { Progress } from '@/components/ui/progress';
import { useInventoryStore, selectFilteredProducts, selectInventoryStats } from '../store';
import {
  Product,
  ProductStatus,
  ProductCategory,
  PRODUCT_STATUS_CONFIG,
  CATEGORY_CONFIG,
  UNIT_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'table';

interface ProductListProps {
  onProductClick?: (product: Product) => void;
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onImport?: () => void;
  onExport?: () => void;
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

const getCategoryIcon = (category: ProductCategory) => {
  const icons: Record<ProductCategory, React.ReactNode> = {
    [ProductCategory.SOLAR_PANEL]: <Sun className="h-5 w-5" />,
    [ProductCategory.INVERTER]: <Zap className="h-5 w-5" />,
    [ProductCategory.BATTERY]: <Battery className="h-5 w-5" />,
    [ProductCategory.MOUNTING]: <Layers className="h-5 w-5" />,
    [ProductCategory.CABLE]: <Cable className="h-5 w-5" />,
    [ProductCategory.ACCESSORY]: <Package className="h-5 w-5" />,
    [ProductCategory.SERVICE]: <Wrench className="h-5 w-5" />,
    [ProductCategory.OTHER]: <Box className="h-5 w-5" />,
  };
  return icons[category];
};

// ============================================================================
// STATS CARDS
// ============================================================================

function ProductStatsCards() {
  const stats = useInventoryStore(selectInventoryStats);

  const items = [
    {
      label: 'Tổng sản phẩm',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Đang bán',
      value: stats.activeProducts,
      icon: Package,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Sắp hết hàng',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Hết hàng',
      value: stats.outOfStockProducts,
      icon: AlertTriangle,
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
// PRODUCT CARD
// ============================================================================

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProductCard({
  product,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const statusConfig = PRODUCT_STATUS_CONFIG[product.status];
  const categoryConfig = CATEGORY_CONFIG[product.category];
  const unitConfig = UNIT_CONFIG[product.unit];

  const stockPercentage = product.maxStockLevel
    ? Math.round((product.totalStock / product.maxStockLevel) * 100)
    : 50;

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
          selected && 'ring-2 ring-blue-500'
        )}
        onClick={onView}
      >
        {/* Thumbnail */}
        <div className="relative h-40 bg-zinc-100 dark:bg-zinc-800 rounded-t-lg overflow-hidden">
          {product.thumbnail ? (
            <img
              src={product.thumbnail}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className={cn('p-4 rounded-full', categoryConfig.color)}>
                {getCategoryIcon(product.category)}
              </div>
            </div>
          )}

          {/* Checkbox */}
          {onSelect && (
            <div
              className="absolute top-2 left-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={selected}
                onCheckedChange={onSelect}
                className="bg-white"
              />
            </div>
          )}

          {/* Status Badge */}
          <Badge
            className={cn(
              'absolute top-2 right-2 text-xs',
              statusConfig.bgColor,
              statusConfig.color
            )}
          >
            {statusConfig.label}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs font-mono mb-1">
                {product.sku}
              </Badge>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {product.name}
              </h3>
              <p className="text-xs text-zinc-500">
                {categoryConfig.label} • {product.brand || 'N/A'}
              </p>
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

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(product.sellingPrice)}
            </span>
            {product.costPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatCurrency(product.costPrice)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-500">Tồn kho</span>
              <span className="font-medium">
                {product.totalStock} {unitConfig.abbr}
              </span>
            </div>
            <Progress
              value={stockPercentage}
              className={cn(
                'h-1.5',
                stockPercentage <= 20 && '[&>div]:bg-red-500',
                stockPercentage > 20 && stockPercentage <= 50 && '[&>div]:bg-amber-500'
              )}
            />
            {product.minStockLevel && product.totalStock <= product.minStockLevel && (
              <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Dưới mức tồn kho tối thiểu</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span>Có sẵn: {product.availableStock}</span>
            <span>Đặt trước: {product.reservedStock}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// PRODUCT TABLE ROW
// ============================================================================

interface ProductTableRowProps {
  product: Product;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProductTableRow({
  product,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
}: ProductTableRowProps) {
  const statusConfig = PRODUCT_STATUS_CONFIG[product.status];
  const categoryConfig = CATEGORY_CONFIG[product.category];
  const unitConfig = UNIT_CONFIG[product.unit];

  return (
    <TableRow
      className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
      onClick={onView}
    >
      {onSelect && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={selected} onCheckedChange={onSelect} />
        </TableCell>
      )}
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-white',
              categoryConfig.color
            )}
          >
            {getCategoryIcon(product.category)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {product.name}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Badge variant="outline" className="text-xs font-mono h-5">
                {product.sku}
              </Badge>
              <span>{product.brand || 'N/A'}</span>
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs">
          {categoryConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(product.sellingPrice)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {product.totalStock} {unitConfig.abbr}
          </span>
          {product.minStockLevel && product.totalStock <= product.minStockLevel && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </TooltipTrigger>
                <TooltipContent>Dưới mức tồn kho tối thiểu</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-zinc-600 dark:text-zinc-400">
          {product.availableStock}
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

export default function ProductList({
  onProductClick,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onImport,
  onExport,
}: ProductListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { productFilters, setProductFilters, clearProductFilters, selectProduct } =
    useInventoryStore();

  const products = useInventoryStore(selectFilteredProducts);

  const handleProductView = useCallback(
    (product: Product) => {
      selectProduct(product);
      onProductClick?.(product);
    },
    [selectProduct, onProductClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setProductFilters({ search: value || undefined });
    },
    [setProductFilters]
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(new Set(products.map((p) => p.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [products]
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
      productFilters.search ||
      productFilters.category ||
      productFilters.status
    );
  }, [productFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ProductStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm sản phẩm..."
              value={productFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearProductFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Import/Export */}
          <Button variant="outline" size="sm" onClick={onImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

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

          {/* Add Product */}
          <Button onClick={onAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
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
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Danh mục
                    </label>
                    <Select
                      value={productFilters.category || 'all'}
                      onValueChange={(value) =>
                        setProductFilters({
                          category: value === 'all' ? undefined : (value as ProductCategory),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
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
                      value={productFilters.status || 'all'}
                      onValueChange={(value) =>
                        setProductFilters({
                          status: value === 'all' ? undefined : (value as ProductStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(PRODUCT_STATUS_CONFIG).map(([key, config]) => (
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

      {/* Product List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedIds.has(product.id)}
                onSelect={(selected) => handleSelectOne(product.id, selected)}
                onView={() => handleProductView(product)}
                onEdit={() => onEditProduct?.(product)}
                onDelete={() => onDeleteProduct?.(product)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={selectedIds.size === products.length && products.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[300px]">Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Giá bán</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Có sẵn</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <ProductTableRow
                  key={product.id}
                  product={product}
                  selected={selectedIds.has(product.id)}
                  onSelect={(selected) => handleSelectOne(product.id, selected)}
                  onView={() => handleProductView(product)}
                  onEdit={() => onEditProduct?.(product)}
                  onDelete={() => onDeleteProduct?.(product)}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có sản phẩm nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách thêm sản phẩm đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm sản phẩm
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
              Đã chọn <strong>{selectedIds.size}</strong> sản phẩm
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Sửa hàng loạt
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

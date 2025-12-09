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
  X,
  Receipt,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Truck,
  Lightbulb,
  Wrench,
  Briefcase,
  ShoppingCart,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFinanceStore, selectFilteredExpenses, selectFinanceStats } from '../store';
import {
  Expense,
  ExpenseStatus,
  ExpenseCategory,
  PaymentMethod,
  EXPENSE_STATUS_CONFIG,
  EXPENSE_CATEGORY_CONFIG,
  PAYMENT_METHOD_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface ExpenseListProps {
  onExpenseClick?: (expense: Expense) => void;
  onAddExpense?: () => void;
  onEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expense: Expense) => void;
  onApproveExpense?: (expense: Expense) => void;
  onRejectExpense?: (expense: Expense) => void;
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

const getCategoryIcon = (category: ExpenseCategory) => {
  const icons: Record<ExpenseCategory, React.ReactNode> = {
    [ExpenseCategory.OPERATIONS]: <Building2 className="h-4 w-4" />,
    [ExpenseCategory.SALARY]: <Users className="h-4 w-4" />,
    [ExpenseCategory.UTILITIES]: <Lightbulb className="h-4 w-4" />,
    [ExpenseCategory.TRAVEL]: <Truck className="h-4 w-4" />,
    [ExpenseCategory.MARKETING]: <TrendingUp className="h-4 w-4" />,
    [ExpenseCategory.EQUIPMENT]: <Wrench className="h-4 w-4" />,
    [ExpenseCategory.SUPPLIES]: <ShoppingCart className="h-4 w-4" />,
    [ExpenseCategory.RENT]: <Briefcase className="h-4 w-4" />,
    [ExpenseCategory.INSURANCE]: <FileText className="h-4 w-4" />,
    [ExpenseCategory.TAX]: <Receipt className="h-4 w-4" />,
    [ExpenseCategory.OTHER]: <DollarSign className="h-4 w-4" />,
  };
  return icons[category];
};

const getStatusIcon = (status: ExpenseStatus) => {
  const icons: Record<ExpenseStatus, React.ReactNode> = {
    [ExpenseStatus.PENDING]: <Clock className="h-4 w-4" />,
    [ExpenseStatus.APPROVED]: <CheckCircle className="h-4 w-4" />,
    [ExpenseStatus.REJECTED]: <XCircle className="h-4 w-4" />,
    [ExpenseStatus.PAID]: <CheckCircle className="h-4 w-4" />,
    [ExpenseStatus.CANCELLED]: <X className="h-4 w-4" />,
  };
  return icons[status];
};

// ============================================================================
// STATS CARDS
// ============================================================================

function ExpenseStatsCards() {
  const stats = useFinanceStore(selectFinanceStats);
  const expenses = useFinanceStore((state) => state.expenses);

  // Calculate by category
  const categoryTotals = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (expense.status !== ExpenseStatus.CANCELLED && expense.status !== ExpenseStatus.REJECTED) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<ExpenseCategory, number>);
  }, [expenses]);

  // Top category
  const topCategory = useMemo(() => {
    const entries = Object.entries(categoryTotals);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (a[1] > b[1] ? a : b));
  }, [categoryTotals]);

  const pendingCount = expenses.filter(
    (e) => e.status === ExpenseStatus.PENDING
  ).length;

  const items = [
    {
      label: 'Tổng chi phí',
      value: formatCurrency(stats.totalExpenses),
      icon: DollarSign,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Chi trong tháng',
      value: formatCurrency(stats.totalExpenseAmount),
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Chờ duyệt',
      value: pendingCount,
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Danh mục lớn nhất',
      value: topCategory
        ? EXPENSE_CATEGORY_CONFIG[topCategory[0] as ExpenseCategory]?.label || 'N/A'
        : 'N/A',
      subValue: topCategory ? formatCurrency(topCategory[1]) : undefined,
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
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
                  <p className="font-bold text-xl text-zinc-900 dark:text-zinc-100 truncate">
                    {item.value}
                  </p>
                  {item.subValue && (
                    <p className="text-xs text-zinc-500">{item.subValue}</p>
                  )}
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
// CATEGORY BREAKDOWN
// ============================================================================

function CategoryBreakdown() {
  const expenses = useFinanceStore((state) => state.expenses);

  const categoryData = useMemo(() => {
    const totals = expenses.reduce((acc, expense) => {
      if (expense.status !== ExpenseStatus.CANCELLED && expense.status !== ExpenseStatus.REJECTED) {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    const totalExpenses = Object.values(totals).reduce((a, b) => a + b, 0);

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        config: EXPENSE_CATEGORY_CONFIG[category as ExpenseCategory],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  if (categoryData.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Chi phí theo danh mục</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {categoryData.map((item) => (
          <div key={item.category} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={cn('p-1 rounded', item.config.color)}>
                  {getCategoryIcon(item.category)}
                </div>
                <span className="text-zinc-700 dark:text-zinc-300">{item.config.label}</span>
              </div>
              <span className="font-medium">{formatCurrency(item.amount)}</span>
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn('h-full rounded-full', item.config.color)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExpenseList({
  onExpenseClick,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onApproveExpense,
  onRejectExpense,
}: ExpenseListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const { expenseFilters, setExpenseFilters, clearExpenseFilters, selectExpense } =
    useFinanceStore();

  const expenses = useFinanceStore(selectFilteredExpenses);

  const handleExpenseView = useCallback(
    (expense: Expense) => {
      selectExpense(expense);
      onExpenseClick?.(expense);
    },
    [selectExpense, onExpenseClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setExpenseFilters({ search: value || undefined });
    },
    [setExpenseFilters]
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(new Set(expenses.map((e) => e.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [expenses]
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
      expenseFilters.search ||
      expenseFilters.category ||
      expenseFilters.status
    );
  }, [expenseFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ExpenseStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm chi phí..."
              value={expenseFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearExpenseFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>

          {/* Import */}
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Nhập
          </Button>

          {/* Add Expense */}
          <Button onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm chi phí
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Danh mục
                    </label>
                    <Select
                      value={expenseFilters.category || 'all'}
                      onValueChange={(value) =>
                        setExpenseFilters({
                          category: value === 'all' ? undefined : (value as ExpenseCategory),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả danh mục</SelectItem>
                        {Object.entries(EXPENSE_CATEGORY_CONFIG).map(([key, config]) => (
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
                      value={expenseFilters.status || 'all'}
                      onValueChange={(value) =>
                        setExpenseFilters({
                          status: value === 'all' ? undefined : (value as ExpenseStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(EXPENSE_STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Range - replacing Payment Method filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Số tiền tối thiểu
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={expenseFilters.minAmount || ''}
                      onChange={(e) =>
                        setExpenseFilters({
                          minAmount: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Từ ngày
                    </label>
                    <Input
                      type="date"
                      value={expenseFilters.dateFrom || ''}
                      onChange={(e) =>
                        setExpenseFilters({ dateFrom: e.target.value || undefined })
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
                      value={expenseFilters.dateTo || ''}
                      onChange={(e) =>
                        setExpenseFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table */}
        <div className="lg:col-span-3">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedIds.size === expenses.length && expenses.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead className="text-right">Số tiền</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => {
                  const statusConfig = EXPENSE_STATUS_CONFIG[expense.status];
                  const categoryConfig = EXPENSE_CATEGORY_CONFIG[expense.category];
                  const paymentConfig = expense.paymentMethod
                    ? PAYMENT_METHOD_CONFIG[expense.paymentMethod]
                    : null;

                  return (
                    <TableRow
                      key={expense.id}
                      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      onClick={() => handleExpenseView(expense)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(expense.id)}
                          onCheckedChange={(checked) =>
                            handleSelectOne(expense.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {expense.receipts && expense.receipts.length > 0 ? (
                            <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-zinc-400" />
                            </div>
                          ) : (
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-xs">
                                {getCategoryIcon(expense.category)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                              {expense.description}
                            </p>
                            {expense.vendorName && (
                              <p className="text-xs text-zinc-500">{expense.vendorName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', categoryConfig.color)}
                        >
                          {getCategoryIcon(expense.category)}
                          <span className="ml-1">{categoryConfig.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}
                        >
                          {getStatusIcon(expense.status)}
                          <span className="ml-1">{statusConfig.label}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {paymentConfig && (
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">
                            {paymentConfig.label}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        -{formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">
                          {format(new Date(expense.expenseDate), 'dd/MM/yyyy')}
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
                            <DropdownMenuItem onClick={() => handleExpenseView(expense)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEditExpense?.(expense)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {expense.status === ExpenseStatus.PENDING && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => onApproveExpense?.(expense)}
                                  className="text-emerald-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Phê duyệt
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => onRejectExpense?.(expense)}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => onDeleteExpense?.(expense)}
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
          {expenses.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Receipt className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  Chưa có chi phí nào
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  {hasActiveFilters
                    ? 'Không tìm thấy chi phí phù hợp với bộ lọc'
                    : 'Bắt đầu bằng cách thêm chi phí đầu tiên'}
                </p>
                {!hasActiveFilters && (
                  <Button onClick={onAddExpense}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm chi phí
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CategoryBreakdown />

          {/* Recent Expenses */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Chi phí gần đây</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 -mx-2 px-2 py-1.5 rounded"
                  onClick={() => handleExpenseView(expense)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cn('p-1.5 rounded', EXPENSE_CATEGORY_CONFIG[expense.category].color)}>
                      {getCategoryIcon(expense.category)}
                    </div>
                    <span className="text-sm truncate">{expense.description}</span>
                  </div>
                  <span className="text-sm font-medium text-red-600 ml-2 whitespace-nowrap">
                    -{formatCurrency(expense.amount)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

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
              Đã chọn <strong>{selectedIds.size}</strong> chi phí
            </span>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Duyệt
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất
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

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
  Send,
  Download,
  Printer,
  Copy,
  X,
  Receipt,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  ArrowUpCircle,
  ArrowDownCircle,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useFinanceStore, selectFilteredInvoices, selectFinanceStats } from '../store';
import {
  Invoice,
  InvoiceStatus,
  InvoiceType,
  INVOICE_STATUS_CONFIG,
  INVOICE_TYPE_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface InvoiceListProps {
  onInvoiceClick?: (invoice: Invoice) => void;
  onAddInvoice?: () => void;
  onEditInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
  onSendInvoice?: (invoice: Invoice) => void;
  onPrintInvoice?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
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

const getStatusIcon = (status: InvoiceStatus) => {
  const icons: Record<InvoiceStatus, React.ReactNode> = {
    [InvoiceStatus.DRAFT]: <Edit className="h-4 w-4" />,
    [InvoiceStatus.PENDING]: <Clock className="h-4 w-4" />,
    [InvoiceStatus.SENT]: <Send className="h-4 w-4" />,
    [InvoiceStatus.PARTIALLY_PAID]: <DollarSign className="h-4 w-4" />,
    [InvoiceStatus.PAID]: <CheckCircle className="h-4 w-4" />,
    [InvoiceStatus.OVERDUE]: <AlertCircle className="h-4 w-4" />,
    [InvoiceStatus.CANCELLED]: <X className="h-4 w-4" />,
    [InvoiceStatus.REFUNDED]: <ArrowUpCircle className="h-4 w-4" />,
  };
  return icons[status];
};

// ============================================================================
// STATS CARDS
// ============================================================================

function InvoiceStatsCards() {
  const stats = useFinanceStore(selectFinanceStats);

  const items = [
    {
      label: 'Tổng hóa đơn',
      value: stats.totalInvoices,
      icon: Receipt,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Đã thanh toán',
      value: stats.paidInvoices,
      icon: CheckCircle,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Quá hạn',
      value: stats.overdueInvoices,
      icon: AlertCircle,
      color: 'text-red-600 bg-red-50 dark:bg-red-950',
    },
    {
      label: 'Công nợ phải thu',
      value: formatCurrency(stats.totalReceivable),
      icon: DollarSign,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
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
                  <p
                    className={cn(
                      'font-bold text-zinc-900 dark:text-zinc-100 truncate',
                      item.isLarge ? 'text-lg' : 'text-2xl'
                    )}
                  >
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

export default function InvoiceList({
  onInvoiceClick,
  onAddInvoice,
  onEditInvoice,
  onDeleteInvoice,
  onSendInvoice,
  onPrintInvoice,
  onRecordPayment,
}: InvoiceListProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { invoiceFilters, setInvoiceFilters, clearInvoiceFilters, selectInvoice } =
    useFinanceStore();

  const invoices = useFinanceStore(selectFilteredInvoices);

  const handleInvoiceView = useCallback(
    (invoice: Invoice) => {
      selectInvoice(invoice);
      onInvoiceClick?.(invoice);
    },
    [selectInvoice, onInvoiceClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setInvoiceFilters({ search: value || undefined });
    },
    [setInvoiceFilters]
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        setSelectedIds(new Set(invoices.map((i) => i.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [invoices]
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
      invoiceFilters.search ||
      invoiceFilters.type ||
      invoiceFilters.status
    );
  }, [invoiceFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <InvoiceStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm hóa đơn..."
              value={invoiceFilters.search || ''}
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
            <Button variant="ghost" size="sm" onClick={clearInvoiceFilters}>
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

          {/* Add Invoice */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hóa đơn
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onAddInvoice}>
                <ArrowUpCircle className="mr-2 h-4 w-4 text-emerald-600" />
                Hóa đơn bán hàng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddInvoice}>
                <ArrowDownCircle className="mr-2 h-4 w-4 text-blue-600" />
                Hóa đơn mua hàng
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
                      Loại hóa đơn
                    </label>
                    <Select
                      value={invoiceFilters.type || 'all'}
                      onValueChange={(value) =>
                        setInvoiceFilters({
                          type: value === 'all' ? undefined : (value as InvoiceType),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả loại" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả loại</SelectItem>
                        {Object.entries(INVOICE_TYPE_CONFIG).map(([key, config]) => (
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
                      value={invoiceFilters.status || 'all'}
                      onValueChange={(value) =>
                        setInvoiceFilters({
                          status: value === 'all' ? undefined : (value as InvoiceStatus),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(INVOICE_STATUS_CONFIG).map(([key, config]) => (
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
                      value={invoiceFilters.dateFrom || ''}
                      onChange={(e) =>
                        setInvoiceFilters({ dateFrom: e.target.value || undefined })
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
                      value={invoiceFilters.dateTo || ''}
                      onChange={(e) =>
                        setInvoiceFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invoice Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === invoices.length && invoices.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[150px]">Số hóa đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Đã thanh toán</TableHead>
              <TableHead>Ngày đáo hạn</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
              const typeConfig = INVOICE_TYPE_CONFIG[invoice.type];
              const paymentProgress = invoice.total > 0
                ? Math.round((invoice.paidAmount / invoice.total) * 100)
                : 0;

              return (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  onClick={() => handleInvoiceView(invoice)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(invoice.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(invoice.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-zinc-400" />
                      <span className="font-mono font-medium">{invoice.code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getInitials(invoice.customerName || invoice.supplierName || 'N/A')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {invoice.customerName || invoice.supplierName || 'N/A'}
                        </p>
                        {invoice.customerEmail && (
                          <p className="text-xs text-zinc-500">{invoice.customerEmail}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-xs', typeConfig.color)}>
                      {typeConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                      <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="space-y-1">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatCurrency(invoice.paidAmount)}
                      </span>
                      {invoice.status === InvoiceStatus.PARTIALLY_PAID && (
                        <Progress value={paymentProgress} className="h-1 w-20 ml-auto" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-sm',
                        invoice.status === InvoiceStatus.OVERDUE
                          ? 'text-red-600 font-medium'
                          : 'text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
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
                        <DropdownMenuItem onClick={() => handleInvoiceView(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditInvoice?.(invoice)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {invoice.status === InvoiceStatus.DRAFT && (
                          <DropdownMenuItem onClick={() => onSendInvoice?.(invoice)}>
                            <Send className="mr-2 h-4 w-4" />
                            Gửi hóa đơn
                          </DropdownMenuItem>
                        )}
                        {(invoice.status === InvoiceStatus.SENT ||
                          invoice.status === InvoiceStatus.PARTIALLY_PAID ||
                          invoice.status === InvoiceStatus.OVERDUE) && (
                          <DropdownMenuItem onClick={() => onRecordPayment?.(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Ghi nhận thanh toán
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => onPrintInvoice?.(invoice)}>
                          <Printer className="mr-2 h-4 w-4" />
                          In hóa đơn
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Nhân bản
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeleteInvoice?.(invoice)}
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
      {invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có hóa đơn nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy hóa đơn phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách tạo hóa đơn đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo hóa đơn
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
              Đã chọn <strong>{selectedIds.size}</strong> hóa đơn
            </span>
            <div className="flex items-center gap-2">
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

'use client'

import { useState } from 'react'
import { 
  FileText, Search, Plus, Filter, Download, Send, Eye, Edit, Trash2, 
  MoreHorizontal, CheckCircle, Clock, AlertCircle, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Invoice, 
  InvoiceStatus,
  MOCK_INVOICES, 
  INVOICE_STATUS_CONFIG,
  formatCurrency,
  getDaysOverdue
} from '../index'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface InvoiceListProps {
  invoices?: Invoice[]
  onView?: (invoice: Invoice) => void
  onEdit?: (invoice: Invoice) => void
  onDelete?: (invoice: Invoice) => void
  onSend?: (invoice: Invoice) => void
}

export function InvoiceList({ 
  invoices = MOCK_INVOICES,
  onView,
  onEdit,
  onDelete,
  onSend
}: InvoiceListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = search === '' || 
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Stats
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(i => i.status === 'paid').length
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0)
  const totalOutstanding = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + i.balanceDue, 0)

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'sent': 
      case 'viewed': 
      case 'partial': return <Clock className="h-4 w-4 text-blue-500" />
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-gray-500" />
      default: return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{paidInvoices}</span> đã thanh toán
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">Cần theo dõi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Đã thu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa thanh toán</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">Còn lại</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo số hóa đơn, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(INVOICE_STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.labelVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tạo hóa đơn
          </Button>
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Số hóa đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead>Hạn thanh toán</TableHead>
              <TableHead className="text-right">Tổng tiền</TableHead>
              <TableHead className="text-right">Còn lại</TableHead>
              <TableHead className="text-center">Trạng thái</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy hóa đơn nào
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
                const daysOverdue = invoice.status === 'overdue' ? getDaysOverdue(invoice.dueDate) : 0

                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <span className="font-mono font-medium">{invoice.invoiceNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        {invoice.customerEmail && (
                          <div className="text-xs text-muted-foreground">{invoice.customerEmail}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.issueDate), 'dd/MM/yyyy', { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <div className={invoice.status === 'overdue' ? 'text-red-600' : ''}>
                        {format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: vi })}
                        {daysOverdue > 0 && (
                          <div className="text-xs text-red-500">Quá hạn {daysOverdue} ngày</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.balanceDue > 0 ? (
                        <span className="text-yellow-600">{formatCurrency(invoice.balanceDue)}</span>
                      ) : (
                        <span className="text-green-600">0 đ</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={statusConfig.color}>
                        {statusConfig.labelVi}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView?.(invoice)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(invoice)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => onSend?.(invoice)}>
                              <Send className="h-4 w-4 mr-2" />
                              Gửi hóa đơn
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete?.(invoice)} className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
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
    </div>
  )
}

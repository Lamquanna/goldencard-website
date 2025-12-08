'use client'

import { useState } from 'react'
import { 
  Receipt, Search, Plus, Filter, Download, Check, X,
  Clock, AlertCircle, MoreHorizontal, Eye, Edit, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Expense, 
  ExpenseStatus,
  ExpenseCategory,
  MOCK_EXPENSES, 
  EXPENSE_CATEGORY_CONFIG,
  formatCurrency
} from '../index'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const EXPENSE_STATUS_CONFIG: Record<ExpenseStatus, { label: string; labelVi: string; color: string }> = {
  draft: { label: 'Draft', labelVi: 'Nháp', color: 'bg-gray-100 text-gray-800' },
  pending_approval: { label: 'Pending', labelVi: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', labelVi: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', labelVi: 'Từ chối', color: 'bg-red-100 text-red-800' },
  paid: { label: 'Paid', labelVi: 'Đã thanh toán', color: 'bg-blue-100 text-blue-800' },
}

interface ExpenseListProps {
  expenses?: Expense[]
  showApprovalActions?: boolean
  onView?: (expense: Expense) => void
  onEdit?: (expense: Expense) => void
  onDelete?: (expense: Expense) => void
  onApprove?: (expense: Expense) => void
  onReject?: (expense: Expense) => void
}

export function ExpenseList({ 
  expenses = MOCK_EXPENSES,
  showApprovalActions = true,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject
}: ExpenseListProps) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = search === '' || 
      expense.title.toLowerCase().includes(search.toLowerCase()) ||
      expense.expenseNumber.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Stats
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingApproval = expenses.filter(e => e.status === 'pending_approval').length
  const approvedTotal = expenses.filter(e => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng chi phí</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{expenses.length} khoản chi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ duyệt</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Cần phê duyệt</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(approvedTotal)}</div>
            <p className="text-xs text-muted-foreground">Tổng chi đã duyệt</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã chi phí..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(EXPENSE_CATEGORY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.labelVi}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {Object.entries(EXPENSE_STATUS_CONFIG).map(([key, config]) => (
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
            Thêm chi phí
          </Button>
        </div>
      </div>

      {/* Expenses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExpenses.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            Không tìm thấy chi phí nào
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const categoryConfig = EXPENSE_CATEGORY_CONFIG[expense.category]
            const statusConfig = EXPENSE_STATUS_CONFIG[expense.status]

            return (
              <Card key={expense.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Receipt className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium line-clamp-1">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">{expense.expenseNumber}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {categoryConfig.labelVi}
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${statusConfig.color}`}>
                            {statusConfig.labelVi}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(expense)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit?.(expense)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Sửa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete?.(expense)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(expense.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(expense.expenseDate), 'dd/MM/yyyy', { locale: vi })}
                      </p>
                    </div>

                    {showApprovalActions && expense.status === 'pending_approval' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 border-red-200"
                          onClick={() => onReject?.(expense)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 border-green-200"
                          onClick={() => onApprove?.(expense)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}

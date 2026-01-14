'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, TrendingUp, TrendingDown, FileText, Receipt, CreditCard,
  ArrowRight, AlertCircle, CheckCircle, Clock, PiggyBank, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { 
  formatCurrency,
  INVOICE_STATUS_CONFIG,
  InvoiceStatus
} from '../modules/finance'

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  amount: number
  status: string
  issueDate: string
  dueDate: string
}

interface Expense {
  id: string
  expenseNumber: string
  title: string
  amount: number
  category: string
  status: string
  expenseDate: string
}

export default function FinanceDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [invoicesRes, expensesRes] = await Promise.all([
        authFetch('/api/erp/invoices'),
        authFetch('/api/erp/expenses')
      ])

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json()
        setExpenses(expensesData)
      }
    } catch (error) {
      console.error('Error loading finance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const totalExpenses = expenses.filter(e => e.status === 'approved' || e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0)
  const outstandingInvoices = invoices.filter(i => ['sent', 'partial', 'overdue'].includes(i.status))
    .reduce((sum, i) => sum + i.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'pending_approval').length

  // Net profit
  const netProfit = totalRevenue - totalExpenses

  // Recent invoices
  const recentInvoices = invoices.slice(0, 3)

  // Budget usage (mock)
  const budgetUsed = 75
  const budgetTotal = 500000000

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8 text-violet-500" />
            Tài chính & Kế toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý dòng tiền, hóa đơn và chi phí
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/erp/finance/invoices">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Hóa đơn
            </Button>
          </Link>
          <Link href="/erp/finance/expenses">
            <Button variant="outline">
              <Receipt className="h-4 w-4 mr-2" />
              Chi phí
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-green-600">
              +12.5% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Chi phí</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-red-600">
              -5.2% so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 border-violet-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-800">Lợi nhuận ròng</CardTitle>
            <BarChart3 className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-violet-700' : 'text-red-700'}`}>
              {formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-violet-600">
              Tháng này
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Công nợ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {formatCurrency(outstandingInvoices)}
            </div>
            <p className="text-xs text-yellow-600">
              Chưa thu hồi
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Hóa đơn gần đây</CardTitle>
              <CardDescription>Danh sách hóa đơn mới nhất</CardDescription>
            </div>
            <Link href="/erp/finance/invoices">
              <Button variant="ghost" size="sm">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => {
                const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as InvoiceStatus]
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-600' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge variant="outline" className={`text-xs ${statusConfig?.color || ''}`}>
                        {statusConfig?.labelVi || invoice.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget & Alerts */}
        <div className="space-y-6">
          {/* Budget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-violet-500" />
                Ngân sách tháng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Đã sử dụng</span>
                  <span>{budgetUsed}%</span>
                </div>
                <Progress value={budgetUsed} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Còn lại</span>
                <span className="font-medium">
                  {formatCurrency(budgetTotal * (1 - budgetUsed / 100))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Cần xử lý
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingExpenses > 0 && (
                <Link href="/erp/finance/expenses" className="block">
                  <div className="flex items-center justify-between p-2 rounded bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Chi phí chờ duyệt</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      {pendingExpenses}
                    </Badge>
                  </div>
                </Link>
              )}

              {invoices.filter(i => i.status === 'overdue').length > 0 && (
                <Link href="/erp/finance/invoices" className="block">
                  <div className="flex items-center justify-between p-2 rounded bg-red-50 border border-red-200 hover:bg-red-100 transition-colors">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">Hóa đơn quá hạn</span>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      {invoices.filter(i => i.status === 'overdue').length}
                    </Badge>
                  </div>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/erp/finance/invoices">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <FileText className="h-8 w-8 text-blue-500 mb-2" />
              <span className="font-medium">Hóa đơn</span>
              <span className="text-sm text-muted-foreground">{invoices.length} hóa đơn</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/finance/payments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <CreditCard className="h-8 w-8 text-green-500 mb-2" />
              <span className="font-medium">Thanh toán</span>
              <span className="text-sm text-muted-foreground">Quản lý thanh toán</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/finance/expenses">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <Receipt className="h-8 w-8 text-red-500 mb-2" />
              <span className="font-medium">Chi phí</span>
              <span className="text-sm text-muted-foreground">{expenses.length} khoản chi</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/erp/finance/reports">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <BarChart3 className="h-8 w-8 text-violet-500 mb-2" />
              <span className="font-medium">Báo cáo</span>
              <span className="text-sm text-muted-foreground">Phân tích tài chính</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

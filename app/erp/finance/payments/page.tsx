'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  FileDown, 
  FileUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building2
} from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'
import { toast } from 'sonner'

interface Payment {
  id: string
  invoiceNumber: string
  customer: string
  company: string
  amount: number
  dueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue'
  method?: string
}

const STATUS_CONFIG = {
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  overdue: { label: 'Quá hạn', color: 'bg-red-100 text-red-700', icon: AlertCircle }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/erp/payments')
      if (!response.ok) throw new Error('Failed to fetch payments')
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error loading payments:', error)
      toast.error('Không thể tải danh sách thanh toán')
      setPayments([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment =>
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const paidAmount = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const pendingAmount = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0)

  const handleExportExcel = () => {
    const excelData = filteredPayments.map(payment => ({
      'Số hóa đơn': payment.invoiceNumber,
      'Khách hàng': payment.customer,
      'Công ty': payment.company,
      'Số tiền': payment.amount,
      'Hạn thanh toán': payment.dueDate,
      'Ngày thanh toán': payment.paidDate || 'Chưa thanh toán',
      'Trạng thái': STATUS_CONFIG[payment.status].label,
      'Phương thức': payment.method || 'N/A'
    }))

    exportToExcel(
      excelData,
      [
        { header: 'Số hóa đơn', key: 'Số hóa đơn', width: 15 },
        { header: 'Khách hàng', key: 'Khách hàng', width: 30 },
        { header: 'Công ty', key: 'Công ty', width: 25 },
        { header: 'Số tiền', key: 'Số tiền', width: 20 },
        { header: 'Hạn thanh toán', key: 'Hạn thanh toán', width: 15 },
        { header: 'Ngày thanh toán', key: 'Ngày thanh toán', width: 15 },
        { header: 'Trạng thái', key: 'Trạng thái', width: 15 },
        { header: 'Phương thức', key: 'Phương thức', width: 15 }
      ],
      `Thanh-toan-${new Date().toLocaleDateString('vi-VN')}.xlsx`
    )
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-gray-600 mt-1">Theo dõi các khoản thu chi và thanh toán</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel}>
            <FileDown className="w-4 h-4 mr-2" />
            Xuất Excel
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Thêm thanh toán
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tổng thanh toán</CardTitle>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalAmount.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-gray-500 mt-1">{payments.length} khoản</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Đã thanh toán</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter(p => p.status === 'paid').length} khoản
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Còn lại</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingAmount.toLocaleString('vi-VN')} ₫
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {payments.filter(p => p.status !== 'paid').length} khoản
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Tìm theo số hóa đơn, khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách thanh toán</CardTitle>
          <CardDescription>Tất cả các khoản thanh toán trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => {
              const statusConfig = STATUS_CONFIG[payment.status]
              const StatusIcon = statusConfig.icon
              
              return (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{payment.invoiceNumber}</span>
                      <Badge className={statusConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4" />
                        {payment.customer}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Hạn: {payment.dueDate}
                        </span>
                        {payment.paidDate && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Đã trả: {payment.paidDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {payment.amount.toLocaleString('vi-VN')} ₫
                    </div>
                    {payment.method && (
                      <div className="text-xs text-gray-500 mt-1">{payment.method}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

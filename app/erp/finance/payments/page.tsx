'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
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
  Building2,
  Eye,
  Edit,
  Trash2
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    setIsLoading(true)
    try {
      const response = await authFetch('/api/erp/payments')
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

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedPayment) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/erp/payments/${selectedPayment.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment')

      toast.success('Đã xóa thanh toán thành công!')
      setIsDeleteDialogOpen(false)
      await loadPayments()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa thanh toán')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        invoiceNumber: formData.get('invoiceNumber') as string,
        customer: formData.get('customer') as string,
        company: formData.get('company') as string,
        amount: parseFloat(formData.get('amount') as string),
        dueDate: formData.get('dueDate') as string,
        paidDate: formData.get('paidDate') as string || null,
        status: formData.get('status') as string,
        method: formData.get('method') as string || null,
      }

      const response = await authFetch('/api/erp/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create payment')

      toast.success('Đã thêm thanh toán thành công!')
      setIsAddDialogOpen(false)
      await loadPayments()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm thanh toán')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdatePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedPayment) return
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        invoiceNumber: formData.get('invoiceNumber') as string,
        customer: formData.get('customer') as string,
        company: formData.get('company') as string,
        amount: parseFloat(formData.get('amount') as string),
        dueDate: formData.get('dueDate') as string,
        paidDate: formData.get('paidDate') as string || null,
        status: formData.get('status') as string,
        method: formData.get('method') as string || null,
      }

      const response = await fetch(`/api/erp/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update payment')

      toast.success('Đã cập nhật thanh toán thành công!')
      setIsEditDialogOpen(false)
      await loadPayments()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thanh toán')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
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
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-[#D4AF37] hover:bg-[#B8962E] text-white">
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
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => handleView(payment)}>
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(payment)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(payment)}>
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm thanh toán mới</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Số hóa đơn *</Label>
                <Input id="invoiceNumber" name="invoiceNumber" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer">Khách hàng *</Label>
                <Input id="customer" name="customer" required disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Công ty</Label>
              <Input id="company" name="company" disabled={isSubmitting} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Số tiền (VNĐ) *</Label>
                <Input id="amount" name="amount" type="number" step="0.01" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái *</Label>
                <Select name="status" defaultValue="pending" required disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="paid">Đã thanh toán</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Hạn thanh toán *</Label>
                <Input id="dueDate" name="dueDate" type="date" required disabled={isSubmitting} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paidDate">Ngày thanh toán</Label>
                <Input id="paidDate" name="paidDate" type="date" disabled={isSubmitting} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Phương thức thanh toán</Label>
              <Select name="method" disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                  <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                  <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                  <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Đang thêm...' : 'Thêm thanh toán'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết thanh toán</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Số hóa đơn</Label>
                <p className="font-medium">{selectedPayment.invoiceNumber}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Khách hàng</Label>
                  <p className="font-medium">{selectedPayment.customer}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Công ty</Label>
                  <p className="font-medium">{selectedPayment.company || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Số tiền</Label>
                <p className="font-medium text-lg">{selectedPayment.amount.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <Badge className={STATUS_CONFIG[selectedPayment.status].color}>
                    {STATUS_CONFIG[selectedPayment.status].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phương thức</Label>
                  <p className="font-medium">{selectedPayment.method || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Hạn thanh toán</Label>
                  <p className="font-medium">{selectedPayment.dueDate}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày thanh toán</Label>
                  <p className="font-medium">{selectedPayment.paidDate || 'Chưa thanh toán'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thanh toán</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <form onSubmit={handleUpdatePayment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-invoiceNumber">Số hóa đơn *</Label>
                  <Input id="edit-invoiceNumber" name="invoiceNumber" defaultValue={selectedPayment.invoiceNumber} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-customer">Khách hàng *</Label>
                  <Input id="edit-customer" name="customer" defaultValue={selectedPayment.customer} required disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Công ty</Label>
                <Input id="edit-company" name="company" defaultValue={selectedPayment.company} disabled={isSubmitting} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-amount">Số tiền (VNĐ) *</Label>
                  <Input id="edit-amount" name="amount" type="number" step="0.01" defaultValue={selectedPayment.amount} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái *</Label>
                  <Select name="status" defaultValue={selectedPayment.status} required disabled={isSubmitting}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ duyệt</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="overdue">Quá hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Hạn thanh toán *</Label>
                  <Input id="edit-dueDate" name="dueDate" type="date" defaultValue={selectedPayment.dueDate} required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-paidDate">Ngày thanh toán</Label>
                  <Input id="edit-paidDate" name="paidDate" type="date" defaultValue={selectedPayment.paidDate || ''} disabled={isSubmitting} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-method">Phương thức thanh toán</Label>
                <Select name="method" defaultValue={selectedPayment.method || ''} disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn phương thức" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chuyển khoản">Chuyển khoản</SelectItem>
                    <SelectItem value="Tiền mặt">Tiền mặt</SelectItem>
                    <SelectItem value="Thẻ tín dụng">Thẻ tín dụng</SelectItem>
                    <SelectItem value="Ví điện tử">Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <p>Bạn có chắc chắn muốn xóa thanh toán <strong>{selectedPayment.invoiceNumber}</strong>?</p>
              <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button onClick={handleConfirmDelete} variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

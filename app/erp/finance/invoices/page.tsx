'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { InvoiceList } from '../../modules/finance/components/InvoiceList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Download, Upload } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'
import { toast } from 'sonner'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setIsLoading(true)
    try {
      const response = await authFetch('/api/erp/invoices')
      if (!response.ok) throw new Error('Failed to fetch invoices')
      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast.error('Không thể tải danh sách hóa đơn')
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowViewModal(true)
  }

  const handleEdit = (invoice: any) => {
    toast.info('Chức năng chỉnh sửa đang phát triển')
  }

  const handleDelete = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedInvoice) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/erp/invoices/${selectedInvoice.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete invoice')

      toast.success('Đã xóa hóa đơn thành công!')
      setShowDeleteModal(false)
      await loadInvoices()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa hóa đơn')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportExcel = () => {
    if (invoices.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    const excelData = invoices.map(invoice => ({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      amount: invoice.amount,
      status: invoice.status === 'paid' ? 'Đã thanh toán' : 
              invoice.status === 'pending' ? 'Chờ thanh toán' : 
              invoice.status === 'overdue' ? 'Quá hạn' : 'Nháp',
      issueDate: new Date(invoice.issueDate).toLocaleDateString('vi-VN'),
      dueDate: new Date(invoice.dueDate).toLocaleDateString('vi-VN'),
    }))

    const columns = [
      { header: 'Số hóa đơn', key: 'invoiceNumber', width: 15 },
      { header: 'Khách hàng', key: 'customerName', width: 30 },
      { header: 'Số tiền (VNĐ)', key: 'amount', width: 15 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày phát hành', key: 'issueDate', width: 15 },
      { header: 'Ngày đến hạn', key: 'dueDate', width: 15 },
    ]

    const date = new Date().toISOString().split('T')[0]
    exportToExcel(excelData, columns, `Hoa-don-${date}.xlsx`)
    toast.success('Đã xuất file Excel thành công!')
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý hóa đơn</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={invoices.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
      ) : (
        <InvoiceList 
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết hóa đơn</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Số hóa đơn</Label>
                <p className="font-medium">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Khách hàng</Label>
                <p className="font-medium">{selectedInvoice.customerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Số tiền</Label>
                  <p className="font-medium text-lg">{selectedInvoice.amount.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <p className="font-medium">{selectedInvoice.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ngày phát hành</Label>
                  <p className="font-medium">{new Date(selectedInvoice.issueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày đến hạn</Label>
                  <p className="font-medium">{new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <p>Bạn có chắc chắn muốn xóa hóa đơn <strong>{selectedInvoice.invoiceNumber}</strong>?</p>
              <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button onClick={handleConfirmDelete} variant="destructive" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { InvoiceList } from '../../modules/finance/components/InvoiceList'
import { Button } from '@/components/ui/button'
import { Download, Upload } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'
import { toast } from 'sonner'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with API call later
    const mockInvoices = [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customerName: 'Công ty TNHH ABC',
        amount: 181500000,
        status: 'paid',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        items: []
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customerName: 'Công ty Cổ phần XYZ',
        amount: 187500000,
        status: 'overdue',
        issueDate: '2024-01-10',
        dueDate: '2024-01-25',
        items: []
      }
    ]
    setInvoices(mockInvoices)
    setIsLoading(false)
  }, [])

  const handleExportExcel = () => {
    if (invoices.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    const excelData = invoices.map(invoice => ({
      'Số hóa đơn': invoice.invoiceNumber,
      'Khách hàng': invoice.customerName,
      'Số tiền (VNĐ)': invoice.amount,
      'Trạng thái': invoice.status === 'paid' ? 'Đã thanh toán' : 
                    invoice.status === 'pending' ? 'Chờ thanh toán' : 
                    invoice.status === 'overdue' ? 'Quá hạn' : 'Nháp',
      'Ngày phát hành': new Date(invoice.issueDate).toLocaleDateString('vi-VN'),
      'Ngày đến hạn': new Date(invoice.dueDate).toLocaleDateString('vi-VN'),
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
        <InvoiceList />
      )}
    </div>
  )
}

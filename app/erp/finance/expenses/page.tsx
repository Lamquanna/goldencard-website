'use client'

import { useState, useEffect } from 'react'
import { authFetch } from '@/lib/hooks/useAuthFetch'
import { ExpenseList } from '../../modules/finance/components/ExpenseList'
import { Expense } from '../../modules/finance/index'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Upload, Download } from 'lucide-react'
import { exportToExcel } from '@/lib/excel-export'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

export default function ExpensesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load expenses on mount
  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const response = await authFetch('/api/erp/expenses')
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      toast.error('Không thể tải danh sách chi phí')
    } finally {
      setIsLoading(false)
    }
  }

  const handleView = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsViewDialogOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedExpense) return
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/erp/expenses/${selectedExpense.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete expense')

      toast.success('Đã xóa chi phí thành công!')
      setIsDeleteDialogOpen(false)
      await loadExpenses()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa chi phí')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedExpense) return
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        title: formData.get('title') as string,
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        expenseDate: formData.get('expenseDate') as string,
        description: formData.get('description') as string,
      }

      const response = await fetch(`/api/erp/expenses/${selectedExpense.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update expense')

      toast.success('Đã cập nhật chi phí thành công!')
      setIsEditDialogOpen(false)
      await loadExpenses()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật chi phí')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        title: formData.get('title') as string,
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        expenseDate: formData.get('expenseDate') as string,
        description: formData.get('description') as string,
      }

      const response = await authFetch('/api/erp/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to create expense')

      toast.success('Đã thêm chi phí thành công!')
      setIsAddDialogOpen(false)
      
      // Reload expenses
      await loadExpenses()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm chi phí')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExportExcel = () => {
    if (expenses.length === 0) {
      toast.error('Không có dữ liệu để xuất')
      return
    }

    const excelData = expenses.map(expense => ({
      expenseNumber: expense.expenseNumber,
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      status: expense.status,
      expenseDate: new Date(expense.expenseDate).toLocaleDateString('vi-VN'),
      description: expense.description || '',
    }))

    const columns = [
      { header: 'Mã chi phí', key: 'expenseNumber', width: 15 },
      { header: 'Tiêu đề', key: 'title', width: 30 },
      { header: 'Số tiền (VNĐ)', key: 'amount', width: 15 },
      { header: 'Danh mục', key: 'category', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Ngày chi', key: 'expenseDate', width: 15 },
      { header: 'Mô tả', key: 'description', width: 40 },
    ]

    const date = new Date().toISOString().split('T')[0]
    exportToExcel(excelData, columns, `Chi-phi-${date}.xlsx`)
    toast.success('Đã xuất file Excel thành công!')
  }

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        toast.error('File Excel không có dữ liệu')
        return
      }

      let successCount = 0
      let errorCount = 0

      for (const row of jsonData) {
        try {
          const expense = {
            title: (row as any)['Tiêu đề'] || '',
            amount: parseFloat((row as any)['Số tiền (VNĐ)'] || '0'),
            category: (row as any)['Danh mục'] || 'other',
            expenseDate: new Date((row as any)['Ngày chi'] || Date.now()).toISOString().split('T')[0],
            description: (row as any)['Mô tả'] || '',
          }

          if (!expense.title || !expense.amount) {
            errorCount++
            continue
          }

          const response = await authFetch('/api/erp/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense),
          })

          if (response.ok) {
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
          console.error('Error importing row:', error)
        }
      }

      if (successCount > 0) {
        toast.success(`Đã nhập ${successCount} chi phí thành công!`)
        await loadExpenses()
      }

      if (errorCount > 0) {
        toast.warning(`${errorCount} dòng bị lỗi, vui lòng kiểm tra lại file Excel`)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi nhập file Excel')
      console.error(error)
    } finally {
      setIsSubmitting(false)
      // Reset file input
      e.target.value = ''
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quản lý chi phí</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={expenses.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Xuất Excel
          </Button>
          <label htmlFor="import-excel">
            <Button variant="outline" size="sm" asChild disabled={isSubmitting}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Nhập Excel
              </span>
            </Button>
          </label>
          <input
            id="import-excel"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImportExcel}
            disabled={isSubmitting}
          />
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm chi phí
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
      ) : (
        <ExpenseList 
          expenses={expenses}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm chi phí mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin chi phí cần thêm vào hệ thống
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Nhập tiêu đề chi phí"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Số tiền (VNĐ) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Danh mục *</Label>
              <Select name="category" required disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Văn phòng phẩm</SelectItem>
                  <SelectItem value="travel">Đi lại</SelectItem>
                  <SelectItem value="meals">Ăn uống</SelectItem>
                  <SelectItem value="utilities">Điện nước</SelectItem>
                  <SelectItem value="equipment">Trang thiết bị</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expenseDate">Ngày chi *</Label>
              <Input
                id="expenseDate"
                name="expenseDate"
                type="date"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Mô tả chi tiết về chi phí"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết chi phí</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Mã chi phí</Label>
                <p className="font-medium">{selectedExpense.expenseNumber}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Tiêu đề</Label>
                <p className="font-medium">{selectedExpense.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Số tiền</Label>
                  <p className="font-medium text-lg">{selectedExpense.amount.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Danh mục</Label>
                  <p className="font-medium">{selectedExpense.category}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <p className="font-medium">{selectedExpense.status}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày chi</Label>
                  <p className="font-medium">{new Date(selectedExpense.expenseDate).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              {selectedExpense.description && (
                <div>
                  <Label className="text-muted-foreground">Mô tả</Label>
                  <p className="font-medium">{selectedExpense.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa chi phí</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <form onSubmit={handleUpdateExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Tiêu đề *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={selectedExpense.title}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Số tiền (VNĐ) *</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={selectedExpense.amount}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Danh mục *</Label>
                <Select name="category" defaultValue={selectedExpense.category} required disabled={isSubmitting}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Văn phòng phẩm</SelectItem>
                    <SelectItem value="travel">Đi lại</SelectItem>
                    <SelectItem value="meals">Ăn uống</SelectItem>
                    <SelectItem value="utilities">Điện nước</SelectItem>
                    <SelectItem value="equipment">Trang thiết bị</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expenseDate">Ngày chi *</Label>
                <Input
                  id="edit-expenseDate"
                  name="expenseDate"
                  type="date"
                  defaultValue={String(selectedExpense.expenseDate).split('T')[0]}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={selectedExpense.description || ''}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <p>Bạn có chắc chắn muốn xóa chi phí <strong>{selectedExpense.title}</strong>?</p>
              <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
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
                {isSubmitting ? 'Đang thêm...' : 'Thêm chi phí'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

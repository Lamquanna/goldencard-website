'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { EmployeeDirectory } from '@/app/erp/modules/hrm/components/EmployeeDirectory'
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient, ApiError } from '@/lib/api/client'

export default function EmployeesPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await apiClient.get<any>('/erp/employees')
      const emps = data.employees || data || []
      setEmployees(emps)
      
      // Auto-seed if no employees
      if (emps.length === 0) {
        await seedEmployees()
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      if (!(error instanceof ApiError)) {
        toast.error('Không thể tải danh sách nhân viên')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const seedEmployees = async () => {
    setSeeding(true)
    try {
      // First delete existing
      await apiClient.delete('/erp/employees/seed', { skipErrorToast: true })
      
      // Then seed new data
      const data = await apiClient.post<any>('/erp/employees/seed')
      
      if (data.success) {
        const successCount = data.results?.filter((r: any) => r.success).length || 0
        toast.success(`Đã thêm ${successCount} nhân viên từ Golden Energy`)
        
        // Reload employees
        const reloadData = await apiClient.get<any>('/erp/employees')
        setEmployees(reloadData.employees || reloadData || [])
        
        // Force router refresh
        router.refresh()
      }
    } catch (error) {
      console.error('Error seeding employees:', error)
      if (!(error instanceof ApiError)) {
        toast.error('Không thể tải dữ liệu mẫu')
      }
    } finally {
      setSeeding(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/erp/hrm">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Nhân sự
          </Button>
        </Link>
        
        {employees.length === 0 && !loading && (
          <Button onClick={seedEmployees} disabled={seeding} variant="outline">
            {seeding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Tải dữ liệu nhân viên Golden Energy
          </Button>
        )}
      </div>
      
      <h1 className="text-2xl font-bold">Danh sách nhân viên</h1>
      
      <EmployeeDirectory 
        employees={employees} 
        onRefresh={loadEmployees}
        loading={loading || seeding}
      />
    </div>
  )
}

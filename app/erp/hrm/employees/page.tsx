'use client'

import React, { useState, useEffect } from 'react'
import { EmployeeDirectory } from '@/app/erp/modules/hrm/components/EmployeeDirectory'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/erp/employees')
      if (!response.ok) throw new Error('Failed to fetch employees')
      
      const data = await response.json()
      setEmployees(data.employees || [])
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Không thể tải danh sách nhân viên')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <EmployeeDirectory employees={employees} />
    </div>
  )
}

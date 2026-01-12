'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmployeeDirectory } from '@/app/erp/modules/hrm/components/EmployeeDirectory'
import { Loader2, ArrowLeft } from 'lucide-react'
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
    <div className="p-6 space-y-4">
      <div>
        <Link href="/erp/hrm">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Nhân sự
          </Button>
        </Link>
      </div>
      
      <EmployeeDirectory employees={employees} />
    </div>
  )
}

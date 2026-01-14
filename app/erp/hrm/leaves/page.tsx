'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { LeaveManagement } from '@/app/erp/modules/hrm/components/LeaveManagement'

export default function LeavesPage() {
  const [isLoading, setIsLoading] = useState(false)

  // Submit new leave request
  const handleSubmitRequest = async (request: any) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch('/api/erp/leaves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      })
      
      if (res.ok) {
        alert('✅ Đã gửi đơn nghỉ phép')
        window.location.reload()
      } else {
        alert('❌ Không thể gửi đơn')
      }
    } catch {
      alert('❌ Không thể gửi đơn')
    } finally {
      setIsLoading(false)
    }
  }

  // Cancel leave request
  const handleCancelRequest = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này?')) return
    
    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`/api/erp/leaves/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        alert('✅ Đã hủy đơn nghỉ phép')
        window.location.reload()
      } else {
        alert('❌ Không thể hủy đơn')
      }
    } catch {
      alert('❌ Không thể hủy đơn')
    }
  }

  // Approve leave request
  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`/api/erp/leaves/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (res.ok) {
        alert('✅ Đã duyệt đơn nghỉ phép')
        window.location.reload()
      } else {
        alert('❌ Không thể duyệt đơn')
      }
    } catch {
      alert('❌ Không thể duyệt đơn')
    }
  }

  // Reject leave request
  const handleReject = async (id: string) => {
    const reason = prompt('Nhập lý do từ chối:')
    if (!reason) return
    
    try {
      const token = localStorage.getItem('erp_token')
      const res = await fetch(`/api/erp/leaves/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })
      
      if (res.ok) {
        alert('✅ Đã từ chối đơn nghỉ phép')
        window.location.reload()
      } else {
        alert('❌ Không thể từ chối đơn')
      }
    } catch {
      alert('❌ Không thể từ chối đơn')
    }
  }

  return (
    <div className="p-6 space-y-4">
      {/* Back Button */}
      <div>
        <Link href="/erp/hrm">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Nhân sự
          </Button>
        </Link>
      </div>
      
      <LeaveManagement 
        onSubmitRequest={handleSubmitRequest}
        onCancelRequest={handleCancelRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  )
}

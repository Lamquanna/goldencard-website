'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { AttendanceTracker } from '@/app/erp/modules/hrm/components/AttendanceTracker'

export default function AttendancePage() {
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
      
      <div>
        <h1 className="text-2xl font-bold">Chấm công</h1>
        <p className="text-muted-foreground">Quản lý chấm công hàng ngày</p>
      </div>
      
      <AttendanceTracker />
    </div>
  )
}

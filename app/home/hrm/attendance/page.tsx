'use client'

import React from 'react'
import { AttendanceTracker } from '@/app/home/modules/hrm/components/AttendanceTracker'

export default function AttendancePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Chấm công</h1>
        <p className="text-muted-foreground">Quản lý chấm công hàng ngày</p>
      </div>
      <AttendanceTracker />
    </div>
  )
}

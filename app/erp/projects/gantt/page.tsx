'use client'

import React from 'react'
import { GanttChart } from '@/app/erp/modules/project/components/GanttChart'

export default function GanttPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gantt Chart</h1>
        <p className="text-muted-foreground">Xem tiến độ dự án theo timeline</p>
      </div>
      <GanttChart />
    </div>
  )
}

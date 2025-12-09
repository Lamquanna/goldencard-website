'use client'

import React from 'react'
import { TaskBoard } from '@/app/erp/modules/project/components/TaskBoard'

export default function BoardPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <p className="text-muted-foreground">Quản lý công việc theo trạng thái</p>
      </div>
      <TaskBoard />
    </div>
  )
}

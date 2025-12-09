'use client'

import React, { useState, useMemo } from 'react'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays, isSameDay, isWeekend } from 'date-fns'
import { vi } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Task, Milestone, TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from '../index'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTasks: (Task & { startDate: Date; dueDate: Date })[] = [
  {
    id: 't1',
    taskNumber: 1,
    key: 'PRJ-1',
    title: 'Setup project structure',
    projectId: 'p1',
    status: 'done',
    priority: 'high',
    type: 'task',
    reporterId: 'u1',
    assigneeId: 'u1',
    assignee: { id: 'u1', name: 'Nguyễn Văn A', avatar: '' },
    startDate: new Date(2025, 1, 1),
    dueDate: new Date(2025, 1, 5),
    labels: [],
    order: 0,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't2',
    taskNumber: 2,
    key: 'PRJ-2',
    title: 'Design system implementation',
    projectId: 'p1',
    status: 'in_progress',
    priority: 'urgent',
    type: 'feature',
    reporterId: 'u1',
    assigneeId: 'u2',
    assignee: { id: 'u2', name: 'Trần Thị B', avatar: '' },
    startDate: new Date(2025, 1, 5),
    dueDate: new Date(2025, 1, 20),
    labels: [],
    order: 1,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't3',
    taskNumber: 3,
    key: 'PRJ-3',
    title: 'API integration',
    projectId: 'p1',
    status: 'todo',
    priority: 'high',
    type: 'feature',
    reporterId: 'u1',
    assigneeId: 'u3',
    assignee: { id: 'u3', name: 'Lê Văn C', avatar: '' },
    startDate: new Date(2025, 1, 15),
    dueDate: new Date(2025, 1, 28),
    labels: [],
    order: 2,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't4',
    taskNumber: 4,
    key: 'PRJ-4',
    title: 'Testing & QA',
    projectId: 'p1',
    status: 'backlog',
    priority: 'medium',
    type: 'task',
    reporterId: 'u1',
    startDate: new Date(2025, 1, 25),
    dueDate: new Date(2025, 2, 5),
    labels: [],
    order: 3,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't5',
    taskNumber: 5,
    key: 'PRJ-5',
    title: 'Documentation',
    projectId: 'p1',
    status: 'backlog',
    priority: 'low',
    type: 'task',
    reporterId: 'u1',
    startDate: new Date(2025, 2, 1),
    dueDate: new Date(2025, 2, 10),
    labels: [],
    order: 4,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    projectId: 'p1',
    name: 'Alpha Release',
    dueDate: new Date(2025, 1, 15),
    status: 'active',
    progress: 60,
    taskCount: 5,
    completedTaskCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'm2',
    projectId: 'p1',
    name: 'Beta Release',
    dueDate: new Date(2025, 2, 1),
    status: 'active',
    progress: 20,
    taskCount: 8,
    completedTaskCount: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// TYPES
// =============================================================================

type ZoomLevel = 'day' | 'week' | 'month'

interface GanttChartProps {
  tasks?: (Task & { startDate: Date; dueDate: Date })[]
  milestones?: Milestone[]
  onTaskClick?: (task: Task) => void
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getDateRange(tasks: (Task & { startDate: Date; dueDate: Date })[], milestones: Milestone[]) {
  let minDate = new Date()
  let maxDate = new Date()

  tasks.forEach(task => {
    if (task.startDate < minDate) minDate = task.startDate
    if (task.dueDate > maxDate) maxDate = task.dueDate
  })

  milestones.forEach(milestone => {
    if (milestone.dueDate > maxDate) maxDate = milestone.dueDate
  })

  // Add padding
  minDate = addDays(startOfMonth(minDate), -7)
  maxDate = addDays(endOfMonth(maxDate), 7)

  return { minDate, maxDate }
}

function getBarPosition(
  startDate: Date,
  endDate: Date,
  minDate: Date,
  dayWidth: number
): { left: number; width: number } {
  const startOffset = differenceInDays(startDate, minDate)
  const duration = differenceInDays(endDate, startDate) + 1
  return {
    left: startOffset * dayWidth,
    width: Math.max(duration * dayWidth - 4, 20),
  }
}

function getProgressWidth(progress: number, totalWidth: number): number {
  return (progress / 100) * totalWidth
}

// =============================================================================
// GANTT TASK ROW
// =============================================================================

interface GanttTaskRowProps {
  task: Task & { startDate: Date; dueDate: Date }
  minDate: Date
  dayWidth: number
  onClick?: () => void
}

function GanttTaskRow({ task, minDate, dayWidth, onClick }: GanttTaskRowProps) {
  const { left, width } = getBarPosition(task.startDate, task.dueDate, minDate, dayWidth)
  const statusConfig = TASK_STATUS_CONFIG[task.status]
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority]

  const progress = task.status === 'done' ? 100 : task.status === 'in_progress' ? 50 : 0

  return (
    <div className="flex items-center h-10 group">
      {/* Task Bar */}
      <div
        className="absolute h-7 rounded cursor-pointer transition-all group-hover:shadow-md"
        style={{
          left: `${left}px`,
          width: `${width}px`,
          backgroundColor: `${statusConfig.color.replace('bg-', '')}20`,
        }}
        onClick={onClick}
      >
        {/* Progress fill */}
        <div
          className={`h-full rounded ${statusConfig.color}`}
          style={{ width: `${progress}%` }}
        />
        
        {/* Task title */}
        <div className="absolute inset-0 flex items-center px-2 overflow-hidden">
          <span className="text-xs font-medium truncate text-foreground">
            {task.key}: {task.title}
          </span>
        </div>

        {/* Priority indicator */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2">
          <span className="text-xs">{priorityConfig.icon}</span>
        </div>

        {/* Assignee */}
        {task.assignee && (
          <div className="absolute -right-3 top-1/2 -translate-y-1/2">
            <Avatar className="h-6 w-6 border-2 border-background">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-[10px]">
                {task.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// MILESTONE MARKER
// =============================================================================

interface MilestoneMarkerProps {
  milestone: Milestone
  minDate: Date
  dayWidth: number
}

function MilestoneMarker({ milestone, minDate, dayWidth }: MilestoneMarkerProps) {
  const offset = differenceInDays(milestone.dueDate, minDate)
  const left = offset * dayWidth

  return (
    <div
      className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
      style={{ left: `${left}px` }}
    >
      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-purple-500" />
      <div className="w-px h-full bg-purple-500/30" />
      <div className="absolute top-4 whitespace-nowrap bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded">
        {milestone.name}
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function GanttChart({
  tasks = mockTasks,
  milestones = mockMilestones,
  onTaskClick,
}: GanttChartProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const dayWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 40
      case 'week': return 25
      case 'month': return 10
    }
  }, [zoomLevel])

  const { minDate, maxDate } = useMemo(() => getDateRange(tasks, milestones), [tasks, milestones])
  const days = useMemo(() => eachDayOfInterval({ start: minDate, end: maxDate }), [minDate, maxDate])
  const totalWidth = days.length * dayWidth

  // Group days by week for header
  const weeks = useMemo(() => {
    const result: { start: Date; days: Date[] }[] = []
    let currentWeek: Date[] = []
    let weekStart: Date | null = null

    days.forEach(day => {
      if (day.getDay() === 1 || currentWeek.length === 0) {
        if (currentWeek.length > 0 && weekStart) {
          result.push({ start: weekStart, days: currentWeek })
        }
        currentWeek = [day]
        weekStart = day
      } else {
        currentWeek.push(day)
      }
    })

    if (currentWeek.length > 0 && weekStart) {
      result.push({ start: weekStart, days: currentWeek })
    }

    return result
  }, [days])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[180px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </span>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setZoomLevel(prev => prev === 'day' ? 'week' : 'day')}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Select value={zoomLevel} onValueChange={(v) => setZoomLevel(v as ZoomLevel)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <div className="flex overflow-auto">
          {/* Task List (Left Panel) */}
          <div className="flex-shrink-0 w-[280px] border-r">
            {/* Header */}
            <div className="h-12 border-b flex items-center px-4 bg-muted/50 font-medium">
              Công việc
            </div>

            {/* Task List */}
            <div className="divide-y">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className="h-10 flex items-center px-4 gap-2 hover:bg-muted/50 cursor-pointer"
                  onClick={() => onTaskClick?.(task)}
                >
                  <span className="text-xs text-muted-foreground font-mono">{task.key}</span>
                  <span className="truncate text-sm">{task.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline (Right Panel) */}
          <div className="flex-1 overflow-x-auto">
            {/* Timeline Header */}
            <div className="h-12 border-b bg-muted/50 relative" style={{ width: totalWidth }}>
              {/* Week headers */}
              <div className="flex h-6 border-b">
                {weeks.map((week, idx) => (
                  <div
                    key={idx}
                    className="border-r text-xs font-medium flex items-center justify-center"
                    style={{ width: week.days.length * dayWidth }}
                  >
                    {format(week.start, 'dd MMM', { locale: vi })}
                  </div>
                ))}
              </div>

              {/* Day headers */}
              <div className="flex h-6">
                {days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-center text-xs border-r ${
                      isWeekend(day) ? 'bg-muted' : ''
                    } ${isSameDay(day, new Date()) ? 'bg-blue-100 font-bold' : ''}`}
                    style={{ width: dayWidth }}
                  >
                    {zoomLevel !== 'month' && format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Bars */}
            <div className="relative" style={{ width: totalWidth }}>
              {/* Grid lines */}
              <div className="absolute inset-0 flex pointer-events-none">
                {days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`border-r h-full ${isWeekend(day) ? 'bg-muted/30' : ''}`}
                    style={{ width: dayWidth }}
                  />
                ))}
              </div>

              {/* Today line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                style={{ left: differenceInDays(new Date(), minDate) * dayWidth }}
              />

              {/* Milestone markers */}
              {milestones.map(milestone => (
                <MilestoneMarker
                  key={milestone.id}
                  milestone={milestone}
                  minDate={minDate}
                  dayWidth={dayWidth}
                />
              ))}

              {/* Task rows */}
              <div className="divide-y relative">
                {tasks.map(task => (
                  <GanttTaskRow
                    key={task.id}
                    task={task}
                    minDate={minDate}
                    dayWidth={dayWidth}
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Hoàn thành</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>Đang làm</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded" />
          <span>Chưa bắt đầu</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-transparent border-t-purple-500" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-red-500" />
          <span>Hôm nay</span>
        </div>
      </div>
    </div>
  )
}

export default GanttChart

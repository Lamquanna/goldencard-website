'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Plus,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  AlertCircle,
  User,
  ChevronDown,
  Filter,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Task,
  TaskStatus,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG,
  KANBAN_COLUMNS,
  getTasksByStatus,
  isTaskOverdue,
  getTimeRemaining,
} from '../index'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTasks: Task[] = [
  {
    id: 't1',
    taskNumber: 1,
    key: 'PRJ-1',
    title: 'Setup project structure',
    description: 'Initialize the project with proper folder structure',
    projectId: 'p1',
    status: 'done',
    priority: 'high',
    type: 'task',
    reporterId: 'u1',
    assigneeId: 'u1',
    assignee: { id: 'u1', name: 'Nguyễn Văn A', avatar: '' },
    dueDate: new Date(2025, 1, 10),
    completedAt: new Date(2025, 1, 8),
    estimatedHours: 4,
    loggedHours: 3.5,
    labels: [{ id: 'l1', name: 'Frontend', color: '#3B82F6' }],
    order: 0,
    attachmentCount: 2,
    commentCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't2',
    taskNumber: 2,
    key: 'PRJ-2',
    title: 'Design system implementation',
    description: 'Implement the design system components',
    projectId: 'p1',
    status: 'in_progress',
    priority: 'urgent',
    type: 'feature',
    reporterId: 'u1',
    assigneeId: 'u2',
    assignee: { id: 'u2', name: 'Trần Thị B', avatar: '' },
    dueDate: new Date(2025, 1, 20),
    estimatedHours: 16,
    loggedHours: 8,
    labels: [
      { id: 'l1', name: 'Frontend', color: '#3B82F6' },
      { id: 'l3', name: 'Design', color: '#8B5CF6' },
    ],
    order: 0,
    attachmentCount: 0,
    commentCount: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't3',
    taskNumber: 3,
    key: 'PRJ-3',
    title: 'API integration',
    description: 'Connect frontend with backend APIs',
    projectId: 'p1',
    status: 'todo',
    priority: 'high',
    type: 'feature',
    reporterId: 'u1',
    assigneeId: 'u3',
    assignee: { id: 'u3', name: 'Lê Văn C', avatar: '' },
    dueDate: new Date(2025, 1, 25),
    estimatedHours: 24,
    loggedHours: 0,
    labels: [{ id: 'l2', name: 'Backend', color: '#10B981' }],
    order: 0,
    attachmentCount: 1,
    commentCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't4',
    taskNumber: 4,
    key: 'PRJ-4',
    title: 'Fix login bug',
    description: 'Users cannot login with special characters in password',
    projectId: 'p1',
    status: 'review',
    priority: 'urgent',
    type: 'bug',
    reporterId: 'u2',
    assigneeId: 'u1',
    assignee: { id: 'u1', name: 'Nguyễn Văn A', avatar: '' },
    dueDate: new Date(2025, 1, 15),
    estimatedHours: 2,
    loggedHours: 1.5,
    labels: [{ id: 'l2', name: 'Backend', color: '#10B981' }],
    order: 0,
    attachmentCount: 0,
    commentCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't5',
    taskNumber: 5,
    key: 'PRJ-5',
    title: 'Write documentation',
    description: 'Create user guide and API documentation',
    projectId: 'p1',
    status: 'backlog',
    priority: 'low',
    type: 'task',
    reporterId: 'u1',
    labels: [{ id: 'l4', name: 'Documentation', color: '#F59E0B' }],
    order: 0,
    attachmentCount: 0,
    commentCount: 0,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 't6',
    taskNumber: 6,
    key: 'PRJ-6',
    title: 'Performance optimization',
    description: 'Optimize database queries and frontend rendering',
    projectId: 'p1',
    status: 'blocked',
    priority: 'medium',
    type: 'improvement',
    reporterId: 'u1',
    assigneeId: 'u2',
    assignee: { id: 'u2', name: 'Trần Thị B', avatar: '' },
    blockedBy: ['t3'],
    labels: [],
    order: 0,
    attachmentCount: 0,
    commentCount: 2,
    loggedHours: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// TASK CARD COMPONENT
// =============================================================================

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

function TaskCard({ task, isDragging }: TaskCardProps) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority]
  const typeConfig = TASK_TYPE_CONFIG[task.type]
  const overdue = isTaskOverdue(task)

  return (
    <Card className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <CardContent className="p-3 space-y-2">
        {/* Type & Key */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{typeConfig.icon}</span>
            <span className="text-xs text-muted-foreground font-mono">{task.key}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
              <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
              <DropdownMenuItem>Di chuyển</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <p className="font-medium text-sm line-clamp-2">{task.title}</p>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map(label => (
              <span
                key={label.id}
                className="px-1.5 py-0.5 rounded text-xs text-white"
                style={{ backgroundColor: label.color }}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta info */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {/* Priority */}
            <span className={`px-1.5 py-0.5 rounded text-xs ${priorityConfig.color}`}>
              {priorityConfig.icon}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span className={`flex items-center gap-1 text-xs ${overdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                {getTimeRemaining(task.dueDate)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Comments */}
            {task.commentCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                {task.commentCount}
              </span>
            )}

            {/* Attachments */}
            {task.attachmentCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {task.attachmentCount}
              </span>
            )}

            {/* Assignee */}
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatar} />
                <AvatarFallback className="text-xs">
                  {task.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// SORTABLE TASK
// =============================================================================

function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  )
}

// =============================================================================
// KANBAN COLUMN
// =============================================================================

interface KanbanColumnProps {
  status: TaskStatus
  title: string
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
}

function KanbanColumn({ status, title, tasks, onAddTask }: KanbanColumnProps) {
  const statusConfig = TASK_STATUS_CONFIG[status]

  return (
    <div className="flex-shrink-0 w-[300px]">
      <div className="bg-muted/50 rounded-lg p-3 h-full">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${statusConfig.color}`} />
            <h3 className="font-medium">{title}</h3>
            <Badge variant="secondary" className="ml-1">
              {tasks.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddTask(status)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tasks */}
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[100px]">
            {tasks.map(task => (
              <SortableTask key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>

        {/* Add Task Button */}
        <Button
          variant="ghost"
          className="w-full mt-2 justify-start text-muted-foreground"
          onClick={() => onAddTask(status)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm công việc
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface TaskBoardProps {
  projectId?: string
  initialTasks?: Task[]
  onTaskMove?: (taskId: string, newStatus: TaskStatus) => void
  onTaskCreate?: (status: TaskStatus) => void
}

export function TaskBoard({
  projectId,
  initialTasks = mockTasks,
  onTaskMove = () => {},
  onTaskCreate = () => {},
}: TaskBoardProps) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Filter tasks by search
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(
      task =>
        task.title.toLowerCase().includes(query) ||
        task.key.toLowerCase().includes(query)
    )
  }, [tasks, searchQuery])

  // Group tasks by status
  const tasksByStatus = useMemo(() => getTasksByStatus(filteredTasks), [filteredTasks])

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find the task and determine if moving to a new column
    const activeTask = tasks.find(t => t.id === activeId)
    const overTask = tasks.find(t => t.id === overId)

    if (!activeTask) {
      setActiveTask(null)
      return
    }

    // If dropping on another task, get that task's status
    // Otherwise, check if dropping on a column
    let newStatus: TaskStatus | null = null
    
    if (overTask) {
      newStatus = overTask.status
    } else {
      // Check if overId is a column status
      const isColumn = KANBAN_COLUMNS.some(col => col.status === overId)
      if (isColumn) {
        newStatus = overId as TaskStatus
      }
    }

    if (newStatus && newStatus !== activeTask.status) {
      // Move to new column
      setTasks(prev =>
        prev.map(t =>
          t.id === activeId ? { ...t, status: newStatus! } : t
        )
      )
      onTaskMove(activeId, newStatus)
    } else if (overTask && activeTask.status === overTask.status) {
      // Reorder within same column
      const columnTasks = tasks.filter(t => t.status === activeTask.status)
      const oldIndex = columnTasks.findIndex(t => t.id === activeId)
      const newIndex = columnTasks.findIndex(t => t.id === overId)

      if (oldIndex !== newIndex) {
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex)
        setTasks(prev => {
          const otherTasks = prev.filter(t => t.status !== activeTask.status)
          return [...otherTasks, ...reorderedTasks.map((t, i) => ({ ...t, order: i }))]
        })
      }
    }

    setActiveTask(null)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Lọc
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>

        <Button variant="outline">
          <User className="h-4 w-4 mr-2" />
          Người thực hiện
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(column => (
              <KanbanColumn
                key={column.status}
                status={column.status}
                title={column.titleVi}
                tasks={tasksByStatus[column.status]}
                onAddTask={onTaskCreate}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <TaskCard task={activeTask} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}

export default TaskBoard

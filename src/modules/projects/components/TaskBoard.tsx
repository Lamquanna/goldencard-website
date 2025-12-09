'use client';

import React, { useState, useMemo, useCallback } from 'react';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isAfter, isBefore } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  Tag,
  CheckSquare,
  MessageSquare,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProjectStore, selectTasksByColumn } from '../store';
import {
  Task,
  TaskStatus,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
  TASK_TYPE_CONFIG,
  KANBAN_COLUMNS,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface TaskBoardProps {
  projectId: string;
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const isOverdue = (dueDate: Date | undefined): boolean => {
  if (!dueDate) return false;
  return isBefore(new Date(dueDate), new Date());
};

// ============================================================================
// TASK CARD COMPONENT
// ============================================================================

interface TaskCardProps {
  task: Task;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function SortableTaskCard({ task, onView, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const typeConfig = TASK_TYPE_CONFIG[task.type];
  const overdue = task.status !== 'DONE' && isOverdue(task.dueDate);
  const checklistProgress = task.checklist
    ? Math.round((task.checklist.filter((c) => c.isCompleted).length / task.checklist.length) * 100)
    : 0;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group bg-white dark:bg-zinc-900 rounded-lg border shadow-sm',
        'hover:shadow-md transition-shadow',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center px-3 py-1.5 border-b border-zinc-100 dark:border-zinc-800 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />
        <div className="flex items-center gap-2 ml-2 flex-1">
          <span className="text-xs text-zinc-400">#{task.id.slice(-4)}</span>
          <Badge 
            variant="outline" 
            className={cn('text-[10px] px-1.5 py-0', typeConfig.color)}
          >
            {typeConfig.icon} {typeConfig.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Content */}
      <div className="p-3 cursor-pointer" onClick={onView}>
        {/* Priority */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs">{priorityConfig.icon}</span>
          <span className={cn('text-xs font-medium', priorityConfig.color)}>
            {priorityConfig.label}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">
          {task.title}
        </h4>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Checklist Progress */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                Checklist
              </span>
              <span>
                {task.checklist.filter((c) => c.isCompleted).length}/{task.checklist.length}
              </span>
            </div>
            <Progress value={checklistProgress} className="h-1" />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            {/* Assignee */}
            {task.assignee ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(task.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{task.assignee.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
                <User className="h-3 w-3 text-zinc-400" />
              </div>
            )}

            {/* Comments Count */}
            {task.comments && task.comments.length > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-zinc-500">
                <MessageSquare className="h-3 w-3" />
                {task.comments.length}
              </span>
            )}

            {/* Time Estimate */}
            {task.estimatedHours && (
              <span className="flex items-center gap-0.5 text-xs text-zinc-500">
                <Clock className="h-3 w-3" />
                {task.estimatedHours}h
              </span>
            )}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-[10px]',
                overdue ? 'text-red-600 font-medium' : 'text-zinc-500'
              )}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'dd/MM', { locale: vi })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// KANBAN COLUMN COMPONENT
// ============================================================================

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask?: () => void;
  onTaskView?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
}

function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onTaskView,
  onTaskEdit,
  onTaskDelete,
}: KanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-80 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
      {/* Column Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {tasks.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Column Items */}
      <div className="h-[calc(100vh-300px)] overflow-y-auto">
        <div className="p-2 space-y-2">
          <SortableContext
            items={tasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onView={() => onTaskView?.(task)}
                  onEdit={() => onTaskEdit?.(task)}
                  onDelete={() => onTaskDelete?.(task)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-zinc-400">Chưa có task nào</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={onAddTask}
              >
                <Plus className="mr-1 h-3 w-3" />
                Thêm task
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DRAG OVERLAY ITEM
// ============================================================================

function DragOverlayItem({ task }: { task: Task }) {
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];
  const typeConfig = TASK_TYPE_CONFIG[task.type];

  return (
    <div className="w-80 bg-white dark:bg-zinc-900 rounded-lg border-2 border-primary shadow-xl p-3">
      <div className="flex items-center gap-1 mb-2">
        <span className="text-xs">{priorityConfig.icon}</span>
        <Badge variant="outline" className={cn('text-[10px]', typeConfig.color)}>
          {typeConfig.label}
        </Badge>
      </div>
      <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 line-clamp-2">
        {task.title}
      </h4>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TaskBoard({
  projectId,
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { tasks, moveTask, selectTask, setTaskFilters } = useProjectStore();
  
  // Filter tasks by project
  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === projectId);
  }, [tasks, projectId]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const columns: Record<TaskStatus, Task[]> = {
      BACKLOG: [],
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
      CANCELLED: [],
    };
    
    projectTasks.forEach((task) => {
      if (task.status !== 'CANCELLED') {
        columns[task.status].push(task);
      }
    });
    
    // Sort by order
    Object.keys(columns).forEach((status) => {
      columns[status as TaskStatus].sort((a, b) => a.order - b.order);
    });
    
    return columns;
  }, [projectTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = projectTasks.find((t) => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [projectTasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Handle drag over for visual feedback
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active task
    const activeTaskData = projectTasks.find((t) => t.id === activeId);
    if (!activeTaskData) return;

    // Determine the target status
    let targetStatus: TaskStatus = activeTaskData.status;
    let targetOrder = 0;

    // Check if dropped on a column
    const columnId = KANBAN_COLUMNS.find((c) => c.id === overId)?.id;
    if (columnId) {
      targetStatus = columnId;
      targetOrder = tasksByStatus[targetStatus].length;
    } else {
      // Dropped on another task
      const overTask = projectTasks.find((t) => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
        targetOrder = overTask.order;
      }
    }

    // Move the task
    if (activeTaskData.status !== targetStatus || activeTaskData.order !== targetOrder) {
      moveTask(activeId, targetStatus, targetOrder);
    }
  }, [projectTasks, tasksByStatus, moveTask]);

  const handleTaskView = useCallback((task: Task) => {
    selectTask(task);
    onTaskClick?.(task);
  }, [selectTask, onTaskClick]);

  return (
    <div className="h-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {KANBAN_COLUMNS.filter((col) => col.id !== 'CANCELLED').map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasksByStatus[column.id]}
              onAddTask={() => onAddTask?.(column.id)}
              onTaskView={handleTaskView}
              onTaskEdit={onEditTask}
              onTaskDelete={onDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <DragOverlayItem task={activeTask} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

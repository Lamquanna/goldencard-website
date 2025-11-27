'use client';

// Project Kanban Board Component
// Drag and drop task management with real-time updates

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { 
  ProjectTask, 
  TaskStatus, 
  KanbanColumn,
  ProjectPriority 
} from '@/lib/types/project';
import { 
  getStatusLabel, 
  getPriorityLabel, 
  getPriorityColor,
  getStatusColor 
} from '@/lib/types/project';

interface ProjectKanbanProps {
  projectId: string;
  tasks: ProjectTask[];
  onTaskMove: (taskId: string, newStatus: TaskStatus, newOrder?: number) => Promise<void>;
  onTaskClick: (task: ProjectTask) => void;
  onAddTask: (status: TaskStatus) => void;
  isLoading?: boolean;
}

// Default columns configuration
const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'Cần làm', color: '#3B82F6' },
  { id: 'in_progress', title: 'Đang làm', color: '#F59E0B' },
  { id: 'review', title: 'Đang xem xét', color: '#8B5CF6' },
  { id: 'done', title: 'Hoàn thành', color: '#10B981' },
];

export default function ProjectKanban({
  projectId,
  tasks,
  onTaskMove,
  onTaskClick,
  onAddTask,
  isLoading = false,
}: ProjectKanbanProps) {
  const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);
  const [localTasks, setLocalTasks] = useState<ProjectTask[]>(tasks);

  // Update local tasks when props change
  React.useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, ProjectTask[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
    };

    localTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort each column by order
    Object.keys(grouped).forEach(status => {
      grouped[status as TaskStatus].sort((a, b) => (a.updated_at > b.updated_at ? -1 : 1));
    });

    return grouped;
  }, [localTasks]);

  // DnD sensors
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

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = localTasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [localTasks]);

  // Handle drag over (for column changes)
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find if we're over a column
    const overColumn = COLUMNS.find(col => col.id === overId);
    if (overColumn) {
      const activeTask = localTasks.find(t => t.id === activeId);
      if (activeTask && activeTask.status !== overColumn.id) {
        // Move to new column
        setLocalTasks(prev => 
          prev.map(t => 
            t.id === activeId 
              ? { ...t, status: overColumn.id } 
              : t
          )
        );
      }
    }
  }, [localTasks]);

  // Handle drag end
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = localTasks.find(t => t.id === activeId);
    if (!activeTask) return;

    // Determine the target status
    let targetStatus = activeTask.status;
    const overColumn = COLUMNS.find(col => col.id === overId);
    if (overColumn) {
      targetStatus = overColumn.id;
    } else {
      const overTask = localTasks.find(t => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    // Call the API to update
    try {
      await onTaskMove(activeId, targetStatus);
    } catch (error) {
      console.error('Failed to move task:', error);
      // Revert local state
      setLocalTasks(tasks);
    }
  }, [localTasks, tasks, onTaskMove]);

  return (
    <div className="h-full overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-4 min-w-max h-full">
          {COLUMNS.map(column => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id]}
              onTaskClick={onTaskClick}
              onAddTask={() => onAddTask(column.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <TaskCard task={activeTask} isDragging onClick={() => {}} />
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Kanban Column Component
interface KanbanColumnComponentProps {
  column: { id: TaskStatus; title: string; color: string };
  tasks: ProjectTask[];
  onTaskClick: (task: ProjectTask) => void;
  onAddTask: () => void;
  isLoading: boolean;
}

function KanbanColumnComponent({
  column,
  tasks,
  onTaskClick,
  onAddTask,
  isLoading,
}: KanbanColumnComponentProps) {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-72 flex-shrink-0 bg-gray-50 rounded-xl flex flex-col h-full"
    >
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-gray-900">{column.title}</h3>
          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddTask}
          className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* Empty state */}
        {tasks.length === 0 && !isLoading && (
          <div className="py-8 text-center text-gray-400">
            <p className="text-sm">Chưa có công việc</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sortable Task Card Wrapper
interface SortableTaskCardProps {
  task: ProjectTask;
  onClick: () => void;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: ProjectTask;
  onClick: () => void;
  isDragging?: boolean;
}

function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer
        hover:shadow-md hover:border-gray-200 transition-all ${
        isDragging ? 'shadow-lg ring-2 ring-sky-500' : ''
      }`}
    >
      {/* Priority indicator */}
      <div 
        className="w-full h-1 rounded-full mb-2" 
        style={{ backgroundColor: priorityColor }}
      />

      {/* Title */}
      <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Priority badge */}
          <span 
            className="px-1.5 py-0.5 rounded text-white font-medium"
            style={{ backgroundColor: priorityColor }}
          >
            {getPriorityLabel(task.priority).charAt(0)}
          </span>

          {/* Due date */}
          {task.due_date && (
            <span className={`flex items-center gap-1 ${
              isOverdue ? 'text-red-500' : 'text-gray-500'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(task.due_date)}
            </span>
          )}
        </div>

        {/* Assignee */}
        {task.assigned_to && (
          <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-medium">
            {task.assigned_to.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return 'Hôm nay';
  if (date.toDateString() === tomorrow.toDateString()) return 'Ngày mai';
  
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

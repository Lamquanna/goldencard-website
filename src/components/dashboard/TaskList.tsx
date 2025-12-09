// ============================================================================
// TASK LIST COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  ChevronRight,
  CalendarDays,
  User,
  Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { TaskListProps, TaskItem, TaskPriority, TaskStatus } from './types';

// ============================================================================
// PRIORITY CONFIG
// ============================================================================

const priorityConfig: Record<TaskPriority, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  urgent: {
    label: 'Khẩn cấp',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  high: {
    label: 'Cao',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  medium: {
    label: 'Trung bình',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  low: {
    label: 'Thấp',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
};

// ============================================================================
// STATUS CONFIG
// ============================================================================

const statusConfig: Record<TaskStatus, {
  icon: typeof Circle;
  color: string;
  label: string;
}> = {
  pending: {
    icon: Circle,
    color: 'text-gray-400',
    label: 'Chờ xử lý',
  },
  in_progress: {
    icon: Clock,
    color: 'text-blue-500',
    label: 'Đang thực hiện',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-500',
    label: 'Hoàn thành',
  },
  overdue: {
    icon: AlertCircle,
    color: 'text-red-500',
    label: 'Quá hạn',
  },
};

// ============================================================================
// SKELETON LOADER
// ============================================================================

function TaskListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
          <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// TASK ITEM COMPONENT
// ============================================================================

interface TaskItemCardProps {
  task: TaskItem;
  showPriority?: boolean;
  showAssignee?: boolean;
  showProject?: boolean;
  onClick?: () => void;
  index: number;
}

function TaskItemCard({
  task,
  showPriority = true,
  showAssignee = false,
  showProject = false,
  onClick,
  index,
}: TaskItemCardProps) {
  const StatusIcon = statusConfig[task.status].icon;
  const priorityStyle = priorityConfig[task.priority];
  
  // Format due date
  const dueLabel = task.dueDate
    ? formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: vi })
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        task.status === 'overdue' && 'bg-red-50/50 dark:bg-red-900/10'
      )}
      onClick={onClick}
    >
      {/* Status Icon */}
      <StatusIcon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', statusConfig[task.status].color)} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium text-gray-900 dark:text-white truncate',
          task.status === 'completed' && 'line-through text-gray-500'
        )}>
          {task.title}
        </p>
        
        {/* Meta info */}
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {/* Priority badge */}
          {showPriority && (
            <span className={cn(
              'text-xs font-medium px-2 py-0.5 rounded',
              priorityStyle.bgColor,
              priorityStyle.color
            )}>
              {priorityStyle.label}
            </span>
          )}
          
          {/* Due date */}
          {dueLabel && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              task.status === 'overdue' ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'
            )}>
              <CalendarDays className="w-3 h-3" />
              {dueLabel}
            </span>
          )}
          
          {/* Project */}
          {showProject && task.project && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Folder className="w-3 h-3" />
              {task.project.name}
            </span>
          )}
          
          {/* Assignee */}
          {showAssignee && task.assignee && (
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3 h-3" />
              {task.assignee.name}
            </span>
          )}
        </div>
      </div>
      
      {/* Arrow */}
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TaskList({
  tasks,
  title = 'Công việc của tôi',
  maxItems = 5,
  showPriority = true,
  showAssignee = false,
  showProject = false,
  loading = false,
  emptyMessage = 'Không có công việc nào',
  onTaskClick,
  onViewAll,
  className,
}: TaskListProps) {
  const displayTasks = tasks.slice(0, maxItems);
  const hasMore = tasks.length > maxItems;
  
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <TaskListSkeleton count={maxItems} />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          {tasks.length > 0 && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {tasks.length}
            </span>
          )}
        </div>
        
        {onViewAll && hasMore && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
          >
            Xem tất cả
          </button>
        )}
      </div>
      
      {/* Task List */}
      {displayTasks.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayTasks.map((task, index) => (
            <TaskItemCard
              key={task.id}
              task={task}
              showPriority={showPriority}
              showAssignee={showAssignee}
              showProject={showProject}
              onClick={() => onTaskClick?.(task)}
              index={index}
            />
          ))}
        </div>
      )}
      
      {/* Summary */}
      {tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-around text-center">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {tasks.filter((t) => t.status === 'overdue').length}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">Quá hạn</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {tasks.filter((t) => t.status === 'in_progress').length}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Đang làm</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {tasks.filter((t) => t.status === 'completed').length}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">Hoàn thành</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TaskList;

'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  differenceInDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachWeekOfInterval,
  isToday,
  parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectStore } from '../store';
import {
  Task,
  Milestone,
  TaskStatus,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'day' | 'week' | 'month';

interface GanttChartProps {
  projectId?: string;
  onTaskClick?: (task: Task) => void;
  onMilestoneClick?: (milestone: Milestone) => void;
}

interface GanttBarProps {
  item: Task | Milestone;
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  viewStartDate: Date;
  onClick?: () => void;
  isMilestone?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DAY_WIDTH = {
  day: 60,
  week: 30,
  month: 8,
};

const VIEW_LABELS: Record<ViewMode, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
};

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

const parseDate = (date: string | Date): Date => {
  if (typeof date === 'string') {
    return parseISO(date);
  }
  return date;
};

// ============================================================================
// GANTT BAR COMPONENT
// ============================================================================

function GanttBar({
  item,
  startDate,
  endDate,
  dayWidth,
  viewStartDate,
  onClick,
  isMilestone = false,
}: GanttBarProps) {
  const offsetDays = differenceInDays(startDate, viewStartDate);
  const durationDays = Math.max(differenceInDays(endDate, startDate), 1);

  const left = Math.max(offsetDays * dayWidth, 0);
  const width = durationDays * dayWidth;

  const isTask = 'status' in item;

  if (isMilestone) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-1/2 -translate-y-1/2 cursor-pointer"
              style={{ left: `${left}px` }}
              onClick={onClick}
            >
              <div className="w-4 h-4 bg-purple-500 rotate-45 border-2 border-white shadow-md" />
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{'name' in item ? item.name : 'title' in item ? (item as Task).title : ''}</p>
            <p className="text-xs text-zinc-500">
              {format(startDate, 'dd/MM/yyyy')}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!isTask) return null;

  const task = item as Task;
  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

  const bgColor = {
    BACKLOG: 'bg-zinc-300',
    TODO: 'bg-zinc-400',
    IN_PROGRESS: 'bg-blue-500',
    IN_REVIEW: 'bg-amber-500',
    DONE: 'bg-emerald-500',
    BLOCKED: 'bg-red-500',
    CANCELLED: 'bg-zinc-300',
  }[task.status];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer',
              'shadow-sm hover:shadow-md transition-shadow',
              bgColor
            )}
            style={{
              left: `${left}px`,
              width: `${width}px`,
              transformOrigin: 'left',
            }}
            onClick={onClick}
          >
            {/* Progress fill */}
            {(task.progress ?? 0) > 0 && (
              <div
                className="absolute inset-y-0 left-0 bg-white/30 rounded-l"
                style={{ width: `${task.progress}%` }}
              />
            )}

            {/* Label */}
            {width > 50 && (
              <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate">
                {task.title}
              </span>
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{task.title}</p>
            <div className="flex items-center gap-2 text-xs">
              <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                {statusConfig.label}
              </Badge>
              <Badge className={cn('text-xs', priorityConfig.bgColor, priorityConfig.color)}>
                {priorityConfig.label}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500">
              {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <span>Tiến độ:</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// TASK ROW COMPONENT
// ============================================================================

interface TaskRowProps {
  task: Task;
  dayWidth: number;
  viewStartDate: Date;
  viewEndDate: Date;
  onClick?: () => void;
}

function TaskRow({ task, dayWidth, viewStartDate, viewEndDate, onClick }: TaskRowProps) {
  const taskStart = parseDate(task.startDate || task.createdAt);
  const taskEnd = parseDate(task.dueDate || taskStart);

  const statusConfig = TASK_STATUS_CONFIG[task.status];
  const priorityConfig = TASK_PRIORITY_CONFIG[task.priority];

  return (
    <div className="flex border-b border-zinc-100 dark:border-zinc-800">
      {/* Task Info */}
      <div className="w-72 flex-shrink-0 p-3 border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 text-zinc-300 cursor-grab" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {task.title}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                {statusConfig.label}
              </Badge>
              {task.assignee && (
                <Avatar className="h-4 w-4">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(task.assignee.name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 relative h-12 bg-zinc-50 dark:bg-zinc-900/50">
        <GanttBar
          item={task}
          startDate={taskStart}
          endDate={taskEnd}
          dayWidth={dayWidth}
          viewStartDate={viewStartDate}
          onClick={onClick}
        />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GanttChart({
  projectId,
  onTaskClick,
  onMilestoneClick,
}: GanttChartProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { tasks, milestones, selectedProject } = useProjectStore();

  // Filter tasks by project
  const projectTasks = useMemo(() => {
    const pid = projectId || selectedProject?.id;
    if (!pid) return tasks;
    return tasks.filter((t) => t.projectId === pid);
  }, [tasks, projectId, selectedProject]);

  const projectMilestones = useMemo(() => {
    const pid = projectId || selectedProject?.id;
    if (!pid) return milestones;
    return milestones.filter((m) => m.projectId === pid);
  }, [milestones, projectId, selectedProject]);

  // Calculate view range
  const { viewStartDate, viewEndDate, days } = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (viewMode) {
      case 'day':
        start = subWeeks(currentDate, 1);
        end = addWeeks(currentDate, 2);
        break;
      case 'week':
        start = startOfWeek(subWeeks(currentDate, 1), { locale: vi });
        end = endOfWeek(addWeeks(currentDate, 4), { locale: vi });
        break;
      case 'month':
        start = startOfMonth(subMonths(currentDate, 1));
        end = endOfMonth(addMonths(currentDate, 3));
        break;
      default:
        start = subWeeks(currentDate, 1);
        end = addWeeks(currentDate, 2);
    }

    const daysList = eachDayOfInterval({ start, end });

    return {
      viewStartDate: start,
      viewEndDate: end,
      days: daysList,
    };
  }, [currentDate, viewMode]);

  const dayWidth = DAY_WIDTH[viewMode];
  const totalWidth = days.length * dayWidth;

  // Navigation
  const navigate = useCallback((direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setCurrentDate((d) => (direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1)));
        break;
      case 'week':
        setCurrentDate((d) => (direction === 'prev' ? subWeeks(d, 2) : addWeeks(d, 2)));
        break;
      case 'month':
        setCurrentDate((d) => (direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1)));
        break;
    }
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Scroll to today
  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      const todayOffset = differenceInDays(new Date(), viewStartDate) * dayWidth;
      scrollContainerRef.current.scrollLeft = Math.max(0, todayOffset - 200);
    }
  }, [viewStartDate, dayWidth]);

  // Group days by week/month for header
  const timelineGroups = useMemo(() => {
    if (viewMode === 'month') {
      const weeks = eachWeekOfInterval(
        { start: viewStartDate, end: viewEndDate },
        { locale: vi }
      );
      return weeks.map((week) => ({
        label: `Tuần ${format(week, 'w')}`,
        date: week,
        span: 7,
      }));
    }

    // Group by month
    const groups: { label: string; date: Date; span: number }[] = [];
    let currentMonth = '';

    days.forEach((day) => {
      const monthLabel = format(day, 'MMMM yyyy', { locale: vi });
      if (monthLabel !== currentMonth) {
        groups.push({
          label: monthLabel,
          date: day,
          span: 1,
        });
        currentMonth = monthLabel;
      } else {
        groups[groups.length - 1].span++;
      }
    });

    return groups;
  }, [days, viewMode, viewStartDate, viewEndDate]);

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <Calendar className="h-4 w-4 mr-2" />
            Hôm nay
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          <span className="ml-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {format(currentDate, 'MMMM yyyy', { locale: vi })}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode */}
          <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VIEW_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Zoom */}
          <div className="flex items-center border rounded-lg">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Content */}
      <div className="flex overflow-hidden">
        {/* Fixed Left Column - Task Names */}
        <div className="w-72 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800">
          {/* Header */}
          <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Công việc
            </p>
            <p className="text-xs text-zinc-500">
              {projectTasks.length} công việc
            </p>
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-hidden"
        >
          <div style={{ width: totalWidth, minWidth: '100%' }}>
            {/* Timeline Header */}
            <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              {/* Month/Week row */}
              <div className="h-8 flex border-b border-zinc-100 dark:border-zinc-800">
                {timelineGroups.map((group, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400 border-r border-zinc-100 dark:border-zinc-800"
                    style={{ width: group.span * dayWidth }}
                  >
                    {group.label}
                  </div>
                ))}
              </div>

              {/* Day row */}
              <div className="h-8 flex">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-center text-xs border-r border-zinc-100 dark:border-zinc-800',
                      isToday(day)
                        ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 font-medium'
                        : 'text-zinc-500'
                    )}
                    style={{ width: dayWidth }}
                  >
                    {viewMode === 'day' && format(day, 'dd')}
                    {viewMode === 'week' && format(day, 'EEE dd', { locale: vi })}
                    {viewMode === 'month' && format(day, 'd')}
                  </div>
                ))}
              </div>
            </div>

            {/* Today Line */}
            {isWithinInterval(new Date(), { start: viewStartDate, end: viewEndDate }) && (
              <div
                className="absolute top-16 bottom-0 w-px bg-red-500 z-10"
                style={{
                  left: `${288 + differenceInDays(new Date(), viewStartDate) * dayWidth}px`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Task Rows */}
      <div className="max-h-[500px] overflow-y-auto">
        {projectTasks.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-zinc-500">
            <div className="text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
              <p>Chưa có công việc nào</p>
            </div>
          </div>
        ) : (
          <div className="flex">
            {/* Fixed Left - Task Info */}
            <div className="w-72 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800">
              {projectTasks.map((task) => {
                const statusConfig = TASK_STATUS_CONFIG[task.status];
                return (
                  <div
                    key={task.id}
                    className="h-12 flex items-center gap-2 p-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <GripVertical className="h-4 w-4 text-zinc-300 cursor-grab flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] h-4 px-1', statusConfig.bgColor, statusConfig.color)}
                        >
                          {statusConfig.label}
                        </Badge>
                      </div>
                    </div>
                    {task.assignee && (
                      <Avatar className="h-6 w-6 flex-shrink-0">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(task.assignee.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Scrollable Timeline Rows */}
            <div
              className="flex-1 overflow-x-auto"
              style={{ width: `calc(100% - 288px)` }}
            >
              <div style={{ width: totalWidth, minWidth: '100%' }}>
                {projectTasks.map((task) => {
                  const taskStart = parseDate(task.startDate || task.createdAt);
                  const taskEnd = parseDate(task.dueDate || taskStart);

                  return (
                    <div
                      key={task.id}
                      className="h-12 relative border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50"
                    >
                      {/* Grid Lines */}
                      <div className="absolute inset-0 flex">
                        {days.map((day, index) => (
                          <div
                            key={index}
                            className={cn(
                              'border-r border-zinc-100 dark:border-zinc-800',
                              isToday(day) && 'bg-blue-50/50 dark:bg-blue-950/30'
                            )}
                            style={{ width: dayWidth }}
                          />
                        ))}
                      </div>

                      {/* Task Bar */}
                      <GanttBar
                        item={task}
                        startDate={taskStart}
                        endDate={taskEnd}
                        dayWidth={dayWidth}
                        viewStartDate={viewStartDate}
                        onClick={() => onTaskClick?.(task)}
                      />
                    </div>
                  );
                })}

                {/* Milestones Row */}
                {projectMilestones.length > 0 && (
                  <div className="h-12 relative border-b border-zinc-100 dark:border-zinc-800 bg-purple-50/30 dark:bg-purple-950/20">
                    <div className="absolute inset-0 flex">
                      {days.map((day, index) => (
                        <div
                          key={index}
                          className="border-r border-zinc-100 dark:border-zinc-800"
                          style={{ width: dayWidth }}
                        />
                      ))}
                    </div>

                    {projectMilestones.map((milestone) => {
                      const milestoneDate = parseDate(milestone.dueDate);
                      return (
                        <GanttBar
                          key={milestone.id}
                          item={milestone}
                          startDate={milestoneDate}
                          endDate={milestoneDate}
                          dayWidth={dayWidth}
                          viewStartDate={viewStartDate}
                          onClick={() => onMilestoneClick?.(milestone)}
                          isMilestone
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-6 text-xs">
          <span className="text-zinc-500">Chú thích:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-zinc-400" />
            <span>Chờ làm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Đang làm</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500" />
            <span>Đang review</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span>Hoàn thành</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Bị chặn</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-purple-500 rotate-45" style={{ transform: 'rotate(45deg) scale(0.5)' }} />
            <span>Milestone</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

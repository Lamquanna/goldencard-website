'use client';

// Gantt Chart Component
// Timeline visualization for project tasks with dependencies

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ProjectTask, GanttTask, TaskStatus } from '@/lib/types/project';
import { getPriorityColor, getStatusColor } from '@/lib/types/project';

interface GanttChartProps {
  projectId: string;
  tasks: ProjectTask[];
  startDate: Date;
  endDate: Date;
  onTaskClick: (task: ProjectTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  showDependencies?: boolean;
  viewMode?: 'day' | 'week' | 'month';
}

// Configuration
const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 60;
const TASK_HEIGHT = 28;
const DAY_WIDTH = {
  day: 40,
  week: 120,
  month: 200,
};

export default function GanttChart({
  projectId,
  tasks,
  startDate,
  endDate,
  onTaskClick,
  onTaskUpdate,
  showDependencies = true,
  viewMode = 'day',
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Calculate timeline
  const timeline = useMemo(() => {
    const days: Date[] = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [startDate, endDate]);

  // Group days by month for header
  const monthGroups = useMemo(() => {
    const groups: { month: string; year: number; days: Date[] }[] = [];
    
    timeline.forEach(day => {
      const monthYear = `${day.getMonth()}-${day.getFullYear()}`;
      const lastGroup = groups[groups.length - 1];
      
      if (!lastGroup || `${lastGroup.days[0].getMonth()}-${lastGroup.days[0].getFullYear()}` !== monthYear) {
        groups.push({
          month: day.toLocaleDateString('vi-VN', { month: 'long' }),
          year: day.getFullYear(),
          days: [day],
        });
      } else {
        lastGroup.days.push(day);
      }
    });

    return groups;
  }, [timeline]);

  // Calculate task positions
  const ganttTasks = useMemo(() => {
    return tasks.map(task => {
      const taskStart = task.start_date ? new Date(task.start_date) : new Date();
      const taskEnd = task.due_date ? new Date(task.due_date) : taskStart;

      // Calculate position
      const startOffset = Math.max(0, 
        Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const duration = Math.max(1,
        Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
      );

      return {
        ...task,
        startOffset,
        duration,
        left: startOffset * DAY_WIDTH[viewMode],
        width: duration * DAY_WIDTH[viewMode],
      };
    });
  }, [tasks, startDate, viewMode]);

  // Today marker position
  const todayOffset = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offset = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return offset * DAY_WIDTH[viewMode];
  }, [startDate, viewMode]);

  // Total width
  const totalWidth = timeline.length * DAY_WIDTH[viewMode];

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-900">Biểu đồ Gantt</h3>
          <span className="text-sm text-gray-500">{tasks.length} công việc</span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === mode
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode === 'day' ? 'Ngày' : mode === 'week' ? 'Tuần' : 'Tháng'}
              </button>
            ))}
          </div>

          {/* Today button */}
          <button
            onClick={() => {
              containerRef.current?.scrollTo({
                left: todayOffset - 200,
                behavior: 'smooth',
              });
            }}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Hôm nay
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Task list sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          {/* Header */}
          <div className="h-[60px] flex items-center px-4 border-b border-gray-200 bg-white">
            <span className="font-medium text-gray-700">Công việc</span>
          </div>

          {/* Task rows */}
          <div className="overflow-y-auto" style={{ height: `calc(100% - ${HEADER_HEIGHT}px)` }}>
            {ganttTasks.map(task => (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
                className={`h-12 flex items-center px-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  hoveredTask === task.id ? 'bg-sky-50' : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {task.assigned_to || 'Chưa gán'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto"
        >
          <div style={{ width: totalWidth, minHeight: '100%' }}>
            {/* Timeline header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
              {/* Month row */}
              <div className="flex h-[30px]">
                {monthGroups.map((group, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-center border-r border-gray-200 bg-gray-50 font-medium text-sm text-gray-700"
                    style={{ width: group.days.length * DAY_WIDTH[viewMode] }}
                  >
                    {group.month} {group.year}
                  </div>
                ))}
              </div>

              {/* Days row */}
              <div className="flex h-[30px]">
                {timeline.map((day, idx) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  const isToday = day.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-center border-r border-gray-100 text-xs ${
                        isWeekend ? 'bg-gray-100' : isToday ? 'bg-sky-100 font-bold text-sky-700' : ''
                      }`}
                      style={{ width: DAY_WIDTH[viewMode] }}
                    >
                      {viewMode === 'day' ? day.getDate() : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Task bars */}
            <div className="relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex">
                {timeline.map((day, idx) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`border-r border-gray-100 ${isWeekend ? 'bg-gray-50' : ''}`}
                      style={{ width: DAY_WIDTH[viewMode], height: ganttTasks.length * ROW_HEIGHT }}
                    />
                  );
                })}
              </div>

              {/* Today line */}
              {todayOffset >= 0 && todayOffset <= totalWidth && (
                <div
                  className="absolute top-0 w-0.5 bg-red-500 z-20"
                  style={{ 
                    left: todayOffset, 
                    height: ganttTasks.length * ROW_HEIGHT 
                  }}
                >
                  <div className="absolute -top-6 -left-[30px] bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                    Hôm nay
                  </div>
                </div>
              )}

              {/* Task bars */}
              {ganttTasks.map((task, idx) => (
                <GanttTaskBar
                  key={task.id}
                  task={task}
                  rowIndex={idx}
                  isHovered={hoveredTask === task.id}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                  onClick={() => onTaskClick(task)}
                />
              ))}

              {/* Dependencies */}
              {showDependencies && (
                <svg
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{ 
                    width: totalWidth, 
                    height: ganttTasks.length * ROW_HEIGHT 
                  }}
                >
                  {/* Add dependency arrows here if needed */}
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Gantt Task Bar Component
interface GanttTaskBarProps {
  task: ProjectTask & { left: number; width: number };
  rowIndex: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}

function GanttTaskBar({
  task,
  rowIndex,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: GanttTaskBarProps) {
  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const progress = task.progress || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      className={`absolute h-7 rounded cursor-pointer transition-shadow ${
        isHovered ? 'ring-2 ring-sky-400 shadow-lg z-10' : ''
      }`}
      style={{
        top: rowIndex * ROW_HEIGHT + (ROW_HEIGHT - TASK_HEIGHT) / 2,
        left: task.left,
        width: Math.max(task.width, 40),
        backgroundColor: statusColor,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Progress bar */}
      <div 
        className="absolute inset-0 rounded opacity-40"
        style={{ 
          width: `${progress}%`,
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
      />

      {/* Content */}
      <div className="relative h-full flex items-center px-2 gap-1">
        {/* Priority indicator */}
        <div 
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: priorityColor }}
        />

        {/* Title */}
        <span className="text-xs text-white font-medium truncate">
          {task.title}
        </span>
      </div>

      {/* Resize handles (for future drag-to-resize) */}
      <div className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-white/20" />
      <div className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-white/20" />

      {/* Tooltip on hover */}
      {isHovered && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-xl whitespace-nowrap">
          <div className="font-medium mb-1">{task.title}</div>
          <div className="text-gray-300">
            {task.start_date && formatDateRange(task.start_date, task.due_date)}
          </div>
          <div className="text-gray-300">Tiến độ: {progress}%</div>
        </div>
      )}
    </motion.div>
  );
}

// Helper functions
function formatDateRange(start: string, end: string | undefined): string {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };
  
  return `${startDate.toLocaleDateString('vi-VN', options)} - ${endDate.toLocaleDateString('vi-VN', options)}`;
}

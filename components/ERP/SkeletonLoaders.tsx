'use client';

import { memo } from 'react';

// Skeleton base component
const SkeletonBase = memo(({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
));
SkeletonBase.displayName = 'SkeletonBase';

// Table row skeleton
export const TableRowSkeleton = memo(({ columns = 6 }: { columns?: number }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <SkeletonBase className={`h-4 ${i === 0 ? 'w-32' : i === 1 ? 'w-48' : 'w-20'}`} />
      </td>
    ))}
  </tr>
));
TableRowSkeleton.displayName = 'TableRowSkeleton';

// Card skeleton
export const CardSkeleton = memo(() => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
    <div className="flex items-start justify-between mb-4">
      <SkeletonBase className="h-5 w-24" />
      <SkeletonBase className="h-6 w-16 rounded-full" />
    </div>
    <SkeletonBase className="h-4 w-full mb-2" />
    <SkeletonBase className="h-4 w-3/4 mb-4" />
    <div className="flex justify-between items-center">
      <SkeletonBase className="h-8 w-20" />
      <SkeletonBase className="h-3 w-24" />
    </div>
  </div>
));
CardSkeleton.displayName = 'CardSkeleton';

// Project card skeleton
export const ProjectCardSkeleton = memo(() => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-6 w-20 rounded-full" />
        <SkeletonBase className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBase className="h-8 w-8 rounded-lg" />
    </div>
    <SkeletonBase className="h-5 w-3/4 mb-2" />
    <SkeletonBase className="h-4 w-full mb-4" />
    
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-4 w-4 rounded" />
        <SkeletonBase className="h-4 w-32" />
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBase className="h-4 w-4 rounded" />
        <SkeletonBase className="h-4 w-28" />
      </div>
    </div>
    
    <div className="mt-4">
      <div className="flex justify-between mb-1">
        <SkeletonBase className="h-3 w-16" />
        <SkeletonBase className="h-3 w-8" />
      </div>
      <SkeletonBase className="h-2 w-full rounded-full" />
    </div>
  </div>
));
ProjectCardSkeleton.displayName = 'ProjectCardSkeleton';

// Stats card skeleton
export const StatsCardSkeleton = memo(() => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
    <SkeletonBase className="h-4 w-20 mb-2" />
    <SkeletonBase className="h-8 w-16" />
  </div>
));
StatsCardSkeleton.displayName = 'StatsCardSkeleton';

// Dashboard skeleton
export const DashboardSkeleton = memo(() => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <SkeletonBase className="h-8 w-48 mb-2" />
          <SkeletonBase className="h-4 w-32" />
        </div>
        <SkeletonBase className="h-10 w-32 rounded-lg" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <SkeletonBase className="h-6 w-32 mb-4" />
            <SkeletonBase className="h-64 w-full" />
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <SkeletonBase className="h-6 w-28 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBase className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <SkeletonBase className="h-4 w-24 mb-1" />
                    <SkeletonBase className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));
DashboardSkeleton.displayName = 'DashboardSkeleton';

// Task list skeleton
export const TaskListSkeleton = memo(({ count = 5 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <SkeletonBase className="h-5 w-5 rounded" />
          <div className="flex-1">
            <SkeletonBase className="h-4 w-3/4 mb-2" />
            <div className="flex items-center gap-2">
              <SkeletonBase className="h-3 w-16 rounded-full" />
              <SkeletonBase className="h-3 w-20" />
            </div>
          </div>
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>
      </div>
    ))}
  </div>
));
TaskListSkeleton.displayName = 'TaskListSkeleton';

// Attendance calendar skeleton
export const AttendanceCalendarSkeleton = memo(() => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBase className="h-6 w-32" />
      <div className="flex gap-2">
        <SkeletonBase className="h-8 w-8 rounded" />
        <SkeletonBase className="h-8 w-8 rounded" />
      </div>
    </div>
    <div className="grid grid-cols-7 gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBase key={i} className="h-8 w-full rounded" />
      ))}
      {Array.from({ length: 35 }).map((_, i) => (
        <SkeletonBase key={i + 7} className="h-16 w-full rounded" />
      ))}
    </div>
  </div>
));
AttendanceCalendarSkeleton.displayName = 'AttendanceCalendarSkeleton';

// Grid skeleton
export const GridSkeleton = memo(({ count = 6, columns = 3 }: { count?: number; columns?: number }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}>
    {Array.from({ length: count }).map((_, i) => (
      <ProjectCardSkeleton key={i} />
    ))}
  </div>
));
GridSkeleton.displayName = 'GridSkeleton';

// List skeleton
export const ListSkeleton = memo(({ count = 10 }: { count?: number }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50 border-b">
        <tr>
          {['Tên', 'Trạng thái', 'Tiến độ', 'Ngày', 'Người phụ trách', ''].map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <SkeletonBase className="h-4 w-20" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: count }).map((_, i) => (
          <TableRowSkeleton key={i} />
        ))}
      </tbody>
    </table>
  </div>
));
ListSkeleton.displayName = 'ListSkeleton';

export default {
  TableRowSkeleton,
  CardSkeleton,
  ProjectCardSkeleton,
  StatsCardSkeleton,
  DashboardSkeleton,
  TaskListSkeleton,
  AttendanceCalendarSkeleton,
  GridSkeleton,
  ListSkeleton,
};

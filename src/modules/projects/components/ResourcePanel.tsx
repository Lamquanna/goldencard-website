'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfWeek, addDays, eachDayOfInterval, isToday, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MoreVertical,
  Plus,
  Filter,
  Search,
  UserPlus,
  X,
  Briefcase,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProjectStore } from '../store';
import {
  ProjectMember,
  Task,
  TASK_STATUS_CONFIG,
  TASK_PRIORITY_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'list' | 'timeline' | 'workload';

interface ResourcePanelProps {
  projectId?: string;
  onMemberClick?: (member: ProjectMember) => void;
  onAddMember?: () => void;
  onAssignTask?: (memberId: string) => void;
}

interface MemberWorkload {
  member: ProjectMember;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  hoursThisWeek: number;
  utilization: number;
  tasks: Task[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MEMBERS: ProjectMember[] = [
  {
    id: 'member1',
    userId: 'user1',
    role: 'PROJECT_MANAGER',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@goldenenergy.vn',
    avatar: '/Team/member-1.jpg',
    permissions: ['all'],
    joinedAt: new Date(),
  },
  {
    id: 'member2',
    userId: 'user2',
    role: 'DEVELOPER',
    name: 'Trần Thị B',
    email: 'tranthib@goldenenergy.vn',
    avatar: '/Team/member-2.jpg',
    permissions: ['read', 'write'],
    joinedAt: new Date(),
  },
  {
    id: 'member3',
    userId: 'user3',
    role: 'DEVELOPER',
    name: 'Lê Văn C',
    email: 'levanc@goldenenergy.vn',
    avatar: '/Team/member-3.jpg',
    permissions: ['read', 'write'],
    joinedAt: new Date(),
  },
  {
    id: 'member4',
    userId: 'user4',
    role: 'DESIGNER',
    name: 'Phạm Thị D',
    email: 'phamthid@goldenenergy.vn',
    avatar: '/Team/member-4.jpg',
    permissions: ['read', 'write'],
    joinedAt: new Date(),
  },
  {
    id: 'member5',
    userId: 'user5',
    role: 'QA',
    name: 'Hoàng Văn E',
    email: 'hoangvane@goldenenergy.vn',
    avatar: '/Team/member-5.jpg',
    permissions: ['read', 'write'],
    joinedAt: new Date(),
  },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  PROJECT_MANAGER: { label: 'Quản lý dự án', color: 'bg-purple-100 text-purple-700' },
  DEVELOPER: { label: 'Lập trình viên', color: 'bg-blue-100 text-blue-700' },
  DESIGNER: { label: 'Thiết kế', color: 'bg-pink-100 text-pink-700' },
  QA: { label: 'Kiểm thử', color: 'bg-emerald-100 text-emerald-700' },
  VIEWER: { label: 'Xem', color: 'bg-zinc-100 text-zinc-700' },
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

const getUtilizationColor = (utilization: number): string => {
  if (utilization >= 100) return 'text-red-600 bg-red-50';
  if (utilization >= 80) return 'text-amber-600 bg-amber-50';
  if (utilization >= 50) return 'text-emerald-600 bg-emerald-50';
  return 'text-blue-600 bg-blue-50';
};

const getUtilizationLabel = (utilization: number): string => {
  if (utilization >= 100) return 'Quá tải';
  if (utilization >= 80) return 'Cao';
  if (utilization >= 50) return 'Trung bình';
  return 'Thấp';
};

// ============================================================================
// STATS CARDS
// ============================================================================

interface ResourceStatsProps {
  members: MemberWorkload[];
}

function ResourceStats({ members }: ResourceStatsProps) {
  const stats = useMemo(() => {
    const totalMembers = members.length;
    const avgUtilization = members.reduce((acc, m) => acc + m.utilization, 0) / totalMembers || 0;
    const overloadedMembers = members.filter((m) => m.utilization >= 100).length;
    const totalOverdueTasks = members.reduce((acc, m) => acc + m.overdueTasks, 0);

    return {
      totalMembers,
      avgUtilization: Math.round(avgUtilization),
      overloadedMembers,
      totalOverdueTasks,
    };
  }, [members]);

  const items = [
    {
      label: 'Thành viên',
      value: stats.totalMembers,
      icon: Users,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Tải trung bình',
      value: `${stats.avgUtilization}%`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Quá tải',
      value: stats.overloadedMembers,
      icon: AlertTriangle,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
    {
      label: 'Quá hạn',
      value: stats.totalOverdueTasks,
      icon: Clock,
      color: 'text-red-600 bg-red-50 dark:bg-red-950',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </p>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// MEMBER CARD COMPONENT
// ============================================================================

interface MemberCardProps {
  workload: MemberWorkload;
  onView?: () => void;
  onAssignTask?: () => void;
  onRemove?: () => void;
}

function MemberCard({ workload, onView, onAssignTask, onRemove }: MemberCardProps) {
  const { member } = workload;
  const roleConfig = ROLE_LABELS[member.role] || ROLE_LABELS.VIEWER;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow" onClick={onView}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar} />
                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {member.name}
                </p>
                <Badge className={cn('text-xs mt-1', roleConfig.color)}>
                  {roleConfig.label}
                </Badge>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onAssignTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  Giao việc
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRemove} className="text-red-600">
                  <X className="mr-2 h-4 w-4" />
                  Xóa khỏi dự án
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Utilization */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-zinc-500">Tải công việc</span>
              <Badge className={cn('text-xs', getUtilizationColor(workload.utilization))}>
                {getUtilizationLabel(workload.utilization)}
              </Badge>
            </div>
            <Progress
              value={Math.min(workload.utilization, 100)}
              className={cn(
                'h-2',
                workload.utilization >= 100 && '[&>div]:bg-red-500',
                workload.utilization >= 80 && workload.utilization < 100 && '[&>div]:bg-amber-500'
              )}
            />
            <p className="text-xs text-zinc-400 mt-1 text-right">
              {workload.utilization}%
            </p>
          </div>

          {/* Task Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {workload.totalTasks}
              </p>
              <p className="text-xs text-zinc-500">Tổng việc</p>
            </div>
            <div className="text-center p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <p className="text-lg font-bold text-emerald-600">
                {workload.completedTasks}
              </p>
              <p className="text-xs text-zinc-500">Hoàn thành</p>
            </div>
            <div className="text-center p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-lg font-bold text-blue-600">
                {workload.inProgressTasks}
              </p>
              <p className="text-xs text-zinc-500">Đang làm</p>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-lg font-bold text-red-600">
                {workload.overdueTasks}
              </p>
              <p className="text-xs text-zinc-500">Quá hạn</p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center justify-between text-sm pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1 text-zinc-500">
              <Clock className="h-4 w-4" />
              <span>Giờ tuần này</span>
            </div>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              {workload.hoursThisWeek}h
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// WORKLOAD TIMELINE
// ============================================================================

interface WorkloadTimelineProps {
  workloads: MemberWorkload[];
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
}

function WorkloadTimeline({ workloads, currentDate, onNavigate }: WorkloadTimelineProps) {
  const weekStart = startOfWeek(currentDate, { locale: vi });
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: addDays(weekStart, 6),
  });

  return (
    <Card>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {format(weekStart, "'Tuần' w, MMMM yyyy", { locale: vi })}
          </span>
          <Button variant="outline" size="icon" onClick={() => onNavigate('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Day Headers */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-48 flex-shrink-0 p-3 bg-zinc-50 dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Thành viên
              </span>
            </div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex-1 p-3 text-center border-r border-zinc-200 dark:border-zinc-800',
                  isToday(day)
                    ? 'bg-blue-50 dark:bg-blue-950'
                    : 'bg-zinc-50 dark:bg-zinc-900'
                )}
              >
                <p className="text-xs text-zinc-500">
                  {format(day, 'EEE', { locale: vi })}
                </p>
                <p
                  className={cn(
                    'text-lg font-semibold',
                    isToday(day)
                      ? 'text-blue-600'
                      : 'text-zinc-900 dark:text-zinc-100'
                  )}
                >
                  {format(day, 'd')}
                </p>
              </div>
            ))}
          </div>

          {/* Member Rows */}
          {workloads.map((workload) => (
            <div
              key={workload.member.id}
              className="flex border-b border-zinc-100 dark:border-zinc-800"
            >
              <div className="w-48 flex-shrink-0 p-3 border-r border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={workload.member.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(workload.member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {workload.member.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {workload.totalTasks} việc
                    </p>
                  </div>
                </div>
              </div>

              {weekDays.map((day) => {
                // Simulate workload per day (would come from actual task data)
                const dayLoad = Math.floor(Math.random() * 10);
                const hoursWorked = Math.min(dayLoad, 8);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'flex-1 p-2 border-r border-zinc-100 dark:border-zinc-800',
                      isToday(day) && 'bg-blue-50/50 dark:bg-blue-950/30'
                    )}
                  >
                    {hoursWorked > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                'h-full min-h-[40px] rounded p-1',
                                hoursWorked >= 8
                                  ? 'bg-red-100 dark:bg-red-900/30'
                                  : hoursWorked >= 6
                                  ? 'bg-amber-100 dark:bg-amber-900/30'
                                  : 'bg-emerald-100 dark:bg-emerald-900/30'
                              )}
                            >
                              <p className="text-xs font-medium text-center">
                                {hoursWorked}h
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{hoursWorked} giờ làm việc</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ResourcePanel({
  projectId,
  onMemberClick,
  onAddMember,
  onAssignTask,
}: ResourcePanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { selectedProject, tasks } = useProjectStore();

  // Calculate workloads (in real app, this would come from the store)
  const memberWorkloads = useMemo((): MemberWorkload[] => {
    return MOCK_MEMBERS.map((member) => {
      const memberTasks = tasks.filter(
        (t) => t.assignee?.id === member.userId
      );

      return {
        member,
        totalTasks: memberTasks.length || Math.floor(Math.random() * 10) + 3,
        completedTasks: Math.floor(Math.random() * 5),
        inProgressTasks: Math.floor(Math.random() * 3) + 1,
        overdueTasks: Math.floor(Math.random() * 2),
        hoursThisWeek: Math.floor(Math.random() * 40) + 20,
        utilization: Math.floor(Math.random() * 120) + 40,
        tasks: memberTasks,
      };
    });
  }, [tasks]);

  // Filter workloads
  const filteredWorkloads = useMemo(() => {
    return memberWorkloads.filter((w) => {
      const matchesSearch = w.member.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || w.member.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [memberWorkloads, searchQuery, roleFilter]);

  // Navigation
  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'prev' ? addDays(prev, -7) : addDays(prev, 7)
    );
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ResourceStats members={memberWorkloads} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              {Object.entries(ROLE_LABELS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'timeline' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Member */}
          <Button onClick={onAddMember}>
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm thành viên
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredWorkloads.map((workload) => (
              <MemberCard
                key={workload.member.id}
                workload={workload}
                onView={() => onMemberClick?.(workload.member)}
                onAssignTask={() => onAssignTask?.(workload.member.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <WorkloadTimeline
          workloads={filteredWorkloads}
          currentDate={currentDate}
          onNavigate={handleNavigate}
        />
      )}

      {/* Empty State */}
      {filteredWorkloads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Không tìm thấy thành viên
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              Thử thay đổi bộ lọc hoặc thêm thành viên mới
            </p>
            <Button onClick={onAddMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Thêm thành viên
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

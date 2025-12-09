'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  PhoneCall,
  Mail,
  Users,
  FileText,
  CheckCircle2,
  Activity,
  User,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Search,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCRMStore } from '../store';
import { Activity as ActivityType, ActivityType as ActivityTypeEnum } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface ActivityTimelineProps {
  entityType?: 'lead' | 'contact' | 'deal';
  entityId?: string;
  onAddActivity?: () => void;
  onEditActivity?: (activity: ActivityType) => void;
  onDeleteActivity?: (activity: ActivityType) => void;
  className?: string;
  showFilters?: boolean;
  maxHeight?: string;
}

interface GroupedActivities {
  date: Date;
  label: string;
  activities: ActivityType[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ACTIVITY_CONFIG: Record<ActivityTypeEnum, { 
  label: string; 
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}> = {
  CALL: {
    label: 'Cuộc gọi',
    icon: <PhoneCall className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  EMAIL: {
    label: 'Email',
    icon: <Mail className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  MEETING: {
    label: 'Cuộc họp',
    icon: <Users className="h-4 w-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  TASK: {
    label: 'Công việc',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
  },
  NOTE: {
    label: 'Ghi chú',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  SYSTEM: {
    label: 'Hệ thống',
    icon: <Activity className="h-4 w-4" />,
    color: 'text-zinc-600',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900/30',
  },
  STATUS_CHANGE: {
    label: 'Thay đổi trạng thái',
    icon: <Activity className="h-4 w-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  ASSIGNMENT: {
    label: 'Phân công',
    icon: <User className="h-4 w-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  FILE_UPLOAD: {
    label: 'Tải file',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getDateLabel = (date: Date): string => {
  if (isToday(date)) return 'Hôm nay';
  if (isYesterday(date)) return 'Hôm qua';
  return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
};

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: ActivityType;
  onEdit?: () => void;
  onDelete?: () => void;
  showEntity?: boolean;
}

function ActivityItem({ activity, onEdit, onDelete, showEntity }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="group relative pl-8"
    >
      {/* Timeline line */}
      <div className="absolute left-3 top-8 bottom-0 w-px bg-zinc-200 dark:bg-zinc-800" />
      
      {/* Timeline dot */}
      <div
        className={cn(
          'absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10',
          config?.bgColor,
          config?.color
        )}
      >
        {config?.icon}
      </div>

      {/* Content */}
      <div
        className={cn(
          'relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800',
          'p-4 mb-4 transition-shadow hover:shadow-md'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className={cn('text-xs', config?.color, config?.bgColor)}>
                {config?.label}
              </Badge>
              {showEntity && activity.entityType && (
                <Badge variant="outline" className="text-xs">
                  {activity.entityType === 'lead' && 'Lead'}
                  {activity.entityType === 'contact' && 'Liên hệ'}
                  {activity.entityType === 'deal' && 'Deal'}
                </Badge>
              )}
            </div>
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
              {activity.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">
              {format(new Date(activity.createdAt), 'HH:mm', { locale: vi })}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-3">
            {activity.description}
          </p>
        )}

        {/* Task completion status */}
        {activity.type === 'TASK' && activity.completedAt && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Hoàn thành lúc {format(new Date(activity.completedAt), 'HH:mm dd/MM', { locale: vi })}</span>
          </div>
        )}

        {/* Footer: Creator */}
        {activity.user?.name && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-[10px]">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-zinc-500">{activity.user.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ActivityTimeline({
  entityType,
  entityId,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  className,
  showFilters = true,
  maxHeight = 'calc(100vh - 200px)',
}: ActivityTimelineProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Store
  const { activities } = useCRMStore();

  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by entity if provided
    if (entityType && entityId) {
      result = result.filter(
        (a) => a.entityType === entityType && a.entityId === entityId
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((a) => a.type === typeFilter);
    }

    // Sort by date (newest first)
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [activities, entityType, entityId, searchQuery, typeFilter]);

  // Group activities by date
  const groupedActivities = useMemo<GroupedActivities[]>(() => {
    const groups = new Map<string, ActivityType[]>();

    filteredActivities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(activity);
    });

    return Array.from(groups.entries()).map(([dateKey, acts]) => ({
      date: new Date(dateKey),
      label: getDateLabel(new Date(dateKey)),
      activities: acts,
    }));
  }, [filteredActivities]);

  // Toggle group collapse
  const toggleGroup = (dateKey: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(dateKey)) {
      newCollapsed.delete(dateKey);
    } else {
      newCollapsed.add(dateKey);
    }
    setCollapsedGroups(newCollapsed);
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Toolbar */}
      {showFilters && (
        <div className="flex items-center justify-between gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Tìm kiếm hoạt động..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Loại hoạt động" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className={config.color}>{config.icon}</span>
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={onAddActivity}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm hoạt động
          </Button>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-auto" style={{ maxHeight }}>
        <div className="p-4">
          {groupedActivities.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {groupedActivities.map((group) => {
                const dateKey = format(group.date, 'yyyy-MM-dd');
                const isCollapsed = collapsedGroups.has(dateKey);

                return (
                  <motion.div
                    key={dateKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-6"
                  >
                    {/* Date Header */}
                    <button
                      onClick={() => toggleGroup(dateKey)}
                      className="flex items-center gap-2 mb-4 group"
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 text-zinc-400 transition-transform',
                          !isCollapsed && 'rotate-90'
                        )}
                      />
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {group.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {group.activities.length}
                      </Badge>
                    </button>

                    {/* Activities */}
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {group.activities.map((activity) => (
                            <ActivityItem
                              key={activity.id}
                              activity={activity}
                              onEdit={() => onEditActivity?.(activity)}
                              onDelete={() => onDeleteActivity?.(activity)}
                              showEntity={!entityType}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Activity className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                Chưa có hoạt động nào
              </h3>
              <p className="text-sm text-zinc-500 mt-1">
                {searchQuery || typeFilter !== 'all'
                  ? 'Thử điều chỉnh bộ lọc để tìm hoạt động'
                  : 'Bắt đầu bằng cách thêm hoạt động mới'}
              </p>
              <Button className="mt-4" onClick={onAddActivity}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm hoạt động
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Footer */}
      {filteredActivities.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <p className="text-sm text-zinc-500">
            Hiển thị {filteredActivities.length} hoạt động
          </p>
          <div className="flex items-center gap-3">
            {Object.entries(ACTIVITY_CONFIG).map(([type, config]) => {
              const count = filteredActivities.filter((a) => a.type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="flex items-center gap-1">
                  <span className={config.color}>{config.icon}</span>
                  <span className="text-xs text-zinc-500">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityTimeline;

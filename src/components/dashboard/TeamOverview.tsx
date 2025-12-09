// ============================================================================
// TEAM OVERVIEW WIDGET COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Circle, 
  Clock, 
  Coffee, 
  Moon,
  MoreHorizontal,
  Users
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type TeamMemberStatus = 'online' | 'away' | 'busy' | 'offline';

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  department?: string;
  status: TeamMemberStatus;
  currentTask?: string;
  lastActive?: Date;
}

export interface TeamOverviewProps {
  title?: string;
  members: TeamMember[];
  showCurrentTask?: boolean;
  maxDisplay?: number;
  loading?: boolean;
  className?: string;
  onMemberClick?: (member: TeamMember) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const statusConfig: Record<TeamMemberStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: typeof Circle;
}> = {
  online: {
    label: 'Đang làm việc',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    icon: Circle,
  },
  away: {
    label: 'Vắng mặt',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    icon: Coffee,
  },
  busy: {
    label: 'Bận',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    icon: Clock,
  },
  offline: {
    label: 'Ngoại tuyến',
    color: 'text-gray-400',
    bgColor: 'bg-gray-400',
    icon: Moon,
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatLastActive(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

// ============================================================================
// TEAM MEMBER ROW COMPONENT
// ============================================================================

interface TeamMemberRowProps {
  member: TeamMember;
  showCurrentTask: boolean;
  index: number;
  onClick?: () => void;
}

function TeamMemberRow({ member, showCurrentTask, index, onClick }: TeamMemberRowProps) {
  const status = statusConfig[member.status];
  const StatusIcon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg',
        'hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'transition-colors duration-200',
        onClick && 'cursor-pointer'
      )}
    >
      {/* Avatar with status */}
      <div className="relative">
        <Avatar className="h-9 w-9">
          <AvatarImage src={member.avatar} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <span className={cn(
          'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900',
          status.bgColor
        )} />
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {member.name}
          </span>
          {member.department && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              {member.department}
            </Badge>
          )}
        </div>
        
        {showCurrentTask && member.currentTask ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {member.currentTask}
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            {member.role}
          </p>
        )}
      </div>
      
      {/* Status / Last active */}
      <div className="flex items-center gap-1">
        {member.status === 'offline' && member.lastActive ? (
          <span className="text-xs text-gray-400">
            {formatLastActive(member.lastActive)}
          </span>
        ) : (
          <>
            <StatusIcon className={cn('w-3 h-3', status.color)} />
            <span className={cn('text-xs hidden sm:inline', status.color)}>
              {status.label}
            </span>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TeamOverview({
  title = 'Đội ngũ',
  members,
  showCurrentTask = true,
  maxDisplay = 8,
  loading = false,
  className,
  onMemberClick,
}: TeamOverviewProps) {
  if (loading) {
    return (
      <div className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}>
        <div className="animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Sort by status priority
  const statusPriority: Record<TeamMemberStatus, number> = {
    online: 0,
    busy: 1,
    away: 2,
    offline: 3,
  };
  
  const sortedMembers = [...members].sort(
    (a, b) => statusPriority[a.status] - statusPriority[b.status]
  );
  
  const displayMembers = sortedMembers.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;
  
  // Status counts
  const statusCounts = members.reduce((acc, member) => {
    acc[member.status] = (acc[member.status] || 0) + 1;
    return acc;
  }, {} as Record<TeamMemberStatus, number>);
  
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <Badge variant="secondary" className="text-xs">
            {members.length}
          </Badge>
        </div>
        
        {/* Status summary */}
        <div className="flex items-center gap-2">
          {statusCounts.online > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">{statusCounts.online}</span>
            </div>
          )}
          {statusCounts.away > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-500">{statusCounts.away}</span>
            </div>
          )}
          {statusCounts.offline > 0 && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">{statusCounts.offline}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Member list */}
      <div className="space-y-1">
        {displayMembers.map((member, index) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            showCurrentTask={showCurrentTask}
            index={index}
            onClick={onMemberClick ? () => onMemberClick(member) : undefined}
          />
        ))}
        
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="flex -space-x-2">
              {sortedMembers.slice(maxDisplay, maxDisplay + 3).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-white dark:border-gray-900">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-xs bg-gray-100 dark:bg-gray-700">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              +{remainingCount} thành viên khác
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TeamOverview;

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITY_TYPES, type ActivityTypeId } from '@/lib/crm-config';

interface Activity {
  id: string;
  type: ActivityTypeId;
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityItemProps {
  activity: Activity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const activityConfig = ACTIVITY_TYPES[activity.type] || ACTIVITY_TYPES.NOTE;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
      )}

      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full
        bg-gradient-to-br from-${activityConfig.color}-400 to-${activityConfig.color}-600
        flex items-center justify-center text-xl shadow-md z-10
      `}>
        {activityConfig.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">
                {activity.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {activity.user.name[0]}
                  </div>
                  {activity.user.name}
                </span>
                <span>•</span>
                <span>{formatTime(activity.timestamp)}</span>
              </div>
            </div>

            {/* Type Badge */}
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              bg-${activityConfig.color}-100 text-${activityConfig.color}-700
            `}>
              {activityConfig.name}
            </span>
          </div>

          {/* Description */}
          {activity.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {activity.description}
            </p>
          )}

          {/* Metadata (expanded) */}
          <AnimatePresence>
            {isExpanded && activity.metadata && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-100"
              >
                <dl className="space-y-2">
                  {Object.entries(activity.metadata).map(([key, value]) => (
                    <div key={key} className="flex gap-2 text-xs">
                      <dt className="font-medium text-gray-500 capitalize">
                        {key.replace('_', ' ')}:
                      </dt>
                      <dd className="text-gray-700 font-mono">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

interface ActivityTimelineProps {
  activities: Activity[];
  onAddActivity?: () => void;
}

export default function ActivityTimeline({ activities, onAddActivity }: ActivityTimelineProps) {
  const [filter, setFilter] = useState<ActivityTypeId | 'all'>('all');

  const filteredActivities = filter === 'all'
    ? activities
    : activities.filter(a => a.type === filter);

  const activityTypes = Object.entries(ACTIVITY_TYPES);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📋</span>
          Activity Timeline
        </h3>
        {onAddActivity && (
          <button
            onClick={onAddActivity}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <span>➕</span>
            Thêm hoạt động
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`
            px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          Tất cả ({activities.length})
        </button>
        {activityTypes.map(([key, config]) => {
          const count = activities.filter(a => a.type === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key as ActivityTypeId)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                flex items-center gap-1
                ${filter === key
                  ? `bg-${config.color}-500 text-white`
                  : `bg-${config.color}-100 text-${config.color}-700 hover:bg-${config.color}-200`
                }
              `}
            >
              <span>{config.icon}</span>
              <span>{config.name}</span>
              <span className="ml-1 opacity-75">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="mt-6">
        {filteredActivities.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm">Chưa có hoạt động nào</p>
          </div>
        ) : (
          filteredActivities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === filteredActivities.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

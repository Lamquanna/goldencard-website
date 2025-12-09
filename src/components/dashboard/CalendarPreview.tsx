// ============================================================================
// CALENDAR PREVIEW COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, startOfDay, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { CalendarPreviewProps, CalendarEvent } from './types';

// ============================================================================
// EVENT ITEM COMPONENT
// ============================================================================

interface EventItemProps {
  event: CalendarEvent;
  onClick?: () => void;
  index: number;
}

function EventItem({ event, onClick, index }: EventItemProps) {
  const startTime = new Date(event.start);
  const endTime = new Date(event.end);
  
  const timeLabel = event.allDay 
    ? 'Cả ngày'
    : `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
      className="flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
      onClick={onClick}
    >
      {/* Color indicator */}
      <div 
        className="w-1 h-12 rounded-full flex-shrink-0"
        style={{ backgroundColor: event.color || '#eab308' }}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {event.title}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {timeLabel}
          </span>
        </div>
        
        {event.type && (
          <span className={cn(
            'inline-flex mt-1 text-xs px-1.5 py-0.5 rounded',
            event.type === 'meeting' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
            event.type === 'deadline' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
            event.type === 'reminder' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {event.type === 'meeting' ? 'Họp' :
             event.type === 'deadline' ? 'Deadline' :
             event.type === 'reminder' ? 'Nhắc nhở' : event.type}
          </span>
        )}
      </div>
      
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </motion.div>
  );
}

// ============================================================================
// DAY GROUP HEADER
// ============================================================================

function DayGroupHeader({ date }: { date: Date }) {
  let label = format(date, 'EEEE, dd/MM', { locale: vi });
  
  if (isToday(date)) {
    label = 'Hôm nay';
  } else if (isTomorrow(date)) {
    label = 'Ngày mai';
  }
  
  return (
    <div className="sticky top-0 z-10 py-2 bg-white dark:bg-gray-900">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// MINI CALENDAR
// ============================================================================

function MiniCalendar() {
  const today = new Date();
  const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  
  // Get dates for current week
  const startOfWeek = startOfDay(addDays(today, -today.getDay()));
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek, i));
  
  return (
    <div className="flex items-center justify-between px-2 py-3 border-b border-gray-100 dark:border-gray-800">
      {weekDates.map((date, index) => {
        const isCurrentDay = isToday(date);
        
        return (
          <div key={index} className="flex flex-col items-center">
            <span className="text-xs text-gray-400 mb-1">
              {daysOfWeek[index]}
            </span>
            <span className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm',
              isCurrentDay 
                ? 'bg-yellow-500 text-white font-medium'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            )}>
              {format(date, 'd')}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CalendarPreview({
  events,
  title = 'Lịch làm việc',
  view = 'agenda',
  maxEvents = 5,
  loading = false,
  emptyMessage = 'Không có sự kiện nào',
  onEventClick,
  onViewAll,
  className,
}: CalendarPreviewProps) {
  // Group events by date for agenda view
  const groupedEvents = useMemo(() => {
    if (view !== 'agenda') return null;
    
    const sorted = [...events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );
    
    const groups = new Map<string, CalendarEvent[]>();
    
    sorted.slice(0, maxEvents).forEach((event) => {
      const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(event);
    });
    
    return Array.from(groups.entries()).map(([dateStr, items]) => ({
      date: new Date(dateStr),
      items,
    }));
  }, [events, maxEvents, view]);
  
  if (loading) {
    return (
      <div className={cn(
        'rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden',
        className
      )}>
        <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-1 h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
        </div>
        
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
          >
            Xem lịch
          </button>
        )}
      </div>
      
      {/* Mini calendar */}
      {view === 'week' && <MiniCalendar />}
      
      {/* Events */}
      <div className="p-4 max-h-[350px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-6 text-center text-gray-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : groupedEvents ? (
          <div className="space-y-4">
            {groupedEvents.map((group, groupIndex) => (
              <div key={group.date.toISOString()}>
                <DayGroupHeader date={group.date} />
                <div className="space-y-1">
                  {group.items.map((event, index) => (
                    <EventItem
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick?.(event)}
                      index={groupIndex * 10 + index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {events.slice(0, maxEvents).map((event, index) => (
              <EventItem
                key={event.id}
                event={event}
                onClick={() => onEventClick?.(event)}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CalendarPreview;

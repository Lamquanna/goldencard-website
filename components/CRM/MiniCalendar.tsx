'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Icons
const Icons = {
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  arrowRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  sun: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  wind: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
    </svg>
  ),
};

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;
  type: 'task' | 'meeting' | 'deadline' | 'milestone' | 'followup';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  project?: string;
  completed?: boolean;
}

interface MiniCalendarProps {
  events?: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

// Default events
const defaultEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Gọi điện khách hàng Solar Farm BD',
    date: new Date(),
    time: '09:00',
    type: 'task',
    priority: 'urgent',
    project: 'Solar Farm BD'
  },
  {
    id: '2',
    title: 'Họp review tiến độ dự án',
    date: new Date(),
    time: '14:00',
    type: 'meeting',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Deadline báo giá AEON Mall',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    type: 'deadline',
    priority: 'high',
    project: 'AEON Mall'
  },
  {
    id: '4',
    title: 'Milestone: Lắp đặt 75% panels',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    type: 'milestone',
    project: 'Solar Farm Bình Thuận'
  },
  {
    id: '5',
    title: 'Follow up lead Wind Farm',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    time: '10:00',
    type: 'followup'
  },
];

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const getEventTypeColor = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'task': return 'bg-blue-500';
    case 'meeting': return 'bg-purple-500';
    case 'deadline': return 'bg-red-500';
    case 'milestone': return 'bg-emerald-500';
    case 'followup': return 'bg-amber-500';
    default: return 'bg-gray-500';
  }
};

const getPriorityIndicator = (priority?: string) => {
  switch (priority) {
    case 'urgent': return '🔴';
    case 'high': return '🟠';
    case 'medium': return '🟡';
    default: return '';
  }
};

export default function MiniCalendar({ 
  events = defaultEvents,
  selectedDate: initialSelectedDate,
  onDateSelect 
}: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date());

  // Get calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentMonth);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is selected
  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  // Get events for selected date
  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#D4AF37]/10 to-[#D4AF37]/5 border-b">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {Icons.calendar}
          Lịch công việc
        </h3>
        <Link href="/crm/tasks" className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1">
          Xem tất cả {Icons.arrowRight}
        </Link>
      </div>

      {/* Calendar */}
      <div className="p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {Icons.chevronLeft}
          </button>
          <span className="font-semibold text-gray-900">
            {MONTHS_VI[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            {Icons.chevronRight}
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_VI.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="p-2" />;
            }

            const dayEvents = getEventsForDate(date);
            const hasEvents = dayEvents.length > 0;
            const hasUrgent = dayEvents.some(e => e.priority === 'urgent');

            return (
              <motion.button
                key={date.toISOString()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(date)}
                className={`
                  relative p-2 rounded-lg text-sm font-medium transition-colors
                  ${isToday(date) ? 'bg-[#D4AF37] text-white' : ''}
                  ${isSelected(date) && !isToday(date) ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : ''}
                  ${!isToday(date) && !isSelected(date) ? 'hover:bg-gray-100 text-gray-700' : ''}
                `}
              >
                {date.getDate()}
                {hasEvents && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {hasUrgent ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    )}
                    {dayEvents.length > 1 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Events */}
      <div className="border-t">
        <div className="px-4 py-2 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700">
            {isToday(selectedDate) ? 'Hôm nay' : selectedDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            <span className="text-gray-400 font-normal ml-2">
              ({selectedDateEvents.length} sự kiện)
            </span>
          </h4>
        </div>
        <div className="p-2 space-y-2 max-h-48 overflow-y-auto">
          {selectedDateEvents.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Không có sự kiện nào
            </p>
          ) : (
            selectedDateEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer
                  border-l-4 ${getEventTypeColor(event.type).replace('bg-', 'border-')}
                `}
              >
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${getEventTypeColor(event.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    {getPriorityIndicator(event.priority)}
                    <span className={`text-sm font-medium ${event.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {event.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    {event.time && (
                      <span className="flex items-center gap-1">
                        {Icons.clock} {event.time}
                      </span>
                    )}
                    {event.project && (
                      <span className="text-[#D4AF37]">{event.project}</span>
                    )}
                  </div>
                </div>
                {event.completed && (
                  <span className="text-emerald-500">{Icons.check}</span>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Export upcoming events list
export function UpcomingEventsList({ events = defaultEvents, maxDisplay = 5 }: { events?: CalendarEvent[], maxDisplay?: number }) {
  const upcomingEvents = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxDisplay);

  return (
    <div className="space-y-2">
      {upcomingEvents.map((event, index) => {
        const eventDate = new Date(event.date);
        const isToday = eventDate.toDateString() === new Date().toDateString();
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all"
          >
            <div className={`w-10 h-10 rounded-lg ${isToday ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600'} flex flex-col items-center justify-center shrink-0`}>
              <span className="text-xs font-medium">{eventDate.toLocaleDateString('vi-VN', { weekday: 'short' })}</span>
              <span className="text-lg font-bold leading-none">{eventDate.getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                {getPriorityIndicator(event.priority)}
                <span className="text-sm font-medium text-gray-900 truncate">{event.title}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                {event.time && <span>{event.time}</span>}
                {event.project && (
                  <span className="flex items-center gap-1 text-[#D4AF37]">
                    {event.project.includes('Solar') ? Icons.sun : Icons.wind}
                    {event.project}
                  </span>
                )}
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full shrink-0 ${getEventTypeColor(event.type)}`} />
          </motion.div>
        );
      })}
    </div>
  );
}

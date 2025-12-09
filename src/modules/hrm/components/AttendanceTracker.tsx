'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Timer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useHRMStore, selectTodayAttendanceStats, selectFilteredAttendance } from '../store';
import {
  Attendance,
  AttendanceStatus,
  ATTENDANCE_STATUS_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface AttendanceTrackerProps {
  employeeId?: string;
  onCheckIn?: (employeeId: string) => void;
  onCheckOut?: (employeeId: string) => void;
}

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

const formatTime = (date: Date | undefined): string => {
  if (!date) return '--:--';
  return format(new Date(date), 'HH:mm');
};

// ============================================================================
// STATS CARDS
// ============================================================================

function AttendanceStatsCards() {
  const stats = useHRMStore(selectTodayAttendanceStats);

  const items = [
    { 
      label: 'Tổng nhân viên', 
      value: stats.totalEmployees, 
      icon: Users, 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' 
    },
    { 
      label: 'Đã check-in', 
      value: stats.checkedIn, 
      icon: LogIn, 
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' 
    },
    { 
      label: 'Đi muộn', 
      value: stats.late, 
      icon: AlertCircle, 
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' 
    },
    { 
      label: 'Vắng mặt', 
      value: stats.absent, 
      icon: XCircle, 
      color: 'text-red-600 bg-red-50 dark:bg-red-950' 
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
// QUICK CHECK-IN/OUT PANEL
// ============================================================================

interface QuickActionPanelProps {
  onCheckIn?: () => void;
  onCheckOut?: () => void;
  todayRecord?: Attendance;
}

function QuickActionPanel({ onCheckIn, onCheckOut, todayRecord }: QuickActionPanelProps) {
  const now = new Date();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Check-in / Check-out</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center py-4">
          {/* Current Time */}
          <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {format(now, 'HH:mm:ss')}
          </div>
          <div className="text-sm text-zinc-500 mb-6">
            {format(now, 'EEEE, dd MMMM yyyy', { locale: vi })}
          </div>

          {/* Status */}
          {todayRecord?.checkIn && (
            <div className="flex items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-emerald-500" />
                <span className="text-zinc-600 dark:text-zinc-300">
                  Check-in: <span className="font-medium">{formatTime(todayRecord.checkIn)}</span>
                </span>
              </div>
              {todayRecord.checkOut && (
                <div className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-amber-500" />
                  <span className="text-zinc-600 dark:text-zinc-300">
                    Check-out: <span className="font-medium">{formatTime(todayRecord.checkOut)}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={onCheckIn}
              disabled={!!todayRecord?.checkIn}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Check-in
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onCheckOut}
              disabled={!todayRecord?.checkIn || !!todayRecord?.checkOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Check-out
            </Button>
          </div>

          {/* Working Hours */}
          {todayRecord?.workingHours && (
            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <Timer className="h-4 w-4" />
              <span>
                Đã làm: <span className="font-medium text-zinc-700 dark:text-zinc-300">{todayRecord.workingHours}h</span>
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// ATTENDANCE CALENDAR
// ============================================================================

interface AttendanceCalendarProps {
  employeeId?: string;
  records: Attendance[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

function AttendanceCalendar({ employeeId, records, selectedDate, onDateChange }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  const getAttendanceForDay = useCallback((date: Date) => {
    return records.find(
      (r) => (!employeeId || r.employeeId === employeeId) && isSameDay(new Date(r.date), date)
    );
  }, [records, employeeId]);

  const getStatusColor = (status: AttendanceStatus | undefined): string => {
    if (!status) return '';
    const config = ATTENDANCE_STATUS_CONFIG[status];
    return config.bgColor;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Lịch chấm công</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: vi })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-zinc-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: days[0].getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {days.map((day) => {
            const attendance = getAttendanceForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);

            return (
              <TooltipProvider key={day.toISOString()}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onDateChange(day)}
                      className={cn(
                        'aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors',
                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                        isSelected && 'ring-2 ring-primary',
                        isTodayDate && 'font-bold',
                        attendance && getStatusColor(attendance.status)
                      )}
                    >
                      <span className={cn(
                        isTodayDate && 'text-primary'
                      )}>
                        {format(day, 'd')}
                      </span>
                      {attendance && (
                        <div className="w-1.5 h-1.5 rounded-full bg-current mt-0.5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {attendance ? (
                      <div className="text-xs">
                        <p className="font-medium">{ATTENDANCE_STATUS_CONFIG[attendance.status].label}</p>
                        {attendance.checkIn && (
                          <p>Check-in: {formatTime(attendance.checkIn)}</p>
                        )}
                        {attendance.checkOut && (
                          <p>Check-out: {formatTime(attendance.checkOut)}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs">Chưa có dữ liệu</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
          {Object.entries(ATTENDANCE_STATUS_CONFIG).slice(0, 5).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div className={cn('w-3 h-3 rounded', config.bgColor)} />
              <span className="text-zinc-600 dark:text-zinc-400">{config.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TODAY'S ATTENDANCE LIST
// ============================================================================

function TodayAttendanceList() {
  const todayRecords = useHRMStore((state) => 
    state.attendanceRecords.filter(
      (r) => new Date(r.date).toDateString() === new Date().toDateString()
    )
  );

  if (todayRecords.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chấm công hôm nay</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-zinc-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có dữ liệu chấm công</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Chấm công hôm nay ({todayRecords.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y dark:divide-zinc-800 max-h-[400px] overflow-y-auto">
          {todayRecords.map((record) => {
            const statusConfig = ATTENDANCE_STATUS_CONFIG[record.status];
            
            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={record.employee?.avatar} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(record.employee?.name || 'NV')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {record.employee?.name || 'Nhân viên'}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {record.checkIn && (
                        <span className="flex items-center gap-1">
                          <LogIn className="h-3 w-3 text-emerald-500" />
                          {formatTime(record.checkIn)}
                        </span>
                      )}
                      {record.checkOut && (
                        <span className="flex items-center gap-1">
                          <LogOut className="h-3 w-3 text-amber-500" />
                          {formatTime(record.checkOut)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AttendanceTracker({
  employeeId,
  onCheckIn,
  onCheckOut,
}: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { 
    checkIn: storeCheckIn, 
    checkOut: storeCheckOut,
    attendanceRecords,
  } = useHRMStore();

  const filteredRecords = useHRMStore(selectFilteredAttendance);

  // Find today's record for the current employee
  const todayRecord = useMemo(() => {
    if (!employeeId) return undefined;
    return attendanceRecords.find(
      (r) => r.employeeId === employeeId && 
      new Date(r.date).toDateString() === new Date().toDateString()
    );
  }, [attendanceRecords, employeeId]);

  const handleCheckIn = useCallback(() => {
    if (employeeId) {
      storeCheckIn(employeeId);
      onCheckIn?.(employeeId);
    }
  }, [employeeId, storeCheckIn, onCheckIn]);

  const handleCheckOut = useCallback(() => {
    if (employeeId) {
      storeCheckOut(employeeId);
      onCheckOut?.(employeeId);
    }
  }, [employeeId, storeCheckOut, onCheckOut]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <AttendanceStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions + Calendar */}
        <div className="space-y-6">
          {employeeId && (
            <QuickActionPanel
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              todayRecord={todayRecord}
            />
          )}
          
          <AttendanceCalendar
            employeeId={employeeId}
            records={filteredRecords}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        {/* Right Column - Today's Attendance List */}
        <div className="lg:col-span-2">
          <TodayAttendanceList />
        </div>
      </div>
    </div>
  );
}

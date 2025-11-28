'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowDownIcon,
  PlayIcon,
  StopIcon,
  LockClosedIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { UserRole, canViewAll as checkCanViewAll, hasPermission } from '@/lib/permissions';
import { getAuthUser } from '@/lib/auth-utils';
import { exportToExcel, attendanceExportColumns } from '@/lib/excel-export';

// Types
interface AttendanceRecord {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'early_leave' | 'half_day' | 'holiday';
  work_hours: number;
  location?: string;
  notes?: string;
}

interface AttendanceStats {
  total_days: number;
  present: number;
  absent: number;
  late: number;
  early_leave: number;
  avg_work_hours: number;
}

// Mock data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const generateMockAttendance = (_currentUserId?: string): AttendanceRecord[] => {
  const users = [
    { id: 'u1', name: 'Nguyễn Văn A' },
    { id: 'u2', name: 'Trần Thị B' },
    { id: 'u3', name: 'Lê Văn C' },
    { id: 'u4', name: 'Phạm Thị D' },
    { id: 'u5', name: 'Hoàng Văn E' },
    { id: 'admin', name: 'Admin User' },
    { id: 'sale', name: 'Nhân viên Sale' },
  ];

  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    users.forEach(user => {
      const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'late', 'absent'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      let checkIn = null;
      let checkOut = null;
      let workHours = 0;

      if (randomStatus !== 'absent') {
        const baseHour = randomStatus === 'late' ? 9 : 8;
        const baseMinute = Math.floor(Math.random() * 30);
        checkIn = `${baseHour.toString().padStart(2, '0')}:${baseMinute.toString().padStart(2, '0')}`;
        
        const endHour = 17 + Math.floor(Math.random() * 2);
        const endMinute = Math.floor(Math.random() * 30);
        checkOut = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        workHours = endHour - baseHour + (endMinute - baseMinute) / 60;
      }

      records.push({
        id: `att-${date.toISOString().split('T')[0]}-${user.id}`,
        user_id: user.id,
        user_name: user.name,
        date: date.toISOString().split('T')[0],
        check_in: checkIn,
        check_out: checkOut,
        status: randomStatus,
        work_hours: Math.round(workHours * 10) / 10,
        location: 'Văn phòng chính - Q7',
      });
    });
  }

  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const STATUS_CONFIG = {
  present: { label: 'Có mặt', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  absent: { label: 'Vắng', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
  late: { label: 'Đi muộn', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
  early_leave: { label: 'Về sớm', color: 'bg-orange-100 text-orange-700', icon: ClockIcon },
  half_day: { label: 'Nửa ngày', color: 'bg-blue-100 text-blue-700', icon: CalendarDaysIcon },
  holiday: { label: 'Nghỉ lễ', color: 'bg-purple-100 text-purple-700', icon: CalendarDaysIcon },
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // User auth state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('staff');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [todayCheckIn, setTodayCheckIn] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Company office location (Golden Energy - Q7, HCMC)
  const OFFICE_LOCATION = { lat: 10.7350, lng: 106.7150 }; // Q7 coordinates
  const MAX_DISTANCE_METERS = 200; // 200m radius from office

  // Permission checks
  const canViewAllRecords = useMemo(() => checkCanViewAll(userRole, 'attendance'), [userRole]);
  const canExport = useMemo(() => hasPermission(userRole, 'attendance', 'export'), [userRole]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canApprove = useMemo(() => hasPermission(userRole, 'attendance', 'approve'), [userRole]);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setCurrentUserId(authUser.id);
      setUserRole(authUser.role);
    }
  }, []);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const allRecords = generateMockAttendance(currentUserId);
      setRecords(allRecords);
      setLoading(false);
      
      // Check if user has checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = allRecords.find(r => 
        r.date === today && r.user_id === currentUserId
      );
      if (todayRecord && todayRecord.check_in) {
        setIsCheckedIn(true);
        setTodayCheckIn(todayRecord.check_in);
      }
    }, 500);
  }, [currentUserId]);

  // Get unique users (for filter dropdown - only show if canViewAll)
  const users = useMemo(() => {
    if (!canViewAllRecords) return [];
    return Array.from(new Set(records.map(r => r.user_id))).map(uid => {
      const record = records.find(r => r.user_id === uid);
      return { id: uid, name: record?.user_name || uid };
    });
  }, [records, canViewAllRecords]);

  // Filter records based on permissions
  const filteredRecords = useMemo(() => {
    let result = records;
    
    // If user cannot view all, filter to only their records
    if (!canViewAllRecords) {
      result = result.filter(r => r.user_id === currentUserId);
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (filterUser !== 'all' && canViewAllRecords) {
      result = result.filter(r => r.user_id === filterUser);
    }
    return result;
  }, [records, filterStatus, filterUser, canViewAllRecords, currentUserId]);

  // Calculate stats (based on filtered records)
  const stats: AttendanceStats = useMemo(() => ({
    total_days: new Set(filteredRecords.map(r => r.date)).size,
    present: filteredRecords.filter(r => r.status === 'present').length,
    absent: filteredRecords.filter(r => r.status === 'absent').length,
    late: filteredRecords.filter(r => r.status === 'late').length,
    early_leave: filteredRecords.filter(r => r.status === 'early_leave').length,
    avg_work_hours: filteredRecords.filter(r => r.work_hours > 0).reduce((sum, r) => sum + r.work_hours, 0) / 
      Math.max(filteredRecords.filter(r => r.work_hours > 0).length, 1),
  }), [filteredRecords]);

  // Export to Excel handler
  const handleExportExcel = useCallback(() => {
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'present': return 'Có mặt';
        case 'absent': return 'Vắng';
        case 'late': return 'Đi muộn';
        case 'early_leave': return 'Về sớm';
        case 'half_day': return 'Nửa ngày';
        case 'holiday': return 'Nghỉ lễ';
        default: return status;
      }
    };

    const exportData = filteredRecords.map(record => ({
      id: record.id,
      employeeName: record.user_name,
      department: 'Golden Energy', // Mock department
      date: record.date,
      checkIn: record.check_in || '',
      checkOut: record.check_out || '',
      workHours: record.work_hours,
      statusLabel: getStatusLabel(record.status),
      overtime: 0, // Mock OT
      notes: record.notes || '',
    }));
    
    const filename = `attendance_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(exportData, attendanceExportColumns, filename);
  }, [filteredRecords]);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get user's current GPS location
  const getCurrentLocation = (): Promise<{lat: number, lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị GPS'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error('Bạn cần cấp quyền truy cập vị trí để chấm công'));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error('Không thể xác định vị trí của bạn'));
              break;
            case error.TIMEOUT:
              reject(new Error('Hết thời gian chờ lấy vị trí'));
              break;
            default:
              reject(new Error('Lỗi không xác định khi lấy vị trí'));
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  // Handle Check-in with GPS validation
  const handleCheckIn = async () => {
    setGpsLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      const distance = calculateDistance(
        location.lat, location.lng,
        OFFICE_LOCATION.lat, OFFICE_LOCATION.lng
      );

      if (distance > MAX_DISTANCE_METERS) {
        alert(`❌ Bạn đang ở cách văn phòng ${Math.round(distance)}m.\nVui lòng di chuyển đến gần văn phòng (trong phạm vi ${MAX_DISTANCE_METERS}m) để check-in.`);
        return;
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setIsCheckedIn(true);
      setTodayCheckIn(timeStr);
      // In production, this would call an API with location data
      alert(`✅ Check-in thành công lúc ${timeStr}\n📍 Vị trí: Cách văn phòng ${Math.round(distance)}m`);
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Lỗi khi lấy vị trí'}`);
    } finally {
      setGpsLoading(false);
    }
  };

  // Handle Check-out with GPS validation
  const handleCheckOut = async () => {
    setGpsLoading(true);
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      const distance = calculateDistance(
        location.lat, location.lng,
        OFFICE_LOCATION.lat, OFFICE_LOCATION.lng
      );

      if (distance > MAX_DISTANCE_METERS) {
        alert(`❌ Bạn đang ở cách văn phòng ${Math.round(distance)}m.\nVui lòng di chuyển đến gần văn phòng (trong phạm vi ${MAX_DISTANCE_METERS}m) để check-out.`);
        return;
      }

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      // In production, this would call an API with location data
      alert(`✅ Check-out thành công lúc ${timeStr}\n📍 Vị trí: Cách văn phòng ${Math.round(distance)}m`);
    } catch (error) {
      alert(`❌ ${error instanceof Error ? error.message : 'Lỗi khi lấy vị trí'}`);
    } finally {
      setGpsLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const getRecordsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return filteredRecords.filter(r => r.date === dateStr);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarDaysIcon className="w-8 h-8 text-green-600" />
              {canViewAllRecords ? 'Quản Lý Chấm Công' : 'Chấm Công Của Tôi'}
            </h1>
            <p className="text-gray-500 mt-1">
              {canViewAllRecords 
                ? 'Theo dõi thời gian làm việc của nhân viên' 
                : 'Xem lịch sử chấm công của bạn'}
            </p>
            {!canViewAllRecords && (
              <div className="flex items-center gap-1 text-sm text-amber-600 mt-1">
                <LockClosedIcon className="w-4 h-4" />
                <span>Bạn chỉ xem được chấm công của mình</span>
              </div>
            )}
            {userLocation && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <MapPinIcon className="w-3 h-3" />
                <span>GPS: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Check-in/Check-out buttons for employees */}
            {!isCheckedIn ? (
              <button 
                onClick={handleCheckIn}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gpsLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <PlayIcon className="w-5 h-5" />
                )}
                {gpsLoading ? 'Đang lấy vị trí...' : 'Check-in'}
              </button>
            ) : (
              <button 
                onClick={handleCheckOut}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {gpsLoading ? (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                ) : (
                  <StopIcon className="w-5 h-5" />
                )}
                {gpsLoading ? 'Đang lấy vị trí...' : 'Check-out'}
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Danh sách
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'calendar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lịch
              </button>
            </div>

            {canExport && (
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <DocumentArrowDownIcon className="w-5 h-5" />
                Xuất báo cáo
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-gray-900">{stats.total_days}</div>
            <div className="text-sm text-gray-500">Ngày làm việc</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-500">Có mặt</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-500">Vắng mặt</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-gray-500">Đi muộn</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-orange-600">{stats.early_leave}</div>
            <div className="text-sm text-gray-500">Về sớm</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="text-2xl font-bold text-blue-600">{stats.avg_work_hours.toFixed(1)}h</div>
            <div className="text-sm text-gray-500">TB giờ làm</div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500">
            <FunnelIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Lọc:</span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Only show user filter if user can view all records */}
          {canViewAllRecords && users.length > 0 && (
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Tất cả nhân viên</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          )}

          <button 
            onClick={() => { setFilterStatus('all'); setFilterUser('all'); }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reset
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : viewMode === 'list' ? (
          /* List View */
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nhân viên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Check-out</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Giờ làm</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Vị trí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.slice(0, 50).map((record) => {
                    const statusConfig = STATUS_CONFIG[record.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-sm text-gray-900">{record.user_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.check_in || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {record.check_out || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {record.work_hours > 0 ? `${record.work_hours}h` : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {record.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {record.location}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Calendar View */
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              <h3 className="text-lg font-semibold text-gray-900">
                {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </h3>
              
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
              {/* Day Headers */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                <div key={day} className="bg-gray-50 px-2 py-3 text-center text-sm font-semibold text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-gray-50 min-h-[100px]"></div>
              ))}
              
              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayRecords = getRecordsForDate(day);
                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                
                return (
                  <div
                    key={day}
                    className={`bg-white min-h-[100px] p-2 ${isToday ? 'ring-2 ring-green-500 ring-inset' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayRecords.slice(0, 3).map(record => {
                        const statusConfig = STATUS_CONFIG[record.status];
                        return (
                          <div
                            key={record.id}
                            className={`text-xs px-1.5 py-0.5 rounded truncate ${statusConfig.color}`}
                            title={`${record.user_name} - ${statusConfig.label}`}
                          >
                            {record.user_name.split(' ').pop()}
                          </div>
                        );
                      })}
                      {dayRecords.length > 3 && (
                        <div className="text-xs text-gray-400 px-1">
                          +{dayRecords.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

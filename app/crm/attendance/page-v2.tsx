'use client';

import { useState, useMemo } from 'react';
import {
  Clock, Calendar, Users, MapPin, CheckCircle, XCircle, AlertTriangle,
  Coffee, Moon, Sun, Sunrise, Sunset, Timer, TrendingUp, TrendingDown,
  Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight,
  UserCheck, UserX, UserMinus, Briefcase, Plane, Home, Activity,
  MoreHorizontal, Eye, Edit2, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
}

interface AttendanceRecord {
  id: string;
  employee: Employee;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  checkInLocation?: { lat: number; lng: number; address: string };
  checkOutLocation?: { lat: number; lng: number; address: string };
  status: 'present' | 'late' | 'early_leave' | 'absent' | 'leave' | 'holiday' | 'wfh';
  workHours: number;
  overtime: number;
  notes?: string;
}

interface LeaveRequest {
  id: string;
  employee: Employee;
  type: 'annual' | 'sick' | 'personal' | 'maternity' | 'unpaid';
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
}

interface OvertimeRecord {
  id: string;
  employee: Employee;
  date: Date;
  hours: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  rate: number; // e.g., 1.5x, 2x
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'Nguyễn Văn A', email: 'nguyenvana@goldenenergy.vn', department: 'Kỹ thuật', position: 'Kỹ sư' },
  { id: 'emp-2', name: 'Trần Thị B', email: 'tranthib@goldenenergy.vn', department: 'Kinh doanh', position: 'Sales Manager' },
  { id: 'emp-3', name: 'Lê Văn C', email: 'levanc@goldenenergy.vn', department: 'Dự án', position: 'Project Manager' },
  { id: 'emp-4', name: 'Phạm Thị D', email: 'phamthid@goldenenergy.vn', department: 'HR', position: 'HR Specialist' },
  { id: 'emp-5', name: 'Hoàng Văn E', email: 'hoangvane@goldenenergy.vn', department: 'Tài chính', position: 'Kế toán' },
];

const TODAY = new Date();
const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    employee: MOCK_EMPLOYEES[0],
    date: TODAY,
    checkIn: new Date(TODAY.setHours(8, 5, 0)),
    checkOut: new Date(TODAY.setHours(17, 30, 0)),
    status: 'present',
    workHours: 8.5,
    overtime: 0.5,
    checkInLocation: { lat: 10.8231, lng: 106.6297, address: '123 Nguyễn Văn Linh, Q7, HCM' },
  },
  {
    id: 'att-2',
    employee: MOCK_EMPLOYEES[1],
    date: TODAY,
    checkIn: new Date(TODAY.setHours(8, 45, 0)),
    checkOut: new Date(TODAY.setHours(18, 0, 0)),
    status: 'late',
    workHours: 8.25,
    overtime: 1,
    notes: 'Kẹt xe',
  },
  {
    id: 'att-3',
    employee: MOCK_EMPLOYEES[2],
    date: TODAY,
    status: 'leave',
    workHours: 0,
    overtime: 0,
    notes: 'Nghỉ phép năm',
  },
  {
    id: 'att-4',
    employee: MOCK_EMPLOYEES[3],
    date: TODAY,
    checkIn: new Date(TODAY.setHours(8, 0, 0)),
    checkOut: new Date(TODAY.setHours(17, 0, 0)),
    status: 'present',
    workHours: 8,
    overtime: 0,
  },
  {
    id: 'att-5',
    employee: MOCK_EMPLOYEES[4],
    date: TODAY,
    status: 'wfh',
    checkIn: new Date(TODAY.setHours(8, 15, 0)),
    workHours: 7,
    overtime: 0,
    notes: 'Làm việc từ xa',
  },
];

const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    employee: MOCK_EMPLOYEES[0],
    type: 'annual',
    startDate: new Date('2024-06-20'),
    endDate: new Date('2024-06-22'),
    days: 3,
    reason: 'Du lịch gia đình',
    status: 'pending',
    createdAt: new Date('2024-06-15'),
  },
  {
    id: 'leave-2',
    employee: MOCK_EMPLOYEES[1],
    type: 'sick',
    startDate: new Date('2024-06-18'),
    endDate: new Date('2024-06-18'),
    days: 1,
    reason: 'Khám bệnh định kỳ',
    status: 'approved',
    approvedBy: 'HR Manager',
    createdAt: new Date('2024-06-16'),
  },
];

const MOCK_OVERTIME: OvertimeRecord[] = [
  {
    id: 'ot-1',
    employee: MOCK_EMPLOYEES[0],
    date: new Date('2024-06-15'),
    hours: 2,
    reason: 'Hoàn thành báo cáo dự án',
    status: 'approved',
    rate: 1.5,
  },
  {
    id: 'ot-2',
    employee: MOCK_EMPLOYEES[1],
    date: new Date('2024-06-16'),
    hours: 3,
    reason: 'Họp với khách hàng',
    status: 'pending',
    rate: 1.5,
  },
];

// ============================================
// HELPERS
// ============================================
const formatTime = (date?: Date) => {
  if (!date) return '--:--';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'present':
      return { label: 'Có mặt', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    case 'late':
      return { label: 'Đi muộn', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock };
    case 'early_leave':
      return { label: 'Về sớm', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: Sunset };
    case 'absent':
      return { label: 'Vắng mặt', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle };
    case 'leave':
      return { label: 'Nghỉ phép', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Plane };
    case 'holiday':
      return { label: 'Ngày lễ', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Calendar };
    case 'wfh':
      return { label: 'WFH', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', icon: Home };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: Activity };
  }
};

const getLeaveTypeConfig = (type: string) => {
  switch (type) {
    case 'annual':
      return { label: 'Phép năm', color: 'text-blue-400 bg-blue-500/10' };
    case 'sick':
      return { label: 'Ốm', color: 'text-red-400 bg-red-500/10' };
    case 'personal':
      return { label: 'Việc riêng', color: 'text-amber-400 bg-amber-500/10' };
    case 'maternity':
      return { label: 'Thai sản', color: 'text-pink-400 bg-pink-500/10' };
    case 'unpaid':
      return { label: 'Không lương', color: 'text-gray-400 bg-gray-500/10' };
    default:
      return { label: type, color: 'text-gray-400 bg-gray-500/10' };
  }
};

// ============================================
// PUNCH IN/OUT CARD
// ============================================
function PunchCard({ currentUser }: { currentUser: Employee }) {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useState(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  });

  const handlePunch = () => {
    if (!isPunchedIn) {
      setPunchInTime(new Date());
      setIsPunchedIn(true);
    } else {
      // Handle punch out
      setIsPunchedIn(false);
    }
  };

  const workDuration = punchInTime 
    ? Math.floor((currentTime.getTime() - punchInTime.getTime()) / (1000 * 60 * 60))
    : 0;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Chấm công</h3>
          <p className="text-sm text-white/50">
            {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white font-mono">
            {currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-white/50">
            {currentTime.toLocaleTimeString('vi-VN', { second: '2-digit' }).split(':')[2]}s
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 rounded-xl bg-white/5">
          <Sunrise className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-xs text-white/50">Check In</p>
          <p className="text-sm font-medium text-white">
            {punchInTime ? formatTime(punchInTime) : '--:--'}
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5">
          <Timer className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <p className="text-xs text-white/50">Đã làm</p>
          <p className="text-sm font-medium text-white">
            {workDuration}h {Math.floor(((currentTime.getTime() - (punchInTime?.getTime() || currentTime.getTime())) / (1000 * 60)) % 60)}m
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5">
          <Sunset className="w-5 h-5 text-orange-400 mx-auto mb-1" />
          <p className="text-xs text-white/50">Check Out</p>
          <p className="text-sm font-medium text-white">--:--</p>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handlePunch}
        className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${
          isPunchedIn 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90'
        }`}
      >
        <span className="flex items-center justify-center gap-2">
          {isPunchedIn ? (
            <>
              <Sunset className="w-5 h-5" />
              Check Out
            </>
          ) : (
            <>
              <Sunrise className="w-5 h-5" />
              Check In
            </>
          )}
        </span>
      </motion.button>

      {isPunchedIn && (
        <p className="text-center text-xs text-white/50 mt-3">
          Đã check in lúc {formatTime(punchInTime!)}
        </p>
      )}
    </div>
  );
}

// ============================================
// ATTENDANCE ROW
// ============================================
function AttendanceRow({ record }: { record: AttendanceRecord }) {
  const statusConfig = getStatusConfig(record.status);
  const StatusIcon = statusConfig.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                        flex items-center justify-center text-white font-bold">
            {record.employee.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white">{record.employee.name}</p>
            <p className="text-sm text-white/50">{record.employee.department}</p>
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-amber-400" />
          <span className={`font-mono ${record.checkIn ? 'text-white' : 'text-white/30'}`}>
            {formatTime(record.checkIn)}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Sunset className="w-4 h-4 text-orange-400" />
          <span className={`font-mono ${record.checkOut ? 'text-white' : 'text-white/30'}`}>
            {formatTime(record.checkOut)}
          </span>
        </div>
      </td>

      <td className="px-4 py-4">
        <span className="text-white">{record.workHours.toFixed(1)}h</span>
      </td>

      <td className="px-4 py-4">
        {record.overtime > 0 ? (
          <span className="text-amber-400 font-medium">+{record.overtime}h</span>
        ) : (
          <span className="text-white/30">-</span>
        )}
      </td>

      <td className="px-4 py-4">
        {record.checkInLocation ? (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{record.checkInLocation.address}</span>
          </div>
        ) : (
          <span className="text-white/30">-</span>
        )}
      </td>

      <td className="px-4 py-4">
        <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Eye className="w-4 h-4 text-white/60" />
        </button>
      </td>
    </motion.tr>
  );
}

// ============================================
// LEAVE REQUEST CARD
// ============================================
function LeaveRequestCard({ request, onApprove, onReject }: { 
  request: LeaveRequest; 
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const typeConfig = getLeaveTypeConfig(request.type);
  const isPending = request.status === 'pending';

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                        flex items-center justify-center text-white font-bold text-sm">
            {request.employee.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white">{request.employee.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeConfig.color}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
          request.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
          'bg-amber-500/10 text-amber-400'
        }`}>
          {request.status === 'approved' ? 'Đã duyệt' :
           request.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
        </span>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <Calendar className="w-4 h-4" />
          <span>
            {request.startDate.toLocaleDateString('vi-VN')} - {request.endDate.toLocaleDateString('vi-VN')}
          </span>
          <span className="text-white/40">({request.days} ngày)</span>
        </div>
        <p className="text-sm text-white/70">{request.reason}</p>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
          <button
            onClick={onApprove}
            className="flex-1 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 
                     hover:bg-emerald-500/20 transition-colors text-sm font-medium"
          >
            Duyệt
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 
                     hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            Từ chối
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<'today' | 'leave' | 'overtime'>('today');
  const [attendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [leaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [overtimeRecords] = useState<OvertimeRecord[]>(MOCK_OVERTIME);
  const [search, setSearch] = useState('');

  const currentUser = MOCK_EMPLOYEES[0]; // Simulated logged in user

  // Stats
  const stats = useMemo(() => ({
    present: attendance.filter(a => a.status === 'present').length,
    late: attendance.filter(a => a.status === 'late').length,
    leave: attendance.filter(a => a.status === 'leave').length,
    wfh: attendance.filter(a => a.status === 'wfh').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    total: attendance.length,
    avgWorkHours: attendance.reduce((sum, a) => sum + a.workHours, 0) / attendance.length,
    totalOvertime: attendance.reduce((sum, a) => sum + a.overtime, 0),
    pendingLeaves: leaveRequests.filter(l => l.status === 'pending').length,
  }), [attendance, leaveRequests]);

  // Filter attendance
  const filteredAttendance = useMemo(() => {
    if (!search) return attendance;
    const searchLower = search.toLowerCase();
    return attendance.filter(a =>
      a.employee.name.toLowerCase().includes(searchLower) ||
      a.employee.department.toLowerCase().includes(searchLower)
    );
  }, [attendance, search]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Clock className="w-7 h-7 text-amber-400" />
              Chấm công & Nhân sự
            </h1>
            <p className="text-white/60 mt-1">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 
                             border border-white/10 text-white/70 hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Punch Card & Stats */}
          <div className="col-span-4 space-y-6">
            {/* Punch Card */}
            <PunchCard currentUser={currentUser} />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-400/80 text-sm">Có mặt</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.present}</p>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400/80 text-sm">Đi muộn</span>
                </div>
                <p className="text-2xl font-bold text-amber-400 mt-1">{stats.late}</p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400/80 text-sm">Nghỉ phép</span>
                </div>
                <p className="text-2xl font-bold text-blue-400 mt-1">{stats.leave}</p>
              </div>
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400/80 text-sm">WFH</span>
                </div>
                <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.wfh}</p>
              </div>
            </div>

            {/* Work Summary */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Tổng kết hôm nay</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Tổng nhân sự</span>
                  <span className="text-white font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Giờ làm TB</span>
                  <span className="text-white font-medium">{stats.avgWorkHours.toFixed(1)}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Tổng OT</span>
                  <span className="text-amber-400 font-medium">{stats.totalOvertime}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Đơn phép chờ</span>
                  <span className="text-blue-400 font-medium">{stats.pendingLeaves}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="col-span-8">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 mb-6">
              {[
                { key: 'today', label: 'Chấm công hôm nay', icon: Calendar },
                { key: 'leave', label: 'Đơn nghỉ phép', icon: Plane, badge: stats.pendingLeaves },
                { key: 'overtime', label: 'Tăng ca', icon: Moon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as typeof activeTab)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-amber-500 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                        activeTab === tab.key ? 'bg-amber-600' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            {activeTab === 'today' && (
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên, phòng ban..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                             text-white placeholder:text-white/40 focus:outline-none focus:border-amber-500/50
                             transition-colors"
                  />
                </div>

                {/* Attendance Table */}
                <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Nhân viên</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Check In</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Check Out</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Giờ làm</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">OT</th>
                        <th className="px-4 py-4 text-left text-white/60 font-medium">Vị trí</th>
                        <th className="px-4 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAttendance.map((record) => (
                        <AttendanceRow key={record.id} record={record} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {activeTab === 'leave' && (
              <div className="grid grid-cols-2 gap-4">
                {leaveRequests.map((request) => (
                  <LeaveRequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => console.log('Approve', request)}
                    onReject={() => console.log('Reject', request)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'overtime' && (
              <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Nhân viên</th>
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày</th>
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Số giờ</th>
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Hệ số</th>
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Lý do</th>
                      <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {overtimeRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 
                                          flex items-center justify-center text-white font-bold text-sm">
                              {record.employee.name.charAt(0)}
                            </div>
                            <span className="text-white">{record.employee.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-white/70">
                          {record.date.toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-4 py-4 text-amber-400 font-medium">
                          {record.hours}h
                        </td>
                        <td className="px-4 py-4 text-white/70">
                          x{record.rate}
                        </td>
                        <td className="px-4 py-4 text-white/60">
                          {record.reason}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            record.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                            record.status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                            'bg-amber-500/10 text-amber-400'
                          }`}>
                            {record.status === 'approved' ? 'Đã duyệt' :
                             record.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HRM MODULE - MAIN INDEX
// GoldenEnergy HOME Enterprise Platform
// ============================================================================

// Types
export * from './types';

// Store
export { useHRMStore } from './store';
export {
  selectFilteredEmployees,
  selectFilteredLeaveRequests,
  selectFilteredAttendance,
  selectFilteredPayroll,
  selectEmployeeStats,
  selectDepartmentStats,
  selectLeaveStats,
  selectTodayAttendanceStats,
} from './store';

// Components
export {
  EmployeeDirectory,
  AttendanceTracker,
  LeaveManagement,
  OrgChart,
} from './components';

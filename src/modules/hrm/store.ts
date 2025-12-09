// ============================================================================
// HRM MODULE - ZUSTAND STORE
// GoldenEnergy HOME Enterprise Platform
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Employee,
  Department,
  Position,
  LeaveRequest,
  Attendance,
  AttendanceSummary,
  Payroll,
  EmployeeFilters,
  LeaveFilters,
  AttendanceFilters,
  PayrollFilters,
} from './types';

// Type helper for immer draft
type Draft<T> = T;

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface HRMState {
  // Employees
  employees: Employee[];
  selectedEmployee: Employee | null;
  employeeFilters: EmployeeFilters;
  isLoadingEmployees: boolean;
  
  // Departments
  departments: Department[];
  selectedDepartment: Department | null;
  isLoadingDepartments: boolean;
  
  // Positions
  positions: Position[];
  selectedPosition: Position | null;
  isLoadingPositions: boolean;
  
  // Leave Requests
  leaveRequests: LeaveRequest[];
  selectedLeaveRequest: LeaveRequest | null;
  leaveFilters: LeaveFilters;
  isLoadingLeaveRequests: boolean;
  
  // Attendance
  attendanceRecords: Attendance[];
  attendanceSummaries: AttendanceSummary[];
  attendanceFilters: AttendanceFilters;
  isLoadingAttendance: boolean;
  
  // Payroll
  payrollRecords: Payroll[];
  selectedPayroll: Payroll | null;
  payrollFilters: PayrollFilters;
  isLoadingPayroll: boolean;
  
  // UI State
  isEmployeeDrawerOpen: boolean;
  isLeaveDrawerOpen: boolean;
  isAttendanceModalOpen: boolean;
  isPayrollModalOpen: boolean;
}

interface HRMActions {
  // Employee Actions
  setEmployees: (employees: Employee[]) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  selectEmployee: (employee: string | Employee | null) => void;
  setEmployeeFilters: (filters: Partial<EmployeeFilters>) => void;
  clearEmployeeFilters: () => void;
  setLoadingEmployees: (loading: boolean) => void;
  
  // Department Actions
  setDepartments: (departments: Department[]) => void;
  addDepartment: (department: Department) => void;
  updateDepartment: (id: string, data: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  selectDepartment: (department: string | Department | null) => void;
  setLoadingDepartments: (loading: boolean) => void;
  
  // Position Actions
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, data: Partial<Position>) => void;
  deletePosition: (id: string) => void;
  selectPosition: (position: string | Position | null) => void;
  setLoadingPositions: (loading: boolean) => void;
  
  // Leave Request Actions
  setLeaveRequests: (requests: LeaveRequest[]) => void;
  addLeaveRequest: (request: LeaveRequest) => void;
  updateLeaveRequest: (id: string, data: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => void;
  selectLeaveRequest: (request: string | LeaveRequest | null) => void;
  approveLeaveRequest: (id: string, approverId: string) => void;
  rejectLeaveRequest: (id: string, reason: string) => void;
  setLeaveFilters: (filters: Partial<LeaveFilters>) => void;
  clearLeaveFilters: () => void;
  setLoadingLeaveRequests: (loading: boolean) => void;
  
  // Attendance Actions
  setAttendanceRecords: (records: Attendance[]) => void;
  addAttendanceRecord: (record: Attendance) => void;
  updateAttendanceRecord: (id: string, data: Partial<Attendance>) => void;
  checkIn: (employeeId: string, location?: string) => void;
  checkOut: (employeeId: string) => void;
  setAttendanceSummaries: (summaries: AttendanceSummary[]) => void;
  setAttendanceFilters: (filters: Partial<AttendanceFilters>) => void;
  clearAttendanceFilters: () => void;
  setLoadingAttendance: (loading: boolean) => void;
  
  // Payroll Actions
  setPayrollRecords: (records: Payroll[]) => void;
  addPayrollRecord: (record: Payroll) => void;
  updatePayrollRecord: (id: string, data: Partial<Payroll>) => void;
  selectPayroll: (payroll: string | Payroll | null) => void;
  approvePayroll: (id: string, approverId: string) => void;
  markPayrollPaid: (id: string, transactionRef?: string) => void;
  setPayrollFilters: (filters: Partial<PayrollFilters>) => void;
  clearPayrollFilters: () => void;
  setLoadingPayroll: (loading: boolean) => void;
  
  // UI Actions
  openEmployeeDrawer: () => void;
  closeEmployeeDrawer: () => void;
  openLeaveDrawer: () => void;
  closeLeaveDrawer: () => void;
  openAttendanceModal: () => void;
  closeAttendanceModal: () => void;
  openPayrollModal: () => void;
  closePayrollModal: () => void;
  
  // Utility Actions
  getEmployeeById: (id: string) => Employee | undefined;
  getDepartmentById: (id: string) => Department | undefined;
  getPositionById: (id: string) => Position | undefined;
  getEmployeesByDepartment: (departmentId: string) => Employee[];
  getEmployeesByManager: (managerId: string) => Employee[];
  getPendingLeaveRequests: () => LeaveRequest[];
  getTodayAttendance: () => Attendance[];
  
  // Reset
  reset: () => void;
}

type HRMStore = HRMState & HRMActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: HRMState = {
  employees: [],
  selectedEmployee: null,
  employeeFilters: {},
  isLoadingEmployees: false,
  departments: [],
  selectedDepartment: null,
  isLoadingDepartments: false,
  positions: [],
  selectedPosition: null,
  isLoadingPositions: false,
  leaveRequests: [],
  selectedLeaveRequest: null,
  leaveFilters: {},
  isLoadingLeaveRequests: false,
  attendanceRecords: [],
  attendanceSummaries: [],
  attendanceFilters: {},
  isLoadingAttendance: false,
  payrollRecords: [],
  selectedPayroll: null,
  payrollFilters: {},
  isLoadingPayroll: false,
  isEmployeeDrawerOpen: false,
  isLeaveDrawerOpen: false,
  isAttendanceModalOpen: false,
  isPayrollModalOpen: false,
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useHRMStore = create<HRMStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ====================================================================
        // EMPLOYEE ACTIONS
        // ====================================================================

        setEmployees: (employees: Employee[]) => set((state: Draft<HRMState>) => {
          state.employees = employees as Draft<Employee>[];
        }),

        addEmployee: (employee: Employee) => set((state: Draft<HRMState>) => {
          state.employees.push(employee as Draft<Employee>);
        }),

        updateEmployee: (id: string, data: Partial<Employee>) => set((state: Draft<HRMState>) => {
          const index = state.employees.findIndex((e: Draft<Employee>) => e.id === id);
          if (index !== -1) {
            Object.assign(state.employees[index], data, { updatedAt: new Date() });
          }
          if (state.selectedEmployee?.id === id) {
            Object.assign(state.selectedEmployee, data, { updatedAt: new Date() });
          }
        }),

        deleteEmployee: (id: string) => set((state: Draft<HRMState>) => {
          state.employees = state.employees.filter((e: Draft<Employee>) => e.id !== id);
          if (state.selectedEmployee?.id === id) {
            state.selectedEmployee = null;
          }
        }),

        selectEmployee: (employee: string | Employee | null) => set((state: Draft<HRMState>) => {
          if (typeof employee === 'string') {
            const found = state.employees.find((e: Draft<Employee>) => e.id === employee);
            state.selectedEmployee = found || null;
          } else {
            state.selectedEmployee = employee as Draft<Employee> | null;
          }
          if (state.selectedEmployee) {
            state.isEmployeeDrawerOpen = true;
          }
        }),

        setEmployeeFilters: (filters: Partial<EmployeeFilters>) => set((state: Draft<HRMState>) => {
          state.employeeFilters = { ...state.employeeFilters, ...filters };
        }),

        clearEmployeeFilters: () => set((state: Draft<HRMState>) => {
          state.employeeFilters = {};
        }),

        setLoadingEmployees: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingEmployees = loading;
        }),

        // ====================================================================
        // DEPARTMENT ACTIONS
        // ====================================================================

        setDepartments: (departments: Department[]) => set((state: Draft<HRMState>) => {
          state.departments = departments as Draft<Department>[];
        }),

        addDepartment: (department: Department) => set((state: Draft<HRMState>) => {
          state.departments.push(department as Draft<Department>);
        }),

        updateDepartment: (id: string, data: Partial<Department>) => set((state: Draft<HRMState>) => {
          const index = state.departments.findIndex((d: Draft<Department>) => d.id === id);
          if (index !== -1) {
            Object.assign(state.departments[index], data, { updatedAt: new Date() });
          }
          if (state.selectedDepartment?.id === id) {
            Object.assign(state.selectedDepartment, data, { updatedAt: new Date() });
          }
        }),

        deleteDepartment: (id: string) => set((state: Draft<HRMState>) => {
          state.departments = state.departments.filter((d: Draft<Department>) => d.id !== id);
          if (state.selectedDepartment?.id === id) {
            state.selectedDepartment = null;
          }
        }),

        selectDepartment: (department: string | Department | null) => set((state: Draft<HRMState>) => {
          if (typeof department === 'string') {
            const found = state.departments.find((d: Draft<Department>) => d.id === department);
            state.selectedDepartment = found || null;
          } else {
            state.selectedDepartment = department as Draft<Department> | null;
          }
        }),

        setLoadingDepartments: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingDepartments = loading;
        }),

        // ====================================================================
        // POSITION ACTIONS
        // ====================================================================

        setPositions: (positions: Position[]) => set((state: Draft<HRMState>) => {
          state.positions = positions as Draft<Position>[];
        }),

        addPosition: (position: Position) => set((state: Draft<HRMState>) => {
          state.positions.push(position as Draft<Position>);
        }),

        updatePosition: (id: string, data: Partial<Position>) => set((state: Draft<HRMState>) => {
          const index = state.positions.findIndex((p: Draft<Position>) => p.id === id);
          if (index !== -1) {
            Object.assign(state.positions[index], data, { updatedAt: new Date() });
          }
          if (state.selectedPosition?.id === id) {
            Object.assign(state.selectedPosition, data, { updatedAt: new Date() });
          }
        }),

        deletePosition: (id: string) => set((state: Draft<HRMState>) => {
          state.positions = state.positions.filter((p: Draft<Position>) => p.id !== id);
          if (state.selectedPosition?.id === id) {
            state.selectedPosition = null;
          }
        }),

        selectPosition: (position: string | Position | null) => set((state: Draft<HRMState>) => {
          if (typeof position === 'string') {
            const found = state.positions.find((p: Draft<Position>) => p.id === position);
            state.selectedPosition = found || null;
          } else {
            state.selectedPosition = position as Draft<Position> | null;
          }
        }),

        setLoadingPositions: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingPositions = loading;
        }),

        // ====================================================================
        // LEAVE REQUEST ACTIONS
        // ====================================================================

        setLeaveRequests: (requests: LeaveRequest[]) => set((state: Draft<HRMState>) => {
          state.leaveRequests = requests as Draft<LeaveRequest>[];
        }),

        addLeaveRequest: (request: LeaveRequest) => set((state: Draft<HRMState>) => {
          state.leaveRequests.push(request as Draft<LeaveRequest>);
        }),

        updateLeaveRequest: (id: string, data: Partial<LeaveRequest>) => set((state: Draft<HRMState>) => {
          const index = state.leaveRequests.findIndex((r: Draft<LeaveRequest>) => r.id === id);
          if (index !== -1) {
            Object.assign(state.leaveRequests[index], data, { updatedAt: new Date() });
          }
          if (state.selectedLeaveRequest?.id === id) {
            Object.assign(state.selectedLeaveRequest, data, { updatedAt: new Date() });
          }
        }),

        deleteLeaveRequest: (id: string) => set((state: Draft<HRMState>) => {
          state.leaveRequests = state.leaveRequests.filter((r: Draft<LeaveRequest>) => r.id !== id);
          if (state.selectedLeaveRequest?.id === id) {
            state.selectedLeaveRequest = null;
          }
        }),

        selectLeaveRequest: (request: string | LeaveRequest | null) => set((state: Draft<HRMState>) => {
          if (typeof request === 'string') {
            const found = state.leaveRequests.find((r: Draft<LeaveRequest>) => r.id === request);
            state.selectedLeaveRequest = found || null;
          } else {
            state.selectedLeaveRequest = request as Draft<LeaveRequest> | null;
          }
          if (state.selectedLeaveRequest) {
            state.isLeaveDrawerOpen = true;
          }
        }),

        approveLeaveRequest: (id: string, approverId: string) => set((state: Draft<HRMState>) => {
          const index = state.leaveRequests.findIndex((r: Draft<LeaveRequest>) => r.id === id);
          if (index !== -1) {
            state.leaveRequests[index].status = 'APPROVED';
            state.leaveRequests[index].approverId = approverId;
            state.leaveRequests[index].approvedAt = new Date();
            state.leaveRequests[index].updatedAt = new Date();
          }
        }),

        rejectLeaveRequest: (id: string, reason: string) => set((state: Draft<HRMState>) => {
          const index = state.leaveRequests.findIndex((r: Draft<LeaveRequest>) => r.id === id);
          if (index !== -1) {
            state.leaveRequests[index].status = 'REJECTED';
            state.leaveRequests[index].rejectionReason = reason;
            state.leaveRequests[index].rejectedAt = new Date();
            state.leaveRequests[index].updatedAt = new Date();
          }
        }),

        setLeaveFilters: (filters: Partial<LeaveFilters>) => set((state: Draft<HRMState>) => {
          state.leaveFilters = { ...state.leaveFilters, ...filters };
        }),

        clearLeaveFilters: () => set((state: Draft<HRMState>) => {
          state.leaveFilters = {};
        }),

        setLoadingLeaveRequests: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingLeaveRequests = loading;
        }),

        // ====================================================================
        // ATTENDANCE ACTIONS
        // ====================================================================

        setAttendanceRecords: (records: Attendance[]) => set((state: Draft<HRMState>) => {
          state.attendanceRecords = records as Draft<Attendance>[];
        }),

        addAttendanceRecord: (record: Attendance) => set((state: Draft<HRMState>) => {
          state.attendanceRecords.push(record as Draft<Attendance>);
        }),

        updateAttendanceRecord: (id: string, data: Partial<Attendance>) => set((state: Draft<HRMState>) => {
          const index = state.attendanceRecords.findIndex((r: Draft<Attendance>) => r.id === id);
          if (index !== -1) {
            Object.assign(state.attendanceRecords[index], data, { updatedAt: new Date() });
          }
        }),

        checkIn: (employeeId: string, location?: string) => set((state: Draft<HRMState>) => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const existingIndex = state.attendanceRecords.findIndex(
            (r: Draft<Attendance>) => r.employeeId === employeeId && 
            new Date(r.date).toDateString() === today.toDateString()
          );
          
          if (existingIndex !== -1) {
            state.attendanceRecords[existingIndex].checkIn = now;
            state.attendanceRecords[existingIndex].status = 'PRESENT';
            if (location) {
              state.attendanceRecords[existingIndex].location = location;
            }
            state.attendanceRecords[existingIndex].updatedAt = now;
          } else {
            const scheduledStart = new Date(today);
            scheduledStart.setHours(8, 30, 0, 0);
            const scheduledEnd = new Date(today);
            scheduledEnd.setHours(17, 30, 0, 0);
            
            const newRecord: Attendance = {
              id: `att-${Date.now()}`,
              employeeId,
              date: today,
              status: 'PRESENT',
              checkIn: now,
              scheduledStart,
              scheduledEnd,
              location,
              createdAt: now,
              updatedAt: now,
            };
            state.attendanceRecords.push(newRecord as Draft<Attendance>);
          }
        }),

        checkOut: (employeeId: string) => set((state: Draft<HRMState>) => {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const index = state.attendanceRecords.findIndex(
            (r: Draft<Attendance>) => r.employeeId === employeeId && 
            new Date(r.date).toDateString() === today.toDateString()
          );
          
          if (index !== -1) {
            state.attendanceRecords[index].checkOut = now;
            
            // Calculate working hours
            const checkIn = state.attendanceRecords[index].checkIn;
            if (checkIn) {
              const checkInTime = new Date(checkIn).getTime();
              const workingMs = now.getTime() - checkInTime;
              state.attendanceRecords[index].workingHours = Math.round(workingMs / (1000 * 60 * 60) * 10) / 10;
            }
            
            state.attendanceRecords[index].updatedAt = now;
          }
        }),

        setAttendanceSummaries: (summaries: AttendanceSummary[]) => set((state: Draft<HRMState>) => {
          state.attendanceSummaries = summaries as Draft<AttendanceSummary>[];
        }),

        setAttendanceFilters: (filters: Partial<AttendanceFilters>) => set((state: Draft<HRMState>) => {
          state.attendanceFilters = { ...state.attendanceFilters, ...filters };
        }),

        clearAttendanceFilters: () => set((state: Draft<HRMState>) => {
          state.attendanceFilters = {};
        }),

        setLoadingAttendance: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingAttendance = loading;
        }),

        // ====================================================================
        // PAYROLL ACTIONS
        // ====================================================================

        setPayrollRecords: (records: Payroll[]) => set((state: Draft<HRMState>) => {
          state.payrollRecords = records as Draft<Payroll>[];
        }),

        addPayrollRecord: (record: Payroll) => set((state: Draft<HRMState>) => {
          state.payrollRecords.push(record as Draft<Payroll>);
        }),

        updatePayrollRecord: (id: string, data: Partial<Payroll>) => set((state: Draft<HRMState>) => {
          const index = state.payrollRecords.findIndex((r: Draft<Payroll>) => r.id === id);
          if (index !== -1) {
            Object.assign(state.payrollRecords[index], data, { updatedAt: new Date() });
          }
          if (state.selectedPayroll?.id === id) {
            Object.assign(state.selectedPayroll, data, { updatedAt: new Date() });
          }
        }),

        selectPayroll: (payroll: string | Payroll | null) => set((state: Draft<HRMState>) => {
          if (typeof payroll === 'string') {
            const found = state.payrollRecords.find((p: Draft<Payroll>) => p.id === payroll);
            state.selectedPayroll = found || null;
          } else {
            state.selectedPayroll = payroll as Draft<Payroll> | null;
          }
          if (state.selectedPayroll) {
            state.isPayrollModalOpen = true;
          }
        }),

        approvePayroll: (id: string, approverId: string) => set((state: Draft<HRMState>) => {
          const index = state.payrollRecords.findIndex((r: Draft<Payroll>) => r.id === id);
          if (index !== -1) {
            state.payrollRecords[index].status = 'APPROVED';
            state.payrollRecords[index].approvedBy = approverId;
            state.payrollRecords[index].approvedAt = new Date();
            state.payrollRecords[index].updatedAt = new Date();
          }
        }),

        markPayrollPaid: (id: string, transactionRef?: string) => set((state: Draft<HRMState>) => {
          const index = state.payrollRecords.findIndex((r: Draft<Payroll>) => r.id === id);
          if (index !== -1) {
            state.payrollRecords[index].status = 'PAID';
            state.payrollRecords[index].paidAt = new Date();
            if (transactionRef) {
              state.payrollRecords[index].transactionRef = transactionRef;
            }
            state.payrollRecords[index].updatedAt = new Date();
          }
        }),

        setPayrollFilters: (filters: Partial<PayrollFilters>) => set((state: Draft<HRMState>) => {
          state.payrollFilters = { ...state.payrollFilters, ...filters };
        }),

        clearPayrollFilters: () => set((state: Draft<HRMState>) => {
          state.payrollFilters = {};
        }),

        setLoadingPayroll: (loading: boolean) => set((state: Draft<HRMState>) => {
          state.isLoadingPayroll = loading;
        }),

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        openEmployeeDrawer: () => set((state: Draft<HRMState>) => {
          state.isEmployeeDrawerOpen = true;
        }),

        closeEmployeeDrawer: () => set((state: Draft<HRMState>) => {
          state.isEmployeeDrawerOpen = false;
        }),

        openLeaveDrawer: () => set((state: Draft<HRMState>) => {
          state.isLeaveDrawerOpen = true;
        }),

        closeLeaveDrawer: () => set((state: Draft<HRMState>) => {
          state.isLeaveDrawerOpen = false;
        }),

        openAttendanceModal: () => set((state: Draft<HRMState>) => {
          state.isAttendanceModalOpen = true;
        }),

        closeAttendanceModal: () => set((state: Draft<HRMState>) => {
          state.isAttendanceModalOpen = false;
        }),

        openPayrollModal: () => set((state: Draft<HRMState>) => {
          state.isPayrollModalOpen = true;
        }),

        closePayrollModal: () => set((state: Draft<HRMState>) => {
          state.isPayrollModalOpen = false;
        }),

        // ====================================================================
        // UTILITY ACTIONS
        // ====================================================================

        getEmployeeById: (id: string) => {
          return get().employees.find((e) => e.id === id);
        },

        getDepartmentById: (id: string) => {
          return get().departments.find((d) => d.id === id);
        },

        getPositionById: (id: string) => {
          return get().positions.find((p) => p.id === id);
        },

        getEmployeesByDepartment: (departmentId: string) => {
          return get().employees.filter((e) => e.departmentId === departmentId);
        },

        getEmployeesByManager: (managerId: string) => {
          return get().employees.filter((e) => e.managerId === managerId);
        },

        getPendingLeaveRequests: () => {
          return get().leaveRequests.filter((r) => r.status === 'PENDING');
        },

        getTodayAttendance: () => {
          const today = new Date();
          return get().attendanceRecords.filter(
            (r) => new Date(r.date).toDateString() === today.toDateString()
          );
        },

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => set(initialState),
      })),
      {
        name: 'hrm-storage',
        partialize: (state) => ({
          employeeFilters: state.employeeFilters,
          leaveFilters: state.leaveFilters,
          attendanceFilters: state.attendanceFilters,
          payrollFilters: state.payrollFilters,
        }),
      }
    ),
    { name: 'HRMStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectFilteredEmployees = (state: HRMStore): Employee[] => {
  const { employees, employeeFilters } = state;
  
  return employees.filter((employee) => {
    if (employeeFilters.search) {
      const search = employeeFilters.search.toLowerCase();
      const matchName = employee.name.toLowerCase().includes(search);
      const matchEmail = employee.email.toLowerCase().includes(search);
      const matchCode = employee.employeeCode.toLowerCase().includes(search);
      if (!matchName && !matchEmail && !matchCode) return false;
    }
    
    if (employeeFilters.departmentId && employee.departmentId !== employeeFilters.departmentId) {
      return false;
    }
    
    if (employeeFilters.positionId && employee.positionId !== employeeFilters.positionId) {
      return false;
    }
    
    if (employeeFilters.status && employee.status !== employeeFilters.status) {
      return false;
    }
    
    if (employeeFilters.employmentType && employee.employmentType !== employeeFilters.employmentType) {
      return false;
    }
    
    if (employeeFilters.managerId && employee.managerId !== employeeFilters.managerId) {
      return false;
    }
    
    return true;
  });
};

export const selectFilteredLeaveRequests = (state: HRMStore): LeaveRequest[] => {
  const { leaveRequests, leaveFilters } = state;
  
  return leaveRequests.filter((request) => {
    if (leaveFilters.search) {
      const search = leaveFilters.search.toLowerCase();
      const matchEmployee = request.employee?.name.toLowerCase().includes(search);
      const matchReason = request.reason.toLowerCase().includes(search);
      if (!matchEmployee && !matchReason) return false;
    }
    
    if (leaveFilters.employeeId && request.employeeId !== leaveFilters.employeeId) {
      return false;
    }
    
    if (leaveFilters.type && request.type !== leaveFilters.type) {
      return false;
    }
    
    if (leaveFilters.status && request.status !== leaveFilters.status) {
      return false;
    }
    
    if (leaveFilters.startDate && new Date(request.startDate) < new Date(leaveFilters.startDate)) {
      return false;
    }
    
    if (leaveFilters.endDate && new Date(request.endDate) > new Date(leaveFilters.endDate)) {
      return false;
    }
    
    return true;
  });
};

export const selectFilteredAttendance = (state: HRMStore): Attendance[] => {
  const { attendanceRecords, attendanceFilters } = state;
  
  return attendanceRecords.filter((record) => {
    if (attendanceFilters.employeeId && record.employeeId !== attendanceFilters.employeeId) {
      return false;
    }
    
    if (attendanceFilters.status && record.status !== attendanceFilters.status) {
      return false;
    }
    
    if (attendanceFilters.date) {
      const filterDate = new Date(attendanceFilters.date).toDateString();
      const recordDate = new Date(record.date).toDateString();
      if (filterDate !== recordDate) return false;
    }
    
    if (attendanceFilters.startDate && new Date(record.date) < new Date(attendanceFilters.startDate)) {
      return false;
    }
    
    if (attendanceFilters.endDate && new Date(record.date) > new Date(attendanceFilters.endDate)) {
      return false;
    }
    
    return true;
  });
};

export const selectFilteredPayroll = (state: HRMStore): Payroll[] => {
  const { payrollRecords, payrollFilters } = state;
  
  return payrollRecords.filter((payroll) => {
    if (payrollFilters.employeeId && payroll.employeeId !== payrollFilters.employeeId) {
      return false;
    }
    
    if (payrollFilters.status && payroll.status !== payrollFilters.status) {
      return false;
    }
    
    if (payrollFilters.month && payroll.month !== payrollFilters.month) {
      return false;
    }
    
    if (payrollFilters.year && payroll.year !== payrollFilters.year) {
      return false;
    }
    
    return true;
  });
};

// ============================================================================
// COMPUTED SELECTORS
// ============================================================================

export const selectEmployeeStats = (state: HRMStore) => {
  const { employees } = state;
  
  return {
    total: employees.length,
    active: employees.filter((e) => e.status === 'ACTIVE').length,
    onLeave: employees.filter((e) => e.status === 'ON_LEAVE').length,
    probation: employees.filter((e) => e.status === 'PROBATION').length,
    terminated: employees.filter((e) => e.status === 'TERMINATED').length,
  };
};

export const selectDepartmentStats = (state: HRMStore) => {
  const { departments, employees } = state;
  
  return departments.map((dept) => ({
    ...dept,
    employeeCount: employees.filter((e) => e.departmentId === dept.id).length,
  }));
};

export const selectLeaveStats = (state: HRMStore) => {
  const { leaveRequests } = state;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const thisMonthRequests = leaveRequests.filter((r) => {
    const startDate = new Date(r.startDate);
    return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
  });
  
  return {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === 'PENDING').length,
    approved: leaveRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: leaveRequests.filter((r) => r.status === 'REJECTED').length,
    thisMonth: thisMonthRequests.length,
    thisMonthPending: thisMonthRequests.filter((r) => r.status === 'PENDING').length,
  };
};

export const selectTodayAttendanceStats = (state: HRMStore) => {
  const { employees } = state;
  const todayRecords = state.attendanceRecords.filter(
    (r) => new Date(r.date).toDateString() === new Date().toDateString()
  );
  
  return {
    totalEmployees: employees.filter((e) => e.status === 'ACTIVE').length,
    checkedIn: todayRecords.filter((r) => r.checkIn).length,
    checkedOut: todayRecords.filter((r) => r.checkOut).length,
    late: todayRecords.filter((r) => r.status === 'LATE').length,
    onLeave: todayRecords.filter((r) => r.status === 'ON_LEAVE').length,
    absent: todayRecords.filter((r) => r.status === 'ABSENT').length,
  };
};

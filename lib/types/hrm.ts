// ============================================================================
// HRM TYPES - Employee, Position, Department
// GoldenEnergy ERP Platform
// ============================================================================

// Gender enum
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Employment Type enum
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'FREELANCE';

// Employee Status enum
export type EmployeeStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED' | 'RESIGNED';

// Position interface
export interface Position {
  id: string;
  name: string;
  code: string;
  departmentId?: string | null;
  level: number;
  description?: string | null;
  minSalary?: number | null;
  maxSalary?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: Department | null;
  employees?: EmployeeSummary[];
  _count?: {
    employees: number;
  };
}

// Department interface
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  managerId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Department | null;
  children?: Department[];
  positions?: Position[];
  employees?: EmployeeSummary[];
  _count?: {
    employees: number;
    positions: number;
  };
}

// Employee Summary (for lists and references)
export interface EmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  email: string;
  position?: Position | null;
  status: EmployeeStatus;
}

// Full Employee interface
export interface Employee {
  id: string;
  workspaceId: string;
  userId?: string | null;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  gender?: Gender | null;
  birthDate?: string | null;
  nationalId?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  
  // Employment
  departmentId?: string | null;
  positionId?: string | null;
  managerId?: string | null;
  employmentType: EmploymentType;
  startDate: string;
  endDate?: string | null;
  status: EmployeeStatus;
  
  // Compensation
  salary?: number | null;
  currency: string;
  bankAccount?: string | null;
  bankName?: string | null;
  
  // Emergency Contact
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  emergencyRelation?: string | null;

  createdAt: string;
  updatedAt: string;

  // Relations
  department?: Department | null;
  position?: Position | null;
  manager?: EmployeeSummary | null;
  subordinates?: EmployeeSummary[];
}

// Create Employee DTO
export interface CreateEmployeeDTO {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: Gender;
  birthDate?: string;
  nationalId?: string;
  address?: string;
  city?: string;
  country?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  employmentType?: EmploymentType;
  startDate: string;
  salary?: number;
  currency?: string;
  bankAccount?: string;
  bankName?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
}

// Update Employee DTO
export interface UpdateEmployeeDTO extends Partial<CreateEmployeeDTO> {
  endDate?: string;
  status?: EmployeeStatus;
}

// Create Position DTO
export interface CreatePositionDTO {
  name: string;
  code: string;
  departmentId?: string;
  level?: number;
  description?: string;
  minSalary?: number;
  maxSalary?: number;
  isActive?: boolean;
}

// Update Position DTO
export interface UpdatePositionDTO extends Partial<CreatePositionDTO> {}

// Create Department DTO
export interface CreateDepartmentDTO {
  name: string;
  code: string;
  description?: string;
  parentId?: string;
  managerId?: string;
  isActive?: boolean;
}

// Update Department DTO
export interface UpdateDepartmentDTO extends Partial<CreateDepartmentDTO> {}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Display helpers
export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERN: 'Thực tập',
  FREELANCE: 'Freelance',
};

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Đang làm việc',
  ON_LEAVE: 'Đang nghỉ phép',
  PROBATION: 'Thử việc',
  TERMINATED: 'Đã nghỉ việc',
  RESIGNED: 'Đã từ chức',
};

export const EMPLOYEE_STATUS_COLORS: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  PROBATION: 'bg-blue-100 text-blue-700',
  TERMINATED: 'bg-red-100 text-red-700',
  RESIGNED: 'bg-gray-100 text-gray-700',
};

// Helper function to get full name
export function getFullName(employee: { firstName: string; lastName: string }): string {
  return `${employee.firstName} ${employee.lastName}`;
}

// Helper function to format salary
export function formatSalary(amount: number | null | undefined, currency: string = 'VND'): string {
  if (!amount) return 'Chưa xác định';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
  }).format(amount);
}

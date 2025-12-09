-- ============================================================================
-- HRM Database Schema - GoldenEnergy ERP Platform
-- Bảng nhân viên, phòng ban, chức vụ
-- ============================================================================

-- Enum Types
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE');
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'ON_LEAVE', 'PROBATION', 'TERMINATED', 'RESIGNED');

-- DEPARTMENTS Table
CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  "parentId" TEXT REFERENCES departments(id),
  "managerId" TEXT, -- Will be FK to employees
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POSITIONS Table
CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  "departmentId" TEXT REFERENCES departments(id),
  level INTEGER DEFAULT 1,
  description TEXT,
  "minSalary" DECIMAL(15, 2),
  "maxSalary" DECIMAL(15, 2),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMPLOYEES Table
CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  "workspaceId" TEXT NOT NULL DEFAULT 'default',
  "userId" TEXT UNIQUE,
  "employeeCode" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  gender TEXT,
  "birthDate" TIMESTAMP WITH TIME ZONE,
  "nationalId" TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  
  -- Employment
  "departmentId" TEXT REFERENCES departments(id),
  "positionId" TEXT REFERENCES positions(id),
  "managerId" TEXT REFERENCES employees(id),
  "employmentType" TEXT DEFAULT 'FULL_TIME',
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'ACTIVE',
  
  -- Compensation
  salary DECIMAL(15, 2),
  currency TEXT DEFAULT 'VND',
  "bankAccount" TEXT,
  "bankName" TEXT,
  
  -- Emergency Contact
  "emergencyName" TEXT,
  "emergencyPhone" TEXT,
  "emergencyRelation" TEXT,

  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE("workspaceId", "employeeCode")
);

-- Add FK for managerId in departments after employees table exists
ALTER TABLE departments 
ADD CONSTRAINT fk_department_manager 
FOREIGN KEY ("managerId") REFERENCES employees(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_workspace_department ON employees("workspaceId", "departmentId");
CREATE INDEX IF NOT EXISTS idx_employees_workspace_status ON employees("workspaceId", status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees("departmentId");
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees("positionId");
CREATE INDEX IF NOT EXISTS idx_positions_department ON positions("departmentId");
CREATE INDEX IF NOT EXISTS idx_departments_parent ON departments("parentId");

-- ============================================================================
-- Sample Data for Testing
-- ============================================================================

-- Sample Departments
INSERT INTO departments (id, name, code, description, "isActive") VALUES
('dept_001', 'Ban Giám đốc', 'BOD', 'Ban lãnh đạo công ty', true),
('dept_002', 'Phòng Kế toán', 'ACC', 'Kế toán và tài chính', true),
('dept_003', 'Phòng Kỹ thuật', 'TECH', 'Kỹ thuật và lắp đặt', true),
('dept_004', 'Phòng Kinh doanh', 'SALES', 'Bán hàng và chăm sóc khách hàng', true),
('dept_005', 'Bộ phận Marketing', 'MKT', 'Tiếp thị và truyền thông', true),
('dept_006', 'Phòng Dự án', 'PM', 'Quản lý và giám sát dự án', true),
('dept_007', 'Bộ phận Vận chuyển', 'LOG', 'Logistics và vận chuyển', true),
('dept_008', 'Phòng Phát triển Dự án', 'BD', 'Phát triển kinh doanh và dự án', true)
ON CONFLICT (code) DO NOTHING;

-- Sample Positions
INSERT INTO positions (id, name, code, "departmentId", level, description, "minSalary", "maxSalary", "isActive") VALUES
('pos_001', 'Tổng Giám đốc', 'CEO', 'dept_001', 1, 'Chief Executive Officer', 100000000, 200000000, true),
('pos_002', 'Phó Tổng Giám đốc', 'VCEO', 'dept_001', 2, 'Vice CEO', 70000000, 120000000, true),
('pos_003', 'Giám đốc Tài chính', 'CFO', 'dept_001', 2, 'Chief Financial Officer', 60000000, 100000000, true),
('pos_004', 'Trưởng phòng Kế toán', 'ACC_MGR', 'dept_002', 3, 'Head of Accounting', 25000000, 40000000, true),
('pos_005', 'Trưởng phòng Kỹ thuật', 'TECH_MGR', 'dept_003', 3, 'Head of Technical', 35000000, 55000000, true),
('pos_006', 'Kỹ sư trưởng', 'CHIEF_ENG', 'dept_003', 3, 'Chief Engineer', 35000000, 55000000, true),
('pos_007', 'Kỹ sư', 'ENG', 'dept_003', 5, 'Engineer', 15000000, 30000000, true),
('pos_008', 'Trưởng phòng Kinh doanh', 'SALES_MGR', 'dept_004', 3, 'Head of Sales', 30000000, 50000000, true),
('pos_009', 'Trưởng bộ phận Marketing', 'MKT_MGR', 'dept_005', 3, 'Head of Marketing', 25000000, 45000000, true),
('pos_010', 'Trưởng phòng Giám sát Dự án', 'PM_MGR', 'dept_006', 3, 'Head of Project Supervision', 30000000, 50000000, true),
('pos_011', 'Trưởng bộ phận Vận chuyển', 'LOG_MGR', 'dept_007', 3, 'Head of Transportation', 25000000, 40000000, true),
('pos_012', 'Trưởng phòng Phát triển Dự án', 'BD_MGR', 'dept_008', 3, 'Head of Business Development', 30000000, 50000000, true)
ON CONFLICT (code) DO NOTHING;

-- Real Employees Data for Golden Energy
INSERT INTO employees (id, "workspaceId", "employeeCode", "firstName", "lastName", email, phone, gender, "departmentId", "positionId", "employmentType", "startDate", status, currency, "createdAt", "updatedAt") VALUES
('emp_001', 'default', 'GE-CEO-001', 'Hoàng Hà', 'Hà', 'jimmy.ha@goldenenergy.vn', '0903117277', 'MALE', 'dept_001', 'pos_001', 'FULL_TIME', '2020-01-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_002', 'default', 'GE-CFO-001', 'Kim Anh', 'Trương', 'rita.anh@goldenenergy.vn', '0903117278', 'FEMALE', 'dept_001', 'pos_003', 'FULL_TIME', '2020-03-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_003', 'default', 'GE-PM-001', 'Huy Tuấn', 'Hà', 'tuan.ha@goldenenergy.vn', '0903117279', 'MALE', 'dept_006', 'pos_010', 'FULL_TIME', '2021-01-15', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_004', 'default', 'GE-TECH-001', 'Minh Tân', 'Hồ', 'tan.ho@goldenenergy.vn', '0903117280', 'MALE', 'dept_003', 'pos_005', 'FULL_TIME', '2020-06-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_005', 'default', 'GE-BD-001', 'Quang Anh', 'Lê', 'anh.le@goldenenergy.vn', '0903117281', 'MALE', 'dept_008', 'pos_012', 'FULL_TIME', '2021-03-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_006', 'default', 'GE-ACC-001', 'Thị Thu', 'Nguyễn', 'thu.nguyen@goldenenergy.vn', '0903117282', 'FEMALE', 'dept_002', 'pos_004', 'FULL_TIME', '2020-09-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_007', 'default', 'GE-LOG-001', 'Tấn Lễ', 'Phạm', 'le.pham@goldenenergy.vn', '0903117283', 'MALE', 'dept_007', 'pos_011', 'FULL_TIME', '2021-06-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_008', 'default', 'GE-SALES-001', 'Minh Nguyệt', 'Nguyễn', 'nguyet.nguyen@goldenenergy.vn', '0903117284', 'FEMALE', 'dept_004', 'pos_008', 'FULL_TIME', '2021-02-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_009', 'default', 'GE-MKT-001', 'Thị Duyên', 'Lưu', 'cristina.lu@goldenenergy.vn', '0903117285', 'FEMALE', 'dept_005', 'pos_009', 'FULL_TIME', '2021-09-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_010', 'default', 'GE-ENG-001', 'Hữu Giàu', 'Đào', 'giau.dao@goldenenergy.vn', '0903117286', 'MALE', 'dept_003', 'pos_007', 'FULL_TIME', '2022-01-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_011', 'default', 'GE-ENG-002', 'Văn Sơn', 'Trần', 'son.tran@goldenenergy.vn', '0903117287', 'MALE', 'dept_003', 'pos_007', 'FULL_TIME', '2022-03-01', 'ACTIVE', 'VND', NOW(), NOW()),
('emp_012', 'default', 'GE-ENG-003', 'Minh Duy', 'Nguyễn', 'duy.nguyen@goldenenergy.vn', '0903117288', 'MALE', 'dept_003', 'pos_007', 'FULL_TIME', '2022-06-01', 'ACTIVE', 'VND', NOW(), NOW())
ON CONFLICT ("workspaceId", "employeeCode") DO NOTHING;

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updatedAt
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
    BEFORE UPDATE ON positions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

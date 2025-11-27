-- =====================================================
-- GOLDEN ENERGY CRM - ATTENDANCE & HR MODULE
-- Inspired by Workday, BambooHR, SAP SuccessFactors
-- =====================================================

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default departments for renewable energy company
INSERT INTO departments (code, name, description) VALUES
    ('EXE', 'Executive', 'C-Suite and executives'),
    ('SALES', 'Sales', 'Sales and business development'),
    ('ENG', 'Engineering', 'Technical engineering team'),
    ('INST', 'Installation', 'Field installation teams'),
    ('OPS', 'Operations', 'Project operations'),
    ('FIN', 'Finance', 'Finance and accounting'),
    ('HR', 'Human Resources', 'People management'),
    ('IT', 'IT', 'Information technology'),
    ('MAINT', 'Maintenance', 'O&M and maintenance'),
    ('WH', 'Warehouse', 'Warehouse and logistics')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- EMPLOYEES TABLE (Extended user profile)
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id),
    employee_code VARCHAR(20) UNIQUE NOT NULL,
    
    -- Personal info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    national_id VARCHAR(20),
    tax_id VARCHAR(20),
    
    -- Contact
    personal_email VARCHAR(255),
    work_email VARCHAR(255),
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    
    -- Employment
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    job_title VARCHAR(100),
    employment_type VARCHAR(30) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'freelance')),
    hire_date DATE,
    probation_end_date DATE,
    termination_date DATE,
    
    -- Manager
    manager_id UUID REFERENCES employees(id),
    
    -- Work schedule
    work_schedule_id UUID, -- FK to work_schedules
    default_warehouse_id UUID REFERENCES warehouses(id), -- For warehouse staff
    
    -- Salary & Benefits (basic info, detailed in payroll module)
    base_salary DECIMAL(15,2),
    salary_currency VARCHAR(3) DEFAULT 'VND',
    
    -- Leave balances
    annual_leave_balance DECIMAL(4,1) DEFAULT 12, -- Days
    sick_leave_balance DECIMAL(4,1) DEFAULT 10,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated')),
    
    -- Profile
    avatar_url VARCHAR(500),
    bio TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- WORK SCHEDULES (Shift patterns)
-- =====================================================
CREATE TABLE IF NOT EXISTS work_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    
    -- Weekly schedule (JSON array of daily schedules)
    schedule JSONB DEFAULT '[
        {"day": "monday", "start": "08:00", "end": "17:00", "break": 60},
        {"day": "tuesday", "start": "08:00", "end": "17:00", "break": 60},
        {"day": "wednesday", "start": "08:00", "end": "17:00", "break": 60},
        {"day": "thursday", "start": "08:00", "end": "17:00", "break": 60},
        {"day": "friday", "start": "08:00", "end": "17:00", "break": 60},
        {"day": "saturday", "start": null, "end": null, "break": 0},
        {"day": "sunday", "start": null, "end": null, "break": 0}
    ]',
    
    -- Hours
    hours_per_day DECIMAL(4,2) DEFAULT 8,
    hours_per_week DECIMAL(5,2) DEFAULT 40,
    
    -- Overtime rules
    overtime_after_hours DECIMAL(4,2) DEFAULT 8, -- OT starts after X hours/day
    weekend_multiplier DECIMAL(3,2) DEFAULT 1.5, -- Weekend OT rate
    holiday_multiplier DECIMAL(3,2) DEFAULT 2.0, -- Holiday OT rate
    night_multiplier DECIMAL(3,2) DEFAULT 1.3, -- Night shift rate (10pm-6am)
    
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default schedules
INSERT INTO work_schedules (name, code, hours_per_day, hours_per_week) VALUES
    ('Standard Office', 'STD', 8, 40),
    ('Field Work', 'FIELD', 8, 40),
    ('Shift A (Morning)', 'SHIFT_A', 8, 40),
    ('Shift B (Afternoon)', 'SHIFT_B', 8, 40),
    ('Shift C (Night)', 'SHIFT_C', 8, 40),
    ('Part Time', 'PART', 4, 20)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ATTENDANCE RECORDS (Punch In/Out)
-- =====================================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Punch times
    punch_in TIMESTAMP WITH TIME ZONE,
    punch_out TIMESTAMP WITH TIME ZONE,
    
    -- Calculated hours
    work_hours DECIMAL(5,2) DEFAULT 0,
    break_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    night_hours DECIMAL(4,2) DEFAULT 0, -- Hours worked between 10pm-6am
    
    -- Location (GPS tracking for field workers)
    punch_in_location JSONB, -- {lat, lng, address, accuracy}
    punch_out_location JSONB,
    punch_in_device VARCHAR(50), -- mobile, tablet, web, biometric
    punch_out_device VARCHAR(50),
    
    -- Photos (for verification)
    punch_in_photo_url VARCHAR(500),
    punch_out_photo_url VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'early_leave', 'half_day', 'on_leave', 'holiday', 'weekend')),
    
    -- For field work
    project_id UUID REFERENCES projects(id),
    site_location VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Admin adjustments
    adjusted_by UUID REFERENCES users(id),
    adjustment_reason TEXT,
    
    -- Approval for OT
    ot_status VARCHAR(20) DEFAULT 'none' CHECK (ot_status IN ('none', 'pending', 'approved', 'rejected')),
    ot_approved_by UUID REFERENCES users(id),
    ot_approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(employee_id, attendance_date)
);

-- =====================================================
-- OVERTIME REQUESTS & LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS overtime_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    
    -- Request details
    request_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    total_hours DECIMAL(4,2) NOT NULL,
    
    -- Type and rate
    ot_type VARCHAR(20) DEFAULT 'regular' CHECK (ot_type IN ('regular', 'weekend', 'holiday', 'night')),
    multiplier DECIMAL(3,2) DEFAULT 1.5,
    
    -- Reason
    reason TEXT NOT NULL,
    project_id UUID REFERENCES projects(id),
    task_id UUID REFERENCES tasks(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEAVE REQUESTS
-- =====================================================
CREATE TABLE IF NOT EXISTS leave_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    default_days DECIMAL(4,1) DEFAULT 0,
    is_paid BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    color VARCHAR(7) DEFAULT '#3B82F6', -- For calendar display
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leave types
INSERT INTO leave_types (code, name, default_days, is_paid, color) VALUES
    ('ANNUAL', 'Annual Leave', 12, true, '#10B981'),
    ('SICK', 'Sick Leave', 10, true, '#EF4444'),
    ('MATERNITY', 'Maternity Leave', 180, true, '#EC4899'),
    ('PATERNITY', 'Paternity Leave', 5, true, '#8B5CF6'),
    ('MARRIAGE', 'Marriage Leave', 3, true, '#F59E0B'),
    ('BEREAVEMENT', 'Bereavement Leave', 3, true, '#6B7280'),
    ('UNPAID', 'Unpaid Leave', 0, false, '#9CA3AF'),
    ('COMP', 'Compensatory Off', 0, true, '#06B6D4'),
    ('WFH', 'Work From Home', 0, true, '#84CC16')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type_id UUID NOT NULL REFERENCES leave_types(id),
    
    -- Dates
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    
    -- Half day options
    is_half_day BOOLEAN DEFAULT FALSE,
    half_day_type VARCHAR(10) CHECK (half_day_type IN ('first', 'second')), -- First half or second half
    
    -- Reason
    reason TEXT,
    emergency_contact VARCHAR(50),
    
    -- Attachments (medical certificate, etc.)
    attachments JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Approval workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Balance tracking
    balance_before DECIMAL(4,1),
    balance_after DECIMAL(4,1),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HOLIDAYS CALENDAR
-- =====================================================
CREATE TABLE IF NOT EXISTS holidays (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)) STORED,
    is_recurring BOOLEAN DEFAULT FALSE, -- Repeats every year
    is_half_day BOOLEAN DEFAULT FALSE,
    description TEXT,
    country VARCHAR(100) DEFAULT 'Vietnam',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(date, country)
);

-- Insert Vietnam holidays 2024-2025
INSERT INTO holidays (name, date, is_recurring) VALUES
    ('New Year', '2025-01-01', true),
    ('Tết Nguyên Đán', '2025-01-29', false),
    ('Tết Nguyên Đán', '2025-01-30', false),
    ('Tết Nguyên Đán', '2025-01-31', false),
    ('Hung Kings Festival', '2025-04-07', false),
    ('Reunification Day', '2025-04-30', true),
    ('Labor Day', '2025-05-01', true),
    ('National Day', '2025-09-02', true)
ON CONFLICT (date, country) DO NOTHING;

-- =====================================================
-- TIMESHEET (Weekly/Monthly summaries)
-- =====================================================
CREATE TABLE IF NOT EXISTS timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    period_type VARCHAR(20) DEFAULT 'weekly' CHECK (period_type IN ('weekly', 'biweekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Summary hours
    total_work_hours DECIMAL(6,2) DEFAULT 0,
    total_overtime_hours DECIMAL(5,2) DEFAULT 0,
    total_night_hours DECIMAL(5,2) DEFAULT 0,
    total_leave_hours DECIMAL(5,2) DEFAULT 0,
    
    -- Attendance summary
    days_present INTEGER DEFAULT 0,
    days_absent INTEGER DEFAULT 0,
    days_late INTEGER DEFAULT 0,
    days_leave INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected', 'locked')),
    
    -- Approval
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    employee_notes TEXT,
    manager_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(employee_id, period_start, period_end)
);

-- =====================================================
-- EMPLOYEE SKILLS & CERTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- technical, soft, language
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employee_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    skill_id UUID NOT NULL REFERENCES skills(id),
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5), -- 1=Beginner to 5=Expert
    years_experience DECIMAL(3,1),
    certified BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    certification_expiry DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(employee_id, skill_id)
);

-- Insert default skills for renewable energy
INSERT INTO skills (name, category) VALUES
    ('Solar PV Installation', 'technical'),
    ('Wind Turbine Maintenance', 'technical'),
    ('Electrical Wiring', 'technical'),
    ('Inverter Configuration', 'technical'),
    ('Battery Systems', 'technical'),
    ('IoT Sensor Setup', 'technical'),
    ('Project Management', 'soft'),
    ('AutoCAD', 'technical'),
    ('PVsyst', 'technical'),
    ('Safety Compliance', 'technical'),
    ('Vietnamese', 'language'),
    ('English', 'language')
ON CONFLICT DO NOTHING;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_requests_dates ON leave_requests(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_overtime_employee ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_overtime_status ON overtime_requests(status);
CREATE INDEX IF NOT EXISTS idx_overtime_date ON overtime_requests(request_date);

CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_period ON timesheets(period_start, period_end);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-calculate work hours on punch out
CREATE OR REPLACE FUNCTION calculate_attendance_hours()
RETURNS TRIGGER AS $$
DECLARE
    schedule_record RECORD;
    daily_schedule JSONB;
    scheduled_start TIME;
    scheduled_end TIME;
    break_minutes INTEGER;
    actual_hours DECIMAL;
    ot_hours DECIMAL;
BEGIN
    IF NEW.punch_out IS NOT NULL AND NEW.punch_in IS NOT NULL THEN
        -- Calculate total work hours
        actual_hours := EXTRACT(EPOCH FROM (NEW.punch_out - NEW.punch_in)) / 3600;
        NEW.work_hours := ROUND(actual_hours - COALESCE(NEW.break_hours, 1), 2);
        
        -- Calculate overtime (basic - can be enhanced)
        IF NEW.work_hours > 8 THEN
            NEW.overtime_hours := NEW.work_hours - 8;
            NEW.work_hours := 8;
        END IF;
        
        -- Calculate night hours (10pm - 6am)
        -- Simplified calculation - enhance as needed
        
        -- Check if late
        -- This is simplified - should check against employee's schedule
        IF EXTRACT(HOUR FROM NEW.punch_in) >= 9 THEN
            NEW.status := 'late';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_attendance
    BEFORE INSERT OR UPDATE ON attendance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_attendance_hours();

-- Update leave balance on approval
CREATE OR REPLACE FUNCTION update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        -- Get leave type
        IF (SELECT is_paid FROM leave_types WHERE id = NEW.leave_type_id) THEN
            -- Update employee leave balance based on type
            IF (SELECT code FROM leave_types WHERE id = NEW.leave_type_id) = 'ANNUAL' THEN
                UPDATE employees
                SET annual_leave_balance = annual_leave_balance - NEW.total_days
                WHERE id = NEW.employee_id;
            ELSIF (SELECT code FROM leave_types WHERE id = NEW.leave_type_id) = 'SICK' THEN
                UPDATE employees
                SET sick_leave_balance = sick_leave_balance - NEW.total_days
                WHERE id = NEW.employee_id;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_leave_balance
    AFTER UPDATE ON leave_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_leave_balance();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Today's attendance overview
CREATE OR REPLACE VIEW v_today_attendance AS
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    d.name as department,
    e.position,
    a.punch_in,
    a.punch_out,
    a.work_hours,
    a.overtime_hours,
    a.status,
    CASE 
        WHEN a.id IS NULL THEN 'not_checked_in'
        WHEN a.punch_out IS NULL THEN 'working'
        ELSE 'completed'
    END as attendance_status
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN attendance a ON a.employee_id = e.id AND a.attendance_date = CURRENT_DATE
WHERE e.status = 'active';

-- Monthly attendance summary
CREATE OR REPLACE VIEW v_monthly_attendance_summary AS
SELECT 
    e.id as employee_id,
    e.employee_code,
    e.full_name,
    DATE_TRUNC('month', a.attendance_date) as month,
    COUNT(*) FILTER (WHERE a.status = 'present') as days_present,
    COUNT(*) FILTER (WHERE a.status = 'late') as days_late,
    COUNT(*) FILTER (WHERE a.status = 'absent') as days_absent,
    COUNT(*) FILTER (WHERE a.status = 'on_leave') as days_leave,
    SUM(COALESCE(a.work_hours, 0)) as total_work_hours,
    SUM(COALESCE(a.overtime_hours, 0)) as total_overtime_hours
FROM employees e
LEFT JOIN attendance a ON a.employee_id = e.id
WHERE e.status = 'active'
GROUP BY e.id, e.employee_code, e.full_name, DATE_TRUNC('month', a.attendance_date);

-- Pending approvals view
CREATE OR REPLACE VIEW v_pending_hr_approvals AS
SELECT 
    'leave' as type,
    lr.id,
    e.full_name as employee,
    lt.name as leave_type,
    lr.start_date::text as date_info,
    lr.total_days::text as details,
    lr.status,
    lr.created_at
FROM leave_requests lr
JOIN employees e ON e.id = lr.employee_id
JOIN leave_types lt ON lt.id = lr.leave_type_id
WHERE lr.status = 'pending'
UNION ALL
SELECT 
    'overtime' as type,
    ot.id,
    e.full_name as employee,
    ot.ot_type as leave_type,
    ot.request_date::text as date_info,
    ot.total_hours::text || ' hours' as details,
    ot.status,
    ot.created_at
FROM overtime_requests ot
JOIN employees e ON e.id = ot.employee_id
WHERE ot.status = 'pending';

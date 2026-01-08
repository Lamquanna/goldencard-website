-- ============================================================================= 
-- Leave Management System Database Migration
-- Description: Creates tables for leave requests and leave balances
-- Date: 2026-01-20
-- =============================================================================

-- Drop existing tables if they exist (be careful in production!)
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;

-- =============================================================================
-- LEAVE BALANCES TABLE
-- =============================================================================
CREATE TABLE leave_balances (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL REFERENCES erp_users(employee_id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  
  -- Annual leave (phép năm)
  annual_total INTEGER NOT NULL DEFAULT 12,
  annual_used INTEGER NOT NULL DEFAULT 0,
  annual_remaining INTEGER GENERATED ALWAYS AS (annual_total - annual_used) STORED,
  
  -- Sick leave (nghỉ ốm)
  sick_total INTEGER NOT NULL DEFAULT 30,
  sick_used INTEGER NOT NULL DEFAULT 0,
  sick_remaining INTEGER GENERATED ALWAYS AS (sick_total - sick_used) STORED,
  
  -- Unpaid leave (không lương)
  unpaid_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT leave_balances_employee_year_unique UNIQUE (employee_id, year),
  CONSTRAINT annual_used_check CHECK (annual_used >= 0 AND annual_used <= annual_total),
  CONSTRAINT sick_used_check CHECK (sick_used >= 0 AND sick_used <= sick_total),
  CONSTRAINT unpaid_used_check CHECK (unpaid_used >= 0)
);

-- =============================================================================
-- LEAVE REQUESTS TABLE
-- =============================================================================
CREATE TABLE leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(50) NOT NULL REFERENCES erp_users(employee_id) ON DELETE CASCADE,
  
  -- Leave details
  leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('annual', 'sick', 'unpaid')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL CHECK (total_days > 0),
  reason TEXT NOT NULL,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by VARCHAR(50) REFERENCES erp_users(employee_id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  reject_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT end_after_start CHECK (end_date >= start_date)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Leave balances indexes
CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

-- Leave requests indexes
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_leave_requests_approver ON leave_requests(approved_by);
CREATE INDEX idx_leave_requests_created ON leave_requests(created_at DESC);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leave_balances_updated_at
  BEFORE UPDATE ON leave_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at
  BEFORE UPDATE ON leave_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Create leave balances for all existing employees (current year)
INSERT INTO leave_balances (employee_id, year, annual_total, annual_used, sick_total, sick_used, unpaid_used)
SELECT 
  employee_id,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  12,  -- Default annual leave days
  0,   -- No days used yet
  30,  -- Default sick leave days
  0,   -- No sick days used yet
  0    -- No unpaid days used yet
FROM erp_users
WHERE role IN ('employee', 'manager', 'admin')
ON CONFLICT (employee_id, year) DO NOTHING;

-- =============================================================================
-- HELPER VIEWS
-- =============================================================================

-- View for leave requests with employee details
CREATE OR REPLACE VIEW vw_leave_requests_detailed AS
SELECT 
  lr.*,
  e.full_name as employee_name,
  e.employee_code,
  e.email,
  d.department_name as department,
  a.full_name as approver_name,
  a.employee_code as approver_code
FROM leave_requests lr
JOIN erp_users e ON lr.employee_id = e.employee_id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN erp_users a ON lr.approved_by = a.employee_id;

-- View for leave balances with employee details
CREATE OR REPLACE VIEW vw_leave_balances_detailed AS
SELECT 
  lb.*,
  e.full_name,
  e.employee_code,
  e.email,
  d.department_name as department
FROM leave_balances lb
JOIN erp_users e ON lb.employee_id = e.employee_id
LEFT JOIN departments d ON e.department_id = d.id;

-- =============================================================================
-- PERMISSIONS (if using row-level security)
-- =============================================================================

-- Enable row-level security
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own leave data
CREATE POLICY leave_requests_own_view ON leave_requests
  FOR SELECT
  USING (employee_id = current_setting('app.current_user_id', true));

CREATE POLICY leave_balances_own_view ON leave_balances
  FOR SELECT
  USING (employee_id = current_setting('app.current_user_id', true));

-- Policy: Managers and admins can view all leave data
CREATE POLICY leave_requests_manager_view ON leave_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM erp_users 
      WHERE employee_id = current_setting('app.current_user_id', true)
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY leave_balances_manager_view ON leave_balances
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM erp_users 
      WHERE employee_id = current_setting('app.current_user_id', true)
      AND role IN ('manager', 'admin')
    )
  );

-- Policy: Users can insert their own leave requests
CREATE POLICY leave_requests_own_insert ON leave_requests
  FOR INSERT
  WITH CHECK (employee_id = current_setting('app.current_user_id', true));

-- Policy: Users can update their own pending leave requests (cancel)
CREATE POLICY leave_requests_own_update ON leave_requests
  FOR UPDATE
  USING (
    employee_id = current_setting('app.current_user_id', true)
    AND status = 'pending'
  );

-- Policy: Managers can update any leave request (approve/reject)
CREATE POLICY leave_requests_manager_update ON leave_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM erp_users 
      WHERE employee_id = current_setting('app.current_user_id', true)
      AND role IN ('manager', 'admin')
    )
  );

-- =============================================================================
-- SAMPLE DATA (for testing)
-- =============================================================================

-- Uncomment to insert sample leave requests for testing
/*
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
VALUES 
  ('EMP001', 'annual', '2026-02-10', '2026-02-14', 5, 'Nghỉ lễ tết', 'pending'),
  ('EMP001', 'sick', '2026-01-15', '2026-01-16', 2, 'Bị cảm', 'approved'),
  ('EMP002', 'annual', '2026-03-01', '2026-03-05', 5, 'Du lịch gia đình', 'pending');
*/

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check if tables were created successfully
SELECT 
  tablename,
  schemaname
FROM pg_tables 
WHERE tablename IN ('leave_requests', 'leave_balances')
ORDER BY tablename;

-- Check if indexes were created
SELECT 
  indexname,
  tablename
FROM pg_indexes 
WHERE tablename IN ('leave_requests', 'leave_balances')
ORDER BY tablename, indexname;

-- Count records in each table
SELECT 
  'leave_balances' as table_name,
  COUNT(*) as record_count
FROM leave_balances
UNION ALL
SELECT 
  'leave_requests' as table_name,
  COUNT(*) as record_count
FROM leave_requests;

-- =============================================================================
-- CLEANUP (uncomment to remove all data and tables)
-- =============================================================================

/*
DROP VIEW IF EXISTS vw_leave_requests_detailed CASCADE;
DROP VIEW IF EXISTS vw_leave_balances_detailed CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS leave_balances CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/

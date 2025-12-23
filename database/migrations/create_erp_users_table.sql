-- ============================================================================
-- ERP Users Table Migration
-- Tạo bảng quản lý người dùng cho hệ thống ERP với auto-increment employee code
-- ============================================================================

-- Drop table if exists (cẩn thận trong production!)
-- DROP TABLE IF EXISTS erp_users CASCADE;

-- Create erp_users table
CREATE TABLE IF NOT EXISTS erp_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  department VARCHAR(50),
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  
  -- Indexes for better performance
  CONSTRAINT erp_users_username_key UNIQUE (username),
  CONSTRAINT erp_users_employee_code_key UNIQUE (employee_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_erp_users_username ON erp_users(username);
CREATE INDEX IF NOT EXISTS idx_erp_users_employee_code ON erp_users(employee_code);
CREATE INDEX IF NOT EXISTS idx_erp_users_role ON erp_users(role);
CREATE INDEX IF NOT EXISTS idx_erp_users_is_active ON erp_users(is_active);

-- Note: Real employee data should be imported using scripts/import-real-employees.js
-- This ensures employee codes match the company's official team roster

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_erp_users_updated_at ON erp_users;
CREATE TRIGGER update_erp_users_updated_at 
  BEFORE UPDATE ON erp_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON erp_users TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE erp_users_id_seq TO your_app_user;

-- Display sample data
SELECT 
  id, 
  username, 
  employee_code, 
  full_name, 
  role, 
  department,
  is_active,
  created_at 
FROM erp_users 
ORDER BY employee_code;

-- ============================================================================
-- Notes:
-- - Admin account hardcoded in code: username='admin', password='Admin@2025'
-- - Employee codes format: GES001, GES002, GES003, ...
-- - Username = lowercase employee_code (ges001, ges002, ...)
-- - Default password format: EMPLOYEE_CODE@2025
-- - Remember to change default passwords after first login!
-- ============================================================================

-- ============================================================================
-- Add password change tracking to erp_users table
-- ============================================================================

-- Add requires_password_change column if it doesn't exist
ALTER TABLE erp_users 
ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT true;

-- Update all existing users to require password change
UPDATE erp_users 
SET requires_password_change = true;

-- Update all passwords to default "1"
UPDATE erp_users 
SET password = '1';

-- Display updated users
SELECT 
  employee_code,
  username,
  full_name,
  role,
  requires_password_change,
  CASE WHEN password = '1' THEN 'Default (1)' ELSE 'Custom' END as password_status
FROM erp_users 
ORDER BY employee_code;

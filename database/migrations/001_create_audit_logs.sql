-- Create audit_logs table for tracking all user actions
-- Run this migration: psql $DATABASE_URL -f database/migrations/001_create_audit_logs.sql

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT
  entity_type VARCHAR(100) NOT NULL, -- lead, project, expense, user, etc.
  entity_id VARCHAR(255), -- ID of the entity affected
  changes JSONB, -- Before/after values for updates
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT, -- Browser/client info
  metadata JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Add comments
COMMENT ON TABLE audit_logs IS 'Audit trail for all user actions in the system';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action: CREATE, UPDATE, DELETE, VIEW, LOGIN, LOGOUT';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (e.g., lead, project, expense)';
COMMENT ON COLUMN audit_logs.entity_id IS 'ID of the specific entity affected';
COMMENT ON COLUMN audit_logs.changes IS 'JSON object with before/after values for updates';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the client';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the client';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context or metadata about the action';

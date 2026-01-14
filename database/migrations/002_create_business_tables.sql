-- Create tables for CRM follow-ups, Finance transactions, and Inventory
-- Run: psql $DATABASE_URL -f database/migrations/002_create_business_tables.sql

-- CRM Follow-ups Table
CREATE TABLE IF NOT EXISTS crm_followups (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER NOT NULL,
  assigned_to VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  type VARCHAR(50) DEFAULT 'task', -- call, email, meeting, task, other
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, cancelled, overdue
  completed_at TIMESTAMP,
  created_by VARCHAR(255) DEFAULT 'system',
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON crm_followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_assigned_to ON crm_followups(assigned_to);
CREATE INDEX IF NOT EXISTS idx_followups_status ON crm_followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_due_date ON crm_followups(due_date);
CREATE INDEX IF NOT EXISTS idx_followups_priority ON crm_followups(priority);

-- Finance Transactions Table
CREATE TABLE IF NOT EXISTS finance_transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- income, expense, transfer
  category VARCHAR(100) DEFAULT 'uncategorized',
  amount DECIMAL(15, 2) NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  reference_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'completed', -- completed, pending, cancelled, deleted
  created_by VARCHAR(255) DEFAULT 'system',
  updated_by VARCHAR(255),
  deleted_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_transactions(type);
CREATE INDEX IF NOT EXISTS idx_finance_category ON finance_transactions(category);
CREATE INDEX IF NOT EXISTS idx_finance_status ON finance_transactions(status);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_finance_reference ON finance_transactions(reference_number);

-- Inventory Items Table
CREATE TABLE IF NOT EXISTS inventory_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) DEFAULT 'uncategorized',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'pcs',
  reorder_level INTEGER DEFAULT 10,
  location VARCHAR(255) DEFAULT 'warehouse',
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
  created_by VARCHAR(255) DEFAULT 'system',
  updated_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  CONSTRAINT check_quantity_non_negative CHECK (quantity >= 0)
);

CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory_items(sku);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_quantity ON inventory_items(quantity);

-- Inventory Movements Log
CREATE TABLE IF NOT EXISTS inventory_movements (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- add, subtract, set
  quantity INTEGER NOT NULL,
  reason TEXT,
  created_by VARCHAR(255) DEFAULT 'system',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inventory_item FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_movements_item_id ON inventory_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON inventory_movements(created_at);

-- ERP Attendance Table (from earlier)
CREATE TABLE IF NOT EXISTS erp_attendance (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  check_in TIMESTAMP NOT NULL,
  check_out TIMESTAMP,
  location_check_in TEXT,
  location_check_out TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON erp_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_check_in ON erp_attendance(check_in);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON erp_attendance(status);

-- Comments
COMMENT ON TABLE crm_followups IS 'Follow-up tasks for CRM leads';
COMMENT ON TABLE finance_transactions IS 'Financial transactions (income, expenses, transfers)';
COMMENT ON TABLE inventory_items IS 'Inventory item master data';
COMMENT ON TABLE inventory_movements IS 'Inventory quantity change history';
COMMENT ON TABLE erp_attendance IS 'Employee attendance check-in/check-out records';

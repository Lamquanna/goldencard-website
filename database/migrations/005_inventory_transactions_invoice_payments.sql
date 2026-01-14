-- Migration: Add Inventory Transactions and Invoice Payments Tables
-- Date: 2026-01-14
-- Description: Creates tables for inventory stock-in/out tracking and invoice payment recording

-- ============================================================================
-- INVENTORY TRANSACTIONS TABLE
-- ============================================================================
-- Tracks all stock-in and stock-out movements with project and user linking

CREATE TABLE IF NOT EXISTS inventory_transactions (
  id SERIAL PRIMARY KEY,
  item_id INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock-in', 'stock-out')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  
  -- Project tracking (required for stock-out, optional for stock-in)
  project_id INTEGER,
  
  -- User who performed the transaction (from JWT)
  user_id VARCHAR(255) NOT NULL,
  
  -- Additional details
  notes TEXT,
  supplier_name VARCHAR(255),  -- For stock-in
  recipient_name VARCHAR(255), -- For stock-out
  reference_number VARCHAR(100), -- PO number, invoice number, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to inventory_items
  CONSTRAINT fk_inventory_item 
    FOREIGN KEY (item_id) 
    REFERENCES inventory_items(id) 
    ON DELETE CASCADE,
  
  -- Foreign key to projects (if projects table exists)
  CONSTRAINT fk_project 
    FOREIGN KEY (project_id) 
    REFERENCES projects(id) 
    ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id 
  ON inventory_transactions(item_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_project_id 
  ON inventory_transactions(project_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type 
  ON inventory_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id 
  ON inventory_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at 
  ON inventory_transactions(created_at DESC);

-- Comment on table
COMMENT ON TABLE inventory_transactions IS 'Tracks all inventory stock-in and stock-out movements with project and user attribution';

-- ============================================================================
-- INVOICE PAYMENTS TABLE
-- ============================================================================
-- Records payment transactions for invoices

CREATE TABLE IF NOT EXISTS invoice_payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL,
  payment_amount DECIMAL(15, 2) NOT NULL CHECK (payment_amount > 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(100),  -- 'bank_transfer', 'cash', 'check', 'credit_card', etc.
  
  -- User who recorded the payment (from JWT)
  recorded_by VARCHAR(255) NOT NULL,
  
  -- Additional details
  notes TEXT,
  transaction_reference VARCHAR(100), -- Bank transaction ID, check number, etc.
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key to erp_invoices
  CONSTRAINT fk_invoice 
    FOREIGN KEY (invoice_id) 
    REFERENCES erp_invoices(id) 
    ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id 
  ON invoice_payments(invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_payment_date 
  ON invoice_payments(payment_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoice_payments_recorded_by 
  ON invoice_payments(recorded_by);

-- Comment on table
COMMENT ON TABLE invoice_payments IS 'Records all payment transactions for invoices with user attribution';

-- ============================================================================
-- UPDATE EXISTING TABLES
-- ============================================================================

-- Add project_id and created_by columns to erp_invoices if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'erp_invoices' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE erp_invoices ADD COLUMN project_id INTEGER;
    ALTER TABLE erp_invoices ADD CONSTRAINT fk_invoice_project 
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'erp_invoices' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE erp_invoices ADD COLUMN created_by VARCHAR(255);
  END IF;
END $$;

-- Add last_stock_update column to inventory_items if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'inventory_items' AND column_name = 'last_stock_update'
  ) THEN
    ALTER TABLE inventory_items ADD COLUMN last_stock_update TIMESTAMP;
  END IF;
END $$;

-- ============================================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert sample inventory transaction
-- INSERT INTO inventory_transactions (
--   item_id, transaction_type, quantity, user_id, notes, supplier_name, reference_number
-- ) VALUES (
--   1, 'stock-in', 100, 'user-123', 'Monthly stock replenishment', 'ABC Suppliers', 'PO-2026-001'
-- );

-- Insert sample payment
-- INSERT INTO invoice_payments (
--   invoice_id, payment_amount, payment_date, payment_method, recorded_by, notes
-- ) VALUES (
--   1, 5000.00, '2026-01-14', 'bank_transfer', 'user-123', 'Payment received via wire transfer'
-- );

-- ============================================================================
-- VIEWS (Optional - for analytics)
-- ============================================================================

-- View for low stock alerts
CREATE OR REPLACE VIEW inventory_low_stock_alerts AS
SELECT 
  i.id,
  i.name,
  i.sku,
  i.quantity,
  i.reorder_level,
  i.unit,
  i.category,
  i.location,
  (i.reorder_level - i.quantity) as deficit,
  i.last_stock_update
FROM inventory_items i
WHERE i.quantity <= i.reorder_level
ORDER BY (i.reorder_level - i.quantity) DESC;

-- View for unpaid invoices
CREATE OR REPLACE VIEW invoices_unpaid AS
SELECT 
  i.id,
  i.invoice_number,
  i.customer_name,
  i.amount,
  i.issue_date,
  i.due_date,
  CASE 
    WHEN i.due_date < CURRENT_DATE THEN 'overdue'
    WHEN i.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'pending'
  END as urgency,
  (CURRENT_DATE - i.due_date) as days_overdue,
  i.project_id
FROM erp_invoices i
WHERE i.status != 'paid'
ORDER BY i.due_date ASC;

-- View for inventory movements by project
CREATE OR REPLACE VIEW inventory_by_project AS
SELECT 
  p.id as project_id,
  p.name as project_name,
  i.id as item_id,
  i.name as item_name,
  i.sku,
  SUM(it.quantity) as total_quantity_used,
  COUNT(it.id) as transaction_count,
  MAX(it.created_at) as last_transaction_date
FROM inventory_transactions it
JOIN inventory_items i ON it.item_id = i.id
LEFT JOIN projects p ON it.project_id = p.id
WHERE it.transaction_type = 'stock-out' AND it.project_id IS NOT NULL
GROUP BY p.id, p.name, i.id, i.name, i.sku
ORDER BY p.name, i.name;

-- ============================================================================
-- ROLLBACK SCRIPT (Run if you need to undo this migration)
-- ============================================================================

-- DROP VIEW IF EXISTS inventory_by_project;
-- DROP VIEW IF EXISTS invoices_unpaid;
-- DROP VIEW IF EXISTS inventory_low_stock_alerts;
-- DROP TABLE IF EXISTS invoice_payments CASCADE;
-- DROP TABLE IF EXISTS inventory_transactions CASCADE;
-- ALTER TABLE erp_invoices DROP COLUMN IF EXISTS project_id;
-- ALTER TABLE erp_invoices DROP COLUMN IF EXISTS created_by;
-- ALTER TABLE inventory_items DROP COLUMN IF EXISTS last_stock_update;

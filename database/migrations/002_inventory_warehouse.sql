-- =====================================================
-- GOLDEN ENERGY CRM - INVENTORY & WAREHOUSE MODULE
-- Inspired by SAP, Zoho Inventory, Odoo ERP
-- =====================================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    tax_id VARCHAR(50),
    payment_terms INTEGER DEFAULT 30, -- Days
    rating DECIMAL(2,1) DEFAULT 0, -- 0-5 stars
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ITEM CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS item_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES item_categories(id),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories for renewable energy
INSERT INTO item_categories (name, code, description) VALUES
    ('Solar Panel', 'SOLAR', 'Photovoltaic solar panels'),
    ('Wind Turbine', 'WIND', 'Wind turbine components'),
    ('Inverter', 'INV', 'Power inverters and converters'),
    ('Battery', 'BAT', 'Energy storage batteries'),
    ('Cable & Wire', 'CABLE', 'Electrical cables and wiring'),
    ('IoT Device', 'IOT', 'Smart sensors and IoT devices'),
    ('Mounting System', 'MOUNT', 'Mounting structures and racks'),
    ('Transformer', 'TRANS', 'Power transformers'),
    ('Switchgear', 'SWITCH', 'Electrical switchgear'),
    ('Spare Parts', 'SPARE', 'Maintenance spare parts'),
    ('Safety Equipment', 'SAFETY', 'PPE and safety gear'),
    ('Tools', 'TOOLS', 'Installation and maintenance tools')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- WAREHOUSES/LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'warehouse' CHECK (type IN ('warehouse', 'office', 'site', 'virtual')),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    manager_id UUID REFERENCES users(id),
    capacity_sqm DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INVENTORY ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    qr_code VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES item_categories(id),
    
    -- Specifications
    brand VARCHAR(100),
    model VARCHAR(100),
    specifications JSONB DEFAULT '{}',
    
    -- Unit & Pricing
    unit VARCHAR(20) DEFAULT 'piece', -- piece, kg, meter, set, etc.
    unit_price DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Stock levels
    opening_stock INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0, -- Reserved for projects
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    min_stock_alert INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 20,
    reorder_qty INTEGER DEFAULT 100,
    
    -- Tracking
    track_serial BOOLEAN DEFAULT FALSE,
    track_lot_batch BOOLEAN DEFAULT TRUE,
    
    -- Default supplier
    default_supplier_id UUID REFERENCES suppliers(id),
    default_warehouse_id UUID REFERENCES warehouses(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    
    -- Media
    image_url VARCHAR(500),
    attachments JSONB DEFAULT '[]',
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ITEM LOT/BATCH TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS item_lots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    lot_number VARCHAR(100) NOT NULL,
    batch_number VARCHAR(100),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Quantities
    quantity INTEGER DEFAULT 0,
    reserved_qty INTEGER DEFAULT 0,
    
    -- Dates
    manufacture_date DATE,
    expiry_date DATE,
    received_date DATE DEFAULT CURRENT_DATE,
    
    -- Cost tracking
    unit_cost DECIMAL(15,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'quarantine', 'expired')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(item_id, lot_number, warehouse_id)
);

-- =====================================================
-- RECEIVERS TABLE (Internal departments, Projects, External)
-- =====================================================
CREATE TABLE IF NOT EXISTS receivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('project', 'department', 'employee', 'external')),
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    project_id UUID REFERENCES projects(id),
    department VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK IN (Goods Receipt)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_in (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'purchase' CHECK (type IN ('purchase', 'return', 'transfer_in', 'adjustment', 'initial')),
    
    -- Source
    supplier_id UUID REFERENCES suppliers(id),
    source_warehouse_id UUID REFERENCES warehouses(id), -- For transfers
    
    -- Destination
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    
    -- Dates
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Documents
    po_number VARCHAR(50),
    invoice_number VARCHAR(50),
    delivery_note VARCHAR(50),
    
    -- Totals
    total_items INTEGER DEFAULT 0,
    total_qty INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    
    -- Status & Approval
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'completed', 'cancelled')),
    
    -- Notes
    notes TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock In Line Items
CREATE TABLE IF NOT EXISTS stock_in_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_in_id UUID NOT NULL REFERENCES stock_in(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    lot_number VARCHAR(100),
    batch_number VARCHAR(100),
    
    -- Quantities
    qty_ordered INTEGER DEFAULT 0,
    qty_received INTEGER NOT NULL,
    qty_rejected INTEGER DEFAULT 0,
    
    -- Pricing
    unit_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (qty_received * unit_cost) STORED,
    
    -- Quality
    quality_status VARCHAR(20) DEFAULT 'passed' CHECK (quality_status IN ('pending', 'passed', 'failed', 'partial')),
    quality_notes TEXT,
    
    -- Dates
    manufacture_date DATE,
    expiry_date DATE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK OUT (Goods Issue)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_out (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'issue' CHECK (type IN ('issue', 'transfer_out', 'disposal', 'adjustment', 'return_supplier')),
    
    -- Source
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    
    -- Destination
    receiver_id UUID REFERENCES receivers(id),
    project_id UUID REFERENCES projects(id),
    dest_warehouse_id UUID REFERENCES warehouses(id), -- For transfers
    
    -- Dates
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    required_date DATE,
    
    -- Request info
    requested_by UUID REFERENCES users(id),
    request_notes TEXT,
    
    -- Totals
    total_items INTEGER DEFAULT 0,
    total_qty INTEGER DEFAULT 0,
    total_value DECIMAL(15,2) DEFAULT 0,
    
    -- Status & Approval (Multi-level approval)
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'processing', 'completed', 'rejected', 'cancelled')),
    approval_level INTEGER DEFAULT 1, -- Current approval level
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Notes
    notes TEXT,
    rejection_reason TEXT,
    attachments JSONB DEFAULT '[]',
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Out Line Items
CREATE TABLE IF NOT EXISTS stock_out_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_out_id UUID NOT NULL REFERENCES stock_out(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    lot_id UUID REFERENCES item_lots(id),
    
    -- Quantities
    qty_requested INTEGER NOT NULL,
    qty_approved INTEGER DEFAULT 0,
    qty_issued INTEGER DEFAULT 0,
    
    -- Pricing (for cost tracking)
    unit_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) GENERATED ALWAYS AS (qty_issued * unit_cost) STORED,
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK APPROVALS (Multi-level approval workflow)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stock_out_id UUID NOT NULL REFERENCES stock_out(id) ON DELETE CASCADE,
    approval_level INTEGER NOT NULL DEFAULT 1,
    
    -- Approver
    approver_id UUID NOT NULL REFERENCES users(id),
    approver_role VARCHAR(50), -- manager, director, warehouse_admin
    
    -- Decision
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
    decision_at TIMESTAMP WITH TIME ZONE,
    
    -- Comments
    comments TEXT,
    
    -- Thresholds (auto-route based on value)
    min_value DECIMAL(15,2) DEFAULT 0,
    max_value DECIMAL(15,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(stock_out_id, approval_level)
);

-- =====================================================
-- STOCK HISTORY (Complete audit trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    warehouse_id UUID REFERENCES warehouses(id),
    lot_id UUID REFERENCES item_lots(id),
    
    -- Movement
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('IN', 'OUT', 'TRANSFER', 'ADJUST', 'RESERVE', 'UNRESERVE')),
    reference_type VARCHAR(50), -- stock_in, stock_out, adjustment, transfer
    reference_id UUID, -- ID of the source document
    reference_no VARCHAR(50),
    
    -- Quantities
    qty_before INTEGER NOT NULL DEFAULT 0,
    qty_change INTEGER NOT NULL, -- Positive for IN, negative for OUT
    qty_after INTEGER NOT NULL,
    
    -- Cost tracking
    unit_cost DECIMAL(15,2) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    
    -- Related entities
    project_id UUID REFERENCES projects(id),
    supplier_id UUID REFERENCES suppliers(id),
    
    -- Notes
    notes TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STOCK RESERVATIONS (For projects/orders)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    lot_id UUID REFERENCES item_lots(id),
    warehouse_id UUID REFERENCES warehouses(id),
    
    -- Reservation details
    qty_reserved INTEGER NOT NULL,
    project_id UUID REFERENCES projects(id),
    task_id UUID REFERENCES tasks(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),
    
    -- Dates
    reserved_until DATE,
    
    -- Audit
    reserved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- STOCK ADJUSTMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id),
    
    -- Type
    adjustment_type VARCHAR(50) NOT NULL CHECK (adjustment_type IN ('count', 'damage', 'theft', 'correction', 'write_off')),
    
    -- Reason
    reason TEXT NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'completed', 'rejected')),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stock_adjustment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    adjustment_id UUID NOT NULL REFERENCES stock_adjustments(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    lot_id UUID REFERENCES item_lots(id),
    
    qty_system INTEGER NOT NULL, -- System count
    qty_actual INTEGER NOT NULL, -- Physical count
    qty_difference INTEGER GENERATED ALWAYS AS (qty_actual - qty_system) STORED,
    
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(default_supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_warehouse ON inventory_items(default_warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_code ON inventory_items(code);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_inventory_items_stock_alert ON inventory_items(current_stock, min_stock_alert) WHERE current_stock <= min_stock_alert;

CREATE INDEX IF NOT EXISTS idx_item_lots_item ON item_lots(item_id);
CREATE INDEX IF NOT EXISTS idx_item_lots_warehouse ON item_lots(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_item_lots_lot_number ON item_lots(lot_number);

CREATE INDEX IF NOT EXISTS idx_stock_in_warehouse ON stock_in(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_supplier ON stock_in(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_status ON stock_in(status);
CREATE INDEX IF NOT EXISTS idx_stock_in_date ON stock_in(receipt_date);

CREATE INDEX IF NOT EXISTS idx_stock_out_warehouse ON stock_out(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_project ON stock_out(project_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_status ON stock_out(status);
CREATE INDEX IF NOT EXISTS idx_stock_out_date ON stock_out(issue_date);

CREATE INDEX IF NOT EXISTS idx_stock_history_item ON stock_history(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_warehouse ON stock_history(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_type ON stock_history(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON stock_history(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_history_project ON stock_history(project_id);

-- =====================================================
-- TRIGGERS FOR STOCK MANAGEMENT
-- =====================================================

-- Function to update item stock on stock_in completion
CREATE OR REPLACE FUNCTION update_stock_on_receipt()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update item current_stock
        UPDATE inventory_items 
        SET current_stock = current_stock + (
            SELECT COALESCE(SUM(qty_received - qty_rejected), 0)
            FROM stock_in_items 
            WHERE stock_in_id = NEW.id AND item_id = inventory_items.id
        ),
        updated_at = NOW()
        WHERE id IN (SELECT item_id FROM stock_in_items WHERE stock_in_id = NEW.id);
        
        -- Create stock history records
        INSERT INTO stock_history (item_id, warehouse_id, movement_type, reference_type, reference_id, reference_no, qty_before, qty_change, qty_after, created_by)
        SELECT 
            sii.item_id,
            NEW.warehouse_id,
            'IN',
            'stock_in',
            NEW.id,
            NEW.reference_no,
            ii.current_stock - (sii.qty_received - sii.qty_rejected),
            sii.qty_received - sii.qty_rejected,
            ii.current_stock,
            NEW.completed_by
        FROM stock_in_items sii
        JOIN inventory_items ii ON ii.id = sii.item_id
        WHERE sii.stock_in_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_in_complete
    AFTER UPDATE ON stock_in
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_receipt();

-- Function to prevent negative stock
CREATE OR REPLACE FUNCTION check_stock_availability()
RETURNS TRIGGER AS $$
DECLARE
    available INTEGER;
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Check each item
        FOR rec IN SELECT item_id, SUM(qty_issued) as total_issued 
                   FROM stock_out_items 
                   WHERE stock_out_id = NEW.id 
                   GROUP BY item_id
        LOOP
            SELECT current_stock - reserved_stock INTO available
            FROM inventory_items WHERE id = rec.item_id;
            
            IF available < rec.total_issued THEN
                RAISE EXCEPTION 'Insufficient stock for item %. Available: %, Requested: %', 
                    rec.item_id, available, rec.total_issued;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_stock_before_issue
    BEFORE UPDATE ON stock_out
    FOR EACH ROW
    EXECUTE FUNCTION check_stock_availability();

-- Function to update stock on issue completion
CREATE OR REPLACE FUNCTION update_stock_on_issue()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update item current_stock
        UPDATE inventory_items 
        SET current_stock = current_stock - (
            SELECT COALESCE(SUM(qty_issued), 0)
            FROM stock_out_items 
            WHERE stock_out_id = NEW.id AND item_id = inventory_items.id
        ),
        updated_at = NOW()
        WHERE id IN (SELECT item_id FROM stock_out_items WHERE stock_out_id = NEW.id);
        
        -- Create stock history records
        INSERT INTO stock_history (item_id, warehouse_id, movement_type, reference_type, reference_id, reference_no, qty_before, qty_change, qty_after, project_id, created_by)
        SELECT 
            soi.item_id,
            NEW.warehouse_id,
            'OUT',
            'stock_out',
            NEW.id,
            NEW.reference_no,
            ii.current_stock + soi.qty_issued,
            -soi.qty_issued,
            ii.current_stock,
            NEW.project_id,
            NEW.created_by
        FROM stock_out_items soi
        JOIN inventory_items ii ON ii.id = soi.item_id
        WHERE soi.stock_out_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stock_out_complete
    AFTER UPDATE ON stock_out
    FOR EACH ROW
    EXECUTE FUNCTION update_stock_on_issue();

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- Stock levels view with alerts
CREATE OR REPLACE VIEW v_stock_levels AS
SELECT 
    i.id,
    i.code,
    i.name,
    c.name as category,
    i.unit,
    i.current_stock,
    i.reserved_stock,
    i.available_stock,
    i.min_stock_alert,
    i.reorder_point,
    CASE 
        WHEN i.current_stock <= 0 THEN 'out_of_stock'
        WHEN i.current_stock <= i.min_stock_alert THEN 'critical'
        WHEN i.current_stock <= i.reorder_point THEN 'low'
        ELSE 'normal'
    END as stock_status,
    i.unit_price,
    (i.current_stock * i.unit_price) as stock_value
FROM inventory_items i
LEFT JOIN item_categories c ON c.id = i.category_id
WHERE i.status = 'active';

-- Stock movement summary view
CREATE OR REPLACE VIEW v_stock_movement_summary AS
SELECT 
    i.id as item_id,
    i.code,
    i.name,
    DATE_TRUNC('month', sh.created_at) as month,
    SUM(CASE WHEN sh.movement_type = 'IN' THEN sh.qty_change ELSE 0 END) as total_in,
    SUM(CASE WHEN sh.movement_type = 'OUT' THEN ABS(sh.qty_change) ELSE 0 END) as total_out,
    SUM(sh.qty_change) as net_change
FROM inventory_items i
LEFT JOIN stock_history sh ON sh.item_id = i.id
GROUP BY i.id, i.code, i.name, DATE_TRUNC('month', sh.created_at);

-- Pending approvals view
CREATE OR REPLACE VIEW v_pending_stock_approvals AS
SELECT 
    so.id as stock_out_id,
    so.reference_no,
    so.type,
    so.total_qty,
    so.total_value,
    so.priority,
    so.status,
    so.created_at,
    u.username as requested_by,
    p.name as project_name,
    w.name as warehouse_name,
    sa.approver_id,
    sa.approval_level
FROM stock_out so
JOIN stock_approvals sa ON sa.stock_out_id = so.id AND sa.status = 'pending'
LEFT JOIN users u ON u.id = so.created_by
LEFT JOIN projects p ON p.id = so.project_id
LEFT JOIN warehouses w ON w.id = so.warehouse_id
WHERE so.status = 'pending_approval';

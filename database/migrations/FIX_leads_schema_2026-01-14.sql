-- =============================================================================
-- FIX SCRIPT: Resolve Database Schema Conflicts
-- Date: 2026-01-14
-- Issues Fixed:
-- 1. Multiple conflicting leads table definitions
-- 2. Missing company_name column in production
-- 3. Inconsistent schema between migration and runtime creation
-- =============================================================================

-- Drop the incorrect leads table created by API ensureLeadsTable()
DROP TABLE IF EXISTS leads CASCADE;

-- Recreate leads table with correct schema from migration 005
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    lead_number VARCHAR(20) UNIQUE,
    title VARCHAR(10) CHECK (title IN ('Mr', 'Mrs', 'Ms', 'Dr', 'Prof')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200) GENERATED ALWAYS AS (
        COALESCE(title || ' ', '') || COALESCE(first_name || ' ', '') || COALESCE(last_name, '')
    ) STORED,
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    mobile VARCHAR(20),
    whatsapp VARCHAR(20),
    zalo VARCHAR(20),
    
    -- Company
    company_name VARCHAR(255),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    job_title VARCHAR(100),
    website VARCHAR(255),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Vietnam',
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Classification
    source VARCHAR(100) DEFAULT 'manual',
    source_detail TEXT,
    stage VARCHAR(50) DEFAULT 'new',
    
    -- Interest
    product_interest JSONB DEFAULT '[]',
    project_type VARCHAR(50),
    estimated_capacity DECIMAL(10,2),
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Scoring
    lead_score INTEGER DEFAULT 0,
    score_breakdown JSONB DEFAULT '{}',
    temperature VARCHAR(20) DEFAULT 'warm' CHECK (temperature IN ('cold', 'warm', 'hot')),
    
    -- Tracking
    status VARCHAR(50) DEFAULT 'new',
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to VARCHAR(50),
    
    -- Notes
    description TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    last_contacted_at TIMESTAMP,
    next_follow_up TIMESTAMP,
    
    -- Soft delete
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_deleted ON leads(deleted_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS leads_updated_at_trigger ON leads;
CREATE TRIGGER leads_updated_at_trigger
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_leads_updated_at();

-- Generate lead_number automatically
CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part VARCHAR(4);
    seq_num INTEGER;
    new_number VARCHAR(20);
BEGIN
    IF NEW.lead_number IS NULL THEN
        year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(lead_number FROM 9) AS INTEGER)), 0) + 1
        INTO seq_num
        FROM leads
        WHERE lead_number LIKE 'LD-' || year_part || '-%';
        
        new_number := 'LD-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
        NEW.lead_number := new_number;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lead_number_trigger ON leads;
CREATE TRIGGER lead_number_trigger
    BEFORE INSERT ON leads
    FOR EACH ROW
    EXECUTE FUNCTION generate_lead_number();

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'leads'
ORDER BY ordinal_position;

COMMENT ON TABLE leads IS 'Fixed schema - matches migration 005_leads_crm.sql';

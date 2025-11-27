-- =====================================================
-- GOLDEN ENERGY CRM - ENHANCED LEADS & CRM MODULE
-- Inspired by HubSpot, Salesforce, Zoho CRM
-- =====================================================

-- =====================================================
-- LEAD SOURCES
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50), -- Icon name (heroicons, lucide, etc.)
    color VARCHAR(7) DEFAULT '#3B82F6',
    category VARCHAR(50), -- online, offline, referral, partner
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default sources with icons
INSERT INTO lead_sources (code, name, icon, color, category, sort_order) VALUES
    ('WEBSITE', 'Website', 'globe', '#3B82F6', 'online', 1),
    ('FACEBOOK', 'Facebook', 'facebook', '#1877F2', 'online', 2),
    ('LINKEDIN', 'LinkedIn', 'linkedin', '#0A66C2', 'online', 3),
    ('GOOGLE_ADS', 'Google Ads', 'search', '#EA4335', 'online', 4),
    ('INSTAGRAM', 'Instagram', 'instagram', '#E4405F', 'online', 5),
    ('YOUTUBE', 'YouTube', 'youtube', '#FF0000', 'online', 6),
    ('TIKTOK', 'TikTok', 'music', '#000000', 'online', 7),
    ('ZALO', 'Zalo', 'message-circle', '#0068FF', 'online', 8),
    ('REFERRAL', 'Referral', 'users', '#10B981', 'referral', 10),
    ('PARTNER', 'Partner', 'handshake', '#8B5CF6', 'partner', 11),
    ('EVENT', 'Event/Exhibition', 'calendar', '#F59E0B', 'offline', 12),
    ('COLD_CALL', 'Cold Call', 'phone-outgoing', '#6B7280', 'offline', 13),
    ('WALK_IN', 'Walk-in', 'door-open', '#14B8A6', 'offline', 14),
    ('EMAIL_CAMPAIGN', 'Email Campaign', 'mail', '#EC4899', 'online', 15),
    ('NEWSPAPER', 'Newspaper/Print', 'newspaper', '#78716C', 'offline', 16)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- LEAD STAGES (Funnel stages)
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    probability INTEGER DEFAULT 0, -- % chance to close
    is_won BOOLEAN DEFAULT FALSE,
    is_lost BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert funnel stages
INSERT INTO lead_stages (code, name, color, sort_order, probability, is_won, is_lost) VALUES
    ('NEW', 'New Lead', '#9CA3AF', 1, 10, false, false),
    ('CONTACTED', 'Contacted', '#3B82F6', 2, 20, false, false),
    ('QUALIFIED', 'Qualified', '#8B5CF6', 3, 40, false, false),
    ('PROPOSAL', 'Proposal Sent', '#F59E0B', 4, 60, false, false),
    ('NEGOTIATION', 'Negotiation', '#F97316', 5, 80, false, false),
    ('WON', 'Won', '#10B981', 6, 100, true, false),
    ('LOST', 'Lost', '#EF4444', 7, 0, false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- ENHANCED LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic info
    lead_number VARCHAR(20) UNIQUE, -- Auto-generated: LD-2024-0001
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
    company_size VARCHAR(50), -- 1-10, 11-50, 51-200, 201-500, 500+
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
    source_id UUID REFERENCES lead_sources(id),
    source_detail TEXT, -- Additional source info (campaign name, referrer, etc.)
    stage_id UUID REFERENCES lead_stages(id),
    
    -- Interest
    product_interest JSONB DEFAULT '[]', -- Array of product/service interests
    project_type VARCHAR(50), -- solar, wind, epc, hybrid
    estimated_capacity DECIMAL(10,2), -- kW/MW
    estimated_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Scoring
    lead_score INTEGER DEFAULT 0, -- 0-100
    score_breakdown JSONB DEFAULT '{}', -- How score was calculated
    temperature VARCHAR(20) DEFAULT 'warm' CHECK (temperature IN ('cold', 'warm', 'hot')),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    assignment_method VARCHAR(50), -- manual, round_robin, auto, load_balanced
    
    -- Team (for team-based selling)
    team_id UUID,
    secondary_owner_id UUID REFERENCES users(id),
    
    -- Engagement tracking
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    next_follow_up DATE,
    total_activities INTEGER DEFAULT 0,
    total_emails INTEGER DEFAULT 0,
    total_calls INTEGER DEFAULT 0,
    total_meetings INTEGER DEFAULT 0,
    
    -- Conversion
    converted_at TIMESTAMP WITH TIME ZONE,
    converted_to_project_id UUID REFERENCES projects(id),
    converted_to_customer_id UUID,
    conversion_notes TEXT,
    
    -- Lost reason
    lost_reason VARCHAR(100),
    lost_to_competitor VARCHAR(255),
    lost_notes TEXT,
    
    -- Tags
    tags JSONB DEFAULT '[]',
    
    -- Custom fields
    custom_fields JSONB DEFAULT '{}',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'converted', 'lost', 'duplicate')),
    do_not_contact BOOLEAN DEFAULT FALSE,
    do_not_email BOOLEAN DEFAULT FALSE,
    
    -- UTM tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    landing_page VARCHAR(500),
    referrer_url VARCHAR(500),
    
    -- Notes
    description TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-generate lead number
CREATE OR REPLACE FUNCTION generate_lead_number()
RETURNS TRIGGER AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
BEGIN
    year_part := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(lead_number FROM 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM leads
    WHERE lead_number LIKE 'LD-' || year_part || '-%';
    
    NEW.lead_number := 'LD-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_lead_number
    BEFORE INSERT ON leads
    FOR EACH ROW
    WHEN (NEW.lead_number IS NULL)
    EXECUTE FUNCTION generate_lead_number();

-- =====================================================
-- LEAD ACTIVITIES/TIMELINE
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity type
    type VARCHAR(50) NOT NULL, -- call, email, meeting, note, task, stage_change, etc.
    subtype VARCHAR(50), -- inbound, outbound, scheduled, etc.
    
    -- Details
    subject VARCHAR(255),
    description TEXT,
    
    -- For calls
    call_duration INTEGER, -- seconds
    call_outcome VARCHAR(50), -- connected, voicemail, no_answer, busy
    call_recording_url VARCHAR(500),
    
    -- For emails
    email_subject VARCHAR(255),
    email_opened BOOLEAN DEFAULT FALSE,
    email_clicked BOOLEAN DEFAULT FALSE,
    email_replied BOOLEAN DEFAULT FALSE,
    
    -- For meetings
    meeting_location VARCHAR(255),
    meeting_start TIMESTAMP WITH TIME ZONE,
    meeting_end TIMESTAMP WITH TIME ZONE,
    meeting_type VARCHAR(50), -- in_person, video, phone
    attendees JSONB DEFAULT '[]',
    
    -- For stage changes
    from_stage_id UUID REFERENCES lead_stages(id),
    to_stage_id UUID REFERENCES lead_stages(id),
    
    -- Related entities
    task_id UUID REFERENCES tasks(id),
    
    -- Outcome
    outcome VARCHAR(100),
    next_steps TEXT,
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LEAD SCORING RULES
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Condition
    field VARCHAR(100) NOT NULL, -- company_size, industry, source, etc.
    operator VARCHAR(20) NOT NULL, -- equals, contains, greater_than, etc.
    value TEXT,
    
    -- Points
    points INTEGER NOT NULL, -- Can be negative
    
    -- Category
    category VARCHAR(50), -- demographic, behavioral, engagement
    
    -- Priority (for ordering)
    priority INTEGER DEFAULT 50,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default scoring rules
INSERT INTO lead_scoring_rules (name, field, operator, value, points, category) VALUES
    ('Large Company', 'company_size', 'equals', '500+', 20, 'demographic'),
    ('Medium Company', 'company_size', 'equals', '201-500', 15, 'demographic'),
    ('Solar Interest', 'product_interest', 'contains', 'solar', 10, 'demographic'),
    ('High Capacity (>100kW)', 'estimated_capacity', 'greater_than', '100', 25, 'demographic'),
    ('Website Source', 'source_code', 'equals', 'WEBSITE', 5, 'demographic'),
    ('Referral Source', 'source_code', 'equals', 'REFERRAL', 15, 'demographic'),
    ('Has Email', 'email', 'is_not_empty', NULL, 5, 'demographic'),
    ('Has Phone', 'phone', 'is_not_empty', NULL, 5, 'demographic'),
    ('Email Opened', 'email_opened', 'equals', 'true', 10, 'engagement'),
    ('Form Submitted', 'form_submitted', 'equals', 'true', 15, 'behavioral')
ON CONFLICT DO NOTHING;

-- =====================================================
-- LEAD IMPORT QUEUE
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Import details
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500),
    file_type VARCHAR(20), -- csv, xlsx, json
    
    -- Mapping
    field_mapping JSONB NOT NULL, -- How file columns map to lead fields
    
    -- Settings
    duplicate_handling VARCHAR(20) DEFAULT 'skip', -- skip, update, create_new
    default_values JSONB DEFAULT '{}',
    auto_assign BOOLEAN DEFAULT FALSE,
    assign_to UUID REFERENCES users(id),
    
    -- Stats
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    duplicate_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Errors
    errors JSONB DEFAULT '[]',
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- LEAD ASSIGNMENT RULES (Round Robin, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_assignment_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Method
    method VARCHAR(50) NOT NULL, -- round_robin, load_balanced, by_territory, by_skill
    
    -- Conditions (when this rule applies)
    conditions JSONB DEFAULT '[]',
    
    -- Team members in rotation
    team_members JSONB NOT NULL, -- Array of user_ids
    current_index INTEGER DEFAULT 0, -- For round robin
    
    -- Load balancing settings
    max_leads_per_user INTEGER DEFAULT 50,
    consider_active_only BOOLEAN DEFAULT TRUE,
    
    -- Priority
    priority INTEGER DEFAULT 50,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_name);
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads(city, province);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_follow_up ON leads(next_follow_up) WHERE next_follow_up IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_type ON lead_activities(type);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created ON lead_activities(created_at);

-- Full text search on leads
CREATE INDEX IF NOT EXISTS idx_leads_search ON leads USING gin(
    to_tsvector('simple', 
        COALESCE(first_name, '') || ' ' || 
        COALESCE(last_name, '') || ' ' || 
        COALESCE(company_name, '') || ' ' ||
        COALESCE(email, '') || ' ' ||
        COALESCE(phone, '')
    )
);

-- =====================================================
-- VIEWS
-- =====================================================

-- Lead funnel view
CREATE OR REPLACE VIEW v_lead_funnel AS
SELECT 
    s.code as stage_code,
    s.name as stage_name,
    s.color,
    s.sort_order,
    s.probability,
    COUNT(l.id) as lead_count,
    COALESCE(SUM(l.estimated_value), 0) as total_value,
    COALESCE(AVG(l.lead_score), 0) as avg_score
FROM lead_stages s
LEFT JOIN leads l ON l.stage_id = s.id AND l.status = 'active'
GROUP BY s.id, s.code, s.name, s.color, s.sort_order, s.probability
ORDER BY s.sort_order;

-- Lead source performance
CREATE OR REPLACE VIEW v_lead_source_performance AS
SELECT 
    ls.code as source_code,
    ls.name as source_name,
    ls.icon,
    ls.color,
    COUNT(l.id) as total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted_count,
    ROUND(100.0 * COUNT(l.id) FILTER (WHERE l.status = 'converted') / NULLIF(COUNT(l.id), 0), 2) as conversion_rate,
    COALESCE(SUM(l.estimated_value), 0) as total_value,
    COALESCE(AVG(l.lead_score), 0) as avg_score
FROM lead_sources ls
LEFT JOIN leads l ON l.source_id = ls.id
GROUP BY ls.id, ls.code, ls.name, ls.icon, ls.color
ORDER BY total_leads DESC;

-- User lead performance
CREATE OR REPLACE VIEW v_user_lead_performance AS
SELECT 
    u.id as user_id,
    u.username,
    u.full_name,
    COUNT(l.id) as total_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'active') as active_leads,
    COUNT(l.id) FILTER (WHERE l.status = 'converted') as converted_leads,
    ROUND(100.0 * COUNT(l.id) FILTER (WHERE l.status = 'converted') / NULLIF(COUNT(l.id), 0), 2) as conversion_rate,
    COALESCE(SUM(l.estimated_value) FILTER (WHERE l.status = 'converted'), 0) as total_converted_value,
    COUNT(l.id) FILTER (WHERE l.next_follow_up = CURRENT_DATE) as follow_ups_today,
    COUNT(l.id) FILTER (WHERE l.next_follow_up < CURRENT_DATE) as overdue_follow_ups
FROM users u
LEFT JOIN leads l ON l.assigned_to = u.id
WHERE u.role IN ('sales', 'admin', 'manager')
GROUP BY u.id, u.username, u.full_name;

-- =====================================================
-- TRIGGERS FOR LEAD AUTOMATION
-- =====================================================

-- Update lead score on activity
CREATE OR REPLACE FUNCTION update_lead_activity_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE leads
    SET 
        total_activities = total_activities + 1,
        total_emails = total_emails + CASE WHEN NEW.type = 'email' THEN 1 ELSE 0 END,
        total_calls = total_calls + CASE WHEN NEW.type = 'call' THEN 1 ELSE 0 END,
        total_meetings = total_meetings + CASE WHEN NEW.type = 'meeting' THEN 1 ELSE 0 END,
        last_activity_at = NOW(),
        last_contacted_at = CASE 
            WHEN NEW.type IN ('call', 'email', 'meeting') THEN NOW()
            ELSE last_contacted_at
        END,
        updated_at = NOW()
    WHERE id = NEW.lead_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_activity
    AFTER INSERT ON lead_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_activity_counts();

-- Auto-update temperature based on score
CREATE OR REPLACE FUNCTION update_lead_temperature()
RETURNS TRIGGER AS $$
BEGIN
    NEW.temperature := CASE
        WHEN NEW.lead_score >= 70 THEN 'hot'
        WHEN NEW.lead_score >= 40 THEN 'warm'
        ELSE 'cold'
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_temperature
    BEFORE INSERT OR UPDATE OF lead_score ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_lead_temperature();

-- =====================================================
-- GOLDEN ENERGY CRM - ENHANCED PROJECTS & TASKS
-- Inspired by Monday.com, Asana, ClickUp, Jira
-- =====================================================

-- =====================================================
-- PROJECT CATEGORIES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories for renewable energy
INSERT INTO project_categories (code, name, icon, color, sort_order) VALUES
    ('SOLAR_RES', 'Solar - Residential', 'home', '#F59E0B', 1),
    ('SOLAR_COM', 'Solar - Commercial', 'building-2', '#F97316', 2),
    ('SOLAR_IND', 'Solar - Industrial', 'factory', '#EF4444', 3),
    ('SOLAR_FARM', 'Solar Farm', 'sun', '#FBBF24', 4),
    ('WIND_ONSHORE', 'Wind - Onshore', 'wind', '#06B6D4', 5),
    ('WIND_OFFSHORE', 'Wind - Offshore', 'waves', '#0891B2', 6),
    ('HYBRID', 'Hybrid System', 'zap', '#8B5CF6', 7),
    ('BESS', 'Battery Storage (BESS)', 'battery-charging', '#10B981', 8),
    ('EPC', 'EPC Project', 'hard-hat', '#6366F1', 9),
    ('OM', 'O&M Contract', 'wrench', '#64748B', 10),
    ('CONSULTING', 'Consulting', 'clipboard-list', '#EC4899', 11)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PROJECT PHASES/STAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES project_categories(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    default_days INTEGER DEFAULT 14, -- Expected duration
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category_id, code)
);

-- Insert default phases for Solar projects
INSERT INTO project_phases (category_id, code, name, sort_order, default_days, is_milestone) VALUES
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'INIT', 'Initiation', 1, 7, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'SURVEY', 'Site Survey', 2, 3, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'DESIGN', 'System Design', 3, 7, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'APPROVE', 'Design Approval', 4, 5, true),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'PROCURE', 'Procurement', 5, 14, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'INSTALL', 'Installation', 6, 14, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'CONNECT', 'Grid Connection', 7, 7, false),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'COMMISS', 'Commissioning', 8, 3, true),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'HANDOVER', 'Handover', 9, 2, true),
    ((SELECT id FROM project_categories WHERE code = 'SOLAR_COM'), 'WARRANTY', 'Warranty Period', 10, 365, false)
ON CONFLICT (category_id, code) DO NOTHING;

-- =====================================================
-- ENHANCED PROJECTS TABLE
-- =====================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_number VARCHAR(20) UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES project_categories(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS current_phase_id UUID REFERENCES project_phases(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS customer_id UUID;

-- System specs
ALTER TABLE projects ADD COLUMN IF NOT EXISTS system_capacity_kw DECIMAL(10,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS annual_production_kwh DECIMAL(15,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS co2_reduction_tons DECIMAL(10,2);

-- Financials
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(15,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(15,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'VND';

-- Timeline
ALTER TABLE projects ADD COLUMN IF NOT EXISTS planned_start DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS planned_end DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_start DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS actual_end DATE;

-- Progress
ALTER TABLE projects ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_status VARCHAR(20) DEFAULT 'on_track';

-- Location
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_address TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_city VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_province VARCHAR(100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_country VARCHAR(100) DEFAULT 'Vietnam';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_latitude DECIMAL(10, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS site_longitude DECIMAL(11, 8);

-- Team
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager_id UUID REFERENCES users(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';

-- Documents
ALTER TABLE projects ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image VARCHAR(500);

-- Custom fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';

-- =====================================================
-- PROJECT MILESTONES
-- =====================================================
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dates
    planned_date DATE NOT NULL,
    actual_date DATE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
    
    -- Dependencies
    depends_on_id UUID REFERENCES project_milestones(id),
    
    -- Deliverables
    deliverables JSONB DEFAULT '[]',
    
    -- Completion
    completed_by UUID REFERENCES users(id),
    completion_notes TEXT,
    
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT RISK LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS project_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Risk identification
    risk_number VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- technical, financial, schedule, resource, external
    
    -- Assessment
    probability VARCHAR(20) DEFAULT 'medium' CHECK (probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    impact VARCHAR(20) DEFAULT 'medium' CHECK (impact IN ('very_low', 'low', 'medium', 'high', 'very_high')),
    risk_score INTEGER GENERATED ALWAYS AS (
        CASE probability 
            WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 
            WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 ELSE 3 
        END *
        CASE impact 
            WHEN 'very_low' THEN 1 WHEN 'low' THEN 2 WHEN 'medium' THEN 3 
            WHEN 'high' THEN 4 WHEN 'very_high' THEN 5 ELSE 3 
        END
    ) STORED,
    
    -- Mitigation
    mitigation_strategy TEXT,
    contingency_plan TEXT,
    
    -- Owner
    risk_owner_id UUID REFERENCES users(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'mitigating', 'monitoring', 'occurred', 'closed')),
    
    -- Response if occurred
    occurred_at TIMESTAMP WITH TIME ZONE,
    actual_impact TEXT,
    lessons_learned TEXT,
    
    -- Audit
    identified_by UUID REFERENCES users(id),
    identified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT DOCUMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Document info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER, -- bytes
    
    -- Classification
    category VARCHAR(50), -- contract, design, permit, report, photo, other
    version VARCHAR(20) DEFAULT '1.0',
    
    -- Tags
    tags JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived', 'superseded')),
    
    -- Audit
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED TASKS TABLE
-- =====================================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_number VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS milestone_id UUID REFERENCES project_milestones(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id);

-- Timing
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(6,2);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS actual_hours DECIMAL(6,2) DEFAULT 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date DATE;

-- Progress
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

-- Dependencies
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blockers JSONB DEFAULT '[]';

-- SLA
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sla_id UUID REFERENCES sla_definitions(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS sla_status VARCHAR(20) DEFAULT 'none';

-- Checklist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';
/* Example:
[
    {"id": "uuid", "text": "Check item 1", "completed": true},
    {"id": "uuid", "text": "Check item 2", "completed": false}
]
*/

-- Tags and custom fields
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Team
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS watchers JSONB DEFAULT '[]';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS collaborators JSONB DEFAULT '[]';

-- =====================================================
-- TASK TIME ENTRIES
-- =====================================================
CREATE TABLE IF NOT EXISTS task_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Time
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    
    -- Description
    description TEXT,
    
    -- Billable
    is_billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TASK COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES task_comments(id), -- For threaded comments
    
    content TEXT NOT NULL,
    
    -- Mentions
    mentions JSONB DEFAULT '[]', -- Array of user IDs mentioned
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    -- Reactions
    reactions JSONB DEFAULT '{}', -- {"👍": ["user_id1", "user_id2"], "❤️": ["user_id3"]}
    
    -- Edit tracking
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT/TASK VIEWS (Kanban, Gantt, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- NULL = shared view
    
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('kanban', 'list', 'gantt', 'calendar', 'timeline')),
    
    -- Configuration
    config JSONB DEFAULT '{}',
    /* Example for Kanban:
    {
        "group_by": "status",
        "columns": ["todo", "in_progress", "review", "done"],
        "filters": [...],
        "sort": {"field": "priority", "direction": "desc"}
    }
    */
    
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PROJECT MATERIAL USAGE (Links to Inventory)
-- =====================================================
CREATE TABLE IF NOT EXISTS project_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id),
    
    -- Item
    item_id UUID NOT NULL REFERENCES inventory_items(id),
    
    -- Quantities
    qty_planned INTEGER NOT NULL DEFAULT 0,
    qty_issued INTEGER DEFAULT 0,
    qty_used INTEGER DEFAULT 0,
    qty_returned INTEGER DEFAULT 0,
    
    -- Linked stock transactions
    stock_out_id UUID REFERENCES stock_out(id),
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(project_id, item_id, task_id)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category_id);
CREATE INDEX IF NOT EXISTS idx_projects_phase ON projects(current_phase_id);
CREATE INDEX IF NOT EXISTS idx_projects_manager ON projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_health ON projects(health_status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON projects(planned_start, planned_end);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(site_city, site_province);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON project_milestones(planned_date);

CREATE INDEX IF NOT EXISTS idx_risks_project ON project_risks(project_id);
CREATE INDEX IF NOT EXISTS idx_risks_status ON project_risks(status);
CREATE INDEX IF NOT EXISTS idx_risks_score ON project_risks(risk_score DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sla ON tasks(sla_due_at) WHERE sla_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_time_entries_task ON task_time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON task_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON task_time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_comments_task ON task_comments(task_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- Project dashboard summary
CREATE OR REPLACE VIEW v_project_summary AS
SELECT 
    p.id,
    p.name,
    p.project_number,
    pc.name as category,
    pc.color as category_color,
    pp.name as current_phase,
    p.status,
    p.health_status,
    p.progress_percent,
    p.planned_start,
    p.planned_end,
    p.actual_start,
    p.budget,
    p.actual_cost,
    u.full_name as project_manager,
    p.site_city,
    p.site_province,
    p.system_capacity_kw,
    -- Calculated fields
    (p.planned_end - CURRENT_DATE) as days_remaining,
    CASE 
        WHEN p.actual_end IS NOT NULL THEN 0
        WHEN p.planned_end < CURRENT_DATE THEN (CURRENT_DATE - p.planned_end)
        ELSE 0
    END as days_overdue,
    -- Counts
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) as total_tasks,
    (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') as completed_tasks,
    (SELECT COUNT(*) FROM project_risks r WHERE r.project_id = p.id AND r.status = 'open') as open_risks,
    (SELECT COUNT(*) FROM project_milestones m WHERE m.project_id = p.id AND m.status = 'completed') as completed_milestones,
    (SELECT COUNT(*) FROM project_milestones m WHERE m.project_id = p.id) as total_milestones
FROM projects p
LEFT JOIN project_categories pc ON pc.id = p.category_id
LEFT JOIN project_phases pp ON pp.id = p.current_phase_id
LEFT JOIN users u ON u.id = p.project_manager_id;

-- Task board view (for Kanban)
CREATE OR REPLACE VIEW v_task_board AS
SELECT 
    t.id,
    t.task_number,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.start_date,
    t.end_date,
    t.progress_percent,
    t.estimated_hours,
    t.actual_hours,
    t.sla_status,
    t.sla_due_at,
    t.checklist,
    t.tags,
    p.id as project_id,
    p.name as project_name,
    p.project_number,
    u.id as assignee_id,
    u.full_name as assignee_name,
    u.avatar_url as assignee_avatar,
    m.name as milestone_name,
    -- Calculated
    CASE 
        WHEN t.due_date IS NULL THEN 'no_date'
        WHEN t.due_date < CURRENT_DATE AND t.status != 'completed' THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'due_today'
        WHEN t.due_date = CURRENT_DATE + 1 THEN 'due_tomorrow'
        WHEN t.due_date <= CURRENT_DATE + 7 THEN 'due_this_week'
        ELSE 'future'
    END as due_status,
    (SELECT COUNT(*) FROM task_comments tc WHERE tc.task_id = t.id) as comment_count,
    (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'name', c.full_name, 'avatar', c.avatar_url))
     FROM users c WHERE c.id::text = ANY(ARRAY(SELECT jsonb_array_elements_text(t.collaborators)))) as collaborators_info
FROM tasks t
LEFT JOIN projects p ON p.id = t.project_id
LEFT JOIN users u ON u.id = t.assigned_to
LEFT JOIN project_milestones m ON m.id = t.milestone_id;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-generate task number
CREATE OR REPLACE FUNCTION generate_task_number()
RETURNS TRIGGER AS $$
DECLARE
    project_code TEXT;
    sequence_num INTEGER;
BEGIN
    IF NEW.project_id IS NOT NULL THEN
        SELECT COALESCE(project_number, 'PRJ') INTO project_code FROM projects WHERE id = NEW.project_id;
        
        SELECT COALESCE(MAX(CAST(SUBSTRING(task_number FROM LENGTH(project_code) + 3) AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM tasks
        WHERE project_id = NEW.project_id;
        
        NEW.task_number := project_code || '-T' || LPAD(sequence_num::TEXT, 3, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_task_number
    BEFORE INSERT ON tasks
    FOR EACH ROW
    WHEN (NEW.task_number IS NULL)
    EXECUTE FUNCTION generate_task_number();

-- Update project progress based on tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM tasks
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);
    
    IF total_tasks > 0 THEN
        new_progress := ROUND(100.0 * completed_tasks / total_tasks);
    ELSE
        new_progress := 0;
    END IF;
    
    UPDATE projects
    SET progress_percent = new_progress, updated_at = NOW()
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
    AFTER INSERT OR UPDATE OF status OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Auto-calculate time entry duration
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calc_time_duration
    BEFORE INSERT OR UPDATE ON task_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_time_entry_duration();

-- Update task actual hours from time entries
CREATE OR REPLACE FUNCTION update_task_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE tasks
    SET actual_hours = (
        SELECT COALESCE(SUM(duration_minutes) / 60.0, 0)
        FROM task_time_entries
        WHERE task_id = COALESCE(NEW.task_id, OLD.task_id)
    ),
    updated_at = NOW()
    WHERE id = COALESCE(NEW.task_id, OLD.task_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_hours
    AFTER INSERT OR UPDATE OR DELETE ON task_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_task_actual_hours();

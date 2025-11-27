-- =============================================
-- SQL MIGRATIONS FOR PROJECT MANAGEMENT MODULE
-- GoldenEnergy SaaS System
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROJECTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'planning' 
        CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- Timeline
    start_date DATE,
    expected_completion DATE,
    actual_completion DATE,
    
    -- Financial
    estimated_cost DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2) DEFAULT 0,
    budget DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'VND',
    
    -- Team
    owner_id UUID NOT NULL REFERENCES users(id),
    project_manager_id UUID REFERENCES users(id),
    
    -- Settings
    settings JSONB DEFAULT '{"defaultView": "kanban", "taskPrefix": "TASK", "estimationUnit": "hours"}'::jsonb,
    
    -- Progress
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- System
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_lead ON projects(lead_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- =============================================
-- 2. PROJECT MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'client')),
    permissions JSONB DEFAULT '[]'::jsonb,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(project_id, user_id)
);

-- Indexes
CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- =============================================
-- 3. TASKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- For subtasks
    code VARCHAR(20) NOT NULL, -- Auto-generated like TASK-001
    title VARCHAR(500) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'todo'
        CHECK (status IN ('backlog', 'todo', 'in_progress', 'review', 'testing', 'done', 'cancelled')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('lowest', 'low', 'medium', 'high', 'highest')),
    type VARCHAR(20) NOT NULL DEFAULT 'task'
        CHECK (type IN ('feature', 'bug', 'improvement', 'task', 'epic', 'story')),
    
    -- Assignment
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID NOT NULL REFERENCES users(id),
    
    -- Time tracking
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2) DEFAULT 0,
    
    -- Timeline
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    labels JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    
    -- Ordering
    sort_order INTEGER DEFAULT 0,
    
    -- Counts (denormalized for performance)
    attachment_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    subtask_count INTEGER DEFAULT 0,
    subtask_completed_count INTEGER DEFAULT 0,
    
    -- System
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(project_id, code)
);

-- Indexes
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent ON tasks(parent_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);
CREATE INDEX idx_tasks_sort_order ON tasks(project_id, status, sort_order);

-- =============================================
-- 4. TASK DEPENDENCIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) NOT NULL DEFAULT 'blocks'
        CHECK (dependency_type IN ('blocks', 'blocked_by', 'relates_to')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(task_id, depends_on_task_id)
);

-- Indexes
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- =============================================
-- 5. SUBTASKS TABLE (Checklist items)
-- =============================================
CREATE TABLE IF NOT EXISTS subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    assignee_id UUID REFERENCES users(id),
    due_date DATE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_subtasks_task ON subtasks(task_id);

-- =============================================
-- 6. MILESTONES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
        CHECK (status IN ('upcoming', 'in_progress', 'completed', 'overdue')),
    color VARCHAR(7) DEFAULT '#8B5CF6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- =============================================
-- 7. MILESTONE TASKS (Link tasks to milestones)
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_tasks (
    milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (milestone_id, task_id)
);

-- =============================================
-- 8. TASK COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE, -- For threaded comments
    content TEXT NOT NULL,
    mentions UUID[] DEFAULT '{}', -- User IDs mentioned
    reactions JSONB DEFAULT '{}'::jsonb, -- { "👍": ["user1", "user2"] }
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_author ON task_comments(author_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at DESC);

-- =============================================
-- 9. ATTACHMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('task', 'comment', 'project')),
    entity_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    storage_path TEXT NOT NULL, -- For deletion
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_attachments_entity ON attachments(entity_type, entity_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- =============================================
-- 10. TIME ENTRIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    description TEXT,
    hours DECIMAL(6, 2) NOT NULL CHECK (hours > 0),
    date DATE NOT NULL,
    billable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- =============================================
-- 11. ACTIVITY LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(20) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB, -- { field: { old: value, new: value } }
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_task ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- =============================================
-- 12. LABELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS labels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(project_id, name)
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all relevant tables
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate task code
CREATE OR REPLACE FUNCTION generate_task_code()
RETURNS TRIGGER AS $$
DECLARE
    prefix VARCHAR(10);
    next_num INTEGER;
BEGIN
    -- Get prefix from project settings or use default
    SELECT COALESCE(settings->>'taskPrefix', 'TASK') INTO prefix
    FROM projects WHERE id = NEW.project_id;
    
    -- Get next number
    SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM LENGTH(prefix) + 2) AS INTEGER)), 0) + 1
    INTO next_num
    FROM tasks WHERE project_id = NEW.project_id;
    
    NEW.code := prefix || '-' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_task_code_trigger BEFORE INSERT ON tasks
    FOR EACH ROW WHEN (NEW.code IS NULL)
    EXECUTE FUNCTION generate_task_code();

-- Function to update subtask counts
CREATE OR REPLACE FUNCTION update_subtask_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE tasks SET
            subtask_count = (SELECT COUNT(*) FROM subtasks WHERE task_id = NEW.task_id),
            subtask_completed_count = (SELECT COUNT(*) FROM subtasks WHERE task_id = NEW.task_id AND completed = TRUE)
        WHERE id = NEW.task_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tasks SET
            subtask_count = (SELECT COUNT(*) FROM subtasks WHERE task_id = OLD.task_id),
            subtask_completed_count = (SELECT COUNT(*) FROM subtasks WHERE task_id = OLD.task_id AND completed = TRUE)
        WHERE id = OLD.task_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subtask_counts_trigger AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_subtask_counts();

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE tasks SET comment_count = comment_count + 1 WHERE id = NEW.task_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE tasks SET comment_count = comment_count - 1 WHERE id = OLD.task_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comment_counts_trigger AFTER INSERT OR DELETE ON task_comments
    FOR EACH ROW EXECUTE FUNCTION update_comment_counts();

-- =============================================
-- VIEWS
-- =============================================

-- Project summary view
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.status,
    p.priority,
    p.start_date,
    p.expected_completion,
    p.progress_percentage,
    COUNT(DISTINCT t.id) AS total_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) AS completed_tasks,
    COUNT(DISTINCT CASE WHEN t.due_date < CURRENT_DATE AND t.status != 'done' THEN t.id END) AS overdue_tasks,
    COUNT(DISTINCT pm.user_id) AS member_count,
    COALESCE(SUM(te.hours), 0) AS total_hours_logged
FROM projects p
LEFT JOIN tasks t ON t.project_id = p.id AND t.deleted_at IS NULL
LEFT JOIN project_members pm ON pm.project_id = p.id
LEFT JOIN time_entries te ON te.task_id = t.id
WHERE p.deleted_at IS NULL
GROUP BY p.id;

-- =============================================
-- SAMPLE DATA (Vietnamese)
-- =============================================

-- Insert sample project
INSERT INTO projects (id, name, description, status, priority, owner_id, start_date, expected_completion)
SELECT 
    uuid_generate_v4(),
    'Dự án Solar Farm Bình Thuận',
    'Xây dựng trang trại điện mặt trời công suất 50MW tại Bình Thuận',
    'active',
    'high',
    (SELECT id FROM users LIMIT 1),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '6 months'
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

COMMIT;

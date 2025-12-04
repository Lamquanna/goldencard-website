-- =====================================================
-- GOLDEN ENERGY ERP - USERS & AUTHENTICATION MODULE
-- Core user management system
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Core user accounts)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Authentication
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    full_name VARCHAR(200) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar VARCHAR(500),
    bio TEXT,
    
    -- Contact
    phone VARCHAR(20),
    mobile VARCHAR(20),
    
    -- Role & Permissions
    role VARCHAR(20) NOT NULL DEFAULT 'user' 
        CHECK (role IN ('admin', 'manager', 'sales', 'engineer', 'technician', 'user', 'client')),
    permissions JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip VARCHAR(45),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    language VARCHAR(10) DEFAULT 'vi',
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    theme VARCHAR(20) DEFAULT 'light',
    preferences JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- USER SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session data
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255),
    
    -- Device & Location
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    location VARCHAR(255),
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- =====================================================
-- USER ROLES TABLE (for RBAC)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO user_roles (code, name, description, permissions, is_system_role) VALUES
    ('ADMIN', 'Administrator', 'Full system access', '["*"]'::jsonb, true),
    ('MANAGER', 'Manager', 'Manage projects, leads, and team', '["projects.*", "leads.*", "tasks.*", "users.read"]'::jsonb, true),
    ('SALES', 'Sales', 'Manage leads and customer relations', '["leads.*", "projects.read", "tasks.*"]'::jsonb, true),
    ('ENGINEER', 'Engineer', 'Technical project work', '["projects.*", "tasks.*", "inventory.read"]'::jsonb, true),
    ('TECHNICIAN', 'Technician', 'Field work and installations', '["tasks.*", "attendance.*", "inventory.read"]'::jsonb, true),
    ('USER', 'User', 'Basic access', '["tasks.read", "projects.read"]'::jsonb, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Team settings
    avatar VARCHAR(500),
    color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Manager
    manager_id UUID REFERENCES users(id),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role in team
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

-- =====================================================
-- AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    
    -- Details
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log user changes to audit log
CREATE OR REPLACE FUNCTION log_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            user_id,
            username,
            action,
            entity_type,
            entity_id,
            description,
            old_values,
            new_values
        ) VALUES (
            NEW.id,
            NEW.username,
            'user_updated',
            'user',
            NEW.id::text,
            'User profile updated',
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (
            user_id,
            username,
            action,
            entity_type,
            entity_id,
            description,
            old_values
        ) VALUES (
            OLD.id,
            OLD.username,
            'user_deleted',
            'user',
            OLD.id::text,
            'User account deleted',
            to_jsonb(OLD)
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_user_changes
    AFTER UPDATE OR DELETE ON users
    FOR EACH ROW
    EXECUTE FUNCTION log_user_changes();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- Active users view
CREATE OR REPLACE VIEW v_active_users AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    u.avatar,
    u.role,
    u.status,
    u.last_login_at,
    COUNT(DISTINCT us.id) as active_sessions
FROM users u
LEFT JOIN user_sessions us ON us.user_id = u.id AND us.expires_at > NOW()
WHERE u.status = 'active' AND u.deleted_at IS NULL
GROUP BY u.id;

-- User statistics view
CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE email_verified = TRUE) as verified_users,
    COUNT(*) FILTER (WHERE two_factor_enabled = TRUE) as two_factor_users,
    COUNT(*) FILTER (WHERE last_login_at > NOW() - INTERVAL '30 days') as active_last_30_days
FROM users
WHERE deleted_at IS NULL
GROUP BY role;

-- Team members view
CREATE OR REPLACE VIEW v_team_members_detail AS
SELECT 
    tm.id,
    tm.team_id,
    t.name as team_name,
    tm.user_id,
    u.username,
    u.full_name,
    u.avatar,
    u.role as user_role,
    tm.role as team_role,
    tm.joined_at,
    tm.left_at
FROM team_members tm
INNER JOIN teams t ON t.id = tm.team_id
INNER JOIN users u ON u.id = tm.user_id
WHERE tm.left_at IS NULL;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default admin user (password: admin000)
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    full_name, 
    role, 
    status, 
    email_verified
) VALUES (
    'admin',
    'admin@goldenenergy.vn',
    '$2a$10$xQGqZqKqYqJqKqKqKqKqKuO8L1qGqZqKqKqKqKqKqKqKqKqKqKqKq', -- Placeholder hash
    'System Administrator',
    'admin',
    'active',
    TRUE
) ON CONFLICT (username) DO NOTHING;

-- Insert sample users
INSERT INTO users (username, email, password_hash, full_name, role, status) VALUES
    ('manager1', 'manager1@goldenenergy.vn', 'hash', 'Nguyễn Văn Manager', 'manager', 'active'),
    ('sales1', 'sales1@goldenenergy.vn', 'hash', 'Trần Thị Sales', 'sales', 'active'),
    ('engineer1', 'engineer1@goldenenergy.vn', 'hash', 'Lê Văn Engineer', 'engineer', 'active'),
    ('tech1', 'tech1@goldenenergy.vn', 'hash', 'Phạm Thị Technician', 'technician', 'active')
ON CONFLICT (username) DO NOTHING;

-- Create sample team
INSERT INTO teams (name, description) VALUES
    ('Sales Team', 'Customer acquisition and relationship management'),
    ('Engineering Team', 'Technical design and implementation'),
    ('Installation Team', 'Field installation and commissioning')
ON CONFLICT DO NOTHING;

COMMIT;

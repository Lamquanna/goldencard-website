-- =====================================================
-- GOLDEN ENERGY ERP - REAL-TIME FEATURES MODULE
-- Real-time chat, notifications, presence, and visitor tracking
-- =====================================================

-- =====================================================
-- ONLINE PRESENCE TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS user_presence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    device_info JSONB DEFAULT '{}', -- Browser, OS, IP, etc.
    session_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, session_id)
);

-- Index for quick presence queries
CREATE INDEX IF NOT EXISTS idx_user_presence_user ON user_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen DESC);

-- =====================================================
-- REAL-TIME CHAT ROOMS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel', 'project', 'support')),
    
    -- For project-based chats
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    
    -- For support chats
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    
    -- Settings
    description TEXT,
    avatar_url VARCHAR(500),
    is_private BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_project ON chat_rooms(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_lead ON chat_rooms(lead_id);

-- =====================================================
-- CHAT ROOM MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role in the room
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    
    -- Notification settings
    notifications_enabled BOOLEAN DEFAULT TRUE,
    mute_until TIMESTAMP WITH TIME ZONE,
    
    -- Read tracking
    last_read_at TIMESTAMP WITH TIME ZONE,
    last_read_message_id UUID,
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(room_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user ON chat_room_members(user_id);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    
    -- Message content
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'video', 'audio', 'system')),
    
    -- Reply/Thread
    parent_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    thread_count INTEGER DEFAULT 0,
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    /* Example:
    [
        {"type": "image", "url": "...", "name": "...", "size": 1234},
        {"type": "file", "url": "...", "name": "...", "size": 5678}
    ]
    */
    
    -- Mentions
    mentions UUID[] DEFAULT '{}', -- User IDs mentioned in message
    
    -- Reactions
    reactions JSONB DEFAULT '{}',
    /* Example:
    {
        "👍": ["user_id1", "user_id2"],
        "❤️": ["user_id3"]
    }
    */
    
    -- Status
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Read receipts (denormalized for performance)
    read_by UUID[] DEFAULT '{}',
    read_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- =====================================================
-- CHAT TYPING INDICATORS (Ephemeral - short TTL)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Auto-expires after 5 seconds
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '5 seconds',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(room_id, user_id)
);

-- Index and cleanup
CREATE INDEX IF NOT EXISTS idx_chat_typing_room ON chat_typing_indicators(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_expires ON chat_typing_indicators(expires_at);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification type
    type VARCHAR(50) NOT NULL,
    /* Types:
        - task_assigned, task_due, task_completed
        - project_update, project_milestone
        - lead_assigned, lead_activity
        - chat_message, chat_mention
        - approval_request, approval_response
        - system_alert, inventory_low_stock
    */
    
    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT,
    icon VARCHAR(50),
    
    -- Links
    link VARCHAR(500), -- Where to go when clicked
    entity_type VARCHAR(50), -- task, project, lead, chat, etc.
    entity_id UUID,
    
    -- Data
    data JSONB DEFAULT '{}',
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Action buttons
    actions JSONB DEFAULT '[]',
    /* Example:
    [
        {"label": "View Task", "link": "/erp/tasks/123"},
        {"label": "Mark Done", "action": "mark_done"}
    ]
    */
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(entity_type, entity_id);

-- =====================================================
-- NOTIFICATION PREFERENCES
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Channel preferences
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    
    -- Type preferences (JSONB for flexibility)
    preferences JSONB DEFAULT '{}',
    /* Example:
    {
        "task_assigned": {"email": true, "push": true, "sms": false},
        "chat_message": {"email": false, "push": true, "sms": false},
        "lead_assigned": {"email": true, "push": true, "sms": false}
    }
    */
    
    -- Quiet hours
    quiet_hours_enabled BOOLEAN DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Frequency
    digest_enabled BOOLEAN DEFAULT FALSE,
    digest_frequency VARCHAR(20) DEFAULT 'daily' CHECK (digest_frequency IN ('hourly', 'daily', 'weekly')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- VISITOR TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Session info
    session_id VARCHAR(255) UNIQUE NOT NULL,
    visitor_id VARCHAR(255), -- Cookie-based tracking
    
    -- User info (if logged in)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Device & Browser
    user_agent TEXT,
    browser VARCHAR(50),
    browser_version VARCHAR(20),
    os VARCHAR(50),
    os_version VARCHAR(20),
    device_type VARCHAR(20), -- desktop, mobile, tablet
    device_vendor VARCHAR(50),
    
    -- Location (from IP)
    ip_address VARCHAR(45),
    country VARCHAR(100),
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50),
    
    -- Referral
    referrer TEXT,
    referrer_domain VARCHAR(255),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    
    -- Landing page
    landing_page TEXT,
    landing_page_title VARCHAR(255),
    
    -- Exit page
    exit_page TEXT,
    
    -- Engagement
    page_views INTEGER DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    is_bounce BOOLEAN DEFAULT FALSE,
    
    -- Session timing
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor ON visitor_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_user ON visitor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started ON visitor_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_location ON visitor_sessions(country_code, city);

-- =====================================================
-- PAGE VIEWS
-- =====================================================
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    
    -- Page info
    page_url TEXT NOT NULL,
    page_title VARCHAR(255),
    page_path VARCHAR(500),
    
    -- Navigation
    previous_page_url TEXT,
    
    -- Timing
    time_on_page_seconds INTEGER,
    
    -- Interactions
    scroll_depth_percentage INTEGER, -- How far user scrolled
    clicks INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed ON page_views(viewed_at DESC);

-- =====================================================
-- VISITOR EVENTS (Custom tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS visitor_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    
    -- Event info
    event_type VARCHAR(50) NOT NULL, -- click, form_submit, download, video_play, etc.
    event_category VARCHAR(50),
    event_action VARCHAR(100),
    event_label VARCHAR(255),
    event_value DECIMAL(15, 2),
    
    -- Page context
    page_url TEXT,
    page_path VARCHAR(500),
    
    -- Element info
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    
    -- Additional data
    data JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_visitor_events_session ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created ON visitor_events(created_at DESC);

-- =====================================================
-- REAL-TIME ACTIVITY FEED
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL, -- Denormalized for deleted users
    actor_avatar VARCHAR(500),
    
    -- Action
    action VARCHAR(100) NOT NULL,
    verb VARCHAR(50) NOT NULL, -- created, updated, deleted, commented, etc.
    
    -- Target
    target_type VARCHAR(50) NOT NULL, -- task, project, lead, etc.
    target_id UUID NOT NULL,
    target_name VARCHAR(255), -- Denormalized
    
    -- Context
    context JSONB DEFAULT '{}',
    
    -- Visibility
    visibility VARCHAR(20) DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private')),
    visible_to_users UUID[] DEFAULT '{}',
    
    -- Aggregation (for grouping similar activities)
    aggregation_key VARCHAR(255), -- Group related activities
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_target ON activity_feed(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_aggregation ON activity_feed(aggregation_key) WHERE aggregation_key IS NOT NULL;

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
CREATE TRIGGER update_user_presence_updated_at BEFORE UPDATE ON user_presence
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at BEFORE UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update thread count
CREATE OR REPLACE FUNCTION update_thread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE chat_messages 
        SET thread_count = thread_count + 1 
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE chat_messages 
        SET thread_count = thread_count - 1 
        WHERE id = OLD.parent_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_count
    AFTER INSERT OR DELETE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_count();

-- Function to clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS void AS $$
BEGIN
    DELETE FROM chat_typing_indicators WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to create notification for new chat message
CREATE OR REPLACE FUNCTION create_chat_message_notifications()
RETURNS TRIGGER AS $$
DECLARE
    member_record RECORD;
BEGIN
    -- Create notifications for all room members except sender
    FOR member_record IN 
        SELECT user_id 
        FROM chat_room_members 
        WHERE room_id = NEW.room_id 
        AND user_id != NEW.sender_id
        AND notifications_enabled = TRUE
        AND (mute_until IS NULL OR mute_until < NOW())
    LOOP
        INSERT INTO notifications (
            user_id,
            type,
            title,
            message,
            link,
            entity_type,
            entity_id,
            priority
        ) VALUES (
            member_record.user_id,
            'chat_message',
            'New message',
            LEFT(NEW.content, 100),
            '/chat/' || NEW.room_id,
            'chat_message',
            NEW.id,
            'normal'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_message_notifications
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    WHEN (NEW.type = 'text')
    EXECUTE FUNCTION create_chat_message_notifications();

-- Function to update last_read tracking
CREATE OR REPLACE FUNCTION update_last_read_tracking()
RETURNS void AS $$
BEGIN
    -- This will be called from application code
    -- to update last_read_at and last_read_message_id
    NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Unread message counts per user
CREATE OR REPLACE VIEW v_unread_message_counts AS
SELECT 
    crm.user_id,
    crm.room_id,
    COUNT(cm.id) as unread_count,
    MAX(cm.created_at) as last_message_at
FROM chat_room_members crm
LEFT JOIN chat_messages cm ON cm.room_id = crm.room_id
WHERE cm.created_at > COALESCE(crm.last_read_at, '1970-01-01'::timestamp)
AND cm.sender_id != crm.user_id
AND cm.deleted = FALSE
GROUP BY crm.user_id, crm.room_id;

-- View: Online users
CREATE OR REPLACE VIEW v_online_users AS
SELECT 
    u.id,
    u.username,
    u.full_name,
    u.avatar,
    up.status,
    up.last_seen,
    up.last_activity
FROM users u
INNER JOIN user_presence up ON up.user_id = u.id
WHERE up.status IN ('online', 'away', 'busy')
AND up.last_activity > NOW() - INTERVAL '5 minutes';

-- View: Notification summary
CREATE OR REPLACE VIEW v_notification_summary AS
SELECT 
    user_id,
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_count,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
    MAX(created_at) as last_notification_at
FROM notifications
WHERE is_archived = FALSE
GROUP BY user_id;

-- View: Visitor analytics summary
CREATE OR REPLACE VIEW v_visitor_analytics AS
SELECT 
    DATE(started_at) as date,
    COUNT(DISTINCT id) as total_sessions,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) as logged_in_users,
    AVG(page_views) as avg_page_views,
    AVG(total_time_seconds) as avg_session_duration,
    COUNT(*) FILTER (WHERE is_bounce = TRUE)::DECIMAL / COUNT(*) * 100 as bounce_rate,
    COUNT(DISTINCT country_code) as countries_count
FROM visitor_sessions
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- View: Popular pages
CREATE OR REPLACE VIEW v_popular_pages AS
SELECT 
    page_path,
    MAX(page_title) as page_title,
    COUNT(*) as view_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    AVG(time_on_page_seconds) as avg_time_on_page,
    AVG(scroll_depth_percentage) as avg_scroll_depth
FROM page_views
WHERE viewed_at > NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY view_count DESC
LIMIT 100;

-- View: Recent activity feed
CREATE OR REPLACE VIEW v_recent_activity AS
SELECT 
    af.*,
    u.username,
    u.avatar
FROM activity_feed af
LEFT JOIN users u ON u.id = af.user_id
WHERE af.created_at > NOW() - INTERVAL '7 days'
ORDER BY af.created_at DESC
LIMIT 100;

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- CLEANUP JOBS (Run periodically)
-- =====================================================

-- Clean up old typing indicators (run every minute)
-- DELETE FROM chat_typing_indicators WHERE expires_at < NOW();

-- Clean up old visitor sessions (keep 90 days)
-- DELETE FROM visitor_sessions WHERE started_at < NOW() - INTERVAL '90 days';

-- Clean up old notifications (keep 30 days for read, 90 days for unread)
-- DELETE FROM notifications WHERE is_read = TRUE AND read_at < NOW() - INTERVAL '30 days';
-- DELETE FROM notifications WHERE is_read = FALSE AND created_at < NOW() - INTERVAL '90 days';

COMMIT;

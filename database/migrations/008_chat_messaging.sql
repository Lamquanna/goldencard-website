-- =====================================================
-- GOLDEN ENERGY ERP - CHAT & MESSAGING SYSTEM
-- Real-time messaging, group chats, and video calls
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CHAT ROOMS / CONVERSATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'group' 
        CHECK (type IN ('direct', 'group', 'channel')),
    
    -- Metadata
    avatar_url VARCHAR(500),
    is_archived BOOLEAN DEFAULT FALSE,
    
    -- Settings
    settings JSONB DEFAULT '{
        "allow_video_call": true,
        "allow_file_sharing": true,
        "max_members": 100,
        "is_public": false
    }'::jsonb,
    
    -- For direct chats, store both user IDs
    user1_id UUID REFERENCES users(id),
    user2_id UUID REFERENCES users(id),
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for direct chats
CREATE UNIQUE INDEX idx_direct_chat_users ON chat_rooms(
    LEAST(user1_id, user2_id),
    GREATEST(user1_id, user2_id)
) WHERE type = 'direct';

-- =====================================================
-- CHAT ROOM MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_room_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role in chat
    role VARCHAR(20) DEFAULT 'member' 
        CHECK (role IN ('owner', 'admin', 'member')),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_muted BOOLEAN DEFAULT FALSE,
    
    -- Tracking
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Notifications
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(room_id, user_id)
);

CREATE INDEX idx_room_members_room ON chat_room_members(room_id);
CREATE INDEX idx_room_members_user ON chat_room_members(user_id);
CREATE INDEX idx_room_members_active ON chat_room_members(room_id, is_active);

-- =====================================================
-- CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    
    -- Message content
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' 
        CHECK (message_type IN ('text', 'image', 'file', 'video', 'audio', 'system')),
    
    -- Reply to another message
    reply_to_id UUID REFERENCES chat_messages(id),
    
    -- Attachments (URLs to files/images)
    attachments JSONB DEFAULT '[]'::jsonb,
    /* Example:
    [
        {
            "type": "image",
            "url": "https://...",
            "name": "file.jpg",
            "size": 12345
        }
    ]
    */
    
    -- Mentions
    mentions JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
    
    -- Reactions
    reactions JSONB DEFAULT '{}'::jsonb,
    /* Example:
    {
        "👍": ["user_id1", "user_id2"],
        "❤️": ["user_id3"]
    }
    */
    
    -- Edit tracking
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    
    -- Deletion
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID REFERENCES users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_room ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_messages_reply ON chat_messages(reply_to_id);

-- =====================================================
-- MESSAGE READ RECEIPTS
-- =====================================================
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

CREATE INDEX idx_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_receipts_user ON message_read_receipts(user_id);

-- =====================================================
-- VIDEO CALL SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS video_call_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    
    -- Session info
    session_code VARCHAR(50) UNIQUE NOT NULL, -- For joining the call
    call_type VARCHAR(20) DEFAULT 'video' 
        CHECK (call_type IN ('audio', 'video', 'screen_share')),
    
    -- Status
    status VARCHAR(20) DEFAULT 'waiting' 
        CHECK (status IN ('waiting', 'active', 'ended', 'cancelled')),
    
    -- Timing
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Participants count
    max_participants INTEGER DEFAULT 10,
    current_participants INTEGER DEFAULT 0,
    
    -- Recording (if enabled)
    is_recorded BOOLEAN DEFAULT FALSE,
    recording_url VARCHAR(500),
    
    -- Settings
    settings JSONB DEFAULT '{
        "allow_screen_share": true,
        "allow_chat": true,
        "require_password": false
    }'::jsonb,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_sessions_room ON video_call_sessions(room_id);
CREATE INDEX idx_video_sessions_status ON video_call_sessions(status);
CREATE INDEX idx_video_sessions_code ON video_call_sessions(session_code);

-- =====================================================
-- VIDEO CALL PARTICIPANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS video_call_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES video_call_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Status
    status VARCHAR(20) DEFAULT 'invited' 
        CHECK (status IN ('invited', 'joined', 'left', 'rejected')),
    
    -- Timing
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    
    -- Metadata
    camera_enabled BOOLEAN DEFAULT TRUE,
    microphone_enabled BOOLEAN DEFAULT TRUE,
    screen_sharing BOOLEAN DEFAULT FALSE,
    
    UNIQUE(session_id, user_id)
);

CREATE INDEX idx_call_participants_session ON video_call_participants(session_id);
CREATE INDEX idx_call_participants_user ON video_call_participants(user_id);

-- =====================================================
-- USER PRESENCE / ONLINE STATUS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_presence (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'offline' 
        CHECK (status IN ('online', 'away', 'busy', 'offline')),
    
    -- Custom status message
    status_message VARCHAR(255),
    status_emoji VARCHAR(10),
    
    -- Last activity
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Device info
    device_type VARCHAR(50), -- web, mobile, desktop
    device_info JSONB DEFAULT '{}'::jsonb,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_presence_status ON user_presence(status);
CREATE INDEX idx_presence_last_seen ON user_presence(last_seen_at DESC);

-- =====================================================
-- CHAT NOTIFICATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    
    -- Notification type
    type VARCHAR(50) NOT NULL 
        CHECK (type IN ('new_message', 'mention', 'reply', 'video_call', 'group_invite', 'system')),
    
    -- Content
    title VARCHAR(255) NOT NULL,
    content TEXT,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Action
    action_url VARCHAR(500),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON chat_notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON chat_notifications(created_at DESC);

-- =====================================================
-- FILE UPLOADS / ATTACHMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    
    -- File info
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL, -- bytes
    mime_type VARCHAR(100) NOT NULL,
    
    -- Storage
    storage_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    storage_path TEXT NOT NULL,
    
    -- Metadata
    width INTEGER, -- for images
    height INTEGER, -- for images
    duration_seconds INTEGER, -- for video/audio
    
    -- Virus scan
    is_scanned BOOLEAN DEFAULT FALSE,
    is_safe BOOLEAN DEFAULT TRUE,
    scan_result JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_message ON chat_file_uploads(message_id);
CREATE INDEX idx_file_uploads_user ON chat_file_uploads(uploaded_by);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_chat_rooms_updated
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_timestamp();

CREATE TRIGGER trigger_chat_messages_updated
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_timestamp();

CREATE TRIGGER trigger_video_sessions_updated
    BEFORE UPDATE ON video_call_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_timestamp();

-- Update last_seen when user reads messages
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_room_members
    SET last_seen_at = NOW()
    WHERE user_id = NEW.user_id AND room_id = (
        SELECT room_id FROM chat_messages WHERE id = NEW.message_id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_seen
    AFTER INSERT ON message_read_receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_seen();

-- Auto-calculate video call duration
CREATE OR REPLACE FUNCTION calculate_video_call_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
        NEW.status := 'ended';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calc_call_duration
    BEFORE UPDATE ON video_call_sessions
    FOR EACH ROW
    WHEN (NEW.ended_at IS NOT NULL)
    EXECUTE FUNCTION calculate_video_call_duration();

-- Auto-calculate participant duration
CREATE OR REPLACE FUNCTION calculate_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.left_at IS NOT NULL AND NEW.joined_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calc_participant_duration
    BEFORE UPDATE ON video_call_participants
    FOR EACH ROW
    WHEN (NEW.left_at IS NOT NULL)
    EXECUTE FUNCTION calculate_participant_duration();

-- =====================================================
-- VIEWS
-- =====================================================

-- User's unread message count by room
CREATE OR REPLACE VIEW v_unread_messages AS
SELECT 
    crm.room_id,
    crm.user_id,
    cr.name as room_name,
    cr.type as room_type,
    COUNT(cm.id) as unread_count,
    MAX(cm.created_at) as last_message_at
FROM chat_room_members crm
JOIN chat_rooms cr ON cr.id = crm.room_id
LEFT JOIN chat_messages cm ON cm.room_id = crm.room_id 
    AND cm.created_at > crm.last_read_at
    AND cm.sender_id != crm.user_id
    AND cm.is_deleted = FALSE
WHERE crm.is_active = TRUE
GROUP BY crm.room_id, crm.user_id, cr.name, cr.type;

-- Active video calls
CREATE OR REPLACE VIEW v_active_video_calls AS
SELECT 
    vcs.id,
    vcs.session_code,
    vcs.call_type,
    vcs.status,
    vcs.started_at,
    cr.id as room_id,
    cr.name as room_name,
    u.full_name as created_by_name,
    vcs.current_participants,
    vcs.max_participants,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'user_id', vcp.user_id,
            'user_name', u2.full_name,
            'status', vcp.status,
            'joined_at', vcp.joined_at
        ))
        FROM video_call_participants vcp
        JOIN users u2 ON u2.id = vcp.user_id
        WHERE vcp.session_id = vcs.id
    ) as participants
FROM video_call_sessions vcs
JOIN chat_rooms cr ON cr.id = vcs.room_id
JOIN users u ON u.id = vcs.created_by
WHERE vcs.status IN ('waiting', 'active');

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Create a general chat room
INSERT INTO chat_rooms (name, description, type, created_by)
SELECT 
    'Phòng chat chung',
    'Chat chung cho tất cả nhân viên',
    'group',
    (SELECT id FROM users LIMIT 1)
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Add all users to general chat
INSERT INTO chat_room_members (room_id, user_id, role)
SELECT 
    (SELECT id FROM chat_rooms WHERE name = 'Phòng chat chung'),
    u.id,
    CASE WHEN u.role = 'admin' THEN 'admin' ELSE 'member' END
FROM users u
ON CONFLICT (room_id, user_id) DO NOTHING;

-- Create sample messages
INSERT INTO chat_messages (room_id, sender_id, content, message_type)
SELECT 
    (SELECT id FROM chat_rooms WHERE name = 'Phòng chat chung'),
    (SELECT id FROM users ORDER BY random() LIMIT 1),
    'Chào mọi người! Hệ thống chat đã sẵn sàng 🎉',
    'text'
WHERE EXISTS (SELECT 1 FROM chat_rooms WHERE name = 'Phòng chat chung');

-- Initialize user presence for all users
INSERT INTO user_presence (user_id, status, last_seen_at)
SELECT id, 'offline', NOW()
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Note: COMMIT is not needed as PostgreSQL auto-commits DDL statements

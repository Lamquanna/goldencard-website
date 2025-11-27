-- Golden Energy Analytics Database Schema
-- Version: 1.0
-- Created: 2024-11-24

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- SESSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) UNIQUE NOT NULL,
  ip_address_hash VARCHAR(64) NOT NULL, -- SHA-256 hashed for privacy
  user_agent TEXT,
  
  -- Geolocation
  country_code CHAR(2),
  country_name VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  isp VARCHAR(255),
  timezone VARCHAR(100),
  
  -- Device Info
  device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  browser VARCHAR(50),
  os VARCHAR(50),
  screen_width INTEGER,
  screen_height INTEGER,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Metadata
  language VARCHAR(10),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for sessions
CREATE INDEX idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX idx_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX idx_sessions_country_code ON analytics_sessions(country_code);
CREATE INDEX idx_sessions_city ON analytics_sessions(city);
CREATE INDEX idx_sessions_device_type ON analytics_sessions(device_type);
CREATE INDEX idx_sessions_utm_source ON analytics_sessions(utm_source);

-- ================================================
-- PAGE VIEWS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Page Info
  page_path VARCHAR(500) NOT NULL,
  page_title VARCHAR(200),
  page_url TEXT,
  referrer TEXT,
  
  -- Engagement Metrics
  duration_seconds INTEGER, -- Time spent on page
  scroll_depth_percent INTEGER CHECK (scroll_depth_percent >= 0 AND scroll_depth_percent <= 100),
  exit_page BOOLEAN DEFAULT FALSE,
  bounce BOOLEAN DEFAULT FALSE,
  
  -- Performance Metrics
  load_time_ms INTEGER, -- Page load time
  time_to_interactive_ms INTEGER,
  
  -- Metadata
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Timestamps
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for page views
CREATE INDEX idx_page_views_session_id ON analytics_page_views(session_id);
CREATE INDEX idx_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX idx_page_views_viewed_at ON analytics_page_views(viewed_at);
CREATE INDEX idx_page_views_duration ON analytics_page_views(duration_seconds);
CREATE INDEX idx_page_views_scroll_depth ON analytics_page_views(scroll_depth_percent);

-- ================================================
-- EVENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Event Info
  event_type VARCHAR(100) NOT NULL, -- 'click', 'scroll', 'form_submit', 'download', etc.
  event_category VARCHAR(100),
  event_action VARCHAR(100),
  event_label VARCHAR(200),
  event_value DECIMAL(10, 2),
  
  -- Event Data (JSONB for flexible storage)
  event_data JSONB,
  
  -- Page Context
  page_path VARCHAR(500),
  page_title VARCHAR(200),
  
  -- Timestamps
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for events
CREATE INDEX idx_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_events_event_category ON analytics_events(event_category);
CREATE INDEX idx_events_event_timestamp ON analytics_events(event_timestamp);
CREATE INDEX idx_events_page_path ON analytics_events(page_path);
CREATE INDEX idx_events_event_data ON analytics_events USING GIN (event_data);

-- ================================================
-- INTERACTIONS TABLE (Clicks, Mouse Movements)
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Interaction Type
  interaction_type VARCHAR(50) NOT NULL, -- 'click', 'mouseMove', 'scroll'
  
  -- Element Info
  element_selector TEXT, -- CSS selector
  element_text VARCHAR(500),
  element_tag VARCHAR(50),
  element_id VARCHAR(200),
  element_classes TEXT[],
  
  -- Position
  x_position INTEGER,
  y_position INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Page Context
  page_path VARCHAR(500),
  
  -- Timestamps
  interaction_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for interactions
CREATE INDEX idx_interactions_session_id ON analytics_interactions(session_id);
CREATE INDEX idx_interactions_type ON analytics_interactions(interaction_type);
CREATE INDEX idx_interactions_page_path ON analytics_interactions(page_path);
CREATE INDEX idx_interactions_timestamp ON analytics_interactions(interaction_timestamp);
CREATE INDEX idx_interactions_element_selector ON analytics_interactions(element_selector);
CREATE INDEX idx_interactions_position ON analytics_interactions(x_position, y_position);

-- ================================================
-- HEATMAP DATA TABLE (Aggregated for performance)
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_heatmap_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Page Info
  page_path VARCHAR(500) NOT NULL,
  
  -- Grid Position (for aggregation)
  grid_x INTEGER NOT NULL, -- X coordinate in grid (e.g., 0-100)
  grid_y INTEGER NOT NULL, -- Y coordinate in grid (e.g., 0-100)
  
  -- Metrics
  click_count INTEGER DEFAULT 0,
  hover_count INTEGER DEFAULT 0,
  scroll_count INTEGER DEFAULT 0,
  
  -- Time Period
  date_bucket DATE NOT NULL, -- Daily aggregation
  hour_bucket INTEGER CHECK (hour_bucket >= 0 AND hour_bucket < 24),
  
  -- Metadata
  device_type VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint for aggregation
  UNIQUE(page_path, grid_x, grid_y, date_bucket, hour_bucket, device_type)
);

-- Indexes for heatmap data
CREATE INDEX idx_heatmap_page_path ON analytics_heatmap_data(page_path);
CREATE INDEX idx_heatmap_date_bucket ON analytics_heatmap_data(date_bucket);
CREATE INDEX idx_heatmap_grid_position ON analytics_heatmap_data(grid_x, grid_y);
CREATE INDEX idx_heatmap_device_type ON analytics_heatmap_data(device_type);

-- ================================================
-- USER FLOWS TABLE (Page Transitions)
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_user_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Flow Info
  from_page VARCHAR(500),
  to_page VARCHAR(500) NOT NULL,
  sequence_number INTEGER NOT NULL, -- Order in session
  
  -- Timing
  transition_time_ms INTEGER, -- Time between pages
  
  -- Timestamps
  transition_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for user flows
CREATE INDEX idx_flows_session_id ON analytics_user_flows(session_id);
CREATE INDEX idx_flows_from_page ON analytics_user_flows(from_page);
CREATE INDEX idx_flows_to_page ON analytics_user_flows(to_page);
CREATE INDEX idx_flows_sequence ON analytics_user_flows(sequence_number);
CREATE INDEX idx_flows_timestamp ON analytics_user_flows(transition_timestamp);

-- ================================================
-- FORM SUBMISSIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS analytics_form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  
  -- Form Info
  form_name VARCHAR(200),
  form_id VARCHAR(200),
  page_path VARCHAR(500),
  
  -- Submission Details
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  time_to_submit_seconds INTEGER,
  
  -- Fields Interacted (privacy-safe, no values)
  fields_touched TEXT[],
  field_count INTEGER,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key
  FOREIGN KEY (session_id) REFERENCES analytics_sessions(session_id) ON DELETE CASCADE
);

-- Indexes for form submissions
CREATE INDEX idx_form_submissions_session_id ON analytics_form_submissions(session_id);
CREATE INDEX idx_form_submissions_form_name ON analytics_form_submissions(form_name);
CREATE INDEX idx_form_submissions_page_path ON analytics_form_submissions(page_path);
CREATE INDEX idx_form_submissions_success ON analytics_form_submissions(success);
CREATE INDEX idx_form_submissions_timestamp ON analytics_form_submissions(submitted_at);

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sessions table
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON analytics_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for heatmap data table
CREATE TRIGGER update_heatmap_updated_at
  BEFORE UPDATE ON analytics_heatmap_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VIEWS FOR COMMON QUERIES
-- ================================================

-- View: Daily Active Sessions
CREATE OR REPLACE VIEW v_daily_active_sessions AS
SELECT 
  DATE(started_at) as date,
  COUNT(DISTINCT session_id) as active_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'mobile' THEN session_id END) as mobile_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'desktop' THEN session_id END) as desktop_sessions,
  COUNT(DISTINCT CASE WHEN device_type = 'tablet' THEN session_id END) as tablet_sessions
FROM analytics_sessions
GROUP BY DATE(started_at)
ORDER BY date DESC;

-- View: Popular Pages
CREATE OR REPLACE VIEW v_popular_pages AS
SELECT 
  page_path,
  COUNT(*) as view_count,
  AVG(duration_seconds) as avg_duration_seconds,
  AVG(scroll_depth_percent) as avg_scroll_depth,
  COUNT(DISTINCT session_id) as unique_visitors,
  SUM(CASE WHEN exit_page THEN 1 ELSE 0 END) as exit_count,
  SUM(CASE WHEN bounce THEN 1 ELSE 0 END) as bounce_count
FROM analytics_page_views
WHERE viewed_at >= NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY view_count DESC;

-- View: Geographic Distribution
CREATE OR REPLACE VIEW v_geographic_distribution AS
SELECT 
  country_name,
  country_code,
  city,
  COUNT(DISTINCT session_id) as sessions,
  COUNT(DISTINCT session_id) * 100.0 / (SELECT COUNT(DISTINCT session_id) FROM analytics_sessions) as percentage
FROM analytics_sessions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY country_name, country_code, city
ORDER BY sessions DESC;

-- View: Top Events
CREATE OR REPLACE VIEW v_top_events AS
SELECT 
  event_type,
  event_category,
  event_action,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
WHERE event_timestamp >= NOW() - INTERVAL '7 days'
GROUP BY event_type, event_category, event_action
ORDER BY event_count DESC;

-- ================================================
-- SAMPLE QUERIES (For Testing)
-- ================================================

-- Query 1: Session Summary
-- SELECT 
--   session_id,
--   country_name,
--   city,
--   device_type,
--   started_at,
--   ended_at,
--   EXTRACT(EPOCH FROM (ended_at - started_at)) as session_duration_seconds
-- FROM analytics_sessions
-- WHERE started_at >= NOW() - INTERVAL '24 hours'
-- ORDER BY started_at DESC;

-- Query 2: Page Funnel Analysis
-- SELECT 
--   page_path,
--   COUNT(*) as views,
--   COUNT(DISTINCT session_id) as unique_users,
--   AVG(duration_seconds) as avg_time_on_page,
--   SUM(CASE WHEN exit_page THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as exit_rate
-- FROM analytics_page_views
-- WHERE page_path IN ('/vi/services', '/vi/contact', '/vi/about')
-- GROUP BY page_path;

-- Query 3: Click Heatmap Data
-- SELECT 
--   page_path,
--   grid_x,
--   grid_y,
--   SUM(click_count) as total_clicks
-- FROM analytics_heatmap_data
-- WHERE page_path = '/vi' 
--   AND date_bucket >= CURRENT_DATE - INTERVAL '7 days'
-- GROUP BY page_path, grid_x, grid_y
-- ORDER BY total_clicks DESC;

-- ================================================
-- GRANTS (Adjust based on your user)
-- ================================================
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ================================================
-- CLEANUP FUNCTIONS (For maintenance)
-- ================================================

-- Function to delete old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data(days_to_keep INTEGER DEFAULT 90)
RETURNS TABLE(
  deleted_sessions INTEGER,
  deleted_page_views INTEGER,
  deleted_events INTEGER,
  deleted_interactions INTEGER,
  deleted_flows INTEGER
) AS $$
DECLARE
  cutoff_date TIMESTAMP WITH TIME ZONE;
  sessions_deleted INTEGER;
  page_views_deleted INTEGER;
  events_deleted INTEGER;
  interactions_deleted INTEGER;
  flows_deleted INTEGER;
BEGIN
  cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;
  
  -- Delete from child tables first (to avoid FK violations)
  DELETE FROM analytics_page_views WHERE viewed_at < cutoff_date;
  GET DIAGNOSTICS page_views_deleted = ROW_COUNT;
  
  DELETE FROM analytics_events WHERE event_timestamp < cutoff_date;
  GET DIAGNOSTICS events_deleted = ROW_COUNT;
  
  DELETE FROM analytics_interactions WHERE interaction_timestamp < cutoff_date;
  GET DIAGNOSTICS interactions_deleted = ROW_COUNT;
  
  DELETE FROM analytics_user_flows WHERE transition_timestamp < cutoff_date;
  GET DIAGNOSTICS flows_deleted = ROW_COUNT;
  
  -- Delete from parent table
  DELETE FROM analytics_sessions WHERE started_at < cutoff_date;
  GET DIAGNOSTICS sessions_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT sessions_deleted, page_views_deleted, events_deleted, interactions_deleted, flows_deleted;
END;
$$ LANGUAGE plpgsql;

-- Example: Run cleanup for data older than 90 days
-- SELECT * FROM cleanup_old_analytics_data(90);

-- ================================================
-- DONE
-- ================================================
-- Migration complete. All tables, indexes, views, and functions created.
-- Remember to configure proper environment variables:
-- - POSTGRES_URL or POSTGRES_URL_NON_POOLING
-- - Adjust grants based on your database user

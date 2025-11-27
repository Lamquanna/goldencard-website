-- =====================================================
-- GOLDEN ENERGY CRM - ANALYTICS & REPORTING
-- Dashboards, KPIs, and Business Intelligence
-- =====================================================

-- =====================================================
-- ANALYTICS DASHBOARD CONFIGS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Ownership
    user_id UUID REFERENCES users(id), -- NULL = system dashboard
    is_default BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    
    -- Layout configuration (JSON)
    layout JSONB DEFAULT '[]',
    /* Example:
    [
        {"widget_id": "uuid", "x": 0, "y": 0, "w": 4, "h": 2},
        {"widget_id": "uuid", "x": 4, "y": 0, "w": 4, "h": 2}
    ]
    */
    
    -- Settings
    refresh_interval_seconds INTEGER DEFAULT 300, -- Auto refresh
    date_range_preset VARCHAR(50) DEFAULT 'this_month',
    
    -- Tags
    tags JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS WIDGETS
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Widget type
    type VARCHAR(50) NOT NULL, -- number, chart, table, gauge, map, funnel
    chart_type VARCHAR(50), -- line, bar, pie, donut, area, scatter (for chart type)
    
    -- Data source
    data_source VARCHAR(100) NOT NULL, -- leads, projects, tasks, inventory, attendance, sales
    
    -- Query configuration
    metrics JSONB NOT NULL, -- What to measure
    /* Example:
    [
        {"field": "COUNT(*)", "alias": "total_leads"},
        {"field": "SUM(estimated_value)", "alias": "total_value"}
    ]
    */
    
    dimensions JSONB DEFAULT '[]', -- Group by
    /* Example:
    [
        {"field": "status", "alias": "lead_status"},
        {"field": "DATE_TRUNC('month', created_at)", "alias": "month"}
    ]
    */
    
    filters JSONB DEFAULT '[]', -- Where conditions
    
    -- Display settings
    display_config JSONB DEFAULT '{}',
    /* Example:
    {
        "title": "Leads by Source",
        "colors": ["#3B82F6", "#10B981"],
        "show_legend": true,
        "show_values": true,
        "format": "currency" // or "number", "percent"
    }
    */
    
    -- Comparison
    enable_comparison BOOLEAN DEFAULT FALSE,
    comparison_type VARCHAR(20), -- previous_period, same_period_last_year
    
    -- Drill-down
    drill_down_config JSONB,
    
    -- Alerts
    alert_rules JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_template BOOLEAN DEFAULT FALSE, -- Can be used as template
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- KPI DEFINITIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Category
    category VARCHAR(50) NOT NULL, -- sales, projects, inventory, hr, finance
    
    -- Calculation
    formula TEXT NOT NULL, -- SQL expression or calculation
    data_source VARCHAR(100) NOT NULL,
    
    -- Target
    target_type VARCHAR(20) DEFAULT 'higher_better', -- higher_better, lower_better, target_value
    default_target DECIMAL(15,2),
    
    -- Display
    format VARCHAR(20) DEFAULT 'number', -- number, currency, percent, duration
    decimal_places INTEGER DEFAULT 0,
    unit VARCHAR(20), -- %, đ, hours, etc.
    
    -- Frequency
    calculation_frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default KPIs
INSERT INTO kpi_definitions (code, name, category, formula, data_source, format, unit, target_type) VALUES
    -- Sales KPIs
    ('LEAD_CONV_RATE', 'Lead Conversion Rate', 'sales', 
     '100.0 * COUNT(*) FILTER (WHERE status = ''converted'') / NULLIF(COUNT(*), 0)', 
     'leads', 'percent', '%', 'higher_better'),
    ('NEW_LEADS', 'New Leads', 'sales', 
     'COUNT(*) FILTER (WHERE created_at >= :start_date)', 
     'leads', 'number', NULL, 'higher_better'),
    ('AVG_DEAL_SIZE', 'Average Deal Size', 'sales', 
     'AVG(estimated_value) FILTER (WHERE status = ''converted'')', 
     'leads', 'currency', 'đ', 'higher_better'),
    ('SALES_CYCLE_DAYS', 'Sales Cycle (Days)', 'sales', 
     'AVG(EXTRACT(DAY FROM (converted_at - created_at))) FILTER (WHERE status = ''converted'')', 
     'leads', 'number', 'days', 'lower_better'),
    
    -- Project KPIs
    ('PROJECTS_ON_TIME', 'Projects On Time %', 'projects', 
     '100.0 * COUNT(*) FILTER (WHERE actual_end <= planned_end) / NULLIF(COUNT(*) FILTER (WHERE actual_end IS NOT NULL), 0)', 
     'projects', 'percent', '%', 'higher_better'),
    ('AVG_PROJECT_MARGIN', 'Avg Project Margin', 'projects', 
     'AVG(100.0 * (budget - actual_cost) / NULLIF(budget, 0)) FILTER (WHERE actual_cost IS NOT NULL)', 
     'projects', 'percent', '%', 'higher_better'),
    ('ACTIVE_PROJECTS', 'Active Projects', 'projects', 
     'COUNT(*) FILTER (WHERE status = ''in_progress'')', 
     'projects', 'number', NULL, 'higher_better'),
    
    -- Inventory KPIs
    ('INV_TURNOVER', 'Inventory Turnover', 'inventory', 
     'SUM(qty_issued) / NULLIF(AVG(current_stock), 0)', 
     'inventory_items', 'number', 'x', 'higher_better'),
    ('STOCKOUT_RATE', 'Stockout Rate %', 'inventory', 
     '100.0 * COUNT(*) FILTER (WHERE current_stock <= 0) / NULLIF(COUNT(*), 0)', 
     'inventory_items', 'percent', '%', 'lower_better'),
    ('LOW_STOCK_ITEMS', 'Low Stock Items', 'inventory', 
     'COUNT(*) FILTER (WHERE current_stock <= min_stock_alert)', 
     'inventory_items', 'number', NULL, 'lower_better'),
    
    -- HR KPIs
    ('ATTENDANCE_RATE', 'Attendance Rate %', 'hr', 
     '100.0 * COUNT(*) FILTER (WHERE status = ''present'') / NULLIF(COUNT(*), 0)', 
     'attendance', 'percent', '%', 'higher_better'),
    ('AVG_OT_HOURS', 'Avg OT Hours/Employee', 'hr', 
     'AVG(overtime_hours)', 
     'attendance', 'number', 'hours', 'lower_better'),
    ('LEAVE_UTILIZATION', 'Leave Utilization %', 'hr', 
     '100.0 * SUM(total_days) / NULLIF(COUNT(DISTINCT employee_id) * 12, 0)', 
     'leave_requests', 'percent', '%', 'higher_better')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- KPI ACTUALS (Historical values)
-- =====================================================
CREATE TABLE IF NOT EXISTS kpi_actuals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kpi_id UUID NOT NULL REFERENCES kpi_definitions(id),
    
    -- Period
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, quarterly, yearly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Values
    actual_value DECIMAL(15,4) NOT NULL,
    target_value DECIMAL(15,4),
    previous_value DECIMAL(15,4), -- Previous period for comparison
    
    -- Achievement
    achievement_percent DECIMAL(6,2) GENERATED ALWAYS AS (
        CASE WHEN target_value IS NOT NULL AND target_value != 0 
        THEN 100.0 * actual_value / target_value 
        ELSE NULL END
    ) STORED,
    
    -- Trend
    trend_direction VARCHAR(10), -- up, down, flat
    trend_percent DECIMAL(8,2),
    
    -- Context
    department_id UUID REFERENCES departments(id),
    user_id UUID REFERENCES users(id),
    project_id UUID REFERENCES projects(id),
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(kpi_id, period_start, period_end, department_id, user_id, project_id)
);

-- =====================================================
-- CONVERSION FUNNEL SNAPSHOTS
-- =====================================================
CREATE TABLE IF NOT EXISTS funnel_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    funnel_type VARCHAR(50) DEFAULT 'sales', -- sales, project, recruitment
    
    -- Funnel data (JSON array of stages)
    stages JSONB NOT NULL,
    /* Example:
    [
        {"stage": "new", "count": 100, "value": 5000000000},
        {"stage": "contacted", "count": 80, "value": 4000000000},
        {"stage": "qualified", "count": 50, "value": 3000000000},
        {"stage": "proposal", "count": 30, "value": 2500000000},
        {"stage": "negotiation", "count": 15, "value": 2000000000},
        {"stage": "won", "count": 10, "value": 1500000000}
    ]
    */
    
    -- Summary metrics
    total_leads INTEGER,
    total_value DECIMAL(15,2),
    conversion_rate DECIMAL(5,2),
    avg_deal_size DECIMAL(15,2),
    
    -- Filters applied
    date_range_start DATE,
    date_range_end DATE,
    filters JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER PERFORMANCE ANALYTICS
-- =====================================================
CREATE TABLE IF NOT EXISTS user_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Lead metrics
    leads_assigned INTEGER DEFAULT 0,
    leads_contacted INTEGER DEFAULT 0,
    leads_converted INTEGER DEFAULT 0,
    leads_lost INTEGER DEFAULT 0,
    lead_response_time_avg_hours DECIMAL(6,2),
    
    -- Activity metrics
    calls_made INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    meetings_held INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    
    -- Project metrics
    projects_managed INTEGER DEFAULT 0,
    milestones_completed INTEGER DEFAULT 0,
    
    -- Time metrics
    total_work_hours DECIMAL(6,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    billable_hours DECIMAL(6,2) DEFAULT 0,
    
    -- Financial metrics
    revenue_generated DECIMAL(15,2) DEFAULT 0,
    deals_value DECIMAL(15,2) DEFAULT 0,
    
    -- Scores
    performance_score INTEGER DEFAULT 0, -- 0-100
    activity_score INTEGER DEFAULT 0,
    quality_score INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, period_start, period_end)
);

-- =====================================================
-- SCHEDULED REPORTS
-- =====================================================
CREATE TABLE IF NOT EXISTS scheduled_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Report type
    report_type VARCHAR(50) NOT NULL, -- dashboard, kpi_summary, sales_report, inventory_report, etc.
    
    -- Configuration
    config JSONB NOT NULL DEFAULT '{}',
    /* Example:
    {
        "dashboard_id": "uuid",
        "date_range": "last_30_days",
        "filters": {...},
        "format": "pdf" // or "excel", "csv"
    }
    */
    
    -- Schedule (cron)
    schedule_cron VARCHAR(100) NOT NULL, -- "0 9 * * 1" = 9am every Monday
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Recipients
    recipients JSONB NOT NULL, -- Array of {type: "email/slack/user", value: "..."}
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    last_run_status VARCHAR(20),
    next_run_at TIMESTAMP WITH TIME ZONE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REPORT EXECUTIONS LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS report_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES scheduled_reports(id),
    
    -- Execution
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
    
    -- Output
    output_url VARCHAR(500), -- Link to generated file
    file_size INTEGER,
    
    -- Recipients notified
    recipients_sent INTEGER DEFAULT 0,
    recipients_failed INTEGER DEFAULT 0,
    
    -- Error handling
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS CACHE (For expensive queries)
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    
    -- Data
    data JSONB NOT NULL,
    
    -- Metadata
    query_hash VARCHAR(64), -- Hash of the query
    execution_time_ms INTEGER,
    
    -- Expiry
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-cleanup expired cache
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires ON analytics_cache(expires_at);

-- =====================================================
-- MATERIALIZED VIEWS FOR REPORTING
-- =====================================================

-- Daily sales summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_sales_summary AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as new_leads,
    COUNT(*) FILTER (WHERE status = 'converted') as converted_leads,
    COALESCE(SUM(estimated_value), 0) as total_pipeline_value,
    COALESCE(SUM(estimated_value) FILTER (WHERE status = 'converted'), 0) as converted_value,
    COUNT(DISTINCT source_id) as sources_count,
    COUNT(DISTINCT assigned_to) as sales_reps_count
FROM leads
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_sales ON mv_daily_sales_summary(date);

-- Monthly project summary
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_project_summary AS
SELECT 
    DATE_TRUNC('month', created_at)::DATE as month,
    category_id,
    COUNT(*) as total_projects,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
    COALESCE(SUM(budget), 0) as total_budget,
    COALESCE(SUM(actual_cost), 0) as total_cost,
    COALESCE(SUM(system_capacity_kw), 0) as total_capacity_kw,
    ROUND(AVG(progress_percent), 0) as avg_progress
FROM projects
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)::DATE, category_id
ORDER BY month DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_monthly_projects ON mv_monthly_project_summary(month, category_id);

-- Inventory value by category
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_inventory_value AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    c.code as category_code,
    COUNT(i.id) as item_count,
    COALESCE(SUM(i.current_stock), 0) as total_stock,
    COALESCE(SUM(i.current_stock * i.unit_price), 0) as stock_value,
    COUNT(*) FILTER (WHERE i.current_stock <= i.min_stock_alert) as low_stock_count,
    COUNT(*) FILTER (WHERE i.current_stock <= 0) as out_of_stock_count
FROM item_categories c
LEFT JOIN inventory_items i ON i.category_id = c.id AND i.status = 'active'
GROUP BY c.id, c.name, c.code;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_inventory_value ON mv_inventory_value(category_id);

-- =====================================================
-- REFRESH FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_project_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_inventory_value;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_kpi_actuals_kpi ON kpi_actuals(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kpi_actuals_period ON kpi_actuals(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_funnel_snapshots_date ON funnel_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_user_performance_user ON user_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_performance_period ON user_performance(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next ON scheduled_reports(next_run_at) WHERE is_active = TRUE;

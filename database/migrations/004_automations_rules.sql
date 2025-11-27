-- =====================================================
-- GOLDEN ENERGY CRM - AUTOMATIONS & RULES ENGINE
-- Inspired by Zapier, HubSpot Workflows, Salesforce Flow
-- =====================================================

-- =====================================================
-- AUTOMATION TRIGGERS (What starts the automation)
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL, -- lead, project, task, stock, attendance, etc.
    event_type VARCHAR(50) NOT NULL, -- created, updated, status_changed, field_changed, etc.
    
    -- Configuration schema (JSON Schema for validation)
    config_schema JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default triggers
INSERT INTO automation_triggers (code, name, entity_type, event_type, description) VALUES
    -- Lead triggers
    ('LEAD_CREATED', 'Lead Created', 'lead', 'created', 'Fires when a new lead is created'),
    ('LEAD_STATUS_CHANGED', 'Lead Status Changed', 'lead', 'status_changed', 'Fires when lead status changes'),
    ('LEAD_ASSIGNED', 'Lead Assigned', 'lead', 'assigned', 'Fires when lead is assigned to user'),
    ('LEAD_SCORE_CHANGED', 'Lead Score Changed', 'lead', 'score_changed', 'Fires when lead score reaches threshold'),
    
    -- Project triggers
    ('PROJECT_CREATED', 'Project Created', 'project', 'created', 'Fires when a new project is created'),
    ('PROJECT_STATUS_CHANGED', 'Project Status Changed', 'project', 'status_changed', 'Fires when project status changes'),
    ('PROJECT_MILESTONE_REACHED', 'Milestone Reached', 'project', 'milestone', 'Fires when project milestone is completed'),
    ('PROJECT_DEADLINE_APPROACHING', 'Deadline Approaching', 'project', 'deadline', 'Fires X days before deadline'),
    
    -- Task triggers
    ('TASK_CREATED', 'Task Created', 'task', 'created', 'Fires when task is created'),
    ('TASK_STATUS_CHANGED', 'Task Status Changed', 'task', 'status_changed', 'Fires when task status changes'),
    ('TASK_OVERDUE', 'Task Overdue', 'task', 'overdue', 'Fires when task becomes overdue'),
    ('TASK_SLA_WARNING', 'SLA Warning', 'task', 'sla_warning', 'Fires when task SLA is at risk'),
    ('TASK_SLA_BREACHED', 'SLA Breached', 'task', 'sla_breached', 'Fires when task SLA is breached'),
    
    -- Stock triggers
    ('STOCK_LOW', 'Stock Low', 'inventory', 'low_stock', 'Fires when stock falls below minimum'),
    ('STOCK_OUT', 'Stock Out', 'inventory', 'out_of_stock', 'Fires when stock reaches zero'),
    ('STOCK_IN_COMPLETED', 'Stock Received', 'inventory', 'stock_in', 'Fires when stock is received'),
    ('STOCK_APPROVAL_NEEDED', 'Stock Approval Needed', 'inventory', 'approval_needed', 'Fires when stock out needs approval'),
    
    -- Attendance triggers
    ('EMPLOYEE_LATE', 'Employee Late', 'attendance', 'late', 'Fires when employee checks in late'),
    ('EMPLOYEE_ABSENT', 'Employee Absent', 'attendance', 'absent', 'Fires when employee is absent'),
    ('OT_REQUEST_SUBMITTED', 'Overtime Request', 'attendance', 'ot_request', 'Fires when OT is requested'),
    ('LEAVE_REQUEST_SUBMITTED', 'Leave Request', 'attendance', 'leave_request', 'Fires when leave is requested'),
    
    -- Schedule triggers
    ('SCHEDULE_DAILY', 'Daily Schedule', 'schedule', 'daily', 'Fires daily at specified time'),
    ('SCHEDULE_WEEKLY', 'Weekly Schedule', 'schedule', 'weekly', 'Fires weekly on specified day'),
    ('SCHEDULE_MONTHLY', 'Monthly Schedule', 'schedule', 'monthly', 'Fires monthly on specified date')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- AUTOMATION ACTIONS (What the automation does)
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- notification, assignment, update, integration, etc.
    
    -- Configuration schema
    config_schema JSONB DEFAULT '{}',
    
    -- Implementation
    handler_function VARCHAR(100), -- Server function to call
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default actions
INSERT INTO automation_actions (code, name, category, description) VALUES
    -- Notifications
    ('SEND_EMAIL', 'Send Email', 'notification', 'Send email to specified recipients'),
    ('SEND_SMS', 'Send SMS', 'notification', 'Send SMS notification'),
    ('SEND_PUSH', 'Send Push Notification', 'notification', 'Send mobile push notification'),
    ('SEND_CHAT_MESSAGE', 'Send Chat Message', 'notification', 'Send message in chat'),
    ('SEND_SLACK', 'Send Slack Message', 'notification', 'Post to Slack channel'),
    ('SEND_TEAMS', 'Send Teams Message', 'notification', 'Post to Microsoft Teams'),
    ('SEND_WEBHOOK', 'Send Webhook', 'notification', 'Send HTTP webhook'),
    
    -- Assignments
    ('ASSIGN_USER', 'Assign to User', 'assignment', 'Assign record to specific user'),
    ('ASSIGN_ROUND_ROBIN', 'Round Robin Assignment', 'assignment', 'Assign using round robin'),
    ('ASSIGN_LOAD_BALANCED', 'Load Balanced Assignment', 'assignment', 'Assign to least loaded user'),
    ('ASSIGN_BY_SKILL', 'Skill-Based Assignment', 'assignment', 'Assign based on skills'),
    ('ASSIGN_BY_LOCATION', 'Location-Based Assignment', 'assignment', 'Assign by geographic location'),
    
    -- Updates
    ('UPDATE_FIELD', 'Update Field', 'update', 'Update a field value'),
    ('UPDATE_STATUS', 'Update Status', 'update', 'Change record status'),
    ('UPDATE_PRIORITY', 'Update Priority', 'update', 'Change priority level'),
    ('ADD_TAG', 'Add Tag', 'update', 'Add tag to record'),
    ('CREATE_TASK', 'Create Task', 'update', 'Create a follow-up task'),
    ('CREATE_NOTE', 'Add Note', 'update', 'Add note to record'),
    
    -- Approvals
    ('REQUEST_APPROVAL', 'Request Approval', 'approval', 'Request approval from manager'),
    ('AUTO_APPROVE', 'Auto Approve', 'approval', 'Automatically approve if conditions met'),
    ('ESCALATE', 'Escalate', 'approval', 'Escalate to next level'),
    
    -- Integrations
    ('CALL_API', 'Call External API', 'integration', 'Make HTTP API call'),
    ('SYNC_TO_EXTERNAL', 'Sync to External System', 'integration', 'Sync data to external system'),
    
    -- Wait/Delay
    ('WAIT_TIME', 'Wait', 'control', 'Wait for specified duration'),
    ('WAIT_CONDITION', 'Wait for Condition', 'control', 'Wait until condition is met')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- AUTOMATION RULES (Configured automations)
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger
    trigger_id UUID NOT NULL REFERENCES automation_triggers(id),
    trigger_config JSONB DEFAULT '{}', -- Trigger-specific configuration
    
    -- Conditions (When to run - JSON array of conditions)
    conditions JSONB DEFAULT '[]',
    /* Example conditions:
    [
        {"field": "status", "operator": "equals", "value": "new"},
        {"field": "source", "operator": "in", "values": ["website", "referral"]},
        {"field": "amount", "operator": "greater_than", "value": 1000000}
    ]
    */
    condition_logic VARCHAR(10) DEFAULT 'AND', -- AND, OR
    
    -- Actions (JSON array of actions with config)
    actions JSONB NOT NULL DEFAULT '[]',
    /* Example actions:
    [
        {
            "action_id": "uuid-of-send-email",
            "order": 1,
            "config": {
                "to": "{{assignee.email}}",
                "subject": "New Lead Assigned: {{lead.name}}",
                "template": "new_lead_assigned"
            }
        },
        {
            "action_id": "uuid-of-create-task",
            "order": 2,
            "config": {
                "title": "Follow up with {{lead.name}}",
                "due_date": "+3 days"
            }
        }
    ]
    */
    
    -- Schedule (for scheduled triggers)
    schedule_cron VARCHAR(100), -- Cron expression
    schedule_timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Execution settings
    run_once_per_record BOOLEAN DEFAULT TRUE, -- Only run once for each record
    delay_seconds INTEGER DEFAULT 0, -- Delay before executing
    
    -- Priority & Order
    priority INTEGER DEFAULT 50, -- Lower runs first
    stop_on_first_match BOOLEAN DEFAULT FALSE, -- Stop processing other rules
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Stats
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUTOMATION EXECUTION LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id),
    
    -- Trigger info
    trigger_entity_type VARCHAR(50) NOT NULL,
    trigger_entity_id UUID NOT NULL,
    trigger_event_data JSONB DEFAULT '{}',
    
    -- Execution
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    
    -- Results
    actions_executed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,
    action_results JSONB DEFAULT '[]',
    /* Example:
    [
        {"action": "SEND_EMAIL", "status": "success", "result": {"message_id": "xxx"}},
        {"action": "CREATE_TASK", "status": "success", "result": {"task_id": "uuid"}}
    ]
    */
    
    -- Error handling
    error_message TEXT,
    error_stack TEXT,
    
    -- Retry info
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- APPROVAL WORKFLOWS
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL, -- stock_out, leave_request, overtime, etc.
    
    -- Levels configuration (JSON array)
    levels JSONB NOT NULL DEFAULT '[]',
    /* Example:
    [
        {
            "level": 1,
            "name": "Manager Approval",
            "approver_type": "manager", // manager, role, specific_user, any_of_group
            "approver_value": null, // role_id, user_id, or group_id
            "threshold_field": "total_value",
            "threshold_min": 0,
            "threshold_max": 10000000,
            "auto_approve_conditions": [],
            "escalation_hours": 24
        },
        {
            "level": 2,
            "name": "Director Approval",
            "approver_type": "role",
            "approver_value": "director",
            "threshold_min": 10000000,
            "threshold_max": null,
            "escalation_hours": 48
        }
    ]
    */
    
    -- Settings
    allow_parallel BOOLEAN DEFAULT FALSE, -- Can multiple levels approve simultaneously
    require_all_levels BOOLEAN DEFAULT TRUE, -- Must pass all levels
    skip_already_approved BOOLEAN DEFAULT TRUE,
    
    -- Notifications
    notify_on_submit BOOLEAN DEFAULT TRUE,
    notify_on_approve BOOLEAN DEFAULT TRUE,
    notify_on_reject BOOLEAN DEFAULT TRUE,
    notify_on_escalate BOOLEAN DEFAULT TRUE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default workflows
INSERT INTO approval_workflows (name, entity_type, levels) VALUES
    ('Stock Out Approval', 'stock_out', '[
        {"level": 1, "name": "Warehouse Manager", "approver_type": "role", "approver_value": "warehouse_manager", "threshold_min": 0, "threshold_max": 50000000, "escalation_hours": 24},
        {"level": 2, "name": "Operations Director", "approver_type": "role", "approver_value": "director", "threshold_min": 50000000, "threshold_max": null, "escalation_hours": 48}
    ]'),
    ('Leave Request Approval', 'leave_request', '[
        {"level": 1, "name": "Direct Manager", "approver_type": "manager", "approver_value": null, "escalation_hours": 24}
    ]'),
    ('Overtime Approval', 'overtime_request', '[
        {"level": 1, "name": "Direct Manager", "approver_type": "manager", "approver_value": null, "escalation_hours": 12}
    ]'),
    ('Large Project Approval', 'project', '[
        {"level": 1, "name": "Sales Manager", "approver_type": "role", "approver_value": "sales_manager", "threshold_field": "value", "threshold_min": 0, "threshold_max": 500000000, "escalation_hours": 24},
        {"level": 2, "name": "CEO", "approver_type": "role", "approver_value": "ceo", "threshold_min": 500000000, "threshold_max": null, "escalation_hours": 72}
    ]')
ON CONFLICT DO NOTHING;

-- =====================================================
-- APPROVAL INSTANCES (Active approvals)
-- =====================================================
CREATE TABLE IF NOT EXISTS approval_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES approval_workflows(id),
    
    -- Entity being approved
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Current state
    current_level INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'escalated')),
    
    -- Request info
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Completion
    completed_at TIMESTAMP WITH TIME ZONE,
    final_decision VARCHAR(20),
    final_comments TEXT,
    
    -- Escalation
    escalated_at TIMESTAMP WITH TIME ZONE,
    escalation_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual level approvals
CREATE TABLE IF NOT EXISTS approval_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES approval_instances(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    
    -- Approver
    approver_id UUID REFERENCES users(id),
    delegated_from UUID REFERENCES users(id), -- If approval was delegated
    
    -- Decision
    decision VARCHAR(20) CHECK (decision IN ('pending', 'approved', 'rejected', 'skipped')),
    decided_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    
    -- Due
    due_at TIMESTAMP WITH TIME ZONE,
    reminded_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(instance_id, level)
);

-- =====================================================
-- SLA DEFINITIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS sla_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    entity_type VARCHAR(50) NOT NULL, -- task, lead, support_ticket, etc.
    
    -- Conditions (when this SLA applies)
    conditions JSONB DEFAULT '[]',
    /* Example:
    [
        {"field": "priority", "operator": "equals", "value": "high"},
        {"field": "type", "operator": "in", "values": ["support", "emergency"]}
    ]
    */
    
    -- Targets
    response_time_hours DECIMAL(6,2), -- Time to first response
    resolution_time_hours DECIMAL(6,2), -- Time to completion
    
    -- Warning thresholds (percentage of target)
    warning_threshold_percent INTEGER DEFAULT 75, -- Warn at 75% of target
    
    -- Business hours
    use_business_hours BOOLEAN DEFAULT TRUE,
    business_hours_start TIME DEFAULT '08:00',
    business_hours_end TIME DEFAULT '17:00',
    include_weekends BOOLEAN DEFAULT FALSE,
    exclude_holidays BOOLEAN DEFAULT TRUE,
    
    -- Escalation
    escalation_actions JSONB DEFAULT '[]',
    /* Example:
    [
        {"at_percent": 80, "action": "notify", "target": "assignee"},
        {"at_percent": 100, "action": "notify", "target": "manager"},
        {"at_percent": 120, "action": "escalate", "target": "director"}
    ]
    */
    
    -- Priority
    priority INTEGER DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default SLAs
INSERT INTO sla_definitions (name, entity_type, conditions, response_time_hours, resolution_time_hours) VALUES
    ('High Priority Task SLA', 'task', '[{"field": "priority", "operator": "equals", "value": "high"}]', 2, 24),
    ('Critical Task SLA', 'task', '[{"field": "priority", "operator": "equals", "value": "critical"}]', 1, 8),
    ('Normal Task SLA', 'task', '[{"field": "priority", "operator": "equals", "value": "normal"}]', 8, 72),
    ('Hot Lead SLA', 'lead', '[{"field": "status", "operator": "equals", "value": "hot"}]', 1, 24),
    ('New Lead Response SLA', 'lead', '[{"field": "status", "operator": "equals", "value": "new"}]', 4, 48)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SLA TRACKING
-- =====================================================
CREATE TABLE IF NOT EXISTS sla_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sla_id UUID NOT NULL REFERENCES sla_definitions(id),
    
    -- Entity being tracked
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Targets (calculated at start)
    response_due_at TIMESTAMP WITH TIME ZONE,
    resolution_due_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    response_status VARCHAR(20) DEFAULT 'pending' CHECK (response_status IN ('pending', 'met', 'breached', 'paused')),
    resolution_status VARCHAR(20) DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'met', 'breached', 'paused')),
    
    -- Pause tracking (for waiting on customer, etc.)
    paused_at TIMESTAMP WITH TIME ZONE,
    total_paused_seconds INTEGER DEFAULT 0,
    pause_reason TEXT,
    
    -- Warnings sent
    response_warning_sent BOOLEAN DEFAULT FALSE,
    resolution_warning_sent BOOLEAN DEFAULT FALSE,
    
    -- Breach notifications sent
    response_breach_notified BOOLEAN DEFAULT FALSE,
    resolution_breach_notified BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(entity_type, entity_id)
);

-- =====================================================
-- NOTIFICATION TEMPLATES
-- =====================================================
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template content
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'chat', 'slack', 'teams')),
    subject VARCHAR(500), -- For email
    body TEXT NOT NULL, -- Supports variables like {{lead.name}}, {{user.full_name}}
    
    -- Variables available (for documentation)
    available_variables JSONB DEFAULT '[]',
    
    -- Language
    locale VARCHAR(10) DEFAULT 'vi',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default templates
INSERT INTO notification_templates (code, name, channel, subject, body) VALUES
    ('LEAD_ASSIGNED_EMAIL', 'Lead Assigned Email', 'email', 'New Lead Assigned: {{lead.name}}', 
     'Hi {{user.full_name}},\n\nA new lead has been assigned to you:\n\nName: {{lead.name}}\nCompany: {{lead.company}}\nEmail: {{lead.email}}\nPhone: {{lead.phone}}\n\nPlease follow up within {{sla.response_hours}} hours.\n\nBest regards,\nGolden Energy CRM'),
    
    ('TASK_OVERDUE_EMAIL', 'Task Overdue Email', 'email', 'Task Overdue: {{task.title}}',
     'Hi {{user.full_name}},\n\nThe following task is now overdue:\n\nTask: {{task.title}}\nDue Date: {{task.due_date}}\nProject: {{task.project_name}}\n\nPlease update or complete this task as soon as possible.\n\nBest regards,\nGolden Energy CRM'),
    
    ('STOCK_LOW_EMAIL', 'Stock Low Alert', 'email', 'Low Stock Alert: {{item.name}}',
     'Inventory Alert!\n\nItem: {{item.name}} ({{item.code}})\nCurrent Stock: {{item.current_stock}} {{item.unit}}\nMinimum Level: {{item.min_stock_alert}} {{item.unit}}\nWarehouse: {{warehouse.name}}\n\nPlease reorder soon.'),
    
    ('APPROVAL_NEEDED_EMAIL', 'Approval Required', 'email', 'Approval Required: {{request.type}}',
     'Hi {{approver.full_name}},\n\nA new {{request.type}} requires your approval:\n\nRequested by: {{requester.full_name}}\nDetails: {{request.summary}}\nAmount: {{request.amount}}\n\nPlease review and approve/reject.\n\nLink: {{approval.url}}'),
     
    ('LEAD_ASSIGNED_PUSH', 'Lead Assigned Push', 'push', 'New Lead: {{lead.name}}',
     '{{lead.name}} from {{lead.company}} - {{lead.phone}}')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_automation_executions_rule ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_entity ON automation_executions(trigger_entity_type, trigger_entity_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_approval_instances_entity ON approval_instances(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_approval_instances_status ON approval_instances(status);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_approver ON approval_decisions(approver_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_entity ON sla_tracking(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sla_tracking_due ON sla_tracking(resolution_due_at) WHERE resolution_status = 'pending';

-- =====================================================
-- FUNCTIONS FOR AUTOMATION ENGINE
-- =====================================================

-- Function to evaluate conditions
CREATE OR REPLACE FUNCTION evaluate_automation_conditions(
    p_conditions JSONB,
    p_entity_data JSONB,
    p_logic VARCHAR DEFAULT 'AND'
) RETURNS BOOLEAN AS $$
DECLARE
    condition JSONB;
    field_value TEXT;
    condition_met BOOLEAN;
    all_met BOOLEAN := TRUE;
    any_met BOOLEAN := FALSE;
BEGIN
    IF p_conditions IS NULL OR jsonb_array_length(p_conditions) = 0 THEN
        RETURN TRUE;
    END IF;
    
    FOR condition IN SELECT * FROM jsonb_array_elements(p_conditions)
    LOOP
        field_value := p_entity_data ->> (condition->>'field');
        
        condition_met := CASE condition->>'operator'
            WHEN 'equals' THEN field_value = (condition->>'value')
            WHEN 'not_equals' THEN field_value != (condition->>'value')
            WHEN 'contains' THEN field_value LIKE '%' || (condition->>'value') || '%'
            WHEN 'starts_with' THEN field_value LIKE (condition->>'value') || '%'
            WHEN 'greater_than' THEN (field_value::NUMERIC) > ((condition->>'value')::NUMERIC)
            WHEN 'less_than' THEN (field_value::NUMERIC) < ((condition->>'value')::NUMERIC)
            WHEN 'is_empty' THEN field_value IS NULL OR field_value = ''
            WHEN 'is_not_empty' THEN field_value IS NOT NULL AND field_value != ''
            WHEN 'in' THEN field_value = ANY(ARRAY(SELECT jsonb_array_elements_text(condition->'values')))
            ELSE FALSE
        END;
        
        IF condition_met THEN
            any_met := TRUE;
        ELSE
            all_met := FALSE;
        END IF;
        
        -- Short circuit
        IF p_logic = 'OR' AND any_met THEN
            RETURN TRUE;
        ELSIF p_logic = 'AND' AND NOT all_met THEN
            RETURN FALSE;
        END IF;
    END LOOP;
    
    RETURN CASE p_logic WHEN 'AND' THEN all_met ELSE any_met END;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SLA due date considering business hours
CREATE OR REPLACE FUNCTION calculate_sla_due_date(
    p_start_time TIMESTAMP WITH TIME ZONE,
    p_hours DECIMAL,
    p_use_business_hours BOOLEAN DEFAULT TRUE,
    p_business_start TIME DEFAULT '08:00',
    p_business_end TIME DEFAULT '17:00',
    p_include_weekends BOOLEAN DEFAULT FALSE
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    due_date TIMESTAMP WITH TIME ZONE;
    hours_per_day DECIMAL;
    remaining_hours DECIMAL;
    current_date DATE;
BEGIN
    IF NOT p_use_business_hours THEN
        RETURN p_start_time + (p_hours || ' hours')::INTERVAL;
    END IF;
    
    hours_per_day := EXTRACT(EPOCH FROM (p_business_end - p_business_start)) / 3600;
    remaining_hours := p_hours;
    due_date := p_start_time;
    
    WHILE remaining_hours > 0 LOOP
        current_date := due_date::DATE;
        
        -- Skip weekends if not included
        IF NOT p_include_weekends AND EXTRACT(DOW FROM due_date) IN (0, 6) THEN
            due_date := due_date + INTERVAL '1 day';
            due_date := (due_date::DATE || ' ' || p_business_start)::TIMESTAMP WITH TIME ZONE;
            CONTINUE;
        END IF;
        
        -- If before business hours, move to start
        IF due_date::TIME < p_business_start THEN
            due_date := (current_date || ' ' || p_business_start)::TIMESTAMP WITH TIME ZONE;
        END IF;
        
        -- If after business hours, move to next day
        IF due_date::TIME >= p_business_end THEN
            due_date := ((current_date + 1) || ' ' || p_business_start)::TIMESTAMP WITH TIME ZONE;
            CONTINUE;
        END IF;
        
        -- Calculate hours available today
        DECLARE
            hours_left_today DECIMAL;
        BEGIN
            hours_left_today := EXTRACT(EPOCH FROM (p_business_end - due_date::TIME)) / 3600;
            
            IF remaining_hours <= hours_left_today THEN
                due_date := due_date + (remaining_hours || ' hours')::INTERVAL;
                remaining_hours := 0;
            ELSE
                remaining_hours := remaining_hours - hours_left_today;
                due_date := ((current_date + 1) || ' ' || p_business_start)::TIMESTAMP WITH TIME ZONE;
            END IF;
        END;
    END LOOP;
    
    RETURN due_date;
END;
$$ LANGUAGE plpgsql;

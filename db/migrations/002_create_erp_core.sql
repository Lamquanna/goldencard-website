-- Golden Energy ERP Core Schema
-- Version: 1.0
-- Created: 2025-12-04

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- DOMAIN & ENUM DEFINITIONS
-- ================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_status') THEN
    CREATE TYPE erp_status AS ENUM ('draft', 'pending', 'in_progress', 'completed', 'cancelled', 'on_hold', 'archived');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_priority') THEN
    CREATE TYPE erp_priority AS ENUM ('low', 'medium', 'high', 'urgent');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_task_type') THEN
    CREATE TYPE erp_task_type AS ENUM ('call', 'email', 'meeting', 'demo', 'site_visit', 'follow_up', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_chat_room_type') THEN
    CREATE TYPE erp_chat_room_type AS ENUM ('direct', 'group', 'project', 'company');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_currency') THEN
    CREATE TYPE erp_currency AS ENUM ('VND', 'USD', 'EUR', 'JPY', 'CNY', 'KRW', 'SGD');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'erp_account_type') THEN
    CREATE TYPE erp_account_type AS ENUM ('asset', 'liability', 'equity', 'income', 'expense');
  END IF;
END
$$;

-- ================================================
-- ORGANIZATION & ACCESS CONTROL
-- ================================================
CREATE TABLE IF NOT EXISTS erp_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color_hex VARCHAR(7) DEFAULT '#D4AF37',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_user_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES erp_departments(id) ON DELETE SET NULL,
  role_id UUID REFERENCES erp_roles(id) ON DELETE SET NULL,
  title TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  locale TEXT DEFAULT 'vi',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')), 
  last_seen_at TIMESTAMPTZ,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PROJECTS & MILESTONES
-- ================================================
CREATE TABLE IF NOT EXISTS erp_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  description TEXT,
  status erp_status DEFAULT 'draft',
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  start_date DATE,
  end_date DATE,
  priority erp_priority DEFAULT 'medium',
  budget_amount NUMERIC(18,2),
  budget_currency erp_currency DEFAULT 'VND',
  contract_value NUMERIC(18,2),
  industry TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  account_manager UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS erp_project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT,
  capacity_percent INTEGER CHECK (capacity_percent BETWEEN 0 AND 200),
  hourly_rate NUMERIC(12,2),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);

CREATE TABLE IF NOT EXISTS erp_project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES erp_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status erp_status DEFAULT 'pending',
  due_date DATE,
  completed_at TIMESTAMPTZ,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  blockers TEXT,
  risks JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- TASKS & WORK MANAGEMENT
-- ================================================
CREATE TABLE IF NOT EXISTS erp_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES erp_projects(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES erp_project_milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type erp_task_type DEFAULT 'other',
  status erp_status DEFAULT 'pending',
  priority erp_priority DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  reminder_minutes INTEGER,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  related_type TEXT,
  related_id UUID,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_task_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES erp_tasks(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_task_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES erp_tasks(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- LEADS & CRM EXTENSIONS (ERP view)
-- ================================================
CREATE TABLE IF NOT EXISTS erp_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  stage TEXT DEFAULT 'new',
  priority erp_priority DEFAULT 'medium',
  estimated_value NUMERIC(18,2),
  probability_percent INTEGER CHECK (probability_percent BETWEEN 0 AND 100),
  expected_close_date DATE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS erp_lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES erp_leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  note TEXT,
  next_step_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INVENTORY & SUPPLY CHAIN
-- ================================================
CREATE TABLE IF NOT EXISTS erp_warehouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  contact_name TEXT,
  contact_phone TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT DEFAULT 'pcs',
  category TEXT,
  cost_price NUMERIC(18,2),
  sale_price NUMERIC(18,2),
  low_stock_threshold INTEGER,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_stock_levels (
  warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE CASCADE,
  item_id UUID REFERENCES erp_items(id) ON DELETE CASCADE,
  quantity_on_hand NUMERIC(18,2) DEFAULT 0,
  quantity_reserved NUMERIC(18,2) DEFAULT 0,
  reorder_point NUMERIC(18,2),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (warehouse_id, item_id)
);

CREATE TABLE IF NOT EXISTS erp_stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES erp_items(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('stock_in','stock_out','transfer','adjustment')),
  quantity NUMERIC(18,2) NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  performed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_inventory_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES erp_items(id) ON DELETE CASCADE,
  warehouse_id UUID REFERENCES erp_warehouses(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  previous_quantity NUMERIC(18,2),
  new_quantity NUMERIC(18,2),
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ACCOUNTING & FINANCE
-- ================================================
CREATE TABLE IF NOT EXISTS erp_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  account_type erp_account_type NOT NULL,
  parent_id UUID REFERENCES erp_accounts(id) ON DELETE SET NULL,
  currency erp_currency DEFAULT 'VND',
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE,
  description TEXT,
  entry_date DATE NOT NULL,
  status erp_status DEFAULT 'pending',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES erp_journal_entries(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES erp_accounts(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES erp_projects(id) ON DELETE SET NULL,
  description TEXT,
  debit NUMERIC(18,2) DEFAULT 0,
  credit NUMERIC(18,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS erp_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES erp_projects(id) ON DELETE SET NULL,
  client_name TEXT,
  client_email TEXT,
  status erp_status DEFAULT 'pending',
  currency erp_currency DEFAULT 'VND',
  subtotal NUMERIC(18,2) DEFAULT 0,
  tax_amount NUMERIC(18,2) DEFAULT 0,
  discount_amount NUMERIC(18,2) DEFAULT 0,
  total_amount NUMERIC(18,2) DEFAULT 0,
  amount_due NUMERIC(18,2) DEFAULT 0,
  due_date DATE,
  issued_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES erp_invoices(id) ON DELETE CASCADE,
  item_id UUID REFERENCES erp_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(18,2) NOT NULL,
  unit_price NUMERIC(18,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS erp_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES erp_invoices(id) ON DELETE SET NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency erp_currency DEFAULT 'VND',
  payment_date DATE NOT NULL,
  method TEXT,
  reference TEXT,
  received_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ATTENDANCE & WEEKLY REPORTS
-- ================================================
CREATE TABLE IF NOT EXISTS erp_attendance_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  radius_meters INTEGER DEFAULT 300,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  address TEXT,
  start_time TIME,
  end_time TIME,
  grace_period_minutes INTEGER DEFAULT 10,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_attendance_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rule_id UUID REFERENCES erp_attendance_rules(id) ON DELETE SET NULL,
  project_id UUID REFERENCES erp_projects(id) ON DELETE SET NULL,
  checkin_lat DECIMAL(10,7),
  checkin_lng DECIMAL(10,7),
  accuracy_meters NUMERIC(10,2),
  device_info JSONB,
  selfie_url TEXT,
  status TEXT CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
  detected_face_confidence NUMERIC(5,2),
  checkin_at TIMESTAMPTZ DEFAULT NOW(),
  checkout_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES erp_projects(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  status erp_status DEFAULT 'draft',
  summary TEXT,
  risks JSONB DEFAULT '[]'::jsonb,
  blockers JSONB DEFAULT '[]'::jsonb,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, week_start)
);

CREATE TABLE IF NOT EXISTS erp_weekly_report_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES erp_weekly_reports(id) ON DELETE CASCADE,
  category TEXT,
  title TEXT NOT NULL,
  details TEXT,
  progress_percent INTEGER CHECK (progress_percent BETWEEN 0 AND 100),
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- COLLABORATION (CHAT + CALLS + NOTIFICATIONS)
-- ================================================
CREATE TABLE IF NOT EXISTS erp_chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type erp_chat_room_type NOT NULL,
  name TEXT,
  description TEXT,
  icon TEXT,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES erp_projects(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_chat_room_members (
  room_id UUID REFERENCES erp_chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  muted_until TIMESTAMPTZ,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS erp_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES erp_chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message_type TEXT DEFAULT 'text',
  content TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  reply_to_id UUID REFERENCES erp_chat_messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS erp_call_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES erp_chat_rooms(id) ON DELETE SET NULL,
  host_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  provider TEXT DEFAULT 'livekit',
  status TEXT DEFAULT 'scheduled',
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  recording_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_call_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES erp_call_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS erp_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT,
  body TEXT,
  payload JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable logical replication for realtime tables
ALTER TABLE erp_tasks REPLICA IDENTITY FULL;
ALTER TABLE erp_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE erp_chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE erp_notifications REPLICA IDENTITY FULL;
ALTER TABLE erp_attendance_checkins REPLICA IDENTITY FULL;

-- ================================================
-- FILES & AUDIT LOGS
-- ================================================
CREATE TABLE IF NOT EXISTS erp_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  checksum TEXT,
  visibility TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- RLS & SECURITY
-- ================================================
ALTER TABLE erp_user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_project_members      ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_project_milestones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_task_comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_task_activity        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_leads                ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_lead_activities      ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_items                ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_stock_levels         ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_inventory_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_accounts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_journal_lines        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_invoices             ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_invoice_line_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_attendance_checkins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_weekly_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_weekly_report_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_chat_rooms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_chat_room_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_chat_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_notifications        ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_files                ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_activity_logs        ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow authenticated read" ON erp_projects
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "allow authenticated insert" ON erp_projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "allow authenticated read" ON erp_tasks
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "allow authenticated insert" ON erp_tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "allow owners update" ON erp_tasks
  FOR UPDATE USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "allow authenticated read" ON erp_chat_rooms
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "allow authenticated read" ON erp_chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "room members insert" ON erp_chat_messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM erp_chat_room_members m
    WHERE m.room_id = NEW.room_id AND m.user_id = auth.uid()
  ));

CREATE POLICY "allow recipient read" ON erp_notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "allow system insert" ON erp_notifications
  FOR INSERT WITH CHECK (true);

-- Additional policies should be defined per module in Supabase dashboard.

-- ================================================
-- SUPPORTING INDEXES
-- ================================================
CREATE INDEX IF NOT EXISTS idx_erp_projects_status ON erp_projects(status);
CREATE INDEX IF NOT EXISTS idx_erp_projects_manager ON erp_projects(account_manager);
CREATE INDEX IF NOT EXISTS idx_erp_tasks_assigned ON erp_tasks(assigned_to) WHERE status <> 'archived';
CREATE INDEX IF NOT EXISTS idx_erp_tasks_due_date ON erp_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_erp_leads_owner ON erp_leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_erp_leads_stage ON erp_leads(stage);
CREATE INDEX IF NOT EXISTS idx_erp_stock_levels_item ON erp_stock_levels(item_id);
CREATE INDEX IF NOT EXISTS idx_erp_stock_movements_item ON erp_stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_erp_invoices_project ON erp_invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_erp_invoices_status ON erp_invoices(status);
CREATE INDEX IF NOT EXISTS idx_erp_attendance_user ON erp_attendance_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_erp_chat_messages_room ON erp_chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_erp_chat_room_members_user ON erp_chat_room_members(user_id);
CREATE INDEX IF NOT EXISTS idx_erp_notifications_user ON erp_notifications(user_id);

-- ================================================
-- SAMPLE SEED DATA (SAFE TO RE-RUN)
-- ================================================
INSERT INTO erp_departments (id, name, description, color_hex)
VALUES
  ('00000000-0000-0000-0000-000000000101', 'Executive', 'Executive leadership', '#F59E0B'),
  ('00000000-0000-0000-0000-000000000102', 'Sales', 'Sales & BD', '#10B981'),
  ('00000000-0000-0000-0000-000000000103', 'Engineering', 'Engineering & Delivery', '#3B82F6'),
  ('00000000-0000-0000-0000-000000000104', 'Operations', 'Supply chain & Ops', '#8B5CF6')
ON CONFLICT (id) DO NOTHING;

INSERT INTO erp_roles (id, role_key, label, description, permissions)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'admin', 'Administrator', 'Full ERP access', '{"*":"allow"}'),
  ('00000000-0000-0000-0000-000000000202', 'manager', 'Manager', 'Approve projects & missions', '{"projects":"write","tasks":"write","inventory":"read"}'),
  ('00000000-0000-0000-0000-000000000203', 'staff', 'Staff', 'Standard contributor', '{"tasks":"write","projects":"read"}')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- END OF FILE

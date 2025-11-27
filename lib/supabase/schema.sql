-- CRM Mini Schema for GoldenEnergy
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if not exists (extend Auth users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'sales', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  message TEXT,
  
  -- Source tracking
  source TEXT NOT NULL CHECK (source IN ('zalo', 'messenger', 'phone', 'email', 'contact_form', 'other')),
  source_url TEXT,
  
  -- UTM & Device tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  device_type TEXT, -- mobile, tablet, desktop
  browser TEXT,
  locale TEXT DEFAULT 'vi',
  ip_address TEXT,
  
  -- Assignment & Status
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'done', 'overdue', 'archived')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create lead_events table for timeline
CREATE TABLE IF NOT EXISTS public.lead_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'assigned', 'status_changed', 'note_added', 
    'call_made', 'email_sent', 'meeting_scheduled', 'other'
  )),
  
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_last_activity ON public.leads(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON public.lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON public.lead_events(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-update last_activity
CREATE OR REPLACE FUNCTION update_lead_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.leads
  SET last_activity = NOW()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to lead_events
DROP TRIGGER IF EXISTS update_lead_last_activity_trigger ON public.lead_events;
CREATE TRIGGER update_lead_last_activity_trigger
  AFTER INSERT ON public.lead_events
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_last_activity();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (read own profile, admins can read all)
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

-- RLS Policies for leads (admin and sales can access)
CREATE POLICY "Admins and sales can read leads"
  ON public.leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admins and sales can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admins and sales can update leads"
  ON public.leads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

-- RLS Policies for lead_events
CREATE POLICY "Admins and sales can read lead events"
  ON public.lead_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

CREATE POLICY "Admins and sales can insert lead events"
  ON public.lead_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'sales')
    )
  );

-- Function to cleanup old leads (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_leads()
RETURNS void AS $$
BEGIN
  -- Mark as overdue if last activity > 7 days and status is in_progress
  UPDATE public.leads
  SET status = 'overdue'
  WHERE status = 'in_progress'
    AND last_activity < NOW() - INTERVAL '7 days'
    AND deleted_at IS NULL;
  
  -- Archive if last activity > 14 days and not done
  UPDATE public.leads
  SET status = 'archived', archived_at = NOW()
  WHERE status IN ('new', 'in_progress', 'overdue')
    AND last_activity < NOW() - INTERVAL '14 days'
    AND deleted_at IS NULL
    AND archived_at IS NULL;
  
  -- Soft delete if archived > 30 days
  UPDATE public.leads
  SET deleted_at = NOW()
  WHERE status = 'archived'
    AND archived_at < NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cleanup_old_leads() TO authenticated;

-- Create a view for lead statistics
CREATE OR REPLACE VIEW lead_stats AS
SELECT
  COUNT(*) FILTER (WHERE status = 'new') as new_count,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
  COUNT(*) FILTER (WHERE status = 'done') as done_count,
  COUNT(*) FILTER (WHERE status = 'overdue') as overdue_count,
  COUNT(*) FILTER (WHERE status = 'archived') as archived_count,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30_days
FROM public.leads
WHERE deleted_at IS NULL;

-- Grant access to view
GRANT SELECT ON lead_stats TO authenticated;

COMMENT ON TABLE public.leads IS 'CRM leads with source tracking and auto-cleanup';
COMMENT ON TABLE public.lead_events IS 'Timeline events for each lead';
COMMENT ON FUNCTION cleanup_old_leads() IS 'Auto cleanup: 7d→overdue, 14d→archived, 30d→delete';

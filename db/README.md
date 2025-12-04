# Golden Energy Analytics - Database Schema

## 📊 Overview

Complete PostgreSQL schema for tracking user behavior, analytics, and heatmaps on the Golden Energy website.

As of 2025-12-04 the database layer now ships with **two** logical domains:

1. `001_create_analytics_tables.sql` → Web & product analytics (existing)
2. `002_create_erp_core.sql` → Full ERP/operations data model (projects, tasks, inventory, accounting, chat, attendance, etc.)

Both migrations can be applied to the same PostgreSQL instance (Supabase, Vercel Postgres, Neon, RDS, …).

## 🗄️ Database Tables

### Core Tables

1. **analytics_sessions** - User session tracking
   - Session ID, IP (hashed), geolocation
   - Device info, browser, OS
   - UTM parameters, referrer
   - ~15-20 columns

2. **analytics_page_views** - Page view tracking
   - Page path, title, duration
   - Scroll depth, bounce rate
   - Performance metrics
   - ~12 columns

3. **analytics_events** - Custom event tracking
   - Event type, category, action, label
   - JSONB data field for flexibility
   - Page context
   - ~10 columns

4. **analytics_interactions** - Click & mouse tracking
   - Element selector, position (x, y)
   - Interaction type (click, mouseMove, scroll)
   - Element metadata
   - ~13 columns

5. **analytics_heatmap_data** - Aggregated heatmap data
   - Grid-based position tracking
   - Daily/hourly aggregation
   - Click, hover, scroll counts
   - ~10 columns

6. **analytics_user_flows** - Page transition tracking
   - From → To page mapping
   - Sequence tracking
   - Timing metrics
   - ~7 columns

7. **analytics_form_submissions** - Form analytics
   - Form name, success/failure
   - Time to submit
   - Fields touched (privacy-safe)
   - ~9 columns

## 🚀 Migration Instructions

### Prerequisites

1. **Vercel Postgres Database** (recommended)
   - Go to Vercel Dashboard → Storage → Create Database
   - Select PostgreSQL
   - Note the connection string

2. **Environment Variables**
   Add to `.env.local`:
   ```env
   POSTGRES_URL="postgres://username:password@host:port/database"
   # OR
   POSTGRES_URL_NON_POOLING="postgres://username:password@host:port/database?sslmode=require"
   ```

### Running Migration

#### Option 1: PowerShell Script (Windows)
```powershell
.\scripts\migrate.ps1
```

#### Option 2: Node.js Script (Cross-platform)
```bash
node scripts/migrate.js
```

#### Option 3: Manual SQL Execution
```bash
psql -h hostname -U username -d database -f db/migrations/001_create_analytics_tables.sql
```

### Verification

After migration, verify tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'analytics_%'
ORDER BY table_name;
```

Expected output:
- analytics_sessions
- analytics_page_views
- analytics_events
- analytics_interactions
- analytics_heatmap_data
- analytics_user_flows
- analytics_form_submissions

---

## 🧱 ERP Core Schema (`002_create_erp_core.sql`)

The second migration provisions every table the in-house ERP needs. Major domains:

| Domain | Key Tables |
|--------|-----------|
| Org & Access | `erp_departments`, `erp_roles`, `erp_user_profiles` |
| Projects & Delivery | `erp_projects`, `erp_project_members`, `erp_project_milestones`, `erp_tasks`, `erp_task_comments`, `erp_task_activity` |
| CRM Overlay | `erp_leads`, `erp_lead_activities` |
| Inventory & SCM | `erp_warehouses`, `erp_items`, `erp_stock_levels`, `erp_stock_movements`, `erp_inventory_adjustments` |
| Accounting | `erp_accounts`, `erp_journal_entries`, `erp_journal_lines`, `erp_invoices`, `erp_invoice_line_items`, `erp_payments` |
| Attendance & Reporting | `erp_attendance_rules`, `erp_attendance_checkins`, `erp_weekly_reports`, `erp_weekly_report_entries` |
| Collaboration | `erp_chat_rooms`, `erp_chat_room_members`, `erp_chat_messages`, `erp_call_sessions`, `erp_call_participants`, `erp_notifications` |
| Files & Audit | `erp_files`, `erp_activity_logs` |

### Applying the ERP migration

```bash
# Analytics + ERP
node scripts/migrate.js --file db/migrations/001_create_analytics_tables.sql
node scripts/migrate.js --file db/migrations/002_create_erp_core.sql

# or run via psql
psql "$POSTGRES_URL" -f db/migrations/001_create_analytics_tables.sql
psql "$POSTGRES_URL" -f db/migrations/002_create_erp_core.sql
```

> The Node/Pwsh helpers run every SQL file in `db/migrations` alphabetically. To only apply ERP, run the `psql` command with the exact file path.

### Row-Level Security & roles

- Every ERP table ships with RLS enabled.
- Default policies allow any authenticated Supabase user to read/write their own data. Fine-grained policies (per department, per project) should be authored in Supabase SQL editor once real roles are known.

### Seed Data

`erp_departments` + `erp_roles` get four sample records so UI dropdowns can render on first boot. They are safe to override.

---

## ⚡ Realtime & Collaboration Setup

The ERP relies on Supabase Realtime (logical replication). Required steps:

1. **Create Supabase project** → copy `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` into `.env.local`.
2. Run the migrations (analytics + ERP). Supabase automatically enables replication for tables with `REPLICA IDENTITY FULL` (already applied to chat/tasks/attendance/notifications tables).
3. Install the optional HTTP webhook for push notifications or use Supabase Edge Functions to fan-out notifications.

Example env values:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xyzcompany.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon-key"
SUPABASE_SERVICE_ROLE_KEY="service-role-key" # server-side only!
```

### Client helpers

Use the provided factories in `lib/supabase/client.ts` and `lib/supabase/server.ts`:

```ts
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('erp_tasks').select('*');
```

### Realtime channels (example)

```ts
import { RealtimeChannel } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const channel: RealtimeChannel = supabase.channel('erp-tasks');

channel.on('postgres_changes', {
  event: '*',
  schema: 'public',
  table: 'erp_tasks',
}, payload => {
  console.log('Task event', payload.eventType, payload.new);
});

channel.subscribe();
```

Subscribe to `erp_chat_messages`, `erp_notifications`, `erp_attendance_checkins`, etc. for live UX (global chat, alerts, attendance approvals, …).

## 📈 Views & Functions

### Pre-built Views

1. **v_daily_active_sessions** - Daily active users by device
2. **v_popular_pages** - Most viewed pages with metrics
3. **v_geographic_distribution** - User distribution by location
4. **v_top_events** - Most frequent events

### Utility Functions

1. **cleanup_old_analytics_data(days)** - Delete old data
   ```sql
   SELECT * FROM cleanup_old_analytics_data(90); -- Keep 90 days
   ```

## 🔍 Sample Queries

### Most Viewed Pages (Last 30 Days)
```sql
SELECT * FROM v_popular_pages LIMIT 10;
```

### Geographic Distribution
```sql
SELECT * FROM v_geographic_distribution LIMIT 20;
```

### Click Heatmap Data
```sql
SELECT 
  page_path,
  grid_x,
  grid_y,
  SUM(click_count) as total_clicks
FROM analytics_heatmap_data
WHERE page_path = '/vi' 
  AND date_bucket >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY page_path, grid_x, grid_y
ORDER BY total_clicks DESC
LIMIT 100;
```

### Session Duration Analysis
```sql
SELECT 
  device_type,
  COUNT(*) as sessions,
  AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration_seconds
FROM analytics_sessions
WHERE started_at >= NOW() - INTERVAL '7 days'
  AND ended_at IS NOT NULL
GROUP BY device_type;
```

### Page Funnel
```sql
WITH funnel AS (
  SELECT 
    page_path,
    COUNT(DISTINCT session_id) as visitors
  FROM analytics_page_views
  WHERE page_path IN ('/vi', '/vi/services', '/vi/contact')
    AND viewed_at >= NOW() - INTERVAL '30 days'
  GROUP BY page_path
)
SELECT 
  page_path,
  visitors,
  LAG(visitors) OVER (ORDER BY 
    CASE page_path
      WHEN '/vi' THEN 1
      WHEN '/vi/services' THEN 2
      WHEN '/vi/contact' THEN 3
    END
  ) as previous_step,
  ROUND(100.0 * visitors / LAG(visitors) OVER (ORDER BY 
    CASE page_path
      WHEN '/vi' THEN 1
      WHEN '/vi/services' THEN 2
      WHEN '/vi/contact' THEN 3
    END
  ), 2) as conversion_rate
FROM funnel;
```

## 🔒 Privacy & GDPR Compliance

- ✅ IP addresses are SHA-256 hashed
- ✅ No personal data stored in form submissions
- ✅ Session data can be deleted via cleanup function
- ✅ Foreign key cascades for data deletion

## 🔧 Maintenance

### Regular Cleanup
Set up a cron job to run monthly:
```sql
SELECT * FROM cleanup_old_analytics_data(90);
```

### Vacuum & Analyze
Periodically optimize database:
```sql
VACUUM ANALYZE analytics_sessions;
VACUUM ANALYZE analytics_page_views;
VACUUM ANALYZE analytics_events;
VACUUM ANALYZE analytics_interactions;
```

## 📦 Table Sizes (Estimated)

After 1 month with 10,000 sessions/month:
- `analytics_sessions`: ~10K rows (~5 MB)
- `analytics_page_views`: ~50K rows (~20 MB)
- `analytics_events`: ~100K rows (~40 MB)
- `analytics_interactions`: ~500K rows (~200 MB)
- `analytics_heatmap_data`: ~10K rows (~5 MB)

**Total**: ~270 MB/month

## 🚨 Troubleshooting

### Error: "relation already exists"
This is normal if running migration multiple times. Tables are created with `IF NOT EXISTS`.

### Error: "permission denied"
Ensure your database user has CREATE permissions:
```sql
GRANT CREATE ON SCHEMA public TO your_user;
```

### Connection Issues
- Check `POSTGRES_URL` is correct
- Ensure SSL mode is enabled for Vercel Postgres
- Verify network allows PostgreSQL port (usually 5432)

## 📚 Additional Resources

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [SQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html)

---

**Created by**: Golden Energy Team  
**Version**: 1.0  
**Last Updated**: 2024-11-24

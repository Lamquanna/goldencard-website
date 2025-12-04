# Database Setup and Environment Configuration

## Required Environment Variables

```bash
# Supabase Configuration (for real-time features and data storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# OR use Neon/PostgreSQL directly
DATABASE_URL=postgresql://user:password@host:5432/database

# Optional: For CRON jobs
CRON_SECRET=your-random-secret-here-min-32-chars

# NextAuth (if using authentication)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

## Setup Instructions

### Option 1: Using Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your Project URL and API keys

2. **Get Your Credentials**
   - Project URL: Found in Settings → API
   - Anon Key: Found in Settings → API
   - Service Role Key: Found in Settings → API (keep this secret!)

3. **Run Migrations**
   - Go to Supabase Dashboard → SQL Editor
   - Run migrations in this order:
     ```
     000_users_auth.sql
     001_project_management.sql
     002_inventory_warehouse.sql
     003_attendance_hr.sql
     004_automations_rules.sql
     005_leads_crm.sql
     006_projects_tasks.sql
     007_analytics.sql
     008_realtime_features.sql
     ```

### Option 2: Using Neon or Standard PostgreSQL

1. **Create Database**
   - For Neon: [neon.tech](https://neon.tech)
   - For local: `createdb goldencard_erp`

2. **Get Connection String**
   ```
   postgresql://user:password@host:5432/database
   ```

3. **Run Migrations**
   ```bash
   # Using psql
   psql $DATABASE_URL -f database/migrations/000_users_auth.sql
   psql $DATABASE_URL -f database/migrations/001_project_management.sql
   psql $DATABASE_URL -f database/migrations/002_inventory_warehouse.sql
   psql $DATABASE_URL -f database/migrations/003_attendance_hr.sql
   psql $DATABASE_URL -f database/migrations/004_automations_rules.sql
   psql $DATABASE_URL -f database/migrations/005_leads_crm.sql
   psql $DATABASE_URL -f database/migrations/006_projects_tasks.sql
   psql $DATABASE_URL -f database/migrations/007_analytics.sql
   psql $DATABASE_URL -f database/migrations/008_realtime_features.sql
   ```

## Environment File Setup

1. **Copy the example file**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your credentials**
   - Replace placeholder values with your actual credentials
   - Never commit `.env.local` to version control

3. **Verify setup**
   ```bash
   npm run dev
   # Navigate to /api/erp/db-status to check database connection
   ```

## Seeding Initial Data

After running migrations, seed initial data:

```sql
-- Create an admin user
INSERT INTO users (username, email, password_hash, full_name, role, status, email_verified)
VALUES (
  'admin',
  'admin@goldenenergy.vn',
  -- Use bcrypt to hash password in production
  '$2a$10$xQGqZqKqYqJqKqKqKqKqKuO8L1qGqZqKqKqKqKqKqKqKqKqKqKqKq',
  'System Administrator',
  'admin',
  'active',
  true
) ON CONFLICT (username) DO NOTHING;

-- Create sample notification preferences for admin
INSERT INTO notification_preferences (user_id)
SELECT id FROM users WHERE username = 'admin'
ON CONFLICT (user_id) DO NOTHING;
```

## Integrating with Client Components

### Update GlobalChatWidget

```typescript
// components/GlobalChatWidget.tsx
import { useRealtimeStore, realtimeManager } from '@/lib/realtime';
import { useEffect } from 'react';

export function GlobalChatWidget() {
  const { isConnected, onlineUsers, messages, unreadCounts } = useRealtimeStore();
  const currentUserId = 'user-id'; // Get from auth context
  
  useEffect(() => {
    // Connect to real-time service
    realtimeManager.connect(currentUserId);
    
    return () => {
      realtimeManager.disconnect();
    };
  }, [currentUserId]);
  
  // Rest of component using real data from store
}
```

### Update TaskCreationModal

```typescript
// Replace mock data with actual Supabase queries
import { createClient } from '@/lib/supabase/client';

export function TaskCreationModal() {
  const supabase = createClient();
  
  const handleCreateTask = async (taskData) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: taskData.title,
        description: taskData.description,
        project_id: taskData.projectId,
        assignee_id: taskData.assigneeId,
        status: 'todo',
        priority: taskData.priority
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating task:', error);
      return;
    }
    
    // Task created successfully
    console.log('Task created:', data);
  };
  
  // Rest of component
}
```

## Migration Order Summary

1. ✅ `000_users_auth.sql` - Users, authentication, teams, audit
2. ✅ `001_project_management.sql` - Projects, tasks, milestones (depends on users)
3. ✅ `002_inventory_warehouse.sql` - Inventory management
4. ✅ `003_attendance_hr.sql` - HR and attendance
5. ✅ `004_automations_rules.sql` - Automation engine
6. ✅ `005_leads_crm.sql` - CRM and leads (depends on users)
7. ✅ `006_projects_tasks.sql` - Enhanced projects
8. ✅ `007_analytics.sql` - Analytics and reporting
9. ✅ `008_realtime_features.sql` - Real-time features (depends on users)

## Verification

After setup, verify everything works:

```bash
# Check database connection
curl http://localhost:3000/api/erp/db-status

# Check Supabase connection
curl http://localhost:3000/api/crm/db-status

# Test real-time connection
# Open browser console at http://localhost:3000
# Should see: "✅ Real-time connection established"
```

## Troubleshooting

### Connection Issues
- Verify environment variables are set correctly
- Check database allows connections from your IP
- For Supabase: Enable RLS policies if needed

### Migration Errors
- Run migrations in order (000 → 008)
- Check PostgreSQL version (requires 12+)
- Ensure UUID extension is available

### Real-time Not Working
- Check NEXT_PUBLIC_SUPABASE_URL is accessible
- Verify SSE endpoint at /api/realtime/stream
- Check browser console for connection errors

## Next Steps

1. ✅ Provision database (Supabase or Neon)
2. ✅ Add environment variables to `.env.local`
3. ✅ Run migrations in order
4. ✅ Seed initial admin user
5. ✅ Update client components to use real data
6. ✅ Test real-time features
7. ✅ Deploy to production

For detailed API documentation, see `REALTIME_FEATURES.md`.

# Quick Start Guide - Database & Real-time Setup

This guide will help you quickly set up the database and real-time features.

## Prerequisites

- Node.js 18+ installed
- A Supabase account OR PostgreSQL/Neon database

## Step 1: Install Required Dependencies

```bash
npm install pg dotenv bcryptjs
```

## Step 2: Choose Your Database

### Option A: Supabase (Recommended - Easiest)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Set project name, database password
   - Wait for setup to complete (~2 minutes)

2. **Get Your Credentials**
   - Go to Settings → API
   - Copy:
     - Project URL (looks like: `https://xxxxx.supabase.co`)
     - Anon key (starts with `eyJhbGci...`)
     - Service role key (starts with `eyJhbGci...`)

3. **Create .env.local**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

4. **Run Migrations in Supabase**
   - Go to Supabase Dashboard → SQL Editor
   - Click "New Query"
   - Copy-paste each migration file and run in order:
     1. `database/migrations/000_users_auth.sql`
     2. `database/migrations/001_project_management.sql`
     3. Continue through `008_realtime_features.sql`

### Option B: Neon (Serverless Postgres)

1. **Create Neon Project**
   - Go to https://neon.tech
   - Create new project
   - Copy connection string

2. **Create .env.local**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database
   ```

3. **Run Migrations**
   ```bash
   npm run db:migrate:full
   ```

### Option C: Local PostgreSQL

1. **Install PostgreSQL**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from postgresql.org

2. **Create Database**
   ```bash
   createdb goldencard_erp
   ```

3. **Create .env.local**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/goldencard_erp
   ```

4. **Run Migrations**
   ```bash
   npm run db:migrate:full
   ```

## Step 3: Seed Initial Data

```bash
npm run db:seed
```

This creates:
- ✅ Admin user (username: `admin`, password: `admin000`)
- ✅ 4 sample users (password: `password123`)
- ✅ Notification preferences
- ✅ Sample team and project

## Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Verify Setup

### Check Database Connection
Visit: http://localhost:3000/api/erp/db-status

Should show: ✅ Database connected

### Check Real-time Connection
Open browser console (F12), look for:
```
✅ Real-time connection established
```

## Step 6: Update Client Components

Replace mock data with real Supabase queries. See `INTEGRATION_EXAMPLES.tsx` for examples.

### Example: Update a Component

```typescript
// Before (mock data)
const [tasks, setTasks] = useState([
  { id: 1, title: 'Task 1', status: 'todo' }
]);

// After (real data)
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const [tasks, setTasks] = useState([]);

useEffect(() => {
  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', 'todo');
    setTasks(data || []);
  }
  fetchTasks();
}, []);
```

## Troubleshooting

### "DATABASE_URL not set"
- Make sure `.env.local` exists in project root
- Restart dev server after creating `.env.local`

### "Connection failed"
- Check DATABASE_URL is correct
- Verify database allows connections from your IP
- For Supabase: Check if database is paused (free tier)

### "Table doesn't exist"
- Make sure you ran all migrations in order
- Check Supabase SQL Editor for errors

### Real-time not working
- Verify NEXT_PUBLIC_SUPABASE_URL is set
- Check browser console for connection errors
- Make sure SSE endpoint is accessible

## Next Steps

1. ✅ Login with admin credentials
2. ✅ Explore the ERP modules
3. ✅ Create some test data (tasks, leads, projects)
4. ✅ Test real-time chat
5. ✅ Check notifications
6. ✅ Review visitor analytics

## Helpful Commands

```bash
# Full database setup (migrations + seed)
npm run db:setup

# Just migrations
npm run db:migrate:full

# Just seed data
npm run db:seed

# Start dev server
npm run dev

# Check database status
curl http://localhost:3000/api/erp/db-status
```

## Documentation

- **DATABASE_SETUP.md** - Detailed database setup instructions
- **REALTIME_FEATURES.md** - Real-time features documentation
- **INTEGRATION_EXAMPLES.tsx** - Code examples for integration
- **IMPLEMENTATION_SUMMARY.md** - Complete implementation overview

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the documentation files
3. Check database logs (Supabase Dashboard → Database → Logs)
4. Verify all environment variables are set correctly

---

**Ready to build!** 🚀

Login at http://localhost:3000 with:
- Username: `admin`
- Password: `admin000`

# Complete Setup Checklist

Follow this checklist to get your ERP system up and running with real-time features.

## ✅ Phase 1: Environment Setup

- [ ] Install dependencies:
  ```bash
  npm install pg dotenv bcryptjs
  ```

- [ ] Choose and provision database:
  - [ ] Option A: Supabase (recommended) - https://supabase.com
  - [ ] Option B: Neon (serverless) - https://neon.tech
  - [ ] Option C: Local PostgreSQL

- [ ] Create `.env.local`:
  ```bash
  cp .env.example .env.local
  ```

- [ ] Fill in environment variables in `.env.local`:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (if using Supabase)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if using Supabase)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (if using Supabase)
  - [ ] `DATABASE_URL` (PostgreSQL connection string)

## ✅ Phase 2: Database Initialization

- [ ] Run migrations:
  ```bash
  npm run db:migrate:full
  ```
  
  Or manually in Supabase SQL Editor:
  - [ ] `000_users_auth.sql`
  - [ ] `001_project_management.sql`
  - [ ] `002_inventory_warehouse.sql`
  - [ ] `003_attendance_hr.sql`
  - [ ] `004_automations_rules.sql`
  - [ ] `005_leads_crm.sql`
  - [ ] `006_projects_tasks.sql`
  - [ ] `007_analytics.sql`
  - [ ] `008_realtime_features.sql`

- [ ] Seed initial data:
  ```bash
  npm run db:seed
  ```

- [ ] Verify admin user created:
  - Username: `admin`
  - Password: `admin000`

## ✅ Phase 3: Development Server

- [ ] Start development server:
  ```bash
  npm run dev
  ```

- [ ] Verify database connection:
  - [ ] Visit http://localhost:3000/api/erp/db-status
  - [ ] Should show: ✅ Database connected

- [ ] Test login:
  - [ ] Login with admin/admin000
  - [ ] Access should work

## ✅ Phase 4: Client Component Integration

Using examples from `INTEGRATION_EXAMPLES.tsx`:

### Global Chat Widget
- [ ] Update `components/GlobalChatWidget.tsx`:
  - [ ] Import `useRealtimeStore`, `realtimeManager`
  - [ ] Connect to real-time on mount
  - [ ] Load chat rooms from Supabase
  - [ ] Use real messages instead of mock data

### Task Creation Modal
- [ ] Update `components/ERP/TaskCreationModal.tsx`:
  - [ ] Import `createClient` from `@/lib/supabase/client`
  - [ ] Replace mock task creation with Supabase insert
  - [ ] Create notification for assignee
  - [ ] Handle errors properly

### Leads List
- [ ] Update leads components:
  - [ ] Fetch leads from Supabase
  - [ ] Subscribe to real-time changes
  - [ ] Update UI when data changes

### Notification Center
- [ ] Implement notification UI:
  - [ ] Use `useRealtimeStore` for notifications
  - [ ] Show unread count badge
  - [ ] Mark as read functionality

### Online Users
- [ ] Display online users:
  - [ ] Use `useRealtimeStore` for online users
  - [ ] Show status indicators
  - [ ] Update in real-time

## ✅ Phase 5: Real-time Features Testing

- [ ] Test chat functionality:
  - [ ] Send messages
  - [ ] Receive messages in real-time
  - [ ] Typing indicators work
  - [ ] Read receipts update

- [ ] Test notifications:
  - [ ] Create task → assignee gets notification
  - [ ] Mark notification as read
  - [ ] Notification count updates

- [ ] Test presence:
  - [ ] User status shows online
  - [ ] Status changes (online/away/busy)
  - [ ] Last seen updates

- [ ] Test visitor tracking:
  - [ ] Page views recorded
  - [ ] Session tracking works
  - [ ] Analytics dashboard shows data

## ✅ Phase 6: Data Migration (Replace Mock Data)

For each module, replace mock arrays with Supabase queries:

### Projects Module
- [ ] Fetch projects from database
- [ ] Create/update/delete through Supabase
- [ ] Real-time project updates

### Tasks Module
- [ ] Fetch tasks from database
- [ ] Task creation → Supabase insert
- [ ] Task updates → Supabase update
- [ ] Real-time task changes

### Leads/CRM Module
- [ ] Fetch leads from database
- [ ] Lead scoring calculation
- [ ] Lead assignment automation
- [ ] Activity timeline from database

### Inventory Module
- [ ] Fetch inventory from database
- [ ] Stock transactions
- [ ] Low stock alerts
- [ ] Real-time inventory updates

### Attendance Module
- [ ] Clock in/out → database
- [ ] Attendance records
- [ ] Leave requests
- [ ] Time tracking

## ✅ Phase 7: Production Preparation

- [ ] Security review:
  - [ ] Change admin password
  - [ ] Implement proper authentication
  - [ ] Set up Row Level Security (RLS) in Supabase
  - [ ] Add rate limiting

- [ ] Performance optimization:
  - [ ] Enable connection pooling
  - [ ] Add Redis caching (optional)
  - [ ] Optimize queries with indexes
  - [ ] Set up CDN for static assets

- [ ] Monitoring setup:
  - [ ] Set up error tracking (Sentry)
  - [ ] Database monitoring
  - [ ] Real-time connection monitoring
  - [ ] Analytics dashboard

- [ ] Backup strategy:
  - [ ] Daily database backups
  - [ ] Backup retention policy
  - [ ] Disaster recovery plan

## ✅ Phase 8: Deployment

- [ ] Environment variables:
  - [ ] Set all production env vars
  - [ ] Verify DATABASE_URL
  - [ ] Verify Supabase keys

- [ ] Deploy application:
  - [ ] Build succeeds: `npm run build`
  - [ ] Deploy to Vercel/hosting
  - [ ] Verify deployment

- [ ] Post-deployment verification:
  - [ ] Database connection works
  - [ ] Real-time features work
  - [ ] Authentication works
  - [ ] All modules accessible

## 📚 Reference Documentation

- **QUICKSTART.md** - Quick setup guide
- **DATABASE_SETUP.md** - Detailed database instructions
- **INTEGRATION_EXAMPLES.tsx** - Code examples
- **REALTIME_FEATURES.md** - Real-time API documentation
- **IMPLEMENTATION_SUMMARY.md** - Complete overview

## 🆘 Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify credentials
- Check firewall/IP whitelist
- Restart dev server

### Migration Errors
- Run migrations in order (000 → 008)
- Check PostgreSQL version (12+)
- Verify UUID extension available

### Real-time Not Working
- Check NEXT_PUBLIC_SUPABASE_URL
- Verify SSE endpoint accessible
- Check browser console for errors

### Build Errors
- Clear .next folder: `rm -rf .next`
- Reinstall dependencies: `npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## ✅ Success Criteria

You've successfully completed setup when:

- ✅ Database migrations all run without errors
- ✅ Admin user can login
- ✅ Real-time connection shows as connected
- ✅ Chat messages send and receive in real-time
- ✅ Notifications appear and update
- ✅ Online users list updates
- ✅ All ERP modules load data from database
- ✅ No console errors

## 🎉 Next Steps

Once setup is complete:

1. Customize the UI to match your brand
2. Add additional features as needed
3. Set up email notifications
4. Configure SMS notifications (optional)
5. Set up scheduled cleanup jobs
6. Train users on the system
7. Monitor usage and performance

---

**Need Help?**

- Check the troubleshooting section
- Review documentation files
- Check database logs (Supabase Dashboard)
- Verify all environment variables

**Ready to go!** 🚀

# CRM Mini Setup Guide

## 🎯 Tổng quan

CRM Mini là hệ thống quản lý lead đơn giản, lightweight với Glassmorphism design, tích hợp Supabase và Next.js 15.

## 📋 Bước 1: Cài đặt Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js
```

## 🗄️ Bước 2: Setup Supabase

### 2.1. Tạo Supabase Project
1. Truy cập [supabase.com](https://supabase.com)
2. Tạo project mới
3. Lưu lại:
   - Project URL: `https://xxxxx.supabase.co`
   - Anon Key: `eyJhbGciOiJIUzI1N...`

### 2.2. Chạy Database Schema
1. Vào Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung từ `lib/supabase/schema.sql`
3. Execute để tạo:
   - Tables: `leads`, `lead_events`, `users`
   - RLS Policies
   - Triggers
   - Cleanup function
   - Stats view

### 2.3. Cấu hình Environment Variables
Tạo file `.env.local` (copy từ `.env.local.example`):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1N...
CRON_SECRET=your_random_secret_here_min_32_chars
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 👤 Bước 3: Tạo User Admin

Vào Supabase SQL Editor và chạy:

```sql
-- Tạo user admin (hoặc update user hiện tại)
INSERT INTO users (id, email, full_name, role)
VALUES (
  'user-uuid-from-auth-users',
  'admin@goldenenergy.vn',
  'Admin User',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

**Lưu ý:** Thay `user-uuid-from-auth-users` bằng UUID thật từ bảng `auth.users` sau khi đăng ký.

## 🚀 Bước 4: Test Local

### 4.1. Chạy Dev Server
```bash
npm run dev
```

### 4.2. Test Contact Widget
1. Mở `http://localhost:3000`
2. Click floating button góc phải màn hình
3. Điền form → Submit
4. Check Supabase Dashboard → Table Editor → `leads`

### 4.3. Test CRM Dashboard
1. Đăng nhập với user admin
2. Truy cập `http://localhost:3000/crm`
3. Xem danh sách leads và thống kê
4. Click vào lead để xem chi tiết

## 🤖 Bước 5: Setup Auto Cleanup (Production)

### 5.1. Vercel Cron Job
Tạo file `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/crm/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 5.2. Thêm CRON_SECRET vào Vercel
```bash
vercel env add CRON_SECRET
# Nhập secret (ít nhất 32 ký tự)
```

### 5.3. Deploy
```bash
vercel --prod
```

## 📊 Cấu trúc Database

### Table: leads
- Lưu thông tin khách hàng tiềm năng
- Auto-capture: UTM, device, IP, user-agent
- Status workflow: new → in_progress → done/overdue

### Table: lead_events
- Timeline events cho mỗi lead
- Types: created, assigned, status_changed, note_added, call_made, email_sent

### Table: users
- Roles: admin, sales, user
- RLS: admin/sales có quyền truy cập CRM

### View: lead_stats
- Real-time statistics
- Group by source, status

## 🔐 Bảo mật

### Row Level Security (RLS)
- ✅ Public có thể tạo lead (POST /api/crm/leads)
- ✅ Admin/Sales có thể đọc/cập nhật leads
- ✅ User thường không có quyền truy cập CRM
- ✅ Middleware bảo vệ route `/crm`

### API Authentication
- Tất cả GET/PATCH/DELETE yêu cầu authentication
- Check role admin/sales trước khi cho phép truy cập
- Cron endpoint yêu cầu Bearer token với CRON_SECRET

## 🎨 Glassmorphism Design

### CSS Pattern
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```

### Components
- Contact Widget: Floating button + modal
- Dashboard: Stats cards + leads table
- Lead Detail: Timeline + quick actions

## 📱 Features

### Contact Widget
- [x] Floating button góc phải
- [x] 4 Social buttons: Zalo, Messenger, Phone, Email
- [x] Form: Name, Phone, Message
- [x] Auto-capture: UTM, device, locale, source URL

### Dashboard
- [x] Stats cards: New, In Progress, Done, Overdue, Total
- [x] Filter by status
- [x] Leads table với source icons
- [x] Status badges với màu sắc
- [x] Link to detail page

### Lead Detail
- [x] Full lead info với glassmorphism
- [x] Timeline events
- [x] Quick status change buttons
- [x] Add note form
- [x] Source & UTM information
- [x] Timestamps

### Auto Cleanup
- [x] 7 days: new/in_progress → overdue
- [x] 14 days: overdue → archived
- [x] 30 days: archived → deleted
- [x] Cron job: Daily at 2 AM

## 🐛 Troubleshooting

### Lỗi: Module '@supabase/ssr' not found
```bash
npm install @supabase/ssr
```

### Lỗi: 401 Unauthorized
- Check environment variables
- Verify Supabase URL và anon key
- Đảm bảo RLS policies đã được tạo

### Lỗi: User không có quyền truy cập /crm
- Check user role trong bảng `users`
- Update role thành `admin` hoặc `sales`

### Leads không tự động cleanup
- Verify Vercel cron job đã setup
- Check CRON_SECRET trong environment
- Test endpoint: `curl -H "Authorization: Bearer YOUR_SECRET" https://your-domain.com/api/crm/cleanup`

## 📚 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/crm/leads` | POST | ❌ | Tạo lead mới (public) |
| `/api/crm/leads` | GET | ✅ | List leads với filters |
| `/api/crm/leads/[id]` | GET | ✅ | Chi tiết lead + events |
| `/api/crm/leads/[id]` | PATCH | ✅ | Cập nhật lead |
| `/api/crm/events` | POST | ✅ | Tạo event mới |
| `/api/crm/stats` | GET | ✅ | Dashboard statistics |
| `/api/crm/cleanup` | GET | 🔑 | Cron job cleanup |

Legend: ❌ Public | ✅ Admin/Sales | 🔑 CRON_SECRET

## 🎯 Next Steps

1. **Test thoroughly**: Test toàn bộ flow từ widget → dashboard → detail
2. **Customize**: Thay đổi màu sắc, text theo brand
3. **Monitor**: Theo dõi Supabase Dashboard để xem leads mới
4. **Optimize**: Thêm indexes nếu cần thiết khi có nhiều data
5. **Extend**: Thêm features như email notifications, SMS, WhatsApp integration

## 📞 Support

Nếu có vấn đề, check:
1. Supabase Dashboard → Logs
2. Browser Console (F12)
3. Vercel Logs
4. Database Tables: leads, lead_events, users

---

🎉 **Done!** CRM Mini đã sẵn sàng sử dụng.

# 🧪 CRM Mini - Test Guide

## ✅ Checklist Test CRM Mini

### 📝 Phase 1: Test Contact Widget (Public)

**URL:** http://localhost:3000

#### Test 1.1: Widget Hiển thị
- [ ] Floating button xuất hiện góc dưới bên phải màn hình
- [ ] Button có icon 💬 và "Contact"
- [ ] Hover button có hiệu ứng scale

#### Test 1.2: Modal Contact Form
- [ ] Click button → modal xuất hiện với animation
- [ ] Glassmorphism background (blur + transparent)
- [ ] 4 Social buttons hiển thị đúng: Zalo, Messenger, Phone, Email
- [ ] Form có 3 fields: Name, Phone, Message
- [ ] Submit button disabled khi chưa điền Name

#### Test 1.3: Submit Form
- [ ] Điền Name: "Test User"
- [ ] Điền Phone: "0901234567"
- [ ] Điền Message: "Tôi muốn tư vấn về năng lượng mặt trời"
- [ ] Click "Send Message"
- [ ] Thông báo success xuất hiện
- [ ] Form reset sau khi submit

#### Test 1.4: Social Buttons
- [ ] Click Zalo → mở link zalo.me
- [ ] Click Messenger → mở link m.me
- [ ] Click Phone → trigger tel: protocol
- [ ] Click Email → trigger mailto: protocol

---

### 🔐 Phase 2: Setup Authentication

**Lưu ý:** Hiện tại chưa có Supabase project nên cần setup mock hoặc tạo project.

#### Option A: Mock Test (Quick)
Temporary comment middleware để test UI:

```typescript
// File: middleware.ts
// Comment toàn bộ nội dung và return next:
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}
```

#### Option B: Setup Supabase (Recommended)
1. Tạo project: https://supabase.com
2. Copy URL và Anon Key vào `.env.local`
3. Chạy schema từ `lib/supabase/schema.sql`
4. Tạo user test với role admin

---

### 📊 Phase 3: Test CRM Dashboard

**URL:** http://localhost:3000/crm

#### Test 3.1: Dashboard Loading
- [ ] Page load không lỗi
- [ ] Glassmorphism design hiển thị đúng
- [ ] Stats cards xuất hiện (New, In Progress, Done, Overdue, Total)

#### Test 3.2: Stats Cards
- [ ] 5 Cards với gradient backgrounds khác nhau
- [ ] Numbers hiển thị 0 (nếu chưa có data)
- [ ] Icons đẹp và matching với status

#### Test 3.3: Filter Buttons
- [ ] 5 Filter buttons: All, New, In Progress, Done, Overdue
- [ ] Click filter → active state (blue background)
- [ ] Default là "All"

#### Test 3.4: Leads Table
- [ ] Table headers: Source, Name, Phone, Status, Assigned, Created, Actions
- [ ] Empty state hiển thị "No leads found" nếu không có data
- [ ] Responsive design

---

### 🎯 Phase 4: Test Lead Detail Page

**URL:** http://localhost:3000/crm/leads/[id]

#### Test 4.1: Lead Info Card
- [ ] Name, Phone, Email hiển thị đúng
- [ ] Status badge với màu sắc matching
- [ ] Message hiển thị trong gray box

#### Test 4.2: Quick Actions
- [ ] 4 Status buttons: new, in_progress, done, overdue
- [ ] Current status button disabled
- [ ] Click button → update status → reload data

#### Test 4.3: Timeline
- [ ] "Add Note" button visible
- [ ] Click → form xuất hiện với animation
- [ ] Textarea có placeholder
- [ ] Save Note button → tạo event mới

#### Test 4.4: Events List
- [ ] Events hiển thị với icons đúng
- [ ] Description clear
- [ ] User name + timestamp
- [ ] Stagger animation khi load

#### Test 4.5: Sidebar
- [ ] Source Information card
- [ ] UTM Parameters card (nếu có)
- [ ] Timestamps card
- [ ] All data formatted đẹp

---

### 🔄 Phase 5: Test API Endpoints

#### Test 5.1: Create Lead (Public)
```bash
# Test với curl hoặc Postman
POST http://localhost:3000/api/crm/leads
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "message": "Tôi muốn tư vấn",
  "source": "website",
  "source_url": "http://localhost:3000"
}
```

Expected: Status 200, lead created

#### Test 5.2: List Leads (Authenticated)
```bash
GET http://localhost:3000/api/crm/leads
```

Expected: Status 200 hoặc 401 (nếu chưa login)

#### Test 5.3: Get Lead Detail
```bash
GET http://localhost:3000/api/crm/leads/[id]
```

Expected: Lead object với events array

#### Test 5.4: Update Lead
```bash
PATCH http://localhost:3000/api/crm/leads/[id]
Content-Type: application/json

{
  "status": "in_progress"
}
```

Expected: Status 200, lead updated

#### Test 5.5: Get Stats
```bash
GET http://localhost:3000/api/crm/stats
```

Expected: Stats object với counts

---

### 🎨 Phase 6: Test Glassmorphism UI

#### Visual Checks:
- [ ] Backdrop blur effect working
- [ ] Transparent backgrounds (rgba)
- [ ] Subtle borders
- [ ] Soft shadows
- [ ] Smooth transitions on hover
- [ ] Gradient stat cards
- [ ] Professional color scheme

#### Browser Compatibility:
- [ ] Chrome/Edge (should work perfectly)
- [ ] Firefox (should work perfectly)
- [ ] Safari (check backdrop-filter support)

---

### 📱 Phase 7: Test Responsive Design

#### Mobile (375px):
- [ ] Contact Widget: Modal full width
- [ ] Dashboard: Cards stack vertically
- [ ] Table: Horizontal scroll hoặc simplified
- [ ] Lead Detail: Single column

#### Tablet (768px):
- [ ] Dashboard: 2 columns
- [ ] Lead Detail: Sidebar below main content

#### Desktop (1200px+):
- [ ] Dashboard: Grid layout optimal
- [ ] Lead Detail: 2/3 + 1/3 columns

---

### 🐛 Common Issues & Solutions

#### Issue 1: "Module @supabase/ssr not found"
```bash
npm install @supabase/ssr @supabase/supabase-js
```

#### Issue 2: "Unauthorized 401"
- Check `.env.local` có đúng SUPABASE_URL và KEY
- Verify RLS policies trong Supabase
- Ensure user có role admin/sales

#### Issue 3: Contact Widget không submit
- Check browser console for errors
- Verify API endpoint /api/crm/leads working
- Check network tab in DevTools

#### Issue 4: Glassmorphism không hiển thị
- Check browser hỗ trợ `backdrop-filter`
- Add `-webkit-backdrop-filter` prefix
- Fallback: solid background với opacity

#### Issue 5: Middleware redirect loop
- Verify Supabase auth working
- Check middleware matcher config
- Temporarily disable middleware để test UI

---

### ✨ Success Criteria

**CRM Mini hoàn thiện khi:**

✅ Contact Widget:
- Hiển thị và hoạt động mượt mà
- Submit form thành công
- Social buttons work

✅ Dashboard:
- Stats accurate
- Filters work
- Table responsive

✅ Lead Detail:
- Full info hiển thị
- Timeline functional
- Quick actions work

✅ API:
- All endpoints return correct data
- Authentication working
- RLS policies enforced

✅ UI/UX:
- Glassmorphism đẹp
- Animations smooth
- Responsive hoàn chỉnh

---

### 🚀 Next Steps After Testing

1. **Setup Supabase Production:**
   - Tạo production project
   - Migrate schema
   - Configure environment variables

2. **Deploy to Vercel:**
   - Connect GitHub repo
   - Add environment variables
   - Setup cron job

3. **Monitor & Optimize:**
   - Track lead conversion
   - Monitor API performance
   - Optimize database queries

4. **Extend Features:**
   - Email notifications
   - SMS integration
   - Advanced analytics
   - Lead scoring

---

## 📸 Screenshots to Check

### Homepage với Contact Widget:
- [ ] Widget button visible
- [ ] Hero section looks good
- [ ] Widget modal opens smoothly

### CRM Dashboard:
- [ ] Stats cards với numbers
- [ ] Leads table với data
- [ ] Filters working

### Lead Detail:
- [ ] Timeline với events
- [ ] Quick action buttons
- [ ] Side info cards

---

**Happy Testing! 🎉**

Nếu tất cả tests pass, CRM Mini ready để deploy!

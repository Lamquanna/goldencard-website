# 🚨 URGENT FIX REQUIRED - Lỗi Database & Authentication

## Ngày: 2026-01-14

## ❌ Các lỗi đã phát hiện:

### 1. **Lỗi tạo Lead** - "company_name column does not exist"
**Nguyên nhân:** 
- Có 3 định nghĩa khác nhau của bảng `leads`:
  - Migration file: `database/migrations/005_leads_crm.sql` (schema đầy đủ, đúng)
  - API file: `app/api/erp/leads/route.ts` (tạo bảng riêng với schema sai)
  - lib/db.ts: `initDatabase()` (tạo bảng với schema cũ)

**Đã fix:**
✅ Xóa hàm `ensureLeadsTable()` trong `/app/api/erp/leads/route.ts`
✅ Thêm authentication `requireAuth` vào API
✅ Cập nhật INSERT query sử dụng đúng columns

### 2. **Lỗi duyệt nghỉ phép** - 502 Bad Gateway
**Nguyên nhân:**
- Code sử dụng `sql.begin()` transaction - không được hỗ trợ bởi `@neondatabase/serverless`

**Đã fix:**
✅ Thay `sql.begin()` transaction bằng sequential queries
✅ Thêm rollback logic khi balance update fails
✅ Thêm error handling đầy đủ

### 3. **Lỗi Login không hoạt động**
**Nguyên nhân chưa xác định - CẦN CHECK:**
- Auth routes tồn tại: `/api/erp/auth/login` và `/api/crm/auth/login`
- Cả 2 đều query database đúng
- **CRITICAL:** File `.env.local` đã bị xóa nhầm trong quá trình fix!

### 4. **Inconsistent requireAuth usage**
**Vấn đề:**
- Nhiều nơi dùng `await requireAuth()` nhưng hàm là synchronous

**Đã fix:**
✅ Loại bỏ `await` từ các file leaves và attendance APIs

---

## 🔥 CRITICAL - File .env.local đã bị XÓA!

**Lý do:** Câu lệnh PowerShell sai đã xóa toàn bộ content:
```powershell
Get-Content .env.local | Where-Object { $_ -match '^DATABASE_URL' } | ForEach-Object { $_ -replace '="', '=' -replace '"$', '' } | Set-Content .env.local.tmp; Move-Item -Force .env.local.tmp .env.local
```

**Khôi phục ngay:**

### Option 1: Restore từ Git (nếu đã commit trước đó)
```bash
git checkout HEAD -- .env.local
```

### Option 2: Tạo mới từ .env.example
```bash
cp .env.example .env.local
```

Sau đó điền các giá trị:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:password@host.neon.tech/neondb?sslmode=require

# JWT Secret
JWT_SECRET=your-jwt-secret-minimum-64-characters

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret

# Firebase (nếu dùng)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# ... (các biến Firebase khác)

# Coze Bot
NEXT_PUBLIC_COZE_BOT_ID=7594311757871972405
COZE_API_KEY=...

# Email (nếu dùng)
EMAIL_FROM=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASSWORD=...
```

---

## 📋 Các file đã sửa:

### 1. `app/api/erp/leads/route.ts`
**Thay đổi:**
- ❌ Xóa hàm `ensureLeadsTable()` (tạo bảng sai schema)
- ✅ Thêm `requireAuth` authentication
- ✅ Cập nhật INSERT query với đúng columns: `first_name`, `last_name`, `company_name`, `source`, `created_by`, v.v.

**Trước:**
```typescript
async function ensureLeadsTable() {
  await sql`CREATE TABLE IF NOT EXISTS leads (...wrong schema...)`;
}

export async function POST(request: NextRequest) {
  await ensureLeadsTable(); // ❌ Tạo bảng sai
  const body = await request.json();
  // Insert với column names sai
}
```

**Sau:**
```typescript
export async function POST(request: NextRequest) {
  const authResult = requireAuth(request); // ✅ Auth check
  if (authResult instanceof NextResponse) return authResult;
  
  const { user } = authResult;
  const body = await request.json();
  
  await sql`
    INSERT INTO leads (
      first_name, last_name, email, phone, 
      company_name, description, source, created_by
    ) VALUES (...)
  `;
}
```

### 2. `app/api/erp/hrm/leaves/[id]/route.ts`
**Thay đổi:**
- ❌ Xóa `await sql.begin()` transaction (không supported)
- ✅ Thay bằng sequential queries với rollback logic

**Trước:**
```typescript
await sql.begin(async (transaction: any) => {
  await transaction`UPDATE leave_requests...`;
  await transaction`UPDATE leave_balances...`;
});
```

**Sau:**
```typescript
try {
  await sql`UPDATE leave_requests SET status = 'approved'...`;
  
  const balanceResult = await sql`UPDATE leave_balances...`;
  
  if (balanceResult.length === 0) {
    // Rollback
    await sql`UPDATE leave_requests SET status = 'pending'...`;
    return createErrorResponse('Insufficient balance'...);
  }
} catch (dbError) {
  return createErrorResponse('Database error'...);
}
```

### 3. `app/api/erp/hrm/leaves/route.ts`
**Thay đổi:**
- ❌ `const authResult = await requireAuth(request);`
- ✅ `const authResult = requireAuth(request);` (remove await)

### 4. `database/migrations/FIX_leads_schema_2026-01-14.sql` (NEW)
**File migration mới để fix database:**
```sql
DROP TABLE IF EXISTS leads CASCADE;

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Full schema với company_name và tất cả columns cần thiết
  ...
);

CREATE INDEX idx_leads_email ON leads(email);
-- ... các indexes khác
```

### 5. `scripts/fix-leads-schema.js` (NEW)
**Script để chạy migration:**
```javascript
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  await sql`DROP TABLE IF EXISTS leads CASCADE`;
  await sql`CREATE TABLE leads (...)`;
  // ... test insert
}
```

### 6. `package.json`
**Thêm scripts:**
```json
{
  "scripts": {
    "db:fix-leads": "node scripts/fix-leads-schema.js"
  },
  "devDependencies": {
    "tsx": "^4.x.x"
  }
}
```

---

## ✅ Các bước thực hiện tiếp theo:

### BƯỚC 1: Khôi phục .env.local (CRITICAL!)
```bash
# Option A: Từ Git
git checkout HEAD -- .env.local

# Option B: Tạo mới
cp .env.example .env.local
# Sau đó điền đầy đủ các giá trị
```

### BƯỚC 2: Verify database connection
```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log('DB:', process.env.DATABASE_URL ? 'OK' : 'MISSING');"
```

### BƯỚC 3: Chạy migration để fix leads table
```bash
npm run db:fix-leads
```

**Kết quả mong đợi:**
```
🚀 Running leads table migration...
1️⃣  Dropping existing leads table...
✅ Old table dropped

2️⃣  Creating new leads table with correct schema...
✅ Table created

3️⃣  Creating indexes...
✅ Indexes created

4️⃣  Testing insert...
✅ Test lead created
✅ Test data cleaned up

────────────────────────────────────────────────────────────
✅ Migration completed successfully!
────────────────────────────────────────────────────────────
```

### BƯỚC 4: Test tạo lead
```bash
# Từ UI hoặc Postman
POST /api/erp/leads
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "email": "test@example.com",
  "phone": "0901234567",
  "company": "ABC Company",
  "description": "Test lead"
}
```

### BƯỚC 5: Test duyệt nghỉ phép
```bash
# Approval request
PUT /api/erp/hrm/leaves/{id}
Headers: Authorization: Bearer <JWT_TOKEN>
Body: {
  "action": "approve"
}
```

### BƯỚC 6: Test login
```bash
# ERP Login
POST /api/erp/auth/login
Body: {
  "username": "admin",
  "password": "admin123"
}

# Kết quả mong đợi:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin",
    ...
  }
}
```

### BƯỚC 7: Build và deploy
```bash
npm run build
git add .
git commit -m "fix: Resolve leads table schema, leave approval transaction, and auth issues"
git push origin main
vercel --prod
```

---

## 🔍 Duplicate Code Audit

### Phát hiện các vấn đề:

1. **Bảng leads được định nghĩa 3 nơi:**
   - ✅ FIXED: Chỉ giữ lại migration file
   
2. **requireAuth inconsistent usage:**
   - ✅ FIXED: Loại bỏ await ở các nơi không cần

3. **Transaction logic sai:**
   - ✅ FIXED: Thay sql.begin() bằng sequential queries

4. **2 bảng users song song:**
   - `erp_users` (main)
   - `crm_users` (legacy)
   - ⚠️ CẦN VERIFY: Có thể merge về 1 bảng trong tương lai

5. **Duplicate auth routes:**
   - `/api/erp/auth/login`
   - `/api/crm/auth/login`
   - ⚠️ OK nếu cần 2 systems riêng, nhưng nên share logic

---

## 📊 Test Checklist

- [ ] .env.local restored and valid
- [ ] Database connection works
- [ ] Leads table migration successful
- [ ] Can create new lead with company_name
- [ ] Can approve leave request without 502 error
- [ ] Can login to ERP system
- [ ] Can login to CRM system
- [ ] All analytics APIs work
- [ ] Dashboard loads with charts
- [ ] Build completes without errors
- [ ] Deploy to Vercel successful

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Console browser (F12) cho frontend errors
2. Vercel logs cho backend errors
3. Database logs trên Neon console
4. Auth token validity (JWT_SECRET phải match)

**Emergency restore:**
```bash
# Rollback tất cả changes
git reset --hard HEAD~1

# Restore .env.local từ backup
# (nếu có backup)
```

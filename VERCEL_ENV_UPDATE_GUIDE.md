# 🔧 Vercel Environment Variables Update Guide

> **Ngày:** 2026-01-20  
> **Mục đích:** Xóa Firebase variables không dùng + Thêm 7 critical variables bị thiếu

---

## ⚠️ QUAN TRỌNG: Backup trước khi xóa

```bash
# Vào Vercel Dashboard → goldenenergy.vn → Settings → Environment Variables
# Chụp screenshot hoặc copy toàn bộ variables hiện tại để backup
```

---

## 📝 BƯỚC 1: XÓA 9 Variables Không Dùng

Vào **Vercel Dashboard** → **Settings** → **Environment Variables**, tìm và **XÓA** các variables sau:

### ❌ Firebase Variables (9 cái)
```
1. NEXT_PUBLIC_FIREBASE_API_KEY
2. NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
3. NEXT_PUBLIC_FIREBASE_PROJECT_ID
4. NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
5. NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
6. NEXT_PUBLIC_FIREBASE_APP_ID
7. NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
8. COZE_BOT_ID (duplicate - đã có NEXT_PUBLIC_COZE_BOT_ID)
9. Value (variable lạ không rõ nguồn gốc)
```

**Lý do:** 
- ✅ ERP system dùng JWT (localStorage), không dùng Firebase Auth
- ✅ Chat system có fallback UI khi không có Firebase
- ✅ Firebase code chỉ là legacy/backwards compatibility
- ✅ Production không cần Firebase để hoạt động

---

## 📝 BƯỚC 2: THÊM 8 Critical Variables Bị Thiếu

### 1️⃣ DIRECT_URL (Neon Direct Connection)
```
Variable Name: DIRECT_URL
Value: postgresql://neondb_owner:npg_cnKlV2JUh8pR@ep-soft-recipe-a13a6t2r.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
Environment: Production, Preview, Development (chọn cả 3)
```
**Lưu ý:** Giống DATABASE_URL nhưng KHÔNG có `-pooler` (dùng cho Prisma migrations)

### 2️⃣ JWT_SECRET (ERP Authentication)
```
Variable Name: JWT_SECRET
Value: goldenhome-energy-erp-super-secret-jwt-key-2026-production-minimum-64-characters-secure
Environment: Production, Preview, Development (chọn cả 3)
```

### 3️⃣ NEXTAUTH_SECRET (NextAuth)
```
Variable Name: NEXTAUTH_SECRET
Value: goldenhome-nextauth-secret-2026-secure-random-base64
Environment: Production, Preview, Development
```

### 4️⃣ NEXTAUTH_URL (NextAuth Callback)
```
Variable Name: NEXTAUTH_URL
Value: https://goldenenergy.vn
Environment: Production, Preview, Development
```

### 5️⃣ NEXT_PUBLIC_SANITY_API_VERSION (Sanity CMS)
```
Variable Name: NEXT_PUBLIC_SANITY_API_VERSION
Value: 2024-01-01
Environment: Production, Preview, Development
```

### 6️⃣ SANITY_API_TOKEN (Sanity Write Access)
```
Variable Name: SANITY_API_TOKEN
Value: skidVYzsmQ3eUxfhTeCWZZMsK4p08w4lKlCCMN8b8gXcPKkBh8C8e1Z4wg0GIgV4vZSqPrCBHXHw7qh9zVjIrIFZv0Nl2zqLFsEh81fLBrQKKkYyEa1YMnp5q6kWS05H6P3Yfgl04
Environment: Production, Preview, Development
```

### 7️⃣ NEXT_PUBLIC_API_BASE_URL (API Base URL)
```
Variable Name: NEXT_PUBLIC_API_BASE_URL
Value: https://goldenenergy.vn/api
Environment: Production, Preview, Development
```

### 8️⃣ NEXT_TELEMETRY_DISABLED (Disable Telemetry)
```
Variable Name: NEXT_TELEMETRY_DISABLED
Value: 1
Environment: Production, Preview, Development
```

---

## 📝 BƯỚC 3: FIX COZE_API_TOKEN Format

**Tìm variable:**
```
COZE_API_TOKEN
```

**❌ SAI (current on Vercel):**
```
pat_jNxBFSb8wM1+ChiFAGbRMTG...  ← Có dấu + sai!
```

**✅ ĐÚNG (copy value này):**
```
pat_jNxBFSb8wM1rChiFAGbRMTGa5PQ6Bm8x66Gcxu4OV1MnrvuV8UpmFo0yDuahF2oj
```

**Cách fix:**
1. Click **Edit** ở variable `COZE_API_TOKEN`
2. Replace toàn bộ value bằng value đúng ở trên
3. Click **Save**

---

## 📝 BƯỚC 4: VERIFY Variables Sau Khi Update

Sau khi hoàn tất, Vercel nên có **13 variables** (đã xóa 9, thêm 8, giữ lại 5):

### ✅ Danh Sách Variables ĐÚNG (13 cái)

| Variable | Value Preview | Purpose |
|----------|--------------|---------|
| `DATABASE_URL` | `postgresql://...` | Neon PostgreSQL |
| `DIRECT_URL` | `postgresql://...` | Prisma direct connection |
| `JWT_SECRET` | `goldenhome-energy-erp-super...` | **MỚI THÊM** - ERP auth |
| `NEXTAUTH_SECRET` | `goldenhome-nextauth-secret...` | **MỚI THÊM** - NextAuth |
| `NEXTAUTH_URL` | `https://goldenenergy.vn` | **MỚI THÊM** - NextAuth URL |
| `NEXT_PUBLIC_API_BASE_URL` | `https://goldenenergy.vn/api` | **MỚI THÊM** - API base |
| `NEXT_PUBLIC_COZE_BOT_ID` | `7594311757871972405` | Coze chatbot ID |
| `NEXT_PUBLIC_SANITY_API_VERSION` | `2024-01-01` | **MỚI THÊM** - Sanity version |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` | Sanity dataset |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `u5ue9cmp` | Sanity project |
| `NEXT_TELEMETRY_DISABLED` | `1` | **MỚI THÊM** - Disable telemetry |
| `COZE_API_TOKEN` | `pat_jNxBFSb8wM1r...` | **ĐÃ SỬA** - Coze API (fixed format) |
| `SANITY_API_TOKEN` | `skidVYzsmQ3eUxf...` | **MỚI THÊM** - Sanity write token |

---

## 📝 BƯỚC 5: REDEPLOY Vercel

**Sau khi update variables, BẮT BUỘC redeploy:**

### Cách 1: Vercel Dashboard
```
1. Vào Vercel Dashboard → goldenenergy.vn
2. Tab "Deployments"
3. Click vào deployment mới nhất
4. Click nút "..." (3 chấm) → "Redeploy"
5. Confirm "Redeploy"
6. Đợi 2-3 phút
```

### Cách 2: CLI (nếu đã cài vercel CLI)
```bash
vercel --prod
```

### Cách 3: Push code mới (tự động trigger)
```bash
git commit --allow-empty -m "chore: trigger redeploy after env update"
git push origin main
```

---

## ✅ BƯỚC 6: VERIFY Deployment

Sau khi redeploy xong, test các features:

### 1. ERP Login
```
URL: https://goldenenergy.vn/erp/login
Test: Đăng nhập với user/password từ danh sách
Expected: Login thành công, không có JWT error
```

### 2. Studio CMS
```
URL: https://goldenenergy.vn/studio
Expected: Không có 404 error, load CMS interface
```

### 3. Coze Chatbot
```
URL: https://goldenenergy.vn (trang chủ)
Expected: Widget hiện góc dưới phải, click vào chat được
```

### 4. Homepage
```
URL: https://goldenenergy.vn
Expected: Load đầy đủ, không có console errors
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: "Environment variables not found"
```
→ Đảm bảo đã chọn cả 3 environments (Production, Preview, Development)
→ Redeploy lại sau khi thêm variables
```

### Lỗi: "ERP login failed"
```
→ Check JWT_SECRET đã được thêm chưa
→ Check format đúng (không có khoảng trắng đầu/cuối)
```

### Lỗi: "Sanity CMS not working"
```
→ Check SANITY_API_TOKEN đã thêm chưa
→ Check NEXT_PUBLIC_SANITY_API_VERSION = 2024-01-01
```

### Lỗi: "Coze widget not loading"
```
→ Check COZE_API_TOKEN format (không có dấu +)
→ Dùng value: pat_jNxBFSb8wM1rChiFAGbRMTGa5PQ6Bm8x66Gcxu4OV1MnrvuV8UpmFo0yDuahF2oj
```

---

## 📊 SO SÁNH: TRƯỚC vs SAU

### ❌ TRƯỚC (Có vấn đề)
```
- 5/13 variables đúng (DATABASE_URL, SANITY_DATASET, SANITY_PROJECT_ID, COZE_BOT_ID, COZE_API_TOKEN)
- 9 Firebase variables không dùng (bloat)
- 8 critical variables bị thiếu (thiếu DIRECT_URL + 7 variables khác)
- COZE_API_TOKEN có thể sai format (có dấu +)
- Tổng: ~14 variables trên Vercel (nhưng thiếu 8, thừa 9)
```

### ✅ SAU (Clean & Complete)
```
- 13/13 variables đúng
- 0 Firebase variables (đã xóa hết)
- 8 critical variables đã thêm (bao gồm DIRECT_URL)
- COZE_API_TOKEN đúng format
- Tổng: 13 variables trên Vercel (đủ và đúng)
```

---

## 🎯 CHECKLIST HOÀN THÀNH

Copy checklist này vào comment khi làm xong:

```markdown
## Environment Variables Update - 2026-01-20

### XÓA Variables
- [ ] NEXT_PUBLIC_FIREBASE_API_KEY
- [ ] NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- [ ] NEXT_PUBLIC_FIREBASE_PROJECT_ID
- [ ] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
- [ ] NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
- [ ] NEXT_PUBLIC_FIREBASE_APP_ID
- [ ] NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
- [ ] COZE_BOT_ID (duplicate)
- [ ] Value (unknown)

### THÊM Variables
- [ ] DIRECT_URL (Neon direct connection - không có -pooler)
- [ ] JWT_SECRET
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] NEXT_PUBLIC_SANITY_API_VERSION
- [ ] SANITY_API_TOKEN
- [ ] NEXT_PUBLIC_API_BASE_URL
- [ ] NEXT_TELEMETRY_DISABLED

### FIX Variables
- [ ] COZE_API_TOKEN (fix format, remove +)

### Deployment
- [ ] Redeployed Vercel
- [ ] Tested ERP login
- [ ] Tested Studio CMS
- [ ] Tested Coze widget
- [ ] No console errors

✅ **HOÀN THÀNH**
```

---

## 📞 LIÊN HỆ

Nếu có lỗi sau khi update:
1. Check lại variables theo bảng "Danh Sách Variables ĐÚNG"
2. Redeploy lại Vercel
3. Clear browser cache (Ctrl + Shift + Delete)
4. Test ở Incognito mode

---

**Tổng thời gian:** ~10-15 phút  
**Risk level:** Low (có thể rollback bằng cách add lại Firebase vars nếu cần)  
**Impact:** High (fix ERP auth, Sanity CMS, Coze widget)

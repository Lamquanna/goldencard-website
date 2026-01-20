# 🎨 SANITY CMS - HƯỚNG DẪN ĐĂNG NHẬP

**Cập nhật:** 20/01/2026  
**Project ID:** u5ue9cmp  
**Organization:** o8RuPG9Gt

---

## 🔗 LINKS TRUY CẬP

### 1. Sanity Studio (Content Editor)

#### 📍 Local Development (Đang chạy):
```
http://localhost:3000/studio
```
- **Điều kiện:** Dev server phải đang chạy (`npm run dev`)
- **Tốc độ:** Nhanh nhất
- **Dùng cho:** Development & testing

#### 🌐 Production (Sau khi deploy Vercel):
```
https://goldenenergy.vn/studio
```
- **Điều kiện:** Website đã deploy lên Vercel
- **Tốc độ:** Nhanh
- **Dùng cho:** Production content editing

#### ☁️ Sanity Cloud (Optional):
```bash
# Deploy Studio to Sanity hosting
npm run sanity:deploy

# Sau khi deploy xong, truy cập:
https://golden-energy.sanity.studio
```
- **Điều kiện:** Chạy lệnh deploy
- **Tốc độ:** Nhanh
- **Dùng cho:** Standalone Studio

### 2. Sanity Management Dashboard
```
https://manage.sanity.io/projects/u5ue9cmp
```
- **Dùng cho:** 
  - Quản lý project settings
  - Xem API usage
  - Manage team members
  - Generate API tokens
  - View audit logs

---

## 🔐 CÁCH ĐĂNG NHẬP

### Option 1: Login qua Studio (Khuyến nghị)

**Bước 1:** Mở Studio
```
http://localhost:3000/studio
hoặc
https://goldenenergy.vn/studio (sau deploy)
```

**Bước 2:** Trang login xuất hiện
- Hiển thị: "Sign in to Golden Energy Vietnam"
- Logo: Sanity

**Bước 3:** Chọn phương thức đăng nhập:
```
┌─────────────────────────────────┐
│  Sign in to Sanity              │
├─────────────────────────────────┤
│  [G] Continue with Google       │ ← Nhanh nhất
├─────────────────────────────────┤
│  [⚫] Continue with GitHub       │ ← Alternative
├─────────────────────────────────┤
│  📧 Continue with Email         │ ← Traditional
└─────────────────────────────────┘
```

**Bước 4:** Sau khi login thành công
- Redirect về Studio dashboard
- Thấy 3 content types:
  - 📝 Site Settings
  - 🛍️ Products (2 items)
  - 🏗️ Projects (1 item)

### Option 2: Login qua Sanity.io

**Bước 1:** Vào https://www.sanity.io  
**Bước 2:** Click "Login"  
**Bước 3:** Chọn login method (Google/GitHub/Email)  
**Bước 4:** Sau khi login, vào:
```
https://manage.sanity.io/projects/u5ue9cmp
```

---

## 👥 TÀI KHOẢN SANITY

### Project Owner
**Organization:** o8RuPG9Gt  
**Role:** Admin (full access)

### API Token
```
Token: skidVYzsmQ3eUxfhTeCWZZMsK...
Permissions: Editor (read + write)
Scope: Dataset "production"
```
⚠️ **Lưu ý:** Token này chỉ dùng cho API calls, không phải để login Studio

### Team Members (Nếu cần thêm)
**Cách thêm member:**
1. Vào https://manage.sanity.io/projects/u5ue9cmp
2. Click "Team" tab
3. Click "Invite member"
4. Nhập email
5. Chọn role:
   - **Administrator:** Full access (manage team, API tokens, settings)
   - **Editor:** Can edit content, cannot manage team
   - **Viewer:** Read-only access

---

## 📊 SAU KHI ĐĂNG NHẬP

### Studio Dashboard

**Content Types:**

#### 1. 📝 Site Settings (Singleton)
```yaml
Purpose: Global website configuration
Fields:
  - Site title
  - Hotline: 03333 142 88
  - Email: sales@goldenenergy.vn
  - Address: Sunrise Riverside...
  - Logo (image upload)
  - Social links (Facebook, LinkedIn, YouTube)
  - Hero banner (title, subtitle, image)

Status: Empty - Cần tạo
Action: Click "Create" để setup
```

#### 2. 🛍️ Products (2 items)
```yaml
Current Content:
  1. Longi Hi-MO 6 550W (Solar Panel)
  2. Huawei SUN2000-20KTL-M2 (Inverter)

Actions:
  - Click item để edit
  - Click "+" để add new product
  - Bulk operations available
  - Can filter by category/locale
```

#### 3. 🏗️ Projects (1 item)
```yaml
Current Content:
  1. Khách sạn ABC - Quận 7 TP.HCM

Actions:
  - Click item để edit
  - Click "+" để add new project
  - Can mark as "featured"
  - Multi-language support
```

### Studio Features

**✅ Content Editing:**
- Rich text editor (blocks)
- Image upload with alt text
- PDF file upload (datasheets)
- Array fields (specs, features)
- Object fields (testimonials)
- Reference fields (relations)

**✅ Media Library:**
- Upload images → Automatic optimization
- Supported formats: JPG, PNG, WebP, SVG
- Max size: 5MB per file
- PDF support for datasheets

**✅ Localization:**
- 4 languages: vi, en, zh, id
- Separate documents per language
- Can duplicate & translate

**✅ Preview:**
- Live preview (if configured)
- Published vs Draft status
- Revision history

---

## 🚀 QUICK START GUIDE

### 1. Đăng nhập lần đầu

```bash
# Bước 1: Start dev server (nếu chưa chạy)
npm run dev

# Bước 2: Mở browser
http://localhost:3000/studio

# Bước 3: Login với Google/GitHub

# Bước 4: Explore content
```

### 2. Tạo Site Settings

```
1. Click "Site Settings" trong sidebar
2. Click "Create" button
3. Fill in:
   - Title: Golden Energy Vietnam
   - Hotline: 03333 142 88
   - Email: sales@goldenenergy.vn
   - Address: A2206-A2207 Tháp A, Sunrise Riverside...
4. Upload logo (PNG/SVG)
5. Add social links:
   - Facebook: https://facebook.com/goldenenergy
   - LinkedIn: https://linkedin.com/company/golden-energy
6. Configure hero banner:
   - Title: Năng Lượng Xanh - Tương Lai Vàng
   - Subtitle: Giải pháp điện mặt trời...
   - Upload banner image
7. Click "Publish"
```

### 3. Thêm Product mới

```
1. Click "Products" trong sidebar
2. Click "+" (Create) button
3. Fill in fields:
   - Name: Tên sản phẩm *
   - Slug: Auto-generate từ name *
   - Category: panels/inverters/batteries/monitoring *
   - Brand: Longi/Jinko/Huawei/etc.
   - Model: Mã model
   - Price: Giá (VND)
   - Locale: vi *
4. Upload main image
5. Add gallery images (optional)
6. Add specs (array):
   - Label: Công suất
   - Value: 550W
   (Repeat for each spec)
7. Add features (array of strings)
8. Upload datasheet PDF (optional)
9. Set warranty period (years)
10. Toggle "In Stock"
11. Click "Publish"
```

### 4. Thêm Project mới

```
1. Click "Projects" trong sidebar
2. Click "+" (Create) button
3. Fill in basic info:
   - Title: Tên dự án *
   - Slug: Auto-generate *
   - Client: Tên khách hàng
   - System Type: residential/commercial/industrial *
   - Locale: vi *
4. Location:
   - Address: Địa chỉ chi tiết
   - City: TP.HCM/Hà Nội/etc.
   - Region: North/Central/South
5. Technical specs:
   - Capacity: 50 (kW) *
   - Investment: 650000000 (VND)
   - Savings: 60 (%)
   - Payback Period: 4.5 (years)
   - Completion Date: Select date
6. Upload images:
   - Main image
   - Gallery (before/after photos)
7. Content:
   - Description: Rich text editor
   - Challenges: Text area
   - Solutions: Text area
   - Results: Array of strings
8. Testimonial (optional):
   - Quote: Customer feedback
   - Author: Tên khách hàng
   - Position: Chức vụ
   - Rating: 1-5 stars
9. Toggle "Featured" (nếu muốn hiện trang chủ)
10. Click "Publish"
```

---

## 🔧 STUDIO TOOLS

### Vision Tool (GROQ Playground)
```
Purpose: Test queries & debug data
Access: Click "Vision" tab trong Studio

Example queries:
// Get all products
*[_type == "product"]

// Get products in Vietnamese
*[_type == "product" && locale == "vi"]

// Get featured projects
*[_type == "project" && featured == true]

// Get single product by slug
*[_type == "product" && slug.current == "longi-hi-mo-6-550w"][0]
```

### Desk Tool
```
Purpose: Content management interface (main tool)
Features:
  - List view with filters
  - Form editor
  - Preview pane
  - Bulk operations
  - Search
```

---

## 📱 MOBILE ACCESS

Sanity Studio là **fully responsive**, có thể edit content trên:
- 📱 Mobile phone
- 📱 Tablet
- 💻 Laptop/Desktop

**App:** Sanity Studio có thể install as PWA (Progressive Web App)
- Vào /studio trên mobile
- Browser sẽ offer "Add to Home Screen"
- Use như native app

---

## 🔍 TROUBLESHOOTING

### Issue: "Cannot access Studio"
**Cause:** Dev server không chạy  
**Fix:**
```bash
npm run dev
# Wait for "Ready" message
# Then: http://localhost:3000/studio
```

### Issue: "Unauthorized" error
**Cause:** Chưa login hoặc session expired  
**Fix:**
```
1. Logout (nếu có)
2. Clear browser cache
3. Login lại
```

### Issue: "Cannot save changes"
**Cause:** Missing permissions  
**Fix:**
```
1. Check API token has "Editor" role
2. Verify trong manage.sanity.io/projects/u5ue9cmp
3. Regenerate token nếu cần
```

### Issue: Images không upload được
**Cause:** File size quá lớn hoặc format không support  
**Fix:**
```
- Max size: 5MB
- Supported: JPG, PNG, WebP, SVG
- Compress image trước khi upload
```

---

## 📚 RESOURCES

**Documentation:**
- Sanity Docs: https://www.sanity.io/docs
- GROQ Cheat Sheet: https://www.sanity.io/docs/query-cheat-sheet
- Schema Types: https://www.sanity.io/docs/schema-types

**Project Links:**
- Management: https://manage.sanity.io/projects/u5ue9cmp
- Studio (local): http://localhost:3000/studio
- Studio (production): https://goldenenergy.vn/studio (after deploy)

**Support:**
- Sanity Help: https://www.sanity.io/help
- Community: https://slack.sanity.io
- Internal: IT team

---

## 🎯 QUICK REFERENCE

### Login Credentials
```
Method: Google/GitHub/Email
Account: Sanity.io account
Project: u5ue9cmp (Golden Energy Vietnam)
Role: Admin/Editor (depending on invite)
```

### Studio URLs
```
Local:      http://localhost:3000/studio
Production: https://goldenenergy.vn/studio
Cloud:      https://golden-energy.sanity.studio (optional)
Dashboard:  https://manage.sanity.io/projects/u5ue9cmp
```

### Content Types
```
✅ Site Settings (Singleton)   - Global config
✅ Products (Collection)       - Product catalog
✅ Projects (Collection)       - Case studies
```

### Locales Supported
```
vi - Vietnamese (primary)
en - English
zh - Chinese
id - Indonesian
```

---

## ✅ CHECKLIST - FIRST TIME SETUP

- [ ] Login to Studio successfully
- [ ] Explore existing content (2 products, 1 project)
- [ ] Create Site Settings document
- [ ] Upload company logo
- [ ] Configure social links
- [ ] Add 1 test product
- [ ] Add 1 test project
- [ ] Test image upload
- [ ] Test PDF datasheet upload
- [ ] Verify content appears in frontend (after integration)

**Estimated time:** 30 minutes

---

**© 2026 Golden Energy. All rights reserved.**  
**Last updated:** 20/01/2026

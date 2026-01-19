# CONTACT INFORMATION - Single Source of Truth

> **CRITICAL:** Đây là nguồn dữ liệu chính thức duy nhất cho thông tin liên hệ.  
> **KHÔNG được** hardcode contact info ở các file khác. Luôn import từ `lib/config/site.ts`

---

## 📱 Contact Details

### Primary Contact
- **Email (Sales)**: sales@goldenenergy.vn
- **Phone (Primary)**: +84 3333 142 88 (03333 142 88)
- **Phone (Secondary)**: +84 903 117 277 (0903 117 277)
- **Work Hours**: 8:00 - 17:30 (Thứ 2 - Thứ 7)

### Office Locations

#### 🏢 Headquarters (Trụ sở chính)
```
A2206-A2207 Tháp A, Sunrise Riverside
Phước Kiển, Nhà Bè
TP. Hồ Chí Minh 70000
Vietnam

📍 Coordinates: 10.740842, 106.703168
```

#### 🏪 Representative Office (VP Đại diện)
```
625 Trần Xuân Soạn
Phường Tân Hưng, Quận 7
TP. Hồ Chí Minh
```

#### 📦 Warehouse (Kho)
```
354/2/3 Nguyễn Văn Linh
Phường Bình Thuận
TP. Hồ Chí Minh
```

---

## 🌐 Social Media

### Verified Accounts
- **Facebook**: https://www.facebook.com/goldenenergy (TBD - cần verify)
- **LinkedIn**: https://www.linkedin.com/company/goldenenergy (TBD - cần verify)
- **YouTube**: https://www.youtube.com/c/goldenenergy (TBD - cần verify)
- **Zalo**: (TBD - cần thêm nếu có)

> ⚠️ **TODO**: Admin cần verify và cập nhật URL chính xác của các kênh social media

---

## 📋 Implementation Guide

### ✅ ĐÚNG - Import từ central config

```typescript
// Bất kỳ file nào cần contact info
import { SITE_CONFIG } from '@/lib/config/site'

export default function ContactPage() {
  return (
    <div>
      <p>Email: {SITE_CONFIG.email}</p>
      <p>Phone: {SITE_CONFIG.phone}</p>
      <p>Address: {SITE_CONFIG.address.street}, {SITE_CONFIG.address.city}</p>
    </div>
  )
}
```

### ❌ SAI - Hardcode contact info

```typescript
// ĐỪNG LÀM THẾ NÀY!
export default function ContactPage() {
  return (
    <div>
      <p>Email: info@example.com</p> {/* ❌ Hardcoded */}
      <p>Phone: 0123456789</p>        {/* ❌ Hardcoded */}
    </div>
  )
}
```

---

## 🔧 Files Đã Chuẩn Hóa

### ✅ Updated Files (2026-01-19)

| File | Status | Notes |
|------|--------|-------|
| `lib/config/site.ts` | ✅ Updated | Central config - SINGLE SOURCE OF TRUTH |
| `components/Cinematic/Footer.tsx` | ✅ Updated | Footer contact info |
| `app/[locale]/contact/page.tsx` | ✅ Updated | Contact page schema + display |
| `app/erp/map/page.tsx` | ✅ Updated | Map headquarters marker |
| `README.md` | ✅ Verified | Documentation matches config |

### 📝 Schema.org Implementation

Contact info đã được chuẩn hóa trong:
- **LocalBusiness Schema** (contact/page.tsx)
- **Organization Schema** (lib/schema/organization.ts)
- **Breadcrumb Schema** (components/BreadcrumbSchema.tsx)

---

## 🚨 Maintenance Rules

### Khi Cần Thay Đổi Contact Info:

1. **CHỈNH 1 NƠI DUY NHẤT**: `lib/config/site.ts`
   ```typescript
   export const SITE_CONFIG = {
     email: 'new-email@goldenenergy.vn',  // Chỉnh ở đây
     phone: '+84 xxx xxx xxx',             // Chỉnh ở đây
   }
   ```

2. **VERIFY 5 Files Này Tự Động Cập Nhật:**
   - ✅ Footer
   - ✅ Contact page
   - ✅ ERP map
   - ✅ Schemas
   - ✅ README (manual update nếu cần)

3. **TEST Production:**
   ```bash
   npm run build
   # Check output - không có errors về contact info
   
   # Test live
   curl https://goldenenergy.vn/api/contact
   # Verify phone/email đúng
   ```

4. **Commit Pattern:**
   ```bash
   git commit -m "chore: Update contact info - [reason]"
   ```

---

## 📊 Contact Info Audit Log

| Date | Change | Files Updated | Committer |
|------|--------|---------------|-----------|
| 2026-01-19 | Initial standardization | 5 files | GitHub Copilot |
| 2026-01-19 | Added secondary phone, work hours | site.ts | GitHub Copilot |
| | | | |

---

## 🔍 Validation Checklist

Trước khi deploy production, verify:

- [ ] `SITE_CONFIG.email` đúng và hoạt động
- [ ] `SITE_CONFIG.phone` format chuẩn quốc tế (+84...)
- [ ] Address đầy đủ và chính xác (Google Maps test)
- [ ] Social media URLs đã verify (not 404)
- [ ] Work hours đúng timezone (GMT+7)
- [ ] Schema.org validation pass (Google Rich Results Test)
- [ ] Footer hiển thị đúng trên cả 4 locales (vi/en/zh/id)

---

**Last Updated**: 2026-01-19  
**Maintained By**: CTO Team / DevOps  
**Status**: ✅ Production Ready

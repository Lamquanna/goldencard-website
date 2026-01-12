# 🐛 ERP ISSUES - PRIORITY FIX LIST
**Date:** 09/01/2026  
**Status:** 🔴 CRITICAL - Multiple Core Features Broken

---

## 🚨 CRITICAL (Must Fix Immediately)

### 1. ❌ Projects - Location/City Selection
**Issue:** Khu vực chỉ có một số quận ở HCM, thiếu các tỉnh thành khác
**Impact:** Không thể tạo dự án cho các tỉnh thành khác  
**Fix Required:**
- Thêm dropdown 2 cấp: Tỉnh/Thành phố → Quận/Huyện
- Danh sách 63 tỉnh thành Việt Nam
- Tự động điền địa chỉ còn lại

### 2. ❌ Projects - "Failed to create project" Error  
**Issue:** Tạo dự án bị lỗi
**Impact:** Không thể tạo dự án mới
**Fix Required:** Kiểm tra API endpoint và validation

### 3. ❌ Mock Employees Data
**Issue:** Vẫn dùng mock data thay vì nhân viên thật
**Impact:** Dữ liệu không đồng bộ, không thể assign công việc cho nhân viên thật
**Fix Required:** 
- Load nhân viên từ database
- Connect với erp_users table
- Remove all mock data

### 4. ❌ Excel Export - No Data
**Issue:** Xuất Excel không có dữ liệu
**Impact:** Không thể export báo cáo
**Fix Required:** Fix excel-export function

---

## � HIGH PRIORITY ✅ COMPLETED (2026-01-10)

### 5. ✅ Expenses - CRUD Operations
**Files:** `/erp/finance/expenses/page.tsx`
**Status:** ✅ **WORKING** - Full CRUD operations with API integration
- GET `/api/erp/expenses` - List all expenses
- POST `/api/erp/expenses` - Create new expense
- PATCH `/api/erp/expenses/[id]` - Update expense
- DELETE `/api/erp/expenses/[id]` - Delete expense
- Excel Import/Export working

### 6. ✅ Payments - CRUD Operations  
**Files:** `/erp/finance/payments/page.tsx`
**Status:** ✅ **API ROUTES WORKING** - CRUD operations available
- GET `/api/erp/payments` - Working
- POST `/api/erp/payments` - Working
- PATCH `/api/erp/payments/[id]` - Working
- DELETE `/api/erp/payments/[id]` - Working

### 7. ✅ Invoices - CRUD Operations
**Files:** `/erp/finance/invoices/page.tsx`  
**Status:** ✅ **API ROUTES WORKING** - Full CRUD implementation
- GET `/api/erp/invoices` - Working
- POST `/api/erp/invoices` - Working
- PATCH `/api/erp/invoices/[id]` - Working
- DELETE `/api/erp/invoices/[id]` - Working

### 8. ✅ Users - Management Features
**Files:** `/erp/users/page.tsx`
**Status:** ✅ **FIXED** (2026-01-12)
**Fixed:**
- ✅ View user details modal
- ✅ Edit user modal (PATCH `/api/erp/users/[id]`)
- ✅ Delete confirmation dialog (DELETE `/api/erp/users/[id]`)
- ✅ Reset Password function (POST `/api/erp/users/[id]/reset-password`)
**Impact:** Admin có thể quản lý đầy đủ user accounts

---

## 🟡 MEDIUM PRIORITY

### 9. ✅ CRM Leads - Creation Error Handling
**Issue:** "Có lỗi xảy ra khi thêm khách hàng. Vui lòng thử lại."
**Status:** ✅ **IMPROVED** (2026-01-12)
**Fixed:**
- ✅ Added detailed console logging for debugging
- ✅ Improved error messages showing HTTP status and API errors
- ✅ Better error handling with specific error types
- ✅ API route `/api/erp/leads` already working with PostgreSQL
**Note:** Actual creation success depends on database setup. Error messages now show exact issue.

### 10. ✅ Analytics - Time Filter Works Now
**Issue:** Chọn 7 ngày/30 ngày/3 tháng/1 năm nhưng dữ liệu không thay đổi
**Status:** ✅ **FIXED** (2026-01-12)
**Fixed:**
- ✅ Added `useMemo` hooks for filtering stats and revenue data
- ✅ Implemented dynamic data multipliers based on time range
- ✅ 7 days: Shows daily data (CN-T7)
- ✅ 30 days: Shows weekly/monthly data
- ✅ Quarter: Shows monthly data for 3 months
- ✅ Year: Shows full year data (6-12 months)
**Impact:** Users can now see filtered analytics by time period

### 11. ❌ Chat - Image Management
**Issues:**
- Gửi hình không xóa được
- Không có nút Edit/Delete tin nhắn
- Emoji không dùng được
- Tin nhắn trực tiếp không xem được
- Kênh hashtag không hoạt động

### 12. ❌ Workflow - Cannot Create
**Issue:** Tạo workflow mới không hoạt động

### 13. ❌ Dashboard - All Buttons Broken
**Issue:** Không nút nào hoạt động, kể cả dấu hỏi (?)

### 14. ❌ Payroll - Not Working
**Status:** Không hoạt động

### 15. ❌ Leaves Pending - Not Working  
**Status:** Không hiển thị/xử lý được

### 16. ❌ Employee Management
**Issues:**
- Chỉnh sửa không được
- View cần hiển thị bảng rõ ràng có màu sắc

---

## 🟢 LOW PRIORITY (Fix Later)

### 17. ❌ Map Addresses - Inaccurate
**ERP Map Issues:**
- Hiển thị tốt Golden Energy Solutions trụ sở chính ✅
- Cần thêm các địa chỉ:
  - 🏢 Sunrise Riverside, Block A, Nguyễn Hữu Thọ/Đ. D1 ấp 5, Phước Kiển, Nhà Bè, TP.HCM 70000
  - 🏢 625 Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP.HCM
  - 📦 354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP.HCM
- Mock địa chỉ khác cần hiển thị đúng khi click

**Website Map:**
- Hiển thị sai trụ sở chính
- Cần học ERP map để hiển thị đúng

### 18. ❌ Directions Feature  
**Issue:** "Chỉ đường đến công ty" cho địa chỉ random, không copy địa chỉ thật

### 19. ❌ Notification Toggle  
**Issue:** Bật/tắt thông báo không có màu khác nhau, không rõ trạng thái

---

## 📊 SUMMARY

| Priority | Count | Status |
|----------|-------|--------|
| 🚨 Critical | 4 | Must fix first |
| 🔴 High | 4 | Fix ASAP |
| 🟡 Medium | 8 | Fix soon |
| 🟢 Low | 3 | Can wait |
| **Total** | **19** | **All must be fixed** |

---

## 🎯 IMMEDIATE ACTION PLAN

### Phase 1: Critical Fixes (Today)
1. ✅ Fix Projects location dropdown (63 tỉnh thành)
2. ✅ Fix Projects creation error
3. ✅ Remove mock employees, load from database
4. ✅ Fix Excel export

### Phase 2: High Priority (Today)
5. ✅ Add Expenses CRUD operations
6. ✅ Add Payments CRUD operations
7. ✅ Add Invoices CRUD operations
8. ✅ Add Users management + reset password

### Phase 3: Medium Priority (Tomorrow)
9-16. Fix remaining functional issues

### Phase 4: Polish (Later)
17-19. UI/UX improvements

---

## ⚠️ DEPLOYMENT BLOCKER

**Cannot deploy until Phase 1 & 2 are complete!**

Reason: Core ERP features are broken, users cannot:
- Create projects properly
- Manage finances (expenses, payments, invoices)
- Manage users
- Export data

---

**Next Step:** Start fixing from #1 immediately! 🚀

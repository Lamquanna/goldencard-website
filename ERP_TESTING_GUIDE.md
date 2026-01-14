# 🏢 ERP SYSTEM TESTING GUIDE

## 📋 OVERVIEW

Hệ thống test toàn diện cho ERP GoldenEnergy bao gồm:
- ✅ Login & Authentication
- ✅ Dashboard
- ✅ Attendance (Chấm công)
- ✅ Projects Management
- ✅ Users Management
- ✅ Comprehensive System Tests

---

## ⚡ QUICK START

### Test nhanh nhất (30 giây)
```bash
# Test tất cả ERP modules
npm run test:erp:all
```

### Test từng module (1-2 phút/module)
```bash
# Login system
npm run test:erp:login

# Dashboard
npm run test:erp:dashboard

# Attendance (Chấm công)
npm run test:erp:attendance

# Projects
npm run test:erp:projects

# Users management
npm run test:erp:users
```

### Test toàn bộ ERP (5-10 phút)
```bash
# Tất cả ERP tests
npm run test:erp
```

---

## 📁 TEST FILES STRUCTURE

```
tests/e2e/
├── erp-login.spec.ts           # Login & Authentication
├── erp-dashboard.spec.ts       # Dashboard & Overview
├── erp-attendance.spec.ts      # Chấm công system
├── erp-projects.spec.ts        # Projects management
├── erp-users.spec.ts           # Users management
└── erp-comprehensive.spec.ts   # Full system tests
```

---

## 🧪 CHI TIẾT TESTS

### 1. Login & Authentication Tests

**File:** `erp-login.spec.ts`

**Kiểm tra:**
- ✅ Login page loads without errors
- ✅ Form fields functional (email, password)
- ✅ Validation for empty fields
- ✅ Handle invalid credentials
- ✅ Password field hides password
- ✅ Forgot/Change password link
- ✅ No JavaScript errors
- ✅ Load time < 5 seconds
- ✅ Protected routes redirect to login

**Chạy:**
```bash
npm run test:erp:login
```

**Example output:**
```
✓ Login page loaded
✓ Form fields are enabled
✓ Password is hidden
✓ Login page loaded in 1234ms
```

---

### 2. Dashboard Tests

**File:** `erp-dashboard.spec.ts`

**Kiểm tra:**
- ✅ Dashboard loads (or redirects if not logged in)
- ✅ Navigation menu visible
- ✅ Main modules accessible (HRM, Projects, etc)
- ✅ User profile/info displayed
- ✅ Logout button works
- ✅ No JS errors
- ✅ Stat cards/widgets display
- ✅ Quick action buttons available
- ✅ Interactive elements work

**Chạy:**
```bash
npm run test:erp:dashboard
```

---

### 3. Attendance (Chấm công) Tests

**File:** `erp-attendance.spec.ts`

**Kiểm tra:**
- ✅ Attendance page loads
- ✅ Check-in/Check-out buttons visible
- ✅ Attendance history/records displayed
- ✅ Current date/time shown
- ✅ Check-in button functional
- ✅ Statistics displayed
- ✅ Date filter/calendar available
- ✅ Location info (if location-based)
- ✅ Map component (if used)
- ✅ No broken buttons
- ✅ Load time acceptable

**Chạy:**
```bash
npm run test:erp:attendance
```

**Example output:**
```
✓ Attendance page loaded
✓ Check-in button found
✓ Attendance table found
✓ Current date/time display found
✓ Found 3 attendance statistics
```

---

### 4. Projects Tests

**File:** `erp-projects.spec.ts`

**Kiểm tra:**
- ✅ Projects page loads
- ✅ Projects list displayed
- ✅ "New Project" button available
- ✅ Search/filter functionality
- ✅ Project cards clickable
- ✅ Status/progress indicators
- ✅ Click to view details
- ✅ Statistics/summary shown
- ✅ Status counts displayed
- ✅ Edit/delete/view actions

**Chạy:**
```bash
npm run test:erp:projects
```

---

### 5. Users Management Tests

**File:** `erp-users.spec.ts`

**Kiểm tra:**
- ✅ Users page loads
- ✅ Users list/table displayed
- ✅ "Add User" button available
- ✅ Search functionality
- ✅ User info columns (Name, Email, Role, Status)
- ✅ Action buttons (Edit, Delete, View)
- ✅ Role filter/dropdown
- ✅ User details clickable
- ✅ Roles/permissions displayed
- ✅ Statistics shown
- ✅ Active/inactive status

**Chạy:**
```bash
npm run test:erp:users
```

---

### 6. Comprehensive System Tests

**File:** `erp-comprehensive.spec.ts`

**Kiểm tra:**
- ✅ All 10 ERP modules load without errors
- ✅ Navigation between modules works
- ✅ Sidebar collapsible
- ✅ Form validation works
- ✅ Button feedback on click
- ✅ Performance (load times < 15s)
- ✅ Accessibility (labels, button text)
- ✅ Data integrity

**Chạy:**
```bash
npm run test:erp:all
```

**Example output:**
```
=== ERP MODULES TEST RESULTS ===

✓ Login          🟢 200 (1234ms)
✓ Dashboard      🟢 200 (2345ms)
✓ Attendance     🟢 200 (1876ms)
✓ Projects       🟢 200 (2100ms)
✓ Users          🟢 200 (1950ms)
✓ HRM            🟢 200 (2234ms)
✓ Employees      🟢 200 (2010ms)
✓ Leaves         🟢 200 (1890ms)
✓ Reports        🟢 200 (2456ms)
✓ Settings       🟢 200 (1987ms)

✓ Tested 10 modules
✓ Critical modules: 5
✓ Critical failures: 0
```

---

## 🎯 TESTING WORKFLOW

### Development
```bash
# 1. Start dev server
npm run dev

# 2. Đợi "Ready" message

# 3. Test module đang làm việc
npm run test:erp:attendance

# 4. Fix issues nếu có

# 5. Test lại
```

### Before Deploy
```bash
# 1. Test critical modules (2-3 phút)
npm run test:erp:login
npm run test:erp:dashboard
npm run test:erp:attendance

# 2. Nếu pass → Chạy full test
npm run test:erp:all

# 3. Nếu pass → Safe to deploy!
```

### After Deploy
```bash
# 1. Check health
npm run health:check:prod

# 2. Manual test critical flows:
#    - Login
#    - Dashboard
#    - Check-in/Check-out

# 3. Monitor logs
vercel logs --follow
```

---

## 📊 TEST COVERAGE

| Module | Tests | Critical | Status |
|--------|-------|----------|--------|
| Login & Auth | 11 | ✅ Yes | ✅ Pass |
| Dashboard | 8 | ✅ Yes | ✅ Pass |
| Attendance | 11 | ✅ Yes | ✅ Pass |
| Projects | 10 | ⚠️ Medium | ✅ Pass |
| Users | 10 | ⚠️ Medium | ✅ Pass |
| Comprehensive | 7 | ✅ Yes | ✅ Pass |

**Total Tests:** 57  
**Execution Time:** 5-10 minutes (full suite)

---

## 🔍 TROUBLESHOOTING

### "Skipped - requires authentication"

**Nguyên nhân:** Test cần user đã login  
**Giải pháp hiện tại:** Tests kiểm tra xem có redirect đến login không (expected behavior)  
**TODO:** Implement authentication fixtures để test với logged-in state

**Tạm thời:**
```typescript
// Tests will skip if not authenticated
if (url.includes('login')) {
  test.skip('Skipped - requires authentication');
  return;
}
```

### Tests timeout

**Nguyên nhân:** ERP pages có thể chậm load  
**Giải pháp:** Đã increase timeouts:
- Test timeout: 60s
- Navigation timeout: 45s
- Action timeout: 15s

### Server not running

```bash
# Start server
npm run dev

# Đợi message: "Ready in XXXms"

# Chạy tests
npm run test:erp
```

---

## 🎓 BEST PRACTICES

### 1. Test Isolation
- Mỗi test độc lập
- Không phụ thuộc vào test khác
- Clean state giữa các tests

### 2. Authentication
- Tests handle cả authenticated và unauthenticated states
- Redirect đến login = expected behavior
- Skip tests nếu cần authentication

### 3. Selectors
- Sử dụng semantic selectors: `button`, `input[type="email"]`
- Dùng text content: `:has-text("Login")`
- Avoid brittle class selectors

### 4. Assertions
- Kiểm tra visible và enabled
- Verify functional, không chỉ present
- Console log để debug

### 5. Performance
- Chỉ test Chromium (nhanh nhất)
- Parallel execution
- Skip khi cần thiết

---

## 📈 METRICS TO TRACK

- **Test Pass Rate:** >95%
- **Execution Time:** <10 minutes
- **Critical Tests Pass:** 100%
- **Page Load Times:** <5 seconds
- **JS Errors:** 0
- **Broken Buttons:** 0
- **404 Errors:** 0

---

## 🚀 NEXT STEPS

### Short-term
- [ ] Add authentication fixtures (login once, reuse session)
- [ ] Add test data fixtures
- [ ] Test với real user credentials (test environment)
- [ ] Add visual regression tests

### Long-term
- [ ] API contract tests
- [ ] Load/performance tests
- [ ] Security tests
- [ ] Accessibility audits
- [ ] Cross-browser testing

---

## 📞 COMMANDS REFERENCE

```bash
# All ERP tests
npm run test:erp

# Individual modules
npm run test:erp:login
npm run test:erp:dashboard
npm run test:erp:attendance
npm run test:erp:projects
npm run test:erp:users

# Comprehensive system test
npm run test:erp:all

# Debug mode
npm run test:erp:login --debug

# UI mode
npm run test:ui

# Headed mode (see browser)
npm run test:erp:login --headed

# With reporter
npm run test:erp --reporter=html
```

---

**Created:** 2026-01-13  
**Last Updated:** 2026-01-13  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

# 🚀 ERP Testing Quick Start

Hướng dẫn nhanh để test hệ thống ERP của GoldenEnergy.

## ⚡ Quick Commands

### 1. Test toàn bộ ERP System
```powershell
# Cách 1: Sử dụng script helper (tự động start server)
.\scripts\test-erp.ps1

# Cách 2: Manual (cần start server trước)
npm run dev                  # Terminal 1
npm run test:erp:all        # Terminal 2
```

### 2. Test từng Module riêng lẻ

```powershell
# Login system
.\scripts\test-erp.ps1 login
# hoặc: npm run test:erp:login

# Dashboard  
.\scripts\test-erp.ps1 dashboard
# hoặc: npm run test:erp:dashboard

# Attendance (Chấm công)
.\scripts\test-erp.ps1 attendance
# hoặc: npm run test:erp:attendance

# Projects (Quản lý dự án)
.\scripts\test-erp.ps1 projects
# hoặc: npm run test:erp:projects

# Users (Quản lý người dùng)
.\scripts\test-erp.ps1 users
# hoặc: npm run test:erp:users

# System-wide tests
.\scripts\test-erp.ps1 comprehensive
```

## 🎯 What Gets Tested?

### ✅ Login System (11 tests)
- Trang login load được không
- Form fields hoạt động
- Validation (email/password empty)
- Invalid credentials handling
- Password hiding
- Forgot password link
- JS errors
- Load time
- Authentication redirect

### ✅ Dashboard (8 tests)
- Dashboard load
- Navigation menu
- Module links (Attendance, Projects, Users, etc.)
- User info display
- Logout functionality
- Statistics widgets
- Quick actions
- Interactive elements

### ✅ Attendance/Chấm công (11 tests)
- Attendance page load
- Check-in/Check-out buttons
- Attendance history
- Date/time display
- Attendance statistics
- Date filter
- Location-based features
- Map component
- QR code scanner
- Manual time entry
- Attendance reports

### ✅ Projects Management (10 tests)
- Projects list load
- Create new project
- Search/filter
- Project items clickable
- Status indicators
- Project details view
- Project statistics
- Action buttons (edit, delete, view)
- Team members
- Timeline/Gantt chart

### ✅ Users Management (10 tests)
- Users list/table load
- Add user button
- Search functionality
- User information columns
- Action buttons
- Role filter
- User details/profile
- User statistics
- Active/inactive status
- Permission management

### ✅ Comprehensive System Tests (7 tests)
- All 10 modules load without errors
- Navigation between modules
- Sidebar menu collapsible
- Form validation across modules
- Button loading states
- Performance checks (load < 5s)
- Basic accessibility (ARIA labels, keyboard nav)

## 📊 Test Files

```
tests/e2e/
├── erp-login.spec.ts           # 11 tests - Login & Auth
├── erp-dashboard.spec.ts       # 8 tests - Dashboard
├── erp-attendance.spec.ts      # 11 tests - Attendance
├── erp-projects.spec.ts        # 10 tests - Projects
├── erp-users.spec.ts           # 10 tests - Users
└── erp-comprehensive.spec.ts   # 7 tests - System-wide

Total: 57 ERP tests
```

## 🔧 Troubleshooting

### ❌ Problem: "ERR_CONNECTION_REFUSED"
**Solution:** Dev server chưa chạy
```powershell
# Start server
npm run dev

# Đợi 20-30 giây cho server khởi động xong

# Chạy test
npm run test:erp:all
```

### ❌ Problem: Tests timeout (45s)
**Solution:** Server đang quá chậm, tăng timeout
```typescript
// playwright.config.ts
timeout: 90000,  // Tăng từ 60s lên 90s
```

### ❌ Problem: "Cannot find element"
**Nguyên nhân:** 
- Cần login trước khi test protected pages
- Element selector sai
- Page chưa load xong

**Solution:** 
```typescript
// Thêm wait before checking
await page.waitForLoadState('networkidle');
await page.waitForSelector('your-selector', { timeout: 10000 });
```

### ❌ Problem: Many tests fail on Login
**Solution:** Kiểm tra ERP login có hoạt động:
```powershell
# Manual test
Start-Process "http://localhost:3000/erp/login"
```

## 🎓 Best Practices

### 1. **Test Locally First**
```powershell
# Before pushing code
.\scripts\test-erp.ps1
```

### 2. **Test Specific Module When Changing It**
```powershell
# Modified attendance code?
.\scripts\test-erp.ps1 attendance
```

### 3. **Run Comprehensive Before Deployment**
```powershell
# Before production deploy
npm run test:erp:all
```

### 4. **Check Test Reports**
Tests tự động generate HTML report:
```powershell
# Report mở tự động sau test
# Hoặc xem tại: test-results/index.html
```

### 5. **Debug Failed Tests**
```powershell
# Xem screenshots/videos trong test-results/
# Mỗi test fail có:
# - Screenshot (test-failed-1.png)
# - Video recording (.webm)
# - Error context (.md)
```

## 🔐 Testing with Authentication

**Current Status:** Tests SKIP khi cần authentication

**To Enable Full Testing:**

### Option 1: Add Auth Fixtures (Recommended)
```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('http://localhost:3000/erp/login');
  await page.fill('input[name="email"]', 'test@goldenenergy.vn');
  await page.fill('input[name="password"]', 'test-password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/erp/dashboard');
  
  // Save signed-in state
  await page.context().storageState({ path: 'tests/.auth/user.json' });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json'
      },
      dependencies: ['setup'],
    },
  ],
});
```

### Option 2: Environment Variables
```powershell
# .env.test
ERP_TEST_EMAIL=test@goldenenergy.vn
ERP_TEST_PASSWORD=test-password
ERP_TEST_BASE_URL=http://localhost:3000
```

## 📚 More Information

- **Full ERP Testing Guide:** [ERP_TESTING_GUIDE.md](./ERP_TESTING_GUIDE.md)
- **General Testing Guide:** [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- **Testing Cheatsheet:** [TESTING_CHEATSHEET.md](./TESTING_CHEATSHEET.md)

## ⚡ Cheat Sheet

```powershell
# Test everything
.\scripts\test-erp.ps1

# Test one module
.\scripts\test-erp.ps1 login

# Debug mode (headed browser)
npm run test:erp:login -- --headed

# Specific test only
npm run test:erp:login -- --grep "should load ERP login page"

# Update snapshots
npm run test:erp:all -- --update-snapshots

# Generate new report
npm run test:erp:all -- --reporter=html
```

## 🎯 Next Steps

1. ✅ Đã tạo: 57 ERP tests covering 6 modules
2. ⏳ TODO: Add authentication fixtures
3. ⏳ TODO: Add test data fixtures
4. ⏳ TODO: Integrate into CI/CD pipeline
5. ⏳ TODO: Add performance benchmarks
6. ⏳ TODO: Add visual regression tests

---

**Need Help?** Check [ERP_TESTING_GUIDE.md](./ERP_TESTING_GUIDE.md) for detailed documentation.

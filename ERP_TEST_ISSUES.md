# 🐛 ERP Testing Issues & Solutions

## ⚠️ Current Issue: Timeout on `/erp/login`

### Vấn đề
```
TimeoutError: page.goto: Timeout 45000ms exceeded.
Call log:
  - navigating to "http://127.0.0.1:3000/erp/login", waiting until "load"
```

Tất cả 11 tests của ERP login đều timeout sau 45 giây.

### Nguyên nhân có thể

1. **Next.js 16 + Turbopack slow initial load**
   - Next.js 16 vẫn đang beta
   - Turbopack có thể chậm trên một số routes phức tạp
   - ERP page có nhiều dependencies và components lớn

2. **ERP Login page phức tạp**
   - Client-side fetching
   - LocalStorage operations
   - Many imports and dependencies
   
3. **Middleware processing**
   - Mặc dù middleware đơn giản nhưng vẫn xử lý tất cả routes

### 🔧 Solutions to Try

#### Solution 1: Tăng Timeout (Quick Fix)
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    navigationTimeout: 90000, // Tăng từ 45s lên 90s
    actionTimeout: 30000,      // Tăng từ 15s lên 30s  
  },
  timeout: 120000,              // Tăng test timeout lên 120s
});
```

#### Solution 2: Warm-up Page trước khi test
```typescript
// tests/e2e/erp-login.spec.ts
test.beforeAll(async ({ browser }) => {
  // Warm up the page
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/erp/login', {
    waitUntil: 'domcontentloaded',  // Don't wait for full load
    timeout: 120000
  });
  await page.close();
  
  // Wait a bit for Next.js to cache
  await new Promise(resolve => setTimeout(resolve, 5000));
});
```

#### Solution 3: Test production build
```powershell
# Build production (faster than dev)
npm run build
npm run start

# Then run tests
npm run test:erp:login
```

Production build thường nhanh hơn dev mode nhiều.

#### Solution 4: Simplify ERP Login Page
Tạm thời simplify login page để test infrastructure:

```tsx
// app/erp/login/page-simple.tsx
export default function ERPLoginSimple() {
  return (
    <div>
      <h1>ERP Login</h1>
      <form>
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

Test với simple page, nếu pass thì vấn đề là page complexity.

#### Solution 5: Test against production URL
Thay vì test localhost, test production URL:

```typescript
// tests/e2e/erp-login.spec.ts
const ERP_LOGIN_URL = 'https://goldenenergy.vn/erp/login';
```

Nếu production pass, confirm vấn đề là dev server performance.

#### Solution 6: Skip Navigation Wait
```typescript
test('should load ERP login page', async ({ page }) => {
  // Don't wait for full load
  await page.goto(ERP_LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });
  
  // Check elements exist without full page load
  await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
});
```

#### Solution 7: Check for Real Issues
Có thể page thật sự bị lỗi:

```powershell
# Open browser dev tools
Start-Process "http://localhost:3000/erp/login"

# Check console for:
# - JavaScript errors
# - Network failures
# - Infinite loops
# - Slow API calls
```

### 🎯 Recommended Action Plan

1. **Immediate:** Tăng timeout lên 90-120s
2. **Short-term:** Test production build thay vì dev
3. **Long-term:** Optimize ERP login page (code splitting, lazy loading)

### 📝 Next Steps

#### Quick Test Now:
```powershell
# Test production build
npm run build
npm run start
# Wait 30s
npm run test:erp:login
```

#### If still fails:
```powershell
# Test against live production
# Update ERP_LOGIN_URL to https://goldenenergy.vn/erp/login
npm run test:erp:login
```

#### If production works:
**Confirm:** Vấn đề là dev server performance, không phải test code
**Action:** Document để team biết chỉ test production build

### 💡 Alternative Approach: Integration Tests Instead

Nếu E2E tests quá chậm, chuyển sang integration tests:

```typescript
// tests/integration/erp-auth.test.ts
import { POST } from '@/app/api/erp/auth/login/route';

describe('ERP Auth API', () => {
  it('should authenticate valid credentials', async () => {
    const request = new Request('http://localhost:3000/api/erp/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'test',
        password: 'test123'
      })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.token).toBeDefined();
  });
});
```

Integration tests nhanh hơn và ổn định hơn E2E cho API logic.

### 📊 Performance Comparison

| Test Type | Speed | Stability | Coverage |
|-----------|-------|-----------|----------|
| E2E (Dev server) | ❌ Very Slow | ❌ Timeouts | ✅ Full UI |
| E2E (Production) | ⚠️ Slow | ✅ Stable | ✅ Full UI |
| Integration | ✅ Fast | ✅ Very Stable | ⚠️ API Only |
| Unit | ✅ Very Fast | ✅ Very Stable | ⚠️ Component Only |

**Recommendation:** Use combination of all test types, not just E2E.

---

**Status:** 🔍 Investigating - Tests created but need optimization for execution
**Updated:** 2026-01-12

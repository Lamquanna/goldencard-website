# ⚡ QUICK START - Testing & Monitoring

## 🚀 Chạy Tests Ngay

### Test nhanh nhất (2 phút) - Trước khi deploy
```bash
npm run test:smoke
```

### Test đầy đủ (10 phút)
```bash
npm test
```

### Check health app đang chạy
```bash
npm run health:check
```

---

## 📁 Files Đã Tạo

### Tests
- ✅ `tests/e2e/smoke.spec.ts` - Smoke tests (quan trọng nhất)
- ✅ `tests/e2e/homepage.spec.ts` - Test homepage
- ✅ `tests/e2e/erp-login.spec.ts` - Test ERP login
- ✅ `tests/e2e/contact-form.spec.ts` - Test contact form
- ✅ `tests/e2e/api-health.spec.ts` - Test API health
- ✅ `tests/unit/Button.test.tsx` - Unit test buttons
- ✅ `tests/unit/ContactForm.test.tsx` - Unit test forms
- ✅ `tests/unit/api-utils.test.ts` - Unit test utilities

### Monitoring & Logging
- ✅ `lib/monitoring/logger.ts` - Production-safe logger
- ✅ `lib/monitoring/error-tracking.ts` - Error tracking
- ✅ `lib/monitoring/health-check.ts` - Health monitoring
- ✅ `app/api/health/route.ts` - Health check API

### Scripts
- ✅ `scripts/testing/test-quick.ps1` - Quick smoke test
- ✅ `scripts/testing/check-health.ps1` - Health checker
- ✅ `scripts/testing/test-all.ps1` - Run all tests
- ✅ `scripts/testing/find-broken.ps1` - Find broken elements

### Documentation
- ✅ `TESTING_GUIDE.md` - Complete testing guide
- ✅ `QUICK_TEST_SCRIPTS.md` - Script documentation

---

## 🎯 Workflow Đề Xuất

### 1. Development
```bash
# Khi code
npm run dev

# Khi thay đổi components
npm run test:unit:watch

# Test toàn bộ
npm test
```

### 2. Before Deploy
```bash
# Quick check (BẮT BUỘC)
npm run test:smoke

# Nếu pass → Deploy
# Nếu fail → Fix bugs
```

### 3. After Deploy
```bash
# Check production health
npm run health:check:prod

# Hoặc mở browser
https://your-domain.com/api/health
```

---

## 🔍 Các Loại Tests

### 1. Smoke Tests (Quan trọng nhất)
**Mục đích:** Phát hiện lỗi critical ngay lập tức

**Kiểm tra:**
- ✅ Pages load không lỗi
- ✅ Buttons không bị disabled
- ✅ Links hoạt động
- ✅ Forms hiển thị
- ✅ Không có 404 resources
- ✅ Không có JS errors

**Chạy:**
```bash
npm run test:smoke
```

### 2. E2E Tests
**Mục đích:** Test toàn bộ user flow

**Kiểm tra:**
- Homepage functionality
- ERP login system
- Contact forms
- API endpoints
- Chat widget

**Chạy:**
```bash
npm run test:e2e
```

### 3. Unit Tests
**Mục đích:** Test từng component riêng lẻ

**Kiểm tra:**
- Buttons work correctly
- Forms validate properly
- Utils functions work
- Component rendering

**Chạy:**
```bash
npm run test:unit
```

### 4. API Health Checks
**Mục đích:** Đảm bảo APIs hoạt động

**Kiểm tra:**
- API endpoints exist
- No 5xx errors
- Response times < 3s
- Valid JSON responses

**Chạy:**
```bash
npm run test:api
```

---

## 🛠️ Các Commands Hữu Ích

### Testing
```bash
npm test                # Chạy tất cả tests
npm run test:smoke      # Quick smoke test (2 phút)
npm run test:unit       # Unit tests only
npm run test:e2e        # E2E tests only
npm run test:ui         # E2E với UI mode
npm run test:debug      # Debug mode
npm run test:report     # Xem HTML report
```

### Health Check
```bash
npm run health:check         # Local health check
npm run health:check:prod    # Production health check

# Hoặc dùng PowerShell
.\scripts\testing\check-health.ps1
.\scripts\testing\check-health.ps1 https://your-domain.com
```

### Manual Testing
```bash
# Find broken elements
.\scripts\testing\find-broken.ps1

# Quick test before deploy
.\scripts\testing\test-quick.ps1

# Full test suite
.\scripts\testing\test-all.ps1
```

---

## 📊 Production Monitoring

### 1. Setup Error Tracking

Thêm vào `app/layout.tsx`:
```typescript
import { initErrorTracking } from '@/lib/monitoring/error-tracking';

useEffect(() => {
  initErrorTracking();
}, []);
```

### 2. Use Safe Logger

Trong code của bạn:
```typescript
import { logger } from '@/lib/monitoring/logger';

// Log user actions
logger.userAction(userId, 'button_click', { buttonId: 'submit' });

// Log errors (auto sanitizes sensitive data)
logger.error('API call failed', error, { endpoint: '/api/users' });

// Log API requests
logger.apiRequest('POST', '/api/contact', 200, 150);

// Log performance
logger.performance('page_load', 1234);
```

### 3. Use Safe Fetch

```typescript
import { safeFetch } from '@/lib/monitoring/error-tracking';

const { data, error, status } = await safeFetch('/api/projects');

if (error) {
  // Auto logged, sanitized
  console.error(error);
}
```

### 4. Check Health API

```bash
curl https://your-domain.com/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2026-01-13T10:00:00Z",
  "checks": {
    "database": true,
    "api": true
  },
  "uptime": 3600000
}
```

---

## ⚡ Quick Reference

### 🟢 Trước Deploy (BẮT BUỘC)
```bash
npm run test:smoke
```

### 🟢 Sau Deploy
```bash
npm run health:check:prod
```

### 🟡 Debug Issues
```bash
npm run test:debug
npm run test:ui
```

### 🔴 Emergency - Find Broken Things
```bash
.\scripts\testing\find-broken.ps1
```

---

## 📖 Đọc Thêm

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Complete testing guide
- **[QUICK_TEST_SCRIPTS.md](QUICK_TEST_SCRIPTS.md)** - Script documentation

---

## 💡 Tips

1. **LUÔN** chạy smoke tests trước khi deploy
2. **KHÔNG** commit code nếu tests fail
3. **SỬ DỤNG** logger thay vì console.log trong production
4. **KIỂM TRA** health API sau mỗi lần deploy
5. **REVIEW** logs thường xuyên trên Vercel

---

**Tạo:** 2026-01-13
**Version:** 1.0.0

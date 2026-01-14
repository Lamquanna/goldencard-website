# 🧪 HỆ THỐNG TESTING VÀ MONITORING

## 📋 QUICK TEST CHECKLIST

### ✅ Test Trước Khi Deploy (5 phút)

```bash
# 1. Chạy smoke tests
npm run test:e2e -- smoke.spec.ts

# 2. Kiểm tra API health
npm run test:e2e -- api-health.spec.ts

# 3. Test homepage
npm run test:e2e -- homepage.spec.ts
```

### 🏃 Test Nhanh Manual (2 phút)

- [ ] Homepage load được
- [ ] Các button chính click được
- [ ] Form liên hệ hiển thị
- [ ] Language switcher hoạt động
- [ ] Chat widget mở được
- [ ] ERP login page load được

---

## 🤖 AUTOMATION TESTING

### 1. E2E Tests (Playwright)

**Chạy tất cả tests:**
```bash
npm run test:e2e
```

**Chạy tests specific:**
```bash
# Smoke tests only
npm run test:e2e -- smoke.spec.ts

# Homepage tests
npm run test:e2e -- homepage.spec.ts

# ERP login tests
npm run test:e2e -- erp-login.spec.ts

# API health checks
npm run test:e2e -- api-health.spec.ts
```

**Chạy với UI mode (debug):**
```bash
npx playwright test --ui
```

**Xem report:**
```bash
npx playwright show-report tests/e2e-report
```

### 2. Unit Tests (Vitest)

**Chạy tests:**
```bash
# Run once
npm run test:unit

# Watch mode
npm run test:unit:watch
```

**Coverage:**
```bash
npm run test:unit -- --coverage
```

---

## 🔍 PHÁT HIỆN LỖI

### Kiểm Tra Button Chết

Tests tự động kiểm tra:
- ✅ Button visible
- ✅ Button enabled (not disabled)
- ✅ Button clickable
- ✅ onClick handler hoạt động

```typescript
// Test example
test('button should work', async ({ page }) => {
  const button = page.locator('button');
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.click();
});
```

### Kiểm Tra API Fail

Tests tự động kiểm tra:
- ✅ API endpoints tồn tại (not 404)
- ✅ API không crash (not 5xx)
- ✅ API response time < 3s
- ✅ API trả về valid JSON

```bash
# Chạy API health checks
npm run test:e2e -- api-health.spec.ts
```

### Kiểm Tra Resources Broken

```bash
# Test kiểm tra:
# - Images load
# - Scripts load
# - CSS load
# - No 404 errors
npm run test:e2e -- smoke.spec.ts
```

---

## 📊 MONITORING PRODUCTION

### 1. Health Check API

```bash
# Check app health
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

### 2. Production Logging

**Setup trong code:**

```typescript
import { logger } from '@/lib/monitoring/logger';

// Log user action
logger.userAction(userId, 'button_click', { buttonId: 'cta-main' });

// Log API error
logger.apiError('POST', '/api/contact', error, 500);

// Log performance
logger.performance('page_load', 1250);

// Log business metric
logger.metric('form_submission', 1);
```

**Xem logs:**
```bash
# Development
npm run dev
# Logs sẽ hiển thị với emoji và màu sắc

# Production (Vercel)
vercel logs
# Logs JSON format, không có sensitive data
```

### 3. Error Tracking

**Auto-capture errors:**

```typescript
// Trong app/layout.tsx hoặc providers.tsx
import { initErrorTracking } from '@/lib/monitoring/error-tracking';

export default function RootLayout({ children }) {
  useEffect(() => {
    initErrorTracking(); // Tự động bắt lỗi
  }, []);
  
  return <html>{children}</html>;
}
```

**Safe API calls:**

```typescript
import { safeFetch } from '@/lib/monitoring/error-tracking';

// Thay vì fetch thường
const { data, error, status } = await safeFetch('/api/projects');

if (error) {
  // Handle error safely
  console.error(error);
}
```

---

## 🚀 TESTING WORKFLOW

### Development

```bash
# 1. Viết code
# 2. Chạy unit tests
npm run test:unit:watch

# 3. Test trong browser
npm run dev

# 4. Chạy E2E tests
npm run test:e2e
```

### Before Deploy

```bash
# Quick smoke test (5 phút)
npm run test:e2e -- smoke.spec.ts

# Nếu pass → Deploy
# Nếu fail → Fix bugs
```

### After Deploy

```bash
# 1. Check health
curl https://your-domain.com/api/health

# 2. Quick manual test
# - Load homepage
# - Click một vài buttons
# - Submit một form test

# 3. Monitor logs
vercel logs --follow
```

---

## 📝 TEST FILES STRUCTURE

```
tests/
├── e2e/                      # Playwright E2E tests
│   ├── smoke.spec.ts         # ⚡ Quick smoke tests
│   ├── homepage.spec.ts      # Homepage functionality
│   ├── erp-login.spec.ts     # ERP login system
│   ├── contact-form.spec.ts  # Contact form
│   └── api-health.spec.ts    # API health checks
│
└── unit/                     # Vitest unit tests
    ├── Button.test.tsx       # Button component
    ├── ContactForm.test.tsx  # Form component
    └── api-utils.test.ts     # Utility functions

lib/monitoring/               # Production monitoring
├── logger.ts                 # Safe logging
├── error-tracking.ts         # Error handling
└── health-check.ts           # Health monitoring
```

---

## 🎯 GỢI Ý TESTING THEO MỨC

### Level 1: Basic (Bắt buộc)
- ✅ Smoke tests pass
- ✅ Homepage load
- ✅ No console errors

**Time:** 2 phút
```bash
npm run test:e2e -- smoke.spec.ts
```

### Level 2: Standard (Khuyến nghị)
- ✅ All E2E tests pass
- ✅ API health checks pass
- ✅ No broken buttons

**Time:** 5-10 phút
```bash
npm run test:e2e
```

### Level 3: Complete (Production)
- ✅ E2E tests pass
- ✅ Unit tests pass
- ✅ Health monitoring setup
- ✅ Error tracking enabled

**Time:** 10-15 phút
```bash
npm run test:unit && npm run test:e2e
```

---

## 🔧 DEBUG PRODUCTION

### Safe Debug Methods

**1. Health Check:**
```bash
curl https://your-domain.com/api/health
```

**2. Structured Logs:**
```typescript
logger.debug('Processing request', { userId, action });
// Chỉ log trong dev, production tự động sanitize
```

**3. Performance Monitoring:**
```typescript
const endMeasure = measurePerformance('database-query');
// ... do work ...
const duration = endMeasure(); // Auto logged
```

**4. Error Context:**
```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    userId: user.id,
    action: 'update_profile',
    // Sensitive data tự động bị redact
  });
}
```

### Vercel Logs

```bash
# Real-time logs
vercel logs --follow

# Filter by function
vercel logs --output api/health

# Last 100 entries
vercel logs -n 100
```

---

## 🎓 BEST PRACTICES

### Testing
1. ✅ Chạy smoke tests trước mỗi deploy
2. ✅ Test trên nhiều browsers (Chrome, Firefox, Safari)
3. ✅ Test cả mobile và desktop viewports
4. ✅ Mock external APIs trong tests
5. ✅ Keep tests fast (<5 phút total)

### Logging
1. ✅ KHÔNG log passwords, tokens, API keys
2. ✅ Sử dụng structured logging (JSON)
3. ✅ Log tất cả errors với context
4. ✅ Log business metrics quan trọng
5. ✅ Sanitize user data trước khi log

### Monitoring
1. ✅ Setup health check endpoint
2. ✅ Monitor API response times
3. ✅ Track error rates
4. ✅ Alert on critical failures
5. ✅ Review logs regularly

---

## 📞 TROUBLESHOOTING

### Tests Fail Locally

```bash
# 1. Update browsers
npx playwright install

# 2. Clear cache
rm -rf .next node_modules/.cache

# 3. Reinstall
npm install

# 4. Run with debug
npx playwright test --debug
```

### Tests Pass Locally, Fail CI

```bash
# Check baseURL
echo $PLAYWRIGHT_BASE_URL

# Run with same config as CI
npm run test:e2e -- --project=chromium
```

### Production Issues

```bash
# 1. Check health
curl https://your-domain.com/api/health

# 2. Check logs
vercel logs --output=api

# 3. Check recent deployments
vercel ls

# 4. Rollback if needed
vercel rollback
```

---

## 📈 METRICS TO TRACK

- **Test Coverage:** Aim for >80%
- **Test Execution Time:** <5 minutes
- **API Response Time:** <500ms avg
- **Error Rate:** <1%
- **Uptime:** >99.9%
- **Failed Deployments:** <5%

---

**Created:** 2026-01-13
**Last Updated:** 2026-01-13
**Version:** 1.0.0

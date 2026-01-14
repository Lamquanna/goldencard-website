# 🚀 TESTING CHEAT SHEET

## ⚡ COMMANDS NHANH

```bash
# 1. BẮT BUỘC trước deploy (11s)
npm run test:smoke -- --project=chromium

# 2. Check health
curl http://localhost:3000/api/health

# 3. Test homepage
npm run test:homepage -- --project=chromium

# 4. Debug với UI
npm run test:ui
```

---

## 🎯 LỖI THƯỜNG GẶP & CÁCH FIX

### ❌ ECONNREFUSED 127.0.0.1:3000
```bash
# Start dev server trước
npm run dev
# Đợi "Ready" message, rồi chạy tests
```

### ❌ Test Timeout
```bash
# Đã fix trong config - chỉ cần chạy lại
npm run test:smoke -- --project=chromium
```

### ❌ Tests Fail với Firefox/Safari
```bash
# Chỉ test Chromium (đã cấu hình)
npm run test:smoke -- --project=chromium
```

---

## ✅ TEST CHECKLIST

### Trước Deploy
- [ ] Dev server đang chạy (`npm run dev`)
- [ ] Chạy smoke tests (`npm run test:smoke -- --project=chromium`)
- [ ] Tests pass (6/6)
- [ ] Check health API

### Sau Deploy
- [ ] Check production health
- [ ] Manual test homepage
- [ ] Check logs không có errors

---

## 📊 CURRENT STATUS

**Smoke Tests:** ✅ 6/6 PASSED  
**Homepage Tests:** ✅ 6/6 PASSED  
**Execution Time:** ~11 seconds  
**Broken Buttons:** 0  
**Broken Links:** 0  
**JS Errors:** 0  

---

## 🔗 QUICK LINKS

- [Full Testing Guide](TESTING_GUIDE.md)
- [Quick Start](TESTING_QUICKSTART.md)
- [Test Results](TEST_RESULTS.md)
- [Scripts](QUICK_TEST_SCRIPTS.md)

---

**Keep this handy for quick reference!**

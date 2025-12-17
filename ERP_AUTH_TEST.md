# 🔐 ERP Authentication Flow - Test Guide

## ✅ Đã hoàn thành

### 1. **Route Protection**
Tất cả routes `/erp/*` (trừ `/erp/login`) giờ đã được bảo vệ:
- Truy cập `/erp` hoặc bất kỳ trang ERP nào → Auto redirect đến `/erp/login`
- Chỉ user đã login mới có thể truy cập

### 2. **Login Page**
- URL: `/erp/login`
- Input: Mã nhân viên (VD: `GES001`)
- Password: `Golden@2024` (mặc định)
- Auto convert mã thành email: `ges001@goldenenergy.vn`

### 3. **User Session**
- Sau khi login thành công → Redirect đến `/erp/dashboard`
- User info được load từ Firestore (employee profiles)
- Session được Firebase Authentication quản lý

### 4. **Logout**
- Click avatar ở header → Menu xuất hiện
- Click "Đăng xuất" → Auto redirect về `/erp/login`
- Session bị clear hoàn toàn

---

## 🧪 Testing Steps

### Test 1: Direct Access (No Login)
```
1. Clear browser cookies/session
2. Visit: https://goldenenergy.vn/erp
3. Expected: Auto redirect to /erp/login
```

### Test 2: Login Flow
```
1. Visit: /erp/login
2. Enter:
   - Mã NV: GES001
   - Password: Golden@2024
3. Click "Đăng nhập"
4. Expected: Redirect to /erp/dashboard
5. Check header: Should show "Hà Nhật Anh" (or employee name)
```

### Test 3: Protected Routes
```
1. After login, try accessing:
   - /erp/dashboard ✅
   - /erp/crm ✅
   - /erp/projects ✅
   - /erp/hrm ✅
2. Expected: All accessible
```

### Test 4: Logout Flow
```
1. While logged in, click avatar (top right)
2. Click "Đăng xuất"
3. Expected: Redirect to /erp/login
4. Try accessing /erp again
5. Expected: Redirect back to login
```

---

## 📋 Available Test Accounts

| Mã NV | Email | Tên | Chức vụ | Password |
|-------|-------|-----|---------|----------|
| GES001 | ges001@goldenenergy.vn | Hà Nhật Anh | CEO | Golden@2024 |
| GES002 | ges002@goldenenergy.vn | Rita Kim Anh | CFO | Golden@2024 |
| GES003 | ges003@goldenenergy.vn | Hà Anh Tuấn | COO | Golden@2024 |

**Note:** Accounts cần được seed trước bằng script `seed-firebase-auth.js`

---

## 🔧 Technical Details

### Components
- **AuthWrapper** (`app/erp/components/AuthWrapper.tsx`)
  - Wraps entire ERP layout
  - Listens to Firebase auth state
  - Auto-redirects if not authenticated
  
- **AppShell** (`app/erp/components/AppShell.tsx`)
  - Loads user from Firebase/Firestore
  - Shows user info in header
  - Logout button in user menu

### Flow Diagram
```
Browser → /erp 
  ↓
AuthWrapper checks Firebase auth
  ↓
Not authenticated? → Redirect to /erp/login
  ↓
Authenticated? → Load user from Firestore
  ↓
Render ERP content
```

---

## ⚠️ Important Notes

1. **Firebase Setup Required**
   - Firebase Auth must be enabled
   - Employee accounts must be seeded
   - See `FIREBASE_SETUP.md` for details

2. **Session Persistence**
   - Firebase automatically persists sessions
   - User stays logged in even after browser restart
   - Until explicit logout or token expires

3. **Security**
   - All validation done server-side by Firebase
   - Firestore rules protect employee data
   - Only authenticated users can read their profile

---

## 🐛 Troubleshooting

### "Đang tải..." stuck forever
- Check Firebase config in `.env.local`
- Verify Firebase is initialized properly
- Check browser console for errors

### Auto-login as wrong user
- This should NOT happen anymore
- Clear browser storage: `localStorage.clear()`
- Old mock auth data might be cached

### Can't login
- Verify account exists in Firebase Auth
- Run seeding script: `node scripts/seed-firebase-auth.js`
- Check Firebase Console for account status

---

**Deployment:** Vercel sẽ auto-deploy sau khi push
**Live URL:** https://goldencard-website-7oah1ws70-qas-projects-07cd4636.vercel.app/erp/login

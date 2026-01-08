# ⚡ QUICK TEST - ERP Login System

## 🎯 Test Ngay (5 phút)

### 1️⃣ Setup Database & Admin
```bash
# B1: Chạy migration (nếu chưa có bảng erp_users)
psql $DATABASE_URL -f database/migrations/create_erp_users_table.sql

# B2: Tạo admin account
node scripts/add-admin-to-db.js
```

### 2️⃣ Start Server
```bash
npm run dev
```

### 3️⃣ Login
1. Mở: http://localhost:3000/erp/login
2. Nhập:
   - **Username:** `admin`
   - **Password:** `Admin@2025`
3. Click "Đăng nhập"
4. ✅ Nếu thành công → Redirect đến `/erp`

### 4️⃣ Tạo User Mới (Optional)
1. Vào: http://localhost:3000/erp/users
2. Click "Tạo Người Dùng Mới"
3. Điền thông tin và submit
4. ✅ Nhận được thông tin: username + password

---

## ✅ Expected Results

### Login thành công khi:
- [x] Hiển thị dashboard `/erp`
- [x] Header hiển thị "Administrator"
- [x] Sidebar menu xuất hiện
- [x] Console không có lỗi

### Console logs:
```
Login successful: {username: 'admin', role: 'admin', ...}
AuthWrapper: Token valid, user authenticated
```

---

## ❌ Nếu Có Lỗi

### "Không thể kết nối cơ sở dữ liệu"
```bash
# Check DATABASE_URL
cat .env.local | grep DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT NOW();"
```

### "Tên đăng nhập hoặc mật khẩu không đúng"
```bash
# Tạo lại admin
node scripts/add-admin-to-db.js

# Check trong database
psql $DATABASE_URL -c "SELECT username, password FROM erp_users WHERE username='admin';"
```

### Stuck ở loading
```bash
# Restart server
Ctrl+C
npm run dev
```

---

## 📝 Next Steps

1. ✅ Login với admin
2. ✅ Tạo employee accounts
3. ✅ Test với employee login
4. ✅ Test logout
5. ✅ Test permissions

---

## 🔗 Full Documentation

- [BÁO_CÁO_SỬA_LỖI_LOGIN.md](./BÁO_CÁO_SỬA_LỖI_LOGIN.md) - Tiếng Việt
- [ERP_LOGIN_FIX_2026.md](./ERP_LOGIN_FIX_2026.md) - English
- [ERP_LOGIN_SYSTEM.md](./ERP_LOGIN_SYSTEM.md) - System Overview

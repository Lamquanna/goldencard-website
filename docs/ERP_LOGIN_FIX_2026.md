# 🔧 ERP Login System - Bug Fixes (Jan 2026)

## 📋 Tóm Tắt Vấn Đề

**Vấn đề phát hiện:** Hệ thống ERP không thể đăng nhập được do xung đột giữa 2 authentication systems:

1. **Old System (Firebase)** - Sử dụng teamData từ code
2. **New System (PostgreSQL)** - Sử dụng database để quản lý users

### ❌ Lỗi Chi Tiết

- **Login API** (`/api/erp/auth/login`) → ✅ Đã sử dụng PostgreSQL
- **Verify API** (`/api/erp/auth/verify`) → ❌ Vẫn dùng teamData (cũ)
- **AuthWrapper** → ❌ Không verify token với backend

**Kết quả:** Khi user login, token được tạo theo format PostgreSQL nhưng verify lại tìm trong teamData → Token invalid → Login fail!

---

## ✅ Các Sửa Đổi Đã Thực Hiện

### 1. Cập Nhật API Verify Route

**File:** `app/api/erp/auth/verify/route.ts`

**Thay đổi:**
- ❌ Xóa bỏ dependency vào `teamData`
- ✅ Verify token bằng cách query PostgreSQL database
- ✅ Kiểm tra user có active không
- ✅ Trả về thông tin user đầy đủ từ database

**Logic mới:**
```typescript
1. Lấy token từ Authorization header
2. Decode base64 token (format: "username:role:timestamp")
3. Query database để kiểm tra user exists và active
4. Trả về user info nếu valid
```

### 2. Cập Nhật AuthWrapper Component

**File:** `app/erp/components/AuthWrapper.tsx`

**Thay đổi:**
- ✅ Thêm logic verify token với backend API
- ✅ Kiểm tra token validity với database
- ✅ Auto clear invalid tokens
- ✅ Update user info từ backend response

**Logic mới:**
```typescript
1. Kiểm tra localStorage có token không
2. Gọi /api/erp/auth/verify để validate token
3. Nếu valid → set authenticated = true
4. Nếu invalid → clear localStorage và redirect to login
5. Update user info từ response
```

### 3. Sửa Script Add Admin

**File:** `scripts/add-admin-to-db.js`

**Thay đổi:**
- ✅ Password đổi từ `1` → `Admin@2025` (theo document)
- ✅ Set `requires_password_change = false` cho admin
- ✅ Update console logs cho rõ ràng

---

## 🚀 Hướng Dẫn Setup & Test

### Bước 1: Chạy Migration Database

Nếu chưa có bảng `erp_users`, chạy migration:

```bash
# Sử dụng psql
psql -U your_user -d your_database -f database/migrations/create_erp_users_table.sql

# Hoặc copy SQL và chạy trong pgAdmin/TablePlus
```

### Bước 2: Tạo Admin Account

Chạy script để tạo/cập nhật admin account:

```bash
node scripts/add-admin-to-db.js
```

**Output expected:**
```
✅ Admin account added/updated:
   Username: admin
   Employee Code: ADMIN
   Full Name: Administrator
   Role: admin
   Password: Admin@2025
   Requires Password Change: false
```

### Bước 3: Test Login

1. **Khởi động dev server:**
   ```bash
   npm run dev
   ```

2. **Truy cập login page:**
   ```
   http://localhost:3000/erp/login
   ```

3. **Đăng nhập với admin:**
   - Username: `admin`
   - Password: `Admin@2025`

4. **Kiểm tra:**
   - ✅ Có redirect đến `/erp` sau khi login thành công
   - ✅ User info hiển thị ở header (username, role)
   - ✅ Sidebar menu hiển thị đầy đủ
   - ✅ Có thể truy cập các trang khác nhau
   - ✅ Không bị redirect về login khi refresh page

### Bước 4: Test Logout

1. Click vào avatar/username ở góc phải header
2. Click "Đăng xuất"
3. Kiểm tra:
   - ✅ Redirect về `/erp/login`
   - ✅ Token bị xóa khỏi localStorage
   - ✅ Không thể truy cập `/erp` khi chưa login

---

## 🔍 Kiểm Tra Console & Network

### Console Logs (Browser DevTools)

Khi login thành công, bạn sẽ thấy:
```
AuthWrapper: Checking auth for path: /erp/login
Login attempt with username: admin
Login successful: {username: 'admin', role: 'admin', ...}
AuthWrapper: Verifying token with backend...
AuthWrapper: Token valid, user authenticated
```

### Network Tab (Browser DevTools)

**POST /api/erp/auth/login:**
- Status: `200 OK`
- Response:
  ```json
  {
    "success": true,
    "token": "YWRtaW46YWRtaW46MTczNjMwNDAwMDAw",
    "requires_password_change": false,
    "user": {
      "username": "admin",
      "role": "admin",
      "email": "admin@goldenenergy.vn",
      "full_name": "Administrator",
      "employee_code": "ADMIN"
    }
  }
  ```

**GET /api/erp/auth/verify:**
- Status: `200 OK`
- Response:
  ```json
  {
    "valid": true,
    "user": {
      "id": "user-1",
      "username": "admin",
      "employeeCode": "ADMIN",
      "role": "admin",
      "email": "admin@goldenenergy.vn",
      "fullName": "Administrator",
      ...
    }
  }
  ```

---

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối cơ sở dữ liệu"

**Nguyên nhân:** DATABASE_URL không đúng hoặc database chưa khởi động

**Giải pháp:**
1. Kiểm tra `.env.local` có `DATABASE_URL` chính xác không
2. Test connection:
   ```bash
   psql "postgresql://user:pass@host:5432/dbname"
   ```

### Lỗi: "Tên đăng nhập hoặc mật khẩu không đúng"

**Nguyên nhân:** 
- Admin chưa được tạo trong database
- Password không đúng

**Giải pháp:**
1. Chạy lại script: `node scripts/add-admin-to-db.js`
2. Đảm bảo password là `Admin@2025` (phân biệt hoa thường)
3. Check database:
   ```sql
   SELECT username, password, is_active FROM erp_users WHERE username = 'admin';
   ```

### Lỗi: "Token invalid" hoặc bị logout liên tục

**Nguyên nhân:** Token bị decode sai hoặc user không active

**Giải pháp:**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Login lại
3. Check database user is_active = true:
   ```sql
   UPDATE erp_users SET is_active = true WHERE username = 'admin';
   ```

### Lỗi: Stuck ở "Đang kiểm tra xác thực..."

**Nguyên nhân:** API verify bị lỗi hoặc không response

**Giải pháp:**
1. Mở Browser Console, xem error
2. Check Network tab → /api/erp/auth/verify
3. Kiểm tra server logs
4. Restart dev server: `npm run dev`

---

## 📝 Technical Notes

### Token Format

**Structure:** Base64 encoded string
```
Original: "username:role:timestamp"
Encoded: "YWRtaW46YWRtaW46MTczNjMwNDAwMDAw"
```

**Example:**
```javascript
// Generate
const token = Buffer.from(`${username}:${role}:${Date.now()}`).toString('base64');

// Decode
const decoded = Buffer.from(token, 'base64').toString('utf-8');
const [username, role, timestamp] = decoded.split(':');
```

### Database Schema

```sql
CREATE TABLE erp_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL DEFAULT 'staff',
  department VARCHAR(50),
  password VARCHAR(255) NOT NULL,  -- Plain text (for demo only!)
  is_active BOOLEAN DEFAULT true,
  requires_password_change BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

### Security Considerations

⚠️ **IMPORTANT:** 
- Current system stores passwords in **plain text**
- This is for **development/demo only**
- For production, use proper password hashing (bcrypt, argon2)

**Recommended improvements:**
1. Hash passwords with bcrypt before storing
2. Use JWT tokens with expiration
3. Implement refresh tokens
4. Add rate limiting on login attempts
5. Add 2FA for sensitive accounts

---

## 📚 Related Documents

- [ERP_LOGIN_SYSTEM.md](./ERP_LOGIN_SYSTEM.md) - Tổng quan hệ thống login
- [QUICKSTART_ERP_NEW_LOGIN.md](./QUICKSTART_ERP_NEW_LOGIN.md) - Hướng dẫn sử dụng
- [ERP_AUTH_TEST.md](../ERP_AUTH_TEST.md) - Old system (deprecated)

---

## ✅ Checklist Hoàn Thành

- [x] Fix verify API to use PostgreSQL
- [x] Update AuthWrapper to verify tokens
- [x] Fix admin password in script
- [x] Update documentation
- [x] Test login flow end-to-end
- [ ] Add password hashing (production TODO)
- [ ] Add JWT tokens (production TODO)
- [ ] Add rate limiting (production TODO)

---

**Last Updated:** January 8, 2026  
**Status:** ✅ Fixed and Working  
**Next Steps:** Create employee accounts và test permissions

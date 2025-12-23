# 🔐 Hệ Thống Đăng Nhập ERP Mới

## Ngày cập nhật: 23/12/2025

## 📋 Tổng Quan

Hệ thống đăng nhập ERP đã được cập nhật từ **Firebase Authentication với employee code** sang **hệ thống đăng nhập truyền thống với username/password** và quản lý user bằng PostgreSQL.

## ✨ Tính Năng Mới

### 1. **Admin Account**
- **Username:** `admin`
- **Password:** `Admin@2025`
- **Quyền:** Toàn quyền, có thể tạo và quản lý tất cả user

### 2. **Tự Động Tạo Mã Nhân Viên**
- Format: **GES001, GES002, GES003, ...**
- Tự động tăng dần theo thứ tự
- Username = mã nhân viên viết thường (ví dụ: `ges001`)

### 3. **Quản Lý User**
- Trang quản lý user tại: `/erp/users`
- Admin có thể tạo user mới
- Xem danh sách tất cả user
- Theo dõi trạng thái active/inactive

### 4. **Hệ Thống Mật Khẩu**
- **Mật khẩu mặc định:** `MÃ_NHÂN_VIÊN@2025`
  - Ví dụ: GES001 → mật khẩu: `GES001@2025`
- Admin có thể đặt custom password khi tạo user
- User có thể đổi password sau khi đăng nhập

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Cài Đặt Database

Chạy file SQL migration để tạo bảng `erp_users`:

```bash
psql -U your_user -d your_database -f database/migrations/create_erp_users_table.sql
```

Hoặc copy nội dung file SQL và chạy trong pgAdmin/TablePlus.

### Bước 2: Đăng Nhập Admin

1. Truy cập: `http://localhost:3000/erp/login`
2. Nhập:
   - **Username:** `admin`
   - **Password:** `Admin@2025`
3. Nhấn "Đăng nhập"

### Bước 3: Tạo User Mới

1. Sau khi đăng nhập admin, vào trang: `/erp/users`
2. Nhấn nút **"Tạo Người Dùng Mới"**
3. Điền thông tin:
   - **Họ và Tên** (bắt buộc)
   - **Chức vụ** (bắt buộc)
   - **Phòng ban** (tùy chọn)
   - **Email** (tùy chọn)
   - **Số điện thoại** (tùy chọn)
   - **Mật khẩu** (tùy chọn - để trống để tạo tự động)
4. Nhấn **"Tạo Người Dùng"**
5. Hệ thống sẽ hiển thị:
   - Mã nhân viên (ví dụ: GES001)
   - Username (ví dụ: ges001)
   - Password
6. **Lưu ý:** Copy thông tin này và gửi cho nhân viên

### Bước 4: Nhân Viên Đăng Nhập

Nhân viên sử dụng thông tin được cấp:
- **Username:** ges001 (hoặc GES001)
- **Password:** GES001@2025 (hoặc password được admin đặt)

## 📊 Cấu Trúc Database

### Bảng `erp_users`

```sql
CREATE TABLE erp_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,      -- ges001, ges002, ...
  employee_code VARCHAR(20) UNIQUE NOT NULL, -- GES001, GES002, ...
  full_name VARCHAR(100) NOT NULL,           -- Nguyễn Văn A
  email VARCHAR(100),                        -- email@goldenenergy.vn
  phone VARCHAR(20),                         -- 0901234567
  role VARCHAR(20) NOT NULL,                 -- staff, manager, director, ...
  department VARCHAR(50),                    -- Kinh doanh, Kế toán, ...
  password VARCHAR(255) NOT NULL,            -- Mật khẩu (plain text cho demo)
  is_active BOOLEAN DEFAULT true,            -- Trạng thái
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);
```

## 🔧 API Endpoints

### 1. Login
```
POST /api/erp/auth/login
```
**Body:**
```json
{
  "username": "admin",
  "password": "Admin@2025"
}
```
**Response:**
```json
{
  "success": true,
  "token": "base64_encoded_token",
  "user": {
    "username": "admin",
    "role": "admin",
    "email": "admin@goldenenergy.vn",
    "full_name": "Administrator",
    "employee_code": "ADMIN"
  }
}
```

### 2. Get Users (Admin Only)
```
GET /api/erp/users
Headers: Authorization: Bearer {token}
```

### 3. Create User (Admin Only)
```
POST /api/erp/users
Headers: Authorization: Bearer {token}
```
**Body:**
```json
{
  "full_name": "Nguyễn Văn A",
  "email": "nva@goldenenergy.vn",
  "phone": "0901234567",
  "role": "staff",
  "department": "Kinh doanh",
  "password": "custom_password" // optional
}
```

## 🎯 Các Role (Chức Vụ)

- **admin:** Quản trị viên - toàn quyền
- **manager:** Quản lý
- **director:** Giám đốc
- **staff:** Nhân viên
- **accountant:** Kế toán
- **sales:** Kinh doanh
- **technical:** Kỹ thuật

## 🔒 Bảo Mật

### Hiện Tại (Development)
- Mật khẩu lưu **plain text** trong database
- Token đơn giản bằng Base64 encoding

### Cần Cải Thiện (Production)
1. **Hash password** bằng bcrypt:
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Sử dụng JWT** thay vì Base64:
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '24h' });
   ```

3. **HTTPS** trong production
4. **Rate limiting** để chống brute force
5. **2FA** cho admin account

## 🚀 Tích Hợp Chat & File Sharing

### Chat System
User có thể chat với nhau sử dụng:
- **employee_code** làm identifier
- **username** để hiển thị
- **full_name** để hiển thị tên đầy đủ

### File Sharing
- Mỗi user có folder riêng: `/files/{employee_code}/`
- Upload file với metadata: uploader, timestamp
- Permission dựa trên role và department

## 📝 Ghi Chú Quan Trọng

1. ⚠️ **Đổi mật khẩu admin ngay sau khi deploy**
2. ⚠️ **Backup database thường xuyên**
3. ⚠️ **Không commit mật khẩu vào Git**
4. ✅ **Test kỹ trước khi deploy production**
5. ✅ **Hướng dẫn nhân viên đổi mật khẩu sau lần đăng nhập đầu**

## 🔄 Migration từ Firebase

Nếu đã có users trong Firebase:

1. Export users từ Firebase
2. Tạo script để migrate sang PostgreSQL
3. Chuyển đổi email format sang employee code
4. Reset tất cả passwords theo format mới
5. Gửi thông tin login cho từng nhân viên

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Kiểm tra database connection
2. Xem logs trong browser console
3. Kiểm tra Network tab trong DevTools
4. Verify token trong localStorage

## 🎉 Demo Users

Sau khi chạy migration, sẽ có 3 users mẫu:

| Employee Code | Username | Password | Role | Department |
|---------------|----------|----------|------|------------|
| GES001 | ges001 | GES001@2025 | manager | Kinh doanh |
| GES002 | ges002 | GES002@2025 | staff | Kế toán |
| GES003 | ges003 | GES003@2025 | technical | Kỹ thuật |

## 📚 Tài Liệu Liên Quan

- [DATABASE_SETUP.md](../DATABASE_SETUP.md) - Hướng dẫn cài đặt database
- [ERP_AUTH_TEST.md](../ERP_AUTH_TEST.md) - Test authentication
- [SECURITY.md](../SECURITY.md) - Hướng dẫn bảo mật

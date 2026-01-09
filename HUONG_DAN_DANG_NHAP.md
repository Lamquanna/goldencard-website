# ✅ HƯỚNG DẪN ĐĂNG NHẬP - CẬP NHẬT MỚI NHẤT

**Ngày cập nhật:** 9/1/2026
**Trạng thái:** ✅ Đã test và xác nhận hoạt động 100%

---

## 🎯 ĐĂNG NHẬP NGAY

### URL Đăng nhập:
```
http://localhost:3000/erp/login
hoặc
https://goldenenergy.vn/erp/login
```

---

## 👤 TÀI KHOẢN ADMIN

```
Username: admin
Password: 1
```

**⚠️ Quan trọng:**
- Lần đầu đăng nhập bắt buộc đổi mật khẩu
- Mật khẩu mới tối thiểu 6 ký tự
- Không được dùng lại mật khẩu "1"

---

## 👥 TÀI KHOẢN NHÂN VIÊN (12 người - DANH SÁCH THẬT)

Tất cả nhân viên đều có:
- **Password mặc định: `1`**
- **Bắt buộc đổi mật khẩu lần đầu**

### Leadership (Ban Lãnh đạo)
| Mã NV | Username | Tên | Chức vụ |
|-------|----------|-----|---------|
| GES001 | ges001 | Hà Hoàng Hà (Jimmy Ha) | CEO & Founder |
| GES002 | ges002 | Trương Kim Anh (Rita) | CFO & Vice-CEO |

### Management (Ban Quản lý)
| Mã NV | Username | Tên | Chức vụ |
|-------|----------|-----|---------|
| GES003 | ges003 | Hà Huy Tuấn | Trưởng phòng Giám sát Dự án |
| GES004 | ges004 | Hồ Minh Tân | Trưởng phòng Kỹ thuật |
| GES005 | ges005 | Lê Quang Anh | CTO & Trưởng phòng Phát triển |
| GES006 | ges006 | Nguyễn Thị Thu | Trưởng phòng Kế toán |
| GES007 | ges007 | Phạm Tấn Lễ | Trưởng bộ phận Vận chuyển |
| GES008 | ges008 | Nguyễn Minh Nguyệt | Trưởng phòng Kinh doanh |
| GES009 | ges009 | Lưu Thị Duyên (Cristina) | Trưởng bộ phận Marketing |

### Engineering (Kỹ thuật viên)
| Mã NV | Username | Tên | Chức vụ |
|-------|----------|-----|---------|
| GES010 | ges010 | Đào Hữu Giàu | Kỹ sư |
| GES011 | ges011 | Trần Văn Son | Kỹ sư |
| GES012 | ges012 | Nguyễn Minh Duy | Kỹ sư |

---

## 📝 QUY TRÌNH ĐĂNG NHẬP LẦN ĐẦU

### Bước 1: Truy cập trang đăng nhập
Mở: http://localhost:3000/erp/login

### Bước 2: Nhập thông tin
```
Username: admin (hoặc ges001, ges002, ...)
Password: 1
```

### Bước 3: Đổi mật khẩu
Hệ thống tự động chuyển đến: `/erp/change-password`
- Nhập mật khẩu hiện tại: `1`
- Nhập mật khẩu mới: tối thiểu 6 ký tự
- Xác nhận mật khẩu mới

### Bước 4: Hoàn tất
- Tự động chuyển đến Dashboard: `/erp`
- Đăng nhập thành công!

---

## 🔧 XỬ LÝ LỖI

### Lỗi: "Không thể kết nối cơ sở dữ liệu"
```bash
# Kiểm tra DATABASE_URL
cat .env.local | findstr DATABASE_URL

# Test kết nối
psql $env:DATABASE_URL -c "SELECT NOW();"
```

### Lỗi: "Tên đăng nhập hoặc mật khẩu không đúng"
```bash
# Reset admin password về "1"
node scripts/add-admin-to-db.js

# Kiểm tra trong database
psql $env:DATABASE_URL -c "SELECT username, password, requires_password_change FROM erp_users WHERE username='admin';"
```

### Trang đổi mật khẩu không hiện
1. Xóa cache trình duyệt
2. Xóa localStorage:
   - Mở DevTools (F12)
   - Console tab
   - Chạy: `localStorage.clear()`
3. Đăng nhập lại

---

## ✅ CHECKLIST SAU KHI SETUP

- [x] Admin account đã tạo với password "1"
- [x] 12 tài khoản nhân viên theo danh sách THẬT
- [x] Tất cả account có `requires_password_change = true`
- [x] Trang `/erp/change-password` hoạt động
- [x] API `/api/erp/auth/change-password` hoạt động
- [x] Flow đăng nhập redirect đúng

---

## 📊 KIỂM TRA DATABASE

```sql
-- Xem tất cả users
SELECT 
  employee_code, 
  username, 
  full_name, 
  role, 
  password,
  requires_password_change,
  last_login
FROM erp_users 
ORDER BY employee_code;

-- Kiểm tra admin
SELECT * FROM erp_users WHERE username = 'admin';

-- Reset một user về password "1"
UPDATE erp_users 
SET password = '1', requires_password_change = true 
WHERE username = 'ges001';
```

---

## 🔐 BẢO MẬT

### ✅ Đã làm:
- Tất cả password mặc định là "1"
- Bắt buộc đổi password lần đầu
- Password được lưu trong database (erp_users)
- Session được quản lý bằng token trong localStorage

### ⚠️ Cần làm thêm:
- [ ] Hash passwords với bcrypt (production)
- [ ] Implement JWT tokens
- [ ] Add password complexity requirements
- [ ] Add login attempt limits
- [ ] Add 2FA (optional)

---

## 📞 HỖ TRỢ

Gặp vấn đề? Liên hệ:
- **Email:** it@goldenenergy.vn
- **File tài liệu:** [DANH_SACH_TAI_KHOAN.md](./DANH_SACH_TAI_KHOAN.md)

---

**© 2024 Golden Energy. All rights reserved.**

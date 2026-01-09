# 📋 DANH SÁCH TÀI KHOẢN HỆ THỐNG

**Cập nhật:** 8 tháng 1, 2026

---

## 🔑 Tài khoản Admin

| Username | Password Mặc định | Vai trò | Email |
|----------|-------------------|---------|-------|
| `admin` | `1` | Administrator | admin@goldenenergy.vn |

**⚠️ Lưu ý:** Bắt buộc đổi mật khẩu lần đầu đăng nhập

---

## 👥 Danh sách 12 Nhân viên (Team Data THẬT)

### Leadership Team (Ban Lãnh đạo)

| Mã NV | Tên | Chức vụ | Email | Password | Phòng ban |
|-------|-----|---------|-------|----------|-----------|
| **GES001** | Hà Hoàng Hà (Jimmy Ha) | Founder & CEO | jimmy.ha@goldenenergy.vn | `1` | Ban Giám đốc |
| **GES002** | Trương Kim Anh (Rita Kim Anh) | CFO & Vice-CEO | rita.anh@goldenenergy.vn | `1` | Ban Giám đốc |

### Management Team (Ban Quản lý)

| Mã NV | Tên | Chức vụ | Email | Password | Phòng ban |
|-------|-----|---------|-------|----------|-----------|
| **GES003** | Hà Huy Tuấn (Tuan Ha) | Trưởng phòng Giám sát Dự án | tuan.ha@goldenenergy.vn | `1` | Phòng Dự án |
| **GES004** | Hồ Minh Tân (Tan Ho) | Trưởng phòng Kỹ thuật & Kỹ sư trưởng | tan.ho@goldenenergy.vn | `1` | Phòng Kỹ thuật |
| **GES005** | Lê Quang Anh (Anh Le) | CTO & Trưởng phòng Phát triển Dự án | anh.le@goldenenergy.vn | `1` | Phòng Phát triển Dự án |
| **GES006** | Nguyễn Thị Thu (Thu Nguyen) | Trưởng phòng Kế toán | thu.nguyen@goldenenergy.vn | `1` | Phòng Kế toán |
| **GES007** | Phạm Tấn Lễ (Le Pham) | Trưởng bộ phận Vận chuyển | le.pham@goldenenergy.vn | `1` | Bộ phận Vận chuyển |
| **GES008** | Nguyễn Minh Nguyệt (Nguyet Nguyen) | Trưởng phòng Kinh doanh | nguyet.nguyen@goldenenergy.vn | `1` | Phòng Kinh doanh |
| **GES009** | Lưu Thị Duyên (Cristina Lu) | Trưởng bộ phận Marketing | cristina.lu@goldenenergy.vn | `1` | Bộ phận Marketing |

### Engineering Team (Đội Kỹ thuật)

| Mã NV | Tên | Chức vụ | Email | Password | Phòng ban |
|-------|-----|---------|-------|----------|-----------|
| **GES010** | Đào Hữu Giàu (Giau Dao) | Kỹ sư | giau.dao@goldenenergy.vn | `1` | Phòng Kỹ thuật |
| **GES011** | Trần Văn Son (Son Tran) | Kỹ sư | son.tran@goldenenergy.vn | `1` | Phòng Kỹ thuật |
| **GES012** | Nguyễn Minh Duy (Duy Nguyen) | Kỹ sư | duy.nguyen@goldenenergy.vn | `1` | Phòng Kỹ thuật |

---

## 🔐 Chính sách Mật khẩu

### Mật khẩu mặc định
- Tất cả tài khoản: **`1`**
- Admin account: **`1`**

### Yêu cầu lần đầu đăng nhập
1. ✅ Đăng nhập bằng mật khẩu mặc định `1`
2. ✅ Hệ thống tự động chuyển đến trang đổi mật khẩu
3. ✅ Nhập mật khẩu mới (tối thiểu 6 ký tự)
4. ✅ Xác nhận mật khẩu mới
5. ✅ Đăng nhập lại với mật khẩu mới

### Yêu cầu mật khẩu mới
- Tối thiểu **6 ký tự**
- Phải khác với mật khẩu hiện tại
- Nên bao gồm:
  - Chữ hoa (A-Z)
  - Chữ thường (a-z)
  - Số (0-9)
  - Ký tự đặc biệt (@, #, $, %, etc.)

---

## 🚀 Hướng dẫn Setup

### Bước 1: Tạo tài khoản Admin trong Database
```bash
node scripts/add-admin-to-db.js
```

**Kết quả:**
- Tạo tài khoản `admin` với password `1`
- `requires_password_change = true`

### Bước 2: Seed tài khoản Firebase cho nhân viên (Optional)
```bash
node scripts/seed-firebase-auth.js
```

**Kết quả:**
- Tạo 12 tài khoản nhân viên trong Firebase Auth
- Tạo profile trong Firestore collection `employees`
- Email format: `{mã_nv}@goldenenergy.vn`
- Password mặc định: `1`
- Flag `mustChangePassword: true`

### Bước 3: Test đăng nhập
```bash
npm run dev
```

1. Truy cập: http://localhost:3000/erp/login
2. Đăng nhập admin:
   - Username: `admin`
   - Password: `1`
3. Hệ thống redirect đến `/erp/change-password`
4. Đổi mật khẩu mới
5. Đăng nhập lại với mật khẩu mới

---

## 📝 Lưu ý quan trọng

### ⚠️ Bảo mật
- **KHÔNG** sử dụng mật khẩu mặc định `1` lâu dài
- **KHÔNG** chia sẻ mật khẩu giữa nhiều người
- **KHÔNG** commit file chứa mật khẩu vào Git
- Đổi mật khẩu định kỳ (3-6 tháng)

### ✅ Database Storage
- Mật khẩu được lưu trong bảng `erp_users`
- Field `requires_password_change` = `true` khi tạo mới
- Field `last_login` được cập nhật mỗi lần đăng nhập

### 🔄 Reset mật khẩu
Nếu quên mật khẩu, liên hệ IT hoặc chạy lại script:
```bash
# Reset admin password về "1"
node scripts/add-admin-to-db.js
```

---

## 📞 Liên hệ hỗ trợ

- Email: **it@goldenenergy.vn**
- Hotline IT: **(024) xxxx xxxx**

---

**© 2024 Golden Energy. All rights reserved.**

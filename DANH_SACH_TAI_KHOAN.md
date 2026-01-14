# 📋 DANH SÁCH TÀI KHOẢN HỆ THỐNG

**Cập nhật:** 16 tháng 1, 2026

---

## 🔑 Tài khoản Admin

| Username | Password | Vai trò | Email |
|----------|----------|---------|-------|
| `admin` | `1` | Administrator | admin@goldenenergy.vn |

---

## 👥 Danh sách 12 Nhân viên (ĐÃ IMPORT VÀO DATABASE)

✅ **TẤT CẢ TÀI KHOẢN ĐÃ CÓ TRONG DATABASE - SẴN SÀNG ĐĂNG NHẬP**

### Leadership Team (Ban Lãnh đạo)

| Username | Mã NV | Tên | Password | Email | Phòng ban |
|----------|-------|-----|----------|-------|-----------|
| **ges001** | GES001 | Hà Hoàng Hà (Jimmy Ha) | `1` | jimmy.ha@goldenenergy.vn | Ban Giám đốc |
| **ges002** | GES002 | Trương Kim Anh (Rita Kim Anh) | `1` | rita.anh@goldenenergy.vn | Ban Giám đốc |

### Management Team (Ban Quản lý)

| Username | Mã NV | Tên | Password | Email | Phòng ban |
|----------|-------|-----|----------|-------|-----------|
| **ges003** | GES003 | Hà Huy Tuấn (Tuan Ha) | `1` | tuan.ha@goldenenergy.vn | Phòng Dự án |
| **ges004** | GES004 | Hồ Minh Tân (Tan Ho) | `1` | tan.ho@goldenenergy.vn | Phòng Kỹ thuật |
| **ges005** | GES005 | Lê Quang Anh (Anh Le) | `1` | anh.le@goldenenergy.vn | Phòng Phát triển Dự án |
| **ges006** | GES006 | Nguyễn Thị Thu (Thu Nguyen) | `1` | thu.nguyen@goldenenergy.vn | Phòng Kế toán |
| **ges007** | GES007 | Phạm Tấn Lễ (Le Pham) | `1` | le.pham@goldenenergy.vn | Bộ phận Vận chuyển |
| **ges008** | GES008 | Nguyễn Minh Nguyệt (Nguyet Nguyen) | `1` | nguyet.nguyen@goldenenergy.vn | Phòng Kinh doanh |
| **ges009** | GES009 | Lưu Thị Duyên (Cristina Lu) | `1` | cristina.lu@goldenenergy.vn | Bộ phận Marketing |

### Engineering Team (Đội Kỹ thuật)

| Username | Mã NV | Tên | Password | Email | Phòng ban |
|----------|-------|-----|----------|-------|-----------|
| **ges010** | GES010 | Đào Hữu Giàu (Giau Dao) | `1` | giau.dao@goldenenergy.vn | Phòng Kỹ thuật |
| **ges011** | GES011 | Trần Văn Son (Son Tran) | `1` | son.tran@goldenenergy.vn | Phòng Kỹ thuật |
| **ges012** | GES012 | Nguyễn Minh Duy (Duy Nguyen) | `1` | duy.nguyen@goldenenergy.vn | Phòng Kỹ thuật |

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

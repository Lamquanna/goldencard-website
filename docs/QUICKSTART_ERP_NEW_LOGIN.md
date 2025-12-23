# 🚀 HƯỚNG DẪN SỬ DỤNG HỆ THỐNG ERP MỚI

## 📌 Tóm Tắt

Hệ thống ERP đã được cập nhật với hệ thống đăng nhập mới:
- ✅ Admin account với toàn quyền
- ✅ Tự động tạo mã nhân viên (GES001, GES002, ...)
- ✅ Quản lý user đơn giản
- ✅ Tích hợp chat và file sharing

## 🔐 BƯỚC 1: ĐĂNG NHẬP ADMIN

### Thông tin đăng nhập admin:
```
URL: http://localhost:3000/erp/login
Username: admin
Password: Admin@2025
```

![Login Screen](login-screenshot.png)

### Sau khi đăng nhập:
- Bạn sẽ được chuyển đến trang Dashboard ERP
- Menu bên trái sẽ hiển thị các module có sẵn
- Có thêm menu **"Quản lý User"** (chỉ admin mới thấy)

## 👥 BƯỚC 2: TẠO USER MỚI

### Cách tạo user:

1. Click vào **"Quản lý User"** ở menu bên trái
2. Click nút **"Tạo Người Dùng Mới"** (màu vàng góc phải)
3. Điền thông tin:
   - **Họ và Tên**: Nguyễn Văn A *(bắt buộc)*
   - **Chức vụ**: Chọn từ dropdown *(bắt buộc)*
     - Nhân viên
     - Quản lý
     - Giám đốc
     - Kế toán
     - Kinh doanh
     - Kỹ thuật
   - **Phòng ban**: Kinh doanh *(tùy chọn)*
   - **Email**: email@goldenenergy.vn *(tùy chọn)*
   - **Số điện thoại**: 0901234567 *(tùy chọn)*
   - **Mật khẩu**: Để trống để tạo tự động *(tùy chọn)*

4. Click **"Tạo Người Dùng"**

5. Hệ thống sẽ hiển thị thông tin login:
   ```
   ✅ Tạo user thành công với mã GES001
   
   Username: ges001
   Password: GES001@2025
   
   Vui lòng gửi thông tin này cho nhân viên
   ```

6. **QUAN TRỌNG**: Copy thông tin này và gửi cho nhân viên!

### Quy tắc tạo mã nhân viên:

- User đầu tiên: **GES001**
- User thứ hai: **GES002**  
- User thứ ba: **GES003**
- ... tự động tăng

### Mật khẩu mặc định:

Nếu không đặt mật khẩu tùy chỉnh:
- GES001 → Mật khẩu: `GES001@2025`
- GES002 → Mật khẩu: `GES002@2025`
- GES003 → Mật khẩu: `GES003@2025`

## 🧑‍💼 BƯỚC 3: NHÂN VIÊN ĐĂNG NHẬP

### Thông tin gửi cho nhân viên:

```
🔐 Thông tin đăng nhập hệ thống ERP Golden Energy

URL: http://localhost:3000/erp/login (hoặc domain công ty)

Username: ges001
Password: GES001@2025

Lưu ý:
- Username không phân biệt hoa thường
- Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu
- Liên hệ IT nếu quên mật khẩu
```

### Nhân viên login:
1. Vào trang `/erp/login`
2. Nhập username: `ges001` (hoặc `GES001` đều được)
3. Nhập password: `GES001@2025`
4. Click "Đăng nhập"

## 📊 BƯỚC 4: SETUP DATABASE

### Nếu chưa có database:

1. Mở file: `database/migrations/create_erp_users_table.sql`

2. Chạy trong PostgreSQL:
   ```bash
   psql -U postgres -d goldenenergy -f database/migrations/create_erp_users_table.sql
   ```

3. Hoặc copy SQL và chạy trong pgAdmin/TablePlus

### Kiểm tra database:

```sql
-- Xem tất cả users
SELECT * FROM erp_users ORDER BY employee_code;

-- Đếm số users
SELECT COUNT(*) FROM erp_users;

-- Xem user mới nhất
SELECT * FROM erp_users ORDER BY created_at DESC LIMIT 1;
```

## 💬 BƯỚC 5: SỬ DỤNG CHAT & FILE SHARING

### Chat:
- Mỗi user có employee_code riêng
- Chat 1-1 hoặc group chat
- Realtime messaging

### File Sharing:
- Upload file với employee_code
- Theo dõi ai upload file
- Download và share files

## 🔒 BẢO MẬT

### Development (Hiện tại):
- ⚠️ Mật khẩu lưu **plain text** (chỉ dùng cho dev)
- ⚠️ Token đơn giản với Base64

### Production (Cần làm):
1. **Hash password với bcrypt**:
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Sử dụng JWT token**:
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ username, role }, SECRET_KEY, { expiresIn: '24h' });
   ```

3. **Environment variables**:
   ```env
   JWT_SECRET=your-super-secret-key-here
   DATABASE_URL=postgresql://user:pass@host:5432/db
   ```

4. **HTTPS trong production**

5. **Rate limiting** chống brute force

## 🐛 TROUBLESHOOTING

### Lỗi: "Không thể kết nối cơ sở dữ liệu"

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra connection string trong `.env.local`
3. Chạy lại migration SQL

### Lỗi: "Tên đăng nhập hoặc mật khẩu không đúng"

**Giải pháp:**
1. Kiểm tra username (không dấu cách)
2. Kiểm tra password (phân biệt hoa thường)
3. Thử đăng nhập với admin để test

### Lỗi: "Bảng erp_users chưa được tạo"

**Giải pháp:**
1. Chạy file SQL migration
2. Kiểm tra quyền database user
3. Xem log lỗi chi tiết trong console

### User không thấy menu "Quản lý User"

**Nguyên nhân:** Chỉ admin mới thấy menu này

**Giải pháp:** Đảm bảo user có role = 'admin'

## 📋 CHECKLIST TRIỂN KHAI

### Development:
- [ ] Chạy migration SQL
- [ ] Đăng nhập admin thành công
- [ ] Tạo được user mới
- [ ] User mới login được
- [ ] Test chat feature
- [ ] Test file upload

### Production:
- [ ] Hash passwords (bcrypt)
- [ ] JWT tokens
- [ ] Environment variables
- [ ] HTTPS certificate
- [ ] Database backup script
- [ ] Rate limiting
- [ ] Logging system
- [ ] Error monitoring (Sentry)
- [ ] Change admin password
- [ ] Update all default passwords

## 📞 HỖ TRỢ

### Liên hệ IT Support:
- Email: it@goldenenergy.vn
- Tel: 0901234567
- Slack: #it-support

### Tài liệu tham khảo:
- [ERP_LOGIN_SYSTEM.md](./ERP_LOGIN_SYSTEM.md) - Chi tiết kỹ thuật
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Hướng dẫn database
- [SECURITY.md](./SECURITY.md) - Hướng dẫn bảo mật

## 🎯 FAQ

**Q: Có thể thay đổi format mã nhân viên không?**  
A: Có, sửa trong `/api/erp/users/route.ts`, thay `GES` thành prefix khác.

**Q: Làm sao để reset password cho user?**  
A: Admin có thể update trực tiếp trong database hoặc tạo chức năng reset password.

**Q: Có giới hạn số lượng user không?**  
A: Không, có thể tạo không giới hạn (GES001 → GES999).

**Q: User có thể tự đổi password không?**  
A: Hiện tại chưa có UI, sẽ bổ sung trong phiên bản sau.

**Q: Làm sao để vô hiệu hóa user?**  
A: Update `is_active = false` trong database hoặc thêm UI trong tương lai.

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 23/12/2025  
**Tác giả:** Golden Energy IT Team

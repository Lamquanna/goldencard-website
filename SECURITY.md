# 🔒 Security Guidelines - Golden Energy ERP

## Quan trọng về Bảo mật

### ⚠️ KHÔNG BAO GIỜ:

1. **Commit credentials vào Git**
   - ❌ Không commit `.env.local`
   - ❌ Không commit `firebase-admin-key.json`
   - ❌ Không commit passwords trong code
   - ❌ Không share credentials qua email/chat

2. **Hiển thị thông tin nhạy cảm**
   - ❌ Không hiển thị danh sách user/password trên UI
   - ❌ Không log passwords ra console
   - ❌ Không gửi passwords qua query string

3. **Sử dụng mật khẩu yếu**
   - ❌ Không dùng password mặc định lâu dài
   - ❌ Không dùng password đơn giản (123, abc, etc.)
   - ❌ Không share password giữa nhiều người

---

## ✅ Best Practices

### 1. Environment Variables

**Setup:**
```bash
# Copy example file
cp .env.local.example .env.local

# Edit with your real credentials
# NEVER commit .env.local to git
```

**Kiểm tra .gitignore:**
```gitignore
# env files (can opt-in for committing if needed)
.env*
```

### 2. Firebase Service Account Key

**Location:** `firebase-admin-key.json` (root directory)

**Security:**
- Không commit vào Git
- Chỉ admin mới có file này
- Download từ Firebase Console > Project Settings > Service Accounts
- Đổi tên thành `firebase-admin-key.json`

**Add vào .gitignore:**
```gitignore
# Firebase
firebase-admin-key.json
*.json
!package.json
!tsconfig.json
```

### 3. Password Policy

**Yêu cầu:**
- Tối thiểu 8 ký tự (khuyến nghị)
- Kết hợp chữ hoa, chữ thường, số, ký tự đặc biệt
- Không sử dụng thông tin cá nhân dễ đoán
- Đổi password định kỳ (3-6 tháng)

**Mật khẩu mặc định:**
- Chỉ dùng để setup ban đầu
- Bắt buộc đổi ngay sau lần đăng nhập đầu
- Admin không biết password của users (Firebase encryption)

### 4. User Account Management

**Tạo account mới:**
```bash
# Chỉ admin chạy script này
node scripts/seed-firebase-auth.js
```

**Quy trình:**
1. Admin tạo account với password tạm
2. Gửi email riêng cho nhân viên (không qua chat/công khai)
3. User đăng nhập lần đầu → Bắt buộc đổi password
4. Password cũ bị vô hiệu hóa

### 5. Firestore Security Rules

**Đã cấu hình:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Chỉ user được đọc profile của chính mình
    match /employees/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat rooms - chỉ members mới truy cập
    match /chat_rooms/{roomId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
  }
}
```

### 6. Authentication Flow

**Bảo mật tại mỗi bước:**

```
1. Login Page
   ↓ (HTTPS only)
   
2. Firebase Authentication
   ↓ (Encrypted token)
   
3. Check mustChangePassword
   ↓ (Force password change)
   
4. Load User Profile
   ↓ (Firestore rules applied)
   
5. Access ERP
   ✅ Authenticated & Authorized
```

---

## 🛡️ Security Checklist

### Deployment

- [ ] `.env.local` không được commit
- [ ] `firebase-admin-key.json` không được commit
- [ ] Environment variables đã set trên Vercel
- [ ] Firestore Security Rules đã deploy
- [ ] Firebase Authentication Email/Password đã enable
- [ ] HTTPS được enforce (Vercel tự động)

### User Management

- [ ] Tất cả users đã đổi password mặc định
- [ ] Không có password được hardcode trong code
- [ ] Admin không share service account key
- [ ] Access logs được monitor định kỳ

### Code Review

- [ ] Không có console.log() với sensitive data
- [ ] Error messages không reveal system info
- [ ] API endpoints có authentication check
- [ ] Input validation đầy đủ

---

## 🚨 Incident Response

### Nếu credentials bị lộ:

1. **Ngay lập tức:**
   - Xóa credentials khỏi Git history
   - Revoke Firebase API keys
   - Reset tất cả passwords
   - Generate new service account key

2. **Thông báo:**
   - Email security team
   - Thông báo users cần đổi password
   - Document incident

3. **Phòng ngừa:**
   - Review access logs
   - Update security rules
   - Audit code lại
   - Training team về security

---

## 📞 Liên hệ

**Security Issues:**
- Email: security@goldenenergy.vn
- Emergency: it@goldenenergy.vn

**IT Support:**
- Email: it@goldenenergy.vn
- Internal: #it-support channel

---

## 📚 Tài liệu tham khảo

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Last Updated:** December 2024
**Version:** 1.0.0

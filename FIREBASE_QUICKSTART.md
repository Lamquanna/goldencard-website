# 🚀 Quick Start - Firebase Auth & Chat

## Bước 1: Chuẩn bị Firebase (5 phút)

### 1.1. Enable Authentication
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. **Authentication** → **Sign-in method** → Enable **Email/Password**

### 1.2. Create Firestore
1. **Firestore Database** → **Create database** → Chọn location `asia-southeast1`

### 1.3. Download Service Account Key
1. **Project Settings** → **Service accounts** → **Generate new private key**
2. Download và đổi tên thành `firebase-admin-key.json`
3. Đặt vào thư mục gốc project (cùng cấp `package.json`)

## Bước 2: Seed Accounts (1 phút)

```bash
npm install firebase-admin
node scripts/seed-firebase-auth.js
```

**Kết quả:** 12 tài khoản nhân viên được tạo với:
- Email: `ges001@goldenenergy.vn` đến `ges012@goldenenergy.vn`
- Password: `Golden@2024`

## Bước 3: Test Login

```bash
npm run dev
```

Truy cập: `http://localhost:3000/erp/login`

**Test account:**
- Mã NV: `GES001`
- Password: `Golden@2024`

---

## 📝 Chi tiết đầy đủ

Xem [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) để biết thêm chi tiết về:
- Firestore Security Rules
- Cấu trúc Collections
- API Documentation
- Troubleshooting

---

## 🎯 Tính năng

✅ **Authentication**
- Login bằng mã nhân viên (GES001)
- Tự động convert sang email (@goldenenergy.vn)
- Session management
- Auto-logout khi token expire

✅ **Chat System** (Ready to integrate)
- Real-time messaging với Firestore
- Direct messages, group chats, channels
- Typing indicators
- Read receipts
- Message history

✅ **Employee Profiles**
- Profile lưu trong Firestore
- Last login tracking
- Department & role information

---

**Next:** Integrate chat vào `/erp/chat/page.tsx` để sử dụng Firebase realtime chat!

# Firebase Authentication & Chat Setup Guide

Hướng dẫn cấu hình Firebase Authentication và Chat system cho Golden Energy ERP

## 📋 Bước 1: Cấu hình Firebase Console

### 1.1. Enable Firebase Authentication

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn
3. Vào **Authentication** → **Sign-in method**
4. Enable **Email/Password** provider
5. Không cần enable **Email link (passwordless sign-in)**

### 1.2. Create Firestore Database

1. Vào **Firestore Database**
2. Click **Create database**
3. Chọn **Start in production mode** (hoặc test mode nếu đang dev)
4. Chọn location gần nhất (ví dụ: `asia-southeast1`)

### 1.3. Firestore Security Rules

Sau khi tạo Firestore, cập nhật Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Employee profiles - chỉ đọc được profile của mình
    match /employees/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat rooms - chỉ members mới truy cập được
    match /chat_rooms/{roomId} {
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Chat messages - chỉ members trong room mới đọc/viết được
    match /chat_messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.senderId;
    }
    
    // Typing status - public cho members
    match /typing_status/{statusId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📋 Bước 2: Download Service Account Key

1. Vào **Project Settings** (icon bánh răng) → **Service accounts**
2. Click **Generate new private key**
3. Download file JSON
4. Đổi tên thành `firebase-admin-key.json`
5. Đặt file vào **thư mục gốc project** (cùng cấp với package.json)
6. **QUAN TRỌNG:** Add vào `.gitignore`:

```
# Firebase
firebase-admin-key.json
```

## 📋 Bước 3: Install Dependencies

```bash
npm install firebase-admin
```

## 📋 Bước 4: Seed Employee Accounts

Chạy script để tạo tài khoản cho tất cả nhân viên:

```bash
node scripts/seed-firebase-auth.js
```

Script này sẽ:
- Tạo Firebase Auth accounts cho 12 nhân viên
- Email format: `ges001@goldenenergy.vn`
- Mật khẩu mặc định: `1`
- Tự động tạo profile trong Firestore collection `employees`
- Đánh dấu `mustChangePassword: true` để yêu cầu đổi password lần đầu

### Danh sách tài khoản được tạo:

| Mã NV | Email | Tên | Chức vụ |
|-------|-------|-----|---------|
| GES001 | ges001@goldenenergy.vn | Jimmy Ha | CEO & Founder |
| GES002 | ges002@goldenenergy.vn | Rita Kim Anh | CFO |
| GES003 | ges003@goldenenergy.vn | Tuan Ha | COO |
| GES004 | ges004@goldenenergy.vn | Tan Ho | Head of Sales |
| GES005 | ges005@goldenenergy.vn | Anh Le | Head of Marketing |
| GES006 | ges006@goldenenergy.vn | Minh Nguyen | Technical Director |
| GES007 | ges007@goldenenergy.vn | Thao Pham | Project Manager |
| GES008 | ges008@goldenenergy.vn | Duc Tran | Senior Engineer |
| GES009 | ges009@goldenenergy.vn | Linh Vo | HR Manager |
| GES010 | ges010@goldenenergy.vn | Khoa Dang | Quality Assurance |
| GES011 | ges011@goldenenergy.vn | Huong Nguyen | Customer Success |
| GES012 | ges012@goldenenergy.vn | Long Pham | Operations Specialist |

## 📋 Bước 5: Verify Environment Variables

Kiểm tra file `.env.local` có đầy đủ Firebase config:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## 📋 Bước 6: Test Login

1. Chạy dev server:
```bash
npm run dev
```

2. Truy cập: `http://localhost:3000/erp/login`

3. Test login với:
   - Mã nhân viên: `GES001`
   - Mật khẩu: `Golden@2024`

4. Sau khi login thành công, bạn sẽ được redirect đến `/erp/dashboard`

## 🔐 Cấu trúc Authentication

### Login Flow

```
User Input (GES001) 
  ↓
Convert to email (ges001@goldenenergy.vn)
  ↓
Firebase signInWithEmailAndPassword()
  ↓
Update lastLogin in Firestore
  ↓
Redirect to /erp/dashboard
```

### Auth Service (`lib/firebase/auth.ts`)

Các functions chính:
- `signInEmployee(code, password)` - Đăng nhập
- `signOutEmployee()` - Đăng xuất
- `getCurrentUser()` - Lấy user hiện tại
- `onAuthChange(callback)` - Listen auth state changes
- `getEmployeeProfile(uid)` - Lấy profile từ Firestore
- `createEmployeeProfile(uid, data)` - Tạo profile mới

### Chat Service (`lib/firebase/chat.ts`)

Các functions chính:
- `sendMessage(roomId, senderId, senderName, message)` - Gửi tin nhắn
- `subscribeToMessages(roomId, callback)` - Realtime messages
- `createChatRoom(name, type, participants)` - Tạo room chat
- `getOrCreateDirectRoom(user1, user2)` - Tạo/lấy DM room
- `subscribeToUserRooms(userId, callback)` - Realtime rooms
- `markMessagesAsRead(roomId, userId)` - Đánh dấu đã đọc
- `updateTypingStatus(roomId, userId, userName)` - Typing indicator

## 📊 Firestore Collections Structure

### `employees` Collection

```javascript
{
  uid: "firebase_user_uid",
  employeeCode: "GES001",
  email: "ges001@goldenenergy.vn",
  nameEn: "Jimmy Ha",
  nameVi: "Hà Nhật Anh",
  roleEn: "CEO & Founder",
  roleVi: "Giám Đốc Điều Hành & Sáng Lập",
  department: "Leadership",
  category: "leadership",
  avatar?: "https://...",
  isActive: true,
  lastLogin: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `chat_rooms` Collection

```javascript
{
  id: "room_id",
  name: "Room Name",
  type: "direct" | "group" | "channel",
  participants: ["uid1", "uid2"],
  participantNames: {
    "uid1": "Name 1",
    "uid2": "Name 2"
  },
  lastMessage?: "Last message text",
  lastMessageAt?: Timestamp,
  unreadCount: {
    "uid1": 0,
    "uid2": 5
  },
  createdBy: "uid",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `chat_messages` Collection

```javascript
{
  id: "message_id",
  roomId: "room_id",
  senderId: "uid",
  senderName: "Sender Name",
  senderAvatar?: "https://...",
  message: "Message text",
  type: "text" | "image" | "file",
  fileUrl?: "https://...",
  fileName?: "file.pdf",
  fileSize?: 1024,
  isRead: false,
  createdAt: Timestamp
}
```

## 🔄 Next Steps

1. ✅ Tạo trang Chat với Firebase realtime
2. ✅ Implement protected routes middleware
3. ✅ Add profile management
4. ✅ Add password reset functionality
5. ✅ Add file upload to Firebase Storage

## 🛟 Troubleshooting

### Lỗi: "Firebase not initialized"
- Kiểm tra `.env.local` có đầy đủ config
- Restart dev server

### Lỗi: "Missing or insufficient permissions"
- Check Firestore Security Rules
- Đảm bảo user đã login

### Lỗi: "Email already exists"
- User đã được tạo từ trước
- Skip hoặc update thông tin

### Lỗi seeding script
- Kiểm tra `firebase-admin-key.json` có đúng vị trí
- Kiểm tra Service Account có quyền Admin
- Check internet connection

## 📞 Support

Nếu gặp vấn đề, liên hệ IT team hoặc tạo issue trong project.

---

**Last updated:** 2024
**Version:** 1.0.0

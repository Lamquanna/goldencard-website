# 🔥 Firebase Troubleshooting - Giải quyết lỗi kết nối

## Lỗi hiện tại: "Network connection error"

### 📋 Checklist kiểm tra:

#### 1. ✅ Kiểm tra Firebase Project trong Console

Truy cập: https://console.firebase.google.com/project/goldenenergy-bead9

**Cần kiểm tra:**
- [ ] Project có tồn tại và active
- [ ] Authentication đã enable Email/Password
- [ ] Firestore Database đã được tạo
- [ ] Billing plan (Spark/Blaze) - nếu vượt quota cần nâng cấp

#### 2. ✅ Kiểm tra Authentication Settings

**Path:** Firebase Console → Authentication → Sign-in method

- [ ] Email/Password: **Enabled** ✅
- [ ] Email link (passwordless sign-in): **Disabled** ❌

**Authorized domains:**
```
localhost
goldenenergy.vn
*.vercel.app
```

#### 3. ✅ Kiểm tra Firestore Database

**Path:** Firebase Console → Firestore Database

**Status cần là:** 
- Production mode hoặc Test mode (tùy môi trường)
- Location: `asia-southeast1` (Singapore) - gần VN nhất

**Security Rules hiện tại:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Employees collection
    match /employees/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat rooms
    match /chat_rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
    
    // Chat messages
    match /chat_rooms/{roomId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ Test mode rules (CHỈ DÙNG DEVELOPMENT):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

#### 4. ✅ Kiểm tra Firebase API Keys

**Path:** Firebase Console → Project settings → General

```
Web API Key: AIzaSyBJQrhYBKPTpomR_FTbh33NglD8THJkiic
```

**API restrictions:**
- Không nên restrict cho development
- Production: restrict theo domain

#### 5. ✅ Test Connection từ Local

**Tạo file test:** `scripts/test-firebase-connection.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function testConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore
    const db = admin.firestore();
    const snapshot = await db.collection('employees').limit(1).get();
    console.log('✅ Firestore: Connected');
    console.log(`   Found ${snapshot.size} documents`);
    
    // Test Auth
    const listUsers = await admin.auth().listUsers(1);
    console.log('✅ Auth: Connected');
    console.log(`   Found ${listUsers.users.length} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

**Chạy test:**
```bash
node scripts/test-firebase-connection.js
```

#### 6. ✅ Kiểm tra Internet & Firewall

**Test commands:**
```powershell
# Ping Firebase
ping firestore.googleapis.com

# Check DNS
nslookup goldenenergy-bead9.firebaseapp.com

# Test HTTPS
curl https://goldenenergy-bead9.firebaseapp.com
```

**Có thể bị block bởi:**
- Corporate firewall
- VPN
- Antivirus software
- Windows Firewall

#### 7. ✅ Kiểm tra Browser Console

**Mở DevTools (F12) → Console tab**

**Lỗi thường gặp:**

```
❌ "Firebase: Error (auth/network-request-failed)"
→ Không kết nối được Firebase servers
→ Kiểm tra internet hoặc firewall

❌ "Firebase: Error (auth/api-key-not-valid)"
→ API key sai hoặc bị restrict
→ Check Firebase Console settings

❌ "Firebase: Error (auth/invalid-api-key)"
→ API key không tồn tại
→ Re-check .env.local

❌ "Firebase: Error (auth/too-many-requests)"
→ Quá nhiều request failed
→ Đợi vài phút hoặc reset IP

❌ CORS error
→ Domain chưa được authorize
→ Add vào Authorized domains
```

#### 8. ✅ Restart & Clear Cache

```powershell
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Clear node_modules (nếu cần)
Remove-Item -Recurse -Force node_modules
npm install

# Restart dev server
npm run dev
```

---

## 🔧 Giải pháp theo từng lỗi

### Lỗi: "auth/network-request-failed"

**Nguyên nhân:**
1. Không có internet
2. Firebase bị firewall block
3. DNS không resolve được

**Fix:**
```powershell
# 1. Check internet
ping 8.8.8.8

# 2. Flush DNS
ipconfig /flushdns

# 3. Try different DNS
# Settings → Network → Change adapter → Properties
# Set DNS to: 8.8.8.8, 8.8.4.4 (Google DNS)

# 4. Disable VPN
# Temporarily turn off VPN

# 5. Check Windows Firewall
# Settings → Firewall → Allow app
# Add Node.js and your browser
```

### Lỗi: "auth/invalid-email"

**Fix:**
Đảm bảo employee code được convert đúng:
```javascript
// GES001 → ges001@goldenenergy.vn
const email = `${employeeCode.toLowerCase()}@goldenenergy.vn`;
```

### Lỗi: "auth/user-not-found"

**Fix:**
Chạy lại seed script:
```bash
node scripts/seed-firebase-auth.js
```

### Lỗi: "auth/wrong-password"

**Confirm:**
- Default password: `1`
- Check có bắt buộc đổi pass chưa

---

## 📞 Support

**Nếu vẫn không fix được:**

1. **Check Firebase Status:**
   https://status.firebase.google.com

2. **Email IT:**
   it@goldenenergy.vn

3. **Share error logs:**
   - Browser Console screenshot
   - Terminal error messages
   - Network tab (DevTools)

---

## ✅ Quick Fix Checklist

```
[ ] Firebase project active trong Console
[ ] Authentication Email/Password enabled
[ ] Firestore database đã tạo
[ ] API key trong .env.local đúng
[ ] Domain được authorize (localhost)
[ ] Internet connection OK
[ ] No VPN/Firewall blocking
[ ] Đã seed users (node scripts/seed-firebase-auth.js)
[ ] Clear cache (.next folder)
[ ] Restart dev server
```

**Sau khi check hết list trên mà vẫn lỗi → Contact IT với full error logs**

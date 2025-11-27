# 🔐 HƯỚNG DẪN SETUP GOOGLE OAUTH

## Bước 1: Lấy Google OAuth Credentials

1. Truy cập: https://console.cloud.google.com/
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Name: `GoldenCard Website`
7. **Authorized redirect URIs** - Thêm 2 URLs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://goldenenergy.vn/api/auth/callback/google
   ```
8. Click **Create**
9. Copy **Client ID** và **Client Secret**

## Bước 2: Cập nhật .env.local

Mở file `.env.local` và thay thế:
```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
```

## Bước 3: Setup trên Vercel

1. Vào Vercel Dashboard: https://vercel.com/lamqanna/goldencard-website
2. Settings → Environment Variables
3. Thêm các biến:
   - `GOOGLE_CLIENT_ID` = (client ID từ Google)
   - `GOOGLE_CLIENT_SECRET` = (client secret từ Google)
   - `NEXTAUTH_URL` = https://goldenenergy.vn
   - `NEXTAUTH_SECRET` = lC+WXLQBplUUCLKpPIvsIVTmFhOidK5UU3lyyEkQPgQ=

## Bước 4: Test local

```bash
npm run dev
```

Mở http://localhost:3000/auth/signin để test đăng nhập

## Bước 5: Deploy

```bash
git add .
git commit -m "feat: add authentication system"
git push origin main
```

---

## 🎯 Tính năng đã setup:

✅ Chỉ 2 email được phép đăng nhập:
   - anhlq11002@gmail.com
   - lamqanna@gmail.com

✅ API `/api/contact` được bảo vệ - chỉ admin đã login mới gọi được

✅ Trang đăng nhập đẹp: `/auth/signin`

✅ Trang lỗi thông báo rõ: `/auth/error`

✅ Component AdminLoginButton để thêm vào header

---

## ⚠️ QUAN TRỌNG:

1. **KHÔNG push file .env.local lên GitHub** (đã tự động ignore)
2. **Phải setup Google OAuth trước khi test**
3. **Nhớ thêm environment variables trên Vercel trước khi deploy**
4. **Production URL phải khớp với redirect URI trong Google Console**

---

## 📝 Cách sử dụng AdminLoginButton:

Thêm vào header hoặc bất kỳ đâu:

```tsx
import AdminLoginButton from "@/components/AdminLoginButton"

export default function Header() {
  return (
    <header>
      <AdminLoginButton />
    </header>
  )
}
```

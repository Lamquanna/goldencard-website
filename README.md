# Golden Energy Vietnam Website# GoldenCard Website



Trang web chính thức của **Golden Energy Vietnam** - Công ty giải pháp năng lượng mặt trời hàng đầu Việt Nam.Multilingual marketing site for GoldenCard and GoldenEnergy, featuring localized content, detailed service offerings, and a conversion-focused contact flow.



## 🌟 Tổng Quan Dự Án## Getting Started



**Golden Energy Vietnam** là website chính, giới thiệu giải pháp năng lượng mặt trời và các dịch vụ liên quan. Website bao gồm:```bash

npm install

### Cấu Trúc Trang Webnpm run dev

```

1. **Trang Chủ** (`/vi`, `/en`, `/zh`)

   - **Golden Energy** - Giải pháp năng lượng mặt trời  Visit <http://localhost:3000>. The app redirects to the default Vietnamese locale (`/vi`). Switch to English via the language selector in the navigation.

   - Hero section với loading animation "GOLDENENERGY"

   - Thông tin dịch vụ, dự án, contact đầy đủ## Tooling



2. **Trang About** (`/vi/about`)- Next.js 15 App Router with TypeScript

   - Về Golden Energy- Tailwind CSS v4 using GoldenCard design tokens and shadcn/ui utilities

   - Giá trị cốt lõi và tầm nhìn- Framer Motion animations in the hero section

- Vitest + Testing Library (`npm run test:unit`) for component tests

3. **Trang Services** (`/vi/services`)- Playwright (`npm run test:e2e`) for end-to-end scenarios

   - Các dịch vụ năng lượng mặt trời

## Structure

4. **Trang Contact** (`/vi/contact`)

   - Form liên hệ- `app/` – Route groups for each locale (`[locale]`), API endpoints, and shared layout

   - Thông tin văn phòng, hotline, email- `components/` – Modular UI components (hero, service cards, forms, navigation)

- `lib/` – Content loaders, i18n helpers, navigation logic, SEO builders

5. **Trang GoldenCard** (`/vi/services/goldenenergy`)- `marketing-content.json` – Source-of-truth bilingual marketing copy

   - **GoldenCard** - Giải pháp thẻ từ thông minh

   - Một ngành kinh doanh khác của Golden Energy Group## Deployment

   - Giải pháp thẻ cho khách sạn, resort, spa, doanh nghiệp

Optimized for Vercel. Run `npm run build` to generate the production output (ISR-enabled). Configure analytics, environment secrets, and Sanity CMS when ready to integrate dynamic content.

## 🎨 Thiết Kế & Thương Hiệu

### 🌿 YÊU CẦU DESIGN MỚI - Theme Trắng Sáng Năng Lượng Xanh

**Mục tiêu**: Redesign toàn bộ website theo theme trắng sáng, nhẹ nhàng, mang hơi hướng năng lượng xanh - clean, modern, sustainable.

#### Hệ Thống Màu Sắc Mới
- **Background chính**: Trắng tinh khôi (#FFFFFF) hoặc trắng kem nhẹ (#FAFAFA, #F8F9FA)
- **Background phụ**: Xanh pastel nhẹ (#E8F5E9, #E0F2F1, #E3F2FD) - gợi cảm giác thiên nhiên
- **Text chính**: Xám đậm (#1A1A1A, #2C3E50, #37474F) - dễ đọc, contrast cao
- **Text phụ**: Xám trung bình (#546E7A, #607D8B)
- **Accent colors**: 
  - 🌱 Xanh lá năng lượng: #4CAF50, #66BB6A (CTA, highlights)
  - ☀️ Vàng năng lượng mặt trời: #FFC107, #FFD54F (điểm nhấn)
  - 🌊 Xanh dương sky: #42A5F5, #29B6F6 (trust, innovation)

#### Typography & Spacing
- **Font**: Montserrat (body), Playfair Display (headings) - giữ nguyên
- **Font Size**: Tăng 1-2px (base: 17px thay vì 16px)
- **Line Height**: 1.7-1.8 cho văn bản dài (thoáng, dễ đọc)
- **Spacing**: Breathing space nhiều hơn (padding/margin tăng 20-30%)
- **Letter Spacing**: 0.02em cho body text

#### Thành Phần UI

**Header/Navbar**: 
- Background: Trắng với shadow nhẹ hoặc glass effect (backdrop-blur-md bg-white/95)
- Text: Xám đậm (#2C3E50), hover với accent xanh (#4CAF50)
- Logo: Giữ gradient Golden Energy (vàng-cam)
- Sticky: Có shadow khi scroll

**Footer**: 
- **GIỮ NGUYÊN MÀU ĐEN** (bg-[#0A0A0A])
- Footer là điểm tương phản anchor với body sáng
- Text: text-[#CCC], text-white như hiện tại
- Video overlay: Tối (bg-black/70) để text rõ ràng

**Sections/Cards**:
- Background: Trắng (#FFFFFF) với shadow nhẹ (0 2px 8px rgba(0,0,0,0.05))
- Border: border-gray-100 hoặc không có border
- Border radius: 12-16px (mềm mại, modern)
- Hover: Shadow nâng lên (0 8px 24px rgba(0,0,0,0.08)), scale 1.02

**Buttons**:
- Primary: Gradient xanh lá (#4CAF50 → #66BB6A) với shadow
- Secondary: Outline xám (border-gray-300) với hover fill xanh nhạt
- Rounded: 10px (medium rounded)
- Hover: Transform scale(1.05) + shadow tăng

#### Hình Ảnh & Media
- Images: Overlay trắng nhẹ (bg-white/10-20%) thay vì đen
- Video backgrounds: Giảm opacity, overlay trắng mờ (bg-white/50)
- Icons: Line style, stroke xanh/xám (#4CAF50, #607D8B) thay vì filled
- Illustrations: Flat design, pastel colors

#### Animation & Interaction
- Transitions: Smooth 300-400ms ease-in-out
- Hover effects: Scale up nhẹ (1.02-1.05), không dùng dark overlay
- Loading states: Skeleton screens màu xám nhạt (#E0E0E0)
- Scroll animations: Fade + slide up (subtle, không quá dramatic)
- Page transitions: Overlay trắng thay vì đen

#### Accessibility
- Contrast ratio: Tối thiểu 4.5:1 (WCAG AA)
- Focus states: Outline xanh rõ ràng (ring-2 ring-green-500)
- Dark mode: **Không cần** - focus 100% vào light theme hoàn hảo

---

Notes:

### Golden Energy (Trang Chính)- Set `NEXT_PUBLIC_SITE_URL` in environment for accurate OpenGraph canonical URLs.

- **Old Theme**: Đen tối (#0A0A0A) - ~~đã loại bỏ~~ → Chuyển sang trắng sáng- Place OG images at `public/images/og/{home|services|goldenenergy|contact}.png` to populate social previews; defaults are referenced in `lib/seo.ts`.

- **New Theme**: Trắng sáng với accents xanh năng lượng (#4CAF50, #42A5F5)
- **Font**: Playfair Display (heading), Montserrat (body)
- **Icon**: Mặt trời với tia năng lượng (gradient vàng-cam)
- **Loading**: Chữ "GOLDENENERGY" animation

### GoldenCard (Sub-brand)
- **Theme**: Tím, xanh dương, hồng - sang trọng (điều chỉnh nhẹ nhàng hơn)
- **Vị trí**: Chỉ ở `/vi/services/goldenenergy`
- **Label**: "Sản phẩm của Golden Energy Group"

## 📋 Thông Tin Liên Hệ

**Golden Energy Vietnam**
- **Trụ sở**: 625 Trần Xuân Soạn, Phường Tân Hưng, TP.HCM
- **VP Đại diện**: A2206-A2207 Tháp A, Sunrise Riverside, Xã Nhà Bè, TP.HCM
- **Kho**: 354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, TP.HCM
- **Hotline**: 03333 142 88 / 0903 117 277
- **Email**: sales@goldenenergy.vn
- **Giờ làm việc**: 8:00 - 17:30 (T2 - T7)

## 🛠️ Tech Stack

- Next.js 15.5.5 (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React

## 🚀 Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit: http://localhost:3000

### Build
\`\`\`bash
npm run build
npm start
\`\`\`

## 📁 Structure

\`\`\`
app/
├── [locale]/
│   ├── page.tsx              # Golden Energy homepage
│   ├── about/
│   ├── contact/
│   ├── services/
│   │   └── goldenenergy/     # GoldenCard page
├── layout.tsx
├── icon.svg                   # Favicon
components/
├── LoadingAnimation.tsx
├── Footer.tsx
├── Navbar.tsx
lib/
├── content.ts
├── seo.ts
\`\`\`

## 🌐 Multi-language

- 🇻🇳 Tiếng Việt (`/vi`)
- 🇬🇧 English (`/en`)
- 🇨🇳 中文 (`/zh`)

## 📝 Important Notes

### Naming Convention
- **Golden Energy**: Tên chính của công ty
- **GoldenCard**: Tên sản phẩm thẻ từ (chỉ dùng trong `/services/goldenenergy`)

### Copyright
© 2025 Golden Energy. Tất cả quyền được bảo lưu.

### URLs
- Production: https://www.goldenenergy.vn
- Repository: https://github.com/lamqanna/goldencard-website

## 🔄 Recent Updates

- ✅ LoadingAnimation "GOLDENENERGY"
- ✅ Icon năng lượng mặt trời
- ✅ Section liên hệ đầy đủ
- ✅ Tách Golden Energy & GoldenCard
- ✅ Clean code, xóa components thừa
- ✅ Cập nhật SEO metadata

---

**Built with ❤️ by Golden Energy Vietnam Team**

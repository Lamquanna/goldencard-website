# 📋 GOLDENCARD WEBSITE - TECHNICAL DOCUMENTATION

## 🎯 Dự án tổng quan
**Tên dự án:** GoldenCard Website  
**Mục đích:** Website giới thiệu dịch vụ năng lượng mặt trời và giải pháp công nghệ xanh  
**Phiên bản:** 0.1.0  
**Ngày cập nhật:** October 28, 2025

---

## 🏗️ KIẾN TRÚC VÀ CÔNG NGHỆ

### 1. **Framework & Core Technologies**

#### **Frontend Framework**
- **Next.js 15.5.5** - React framework with App Router
  - Server-Side Rendering (SSR)
  - Static Site Generation (SSG)
  - API Routes
  - Image Optimization
  - Internationalization (i18n) support

#### **React Ecosystem**
- **React 19.1.0** - UI library
- **React DOM 19.1.0** - DOM rendering

#### **TypeScript 5.x**
- Type safety
- Better IDE support
- Enhanced developer experience

---

### 2. **Styling & Animation**

#### **CSS Framework**
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **PostCSS** - CSS transformation
- **tw-animate-css 1.4.0** - Tailwind animation utilities

#### **Animation Libraries**
- **GSAP 3.13.0** - Professional-grade animation
  - ScrollTrigger plugin
  - Timeline animations
  - Smooth transitions
- **Framer Motion 11.3.19** - React animation library
  - Page transitions
  - Motion components
  - AnimatePresence

---

### 3. **UI Components & Utilities**

#### **Component Libraries**
- **Lucide React 0.545.0** - Icon library
- **Class Variance Authority (CVA) 0.7.1** - Component variants
- **clsx 2.1.1** - Conditional classNames
- **tailwind-merge 3.3.1** - Merge Tailwind classes

---

### 4. **Authentication**
- **NextAuth.js 5.0.0-beta.29**
  - Authentication system
  - Session management
  - OAuth providers support

---

### 5. **Testing**

#### **Unit Testing**
- **Vitest 2.1.6** - Fast unit test framework
- **Testing Library React 16.0.1** - React testing utilities
- **Testing Library Jest DOM 6.6.3** - DOM matchers
- **Testing Library User Event 14.5.1** - User interaction simulation
- **jsdom 24.1.3** - DOM implementation

#### **E2E Testing**
- **Playwright 1.48.2** - End-to-end testing

---

### 6. **Development Tools**

#### **Linting & Code Quality**
- **ESLint 9.x** - JavaScript/TypeScript linter
- **eslint-config-next 15.5.5** - Next.js ESLint config

#### **Build Tools**
- **Vite** - Fast build tool (for testing)
- **@vitejs/plugin-react 4.3.3** - React plugin for Vite

---

## 📁 CẤU TRÚC THỨ MỤC

```
goldencard-website/
├── app/                          # Next.js App Router
│   ├── [locale]/                # Internationalization routes
│   │   ├── about/              # Trang giới thiệu
│   │   ├── contact/            # Trang liên hệ
│   │   ├── services/           # Trang dịch vụ
│   │   ├── test/               # Trang test
│   │   ├── layout.tsx          # Layout cho locale
│   │   └── page.tsx            # Homepage
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   └── contact/           # Contact form endpoint
│   ├── auth/                   # Auth pages
│   ├── fonts.ts               # Font configuration
│   ├── globals.css            # Global styles
│   └── layout.tsx             # Root layout
│
├── components/                  # React components (34 files)
│   ├── AdminLoginButton.tsx   # Admin login
│   ├── BackgroundMusicPlayer.tsx  # YouTube background music
│   ├── CaseStudy.tsx          # Case study component
│   ├── CompanyStrategy.tsx    # Strategy section
│   ├── ContactForm.tsx        # Contact form
│   ├── Container.tsx          # Container wrapper
│   ├── CurtainSection.tsx     # Curtain reveal effect
│   ├── Footer.tsx             # Footer component
│   ├── Hero.tsx               # Hero section
│   ├── HorizontalScroll.tsx   # Horizontal scroll
│   ├── HoverImage.tsx         # Advanced hover effects
│   ├── KpiGrid.tsx            # KPI display grid
│   ├── LoadingAnimation.tsx   # Loading screen (logo only)
│   ├── MagneticButton.tsx     # Magnetic button effect
│   ├── MarqueeText.tsx        # Scrolling text
│   ├── Navbar.tsx             # Navigation bar
│   ├── PageTransition.tsx     # Page transition effects
│   ├── ParallaxImage.tsx      # Parallax images
│   ├── PartnerGrid.tsx        # Partner logos grid
│   ├── ProductHighlights.tsx  # Product features
│   ├── ProjectShowcase.tsx    # Project gallery
│   ├── RevealOnScroll.tsx     # Scroll reveal animations
│   ├── ServiceCard.tsx        # Service cards
│   ├── SmoothScroll.tsx       # Smooth scroll wrapper
│   ├── SolarGallery.tsx       # Solar project gallery
│   ├── SplitTextAnimation.tsx # Text split animation
│   ├── StarryBackground.tsx   # Animated starry bg
│   ├── TextReveal.tsx         # 3D text reveal
│   ├── VideoShowcaseSection.tsx # YouTube video showcase
│   └── locale-*.tsx           # i18n components
│
├── lib/                        # Utility libraries
│   ├── content.ts             # Content management
│   ├── i18n.ts                # Internationalization
│   ├── navigation.ts          # Navigation helpers
│   └── seo.ts                 # SEO utilities
│
├── public/                     # Static assets
│   ├── logo-goldenenergy.png  # Main logo
│   ├── partners/              # Partner logos
│   └── Projects/              # Project images
│
├── marketing-content.json      # Content data (vi/en/zh)
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
├── next.config.ts             # Next.js config
└── README.md                  # Project documentation
```

---

## 🎨 DESIGN SYSTEM

### **Màu sắc chủ đạo**
- **Primary:** Emerald/Green (Năng lượng xanh)
- **Secondary:** Amber/Yellow (Năng lượng mặt trời)
- **Accent:** Blue (Công nghệ)
- **Background:** Black/Dark với gradient
- **Text:** White với opacity variations

### **Fonts**
- **DM Sans** - Primary font
- **Playfair Display** - Vietnamese text (elegant)
- **Montserrat** - English text (modern)

### **Animation Principles**
- **GSAP** cho animations phức tạp và timeline
- **Framer Motion** cho page transitions và component animations
- **Easing:** elastic.out, power4.inOut, power2.out
- **Duration:** 0.6s - 1.4s (responsive, không quá nhanh)

---

## 🌍 INTERNATIONALIZATION (i18n)

### **Supported Languages**
- 🇻🇳 **Vietnamese (vi)** - Default
- 🇬🇧 **English (en)**
- 🇨🇳 **Chinese (zh)**

### **Implementation**
- Route-based i18n với `[locale]` dynamic segment
- Content stored in `marketing-content.json`
- Locale switcher in navbar
- SEO metadata per language

---

## ✨ KEY FEATURES

### 1. **Premium Animations**
- Page transitions with curtain effect
- Scroll-triggered animations (GSAP ScrollTrigger)
- 3D text rotations
- Magnetic button effects
- Parallax images
- Smooth scroll wrapper

### 2. **Video Integration**
- YouTube video showcase (2 videos)
- Autoplay from 60s mark
- No controls, clean display
- Background music player (Apple Music style)

### 3. **Loading Experience**
- Simple logo-only loading screen
- 2-second duration
- Smooth fade in/out
- Framer Motion animations

### 4. **Responsive Design**
- Mobile-first approach
- Tailwind breakpoints (sm, md, lg, xl)
- Adaptive font sizes
- Touch-friendly interactions

### 5. **SEO Optimization**
- Meta tags per page
- Open Graph tags
- Twitter cards
- Sitemap generation
- Image optimization

---

## 🚀 DEPLOYMENT

### **Platform**
- **Vercel** - Production hosting
- Automatic deployments from main branch
- Preview deployments for PRs

### **Build Process**
```bash
npm run build    # Production build
npm run dev      # Development server
npm run lint     # Code linting
npm run test:e2e # E2E testing
```

---

## 📦 DEPENDENCIES SUMMARY

### **Production (14 packages)**
1. Next.js 15.5.5
2. React 19.1.0
3. React DOM 19.1.0
4. GSAP 3.13.0
5. Framer Motion 11.3.19
6. NextAuth 5.0.0-beta.29
7. Lucide React 0.545.0
8. CVA 0.7.1
9. clsx 2.1.1
10. tailwind-merge 3.3.1

### **Development (16 packages)**
- TypeScript, ESLint, Playwright
- Testing libraries (Vitest, Testing Library)
- Tailwind CSS 4.0
- Vite plugin

---

## 🎯 RECENT IMPROVEMENTS

### **Latest Updates (Oct 28, 2025)**
1. ✅ Videos start from 60s (not from beginning)
2. ✅ Removed custom cursor (cleaner UX)
3. ✅ Fixed footer text visibility (dark bg, white text)
4. ✅ Simplified loading (logo only, no counter)
5. ✅ Fixed background music autoplay
6. ✅ Restored logo original colors
7. ✅ Replaced YouTube videos (new IDs)
8. ✅ Fixed copyright text duplication
9. ✅ Fixed logo loading path
10. ✅ Cleaned up code (removed OVALoading.tsx)

---

## 📝 NOTES FOR DEVELOPERS

### **Code Standards**
- TypeScript strict mode enabled
- ESLint with Next.js config
- Functional components preferred
- Hooks-based state management
- No class components

### **Animation Best Practices**
- Use GSAP for complex timelines
- Use Framer Motion for React components
- Clean up animations on unmount
- Use refs for GSAP targets
- Avoid inline styles when possible

### **Performance**
- Image optimization with next/image
- Lazy loading for heavy components
- Code splitting with dynamic imports
- Minimize bundle size

---

## 🐛 KNOWN ISSUES (RESOLVED)
- ~~OVALoading.tsx duplicate code~~ ✅ FIXED
- ~~page-new.tsx conflicts~~ ✅ REMOVED
- ~~Logo path errors~~ ✅ FIXED
- ~~Copyright duplication~~ ✅ FIXED
- ~~321 TypeScript errors~~ ✅ CLEANED

---

## 📞 SUPPORT
- GitHub: lamqanna/goldencard-website
- Production: https://goldencard-website.vercel.app
- Tech Stack: Next.js + React + TypeScript + GSAP + Framer Motion

---

**Generated:** October 28, 2025  
**Status:** ✅ Production Ready  
**Build:** Successful  
**Deployment:** Active on Vercel

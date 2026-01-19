# 🚀 Developer Quickstart Guide

> **Time to setup:** 15-20 minutes  
> **Difficulty:** Beginner-friendly  
> **Prerequisites:** Node.js 18+, Git

---

## 📋 Prerequisites

### Required Software

| Software | Version | Download |
|----------|---------|----------|
| **Node.js** | 18.x or 20.x | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x+ | Included with Node.js |
| **Git** | 2.x+ | [git-scm.com](https://git-scm.com) |
| **VS Code** | Latest | [code.visualstudio.com](https://code.visualstudio.com) |

### Verify Installation

```bash
# Check versions
node --version   # Should be v18.x or v20.x
npm --version    # Should be 9.x or higher
git --version    # Should be 2.x or higher
```

### Recommended VS Code Extensions

```
- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- GitHub Copilot (optional)
```

---

## 🔧 Setup Instructions

### Step 1: Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/Lamquanna/goldencard-website.git

# Navigate to project directory
cd goldencard-website

# Check repository status
git status
```

### Step 2: Install Dependencies

```bash
# Install all dependencies (takes ~2-3 minutes)
npm install

# Verify installation
npm list --depth=0
```

**Expected output:**
```
goldencard-website@1.0.0
├── @prisma/client@x.x.x
├── next@16.0.10
├── react@19.x.x
├── typescript@5.x.x
└── ...
```

### Step 3: Environment Variables

Create `.env.local` file in project root:

```bash
# Copy template
cp .env.example .env.local

# Or create manually
touch .env.local
```

**Minimal configuration for local development:**

```bash
# .env.local

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/goldencard_dev"

# Authentication (NextAuth.js)
NEXTAUTH_SECRET="your-local-secret-key"  # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Optional: Analytics (not needed for dev)
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"

# Optional: APIs (mock data works without these)
COZE_API_KEY="your-coze-key"
FIREBASE_PROJECT_ID="your-project-id"
```

**Generate secrets:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Step 4: Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download from postgresql.org

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo service postgresql start
# Windows: Use pgAdmin or Services app

# Create database
createdb goldencard_dev

# Update DATABASE_URL in .env.local
DATABASE_URL="postgresql://localhost:5432/goldencard_dev"
```

#### Option B: Vercel Postgres (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new Postgres database
3. Copy connection string
4. Update `DATABASE_URL` in `.env.local`

#### Option C: Supabase (Free tier)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project
3. Go to Settings → Database
4. Copy connection string
5. Update `DATABASE_URL` in `.env.local`

### Step 5: Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# Seed database (optional - adds sample data)
npx prisma db seed
```

**Verify database:**
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Opens at: http://localhost:5555
# You should see tables: User, Lead, Project, etc.
```

### Step 6: Start Development Server

```bash
# Start Next.js dev server
npm run dev

# Server starts at: http://localhost:3000
```

**Expected output:**
```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 3.2s
```

### Step 7: Open in Browser

1. Go to: **http://localhost:3000**
2. Should see homepage
3. Try different locales:
   - Vietnamese: http://localhost:3000/vi
   - English: http://localhost:3000/en
   - Chinese: http://localhost:3000/zh
   - Indonesian: http://localhost:3000/id

---

## 📁 Project Structure

```
goldencard-website/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Localized routes
│   │   ├── page.tsx              # Homepage
│   │   ├── giai-phap/            # Solutions pages
│   │   ├── san-pham/             # Products catalog
│   │   ├── bai-viet/             # Blog system
│   │   ├── du-an/                # Project case studies
│   │   ├── faq/                  # FAQ page
│   │   └── lien-he/              # Contact page
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── leads/                # Lead management
│   │   └── analytics/            # Analytics endpoints
│   ├── sitemap.ts                # Dynamic sitemap
│   ├── robots.ts                 # Robots.txt
│   ├── not-found.tsx             # 404 page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI components
│   ├── SolarCalculator.tsx       # Calculator feature
│   ├── ContactForm.tsx           # Contact form
│   └── ...                       # Other components
│
├── lib/                          # Utilities & logic
│   ├── schema/                   # Schema.org generators
│   │   ├── organization.ts
│   │   ├── product.ts
│   │   ├── article.ts
│   │   └── breadcrumb.ts
│   ├── calculator/               # Solar calculator engine
│   │   └── solar-engine.ts
│   ├── i18n/                     # Internationalization
│   │   ├── translations.ts
│   │   └── hreflang.ts
│   ├── prisma.ts                 # Prisma client
│   └── utils.ts                  # Helper functions
│
├── prisma/                       # Database schema
│   ├── schema.prisma             # Database models
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Sample data
│
├── public/                       # Static files
│   ├── images/                   # Images
│   ├── videos/                   # Videos
│   └── favicon.ico               # Favicon
│
├── docs/                         # Documentation
│   ├── PROJECT_SUMMARY.md        # Project overview
│   ├── DEPLOYMENT_GUIDE_VERCEL.md
│   ├── PHASE_1_SUMMARY.md
│   ├── PHASE_2_SUMMARY.md
│   ├── PHASE_3_SUMMARY.md
│   └── PHASE_4_SUMMARY.md
│
├── .env.local                    # Environment variables (gitignored)
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── package.json                  # Dependencies
└── README.md                     # Readme
```

---

## 🎨 Key Technologies

### Frontend Stack

**Next.js 16** - React framework
- App Router (file-based routing)
- Server Components (default)
- Client Components (`'use client'`)
- Dynamic routes (`[slug]`, `[locale]`)
- Metadata API (SEO)

**React 19** - UI library
- Hooks (useState, useEffect, etc.)
- Server Components
- Suspense boundaries
- Error boundaries

**TypeScript 5** - Type safety
- Strict mode enabled
- No `any` types
- Interface-driven development

**TailwindCSS 4** - Styling
- Utility-first CSS
- Responsive design
- Dark mode support
- Custom theme

### Backend Stack

**Prisma** - ORM
- Type-safe database queries
- Schema-first approach
- Migration system
- Prisma Studio (GUI)

**NextAuth.js** - Authentication
- JWT sessions
- OAuth providers
- Email/password login
- Session management

**PostgreSQL** - Database
- Relational database
- ACID compliance
- JSON support
- Full-text search

### Dev Tools

**ESLint** - Code linting
**Prettier** - Code formatting
**Husky** - Git hooks
**Vitest** - Unit testing
**Playwright** - E2E testing

---

## 🛠️ Common Development Tasks

### Run Development Server

```bash
# Start dev server with hot reload
npm run dev

# Start on different port
PORT=3001 npm run dev

# Start with Turbopack (faster)
npm run dev --turbo
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Check build output
ls -la .next/

# Preview production build locally
npm run start
```

### Database Operations

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration
npx prisma migrate dev --name add_new_field

# Apply migrations to production
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

### Testing

```bash
# Run unit tests (Vitest)
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e:ui
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-blog-article

# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: Add new blog article about solar panels"

# Push to remote
git push origin feature/new-blog-article

# Create pull request on GitHub
# After review, merge to main
```

---

## 🔍 Debugging Tips

### Common Issues

#### Issue 1: Port 3000 already in use

```bash
# Find process using port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Issue 2: Module not found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue 3: Prisma Client not generated

```bash
# Regenerate Prisma Client
npx prisma generate

# If still fails, check prisma/schema.prisma syntax
```

#### Issue 4: TypeScript errors

```bash
# Run type check
npm run type-check

# Check specific file
npx tsc --noEmit app/[locale]/page.tsx
```

#### Issue 5: Styles not applying

```bash
# Restart dev server
# Clear .next cache
rm -rf .next
npm run dev
```

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

Press **F5** to start debugging.

---

## 📝 Code Style Guide

### File Naming Conventions

```
✅ CORRECT:
- page.tsx (Next.js convention)
- SolarCalculator.tsx (PascalCase for components)
- solar-engine.ts (kebab-case for utilities)
- use-calculator.ts (kebab-case for hooks)

❌ WRONG:
- Page.tsx
- solarCalculator.tsx
- SolarEngine.ts
- UseCalculator.ts
```

### Component Structure

```typescript
// components/ProductCard.tsx
'use client' // Only if needed

import { type Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onSelect?: (id: string) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <div className="...">
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  )
}
```

### Server Component Pattern

```typescript
// app/[locale]/products/page.tsx
import { prisma } from '@/lib/prisma'

export default async function ProductsPage() {
  // Fetch data directly in Server Component
  const products = await prisma.product.findMany()
  
  return (
    <div>
      <h1>Products</h1>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Client Component Pattern

```typescript
// components/ContactForm.tsx
'use client'

import { useState } from 'react'

export function ContactForm() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### API Route Pattern

```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Create lead
    const lead = await prisma.lead.create({
      data: {
        email: body.email,
        name: body.name,
        source: 'WEBSITE'
      }
    })
    
    return NextResponse.json(lead, { status: 201 })
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## 🧪 Testing Workflow

### Unit Tests (Vitest)

```typescript
// lib/calculator/__tests__/solar-engine.test.ts
import { describe, it, expect } from 'vitest'
import { calculateSolarSystem } from '../solar-engine'

describe('calculateSolarSystem', () => {
  it('should calculate correct capacity for residential', () => {
    const result = calculateSolarSystem({
      monthlyElectricBill: 2000000, // 2M VND
      roofArea: 50, // 50 m²
      location: { province: 'TP.HCM', lat: 10.8231, lng: 106.6297 },
      roofType: 'flat',
      shading: 'none'
    })
    
    expect(result.recommendedCapacity).toBeGreaterThan(5)
    expect(result.recommendedCapacity).toBeLessThan(10)
    expect(result.solutionType).toBe('residential')
  })
})
```

Run tests:
```bash
npm run test
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000')
  
  // Check title
  await expect(page).toHaveTitle(/Golden Energy/i)
  
  // Check navigation
  await expect(page.locator('nav')).toBeVisible()
  
  // Check hero section
  await expect(page.locator('h1')).toContainText(/Giải pháp/i)
})

test('calculator works', async ({ page }) => {
  await page.goto('http://localhost:3000/calculator')
  
  // Fill form
  await page.fill('input[name="electricBill"]', '2000000')
  await page.fill('input[name="roofArea"]', '50')
  await page.selectOption('select[name="location"]', 'TP.HCM')
  
  // Submit
  await page.click('button[type="submit"]')
  
  // Check results
  await expect(page.locator('.results')).toBeVisible()
  await expect(page.locator('.capacity')).toContainText(/kW/)
})
```

Run E2E tests:
```bash
npm run test:e2e
```

---

## 🌐 Multilingual Development

### Adding New Translation

```typescript
// lib/i18n/translations.ts
export const translations = {
  vi: {
    calculator: {
      title: 'Tính toán hệ thống điện mặt trời',
      electricBill: 'Hóa đơn điện hàng tháng',
      calculate: 'Tính toán ngay'
    }
  },
  en: {
    calculator: {
      title: 'Solar System Calculator',
      electricBill: 'Monthly Electric Bill',
      calculate: 'Calculate Now'
    }
  },
  // Add new language
  th: {
    calculator: {
      title: 'เครื่องคำนวณระบบพลังงานแสงอาทิตย์',
      electricBill: 'ค่าไฟฟ้ารายเดือน',
      calculate: 'คำนวณเลย'
    }
  }
}
```

### Using Translations

```typescript
// app/[locale]/calculator/page.tsx
import { translations } from '@/lib/i18n/translations'

export default function CalculatorPage({ params }: { params: { locale: string } }) {
  const t = translations[params.locale as keyof typeof translations]
  
  return (
    <div>
      <h1>{t.calculator.title}</h1>
      <label>{t.calculator.electricBill}</label>
      <button>{t.calculator.calculate}</button>
    </div>
  )
}
```

---

## 📚 Learning Resources

### Official Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)

### Video Tutorials
- [Next.js 14 Tutorial](https://www.youtube.com/watch?v=wm5gMKuwSYk) (Vercel)
- [Prisma Crash Course](https://www.youtube.com/watch?v=RebA5J-rlwg)
- [TypeScript for Beginners](https://www.youtube.com/watch?v=BwuLxPH8IDs)

### Community
- [Next.js Discord](https://vercel.com/discord)
- [React Discord](https://discord.gg/react)
- [Prisma Discord](https://discord.gg/prisma)

---

## 🆘 Getting Help

### Before Asking for Help

1. **Check console errors**
   - Browser DevTools → Console
   - Terminal output

2. **Read error message carefully**
   - Often includes solution
   - Note file path and line number

3. **Search existing issues**
   - GitHub Issues
   - Stack Overflow
   - Project documentation

4. **Reproduce in isolation**
   - Create minimal example
   - Test with fresh install

### How to Ask

**Good question:**
```
I'm getting this error when running `npm run build`:

Type error: Property 'gtag' does not exist on type 'Window'
File: app/not-found.tsx:13:49

I've tried:
- Regenerating types
- Restarting dev server

Environment:
- Node: v20.11.0
- npm: 10.2.4
- OS: Windows 11

Full error: [paste error]
```

**Bad question:**
```
it doesn't work help
```

---

## 🎯 Next Steps

### After Setup

1. **Explore codebase**
   - Read `docs/PROJECT_SUMMARY.md`
   - Browse `app/[locale]/` structure
   - Check `components/` folder

2. **Make first change**
   - Edit homepage copy
   - Add new FAQ question
   - Create new blog article

3. **Learn workflows**
   - Read phase summaries
   - Study component patterns
   - Review API routes

4. **Join team**
   - Request access to resources
   - Set up communication channels
   - Review project roadmap

### Recommended Learning Path

**Week 1:**
- Setup development environment
- Run project locally
- Understand folder structure
- Make first commit

**Week 2:**
- Learn Next.js basics
- Create new page
- Add new component
- Work with Prisma

**Week 3:**
- Understand i18n system
- Add translations
- Create API route
- Write tests

**Week 4:**
- Deploy to Vercel
- Monitor analytics
- Fix bugs
- Contribute features

---

## ✅ Setup Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] VS Code installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env.local`)
- [ ] Database setup (PostgreSQL)
- [ ] Prisma migrations run (`npx prisma migrate dev`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Dev server running (`npm run dev`)
- [ ] Opened http://localhost:3000
- [ ] Homepage loads correctly
- [ ] All 4 locales work
- [ ] VS Code extensions installed
- [ ] Read PROJECT_SUMMARY.md
- [ ] Read one phase summary

**Once all checked:** You're ready to start developing! 🎉

---

**Questions?**
- Check [docs/](../docs/) folder
- Ask in team chat
- Create GitHub issue

**Last Updated:** 2026-01-19  
**Version:** 1.0  
**Maintainer:** Development Team

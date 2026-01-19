# GitHub Copilot Instructions - Golden Energy Website

> **CTO-Level Development Guidelines**  
> Tự động hóa quyết định kỹ thuật phù hợp với KPI kinh doanh: SEO Authority, Smart UX, Performance

---

## PHẦN 1: Tech Stack & Performance Rules

### 1.1 Next.js App Router - Server Components First

**Quy tắc bắt buộc:**
```typescript
// ✅ ĐÚNG: Server Component mặc định
// app/products/page.tsx
import { sql } from '@/lib/db'

export default async function ProductsPage() {
  const products = await sql`SELECT * FROM products`
  return <ProductGrid products={products} />
}

// ❌ SAI: Không dùng 'use client' nếu không cần interactivity
'use client'
export default function ProductsPage() {
  const [products, setProducts] = useState([])
  useEffect(() => { fetch('/api/products')... }, [])
}
```

**Khi nào dùng Client Component:**
- Form với validation real-time
- Animation (GSAP, Framer Motion)
- Event handlers (onClick, onChange)
- Browser APIs (localStorage, IntersectionObserver)

**Streaming & Suspense:**
```tsx
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowDataComponent />
      </Suspense>
    </div>
  )
}
```

### 1.2 Zero Bloat Policy - Bundle Size Discipline

**Lighthouse Performance Target: 100/100**

```bash
# Kiểm tra bundle size trước mỗi commit
npm run build
# ⚠️ Nếu page bundle > 150KB → Refactor ngay!
```

**Code Splitting Best Practices:**
```typescript
// Dynamic Import cho components nặng
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // Nếu cần client-only
})

// Tree-shaking với named exports
import { Button, Card } from '@/components/ui' // ✅
import * as UI from '@/components/ui' // ❌
```

**Image Optimization:**
```tsx
import Image from 'next/image'

// ✅ ĐÚNG: Luôn dùng Next/Image với lazy loading
<Image
  src="/solar-panel.jpg"
  alt="Tấm pin mặt trời Golden Energy"
  width={800}
  height={600}
  quality={85}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ❌ SAI: Không dùng <img> tag trực tiếp
<img src="/solar-panel.jpg" alt="..." />
```

### 1.3 TypeScript Strict Mode - No Any

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}

// ✅ ĐÚNG: Type-safe API response
interface Lead {
  id: number
  name: string
  email: string | null
  phone: string | null
}

async function getLeads(): Promise<Lead[]> {
  const result = await sql<Lead[]>`SELECT * FROM leads`
  return result
}

// ❌ SAI: Dùng any
async function getLeads(): Promise<any> {
  return await fetch('/api/leads').then(r => r.json())
}
```

### 1.4 Database - Prisma vs Direct SQL

**Khi nào dùng Prisma:**
- CRUD đơn giản với type safety
- Relations phức tạp (JOIN nhiều bảng)
- Migration cần rollback

**Khi nào dùng Direct SQL:**
- Query phức tạp với performance critical
- Analytics/Aggregation
- Full-text search

```typescript
// Prisma cho CRUD
import { prisma } from '@/lib/prisma'

const lead = await prisma.lead.create({
  data: {
    name: 'Nguyen Van A',
    email: 'a@example.com',
    source: 'WEBSITE',
    campaign: {
      connect: { id: campaignId }
    }
  },
  include: { campaign: true }
})

// Direct SQL cho performance
import { sql } from '@/lib/db'

const stats = await sql`
  SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE status = 'CONVERTED') as conversions
  FROM leads
  WHERE created_at >= NOW() - INTERVAL '6 months'
  GROUP BY month
  ORDER BY month DESC
`
```

---

## PHẦN 2: Semantic SEO & Knowledge Graph

### 2.1 Schema.org JSON-LD - Organization Entity

**Mục tiêu:** Google hiểu Golden Energy là ai, làm gì, ở đâu

```typescript
// lib/schema/organization.ts
export function generateOrganizationSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://goldenenergy.vn/#organization',
    name: 'Golden Energy Vietnam',
    alternateName: locale === 'zh' ? '金能源越南' : 'Năng Lượng Vàng',
    url: 'https://goldenenergy.vn',
    logo: 'https://goldenenergy.vn/logo.png',
    
    // Thông tin liên hệ
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: '+84-123-456-789',
      contactType: 'sales',
      areaServed: 'VN',
      availableLanguage: ['vi', 'en', 'zh']
    }],
    
    // Địa chỉ văn phòng
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Đường ABC',
      addressLocality: 'TP. Hồ Chí Minh',
      addressRegion: 'TP.HCM',
      postalCode: '700000',
      addressCountry: 'VN'
    },
    
    // Social profiles
    sameAs: [
      'https://www.facebook.com/goldenenergy',
      'https://www.linkedin.com/company/goldenenergy',
      'https://www.youtube.com/c/goldenenergy'
    ],
    
    // Lĩnh vực hoạt động
    knowsAbout: [
      'Solar Energy',
      'Renewable Energy',
      'Photovoltaic Systems',
      'Energy Storage',
      'EPC Services'
    ],
    
    // Chứng nhận
    award: [
      'ISO 9001:2015 Certified',
      'Top 10 Solar EPC Vietnam 2025'
    ]
  }
}
```

### 2.2 Product Schema - Solar Solutions

```typescript
// lib/schema/product.ts
interface ProductSchemaInput {
  name: string
  description: string
  category: 'residential' | 'commercial' | 'industrial'
  powerOutput: string // "5kW", "50kW", "500kW"
  price?: number
  locale: string
}

export function generateProductSchema(input: ProductSchemaInput) {
  const baseUrl = 'https://goldenenergy.vn'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/giai-phap/${input.category}/#product`,
    
    name: input.name,
    description: input.description,
    category: 'Solar Energy System',
    
    brand: {
      '@type': 'Brand',
      name: 'Golden Energy'
    },
    
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: input.price,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      seller: {
        '@id': `${baseUrl}/#organization`
      }
    },
    
    // Technical specs
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Công suất',
        value: input.powerOutput
      },
      {
        '@type': 'PropertyValue',
        name: 'Bảo hành',
        value: '25 năm'
      },
      {
        '@type': 'PropertyValue',
        name: 'Hiệu suất',
        value: '> 20%'
      }
    ],
    
    // Entity linking
    isRelatedTo: {
      '@type': 'Service',
      name: 'Solar Installation Service',
      provider: {
        '@id': `${baseUrl}/#organization`
      }
    }
  }
}
```

### 2.3 Silo URL Structure - Semantic Hierarchy

**Mục tiêu:** Google hiểu structure thông tin, tăng topical authority

```
goldenenergy.vn/
├── giai-phap/                    (Solutions hub - Pillar page)
│   ├── dien-mat-troi-ho-gia-dinh/     (Residential)
│   ├── dien-mat-troi-thuong-mai/      (Commercial)
│   └── dien-mat-troi-cong-nghiep/     (Industrial)
├── san-pham/                     (Products hub)
│   ├── tam-pin/                       (Solar panels)
│   ├── bien-tan/                      (Inverters)
│   └── pin-luu-tru/                   (Batteries)
├── du-an/                        (Projects - Case studies)
│   ├── nha-may-abc/
│   └── khach-san-xyz/
├── bai-viet/                     (Blog - Educational content)
│   ├── huong-dan/                     (Guides)
│   ├── tin-tuc/                       (News)
│   └── kien-thuc/                     (Knowledge base)
└── lien-he/                      (Contact)
```

**Internal Linking Strategy:**
```tsx
// components/InternalLink.tsx
interface InternalLinkProps {
  href: string
  children: React.ReactNode
  rel?: 'related' | 'parent' | 'child'
}

export function InternalLink({ href, children, rel }: InternalLinkProps) {
  return (
    <Link 
      href={href}
      rel={rel}
      // Thêm data attribute cho analytics
      data-internal-link="true"
      data-link-type={rel}
    >
      {children}
    </Link>
  )
}

// Usage trong content
<p>
  Hệ thống <InternalLink href="/giai-phap/dien-mat-troi-ho-gia-dinh" rel="related">
    điện mặt trời hộ gia đình
  </InternalLink> phù hợp cho nhà ở có diện tích mái từ 30m² trở lên.
</p>
```

### 2.4 BreadcrumbList Schema

```typescript
// lib/schema/breadcrumb.ts
export function generateBreadcrumbSchema(path: string, locale: string) {
  const segments = path.split('/').filter(Boolean)
  const baseUrl = 'https://goldenenergy.vn'
  
  const itemListElement = segments.map((segment, index) => {
    const position = index + 2 // +1 for home, +1 for 1-indexed
    const url = `${baseUrl}/${segments.slice(0, index + 1).join('/')}`
    
    return {
      '@type': 'ListItem',
      position,
      name: getSegmentName(segment, locale),
      item: url
    }
  })
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: locale === 'vi' ? 'Trang chủ' : 'Home',
        item: baseUrl
      },
      ...itemListElement
    ]
  }
}
```

### 2.5 Article Schema - Blog Posts

```typescript
// lib/schema/article.ts
interface ArticleInput {
  title: string
  description: string
  content: string
  author: string
  publishedDate: string
  modifiedDate?: string
  category: string
  tags: string[]
  imageUrl: string
}

export function generateArticleSchema(input: ArticleInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: input.imageUrl,
    
    author: {
      '@type': 'Person',
      name: input.author,
      url: 'https://goldenenergy.vn/about#team'
    },
    
    publisher: {
      '@id': 'https://goldenenergy.vn/#organization'
    },
    
    datePublished: input.publishedDate,
    dateModified: input.modifiedDate || input.publishedDate,
    
    articleSection: input.category,
    keywords: input.tags.join(', '),
    
    // Word count for reading time
    wordCount: input.content.split(/\s+/).length,
    
    // Entity mentions
    mentions: extractEntities(input.content).map(entity => ({
      '@type': 'Thing',
      name: entity
    }))
  }
}

// Extract entities from content (simple keyword matching)
function extractEntities(content: string): string[] {
  const entities = [
    'Solar Panel', 'Inverter', 'Battery Storage',
    'Net Metering', 'ROI', 'LCOE',
    'Golden Energy', 'Vietnam'
  ]
  
  return entities.filter(entity => 
    content.toLowerCase().includes(entity.toLowerCase())
  )
}
```

---

## PHẦN 3: Smart Features & UX Logic

### 3.1 Solar Calculator Engine - Vietnam Context

**Requirements:**
- Input: Hóa đơn điện, diện tích mái, vị trí địa lý
- Output: Công suất khuyến nghị, chi phí, ROI, tiết kiệm 25 năm
- Recommendation: Gói giải pháp phù hợp (Hộ gia đình / Thương mại / Công nghiệp)

```typescript
// lib/calculator/solar-engine.ts

interface CalculatorInput {
  monthlyElectricBill: number // VND
  roofArea: number // m²
  location: {
    province: string
    lat: number
    lng: number
  }
  roofType: 'flat' | 'tilted' | 'mixed'
  shading: 'none' | 'partial' | 'significant'
}

interface CalculatorOutput {
  recommendedCapacity: number // kW
  estimatedCost: {
    min: number
    max: number
    currency: 'VND'
  }
  roi: {
    paybackPeriod: number // years
    totalSavings25Years: number // VND
    irr: number // %
  }
  solutionType: 'residential' | 'commercial' | 'industrial'
  systemSpecs: {
    panelCount: number
    inverterCapacity: number
    batteryCapacity?: number
  }
}

// Vietnam-specific constants
const VIETNAM_SOLAR_CONSTANTS = {
  // Average solar radiation by region (kWh/m²/day)
  solarRadiation: {
    'north': 4.2,
    'central': 4.8,
    'south': 5.0
  },
  
  // EVN electricity pricing (2025)
  electricityPrice: {
    tier1: 1893, // 0-50 kWh
    tier2: 1956, // 51-100 kWh
    tier3: 2271, // 101-200 kWh
    tier4: 2615, // 201-300 kWh
    tier5: 2701, // 301-400 kWh
    tier6: 2814  // > 400 kWh
  },
  
  // System costs (VND/kW installed)
  systemCost: {
    residential: 15_000_000, // 15M VND/kW
    commercial: 13_000_000,  // 13M VND/kW
    industrial: 11_000_000   // 11M VND/kW
  },
  
  // Performance factors
  performanceFactor: 0.75, // 75% system efficiency
  degradationRate: 0.005   // 0.5% per year
}

export function calculateSolarSystem(input: CalculatorInput): CalculatorOutput {
  // Step 1: Calculate monthly energy consumption
  const monthlyConsumption = estimateMonthlyConsumption(input.monthlyElectricBill)
  
  // Step 2: Determine region & solar radiation
  const region = getRegion(input.location.province)
  const dailySolarRadiation = VIETNAM_SOLAR_CONSTANTS.solarRadiation[region]
  
  // Step 3: Calculate required capacity
  const dailyEnergyNeeded = monthlyConsumption / 30
  const systemCapacity = calculateCapacity(
    dailyEnergyNeeded,
    dailySolarRadiation,
    input.roofArea,
    input.shading
  )
  
  // Step 4: Determine solution type
  const solutionType = determineSolutionType(systemCapacity, monthlyConsumption)
  
  // Step 5: Calculate costs
  const costPerKW = VIETNAM_SOLAR_CONSTANTS.systemCost[solutionType]
  const totalCost = systemCapacity * costPerKW
  
  // Step 6: Calculate ROI
  const roi = calculateROI(
    systemCapacity,
    totalCost,
    monthlyConsumption,
    dailySolarRadiation
  )
  
  // Step 7: System specifications
  const systemSpecs = calculateSystemSpecs(systemCapacity, solutionType)
  
  return {
    recommendedCapacity: systemCapacity,
    estimatedCost: {
      min: totalCost * 0.9,
      max: totalCost * 1.1,
      currency: 'VND'
    },
    roi,
    solutionType,
    systemSpecs
  }
}

function estimateMonthlyConsumption(bill: number): number {
  // Reverse engineer consumption from tiered pricing
  const tiers = VIETNAM_SOLAR_CONSTANTS.electricityPrice
  
  if (bill <= 50 * tiers.tier1) return bill / tiers.tier1
  if (bill <= 50 * tiers.tier1 + 50 * tiers.tier2) {
    return 50 + (bill - 50 * tiers.tier1) / tiers.tier2
  }
  // ... more tiers
  
  // Simplified for demo
  return bill / 2500 // Average price ~2500 VND/kWh
}

function calculateCapacity(
  dailyEnergy: number,
  solarRadiation: number,
  roofArea: number,
  shading: string
): number {
  const shadingFactor = shading === 'none' ? 1.0 : shading === 'partial' ? 0.85 : 0.7
  const maxCapacityByRoof = roofArea / 7 // ~7m² per kW
  
  const requiredCapacity = 
    (dailyEnergy / (solarRadiation * VIETNAM_SOLAR_CONSTANTS.performanceFactor)) 
    * shadingFactor
  
  return Math.min(requiredCapacity, maxCapacityByRoof)
}

function determineSolutionType(capacity: number, monthlyConsumption: number): CalculatorOutput['solutionType'] {
  if (capacity <= 10 && monthlyConsumption <= 500) return 'residential'
  if (capacity <= 100) return 'commercial'
  return 'industrial'
}

function calculateROI(
  capacity: number,
  totalCost: number,
  monthlyConsumption: number,
  solarRadiation: number
) {
  const annualProduction = capacity * solarRadiation * 365 * VIETNAM_SOLAR_CONSTANTS.performanceFactor
  const annualSavings = Math.min(annualProduction, monthlyConsumption * 12) * 2500 // Avg price
  
  const paybackPeriod = totalCost / annualSavings
  
  // Calculate 25-year savings with degradation
  let totalSavings = 0
  for (let year = 1; year <= 25; year++) {
    const yearlyProduction = annualProduction * Math.pow(1 - VIETNAM_SOLAR_CONSTANTS.degradationRate, year - 1)
    totalSavings += yearlyProduction * 2500 * Math.pow(1.05, year - 1) // 5% electricity inflation
  }
  
  const irr = calculateIRR(totalCost, annualSavings, 25)
  
  return {
    paybackPeriod: Math.round(paybackPeriod * 10) / 10,
    totalSavings25Years: Math.round(totalSavings),
    irr: Math.round(irr * 100) / 100
  }
}

function calculateIRR(initialInvestment: number, annualSavings: number, years: number): number {
  // Simplified IRR calculation
  // NPV = 0 when discount rate = IRR
  let rate = 0.1 // Start with 10%
  
  for (let i = 0; i < 20; i++) {
    let npv = -initialInvestment
    for (let year = 1; year <= years; year++) {
      npv += annualSavings / Math.pow(1 + rate, year)
    }
    
    if (Math.abs(npv) < 1000) break
    rate += npv > 0 ? 0.01 : -0.01
  }
  
  return rate * 100 // Convert to percentage
}

function calculateSystemSpecs(capacity: number, solutionType: string) {
  const panelWattage = solutionType === 'industrial' ? 550 : 450 // W per panel
  const panelCount = Math.ceil((capacity * 1000) / panelWattage)
  
  return {
    panelCount,
    inverterCapacity: Math.round(capacity * 1.2 * 10) / 10, // 20% oversizing
    batteryCapacity: solutionType === 'residential' ? Math.round(capacity * 2) : undefined // 2h storage
  }
}

function getRegion(province: string): 'north' | 'central' | 'south' {
  const northProvinces = ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', ...]
  const centralProvinces = ['Đà Nẵng', 'Huế', 'Quảng Nam', ...]
  
  if (northProvinces.includes(province)) return 'north'
  if (centralProvinces.includes(province)) return 'central'
  return 'south'
}
```

### 3.2 Smart Recommendation Engine

```typescript
// lib/recommendation/engine.ts

interface UserProfile {
  location: string
  roofArea: number
  budget: number
  priority: 'cost' | 'performance' | 'aesthetics'
  timeline: 'urgent' | 'normal' | 'flexible'
}

interface Recommendation {
  productBundle: {
    panels: { brand: string, model: string, quantity: number }
    inverter: { brand: string, model: string }
    mounting: string
    warranty: string
  }
  reasoning: string[]
  confidence: number // 0-100
  alternatives: ProductBundle[]
}

export function generateRecommendation(
  calculatorOutput: CalculatorOutput,
  userProfile: UserProfile
): Recommendation {
  const rules = [
    {
      condition: (u: UserProfile) => u.priority === 'cost',
      action: () => selectBudgetFriendlyBundle(),
      reasoning: 'Tối ưu chi phí đầu tư ban đầu'
    },
    {
      condition: (u: UserProfile) => u.priority === 'performance',
      action: () => selectHighEfficiencyBundle(),
      reasoning: 'Hiệu suất cao nhất, tối đa sản lượng điện'
    },
    {
      condition: (u: UserProfile) => userProfile.roofArea < 50,
      action: () => selectCompactBundle(),
      reasoning: 'Tối ưu cho mái nhỏ, tấm công suất cao'
    }
  ]
  
  const matchedRules = rules.filter(rule => rule.condition(userProfile))
  const bundle = matchedRules.length > 0 
    ? matchedRules[0].action() 
    : selectStandardBundle()
  
  return {
    productBundle: bundle,
    reasoning: matchedRules.map(r => r.reasoning),
    confidence: calculateConfidence(calculatorOutput, userProfile),
    alternatives: generateAlternatives(bundle)
  }
}
```

### 3.3 Behavioral Tracking - Dwell Time & Engagement

```typescript
// hooks/use-behavioral-tracking.ts
'use client'

import { useEffect, useRef } from 'react'

interface BehaviorEvent {
  type: 'page_view' | 'dwell_time' | 'scroll_depth' | 'cta_hover' | 'calculator_start'
  timestamp: number
  metadata: Record<string, any>
}

export function useBehavioralTracking() {
  const startTime = useRef(Date.now())
  const maxScrollDepth = useRef(0)
  
  useEffect(() => {
    // Track dwell time
    const dwellInterval = setInterval(() => {
      const dwellTime = Math.floor((Date.now() - startTime.current) / 1000)
      trackEvent({
        type: 'dwell_time',
        timestamp: Date.now(),
        metadata: { seconds: dwellTime }
      })
    }, 10000) // Every 10 seconds
    
    // Track scroll depth
    const handleScroll = () => {
      const scrollPercentage = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercentage > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercentage
        
        if ([25, 50, 75, 100].includes(scrollPercentage)) {
          trackEvent({
            type: 'scroll_depth',
            timestamp: Date.now(),
            metadata: { percentage: scrollPercentage }
          })
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearInterval(dwellInterval)
      window.removeEventListener('scroll', handleScroll)
      
      // Final dwell time on unmount
      const totalDwell = Math.floor((Date.now() - startTime.current) / 1000)
      trackEvent({
        type: 'dwell_time',
        timestamp: Date.now(),
        metadata: { seconds: totalDwell, final: true }
      })
    }
  }, [])
  
  return { trackEvent }
}

function trackEvent(event: BehaviorEvent) {
  // Store in sessionStorage (no PII)
  const sessionKey = 'behavioral_events'
  const existing = JSON.parse(sessionStorage.getItem(sessionKey) || '[]')
  existing.push(event)
  sessionStorage.setItem(sessionKey, JSON.stringify(existing))
  
  // Send to analytics (debounced)
  if (event.metadata.final) {
    fetch('/api/analytics/behavior', {
      method: 'POST',
      body: JSON.stringify(existing)
    })
  }
}
```

### 3.4 Dynamic CTAs - Intent-Based

```tsx
// components/SmartCTA.tsx
'use client'

import { useEffect, useState } from 'react'
import { useBehavioralTracking } from '@/hooks/use-behavioral-tracking'

export function SmartCTA() {
  const [ctaText, setCtaText] = useState('Tính toán ngay')
  const { trackEvent } = useBehavioralTracking()
  
  useEffect(() => {
    // Analyze user behavior
    const events = JSON.parse(sessionStorage.getItem('behavioral_events') || '[]')
    const dwellTime = events
      .filter(e => e.type === 'dwell_time')
      .reduce((max, e) => Math.max(max, e.metadata.seconds), 0)
    
    const scrollDepth = events
      .filter(e => e.type === 'scroll_depth')
      .reduce((max, e) => Math.max(max, e.metadata.percentage), 0)
    
    // High intent signals
    if (dwellTime > 60 && scrollDepth > 75) {
      setCtaText('Nhận báo giá chi tiết ngay')
    } else if (scrollDepth > 50) {
      setCtaText('Xem ví dụ tính toán')
    }
  }, [])
  
  return (
    <button
      onClick={() => {
        trackEvent({
          type: 'cta_click',
          timestamp: Date.now(),
          metadata: { cta_text: ctaText }
        })
        window.location.href = '/calculator'
      }}
      className="bg-yellow-500 hover:bg-yellow-600 px-8 py-4 rounded-lg font-semibold"
    >
      {ctaText}
    </button>
  )
}
```

---

## PHẦN 4: Multilingual & International SEO

### 4.1 Next.js i18n - Sub-directory Structure

**URL Pattern:**
```
goldenenergy.vn/vi/giai-phap/dien-mat-troi/
goldenenergy.vn/en/solutions/solar-energy/
goldenenergy.vn/zh/解决方案/太阳能/
```

**Middleware Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['vi', 'en', 'zh']
const defaultLocale = 'vi'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if pathname has locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return NextResponse.next()
  
  // Detect locale from multiple sources
  const detectedLocale = 
    detectFromCookie(request) ||
    detectFromAcceptLanguage(request) ||
    detectFromGeo(request) ||
    defaultLocale
  
  // Redirect to localized path
  request.nextUrl.pathname = `/${detectedLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

function detectFromCookie(request: NextRequest): string | null {
  return request.cookies.get('preferred-locale')?.value || null
}

function detectFromAcceptLanguage(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return null
  
  // Parse "vi-VN,vi;q=0.9,en;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, quality = 'q=1'] = lang.trim().split(';')
      return {
        locale: locale.split('-')[0], // 'vi-VN' -> 'vi'
        quality: parseFloat(quality.split('=')[1])
      }
    })
    .sort((a, b) => b.quality - a.quality)
  
  return languages.find(l => locales.includes(l.locale))?.locale || null
}

function detectFromGeo(request: NextRequest): string | null {
  // Vercel provides geo headers
  const country = request.headers.get('x-vercel-ip-country')
  
  const countryToLocale: Record<string, string> = {
    'VN': 'vi',
    'CN': 'zh',
    'TW': 'zh',
    'HK': 'zh'
  }
  
  return countryToLocale[country] || null
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### 4.2 Translation Files - Type-safe i18n

```typescript
// lib/i18n/translations.ts
export const translations = {
  vi: {
    common: {
      home: 'Trang chủ',
      solutions: 'Giải pháp',
      products: 'Sản phẩm',
      projects: 'Dự án',
      blog: 'Bài viết',
      contact: 'Liên hệ'
    },
    calculator: {
      title: 'Tính toán hệ thống điện mặt trời',
      electricBill: 'Hóa đơn điện hàng tháng',
      roofArea: 'Diện tích mái nhà',
      location: 'Vị trí',
      calculate: 'Tính toán ngay',
      results: {
        recommendedCapacity: 'Công suất khuyến nghị',
        estimatedCost: 'Chi phí ước tính',
        paybackPeriod: 'Thời gian hoàn vốn',
        savings25Years: 'Tiết kiệm 25 năm'
      }
    }
  },
  en: {
    common: {
      home: 'Home',
      solutions: 'Solutions',
      products: 'Products',
      projects: 'Projects',
      blog: 'Blog',
      contact: 'Contact'
    },
    calculator: {
      title: 'Solar System Calculator',
      electricBill: 'Monthly Electric Bill',
      roofArea: 'Roof Area',
      location: 'Location',
      calculate: 'Calculate Now',
      results: {
        recommendedCapacity: 'Recommended Capacity',
        estimatedCost: 'Estimated Cost',
        paybackPeriod: 'Payback Period',
        savings25Years: '25-Year Savings'
      }
    }
  },
  zh: {
    common: {
      home: '首页',
      solutions: '解决方案',
      products: '产品',
      projects: '项目',
      blog: '博客',
      contact: '联系我们'
    },
    calculator: {
      title: '太阳能系统计算器',
      electricBill: '月电费',
      roofArea: '屋顶面积',
      location: '位置',
      calculate: '立即计算',
      results: {
        recommendedCapacity: '推荐容量',
        estimatedCost: '预估成本',
        paybackPeriod: '回本期',
        savings25Years: '25年节省'
      }
    }
  }
} as const

// Type-safe translation hook
export function useTranslation(locale: string) {
  const t = translations[locale as keyof typeof translations] || translations.vi
  
  return {
    t: (key: string) => {
      const keys = key.split('.')
      let value: any = t
      
      for (const k of keys) {
        value = value?.[k]
      }
      
      return value || key
    }
  }
}
```

### 4.3 Hreflang Tags - Language Alternate

```tsx
// app/[locale]/layout.tsx
import { generateHrefLangTags } from '@/lib/i18n/hreflang'

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const { locale } = params
  const baseUrl = 'https://goldenenergy.vn'
  
  return {
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'vi-VN': `${baseUrl}/vi`,
        'en': `${baseUrl}/en`,
        'zh-CN': `${baseUrl}/zh`,
        'x-default': `${baseUrl}/vi`
      }
    }
  }
}
```

### 4.4 Localized Metadata & OG Tags

```typescript
// lib/i18n/metadata.ts
export function generateLocalizedMetadata(locale: string, page: string) {
  const metadata = {
    vi: {
      home: {
        title: 'Golden Energy - Giải pháp điện mặt trời hàng đầu Việt Nam',
        description: 'Chuyên tư vấn, thiết kế, lắp đặt hệ thống điện mặt trời cho hộ gia đình, thương mại, công nghiệp. Bảo hành 25 năm, hỗ trợ tài chính.',
        keywords: 'điện mặt trời, năng lượng mặt trời, solar panel, Golden Energy'
      }
    },
    en: {
      home: {
        title: 'Golden Energy - Leading Solar Solutions in Vietnam',
        description: 'Expert solar system consultation, design, and installation for residential, commercial, and industrial. 25-year warranty, financing support.',
        keywords: 'solar energy, solar panels, renewable energy, Golden Energy Vietnam'
      }
    },
    zh: {
      home: {
        title: 'Golden Energy - 越南领先的太阳能解决方案',
        description: '专业太阳能系统咨询、设计和安装，适用于住宅、商业和工业。25年保修，融资支持。',
        keywords: '太阳能, 太阳能板, 可再生能源, 金能源越南'
      }
    }
  }
  
  const localeData = metadata[locale as keyof typeof metadata] || metadata.vi
  const pageData = localeData[page as keyof typeof localeData] || localeData.home
  
  return {
    title: pageData.title,
    description: pageData.description,
    keywords: pageData.keywords,
    openGraph: {
      title: pageData.title,
      description: pageData.description,
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
      siteName: 'Golden Energy Vietnam'
    }
  }
}
```

---

## QUICK REFERENCE - Decision Tree

```
User Request → Quyết định kỹ thuật
├── "Thêm tính năng mới"
│   ├── Cần interactivity? → Client Component
│   ├── Chỉ hiển thị data? → Server Component
│   └── Heavy animation? → Dynamic import
├── "Tối ưu SEO"
│   ├── Thêm Schema → lib/schema/
│   ├── Optimize URL → Silo structure
│   └── Internal links → rel="related"
├── "Cải thiện performance"
│   ├── Bundle > 150KB? → Code splitting
│   ├── Images chưa optimize? → next/image
│   └── Duplicate code? → Extract to lib/
└── "Thêm ngôn ngữ"
    ├── Translation → translations.ts
    ├── URL structure → /[locale]/
    └── Metadata → generateLocalizedMetadata()
```

---

**Cập nhật cuối:** 2026-01-15  
**Phiên bản:** 1.0  
**Người duy trì:** CTO Team

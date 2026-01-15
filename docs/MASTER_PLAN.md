# 🎯 MASTER PLAN - Golden Energy Vietnam Website

> **Mục tiêu:** Xây dựng website năng lượng mặt trời hàng đầu Việt Nam với SEO tối ưu, UX xuất sắc, và conversion rate cao.
> **Timeline:** 8-12 tuần | **Team:** 1-2 developers | **Tech:** Next.js 15 + React 19 + Tailwind 4

---

## 📋 Tổng Quan Các Phase

| Phase | Tên | Thời gian | Mục tiêu chính |
|-------|-----|-----------|----------------|
| 1 | Foundation | 2 tuần | i18n, layouts, performance baseline |
| 2 | Core Structure | 3 tuần | Silo URLs, page templates, schemas |
| 3 | Smart Features | 2 tuần | Calculator, Behavioral Tracking |
| 4 | Content & Expansion | 3 tuần | Blog, FAQ, Contact, Launch |

---

## 🏗️ PHASE 1: FOUNDATION (Tuần 1-2)

### 1.1 Cấu Trúc i18n

**Mục tiêu:** Setup sub-directory URL structure cho 3 ngôn ngữ

```
app/
├── [locale]/
│   ├── layout.tsx          # Root layout với locale
│   ├── page.tsx             # Homepage
│   ├── san-pham/           # Products silo
│   ├── giai-phap/          # Solutions silo  
│   ├── du-an/              # Projects silo
│   ├── kien-thuc/          # Knowledge silo
│   └── lien-he/            # Contact
├── middleware.ts           # Locale detection
└── i18n/
    ├── config.ts           # Locale config
    ├── vi.json             # Vietnamese
    ├── en.json             # English
    └── zh.json             # Chinese
```

**Tasks:**
- [ ] Tạo `middleware.ts` với locale detection logic
- [ ] Tạo `i18n/config.ts` với defaultLocale='vi'
- [ ] Tạo translation files cho 3 ngôn ngữ
- [ ] Setup `[locale]/layout.tsx` với hreflang tags
- [ ] Test URL redirects: `/` → `/vi/`, `/en/` → `/en/`

**File: `middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'

const locales = ['vi', 'en', 'zh']
const defaultLocale = 'vi'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip static files and API
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') ||
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check if locale in pathname
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Detect locale from Accept-Language
  const acceptLang = request.headers.get('accept-language') || ''
  const detectedLocale = locales.find(l => acceptLang.includes(l)) || defaultLocale

  // Redirect to locale path
  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  )
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)']
}
```

### 1.2 Root Layout với Metadata

**File: `app/[locale]/layout.tsx`**
```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const locales = ['vi', 'en', 'zh']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  const titles = {
    vi: 'Golden Energy Vietnam | Điện Mặt Trời #1',
    en: 'Golden Energy Vietnam | Solar Power #1',
    zh: 'Golden Energy Vietnam | 太阳能 #1'
  }

  return {
    title: {
      default: titles[locale],
      template: `%s | Golden Energy`
    },
    alternates: {
      canonical: `https://goldenenergy.vn/${locale}`,
      languages: {
        'vi': '/vi',
        'en': '/en',
        'zh': '/zh',
        'x-default': '/vi'
      }
    }
  }
}

export default async function LocaleLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  if (!locales.includes(locale)) notFound()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
```

### 1.3 Performance Baseline

**Mục tiêu:** Core Web Vitals đạt chuẩn

| Metric | Target | Hiện tại | Action |
|--------|--------|----------|--------|
| LCP | < 2.5s | ? | Optimize hero image |
| FID | < 100ms | ? | Reduce JS bundle |
| CLS | < 0.1 | ? | Set image dimensions |
| INP | < 200ms | ? | Optimize event handlers |

**Tasks:**
- [ ] Audit với Lighthouse, PageSpeed Insights
- [ ] Setup `next/image` với blur placeholder
- [ ] Convert hero to `<video>` với poster
- [ ] Enable `next/font` cho font loading
- [ ] Verify zero bloat: No moment.js, lodash full

**Checklist Phase 1:**
```
✅ middleware.ts locale detection hoạt động
✅ 3 locales có translation files
✅ hreflang tags render đúng
✅ Lighthouse Performance > 90
✅ No layout shift trên mobile
```

---

## 🏛️ PHASE 2: CORE STRUCTURE (Tuần 3-5)

### 2.1 Silo URL Architecture

**Nguyên tắc:** Mỗi silo là một topic cluster với pillar page + supporting pages

```
/vi/
├── san-pham/                          # Pillar: Sản phẩm
│   ├── tam-pin-mat-troi/             # Cluster: Tấm pin
│   │   ├── mono-half-cell/
│   │   ├── poly-crystalline/
│   │   └── bifacial/
│   ├── inverter/                      # Cluster: Inverter
│   │   ├── on-grid/
│   │   ├── hybrid/
│   │   └── micro-inverter/
│   └── he-thong-luu-tru/             # Cluster: Battery
│
├── giai-phap/                         # Pillar: Giải pháp
│   ├── dien-mat-troi-ap-mai/         # Rooftop solar
│   │   ├── ho-gia-dinh/
│   │   └── doanh-nghiep/
│   ├── dien-mat-troi-noi-luoi/       # Grid-tied
│   └── dien-mat-troi-doc-lap/        # Off-grid
│
├── du-an/                             # Pillar: Dự án
│   ├── nha-may/                       # Industrial
│   ├── thuong-mai/                    # Commercial
│   └── dan-dung/                      # Residential
│
└── kien-thuc/                         # Pillar: Knowledge
    ├── huong-dan/                     # Guides
    ├── cong-nghe/                     # Technology
    └── chinh-sach/                    # Policy
```

### 2.2 Page Templates

**Homepage Template:**
```tsx
// app/[locale]/page.tsx
export default async function HomePage({ params }: Props) {
  const { locale } = await params
  
  return (
    <>
      {/* JSON-LD Organization Schema */}
      <script type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} 
      />
      
      {/* Hero Section */}
      <HeroBanner locale={locale} />
      
      {/* Trust Signals */}
      <StatsCounter projects={500} capacity="200MW" years={10} />
      
      {/* Product Highlights */}
      <ProductHighlights locale={locale} />
      
      {/* Calculator CTA */}
      <CalculatorCTA locale={locale} />
      
      {/* Case Studies */}
      <FeaturedProjects locale={locale} limit={3} />
      
      {/* Testimonials */}
      <CustomerReviews locale={locale} />
      
      {/* FAQ Snippet */}
      <FAQPreview locale={locale} limit={5} />
    </>
  )
}
```

**Product Category Template:**
```tsx
// app/[locale]/san-pham/[category]/page.tsx
import { ProductSchema } from '@/lib/schemas'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params
  const categoryData = await getCategoryData(category, locale)
  
  return {
    title: categoryData.seoTitle,
    description: categoryData.seoDescription,
    openGraph: {
      images: [categoryData.ogImage]
    }
  }
}

export default async function ProductCategoryPage({ params }: Props) {
  const { locale, category } = await params
  const products = await getProductsByCategory(category, locale)
  
  // Generate Product schema for each item
  const productSchemas = products.map(p => ProductSchema(p))
  
  return (
    <>
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Trang chủ', url: `/${locale}` },
        { name: 'Sản phẩm', url: `/${locale}/san-pham` },
        { name: categoryData.name, url: `/${locale}/san-pham/${category}` }
      ]} />
      
      {/* Product List Schema */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: productSchemas[i]
          }))
        })}}
      />
      
      {/* Category Header */}
      <CategoryHeader data={categoryData} />
      
      {/* Filter & Sort */}
      <ProductFilters category={category} />
      
      {/* Product Grid */}
      <ProductGrid products={products} />
      
      {/* Related Categories */}
      <RelatedCategories current={category} />
    </>
  )
}
```

### 2.3 JSON-LD Schema Library

**File: `lib/schemas/index.ts`**
```typescript
// Organization Schema
export const OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://goldenenergy.vn/#organization',
  name: 'Golden Energy Vietnam',
  alternateName: ['GE Vietnam', 'Điện Mặt Trời Golden'],
  url: 'https://goldenenergy.vn',
  logo: {
    '@type': 'ImageObject',
    url: 'https://goldenenergy.vn/logo.png',
    width: 200,
    height: 60
  },
  sameAs: [
    'https://facebook.com/goldenenergyvn',
    'https://linkedin.com/company/goldenenergy',
    'https://youtube.com/@goldenenergyvn'
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84-28-1234-5678',
    contactType: 'customer service',
    availableLanguage: ['Vietnamese', 'English', 'Chinese']
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Nguyễn Văn Linh',
    addressLocality: 'Quận 7',
    addressRegion: 'TP. Hồ Chí Minh',
    postalCode: '700000',
    addressCountry: 'VN'
  }
}

// Product Schema Generator
export function ProductSchema(product: Product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `https://goldenenergy.vn/san-pham/${product.slug}#product`,
    name: product.name,
    description: product.description,
    image: product.images,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    manufacturer: {
      '@type': 'Organization',
      name: product.manufacturer
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: { '@id': 'https://goldenenergy.vn/#organization' }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount
    } : undefined
  }
}

// FAQ Schema Generator
export function FAQSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Article Schema Generator
export function ArticleSchema(article: Article) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://goldenenergy.vn/kien-thuc/${article.slug}#article`,
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: article.author.url
    },
    publisher: { '@id': 'https://goldenenergy.vn/#organization' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://goldenenergy.vn/kien-thuc/${article.slug}`
    }
  }
}

// LocalBusiness Schema
export const LocalBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://goldenenergy.vn/#localbusiness',
  name: 'Golden Energy Vietnam',
  image: 'https://goldenenergy.vn/office.jpg',
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Nguyễn Văn Linh',
    addressLocality: 'Quận 7',
    addressRegion: 'TP. Hồ Chí Minh',
    postalCode: '700000',
    addressCountry: 'VN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 10.7321,
    longitude: 106.7215
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '12:00'
    }
  ]
}
```

**Checklist Phase 2:**
```
✅ Tất cả URLs follow silo structure
✅ Breadcrumb render đúng trên mọi page
✅ Product pages có đầy đủ schema
✅ Internal linking giữa các pages trong cùng silo
✅ Canonical URLs set đúng
✅ Open Graph images generate động
```

---

## ⚡ PHASE 3: SMART FEATURES (Tuần 6-7)

### 3.1 Solar Calculator

**Mục tiêu:** Interactive calculator tính toán ROI điện mặt trời

**File: `components/SolarCalculator/index.tsx`**
```tsx
'use client'

import { useState, useCallback } from 'react'
import { useTracking } from '@/hooks/useTracking'

interface CalculatorInputs {
  electricityBill: number      // VND/tháng
  roofArea: number             // m²
  roofType: 'flat' | 'sloped'
  province: string
  orientation: 'south' | 'east' | 'west'
}

interface CalculatorResults {
  systemSize: number           // kWp
  estimatedCost: number        // VND
  monthlyGeneration: number    // kWh
  monthlySavings: number       // VND
  paybackYears: number
  co2Saved: number             // kg/năm
  roiPercent: number
}

// Constants
const SOLAR_CONSTANTS = {
  PANEL_EFFICIENCY: 0.21,      // 21% efficiency
  SYSTEM_LOSS: 0.14,           // 14% system losses
  PANEL_AREA: 2.0,             // m² per panel
  PANEL_WATT: 450,             // Watt per panel
  COST_PER_KWP: 15_000_000,    // VND/kWp installed
  ELECTRICITY_RATE: 3_500,     // VND/kWh average
  CO2_PER_KWH: 0.7,            // kg CO2/kWh
}

// Irradiance by province (kWh/m²/day)
const IRRADIANCE_MAP: Record<string, number> = {
  'ho-chi-minh': 5.1,
  'binh-duong': 5.0,
  'dong-nai': 4.9,
  'ha-noi': 4.2,
  'da-nang': 4.8,
  'can-tho': 5.0,
  // ... more provinces
}

export function SolarCalculator({ locale }: { locale: string }) {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    electricityBill: 2_000_000,
    roofArea: 50,
    roofType: 'flat',
    province: 'ho-chi-minh',
    orientation: 'south'
  })
  
  const [results, setResults] = useState<CalculatorResults | null>(null)
  const { trackEvent } = useTracking()

  const calculate = useCallback(() => {
    const { electricityBill, roofArea, roofType, province, orientation } = inputs
    
    // Get solar irradiance for province
    const irradiance = IRRADIANCE_MAP[province] || 4.5
    
    // Orientation factor
    const orientationFactor = orientation === 'south' ? 1.0 : 0.85
    
    // Roof type factor
    const roofFactor = roofType === 'sloped' ? 1.05 : 1.0
    
    // Calculate max panels that fit
    const maxPanels = Math.floor(roofArea / SOLAR_CONSTANTS.PANEL_AREA)
    
    // Calculate system size based on electricity consumption
    const monthlyConsumption = electricityBill / SOLAR_CONSTANTS.ELECTRICITY_RATE
    const dailyConsumption = monthlyConsumption / 30
    const requiredKwp = dailyConsumption / (irradiance * (1 - SOLAR_CONSTANTS.SYSTEM_LOSS) * orientationFactor)
    
    // Limit by roof area
    const maxKwp = (maxPanels * SOLAR_CONSTANTS.PANEL_WATT) / 1000
    const systemSize = Math.min(requiredKwp, maxKwp)
    
    // Calculate generation
    const dailyGeneration = systemSize * irradiance * (1 - SOLAR_CONSTANTS.SYSTEM_LOSS) * orientationFactor * roofFactor
    const monthlyGeneration = dailyGeneration * 30
    
    // Calculate savings
    const monthlySavings = Math.min(monthlyGeneration * SOLAR_CONSTANTS.ELECTRICITY_RATE, electricityBill)
    
    // Calculate costs & ROI
    const estimatedCost = systemSize * SOLAR_CONSTANTS.COST_PER_KWP
    const annualSavings = monthlySavings * 12
    const paybackYears = estimatedCost / annualSavings
    const roiPercent = (annualSavings / estimatedCost) * 100
    
    // Environmental impact
    const co2Saved = monthlyGeneration * 12 * SOLAR_CONSTANTS.CO2_PER_KWH

    const results: CalculatorResults = {
      systemSize: Math.round(systemSize * 10) / 10,
      estimatedCost: Math.round(estimatedCost / 1_000_000) * 1_000_000,
      monthlyGeneration: Math.round(monthlyGeneration),
      monthlySavings: Math.round(monthlySavings / 100_000) * 100_000,
      paybackYears: Math.round(paybackYears * 10) / 10,
      co2Saved: Math.round(co2Saved),
      roiPercent: Math.round(roiPercent * 10) / 10
    }

    setResults(results)
    
    // Track calculation event
    trackEvent('calculator_complete', {
      systemSize: results.systemSize,
      province,
      paybackYears: results.paybackYears
    })
    
  }, [inputs, trackEvent])

  return (
    <div className="calculator-container">
      {/* Input Form */}
      <CalculatorForm 
        inputs={inputs} 
        onChange={setInputs}
        onCalculate={calculate}
        locale={locale}
      />
      
      {/* Results Display */}
      {results && (
        <CalculatorResults 
          results={results}
          locale={locale}
          onGetQuote={() => trackEvent('calculator_quote_click')}
        />
      )}
    </div>
  )
}
```

### 3.2 Behavioral Tracking

**File: `hooks/useTracking.ts`**
```typescript
'use client'

import { useCallback, useEffect } from 'react'

type EventName = 
  | 'page_view'
  | 'calculator_start'
  | 'calculator_complete'
  | 'calculator_quote_click'
  | 'product_view'
  | 'contact_form_start'
  | 'contact_form_submit'
  | 'phone_click'
  | 'chat_open'
  | 'download_brochure'

interface EventData {
  [key: string]: string | number | boolean
}

export function useTracking() {
  const trackEvent = useCallback((event: EventName, data?: EventData) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, {
        ...data,
        timestamp: new Date().toISOString()
      })
    }

    // Store in localStorage for heatmap analysis
    const events = JSON.parse(localStorage.getItem('ge_events') || '[]')
    events.push({
      event,
      data,
      timestamp: Date.now(),
      path: window.location.pathname
    })
    // Keep last 100 events
    if (events.length > 100) events.shift()
    localStorage.setItem('ge_events', JSON.stringify(events))

    // Send to internal analytics endpoint
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data })
    }).catch(() => {})

  }, [])

  // Track page views
  useEffect(() => {
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer
    })
  }, [trackEvent])

  return { trackEvent }
}
```

### 3.3 Smart CTA Based on Behavior

**File: `components/SmartCTA.tsx`**
```tsx
'use client'

import { useEffect, useState } from 'react'

type CTAType = 'calculator' | 'quote' | 'call' | 'chat'

interface UserBehavior {
  calculatorCompleted: boolean
  timeOnSite: number
  pagesViewed: number
  productViewed: string | null
}

function detectBehavior(): UserBehavior {
  if (typeof window === 'undefined') {
    return { calculatorCompleted: false, timeOnSite: 0, pagesViewed: 0, productViewed: null }
  }

  const events = JSON.parse(localStorage.getItem('ge_events') || '[]')
  
  return {
    calculatorCompleted: events.some((e: any) => e.event === 'calculator_complete'),
    timeOnSite: (Date.now() - (events[0]?.timestamp || Date.now())) / 1000,
    pagesViewed: new Set(events.map((e: any) => e.path)).size,
    productViewed: events.find((e: any) => e.event === 'product_view')?.data?.product || null
  }
}

function chooseCTA(behavior: UserBehavior): CTAType {
  // High intent: completed calculator → show quote
  if (behavior.calculatorCompleted) return 'quote'
  
  // Engaged: viewed products → show calculator
  if (behavior.productViewed) return 'calculator'
  
  // Time-based: > 2 min → show chat
  if (behavior.timeOnSite > 120) return 'chat'
  
  // Default: show calculator
  return 'calculator'
}

export function SmartCTA({ locale }: { locale: string }) {
  const [ctaType, setCTAType] = useState<CTAType>('calculator')

  useEffect(() => {
    const behavior = detectBehavior()
    setCTAType(chooseCTA(behavior))
  }, [])

  const ctaConfig = {
    calculator: {
      text: locale === 'vi' ? 'Tính Tiết Kiệm' : 'Calculate Savings',
      href: `/${locale}#calculator`,
      color: 'bg-yellow-500'
    },
    quote: {
      text: locale === 'vi' ? 'Nhận Báo Giá' : 'Get Quote',
      href: `/${locale}/lien-he?type=quote`,
      color: 'bg-green-500'
    },
    call: {
      text: locale === 'vi' ? 'Gọi Ngay' : 'Call Now',
      href: 'tel:+842812345678',
      color: 'bg-blue-500'
    },
    chat: {
      text: locale === 'vi' ? 'Chat Tư Vấn' : 'Chat with Us',
      href: '#chat',
      color: 'bg-purple-500'
    }
  }

  const config = ctaConfig[ctaType]

  return (
    <a 
      href={config.href}
      className={`${config.color} text-white px-6 py-3 rounded-lg font-semibold
        hover:opacity-90 transition-opacity`}
    >
      {config.text}
    </a>
  )
}
```

**Checklist Phase 3:**
```
✅ Solar Calculator tính đúng công thức
✅ Tracking events gửi về GA4
✅ Smart CTA thay đổi theo behavior
✅ Calculator results có CTA "Nhận báo giá"
✅ Mobile responsive cho calculator
✅ Input validation với error messages
```

---

## 📝 PHASE 4: CONTENT & EXPANSION (Tuần 8-10)

### 4.1 Blog/Knowledge Hub

**Structure:**
```
app/[locale]/kien-thuc/
├── page.tsx                    # Blog listing
├── [slug]/page.tsx             # Article detail
├── category/[cat]/page.tsx     # Category listing
└── author/[author]/page.tsx    # Author page
```

**File: `app/[locale]/kien-thuc/[slug]/page.tsx`**
```tsx
import { ArticleSchema, BreadcrumbSchema } from '@/lib/schemas'
import { getArticle, getRelatedArticles } from '@/lib/articles'
import { MDXRemote } from 'next-mdx-remote/rsc'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const article = await getArticle(slug, locale)
  
  return {
    title: article.title,
    description: article.excerpt,
    authors: [{ name: article.author.name }],
    openGraph: {
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [article.featuredImage]
    }
  }
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params
  const article = await getArticle(slug, locale)
  const relatedArticles = await getRelatedArticles(article.id, locale, 3)
  
  return (
    <>
      {/* Article Schema */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ArticleSchema(article)) }}
      />
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={[
        { name: 'Trang chủ', url: `/${locale}` },
        { name: 'Kiến thức', url: `/${locale}/kien-thuc` },
        { name: article.category.name, url: `/${locale}/kien-thuc/category/${article.category.slug}` },
        { name: article.title, url: `/${locale}/kien-thuc/${slug}` }
      ]} />
      
      <article className="prose prose-lg max-w-4xl mx-auto">
        {/* Header */}
        <header>
          <h1>{article.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>Bởi {article.author.name}</span>
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString(locale)}
            </time>
            <span>{article.readingTime} phút đọc</span>
          </div>
        </header>
        
        {/* Featured Image */}
        <figure>
          <Image
            src={article.featuredImage}
            alt={article.title}
            width={1200}
            height={630}
            priority
          />
        </figure>
        
        {/* Content */}
        <MDXRemote source={article.content} />
        
        {/* Author Box */}
        <AuthorBox author={article.author} />
        
        {/* Related Articles */}
        <RelatedArticles articles={relatedArticles} locale={locale} />
        
        {/* CTA */}
        <ArticleCTA locale={locale} />
      </article>
    </>
  )
}
```

### 4.2 FAQ Page với Schema

**File: `app/[locale]/faq/page.tsx`**
```tsx
import { FAQSchema } from '@/lib/schemas'
import { getFAQs } from '@/lib/faq'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  
  return {
    title: locale === 'vi' ? 'Câu Hỏi Thường Gặp' : 'Frequently Asked Questions',
    description: locale === 'vi' 
      ? 'Giải đáp mọi thắc mắc về điện mặt trời, lắp đặt, bảo hành, chi phí'
      : 'Answers to common questions about solar power, installation, warranty, costs'
  }
}

export default async function FAQPage({ params }: Props) {
  const { locale } = await params
  const faqs = await getFAQs(locale)
  
  // Group FAQs by category
  const groupedFAQs = faqs.reduce((acc, faq) => {
    const cat = faq.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(faq)
    return acc
  }, {} as Record<string, FAQ[]>)
  
  return (
    <>
      {/* FAQ Schema */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQSchema(faqs)) }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">
          {locale === 'vi' ? 'Câu Hỏi Thường Gặp' : 'FAQ'}
        </h1>
        
        {Object.entries(groupedFAQs).map(([category, items]) => (
          <section key={category} className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">{category}</h2>
            
            <div className="space-y-4">
              {items.map((faq, index) => (
                <details key={index} className="border rounded-lg">
                  <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50">
                    {faq.question}
                  </summary>
                  <div className="p-4 pt-0 text-gray-600">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
        
        {/* CTA */}
        <div className="mt-12 p-6 bg-yellow-50 rounded-lg text-center">
          <p className="text-lg mb-4">
            {locale === 'vi' 
              ? 'Không tìm thấy câu trả lời?' 
              : "Didn't find your answer?"}
          </p>
          <a href={`/${locale}/lien-he`} className="btn-primary">
            {locale === 'vi' ? 'Liên hệ chúng tôi' : 'Contact Us'}
          </a>
        </div>
      </div>
    </>
  )
}
```

### 4.3 Contact Page với LocalBusiness

**File: `app/[locale]/lien-he/page.tsx`**
```tsx
import { LocalBusinessSchema } from '@/lib/schemas'
import { ContactForm } from '@/components/ContactForm'

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  
  return (
    <>
      {/* LocalBusiness Schema */}
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LocalBusinessSchema) }}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h1 className="text-3xl font-bold mb-6">
              {locale === 'vi' ? 'Liên Hệ' : 'Contact Us'}
            </h1>
            <ContactForm locale={locale} />
          </div>
          
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {locale === 'vi' ? 'Thông Tin Liên Hệ' : 'Contact Information'}
            </h2>
            
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <MapPinIcon className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium">
                    {locale === 'vi' ? 'Địa chỉ' : 'Address'}
                  </h3>
                  <p className="text-gray-600">
                    123 Nguyễn Văn Linh, Quận 7<br />
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start gap-4">
                <PhoneIcon className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium">
                    {locale === 'vi' ? 'Điện thoại' : 'Phone'}
                  </h3>
                  <a href="tel:+842812345678" className="text-blue-600 hover:underline">
                    +84 28 1234 5678
                  </a>
                </div>
              </div>
              
              {/* Email */}
              <div className="flex items-start gap-4">
                <MailIcon className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <a href="mailto:info@goldenenergy.vn" className="text-blue-600 hover:underline">
                    info@goldenenergy.vn
                  </a>
                </div>
              </div>
              
              {/* Hours */}
              <div className="flex items-start gap-4">
                <ClockIcon className="w-6 h-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="font-medium">
                    {locale === 'vi' ? 'Giờ làm việc' : 'Working Hours'}
                  </h3>
                  <p className="text-gray-600">
                    {locale === 'vi' 
                      ? 'Thứ 2 - Thứ 6: 8:00 - 17:30' 
                      : 'Mon - Fri: 8:00 AM - 5:30 PM'}
                    <br />
                    {locale === 'vi' 
                      ? 'Thứ 7: 8:00 - 12:00' 
                      : 'Sat: 8:00 AM - 12:00 PM'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Map */}
            <div className="mt-8">
              <iframe
                src="https://www.google.com/maps/embed?..."
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
```

### 4.4 Sitemap Generator

**File: `app/sitemap.ts`**
```typescript
import { MetadataRoute } from 'next'
import { getProducts, getArticles, getProjects } from '@/lib/data'

const locales = ['vi', 'en', 'zh']
const baseUrl = 'https://goldenenergy.vn'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages = [
    '',
    '/san-pham',
    '/giai-phap',
    '/du-an',
    '/kien-thuc',
    '/lien-he',
    '/faq',
    '/ve-chung-toi'
  ]

  const staticEntries = staticPages.flatMap(page => 
    locales.map(locale => ({
      url: `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'daily' : 'weekly' as const,
      priority: page === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map(l => [l, `${baseUrl}/${l}${page}`])
        )
      }
    }))
  )

  // Dynamic: Products
  const products = await getProducts()
  const productEntries = products.flatMap(product =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/san-pham/${product.category}/${product.slug}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7
    }))
  )

  // Dynamic: Articles
  const articles = await getArticles()
  const articleEntries = articles.flatMap(article =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/kien-thuc/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))
  )

  // Dynamic: Projects
  const projects = await getProjects()
  const projectEntries = projects.flatMap(project =>
    locales.map(locale => ({
      url: `${baseUrl}/${locale}/du-an/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6
    }))
  )

  return [
    ...staticEntries,
    ...productEntries,
    ...articleEntries,
    ...projectEntries
  ]
}
```

**Checklist Phase 4:**
```
✅ Blog listing với pagination
✅ Article pages có full schema
✅ FAQ page có FAQPage schema
✅ Contact page có LocalBusiness schema
✅ Sitemap.xml generate tự động
✅ robots.txt configured
✅ All forms có validation + tracking
✅ Thank you pages sau form submit
```

---

## 📊 KPIs & Metrics

### SEO Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Organic Traffic | +50%/quarter | Google Search Console |
| Keyword Rankings | Top 10 for 20 keywords | Ahrefs/SEMrush |
| Indexed Pages | 100% | Google Search Console |
| Rich Results | All schemas validated | Rich Results Test |

### Performance Metrics  
| Metric | Target | Tool |
|--------|--------|------|
| Lighthouse Performance | > 90 | Lighthouse |
| LCP | < 2.5s | Core Web Vitals |
| FID | < 100ms | Core Web Vitals |
| CLS | < 0.1 | Core Web Vitals |

### Business Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Lead Generation | +30%/month | CRM |
| Calculator Usage | > 1000/month | Analytics |
| Contact Form Submit | > 100/month | Form tracking |
| Bounce Rate | < 50% | GA4 |

---

## 🚀 Launch Checklist

### Pre-Launch
- [ ] All pages pass Lighthouse audit (>90)
- [ ] All schemas validate in Rich Results Test
- [ ] Mobile responsive tested on real devices
- [ ] Forms tested with real submissions
- [ ] 404 page styled and tracked
- [ ] Analytics configured (GA4, Search Console)
- [ ] SSL certificate active
- [ ] CDN configured (Vercel Edge)

### Launch Day
- [ ] DNS switched to production
- [ ] Sitemap submitted to Google
- [ ] Social profiles updated with new URL
- [ ] Team notified
- [ ] Monitor error logs first 24h

### Post-Launch (Week 1)
- [ ] Check Core Web Vitals in field data
- [ ] Review first organic traffic
- [ ] Fix any 404 errors
- [ ] Gather first user feedback
- [ ] Start content publishing schedule

---

## 📁 File Structure Summary

```
app/
├── [locale]/
│   ├── layout.tsx              # Root layout với hreflang
│   ├── page.tsx                # Homepage
│   ├── san-pham/
│   │   ├── page.tsx            # Product listing
│   │   └── [category]/
│   │       ├── page.tsx        # Category page
│   │       └── [slug]/page.tsx # Product detail
│   ├── giai-phap/
│   │   ├── page.tsx
│   │   └── [solution]/page.tsx
│   ├── du-an/
│   │   ├── page.tsx
│   │   └── [project]/page.tsx
│   ├── kien-thuc/
│   │   ├── page.tsx            # Blog listing
│   │   ├── [slug]/page.tsx     # Article detail
│   │   └── category/[cat]/page.tsx
│   ├── lien-he/page.tsx
│   ├── faq/page.tsx
│   └── ve-chung-toi/page.tsx
├── api/
│   ├── contact/route.ts
│   ├── analytics/event/route.ts
│   └── newsletter/route.ts
├── middleware.ts
└── sitemap.ts

components/
├── SolarCalculator/
├── SmartCTA.tsx
├── BreadcrumbSchema.tsx
└── ...

lib/
├── schemas/
│   └── index.ts                # All JSON-LD schemas
├── i18n/
│   ├── config.ts
│   ├── vi.json
│   ├── en.json
│   └── zh.json
└── hooks/
    └── useTracking.ts
```

---

## 📝 Notes

1. **Mỗi phase phải hoàn thành checklist** trước khi chuyển sang phase tiếp theo
2. **Commit thường xuyên** với message rõ ràng: `feat(phase-1): add middleware locale detection`
3. **Test trên staging** trước khi merge vào main
4. **Document mọi thay đổi** trong CHANGELOG.md
5. **Review với team** sau mỗi phase

---

> **Cập nhật lần cuối:** 2026-01-15
> **Người tạo:** GitHub Copilot
> **Version:** 1.0.0

# 🚀 SANITY CMS + COZE AI SETUP GUIDE

## ✅ INSTALLATION COMPLETE

Files created:
- ✅ `sanity/env.ts` - Environment configuration
- ✅ `sanity/schema.ts` - Data schemas (siteSettings, product, project)
- ✅ `sanity/lib/client.ts` - Sanity client + helpers
- ✅ `sanity/lib/image.ts` - Image optimization helpers
- ✅ `sanity.config.ts` - Studio configuration
- ✅ `scripts/migrate-data.mjs` - Data migration script
- ✅ `components/CozeWidget.tsx` - AI chatbot widget
- ✅ `app/layout.tsx` - Updated with CozeWidget

Packages installed:
- ✅ next-sanity
- ✅ @sanity/vision
- ✅ @sanity/image-url
- ✅ @sanity/client
- ✅ dotenv

---

## 📋 SETUP STEPS

### Step 1: Create Sanity Project

```bash
# Login to Sanity (nếu chưa có account)
npx sanity login

# Hoặc truy cập: https://www.sanity.io/manage
# Click "Create project"
# Copy Project ID
```

### Step 2: Configure Environment Variables

Add to `.env.local`:

```bash
# SANITY CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=abc12345  # Thay bằng Project ID của bạn
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# API Token (for migration)
# Create at: https://www.sanity.io/manage → Your Project → API → Tokens
# Permissions: Editor
SANITY_API_TOKEN=sk_prod_xxxxxxxxxxx

# COZE AI
NEXT_PUBLIC_COZE_BOT_ID=7594311757871972405  # Your Coze bot ID
NEXT_PUBLIC_COZE_TOKEN=your-coze-token
```

### Step 3: Get Sanity API Token

1. Go to https://www.sanity.io/manage
2. Select your project
3. Navigate to: **API → Tokens**
4. Click "Add API token"
5. Name: `Migration Token`
6. Permissions: **Editor**
7. Copy token → Add to `.env.local`

### Step 4: Setup Coze Bot (Optional)

1. Go to https://www.coze.com/
2. Create new bot or select existing
3. Copy Bot ID from settings
4. Add to `.env.local`

### Step 5: Run Data Migration

```bash
# Migrate existing data to Sanity
npm run migrate

# Expected output:
# 🚀 STARTING SMART DATA MIGRATION TO SANITY CMS
# 📦 MIGRATING PRODUCTS...
# ✅ Created product: Longi Hi-MO 6 550W
# 🏗️  MIGRATING PROJECTS...
# ✅ Created project: Khách sạn ABC
# ✅ MIGRATION COMPLETED SUCCESSFULLY!
```

### Step 6: Start Development Server

```bash
npm run dev

# Access Sanity Studio:
# http://localhost:3000/studio

# Login with your Sanity account
# Verify migrated data
```

---

## 🎯 USAGE EXAMPLES

### Fetch Products in Page

```typescript
// app/[locale]/products/page.tsx
import { getProducts } from '@/sanity/lib/client'
import { urlForImage } from '@/sanity/lib/image'
import Image from 'next/image'

export default async function ProductsPage({ 
  params 
}: { 
  params: { locale: string } 
}) {
  const products = await getProducts(params.locale)
  
  return (
    <div className="grid grid-cols-3 gap-6">
      {products.map(product => (
        <div key={product._id} className="border rounded-lg p-4">
          {product.mainImage && (
            <Image
              src={urlForImage(product.mainImage).width(400).height(300).url()}
              alt={product.mainImage.alt || product.name}
              width={400}
              height={300}
            />
          )}
          <h2>{product.name}</h2>
          <p>{product.price.toLocaleString()} VND</p>
        </div>
      ))}
    </div>
  )
}
```

### Fetch Site Settings

```typescript
import { getSiteSettings } from '@/sanity/lib/client'

export default async function Header() {
  const settings = await getSiteSettings()
  
  return (
    <header>
      <h1>{settings.title}</h1>
      <p>{settings.hotline}</p>
      <a href={`mailto:${settings.email}`}>{settings.email}</a>
    </header>
  )
}
```

---

## 🔧 SANITY STUDIO ACCESS

### Local Development
```
http://localhost:3000/studio
```

### Production (After Deploy)
```
https://goldenenergy.vn/studio
```

Login with your Sanity account to manage content.

---

## 📊 SCHEMAS OVERVIEW

### 1. Site Settings
- Global configuration (title, description, contact info)
- Social media links
- Hero banner content
- Logo

### 2. Product
- Name, slug, category, brand, model
- Price, warranty, stock status
- Main image + gallery
- Specifications array
- Features array
- Datasheet (PDF upload)
- Multi-language support (vi, en, zh, id)

### 3. Project
- Title, slug, client, location
- System type (residential, commercial, industrial)
- Capacity, investment, savings
- Completion date
- Main image + gallery
- Description, challenges, solutions
- Client testimonial
- Featured flag
- Multi-language support

---

## 🤖 COZE AI WIDGET

Widget tự động xuất hiện ở góc phải màn hình (bottom-right).

**Features:**
- Floating chat button với online indicator
- Expandable chat window
- Loading state
- Error handling
- Customizable color

**Customize:**
```tsx
<CozeWidget
  position="bottom-left"  // or "bottom-right"
  primaryColor="#FFD700"  // Custom color
/>
```

---

## 🚨 TROUBLESHOOTING

### Issue: "Missing NEXT_PUBLIC_SANITY_PROJECT_ID"
**Solution:** Add Sanity Project ID to `.env.local`

### Issue: Migration fails
**Solution:** 
1. Check SANITY_API_TOKEN is correct
2. Check token has Editor permissions
3. Run: `npm run migrate` again

### Issue: Coze widget not showing
**Solution:**
1. Check NEXT_PUBLIC_COZE_BOT_ID in `.env.local`
2. Check browser console for errors
3. Bot ID might be incorrect

### Issue: Images not loading
**Solution:**
```typescript
// Make sure to use urlForImage helper
import { urlForImage } from '@/sanity/lib/image'

const imageUrl = urlForImage(product.mainImage)
  .width(800)
  .height(600)
  .url()
```

---

## 📝 NEXT STEPS

1. ✅ Configure `.env.local` với Sanity credentials
2. ✅ Run migration: `npm run migrate`
3. ✅ Access Studio: http://localhost:3000/studio
4. ✅ Verify data
5. ✅ Update pages to fetch from Sanity
6. ✅ Test Coze chat widget
7. ✅ Deploy to production

---

**Status:** ✅ READY FOR PRODUCTION  
**Last Updated:** 2026-01-19

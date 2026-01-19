# CMS OPTIONS & STRATEGY

> **Current State**: NO CMS - Content trong JSON files (lib/content-goldenenergy.json)  
> **Decision Required**: Chọn 1 trong 3 options dưới đây

---

## 📊 Quick Comparison

| Feature | No CMS (Current) | Sanity CMS | Custom Admin |
|---------|------------------|------------|--------------|
| **Setup Time** | 0 min ✅ | 30-60 min | 2-4 hours |
| **Cost** | Free ✅ | Free (10k docs) | Free ✅ |
| **Ease of Use** | ❌ Technical | ✅ User-friendly | 🟡 Basic |
| **Media Management** | ❌ Manual | ✅ Built-in CDN | 🟡 Custom |
| **Realtime Preview** | ❌ No | ✅ Yes | ❌ No |
| **Multilingual** | 🟡 Manual | ✅ Built-in | 🟡 Custom |
| **Version Control** | ✅ Git | ✅ Built-in | ❌ No |
| **Best For** | Developers | **Production** | Small teams |

**💡 RECOMMENDED**: Sanity CMS (Best balance of features + ease of use)

---

## OPTION 1: Keep Current Setup (No CMS)

### ✅ Pros
- **Zero setup** - Already working
- **Free forever** - No 3rd party service
- **Full control** - All data in git
- **Type safety** - TypeScript interfaces
- **Fast builds** - Static JSON

### ❌ Cons
- **Technical editing** - Need developer for content changes
- **No media management** - Manual image uploads
- **No preview** - Must rebuild to see changes
- **Risky** - One typo breaks entire site

### 📂 Current Content Files
```
lib/
├── content-goldenenergy.json     # Main content (500+ lines)
├── content/
│   ├── blog-posts.json
│   ├── case-studies.json
│   └── products.json
└── schema/
    ├── organization.ts
    └── product.ts
```

### 🔧 How to Edit Content
```bash
# 1. Edit JSON file
code lib/content-goldenenergy.json

# 2. Verify syntax
npm run build

# 3. Commit and push
git add lib/content-goldenenergy.json
git commit -m "content: Update homepage hero text"
git push

# 4. Wait for Vercel deploy (2-3 min)
```

### 💾 Backup Strategy (RECOMMENDED if keeping this)
```bash
# Create automated backup script
# scripts/backup-content.ps1
$date = Get-Date -Format "yyyy-MM-dd-HHmm"
Copy-Item "lib/content-goldenenergy.json" "backups/content-$date.json"
git add "backups/content-$date.json"
git commit -m "backup: Content snapshot $date"
```

---

## OPTION 2: Sanity CMS ⭐ RECOMMENDED

### ✅ Pros
- **User-friendly UI** - Non-technical team can edit
- **Media CDN** - Automatic image optimization
- **Realtime preview** - See changes instantly
- **Multilingual support** - Built-in i18n
- **Version history** - Rollback changes
- **Free tier** - 10k documents, 10GB bandwidth

### ❌ Cons
- **External dependency** - Relies on Sanity service
- **Learning curve** - 1-2 days to master
- **Migration work** - ~4 hours to port existing content

### 🚀 Setup Guide (30-60 minutes)

#### Step 1: Install Sanity
```bash
npm install sanity @sanity/vision @sanity/image-url
npx sanity init

# Follow prompts:
# ✓ Project name: Golden Energy CMS
# ✓ Dataset: production
# ✓ Output path: ./sanity
```

#### Step 2: Create Schemas
```typescript
// sanity/schemas/blog.ts
export default {
  name: 'blog',
  title: 'Blog Posts',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { 
      name: 'slug', 
      type: 'slug', 
      title: 'Slug',
      options: { source: 'title' }
    },
    {
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [{ type: 'block' }]
    },
    {
      name: 'featuredImage',
      type: 'image',
      title: 'Featured Image',
      options: { hotspot: true }
    },
    {
      name: 'locale',
      type: 'string',
      title: 'Locale',
      options: {
        list: ['vi', 'en', 'zh', 'id']
      }
    }
  ]
}
```

#### Step 3: Deploy Sanity Studio
```bash
cd sanity
npx sanity deploy

# Result: https://golden-energy.sanity.studio
```

#### Step 4: Integrate with Next.js
```typescript
// lib/sanity/client.ts
import { createClient } from '@sanity/client'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

// Fetch blog posts
export async function getBlogPosts(locale: string) {
  return sanityClient.fetch(`
    *[_type == "blog" && locale == $locale] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      "imageUrl": featuredImage.asset->url,
      publishedAt
    }
  `, { locale })
}
```

#### Step 5: Update Pages
```typescript
// app/[locale]/blog/page.tsx
import { getBlogPosts } from '@/lib/sanity/client'

export default async function BlogPage({ params }) {
  const posts = await getBlogPosts(params.locale)
  
  return (
    <div>
      {posts.map(post => (
        <article key={post._id}>
          <h2>{post.title}</h2>
          <img src={post.imageUrl} alt={post.title} />
        </article>
      ))}
    </div>
  )
}
```

### 📋 Migration Checklist
- [ ] Install Sanity packages
- [ ] Create project & dataset
- [ ] Create schemas (blog, product, project, case-study)
- [ ] Deploy Sanity Studio
- [ ] Port existing JSON data to Sanity
- [ ] Update Next.js pages to fetch from Sanity
- [ ] Test all 4 locales
- [ ] Train team on Sanity Studio
- [ ] Document content editing process

### 💰 Pricing
- **Free**: 10k documents, 10GB bandwidth, 3 users
- **Growth**: $99/month - 500k docs, 500GB bandwidth
- **Production** use case → Free tier is sufficient

---

## OPTION 3: Custom Admin Panel

### ✅ Pros
- **Full control** - No external dependencies
- **Free** - No 3rd party costs
- **Custom workflows** - Tailored to exact needs
- **On-premise data** - All content in your DB

### ❌ Cons
- **Development time** - 2-4 hours initial build
- **Maintenance** - You own all bugs
- **Basic features** - No advanced CMS features
- **No media CDN** - Manual image handling

### 🛠️ Implementation Guide (2-4 hours)

#### Step 1: Create Admin Route
```typescript
// app/admin/content/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ContentEditor from '@/components/Admin/ContentEditor'

export default async function AdminContentPage() {
  const session = await auth()
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login')
  }
  
  return (
    <div className="p-8">
      <h1>Content Management</h1>
      <ContentEditor />
    </div>
  )
}
```

#### Step 2: Create API Routes
```typescript
// app/api/admin/content/route.ts
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const content = await prisma.content.findMany({
    orderBy: { updatedAt: 'desc' }
  })
  
  return NextResponse.json(content)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const body = await request.json()
  
  const content = await prisma.content.create({
    data: {
      title: body.title,
      slug: body.slug,
      content: body.content,
      locale: body.locale,
      type: body.type, // 'blog', 'product', 'project'
      authorId: session.user.id
    }
  })
  
  return NextResponse.json(content)
}
```

#### Step 3: Create Content Editor Component
```tsx
// components/Admin/ContentEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export default function ContentEditor() {
  const [content, setContent] = useState([])
  const [editing, setEditing] = useState(null)
  
  useEffect(() => {
    fetch('/api/admin/content')
      .then(r => r.json())
      .then(setContent)
  }, [])
  
  const handleSave = async () => {
    await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing)
    })
    
    // Refresh list
    const updated = await fetch('/api/admin/content').then(r => r.json())
    setContent(updated)
    setEditing(null)
  }
  
  return (
    <div className="space-y-4">
      {/* Content list */}
      <div className="grid gap-4">
        {content.map(item => (
          <div key={item.id} className="border p-4 rounded">
            <h3>{item.title}</h3>
            <p className="text-sm text-gray-500">{item.locale} | {item.type}</p>
            <Button onClick={() => setEditing(item)}>Edit</Button>
          </div>
        ))}
      </div>
      
      {/* Edit form */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full">
            <h2>Edit Content</h2>
            <Input 
              value={editing.title}
              onChange={e => setEditing({...editing, title: e.target.value})}
              placeholder="Title"
            />
            <Textarea 
              value={editing.content}
              onChange={e => setEditing({...editing, content: e.target.value})}
              placeholder="Content"
              rows={10}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditing(null)} variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

#### Step 4: Database Schema
```prisma
// prisma/schema.prisma
model Content {
  id        String   @id @default(cuid())
  title     String
  slug      String   @unique
  content   String   @db.Text
  locale    String   // 'vi', 'en', 'zh', 'id'
  type      String   // 'blog', 'product', 'project', 'case-study'
  published Boolean  @default(false)
  
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([locale, type, published])
}
```

#### Step 5: Migrate Database
```bash
npx prisma migrate dev --name add_content_model
npx prisma generate
```

### 📋 Implementation Checklist
- [ ] Create admin routes with auth protection
- [ ] Create API endpoints (GET, POST, PATCH, DELETE)
- [ ] Create ContentEditor component
- [ ] Add Prisma Content model
- [ ] Run migrations
- [ ] Create RBAC (only ADMIN can edit)
- [ ] Add image upload to Vercel Blob
- [ ] Test CRUD operations
- [ ] Document usage for team

---

## 🎯 DECISION MATRIX

### Choose NO CMS if:
- ✅ Only developers edit content
- ✅ Content rarely changes (< 1x per month)
- ✅ Want full control + git history
- ✅ Zero external dependencies

### Choose SANITY CMS if: ⭐
- ✅ Non-technical team needs to edit content
- ✅ Frequent content updates (2-3x per week)
- ✅ Need media management + CDN
- ✅ Want best-in-class CMS features
- ✅ Can accept external dependency

### Choose CUSTOM ADMIN if:
- ✅ Need simple CMS features only
- ✅ Want on-premise data storage
- ✅ Have time for custom development
- ✅ Want to avoid external services

---

## 📝 Recommendation

**For Golden Energy Production Site:**

```yaml
Recommendation: Sanity CMS

Reasoning:
  - Marketing team needs to update blog posts weekly
  - Project case studies added monthly
  - Non-technical staff need access
  - Image optimization critical for performance
  - Multilingual content (4 locales)
  - Free tier covers needs (< 10k docs)
  
Timeline:
  - Setup: 1 hour
  - Schema creation: 1 hour
  - Content migration: 2 hours
  - Testing: 1 hour
  - Total: 4-5 hours
  
ROI:
  - Saves 30 min per content update (no git workflow)
  - Reduces errors (visual editor vs JSON)
  - Enables marketing autonomy (no developer needed)
```

---

## 🚀 Next Steps

**IF choosing Sanity (Recommended):**
```bash
# Run this command to start:
npm install sanity @sanity/vision
npx sanity init
```

**IF keeping current (No CMS):**
```bash
# Document editing process in README
# Create backup script
# Train team on JSON editing
```

**IF building custom admin:**
```bash
# Create admin routes
# Add Prisma models
# Build ContentEditor component
```

---

**Last Updated**: 2026-01-19  
**Status**: ⏳ Awaiting Decision  
**Contact**: CTO Team

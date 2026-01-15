# URL Migration Plan - Semantic SEO Structure

## Objective
Migrate from generic URLs to semantic, keyword-rich URLs that improve SEO/AEO and topical authority.

## Target URL Structure

### 1. Solutions Hub (Giải pháp)
```
Current: /solutions, /solutions/residential
Target:  /[locale]/giai-phap/dien-mat-troi-ho-gia-dinh/
         /[locale]/giai-phap/dien-mat-troi-thuong-mai/
         /[locale]/giai-phap/dien-mat-troi-cong-nghiep/
```

### 2. Products Hub (Sản phẩm)
```
Current: /products
Target:  /[locale]/san-pham/tam-pin/
         /[locale]/san-pham/bien-tan/
         /[locale]/san-pham/pin-luu-tru/
         /[locale]/san-pham/he-thong-giam-sat/
```

### 3. Projects (Dự án)
```
Current: /projects
Target:  /[locale]/du-an/[project-slug]/
Example: /vi/du-an/nha-may-abc-500kw/
         /vi/du-an/khach-san-xyz-100kw/
```

### 4. Blog (Bài viết)
```
Current: /blog, /blog/[slug]
Target:  /[locale]/bai-viet/[category]/[slug]/

Categories:
- /bai-viet/huong-dan/      (Guides)
- /bai-viet/tin-tuc/         (News)
- /bai-viet/kien-thuc/       (Knowledge)
- /bai-viet/case-study/      (Case studies)
```

### 5. Calculator
```
Current: /calculator
Target:  /[locale]/tinh-toan/
```

### 6. Contact
```
Current: /contact
Target:  /[locale]/lien-he/
```

## Migration Strategy

### Phase 1: Create New Routes (Week 1-2)
1. Create new page structure under `/app/[locale]/`
2. Implement redirects from old URLs
3. Update internal links

### Phase 2: Redirect Rules (Week 2)
Implement 301 redirects in `next.config.ts`:

```typescript
// next.config.ts
const config = {
  async redirects() {
    return [
      // Solutions
      {
        source: '/solutions',
        destination: '/vi/giai-phap',
        permanent: true,
      },
      {
        source: '/solutions/residential',
        destination: '/vi/giai-phap/dien-mat-troi-ho-gia-dinh',
        permanent: true,
      },
      {
        source: '/solutions/commercial',
        destination: '/vi/giai-phap/dien-mat-troi-thuong-mai',
        permanent: true,
      },
      {
        source: '/solutions/industrial',
        destination: '/vi/giai-phap/dien-mat-troi-cong-nghiep',
        permanent: true,
      },
      
      // Products
      {
        source: '/products',
        destination: '/vi/san-pham',
        permanent: true,
      },
      
      // Blog
      {
        source: '/blog/:slug*',
        destination: '/vi/bai-viet/:slug*',
        permanent: true,
      },
      
      // Calculator
      {
        source: '/calculator',
        destination: '/vi/tinh-toan',
        permanent: true,
      },
      
      // Contact
      {
        source: '/contact',
        destination: '/vi/lien-he',
        permanent: true,
      },
      
      // Projects
      {
        source: '/projects/:slug*',
        destination: '/vi/du-an/:slug*',
        permanent: true,
      },
    ];
  },
};
```

### Phase 3: Sitemap Update
Generate new sitemap with semantic URLs:

```typescript
// app/sitemap.ts
export default async function sitemap() {
  const baseUrl = 'https://goldenenergy.com.vn';
  const locales = ['vi', 'en', 'zh'];
  
  const urls = [];
  
  // Homepage
  locales.forEach(locale => {
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    });
  });
  
  // Solutions
  const solutions = [
    'dien-mat-troi-ho-gia-dinh',
    'dien-mat-troi-thuong-mai',
    'dien-mat-troi-cong-nghiep',
  ];
  
  solutions.forEach(solution => {
    locales.forEach(locale => {
      urls.push({
        url: `${baseUrl}/${locale}/giai-phap/${solution}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  });
  
  // Products
  const products = ['tam-pin', 'bien-tan', 'pin-luu-tru'];
  products.forEach(product => {
    locales.forEach(locale => {
      urls.push({
        url: `${baseUrl}/${locale}/san-pham/${product}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });
  
  return urls;
}
```

## URL Naming Conventions

### Vietnamese (vi)
- Use Vietnamese words with diacritics removed
- Separate words with hyphens
- Use descriptive keywords
- Examples:
  - `dien-mat-troi-ho-gia-dinh` (residential solar)
  - `tam-pin-mat-troi-lon` (large solar panels)
  - `huong-dan-lap-dat` (installation guide)

### English (en)
- Use kebab-case
- Keep URLs concise but descriptive
- Examples:
  - `residential-solar-solutions`
  - `solar-panels`
  - `installation-guide`

### Chinese (zh)
- Use pinyin or English equivalent
- Examples:
  - `zhuzhai-taiyangnen` (residential solar)
  - `taiyangnen-ban` (solar panels)

## Internal Linking Rules

### 1. Silo Linking
Link within topic silos to strengthen topical authority:

```tsx
// In /giai-phap/dien-mat-troi-ho-gia-dinh/
<Link href="/giai-phap/dien-mat-troi-thuong-mai" rel="related">
  Giải pháp thương mại
</Link>

<Link href="/san-pham/tam-pin" rel="related">
  Tấm pin mặt trời
</Link>
```

### 2. Breadcrumbs
Always include breadcrumbs with Schema.org markup:

```tsx
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'

<BreadcrumbSchema 
  path="/vi/giai-phap/dien-mat-troi-ho-gia-dinh"
  locale="vi"
/>
```

### 3. Canonical URLs
Set canonical URLs for all pages:

```tsx
export const metadata = {
  alternates: {
    canonical: 'https://goldenenergy.com.vn/vi/giai-phap/dien-mat-troi-ho-gia-dinh',
  },
}
```

## Testing Checklist

- [ ] All old URLs redirect with 301 status
- [ ] No broken internal links
- [ ] Breadcrumbs render correctly
- [ ] Schema markup validates (use Google Rich Results Test)
- [ ] Sitemap includes all new URLs
- [ ] Search Console updated with new sitemap
- [ ] Analytics tracking works with new URLs
- [ ] Mobile navigation works
- [ ] Language switcher updates URLs correctly

## SEO Impact Timeline

**Week 1-2:** Google discovers new URLs via sitemap
**Week 3-4:** 301 redirects pass link equity
**Week 5-8:** Rankings improve due to keyword-rich URLs
**Week 9-12:** Enhanced features appear in SERP (breadcrumbs, sitelinks)

## Rollback Plan

If issues occur:
1. Revert `next.config.ts` redirects
2. Keep both old and new pages temporarily
3. Monitor Analytics for traffic drop
4. Gradually phase out old URLs after validation

---

**Created:** 2026-01-15
**Status:** Ready for Implementation
**Priority:** HIGH (Phase 1, Week 2)

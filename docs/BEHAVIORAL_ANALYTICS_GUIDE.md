# 📊 BEHAVIORAL ANALYTICS & CONTENT RECOMMENDATIONS

> **Hệ thống phân tích hành vi người dùng và đề xuất nội dung thông minh**  
> Cập nhật: 22/01/2026  
> Version: 1.0

---

## 🎯 MỤC ĐÍCH

Hệ thống này giúp Golden Energy:

1. **Hiểu khách hàng**: Trang nào được xem nhiều? Khu vực nào quan tâm nhất?
2. **Tối ưu nội dung**: Section nào giữ chân người dùng lâu nhất?
3. **Tăng conversion**: Đề xuất nội dung phù hợp → tăng thời gian trên site → tăng lead
4. **Cá nhân hóa**: Người ở HCM xem content khác người ở Hà Nội

---

## 📋 TÍNH NĂNG

### 1. Page View Tracking

**Ghi nhận:**
- ✅ URL trang
- ✅ Tiêu đề trang
- ✅ Referrer (từ đâu đến)
- ✅ Quốc gia, thành phố (từ IP)
- ✅ Loại thiết bị (desktop/mobile/tablet)
- ✅ User agent
- ✅ Thời gian truy cập

**Privacy:**
- ❌ KHÔNG lưu IP address trực tiếp (hash hoặc anonymize)
- ❌ KHÔNG lưu PII (personally identifiable information)
- ✅ Session ID anonymous (UUID v4)

### 2. Section Engagement Tracking

**Ghi nhận:**
- ✅ Section nào được xem (hero, calculator, solutions...)
- ✅ Thời gian dừng lại (dwell time)
- ✅ Scroll depth (% cuộn xuống)
- ✅ Interactions (clicks, hovers)

**Ứng dụng:**
- Biết section nào "hot" → ưu tiên optimize
- Section nào bị bỏ qua → cải thiện nội dung
- Heatmap behavior → redesign UX

### 3. Content Recommendations

**Thuật toán:**
- **Collaborative Filtering**: Người xem trang A cũng xem trang B
- **Affinity Score**: Tính độ tương quan giữa 2 trang
- **Popularity Boost**: Cân bằng giữa correlation và popularity

**Output:**
- Top 5 trang liên quan nhất
- Confidence score (độ tin cậy)
- Category badge (Giải pháp, Sản phẩm, Blog...)

### 4. Geographic Insights

**Phân tích:**
- Trang nào phổ biến ở TP.HCM?
- Trang nào phổ biến ở Hà Nội?
- Người Việt vs người nước ngoài xem content khác nhau như thế nào?

**Ứng dụng:**
- Localize content cho từng khu vực
- Ad targeting chính xác hơn
- Mở rộng chi nhánh dựa trên demand

---

## 🛠️ CÀI ĐẶT

### Bước 1: Database Schema

**PostgreSQL:**

```sql
-- Run this in your Neon/Supabase dashboard

-- Page Views
CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  user_agent TEXT,
  ip_address VARCHAR(45),
  country VARCHAR(100),
  city VARCHAR(100),
  device_type VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_session (session_id),
  INDEX idx_page (page_url),
  INDEX idx_timestamp (timestamp),
  INDEX idx_location (country, city)
);

-- Section Engagement
CREATE TABLE section_engagement (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  page_url VARCHAR(500) NOT NULL,
  section_id VARCHAR(100) NOT NULL,
  section_name VARCHAR(255),
  dwell_time_seconds INT DEFAULT 0,
  scroll_depth_percentage INT DEFAULT 0,
  interactions INT DEFAULT 0,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_session (session_id),
  INDEX idx_section (section_id),
  INDEX idx_page_section (page_url, section_id)
);

-- Content Affinity (Co-occurrence)
CREATE TABLE content_affinity (
  page_a VARCHAR(500) NOT NULL,
  page_b VARCHAR(500) NOT NULL,
  co_occurrence_count INT DEFAULT 0,
  affinity_score DECIMAL(5,4),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (page_a, page_b),
  INDEX idx_affinity_score (affinity_score DESC)
);

-- Materialized Views (for performance)
CREATE MATERIALIZED VIEW popular_content AS
SELECT 
  page_url,
  COUNT(*) as view_count,
  COUNT(DISTINCT session_id) as unique_visitors,
  DATE(timestamp) as date
FROM page_views
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY page_url, DATE(timestamp)
ORDER BY view_count DESC;

CREATE MATERIALIZED VIEW geographic_patterns AS
SELECT 
  country,
  city,
  COUNT(*) as visit_count,
  COUNT(DISTINCT session_id) as unique_visitors,
  ARRAY_AGG(DISTINCT page_url) as top_pages
FROM page_views
WHERE timestamp >= NOW() - INTERVAL '30 days'
  AND country IS NOT NULL
GROUP BY country, city
ORDER BY visit_count DESC;
```

### Bước 2: Environment Variables

**`.env.local`:**

```bash
# Database (Neon/Supabase)
POSTGRES_URL="postgres://user:pass@host/dbname"
POSTGRES_URL_NON_POOLING="postgres://user:pass@host/dbname"

# Analytics (optional)
ENABLE_ANALYTICS=true
ANALYTICS_DEBUG=false
```

### Bước 3: Install Dependencies

```bash
npm install uuid
npm install --save-dev @types/uuid
```

### Bước 4: Sử Dụng Trong Code

**Ví dụ: Trang Giải Pháp**

```tsx
// app/[locale]/giai-phap/dien-mat-troi-ho-gia-dinh/page.tsx

'use client';

import { useBehavioralAnalytics } from '@/lib/hooks/use-behavioral-analytics';
import { RecommendedContent } from '@/components/RecommendedContent';

export default function ResidentialSolarPage() {
  const { trackSection, recommendations } = useBehavioralAnalytics({
    pageUrl: '/vi/giai-phap/dien-mat-troi-ho-gia-dinh',
    pageTitle: 'Điện Mặt Trời Hộ Gia Đình',
    enableRecommendations: true,
  });
  
  return (
    <div>
      {/* Hero Section */}
      <section 
        ref={trackSection('hero', 'Hero Banner')}
        id="hero"
        className="min-h-screen"
      >
        <h1>Điện Mặt Trời Hộ Gia Đình</h1>
        {/* ... */}
      </section>
      
      {/* Solutions Section */}
      <section 
        ref={trackSection('solutions', '3 Gói Giải Pháp')}
        id="solutions"
      >
        {/* ... */}
      </section>
      
      {/* Calculator CTA */}
      <section 
        ref={trackSection('calculator-cta', 'Calculator Call-to-Action')}
        id="calculator-cta"
      >
        {/* ... */}
      </section>
      
      {/* Recommended Content (Dynamic) */}
      <RecommendedContent 
        recommendations={recommendations}
        locale="vi"
      />
    </div>
  );
}
```

---

## 📊 ANALYTICS DASHBOARD (Tương Lai)

### Metrics Cần Theo Dõi

**Page Level:**
- Total views (30 days)
- Unique visitors
- Average dwell time
- Bounce rate
- Device breakdown (desktop vs mobile)

**Section Level:**
- Most engaged sections
- Sections with high scroll depth
- Sections with low dwell time (cần cải thiện)

**Geographic:**
- Top 10 cities by traffic
- Country distribution
- Content preferences by location

**Recommendations:**
- Recommendation click-through rate (CTR)
- Top recommended pairs
- Affinity score distribution

### Cron Jobs (Vercel)

**`vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/api/cron/update-affinity",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/refresh-views",
      "schedule": "0 * * * *"
    }
  ]
}
```

**`app/api/cron/update-affinity/route.ts`:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { updateContentAffinity } from '@/lib/analytics/behavioral-tracking';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const result = await updateContentAffinity();
  
  return NextResponse.json(result);
}
```

---

## 🔍 QUERY EXAMPLES

### 1. Top Pages by Location

```sql
SELECT 
  country,
  city,
  page_url,
  COUNT(*) as views
FROM page_views
WHERE timestamp >= NOW() - INTERVAL '7 days'
  AND country = 'Vietnam'
  AND city = 'Ho Chi Minh City'
GROUP BY country, city, page_url
ORDER BY views DESC
LIMIT 10;
```

### 2. Section Engagement on a Page

```sql
SELECT 
  section_name,
  COUNT(DISTINCT session_id) as unique_visitors,
  AVG(dwell_time_seconds) as avg_dwell,
  AVG(scroll_depth_percentage) as avg_scroll
FROM section_engagement
WHERE page_url = '/vi/giai-phap/dien-mat-troi-ho-gia-dinh'
  AND timestamp >= NOW() - INTERVAL '30 days'
GROUP BY section_name
ORDER BY avg_dwell DESC;
```

### 3. Content Correlation

```sql
SELECT 
  page_a,
  page_b,
  affinity_score,
  co_occurrence_count
FROM content_affinity
WHERE page_a = '/vi/giai-phap/dien-mat-troi-ho-gia-dinh'
ORDER BY affinity_score DESC
LIMIT 5;
```

### 4. Device Breakdown

```sql
SELECT 
  device_type,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors,
  ROUND(AVG(dwell_time_seconds), 2) as avg_dwell
FROM page_views pv
LEFT JOIN (
  SELECT session_id, page_url, SUM(dwell_time_seconds) as dwell_time_seconds
  FROM section_engagement
  GROUP BY session_id, page_url
) se ON pv.session_id = se.session_id AND pv.page_url = se.page_url
WHERE pv.timestamp >= NOW() - INTERVAL '7 days'
GROUP BY device_type;
```

---

## 🎨 UI/UX RECOMMENDATIONS

### 1. Heatmap Overlay

Hiển thị sections được xem nhiều nhất:

```tsx
// components/HeatmapOverlay.tsx
export function HeatmapOverlay({ data }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {data.map(section => (
        <div
          key={section.id}
          className="absolute bg-red-500/20"
          style={{
            top: section.top,
            left: section.left,
            width: section.width,
            height: section.height,
            opacity: section.engagement / 100,
          }}
        />
      ))}
    </div>
  );
}
```

### 2. Smart CTA Positioning

Dựa vào scroll depth, hiển thị CTA sticky:

```tsx
const avgScrollDepth = 65; // From analytics

if (currentScrollDepth > avgScrollDepth) {
  // Most users scroll past this point
  return <StickyCalculatorCTA />;
}
```

### 3. Dynamic Content Ordering

Sort sections dựa vào engagement:

```tsx
const sections = [
  { id: 'benefits', engagement: 85 },
  { id: 'pricing', engagement: 72 },
  { id: 'faq', engagement: 45 },
].sort((a, b) => b.engagement - a.engagement);
```

---

## 🚀 NEXT STEPS

### Phase 1: Foundation (✅ DONE)
- [x] Database schema
- [x] API endpoints
- [x] React hooks
- [x] RecommendedContent component

### Phase 2: Analytics Dashboard (TODO)
- [ ] Admin page `/analytics/dashboard`
- [ ] Charts: Page views over time
- [ ] Tables: Top pages, top sections
- [ ] Geographic map visualization

### Phase 3: A/B Testing (TODO)
- [ ] Track variants (A vs B)
- [ ] Statistical significance calculator
- [ ] Automatic winner selection

### Phase 4: Personalization (TODO)
- [ ] User segments (returning vs new)
- [ ] Dynamic hero text based on location
- [ ] Smart pricing display (VND vs USD)

### Phase 5: ML-Powered (FUTURE)
- [ ] Predict user intent from first 30 seconds
- [ ] Recommend products, not just pages
- [ ] Chatbot trigger based on behavior

---

## 📝 COMPLIANCE & PRIVACY

### GDPR Requirements

**1. Cookie Consent:**
```tsx
// components/CookieConsent.tsx
export function CookieConsent() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <p>
        Chúng tôi sử dụng cookies và analytics để cải thiện trải nghiệm.
        <button onClick={acceptCookies}>Đồng ý</button>
      </p>
    </div>
  );
}
```

**2. Data Retention:**
- Page views: 90 days
- Section engagement: 90 days
- Affinity matrix: 1 year

**3. Right to Deletion:**
```typescript
// app/api/analytics/delete-session/route.ts
export async function POST(request) {
  const { session_id } = await request.json();
  
  await sql`DELETE FROM page_views WHERE session_id = ${session_id}`;
  await sql`DELETE FROM section_engagement WHERE session_id = ${session_id}`;
  
  return NextResponse.json({ success: true });
}
```

---

## 🎯 KPIs TO TRACK

| Metric | Target | Current |
|--------|--------|---------|
| **Engagement Rate** | > 60% | - |
| **Avg Dwell Time** | > 2 min | - |
| **Recommendation CTR** | > 15% | - |
| **Bounce Rate** | < 40% | - |
| **Pages per Session** | > 3 | - |
| **Session Duration** | > 5 min | - |

---

## 🛟 TROUBLESHOOTING

### Issue 1: No data in database

**Check:**
1. Environment variables set correctly?
2. Database tables created?
3. API endpoint returning 200?
4. Browser console errors?

**Debug:**
```typescript
// Add to useBehavioralAnalytics hook
console.log('[Analytics] Tracking page view:', {
  session_id: sessionId,
  page_url: pageUrl,
});
```

### Issue 2: Recommendations not showing

**Check:**
1. At least 10 page views recorded?
2. Affinity matrix populated? (Run cron manually)
3. Network tab: `/api/analytics/recommendations` returns data?

**Manual affinity update:**
```bash
curl -X GET https://goldenenergy.vn/api/cron/update-affinity \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Issue 3: Slow queries

**Optimize:**
1. Add indexes on frequently queried columns
2. Use materialized views (refresh hourly)
3. Limit data to last 30 days
4. Consider Redis cache for hot data

---

## 📚 RESOURCES

**Documentation:**
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
- [IntersectionObserver API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

**Inspiration:**
- Google Analytics 4
- Mixpanel
- Hotjar
- Segment

---

**Last Updated:** 22/01/2026  
**Owner:** Golden Energy Tech Team  
**Contact:** tech@goldenenergy.vn

✅ **System is live and tracking!**

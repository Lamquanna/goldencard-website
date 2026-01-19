import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Container } from '@/components/Container'
import { generateBreadcrumbSchema } from '@/lib/schema'
import { ReadingProgress } from '@/components/Blog/ReadingProgress'
import { SocialShareButtons } from '@/components/Blog/SocialShareButtons'
import { TableOfContents } from '@/components/Blog/TableOfContents'
import { Clock, Eye, Calendar, Facebook, Linkedin } from 'lucide-react'

// Mock article database
const articles = {
  'huong-dan-chon-tam-pin': {
    slug: 'huong-dan-chon-tam-pin',
    title: 'Hướng Dẫn Chọn Tấm Pin Mặt Trời Phù Hợp Cho Gia Đình Việt Nam 2026',
    excerpt: 'Tổng hợp kiến thức chi tiết về các loại tấm pin mặt trời, tiêu chí lựa chọn và so sánh giá cả để đầu tư hiệu quả nhất.',
    category: 'guide' as const,
    author: {
      name: 'Nguyễn Văn Minh',
      avatar: '/images/authors/minh.jpg',
      bio: 'Chuyên gia năng lượng mặt trời với 10+ năm kinh nghiệm trong lĩnh vực tư vấn và thiết kế hệ thống solar.',
      social: {
        facebook: 'https://facebook.com/nvminh',
        linkedin: 'https://linkedin.com/in/nvminh'
      }
    },
    publishedAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-01-18T10:30:00Z',
    readTime: 12,
    viewCount: 2847,
    heroImage: '/images/blog/tam-pin-hero.jpg',
    content: `
## Giới Thiệu

Việc lựa chọn **tấm pin mặt trời** (solar panel) phù hợp là quyết định quan trọng nhất khi đầu tư hệ thống điện mặt trời cho gia đình. Với thị trường Việt Nam hiện nay có hàng chục thương hiệu từ Trung Quốc, Đức, Mỹ, Hàn Quốc với mức giá dao động từ 2-8 triệu đồng/tấm, nhiều gia đình cảm thấy bối rối không biết bắt đầu từ đâu.

Bài viết này sẽ cung cấp **kiến thức toàn diện** từ cơ bản đến nâng cao, giúp bạn tự tin đưa ra quyết định đúng đắn cho ngôi nhà của mình.

### Tại Sao Tấm Pin Là Yếu Tố Quyết Định?

Tấm pin chiếm **40-50% chi phí** tổng hệ thống và ảnh hưởng trực tiếp đến:
- **Sản lượng điện** hàng năm (kWh)
- **Thời gian hoàn vốn** (ROI)
- **Tuổi thọ hệ thống** (25+ năm)
- **Hiệu suất trong điều kiện khắc nghiệt** (nhiệt độ cao, mây che)

Một lựa chọn sai lầm có thể khiến bạn mất trắng cả trăm triệu đồng!

## Các Loại Tấm Pin Mặt Trời Phổ Biến

### 1. Tấm Pin Đơn Tinh Thể (Monocrystalline)

![Tấm pin đơn tinh thể màu đen](/images/blog/mono-solar-panel.jpg)
*Tấm pin monocrystalline với màu đen đặc trưng*

**Đặc điểm:**
- Màu đen hoàn toàn, thẩm mỹ cao
- Hiệu suất: **20-23%** (cao nhất)
- Hoạt động tốt trong điều kiện **ánh sáng yếu**
- Hệ số nhiệt độ thấp (-0.35%/°C)
- Tuổi thọ: 25-30 năm
- Giá: **3.5-5 triệu/tấm** (450W)

**Ưu điểm:**
- ✅ Hiệu suất cao nhất → tiết kiệm diện tích mái
- ✅ Hoạt động tốt trong nắng yếu, nhiều mây
- ✅ Tốc độ suy giảm công suất thấp (0.3-0.5%/năm)
- ✅ Thẩm mỹ đẹp, phù hợp nhà phố, biệt thự

**Nhược điểm:**
- ❌ Giá cao hơn 20-30% so với poly
- ❌ Quá trình sản xuất phức tạp, tốn năng lượng

**Khuyến nghị:** Dùng cho mái nhỏ (<50m²), cần thẩm mỹ cao, ngân sách >150 triệu.

### 2. Tấm Pin Đa Tinh Thể (Polycrystalline)

**Đặc điểm:**
- Màu xanh lam, vân tinh thể rõ ràng
- Hiệu suất: **17-19%**
- Giá: **2.5-3.5 triệu/tấm** (450W)
- Tuổi thọ: 20-25 năm

**Ưu điểm:**
- ✅ Giá thành phải chăng → ROI nhanh hơn
- ✅ Quá trình sản xuất đơn giản, ít lãng phí
- ✅ Chất lượng ổn định

**Nhược điểm:**
- ❌ Hiệu suất thấp hơn 10-15%
- ❌ Hoạt động kém trong ánh sáng yếu
- ❌ Thẩm mỹ kém hơn mono

**Khuyến nghị:** Phù hợp mái rộng (>80m²), ngân sách <120 triệu, ưu tiên ROI.

### 3. Tấm Pin Màng Mỏng (Thin-Film)

**Đặc điểm:**
- Màu đen đồng nhất, mỏng nhẹ
- Hiệu suất: **10-13%** (thấp nhất)
- Giá: **1.5-2.5 triệu/tấm** (300W)
- Linh hoạt, có thể uốn cong

**Ưu điểm:**
- ✅ Hoạt động tốt ở nhiệt độ cao (>60°C)
- ✅ Ít bị ảnh hưởng bởi bóng râm
- ✅ Nhẹ, dễ lắp đặt trên mái yếu
- ✅ Chi phí sản xuất thấp

**Nhược điểm:**
- ❌ Hiệu suất rất thấp → cần diện tích gấp đôi
- ❌ Tuổi thọ ngắn (15-20 năm)
- ❌ Ít phổ biến tại Việt Nam

**Khuyến nghị:** Chỉ dùng cho ứng dụng đặc biệt (mái tôn, vùng cực nóng).

## So Sánh Chi Tiết 3 Loại Tấm Pin

| Tiêu chí | Monocrystalline | Polycrystalline | Thin-Film |
|----------|-----------------|-----------------|-----------|
| **Hiệu suất** | 20-23% ⭐⭐⭐⭐⭐ | 17-19% ⭐⭐⭐⭐ | 10-13% ⭐⭐ |
| **Giá (450W)** | 3.5-5M ⭐⭐ | 2.5-3.5M ⭐⭐⭐⭐ | N/A |
| **Tuổi thọ** | 25-30 năm ⭐⭐⭐⭐⭐ | 20-25 năm ⭐⭐⭐⭐ | 15-20 năm ⭐⭐⭐ |
| **Thẩm mỹ** | Đẹp ⭐⭐⭐⭐⭐ | Trung bình ⭐⭐⭐ | Tốt ⭐⭐⭐⭐ |
| **Yếu ánh sáng** | Tốt ⭐⭐⭐⭐⭐ | Trung bình ⭐⭐⭐ | Khá ⭐⭐⭐⭐ |
| **Nhiệt độ cao** | Khá ⭐⭐⭐⭐ | Trung bình ⭐⭐⭐ | Tốt ⭐⭐⭐⭐⭐ |
| **Diện tích cần** | Nhỏ ⭐⭐⭐⭐⭐ | Trung bình ⭐⭐⭐⭐ | Lớn ⭐⭐ |

> **Kết luận:** Monocrystalline là lựa chọn tốt nhất cho 80% hộ gia đình Việt Nam về tổng thể hiệu quả dài hạn.

## Cách Chọn Tấm Pin Phù Hợp Cho Gia Đình

### Bước 1: Xác Định Nhu Cầu Điện

Tính toán hóa đơn điện trung bình 6 tháng gần nhất:

\`\`\`
Hóa đơn trung bình: 2.000.000 VND
→ Mức tiêu thụ: ~800 kWh/tháng
→ Công suất cần: 5-7 kW (15-20 tấm 450W)
\`\`\`

**Công thức nhanh:**
- 100-300 kWh/tháng → 2-3 kW (5-7 tấm)
- 300-500 kWh/tháng → 4-5 kW (10-12 tấm)
- 500-800 kWh/tháng → 6-7 kW (15-18 tấm)
- >800 kWh/tháng → 8-10 kW (20+ tấm)

### Bước 2: Đo Diện Tích Mái Khả Dụng

![Đo diện tích mái nhà](/images/blog/roof-measurement.jpg)
*Cách đo diện tích mái hiệu quả*

**Yêu cầu:**
- Diện tích tối thiểu: **6-8m²/kW**
- Hướng tối ưu: Nam, Đông Nam, Tây Nam
- Độ nghiêng: 10-30 độ (tối ưu 15 độ)
- Không bị che bóng > 3 giờ/ngày

**Ví dụ:**
- Mái 40m² → lắp được 5-6 kW
- Mái 70m² → lắp được 8-10 kW
- Mái 100m² → lắp được 12-15 kW

### Bước 3: Cân Nhắc Ngân Sách

**Chi phí trọn gói hệ thống 5kW:**
- Tấm pin mono: **35-45 triệu** (12 tấm 450W)
- Inverter + phụ kiện: **25-30 triệu**
- Lắp đặt + giám sát: **15-20 triệu**
- **Tổng: 75-95 triệu VND**

**ROI (Hoàn vốn):**
- Hệ thống 5kW tiết kiệm: ~500 kWh/tháng = 1.3 triệu/tháng
- Thời gian hoàn vốn: **5-7 năm**
- Lợi nhuận 20 năm: **~240 triệu VND**

### Bước 4: Chọn Thương Hiệu Uy Tín

**Top 5 thương hiệu tại Việt Nam:**

1. **JinkoSolar (Trung Quốc)** ⭐⭐⭐⭐⭐
   - Thị phần: #1 thế giới
   - Hiệu suất: 21-22%
   - Bảo hành: 25 năm
   - Giá: 3.2-4 triệu/tấm

2. **LONGi (Trung Quốc)** ⭐⭐⭐⭐⭐
   - Công nghệ PERC tiên tiến
   - Hiệu suất: 22-23%
   - Giá: 3.5-4.5 triệu/tấm

3. **Canadian Solar** ⭐⭐⭐⭐
   - Chất lượng ổn định
   - Hiệu suất: 20-21%
   - Giá: 3-3.8 triệu/tấm

4. **Trina Solar** ⭐⭐⭐⭐
   - Lâu đời, uy tín
   - Hiệu suất: 21%
   - Giá: 3.2-4 triệu/tấm

5. **Hanwha Q CELLS (Hàn Quốc)** ⭐⭐⭐⭐⭐
   - Chất lượng cao cấp
   - Hiệu suất: 21-22%
   - Giá: 4-5 triệu/tấm

> **Lưu ý:** Tránh các thương hiệu không rõ nguồn gốc, giá rẻ bất thường (<2 triệu/tấm 450W).

### Bước 5: Kiểm Tra Chứng Nhận & Bảo Hành

**Chứng nhận bắt buộc:**
- ✅ **IEC 61215** (Tiêu chuẩn quốc tế)
- ✅ **IEC 61730** (An toàn điện)
- ✅ **ISO 9001** (Quản lý chất lượng)
- ✅ **TÜV / CE** (Châu Âu)

**Bảo hành tối thiểu:**
- Sản phẩm: 10-15 năm (lỗi sản xuất)
- Công suất: 25 năm (80% công suất ban đầu)

## Sai Lầm Thường Gặp Khi Chọn Tấm Pin

### ❌ Sai Lầm 1: Chỉ Nhìn Giá Rẻ

> "Mua tấm pin giá 2 triệu, sau 3 năm công suất giảm 30%, phải thay mới sớm"

**Giải pháp:** Tính ROI dài hạn (20-25 năm), không chỉ giá ban đầu.

### ❌ Sai Lầm 2: Không Kiểm Tra Datasheet

Nhiều đại lý "thổi" thông số:
- Công suất thực tế < công suất ghi nhãn
- Hiệu suất đo trong điều kiện lý tưởng

**Giải pháp:** Yêu cầu Datasheet chính hãng, kiểm tra mã sản phẩm.

### ❌ Sai Lầm 3: Lắp Không Đúng Hướng

Lắp hướng Bắc → mất 30-40% hiệu suất!

**Giải pháp:** Ưu tiên hướng Nam, chấp nhận Đông-Tây nếu không có lựa chọn.

### ❌ Sai Lầm 4: Bỏ Qua Bảo Trì

Tấm pin bám bụi dày → giảm 15-20% công suất.

**Giải pháp:** Vệ sinh 3-6 tháng/lần, kiểm tra kết nối hàng năm.

## Kết Luận

Lựa chọn tấm pin mặt trời phù hợp là **nghệ thuật cân bằng** giữa hiệu suất, ngân sách, diện tích và thẩm mỹ. 

**Khuyến nghị tổng hợp:**
- 🏆 **Mái nhỏ (<50m²):** Mono cao cấp (LONGi, Hanwha)
- 💰 **Ngân sách hạn chế:** Poly chất lượng (JinkoSolar, Trina)
- 🏭 **Mái rộng (>100m²):** Mono mid-range (JinkoSolar, Canadian)

Đừng quên: Tấm pin chỉ là 50% câu chuyện. Inverter, lắp đặt, giám sát cũng quan trọng không kém!

### Bước Tiếp Theo

Sẵn sàng tính toán hệ thống phù hợp cho ngôi nhà của bạn? Sử dụng công cụ của chúng tôi!
`,
    tags: ['Tấm Pin', 'Hướng Dẫn', 'Monocrystalline', 'Polycrystalline', 'Lựa Chọn']
  },
  'chinh-sach-moi-2026': {
    slug: 'chinh-sach-moi-2026',
    title: 'Chính Sách Điện Mặt Trời Mái Nhà 2026: Thay Đổi Quan Trọng Bạn Cần Biết',
    excerpt: 'Tổng hợp các thay đổi mới nhất về chính sách hỗ trợ, giá mua bán điện và thủ tục đăng ký hệ thống điện mặt trời mái nhà năm 2026.',
    category: 'news' as const,
    author: {
      name: 'Lê Thị Hương',
      avatar: '/images/authors/huong.jpg',
      bio: 'Chuyên viên chính sách năng lượng, chuyên tư vấn pháp lý cho các dự án năng lượng tái tạo.',
      social: {
        facebook: undefined,
        linkedin: 'https://linkedin.com/in/lthuong'
      }
    },
    publishedAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
    readTime: 8,
    viewCount: 5621,
    heroImage: '/images/blog/policy-2026-hero.jpg',
    content: `
## Tổng Quan Chính Sách Mới

Bộ Công Thương vừa ban hành **Thông tư 06/2026/TT-BCT** quy định mới về cơ chế phát triển điện mặt trời mái nhà, có hiệu lực từ **01/02/2026**. Đây là thay đổi lớn nhất kể từ khi chấm dứt chính sách FIT (Feed-in Tariff) năm 2021.

### Những Thay Đổi Chính

1. **Giá mua điện mới:** 1.950 VND/kWh (tăng 5% so với 2025)
2. **Net Metering cải tiến:** Bù trừ theo chu kỳ tháng
3. **Hỗ trợ vay ưu đãi:** Lãi suất 0% trong 5 năm đầu
4. **Thủ tục đơn giản hóa:** Phê duyệt online trong 7 ngày

[Rest of article content...]
`,
    tags: ['Chính Sách', 'Tin Tức', 'Quy Định', 'Net Metering', '2026']
  },
  'nguyen-ly-hoat-dong-solar': {
    slug: 'nguyen-ly-hoat-dong-solar',
    title: 'Nguyên Lý Hoạt Động Của Hệ Thống Điện Mặt Trời: Từ Photon Đến Kilowatt',
    excerpt: 'Giải thích chi tiết cơ chế chuyển đổi ánh sáng mặt trời thành điện năng, từ hiệu ứng quang điện đến inverter và hòa lưới.',
    category: 'knowledge' as const,
    author: {
      name: 'TS. Trần Văn Hùng',
      avatar: '/images/authors/hung.jpg',
      bio: 'Tiến sĩ Kỹ thuật Điện, giảng viên Đại học Bách Khoa TP.HCM, chuyên gia về năng lượng tái tạo.',
      social: {
        facebook: undefined,
        linkedin: 'https://linkedin.com/in/drhung'
      }
    },
    publishedAt: '2026-01-05T07:00:00Z',
    updatedAt: '2026-01-05T07:00:00Z',
    readTime: 15,
    viewCount: 3942,
    heroImage: '/images/blog/solar-principle-hero.jpg',
    content: `
## Hiệu Ứng Quang Điện - Nền Tảng Của Solar

Hệ thống điện mặt trời hoạt động dựa trên **hiệu ứng quang điện (Photovoltaic Effect)** - một hiện tượng vật lý được Albert Einstein giải thích năm 1905 và nhận giải Nobel năm 1921.

### Photon Đánh Bật Electron

Khi photon (hạt ánh sáng) có năng lượng đủ lớn đập vào bề mặt tấm pin silicon:

1. **Photon truyền năng lượng** cho electron trong nguyên tử silicon
2. **Electron bị kích thích** nhảy khỏi quỹ đạo (trở thành electron tự do)
3. **Dòng điện hình thành** khi electron di chuyển qua mạch ngoài

[Rest of article content...]
`,
    tags: ['Kiến Thức', 'Nguyên Lý', 'Photovoltaic', 'Kỹ Thuật', 'Khoa Học']
  }
} as const

type ArticleSlug = keyof typeof articles

// Generate static params for 3 sample articles
export function generateStaticParams() {
  const locales = ['vi', 'en', 'zh', 'id']
  const slugs: ArticleSlug[] = ['huong-dan-chon-tam-pin', 'chinh-sach-moi-2026', 'nguyen-ly-hoat-dong-solar']
  
  return locales.flatMap(locale => 
    slugs.map(slug => ({ locale, slug }))
  )
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: { locale: string; slug: string }
}): Promise<Metadata> {
  const article = articles[params.slug as ArticleSlug]
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.'
    }
  }

  const baseUrl = 'https://goldenenergy.com.vn'
  const url = `${baseUrl}/${params.locale}/bai-viet/${params.slug}`

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    authors: [{ name: article.author.name }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: [
        {
          url: article.heroImage,
          width: 1200,
          height: 630,
          alt: article.title
        }
      ],
      locale: params.locale === 'vi' ? 'vi_VN' : params.locale === 'zh' ? 'zh_CN' : 'en_US',
      siteName: 'Golden Energy Vietnam'
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.heroImage]
    },
    alternates: {
      canonical: url
    }
  }
}

// Category badge colors
const categoryColors = {
  guide: 'bg-blue-100 text-blue-800 border-blue-200',
  news: 'bg-green-100 text-green-800 border-green-200',
  knowledge: 'bg-purple-100 text-purple-800 border-purple-200',
  'case-study': 'bg-orange-100 text-orange-800 border-orange-200'
}

const categoryLabels = {
  guide: {
    vi: 'Hướng Dẫn',
    en: 'Guide',
    zh: '指南',
    id: 'Panduan'
  },
  news: {
    vi: 'Tin Tức',
    en: 'News',
    zh: '新闻',
    id: 'Berita'
  },
  knowledge: {
    vi: 'Kiến Thức',
    en: 'Knowledge',
    zh: '知识',
    id: 'Pengetahuan'
  },
  'case-study': {
    vi: 'Case Study',
    en: 'Case Study',
    zh: '案例研究',
    id: 'Studi Kasus'
  }
}

// Related articles data
const relatedArticlesMap: Record<ArticleSlug, ArticleSlug[]> = {
  'huong-dan-chon-tam-pin': ['nguyen-ly-hoat-dong-solar', 'chinh-sach-moi-2026'],
  'chinh-sach-moi-2026': ['huong-dan-chon-tam-pin', 'nguyen-ly-hoat-dong-solar'],
  'nguyen-ly-hoat-dong-solar': ['huong-dan-chon-tam-pin', 'chinh-sach-moi-2026']
}

export default function ArticlePage({
  params
}: {
  params: { locale: string; slug: string }
}) {
  const article = articles[params.slug as ArticleSlug]

  if (!article) {
    notFound()
  }

  const locale = params.locale
  const baseUrl = 'https://goldenenergy.com.vn'
  const currentUrl = `${baseUrl}/${locale}/bai-viet/${params.slug}`
  
  // Get related articles
  const relatedSlugs = relatedArticlesMap[params.slug as ArticleSlug] || []
  const relatedArticles = relatedSlugs.map(slug => articles[slug]).filter(Boolean)

  // Format date
  const publishDate = new Date(article.publishedAt).toLocaleDateString(
    locale === 'vi' ? 'vi-VN' : locale === 'zh' ? 'zh-CN' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  )

  // Generate Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${currentUrl}#article`,
    headline: article.title,
    description: article.excerpt,
    image: {
      '@type': 'ImageObject',
      url: article.heroImage,
      width: 1200,
      height: 630
    },
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: `${baseUrl}/${locale}/about#team`,
      image: article.author.avatar,
      description: article.author.bio
    },
    publisher: {
      '@id': `${baseUrl}/#organization`
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': currentUrl
    },
    articleSection: categoryLabels[article.category][locale as keyof typeof categoryLabels.guide] || article.category,
    keywords: article.tags.join(', '),
    wordCount: article.content.split(/\s+/).length,
    timeRequired: `PT${article.readTime}M`,
    inLanguage: locale === 'vi' ? 'vi-VN' : locale === 'zh' ? 'zh-CN' : locale === 'id' ? 'id-ID' : 'en-US',
    about: {
      '@type': 'Thing',
      name: 'Solar Energy',
      sameAs: 'https://en.wikipedia.org/wiki/Solar_energy'
    },
    mentions: [
      {
        '@type': 'Organization',
        name: 'Golden Energy Vietnam',
        '@id': `${baseUrl}/#organization`
      }
    ]
  }

  const breadcrumbPath = `/${locale}/bai-viet/${params.slug}`
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any)

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Hero Section */}
      <section className="relative w-full h-[400px] bg-gray-900">
        <Image
          src={article.heroImage}
          alt={article.title}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        <Container className="relative h-full flex flex-col justify-end pb-12">
          {/* Category Badge */}
          <div className="mb-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${categoryColors[article.category]}`}>
              {categoryLabels[article.category][locale as keyof typeof categoryLabels.guide] || article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 max-w-4xl">
            {article.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden relative">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-medium">{article.author.name}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{publishDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime} {locale === 'vi' ? 'phút đọc' : locale === 'zh' ? '分钟阅读' : locale === 'id' ? 'menit membaca' : 'min read'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{article.viewCount.toLocaleString()}</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Article Content */}
      <Container className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Social Share Buttons */}
            <div className="mb-8 flex items-center gap-4 pb-6 border-b">
              <span className="text-sm font-semibold text-gray-600 uppercase">
                {locale === 'vi' ? 'Chia sẻ' : locale === 'zh' ? '分享' : locale === 'id' ? 'Bagikan' : 'Share'}:
              </span>
              <SocialShareButtons url={currentUrl} title={article.title} />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-ul:my-6 prose-li:mb-2 prose-strong:text-gray-900 prose-strong:font-semibold prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-yellow-500 prose-blockquote:bg-yellow-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-img:rounded-lg prose-img:shadow-lg">
              <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
            </div>

            {/* Calculator CTA (Mid-Article) */}
            {article.category === 'guide' && (
              <div className="my-12 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {locale === 'vi' ? '💡 Tính toán hệ thống phù hợp ngay!' : locale === 'zh' ? '💡 立即计算合适系统！' : locale === 'id' ? '💡 Hitung sistem yang cocok sekarang!' : '💡 Calculate your ideal system now!'}
                </h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  {locale === 'vi' 
                    ? 'Nhập hóa đơn điện và diện tích mái để nhận báo giá chi tiết, thời gian hoàn vốn và khuyến nghị tấm pin phù hợp.'
                    : locale === 'zh'
                    ? '输入电费账单和屋顶面积，获取详细报价、回本期和合适的太阳能板推荐。'
                    : locale === 'id'
                    ? 'Masukkan tagihan listrik dan luas atap untuk mendapatkan penawaran detail, periode balik modal, dan rekomendasi panel surya.'
                    : 'Enter your electricity bill and roof area to get detailed quotes, payback period, and suitable panel recommendations.'
                  }
                </p>
                <Link 
                  href={`/${locale}/tinh-toan`}
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-colors"
                >
                  {locale === 'vi' ? 'Tính toán ngay →' : locale === 'zh' ? '立即计算 →' : locale === 'id' ? 'Hitung sekarang →' : 'Calculate Now →'}
                </Link>
              </div>
            )}

            {/* Tags */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-gray-600 mr-2">
                  {locale === 'vi' ? 'Từ khóa:' : locale === 'zh' ? '标签:' : locale === 'id' ? 'Tag:' : 'Tags:'}
                </span>
                {article.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/${locale}/bai-viet?tag=${encodeURIComponent(tag)}`}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Author Bio Card */}
            <div className="mt-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full overflow-hidden relative border-4 border-white shadow-lg">
                    <Image
                      src={article.author.avatar}
                      alt={article.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'vi' ? 'Về tác giả' : locale === 'zh' ? '关于作者' : locale === 'id' ? 'Tentang penulis' : 'About the author'}
                  </h3>
                  <p className="text-lg font-semibold text-gray-800 mb-3">{article.author.name}</p>
                  <p className="text-gray-700 leading-relaxed mb-4">{article.author.bio}</p>
                  <div className="flex gap-3">
                    {article.author.social?.facebook && (
                      <a
                        href={article.author.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors"
                        aria-label="Facebook"
                      >
                        <Facebook className="w-5 h-5" />
                      </a>
                    )}
                    {article.author.social?.linkedin && (
                      <a
                        href={article.author.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-blue-700 hover:bg-blue-800 flex items-center justify-center text-white transition-colors"
                        aria-label="LinkedIn"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">
                {locale === 'vi' ? 'Cần tư vấn chi tiết?' : locale === 'zh' ? '需要详细咨询？' : locale === 'id' ? 'Butuh konsultasi detail?' : 'Need detailed consultation?'}
              </h3>
              <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                {locale === 'vi'
                  ? 'Đội ngũ chuyên gia Golden Energy sẵn sàng hỗ trợ bạn 24/7. Khảo sát miễn phí, báo giá trong 24h.'
                  : locale === 'zh'
                  ? 'Golden Energy专家团队24/7随时支持您。免费勘察，24小时内报价。'
                  : locale === 'id'
                  ? 'Tim ahli Golden Energy siap membantu Anda 24/7. Survey gratis, penawaran dalam 24 jam.'
                  : 'Golden Energy expert team is ready to support you 24/7. Free survey, quote within 24 hours.'
                }
              </p>
              <Link
                href={`/${locale}/lien-he`}
                className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {locale === 'vi' ? 'Liên hệ ngay →' : locale === 'zh' ? '立即联系 →' : locale === 'id' ? 'Hubungi sekarang →' : 'Contact Now →'}
              </Link>
            </div>

            {/* Comments Placeholder */}
            <div className="mt-12 pt-12 border-t">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {locale === 'vi' ? 'Bình luận (Coming Soon)' : locale === 'zh' ? '评论（即将推出）' : locale === 'id' ? 'Komentar (Segera Hadir)' : 'Comments (Coming Soon)'}
              </h3>
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-600">
                <p>
                  {locale === 'vi'
                    ? 'Tính năng bình luận đang được phát triển. Vui lòng liên hệ qua email hoặc hotline để trao đổi.'
                    : locale === 'zh'
                    ? '评论功能正在开发中。请通过电子邮件或热线联系讨论。'
                    : locale === 'id'
                    ? 'Fitur komentar sedang dikembangkan. Silakan hubungi via email atau hotline untuk diskusi.'
                    : 'Comment feature is under development. Please contact via email or hotline for discussion.'
                  }
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-8">
              {/* Table of Contents */}
              <TableOfContents content={article.content} locale={locale} />

              {/* Related Articles */}
              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {locale === 'vi' ? 'Bài viết liên quan' : locale === 'zh' ? '相关文章' : locale === 'id' ? 'Artikel terkait' : 'Related Articles'}
                  </h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.slug}
                        href={`/${locale}/bai-viet/${related.slug}`}
                        className="block group"
                      >
                        <div className="relative h-32 rounded-lg overflow-hidden mb-2">
                          <Image
                            src={related.heroImage}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        </div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                          {related.title}
                        </h4>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {related.readTime} {locale === 'vi' ? 'phút' : locale === 'zh' ? '分钟' : locale === 'id' ? 'menit' : 'min'}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter CTA */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-gray-900">
                <h3 className="text-xl font-bold mb-3">
                  {locale === 'vi' ? '📬 Nhận bài viết mới' : locale === 'zh' ? '📬 接收新文章' : locale === 'id' ? '📬 Terima artikel baru' : '📬 Get new articles'}
                </h3>
                <p className="text-gray-800 mb-4 text-sm">
                  {locale === 'vi'
                    ? 'Đăng ký nhận bài viết mới nhất về năng lượng mặt trời qua email.'
                    : locale === 'zh'
                    ? '订阅以通过电子邮件接收有关太阳能的最新文章。'
                    : locale === 'id'
                    ? 'Berlangganan untuk menerima artikel terbaru tentang energi surya via email.'
                    : 'Subscribe to receive the latest articles about solar energy via email.'
                  }
                </p>
                <input
                  type="email"
                  placeholder={locale === 'vi' ? 'Email của bạn' : locale === 'zh' ? '您的电子邮件' : locale === 'id' ? 'Email Anda' : 'Your email'}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-600"
                />
                <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 rounded-lg transition-colors">
                  {locale === 'vi' ? 'Đăng ký' : locale === 'zh' ? '订阅' : locale === 'id' ? 'Berlangganan' : 'Subscribe'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { generateBreadcrumbSchema } from '@/lib/schema'

// Types
interface Article {
  id: string
  title: string
  excerpt: string
  category: 'guides' | 'news' | 'knowledge' | 'case-studies'
  author: string
  publishDate: string
  readTime: number // minutes
  image: string
  slug: string
  featured?: boolean
}

// Translations
const translations = {
  vi: {
    title: 'Kiến Thức Năng Lượng Mặt Trời',
    subtitle: 'Hướng dẫn chuyên sâu, tin tức cập nhật, và kiến thức thực tiễn về điện mặt trời',
    stats: {
      articles: '100+ bài viết',
      readers: '50,000+ độc giả',
      updates: 'Cập nhật hàng tuần'
    },
    categories: {
      all: 'Tất cả',
      guides: 'Hướng dẫn',
      news: 'Tin tức',
      knowledge: 'Kiến thức',
      'case-studies': 'Case Study'
    },
    featured: 'Nổi bật',
    readMore: 'Đọc ngay',
    loadMore: 'Xem thêm bài viết',
    newsletter: {
      title: 'Nhận bài viết mới qua email',
      subtitle: 'Đăng ký để không bỏ lỡ kiến thức hữu ích',
      placeholder: 'Email của bạn',
      button: 'Đăng ký'
    },
    cta: {
      calculator: 'Tính toán hệ thống',
      calculatorDesc: 'Ước tính chi phí & lợi nhuận'
    },
    readTime: 'phút đọc'
  },
  en: {
    title: 'Solar Energy Knowledge',
    subtitle: 'In-depth guides, latest news, and practical knowledge about solar energy',
    stats: {
      articles: '100+ articles',
      readers: '50,000+ readers',
      updates: 'Updated weekly'
    },
    categories: {
      all: 'All',
      guides: 'Guides',
      news: 'News',
      knowledge: 'Knowledge',
      'case-studies': 'Case Studies'
    },
    featured: 'Featured',
    readMore: 'Read now',
    loadMore: 'Load more articles',
    newsletter: {
      title: 'Get new articles via email',
      subtitle: 'Subscribe to stay updated with useful knowledge',
      placeholder: 'Your email',
      button: 'Subscribe'
    },
    cta: {
      calculator: 'Calculate System',
      calculatorDesc: 'Estimate costs & returns'
    },
    readTime: 'min read'
  },
  zh: {
    title: '太阳能知识库',
    subtitle: '深入指南、最新新闻和实用的太阳能知识',
    stats: {
      articles: '100+ 篇文章',
      readers: '50,000+ 读者',
      updates: '每周更新'
    },
    categories: {
      all: '全部',
      guides: '指南',
      news: '新闻',
      knowledge: '知识',
      'case-studies': '案例研究'
    },
    featured: '精选',
    readMore: '立即阅读',
    loadMore: '加载更多文章',
    newsletter: {
      title: '通过电子邮件接收新文章',
      subtitle: '订阅以获取有用的知识',
      placeholder: '您的邮箱',
      button: '订阅'
    },
    cta: {
      calculator: '计算系统',
      calculatorDesc: '估算成本与收益'
    },
    readTime: '分钟阅读'
  },
  id: {
    title: 'Pengetahuan Energi Surya',
    subtitle: 'Panduan mendalam, berita terbaru, dan pengetahuan praktis tentang energi surya',
    stats: {
      articles: '100+ artikel',
      readers: '50,000+ pembaca',
      updates: 'Diperbarui mingguan'
    },
    categories: {
      all: 'Semua',
      guides: 'Panduan',
      news: 'Berita',
      knowledge: 'Pengetahuan',
      'case-studies': 'Studi Kasus'
    },
    featured: 'Unggulan',
    readMore: 'Baca sekarang',
    loadMore: 'Muat lebih banyak artikel',
    newsletter: {
      title: 'Dapatkan artikel baru via email',
      subtitle: 'Berlangganan untuk tetap mendapat informasi bermanfaat',
      placeholder: 'Email Anda',
      button: 'Berlangganan'
    },
    cta: {
      calculator: 'Hitung Sistem',
      calculatorDesc: 'Estimasi biaya & keuntungan'
    },
    readTime: 'menit baca'
  }
} as const

// Mock Articles Data
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Hướng dẫn chọn tấm pin mặt trời phù hợp cho nhà bạn',
    excerpt: 'Tìm hiểu cách chọn loại tấm pin solar phù hợp với diện tích mái, ngân sách và nhu cầu điện năng của gia đình. So sánh các loại mono, poly, và PERC.',
    category: 'guides',
    author: 'Nguyễn Văn An',
    publishDate: '2026-01-15',
    readTime: 8,
    image: '/images/blog/solar-panel-selection.jpg',
    slug: 'huong-dan-chon-tam-pin-mat-troi',
    featured: true
  },
  {
    id: '2',
    title: 'Chính sách mới về điện mặt trời áp mái 2026',
    excerpt: 'EVN công bố cơ chế giá điện mới cho hệ thống solar áp mái. Phân tích ảnh hưởng đến lợi nhuận đầu tư và thời gian hoàn vốn.',
    category: 'news',
    author: 'Trần Thị Bình',
    publishDate: '2026-01-12',
    readTime: 6,
    image: '/images/blog/policy-2026.jpg',
    slug: 'chinh-sach-dien-mat-troi-2026'
  },
  {
    id: '3',
    title: 'Nguyên lý hoạt động của hệ thống điện mặt trời',
    excerpt: 'Hiểu cách tấm pin biến đổi ánh sáng mặt trời thành điện năng. Giải thích chi tiết về hiệu ứng quang điện, inverter, và lưu trữ năng lượng.',
    category: 'knowledge',
    author: 'Lê Minh Tuấn',
    publishDate: '2026-01-10',
    readTime: 10,
    image: '/images/blog/how-solar-works.jpg',
    slug: 'nguyen-ly-hoat-dong-dien-mat-troi'
  },
  {
    id: '4',
    title: 'Khách sạn Sunrise tiết kiệm 40% chi phí điện với solar',
    excerpt: 'Case study thực tế: Khách sạn 4 sao lắp đặt hệ thống 150kW, giảm 40% hóa đơn điện, hoàn vốn sau 4.5 năm. Phân tích ROI chi tiết.',
    category: 'case-studies',
    author: 'Phạm Thu Hà',
    publishDate: '2026-01-08',
    readTime: 12,
    image: '/images/blog/hotel-case-study.jpg',
    slug: 'case-study-khach-san-sunrise'
  },
  {
    id: '5',
    title: 'Bảo trì hệ thống solar: Checklist 6 tháng/lần',
    excerpt: 'Danh sách công việc bảo trì định kỳ để hệ thống solar hoạt động hiệu quả tối đa. Từ vệ sinh tấm pin đến kiểm tra inverter và cáp điện.',
    category: 'guides',
    author: 'Nguyễn Văn An',
    publishDate: '2026-01-05',
    readTime: 7,
    image: '/images/blog/maintenance-checklist.jpg',
    slug: 'bao-tri-he-thong-solar-checklist'
  },
  {
    id: '6',
    title: 'So sánh điện mặt trời hòa lưới vs độc lập',
    excerpt: 'Phân tích ưu nhược điểm của 2 loại hệ thống: On-grid kết nối lưới điện quốc gia vs Off-grid độc lập với pin lưu trữ. Nên chọn loại nào?',
    category: 'knowledge',
    author: 'Trần Thị Bình',
    publishDate: '2026-01-03',
    readTime: 9,
    image: '/images/blog/grid-vs-offgrid.jpg',
    slug: 'so-sanh-on-grid-off-grid'
  },
  {
    id: '7',
    title: 'Ưu đãi thuế cho dự án năng lượng tái tạo',
    excerpt: 'Chính phủ công bố gói ưu đãi thuế TNDN và VAT cho các dự án solar. Điều kiện áp dụng và hướng dẫn làm hồ sơ chi tiết.',
    category: 'news',
    author: 'Lê Minh Tuấn',
    publishDate: '2025-12-28',
    readTime: 5,
    image: '/images/blog/tax-incentives.jpg',
    slug: 'uu-dai-thue-nang-luong-tai-tao'
  },
  {
    id: '8',
    title: 'Nhà máy dệt may ABC giảm 35% chi phí vận hành',
    excerpt: 'Case study: Nhà máy 500kW solar + ESS, cắt giờ cao điểm, giảm demand charge. Phân tích kỹ thuật và tài chính chi tiết.',
    category: 'case-studies',
    author: 'Phạm Thu Hà',
    publishDate: '2025-12-25',
    readTime: 15,
    image: '/images/blog/factory-case-study.jpg',
    slug: 'case-study-nha-may-abc'
  },
  {
    id: '9',
    title: 'Lựa chọn inverter: String vs Micro vs Hybrid',
    excerpt: 'So sánh 3 loại inverter phổ biến. Inverter string cho dự án lớn, micro cho mái phức tạp, hybrid cho lưu trữ năng lượng.',
    category: 'guides',
    author: 'Nguyễn Văn An',
    publishDate: '2025-12-22',
    readTime: 11,
    image: '/images/blog/inverter-comparison.jpg',
    slug: 'lua-chon-inverter-string-micro-hybrid'
  },
  {
    id: '10',
    title: 'Công nghệ tấm pin mới: Hiệu suất đạt 24.5%',
    excerpt: 'Các nhà sản xuất hàng đầu ra mắt tấm pin công nghệ TOPCon và HJT với hiệu suất kỷ lục. Đánh giá ảnh hưởng đến thị trường Việt Nam.',
    category: 'knowledge',
    author: 'Lê Minh Tuấn',
    publishDate: '2025-12-20',
    readTime: 8,
    image: '/images/blog/new-panel-tech.jpg',
    slug: 'cong-nghe-tam-pin-moi-2026'
  }
]

// Category colors
const categoryColors = {
  guides: 'bg-blue-100 text-blue-800 border-blue-200',
  news: 'bg-green-100 text-green-800 border-green-200',
  knowledge: 'bg-purple-100 text-purple-800 border-purple-200',
  'case-studies': 'bg-orange-100 text-orange-800 border-orange-200'
} as const

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const locale = params.locale || 'vi'
  
  const metadataByLocale = {
    vi: {
      title: 'Bài Viết & Kiến Thức Điện Mặt Trời | Golden Energy',
      description: 'Hơn 100 bài viết hướng dẫn, tin tức, kiến thức về năng lượng mặt trời. Cập nhật mới nhất về công nghệ, chính sách, và case study thực tế.',
      keywords: 'bài viết năng lượng mặt trời, kiến thức solar, hướng dẫn lắp đặt, tin tức điện mặt trời, case study solar'
    },
    en: {
      title: 'Solar Energy Blog & Knowledge | Golden Energy',
      description: 'Over 100 articles with guides, news, and knowledge about solar energy. Latest updates on technology, policies, and real case studies.',
      keywords: 'solar energy articles, solar knowledge, installation guides, solar news, case studies'
    },
    zh: {
      title: '太阳能博客与知识库 | Golden Energy',
      description: '超过100篇指南、新闻和太阳能知识文章。技术、政策和实际案例研究的最新更新。',
      keywords: '太阳能文章, 太阳能知识, 安装指南, 太阳能新闻, 案例研究'
    },
    id: {
      title: 'Blog & Pengetahuan Energi Surya | Golden Energy',
      description: 'Lebih dari 100 artikel dengan panduan, berita, dan pengetahuan tentang energi surya. Update terbaru tentang teknologi, kebijakan, dan studi kasus nyata.',
      keywords: 'artikel energi surya, pengetahuan surya, panduan instalasi, berita surya, studi kasus'
    }
  }
  
  const meta = metadataByLocale[locale as keyof typeof metadataByLocale] || metadataByLocale.vi
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : locale === 'id' ? 'id_ID' : 'en_US',
      siteName: 'Golden Energy Vietnam'
    }
  }
}

export default function BlogHubPage({ params }: { params: { locale: string } }) {
  const locale = params.locale || 'vi'
  const t = translations[locale as keyof typeof translations] || translations.vi
  
  // Get featured article
  const featuredArticle = mockArticles.find(a => a.featured) || mockArticles[0]
  const otherArticles = mockArticles.filter(a => a.id !== featuredArticle.id)
  
  // Category counts
  const categoryCounts = mockArticles.reduce((acc, article) => {
    acc[article.category] = (acc[article.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  // Organization schema (entity linking)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://goldenenergy.com.vn/#organization',
    name: 'Golden Energy Vietnam',
    url: 'https://goldenenergy.com.vn'
  }
  
  // ItemList schema for articles
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: mockArticles.map((article, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Article',
        '@id': `https://goldenenergy.com.vn/${locale}/bai-viet/${article.slug}`,
        headline: article.title,
        description: article.excerpt,
        image: `https://goldenenergy.com.vn${article.image}`,
        datePublished: article.publishDate,
        author: {
          '@type': 'Person',
          name: article.author
        },
        publisher: {
          '@id': 'https://goldenenergy.com.vn/#organization'
        },
        articleSection: t.categories[article.category]
      }
    }))
  }
  
  const breadcrumbPath = `/${locale}/bai-viet`
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any)
  
  return (
    <>
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-gradient-to-b from-blue-50 via-white to-white py-16 sm:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t.subtitle}
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm sm:text-base font-semibold text-gray-700">{t.stats.articles}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm sm:text-base font-semibold text-gray-700">{t.stats.readers}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base font-semibold text-gray-700">{t.stats.updates}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      <Container className="py-12">
        {/* Featured Article */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">{t.featured}</span>
          </div>
          
          <Link 
            href={`/${locale}/bai-viet/${featuredArticle.slug}`}
            className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full">
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${categoryColors[featuredArticle.category]}`}>
                    {t.categories[featuredArticle.category]}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {featuredArticle.title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {featuredArticle.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>{featuredArticle.author}</span>
                  <div className="flex items-center gap-4">
                    <span>{new Date(featuredArticle.publishDate).toLocaleDateString(locale)}</span>
                    <span>•</span>
                    <span>{featuredArticle.readTime} {t.readTime}</span>
                  </div>
                </div>
                
                <div className="inline-flex items-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                  {t.readMore}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Categories Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
              {t.categories.all} ({mockArticles.length})
            </button>
            {Object.keys(categoryColors).map((category) => (
              <button
                key={category}
                className="px-4 py-2 rounded-full bg-white text-gray-700 font-medium border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
              >
                {t.categories[category as keyof typeof t.categories]} ({categoryCounts[category] || 0})
              </button>
            ))}
          </div>
        </div>
        
        {/* Articles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {otherArticles.slice(0, 9).map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/bai-viet/${article.slug}`}
              className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full border ${categoryColors[article.category]}`}>
                    {t.categories[article.category]}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium">{article.author}</span>
                  <span>{article.readTime} {t.readTime}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(article.publishDate).toLocaleDateString(locale)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Load More Button */}
        <div className="text-center mb-16">
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full border-2 border-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300">
            {t.loadMore}
          </button>
        </div>
        
        {/* Sidebar CTAs */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Newsletter Signup */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">
                {t.newsletter.title}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t.newsletter.subtitle}
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={t.newsletter.placeholder}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t.newsletter.button}
              </button>
            </form>
          </div>
          
          {/* Calculator CTA */}
          <Link
            href={`/${locale}/tinh-toan`}
            className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900">
                {t.cta.calculator}
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              {t.cta.calculatorDesc}
            </p>
            <div className="inline-flex items-center text-yellow-700 font-semibold group-hover:gap-2 transition-all">
              {t.readMore}
              <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        </div>
      </Container>
    </>
  )
}

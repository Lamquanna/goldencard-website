import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { generateBreadcrumbSchema } from '@/lib/schema'
import { client } from '@/sanity/lib/client'
import { productsQuery } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import { 
  Zap, 
  Battery, 
  Gauge, 
  MonitorSmartphone,
  CheckCircle2,
  Award,
  Shield,
  TrendingUp
} from 'lucide-react'

// ISR: Revalidate every 60 seconds
export const revalidate = 60

// Translation type
interface Translations {
  title: string
  description: string
  hero: {
    badge: string
    title: string
    subtitle: string
    stats: {
      categories: string
      skus: string
      uptime: string
      warranty: string
    }
  }
  categories: {
    panels: {
      title: string
      subtitle: string
      specs: string[]
      features: string[]
      brands: string
      cta: string
    }
    inverters: {
      title: string
      subtitle: string
      specs: string[]
      features: string[]
      brands: string
      cta: string
    }
    batteries: {
      title: string
      subtitle: string
      specs: string[]
      features: string[]
      brands: string
      cta: string
    }
    monitoring: {
      title: string
      subtitle: string
      specs: string[]
      features: string[]
      brands: string
      cta: string
    }
  }
  trust: {
    title: string
    badges: {
      dealer: string
      genuine: string
      warranty: string
      support: string
    }
  }
  cta: {
    title: string
    description: string
    button: string
  }
}

const translations: Record<string, Translations> = {
  vi: {
    title: 'Sản Phẩm - Golden Energy',
    description: 'Danh mục sản phẩm điện mặt trời chính hãng: Tấm pin, biến tần, pin lưu trữ, hệ thống giám sát. Bảo hành 25 năm, hiệu suất cao.',
    hero: {
      badge: 'Sản Phẩm Chính Hãng',
      title: 'Giải Pháp Năng Lượng Mặt Trời Toàn Diện',
      subtitle: 'Thiết bị cao cấp từ các thương hiệu hàng đầu thế giới, được chứng nhận quốc tế',
      stats: {
        categories: 'Danh Mục',
        skus: 'Sản Phẩm',
        uptime: 'Độ Tin Cậy',
        warranty: 'Bảo Hành'
      }
    },
    categories: {
      panels: {
        title: 'Tấm Pin Mặt Trời',
        subtitle: 'Công nghệ Mono PERC hiệu suất cao',
        specs: [
          'Công suất: 450-550W',
          'Hiệu suất: >21%',
          'Bảo hành: 25 năm',
          'Ứng dụng: Hộ gia đình, Thương mại, Công nghiệp'
        ],
        features: [
          'Công nghệ Mono PERC thế hệ mới',
          'Chịu tải gió 2400Pa, tuyết 5400Pa',
          'Độ suy giảm <2% năm đầu',
          'Chứng nhận IEC, CE, TÜV'
        ],
        brands: 'Thương hiệu: JA Solar, Longi, Canadian Solar, Trina Solar',
        cta: 'Xem Chi Tiết'
      },
      inverters: {
        title: 'Biến Tần (Inverter)',
        subtitle: 'Chuyển đổi DC sang AC hiệu suất cao',
        specs: [
          'Dải công suất: 3-110kW',
          'Hiệu suất: >98%',
          'Bảo hành: 10 năm',
          'Loại: String, Hybrid, Micro'
        ],
        features: [
          'Hybrid inverter hỗ trợ pin lưu trữ',
          'MPPT đa điểm cho hiệu suất tối đa',
          'Giám sát thời gian thực qua WiFi/4G',
          'Bảo vệ quá tải, ngắn mạch, nhiệt độ'
        ],
        brands: 'Thương hiệu: Growatt, SMA, Huawei, SolarEdge, Fronius',
        cta: 'Xem Chi Tiết'
      },
      batteries: {
        title: 'Pin Lưu Trữ Năng Lượng',
        subtitle: 'Giải pháp lưu trữ LiFePO4 bền vững',
        specs: [
          'Dung lượng: 5-15kWh',
          'Chu kỳ sạc: 6000+ cycles',
          'Bảo hành: 10 năm',
          'Độ sâu xả: 90% DoD'
        ],
        features: [
          'Công nghệ LiFePO4 an toàn cao',
          'Mở rộng dễ dàng (modular design)',
          'BMS thông minh tự động cân bằng',
          'Tương thích đa dạng inverter'
        ],
        brands: 'Thương hiệu: Pylontech, BYD, Tesla Powerwall, LG Chem',
        cta: 'Xem Chi Tiết'
      },
      monitoring: {
        title: 'Hệ Thống Giám Sát',
        subtitle: 'Theo dõi và tối ưu hóa năng suất',
        specs: [
          'Giám sát thời gian thực',
          'Ứng dụng di động iOS/Android',
          'Nền tảng đám mây',
          'API tích hợp'
        ],
        features: [
          'Dashboard trực quan với biểu đồ',
          'Cảnh báo sự cố qua email/SMS',
          'Phân tích hiệu suất AI',
          'Báo cáo tự động hàng tháng'
        ],
        brands: 'Nền tảng: SolarEdge, Growatt, SMA, Huawei FusionSolar',
        cta: 'Xem Chi Tiết'
      }
    },
    trust: {
      title: 'Cam Kết Chất Lượng',
      badges: {
        dealer: 'Đại Lý Chính Thức',
        genuine: 'Hàng Chính Hãng 100%',
        warranty: 'Bảo Hành Toàn Diện',
        support: 'Hỗ Trợ 24/7'
      }
    },
    cta: {
      title: 'Cần Tư Vấn Lựa Chọn Sản Phẩm?',
      description: 'Đội ngũ kỹ sư của chúng tôi sẽ giúp bạn chọn thiết bị phù hợp nhất',
      button: 'Liên Hệ Tư Vấn'
    }
  },
  en: {
    title: 'Products - Golden Energy',
    description: 'Genuine solar energy products: Solar panels, inverters, battery storage, monitoring systems. 25-year warranty, high efficiency.',
    hero: {
      badge: 'Certified Products',
      title: 'Comprehensive Solar Energy Solutions',
      subtitle: 'Premium equipment from world-leading brands with international certifications',
      stats: {
        categories: 'Categories',
        skus: 'Products',
        uptime: 'Reliability',
        warranty: 'Warranty'
      }
    },
    categories: {
      panels: {
        title: 'Solar Panels',
        subtitle: 'High-efficiency Mono PERC technology',
        specs: [
          'Power: 450-550W',
          'Efficiency: >21%',
          'Warranty: 25 years',
          'Applications: Residential, Commercial, Industrial'
        ],
        features: [
          'Next-gen Mono PERC technology',
          'Wind load 2400Pa, snow 5400Pa',
          'Degradation <2% first year',
          'IEC, CE, TÜV certified'
        ],
        brands: 'Brands: JA Solar, Longi, Canadian Solar, Trina Solar',
        cta: 'View Details'
      },
      inverters: {
        title: 'Inverters',
        subtitle: 'High-efficiency DC to AC conversion',
        specs: [
          'Power range: 3-110kW',
          'Efficiency: >98%',
          'Warranty: 10 years',
          'Types: String, Hybrid, Micro'
        ],
        features: [
          'Hybrid inverter with battery support',
          'Multi-point MPPT for max efficiency',
          'Real-time monitoring via WiFi/4G',
          'Overload, short circuit, thermal protection'
        ],
        brands: 'Brands: Growatt, SMA, Huawei, SolarEdge, Fronius',
        cta: 'View Details'
      },
      batteries: {
        title: 'Battery Storage',
        subtitle: 'Sustainable LiFePO4 storage solutions',
        specs: [
          'Capacity: 5-15kWh',
          'Cycles: 6000+ cycles',
          'Warranty: 10 years',
          'DoD: 90% depth of discharge'
        ],
        features: [
          'Safe LiFePO4 technology',
          'Easy expansion (modular design)',
          'Smart BMS auto-balancing',
          'Compatible with various inverters'
        ],
        brands: 'Brands: Pylontech, BYD, Tesla Powerwall, LG Chem',
        cta: 'View Details'
      },
      monitoring: {
        title: 'Monitoring Systems',
        subtitle: 'Track and optimize performance',
        specs: [
          'Real-time monitoring',
          'Mobile app iOS/Android',
          'Cloud platform',
          'API integration'
        ],
        features: [
          'Intuitive dashboard with charts',
          'Email/SMS fault alerts',
          'AI performance analysis',
          'Automated monthly reports'
        ],
        brands: 'Platforms: SolarEdge, Growatt, SMA, Huawei FusionSolar',
        cta: 'View Details'
      }
    },
    trust: {
      title: 'Quality Commitment',
      badges: {
        dealer: 'Authorized Dealer',
        genuine: '100% Genuine Products',
        warranty: 'Comprehensive Warranty',
        support: '24/7 Support'
      }
    },
    cta: {
      title: 'Need Product Consultation?',
      description: 'Our engineers will help you choose the most suitable equipment',
      button: 'Contact Us'
    }
  },
  zh: {
    title: '产品 - Golden Energy',
    description: '正品太阳能产品：太阳能板、逆变器、储能电池、监控系统。25年保修，高效率。',
    hero: {
      badge: '认证产品',
      title: '全面的太阳能解决方案',
      subtitle: '来自世界领先品牌的优质设备，具有国际认证',
      stats: {
        categories: '类别',
        skus: '产品',
        uptime: '可靠性',
        warranty: '保修'
      }
    },
    categories: {
      panels: {
        title: '太阳能板',
        subtitle: '高效单晶PERC技术',
        specs: [
          '功率：450-550W',
          '效率：>21%',
          '保修：25年',
          '应用：住宅、商业、工业'
        ],
        features: [
          '新一代单晶PERC技术',
          '抗风载荷2400Pa，雪载5400Pa',
          '首年衰减<2%',
          'IEC、CE、TÜV认证'
        ],
        brands: '品牌：晶澳、隆基、阿特斯、天合光能',
        cta: '查看详情'
      },
      inverters: {
        title: '逆变器',
        subtitle: '高效DC到AC转换',
        specs: [
          '功率范围：3-110kW',
          '效率：>98%',
          '保修：10年',
          '类型：组串式、混合式、微型'
        ],
        features: [
          '混合逆变器支持电池',
          '多点MPPT最大效率',
          '通过WiFi/4G实时监控',
          '过载、短路、热保护'
        ],
        brands: '品牌：古瑞瓦特、SMA、华为、SolarEdge、Fronius',
        cta: '查看详情'
      },
      batteries: {
        title: '储能电池',
        subtitle: '可持续磷酸铁锂储能方案',
        specs: [
          '容量：5-15kWh',
          '循环：6000+次',
          '保修：10年',
          '放电深度：90% DoD'
        ],
        features: [
          '安全的磷酸铁锂技术',
          '易于扩展（模块化设计）',
          '智能BMS自动平衡',
          '兼容多种逆变器'
        ],
        brands: '品牌：派能、比亚迪、特斯拉Powerwall、LG化学',
        cta: '查看详情'
      },
      monitoring: {
        title: '监控系统',
        subtitle: '跟踪和优化性能',
        specs: [
          '实时监控',
          'iOS/Android移动应用',
          '云平台',
          'API集成'
        ],
        features: [
          '直观的仪表板和图表',
          '电子邮件/短信故障警报',
          'AI性能分析',
          '自动月度报告'
        ],
        brands: '平台：SolarEdge、古瑞瓦特、SMA、华为FusionSolar',
        cta: '查看详情'
      }
    },
    trust: {
      title: '质量承诺',
      badges: {
        dealer: '授权经销商',
        genuine: '100%正品',
        warranty: '全面保修',
        support: '24/7支持'
      }
    },
    cta: {
      title: '需要产品咨询？',
      description: '我们的工程师将帮助您选择最合适的设备',
      button: '联系我们'
    }
  }
}

interface ProductCategory {
  id: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgGradient: string
  priceRange: { min: number; max: number; currency: string }
}

const productCategories: Record<string, ProductCategory> = {
  panels: {
    id: 'solar-panels',
    icon: Zap,
    color: 'text-yellow-600',
    bgGradient: 'from-yellow-50 to-orange-50',
    priceRange: { min: 2_500_000, max: 8_000_000, currency: 'VND' }
  },
  inverters: {
    id: 'inverters',
    icon: Gauge,
    color: 'text-blue-600',
    bgGradient: 'from-blue-50 to-cyan-50',
    priceRange: { min: 15_000_000, max: 150_000_000, currency: 'VND' }
  },
  batteries: {
    id: 'battery-storage',
    icon: Battery,
    color: 'text-green-600',
    bgGradient: 'from-green-50 to-emerald-50',
    priceRange: { min: 30_000_000, max: 80_000_000, currency: 'VND' }
  },
  monitoring: {
    id: 'monitoring-systems',
    icon: MonitorSmartphone,
    color: 'text-purple-600',
    bgGradient: 'from-purple-50 to-pink-50',
    priceRange: { min: 5_000_000, max: 20_000_000, currency: 'VND' }
  }
}

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const { locale } = params
  const t = translations[locale] || translations.vi
  const baseUrl = 'https://goldenenergy.com.vn'

  return {
    title: t.title,
    description: t.description,
    keywords: locale === 'vi' 
      ? 'tấm pin mặt trời, biến tần, pin lưu trữ, hệ thống giám sát, solar panel, inverter, battery storage'
      : locale === 'zh'
      ? '太阳能板, 逆变器, 储能电池, 监控系统'
      : 'solar panels, inverters, battery storage, monitoring systems',
    openGraph: {
      title: t.title,
      description: t.description,
      url: `${baseUrl}/${locale}/san-pham`,
      siteName: 'Golden Energy Vietnam',
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/og-products.jpg`,
          width: 1200,
          height: 630,
          alt: t.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: t.title,
      description: t.description,
      images: [`${baseUrl}/og-products.jpg`]
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/san-pham`,
      languages: {
        'vi-VN': `${baseUrl}/vi/san-pham`,
        'en': `${baseUrl}/en/san-pham`,
        'zh-CN': `${baseUrl}/zh/san-pham`,
        'x-default': `${baseUrl}/vi/san-pham`
      }
    }
  }
}

export default function ProductsPage({
  params
}: {
  params: { locale: string }
}) {
  const { locale } = params
  const t = translations[locale] || translations.vi

  // Generate Schema.org JSON-LD
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://goldenenergy.com.vn/#organization',
    name: 'Golden Energy Vietnam',
    url: 'https://goldenenergy.com.vn'
  }

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'vi' ? 'Sản phẩm điện mặt trời' : locale === 'zh' ? '太阳能产品' : 'Solar Products',
    description: t.description,
    numberOfItems: 4,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'ProductGroup',
          '@id': 'https://goldenenergy.com.vn/san-pham/tam-pin',
          name: t.categories.panels.title,
          description: t.categories.panels.subtitle,
          hasVariant: [
            { '@type': 'Product', name: 'JA Solar 450W' },
            { '@type': 'Product', name: 'Longi 550W' }
          ],
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'VND',
            lowPrice: productCategories.panels.priceRange.min,
            highPrice: productCategories.panels.priceRange.max,
            offerCount: 15
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'ProductGroup',
          '@id': 'https://goldenenergy.com.vn/san-pham/bien-tan',
          name: t.categories.inverters.title,
          description: t.categories.inverters.subtitle,
          hasVariant: [
            { '@type': 'Product', name: 'Growatt 5kW' },
            { '@type': 'Product', name: 'Huawei 10kW' }
          ],
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'VND',
            lowPrice: productCategories.inverters.priceRange.min,
            highPrice: productCategories.inverters.priceRange.max,
            offerCount: 20
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'ProductGroup',
          '@id': 'https://goldenenergy.com.vn/san-pham/pin-luu-tru',
          name: t.categories.batteries.title,
          description: t.categories.batteries.subtitle,
          hasVariant: [
            { '@type': 'Product', name: 'Pylontech 5kWh' },
            { '@type': 'Product', name: 'BYD 10kWh' }
          ],
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'VND',
            lowPrice: productCategories.batteries.priceRange.min,
            highPrice: productCategories.batteries.priceRange.max,
            offerCount: 10
          }
        }
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'ProductGroup',
          '@id': 'https://goldenenergy.com.vn/san-pham/giam-sat',
          name: t.categories.monitoring.title,
          description: t.categories.monitoring.subtitle,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'VND',
            lowPrice: productCategories.monitoring.priceRange.min,
            highPrice: productCategories.monitoring.priceRange.max,
            offerCount: 8
          }
        }
      }
    ]
  }

  const breadcrumbPath = `/${locale}/san-pham`
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any)

  return (
    <>
      {/* Schema Markup */}
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />
        <Container className="relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-300">{t.hero.badge}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {t.hero.title}
            </h1>
            
            <p className="text-lg md:text-xl text-gray-300 mb-12">
              {t.hero.subtitle}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">4</div>
                <div className="text-sm text-gray-400">{t.hero.stats.categories}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">50+</div>
                <div className="text-sm text-gray-400">{t.hero.stats.skus}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">99%</div>
                <div className="text-sm text-gray-400">{t.hero.stats.uptime}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">25</div>
                <div className="text-sm text-gray-400">{t.hero.stats.warranty}</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-white">
        <Container>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Solar Panels */}
            <ProductCard
              category="panels"
              icon={productCategories.panels.icon}
              color={productCategories.panels.color}
              bgGradient={productCategories.panels.bgGradient}
              title={t.categories.panels.title}
              subtitle={t.categories.panels.subtitle}
              specs={t.categories.panels.specs}
              features={t.categories.panels.features}
              brands={t.categories.panels.brands}
              cta={t.categories.panels.cta}
              locale={locale}
            />

            {/* Inverters */}
            <ProductCard
              category="inverters"
              icon={productCategories.inverters.icon}
              color={productCategories.inverters.color}
              bgGradient={productCategories.inverters.bgGradient}
              title={t.categories.inverters.title}
              subtitle={t.categories.inverters.subtitle}
              specs={t.categories.inverters.specs}
              features={t.categories.inverters.features}
              brands={t.categories.inverters.brands}
              cta={t.categories.inverters.cta}
              locale={locale}
            />

            {/* Battery Storage */}
            <ProductCard
              category="batteries"
              icon={productCategories.batteries.icon}
              color={productCategories.batteries.color}
              bgGradient={productCategories.batteries.bgGradient}
              title={t.categories.batteries.title}
              subtitle={t.categories.batteries.subtitle}
              specs={t.categories.batteries.specs}
              features={t.categories.batteries.features}
              brands={t.categories.batteries.brands}
              cta={t.categories.batteries.cta}
              locale={locale}
            />

            {/* Monitoring Systems */}
            <ProductCard
              category="monitoring"
              icon={productCategories.monitoring.icon}
              color={productCategories.monitoring.color}
              bgGradient={productCategories.monitoring.bgGradient}
              title={t.categories.monitoring.title}
              subtitle={t.categories.monitoring.subtitle}
              specs={t.categories.monitoring.specs}
              features={t.categories.monitoring.features}
              brands={t.categories.monitoring.brands}
              cta={t.categories.monitoring.cta}
              locale={locale}
            />
          </div>
        </Container>
      </section>

      {/* Trust Badges */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {t.trust.title}
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            <TrustBadge
              icon={Award}
              title={t.trust.badges.dealer}
              color="text-blue-600"
            />
            <TrustBadge
              icon={CheckCircle2}
              title={t.trust.badges.genuine}
              color="text-green-600"
            />
            <TrustBadge
              icon={Shield}
              title={t.trust.badges.warranty}
              color="text-purple-600"
            />
            <TrustBadge
              icon={TrendingUp}
              title={t.trust.badges.support}
              color="text-yellow-600"
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t.cta.title}
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              {t.cta.description}
            </p>
            <Link
              href={`/${locale}/lien-he`}
              className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              {t.cta.button}
              <TrendingUp className="w-5 h-5" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  )
}

// Product Card Component
interface ProductCardProps {
  category: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgGradient: string
  title: string
  subtitle: string
  specs: string[]
  features: string[]
  brands: string
  cta: string
  locale: string
}

function ProductCard({
  category,
  icon: Icon,
  color,
  bgGradient,
  title,
  subtitle,
  specs,
  features,
  brands,
  cta,
  locale
}: ProductCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative p-8">
        {/* Icon */}
        <div className={`inline-flex p-4 rounded-xl bg-white shadow-md mb-6 ${color}`}>
          <Icon className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {subtitle}
        </p>

        {/* Specs */}
        <div className="space-y-2 mb-6">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            {locale === 'vi' ? 'Thông Số' : locale === 'zh' ? '规格' : 'Specifications'}
          </h4>
          {specs.map((spec, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{spec}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="space-y-2 mb-6">
          <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
            {locale === 'vi' ? 'Tính Năng' : locale === 'zh' ? '特点' : 'Features'}
          </h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${color.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
              <span className="text-sm text-gray-600">{feature}</span>
            </div>
          ))}
        </div>

        {/* Brands */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500">{brands}</p>
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/san-pham/${category}`}
          className={`inline-flex items-center justify-center w-full gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${color.replace('text-', 'bg-').replace('600', '100')} ${color} hover:${color.replace('600', '200')} group-hover:shadow-md`}
        >
          {cta}
          <TrendingUp className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

// Trust Badge Component
interface TrustBadgeProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  color: string
}

function TrustBadge({ icon: Icon, title, color }: TrustBadgeProps) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className={`inline-flex p-4 rounded-full ${color.replace('text-', 'bg-').replace('600', '100')} mb-4`}>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
      <h3 className="font-semibold text-gray-900">
        {title}
      </h3>
    </div>
  )
}

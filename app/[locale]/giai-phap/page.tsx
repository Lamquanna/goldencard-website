/**
 * Solutions Hub Page - Pillar Content
 * Semantic URL: /[locale]/giai-phap/
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { generateOrganizationSchema, generateBreadcrumbSchema, combineSchemas } from '@/lib/schema';
import { Container } from '@/components/Container';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  
  const titles = {
    vi: 'Giải Pháp Điện Mặt Trời | Golden Energy Vietnam',
    en: 'Solar Energy Solutions | Golden Energy Vietnam',
    zh: '太阳能解决方案 | Golden Energy Vietnam',
  };
  
  const descriptions = {
    vi: 'Giải pháp điện mặt trời toàn diện cho hộ gia đình, thương mại và công nghiệp. Tư vấn miễn phí, lắp đặt chuyên nghiệp, bảo hành 25 năm.',
    en: 'Comprehensive solar energy solutions for residential, commercial, and industrial sectors. Free consultation, professional installation, 25-year warranty.',
    zh: '为住宅、商业和工业领域提供全面的太阳能解决方案。免费咨询、专业安装、25年保修。',
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.vi,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
    alternates: {
      canonical: `https://goldenenergy.com.vn/${locale}/giai-phap`,
      languages: {
        'vi': '/vi/giai-phap',
        'en': '/en/giai-phap',
        'zh': '/zh/giai-phap',
      },
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.vi,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
      url: `https://goldenenergy.com.vn/${locale}/giai-phap`,
      siteName: 'Golden Energy Vietnam',
      images: [
        {
          url: '/images/solutions-hero.jpg',
          width: 1200,
          height: 630,
          alt: 'Golden Energy Solar Solutions',
        },
      ],
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
      type: 'website',
    },
  };
}

export default function SolutionsPage({ params }: PageProps) {
  const { locale } = params;
  
  // Generate Schema.org markup
  const organizationSchema = generateOrganizationSchema({ locale: locale as any });
  const breadcrumbSchema = generateBreadcrumbSchema(`/${locale}/giai-phap`, locale as any);
  const combinedSchema = combineSchemas(organizationSchema, breadcrumbSchema);
  
  const content = {
    vi: {
      hero: {
        title: 'Giải Pháp Điện Mặt Trời',
        subtitle: 'Năng lượng sạch, tiết kiệm, bền vững cho mọi nhu cầu',
        description: 'Từ hộ gia đình đến nhà máy công nghiệp, chúng tôi cung cấp giải pháp điện mặt trời toàn diện với công nghệ tiên tiến nhất.',
      },
      solutions: [
        {
          slug: 'dien-mat-troi-ho-gia-dinh',
          title: 'Điện Mặt Trời Hộ Gia Đình',
          icon: '🏠',
          capacity: '6-18 kW',
          description: 'Giải pháp tiết kiệm điện cho ngôi nhà của bạn. Tiết kiệm 70-80% hóa đơn, hoàn vốn trong 5-6 năm.',
          features: [
            'Tiết kiệm hóa đơn điện',
            'Tăng giá trị bất động sản',
            'Bảo vệ môi trường',
            'Nguồn điện dự phòng',
          ],
          idealFor: 'Nhà ở, biệt thự, nhà phố',
        },
        {
          slug: 'dien-mat-troi-thuong-mai',
          title: 'Điện Mặt Trời Thương Mại',
          icon: '🏢',
          capacity: '10-100 kW',
          description: 'Tối ưu chi phí vận hành cho doanh nghiệp. ROI hấp dẫn, giảm thiểu rủi ro tăng giá điện.',
          features: [
            'Giảm chi phí vận hành',
            'Hình ảnh thương hiệu xanh',
            'Ổn định giá điện',
            'Ưu đãi thuế',
          ],
          idealFor: 'Văn phòng, khách sạn, trung tâm thương mại',
        },
        {
          slug: 'dien-mat-troi-cong-nghiep',
          title: 'Điện Mặt Trời Công Nghiệp',
          icon: '🏭',
          capacity: '100+ kW',
          description: 'Giải pháp quy mô lớn cho nhà máy, khu công nghiệp. Tự sản xuất điện, giảm phụ thuộc lưới điện.',
          features: [
            'Tiết kiệm hàng tỷ đồng/năm',
            'Tự chủ năng lượng',
            'Chứng nhận xanh',
            'Tối ưu diện tích mái',
          ],
          idealFor: 'Nhà máy, khu công nghiệp, kho xưởng',
        },
      ],
      cta: {
        title: 'Tìm giải pháp phù hợp cho bạn',
        button: 'Tính toán ngay',
      },
    },
    en: {
      hero: {
        title: 'Solar Energy Solutions',
        subtitle: 'Clean, cost-effective, and sustainable energy for every need',
        description: 'From homes to industrial facilities, we provide comprehensive solar solutions with cutting-edge technology.',
      },
      solutions: [
        {
          slug: 'dien-mat-troi-ho-gia-dinh',
          title: 'Residential Solar Systems',
          icon: '🏠',
          capacity: '3-10 kW',
          description: 'Energy-saving solution for your home. Reduce electricity bills by up to 80%, payback in 5-7 years.',
          features: [
            'Lower electricity bills',
            'Increase property value',
            'Environmental protection',
            'Backup power source',
          ],
          idealFor: 'Houses, villas, townhouses',
        },
        {
          slug: 'dien-mat-troi-thuong-mai',
          title: 'Commercial Solar Systems',
          icon: '🏢',
          capacity: '10-100 kW',
          description: 'Optimize operating costs for businesses. Attractive ROI, minimize risk of electricity price increases.',
          features: [
            'Reduce operating costs',
            'Green brand image',
            'Stable electricity prices',
            'Tax incentives',
          ],
          idealFor: 'Offices, hotels, shopping centers',
        },
        {
          slug: 'dien-mat-troi-cong-nghiep',
          title: 'Industrial Solar Systems',
          icon: '🏭',
          capacity: '100+ kW',
          description: 'Large-scale solution for factories and industrial parks. Self-generate electricity, reduce grid dependence.',
          features: [
            'Save billions VND/year',
            'Energy independence',
            'Green certification',
            'Optimize roof space',
          ],
          idealFor: 'Factories, industrial parks, warehouses',
        },
      ],
      cta: {
        title: 'Find the right solution for you',
        button: 'Calculate now',
      },
    },
    zh: {
      hero: {
        title: '太阳能解决方案',
        subtitle: '为各种需求提供清洁、经济、可持续的能源',
        description: '从家庭到工业设施，我们提供采用最先进技术的全面太阳能解决方案。',
      },
      solutions: [
        {
          slug: 'dien-mat-troi-ho-gia-dinh',
          title: '住宅太阳能系统',
          icon: '🏠',
          capacity: '3-10 kW',
          description: '为您的家庭节能解决方案。电费降低高达80%，5-7年回本。',
          features: [
            '降低电费',
            '增加房产价值',
            '环境保护',
            '备用电源',
          ],
          idealFor: '住宅、别墅、联排别墅',
        },
        {
          slug: 'dien-mat-troi-thuong-mai',
          title: '商业太阳能系统',
          icon: '🏢',
          capacity: '10-100 kW',
          description: '优化企业运营成本。有吸引力的投资回报率，最小化电价上涨风险。',
          features: [
            '降低运营成本',
            '绿色品牌形象',
            '稳定电价',
            '税收优惠',
          ],
          idealFor: '办公室、酒店、购物中心',
        },
        {
          slug: 'dien-mat-troi-cong-nghiep',
          title: '工业太阳能系统',
          icon: '🏭',
          capacity: '100+ kW',
          description: '工厂和工业园区的大规模解决方案。自发电，减少对电网的依赖。',
          features: [
            '每年节省数十亿越南盾',
            '能源独立',
            '绿色认证',
            '优化屋顶空间',
          ],
          idealFor: '工厂、工业园区、仓库',
        },
      ],
      cta: {
        title: '找到适合您的解决方案',
        button: '立即计算',
      },
    },
  };
  
  const t = content[locale as keyof typeof content] || content.vi;
  
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <Container>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                {t.hero.title}
              </h1>
              <p className="text-2xl text-blue-600 mb-4">
                {t.hero.subtitle}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t.hero.description}
              </p>
            </div>
          </Container>
        </section>
        
        {/* Solutions Grid */}
        <section className="py-16">
          <Container>
            <div className="grid md:grid-cols-3 gap-8">
              {t.solutions.map((solution) => (
                <Link
                  key={solution.slug}
                  href={`/${locale}/giai-phap/${solution.slug}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8">
                    <div className="text-6xl mb-4">{solution.icon}</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {solution.title}
                    </h2>
                    <div className="text-sm text-blue-600 font-semibold mb-4">
                      {solution.capacity}
                    </div>
                    <p className="text-gray-600 mb-6">
                      {solution.description}
                    </p>
                    
                    <div className="space-y-2 mb-6">
                      {solution.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm text-gray-700">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-sm text-gray-500 border-t pt-4">
                      <strong>{locale === 'vi' ? 'Phù hợp cho:' : locale === 'zh' ? '适用于:' : 'Ideal for:'}</strong>
                      <br />
                      {solution.idealFor}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 px-8 py-4 group-hover:bg-blue-600 transition-colors">
                    <div className="flex items-center justify-between text-blue-600 group-hover:text-white font-semibold">
                      <span>{locale === 'vi' ? 'Tìm hiểu thêm' : locale === 'zh' ? '了解更多' : 'Learn more'}</span>
                      <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
          <Container>
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-6">
                {t.cta.title}
              </h2>
              <Link
                href={`/${locale}/tinh-toan`}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-xl"
              >
                {t.cta.button}
              </Link>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

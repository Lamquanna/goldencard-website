/**
 * Residential Solar Solution Page
 * Semantic URL: /[locale]/giai-phap/dien-mat-troi-ho-gia-dinh/
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { 
  generateOrganizationSchema, 
  generateProductSchema, 
  generateBreadcrumbSchema,
  combineSchemas 
} from '@/lib/schema';
import { Container } from '@/components/Container';
import { SmartCTAWithHover } from '@/components/SmartCTA';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  
  const titles = {
    vi: 'Điện Mặt Trời Hộ Gia Đình - Tiết Kiệm Đến 80% Hóa Đơn | Golden Energy',
    en: 'Residential Solar Systems - Save Up to 80% on Bills | Golden Energy',
    zh: '住宅太阳能系统 - 节省高达80%的电费 | Golden Energy',
  };
  
  const descriptions = {
    vi: 'Hệ thống điện mặt trời hộ gia đình 3-10kW. Lắp đặt 1 ngày, tiết kiệm 80% hóa đơn, hoàn vốn 5-7 năm, bảo hành 25 năm. Tư vấn miễn phí.',
    en: 'Residential solar systems 3-10kW. 1-day installation, 80% bill savings, 5-7 year payback, 25-year warranty. Free consultation.',
    zh: '住宅太阳能系统3-10kW。1天安装，节省80%电费，5-7年回本，25年保修。免费咨询。',
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.vi,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
    keywords: locale === 'vi' 
      ? 'điện mặt trời hộ gia đình, lắp đặt pin mặt trời, hệ thống solar gia đình, tiết kiệm điện'
      : 'residential solar, home solar panels, rooftop solar, solar installation',
    alternates: {
      canonical: `https://goldenenergy.com.vn/${locale}/giai-phap/dien-mat-troi-ho-gia-dinh`,
    },
  };
}

export default function ResidentialSolarPage({ params }: PageProps) {
  const { locale } = params;
  
  // Generate comprehensive Schema.org markup
  const organizationSchema = generateOrganizationSchema({ locale: locale as any });
  
  const productSchema = generateProductSchema({
    name: locale === 'vi' ? 'Hệ thống điện mặt trời hộ gia đình' : 'Residential Solar System',
    description: locale === 'vi' 
      ? 'Giải pháp năng lượng sạch cho ngôi nhà, tiết kiệm hóa đơn điện đến 80%'
      : 'Clean energy solution for homes, save up to 80% on electricity bills',
    category: 'residential',
    powerOutput: '3-10kW',
    price: 75000000, // 75M VND (5kW system average)
    locale: locale as any,
    imageUrl: '/images/residential-solar.jpg',
    sku: 'SOLAR-RES-5KW',
  });
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    `/${locale}/giai-phap/dien-mat-troi-ho-gia-dinh`, 
    locale as any
  );
  
  const combinedSchema = combineSchemas(organizationSchema, productSchema, breadcrumbSchema);
  
  const content = {
    vi: {
      hero: {
        title: 'Điện Mặt Trời Hộ Gia Đình',
        subtitle: 'Tiết kiệm hóa đơn điện, bảo vệ môi trường, tăng giá trị nhà',
        stats: [
          { value: '70-80%', label: 'Tiết kiệm điện' },
          { value: '5-6 năm', label: 'Hoàn vốn' },
          { value: '25 năm', label: 'Bảo hành' },
        ],
      },
      benefits: {
        title: 'Tại sao chọn điện mặt trời?',
        items: [
          {
            icon: '💰',
            title: 'Tiết kiệm chi phí',
            description: 'Giảm 70-80% hóa đơn điện hàng tháng. Với hộ gia đình tiêu thụ 400 kWh/tháng, tiết kiệm ~2-3 triệu VND/tháng.',
          },
          {
            icon: '🏠',
            title: 'Tăng giá trị nhà',
            description: 'Nhà có điện mặt trời tăng giá 3-5%. Với nhà 5 tỷ, giá trị tăng thêm 150-250 triệu.',
          },
          {
            icon: '🌱',
            title: 'Bảo vệ môi trường',
            description: 'Mỗi hệ thống 5kW giảm 6 tấn CO2/năm, tương đương trồng 300 cây xanh.',
          },
          {
            icon: '⚡',
            title: 'Nguồn điện dự phòng',
            description: 'Kết hợp pin lưu trữ, đảm bảo điện 24/7 ngay cả khi mất điện lưới.',
          },
        ],
      },
      process: {
        title: 'Quy trình lắp đặt',
        steps: [
          {
            number: '01',
            title: 'Khảo sát & Tư vấn',
            description: 'Chuyên gia đến tận nhà đo đạc mái, phân tích hóa đơn điện, tư vấn giải pháp phù hợp.',
            duration: '1-2 giờ',
          },
          {
            number: '02',
            title: 'Thiết kế & Báo giá',
            description: 'Thiết kế 3D hệ thống, tính toán ROI chi tiết, báo giá minh bạch.',
            duration: '1-2 ngày',
          },
          {
            number: '03',
            title: 'Lắp đặt',
            description: 'Đội ngũ kỹ thuật chuyên nghiệp lắp đặt nhanh chóng, an toàn.',
            duration: '1 ngày',
          },
          {
            number: '04',
            title: 'Vận hành & Bảo trì',
            description: 'Hướng dẫn sử dụng, giám sát từ xa, bảo trì định kỳ miễn phí.',
            duration: '25 năm',
          },
        ],
      },
      packages: {
        title: 'Gói giải pháp phổ biến',
        items: [
          {
            name: 'Gói Tiết Kiệm',
            capacity: '3 kW',
            panels: '7 tấm x 450W',
            inverter: 'Inverter 3kW',
            production: '360 kWh/tháng',
            savings: '~900,000 VND/tháng',
            price: '45,000,000 VND',
            payback: '5 năm',
            ideal: 'Hộ gia đình 2-3 người',
          },
          {
            name: 'Gói Phổ Thông',
            capacity: '5 kW',
            panels: '11 tấm x 450W',
            inverter: 'Inverter 5kW',
            production: '600 kWh/tháng',
            savings: '~1,500,000 VND/tháng',
            price: '75,000,000 VND',
            payback: '5-6 năm',
            ideal: 'Hộ gia đình 4-5 người',
            featured: true,
          },
          {
            name: 'Gói Cao Cấp',
            capacity: '10 kW',
            panels: '22 tấm x 450W',
            inverter: 'Inverter 10kW',
            production: '1,200 kWh/tháng',
            savings: '~3,000,000 VND/tháng',
            price: '150,000,000 VND',
            payback: '5-7 năm',
            ideal: 'Biệt thự, nhà lớn',
          },
        ],
      },
    },
    en: {
      hero: {
        title: 'Residential Solar Systems',
        subtitle: 'Save on bills, protect environment, increase home value',
        stats: [
          { value: '80%', label: 'Bill reduction' },
          { value: '5-7 years', label: 'Payback' },
          { value: '25 years', label: 'Warranty' },
        ],
      },
      benefits: {
        title: 'Why choose solar?',
        items: [
          {
            icon: '💰',
            title: 'Cost savings',
            description: 'Reduce electricity bills by 70-80%. For 400 kWh/month usage, save ~$85-130/month.',
          },
          {
            icon: '🏠',
            title: 'Increase home value',
            description: 'Homes with solar increase 3-5% in value. For a $215K home, add $6.5-11K value.',
          },
          {
            icon: '🌱',
            title: 'Environmental protection',
            description: 'Each 5kW system reduces 6 tons CO2/year, equivalent to planting 300 trees.',
          },
          {
            icon: '⚡',
            title: 'Backup power',
            description: 'Combined with battery storage, ensure 24/7 power even during grid outages.',
          },
        ],
      },
      process: {
        title: 'Installation process',
        steps: [
          {
            number: '01',
            title: 'Survey & Consultation',
            description: 'Expert visits to measure roof, analyze bills, recommend suitable solution.',
            duration: '1-2 hours',
          },
          {
            number: '02',
            title: 'Design & Quote',
            description: '3D system design, detailed ROI calculation, transparent pricing.',
            duration: '1-2 days',
          },
          {
            number: '03',
            title: 'Installation',
            description: 'Professional technical team installs quickly and safely.',
            duration: '1 day',
          },
          {
            number: '04',
            title: 'Operation & Maintenance',
            description: 'Usage training, remote monitoring, free periodic maintenance.',
            duration: '25 years',
          },
        ],
      },
      packages: {
        title: 'Popular packages',
        items: [
          {
            name: 'Economy Package',
            capacity: '3 kW',
            panels: '7 panels x 450W',
            inverter: '3kW Inverter',
            production: '360 kWh/month',
            savings: '~$38/month',
            price: '$1,900',
            payback: '5 years',
            ideal: '2-3 person household',
          },
          {
            name: 'Standard Package',
            capacity: '5 kW',
            panels: '11 panels x 450W',
            inverter: '5kW Inverter',
            production: '600 kWh/month',
            savings: '~$64/month',
            price: '$3,200',
            payback: '5-6 years',
            ideal: '4-5 person household',
            featured: true,
          },
          {
            name: 'Premium Package',
            capacity: '10 kW',
            panels: '22 panels x 450W',
            inverter: '10kW Inverter',
            production: '1,200 kWh/month',
            savings: '~$128/month',
            price: '$6,400',
            payback: '5-7 years',
            ideal: 'Villas, large homes',
          },
        ],
      },
    },
    zh: {
      hero: {
        title: '住宅太阳能系统',
        subtitle: '节省账单，保护环境，增加房屋价值',
        stats: [
          { value: '80%', label: '电费减少' },
          { value: '5-7年', label: '回本期' },
          { value: '25年', label: '保修' },
        ],
      },
      benefits: {
        title: '为什么选择太阳能？',
        items: [
          {
            icon: '💰',
            title: '节省成本',
            description: '每月电费减少70-80%。400 kWh/月使用量，节省约500-770元/月。',
          },
          {
            icon: '🏠',
            title: '增加房屋价值',
            description: '安装太阳能的房屋价值增加3-5%。150万元房屋，增值4.5-7.5万元。',
          },
          {
            icon: '🌱',
            title: '环境保护',
            description: '每个5kW系统每年减少6吨CO2，相当于种植300棵树。',
          },
          {
            icon: '⚡',
            title: '备用电源',
            description: '结合电池储能，即使停电也能保证24/7供电。',
          },
        ],
      },
      process: {
        title: '安装流程',
        steps: [
          {
            number: '01',
            title: '勘察与咨询',
            description: '专家上门测量屋顶，分析电费账单，推荐合适方案。',
            duration: '1-2小时',
          },
          {
            number: '02',
            title: '设计与报价',
            description: '3D系统设计，详细ROI计算，透明定价。',
            duration: '1-2天',
          },
          {
            number: '03',
            title: '安装',
            description: '专业技术团队快速安全安装。',
            duration: '1天',
          },
          {
            number: '04',
            title: '运行与维护',
            description: '使用培训，远程监控，免费定期维护。',
            duration: '25年',
          },
        ],
      },
      packages: {
        title: '热门套餐',
        items: [
          {
            name: '经济套餐',
            capacity: '3 kW',
            panels: '7块 x 450W',
            inverter: '3kW逆变器',
            production: '360 kWh/月',
            savings: '~270元/月',
            price: '1.35万元',
            payback: '5年',
            ideal: '2-3人家庭',
          },
          {
            name: '标准套餐',
            capacity: '5 kW',
            panels: '11块 x 450W',
            inverter: '5kW逆变器',
            production: '600 kWh/月',
            savings: '~450元/月',
            price: '2.25万元',
            payback: '5-6年',
            ideal: '4-5人家庭',
            featured: true,
          },
          {
            name: '高级套餐',
            capacity: '10 kW',
            panels: '22块 x 450W',
            inverter: '10kW逆变器',
            production: '1,200 kWh/月',
            savings: '~900元/月',
            price: '4.5万元',
            payback: '5-7年',
            ideal: '别墅，大型住宅',
          },
        ],
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
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white pt-32 pb-20">
          <Container>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {t.hero.title}
              </h1>
              <p className="text-2xl mb-12 text-blue-100">
                {t.hero.subtitle}
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {t.hero.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-blue-200">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
        
        {/* Benefits Section */}
        <section className="py-20">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.benefits.title}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {t.benefits.items.map((benefit, idx) => (
                <div key={idx} className="bg-blue-50 rounded-xl p-8">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Process Section */}
        <section className="py-20 bg-gray-50">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.process.title}
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              {t.process.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <div className="text-6xl font-bold text-blue-100 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {step.description}
                    </p>
                    <div className="text-sm text-blue-600 font-semibold">
                      ⏱️ {step.duration}
                    </div>
                  </div>
                  
                  {idx < t.process.steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-blue-300">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Packages Section */}
        <section className="py-20">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.packages.title}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {t.packages.items.map((pkg, idx) => (
                <div 
                  key={idx}
                  className={`rounded-xl p-8 ${
                    pkg.featured 
                      ? 'bg-blue-600 text-white shadow-2xl scale-105 relative' 
                      : 'bg-white border-2 border-gray-200'
                  }`}
                >
                  {pkg.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      {locale === 'vi' ? 'PHỔ BIẾN NHẤT' : locale === 'zh' ? '最受欢迎' : 'MOST POPULAR'}
                    </div>
                  )}
                  
                  <h3 className={`text-2xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.name}
                  </h3>
                  <div className={`text-4xl font-bold mb-6 ${pkg.featured ? 'text-yellow-400' : 'text-blue-600'}`}>
                    {pkg.capacity}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className={`text-sm ${pkg.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Cấu hình:' : locale === 'zh' ? '配置:' : 'Configuration:'}</strong>
                      <div>• {pkg.panels}</div>
                      <div>• {pkg.inverter}</div>
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Sản lượng:' : locale === 'zh' ? '产量:' : 'Production:'}</strong> {pkg.production}
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Tiết kiệm:' : locale === 'zh' ? '节省:' : 'Savings:'}</strong> {pkg.savings}
                    </div>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.price}
                  </div>
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-blue-200' : 'text-gray-600'}`}>
                    {locale === 'vi' ? 'Hoàn vốn:' : locale === 'zh' ? '回本:' : 'Payback:'} {pkg.payback}
                  </div>
                  
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-blue-100' : 'text-gray-600'}`}>
                    <strong>{locale === 'vi' ? 'Phù hợp:' : locale === 'zh' ? '适合:' : 'Ideal for:'}</strong> {pkg.ideal}
                  </div>
                  
                  <Link
                    href={`/${locale}/tinh-toan?package=${pkg.capacity}`}
                    className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                      pkg.featured
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {locale === 'vi' ? 'Tính toán chi tiết' : locale === 'zh' ? '详细计算' : 'Calculate details'}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <Container>
            <div className="text-center text-white max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                {locale === 'vi' ? 'Bắt đầu tiết kiệm ngay hôm nay' : locale === 'zh' ? '今天开始节省' : 'Start saving today'}
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                {locale === 'vi' 
                  ? 'Tính toán hệ thống phù hợp với ngôi nhà của bạn trong 2 phút'
                  : locale === 'zh'
                  ? '2分钟内计算适合您家的系统'
                  : 'Calculate the right system for your home in 2 minutes'}
              </p>
              
              <SmartCTAWithHover 
                defaultText={locale === 'vi' ? 'Tính toán ngay' : locale === 'zh' ? '立即计算' : 'Calculate now'}
                defaultHref={`/${locale}/tinh-toan`}
                variant="primary"
              />
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

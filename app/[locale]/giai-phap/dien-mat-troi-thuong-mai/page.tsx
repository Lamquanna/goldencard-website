/**
 * Commercial Solar Solution Page
 * Semantic URL: /[locale]/giai-phap/dien-mat-troi-thuong-mai/
 * Target: Businesses - offices, hotels, retail centers, restaurants
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
    vi: 'Điện Mặt Trời Thương Mại - Giảm 60-70% Chi Phí Điện | Golden Energy',
    en: 'Commercial Solar Systems - Reduce 60-70% Energy Costs | Golden Energy',
    zh: '商业太阳能系统 - 降低60-70%能源成本 | Golden Energy',
  };
  
  const descriptions = {
    vi: 'Hệ thống điện mặt trời thương mại 10-100kW cho văn phòng, khách sạn, trung tâm thương mại. Hoàn vốn 4-6 năm, chứng nhận ESG, ưu đãi thuế. Tư vấn miễn phí.',
    en: 'Commercial solar systems 10-100kW for offices, hotels, retail centers. 4-6 year payback, ESG certification, tax incentives. Free consultation.',
    zh: '商业太阳能系统10-100kW，适用于办公室、酒店、商业中心。4-6年回本，ESG认证，税收优惠。免费咨询。',
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.vi,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
    keywords: locale === 'vi' 
      ? 'điện mặt trời thương mại, hệ thống solar doanh nghiệp, tiết kiệm điện văn phòng, ESG'
      : 'commercial solar, business solar panels, office solar systems, ESG certification',
    alternates: {
      canonical: `https://goldenenergy.com.vn/${locale}/giai-phap/dien-mat-troi-thuong-mai`,
    },
  };
}

export default function CommercialSolarPage({ params }: PageProps) {
  const { locale } = params;
  
  // Generate comprehensive Schema.org markup
  const organizationSchema = generateOrganizationSchema({ locale: locale as any });
  
  const productSchema = generateProductSchema({
    name: locale === 'vi' ? 'Hệ thống điện mặt trời thương mại' : 'Commercial Solar System',
    description: locale === 'vi' 
      ? 'Giải pháp năng lượng sạch cho doanh nghiệp, giảm chi phí vận hành 60-70%'
      : 'Clean energy solution for businesses, reduce operating costs by 60-70%',
    category: 'commercial',
    powerOutput: '10-100kW',
    price: 260000000, // 260M VND (20kW system average)
    locale: locale as any,
    imageUrl: '/images/commercial-solar.jpg',
    sku: 'SOLAR-COM-20KW',
  });
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    `/${locale}/giai-phap/dien-mat-troi-thuong-mai`, 
    locale as any
  );
  
  const combinedSchema = combineSchemas(organizationSchema, productSchema, breadcrumbSchema);
  
  const content = {
    vi: {
      hero: {
        title: 'Điện Mặt Trời Thương Mại',
        subtitle: 'Tối ưu chi phí vận hành, chứng nhận ESG, nâng cao hình ảnh doanh nghiệp xanh',
        stats: [
          { value: '60-70%', label: 'Tiết kiệm điện' },
          { value: '4-5 năm', label: 'Hoàn vốn' },
          { value: 'ESG', label: 'Chứng nhận' },
        ],
      },
      benefits: {
        title: 'Lợi ích cho doanh nghiệp',
        items: [
          {
            icon: '💼',
            title: 'Tối ưu chi phí vận hành',
            description: 'Giảm 60-70% hóa đơn điện hàng tháng. Với doanh nghiệp tiêu thụ 3,000 kWh/tháng, tiết kiệm ~15-20 triệu VND/tháng, 180-240 triệu/năm.',
          },
          {
            icon: '🏆',
            title: 'Chứng nhận ESG & Hình ảnh xanh',
            description: 'Đạt chứng nhận ESG, LEED Green Building. Nâng cao uy tín thương hiệu, thu hút khách hàng và đối tác quan tâm môi trường.',
          },
          {
            icon: '💰',
            title: 'Ưu đãi thuế & Khấu hao',
            description: 'Được khấu hao tài sản cố định, giảm thuế thu nhập doanh nghiệp. Một số địa phương có chính sách hỗ trợ đầu tư năng lượng tái tạo.',
          },
          {
            icon: '📊',
            title: 'Dòng tiền ổn định & Dự báo chính xác',
            description: 'Chi phí điện cố định trong 25 năm, không lo biến động giá. Dễ dàng lập kế hoạch tài chính, dự báo ngân sách vận hành.',
          },
        ],
      },
      process: {
        title: 'Quy trình triển khai chuyên nghiệp',
        steps: [
          {
            number: '01',
            title: 'Khảo sát hiện trường',
            description: 'Đo đạc mái nhà, đánh giá kết cấu, phân tích hóa đơn điện 12 tháng, khảo sát tải tiêu thụ theo giờ.',
            duration: '1-2 ngày',
          },
          {
            number: '02',
            title: 'Thiết kế kỹ thuật',
            description: 'Thiết kế 3D chi tiết, mô phỏng sản lượng, tính toán ROI và NPV, báo cáo khả thi tài chính.',
            duration: '3-5 ngày',
          },
          {
            number: '03',
            title: 'Phối hợp lắp đặt',
            description: 'Lập kế hoạch thi công, phối hợp với quản lý tòa nhà, lắp đặt không ảnh hưởng hoạt động kinh doanh.',
            duration: '5-10 ngày',
          },
          {
            number: '04',
            title: 'Hợp đồng O&M',
            description: 'Giám sát 24/7 qua IoT, bảo trì định kỳ, báo cáo hiệu suất hàng tháng, hỗ trợ kỹ thuật ưu tiên.',
            duration: '25 năm',
          },
        ],
      },
      packages: {
        title: 'Các gói giải pháp phổ biến',
        items: [
          {
            name: 'Gói Văn Phòng 20kW',
            capacity: '20 kW',
            panels: '45 tấm x 450W',
            inverter: 'Inverter 20kW',
            production: '2,400 kWh/tháng',
            savings: '~15,000,000 VND/tháng',
            price: '260,000,000 VND',
            payback: '4.5 năm',
            ideal: 'Văn phòng 200-500m²',
          },
          {
            name: 'Gói Bán Lẻ 50kW',
            capacity: '50 kW',
            panels: '110 tấm x 450W',
            inverter: 'Inverter 50kW',
            production: '6,000 kWh/tháng',
            savings: '~35,000,000 VND/tháng',
            price: '650,000,000 VND',
            payback: '5 năm',
            ideal: 'Siêu thị, cửa hàng lớn',
            featured: true,
          },
          {
            name: 'Gói Khách Sạn 100kW',
            capacity: '100 kW',
            panels: '220 tấm x 450W',
            inverter: 'Inverter 100kW',
            production: '12,000 kWh/tháng',
            savings: '~70,000,000 VND/tháng',
            price: '1,300,000,000 VND',
            payback: '5 năm',
            ideal: 'Khách sạn, resort',
          },
        ],
      },
      useCases: {
        title: 'Ứng dụng theo ngành',
        items: [
          {
            industry: 'Văn phòng',
            icon: '🏢',
            capacity: '10-30kW',
            description: 'Giảm chi phí điện điều hòa, chiếu sáng. Hình ảnh xanh cho nhân viên và khách hàng.',
          },
          {
            industry: 'Khách sạn & Resort',
            icon: '🏨',
            capacity: '50-200kW',
            description: 'Tiết kiệm điện năng lớn, điểm nhấn Marketing cho du khách ý thức môi trường.',
          },
          {
            industry: 'Trung tâm thương mại',
            icon: '🛍️',
            capacity: '100-500kW',
            description: 'Giảm chi phí vận hành, đạt chứng nhận Green Building, thu hút thương hiệu lớn.',
          },
          {
            industry: 'Nhà hàng',
            icon: '🍽️',
            capacity: '10-20kW',
            description: 'Tiết kiệm điện bếp và điều hòa, nâng cao trải nghiệm khách hàng.',
          },
        ],
      },
    },
    en: {
      hero: {
        title: 'Commercial Solar Systems',
        subtitle: 'Optimize operating costs, ESG certification, enhance green corporate image',
        stats: [
          { value: '60-70%', label: 'Energy cost reduction' },
          { value: '4-6 years', label: 'Payback' },
          { value: 'ESG', label: 'Certification' },
        ],
      },
      benefits: {
        title: 'Benefits for businesses',
        items: [
          {
            icon: '💼',
            title: 'Optimize operating costs',
            description: 'Reduce electricity bills by 60-70%. For 3,000 kWh/month usage, save ~$640-850/month, $7,680-10,200/year.',
          },
          {
            icon: '🏆',
            title: 'ESG certification & Green image',
            description: 'Achieve ESG, LEED Green Building certification. Enhance brand reputation, attract environmentally conscious customers and partners.',
          },
          {
            icon: '💰',
            title: 'Tax incentives & Depreciation',
            description: 'Fixed asset depreciation, reduce corporate income tax. Some localities offer renewable energy investment support.',
          },
          {
            icon: '📊',
            title: 'Stable cash flow & Accurate forecasting',
            description: 'Fixed electricity costs for 25 years, no price fluctuation concerns. Easy financial planning and operating budget forecasting.',
          },
        ],
      },
      process: {
        title: 'Professional deployment process',
        steps: [
          {
            number: '01',
            title: 'Site survey',
            description: 'Roof measurement, structural assessment, 12-month bill analysis, hourly consumption load survey.',
            duration: '1-2 days',
          },
          {
            number: '02',
            title: 'Engineering design',
            description: 'Detailed 3D design, production simulation, ROI and NPV calculation, financial feasibility report.',
            duration: '3-5 days',
          },
          {
            number: '03',
            title: 'Installation coordination',
            description: 'Construction planning, building management coordination, installation without disrupting business operations.',
            duration: '5-10 days',
          },
          {
            number: '04',
            title: 'O&M contract',
            description: '24/7 IoT monitoring, periodic maintenance, monthly performance reports, priority technical support.',
            duration: '25 years',
          },
        ],
      },
      packages: {
        title: 'Popular solution packages',
        items: [
          {
            name: '20kW Office Package',
            capacity: '20 kW',
            panels: '45 panels x 450W',
            inverter: '20kW Inverter',
            production: '2,400 kWh/month',
            savings: '~$640/month',
            price: '$11,100',
            payback: '4.5 years',
            ideal: '200-500m² office',
          },
          {
            name: '50kW Retail Package',
            capacity: '50 kW',
            panels: '110 panels x 450W',
            inverter: '50kW Inverter',
            production: '6,000 kWh/month',
            savings: '~$1,490/month',
            price: '$27,700',
            payback: '5 years',
            ideal: 'Supermarkets, large stores',
            featured: true,
          },
          {
            name: '100kW Hotel Package',
            capacity: '100 kW',
            panels: '220 panels x 450W',
            inverter: '100kW Inverter',
            production: '12,000 kWh/month',
            savings: '~$2,980/month',
            price: '$55,300',
            payback: '5 years',
            ideal: 'Hotels, resorts',
          },
        ],
      },
      useCases: {
        title: 'Industry applications',
        items: [
          {
            industry: 'Office',
            icon: '🏢',
            capacity: '10-30kW',
            description: 'Reduce HVAC and lighting costs. Green image for employees and clients.',
          },
          {
            industry: 'Hotels & Resorts',
            icon: '🏨',
            capacity: '50-200kW',
            description: 'Large energy savings, marketing highlight for environmentally conscious travelers.',
          },
          {
            industry: 'Shopping centers',
            icon: '🛍️',
            capacity: '100-500kW',
            description: 'Reduce operating costs, achieve Green Building certification, attract major brands.',
          },
          {
            industry: 'Restaurants',
            icon: '🍽️',
            capacity: '10-20kW',
            description: 'Save on kitchen and HVAC electricity, enhance customer experience.',
          },
        ],
      },
    },
    zh: {
      hero: {
        title: '商业太阳能系统',
        subtitle: '优化运营成本，ESG认证，提升企业绿色形象',
        stats: [
          { value: '60-70%', label: '能源成本降低' },
          { value: '4-6年', label: '回本期' },
          { value: 'ESG', label: '认证' },
        ],
      },
      benefits: {
        title: '企业优势',
        items: [
          {
            icon: '💼',
            title: '优化运营成本',
            description: '每月电费减少60-70%。3,000 kWh/月使用量，节省约4,500-6,000元/月，54,000-72,000元/年。',
          },
          {
            icon: '🏆',
            title: 'ESG认证与绿色形象',
            description: '获得ESG、LEED绿色建筑认证。提升品牌声誉，吸引关注环境的客户和合作伙伴。',
          },
          {
            icon: '💰',
            title: '税收优惠与折旧',
            description: '固定资产折旧，降低企业所得税。部分地区提供可再生能源投资支持。',
          },
          {
            icon: '📊',
            title: '稳定现金流与准确预测',
            description: '25年固定电费，无价格波动担忧。轻松进行财务规划和运营预算预测。',
          },
        ],
      },
      process: {
        title: '专业部署流程',
        steps: [
          {
            number: '01',
            title: '现场勘察',
            description: '屋顶测量，结构评估，12个月账单分析，逐小时消耗负荷调查。',
            duration: '1-2天',
          },
          {
            number: '02',
            title: '工程设计',
            description: '详细3D设计，产量模拟，ROI和NPV计算，财务可行性报告。',
            duration: '3-5天',
          },
          {
            number: '03',
            title: '安装协调',
            description: '施工规划，楼宇管理协调，安装不影响业务运营。',
            duration: '5-10天',
          },
          {
            number: '04',
            title: 'O&M合同',
            description: '24/7物联网监控，定期维护，月度性能报告，优先技术支持。',
            duration: '25年',
          },
        ],
      },
      packages: {
        title: '热门解决方案套餐',
        items: [
          {
            name: '20kW办公套餐',
            capacity: '20 kW',
            panels: '45块 x 450W',
            inverter: '20kW逆变器',
            production: '2,400 kWh/月',
            savings: '~4,500元/月',
            price: '7.8万元',
            payback: '4.5年',
            ideal: '200-500m²办公室',
          },
          {
            name: '50kW零售套餐',
            capacity: '50 kW',
            panels: '110块 x 450W',
            inverter: '50kW逆变器',
            production: '6,000 kWh/月',
            savings: '~10,500元/月',
            price: '19.5万元',
            payback: '5年',
            ideal: '超市、大型商店',
            featured: true,
          },
          {
            name: '100kW酒店套餐',
            capacity: '100 kW',
            panels: '220块 x 450W',
            inverter: '100kW逆变器',
            production: '12,000 kWh/月',
            savings: '~21,000元/月',
            price: '39万元',
            payback: '5年',
            ideal: '酒店、度假村',
          },
        ],
      },
      useCases: {
        title: '行业应用',
        items: [
          {
            industry: '办公室',
            icon: '🏢',
            capacity: '10-30kW',
            description: '降低空调和照明成本。为员工和客户打造绿色形象。',
          },
          {
            industry: '酒店和度假村',
            icon: '🏨',
            capacity: '50-200kW',
            description: '大量节能，为环保意识强的游客提供营销亮点。',
          },
          {
            industry: '购物中心',
            icon: '🛍️',
            capacity: '100-500kW',
            description: '降低运营成本，获得绿色建筑认证，吸引主要品牌。',
          },
          {
            industry: '餐厅',
            icon: '🍽️',
            capacity: '10-20kW',
            description: '节省厨房和空调电费，提升客户体验。',
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
        <section className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white pt-32 pb-20">
          <Container>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {t.hero.title}
              </h1>
              <p className="text-2xl mb-12 text-indigo-100">
                {t.hero.subtitle}
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {t.hero.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-indigo-200">
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
                <div key={idx} className="bg-indigo-50 rounded-xl p-8">
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
                    <div className="text-6xl font-bold text-indigo-100 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {step.description}
                    </p>
                    <div className="text-sm text-indigo-600 font-semibold">
                      ⏱️ {step.duration}
                    </div>
                  </div>
                  
                  {idx < t.process.steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-indigo-300">
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
        
        {/* Use Cases Section */}
        <section className="py-20">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.useCases.title}
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {t.useCases.items.map((useCase, idx) => (
                <div key={idx} className="bg-white border-2 border-indigo-100 rounded-xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all">
                  <div className="text-5xl mb-4 text-center">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {useCase.industry}
                  </h3>
                  <div className="text-sm text-indigo-600 font-semibold mb-3 text-center">
                    {useCase.capacity}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Packages Section */}
        <section className="py-20 bg-gray-50">
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
                      ? 'bg-indigo-600 text-white shadow-2xl scale-105 relative' 
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
                  <div className={`text-4xl font-bold mb-6 ${pkg.featured ? 'text-yellow-400' : 'text-indigo-600'}`}>
                    {pkg.capacity}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className={`text-sm ${pkg.featured ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Cấu hình:' : locale === 'zh' ? '配置:' : 'Configuration:'}</strong>
                      <div>• {pkg.panels}</div>
                      <div>• {pkg.inverter}</div>
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Sản lượng:' : locale === 'zh' ? '产量:' : 'Production:'}</strong> {pkg.production}
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-indigo-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Tiết kiệm:' : locale === 'zh' ? '节省:' : 'Savings:'}</strong> {pkg.savings}
                    </div>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.price}
                  </div>
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-indigo-200' : 'text-gray-600'}`}>
                    {locale === 'vi' ? 'Hoàn vốn:' : locale === 'zh' ? '回本:' : 'Payback:'} {pkg.payback}
                  </div>
                  
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-indigo-100' : 'text-gray-600'}`}>
                    <strong>{locale === 'vi' ? 'Phù hợp:' : locale === 'zh' ? '适合:' : 'Ideal for:'}</strong> {pkg.ideal}
                  </div>
                  
                  <Link
                    href={`/${locale}/lien-he?package=${encodeURIComponent(pkg.name)}`}
                    className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                      pkg.featured
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {locale === 'vi' ? 'Nhận báo giá' : locale === 'zh' ? '获取报价' : 'Get quote'}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-indigo-800">
          <Container>
            <div className="text-center text-white max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                {locale === 'vi' ? 'Tối ưu chi phí vận hành ngay hôm nay' : locale === 'zh' ? '今天开始优化运营成本' : 'Optimize operating costs today'}
              </h2>
              <p className="text-xl mb-8 text-indigo-100">
                {locale === 'vi' 
                  ? 'Tư vấn miễn phí và khảo sát hiện trường cho doanh nghiệp của bạn'
                  : locale === 'zh'
                  ? '为您的企业提供免费咨询和现场勘察'
                  : 'Free consultation and site survey for your business'}
              </p>
              
              <SmartCTAWithHover 
                defaultText={locale === 'vi' ? 'Đăng ký tư vấn' : locale === 'zh' ? '注册咨询' : 'Register consultation'}
                defaultHref={`/${locale}/lien-he?type=commercial`}
                variant="primary"
              />
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

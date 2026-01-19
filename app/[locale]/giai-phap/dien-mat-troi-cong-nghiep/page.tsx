/**
 * Industrial Solar Solution Page
 * Semantic URL: /[locale]/giai-phap/dien-mat-troi-cong-nghiep/
 * Target: Factories, warehouses, manufacturing plants, logistics centers
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
    vi: 'Điện Mặt Trời Công Nghiệp - Giảm 50-60% Chi Phí Vận Hành | Golden Energy',
    en: 'Industrial Solar Systems - Reduce 50-60% Operating Costs | Golden Energy',
    zh: '工业太阳能系统 - 降低50-60%运营成本 | Golden Energy',
  };
  
  const descriptions = {
    vi: 'Hệ thống điện mặt trời công nghiệp 100kW-5MW+ cho nhà máy, kho logistics, sản xuất. Hoàn vốn 3-5 năm, độc lập lưới điện, SCADA giám sát. Giải pháp EPC toàn diện.',
    en: 'Industrial solar systems 100kW-5MW+ for factories, logistics, manufacturing. 3-5 year payback, grid independence, SCADA monitoring. Comprehensive EPC solutions.',
    zh: '工业太阳能系统100kW-5MW+，适用于工厂、物流、制造业。3-5年回本，电网独立，SCADA监控。全面的EPC解决方案。',
  };
  
  return {
    title: titles[locale as keyof typeof titles] || titles.vi,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
    keywords: locale === 'vi' 
      ? 'điện mặt trời công nghiệp, hệ thống solar nhà máy, năng lượng sản xuất, EPC solar, SCADA'
      : 'industrial solar, factory solar panels, manufacturing solar systems, solar EPC, SCADA',
    alternates: {
      canonical: `https://goldenenergy.com.vn/${locale}/giai-phap/dien-mat-troi-cong-nghiep`,
    },
  };
}

export default function IndustrialSolarPage({ params }: PageProps) {
  const { locale } = params;
  
  // Generate comprehensive Schema.org markup
  const organizationSchema = generateOrganizationSchema({ locale: locale as any });
  
  const productSchema = generateProductSchema({
    name: locale === 'vi' ? 'Hệ thống điện mặt trời công nghiệp' : 'Industrial Solar System',
    description: locale === 'vi' 
      ? 'Giải pháp năng lượng quy mô lớn cho nhà máy và sản xuất, giảm chi phí vận hành 50-60%'
      : 'Large-scale energy solution for factories and manufacturing, reduce operating costs by 50-60%',
    category: 'industrial',
    powerOutput: '100kW-5MW+',
    price: 2200000000, // 2.2B VND (200kW system average)
    locale: locale as any,
    imageUrl: '/images/industrial-solar.jpg',
    sku: 'SOLAR-IND-200KW',
  });
  
  const breadcrumbSchema = generateBreadcrumbSchema(
    `/${locale}/giai-phap/dien-mat-troi-cong-nghiep`, 
    locale as any
  );
  
  const combinedSchema = combineSchemas(organizationSchema, productSchema, breadcrumbSchema);
  
  const content = {
    vi: {
      hero: {
        title: 'Điện Mặt Trời Công Nghiệp',
        subtitle: 'Độc lập lưới điện, tối ưu chi phí sản xuất, đảm bảo liên tục sản xuất với quy mô MW+',
        stats: [
          { value: '50-60%', label: 'Giảm chi phí điện' },
          { value: '3-5 năm', label: 'Hoàn vốn' },
          { value: '24/7', label: 'Giám sát SCADA' },
        ],
      },
      benefits: {
        title: 'Lợi ích cho sản xuất công nghiệp',
        items: [
          {
            icon: '⚡',
            title: 'Giảm chi phí vận hành lớn',
            description: 'Tiết kiệm 50-60% hóa đơn điện. Với nhà máy tiêu thụ 30,000 kWh/tháng, tiết kiệm ~120-150 triệu VND/tháng, 1.4-1.8 tỷ VND/năm. Quy mô lớn mang lại hiệu quả kinh tế tối ưu.',
          },
          {
            icon: '🔋',
            title: 'Độc lập lưới điện & Cắt giảm công suất',
            description: 'Giảm phụ thuộc lưới điện quốc gia, tránh ảnh hưởng từ cúp điện. Cắt giảm công suất cao điểm (Peak Shaving), giảm phí công suất và tiền điện giờ cao điểm.',
          },
          {
            icon: '📈',
            title: 'Chất lượng điện & Liên tục sản xuất',
            description: 'Nguồn điện ổn định, giảm biến động điện áp. Tích hợp hệ thống lưu trữ năng lượng đảm bảo sản xuất không gián đoạn, bảo vệ thiết bị sản xuất đắt tiền.',
          },
          {
            icon: '🏭',
            title: 'Tối ưu không gian mái nhà máy',
            description: 'Tận dụng diện tích mái rộng lớn của nhà máy, kho xưởng. Không chiếm diện tích sản xuất. Hiệu ứng làm mát tự nhiên cho nhà xưởng, giảm chi phí điều hòa.',
          },
        ],
      },
      process: {
        title: 'Quy trình EPC chuyên nghiệp',
        steps: [
          {
            number: '01',
            title: 'Đánh giá kỹ thuật',
            description: 'Khảo sát tải điện 24/7, phân tích đường cong phụ tải, đánh giá kết cấu mái, khảo sát hạ tầng điện. Đo đạc bóng râm, mô phỏng 3D.',
            duration: '2-3 ngày',
          },
          {
            number: '02',
            title: 'Thiết kế EPC',
            description: 'Thiết kế hệ thống EPC (Engineering, Procurement, Construction) chi tiết. Tính toán chi phí vốn, phân tích tài chính NPV/IRR, mô phỏng sản lượng PVsyst.',
            duration: '7-10 ngày',
          },
          {
            number: '03',
            title: 'Lắp đặt & Vận hành thử',
            description: 'Lắp đặt theo tiêu chuẩn IEC, test & commissioning đầy đủ. Đào tạo đội ngũ vận hành, bàn giao tài liệu kỹ thuật hoàn chỉnh. Không gián đoạn sản xuất.',
            duration: '15-30 ngày',
          },
          {
            number: '04',
            title: 'Giám sát SCADA 24/7',
            description: 'Hệ thống SCADA giám sát tập trung, cảnh báo sớm sự cố. Bảo trì dự phòng, báo cáo hiệu suất hàng tháng. Đảm bảo hoạt động tối ưu suốt 25 năm.',
            duration: '25 năm',
          },
        ],
      },
      packages: {
        title: 'Các gói giải pháp công nghiệp',
        items: [
          {
            name: 'Gói Nhà Máy 200kW',
            capacity: '200 kW',
            panels: '440 tấm x 550W',
            inverter: 'Inverter 200kW (Industrial Grade)',
            production: '24,000 kWh/tháng',
            savings: '~120,000,000 VND/tháng',
            price: '2,200,000,000 VND',
            payback: '4 năm',
            ideal: 'Nhà máy vừa, xưởng sản xuất',
          },
          {
            name: 'Gói Sản Xuất 500kW',
            capacity: '500 kW',
            panels: '1,000 tấm x 550W',
            inverter: 'Inverter 500kW + SCADA',
            production: '60,000 kWh/tháng',
            savings: '~280,000,000 VND/tháng',
            price: '5,500,000,000 VND',
            payback: '4.5 năm',
            ideal: 'Nhà máy lớn, chuỗi sản xuất',
            featured: true,
          },
          {
            name: 'Gói Logistics 1MW+',
            capacity: '1 MW+',
            panels: '2,000+ tấm x 550W',
            inverter: 'Inverter 1MW+ + Energy Storage',
            production: '120,000+ kWh/tháng',
            savings: '~600,000,000+ VND/tháng',
            price: 'Báo giá theo dự án',
            payback: '3.5 năm',
            ideal: 'Kho logistics, tổ hợp công nghiệp',
          },
        ],
      },
      useCases: {
        title: 'Ứng dụng theo ngành công nghiệp',
        items: [
          {
            industry: 'Sản xuất Điện tử',
            icon: '🔌',
            capacity: '200-500kW',
            description: 'Nguồn điện ổn định cho dây chuyền sản xuất chính xác cao. Giảm chi phí vận hành, nâng cao năng lực cạnh tranh.',
          },
          {
            industry: 'Dệt May & Thời trang',
            icon: '👔',
            capacity: '300-800kW',
            description: 'Tiết kiệm lớn cho hoạt động dệt, nhuộm, may. Đạt chứng nhận môi trường, xuất khẩu thị trường khó tính.',
          },
          {
            industry: 'Thực phẩm & Đồ uống',
            icon: '🏭',
            capacity: '500kW-2MW',
            description: 'Điện sạch cho sản xuất thực phẩm, đáp ứng tiêu chuẩn vệ sinh. Giảm phí năng lượng, tăng lợi nhuận.',
          },
          {
            industry: 'Kho Logistics',
            icon: '📦',
            capacity: '1MW-5MW',
            description: 'Tối ưu chi phí vận hành kho lạnh, chiếu sáng, điều hòa. Mái kho rộng lớn phù hợp hệ thống MW+.',
          },
          {
            industry: 'Xi măng & Vật liệu',
            icon: '🏗️',
            capacity: '1-5MW',
            description: 'Giảm chi phí năng lượng lớn cho nghiền, nung. Cải thiện lợi nhuận trong ngành cạnh tranh khốc liệt.',
          },
          {
            industry: 'Ô tô & Cơ khí',
            icon: '🚗',
            capacity: '500kW-2MW',
            description: 'Năng lượng sạch cho dây chuyền lắp ráp, hàn, sơn. Đáp ứng yêu cầu ESG của OEM toàn cầu.',
          },
        ],
      },
      technicalSpecs: {
        title: 'Thông số kỹ thuật',
        items: [
          { label: 'Tấm pin', value: 'Mono PERC 550W, hiệu suất >21%' },
          { label: 'Inverter', value: 'Industrial Grade, IP65, hiệu suất >98%' },
          { label: 'Giá đỡ', value: 'Thép mạ kẽm, chịu bão cấp 12, bảo hành 25 năm' },
          { label: 'Cáp', value: 'Solar cable DC 4mm², 1.8kV, chống UV' },
          { label: 'Giám sát', value: 'SCADA 24/7, Mobile App, báo cáo tự động' },
          { label: 'Bảo hành', value: 'Tấm pin 25 năm, Inverter 10 năm, Thi công 5 năm' },
        ],
      },
    },
    en: {
      hero: {
        title: 'Industrial Solar Systems',
        subtitle: 'Grid independence, optimized production costs, continuous production with MW+ scale',
        stats: [
          { value: '50-60%', label: 'Energy cost reduction' },
          { value: '3-5 years', label: 'Payback' },
          { value: '24/7', label: 'SCADA monitoring' },
        ],
      },
      benefits: {
        title: 'Benefits for industrial production',
        items: [
          {
            icon: '⚡',
            title: 'Significant operating cost reduction',
            description: 'Save 50-60% on electricity bills. For 30,000 kWh/month factory, save ~$5,100-6,400/month, $61,200-76,800/year. Large scale delivers optimal economic efficiency.',
          },
          {
            icon: '🔋',
            title: 'Grid independence & Peak shaving',
            description: 'Reduce reliance on national grid, avoid power outage impacts. Peak shaving reduces demand charges and high-tariff electricity costs.',
          },
          {
            icon: '📈',
            title: 'Power quality & Production continuity',
            description: 'Stable power supply, reduced voltage fluctuations. Integrated energy storage ensures uninterrupted production, protecting expensive manufacturing equipment.',
          },
          {
            icon: '🏭',
            title: 'Optimize factory roof space',
            description: 'Utilize vast factory and warehouse roof areas. No production floor space required. Natural cooling effect for facilities, reducing HVAC costs.',
          },
        ],
      },
      process: {
        title: 'Professional EPC process',
        steps: [
          {
            number: '01',
            title: 'Technical assessment',
            description: '24/7 load survey, load curve analysis, roof structure assessment, electrical infrastructure survey. Shadow measurement, 3D simulation.',
            duration: '2-3 days',
          },
          {
            number: '02',
            title: 'EPC design',
            description: 'Detailed EPC (Engineering, Procurement, Construction) design. Capital cost calculation, NPV/IRR financial analysis, PVsyst production simulation.',
            duration: '7-10 days',
          },
          {
            number: '03',
            title: 'Installation & Commissioning',
            description: 'Installation per IEC standards, complete testing & commissioning. Operation team training, complete technical documentation handover. No production disruption.',
            duration: '15-30 days',
          },
          {
            number: '04',
            title: '24/7 SCADA monitoring',
            description: 'Centralized SCADA monitoring, early fault warnings. Preventive maintenance, monthly performance reports. Ensure optimal operation for 25 years.',
            duration: '25 years',
          },
        ],
      },
      packages: {
        title: 'Industrial solution packages',
        items: [
          {
            name: '200kW Factory Package',
            capacity: '200 kW',
            panels: '440 panels x 550W',
            inverter: '200kW Inverter (Industrial Grade)',
            production: '24,000 kWh/month',
            savings: '~$5,100/month',
            price: '$93,600',
            payback: '4 years',
            ideal: 'Mid-size factory, production facility',
          },
          {
            name: '500kW Manufacturing Package',
            capacity: '500 kW',
            panels: '1,000 panels x 550W',
            inverter: '500kW Inverter + SCADA',
            production: '60,000 kWh/month',
            savings: '~$11,900/month',
            price: '$234,000',
            payback: '4.5 years',
            ideal: 'Large factory, production chain',
            featured: true,
          },
          {
            name: '1MW+ Logistics Package',
            capacity: '1 MW+',
            panels: '2,000+ panels x 550W',
            inverter: '1MW+ Inverter + Energy Storage',
            production: '120,000+ kWh/month',
            savings: '~$25,500+ /month',
            price: 'Custom quote',
            payback: '3.5 years',
            ideal: 'Logistics warehouse, industrial complex',
          },
        ],
      },
      useCases: {
        title: 'Industry applications',
        items: [
          {
            industry: 'Electronics Manufacturing',
            icon: '🔌',
            capacity: '200-500kW',
            description: 'Stable power for high-precision production lines. Reduce operating costs, enhance competitiveness.',
          },
          {
            industry: 'Textile & Garment',
            icon: '👔',
            capacity: '300-800kW',
            description: 'Large savings for weaving, dyeing, sewing operations. Achieve environmental certification for demanding export markets.',
          },
          {
            industry: 'Food & Beverage',
            icon: '🏭',
            capacity: '500kW-2MW',
            description: 'Clean power for food production, meeting hygiene standards. Reduce energy costs, increase profits.',
          },
          {
            industry: 'Logistics Warehouse',
            icon: '📦',
            capacity: '1MW-5MW',
            description: 'Optimize cold storage, lighting, HVAC operating costs. Large warehouse roofs suitable for MW+ systems.',
          },
          {
            industry: 'Cement & Materials',
            icon: '🏗️',
            capacity: '1-5MW',
            description: 'Reduce large energy costs for grinding, firing. Improve profits in fiercely competitive industry.',
          },
          {
            industry: 'Automotive & Mechanical',
            icon: '🚗',
            capacity: '500kW-2MW',
            description: 'Clean energy for assembly, welding, painting lines. Meet ESG requirements of global OEMs.',
          },
        ],
      },
      technicalSpecs: {
        title: 'Technical specifications',
        items: [
          { label: 'Solar panels', value: 'Mono PERC 550W, efficiency >21%' },
          { label: 'Inverter', value: 'Industrial Grade, IP65, efficiency >98%' },
          { label: 'Mounting', value: 'Galvanized steel, typhoon-proof grade 12, 25-year warranty' },
          { label: 'Cable', value: 'Solar cable DC 4mm², 1.8kV, UV-resistant' },
          { label: 'Monitoring', value: 'SCADA 24/7, Mobile App, automated reports' },
          { label: 'Warranty', value: 'Panels 25 years, Inverter 10 years, Installation 5 years' },
        ],
      },
    },
    zh: {
      hero: {
        title: '工业太阳能系统',
        subtitle: '电网独立，优化生产成本，MW+规模确保生产连续性',
        stats: [
          { value: '50-60%', label: '能源成本降低' },
          { value: '3-5年', label: '回本期' },
          { value: '24/7', label: 'SCADA监控' },
        ],
      },
      benefits: {
        title: '工业生产优势',
        items: [
          {
            icon: '⚡',
            title: '大幅降低运营成本',
            description: '节省50-60%电费。30,000 kWh/月工厂，节省约36,000-45,000元/月，432,000-540,000元/年。大规模带来最优经济效益。',
          },
          {
            icon: '🔋',
            title: '电网独立与削峰',
            description: '减少对国家电网依赖，避免停电影响。削峰降低需量费用和高峰电价成本。',
          },
          {
            icon: '📈',
            title: '电能质量与生产连续性',
            description: '稳定供电，减少电压波动。集成储能系统确保生产不中断，保护昂贵的制造设备。',
          },
          {
            icon: '🏭',
            title: '优化工厂屋顶空间',
            description: '利用工厂和仓库的广阔屋顶面积。不占用生产车间空间。自然降温效果，降低空调成本。',
          },
        ],
      },
      process: {
        title: '专业EPC流程',
        steps: [
          {
            number: '01',
            title: '技术评估',
            description: '24/7负荷调查，负荷曲线分析，屋顶结构评估，电气基础设施调查。阴影测量，3D模拟。',
            duration: '2-3天',
          },
          {
            number: '02',
            title: 'EPC设计',
            description: '详细的EPC（工程、采购、施工）设计。资本成本计算，NPV/IRR财务分析，PVsyst产量模拟。',
            duration: '7-10天',
          },
          {
            number: '03',
            title: '安装与调试',
            description: '按IEC标准安装，完整测试与调试。运营团队培训，完整技术文档交接。不中断生产。',
            duration: '15-30天',
          },
          {
            number: '04',
            title: '24/7 SCADA监控',
            description: '集中SCADA监控，早期故障预警。预防性维护，月度性能报告。确保25年最佳运行。',
            duration: '25年',
          },
        ],
      },
      packages: {
        title: '工业解决方案套餐',
        items: [
          {
            name: '200kW工厂套餐',
            capacity: '200 kW',
            panels: '440块 x 550W',
            inverter: '200kW逆变器（工业级）',
            production: '24,000 kWh/月',
            savings: '~36,000元/月',
            price: '66万元',
            payback: '4年',
            ideal: '中型工厂，生产设施',
          },
          {
            name: '500kW制造套餐',
            capacity: '500 kW',
            panels: '1,000块 x 550W',
            inverter: '500kW逆变器 + SCADA',
            production: '60,000 kWh/月',
            savings: '~84,000元/月',
            price: '165万元',
            payback: '4.5年',
            ideal: '大型工厂，生产链',
            featured: true,
          },
          {
            name: '1MW+物流套餐',
            capacity: '1 MW+',
            panels: '2,000+块 x 550W',
            inverter: '1MW+逆变器 + 储能',
            production: '120,000+ kWh/月',
            savings: '~180,000+元/月',
            price: '定制报价',
            payback: '3.5年',
            ideal: '物流仓库，工业综合体',
          },
        ],
      },
      useCases: {
        title: '行业应用',
        items: [
          {
            industry: '电子制造',
            icon: '🔌',
            capacity: '200-500kW',
            description: '为高精度生产线提供稳定电源。降低运营成本，提升竞争力。',
          },
          {
            industry: '纺织服装',
            icon: '👔',
            capacity: '300-800kW',
            description: '纺织、染色、缝纫作业大量节能。获得环保认证，出口高要求市场。',
          },
          {
            industry: '食品饮料',
            icon: '🏭',
            capacity: '500kW-2MW',
            description: '食品生产清洁能源，符合卫生标准。降低能源成本，增加利润。',
          },
          {
            industry: '物流仓库',
            icon: '📦',
            capacity: '1MW-5MW',
            description: '优化冷库、照明、空调运营成本。大型仓库屋顶适合MW+系统。',
          },
          {
            industry: '水泥建材',
            icon: '🏗️',
            capacity: '1-5MW',
            description: '降低研磨、烧制的巨大能源成本。在激烈竞争行业提高利润。',
          },
          {
            industry: '汽车机械',
            icon: '🚗',
            capacity: '500kW-2MW',
            description: '装配、焊接、喷漆线清洁能源。满足全球OEM的ESG要求。',
          },
        ],
      },
      technicalSpecs: {
        title: '技术规格',
        items: [
          { label: '太阳能板', value: '单晶PERC 550W，效率>21%' },
          { label: '逆变器', value: '工业级，IP65，效率>98%' },
          { label: '支架', value: '镀锌钢，12级抗台风，25年保修' },
          { label: '电缆', value: '太阳能电缆DC 4mm²，1.8kV，抗UV' },
          { label: '监控', value: 'SCADA 24/7，移动应用，自动报告' },
          { label: '保修', value: '组件25年，逆变器10年，安装5年' },
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
        {/* Hero Section - Teal/Cyan gradient */}
        <section className="relative bg-gradient-to-br from-teal-600 via-cyan-700 to-teal-900 text-white py-20">
          <Container>
            <div className="max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                {t.hero.title}
              </h1>
              <p className="text-2xl mb-12 text-teal-100">
                {t.hero.subtitle}
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {t.hero.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-bold text-yellow-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-teal-200">
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
                <div key={idx} className="bg-teal-50 rounded-xl p-8 border-2 border-teal-100">
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
                  <div className="bg-white rounded-xl p-6 shadow-lg border-t-4 border-teal-500">
                    <div className="text-6xl font-bold text-teal-100 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {step.description}
                    </p>
                    <div className="text-sm text-teal-600 font-semibold">
                      ⏱️ {step.duration}
                    </div>
                  </div>
                  
                  {idx < t.process.steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-teal-300">
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
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.useCases.items.map((useCase, idx) => (
                <div key={idx} className="bg-white border-2 border-teal-100 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all">
                  <div className="text-5xl mb-4 text-center">{useCase.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                    {useCase.industry}
                  </h3>
                  <div className="text-sm text-teal-600 font-semibold mb-3 text-center">
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
                      ? 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-2xl scale-105 relative' 
                      : 'bg-white border-2 border-teal-200'
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
                  <div className={`text-4xl font-bold mb-6 ${pkg.featured ? 'text-yellow-300' : 'text-teal-600'}`}>
                    {pkg.capacity}
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className={`text-sm ${pkg.featured ? 'text-teal-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Cấu hình:' : locale === 'zh' ? '配置:' : 'Configuration:'}</strong>
                      <div>• {pkg.panels}</div>
                      <div>• {pkg.inverter}</div>
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-teal-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Sản lượng:' : locale === 'zh' ? '产量:' : 'Production:'}</strong> {pkg.production}
                    </div>
                    <div className={`text-sm ${pkg.featured ? 'text-teal-100' : 'text-gray-600'}`}>
                      <strong>{locale === 'vi' ? 'Tiết kiệm:' : locale === 'zh' ? '节省:' : 'Savings:'}</strong> {pkg.savings}
                    </div>
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${pkg.featured ? 'text-white' : 'text-gray-900'}`}>
                    {pkg.price}
                  </div>
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-teal-200' : 'text-gray-600'}`}>
                    {locale === 'vi' ? 'Hoàn vốn:' : locale === 'zh' ? '回本:' : 'Payback:'} {pkg.payback}
                  </div>
                  
                  <div className={`text-sm mb-6 ${pkg.featured ? 'text-teal-100' : 'text-gray-600'}`}>
                    <strong>{locale === 'vi' ? 'Phù hợp:' : locale === 'zh' ? '适合:' : 'Ideal for:'}</strong> {pkg.ideal}
                  </div>
                  
                  <Link
                    href={`/${locale}/lien-he?package=${encodeURIComponent(pkg.name)}`}
                    className={`block text-center py-3 rounded-lg font-semibold transition-all ${
                      pkg.featured
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-gray-900'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {locale === 'vi' ? 'Nhận báo giá' : locale === 'zh' ? '获取报价' : 'Get quote'}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
        
        {/* Technical Specs Section */}
        <section className="py-20 bg-teal-50">
          <Container>
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
              {t.technicalSpecs.title}
            </h2>
            
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border-2 border-teal-200">
              <div className="grid md:grid-cols-2 gap-6">
                {t.technicalSpecs.items.map((spec, idx) => (
                  <div key={idx} className="flex items-start">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1">{spec.label}</div>
                      <div className="text-gray-600 text-sm">{spec.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700">
          <Container>
            <div className="text-center text-white max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                {locale === 'vi' ? 'Tối ưu chi phí sản xuất ngay hôm nay' : locale === 'zh' ? '今天开始优化生产成本' : 'Optimize production costs today'}
              </h2>
              <p className="text-xl mb-8 text-teal-100">
                {locale === 'vi' 
                  ? 'Tư vấn EPC miễn phí và đánh giá kỹ thuật chi tiết cho nhà máy của bạn'
                  : locale === 'zh'
                  ? '为您的工厂提供免费EPC咨询和详细技术评估'
                  : 'Free EPC consultation and detailed technical assessment for your factory'}
              </p>
              
              <SmartCTAWithHover 
                defaultText={locale === 'vi' ? 'Đăng ký tư vấn EPC' : locale === 'zh' ? '注册EPC咨询' : 'Register EPC consultation'}
                defaultHref={`/${locale}/lien-he?type=industrial`}
                variant="primary"
              />
              
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-teal-100">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {locale === 'vi' ? 'Đánh giá miễn phí' : locale === 'zh' ? '免费评估' : 'Free assessment'}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {locale === 'vi' ? 'Báo cáo ROI chi tiết' : locale === 'zh' ? '详细ROI报告' : 'Detailed ROI report'}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {locale === 'vi' ? 'Tư vấn 24/7' : locale === 'zh' ? '24/7咨询' : '24/7 consultation'}
                </div>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

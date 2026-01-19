/**
 * Project Case Study Detail Page
 * Semantic URL: /[locale]/du-an/[projectId]
 */

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { generateBreadcrumbSchema } from '@/lib/schema';
import { MapPin, Calendar, Zap, TrendingDown, Award, CheckCircle2 } from 'lucide-react';

interface PageProps {
  params: {
    locale: string;
    projectId: string;
  };
}

// Mock project data
const projectsData = {
  'khach-san-abc-tphcm': {
    vi: {
      name: 'Khách sạn ABC',
      location: 'Quận 7, TP. Hồ Chí Minh',
      type: 'commercial',
      region: 'south',
      capacity: 50,
      savings: 60,
      payback: 4.5,
      installDate: '2025-06-15',
      rating: 5,
      investment: 650000000,
      monthlyBillBefore: 35000000,
      monthlyBillAfter: 14000000,
      challenge: 'Khách sạn 3 sao với 50 phòng đang gặp khó khăn với hóa đơn điện cao, đặc biệt trong mùa cao điểm du lịch. Chi phí điện chiếm 15% tổng chi phí vận hành.',
      solution: 'Golden Energy thiết kế hệ thống 50kW trên mái với 110 tấm pin Mono PERC 450W, biến tần hybrid cho phép lưu trữ năng lượng dự phòng.',
      testimonial: 'Đầu tư vào hệ thống điện mặt trời là quyết định đúng đắn nhất của khách sạn. Chúng tôi đã giảm 60% hóa đơn điện, tiết kiệm hơn 20 triệu đồng mỗi tháng. Hệ thống hoạt động ổn định, không ảnh hưởng đến hoạt động kinh doanh. Đội ngũ Golden Energy rất chuyên nghiệp, lắp đặt nhanh chóng và hỗ trợ tận tình. Sau 4-5 năm sẽ hoàn vốn và sau đó là lợi nhuận thuần. Tôi rất hài lòng và đã giới thiệu cho nhiều đối tác khác.',
      customerName: 'Ông Nguyễn Văn A',
      customerTitle: 'Tổng Giám Đốc Khách sạn ABC',
      specs: {
        panels: 110,
        panelType: 'Mono PERC 450W - Longi Solar',
        inverter: 'Growatt Hybrid 50kW',
        battery: 'Pylontech 30kWh',
        roofArea: 350,
      }
    },
    en: {
      name: 'ABC Hotel',
      location: 'District 7, Ho Chi Minh City',
      type: 'commercial',
      region: 'south',
      capacity: 50,
      savings: 60,
      payback: 4.5,
      installDate: '2025-06-15',
      rating: 5,
      investment: 650000000,
      monthlyBillBefore: 35000000,
      monthlyBillAfter: 14000000,
      challenge: '3-star hotel with 50 rooms facing high electricity bills, especially during peak tourist season. Electricity cost accounts for 15% of total operating expenses.',
      solution: 'Golden Energy designed a 50kW rooftop system with 110 Mono PERC 450W panels, hybrid inverter for backup power storage.',
      testimonial: 'Investing in the solar system was the best decision for our hotel. We reduced electricity bills by 60%, saving over 20 million VND per month. The system operates stably without affecting business operations. Golden Energy team is very professional, quick installation and excellent support. Payback in 4-5 years and pure profit after that. Very satisfied and have recommended to many partners.',
      customerName: 'Mr. Nguyen Van A',
      customerTitle: 'General Director, ABC Hotel',
      specs: {
        panels: 110,
        panelType: 'Mono PERC 450W - Longi Solar',
        inverter: 'Growatt Hybrid 50kW',
        battery: 'Pylontech 30kWh',
        roofArea: 350,
      }
    },
    zh: {
      name: 'ABC酒店',
      location: '胡志明市第7郡',
      type: 'commercial',
      region: 'south',
      capacity: 50,
      savings: 60,
      payback: 4.5,
      installDate: '2025-06-15',
      rating: 5,
      investment: 650000000,
      monthlyBillBefore: 35000000,
      monthlyBillAfter: 14000000,
      challenge: '拥有50间客房的三星级酒店面临高昂电费,特别是在旅游旺季。电费占总运营成本的15%。',
      solution: 'Golden Energy设计了50kW屋顶系统,配备110块Mono PERC 450W面板,混合逆变器可储存备用电力。',
      testimonial: '投资太阳能系统是我们酒店最正确的决定。我们将电费降低了60%,每月节省超过2000万越南盾。系统运行稳定,不影响业务运营。Golden Energy团队非常专业,安装快速,支持周到。4-5年即可回本,之后就是纯利润。非常满意,已推荐给许多合作伙伴。',
      customerName: '阮文A先生',
      customerTitle: 'ABC酒店总经理',
      specs: {
        panels: 110,
        panelType: 'Mono PERC 450W - Longi Solar',
        inverter: 'Growatt Hybrid 50kW',
        battery: 'Pylontech 30kWh',
        roofArea: 350,
      }
    }
  },
  'nha-may-det-may-binh-duong': {
    vi: {
      name: 'Nhà máy dệt may',
      location: 'Bình Dương',
      type: 'industrial',
      region: 'south',
      capacity: 500,
      savings: 55,
      payback: 3.5,
      installDate: '2024-09-20',
      rating: 5,
      investment: 5500000000,
      monthlyBillBefore: 280000000,
      monthlyBillAfter: 126000000,
      challenge: 'Nhà máy hoạt động 24/7 với chi phí điện rất cao. Cần giảm chi phí sản xuất để cạnh tranh.',
      solution: 'Hệ thống 500kW với 1000 tấm pin công nghiệp, SCADA giám sát thời gian thực.',
      testimonial: 'Hệ thống hoạt động vượt mong đợi. Tiết kiệm 150 triệu/tháng, hoàn vốn chỉ 3.5 năm.',
      customerName: 'Bà Trần Thị B',
      customerTitle: 'Giám Đốc Nhà máy',
      specs: {
        panels: 1000,
        panelType: 'Mono PERC 550W - JA Solar',
        inverter: 'SMA Industrial 500kW',
        battery: 'N/A',
        roofArea: 7000,
      }
    },
    en: { name: 'Textile Factory', location: 'Binh Duong', type: 'industrial', region: 'south', capacity: 500, savings: 55, payback: 3.5, installDate: '2024-09-20', rating: 5, investment: 5500000000, monthlyBillBefore: 280000000, monthlyBillAfter: 126000000, challenge: 'Factory operates 24/7 with very high electricity costs. Need to reduce production costs to compete.', solution: '500kW system with 1000 industrial panels, real-time SCADA monitoring.', testimonial: 'System exceeds expectations. Saving 150M VND/month, payback only 3.5 years.', customerName: 'Mrs. Tran Thi B', customerTitle: 'Factory Director', specs: { panels: 1000, panelType: 'Mono PERC 550W - JA Solar', inverter: 'SMA Industrial 500kW', battery: 'N/A', roofArea: 7000 } },
    zh: { name: '纺织厂', location: '平阳省', type: 'industrial', region: 'south', capacity: 500, savings: 55, payback: 3.5, installDate: '2024-09-20', rating: 5, investment: 5500000000, monthlyBillBefore: 280000000, monthlyBillAfter: 126000000, challenge: '工厂24/7运营,电费非常高。需要降低生产成本以保持竞争力。', solution: '500kW系统配备1000块工业面板,实时SCADA监控。', testimonial: '系统超出预期。每月节省1.5亿越南盾,仅需3.5年回本。', customerName: '陈氏B女士', customerTitle: '工厂厂长', specs: { panels: 1000, panelType: 'Mono PERC 550W - JA Solar', inverter: 'SMA Industrial 500kW', battery: 'N/A', roofArea: 7000 } }
  },
  'biet-thu-anh-minh-da-nang': {
    vi: {
      name: 'Biệt thự anh Minh',
      location: 'Đà Nẵng',
      type: 'residential',
      region: 'central',
      capacity: 10,
      savings: 80,
      payback: 5.5,
      installDate: '2025-03-10',
      rating: 5,
      investment: 150000000,
      monthlyBillBefore: 3500000,
      monthlyBillAfter: 700000,
      challenge: 'Biệt thự lớn với nhiều thiết bị điện, hóa đơn cao đặc biệt mùa hè.',
      solution: 'Hệ thống 10kW trên mái với pin lưu trữ cho điều hòa ban đêm.',
      testimonial: 'Hệ thống hoạt động hoàn hảo. Nhà luôn mát mà không lo hóa đơn điện.',
      customerName: 'Anh Nguyễn Văn Minh',
      customerTitle: 'Chủ nhà',
      specs: {
        panels: 22,
        panelType: 'Mono PERC 450W - Canadian Solar',
        inverter: 'Growatt Hybrid 10kW',
        battery: 'Pylontech 15kWh',
        roofArea: 80,
      }
    },
    en: { name: 'Mr. Minh Villa', location: 'Da Nang', type: 'residential', region: 'central', capacity: 10, savings: 80, payback: 5.5, installDate: '2025-03-10', rating: 5, investment: 150000000, monthlyBillBefore: 3500000, monthlyBillAfter: 700000, challenge: 'Large villa with many electrical appliances, high bills especially in summer.', solution: '10kW rooftop system with battery storage for night AC.', testimonial: 'System works perfectly. House is always cool without worrying about electricity bills.', customerName: 'Mr. Nguyen Van Minh', customerTitle: 'Homeowner', specs: { panels: 22, panelType: 'Mono PERC 450W - Canadian Solar', inverter: 'Growatt Hybrid 10kW', battery: 'Pylontech 15kWh', roofArea: 80 } },
    zh: { name: '明先生别墅', location: '岘港市', type: 'residential', region: 'central', capacity: 10, savings: 80, payback: 5.5, installDate: '2025-03-10', rating: 5, investment: 150000000, monthlyBillBefore: 3500000, monthlyBillAfter: 700000, challenge: '大型别墅电器众多,夏季电费特别高。', solution: '10kW屋顶系统配备储能电池,供夜间空调使用。', testimonial: '系统运行完美。房子总是凉爽,无需担心电费。', customerName: '阮文明先生', customerTitle: '业主', specs: { panels: 22, panelType: 'Mono PERC 450W - Canadian Solar', inverter: 'Growatt Hybrid 10kW', battery: 'Pylontech 15kWh', roofArea: 80 } }
  }
};

export async function generateStaticParams() {
  const projectIds = Object.keys(projectsData);
  const locales = ['vi', 'en', 'zh', 'id'];
  
  return projectIds.flatMap(projectId =>
    locales.map(locale => ({ locale, projectId }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, projectId } = params;
  const project = projectsData[projectId as keyof typeof projectsData];
  const data = project?.[locale as keyof typeof project] || project?.vi;
  
  if (!data) return { title: 'Project Not Found' };
  
  return {
    title: `${data.name} - ${data.location} | Dự án Golden Energy`,
    description: `Dự án lắp đặt hệ thống điện mặt trời ${data.capacity}kW tại ${data.name}, ${data.location}. Tiết kiệm ${data.savings}% chi phí điện, hoàn vốn ${data.payback} năm.`,
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { locale, projectId } = params;
  const project = projectsData[projectId as keyof typeof projectsData];
  const data = project?.[locale as keyof typeof project] || project?.vi;
  
  if (!data) return <div>Project not found</div>;
  
  const typeColors = {
    residential: 'bg-blue-100 text-blue-700',
    commercial: 'bg-indigo-100 text-indigo-700',
    industrial: 'bg-teal-100 text-teal-700',
  };
  
  const typeLabels = {
    vi: { residential: 'Hộ gia đình', commercial: 'Thương mại', industrial: 'Công nghiệp' },
    en: { residential: 'Residential', commercial: 'Commercial', industrial: 'Industrial' },
    zh: { residential: '住宅', commercial: '商业', industrial: '工业' },
  };
  
  const breadcrumbPath = `/${locale}/du-an/${projectId}`;
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any);
  
  const translations = {
    vi: {
      backToProjects: 'Quay lại dự án',
      verified: 'Khách hàng xác thực',
      challenge: 'Thách thức',
      solution: 'Giải pháp',
      results: 'Kết quả',
      beforeAfter: 'So sánh trước/sau',
      monthlyBill: 'Hóa đơn điện hàng tháng',
      reduction: 'Giảm',
      testimonial: 'Đánh giá khách hàng',
      specs: 'Thông số kỹ thuật',
      systemSize: 'Công suất hệ thống',
      panels: 'Số lượng tấm pin',
      panelType: 'Loại tấm pin',
      inverter: 'Biến tần',
      battery: 'Pin lưu trữ',
      roofArea: 'Diện tích mái',
      investment: 'Tổng đầu tư',
      installDate: 'Ngày lắp đặt',
      similarProjects: 'Dự án tương tự',
      ctaTitle: 'Bạn cũng muốn tiết kiệm như vậy?',
      ctaSubtitle: 'Tính toán ngay để biết chi phí và lợi ích cho dự án của bạn',
      calculator: 'Tính toán ngay',
      consultation: 'Tư vấn miễn phí',
    },
    en: {
      backToProjects: 'Back to projects',
      verified: 'Verified customer',
      challenge: 'Challenge',
      solution: 'Solution',
      results: 'Results',
      beforeAfter: 'Before/After comparison',
      monthlyBill: 'Monthly electricity bill',
      reduction: 'Reduction',
      testimonial: 'Customer review',
      specs: 'Technical specifications',
      systemSize: 'System capacity',
      panels: 'Number of panels',
      panelType: 'Panel type',
      inverter: 'Inverter',
      battery: 'Battery storage',
      roofArea: 'Roof area',
      investment: 'Total investment',
      installDate: 'Installation date',
      similarProjects: 'Similar projects',
      ctaTitle: 'Want to save like this too?',
      ctaSubtitle: 'Calculate now to know cost and benefits for your project',
      calculator: 'Calculate now',
      consultation: 'Free consultation',
    },
    zh: {
      backToProjects: '返回项目',
      verified: '认证客户',
      challenge: '挑战',
      solution: '解决方案',
      results: '结果',
      beforeAfter: '前后对比',
      monthlyBill: '月度电费',
      reduction: '减少',
      testimonial: '客户评价',
      specs: '技术规格',
      systemSize: '系统容量',
      panels: '面板数量',
      panelType: '面板类型',
      inverter: '逆变器',
      battery: '储能电池',
      roofArea: '屋顶面积',
      investment: '总投资',
      installDate: '安装日期',
      similarProjects: '类似项目',
      ctaTitle: '您也想这样节省吗?',
      ctaSubtitle: '立即计算以了解您项目的成本和收益',
      calculator: '立即计算',
      consultation: '免费咨询',
    },
  };
  
  const t = translations[locale as keyof typeof translations] || translations.vi;
  const typeLabel = typeLabels[locale as keyof typeof typeLabels] || typeLabels.vi;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-r from-blue-900 to-blue-700">
          <div className="absolute inset-0 bg-black/20" />
          <Container>
            <div className="relative z-10 flex flex-col justify-center h-96 text-white">
              <Link
                href={`/${locale}/du-an`}
                className="inline-flex items-center text-white/90 hover:text-white mb-4"
              >
                ← {t.backToProjects}
              </Link>
              
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColors[data.type as keyof typeof typeColors]}`}>
                  {typeLabel[data.type as keyof typeof typeLabel]}
                </span>
                <span className="flex items-center text-white/90">
                  <MapPin className="w-4 h-4 mr-1" />
                  {data.location}
                </span>
              </div>
              
              <h1 className="text-5xl font-bold mb-4">{data.name}</h1>
              
              <div className="flex flex-wrap gap-8">
                <div>
                  <div className="text-3xl font-bold">{data.capacity}kW</div>
                  <div className="text-white/80">{t.systemSize}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{data.savings}%</div>
                  <div className="text-white/80">{t.reduction}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{data.payback} năm</div>
                  <div className="text-white/80">Payback</div>
                </div>
                <div>
                  <div className="flex text-3xl font-bold">
                    {'★'.repeat(data.rating)}
                  </div>
                  <div className="text-white/80">{data.rating}/5 Rating</div>
                </div>
              </div>
            </div>
          </Container>
        </div>
        
        <Container>
          <div className="grid lg:grid-cols-3 gap-12 py-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Challenge */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t.challenge}</h2>
                <p className="text-gray-700 text-lg leading-relaxed">{data.challenge}</p>
              </section>
              
              {/* Solution */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t.solution}</h2>
                <p className="text-gray-700 text-lg leading-relaxed">{data.solution}</p>
              </section>
              
              {/* Results */}
              <section>
                <h2 className="text-2xl font-bold mb-4">{t.results}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">{t.monthlyBill}</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(data.monthlyBillBefore)}
                        </div>
                        <div className="text-sm text-gray-600">Trước</div>
                      </div>
                      <div className="text-3xl text-gray-400">→</div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(data.monthlyBillAfter)}
                        </div>
                        <div className="text-sm text-gray-600">Sau</div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                        <TrendingDown className="w-4 h-4 mr-1" />
                        {t.reduction} {data.savings}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">ROI Timeline</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tổng đầu tư</span>
                        <span className="font-bold">{formatCurrency(data.investment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tiết kiệm/tháng</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(data.monthlyBillBefore - data.monthlyBillAfter)}
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">Hoàn vốn</span>
                        <span className="font-bold text-blue-600">{data.payback} năm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Testimonial */}
              <section className="bg-yellow-50 p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{data.customerName}</div>
                    <div className="text-gray-600">{data.customerTitle}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-yellow-500">{'★'.repeat(data.rating)}</div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {t.verified}
                      </span>
                    </div>
                  </div>
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  "{data.testimonial}"
                </blockquote>
              </section>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Specs Card */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-4">{t.specs}</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">{t.systemSize}</div>
                    <div className="font-bold">{data.capacity} kW</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t.panels}</div>
                    <div className="font-bold">{data.specs.panels} tấm</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t.panelType}</div>
                    <div className="font-bold text-sm">{data.specs.panelType}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t.inverter}</div>
                    <div className="font-bold text-sm">{data.specs.inverter}</div>
                  </div>
                  {data.specs.battery !== 'N/A' && (
                    <div>
                      <div className="text-sm text-gray-600">{t.battery}</div>
                      <div className="font-bold text-sm">{data.specs.battery}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">{t.roofArea}</div>
                    <div className="font-bold">{data.specs.roofArea} m²</div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600">{t.installDate}</div>
                    <div className="font-bold flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(data.installDate).toLocaleDateString(locale)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t.investment}</div>
                    <div className="font-bold text-blue-600">{formatCurrency(data.investment)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
        
        {/* CTA Section */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-16">
          <Container>
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">{t.ctaTitle}</h2>
              <p className="text-xl mb-8 text-white/90">{t.ctaSubtitle}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href={`/${locale}/tinh-toan`}
                  className="px-8 py-4 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105"
                >
                  {t.calculator}
                </Link>
                <Link
                  href={`/${locale}/lien-he`}
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-all"
                >
                  {t.consultation}
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </>
  );
}

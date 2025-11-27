import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import SolarCalculator from "@/components/SolarCalculator";
import { isLocale, type Locale } from "@/lib/i18n";

interface HybridPageProps {
  params: Promise<{ locale: string }>;
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }
  return candidate;
}

const CONTENT = {
  vi: {
    title: "Hệ Thống Hybrid",
    subtitle: "Solar + Wind + Battery + IoT - Năng lượng 24/7",
    hero: {
      title: "Hybrid Solar+Wind+Battery System",
      description: "Kết hợp mặt trời, gió, pin lưu trữ, điều khiển IoT. Hoạt động 24/7, độc lập lưới điện, ROI nhanh hơn 30-40%."
    },
    components: {
      title: "Thành Phần Hệ Thống",
      items: [
        {
          icon: "☀️",
          name: "Solar Panels",
          spec: "Mono PERC 450-550W, hiệu suất 21-23%, 25-year warranty",
          role: "Nguồn chính ban ngày, đóng góp 60-70% sản lượng"
        },
        {
          icon: "💨",
          name: "Wind Turbines",
          spec: "10-100kW HAWT/VAWT, hoạt động 3-25 m/s wind speed",
          role: "Bổ sung ban đêm & mùa mưa, đóng góp 30-40% sản lượng"
        },
        {
          icon: "🔋",
          name: "Battery Storage",
          spec: "LiFePO4 50-500kWh, 6000+ cycles, DoD 90%, BMS smart",
          role: "Lưu trữ dư thừa, cung cấp ban đêm, backup 8-24 giờ"
        },
        {
          icon: "🔌",
          name: "Hybrid Inverter",
          spec: "50-500kW bidirectional, MPPT tracking, grid-tie/off-grid",
          role: "Điều phối 4 nguồn: Solar, Wind, Battery, Grid"
        },
        {
          icon: "🤖",
          name: "IoT Controller",
          spec: "Edge computing gateway, AI optimization, 24/7 monitoring",
          role: "Tự động chuyển nguồn theo giá điện & thời tiết"
        }
      ]
    },
    why: {
      title: "Tại Sao Chọn Hybrid?",
      comparison: [
        {
          system: "Chỉ Solar",
          uptime: "~8 giờ/ngày (ban ngày)",
          capacity: "100%",
          roi: "8-10 năm",
          grid: "Phụ thuộc 60% lưới điện"
        },
        {
          system: "Chỉ Wind",
          uptime: "~12 giờ/ngày (không ổn định)",
          capacity: "100%",
          roi: "10-12 năm",
          grid: "Phụ thuộc 70% lưới điện"
        },
        {
          system: "Hybrid Solar+Wind+Battery",
          uptime: "24/7 (liên tục)",
          capacity: "150-200%",
          roi: "5-7 năm",
          grid: "Độc lập 90% hoặc 100% off-grid"
        }
      ]
    },
    calculator: {
      title: "Ước Tính Hệ Thống Hybrid",
      description: "Calculator dưới đây tính toán phần Solar. Sau đó chúng tôi sẽ tư vấn thêm Wind (30-40% công suất Solar) và Battery (1-2 ngày dự trữ).",
      note: "💡 Hệ thống Hybrid thường cần: Solar base + Wind = 1.3x-1.5x Solar + Battery = 1.5x-2x công suất ngày"
    },
    roi: {
      title: "Phân Tích ROI",
      scenario: {
        name: "Resort Phú Quốc 600kW Hybrid",
        details: "500kW Solar + 100kW Wind + 400kWh Battery + IoT",
        cost: "Đầu tư: ~$600,000 USD (~15 tỷ VNĐ)",
        savings: [
          "Tiết kiệm điện: $12,000/tháng (~300M VNĐ)",
          "Bán điện dư: $3,000/tháng (~75M VNĐ)",
          "Tổng thu: $180,000/năm (~4.5 tỷ VNĐ)",
          "ROI: 3.3 năm, lợi nhuận 22 năm còn lại"
        ]
      },
      benefits: [
        "✅ Không lo cúp điện, hoạt động 24/7",
        "✅ Giảm 90-100% hóa đơn điện",
        "✅ Không phụ thuộc giá điện tăng",
        "✅ Tăng giá trị bất động sản 10-15%",
        "✅ Hình ảnh xanh, thu hút khách hàng"
      ]
    },
    caseStudies: {
      title: "Dự Án Hybrid Tiêu Biểu",
      items: [
        {
          name: "Resort Phú Quốc 600kW",
          system: "500kW Solar + 100kW Wind + 400kWh Battery",
          result: "100% off-grid, tiết kiệm $15,000/tháng, ROI 3.5 năm"
        },
        {
          name: "Nhà máy Bình Dương 1.5MW",
          system: "1MW Solar + 500kW Wind + 800kWh Battery + IoT",
          result: "Giảm 85% lưới điện, phát hiện sớm sự cố, ROI 5 năm"
        },
        {
          name: "Khu đô thị Đà Nẵng 3MW",
          system: "2MW Solar + 1MW Wind + 2MWh Battery + Microgrid",
          result: "Cung cấp 300 hộ, cân bằng tải, ROI 6 năm"
        }
      ]
    },
    cta: {
      title: "Nhận Báo Giá Hệ Thống Hybrid",
      description: "Đội ngũ GoldenEnergy sẽ khảo sát địa điểm, đo gió & mặt trời 3 tháng, thiết kế hệ thống tối ưu, báo giá chi tiết & hỗ trợ vay vốn",
      button: "Đăng ký khảo sát miễn phí"
    }
  },
  en: {
    title: "Hybrid Systems",
    subtitle: "Solar + Wind + Battery + IoT - 24/7 Energy",
    hero: {
      title: "Hybrid Solar+Wind+Battery System",
      description: "Combine solar, wind, battery storage, IoT control. 24/7 operation, grid independence, 30-40% faster ROI."
    },
    components: {
      title: "System Components",
      items: [
        {
          icon: "☀️",
          name: "Solar Panels",
          spec: "Mono PERC 450-550W, efficiency 21-23%, 25-year warranty",
          role: "Main source during day, contributes 60-70% output"
        },
        {
          icon: "💨",
          name: "Wind Turbines",
          spec: "10-100kW HAWT/VAWT, operates 3-25 m/s wind speed",
          role: "Supplement at night & rainy season, contributes 30-40% output"
        },
        {
          icon: "🔋",
          name: "Battery Storage",
          spec: "LiFePO4 50-500kWh, 6000+ cycles, DoD 90%, smart BMS",
          role: "Store surplus, supply at night, 8-24 hour backup"
        },
        {
          icon: "🔌",
          name: "Hybrid Inverter",
          spec: "50-500kW bidirectional, MPPT tracking, grid-tie/off-grid",
          role: "Coordinate 4 sources: Solar, Wind, Battery, Grid"
        },
        {
          icon: "🤖",
          name: "IoT Controller",
          spec: "Edge computing gateway, AI optimization, 24/7 monitoring",
          role: "Auto switch source by electricity price & weather"
        }
      ]
    },
    why: {
      title: "Why Choose Hybrid?",
      comparison: [
        {
          system: "Solar Only",
          uptime: "~8 hours/day (daytime)",
          capacity: "100%",
          roi: "8-10 years",
          grid: "60% grid dependent"
        },
        {
          system: "Wind Only",
          uptime: "~12 hours/day (unstable)",
          capacity: "100%",
          roi: "10-12 years",
          grid: "70% grid dependent"
        },
        {
          system: "Hybrid Solar+Wind+Battery",
          uptime: "24/7 (continuous)",
          capacity: "150-200%",
          roi: "5-7 years",
          grid: "90% independent or 100% off-grid"
        }
      ]
    },
    calculator: {
      title: "Estimate Hybrid System",
      description: "Calculator below calculates Solar portion. We will then consult on Wind (30-40% of Solar capacity) and Battery (1-2 day reserve).",
      note: "💡 Hybrid systems typically need: Solar base + Wind = 1.3x-1.5x Solar + Battery = 1.5x-2x daily capacity"
    },
    roi: {
      title: "ROI Analysis",
      scenario: {
        name: "Phu Quoc Resort 600kW Hybrid",
        details: "500kW Solar + 100kW Wind + 400kWh Battery + IoT",
        cost: "Investment: ~$600,000 USD",
        savings: [
          "Electricity savings: $12,000/month",
          "Feed-in tariff: $3,000/month",
          "Total income: $180,000/year",
          "ROI: 3.3 years, 22-year remaining profit"
        ]
      },
      benefits: [
        "✅ No blackout worry, 24/7 operation",
        "✅ 90-100% bill reduction",
        "✅ No dependency on rising electricity prices",
        "✅ Property value increase 10-15%",
        "✅ Green image, attract customers"
      ]
    },
    caseStudies: {
      title: "Featured Hybrid Projects",
      items: [
        {
          name: "Phu Quoc Resort 600kW",
          system: "500kW Solar + 100kW Wind + 400kWh Battery",
          result: "100% off-grid, $15,000/month savings, 3.5-year ROI"
        },
        {
          name: "Binh Duong Factory 1.5MW",
          system: "1MW Solar + 500kW Wind + 800kWh Battery + IoT",
          result: "85% grid reduction, early fault detection, 5-year ROI"
        },
        {
          name: "Da Nang Urban Area 3MW",
          system: "2MW Solar + 1MW Wind + 2MWh Battery + Microgrid",
          result: "Supply 300 households, load balancing, 6-year ROI"
        }
      ]
    },
    cta: {
      title: "Get Hybrid System Quote",
      description: "GoldenEnergy team will survey location, measure wind & solar for 3 months, design optimal system, provide detailed quote & financing support",
      button: "Register free survey"
    }
  },
  zh: {
    title: "混合系统",
    subtitle: "太阳能+风能+电池+IoT - 24/7能源",
    hero: {
      title: "混合太阳能+风能+电池系统",
      description: "结合太阳能、风能、电池存储、IoT控制。24/7运行，电网独立，投资回报快30-40%。"
    },
    components: {
      title: "系统组件",
      items: [
        {
          icon: "☀️",
          name: "太阳能板",
          spec: "单晶PERC 450-550W，效率21-23%，25年保修",
          role: "白天主要来源，贡献60-70%产量"
        },
        {
          icon: "💨",
          name: "风力涡轮机",
          spec: "10-100kW水平/垂直轴，3-25 m/s风速运行",
          role: "夜间与雨季补充，贡献30-40%产量"
        },
        {
          icon: "🔋",
          name: "电池存储",
          spec: "磷酸铁锂50-500kWh，6000+循环，DoD 90%，智能BMS",
          role: "存储剩余，夜间供应，8-24小时备份"
        },
        {
          icon: "🔌",
          name: "混合逆变器",
          spec: "50-500kW双向，MPPT跟踪，并网/离网",
          role: "协调4个来源：太阳能、风能、电池、电网"
        },
        {
          icon: "🤖",
          name: "IoT控制器",
          spec: "边缘计算网关，AI优化，24/7监控",
          role: "根据电价和天气自动切换来源"
        }
      ]
    },
    why: {
      title: "为何选择混合系统？",
      comparison: [
        {
          system: "仅太阳能",
          uptime: "~8小时/天（白天）",
          capacity: "100%",
          roi: "8-10年",
          grid: "60%依赖电网"
        },
        {
          system: "仅风能",
          uptime: "~12小时/天（不稳定）",
          capacity: "100%",
          roi: "10-12年",
          grid: "70%依赖电网"
        },
        {
          system: "混合太阳能+风能+电池",
          uptime: "24/7（连续）",
          capacity: "150-200%",
          roi: "5-7年",
          grid: "90%独立或100%离网"
        }
      ]
    },
    calculator: {
      title: "估算混合系统",
      description: "下方计算器计算太阳能部分。然后我们将咨询风能（太阳能容量的30-40%）和电池（1-2天储备）。",
      note: "💡 混合系统通常需要：太阳能基础 + 风能 = 1.3x-1.5x太阳能 + 电池 = 1.5x-2x日容量"
    },
    roi: {
      title: "投资回报分析",
      scenario: {
        name: "富国度假村600kW混合系统",
        details: "500kW太阳能 + 100kW风能 + 400kWh电池 + IoT",
        cost: "投资：约$600,000美元",
        savings: [
          "电费节省：$12,000/月",
          "上网电价：$3,000/月",
          "总收入：$180,000/年",
          "投资回报：3.3年，剩余22年利润"
        ]
      },
      benefits: [
        "✅ 无停电担忧，24/7运行",
        "✅ 账单减少90-100%",
        "✅ 不依赖电价上涨",
        "✅ 房产价值增加10-15%",
        "✅ 绿色形象，吸引客户"
      ]
    },
    caseStudies: {
      title: "特色混合项目",
      items: [
        {
          name: "富国度假村600kW",
          system: "500kW太阳能 + 100kW风能 + 400kWh电池",
          result: "100%离网，月节省$15,000，3.5年投资回报"
        },
        {
          name: "平阳工厂1.5MW",
          system: "1MW太阳能 + 500kW风能 + 800kWh电池 + IoT",
          result: "减少85%电网，早期故障检测，5年投资回报"
        },
        {
          name: "岘港城区3MW",
          system: "2MW太阳能 + 1MW风能 + 2MWh电池 + 微电网",
          result: "供应300户家庭，负载平衡，6年投资回报"
        }
      ]
    },
    cta: {
      title: "获取混合系统报价",
      description: "GoldenEnergy团队将调查地点，测量3个月风速和太阳能，设计最佳系统，提供详细报价和融资支持",
      button: "注册免费调查"
    }
  }
};

export async function generateMetadata({ params }: HybridPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'Hybrid Solar+Wind+Battery Systems - GoldenEnergy | 24/7 Energy Independence',
    description: 'Hybrid Solar+Wind+Battery+IoT systems. 24/7 operation, 90-100% grid independence, 5-7 year ROI. 30-40% faster payback. Free survey & financing.',
  };
}

export default async function HybridPage({ params }: HybridPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const content = CONTENT[locale as keyof typeof CONTENT] || CONTENT['vi']; // Fallback to Vietnamese if locale not available

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <Section
        title={content.hero.title}
        subtitle={content.subtitle}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              {content.hero.description}
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Components */}
      <Section
        title={content.components.title}
        backgroundColor="bg-gray-50"
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {content.components.items.map((item, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="text-5xl">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{item.spec}</p>
                    <p className="text-gray-300 leading-relaxed">{item.role}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Why Hybrid */}
      <Section
        title={content.why.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-20">
              <thead>
                <tr className="bg-[#0A0A0A]/5">
                  <th className="p-4 text-left text-gray-900 font-light border border-gray-10">System</th>
                  <th className="p-4 text-left text-gray-900 font-light border border-gray-10">Uptime</th>
                  <th className="p-4 text-left text-gray-900 font-light border border-gray-10">Capacity</th>
                  <th className="p-4 text-left text-gray-900 font-light border border-gray-10">ROI</th>
                  <th className="p-4 text-left text-gray-900 font-light border border-gray-10">Grid Dependency</th>
                </tr>
              </thead>
              <tbody>
                {content.why.comparison.map((row, index: number) => (
                  <RevealOnScroll key={index} delay={0.1 * index}>
                    <tr className={index === 2 ? "bg-[#0A0A0A]/10" : "bg-[#0A0A0A]/5"}>
                      <td className="p-4 text-gray-900 font-light border border-gray-10">{row.system}</td>
                      <td className="p-4 text-gray-400 border border-gray-10">{row.uptime}</td>
                      <td className="p-4 text-gray-400 border border-gray-10">{row.capacity}</td>
                      <td className="p-4 text-gray-400 border border-gray-10">{row.roi}</td>
                      <td className="p-4 text-gray-400 border border-gray-10">{row.grid}</td>
                    </tr>
                  </RevealOnScroll>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Calculator */}
      <Section
        title={content.calculator.title}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-gray-300 leading-relaxed font-light mb-4">
              {content.calculator.description}
            </p>
            <div className="p-4 bg-[#0A0A0A]/5 border border-gray-10 inline-block">
              <p className="text-sm text-gray-400">{content.calculator.note}</p>
            </div>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <div className="max-w-6xl mx-auto">
            <SolarCalculator locale={locale} />
          </div>
        </RevealOnScroll>
      </Section>

      {/* ROI Analysis */}
      <Section
        title={content.roi.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll delay={0.1}>
            <div className="p-8 bg-[#0A0A0A]/5 border border-gray-10 mb-8">
              <h3 className="text-2xl font-light text-gray-900 mb-4">{content.roi.scenario.name}</h3>
              <p className="text-gray-400 mb-4">{content.roi.scenario.details}</p>
              <p className="text-gray-900 font-light mb-4">{content.roi.scenario.cost}</p>
              <ul className="space-y-2">
                {content.roi.scenario.savings.map((saving: string, index: number) => (
                  <li key={index} className="text-gray-300 flex gap-3">
                    <span>→</span>
                    <span>{saving}</span>
                  </li>
                ))}
              </ul>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="space-y-4">
              {content.roi.benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="text-2xl">{benefit.substring(0, 2)}</span>
                  <p className="text-gray-300 text-lg leading-relaxed flex-1">
                    {benefit.substring(3)}
                  </p>
                </div>
              ))}
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      {/* Case Studies */}
      <Section
        title={content.caseStudies.title}
        backgroundColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.caseStudies.items.map((item, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <h3 className="text-lg font-light text-gray-900 mb-3">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{item.system}</p>
                <p className="text-sm text-gray-300 leading-relaxed">{item.result}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section
        title={content.cta.title}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300 leading-relaxed mb-8 font-light">
              {content.cta.description}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block px-12 py-5 bg-[#D4AF37] text-white hover:bg-[#C19B2E] transition-all duration-500 font-semibold tracking-wider uppercase text-sm"
            >
              {content.cta.button}
            </Link>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}

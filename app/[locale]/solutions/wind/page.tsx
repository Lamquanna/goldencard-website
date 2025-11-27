import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";

interface WindPageProps {
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
    title: "Năng Lượng Gió",
    subtitle: "Giải pháp Wind Energy cho khu vực ven biển",
    hero: {
      title: "Hệ Thống Điện Gió",
      description: "Turbine gió 10-500kW, phù hợp resort, khu công nghiệp, nông nghiệp ven biển. Kết hợp với Solar tạo hệ thống Hybrid ổn định 24/7."
    },
    specs: {
      title: "Thông Số Kỹ Thuật",
      turbines: {
        title: "Turbine gió",
        items: [
          "Trục ngang (HAWT) 10-100kW, hiệu suất 35-45%",
          "Trục dọc (VAWT) 5-50kW, phù hợp gió đa hướng",
          "Tốc độ gió khởi động: 3-4 m/s",
          "Tốc độ gió định mức: 10-12 m/s",
          "Tuổi thọ: 20-25 năm, bảo hành 10 năm"
        ]
      },
      controller: {
        title: "Bộ điều khiển & Inverter",
        items: [
          "Grid-tie controller tự động hòa lưới",
          "Hybrid controller kết hợp Solar + Wind + Battery",
          "MPPT tracking tối ưu công suất",
          "Bảo vệ quá tốc, quá tải, sét đánh"
        ]
      },
      foundation: {
        title: "Móng & Cột đỡ",
        items: [
          "Móng bê tông chịu lực 20-50m³",
          "Cột thép mạ kẽm, cao 15-30m",
          "Chống rung, chống ăn mòn môi trường biển",
          "Tính toán chịu bão cấp 12-14"
        ]
      }
    },
    suitability: {
      title: "Địa Điểm Phù Hợp",
      locations: [
        {
          name: "Ven biển miền Trung",
          wind: "Gió mùa 6-9 m/s, mùa khô mạnh hơn",
          suitability: "⭐⭐⭐⭐⭐ Rất phù hợp"
        },
        {
          name: "Cao nguyên, vùng núi",
          wind: "Gió địa hình 5-8 m/s, ổn định",
          suitability: "⭐⭐⭐⭐ Phù hợp"
        },
        {
          name: "Đồng bằng nội địa",
          wind: "Gió yếu 3-5 m/s, không ổn định",
          suitability: "⭐⭐ Ít phù hợp, nên kết hợp Solar"
        }
      ]
    },
    caseStudies: {
      title: "Dự Án Tiêu Biểu",
      items: [
        {
          type: "Resort",
          title: "Resort Phú Quốc 100kW Wind + 500kW Solar",
          details: "2 turbine 50kW, giảm 65% phụ thuộc lưới điện, ROI 7 năm, hoạt động 24/7"
        },
        {
          type: "Industrial",
          title: "KCN ven biển 500kW Wind Farm",
          details: "5 turbine 100kW, cung cấp 35% nhu cầu điện xưởng, giảm 50% chi phí cao điểm"
        },
        {
          type: "Agriculture",
          title: "Trang trại nông nghiệp 30kW Hybrid",
          details: "1 turbine 10kW + 20kW solar, tưới tiêu tự động, tồn trữ pin 40kWh"
        }
      ]
    },
    hybrid: {
      title: "Hệ Thống Hybrid Wind + Solar",
      benefits: [
        "✅ Hoạt động 24/7: Gió ban đêm, mặt trời ban ngày",
        "✅ Ổn định nguồn: Bù trừ lẫn nhau khi thời tiết thay đổi",
        "✅ Tăng công suất: Gấp 1.5-2x so với chỉ dùng Solar",
        "✅ Giảm dung lượng pin: Tiết kiệm 30-40% chi phí lưu trữ",
        "✅ ROI nhanh hơn: 5-7 năm thay vì 8-10 năm"
      ],
      ratio: "Tỷ lệ tối ưu: Wind 30-40% + Solar 60-70%"
    },
    cta: {
      title: "Khảo Sát Tiềm Năng Gió",
      description: "Đội ngũ kỹ sư GoldenEnergy sẽ đo tốc độ gió 3-6 tháng, phân tích dữ liệu, thiết kế hệ thống tối ưu cho địa điểm của bạn",
      button: "Đăng ký khảo sát miễn phí"
    }
  },
  en: {
    title: "Wind Energy",
    subtitle: "Wind Energy Solutions for Coastal Areas",
    hero: {
      title: "Wind Power Systems",
      description: "10-500kW wind turbines, suitable for coastal resorts, industrial parks, agriculture. Combined with Solar to create stable 24/7 Hybrid system."
    },
    specs: {
      title: "Technical Specifications",
      turbines: {
        title: "Wind Turbines",
        items: [
          "Horizontal axis (HAWT) 10-100kW, efficiency 35-45%",
          "Vertical axis (VAWT) 5-50kW, suitable for multidirectional wind",
          "Cut-in wind speed: 3-4 m/s",
          "Rated wind speed: 10-12 m/s",
          "Lifespan: 20-25 years, 10-year warranty"
        ]
      },
      controller: {
        title: "Controller & Inverter",
        items: [
          "Grid-tie controller automatic grid connection",
          "Hybrid controller combines Solar + Wind + Battery",
          "MPPT tracking optimizes power",
          "Protection against overspeed, overload, lightning"
        ]
      },
      foundation: {
        title: "Foundation & Tower",
        items: [
          "Concrete foundation 20-50m³",
          "Galvanized steel tower, height 15-30m",
          "Vibration resistant, corrosion resistant in marine environment",
          "Calculated to withstand typhoon category 12-14"
        ]
      }
    },
    suitability: {
      title: "Suitable Locations",
      locations: [
        {
          name: "Central Coast",
          wind: "Monsoon wind 6-9 m/s, stronger in dry season",
          suitability: "⭐⭐⭐⭐⭐ Highly suitable"
        },
        {
          name: "Highlands, Mountains",
          wind: "Terrain wind 5-8 m/s, stable",
          suitability: "⭐⭐⭐⭐ Suitable"
        },
        {
          name: "Inland Plains",
          wind: "Weak wind 3-5 m/s, unstable",
          suitability: "⭐⭐ Less suitable, should combine Solar"
        }
      ]
    },
    caseStudies: {
      title: "Case Studies",
      items: [
        {
          type: "Resort",
          title: "Phu Quoc Resort 100kW Wind + 500kW Solar",
          details: "2x 50kW turbines, 65% grid independence, 7-year ROI, 24/7 operation"
        },
        {
          type: "Industrial",
          title: "Coastal Industrial Park 500kW Wind Farm",
          details: "5x 100kW turbines, provides 35% factory power needs, 50% peak cost reduction"
        },
        {
          type: "Agriculture",
          title: "Agricultural Farm 30kW Hybrid",
          details: "1x 10kW turbine + 20kW solar, automatic irrigation, 40kWh battery storage"
        }
      ]
    },
    hybrid: {
      title: "Hybrid Wind + Solar System",
      benefits: [
        "✅ 24/7 operation: Wind at night, solar during day",
        "✅ Stable source: Compensate each other when weather changes",
        "✅ Increased capacity: 1.5-2x compared to Solar only",
        "✅ Reduced battery capacity: Save 30-40% storage cost",
        "✅ Faster ROI: 5-7 years instead of 8-10 years"
      ],
      ratio: "Optimal ratio: Wind 30-40% + Solar 60-70%"
    },
    cta: {
      title: "Wind Potential Survey",
      description: "GoldenEnergy engineers will measure wind speed for 3-6 months, analyze data, design optimal system for your location",
      button: "Register free survey"
    }
  },
  zh: {
    title: "风能",
    subtitle: "沿海地区风能解决方案",
    hero: {
      title: "风力发电系统",
      description: "10-500kW风力涡轮机，适用于沿海度假村、工业园区、农业。与太阳能结合创建稳定的24/7混合系统。"
    },
    specs: {
      title: "技术规格",
      turbines: {
        title: "风力涡轮机",
        items: [
          "水平轴（HAWT）10-100kW，效率35-45%",
          "垂直轴（VAWT）5-50kW，适合多向风",
          "切入风速：3-4 m/s",
          "额定风速：10-12 m/s",
          "寿命：20-25年，10年保修"
        ]
      },
      controller: {
        title: "控制器与逆变器",
        items: [
          "并网控制器自动并网",
          "混合控制器结合太阳能+风能+电池",
          "MPPT跟踪优化功率",
          "超速、过载、雷击保护"
        ]
      },
      foundation: {
        title: "基础与塔架",
        items: [
          "混凝土基础20-50m³",
          "镀锌钢塔，高度15-30m",
          "抗振动，海洋环境防腐",
          "计算承受12-14级台风"
        ]
      }
    },
    suitability: {
      title: "适宜地点",
      locations: [
        {
          name: "中部沿海",
          wind: "季风6-9 m/s，旱季更强",
          suitability: "⭐⭐⭐⭐⭐ 非常适合"
        },
        {
          name: "高原、山区",
          wind: "地形风5-8 m/s，稳定",
          suitability: "⭐⭐⭐⭐ 适合"
        },
        {
          name: "内陆平原",
          wind: "弱风3-5 m/s，不稳定",
          suitability: "⭐⭐ 不太适合，应结合太阳能"
        }
      ]
    },
    caseStudies: {
      title: "案例研究",
      items: [
        {
          type: "度假村",
          title: "富国度假村100kW风能+500kW太阳能",
          details: "2台50kW涡轮机，65%电网独立，7年投资回报，24/7运行"
        },
        {
          type: "工业",
          title: "沿海工业园500kW风电场",
          details: "5台100kW涡轮机，提供35%工厂电力需求，削减50%高峰成本"
        },
        {
          type: "农业",
          title: "农场30kW混合系统",
          details: "1台10kW涡轮机+20kW太阳能，自动灌溉，40kWh电池存储"
        }
      ]
    },
    hybrid: {
      title: "风能+太阳能混合系统",
      benefits: [
        "✅ 24/7运行：夜间风能，白天太阳能",
        "✅ 稳定来源：天气变化时互补",
        "✅ 增加容量：比仅太阳能高1.5-2倍",
        "✅ 减少电池容量：节省30-40%存储成本",
        "✅ 更快投资回报：5-7年而非8-10年"
      ],
      ratio: "最佳比例：风能30-40% + 太阳能60-70%"
    },
    cta: {
      title: "风能潜力调查",
      description: "GoldenEnergy工程师将测量3-6个月风速，分析数据，为您的地点设计最佳系统",
      button: "注册免费调查"
    }
  }
};

export async function generateMetadata({ params }: WindPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'Wind Energy Solutions - GoldenEnergy | 10-500kW Wind Turbines, Hybrid Systems',
    description: 'Wind energy solutions 10-500kW for coastal areas. Hybrid Wind+Solar 24/7 operation, 65% grid independence, 5-7 year ROI. Free wind potential survey.',
  };
}

export default async function WindPage({ params }: WindPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam) as 'vi' | 'en' | 'zh';
  const content = CONTENT[locale] || CONTENT['vi']; // Fallback to Vietnamese

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

      {/* Technical Specs */}
      <Section
        title={content.specs.title}
        backgroundColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[content.specs.turbines, content.specs.controller, content.specs.foundation].map((spec, index) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10">
                <h3 className="text-xl font-light text-gray-900 mb-4 tracking-wide">
                  {spec.title}
                </h3>
                <ul className="space-y-3">
                  {spec.items.map((item: string, i: number) => (
                    <li key={i} className="text-sm text-gray-400 leading-relaxed flex gap-3">
                      <span className="text-gray-900">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Suitability */}
      <Section
        title={content.suitability.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {content.suitability.locations.map((location, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light text-gray-900 mb-2">{location.name}</h3>
                    <p className="text-gray-400 text-sm">{location.wind}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg text-gray-900">{location.suitability}</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Hybrid System */}
      <Section
        title={content.hybrid.title}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-8">
              {content.hybrid.benefits.map((benefit: string, index: number) => (
                <div key={index} className="flex gap-3 items-start">
                  <span className="text-xl">{benefit.substring(0, 2)}</span>
                  <p className="text-gray-300 text-lg leading-relaxed flex-1">
                    {benefit.substring(3)}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 text-center">
              <p className="text-gray-900 text-lg font-light">{content.hybrid.ratio}</p>
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Case Studies */}
      <Section
        title={content.caseStudies.title}
        backgroundColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.caseStudies.items.map((item, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  {item.type}
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section
        title={content.cta.title}
        backgroundColor="bg-gray-50"
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

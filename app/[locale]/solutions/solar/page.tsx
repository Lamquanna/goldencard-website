import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import SolarCalculator from "@/components/SolarCalculator";
import { isLocale, type Locale } from "@/lib/i18n";

interface SolarPageProps {
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
    title: "Năng Lượng Mặt Trời",
    subtitle: "Giải pháp Solar Energy toàn diện",
    hero: {
      title: "Hệ Thống Điện Mặt Trời",
      description: "Từ 5kWp đến 5MWp, hòa lưới và độc lập, tối ưu chi phí và hiệu suất cao. Giảm 50-70% hóa đơn điện, thời gian hoàn vốn 4-6 năm."
    },
    specs: {
      title: "Thông Số Kỹ Thuật",
      panels: {
        title: "Tấm pin mặt trời",
        items: [
          "Mono PERC 450-550Wp, hiệu suất 21-23%",
          "Bảo hành 25 năm công suất, 12 năm sản phẩm",
          "Chống ăn mòn PID, chịu tải tuyết 5400Pa",
          "Thương hiệu: Jinko, LONGi, Trina Solar"
        ]
      },
      inverters: {
        title: "Inverter/Biến tần",
        items: [
          "Hybrid inverter 5-110kW (Huawei, SMA, Growatt)",
          "On-grid inverter 3-500kW, MPPT đa chuỗi",
          "Hiệu suất chuyển đổi 98.5%, bảo hành 5-10 năm",
          "Giám sát từ xa 24/7, cảnh báo tự động"
        ]
      },
      mounting: {
        title: "Kết cấu lắp đặt",
        items: [
          "Nhôm 6063-T5 anodized, không gỉ",
          "Mái ngói: Rail + Hook kẹp ngói",
          "Mái tôn: Rail + Screw + Flashing chống dột",
          "Mặt đất: Concrete + Galvanized steel structure"
        ]
      }
    },
    calculator: {
      title: "Tính Toán Sơ Bộ",
      description: "Sử dụng công cụ dưới đây để ước tính công suất và diện tích cần thiết cho hệ thống của bạn"
    },
    process: {
      title: "Quy Trình Triển Khai",
      steps: [
        {
          number: "01",
          title: "Khảo sát & Thiết kế",
          description: "Kỹ sư đến hiện trường đo đạc, phân tích hóa đơn điện, thiết kế 3D chi tiết, báo giá minh bạch"
        },
        {
          number: "02",
          title: "Ký hợp đồng & Chuẩn bị",
          description: "Ký hợp đồng, đặt cọc 30%, chuẩn bị vật tư chính hãng, xin giấy phép hòa lưới (nếu cần)"
        },
        {
          number: "03",
          title: "Lắp đặt hệ thống",
          description: "Thi công 3-10 ngày tùy quy mô, lắp tấm pin + inverter + cáp + tủ điện, kiểm tra an toàn điện"
        },
        {
          number: "04",
          title: "Nghiệm thu & Bàn giao",
          description: "Chạy thử hệ thống, đo kiểm công suất, hướng dẫn sử dụng, bàn giao hồ sơ, kích hoạt bảo hành"
        },
        {
          number: "05",
          title: "Vận hành & Bảo trì",
          description: "Giám sát 24/7 qua app, bảo trì định kỳ 6 tháng/lần, hỗ trợ kỹ thuật suốt đời, bảo hành 25 năm"
        }
      ]
    },
    caseStudies: {
      title: "Dự Án Tiêu Biểu",
      items: [
        {
          type: "Residential",
          title: "Nhà ở gia đình 10kWp",
          details: "300m² mái, 20 tấm 500Wp, inverter hybrid 10kW + battery 10kWh, tiết kiệm 60% hóa đơn"
        },
        {
          type: "Commercial",
          title: "Nhà máy dệt may 2.5MW",
          details: "5000 tấm 500Wp, 5 inverter 500kW, hòa lưới trực tiếp, giảm 70% chi phí điện giờ cao điểm"
        },
        {
          type: "Industrial",
          title: "KCN Long An 5MWp",
          details: "10,000 tấm, floating solar + ground mount, cấp điện cho 50 xưởng sản xuất, ROI 5 năm"
        }
      ]
    },
    cta: {
      title: "Bắt Đầu Chuyển Đổi Năng Lượng",
      description: "Liên hệ chuyên gia GoldenEnergy để được tư vấn miễn phí, khảo sát hiện trường và báo giá chi tiết",
      button: "Đặt lịch tư vấn miễn phí"
    }
  },
  en: {
    title: "Solar Energy",
    subtitle: "Comprehensive Solar Energy Solutions",
    hero: {
      title: "Solar Power Systems",
      description: "From 5kWp to 5MWp, grid-tied and off-grid, optimized cost and high efficiency. Save 50-70% on electricity bills, payback period 4-6 years."
    },
    specs: {
      title: "Technical Specifications",
      panels: {
        title: "Solar Panels",
        items: [
          "Mono PERC 450-550Wp, efficiency 21-23%",
          "25-year power warranty, 12-year product warranty",
          "PID corrosion resistant, snow load 5400Pa",
          "Brands: Jinko, LONGi, Trina Solar"
        ]
      },
      inverters: {
        title: "Inverters",
        items: [
          "Hybrid inverter 5-110kW (Huawei, SMA, Growatt)",
          "On-grid inverter 3-500kW, multi-string MPPT",
          "98.5% conversion efficiency, 5-10 year warranty",
          "24/7 remote monitoring, automatic alerts"
        ]
      },
      mounting: {
        title: "Mounting Structure",
        items: [
          "Aluminum 6063-T5 anodized, rust-free",
          "Tile roof: Rail + Hook clamp",
          "Metal roof: Rail + Screw + Flashing waterproofing",
          "Ground: Concrete + Galvanized steel structure"
        ]
      }
    },
    calculator: {
      title: "Preliminary Calculation",
      description: "Use the tool below to estimate capacity and required area for your system"
    },
    process: {
      title: "Implementation Process",
      steps: [
        {
          number: "01",
          title: "Survey & Design",
          description: "Engineers visit site, measure, analyze electricity bills, create detailed 3D design, transparent quotation"
        },
        {
          number: "02",
          title: "Contract & Preparation",
          description: "Sign contract, 30% deposit, prepare genuine materials, apply for grid connection permit (if needed)"
        },
        {
          number: "03",
          title: "System Installation",
          description: "Construction 3-10 days depending on scale, install panels + inverter + cables + electrical cabinet, electrical safety check"
        },
        {
          number: "04",
          title: "Testing & Handover",
          description: "Test system, measure capacity, usage training, document handover, activate warranty"
        },
        {
          number: "05",
          title: "Operation & Maintenance",
          description: "24/7 app monitoring, periodic maintenance every 6 months, lifetime technical support, 25-year warranty"
        }
      ]
    },
    caseStudies: {
      title: "Case Studies",
      items: [
        {
          type: "Residential",
          title: "Family Home 10kWp",
          details: "300m² roof, 20x 500Wp panels, 10kW hybrid inverter + 10kWh battery, 60% bill savings"
        },
        {
          type: "Commercial",
          title: "Textile Factory 2.5MW",
          details: "5000x 500Wp panels, 5x 500kW inverters, direct grid connection, 70% peak hour cost reduction"
        },
        {
          type: "Industrial",
          title: "Long An Industrial Park 5MWp",
          details: "10,000 panels, floating solar + ground mount, power for 50 production plants, 5-year ROI"
        }
      ]
    },
    cta: {
      title: "Start Energy Transformation",
      description: "Contact GoldenEnergy experts for free consultation, site survey and detailed quotation",
      button: "Schedule free consultation"
    }
  },
  zh: {
    title: "太阳能",
    subtitle: "全面的太阳能解决方案",
    hero: {
      title: "太阳能发电系统",
      description: "从 5kWp 到 5MWp，并网和离网，成本优化且高效。节省 50-70% 电费，投资回报期 4-6 年。"
    },
    specs: {
      title: "技术规格",
      panels: {
        title: "太阳能板",
        items: [
          "单晶 PERC 450-550Wp，效率 21-23%",
          "25 年功率保修，12 年产品保修",
          "抗 PID 腐蚀，雪载荷 5400Pa",
          "品牌：晶科、隆基、天合光能"
        ]
      },
      inverters: {
        title: "逆变器",
        items: [
          "混合逆变器 5-110kW（华为、SMA、古瑞瓦特）",
          "并网逆变器 3-500kW，多路 MPPT",
          "98.5% 转换效率，5-10 年保修",
          "24/7 远程监控，自动警报"
        ]
      },
      mounting: {
        title: "安装结构",
        items: [
          "铝 6063-T5 阳极氧化，防锈",
          "瓦屋顶：导轨 + 挂钩夹",
          "金属屋顶：导轨 + 螺丝 + 防水闪光板",
          "地面：混凝土 + 镀锌钢结构"
        ]
      }
    },
    calculator: {
      title: "初步计算",
      description: "使用下面的工具估算您系统所需的容量和面积"
    },
    process: {
      title: "实施流程",
      steps: [
        {
          number: "01",
          title: "勘察与设计",
          description: "工程师现场勘察、测量、分析电费单、创建详细 3D 设计、透明报价"
        },
        {
          number: "02",
          title: "合同与准备",
          description: "签订合同，30% 订金，准备正品材料，申请并网许可（如需）"
        },
        {
          number: "03",
          title: "系统安装",
          description: "施工 3-10 天（视规模而定），安装面板 + 逆变器 + 电缆 + 配电柜，电气安全检查"
        },
        {
          number: "04",
          title: "测试与交接",
          description: "测试系统，测量容量，使用培训，文件交接，激活保修"
        },
        {
          number: "05",
          title: "运营与维护",
          description: "24/7 应用监控，每 6 个月定期维护，终身技术支持，25 年保修"
        }
      ]
    },
    caseStudies: {
      title: "案例研究",
      items: [
        {
          type: "住宅",
          title: "家庭住宅 10kWp",
          details: "300m² 屋顶，20 块 500Wp 面板，10kW 混合逆变器 + 10kWh 电池，节省 60% 电费"
        },
        {
          type: "商业",
          title: "纺织厂 2.5MW",
          details: "5000 块 500Wp 面板，5 台 500kW 逆变器，直接并网，削减 70% 高峰时段成本"
        },
        {
          type: "工业",
          title: "龙安工业园 5MWp",
          details: "10,000 块面板，浮动太阳能 + 地面安装，为 50 个生产车间供电，5 年投资回报"
        }
      ]
    },
    cta: {
      title: "开始能源转型",
      description: "联系 GoldenEnergy 专家获取免费咨询、现场勘察和详细报价",
      button: "预约免费咨询"
    }
  }
};

export async function generateMetadata({ params }: SolarPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'Solar Energy Solutions - GoldenEnergy | 5kWp to 5MWp Solar Power Systems',
    description: 'Comprehensive solar energy solutions from 5kWp to 5MWp. Grid-tied and off-grid systems, 50-70% savings, 4-6 year ROI. Free consultation and site survey.',
  };
}

export default async function SolarPage({ params }: SolarPageProps) {
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
          {[content.specs.panels, content.specs.inverters, content.specs.mounting].map((spec, index) => (
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

      {/* Solar Calculator */}
      <Section
        title={content.calculator.title}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-400 mb-8">
              {content.calculator.description}
            </p>
            <SolarCalculator locale={locale} />
          </div>
        </RevealOnScroll>
      </Section>

      {/* Implementation Process */}
      <Section
        title={content.process.title}
        backgroundColor="bg-gray-50"
      >
        <div className="max-w-5xl mx-auto space-y-8">
          {content.process.steps.map((step, index) => (
            <RevealOnScroll key={index} delay={0.05 * index}>
              <div className="flex gap-6 items-start group">
                <div className="text-5xl font-light text-gray-900/20 group-hover:text-gray-900/40 transition-colors min-w-[80px]">
                  {step.number}
                </div>
                <div className="flex-1 pb-8 border-b border-gray-10">
                  <h3 className="text-xl font-light text-gray-900 mb-3 group-hover:text-gray-900 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Case Studies */}
      <Section
        title={content.caseStudies.title}
        backgroundColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.caseStudies.items.map((item, index) => (
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

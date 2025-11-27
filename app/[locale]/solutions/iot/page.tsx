import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import SolarCalculator from "@/components/SolarCalculator";
import { isLocale, type Locale } from "@/lib/i18n";

interface IoTPageProps {
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
    title: "IoT Smart Energy",
    subtitle: "Nền tảng giám sát & quản lý năng lượng thông minh",
    hero: {
      title: "IoT Smart Energy Platform",
      description: "Giám sát 24/7, AI tối ưu, bảo trì dự phòng. Kết nối Solar, Wind, Battery, Lưới điện. Dashboard web & mobile realtime."
    },
    features: {
      title: "Tính Năng Nền Tảng",
      items: [
        {
          icon: "📊",
          title: "Realtime Dashboard",
          description: "Công suất tức thời, sản lượng ngày/tháng/năm, thời tiết, dự báo 7 ngày"
        },
        {
          icon: "🤖",
          title: "AI Analytics",
          description: "Phát hiện bất thường, dự đoán hỏng hóc sớm 2-3 tuần, đề xuất tối ưu"
        },
        {
          icon: "🔧",
          title: "Predictive Maintenance",
          description: "Cảnh báo khi inverter/panel suy giảm >5%, lịch bảo trì tự động"
        },
        {
          icon: "📱",
          title: "Mobile App",
          description: "iOS & Android, push notification, điều khiển từ xa, hỗ trợ đa thiết bị"
        },
        {
          icon: "📈",
          title: "ROI Tracking",
          description: "Tiết kiệm điện, giá trị bán điện, so sánh với lưới điện, thời gian hoàn vốn"
        },
        {
          icon: "🔌",
          title: "Smart Control",
          description: "Tự động chuyển nguồn Solar → Battery → Grid, tối ưu chi phí theo giá điện"
        }
      ]
    },
    tech: {
      title: "Kiến Trúc Kỹ Thuật",
      stack: [
        {
          layer: "Edge Computing",
          description: "Gateway IoT tại chỗ, xử lý dữ liệu realtime, latency <100ms"
        },
        {
          layer: "Cloud Backend",
          description: "AWS IoT Core, PostgreSQL TimescaleDB, Redis cache, API RESTful"
        },
        {
          layer: "AI/ML Engine",
          description: "TensorFlow Lite, LSTM forecast, Anomaly Detection, Python FastAPI"
        },
        {
          layer: "Security",
          description: "TLS 1.3 encryption, OAuth2 authentication, role-based access"
        }
      ],
      protocols: "MQTT, Modbus TCP/RTU, HTTP REST API, WebSocket"
    },
    calculator: {
      title: "Ước Tính Hệ Thống Solar + IoT",
      description: "Sử dụng Calculator bên dưới để ước tính hệ thống Solar. Sau khi lắp đặt, IoT Platform sẽ giám sát 24/7 và tối ưu hiệu suất tự động."
    },
    integrations: {
      title: "Tích Hợp Thực Tế",
      cases: [
        {
          type: "Văn phòng thông minh",
          setup: "100kW Solar + 50kWh Battery + IoT",
          results: "Giảm 70% hóa đơn điện, tự động chuyển nguồn theo giá điện, ROI 6 năm"
        },
        {
          type: "Nhà máy sản xuất",
          setup: "500kW Solar + Wind + 200kWh Battery + IoT",
          results: "Giám sát 50+ thiết bị, phát hiện sớm sự cố inverter, tiết kiệm 8%/năm"
        },
        {
          type: "Microgrid khu đô thị",
          setup: "2MW Solar + 1MW Battery + IoT",
          results: "Quản lý 200 hộ gia đình, cân bằng tải tự động, giảm 40% chi phí vận hành"
        }
      ]
    },
    cta: {
      title: "Demo Nền Tảng IoT",
      description: "Đội ngũ GoldenEnergy sẽ demo Dashboard realtime, giải thích cách IoT tối ưu hệ thống của bạn, cung cấp báo giá chi tiết",
      button: "Đăng ký demo miễn phí"
    }
  },
  en: {
    title: "IoT Smart Energy",
    subtitle: "Smart Energy Monitoring & Management Platform",
    hero: {
      title: "IoT Smart Energy Platform",
      description: "24/7 monitoring, AI optimization, predictive maintenance. Connect Solar, Wind, Battery, Grid. Realtime web & mobile dashboard."
    },
    features: {
      title: "Platform Features",
      items: [
        {
          icon: "📊",
          title: "Realtime Dashboard",
          description: "Instant power, daily/monthly/yearly output, weather, 7-day forecast"
        },
        {
          icon: "🤖",
          title: "AI Analytics",
          description: "Anomaly detection, predict failures 2-3 weeks early, optimization suggestions"
        },
        {
          icon: "🔧",
          title: "Predictive Maintenance",
          description: "Alert when inverter/panel degrades >5%, automatic maintenance schedule"
        },
        {
          icon: "📱",
          title: "Mobile App",
          description: "iOS & Android, push notifications, remote control, multi-device support"
        },
        {
          icon: "📈",
          title: "ROI Tracking",
          description: "Electricity savings, feed-in tariff value, grid comparison, payback time"
        },
        {
          icon: "🔌",
          title: "Smart Control",
          description: "Auto switch Solar → Battery → Grid, optimize cost by electricity price"
        }
      ]
    },
    tech: {
      title: "Technical Architecture",
      stack: [
        {
          layer: "Edge Computing",
          description: "On-site IoT gateway, realtime data processing, latency <100ms"
        },
        {
          layer: "Cloud Backend",
          description: "AWS IoT Core, PostgreSQL TimescaleDB, Redis cache, RESTful API"
        },
        {
          layer: "AI/ML Engine",
          description: "TensorFlow Lite, LSTM forecast, Anomaly Detection, Python FastAPI"
        },
        {
          layer: "Security",
          description: "TLS 1.3 encryption, OAuth2 authentication, role-based access"
        }
      ],
      protocols: "MQTT, Modbus TCP/RTU, HTTP REST API, WebSocket"
    },
    calculator: {
      title: "Estimate Solar + IoT System",
      description: "Use the Calculator below to estimate your Solar system. After installation, IoT Platform will monitor 24/7 and optimize performance automatically."
    },
    integrations: {
      title: "Real-World Integrations",
      cases: [
        {
          type: "Smart Office",
          setup: "100kW Solar + 50kWh Battery + IoT",
          results: "70% bill reduction, auto source switching by price, 6-year ROI"
        },
        {
          type: "Manufacturing Plant",
          setup: "500kW Solar + Wind + 200kWh Battery + IoT",
          results: "Monitor 50+ devices, early inverter fault detection, 8%/year savings"
        },
        {
          type: "Urban Microgrid",
          setup: "2MW Solar + 1MW Battery + IoT",
          results: "Manage 200 households, auto load balancing, 40% operation cost reduction"
        }
      ]
    },
    cta: {
      title: "IoT Platform Demo",
      description: "GoldenEnergy team will demo realtime Dashboard, explain how IoT optimizes your system, provide detailed quotation",
      button: "Register free demo"
    }
  },
  zh: {
    title: "IoT智能能源",
    subtitle: "智能能源监控与管理平台",
    hero: {
      title: "IoT智能能源平台",
      description: "24/7监控，AI优化，预测性维护。连接太阳能、风能、电池、电网。实时网页与移动仪表板。"
    },
    features: {
      title: "平台功能",
      items: [
        {
          icon: "📊",
          title: "实时仪表板",
          description: "即时功率，日/月/年产量，天气，7天预报"
        },
        {
          icon: "🤖",
          title: "AI分析",
          description: "异常检测，提前2-3周预测故障，优化建议"
        },
        {
          icon: "🔧",
          title: "预测性维护",
          description: "逆变器/面板降级>5%时警报，自动维护计划"
        },
        {
          icon: "📱",
          title: "移动应用",
          description: "iOS与Android，推送通知，远程控制，多设备支持"
        },
        {
          icon: "📈",
          title: "投资回报跟踪",
          description: "电费节省，上网电价价值，电网对比，回本时间"
        },
        {
          icon: "🔌",
          title: "智能控制",
          description: "自动切换太阳能→电池→电网，按电价优化成本"
        }
      ]
    },
    tech: {
      title: "技术架构",
      stack: [
        {
          layer: "边缘计算",
          description: "现场IoT网关，实时数据处理，延迟<100ms"
        },
        {
          layer: "云后端",
          description: "AWS IoT Core，PostgreSQL TimescaleDB，Redis缓存，RESTful API"
        },
        {
          layer: "AI/ML引擎",
          description: "TensorFlow Lite，LSTM预测，异常检测，Python FastAPI"
        },
        {
          layer: "安全",
          description: "TLS 1.3加密，OAuth2认证，基于角色的访问"
        }
      ],
      protocols: "MQTT, Modbus TCP/RTU, HTTP REST API, WebSocket"
    },
    calculator: {
      title: "估算太阳能+IoT系统",
      description: "使用下方计算器估算您的太阳能系统。安装后，IoT平台将24/7监控并自动优化性能。"
    },
    integrations: {
      title: "实际集成",
      cases: [
        {
          type: "智能办公室",
          setup: "100kW太阳能+50kWh电池+IoT",
          results: "账单减少70%，按价格自动切换来源，6年投资回报"
        },
        {
          type: "制造工厂",
          setup: "500kW太阳能+风能+200kWh电池+IoT",
          results: "监控50+设备，早期逆变器故障检测，8%/年节省"
        },
        {
          type: "城市微电网",
          setup: "2MW太阳能+1MW电池+IoT",
          results: "管理200户家庭，自动负载平衡，运营成本减少40%"
        }
      ]
    },
    cta: {
      title: "IoT平台演示",
      description: "GoldenEnergy团队将演示实时仪表板，解释IoT如何优化您的系统，提供详细报价",
      button: "注册免费演示"
    }
  }
};

export async function generateMetadata({ params }: IoTPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'IoT Smart Energy Platform - GoldenEnergy | 24/7 Monitoring, AI Analytics',
    description: 'IoT Smart Energy Platform: 24/7 realtime monitoring, AI predictive maintenance, mobile control. Optimize Solar/Wind/Battery systems. Free demo available.',
  };
}

export default async function IoTPage({ params }: IoTPageProps) {
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

      {/* Features */}
      <Section
        title={content.features.title}
        backgroundColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {content.features.items.map((feature, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * (index % 3)}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-light text-gray-900 mb-3 tracking-wide">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Technical Architecture */}
      <Section
        title={content.tech.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-5xl mx-auto space-y-6">
          {content.tech.stack.map((item, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="md:w-1/4">
                    <h3 className="text-lg font-light text-gray-900">{item.layer}</h3>
                  </div>
                  <div className="md:w-3/4">
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
          <RevealOnScroll delay={0.4}>
            <div className="p-6 bg-[#0A0A0A]/10 border border-gray-20 text-center">
              <p className="text-gray-900 font-light tracking-wide">
                <span className="text-gray-500 uppercase text-xs mr-3">Protocols</span>
                {content.tech.protocols}
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      {/* Calculator Section */}
      <Section
        title={content.calculator.title}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="text-gray-300 leading-relaxed font-light">
              {content.calculator.description}
            </p>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={0.2}>
          <div className="max-w-6xl mx-auto">
            <SolarCalculator locale={locale} />
          </div>
        </RevealOnScroll>
      </Section>

      {/* Integrations */}
      <Section
        title={content.integrations.title}
        backgroundColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {content.integrations.cases.map((item, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                  {item.type}
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-3">
                  {item.setup}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {item.results}
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

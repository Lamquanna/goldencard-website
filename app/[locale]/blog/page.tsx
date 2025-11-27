import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";

interface BlogPageProps {
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
    title: "Kiến Thức Năng Lượng",
    subtitle: "Cập nhật xu hướng, công nghệ & chính sách năng lượng tái tạo",
    hero: {
      title: "Blog & Kiến Thức",
      description: "Chia sẻ kinh nghiệm thực tế, nghiên cứu mới nhất về Solar, Wind, IoT, và chính sách năng lượng Việt Nam"
    },
    categories: [
      { id: "all", label: "Tất cả" },
      { id: "energy", label: "Năng lượng tái tạo" },
      { id: "iot", label: "IoT & Công nghệ" },
      { id: "market", label: "Thị trường" },
      { id: "policy", label: "Chính sách VN" }
    ],
    articles: [
      {
        id: 1,
        category: "policy",
        date: "2025-01-15",
        title: "Chính Sách Năng Lượng Tái Tạo Việt Nam 2025-2030",
        excerpt: "Chính phủ đặt mục tiêu 30-35% điện từ tái tạo vào 2030. Phân tích cơ hội cho doanh nghiệp và hộ gia đình khi đầu tư Solar, Wind, Hybrid.",
        tags: ["Policy", "Solar", "Wind"],
        externalLink: "https://moit.gov.vn/tin-tuc/phat-trien-nang-luong/chien-luoc-phat-trien-nang-luong-tai-tao-viet-nam-den-nam-2030.html"
      },
      {
        id: 2,
        category: "energy",
        date: "2025-01-10",
        title: "Pin Perovskite: Thế Hệ Solar Cell Tiếp Theo",
        excerpt: "Hiệu suất 25.8%, nhẹ hơn 50%, chi phí thấp hơn 30%. Dự kiến thương mại hóa 2026-2027. GoldenEnergy đã thử nghiệm 100 tấm tại Lab Đà Nẵng.",
        tags: ["Technology", "Solar", "R&D"],
        externalLink: "https://www.nature.com/articles/s41560-023-01425-5"
      },
      {
        id: 3,
        category: "iot",
        date: "2025-01-05",
        title: "IoT Trong Quản Lý Năng Lượng: Phân Tích ROI",
        excerpt: "Hệ thống IoT giúp tiết kiệm 8-12% điện năng, phát hiện sớm sự cố 2-3 tuần. Tổng hợp case study 10 nhà máy Việt Nam đã triển khai.",
        tags: ["IoT", "Analytics", "Case Study"],
        externalLink: "https://www.mdpi.com/1996-1073/16/4/1980"
      },
      {
        id: 4,
        category: "market",
        date: "2024-12-28",
        title: "Cập Nhật Giá Mua Điện (FiT) Solar 2025",
        excerpt: "FiT mới: 7.09 cent/kWh cho Solar mái nhà, 7.69 cent/kWh cho Solar mặt đất. Hướng dẫn tính toán ROI với giá mới.",
        tags: ["Market", "Policy", "Solar"],
        externalLink: "https://evn.com.vn/c3/evn-va-khach-hang/Gia-ban-dien-Gia-mua-dien-6-12-27.aspx"
      },
      {
        id: 5,
        category: "energy",
        date: "2024-12-20",
        title: "Tiềm Năng Điện Gió Ven Biển Miền Trung",
        excerpt: "Tốc độ gió trung bình 6-9 m/s, phù hợp turbine 50-500kW. Phân tích 5 tỉnh: Quảng Bình, Quảng Trị, Thừa Thiên Huế, Đà Nẵng, Quảng Nam.",
        tags: ["Wind", "Location", "Analysis"],
        externalLink: "https://www.researchgate.net/publication/wind-energy-potential-vietnam-central-coast"
      },
      {
        id: 6,
        category: "iot",
        date: "2024-12-15",
        title: "Xu Hướng Smart Grid & Microgrid 2025",
        excerpt: "Kết nối Solar, Wind, Battery, Grid vào hệ thống thông minh. AI tối ưu chi phí, cân bằng tải tự động. 3 dự án Microgrid tiêu biểu tại VN.",
        tags: ["Smart Grid", "IoT", "AI"],
        externalLink: "https://www.sciencedirect.com/science/article/smart-grid-microgrid-trends"
      },
      {
        id: 7,
        category: "market",
        date: "2024-12-10",
        title: "Thị Trường Pin Lưu Trữ LiFePO4 Giảm Giá 25%",
        excerpt: "Pin LiFePO4 từ Trung Quốc giảm từ $280/kWh xuống $210/kWh. Tác động đến chi phí Hybrid System, ROI nhanh hơn 1-2 năm.",
        tags: ["Battery", "Market", "Hybrid"],
        externalLink: "https://www.bloomberg.com/news/articles/battery-storage-prices-2024"
      },
      {
        id: 8,
        category: "energy",
        date: "2024-12-05",
        title: "So Sánh Hiệu Suất Tấm Pin: Mono vs Poly vs Bifacial",
        excerpt: "Mono PERC 21-23%, Poly 17-19%, Bifacial 22-25%. Khi nào nên dùng loại nào? Phân tích chi phí, diện tích, ROI cho 3 kịch bản: nhà ở, xưởng, nông nghiệp.",
        tags: ["Solar", "Technology", "Comparison"],
        externalLink: "https://www.solarreviews.com/blog/monocrystalline-vs-polycrystalline-vs-bifacial-solar-panels"
      },
      {
        id: 9,
        category: "policy",
        date: "2024-11-28",
        title: "Ưu Đãi Thuế Cho Dự Án Năng Lượng Tái Tạo 2025",
        excerpt: "Giảm 50% thuế thu nhập doanh nghiệp 5 năm đầu cho Solar >30kW, Wind >10kW. Hướng dẫn hồ sơ, điều kiện đăng ký.",
        tags: ["Policy", "Tax", "Solar", "Wind"],
        externalLink: "https://thuvienphapluat.vn/van-ban/Doanh-nghiep/uu-dai-thue-nang-luong-tai-tao-2025.aspx"
      }
    ],
    cta: {
      title: "Bắt Đầu Dự Án Của Bạn",
      description: "Đã đọc đủ kiến thức? Hãy để GoldenEnergy tư vấn miễn phí hệ thống Solar, Wind, Hybrid phù hợp với nhu cầu và ngân sách của bạn",
      button: "Nhận tư vấn miễn phí"
    }
  },
  en: {
    title: "Energy Knowledge",
    subtitle: "Latest trends, technology & renewable energy policy updates",
    hero: {
      title: "Blog & Knowledge",
      description: "Sharing real-world experience, latest research on Solar, Wind, IoT, and Vietnam energy policy"
    },
    categories: [
      { id: "all", label: "All" },
      { id: "energy", label: "Renewable Energy" },
      { id: "iot", label: "IoT & Technology" },
      { id: "market", label: "Market" },
      { id: "policy", label: "VN Policy" }
    ],
    articles: [
      {
        id: 1,
        category: "policy",
        date: "2025-01-15",
        title: "Vietnam Renewable Energy Policy 2025-2030",
        excerpt: "Government targets 30-35% renewable electricity by 2030. Analysis of opportunities for businesses and households investing in Solar, Wind, Hybrid.",
        tags: ["Policy", "Solar", "Wind"],
        externalLink: "https://moit.gov.vn/en/news/renewable-energy-development-strategy-vietnam-2030.html"
      },
      {
        id: 2,
        category: "energy",
        date: "2025-01-10",
        title: "Perovskite Solar Cells: Next Generation",
        excerpt: "25.8% efficiency, 50% lighter, 30% lower cost. Expected commercialization 2026-2027. GoldenEnergy tested 100 panels at Da Nang Lab.",
        tags: ["Technology", "Solar", "R&D"],
        externalLink: "https://www.nature.com/articles/s41560-023-01425-5"
      },
      {
        id: 3,
        category: "iot",
        date: "2025-01-05",
        title: "IoT in Energy Management: ROI Analysis",
        excerpt: "IoT systems save 8-12% energy, detect faults 2-3 weeks early. Case study compilation from 10 Vietnamese factories.",
        tags: ["IoT", "Analytics", "Case Study"],
        externalLink: "https://www.mdpi.com/1996-1073/16/4/1980"
      },
      {
        id: 4,
        category: "market",
        date: "2024-12-28",
        title: "Solar Feed-in Tariff (FiT) Update 2025",
        excerpt: "New FiT: 7.09 cent/kWh rooftop Solar, 7.69 cent/kWh ground-mount. ROI calculation guide with new rates.",
        tags: ["Market", "Policy", "Solar"],
        externalLink: "https://evn.com.vn/en/electricity-tariffs"
      },
      {
        id: 5,
        category: "energy",
        date: "2024-12-20",
        title: "Central Coast Wind Energy Potential",
        excerpt: "Average wind speed 6-9 m/s, suitable for 50-500kW turbines. Analysis of 5 provinces: Quang Binh, Quang Tri, Thua Thien Hue, Da Nang, Quang Nam.",
        tags: ["Wind", "Location", "Analysis"],
        externalLink: "https://www.researchgate.net/publication/wind-energy-potential-vietnam-central-coast"
      },
      {
        id: 6,
        category: "iot",
        date: "2024-12-15",
        title: "Smart Grid & Microgrid Trends 2025",
        excerpt: "Connect Solar, Wind, Battery, Grid into intelligent system. AI cost optimization, auto load balancing. 3 featured Microgrid projects in VN.",
        tags: ["Smart Grid", "IoT", "AI"],
        externalLink: "https://www.sciencedirect.com/science/article/smart-grid-microgrid-trends"
      },
      {
        id: 7,
        category: "market",
        date: "2024-12-10",
        title: "LiFePO4 Battery Storage Market Down 25%",
        excerpt: "LiFePO4 batteries from China dropped from $280/kWh to $210/kWh. Impact on Hybrid System cost, 1-2 years faster ROI.",
        tags: ["Battery", "Market", "Hybrid"],
        externalLink: "https://www.bloomberg.com/news/articles/battery-storage-prices-2024"
      },
      {
        id: 8,
        category: "energy",
        date: "2024-12-05",
        title: "Panel Efficiency Comparison: Mono vs Poly vs Bifacial",
        excerpt: "Mono PERC 21-23%, Poly 17-19%, Bifacial 22-25%. When to use which? Cost, area, ROI analysis for 3 scenarios: residential, factory, agriculture.",
        tags: ["Solar", "Technology", "Comparison"],
        externalLink: "https://www.solarreviews.com/blog/monocrystalline-vs-polycrystalline-vs-bifacial-solar-panels"
      },
      {
        id: 9,
        category: "policy",
        date: "2024-11-28",
        title: "Tax Incentives for Renewable Energy Projects 2025",
        excerpt: "50% corporate income tax reduction for 5 years for Solar >30kW, Wind >10kW. Application guide and requirements.",
        tags: ["Policy", "Tax", "Solar", "Wind"],
        externalLink: "https://thuvienphapluat.vn/en/tax-incentives-renewable-energy-2025.aspx"
      }
    ],
    cta: {
      title: "Start Your Project",
      description: "Ready after reading? Let GoldenEnergy provide free consultation on Solar, Wind, Hybrid systems suitable for your needs and budget",
      button: "Get free consultation"
    }
  },
  zh: {
    title: "能源知识",
    subtitle: "最新趋势、技术与可再生能源政策更新",
    hero: {
      title: "博客与知识",
      description: "分享实际经验、最新太阳能、风能、IoT研究及越南能源政策"
    },
    categories: [
      { id: "all", label: "全部" },
      { id: "energy", label: "可再生能源" },
      { id: "iot", label: "IoT与技术" },
      { id: "market", label: "市场" },
      { id: "policy", label: "越南政策" }
    ],
    articles: [
      {
        id: 1,
        category: "policy",
        date: "2025-01-15",
        title: "越南可再生能源政策2025-2030",
        excerpt: "政府目标2030年30-35%可再生电力。分析企业和家庭投资太阳能、风能、混合系统的机会。",
        tags: ["Policy", "Solar", "Wind"],
        externalLink: "https://moit.gov.vn/cn/renewable-energy-development-strategy-vietnam-2030.html"
      },
      {
        id: 2,
        category: "energy",
        date: "2025-01-10",
        title: "钙钛矿太阳能电池：下一代",
        excerpt: "25.8%效率，轻50%，成本低30%。预计2026-2027商业化。GoldenEnergy在岘港实验室测试100块面板。",
        tags: ["Technology", "Solar", "R&D"],
        externalLink: "https://www.nature.com/articles/s41560-023-01425-5"
      },
      {
        id: 3,
        category: "iot",
        date: "2025-01-05",
        title: "能源管理中的IoT：投资回报分析",
        excerpt: "IoT系统节省8-12%能源，提前2-3周检测故障。汇编10家越南工厂案例研究。",
        tags: ["IoT", "Analytics", "Case Study"],
        externalLink: "https://www.mdpi.com/1996-1073/16/4/1980"
      },
      {
        id: 4,
        category: "market",
        date: "2024-12-28",
        title: "太阳能上网电价（FiT）更新2025",
        excerpt: "新FiT：屋顶太阳能7.09美分/kWh，地面安装7.69美分/kWh。新费率投资回报计算指南。",
        tags: ["Market", "Policy", "Solar"],
        externalLink: "https://evn.com.vn/cn/electricity-tariffs"
      },
      {
        id: 5,
        category: "energy",
        date: "2024-12-20",
        title: "中部沿海风能潜力",
        excerpt: "平均风速6-9 m/s，适合50-500kW涡轮机。分析5省：广平、广治、顺化、岘港、广南。",
        tags: ["Wind", "Location", "Analysis"],
        externalLink: "https://www.researchgate.net/publication/wind-energy-potential-vietnam-central-coast"
      },
      {
        id: 6,
        category: "iot",
        date: "2024-12-15",
        title: "智能电网与微电网趋势2025",
        excerpt: "将太阳能、风能、电池、电网连接到智能系统。AI成本优化，自动负载平衡。越南3个特色微电网项目。",
        tags: ["Smart Grid", "IoT", "AI"],
        externalLink: "https://www.sciencedirect.com/science/article/smart-grid-microgrid-trends"
      },
      {
        id: 7,
        category: "market",
        date: "2024-12-10",
        title: "磷酸铁锂电池存储市场下降25%",
        excerpt: "来自中国的磷酸铁锂电池从$280/kWh降至$210/kWh。对混合系统成本的影响，投资回报快1-2年。",
        tags: ["Battery", "Market", "Hybrid"],
        externalLink: "https://www.bloomberg.com/news/articles/battery-storage-prices-2024"
      },
      {
        id: 8,
        category: "energy",
        date: "2024-12-05",
        title: "面板效率比较：单晶 vs 多晶 vs 双面",
        excerpt: "单晶PERC 21-23%，多晶17-19%，双面22-25%。何时使用哪种？3种场景的成本、面积、投资回报分析：住宅、工厂、农业。",
        tags: ["Solar", "Technology", "Comparison"],
        externalLink: "https://www.solarreviews.com/blog/monocrystalline-vs-polycrystalline-vs-bifacial-solar-panels"
      },
      {
        id: 9,
        category: "policy",
        date: "2024-11-28",
        title: "可再生能源项目税收优惠2025",
        excerpt: "太阳能>30kW、风能>10kW前5年企业所得税减免50%。申请指南和要求。",
        tags: ["Policy", "Tax", "Solar", "Wind"],
        externalLink: "https://thuvienphapluat.vn/cn/tax-incentives-renewable-energy-2025.aspx"
      }
    ],
    cta: {
      title: "开始您的项目",
      description: "阅读完毕？让GoldenEnergy免费咨询适合您需求和预算的太阳能、风能、混合系统",
      button: "获取免费咨询"
    }
  }
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'Energy Knowledge Blog - GoldenEnergy | Solar, Wind, IoT, Policy Updates',
    description: 'Latest renewable energy trends, technology research, market updates, and Vietnam policy. Solar efficiency comparison, IoT ROI analysis, FiT updates.',
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const content = CONTENT[locale as keyof typeof CONTENT] || CONTENT['en'];

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

      {/* Category Filters */}
      <Section backgroundColor="bg-gray-50">
        <RevealOnScroll delay={0.1}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {content.categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-6 py-3 border transition-all duration-500 font-semibold tracking-wide text-sm uppercase ${
                  cat.id === 'all'
                    ? 'bg-[#D4AF37] text-white border-[#D4AF37]'
                    : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </RevealOnScroll>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {content.articles.map((article, index: number) => (
            <RevealOnScroll key={article.id} delay={0.1 * (index % 3)}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500 flex flex-col h-full">
                {/* Date & Category */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">{article.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-light text-gray-900 mb-3 leading-relaxed">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-400 leading-relaxed mb-4 flex-1">
                  {article.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#0A0A0A]/10 text-xs text-gray-400 border border-gray-10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Read More Link */}
                <a
                  href={article.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-900 text-sm font-light tracking-wide hover:text-gray-300 transition-colors inline-flex items-center gap-2"
                >
                  {locale === 'vi' ? 'Đọc thêm' : locale === 'en' ? 'Read more' : '阅读更多'}
                  <span>↗</span>
                </a>
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

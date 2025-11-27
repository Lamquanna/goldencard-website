import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import TeamSection from "@/components/TeamSection";

import { isLocale, type Locale } from "@/lib/i18n";

interface AboutPageProps {
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
    hero: {
      title: "Về Golden Energy",
      subtitle: "Hành trình kiến tạo năng lượng xanh"
    },
    vision: {
      title: "Tầm Nhìn",
      content: "Trở thành đối tác năng lượng tái tạo hàng đầu khu vực Đông Nam Á, góp phần giảm 10 triệu tấn CO₂ vào năm 2030 thông qua giải pháp solar, wind và IoT."
    },
    mission: {
      title: "Sứ Mệnh",
      items: [
        "Cung cấp giải pháp năng lượng tái tạo chất lượng cao, giá cả hợp lý",
        "Tối ưu hóa chi phí điện 50-70% cho khách hàng doanh nghiệp và cộng đồng",
        "Đào tạo 1000+ kỹ sư năng lượng xanh trong 5 năm tới",
        "Nghiên cứu và ứng dụng công nghệ mới: Perovskite, AI grid management"
      ]
    },
    values: {
      title: "Giá Trị Cốt Lõi",
      items: [
        { name: "Chất lượng", icon: "⭐", description: "Tấm pin, inverter chính hãng 100%, bảo hành 25 năm" },
        { name: "Minh bạch", icon: "📊", description: "Báo giá chi tiết, không phát sinh, hợp đồng rõ ràng" },
        { name: "Đổi mới", icon: "💡", description: "R&D Lab nghiên cứu pin tái chế, IoT platform, AI monitoring" },
        { name: "Bền vững", icon: "🌱", description: "Giảm carbon footprint, tái chế vật liệu, O&M dài hạn" }
      ]
    },
    team: {
      title: "Đội Ngũ Chuyên Gia",
      description: "50+ kỹ sư năng lượng, chuyên gia tài chính xanh, nhà nghiên cứu với kinh nghiệm 10-20 năm",
      roles: [
        { title: "CEO & Founder", name: "Jimmy Ha", background: "Định hướng chiến lược phát triển, xây dựng hệ sinh thái năng lượng bền vững, 20+ năm kinh nghiệm năng lượng tái tạo", image: null },
        { title: "Managing Director", name: "Trương Thị Kim Anh", background: "Điều hành toàn diện hoạt động công ty, quản lý nguồn lực và phát triển kinh doanh", image: null },
        { title: "CTO", name: "Lê Quang Anh", background: "Phát triển và xây dựng hệ thống", image: null },
        { title: "Head of Engineering", name: "Hồ Minh Tân", background: "30 dự án năng lượng mặt trời thành công", image: null },
        { title: "Senior Solar Engineer", name: "Nguyễn Văn Minh", background: "Chuyên gia thiết kế hệ thống solar quy mô lớn, 15 năm kinh nghiệm, đã triển khai 50+ dự án MW", image: null },
        { title: "Wind Energy Engineer", name: "Phạm Đức Anh", background: "Kỹ sư điện gió, chuyên turbine và hybrid systems, 10 năm kinh nghiệm triển khai dự án ven biển", image: null },
        { title: "IoT Systems Engineer", name: "Trần Thị Hương", background: "Chuyên gia IoT và AI monitoring, phát triển platform quản lý năng lượng thông minh, 8 năm kinh nghiệm", image: null },
        { title: "Trưởng bộ phận Quản lý Dự án & Vật tư", name: "Hà Huy Tuấn", background: "Quản lý tiến độ dự án, tối ưu hóa chuỗi cung ứng và đảm bảo chất lượng vật tư thiết bị", image: null },
        { title: "Logistics & Operations Manager", name: "Nguyễn Tấn Lễ", background: "Quản lý vận hành hệ thống, điều phối logistics và tối ưu hóa quy trình làm việc", image: null },
        { title: "Trưởng phòng Kế toán - Tài chính", name: "Nguyễn Thị Thu", background: "Quản lý tài chính doanh nghiệp, lập kế hoạch ngân sách và kiểm soát chi phí dự án", image: null },
        { title: "Head of Sales", name: "Nguyễn Minh Nguyệt", background: "Phát triển thị trường, quản lý đội ngũ kinh doanh và xây dựng mối quan hệ khách hàng", image: null },
        { title: "Head of Marketing", name: "Cristina Lu", background: "Xây dựng thương hiệu, chiến lược marketing và truyền thông doanh nghiệp", image: null }
      ]
    },
    certifications: {
      title: "Chứng Nhận & Đối Tác",
      items: [
        "ISO 9001:2015 - Quản lý chất lượng",
        "ISO 14001:2015 - Quản lý môi trường",
        "Đối tác chiến lược: Huawei, SMA, Growatt, Jinko Solar",
        "Thành viên Hiệp hội Năng lượng Tái tạo Việt Nam",
        "Chứng chỉ thiết kế & lắp đặt từ TÜV Rheinland"
      ]
    },
    cta: {
      title: "Tham Gia Cùng Chúng Tôi",
      description: "Chúng tôi luôn tìm kiếm những tài năng đam mê năng lượng xanh",
      careers: "Xem vị trí tuyển dụng",
      contact: "Liên hệ hợp tác"
    }
  },
  en: {
    hero: {
      title: "About Golden Energy",
      subtitle: "Journey to build green energy"
    },
    vision: {
      title: "Vision",
      content: "Become the leading renewable energy partner in Southeast Asia, contributing to reduce 10 million tons CO₂ by 2030 through solar, wind and IoT solutions."
    },
    mission: {
      title: "Mission",
      items: [
        "Provide high-quality, affordable renewable energy solutions",
        "Optimize 50-70% electricity costs for business and community customers",
        "Train 1000+ green energy engineers in the next 5 years",
        "Research and apply new technologies: Perovskite, AI grid management"
      ]
    },
    values: {
      title: "Core Values",
      items: [
        { name: "Quality", icon: "⭐", description: "100% genuine panels & inverters, 25-year warranty" },
        { name: "Transparency", icon: "📊", description: "Detailed quotes, no hidden fees, clear contracts" },
        { name: "Innovation", icon: "💡", description: "R&D Lab for battery recycling, IoT platform, AI monitoring" },
        { name: "Sustainability", icon: "🌱", description: "Reduce carbon footprint, recycle materials, long-term O&M" }
      ]
    },
    team: {
      title: "Expert Team",
      description: "50+ energy engineers, green finance experts, researchers with 10-20 years experience",
      roles: [
        { title: "CEO & Founder", name: "Jimmy Ha", background: "Strategic development direction, building sustainable energy ecosystem, 20+ years renewable energy experience", image: null },
        { title: "Managing Director", name: "Truong Thi Kim Anh", background: "Overall company operations, resource management and business development", image: null },
        { title: "CTO", name: "Le Quang Anh", background: "System development and construction", image: null },
        { title: "Head of Engineering", name: "Ho Minh Tan", background: "30 successful solar energy projects", image: null },
        { title: "Senior Solar Engineer", name: "Nguyen Van Minh", background: "Large-scale solar system design specialist, 15 years experience, deployed 50+ MW projects", image: null },
        { title: "Wind Energy Engineer", name: "Pham Duc Anh", background: "Wind energy engineer, turbine and hybrid systems specialist, 10 years coastal project experience", image: null },
        { title: "IoT Systems Engineer", name: "Tran Thi Huong", background: "IoT and AI monitoring expert, smart energy management platform developer, 8 years experience", image: null },
        { title: "Project & Material Management Head", name: "Ha Huy Tuan", background: "Project schedule management, supply chain optimization and equipment quality assurance", image: null },
        { title: "Logistics & Operations Manager", name: "Nguyen Tan Le", background: "System operations management, logistics coordination and workflow optimization", image: null },
        { title: "Finance & Accounting Head", name: "Nguyen Thi Thu", background: "Corporate financial management, budget planning and project cost control", image: null },
        { title: "Head of Sales", name: "Nguyen Minh Nguyet", background: "Market development, sales team management and customer relationship building", image: null },
        { title: "Head of Marketing", name: "Cristina Lu", background: "Brand building, marketing strategy and corporate communications", image: null }
      ]
    },
    certifications: {
      title: "Certifications & Partners",
      items: [
        "ISO 9001:2015 - Quality Management",
        "ISO 14001:2015 - Environmental Management",
        "Strategic partners: Huawei, SMA, Growatt, Jinko Solar",
        "Member of Vietnam Renewable Energy Association",
        "Design & installation certificates from TÜV Rheinland"
      ]
    },
    cta: {
      title: "Join Us",
      description: "We are always looking for talents passionate about green energy",
      careers: "View job openings",
      contact: "Contact for partnership"
    }
  },
  zh: {
    hero: {
      title: "关于 Golden Energy",
      subtitle: "构建绿色能源之旅"
    },
    vision: {
      title: "愿景",
      content: "成为东南亚领先的可再生能源合作伙伴，通过太阳能、风能和物联网解决方案，到 2030 年减少 1000 万吨 CO₂ 排放。"
    },
    mission: {
      title: "使命",
      items: [
        "提供高质量、价格合理的可再生能源解决方案",
        "为企业和社区客户优化 50-70% 电力成本",
        "未来 5 年培训 1000+ 绿色能源工程师",
        "研究和应用新技术：钙钛矿、AI 电网管理"
      ]
    },
    values: {
      title: "核心价值观",
      items: [
        { name: "质量", icon: "⭐", description: "100% 正品面板和逆变器，25 年保修" },
        { name: "透明", icon: "📊", description: "详细报价，无隐藏费用，明确合同" },
        { name: "创新", icon: "💡", description: "研发实验室进行电池回收、物联网平台、AI 监控" },
        { name: "可持续", icon: "🌱", description: "减少碳足迹，回收材料，长期运维" }
      ]
    },
    team: {
      title: "专家团队",
      description: "50+ 能源工程师、绿色金融专家、研究人员，拥有 10-20 年经验",
      roles: [
        { title: "首席执行官兼创始人", name: "Jimmy Ha", background: "战略发展方向，构建可持续能源生态系统，20+ 年可再生能源经验", image: null },
        { title: "董事总经理", name: "张氏金英", background: "公司整体运营，资源管理和业务发展", image: null },
        { title: "首席技术官", name: "黎光英", background: "系统开发与建设", image: null },
        { title: "工程主管", name: "胡明新", background: "30个成功太阳能项目", image: null },
        { title: "高级太阳能工程师", name: "阮文明", background: "大型太阳能系统设计专家，15年经验，部署50+兆瓦项目", image: null },
        { title: "风能工程师", name: "范德英", background: "风能工程师，涡轮机和混合系统专家，10年沿海项目经验", image: null },
        { title: "物联网系统工程师", name: "陈氏香", background: "物联网和AI监控专家，智能能源管理平台开发者，8年经验", image: null },
        { title: "项目与物资管理主管", name: "河辉俊", background: "项目进度管理，供应链优化和设备质量保证", image: null },
        { title: "物流与运营经理", name: "阮新礼", background: "系统运营管理，物流协调和工作流程优化", image: null },
        { title: "财务会计主管", name: "阮氏秋", background: "企业财务管理，预算规划和项目成本控制", image: null },
        { title: "销售主管", name: "阮明月", background: "市场开发，销售团队管理和客户关系建立", image: null },
        { title: "营销主管", name: "Cristina Lu", background: "品牌建设，营销策略和企业传播", image: null }
      ]
    },
    certifications: {
      title: "认证与合作伙伴",
      items: [
        "ISO 9001:2015 - 质量管理",
        "ISO 14001:2015 - 环境管理",
        "战略合作伙伴：华为、SMA、古瑞瓦特、晶科能源",
        "越南可再生能源协会会员",
        "TÜV 莱茵设计和安装证书"
      ]
    },
    cta: {
      title: "加入我们",
      description: "我们一直在寻找热衷于绿色能源的人才",
      careers: "查看职位空缺",
      contact: "联系合作"
    }
  }
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  normalizeLocale(localeParam);
  
  return {
    title: 'About GoldenEnergy - Leading Renewable Energy Partner | Vision, Mission, Team',
    description: 'Learn about GoldenEnergy journey, vision to reduce 10M tons CO₂ by 2030, expert team of 50+ engineers, ISO certifications, and strategic partnerships.',
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const content = CONTENT[locale as keyof typeof CONTENT] || CONTENT['en'];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Static Background - Performance Optimized */}
      <Hero
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        backgroundImage="/Projects/Solar energy/Project 2.jpg"
        useStaticBackground={true}
      />

      {/* Vision */}
      <Section
        title={content.vision.title}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-2xl text-gray-300 leading-relaxed font-light">
              {content.vision.content}
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Mission */}
      <Section
        title={content.mission.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {content.mission.items.map((item: string, index: number) => (
            <RevealOnScroll key={index} delay={0.05 * index}>
              <div className="flex gap-4 items-start pb-6 border-b border-gray-10">
                <div className="text-gray-900/40 font-light text-2xl min-w-[40px]">
                  {(index + 1).toString().padStart(2, '0')}
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">{item}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Core Values */}
      <Section
        title={content.values.title}
        backgroundColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {content.values.items.map((value: { name: string; icon: string; description: string }, index: number) => (
            <RevealOnScroll key={index} delay={0.1 * index}>
              <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500 text-center">
                <div className="text-4xl mb-3">{value.icon}</div>
                <h3 className="text-lg font-light text-gray-900 mb-2">{value.name}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{value.description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Team Section - New Professional Team Component */}
      <TeamSection />

      {/* Certifications */}
      <Section
        title={content.certifications.title}
        backgroundColor="bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          {content.certifications.items.map((item: string, index: number) => (
            <RevealOnScroll key={index} delay={0.05 * index}>
              <div className="flex gap-4 items-start py-4 border-b border-gray-10">
                <span className="text-gray-900">•</span>
                <p className="text-gray-300 leading-relaxed">{item}</p>
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
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              {content.cta.description}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/${locale}/contact`}
                className="px-8 py-4 bg-[#D4AF37] text-white hover:bg-[#C19B2E] transition-all duration-500 font-semibold tracking-wider uppercase text-sm"
              >
                {content.cta.careers}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-500 font-semibold tracking-wider uppercase text-sm"
              >
                {content.cta.contact}
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}
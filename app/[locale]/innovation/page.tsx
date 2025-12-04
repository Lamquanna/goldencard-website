import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";

interface InnovationPageProps {
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
      title: "R&D Lab",
      subtitle: "Nghiên cứu & Phát triển",
      description: "Phòng lab nghiên cứu công nghệ năng lượng tiên tiến, từ pin Perovskite đến AI grid management, hướng tới tương lai năng lượng bền vững"
    },
    vision: {
      title: "Tầm Nhìn R&D",
      content: "Trở thành trung tâm nghiên cứu năng lượng tái tạo hàng đầu khu vực, phát triển công nghệ bản địa hóa, giảm chi phí 30% so với nhập khẩu, ứng dụng AI và IoT vào quản lý lưới điện thông minh."
    },
    projects: {
      title: "Dự Án Nghiên Cứu Hiện Tại",
      items: [
        {
          id: "perovskite",
          name: "Pin mặt trời Perovskite",
          status: "Giai đoạn 2 - Pilot",
          description: "Nghiên cứu vật liệu Perovskite thế hệ mới, hiệu suất chuyển đổi 25-30%, chi phí thấp hơn 40% so với silicon, ổn định trong 15 năm",
          progress: "75%",
          team: "8 nghiên cứu viên, 3 tiến sĩ",
          expected: "Q2 2026 - Sản xuất thử nghiệm 1000 tấm"
        },
        {
          id: "battery-recycling",
          name: "Tái chế pin Lithium-ion",
          status: "Giai đoạn 1 - R&D",
          description: "Quy trình tái chế pin EV và ESS, thu hồi 95% lithium, cobalt, nickel, giảm 80% phát thải CO₂ so với khai thác mới",
          progress: "40%",
          team: "5 kỹ sư hóa học, 2 chuyên gia môi trường",
          expected: "Q4 2026 - Pilot plant 10 tấn/tháng"
        },
        {
          id: "ai-grid",
          name: "AI-powered Grid Management",
          status: "Giai đoạn 3 - Triển khai",
          description: "Platform AI dự đoán phụ tải, tối ưu phân phối năng lượng, giảm 20% lãng phí, tích hợp renewable energy forecast",
          progress: "90%",
          team: "12 AI engineers, 4 data scientists",
          expected: "Q1 2026 - Ra mắt commercial version"
        },
        {
          id: "floating-solar",
          name: "Floating Solar + Aquaculture",
          status: "Incoming - Q3 2026",
          description: "Hệ thống solar nổi kết hợp nuôi trồng thủy sản, giảm 30% nhiệt độ nước, tăng 15% năng suất ao nuôi, ROI 6 năm",
          progress: "15%",
          team: "6 kỹ sư cơ khí, 2 chuyên gia thủy sản",
          expected: "Q3 2026 - Pilot tại đồng bằng sông Cửu Long"
        }
      ]
    },
    timeline: {
      title: "Lộ Trình Phát Triển",
      milestones: [
        { year: "2023", event: "Thành lập R&D Lab, đầu tư $2M thiết bị" },
        { year: "2024", event: "Hợp tác 3 đại học, 5 bằng sáng chế" },
        { year: "2025", event: "Pilot Perovskite, AI platform beta" },
        { year: "2026", event: "Commercial launch 3 sản phẩm, mở rộng lab 2x" }
      ]
    },
    team: {
      title: "Đội Ngũ R&D Lab",
      description: "Đội ngũ nghiên cứu và phát triển công nghệ năng lượng tiên tiến",
      leaders: [
        { name: "Jimmy Ha (Hà Hoàng Hà)", role: "CEO & Founder", background: "Định hướng chiến lược R&D" },
        { name: "Hồ Minh Tân", role: "Head of Engineering", background: "Triển khai kỹ thuật và ứng dụng" },
        { name: "Lê Quang Anh", role: "CTO", background: "Master of Science in Computer Science, chuyên gia hệ thống và ERP" }
      ],
      engineers: [
        { name: "Trần Văn Son", role: "Kỹ sư", background: "Chuyên gia năng lượng tái tạo" },
        { name: "Nguyễn Minh Duy", role: "Kỹ sư", background: "Chuyên gia hệ thống điện" },
        { name: "Đào Hữu Giàu", role: "Kỹ sư", background: "Chuyên gia công nghệ solar" }
      ]
    },
    publications: {
      title: "Công Bố & Bằng Sáng Chế",
      items: [
        "5 bằng sáng chế đã cấp (Perovskite stabilizer, Battery recycling process)",
        "12 bài báo quốc tế (Nature Energy, Advanced Materials, Joule)",
        "8 hội nghị khoa học (WCPEC, IEEE PVSC, ECS)",
        "Hợp tác 3 đại học: ĐHBK HCM, ĐHQG HN, MIT"
      ]
    },
    cta: {
      title: "Tham Gia Nghiên Cứu",
      description: "Chúng tôi tìm kiếm nhà nghiên cứu, kỹ sư đam mê năng lượng xanh và công nghệ tiên tiến",
      careers: "Xem vị trí R&D",
      partnership: "Hợp tác nghiên cứu"
    }
  },
  en: {
    hero: {
      title: "R&D Lab",
      subtitle: "Research & Development",
      description: "Lab researching advanced energy technologies, from Perovskite solar cells to AI grid management, towards sustainable energy future"
    },
    vision: {
      title: "R&D Vision",
      content: "Become the leading renewable energy research center in the region, develop localized technologies, reduce costs 30% vs imports, apply AI and IoT to smart grid management."
    },
    projects: {
      title: "Current Research Projects",
      items: [
        {
          id: "perovskite",
          name: "Perovskite Solar Cells",
          status: "Phase 2 - Pilot",
          description: "Research next-gen Perovskite materials, 25-30% conversion efficiency, 40% lower cost vs silicon, 15-year stability",
          progress: "75%",
          team: "8 researchers, 3 PhDs",
          expected: "Q2 2026 - Trial production 1000 panels"
        },
        {
          id: "battery-recycling",
          name: "Lithium-ion Battery Recycling",
          status: "Phase 1 - R&D",
          description: "EV and ESS battery recycling process, recover 95% lithium, cobalt, nickel, reduce 80% CO₂ emissions vs new mining",
          progress: "40%",
          team: "5 chemical engineers, 2 environmental experts",
          expected: "Q4 2026 - Pilot plant 10 tons/month"
        },
        {
          id: "ai-grid",
          name: "AI-powered Grid Management",
          status: "Phase 3 - Deployment",
          description: "AI platform for load forecasting, optimize energy distribution, reduce 20% waste, integrate renewable energy forecast",
          progress: "90%",
          team: "12 AI engineers, 4 data scientists",
          expected: "Q1 2026 - Commercial version launch"
        },
        {
          id: "floating-solar",
          name: "Floating Solar + Aquaculture",
          status: "Incoming - Q3 2026",
          description: "Floating solar system combined with aquaculture, reduce 30% water temperature, increase 15% pond productivity, 6-year ROI",
          progress: "15%",
          team: "6 mechanical engineers, 2 aquaculture experts",
          expected: "Q3 2026 - Pilot in Mekong Delta"
        }
      ]
    },
    timeline: {
      title: "Development Roadmap",
      milestones: [
        { year: "2023", event: "Established R&D Lab, invested $2M equipment" },
        { year: "2024", event: "Partnered with 3 universities, 5 patents" },
        { year: "2025", event: "Pilot Perovskite, AI platform beta" },
        { year: "2026", event: "Commercial launch 3 products, expand lab 2x" }
      ]
    },
    team: {
      title: "R&D Lab Team",
      description: "Advanced energy technology research and development team",
      leaders: [
        { name: "Jimmy Ha (Ha Hoang Ha)", role: "CEO & Founder", background: "R&D strategic direction" },
        { name: "Ho Minh Tan", role: "Head of Engineering", background: "Technical implementation and application" },
        { name: "Le Quang Anh", role: "CTO", background: "Master of Science in Computer Science, System & ERP Expert" }
      ],
      engineers: [
        { name: "Tran Van Son", role: "Engineer", background: "Renewable energy specialist" },
        { name: "Nguyen Minh Duy", role: "Engineer", background: "Electrical systems specialist" },
        { name: "Dao Huu Giau", role: "Engineer", background: "Solar technology specialist" }
      ]
    },
    publications: {
      title: "Publications & Patents",
      items: [
        "5 granted patents (Perovskite stabilizer, Battery recycling process)",
        "12 international papers (Nature Energy, Advanced Materials, Joule)",
        "8 scientific conferences (WCPEC, IEEE PVSC, ECS)",
        "Partnered with 3 universities: HCMC Tech, VNU, MIT"
      ]
    },
    cta: {
      title: "Join Research",
      description: "We are looking for researchers and engineers passionate about green energy and advanced technology",
      careers: "View R&D positions",
      partnership: "Research partnership"
    }
  },
  zh: {
    hero: {
      title: "研发实验室",
      subtitle: "研究与开发",
      description: "研究先进能源技术的实验室，从钙钛矿太阳能电池到AI电网管理，迈向可持续能源未来"
    },
    vision: {
      title: "研发愿景",
      content: "成为该地区领先的可再生能源研究中心，开发本地化技术，成本降低30%（相比进口），将AI和物联网应用于智能电网管理。"
    },
    projects: {
      title: "当前研究项目",
      items: [
        {
          id: "perovskite",
          name: "钙钛矿太阳能电池",
          status: "第2阶段 - 试点",
          description: "研究下一代钙钛矿材料，25-30%转换效率，成本比硅低40%，15年稳定性",
          progress: "75%",
          team: "8名研究人员，3名博士",
          expected: "2026年第二季度 - 试生产1000块面板"
        },
        {
          id: "battery-recycling",
          name: "锂离子电池回收",
          status: "第1阶段 - 研发",
          description: "电动汽车和储能系统电池回收工艺，回收95%锂、钴、镍，减少80% CO₂排放（相比新采矿）",
          progress: "40%",
          team: "5名化学工程师，2名环保专家",
          expected: "2026年第四季度 - 试点工厂10吨/月"
        },
        {
          id: "ai-grid",
          name: "AI驱动的电网管理",
          status: "第3阶段 - 部署",
          description: "负载预测AI平台，优化能源分配，减少20%浪费，集成可再生能源预测",
          progress: "90%",
          team: "12名AI工程师，4名数据科学家",
          expected: "2026年第一季度 - 商业版本发布"
        },
        {
          id: "floating-solar",
          name: "浮动太阳能+水产养殖",
          status: "即将推出 - 2026年第三季度",
          description: "浮动太阳能系统结合水产养殖，降低30%水温，提高15%池塘生产力，6年投资回报",
          progress: "15%",
          team: "6名机械工程师，2名水产养殖专家",
          expected: "2026年第三季度 - 湄公河三角洲试点"
        }
      ]
    },
    timeline: {
      title: "发展路线图",
      milestones: [
        { year: "2023", event: "建立研发实验室，投资200万美元设备" },
        { year: "2024", event: "与3所大学合作，获得5项专利" },
        { year: "2025", event: "钙钛矿试点，AI平台测试版" },
        { year: "2026", event: "推出3款产品，实验室扩大2倍" }
      ]
    },
    team: {
      title: "研发实验室团队",
      description: "先进能源技术研发团队",
      leaders: [
        { name: "Jimmy Ha (河黄河)", role: "首席执行官兼创始人", background: "研发战略方向" },
        { name: "胡明新", role: "工程主管", background: "技术实施和应用" },
        { name: "黎光英", role: "首席技术官", background: "计算机科学硕士，系统和ERP专家" }
      ],
      engineers: [
        { name: "陈文山", role: "工程师", background: "可再生能源专家" },
        { name: "阮明瑞", role: "工程师", background: "电气系统专家" },
        { name: "陶有富", role: "工程师", background: "太阳能技术专家" }
      ]
    },
    publications: {
      title: "出版物与专利",
      items: [
        "5项已授予专利（钙钛矿稳定剂、电池回收工艺）",
        "12篇国际论文（Nature Energy、Advanced Materials、Joule）",
        "8次科学会议（WCPEC、IEEE PVSC、ECS）",
        "与3所大学合作：胡志明市理工大学、越南国立大学、麻省理工"
      ]
    },
    cta: {
      title: "加入研究",
      description: "我们正在寻找热衷于绿色能源和先进技术的研究人员和工程师",
      careers: "查看研发职位",
      partnership: "研究合作"
    }
  }
};

export async function generateMetadata({ params }: InnovationPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'R&D Lab - GoldenEnergy | Perovskite Solar, Battery Recycling, AI Grid Management',
    description: 'GoldenEnergy R&D Lab: researching Perovskite solar cells, lithium-ion battery recycling, AI-powered grid management. 30+ researchers, 5 patents, 12 publications.',
  };
}

export default async function InnovationPage({ params }: InnovationPageProps) {
  const { locale: localeParam } = await params;
  const normalizedLocale = normalizeLocale(localeParam);
  const locale = (normalizedLocale === 'id' ? 'en' : normalizedLocale) as 'vi' | 'en' | 'zh';
  const content = CONTENT[locale];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Static Background - Performance Optimized */}
      <Hero
        title={content.hero.title}
        subtitle={content.hero.subtitle}
        description={content.hero.description}
        backgroundImage="/Projects/Solar energy/Project 4.png"
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

      {/* Research Projects */}
      <Section
        title={content.projects.title}
        backgroundColor="bg-white"
      >
        <div className="max-w-6xl mx-auto space-y-8">
          {content.projects.items.map((project, index: number) => (
            <RevealOnScroll key={project.id} delay={0.1 * index}>
              <div className="p-8 bg-[#0A0A0A]/5 border border-gray-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-500">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-2xl font-light text-gray-900 mb-2">{project.name}</h3>
                    <div className="text-sm text-gray-400">{project.status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Progress</div>
                    <div className="text-2xl font-light text-gray-900">{project.progress}</div>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4">{project.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-10">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Team</div>
                    <div className="text-sm text-gray-400">{project.team}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected</div>
                    <div className="text-sm text-gray-400">{project.expected}</div>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Timeline */}
      <Section
        title={content.timeline.title}
        backgroundColor="bg-gray-50"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {content.timeline.milestones.map((milestone: { year: string; event: string }, index: number) => (
            <RevealOnScroll key={index} delay={0.05 * index}>
              <div className="flex gap-6 items-start group">
                <div className="text-3xl font-light text-gray-900/40 group-hover:text-gray-900 transition-colors min-w-[80px]">
                  {milestone.year}
                </div>
                <div className="flex-1 text-gray-400 group-hover:text-gray-200 transition-colors pb-6 border-b border-gray-10">
                  {milestone.event}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Team */}
      <Section
        title={content.team.title}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-300 text-lg mb-12">{content.team.description}</p>
            
            {/* Leaders */}
            <div className="mb-12">
              <h3 className="text-xl font-light text-gray-900/60 uppercase tracking-wider mb-6 text-center">Leadership Team</h3>
              <div className="space-y-6">
                {content.team.leaders.map((leader: { name: string; role: string; background: string }, index: number) => (
                  <div key={index} className="p-6 bg-[#0A0A0A]/5 border border-gray-10">
                    <div className="text-xl font-light text-gray-900 mb-2">{leader.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{leader.role}</div>
                    <div className="text-sm text-gray-400">{leader.background}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engineers */}
            <div>
              <h3 className="text-xl font-light text-gray-900/60 uppercase tracking-wider mb-6 text-center">Engineering Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content.team.engineers.map((engineer: { name: string; role: string; background: string }, index: number) => (
                  <div key={index} className="p-6 bg-[#0A0A0A]/5 border border-gray-10 text-center">
                    <div className="text-lg font-light text-gray-900 mb-2">{engineer.name}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{engineer.role}</div>
                    <div className="text-sm text-gray-400">{engineer.background}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Publications */}
      <Section
        title={content.publications.title}
        backgroundColor="bg-gray-50"
      >
        <div className="max-w-4xl mx-auto">
          {content.publications.items.map((item: string, index: number) => (
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
                {content.cta.partnership}
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </Section>
    </div>
  );
}

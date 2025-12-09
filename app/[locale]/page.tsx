import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import LoadingScreen from "@/components/Cinematic/LoadingScreen";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import TiltCard from "@/components/ui/TiltCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import SectionDivider from "@/components/ui/SectionDivider";

import { isLocale, type Locale } from "@/lib/i18n";
import goldenEnergyContent from "@/lib/content-goldenenergy.json";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }
  return candidate;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'GoldenEnergy - Renewable Energy For A Greener Future | Solar, Wind, IoT Smart Energy',
    description: 'GoldenEnergy - Trusted renewable energy partner. 50+ MW capacity, 500+ projects, 99.8% uptime. Solar, wind and IoT smart energy solutions for businesses and communities.',
    keywords: [
      'renewable energy',
      'solar energy',
      'wind energy',
      'IoT smart energy',
      'GoldenEnergy Vietnam',
      'năng lượng tái tạo',
      'điện mặt trời',
      'điện gió',
      'solar panels',
      'green energy',
      'sustainable energy',
    ],
    openGraph: {
      title: 'GoldenEnergy - Renewable Energy For A Greener Future',
      description: '50+ MW | 500+ projects | Solar + Wind + IoT | Trusted energy transformation partner',
      images: ['/images/og-goldenenergy.jpg'],
      locale: locale,
      type: 'website',
    },
    alternates: {
      canonical: 'https://www.goldenenergy.vn/vi',
      languages: {
        'vi': 'https://www.goldenenergy.vn/vi',
        'en': 'https://www.goldenenergy.vn/en',
        'zh': 'https://www.goldenenergy.vn/zh',
      },
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;
  const normalizedLocale = normalizeLocale(localeParam);
  const locale = normalizedLocale as 'vi' | 'en' | 'zh' | 'id';
  const content = goldenEnergyContent[locale];
  const { hero, origin, pillars, projects, cta } = content;

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Hero Section - Performance Optimized with Static Background */}
      <Hero
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        ctaText={hero.cta_primary}
        ctaLink={`/${locale}/contact`}
        backgroundImage="/Projects/Solar energy/Project 1.jpg"
        useStaticBackground={true}
        priority={true}
      />

      {/* Wave Divider after Hero */}
      <SectionDivider variant="wave" fillColor="#ffffff" height={60} />

      {/* Origin Section with Goldencard mention */}
      <Section
        title={origin.title}
        subtitle={origin.subtitle}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto">
            <div 
              className="text-lg md:text-xl text-gray-900 leading-relaxed mb-8 font-light"
              style={{ 
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ 
                __html: origin.content
                  .replace(/\*\*GoldenEnergy\*\*/g, '<strong><span class="golden-text">Golden</span><span class="energy-text">Energy</span></strong>')
                  .replace(/GoldenEnergy/g, '<span class="golden-text">Golden</span><span class="energy-text">Energy</span>')
                  .replace(/\n/g, '<br /><br />') 
              }}
            />

            {/* Goldencard Link - Centered */}
            <div className="mt-8 flex justify-center">
              <div className="p-6 bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🏢</div>
                  <div>
                    <div className="text-sm text-gray-600 uppercase tracking-wider mb-1">
                      {locale === 'vi' ? 'Hệ sinh thái' : locale === 'zh' ? '生态系统' : 'Ecosystem'}
                    </div>
                    <a
                      href="https://goldencard.vn"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-900 text-lg hover:text-[#D4AF37] transition-colors underline decoration-gray-300 hover:decoration-[#D4AF37]/60"
                    >
                      Goldencard.vn
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'vi' ? 'Thẻ thông minh & Fintech' :
                       locale === 'zh' ? '智能卡与金融科技' :
                       'Smart Cards & Fintech'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="mt-16 space-y-6">
              {origin.milestones.map((milestone: { year: string; event: string }, index: number) => (
                <RevealOnScroll key={index} delay={0.05 * index}>
                  <div className="flex gap-6 items-start group">
                    <div className="text-2xl font-light text-gray-400 group-hover:text-gray-900 transition-colors min-w-[80px]">
                      {milestone.year}
                    </div>
                    <div className="flex-1 text-gray-700 group-hover:text-gray-900 transition-colors pb-6 border-b border-gray-200">
                      {milestone.event}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Calculator Teaser */}
      <Section backgroundColor="bg-white">
        <RevealOnScroll delay={0.1}>
          <div className="max-w-5xl mx-auto">
            <div className="relative overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-12 rounded-xl shadow-lg">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="grid grid-cols-8 gap-2 h-full">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div key={i} className="border border-gray-300" />
                  ))}
                </div>
              </div>

              <div className="relative z-10 text-center">
                <div className="text-5xl mb-6">🔆</div>
                <h3 className="text-3xl font-light text-[#38BDF8] mb-4 tracking-wide">
                  {locale === 'vi' ? 'Ước Tính Hệ Thống Năng Lượng Mặt Trời' :
                   locale === 'zh' ? '估算您的太阳能系统' :
                   'Estimate Your Solar Energy System'}
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-3xl mx-auto leading-relaxed">
                  {locale === 'vi' ? 'Nhập hóa đơn điện hàng tháng và diện tích mái của bạn để nhận ước tính sơ bộ về công suất, số lượng tấm pin và chi phí đầu tư' :
                   locale === 'zh' ? '输入您的月电费和屋顶面积，获取容量、面板数量和投资成本的初步估算' :
                   'Enter your monthly electricity bill and roof area to get preliminary estimates of capacity, panel count and investment cost'}
                </p>

                {/* Mini Calculator Preview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      {locale === 'vi' ? 'Bước 1' : locale === 'zh' ? '步骤 1' : 'Step 1'}
                    </div>
                    <div className="text-gray-800 font-light">
                      {locale === 'vi' ? 'Nhập hóa đơn điện' : locale === 'zh' ? '输入电费单' : 'Enter electricity bill'}
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      {locale === 'vi' ? 'Bước 2' : locale === 'zh' ? '步骤 2' : 'Step 2'}
                    </div>
                    <div className="text-gray-800 font-light">
                      {locale === 'vi' ? 'Chọn loại tấm pin' : locale === 'zh' ? '选择面板类型' : 'Choose panel type'}
                    </div>
                  </div>
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                      {locale === 'vi' ? 'Bước 3' : locale === 'zh' ? '步骤 3' : 'Step 3'}
                    </div>
                    <div className="text-gray-800 font-light">
                      {locale === 'vi' ? 'Nhận kết quả' : locale === 'zh' ? '获取结果' : 'Get results'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    href={`/${locale}/solutions/solar`}
                    className="px-10 py-4 bg-[#D4AF37] text-white hover:bg-[#B89129] transition-all duration-500 font-semibold tracking-wider uppercase text-sm shadow-lg hover:shadow-xl rounded-lg"
                  >
                    {locale === 'vi' ? 'Dùng thử công cụ ước tính' : locale === 'zh' ? '试用估算工具' : 'Try Estimation Tool'}
                  </Link>
                  <Link
                    href={`/${locale}/contact`}
                    className="px-10 py-4 bg-gray-100 text-gray-800 border-2 border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-500 font-semibold tracking-wider uppercase text-sm shadow-lg hover:shadow-xl rounded-lg"
                  >
                    {locale === 'vi' ? 'Nhận tư vấn miễn phí' : locale === 'zh' ? '获取免费咨询' : 'Get free consultation'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Curve Divider before 4 Pillars */}
      <SectionDivider variant="curve" fillColor="#f9fafb" height={50} />

      {/* 4 Pillars Section with TiltCard */}
      <Section
        title={pillars.title}
        subtitle={pillars.subtitle}
        backgroundColor="bg-gray-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pillars.items.map((pillar: { id: string; icon: string; name: string; tagline: string; description: string; technologies: string[]; link: string }, index: number) => (
            <RevealOnScroll key={pillar.id} delay={0.1 * index}>
              <TiltCard 
                className="h-full rounded-lg"
                tiltMaxAngle={8}
                scale={1.02}
                glareEnabled={true}
              >
                <Link 
                  href={pillar.link}
                  className="group flex flex-col p-8 bg-white border border-gray-200 hover:border-[#D4AF37]/30 transition-all duration-500 h-full shadow-sm hover:shadow-lg rounded-lg"
                >
                  <div className="text-5xl mb-4">{pillar.icon}</div>
                  <h3 className="text-2xl font-light text-gray-900 mb-2 tracking-wide group-hover:text-[#D4AF37] transition-colors">
                    {pillar.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider">
                    {pillar.tagline}
                  </p>
                  <p className="text-gray-700 mb-6 leading-relaxed flex-grow">
                    {pillar.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.technologies.map((tech: string, i: number) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </Link>
              </TiltCard>
            </RevealOnScroll>
          ))}
        </div>
      </Section>

      {/* Stats Section with Animated Counters */}
      <Section backgroundColor="bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <RevealOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center py-8">
              <div className="p-6">
                <div className="text-4xl md:text-5xl font-light text-[#D4AF37] mb-2">
                  <AnimatedCounter end={50} suffix="+" duration={2} />
                </div>
                <div className="text-sm text-white/70 uppercase tracking-wider">
                  {locale === 'vi' ? 'MW Công suất' : locale === 'zh' ? 'MW 容量' : 'MW Capacity'}
                </div>
              </div>
              <div className="p-6">
                <div className="text-4xl md:text-5xl font-light text-[#D4AF37] mb-2">
                  <AnimatedCounter end={500} suffix="+" duration={2.5} />
                </div>
                <div className="text-sm text-white/70 uppercase tracking-wider">
                  {locale === 'vi' ? 'Dự án' : locale === 'zh' ? '项目' : 'Projects'}
                </div>
              </div>
              <div className="p-6">
                <div className="text-4xl md:text-5xl font-light text-[#D4AF37] mb-2">
                  <AnimatedCounter end={99} suffix="%" decimals={1} duration={2} />
                </div>
                <div className="text-sm text-white/70 uppercase tracking-wider">
                  {locale === 'vi' ? 'Thời gian hoạt động' : locale === 'zh' ? '正常运行时间' : 'Uptime'}
                </div>
              </div>
              <div className="p-6">
                <div className="text-4xl md:text-5xl font-light text-[#D4AF37] mb-2">
                  <AnimatedCounter end={15} suffix="+" duration={1.5} />
                </div>
                <div className="text-sm text-white/70 uppercase tracking-wider">
                  {locale === 'vi' ? 'Năm kinh nghiệm' : locale === 'zh' ? '年经验' : 'Years Experience'}
                </div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </Section>

      {/* CTA Section - Clean Green Gradient */}
      <Section backgroundColor="bg-gradient-to-br from-green-900 via-green-800 to-black">
        <RevealOnScroll delay={0.1}>
          <div className="text-center max-w-4xl mx-auto py-16">
            <p className="text-sm text-green-300 uppercase tracking-[0.2em] mb-4 font-semibold">
              {cta.subtitle}
            </p>
            <h2 className="text-4xl md:text-5xl font-light text-white tracking-wide mb-8">
              {cta.title}
            </h2>
            <p 
              className="text-xl text-gray-200 leading-relaxed mb-12 font-light"
              style={{ 
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.8,
              }}
              dangerouslySetInnerHTML={{ 
                __html: cta.description
                  .replace(/GoldenEnergy/g, '<span class="golden-text">Golden</span><span class="energy-text">Energy</span>')
              }}
            />
            <Link
              href={`/${locale}/contact`}
              className="inline-block px-12 py-5 bg-[#D4AF37] text-white hover:bg-[#B89129] transition-all duration-500 font-semibold tracking-wider uppercase text-sm shadow-xl hover:shadow-2xl"
            >
              {cta.button}
            </Link>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Featured Projects */}
      <Section
        title={projects.title}
        subtitle={projects.subtitle}
        backgroundColor="bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {projects.featured.map((project: { id: string; name: string; category: string; status: string; capacity: string; location: string; year: string; output: string; image: string; description: string }, index: number) => {
            // Static images for each project - performance optimized
            const projectImages = [
              '/Projects/Solar energy/Project 1.jpg',
              '/Projects/Solar energy/Project 2.jpg',
              '/Projects/Solar energy/Project 3.jpg',
              '/Projects/Solar energy/Project 4.png'
            ];
            const projectImage = projectImages[index] || projectImages[0];
            
            return (
              <RevealOnScroll key={project.id} delay={0.1 * index}>
                <TiltCard 
                  className="h-full rounded-lg"
                  tiltMaxAngle={6}
                  scale={1.01}
                  glareEnabled={true}
                >
                  <div className="group border border-gray-200 overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-500 flex flex-col h-full bg-white shadow-sm hover:shadow-lg rounded-lg">
                    {/* Project Image - Performance Optimized */}
                    <div className="relative aspect-video overflow-hidden">
                      <Image 
                        src={projectImage}
                        alt={project.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYSITEHE0FR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEAAwEAAAAAAAAAAAAAAAABAAIRIf/aAAwDAQACEQMRAD8AyDx/qC7WnUEWdBmsNKZUpKmnGVFJCgOxnn41r2j/ACI60wHFahuTjT+3f7ELhxAJ4+VIpSsEmC//2Q=="
                      />
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-[#D4AF37]/90 text-white px-3 py-1 text-xs uppercase tracking-wider rounded">
                        {project.category}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                        {project.category}
                      </div>
                      <h3 className="text-xl font-light text-gray-900 mb-3 group-hover:text-[#D4AF37] transition-colors">
                        {project.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
                        {project.description}
                      </p>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            {locale === 'vi' ? 'Công suất' : locale === 'zh' ? '容量' : 'Capacity'}
                          </div>
                          <div className="text-gray-900 font-light">{project.capacity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            {locale === 'vi' ? 'Sản lượng' : locale === 'zh' ? '产量' : 'Output'}
                          </div>
                          <div className="text-gray-900 font-light">{project.output}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>

        {/* View All Projects Link */}
        <RevealOnScroll delay={0.4}>
          <div className="text-center mt-12">
            <Link
              href={`/${locale}/projects`}
              className="inline-block px-8 py-4 bg-gray-100 text-gray-900 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-500"
            >
              {locale === 'vi' ? 'Xem tất cả dự án' : locale === 'zh' ? '查看所有项目' : 'View all projects'}
            </Link>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Location Map Section */}
      <Section backgroundColor="bg-white">
        <RevealOnScroll delay={0.1}>
          <div className="text-center mb-12">
            <p className="text-sm text-gray-500 uppercase tracking-[0.2em] mb-3 font-semibold">
              {locale === 'vi' ? 'Vị trí' : locale === 'zh' ? '位置' : 'Location'}
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 tracking-wide mb-4">
              {locale === 'vi' ? 'Trụ sở chính' : locale === 'zh' ? '总部' : 'Headquarters'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {locale === 'vi' ? 'Ghé thăm văn phòng của chúng tôi hoặc liên hệ để biết thêm thông tin về các giải pháp năng lượng tái tạo' : 
               locale === 'zh' ? '访问我们的办公室或联系我们了解更多可再生能源解决方案' :
               'Visit our office or contact us for more information about renewable energy solutions'}
            </p>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <div className="max-w-6xl mx-auto">
            {/* Google Map - Sunrise Riverside */}
            <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden border-2 border-gray-200 shadow-xl mb-12">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500!2d106.7220!3d10.7198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529d1e3a67e2f%3A0x9f8d5b3a2c7a8e6f!2sSunrise%20Riverside%20Block%20B!5e0!3m2!1svi!2svn!4v1702123200000!5m2!1svi!2svn"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Golden Energy Office - Sunrise Riverside, Phước Kiến, Nhà Bè"
              />
            </div>

            {/* Location Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Headquarters */}
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {locale === 'vi' ? 'Trụ sở chính' : locale === 'zh' ? '总部' : 'Headquarters'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">A2206-A2207 Tháp A</strong><br />
                  Sunrise Riverside, Phước Kiến, Nhà Bè<br />
                  TP. Hồ Chí Minh, Việt Nam
                </p>
              </div>

              {/* Contact */}
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4">📞</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {locale === 'vi' ? 'Liên hệ' : locale === 'zh' ? '联系方式' : 'Contact'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Email:</strong><br />
                  sales@goldenenergy.vn<br />
                  <strong className="text-gray-900">Hotline:</strong><br />
                  03333 142 88 / 0903 117 277
                </p>
              </div>

              {/* Working Hours */}
              <div className="text-center p-8 bg-gradient-to-br from-yellow-50 to-white border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-5xl mb-4">🕐</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {locale === 'vi' ? 'Giờ làm việc' : locale === 'zh' ? '工作时间' : 'Working Hours'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {locale === 'vi' ? 'Thứ 2 - Thứ 7' : locale === 'zh' ? '周一至周六' : 'Monday - Saturday'}<br />
                  <strong className="text-gray-900">8:00 - 17:30</strong><br />
                  {locale === 'vi' ? 'Chủ nhật nghỉ' : locale === 'zh' ? '周日休息' : 'Sunday Closed'}
                </p>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Section>
    </>
  );
}

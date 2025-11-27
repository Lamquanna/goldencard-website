import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";
import goldenEnergyContent from "@/lib/content-goldenenergy.json";

// Solar project images mapping
const projectImages = [
  "/Projects/Solar energy/Project 1.jpg",
  "/Projects/Solar energy/Project 2.jpg",
  "/Projects/Solar energy/Project 3.jpg",
  "/Projects/Solar energy/Project 4.png",
  "/Projects/Solar energy/Homestay mái pin 1.png",
  "/Projects/Solar energy/Homestay mái pin 2.png",
  "/Projects/Solar energy/Homestay mái pin 3.png",
  "/Projects/Solar energy/Homestay mái pin 4.png",
  "/Projects/Solar energy/homestay mái pin 5.png",
  "/Projects/Solar energy/homestay mái pin 6.png",
  "/Projects/Solar energy/Homestay 7.png",
  "/Projects/Solar energy/Nhà mái pin 1.png",
  "/Projects/Solar energy/nhà mái pin 2.png",
  "/Projects/Solar energy/nhà mái pin 3.png",
  "/Projects/Solar energy/nhà mái pin 4.png",
  "/Projects/Solar energy/nhà mái pin 5.png",
  "/Projects/Solar energy/nhà mái pin 6.png",
];

interface ProjectsPageProps {
  params: Promise<{ locale: string }>;
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }
  return candidate;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'Projects - GoldenEnergy | 500+ Solar, Wind, IoT Deployments',
    description: 'Explore GoldenEnergy featured projects: 2.5MW factory, 500kW hybrid resort, smart office, wind farms. Live, pilot and incoming projects across Vietnam.',
  };
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale: localeParam } = await params;
  const normalizedLocale = normalizeLocale(localeParam);
  const locale = (normalizedLocale === 'id' ? 'en' : normalizedLocale) as 'vi' | 'en' | 'zh';
  const content = goldenEnergyContent[locale];
  const { projects } = content;

  const statusLabels = {
    vi: { all: 'Tất cả', Live: 'Đang vận hành', Pilot: 'Thí điểm', Incoming: 'Sắp triển khai' },
    en: { all: 'All', Live: 'Live', Pilot: 'Pilot', Incoming: 'Incoming' },
    zh: { all: '全部', Live: '运行中', Pilot: '试点', Incoming: '即将推出' }
  };

  const allProjects = projects.featured;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Image Slider */}
      <Hero
        title={projects.title}
        subtitle={projects.subtitle}
        backgroundImage="/Projects/Solar energy/Project 3.jpg"
        useStaticBackground={true}
        enableSlider={true}
        sliderInterval={4000}
      />
      
      {/* Stats Bar */}
      <Section backgroundColor="bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <RevealOnScroll delay={0.1}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">50+ MW</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {locale === 'vi' ? 'Công suất' : locale === 'zh' ? '容量' : 'Capacity'}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">500+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {locale === 'vi' ? 'Dự án' : locale === 'zh' ? '项目' : 'Projects'}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.3}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">300+</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {locale === 'vi' ? 'Khách hàng' : locale === 'zh' ? '客户' : 'Clients'}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.4}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">99.8%</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {locale === 'vi' ? 'Thời gian hoạt động' : locale === 'zh' ? '正常运行时间' : 'Uptime'}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </Section>
      
      {/* Projects Grid */}
      <Section
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              {locale === 'vi' 
                ? 'Khám phá các dự án năng lượng tái tạo tiêu biểu của GoldenEnergy trên khắp Việt Nam' 
                : locale === 'zh'
                ? '探索 GoldenEnergy 在越南各地的杰出可再生能源项目'
                : 'Explore GoldenEnergy featured renewable energy projects across Vietnam'}
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Projects Grid */}
      <Section backgroundColor="bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {allProjects.map((project: { id: string; name: string; category: string; status: string; capacity: string; location: string; year: string; output: string; description: string }, index: number) => (
              <RevealOnScroll key={project.id} delay={0.1 * index}>
                <div className="group border border-gray-10 overflow-hidden hover:border-gray-30 transition-all duration-500">
                  {/* Project Image */}
                  <div className="aspect-video bg-gradient-to-br from-white/10 to-white/5 relative overflow-hidden">
                    <Image
                      src={projectImages[index % projectImages.length]}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="text-white text-sm uppercase tracking-wider font-semibold">
                        {locale === 'vi' ? 'Xem chi tiết' : locale === 'zh' ? '查看详情' : 'View details'}
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold uppercase tracking-wider">
                      {statusLabels[locale][project.status as keyof typeof statusLabels['vi']] || project.status}
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="p-6 bg-[#0A0A0A]/5">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      {project.category}
                    </div>
                    <h3 className="text-2xl font-light text-gray-900 mb-2 group-hover:text-gray-200 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Location & Year */}
                    <div className="flex gap-4 mb-4 text-xs text-gray-500">
                      <span>📍 {project.location}</span>
                      <span>📅 {project.year}</span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-10">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {locale === 'vi' ? 'Công suất' : locale === 'zh' ? '容量' : 'Capacity'}
                        </div>
                        <div className="text-gray-900 font-light text-lg">{project.capacity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          {locale === 'vi' ? 'Sản lượng' : locale === 'zh' ? '产量' : 'Output'}
                        </div>
                        <div className="text-gray-900 font-light text-lg">{project.output}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section
        title={locale === 'vi' ? 'Dự án tiếp theo của bạn?' : locale === 'zh' ? '您的下一个项目？' : 'Your next project?'}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl text-gray-300 mb-8 leading-relaxed font-light">
              {locale === 'vi' 
                ? 'Liên hệ với đội ngũ chuyên gia GoldenEnergy để bắt đầu dự án năng lượng tái tạo của bạn' 
                : locale === 'zh'
                ? '联系 GoldenEnergy 专家团队开始您的可再生能源项目'
                : 'Contact GoldenEnergy expert team to start your renewable energy project'}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-block px-12 py-5 bg-[#D4AF37] text-white hover:bg-[#C19B2E] transition-all duration-500 font-semibold tracking-wider uppercase text-sm"
            >
              {locale === 'vi' ? 'Bắt đầu dự án' : locale === 'zh' ? '开始项目' : 'Start project'}
            </a>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Project Gallery */}
      <Section
        title={locale === 'vi' ? 'Thư viện dự án' : locale === 'zh' ? '项目图库' : 'Project Gallery'}
        backgroundColor="bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projectImages.map((src, index) => (
              <RevealOnScroll key={src} delay={0.05 * index}>
                <div className="group relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={src}
                    alt={`Solar project ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">
                      {locale === 'vi' ? `Dự án ${index + 1}` : `Project ${index + 1}`}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

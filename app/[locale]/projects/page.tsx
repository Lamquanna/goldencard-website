import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";
import { getProjects, getProjectStats } from "@/sanity/lib/client";
import goldenEnergyContent from "@/lib/content-goldenenergy.json";

// ISR: Revalidate every 60 seconds
export const revalidate = 60;

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
  const { projects: pageContent } = content;

  // ✅ FETCH FROM SANITY CMS
  const projects = await getProjects(locale, 50);
  const stats = await getProjectStats(locale);

  // Fallback to mock data if CMS is empty
  const displayProjects = projects.length > 0 ? projects : pageContent.featured;
  const displayStats = stats.total > 0 ? stats : {
    totalCapacity: 50,
    total: 500,
    satisfied: 300,
  };

  // Type labels
  const typeLabels = {
    residential: locale === 'vi' ? 'Hộ gia đình' : locale === 'zh' ? '住宅' : 'Residential',
    commercial: locale === 'vi' ? 'Thương mại' : locale === 'zh' ? '商业' : 'Commercial',
    industrial: locale === 'vi' ? 'Công nghiệp' : locale === 'zh' ? '工业' : 'Industrial',
  };

  const allProjects = displayProjects;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Image Slider */}
      <Hero
        title={pageContent.title}
        subtitle={pageContent.subtitle}
        backgroundImage="/Projects/Solar energy/Project 3.jpg"
        useStaticBackground={true}
        enableSlider={true}
        sliderInterval={4000}
      />
      
      {/* Stats Bar - ✅ DYNAMIC FROM SANITY */}
      <Section backgroundColor="bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <RevealOnScroll delay={0.1}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{displayStats.totalCapacity || 50}+ MW</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                {locale === 'vi' ? 'Công suất' : locale === 'zh' ? '容量' : 'Capacity'}
              </div>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.2}>
            <div className="text-center p-4 border border-gray-10">
              <div className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{displayStats.total || 500}+</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allProjects.map((project: any, index: number) => {
              // Support both Sanity format and mock data format
              const projectId = project._id || project.id;
              const projectName = project.title || project.name;
              const projectSlug = project.slug || project.id;
              const projectImage = project.mainImageUrl || projectImages[index % projectImages.length];
              const projectCapacity = project.capacity ? `${project.capacity}kW` : project.capacity;
              const projectSavings = project.savings || 0;
              const projectType = project.systemType || project.category;
              const projectLocation = project.location?.city || project.location;
              
              return (
                <RevealOnScroll key={projectId} delay={0.1 * (index % 3)}>
                  <Link 
                    href={`/${locale}/projects/${projectSlug}`}
                    className="group block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500"
                  >
                    {/* Project Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={projectImage}
                        alt={projectName}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                          {typeLabels[projectType as keyof typeof typeLabels] || projectType}
                        </span>
                      </div>
                      
                      {/* Capacity Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          {projectCapacity}
                        </span>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                        {projectName}
                      </h3>
                      
                      {projectLocation && (
                        <p className="text-sm text-gray-600 mb-3">
                          📍 {projectLocation}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm">
                          <span className="text-gray-500">
                            {locale === 'vi' ? 'Tiết kiệm' : locale === 'zh' ? '节省' : 'Savings'}:
                          </span>
                          <span className="ml-2 font-bold text-green-600">
                            {projectSavings}%
                          </span>
                        </div>
                        
                        <div className="text-green-600 font-semibold">
                          {locale === 'vi' ? 'Xem chi tiết' : locale === 'zh' ? '查看详情' : 'View details'} →
                        </div>
                      </div>
                    </div>
                  </Link>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* No Projects Message - Only show if Sanity is empty */}
          {projects.length === 0 && (
            <div className="text-center py-12 mt-8">
              <div className="inline-block px-8 py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-gray-700 mb-4">
                  {locale === 'vi' 
                    ? '⚠️ Chưa có dự án nào trong CMS. Vui lòng thêm dự án trong Sanity Studio.'
                    : 'No projects found in CMS. Please add projects in Sanity Studio.'}
                </p>
                <a 
                  href="/cms" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                >
                  {locale === 'vi' ? 'Mở Sanity Studio' : 'Open Sanity Studio'}
                </a>
              </div>
            </div>
          )}
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

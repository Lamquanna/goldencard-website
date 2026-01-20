import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/Container';
import { getProjectBySlug, getProjects, Project } from '@/sanity/lib/client';
import { isLocale, type Locale } from '@/lib/i18n';
import goldenEnergyContent from "@/lib/content-goldenenergy.json";

interface PageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

// Mock project type matching JSON structure
interface MockProject {
  id: string;
  name: string;
  category: string;
  status: string;
  capacity: string;
  location: string;
  year: string;
  output: string;
  image: string;
  description: string;
}

// Helper to get mock project by ID
function getMockProjectById(id: string, locale: 'vi' | 'en' | 'zh'): MockProject | null {
  const content = goldenEnergyContent[locale];
  const projects = content?.projects?.featured as MockProject[] | undefined;
  if (!projects) return null;
  return projects.find(p => p.id === id) || null;
}

// Convert mock project to unified format for rendering
function mockToProject(mock: MockProject): Partial<Project> {
  return {
    _id: mock.id,
    title: mock.name,
    slug: mock.id,
    systemType: mock.category === 'Solar' ? 'commercial' : 'industrial',
    capacity: parseInt(mock.capacity) || 0,
    location: mock.location,
    completionDate: `${mock.year}-01-01`,
    imageUrl: mock.image,
    shortDescription: mock.description,
    challenges: mock.output,
    solution: mock.description,
  };
}

// Generate static paths for all projects (Sanity + Mock)
export async function generateStaticParams() {
  const locales = ['vi', 'en', 'zh', 'id'];
  const paths: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    // Get Sanity projects
    try {
      const projects = await getProjects(locale);
      for (const project of projects) {
        const slugValue = typeof project.slug === 'string' 
          ? project.slug 
          : (project.slug as any)?.current || '';
        
        if (slugValue) {
          paths.push({ locale, slug: slugValue });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch Sanity projects for ${locale}:`, error);
    }
    
    // Add mock project paths
    const normalizedLocale = (locale === 'id' ? 'en' : locale) as keyof typeof goldenEnergyContent;
    const mockProjects = goldenEnergyContent[normalizedLocale]?.projects?.featured;
    if (mockProjects && Array.isArray(mockProjects)) {
      for (const mock of mockProjects as MockProject[]) {
        if (mock.id && !paths.some(p => p.locale === locale && p.slug === mock.id)) {
          paths.push({ locale, slug: mock.id });
        }
      }
    }
  }

  return paths;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Try Sanity first
  let project = await getProjectBySlug(slug, locale);
  
  // Fallback to mock data if not found in Sanity
  if (!project && (slug.startsWith('proj-') || slug.length < 20)) {
    const normalizedLocale = (locale === 'id' ? 'en' : locale) as 'vi' | 'en' | 'zh';
    const mockProject = getMockProjectById(slug, normalizedLocale);
    if (mockProject) {
      const converted = mockToProject(mockProject);
      return {
        title: `${converted.title} | Golden Energy Projects`,
        description: converted.shortDescription || '',
      };
    }
  }

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | Golden Energy Projects`,
    description: project.challenges || project.solution || '',
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale: localeParam, slug } = await params;
  
  // Validate locale
  if (!isLocale(localeParam)) {
    notFound();
  }
  
  const locale = localeParam as Locale;
  const normalizedLocale = (locale === 'id' ? 'en' : locale) as 'vi' | 'en' | 'zh';
  
  // Try Sanity first
  let project = await getProjectBySlug(slug, locale);
  let isMockData = false;
  
  // Fallback to mock data if not found in Sanity
  if (!project) {
    const mockProject = getMockProjectById(slug, normalizedLocale);
    if (mockProject) {
      project = mockToProject(mockProject) as any;
      isMockData = true;
    }
  }

  if (!project) {
    notFound();
  }

  // Type labels
  const typeLabels: Record<string, Record<string, string>> = {
    residential: {
      vi: 'Hộ gia đình',
      en: 'Residential',
      zh: '住宅',
      id: 'Residential',
    },
    commercial: {
      vi: 'Thương mại',
      en: 'Commercial',
      zh: '商业',
      id: 'Commercial',
    },
    industrial: {
      vi: 'Công nghiệp',
      en: 'Industrial',
      zh: '工业',
      id: 'Industrial',
    },
  };

  const translations = {
    vi: {
      backToProjects: 'Quay lại dự án',
      client: 'Khách hàng',
      location: 'Địa điểm',
      capacity: 'Công suất hệ thống',
      savings: 'Tiết kiệm',
      payback: 'Hoàn vốn',
      investment: 'Đầu tư',
      completed: 'Hoàn thành',
      challenge: 'Thách thức',
      solution: 'Giải pháp',
      results: 'Kết quả',
      testimonial: 'Đánh giá khách hàng',
      gallery: 'Thư viện ảnh dự án',
    },
    en: {
      backToProjects: 'Back to projects',
      client: 'Client',
      location: 'Location',
      capacity: 'System capacity',
      savings: 'Savings',
      payback: 'Payback',
      investment: 'Investment',
      completed: 'Completed',
      challenge: 'Challenge',
      solution: 'Solution',
      results: 'Results',
      testimonial: 'Customer review',
      gallery: 'Project gallery',
    },
    zh: {
      backToProjects: '返回项目',
      client: '客户',
      location: '位置',
      capacity: '系统容量',
      savings: '节省',
      payback: '回本',
      investment: '投资',
      completed: '完成',
      challenge: '挑战',
      solution: '解决方案',
      results: '结果',
      testimonial: '客户评价',
      gallery: '项目图库',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.vi;
  const typeLabel = typeLabels[project.systemType]?.[locale] || project.systemType;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-r from-green-900 to-green-700">
        <div className="absolute inset-0">
          <Image
            src={project.imageUrl || '/Projects/Solar energy/Project 1.jpg'}
            alt={project.mainImageAlt || project.title}
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>
        
        <Container>
          <div className="relative z-10 flex flex-col justify-center h-96 text-white">
            <Link
              href={`/${locale}/projects`}
              className="inline-flex items-center text-white/90 hover:text-white mb-4"
            >
              ← {t.backToProjects}
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                {typeLabel}
              </span>
              {typeof project.location === 'string' ? (
                <span className="flex items-center text-white/90">
                  📍 {project.location}
                </span>
              ) : project.location?.city && (
                <span className="flex items-center text-white/90">
                  📍 {project.location.city}
                </span>
              )}
            </div>
            
            <h1 className="text-5xl font-bold mb-4">{project.title}</h1>
            
            <div className="flex flex-wrap gap-8">
              <div>
                <div className="text-3xl font-bold">{project.capacity}kW</div>
                <div className="text-white/80">{t.capacity}</div>
              </div>
              {project.savings && (
                <div>
                  <div className="text-3xl font-bold">{project.savings}%</div>
                  <div className="text-white/80">{t.savings}</div>
                </div>
              )}
              {project.paybackPeriod && (
                <div>
                  <div className="text-3xl font-bold">{project.paybackPeriod}y</div>
                  <div className="text-white/80">{t.payback}</div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Project Details */}
      <section className="py-20 bg-gray-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {locale === 'vi' ? 'Thông tin dự án' : locale === 'zh' ? '项目信息' : 'Project information'}
              </h2>
              
              <div className="space-y-4">
                {project.client && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">{t.client}:</span>
                    <span className="font-semibold text-gray-900">{project.client}</span>
                  </div>
                )}
                
                {project.location && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">{t.location}:</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {typeof project.location === 'string' 
                        ? project.location 
                        : `${project.location.address || ''}, ${project.location.city || ''}`}
                    </span>
                  </div>
                )}
                
                {project.investment && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">{t.investment}:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(project.investment)}
                    </span>
                  </div>
                )}
                
                {project.completionDate && (
                  <div className="flex justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">{t.completed}:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(project.completionDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Challenge & Solution */}
            <div className="space-y-8">
              {project.challenges && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.challenge}</h3>
                  <p className="text-gray-700 leading-relaxed">{project.challenges}</p>
                </div>
              )}
              
              {project.solution && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.solution}</h3>
                  <p className="text-gray-700 leading-relaxed">{project.solution}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {project.results && project.results.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">{t.results}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.results.map((result, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">✓</span>
                      <p className="text-gray-700">{result}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Gallery */}
      {project.galleryImages && project.galleryImages.length > 0 && (
        <section className="py-20 bg-white">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              {t.gallery}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.galleryImages.map((imageUrl, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={`${project.title} - Gallery image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Testimonial */}
      {project.testimonial?.quote && (
        <section className="py-20 bg-gray-50">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">{t.testimonial}</h3>
              
              <blockquote className="text-2xl text-gray-700 italic mb-6">
                "{project.testimonial.quote}"
              </blockquote>
              
              <div>
                <p className="font-bold text-gray-900">{project.testimonial.author}</p>
                {project.testimonial.position && (
                  <p className="text-gray-600">{project.testimonial.position}</p>
                )}
                {project.testimonial.rating && (
                  <div className="flex justify-center gap-1 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        {i < project.testimonial!.rating! ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800">
        <Container>
          <div className="text-center text-white max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              {locale === 'vi' 
                ? 'Bạn cũng muốn tiết kiệm như vậy?' 
                : locale === 'zh' 
                ? '您也想节省这么多吗？' 
                : 'Want to save like this too?'}
            </h2>
            <p className="text-xl mb-8">
              {locale === 'vi'
                ? 'Tính toán ngay để biết chi phí và lợi ích cho dự án của bạn'
                : locale === 'zh'
                ? '立即计算以了解您的项目成本和收益'
                : 'Calculate now to know cost and benefits for your project'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/tinh-toan`}
                className="px-8 py-4 bg-white text-green-700 rounded-lg font-bold hover:bg-gray-100 transition-all"
              >
                {locale === 'vi' ? 'Tính toán ngay' : locale === 'zh' ? '立即计算' : 'Calculate now'}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-all"
              >
                {locale === 'vi' ? 'Tư vấn miễn phí' : locale === 'zh' ? '免费咨询' : 'Free consultation'}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

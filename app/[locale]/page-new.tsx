import type { Metadata } from "next";
import { notFound } from "next/navigation";

import LoadingScreen from "@/components/Cinematic/LoadingScreen";
import Hero from "@/components/Cinematic/Hero";
import Section from "@/components/Cinematic/Section";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { isLocale, type Locale } from "@/lib/i18n";
import { getHomeContent } from "@/lib/content";

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
    title: 'Golden Energy Vietnam - Giải Pháp Điện Mặt Trời Hàng Đầu | Lắp Đặt Tấm Pin Năng Lượng Mặt Trời',
    description: 'Golden Energy - Công ty lắp đặt hệ thống điện mặt trời uy tín tại Việt Nam. Hơn 15 năm kinh nghiệm, 500+ dự án thành công. Tư vấn miễn phí, tiết kiệm chi phí điện đến 70%. Đối tác Huawei, Growatt, Jinko Solar.',
    keywords: [
      'điện mặt trời',
      'năng lượng mặt trời',
      'tấm pin năng lượng mặt trời',
      'lắp đặt điện mặt trời',
      'hệ thống điện mặt trời',
      'Golden Energy Vietnam',
      'solar panel Vietnam',
      'tiết kiệm điện',
      'năng lượng tái tạo',
      'điện mặt trời hòa lưới',
      'pin mặt trời',
      'Huawei inverter',
      'Growatt',
      'Jinko Solar',
    ],
    openGraph: {
      title: 'Golden Energy Vietnam - Giải Pháp Điện Mặt Trời Hàng Đầu',
      description: '15+ năm kinh nghiệm | 500+ dự án thành công | 50MW+ công suất lắp đặt | Tư vấn miễn phí',
      images: ['/images/og-golden-energy.jpg'],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Golden Energy Vietnam - Điện Mặt Trời Chất Lượng',
      description: 'Giải pháp năng lượng mặt trời toàn diện cho gia đình và doanh nghiệp',
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
  const locale = normalizeLocale(localeParam);
  const content = getHomeContent(locale);
  const { hero, sections } = content;

  return (
    <>
      {/* Loading Screen */}
      <LoadingScreen />

      {/* Hero Section */}
      <Hero
        title="Golden Energy"
        subtitle="ENERGY SOLUTIONS"
        description={hero.tagline}
        ctaText={locale === "vi" ? "Khám phá" : locale === "zh" ? "探索" : "Explore"}
        ctaLink={`/${locale}/services`}
      />

      {/* About Section */}
      <Section
        title={sections.about.title}
        subtitle={sections.about.subtitle}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-xl md:text-2xl text-[#CCC] leading-relaxed mb-12 font-light"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.5,
              }}
            >
              {sections.about.description}
            </p>
            <a
              href={`/${locale}/about`}
              className="inline-block px-8 py-4 bg-[#0A0A0A]/5 text-[#EEE] border border-gray-20 rounded-full hover:bg-[#0A0A0A]/10 hover:border-gray-40 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] tracking-[0.05em]"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {sections.about.cta}
            </a>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Design & Stats Section */}
      <Section
        title={sections.design.title}
        subtitle={sections.design.subtitle}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.2}>
          <div className="max-w-4xl mx-auto">
            <p 
              className="text-lg md:text-xl text-[#CCC] leading-relaxed text-center mb-16 font-light"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.5,
              }}
            >
              {sections.design.description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Stats cards */}
              {[
                sections.design.stats.projects,
                sections.design.stats.capacity,
                sections.design.stats.experience,
                sections.design.stats.savings,
              ].map((stat, index) => (
                <RevealOnScroll key={index} delay={0.1 * (index + 1)}>
                  <div className="text-center p-6 bg-[#0A0A0A]/5 border border-gray-10 rounded-2xl hover:bg-[#0A0A0A]/10 hover:border-gray-20 transition-all duration-500">
                    <div 
                      className="text-5xl font-light text-[#EEE] mb-3"
                      style={{ fontFamily: "Playfair Display, serif", fontWeight: 300 }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-sm text-[#CCC]/60 uppercase tracking-[0.15em] font-light"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Technology Section */}
      <Section
        title={sections.technology.title}
        subtitle={sections.technology.subtitle}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-xl md:text-2xl text-[#CCC] leading-relaxed font-light"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.5,
              }}
            >
              {sections.technology.description}
            </p>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Projects Section */}
      <Section
        title={sections.projects.title}
        subtitle={sections.projects.subtitle}
        backgroundColor="bg-white"
      >
        <div className="space-y-4 text-center text-[#CCC]">
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif" }}>
            Projects showcase coming soon...
          </p>
        </div>
      </Section>

      {/* GoldenCard Section */}
      <Section
        title={sections.goldencard.title}
        subtitle={sections.goldencard.subtitle}
        backgroundColor="bg-gray-50"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-xl md:text-2xl text-[#CCC] leading-relaxed mb-12 font-light"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.5,
              }}
            >
              {sections.goldencard.description}
            </p>
            <a
              href={`/${locale}/services/goldencard`}
              className="inline-block px-8 py-4 bg-[#0A0A0A]/5 border border-gray-20 text-[#EEE] rounded-full hover:bg-[#0A0A0A]/10 hover:border-gray-40 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] tracking-[0.05em]"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {sections.goldencard.cta}
            </a>
          </div>
        </RevealOnScroll>
      </Section>

      {/* Contact Section */}
      <Section
        title={sections.contact.title}
        subtitle={sections.contact.subtitle}
        backgroundColor="bg-white"
      >
        <RevealOnScroll delay={0.1}>
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-xl md:text-2xl text-[#CCC] leading-relaxed mb-12 font-light"
              style={{ 
                fontFamily: "var(--font-montserrat), sans-serif",
                letterSpacing: "0.025em",
                lineHeight: 1.5,
              }}
            >
              {sections.contact.description}
            </p>
            <a
              href={`/${locale}/contact`}
              className="inline-block px-12 py-5 bg-[#0A0A0A]/5 text-[#EEE] border border-gray-20 font-light tracking-[0.05em] rounded-full hover:bg-[#0A0A0A]/10 hover:border-gray-40 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              {sections.contact.cta}
            </a>
          </div>
        </RevealOnScroll>
      </Section>

      {/* SEO Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Golden Energy Vietnam',
            url: 'https://www.goldenenergy.vn',
            logo: 'https://www.goldenenergy.vn/logo.png',
            description: 'Công ty lắp đặt hệ thống điện mặt trời hàng đầu Việt Nam',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '625 Trần Xuân Soạn, Phường Tân Hưng',
              addressLocality: 'TP. Hồ Chí Minh',
              addressCountry: 'VN',
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+84-908-733-338',
              email: 'sales@goldenenergy.vn',
              contactType: 'Customer Service',
              areaServed: 'VN',
              availableLanguage: ['vi', 'en', 'zh'],
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '500',
            },
          }),
        }}
      />
    </>
  );
}

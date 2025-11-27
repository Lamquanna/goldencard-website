import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LoadingScreen from "@/components/Cinematic/LoadingScreen";
import Hero from "@/components/Cinematic/Hero";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import { getServices } from "@/lib/content";
import { isLocale, type Locale } from "@/lib/i18n";
import { buildPageMetadata } from "@/lib/seo";

interface ServicesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ServicesPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  return buildPageMetadata(locale, "services");
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  const services = getServices(locale);
  const hero = services?.hero;
  const highlights = services?.service_highlights ?? {};

  const servicesList = [
    {
      key: "solar",
      title: highlights.solar_solutions?.headline ?? (locale === "vi" ? "Năng Lượng Mặt Trời" : locale === "zh" ? "太阳能" : "Solar Energy"),
      subtitle: highlights.solar_solutions?.tagline ?? "",
      benefits: highlights.solar_solutions?.short_benefits ?? [],
      icon: "☀️",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&q=80",
    },
    {
      key: "cards",
      title: highlights.magnetic_cards?.headline ?? (locale === "vi" ? "Thẻ Từ Thông Minh" : locale === "zh" ? "智能卡" : "Smart Cards"),
      subtitle: highlights.magnetic_cards?.tagline ?? "",
      benefits: highlights.magnetic_cards?.short_benefits ?? [],
      icon: "💳",
      image: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=1920&q=80",
    },
    {
      key: "bank",
      title: highlights.bank_cards?.headline ?? (locale === "vi" ? "Thẻ Ngân Hàng" : locale === "zh" ? "银行卡" : "Bank Cards"),
      subtitle: highlights.bank_cards?.tagline ?? "",
      benefits: highlights.bank_cards?.short_benefits ?? [],
      icon: "🏦",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=80",
    },
    {
      key: "it",
      title: highlights.it_services?.headline ?? (locale === "vi" ? "Công Nghệ Thông Tin" : locale === "zh" ? "信息技术" : "IT Services"),
      subtitle: highlights.it_services?.tagline ?? "",
      benefits: highlights.it_services?.short_benefits ?? [],
      icon: "💻",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80",
    },
  ];

  return (
    <>
      <LoadingScreen />
      
      <main className="relative">
        {/* Hero Section */}
        <Hero
          title={hero?.headline ?? (locale === "vi" ? "Dịch Vụ" : locale === "zh" ? "服务" : "Services")}
          subtitle={hero?.subheadline ?? ""}
          description=""
          ctaText=""
          ctaLink=""
        />

        {/* Trust Bullets */}
        {hero?.trust_bullets && hero.trust_bullets.length > 0 && (
          <section className="py-24 bg-[#0A0A0A]">
            <div className="max-w-7xl mx-auto px-6">
              <RevealOnScroll >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {hero.trust_bullets.map((bullet: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 group">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500 mt-2 group-hover:scale-150 transition-transform" />
                      <p className="text-[#EEE] text-base md:text-lg">{bullet}</p>
                    </div>
                  ))}
                </div>
              </RevealOnScroll>
            </div>
          </section>
        )}

        {/* Services Sections */}
        {servicesList.map((service, index) => (
          <section key={service.key} className={`py-32 ${index % 2 === 0 ? "bg-[#0A0A0A]" : "bg-[#111111]"}`}>
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <RevealOnScroll >
                  <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  {service.subtitle && (
                    <p className="text-xl text-[#CCC]">
                      {service.subtitle}
                    </p>
                  )}
                </RevealOnScroll>
              </div>

              {service.benefits.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {service.benefits.map((benefit: string, idx: number) => (
                    <RevealOnScroll key={idx} delay={0.1 * (idx + 1)}>
                      <div className="p-6 bg-[#0A0A0A]/5 border border-gray-10 rounded-2xl hover:bg-[#0A0A0A]/10 hover:border-gray-20 transition-all duration-500">
                        <div className="text-5xl mb-4">{service.icon}</div>
                        <p 
                          className="text-[#CCC] font-light leading-relaxed"
                          style={{ 
                            fontFamily: "var(--font-montserrat), sans-serif",
                            letterSpacing: "0.025em",
                          }}
                        >
                          {benefit}
                        </p>
                      </div>
                    </RevealOnScroll>
                  ))}
                </div>
              )}
            </div>
          </section>
        ))}

        {/* CTA Section */}
        <section className="py-32 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-gray-900">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <RevealOnScroll >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {locale === "vi" ? "Liên Hệ" : locale === "zh" ? "联系我们" : "Contact"}
              </h2>
              <p className="text-xl mb-12 text-emerald-100">
                {locale === "vi" ? "Bắt đầu dự án của bạn ngay hôm nay" : locale === "zh" ? "今天就开始您的项目" : "Start your project today"}
              </p>
              <a
                href={`/${locale}/contact`}
                className="inline-block px-12 py-4 bg-[#D4AF37] text-white font-semibold hover:bg-[#C19B2E] transition-all duration-300 shadow-xl"
              >
                {locale === "vi" ? "Liên hệ ngay" : locale === "zh" ? "立即联系" : "Get in touch"}
              </a>
            </RevealOnScroll>
          </div>
        </section>
      </main>
    </>
  );
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }
  return candidate;
}

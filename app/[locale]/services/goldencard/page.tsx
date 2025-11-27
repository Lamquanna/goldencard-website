import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/Container";
import { ContactForm } from "@/components/ContactForm";
import RevealOnScroll from "@/components/Cinematic/RevealOnScroll";
import Footer from "@/components/Cinematic/Footer";
import { isLocale, type Locale } from "@/lib/i18n";

interface GoldenCardPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: GoldenCardPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);
  
  return {
    title: 'GoldenCard - Enterprise Smart Card Solutions | RFID & NFC Technology',
    description: 'Premium smart card solutions powered by Golden Energy Group. 20+ years experience in RFID/NFC technology for hotels, resorts, enterprises. ISO certified, AES-256 encrypted, cloud-based management.',
    keywords: [
      'goldencard',
      'smart card solutions',
      'RFID technology',
      'NFC cards',
      'hotel key cards',
      'access control',
      'enterprise cards',
      'contactless payment',
      'golden energy',
      'vietnam smart cards',
    ],
    openGraph: {
      title: 'GoldenCard - Enterprise Smart Card Solutions',
      description: '20+ years | 20K+ partners | Advanced RFID/NFC technology',
      type: 'website',
    },
  };
}

export default async function GoldenCardPage({ params }: GoldenCardPageProps) {
  const { locale: localeParam } = await params;
  const locale = normalizeLocale(localeParam);

  return (
    <>
      {/* Hero with Logo */}
      <section className="min-h-screen bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />
        </div>

        <RevealOnScroll>
          <div className="relative z-10 text-center px-4">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <Image
                src="/logo-goldencard.png"
                alt="GoldenCard"
                width={400}
                height={120}
                priority
                className="opacity-90"
              />
            </div>
            
            <h1 
              className="text-2xl md:text-3xl font-light text-gray-900/70 mb-6 tracking-[0.2em] uppercase"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Enterprise Smart Card Solutions
            </h1>
            
            <p 
              className="text-base md:text-lg text-gray-900/50 tracking-[0.15em] font-light max-w-2xl mx-auto"
              style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
            >
              Advanced RFID & NFC Technology • ISO Certified • AES-256 Encrypted
            </p>
          </div>
        </RevealOnScroll>
      </section>

      {/* Brand Story */}
      <section className="py-32 bg-[#111111]">
        <Container>
          <RevealOnScroll>
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block mb-8 px-6 py-2 border border-gray-20 rounded-full">
                <span 
                  className="text-xs font-light text-gray-900/70 tracking-[0.15em] uppercase"
                  style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                >
                  Powered by Golden Energy Group
                </span>
              </div>
              
              <h2 
                className="text-2xl md:text-3xl font-light mb-8 text-gray-900/90 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                From Renewable Energy<br />To Smart Technology
              </h2>
              
              <p 
                className="text-base text-gray-900/60 mb-12 leading-relaxed font-light"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Building on Golden Energy&apos;s 15+ years of renewable energy expertise (500+ projects), 
                GoldenCard delivers enterprise-grade smart card solutions with military-level security, 
                seamless integration, and 99.9% uptime guarantee. Trusted by Fortune 500 companies 
                and leading hospitality brands across Southeast Asia.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                {[
                  { value: '20+', label: 'Years Excellence' },
                  { value: '20K+', label: 'Active Partners' },
                  { value: '99.9%', label: 'System Uptime' },
                  { value: 'ISO', label: 'Certified' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-6 border border-gray-10 rounded-lg hover:border-gray-20 transition-all duration-500">
                    <div 
                      className="text-3xl font-light text-gray-900/90 mb-2"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-xs text-gray-900/50 uppercase tracking-[0.15em] font-light"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {/* Solutions - No Icons */}
      <section className="py-32 bg-[#0A0A0A]">
        <Container>
          <RevealOnScroll>
            <div className="text-center mb-20">
              <h2 
                className="text-2xl md:text-3xl font-light mb-4 text-gray-900/90 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Enterprise Solutions
              </h2>
              <p 
                className="text-base text-gray-900/60 font-light"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Comprehensive smart card systems for modern businesses
              </p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-w-6xl mx-auto">
            {[
              {
                title: 'Hospitality Access',
                subtitle: 'Hotels • Resorts • Serviced Apartments',
                desc: 'RFID/NFC room access cards with PMS integration. Supports mobile key, keyless entry, and guest services.',
                features: [
                  'ISO 14443A/B compliant',
                  'Mifare Classic/DESFire',
                  'Opera, Protel, Fidelio ready',
                  'Battery-free operation'
                ]
              },
              {
                title: 'Access Control',
                subtitle: 'Offices • Facilities • Data Centers',
                desc: 'Multi-level security cards for enterprise premises. Time-zone restrictions, anti-passback, audit trails.',
                features: [
                  'HID Prox compatible',
                  'Wiegand 26/37 bit',
                  'Active Directory sync',
                  'Cloud-based management'
                ]
              },
              {
                title: 'Payment Systems',
                subtitle: 'Cashless • Contactless • Integrated',
                desc: 'EMV-compliant payment cards for closed-loop systems. Campus, resort, corporate cafeteria solutions.',
                features: [
                  'PCI DSS certified',
                  'EMV Level 1/2',
                  'Offline transactions',
                  'Real-time reconciliation'
                ]
              }
            ].map((solution, idx) => (
              <RevealOnScroll key={idx} delay={idx * 0.15}>
                <div className="p-12 border border-gray-10 hover:border-gray-20 transition-all duration-500 group">
                  <div className="mb-6">
                    <h3 
                      className="text-xl font-light mb-2 text-gray-900/90 tracking-wide"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {solution.title}
                    </h3>
                    <div 
                      className="text-xs text-gray-900/40 tracking-[0.1em] uppercase font-light"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {solution.subtitle}
                    </div>
                  </div>
                  
                  <p 
                    className="text-sm text-gray-900/60 mb-8 leading-relaxed font-light"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                  >
                    {solution.desc}
                  </p>
                  
                  <div className="space-y-3 border-t border-gray-10 pt-6">
                    {solution.features.map((feature, i) => (
                      <div 
                        key={i} 
                        className="text-xs text-gray-900/50 font-light flex items-center gap-3"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                      >
                        <span className="w-1 h-1 bg-[#0A0A0A]/40 rounded-full"></span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </Container>
      </section>

      {/* Technology Stack */}
      <section className="py-32 bg-[#111111]">
        <Container>
          <RevealOnScroll>
            <div className="text-center mb-20">
              <h2 
                className="text-2xl md:text-3xl font-light mb-4 text-gray-900/90 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Technology Stack
              </h2>
              <p 
                className="text-base text-gray-900/60 font-light"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Enterprise-grade security and performance
              </p>
            </div>
          </RevealOnScroll>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 max-w-6xl mx-auto">
            {[
              {
                category: 'Security',
                specs: ['AES-256 encryption', '3DES backup', 'SHA-256 hashing', 'TLS 1.3 transport']
              },
              {
                category: 'Protocols',
                specs: ['ISO 14443A/B', 'ISO 15693', 'NFC Forum Type 2/4', 'Mifare DESFire EV3']
              },
              {
                category: 'Integration',
                specs: ['RESTful APIs', 'SOAP/XML', 'WebSocket', 'MQTT pub/sub']
              },
              {
                category: 'Infrastructure',
                specs: ['AWS/Azure cloud', 'Redis caching', 'PostgreSQL HA', 'Docker/K8s']
              },
            ].map((tech, idx) => (
              <RevealOnScroll key={idx} delay={idx * 0.1}>
                <div className="p-8 border border-gray-10 hover:border-gray-20 transition-all duration-500">
                  <h4 
                    className="text-base font-light mb-6 text-gray-900/90 tracking-wide"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {tech.category}
                  </h4>
                  <div className="space-y-3">
                    {tech.specs.map((spec, i) => (
                      <div 
                        key={i} 
                        className="text-xs text-gray-900/50 font-light flex items-center gap-3"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                      >
                        <span className="w-1 h-1 bg-[#0A0A0A]/40 rounded-full"></span>
                        {spec}
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>

          {/* Performance Metrics */}
          <RevealOnScroll delay={0.4}>
            <div className="mt-16 max-w-4xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { metric: '<100ms', label: 'Response Time' },
                  { metric: '99.9%', label: 'Uptime SLA' },
                  { metric: '10K+', label: 'TPS Capacity' },
                  { metric: '24/7', label: 'Support' },
                ].map((perf, idx) => (
                  <div key={idx} className="text-center">
                    <div 
                      className="text-2xl font-light text-gray-900/90 mb-1"
                      style={{ fontFamily: "Playfair Display, serif" }}
                    >
                      {perf.metric}
                    </div>
                    <div 
                      className="text-xs text-gray-900/50 uppercase tracking-[0.15em] font-light"
                      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
                    >
                      {perf.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </section>

      {/* Contact Section */}
      <section className="py-32 bg-[#0A0A0A]">
        <Container>
          <RevealOnScroll>
            <div className="max-w-2xl mx-auto text-center mb-16">
              <h2 
                className="text-2xl md:text-3xl font-light mb-4 text-gray-900/90 tracking-wide"
                style={{ fontFamily: "Playfair Display, serif" }}
              >
                Request Enterprise Demo
              </h2>
              <p 
                className="text-sm text-gray-900/60 font-light"
                style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
              >
                Schedule a technical consultation with our solutions architects
              </p>
            </div>
          </RevealOnScroll>

          <div className="max-w-2xl mx-auto border border-gray-10 p-12">
            <ContactForm
              locale={locale}
              placeholders={{
                form_placeholder_name: "Full Name / Contact Person",
                form_placeholder_email: "Business Email",
                form_placeholder_phone: "Phone Number",
                form_placeholder_company: "Company / Organization",
                form_placeholder_message: "Project Requirements",
                button_submit_form: "Submit Request",
                form_success_message: "Thank you! Our team will contact you within 24 hours.",
                form_error_message: "Error occurred. Please try again or email us directly.",
              }}
            />
          </div>
        </Container>
      </section>

      <Footer 
        locale={locale}
        navItems={[
          { label: "Home", href: `/${locale}` },
          { label: "About", href: `/${locale}/about` },
          { label: "Services", href: `/${locale}/services` },
          { label: "Contact", href: `/${locale}/contact` },
        ]}
      />
    </>
  );
}

function normalizeLocale(candidate: string): Locale {
  if (!isLocale(candidate)) {
    notFound();
  }

  return candidate;
}

"use client";

import Link from "next/link";
import Image from "next/image";

interface NavItem {
  label: string;
  href: string;
}

interface FooterProps {
  navItems: NavItem[];
  locale: string;
}

/**
 * Footer - Monochrome Cinematic
 * 
 * Spec:
 * - Simple layout, breathing space
 * - Monochrome colors (#EEE, #CCC, #0A0A0A)
 * - Clean typography
 * - YouTube video background
 */
export default function Footer({ navItems, locale }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  const translations = {
    vi: {
      slogan: "Năng lượng sạch, cuộc sống xanh, tương lai vàng",
      navigation: "Điều hướng",
      contact: "Liên hệ"
    },
    en: {
      slogan: "Clean energy, green life, golden future",
      navigation: "Navigation",
      contact: "Contact"
    },
    zh: {
      slogan: "清洁能源，绿色生活，黄金未来",
      navigation: "导航",
      contact: "联系方式"
    }
  };
  
  const t = translations[locale as keyof typeof translations] || translations.vi;

  return (
    <footer className="relative bg-[#0A0A0A] border-t border-gray-20 py-20 md:py-28 overflow-hidden">
      {/* Green Leaves Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2400&auto=format&fit=crop"
          alt="Tropical leaves background"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.8) 100%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-24 max-w-[1200px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 mb-12">
          {/* Logo & Tagline */}
          <div>
            <Image
              src="/logo-goldenenergy.png"
              alt="Golden Energy"
              width={90}
              height={22.5}
              className="mb-6"
            />
            <p
              className="text-white text-base leading-relaxed text-center md:text-left font-semibold"
              style={{
                fontFamily: "Montserrat, sans-serif",
                letterSpacing: "0.025em",
              }}
            >
              {t.slogan}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="text-gray-200 text-sm uppercase tracking-[0.15em] font-semibold mb-6"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t.navigation}
            </h3>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-white hover:text-[#D4AF37] text-base font-semibold transition-colors duration-300"
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      letterSpacing: "0.025em",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-gray-200 text-sm uppercase tracking-[0.15em] font-semibold mb-6"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {t.contact}
            </h3>
            <ul className="space-y-3 text-base text-white font-semibold">
              <li style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.025em" }}>
                📧 sales@goldenenergy.vn
              </li>
              <li style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.025em" }}>
                📞 03333 142 88 / 0903 117 277
              </li>
              <li style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.025em", fontSize: "0.75rem" }}>
                🏢 625 Trần Xuân Soạn, Phường Tân Hưng, TP.HCM
              </li>
              <li style={{ fontFamily: "Montserrat, sans-serif", letterSpacing: "0.025em", fontSize: "0.7rem", opacity: 0.8 }}>
                {locale === 'vi' ? 'Giờ làm việc: 8:00 - 17:30 (T2-T7)' : locale === 'zh' ? '工作时间：8:00 - 17:30' : 'Hours: 8:00 AM - 5:30 PM (Mon-Sat)'}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-700">
          <p
            className="text-center text-white text-xs tracking-[0.05em] font-bold"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            © {currentYear} <span className="golden-text" style={{ fontSize: 'inherit', fontWeight: 700 }}>Golden</span> <span className="energy-text" style={{ fontSize: 'inherit', fontWeight: 700 }}>Energy</span> Vietnam. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

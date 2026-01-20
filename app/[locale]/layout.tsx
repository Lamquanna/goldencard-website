import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import ChatWidget from "@/components/ChatWidget";
import Footer from "@/components/Cinematic/Footer";
import LoadingScreen from "@/components/Cinematic/LoadingScreen";
import { LocaleLangSetter } from "@/components/locale-lang-setter";
import Navbar from "@/components/Cinematic/Navbar";
import PageTransition from "@/components/Cinematic/PageTransition";
import { getSitewide } from "@/lib/content";
import { defaultLocale, locales, type Locale } from "@/lib/i18n";
import { getPrimaryNavigation } from "@/lib/navigation";
import { montserrat, playfairDisplay } from "@/app/fonts";
import { generateOrganizationSchema } from "@/lib/schema";
import { getSiteSettings } from "@/sanity/lib/client";
import { SITE_CONFIG } from "@/lib/config/site";

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale })) as Array<{ locale: Locale }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const candidate = localeParam ?? defaultLocale;
  if (!locales.includes(candidate as Locale)) {
    notFound();
  }

  const locale = candidate as Locale;
  const sitewide = getSitewide(locale);
  const navItems = getPrimaryNavigation(locale);
  
  // ✅ FETCH FROM SANITY CMS
  const settings = await getSiteSettings();
  
  // Fallback to config defaults
  const siteData = {
    phone: settings?.hotline || SITE_CONFIG.phone,
    phoneSecondary: SITE_CONFIG.phoneSecondary,
    email: settings?.email || SITE_CONFIG.email,
    address: settings?.address || SITE_CONFIG.address.full,
    socialLinks: settings?.socialLinks || SITE_CONFIG.social,
  };
  
  // Generate Organization Schema for entire site
  const organizationSchema = generateOrganizationSchema({ locale: locale as any });

  return (
    <>
      {/* Global Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <LocaleLangSetter locale={locale} />
      <LoadingScreen />
      <PageTransition>
        <div 
          className={`flex min-h-screen flex-col bg-white text-gray-900 ${montserrat.variable} ${playfairDisplay.variable}`}
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          <Navbar locale={locale} navItems={navItems} />
          <main className="flex-1">{children}</main>
          <Footer locale={locale} navItems={navItems} siteData={siteData} />
        </div>
      </PageTransition>
      <ChatWidget locale={locale} />
    </>
  );
}

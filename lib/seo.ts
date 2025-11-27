import type { Metadata } from "next";

import { getSeoSection } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

type PageKey = "home" | "services" | "goldencard" | "contact" | "about";

const pageTitles = {
  vi: {
    home: "Golden Energy",
    services: "Golden Energy — Dịch vụ",
    goldencard: "GoldenCard",
    contact: "Golden Energy — Liên hệ",
    about: "Golden Energy — Về chúng tôi",
  },
  en: {
    home: "Golden Energy",
    services: "Golden Energy — Services",
    goldencard: "GoldenCard",
    contact: "Golden Energy — Contact",
    about: "Golden Energy — About",
  },
  zh: {
    home: "Golden Energy",
    services: "Golden Energy — 服务",
    goldencard: "GoldenCard",
    contact: "Golden Energy — 联系我们",
    about: "Golden Energy — 关于我们",
  },
  id: {
    home: "Golden Energy",
    services: "Golden Energy — Layanan",
    goldencard: "GoldenCard",
    contact: "Golden Energy — Kontak",
    about: "Golden Energy — Tentang Kami",
  },
} satisfies Record<Locale, Record<PageKey, string>>;

export function buildPageMetadata(locale: Locale, key: PageKey): Metadata {
  const seo = getSeoSection(locale, key);
  const langTitle = pageTitles[locale][key];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.goldenenergy.vn";
  const path = key === "home" ? `/${locale}` : `/${locale}/${slugFor(key)}`.replace(/\/$/, "");
  const url = new URL(path, baseUrl).toString();
  // FIXED: Updated OG image path to /og/ instead of /images/og/
  const ogImage = `${baseUrl}/og/${key}.png`;

  return {
    title: seo.title ?? langTitle,
    description: seo.meta_description,
    keywords: "Golden Energy, năng lượng mặt trời, solar energy, clean energy, GoldenCard, renewable energy, green energy",
    authors: [{ name: "Golden Energy" }],
    openGraph: {
      title: seo.title ?? langTitle,
      description: seo.og_description ?? seo.meta_description,
      type: "website",
      locale,
      url,
      siteName: "Golden Energy - Clean Energy, Green Life, Golden Future",
      images: [
        { 
          url: ogImage, 
          alt: seo.image_alt ?? langTitle,
          width: 1200,
          height: 630,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@goldenenergy",
      creator: "@goldenenergy",
      title: seo.title ?? langTitle,
      description: seo.og_description ?? seo.meta_description,
      images: [ogImage],
    },
    alternates: {
      languages: {
        vi: key === "home" ? "/vi" : `/vi/${slugFor(key)}`.replace(/\/$/, ""),
        en: key === "home" ? "/en" : `/en/${slugFor(key)}`.replace(/\/$/, ""),
        zh: key === "home" ? "/zh" : `/zh/${slugFor(key)}`.replace(/\/$/, ""),
      },
      canonical: url,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
  } satisfies Metadata;
}

function slugFor(key: PageKey) {
  switch (key) {
    case "services":
      return "services";
    case "goldencard":
      return "services/goldencard";
    case "contact":
      return "contact";
    case "about":
      return "about";
    default:
      return "";
  }
}

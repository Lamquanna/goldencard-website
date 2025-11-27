import marketingContent from "@/marketing-content.json";

import type { Locale } from "@/lib/i18n";

function withFallback<T>(viValue: T | undefined, enValue: T): T {
  return (viValue ?? enValue) as T;
}

export function getSitewide(locale: Locale) {
  const taglines: Record<Locale, string> = {
    vi: "Giải pháp điện mặt trời hàng đầu Việt Nam",
    en: "Leading Solar Energy Solutions in Vietnam",
    zh: "越南领先的太阳能解决方案",
    id: "Solusi Energi Surya Terkemuka di Vietnam",
  };
  
  return {
    company_name: "Golden Energy Vietnam",
    tagline: taglines[locale],
    trust_lines: []
  };
}

export function getHomeHero(locale: Locale) {
  const home = marketingContent.home;
  const viHero = home.vi?.hero;
  const enHero = home.en?.hero;
  const zhHero = home.zh?.hero;
  
  if (locale === "vi") {
    return withFallback(viHero, enHero);
  } else if (locale === "zh") {
    return withFallback(zhHero, enHero);
  }
  return enHero;
}

export function getHomeContent(locale: Locale) {
  const home = marketingContent.home;
  
  if (locale === "vi") {
    return home.vi;
  } else if (locale === "zh") {
    return home.zh;
  }
  // Indonesian falls back to English
  return home.en;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getHomeSections(locale: Locale): any {
  const home = marketingContent.home;
  const viSections = home.vi?.sections ?? {};
  const enSections = home.en?.sections ?? {};
  const zhSections = home.zh?.sections ?? {};

  if (locale === "en" || locale === "id") {
    return enSections;
  } else if (locale === "zh") {
    return zhSections;
  }

  return viSections;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getServices(locale: Locale): any {
  const services = marketingContent.services;
  const viServices = services?.vi ?? {};
  const enServices = services?.en ?? {};
  const zhServices = services?.zh ?? {};

  if (locale === "en" || locale === "id") {
    return enServices;
  } else if (locale === "zh") {
    return zhServices;
  }

  return viServices;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getGoldenCard(locale: Locale): any {
  const ge = marketingContent.goldenenergy;
  const vi = ge?.vi;
  const en = ge?.en;
  const zh = ge?.zh;
  
  if (locale === "vi") {
    return withFallback(vi, en);
  } else if (locale === "zh") {
    return withFallback(zh, en);
  }
  return en;
}

type BasicSeo = {
  title?: string;
  meta_description?: string;
  og_description?: string;
  image_alt?: string;
};

export function getSeoSection(locale: Locale, page: string): BasicSeo {
  const baseTitle = "Golden Energy";
  const descriptions: Record<Locale, string> = {
    vi: "Giải pháp thẻ thông minh, dịch vụ CNTT và năng lượng mặt trời cho doanh nghiệp Việt.",
    en: "Smart card manufacturing, IT services, and solar energy solutions for modern enterprises.",
    zh: "为现代企业提供智能卡制造、IT 服务和太阳能解决方案。",
    id: "Solusi kartu pintar, layanan TI, dan energi surya untuk perusahaan modern.",
  };
  const pageLabels: Record<string, Record<Locale, string>> = {
    home: { vi: "Golden Energy", en: "Golden Energy", zh: "Golden Energy", id: "Golden Energy" },
    services: { vi: "Golden Energy — Dịch vụ", en: "Golden Energy — Services", zh: "Golden Energy — 服务", id: "Golden Energy — Layanan" },
    goldencard: { vi: "GoldenCard", en: "GoldenCard", zh: "GoldenCard", id: "GoldenCard" },
    contact: { vi: "Golden Energy — Liên hệ", en: "Golden Energy — Contact", zh: "Golden Energy — 联系我们", id: "Golden Energy — Kontak" },
    about: { vi: "Golden Energy — Về chúng tôi", en: "Golden Energy — About", zh: "Golden Energy — 关于我们", id: "Golden Energy — Tentang Kami" },
  };

  const label = pageLabels[page]?.[locale] ?? baseTitle;

  return {
    title: label,
    meta_description: descriptions[locale],
    og_description: descriptions[locale],
    image_alt: label,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getContactSection(locale: Locale): any {
  const contact = marketingContent.contact;
  const vi = contact?.vi;
  const en = contact?.en;
  const zh = contact?.zh;
  
  if (locale === "vi") {
    return withFallback(vi, en);
  } else if (locale === "zh") {
    return withFallback(zh, en);
  }
  return en;
}

export function getAboutContent(locale: Locale) {
  const about = marketingContent.about;
  const vi = about?.vi;
  const en = about?.en;
  const zh = about?.zh;

  let hero, values, imageAlts;
  
  if (locale === "vi") {
    hero = vi?.hero ?? en?.hero;
    values = vi?.values ?? en?.values;
    imageAlts = vi?.image_alts ?? en?.image_alts;
  } else if (locale === "zh") {
    hero = zh?.hero ?? en?.hero;
    values = zh?.values ?? en?.values;
    imageAlts = zh?.image_alts ?? en?.image_alts;
  } else {
    hero = en?.hero ?? vi?.hero;
    values = en?.values ?? vi?.values;
    imageAlts = en?.image_alts ?? vi?.image_alts;
  }

  return { hero, values, imageAlts };
}

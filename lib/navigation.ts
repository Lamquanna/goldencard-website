import type { Locale } from "@/lib/i18n";

const navLabels: Record<Locale, Record<"home" | "about" | "solutions" | "projects" | "innovation" | "blog" | "contact", string>> = {
  vi: {
    home: "Trang chủ",
    about: "Giới thiệu",
    solutions: "Giải pháp",
    projects: "Dự án",
    innovation: "R&D Lab",
    blog: "Kiến thức",
    contact: "Liên hệ",
  },
  en: {
    home: "Home",
    about: "About",
    solutions: "Solutions",
    projects: "Projects",
    innovation: "Innovation",
    blog: "Knowledge",
    contact: "Contact",
  },
  zh: {
    home: "首页",
    about: "关于",
    solutions: "解决方案",
    projects: "项目",
    innovation: "研发实验室",
    blog: "知识",
    contact: "联系",
  },
  id: {
    home: "Beranda",
    about: "Tentang",
    solutions: "Solusi",
    projects: "Proyek",
    innovation: "R&D Lab",
    blog: "Pengetahuan",
    contact: "Kontak",
  },
};

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export function getPrimaryNavigation(locale: Locale): NavItem[] {
  const labels = navLabels[locale];

  return [
    { label: labels.home, href: `/${locale}` },
    { label: labels.about, href: `/${locale}/about` },
    { 
      label: labels.solutions, 
      href: `/${locale}/solutions/solar`,
      children: [
        { 
          label: locale === "vi" ? "Solar" : locale === "zh" ? "太阳能" : "Solar", 
          href: `/${locale}/solutions/solar` 
        },
        { 
          label: locale === "vi" ? "Wind" : locale === "zh" ? "风能" : "Wind", 
          href: `/${locale}/solutions/wind` 
        },
        { 
          label: locale === "vi" ? "IoT" : locale === "zh" ? "物联网" : "IoT", 
          href: `/${locale}/solutions/iot` 
        },
        { 
          label: locale === "vi" ? "Hybrid" : locale === "zh" ? "混合系统" : "Hybrid", 
          href: `/${locale}/solutions/hybrid` 
        },
      ]
    },
    { label: labels.projects, href: `/${locale}/projects` },
    { label: labels.innovation, href: `/${locale}/innovation` },
    { label: labels.blog, href: `/${locale}/blog` },
    { label: labels.contact, href: `/${locale}/contact` },
  ];
}

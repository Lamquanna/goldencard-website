import type { Locale } from "@/lib/i18n";

const navLabels: Record<Locale, Record<"home" | "about" | "solutions" | "products" | "projects" | "blog" | "warranty" | "contact", string>> = {
  vi: {
    home: "Trang chủ",
    about: "Giới thiệu",
    solutions: "Giải pháp",
    products: "Sản phẩm",
    projects: "Dự án",
    blog: "Tin tức",
    warranty: "Tra cứu BH",
    contact: "Liên hệ",
  },
  en: {
    home: "Home",
    about: "About",
    solutions: "Solutions",
    products: "Products",
    projects: "Projects",
    blog: "News",
    warranty: "Warranty",
    contact: "Contact",
  },
  zh: {
    home: "首页",
    about: "关于",
    solutions: "解决方案",
    products: "产品",
    projects: "项目",
    blog: "新闻",
    warranty: "保修查询",
    contact: "联系",
  },
  id: {
    home: "Beranda",
    about: "Tentang",
    solutions: "Solusi",
    products: "Produk",
    projects: "Proyek",
    blog: "Berita",
    warranty: "Garansi",
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
      href: `/${locale}/giai-phap/dien-mat-troi-ho-gia-dinh`,
      children: [
        { 
          label: locale === "vi" ? "Hộ gia đình" : locale === "zh" ? "家用" : "Residential", 
          href: `/${locale}/giai-phap/dien-mat-troi-ho-gia-dinh` 
        },
        { 
          label: locale === "vi" ? "Thương mại" : locale === "zh" ? "商用" : "Commercial", 
          href: `/${locale}/giai-phap/dien-mat-troi-thuong-mai` 
        },
        { 
          label: locale === "vi" ? "Công nghiệp" : locale === "zh" ? "工业" : "Industrial", 
          href: `/${locale}/giai-phap/dien-mat-troi-cong-nghiep` 
        },
      ]
    },
    { label: labels.products, href: `/${locale}/san-pham` },
    { label: labels.projects, href: `/${locale}/du-an` },
    { label: labels.blog, href: `/${locale}/bai-viet` },
    { label: labels.warranty, href: `/${locale}/tra-cuu-bao-hanh` },
    { label: labels.contact, href: `/${locale}/lien-he` },
  ];
}

/**
 * SITE CONFIGURATION - Single Source of Truth
 * Source: CompanyProfile.md (GoldenCard/GoldenEnergy)
 * CRITICAL: This is the centralized config for all domain references.
 * DO NOT hardcode domains elsewhere in the codebase.
 */

export const SITE_CONFIG = {
  // Production domain (NEVER change this manually)
  domain: 'goldenenergy.vn',
  url: 'https://goldenenergy.vn',
  
  // Branding
  name: 'Golden Energy Vietnam',
  nameShort: 'Golden Energy',
  nameVi: 'Golden Energy Việt Nam',
  alternateName: 'Năng Lượng Vàng',
  description: 'Giải pháp năng lượng mặt trời, điện gió hàng đầu Việt Nam. 500+ dự án, 50MW+ công suất lắp đặt.',
  
  // Parent Company Info
  parent: {
    name: 'Golden Card Solution Co., Ltd',
    nameVi: 'Công ty TNHH Giải pháp Thẻ Vàng',
    established: 2009,
    ceo: 'Jimmy Ha (Hà Hoàng Hà)',
    revenue3Years: 110_000_000_000, // 110 tỷ VND (2022-2024)
  },
  
  // Contact
  email: 'sales@goldenenergy.vn',
  emailCEO: 'jimmyha@goldencard.vn',
  phone: '0333 314 288',
  phoneSecondary: '0903 117 277',
  address: {
    street: 'A2206-A2207 Tháp A, Sunrise Riverside',
    district: 'Phường Phước Kiển, Huyện Nhà Bè',
    city: 'TP. Hồ Chí Minh',
    country: 'Việt Nam',
    full: 'A2206-A2207 Tháp A, Sunrise Riverside, Phường Phước Kiển, Nhà Bè, TP. Hồ Chí Minh',
    postalCode: '70000',
  },
  officeRepresentative: '625 Đường Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP.HCM',
  warehouse: '354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP.HCM',
  workHours: '8:00 - 17:30 (T2 - T7)',
  
  // Company Values
  slogan: {
    vi: 'Năng lượng sạch, cuộc sống xanh, tương lai vàng',
    en: 'Clean Energy, Green Life, Golden Future',
    zh: '清洁能源，绿色生活，黄金未来',
  },
  commitment: {
    vi: 'Cam kết chất lượng vàng',
    en: 'Commitment to Golden Quality',
  },
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/goldenenergyvn',
    linkedin: 'https://www.linkedin.com/in/golden-energy-solutions-48b2503a7/',
    youtube: 'https://youtube.com/@goldenenergyvn',
    zalo: 'https://zalo.me/0903117277',
  },
  
  // SEO
  defaultLocale: 'vi' as const,
  supportedLocales: ['vi', 'en', 'zh', 'id'] as const,
  
  // Analytics (from environment variables)
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
    gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  },
  
  // Verification codes (from environment)
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
  },
} as const;

// Type definitions
export type Locale = typeof SITE_CONFIG.supportedLocales[number];

/**
 * Get absolute URL for a path
 * @param path - Path (with or without leading slash)
 * @returns Full URL
 */
export function getAbsoluteUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

/**
 * Get localized URL
 * @param locale - Language code
 * @param path - Path (with or without leading slash)
 * @returns Full localized URL
 */
export function getLocalizedUrl(locale: string, path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}/${locale}${cleanPath}`;
}

/**
 * Get alternate language URLs for hreflang
 * @param path - Current path
 * @returns Object with locale keys and URLs
 */
export function getAlternateUrls(path: string = ''): Record<string, string> {
  const alternates: Record<string, string> = {};
  
  SITE_CONFIG.supportedLocales.forEach(locale => {
    alternates[locale] = getLocalizedUrl(locale, path);
  });
  
  return alternates;
}

/**
 * Validate if a locale is supported
 * @param locale - Locale code to check
 * @returns boolean
 */
export function isValidLocale(locale: string): locale is Locale {
  return SITE_CONFIG.supportedLocales.includes(locale as Locale);
}

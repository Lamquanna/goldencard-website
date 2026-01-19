/**
 * SITE CONFIGURATION - Single Source of Truth
 * 
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
  alternateName: 'Năng Lượng Vàng',
  description: 'Giải pháp năng lượng mặt trời, điện gió hàng đầu Việt Nam. 500+ dự án, 50MW+ công suất lắp đặt.',
  
  // Contact
  email: 'info@goldenenergy.vn',
  phone: '+84-28-1234-5678',
  address: {
    street: '123 Đường ABC',
    city: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    postalCode: '700000',
  },
  
  // Social Media
  social: {
    facebook: 'https://facebook.com/goldenenergyvn',
    linkedin: 'https://linkedin.com/company/goldenenergy-vietnam',
    youtube: 'https://youtube.com/@goldenenergyvn',
    twitter: 'https://twitter.com/goldenenergyvn',
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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ['vi', 'en', 'zh'] as const;
const defaultLocale = 'vi';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (pathnameHasLocale) {
    return NextResponse.next();
  }
  
  // Detect locale from multiple sources (priority order)
  const detectedLocale = 
    detectFromCookie(request) ||
    detectFromAcceptLanguage(request) ||
    detectFromGeo(request) ||
    defaultLocale;
  
  // Redirect to localized path
  const response = NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  );
  
  // Set locale cookie for future requests (1 year)
  response.cookies.set('NEXT_LOCALE', detectedLocale, {
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax'
  });
  
  return response;
}

/**
 * Detect locale from cookie (highest priority)
 */
function detectFromCookie(request: NextRequest): string | null {
  const cookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookie && locales.includes(cookie as any)) {
    return cookie;
  }
  return null;
}

/**
 * Detect locale from Accept-Language header
 */
function detectFromAcceptLanguage(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;
  
  try {
    // Parse "vi-VN,vi;q=0.9,en;q=0.8,zh;q=0.7"
    const languages = acceptLanguage
      .split(',')
      .map(lang => {
        const [locale, quality = 'q=1'] = lang.trim().split(';');
        const parsedLocale = locale.split('-')[0].toLowerCase(); // 'vi-VN' -> 'vi'
        const parsedQuality = parseFloat(quality.split('=')[1] || '1');
        return { locale: parsedLocale, quality: parsedQuality };
      })
      .sort((a, b) => b.quality - a.quality);
    
    // Find first matching locale
    const match = languages.find(l => locales.includes(l.locale as any));
    return match?.locale || null;
  } catch {
    return null;
  }
}

/**
 * Detect locale from geo location (Vercel Edge headers)
 */
function detectFromGeo(request: NextRequest): string | null {
  const country = request.headers.get('x-vercel-ip-country');
  
  const countryToLocale: Record<string, string> = {
    'VN': 'vi',
    'CN': 'zh',
    'TW': 'zh',
    'HK': 'zh',
    'SG': 'en',
    'US': 'en',
    'GB': 'en',
    'AU': 'en'
  };
  
  if (country && countryToLocale[country]) {
    return countryToLocale[country];
  }
  
  return null;
}

export const config = {
  matcher: [
    // Apply to all routes except API, static files, and images
    '/((?!api|_next|favicon.ico).*)',
  ],
};

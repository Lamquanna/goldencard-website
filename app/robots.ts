import { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/config/site';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/erp/',
          '/_next/',
          '/analytics/',
          '/auth/',
          '/chat/',
          '/*.json$',
          '/test/',
          '/private/'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/erp/', '/analytics/', '/auth/', '/chat/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/erp/', '/analytics/', '/auth/', '/chat/'],
      },
      {
        // Block aggressive scrapers
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'CCBot',
          'anthropic-ai',
          'Claude-Web'
        ],
        disallow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

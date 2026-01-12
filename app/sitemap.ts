import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.goldencardvietnam.com';
  const locales = ['vi', 'en', 'zh', 'id'];
  
  // Core pages (high priority)
  const corePages = [
    { url: '', changeFrequency: 'daily' as const, priority: 1.0 },
    { url: '/about', changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: '/contact', changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: '/projects', changeFrequency: 'weekly' as const, priority: 0.9 },
  ];
  
  // Service pages
  const servicePages = [
    '/services/solar',
    '/services/wind',
    '/services/iot',
    '/services/maintenance',
  ].map(url => ({
    url,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Solution pages
  const solutionPages = [
    '/solutions/residential',
    '/solutions/commercial',
    '/solutions/industrial',
    '/solutions/agriculture',
  ].map(url => ({
    url,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  
  // Blog/News pages
  const contentPages = [
    { url: '/blog', changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: '/news', changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: '/case-studies', changeFrequency: 'monthly' as const, priority: 0.7 },
  ];
  
  // Combine all pages
  const allPages = [...corePages, ...servicePages, ...solutionPages, ...contentPages];
  
  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  allPages.forEach(page => {
    locales.forEach(locale => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page.url}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: Object.fromEntries(
            locales.map(l => [l, `${baseUrl}/${l}${page.url}`])
          ),
        },
      });
    });
  });
  
  return sitemapEntries;
}

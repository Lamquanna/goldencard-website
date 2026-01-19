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
    { url: '/faq', changeFrequency: 'monthly' as const, priority: 0.8 },
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
  
  // Blog Hub
  const contentPages = [
    { url: '/bai-viet', changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: '/blog', changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: '/news', changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: '/case-studies', changeFrequency: 'monthly' as const, priority: 0.7 },
  ];
  
  // Blog Articles from Phase 3 (10 articles)
  const blogArticles = [
    'huong-dan-chon-tam-pin',
    'chinh-sach-moi-2026',
    'nguyen-ly-hoat-dong-solar',
    'so-sanh-inverter',
    'case-study-khach-san',
    'bao-tri-dinh-ky',
    'tai-chinh-solar',
    'pin-luu-tru-battery',
    'loi-ich-moi-truong',
    'xu-huong-2026'
  ].map(slug => ({
    url: `/bai-viet/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }));
  
  // Projects Hub
  const projectsHub = [
    { url: '/du-an', changeFrequency: 'weekly' as const, priority: 0.9 }
  ];
  
  // Project Case Studies from Phase 3 (12 projects)
  const projectSlugs = [
    'khach-san-abc-tphcm',
    'nha-may-det-may-binh-duong',
    'biet-thu-anh-minh-da-nang',
    'nha-chi-hoa-q7',
    'van-phong-xyz-binh-duong',
    'nha-hang-def-da-nang',
    'sieu-thi-ghi-ha-noi',
    'nha-anh-tung-ha-noi',
    'can-ho-chi-mai-binh-duong',
    'xuong-co-khi-dong-nai',
    'nha-may-thuc-pham-long-an',
    'kho-logistics-tphcm'
  ].map(slug => ({
    url: `/du-an/${slug}`,
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }));
  
  // Combine all pages
  const allPages = [
    ...corePages, 
    ...servicePages, 
    ...solutionPages, 
    ...contentPages,
    ...projectsHub
  ];
  
  // Combine all dynamic pages
  const allDynamicPages = [
    ...blogArticles,
    ...projectSlugs
  ];
  
  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Static pages with alternates
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
  
  // Dynamic pages (blog articles & project case studies)
  allDynamicPages.forEach(page => {
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

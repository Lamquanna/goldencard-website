'use client';

import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  path: string;
}

export function BreadcrumbSchema() {
  const pathname = usePathname();
  
  // Build breadcrumb items from path
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', path: '/' }
    ];
    
    let currentPath = '';
    paths.forEach((segment, index) => {
      // Skip locale segment
      if (index === 0 && ['vi', 'en', 'zh', 'id'].includes(segment)) {
        return;
      }
      
      currentPath += `/${segment}`;
      
      // Convert segment to readable name
      const name = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        name,
        path: currentPath
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Skip if only home
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://goldenenergy.vn${item.path}`
    }))
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
}

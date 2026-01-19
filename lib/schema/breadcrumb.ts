/**
 * Breadcrumb Schema Generator
 * Generates Schema.org BreadcrumbList for navigation hierarchy
 * @see https://schema.org/BreadcrumbList
 */

export interface BreadcrumbSegment {
  name: string
  url: string
}

const segmentTranslations: Record<string, Record<string, string>> = {
  'giai-phap': {
    vi: 'Giải pháp',
    en: 'Solutions',
    zh: '解决方案'
  },
  'san-pham': {
    vi: 'Sản phẩm',
    en: 'Products',
    zh: '产品'
  },
  'du-an': {
    vi: 'Dự án',
    en: 'Projects',
    zh: '项目'
  },
  'bai-viet': {
    vi: 'Bài viết',
    en: 'Blog',
    zh: '博客'
  },
  'lien-he': {
    vi: 'Liên hệ',
    en: 'Contact',
    zh: '联系我们'
  },
  'dien-mat-troi-ho-gia-dinh': {
    vi: 'Điện mặt trời hộ gia đình',
    en: 'Residential Solar',
    zh: '住宅太阳能'
  },
  'dien-mat-troi-thuong-mai': {
    vi: 'Điện mặt trời thương mại',
    en: 'Commercial Solar',
    zh: '商业太阳能'
  },
  'dien-mat-troi-cong-nghiep': {
    vi: 'Điện mặt trời công nghiệp',
    en: 'Industrial Solar',
    zh: '工业太阳能'
  }
}

export function generateBreadcrumbSchema(
  path: string, 
  locale: 'vi' | 'en' | 'zh'
) {
  const baseUrl = 'https://goldenenergy.vn'
  
  // Remove leading/trailing slashes and locale prefix
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(new RegExp(`^(${locale})/`), '')
  
  const segments = cleanPath.split('/').filter(Boolean)
  
  const homeNames = {
    vi: 'Trang chủ',
    en: 'Home',
    zh: '首页'
  }
  
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeNames[locale],
      item: `${baseUrl}/${locale}`
    }
  ]
  
  segments.forEach((segment, index) => {
    const position = index + 2
    const url = `${baseUrl}/${locale}/${segments.slice(0, index + 1).join('/')}`
    
    // Get translated name or fallback to segment
    const name = segmentTranslations[segment]?.[locale] || 
                 formatSegmentName(segment)
    
    itemListElement.push({
      '@type': 'ListItem',
      position,
      name,
      item: url
    })
  })
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement
  }
}

/**
 * Format segment name for display (fallback)
 */
function formatSegmentName(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Generate breadcrumb segments for rendering
 */
export function getBreadcrumbSegments(
  path: string, 
  locale: 'vi' | 'en' | 'zh'
): BreadcrumbSegment[] {
  const baseUrl = 'https://goldenenergy.vn'
  
  const cleanPath = path
    .replace(/^\/+|\/+$/g, '')
    .replace(new RegExp(`^(${locale})/`), '')
  
  const segments = cleanPath.split('/').filter(Boolean)
  
  const homeNames = {
    vi: 'Trang chủ',
    en: 'Home',
    zh: '首页'
  }
  
  const breadcrumbs: BreadcrumbSegment[] = [
    {
      name: homeNames[locale],
      url: `${baseUrl}/${locale}`
    }
  ]
  
  segments.forEach((segment, index) => {
    const url = `${baseUrl}/${locale}/${segments.slice(0, index + 1).join('/')}`
    const name = segmentTranslations[segment]?.[locale] || formatSegmentName(segment)
    
    breadcrumbs.push({ name, url })
  })
  
  return breadcrumbs
}


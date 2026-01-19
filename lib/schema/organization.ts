/**
 * Organization Schema Generator
 * Generates Schema.org Organization structured data for SEO
 * @see https://schema.org/Organization
 */

export interface OrganizationSchemaOptions {
  locale: 'vi' | 'en' | 'zh'
}

export function generateOrganizationSchema(options: OrganizationSchemaOptions) {
  const { locale } = options
  const baseUrl = 'https://goldenenergy.vn'
  
  const names = {
    vi: 'Golden Energy Vietnam',
    en: 'Golden Energy Vietnam',
    zh: '金能源越南'
  }
  
  const alternateName = {
    vi: 'Năng Lượng Vàng',
    en: 'Golden Energy',
    zh: '金能源'
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${baseUrl}/#organization`,
    name: names[locale],
    alternateName: alternateName[locale],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 250,
      height: 60
    },
    
    // Contact information
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+84-123-456-789',
        contactType: 'sales',
        areaServed: 'VN',
        availableLanguage: ['vi', 'en', 'zh'],
        contactOption: 'TollFree'
      },
      {
        '@type': 'ContactPoint',
        telephone: '+84-987-654-321',
        contactType: 'customer service',
        areaServed: 'VN',
        availableLanguage: ['vi', 'en']
      }
    ],
    
    // Office address
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Đường ABC, Phường XYZ',
      addressLocality: 'Quận 1',
      addressRegion: 'TP. Hồ Chí Minh',
      postalCode: '700000',
      addressCountry: 'VN'
    },
    
    // Geographic coverage
    areaServed: {
      '@type': 'Country',
      name: 'Vietnam',
      sameAs: 'https://en.wikipedia.org/wiki/Vietnam'
    },
    
    // Social profiles
    sameAs: [
      'https://www.facebook.com/goldenenergy',
      'https://www.linkedin.com/company/goldenenergy',
      'https://www.youtube.com/c/goldenenergy',
      'https://twitter.com/goldenenergyvn'
    ],
    
    // Business information
    foundingDate: '2015-01-01',
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 50
    },
    
    // Industry & expertise
    knowsAbout: [
      'Solar Energy',
      'Renewable Energy',
      'Photovoltaic Systems',
      'Energy Storage',
      'EPC Services',
      'Solar Panel Installation',
      'Energy Consulting'
    ],
    
    // Products & services
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: locale === 'vi' ? 'Lắp đặt điện mặt trời' : locale === 'zh' ? '太阳能安装' : 'Solar Installation',
          serviceType: 'Solar Panel Installation'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: locale === 'vi' ? 'Tư vấn năng lượng' : locale === 'zh' ? '能源咨询' : 'Energy Consulting',
          serviceType: 'Energy Consulting'
        }
      }
    ],
    
    // Certifications & awards
    award: [
      'ISO 9001:2015 Certified',
      'Top 10 Solar EPC Vietnam 2025',
      'Green Energy Excellence Award 2024'
    ],
    
    // Additional metadata
    slogan: locale === 'vi' 
      ? 'Năng lượng xanh - Tương lai bền vững' 
      : locale === 'zh' 
      ? '绿色能源 - 可持续未来'
      : 'Green Energy - Sustainable Future'
  }
}


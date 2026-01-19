/**
 * Product Schema Generator
 * Generates Schema.org Product structured data for solar solutions
 * @see https://schema.org/Product
 */

export interface ProductSchemaInput {
  name: string
  description: string
  category: 'residential' | 'commercial' | 'industrial'
  powerOutput: string // "5kW", "50kW", "500kW"
  price?: number
  locale: 'vi' | 'en' | 'zh'
  imageUrl?: string
  sku?: string
}

export function generateProductSchema(input: ProductSchemaInput) {
  const baseUrl = 'https://goldenenergy.vn'
  
  const categoryNames = {
    residential: {
      vi: 'Hệ thống điện mặt trời hộ gia đình',
      en: 'Residential Solar System',
      zh: '住宅太阳能系统'
    },
    commercial: {
      vi: 'Hệ thống điện mặt trời thương mại',
      en: 'Commercial Solar System',
      zh: '商业太阳能系统'
    },
    industrial: {
      vi: 'Hệ thống điện mặt trời công nghiệp',
      en: 'Industrial Solar System',
      zh: '工业太阳能系统'
    }
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${baseUrl}/giai-phap/${input.category}/#product`,
    
    name: input.name,
    description: input.description,
    category: categoryNames[input.category][input.locale],
    sku: input.sku || `SOLAR-${input.category.toUpperCase()}-${input.powerOutput}`,
    
    image: input.imageUrl || `${baseUrl}/images/products/${input.category}.jpg`,
    
    brand: {
      '@type': 'Brand',
      '@id': `${baseUrl}/#organization`,
      name: 'Golden Energy'
    },
    
    manufacturer: {
      '@id': `${baseUrl}/#organization`
    },
    
    offers: {
      '@type': 'Offer',
      priceCurrency: 'VND',
      price: input.price,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      seller: {
        '@id': `${baseUrl}/#organization`
      },
      itemCondition: 'https://schema.org/NewCondition',
      warranty: {
        '@type': 'WarrantyPromise',
        durationOfWarranty: {
          '@type': 'QuantitativeValue',
          value: 25,
          unitCode: 'ANN'
        },
        warrantyScope: input.locale === 'vi' 
          ? 'Bảo hành sản phẩm và hiệu suất' 
          : input.locale === 'zh'
          ? '产品和性能保修'
          : 'Product and Performance Warranty'
      }
    },
    
    // Technical specifications
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: input.locale === 'vi' ? 'Công suất' : input.locale === 'zh' ? '功率' : 'Power Output',
        value: input.powerOutput
      },
      {
        '@type': 'PropertyValue',
        name: input.locale === 'vi' ? 'Hiệu suất' : input.locale === 'zh' ? '效率' : 'Efficiency',
        value: '> 20%',
        unitText: 'PERCENT'
      },
      {
        '@type': 'PropertyValue',
        name: input.locale === 'vi' ? 'Bảo hành' : input.locale === 'zh' ? '保修' : 'Warranty',
        value: '25',
        unitText: input.locale === 'vi' ? 'năm' : input.locale === 'zh' ? '年' : 'years'
      },
      {
        '@type': 'PropertyValue',
        name: input.locale === 'vi' ? 'Xuất xứ' : input.locale === 'zh' ? '原产地' : 'Origin',
        value: 'Vietnam'
      }
    ],
    
    // Aggregate rating (to be populated from actual reviews)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127',
      bestRating: '5',
      worstRating: '1'
    },
    
    // Related entities
    isRelatedTo: [
      {
        '@type': 'Service',
        '@id': `${baseUrl}/dich-vu/lap-dat/#service`,
        name: input.locale === 'vi' 
          ? 'Dịch vụ lắp đặt' 
          : input.locale === 'zh'
          ? '安装服务'
          : 'Installation Service',
        provider: {
          '@id': `${baseUrl}/#organization`
        }
      },
      {
        '@type': 'Service',
        '@id': `${baseUrl}/dich-vu/bao-tri/#service`,
        name: input.locale === 'vi' 
          ? 'Bảo trì & Bảo dưỡng' 
          : input.locale === 'zh'
          ? '维护保养'
          : 'Maintenance Service',
        provider: {
          '@id': `${baseUrl}/#organization`
        }
      }
    ]
  }
}

/**
 * Generate AggregateOffer schema for product variants
 */
export function generateAggregateOfferSchema(
  products: ProductSchemaInput[],
  locale: 'vi' | 'en' | 'zh'
) {
  const prices = products.map(p => p.price).filter(Boolean) as number[]
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    priceCurrency: 'VND',
    lowPrice: minPrice,
    highPrice: maxPrice,
    offerCount: products.length,
    offers: products.map(p => generateProductSchema(p).offers)
  }
}


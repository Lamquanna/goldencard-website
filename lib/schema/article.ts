/**
 * Article Schema Generator
 * Generates Schema.org Article/BlogPosting structured data
 * @see https://schema.org/Article
 */

export interface ArticleSchemaInput {
  title: string
  description: string
  content: string
  author: {
    name: string
    url?: string
  }
  publishedDate: string // ISO 8601 format
  modifiedDate?: string
  category: string
  tags: string[]
  imageUrl: string
  locale: 'vi' | 'en' | 'zh'
  url: string
}

export function generateArticleSchema(input: ArticleSchemaInput) {
  const baseUrl = 'https://goldenenergy.vn'
  
  // Extract entities from content (keywords that map to our knowledge graph)
  const entities = extractEntities(input.content)
  
  // Calculate reading time
  const wordCount = input.content.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / 200) // 200 words per minute
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${baseUrl}${input.url}#article`,
    
    headline: input.title,
    description: input.description,
    
    image: {
      '@type': 'ImageObject',
      url: input.imageUrl,
      width: 1200,
      height: 630
    },
    
    author: {
      '@type': 'Person',
      name: input.author.name,
      url: input.author.url || `${baseUrl}/about#team`
    },
    
    publisher: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Golden Energy Vietnam',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 250,
        height: 60
      }
    },
    
    datePublished: input.publishedDate,
    dateModified: input.modifiedDate || input.publishedDate,
    
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}${input.url}`
    },
    
    articleSection: input.category,
    keywords: input.tags.join(', '),
    
    wordCount,
    timeRequired: `PT${readingTime}M`,
    
    inLanguage: input.locale === 'vi' ? 'vi-VN' : input.locale === 'zh' ? 'zh-CN' : 'en',
    
    // Entity mentions (links to knowledge graph)
    mentions: entities.map(entity => ({
      '@type': 'Thing',
      name: entity.name,
      sameAs: entity.sameAs
    })),
    
    // Related content
    isPartOf: {
      '@type': 'Blog',
      '@id': `${baseUrl}/bai-viet/#blog`,
      name: input.locale === 'vi' ? 'Blog Golden Energy' : 'Golden Energy Blog'
    }
  }
}

/**
 * Generate FAQ Schema for Q&A articles
 */
export function generateFAQSchema(
  questions: Array<{ question: string; answer: string }>,
  locale: 'vi' | 'en' | 'zh'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map(qa => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer
      }
    }))
  }
}

/**
 * Generate HowTo Schema for tutorial articles
 */
export function generateHowToSchema(
  input: {
    name: string
    description: string
    steps: Array<{ name: string; text: string; image?: string }>
    totalTime?: string // ISO 8601 duration e.g. "PT2H"
    locale: 'vi' | 'en' | 'zh'
  }
) {
  const baseUrl = 'https://goldenenergy.vn'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: input.name,
    description: input.description,
    totalTime: input.totalTime,
    
    step: input.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image
    })),
    
    tool: {
      '@type': 'HowToTool',
      name: input.locale === 'vi' 
        ? 'Công cụ tính toán Golden Energy' 
        : 'Golden Energy Calculator'
    }
  }
}

/**
 * Extract entities from article content
 */
interface Entity {
  name: string
  sameAs?: string
}

function extractEntities(content: string): Entity[] {
  const entityMap: Record<string, Entity> = {
    'solar panel': {
      name: 'Solar Panel',
      sameAs: 'https://en.wikipedia.org/wiki/Solar_panel'
    },
    'tấm pin': {
      name: 'Tấm pin mặt trời',
      sameAs: 'https://vi.wikipedia.org/wiki/Pin_mặt_trời'
    },
    'inverter': {
      name: 'Solar Inverter',
      sameAs: 'https://en.wikipedia.org/wiki/Solar_inverter'
    },
    'biến tần': {
      name: 'Biến tần',
      sameAs: 'https://vi.wikipedia.org/wiki/Biến_tần'
    },
    'battery storage': {
      name: 'Battery Energy Storage',
      sameAs: 'https://en.wikipedia.org/wiki/Battery_storage_power_station'
    },
    'lưu trữ năng lượng': {
      name: 'Pin lưu trữ năng lượng',
      sameAs: 'https://vi.wikipedia.org/wiki/Lưu_trữ_năng_lượng'
    },
    'net metering': {
      name: 'Net Metering',
      sameAs: 'https://en.wikipedia.org/wiki/Net_metering'
    },
    'golden energy': {
      name: 'Golden Energy Vietnam',
      sameAs: 'https://goldenenergy.vn/#organization'
    },
    'roi': {
      name: 'Return on Investment',
      sameAs: 'https://en.wikipedia.org/wiki/Return_on_investment'
    },
    'lcoe': {
      name: 'Levelized Cost of Energy',
      sameAs: 'https://en.wikipedia.org/wiki/Levelized_cost_of_energy'
    }
  }
  
  const contentLower = content.toLowerCase()
  const foundEntities: Entity[] = []
  
  Object.entries(entityMap).forEach(([keyword, entity]) => {
    if (contentLower.includes(keyword.toLowerCase())) {
      // Avoid duplicates
      if (!foundEntities.some(e => e.name === entity.name)) {
        foundEntities.push(entity)
      }
    }
  })
  
  return foundEntities
}


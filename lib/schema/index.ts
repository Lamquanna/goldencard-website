/**
 * Schema.org JSON-LD Generator - Central Export
 * Provides unified interface for all schema generators
 */

export { generateOrganizationSchema } from './organization'
export type { OrganizationSchemaOptions } from './organization'

export { generateProductSchema, generateAggregateOfferSchema } from './product'
export type { ProductSchemaInput } from './product'

export { generateBreadcrumbSchema, getBreadcrumbSegments } from './breadcrumb'
export type { BreadcrumbSegment } from './breadcrumb'

export { 
  generateArticleSchema, 
  generateFAQSchema, 
  generateHowToSchema 
} from './article'
export type { ArticleSchemaInput } from './article'

/**
 * Utility: Combine multiple schemas into one JSON-LD graph
 */
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas
  }
}

/**
 * Utility: Render JSON-LD script tag for Next.js
 */
export function renderJsonLd(schema: object) {
  return {
    __html: JSON.stringify(schema, null, 0)
  };
}

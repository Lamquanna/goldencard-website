import { groq } from 'next-sanity'

// ============================================================================
// GROQ QUERIES for Golden Energy CMS
// ============================================================================

/**
 * Get all products by locale with full details
 */
export const productsQuery = groq`
  *[_type == "product" && locale == $locale] | order(name asc) {
    _id,
    _createdAt,
    _updatedAt,
    name,
    slug,
    locale,
    category,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    price,
    currency,
    power,
    efficiency,
    warranty,
    shortDescription,
    fullDescription,
    features,
    specifications,
    certifications,
    stock,
    featured,
    discount
  }
`

/**
 * Get single product by slug and locale
 */
export const productBySlugQuery = groq`
  *[_type == "product" && slug.current == $slug && locale == $locale][0] {
    _id,
    _createdAt,
    _updatedAt,
    name,
    slug,
    locale,
    category,
    "imageUrl": image.asset->url,
    "imageAlt": image.alt,
    price,
    currency,
    power,
    efficiency,
    warranty,
    shortDescription,
    fullDescription,
    features,
    specifications,
    certifications,
    stock,
    featured,
    discount,
    "relatedProducts": *[_type == "product" && locale == $locale && category == ^.category && _id != ^._id][0...4] {
      _id,
      name,
      slug,
      "imageUrl": image.asset->url,
      price,
      currency
    }
  }
`

/**
 * Get products by category
 */
export const productsByCategoryQuery = groq`
  *[_type == "product" && category == $category && locale == $locale] | order(name asc) {
    _id,
    name,
    slug,
    locale,
    category,
    "imageUrl": image.asset->url,
    price,
    currency,
    power,
    shortDescription,
    featured
  }
`

/**
 * Get featured products (for homepage)
 */
export const featuredProductsQuery = groq`
  *[_type == "product" && featured == true && locale == $locale] | order(_createdAt desc)[0...6] {
    _id,
    name,
    slug,
    locale,
    category,
    "imageUrl": image.asset->url,
    price,
    currency,
    power,
    shortDescription
  }
`

/**
 * Get all projects by locale
 */
export const projectsQuery = groq`
  *[_type == "project" && locale == $locale] | order(completionDate desc) {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    locale,
    systemType,
    capacity,
    location,
    client,
    completionDate,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    shortDescription,
    featured,
    roi,
    annualSavings
  }
`

/**
 * Get single project by slug and locale
 */
export const projectBySlugQuery = groq`
  *[_type == "project" && slug.current == $slug && locale == $locale][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    locale,
    systemType,
    capacity,
    location,
    client,
    completionDate,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    "galleryImages": gallery[].asset->url,
    shortDescription,
    fullDescription,
    challenges,
    solution,
    results,
    featured,
    roi,
    annualSavings,
    investmentCost,
    testimonial
  }
`

/**
 * Get featured projects (for homepage)
 */
export const featuredProjectsQuery = groq`
  *[_type == "project" && featured == true && locale == $locale] | order(completionDate desc)[0...3] {
    _id,
    title,
    slug,
    locale,
    systemType,
    capacity,
    location,
    "imageUrl": mainImage.asset->url,
    shortDescription,
    roi
  }
`

/**
 * Get site settings (global config)
 */
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    _id,
    siteName,
    siteDescription,
    contactEmail,
    contactPhone,
    address,
    socialLinks,
    analytics
  }
`

/**
 * Get product categories (for filter)
 */
export const productCategoriesQuery = groq`
  *[_type == "product" && locale == $locale] {
    "category": category
  } | order(category asc)
`

/**
 * Get project types (for filter)
 */
export const projectTypesQuery = groq`
  *[_type == "project" && locale == $locale] {
    "systemType": systemType
  } | order(systemType asc)
`

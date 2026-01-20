import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn } from '../env'
import {
  siteSettingsQuery,
  productsQuery,
  productBySlugQuery,
  projectsQuery,
  featuredProjectsQuery,
  projectBySlugQuery,
} from './queries'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
  token: process.env.SANITY_API_TOKEN, // For server-side operations
})

// ============================================
// SITE SETTINGS
// ============================================

export interface SiteSettings {
  _id: string
  title: string
  description?: string
  hotline: string
  phone2?: string
  email: string
  address: string
  logoUrl?: string
  socialLinks?: {
    facebook?: string
    linkedin?: string
    youtube?: string
    zalo?: string
  }
  banner?: {
    title?: string
    subtitle?: string
    imageUrl?: string
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const data = await client.fetch(siteSettingsQuery, {}, { cache: 'no-store' })
    return data
  } catch (error) {
    console.error('Failed to fetch site settings:', error)
    return null
  }
}

// ============================================
// PROJECTS
// ============================================

export interface Project {
  _id: string
  title: string
  slug: string | { current: string }
  projectType?: string
  locale?: string
  systemType: 'residential' | 'commercial' | 'industrial'
  capacity: number
  location: string | {
    address?: string
    city?: string
    region?: string
  }
  client?: string
  investment?: number
  savings?: number
  paybackPeriod?: number
  completionDate: string
  featured: boolean
  imageUrl?: string // From mainImage.asset->url
  mainImageAlt?: string
  shortDescription?: string
  fullDescription?: any[]
  challenges?: string
  solution?: string
  results?: string[]
  roi?: number
  annualSavings?: number
  investmentCost?: number
  testimonial?: {
    quote?: string
    author?: string
    position?: string
    rating?: number
  }
  galleryImages?: string[] // Array of URLs from gallery
}

export async function getProjects(
  locale: string = 'vi',
  limit: number = 100
): Promise<Project[]> {
  try {
    console.log('🔍 Fetching projects for locale:', locale)
    const data = await client.fetch(
      `*[_type == "project" && locale == $locale] | order(completionDate desc) [0...${limit}] {
        _id,
        title,
        slug,
        locale,
        systemType,
        capacity,
        location,
        client,
        completionDate,
        investment,
        savings,
        paybackPeriod,
        shortDescription,
        fullDescription,
        challenges,
        solution,
        results,
        testimonial,
        "imageUrl": mainImage.asset->url,
        "imageAlt": mainImage.alt,
        "galleryImages": gallery[].asset->url,
        featured,
        roi,
        annualSavings,
        investmentCost
      }`,
      { locale },
      { next: { revalidate: 60 } }
    )
    console.log('✅ Fetched projects count:', data?.length || 0)
    if (data && data.length > 0) {
      console.log('📦 Sample project:', data[0]?.title)
    }
    return data || []
  } catch (error) {
    console.error('❌ Failed to fetch projects:', error)
    return []
  }
}

export async function getFeaturedProjects(locale: string = 'vi'): Promise<Project[]> {
  try {
    const data = await client.fetch(featuredProjectsQuery, { locale }, { next: { revalidate: 60 } })
    return data || []
  } catch (error) {
    console.error('Failed to fetch featured projects:', error)
    return []
  }
}

export async function getProjectBySlug(
  slug: string,
  locale: string = 'vi'
): Promise<Project | null> {
  try {
    const data = await client.fetch(projectBySlugQuery, { slug, locale }, { next: { revalidate: 60 } })
    return data
  } catch (error) {
    console.error('Failed to fetch project by slug:', error)
    return null
  }
}

export async function getProjectsByType(
  systemType: string,
  locale: string = 'vi'
): Promise<Project[]> {
  try {
    const data = await client.fetch(
      `*[_type == "project" && systemType == $systemType && locale == $locale] | order(completionDate desc)`,
      { systemType, locale },
      { next: { revalidate: 60 } }
    )
    return data || []
  } catch (error) {
    console.error('Failed to fetch projects by type:', error)
    return []
  }
}

export async function getProjectStats(locale: string = 'vi') {
  try {
    const data = await client.fetch(
      `{
        "total": count(*[_type == "project" && locale == $locale]),
        "residential": count(*[_type == "project" && locale == $locale && systemType == "residential"]),
        "commercial": count(*[_type == "project" && locale == $locale && systemType == "commercial"]),
        "industrial": count(*[_type == "project" && locale == $locale && systemType == "industrial"]),
        "totalCapacity": sum(*[_type == "project" && locale == $locale].capacity),
        "featured": count(*[_type == "project" && locale == $locale && featured == true])
      }`,
      { locale },
      { next: { revalidate: 60 } }
    )
    return data
  } catch (error) {
    console.error('Failed to fetch project stats:', error)
    return {
      total: 0,
      residential: 0,
      commercial: 0,
      industrial: 0,
      totalCapacity: 0,
      featured: 0,
    }
  }
}

export async function getProduct(slug: string, locale: string = 'vi') {
  try {
    const data = await client.fetch(
      productBySlugQuery,
      { slug, locale },
      { next: { revalidate: 60 } }
    )
    return data
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

export async function getProductsByCategory(
  category: string,
  locale: string = 'vi'
) {
  try {
    const data = await client.fetch(
      `*[_type == "product" && category == $category && locale == $locale] | order(name asc)`,
      { category, locale },
      { next: { revalidate: 60 } }
    )
    return data || []
  } catch (error) {
    console.error('Failed to fetch products by category:', error)
    return []
  }
}

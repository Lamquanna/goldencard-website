import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
  apiVersion,
  dataset,
  projectId,
  useCdn,
})

export async function getSiteSettings() {
  return client.fetch(`*[_type == "siteSettings"][0]`)
}

export async function getProducts(locale: string = 'vi') {
  return client.fetch(
    `*[_type == "product" && locale == $locale] | order(name asc)`,
    { locale }
  )
}

export async function getProduct(slug: string, locale: string = 'vi') {
  return client.fetch(
    `*[_type == "product" && slug.current == $slug && locale == $locale][0]`,
    { slug, locale }
  )
}

export async function getProjects(locale: string = 'vi', featured?: boolean) {
  const filter = featured
    ? `*[_type == "project" && locale == $locale && featured == true]`
    : `*[_type == "project" && locale == $locale]`
  
  return client.fetch(`${filter} | order(completionDate desc)`, { locale })
}

export async function getProject(slug: string, locale: string = 'vi') {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug && locale == $locale][0]`,
    { slug, locale }
  )
}

export async function getProductsByCategory(
  category: string,
  locale: string = 'vi'
) {
  return client.fetch(
    `*[_type == "product" && category == $category && locale == $locale] | order(name asc)`,
    { category, locale }
  )
}

export async function getProjectsByType(
  systemType: string,
  locale: string = 'vi'
) {
  return client.fetch(
    `*[_type == "project" && systemType == $systemType && locale == $locale] | order(completionDate desc)`,
    { systemType, locale }
  )
}

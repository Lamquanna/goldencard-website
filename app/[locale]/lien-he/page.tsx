// Alias for Vietnamese "Liên hệ" route
// This page redirects to the main contact page
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LienHePage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const search = await searchParams
  
  // Preserve query parameters
  const queryString = new URLSearchParams(
    Object.entries(search).reduce((acc, [key, value]) => {
      if (value) acc[key] = Array.isArray(value) ? value[0] : value
      return acc
    }, {} as Record<string, string>)
  ).toString()
  
  const redirectUrl = queryString 
    ? `/${locale}/contact?${queryString}`
    : `/${locale}/contact`
    
  redirect(redirectUrl)
}

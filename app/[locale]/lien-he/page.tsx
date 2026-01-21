// Alias for Vietnamese "Liên hệ" route
// This page redirects to the main contact page
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function LienHePage({ params }: PageProps) {
  const { locale } = await params
  redirect(`/${locale}/contact`)
}

import { NextResponse } from 'next/server'
import { getProjects } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🧪 Testing Sanity connection...')
    
    const projects = await getProjects('vi', 10)
    
    return NextResponse.json({
      success: true,
      count: projects.length,
      projects: projects.map(p => ({
        _id: p._id,
        title: p.title,
        slug: typeof p.slug === 'string' ? p.slug : p.slug?.current,
        locale: p.locale,
        systemType: p.systemType,
        capacity: p.capacity,
        imageUrl: p.imageUrl,
      }))
    })
  } catch (error: any) {
    console.error('❌ Test API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

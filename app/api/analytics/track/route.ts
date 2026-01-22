/**
 * API Endpoint: Track Page Views & Section Engagement
 * POST /api/analytics/track
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  trackPageView, 
  trackSectionEngagement,
  type PageView,
  type SectionEngagement 
} from '@/lib/analytics/behavioral-tracking';

export const dynamic = 'force-dynamic';

// Helper: Parse IP address (with proxy support)
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.headers.get('x-vercel-forwarded-for') || 'unknown';
}

// Helper: Get geo location from Vercel headers
function getGeoLocation(request: NextRequest) {
  return {
    country: request.headers.get('x-vercel-ip-country') || null,
    city: request.headers.get('x-vercel-ip-city') || null,
  };
}

// Helper: Detect device type
function getDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    // Get client info
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = getClientIP(request);
    const { country, city } = getGeoLocation(request);
    const deviceType = getDeviceType(userAgent);
    
    if (type === 'page_view') {
      const pageViewData: Omit<PageView, 'timestamp'> = {
        session_id: data.session_id,
        page_url: data.page_url,
        page_title: data.page_title || '',
        referrer: data.referrer || request.headers.get('referer') || null,
        user_agent: userAgent,
        ip_address: ipAddress,
        country,
        city,
        device_type: deviceType,
      };
      
      await trackPageView(pageViewData);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Page view tracked',
        debug: { country, city, device: deviceType } 
      });
    }
    
    if (type === 'section_engagement') {
      const engagementData: Omit<SectionEngagement, 'timestamp'> = {
        session_id: data.session_id,
        page_url: data.page_url,
        section_id: data.section_id,
        section_name: data.section_name,
        dwell_time_seconds: data.dwell_time_seconds || 0,
        scroll_depth_percentage: data.scroll_depth_percentage || 0,
      };
      
      await trackSectionEngagement(engagementData);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Section engagement tracked' 
      });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid tracking type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics tracking error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/analytics/track - Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Analytics tracking endpoint' });
}

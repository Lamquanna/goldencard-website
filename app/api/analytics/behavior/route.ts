/**
 * Behavioral Analytics API Endpoint
 * Receives and stores user behavior events
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { events, score } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid events format' },
        { status: 400 }
      );
    }

    // Get basic session info (no PII)
    const sessionId = request.headers.get('x-session-id') || generateSessionId();
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const country = request.headers.get('x-vercel-ip-country') || 'unknown';

    // Aggregate metrics
    const metrics = {
      sessionId,
      timestamp: Date.now(),
      country,
      userAgent: parseUserAgent(userAgent),
      score: score || 0,
      events: events.length,
      
      // Event type counts
      pageViews: events.filter(e => e.type === 'page_view').length,
      ctaClicks: events.filter(e => e.type === 'cta_click').length,
      calculatorUsage: events.some(e => e.type === 'calculator_start'),
      
      // Engagement metrics
      maxDwellTime: Math.max(
        ...events
          .filter(e => e.type === 'dwell_time')
          .map(e => e.metadata?.seconds || 0)
      ),
      maxScrollDepth: Math.max(
        ...events
          .filter(e => e.type === 'scroll_depth')
          .map(e => e.metadata?.percentage || 0)
      ),
    };

    // TODO: Store in database or analytics service
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Behavioral Analytics:', metrics);
    }

    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production' && process.env.ANALYTICS_API_KEY) {
      await sendToAnalyticsService(metrics);
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('Behavioral analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Generate session ID from IP and timestamp
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${timestamp}-${random}`;
}

/**
 * Parse user agent to basic device info
 */
function parseUserAgent(ua: string): {
  device: string;
  browser: string;
  os: string;
} {
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const isTablet = /iPad|Android.*Tablet/i.test(ua);
  
  let device = 'desktop';
  if (isMobile && !isTablet) device = 'mobile';
  if (isTablet) device = 'tablet';

  let browser = 'unknown';
  if (ua.includes('Chrome')) browser = 'chrome';
  else if (ua.includes('Safari')) browser = 'safari';
  else if (ua.includes('Firefox')) browser = 'firefox';
  else if (ua.includes('Edge')) browser = 'edge';

  let os = 'unknown';
  if (ua.includes('Windows')) os = 'windows';
  else if (ua.includes('Mac')) os = 'macos';
  else if (ua.includes('Linux')) os = 'linux';
  else if (ua.includes('Android')) os = 'android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'ios';

  return { device, browser, os };
}

/**
 * Send metrics to external analytics service
 */
async function sendToAnalyticsService(metrics: any) {
  // TODO: Implement integration with analytics service
  // Example: Google Analytics 4, Mixpanel, Segment, etc.
  
  // For now, just log
  console.log('Would send to analytics:', metrics);
}

import { NextRequest, NextResponse } from 'next/server';

// POST /api/analytics/track - Track analytics events
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Log the tracking event (in production, this would go to a database)
    console.log('[Analytics] Track Event:', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false, error: 'Failed to track event' }, { status: 500 });
  }
}

// GET /api/analytics/track - Health check
export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Analytics tracking endpoint' });
}

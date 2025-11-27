import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { events } = await request.json();
    
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Invalid events data' }, { status: 400 });
    }

    // Process events in batches
    const results = await Promise.allSettled(
      events.map(event => processEvent(event))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: events.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Batch analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics batch' },
      { status: 500 }
    );
  }
}

async function processEvent(event: any) {
  const { type, data, timestamp } = event;

  try {
    switch (type) {
      case 'pageView':
        await trackPageView(data);
        break;
      case 'interaction':
        await trackInteraction(data);
        break;
      case 'trafficSource':
        await trackTrafficSource(data);
        break;
      case 'location':
        await trackLocation(data);
        break;
      default:
        console.warn(`Unknown event type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to process ${type} event:`, error);
    throw error;
  }
}

async function trackPageView(data: any) {
  // In production, this would insert into database
  // For now, log to console (will be replaced with actual DB insert)
  console.log('[Analytics] Page View:', {
    session: data.sessionId,
    page: data.pagePath,
    device: data.deviceType,
    viewport: `${data.viewportWidth}x${data.viewportHeight}`,
  });

  // Auto-create lead for key pages (contact, solutions, services)
  const keyPages = ['/contact', '/solutions/', '/services/', '/projects/'];
  const isKeyPage = keyPages.some(page => data.pagePath.includes(page));
  
  if (isKeyPage) {
    console.log('🎯 Key page visited, creating lead...');
    await createLeadFromVisit(data);
  }

  // TODO: Insert into database
  // await sql`
  //   INSERT INTO page_views (
  //     session_id, page_path, page_title, timestamp,
  //     device_type, browser, viewport_width, viewport_height
  //   ) VALUES (
  //     ${data.sessionId}, ${data.pagePath}, ${data.pageTitle}, ${data.timestamp},
  //     ${data.deviceType}, ${data.browser}, ${data.viewportWidth}, ${data.viewportHeight}
  //   )
  // `;
}

async function createLeadFromVisit(data: any) {
  try {
    // Check if lead already exists for this session
    const existingCheck = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/leads?search=${data.sessionId}`, {
      method: 'GET',
    });
    
    if (existingCheck.ok) {
      const existing = await existingCheck.json();
      if (existing.leads && existing.leads.length > 0) {
        console.log('⚠️ Lead already exists for session:', data.sessionId);
        return;
      }
    }

    // Create new lead
    const leadData = {
      name: `Khách ghé trang ${data.pagePath}`,
      source: 'website_visitor',
      source_url: data.pagePath,
      device_type: data.deviceType,
      browser: data.browser,
      locale: data.pagePath.split('/')[1] || 'vi',
      message: `Khách ghé trang ${data.pageTitle || data.pagePath} - Session: ${data.sessionId}`,
      tags: ['auto-created', 'page-visitor'],
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Auto-created lead:', result.lead?.id);
    }
  } catch (error) {
    console.error('❌ Failed to auto-create lead:', error);
  }
}

async function trackInteraction(data: any) {
  console.log('[Analytics] Interaction:', {
    type: data.eventType,
    element: data.elementSelector,
    page: data.pagePath,
  });

  // TODO: Insert into database
}

async function trackTrafficSource(data: any) {
  console.log('[Analytics] Traffic Source:', {
    session: data.sessionId,
    type: data.sourceType,
    source: data.sourceName,
    landing: data.landingPage,
  });

  // TODO: Insert into database
}

async function trackLocation(data: any) {
  console.log('[Analytics] Location:', {
    session: data.sessionId,
    country: data.countryName,
    city: data.city,
    isp: data.isp,
  });

  // TODO: Insert into database
}

// Fallback single event tracking
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Analytics batch endpoint - Use POST to send events',
    endpoints: {
      batch: '/api/analytics/batch',
      location: '/api/analytics/location',
      track: '/api/analytics/track',
    },
  });
}

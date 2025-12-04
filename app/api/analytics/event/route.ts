/**
 * Event Tracking API
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventType,
      eventCategory,
      eventAction,
      eventLabel,
      eventValue,
      pageUrl,
      pagePath,
      data
    } = body;
    
    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }
    
    const sessionId = request.cookies.get('visitor_session')?.value || 'session-id';
    
    const event = {
      id: 'event-id',
      sessionId,
      eventType,
      eventCategory: eventCategory || null,
      eventAction: eventAction || null,
      eventLabel: eventLabel || null,
      eventValue: eventValue || null,
      pageUrl: pageUrl || null,
      pagePath: pagePath || null,
      data: data || {},
      createdAt: new Date()
    };
    
    // TODO: Save to database
    // await createVisitorEvent(event);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

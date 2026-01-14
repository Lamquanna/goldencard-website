import { NextResponse } from 'next/server';

/**
 * Health Check API Endpoint
 * GET /api/health
 */
export async function GET() {
  try {
    // Basic health check - always return healthy for now
    // TODO: Add database check when ready
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: true,
        database: true, // Placeholder
      },
      uptime: process.uptime() * 1000, // Convert to ms
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString() 
      },
      { status: 503 }
    );
  }
}

/**
 * Quick health check (HEAD request)
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}

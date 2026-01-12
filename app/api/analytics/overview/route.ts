import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/overview
 * 
 * Get overview metrics (page views, unique visitors, avg duration, bounce rate)
 * with comparison to previous period
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    // Calculate date ranges
    const days = parseInt(range.replace('d', ''));
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    const prevStartDateStr = prevStartDate.toISOString();

    // Current period stats
    const currentResult = await sql`
      SELECT 
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(duration_seconds) as avg_duration,
        AVG(CASE WHEN bounce THEN 1 ELSE 0 END) as bounce_rate
      FROM analytics_page_views
      WHERE viewed_at >= ${startDateStr} AND viewed_at < ${endDateStr}
    ` as any[];

    // Previous period stats
    const previousResult = await sql`
      SELECT 
        COUNT(*) as page_views,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(duration_seconds) as avg_duration,
        AVG(CASE WHEN bounce THEN 1 ELSE 0 END) as bounce_rate
      FROM analytics_page_views
      WHERE viewed_at >= ${prevStartDateStr} AND viewed_at < ${startDateStr}
    ` as any[];

    const current = currentResult[0] || {};
    const previous = previousResult[0] || {};

    // Calculate changes
    function calculateChange(curr: number, prev: number): number {
      if (prev === 0) return 0;
      return ((curr - prev) / prev) * 100;
    }

    const response = {
      pageViews: parseInt(current.page_views) || 0,
      uniqueVisitors: parseInt(current.unique_visitors) || 0,
      avgDuration: formatDuration(parseFloat(current.avg_duration) || 0),
      bounceRate: `${((parseFloat(current.bounce_rate) || 0) * 100).toFixed(1)}%`,
      change: {
        pageViews: calculateChange(
          parseInt(current.page_views) || 0,
          parseInt(previous.page_views) || 0
        ),
        uniqueVisitors: calculateChange(
          parseInt(current.unique_visitors) || 0,
          parseInt(previous.unique_visitors) || 0
        ),
        avgDuration: calculateChange(
          parseFloat(current.avg_duration) || 0,
          parseFloat(previous.avg_duration) || 0
        ),
        bounceRate: calculateChange(
          parseFloat(current.bounce_rate) || 0,
          parseFloat(previous.bounce_rate) || 0
        )
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch overview data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${minutes}m ${secs}s`;
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/pages
 * 
 * Get page performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    const days = parseInt(range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await sql.query(`
      SELECT 
        page_path,
        page_title,
        COUNT(*) as views,
        COUNT(DISTINCT session_id) as unique_visitors,
        AVG(duration_seconds) as avg_duration,
        AVG(CASE WHEN bounce THEN 1 ELSE 0 END) as bounce_rate
      FROM analytics_page_views
      WHERE viewed_at >= $1
      GROUP BY page_path, page_title
      ORDER BY views DESC
      LIMIT 50
    `, [startDate.toISOString()]);

    return NextResponse.json({
      data: result.rows.map(row => ({
        page_path: row.page_path,
        page_title: row.page_title,
        views: parseInt(row.views),
        unique_visitors: parseInt(row.unique_visitors),
        avg_duration: parseFloat(row.avg_duration) || 0,
        bounce_rate: parseFloat(row.bounce_rate) || 0
      }))
    });

  } catch (error) {
    console.error('Pages API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page data' },
      { status: 500 }
    );
  }
}

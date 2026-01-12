import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/sources
 * 
 * Get traffic source distribution
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';

    const days = parseInt(range.replace('d', ''));
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const result = await sql`
      SELECT 
        COALESCE(utm_source, 'direct') as source,
        COUNT(DISTINCT id) as visitors
      FROM analytics_sessions
      WHERE started_at >= ${startDateStr}
      GROUP BY utm_source
      ORDER BY visitors DESC
      LIMIT 10
    `;

    const total = result.reduce((sum: number, row: any) => sum + parseInt(row.visitors), 0);

    return NextResponse.json({
      data: result.map((row: any) => ({
        source: row.source || 'direct',
        visitors: parseInt(row.visitors),
        percentage: total > 0 ? (parseInt(row.visitors) / total) * 100 : 0
      }))
    });

  } catch (error) {
    console.error('Sources API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch source data' },
      { status: 500 }
    );
  }
}

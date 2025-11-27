import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/analytics/geographic
 * 
 * Get geographic distribution of visitors
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
        country_code as country,
        city,
        COUNT(DISTINCT id) as visitors
      FROM analytics_sessions
      WHERE started_at >= $1
      GROUP BY country_code, city
      ORDER BY visitors DESC
      LIMIT 20
    `, [startDate.toISOString()]);

    const total = result.rows.reduce((sum, row) => sum + parseInt(row.visitors), 0);

    return NextResponse.json({
      data: result.rows.map(row => ({
        country: row.country || 'Unknown',
        city: row.city || '',
        visitors: parseInt(row.visitors),
        percentage: total > 0 ? (parseInt(row.visitors) / total) * 100 : 0
      }))
    });

  } catch (error) {
    console.error('Geographic API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geographic data' },
      { status: 500 }
    );
  }
}

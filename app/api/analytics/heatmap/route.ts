import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

/**
 * GET /api/analytics/heatmap
 * 
 * Fetch aggregated heatmap data for a specific page
 * 
 * Query params:
 * - page_path: string (required) - Page path to get heatmap for
 * - device_type: 'mobile' | 'tablet' | 'desktop' | 'all' (optional)
 * - start_date: ISO date string (optional)
 * - end_date: ISO date string (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pagePath = searchParams.get('page_path');
    const deviceType = searchParams.get('device_type') || 'all';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!pagePath) {
      return NextResponse.json(
        { error: 'page_path parameter is required' },
        { status: 400 }
      );
    }

    // Build query conditions
    const conditions = ['page_path = $1'];
    const params: any[] = [pagePath];
    let paramIndex = 2;

    if (deviceType !== 'all') {
      conditions.push(`device_type = $${paramIndex}`);
      params.push(deviceType);
      paramIndex++;
    }

    if (startDate) {
      conditions.push(`date_bucket >= $${paramIndex}`);
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      conditions.push(`date_bucket <= $${paramIndex}`);
      params.push(endDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Query aggregated heatmap data
    const result = await sql.query(`
      SELECT 
        grid_x,
        grid_y,
        SUM(click_count) as total_clicks,
        SUM(hover_count) as total_hovers,
        SUM(scroll_count) as total_scrolls
      FROM analytics_heatmap_data
      WHERE ${whereClause}
      GROUP BY grid_x, grid_y
      HAVING SUM(click_count) > 0
      ORDER BY total_clicks DESC
      LIMIT 10000
    `, params);

    // Transform to HeatmapPoint format
    const points: HeatmapPoint[] = result.rows.map(row => ({
      x: row.grid_x,
      y: row.grid_y,
      intensity: row.total_clicks + (row.total_hovers * 0.3) + (row.total_scrolls * 0.1)
    }));

    return NextResponse.json({
      page_path: pagePath,
      device_type: deviceType,
      points,
      total_points: points.length,
      date_range: {
        start: startDate || null,
        end: endDate || null
      }
    });

  } catch (error) {
    console.error('Heatmap API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch heatmap data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

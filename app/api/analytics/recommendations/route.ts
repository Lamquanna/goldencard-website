/**
 * API Endpoint: Get Content Recommendations
 * GET /api/analytics/recommendations?page=/vi/giai-phap/dien-mat-troi-ho-gia-dinh
 */

import { NextRequest, NextResponse } from 'next/server';
import { getContentRecommendations } from '@/lib/analytics/behavioral-tracking';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentPage = searchParams.get('page');
    const limit = parseInt(searchParams.get('limit') || '5');
    
    if (!currentPage) {
      return NextResponse.json(
        { success: false, message: 'Missing page parameter' },
        { status: 400 }
      );
    }
    
    const recommendations = await getContentRecommendations(currentPage, limit);
    
    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

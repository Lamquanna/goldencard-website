// API route: Get CRM stats
// GET /api/crm/stats

import { NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { mockSupabase } from '@/lib/supabase/mock';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    logger.debug('GET /api/crm/stats - Using mock data', { requestId });

    // Get stats from view
    const { data: stats, error: statsError } = await supabase
      .from('lead_stats')
      .select('*')
      .single();

    if (statsError) {
      logger.error('Error fetching stats:', { error: statsError, requestId });
      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'GET',
        url: '/api/crm/stats',
        statusCode: 500,
        duration,
        requestId,
        error: statsError,
      });
      return createErrorResponse(
        'Failed to fetch stats',
        ErrorCodes.INTERNAL_ERROR,
        500,
        undefined,
        requestId
      );
    }

    // Get source breakdown
    const { data: sourceStats } = await supabase
      .from('leads')
      .select('source')
      .is('deleted_at', null);

    const sourceBreakdown = (sourceStats || []).reduce((acc: Record<string, number>, item: { source: string }) => {
      const source = item.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const responseData = {
      ...stats,
      source_breakdown: sourceBreakdown,
    };

    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: '/api/crm/stats',
      statusCode: 200,
      duration,
      requestId,
    });

    return createSuccessResponse(responseData, requestId);
  } catch (error: any) {
    logger.error('API error:', { error, requestId });
    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'GET',
      url: '/api/crm/stats',
      statusCode: 500,
      duration,
      requestId,
      error: error instanceof Error ? error : undefined,
    });
    return createErrorResponse(
      'Internal server error',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

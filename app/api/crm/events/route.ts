// API route: Create lead events
// POST /api/crm/events

import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { CreateLeadEventInput } from '@/lib/types/crm';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    const body = await request.json() as CreateLeadEventInput;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.apiRequest({
        method: 'POST',
        url: '/api/crm/events',
        statusCode: 401,
        duration: Date.now() - startTime,
        requestId,
      });
      return createErrorResponse(
        'Unauthorized',
        ErrorCodes.UNAUTHORIZED,
        401,
        undefined,
        requestId
      );
    }

    // Check role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'sales'].includes(userData.role)) {
      logger.apiRequest({
        method: 'POST',
        url: '/api/crm/events',
        statusCode: 403,
        duration: Date.now() - startTime,
        requestId,
      });
      return createErrorResponse(
        'Forbidden',
        ErrorCodes.FORBIDDEN,
        403,
        undefined,
        requestId
      );
    }

    // Validate
    if (!body.lead_id || !body.event_type || !body.description) {
      logger.apiRequest({
        method: 'POST',
        url: '/api/crm/events',
        statusCode: 400,
        duration: Date.now() - startTime,
        requestId,
      });
      return createErrorResponse(
        'lead_id, event_type, and description are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('lead_events')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select(`
        *,
        user:user_id(id, full_name, email, avatar_url)
      `)
      .single();

    if (eventError) {
      logger.error('Error creating event', { error: eventError, requestId });
      logger.apiRequest({
        method: 'POST',
        url: '/api/crm/events',
        statusCode: 500,
        duration: Date.now() - startTime,
        requestId,
      });
      return createErrorResponse(
        'Failed to create event',
        ErrorCodes.DATABASE_ERROR,
        500,
        undefined,
        requestId
      );
    }

    logger.apiRequest({
      method: 'POST',
      url: '/api/crm/events',
      statusCode: 201,
      duration: Date.now() - startTime,
      requestId,
    });
    return createSuccessResponse({ event }, requestId);
  } catch (error) {
    logger.error('API error', { error, requestId });
    logger.apiRequest({
      method: 'POST',
      url: '/api/crm/events',
      statusCode: 500,
      duration: Date.now() - startTime,
      requestId,
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


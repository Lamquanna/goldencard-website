// API route: Chat messages
// GET /api/crm/messages?lead_id=xxx - Get messages for a lead
// POST /api/crm/messages - Send a new message

import { NextRequest, NextResponse } from 'next/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { CreateChatMessageInput } from '@/lib/types/crm';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const supabase = mockSupabase as unknown as any;
    const searchParams = request.nextUrl.searchParams;
    const lead_id = searchParams.get('lead_id');

    if (!lead_id) {
      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'GET', url: '/api/crm/messages', statusCode: 400, duration, requestId });
      return createErrorResponse(
        'lead_id is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    logger.debug('💬 GET /api/crm/messages - lead_id:', { lead_id, requestId });

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: true });

    if (error) {
      logger.error('Error fetching messages:', { error, requestId });
      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'GET', url: '/api/crm/messages', statusCode: 500, duration, requestId });
      return createErrorResponse(
        'Failed to fetch messages',
        ErrorCodes.DATABASE_ERROR,
        500,
        undefined,
        requestId
      );
    }

    logger.debug('✅ Found messages:', { count: messages?.length || 0, requestId });

    const duration = Date.now() - startTime;
    logger.apiRequest({ method: 'GET', url: '/api/crm/messages', statusCode: 200, duration, requestId });
    return createSuccessResponse({ messages: messages || [] }, requestId);
  } catch (error) {
    logger.error('API error:', { error, requestId });
    const duration = Date.now() - startTime;
    logger.apiRequest({ method: 'GET', url: '/api/crm/messages', statusCode: 500, duration, requestId });
    return createErrorResponse(
      'Internal server error',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const supabase = mockSupabase as unknown as any;
    const body = await request.json() as CreateChatMessageInput;

    // Validate required fields
    if (!body.lead_id || !body.message || !body.sender_type || !body.sender_name) {
      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'POST', url: '/api/crm/messages', statusCode: 400, duration, requestId });
      return createErrorResponse(
        'lead_id, message, sender_type, and sender_name are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    logger.debug('💬 POST /api/crm/messages - Sending message from:', { sender: body.sender_name, requestId });

    // Create message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert(body)
      .select()
      .single();

    if (error) {
      logger.error('Error creating message:', { error, requestId });
      const duration = Date.now() - startTime;
      logger.apiRequest({ method: 'POST', url: '/api/crm/messages', statusCode: 500, duration, requestId });
      return createErrorResponse(
        'Failed to send message',
        ErrorCodes.DATABASE_ERROR,
        500,
        undefined,
        requestId
      );
    }

    // Update lead's last_activity
    await supabase
      .from('leads')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', body.lead_id);

    logger.debug('✅ Message sent successfully', { requestId });

    const duration = Date.now() - startTime;
    logger.apiRequest({ method: 'POST', url: '/api/crm/messages', statusCode: 201, duration, requestId });
    return createSuccessResponse({ success: true, message }, requestId);
  } catch (error) {
    logger.error('API error:', { error, requestId });
    const duration = Date.now() - startTime;
    logger.apiRequest({ method: 'POST', url: '/api/crm/messages', statusCode: 500, duration, requestId });
    return createErrorResponse(
      'Internal server error',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

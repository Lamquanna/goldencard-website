/**
 * Coze AI Assistant API Integration
 * Endpoint để giao tiếp với Coze bot cho nội bộ công ty
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCozeClient } from '@/lib/coze-client';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

// POST - Send message to Coze AI Assistant
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { message, userId, botId, conversationId } = body;

    // Validation
    if (!message || !userId) {
      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'POST',
        url: '/api/coze/chat',
        statusCode: 400,
        duration,
        requestId,
      });
      return createErrorResponse(
        'Message and userId are required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    logger.debug('Coze API request', {
      userId,
      messageLength: message.length,
      botId: botId || process.env.COZE_BOT_ID,
      hasConversationId: !!conversationId,
    });

    // Get Coze client
    const coze = getCozeClient();

    // Send message to Coze
    const apiStartTime = Date.now();
    const response = await coze.chat({
      botId,
      userId,
      message,
      conversationId,
      stream: false,
    });
    const apiDuration = Date.now() - apiStartTime;

    logger.externalApi({
      service: 'Coze',
      endpoint: '/chat',
      method: 'POST',
      statusCode: 200,
      duration: apiDuration,
    });

    const duration = Date.now() - startTime;
    logger.apiRequest({
      method: 'POST',
      url: '/api/coze/chat',
      statusCode: 200,
      duration,
      requestId,
      userId,
    });

    return createSuccessResponse(
      {
        conversationId: response.conversation_id,
        message: response.message.content,
        role: response.message.role,
        contentType: response.message.content_type,
      },
      requestId
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Coze API error', error, {
      userId: (await request.json().catch(() => ({})))?.userId,
      requestId,
    });

    logger.apiRequest({
      method: 'POST',
      url: '/api/coze/chat',
      statusCode: 500,
      duration,
      requestId,
      error,
    });

    return createErrorResponse(
      error.message || 'Failed to communicate with AI assistant',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

// GET - Get bot info or list bots
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const botId = searchParams.get('botId');

    if (!action) {
      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'GET',
        url: '/api/coze/chat',
        statusCode: 400,
        duration,
        requestId,
      });
      return createErrorResponse(
        'Action parameter is required',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    const coze = getCozeClient();

    if (action === 'list') {
      // List all available bots
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      
      const bots = await coze.listBots({
        page_index: page,
        page_size: pageSize,
      });

      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'GET',
        url: '/api/coze/chat?action=list',
        statusCode: 200,
        duration,
        requestId,
      });

      return createSuccessResponse(bots, requestId);
    } else if (action === 'info' && botId) {
      // Get specific bot info
      const botInfo = await coze.getBotInfo(botId);

      const duration = Date.now() - startTime;
      logger.apiRequest({
        method: 'GET',
        url: '/api/coze/chat?action=info',
        statusCode: 200,
        duration,
        requestId,
      });

      return createSuccessResponse(botInfo, requestId);
    } else {
      return createErrorResponse(
        'Invalid action or missing botId',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;

    logger.error('Coze API error', error, { requestId });

    logger.apiRequest({
      method: 'GET',
      url: '/api/coze/chat',
      statusCode: 500,
      duration,
      requestId,
      error,
    });

    return createErrorResponse(
      error.message || 'Failed to fetch bot information',
      ErrorCodes.INTERNAL_ERROR,
      500,
      undefined,
      requestId
    );
  }
}

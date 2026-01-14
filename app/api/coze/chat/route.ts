/**
 * Coze AI Assistant API Integration
 * Endpoint để giao tiếp với Coze bot cho nội bộ công ty
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import {
  createSuccessResponse,
  createErrorResponse,
  generateRequestId,
  ErrorCodes,
} from '@/lib/api/error-handler';

export const dynamic = 'force-dynamic';

// Check if Coze is configured
const COZE_API_TOKEN = process.env.COZE_API_TOKEN;
const COZE_BOT_ID = process.env.COZE_BOT_ID || process.env.NEXT_PUBLIC_COZE_BOT_ID;

// POST - Send message to Coze AI Assistant
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  // Check if Coze is configured
  if (!COZE_API_TOKEN) {
    logger.warn('Coze API not configured - COZE_API_TOKEN missing');
    return createErrorResponse(
      'AI Chat đang được bảo trì. Vui lòng thử lại sau.',
      ErrorCodes.INTERNAL_ERROR,
      503,
      'COZE_API_TOKEN not configured',
      requestId
    );
  }

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
      botId: botId || COZE_BOT_ID,
      hasConversationId: !!conversationId,
    });

    // Call Coze API directly
    const targetBotId = botId || COZE_BOT_ID;
    if (!targetBotId) {
      return createErrorResponse(
        'Bot ID không được cấu hình',
        ErrorCodes.VALIDATION_ERROR,
        400,
        undefined,
        requestId
      );
    }

    const apiStartTime = Date.now();
    // Coze API v3 endpoint
    const cozeResponse = await fetch('https://api.coze.com/v3/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COZE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bot_id: targetBotId,
        user_id: userId,
        stream: false,
        auto_save_history: true,
        additional_messages: [
          {
            role: 'user',
            content: message,
            content_type: 'text',
          },
        ],
      }),
    });

    if (!cozeResponse.ok) {
      const errorData = await cozeResponse.json().catch(() => ({}));
      logger.error('Coze API returned error', null, { status: cozeResponse.status, errorData });
      throw new Error(errorData.msg || errorData.message || `Coze API error: ${cozeResponse.status}`);
    }

    const chatResult = await cozeResponse.json();
    
    // API v3 returns in_progress status, need to poll for completion
    if (chatResult.code !== 0) {
      throw new Error(chatResult.msg || 'Coze API error');
    }

    const chatId = chatResult.data?.id;
    const convId = chatResult.data?.conversation_id;
    
    // Poll for chat completion (max 30 seconds)
    let chatStatus = chatResult.data?.status;
    let pollAttempts = 0;
    const maxPollAttempts = 30;
    
    while (chatStatus === 'in_progress' && pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(
        `https://api.coze.com/v3/chat/retrieve?conversation_id=${convId}&chat_id=${chatId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${COZE_API_TOKEN}`,
          },
        }
      );
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        chatStatus = statusData.data?.status;
      }
      pollAttempts++;
    }

    // Get messages from completed chat
    const messagesResponse = await fetch(
      `https://api.coze.com/v3/chat/message/list?conversation_id=${convId}&chat_id=${chatId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${COZE_API_TOKEN}`,
        },
      }
    );

    let assistantMessage = 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.';
    
    if (messagesResponse.ok) {
      const messagesData = await messagesResponse.json();
      // Find the assistant's answer message
      const answerMsg = messagesData.data?.find(
        (msg: any) => msg.role === 'assistant' && msg.type === 'answer'
      );
      if (answerMsg?.content) {
        assistantMessage = answerMsg.content;
      }
    }

    const apiDuration = Date.now() - apiStartTime;

    logger.externalApi({
      service: 'Coze',
      endpoint: '/v3/chat',
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
        conversationId: convId,
        chatId: chatId,
        message: assistantMessage,
        role: 'assistant',
        contentType: 'text',
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

  // Check if Coze is configured
  if (!COZE_API_TOKEN) {
    return createErrorResponse(
      'AI Chat đang được bảo trì. Vui lòng thử lại sau.',
      ErrorCodes.INTERNAL_ERROR,
      503,
      'COZE_API_TOKEN not configured',
      requestId
    );
  }

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

    if (action === 'list') {
      // List all available bots
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      
      const cozeResponse = await fetch(`https://api.coze.com/v1/bots?page_index=${page}&page_size=${pageSize}`, {
        headers: { 'Authorization': `Bearer ${COZE_API_TOKEN}` },
      });

      if (!cozeResponse.ok) {
        throw new Error(`Failed to list bots: ${cozeResponse.status}`);
      }

      const bots = await cozeResponse.json();

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
      const cozeResponse = await fetch(`https://api.coze.com/v1/bot/get_online_info?bot_id=${botId}`, {
        headers: { 'Authorization': `Bearer ${COZE_API_TOKEN}` },
      });

      if (!cozeResponse.ok) {
        throw new Error(`Failed to get bot info: ${cozeResponse.status}`);
      }

      const botInfo = await cozeResponse.json();

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

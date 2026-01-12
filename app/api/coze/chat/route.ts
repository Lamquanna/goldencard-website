/**
 * Coze AI Assistant API Integration
 * Endpoint để giao tiếp với Coze bot cho nội bộ công ty
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCozeClient } from '@/lib/coze-client';

export const dynamic = 'force-dynamic';

// POST - Send message to Coze AI Assistant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userId, botId, conversationId } = body;

    // Validation
    if (!message || !userId) {
      return NextResponse.json(
        { success: false, error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Check environment variables
    console.log('🔧 Environment check:', {
      hasToken: !!process.env.COZE_API_TOKEN,
      hasBotId: !!process.env.COZE_BOT_ID,
      botIdFromEnv: process.env.COZE_BOT_ID,
      botIdFromRequest: botId,
    });

    // Get Coze client
    const coze = getCozeClient();

    console.log('📤 Sending to Coze:', { userId, messageLength: message.length, botId: botId || process.env.COZE_BOT_ID });

    // Send message to Coze
    const response = await coze.chat({
      botId,
      userId,
      message,
      conversationId,
      stream: false,
    });

    console.log('✅ Coze response:', { conversationId: response.conversation_id, hasContent: !!response.message?.content });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: response.conversation_id,
        message: response.message.content,
        role: response.message.role,
        contentType: response.message.content_type,
      },
    });
  } catch (error: any) {
    console.error('❌ Coze API error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to communicate with AI assistant',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET - Get bot info or list bots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const botId = searchParams.get('botId');

    const coze = getCozeClient();

    if (action === 'list') {
      // List all available bots
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      
      const bots = await coze.listBots({
        page_index: page,
        page_size: pageSize,
      });

      return NextResponse.json({
        success: true,
        data: bots,
      });
    } else if (action === 'info' && botId) {
      // Get specific bot info
      const botInfo = await coze.getBotInfo(botId);

      return NextResponse.json({
        success: true,
        data: botInfo,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action or missing botId' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('❌ Coze API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch bot information',
      },
      { status: 500 }
    );
  }
}

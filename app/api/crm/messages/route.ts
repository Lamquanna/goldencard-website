// API route: Chat messages
// GET /api/crm/messages?lead_id=xxx - Get messages for a lead
// POST /api/crm/messages - Send a new message

import { NextRequest, NextResponse } from 'next/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { CreateChatMessageInput } from '@/lib/types/crm';

export async function GET(request: NextRequest) {
  try {
    const supabase = mockSupabase as unknown as any;
    const searchParams = request.nextUrl.searchParams;
    const lead_id = searchParams.get('lead_id');

    if (!lead_id) {
      return NextResponse.json(
        { error: 'lead_id is required' },
        { status: 400 }
      );
    }

    console.log('💬 GET /api/crm/messages - lead_id:', lead_id);

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('lead_id', lead_id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    console.log('✅ Found messages:', messages?.length || 0);

    return NextResponse.json({ messages: messages || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = mockSupabase as unknown as any;
    const body = await request.json() as CreateChatMessageInput;

    // Validate required fields
    if (!body.lead_id || !body.message || !body.sender_type || !body.sender_name) {
      return NextResponse.json(
        { error: 'lead_id, message, sender_type, and sender_name are required' },
        { status: 400 }
      );
    }

    console.log('💬 POST /api/crm/messages - Sending message from:', body.sender_name);

    // Create message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Update lead's last_activity
    await supabase
      .from('leads')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', body.lead_id);

    console.log('✅ Message sent successfully');

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

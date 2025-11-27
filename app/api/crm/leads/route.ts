// API route: Create new lead
// POST /api/crm/leads

import { NextRequest, NextResponse } from 'next/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { CreateLeadInput } from '@/lib/types/crm';

export async function POST(request: NextRequest) {
  try {
    const supabase = mockSupabase as unknown as any;
    const body = await request.json() as CreateLeadInput;

    // Validate required fields
    if (!body.name || !body.source) {
      return NextResponse.json(
        { error: 'Name and source are required' },
        { status: 400 }
      );
    }

    // Auto-capture device & UTM from headers/URL
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Create lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        ...body,
        device_type: body.device_type || deviceType,
        ip_address: body.ip_address || ipAddress,
        browser: userAgent.slice(0, 200),
        locale: body.locale || 'vi',
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error creating lead:', leadError);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Create initial event
    await supabase
      .from('lead_events')
      .insert({
        lead_id: lead.id,
        event_type: 'created',
        description: `Lead created from ${body.source}`,
        metadata: {
          device: deviceType,
          source_url: body.source_url,
        },
      });

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Use mock data for local testing
    const supabase = mockSupabase as unknown as any;
    
    console.log('🔍 GET /api/crm/leads - Starting');

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📋 Query params:', { status, assigned_to, source, search, limit, offset });

    // Build query
    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, email, avatar_url)
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('🔨 Query built, applying filters...');

    if (status) {
      console.log('  → Filtering by status:', status);
      query = query.eq('status', status);
    }
    if (assigned_to) {
      console.log('  → Filtering by assigned_to:', assigned_to);
      query = query.eq('assigned_to', assigned_to);
    }
    if (source) {
      console.log('  → Filtering by source:', source);
      query = query.eq('source', source);
    }
    if (search) {
      console.log('  → Searching:', search);
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
    }

    console.log('⏳ Executing query...');
    const { data: leads, error, count } = await query;
    console.log('✅ Query result:', { leadsCount: leads?.length, totalCount: count, hasError: !!error });

    if (error) {
      console.error('Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    // Enrich leads with unread message info
    const enrichedLeads = await Promise.all((leads || []).map(async (lead: any) => {
      // Get messages for this lead
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });
      
      const customerMessages = messages?.filter((m: any) => m.sender_type === 'customer') || [];
      const adminMessages = messages?.filter((m: any) => m.sender_type === 'agent') || [];
      
      const customerLastMessage = customerMessages[0];
      const adminLastMessage = adminMessages[0];
      
      // Check if customer replied after admin's last message
      const hasUnreadMessages = customerLastMessage && (
        !adminLastMessage || 
        new Date(customerLastMessage.created_at) > new Date(adminLastMessage.created_at)
      );
      
      return {
        ...lead,
        has_unread_messages: hasUnreadMessages,
        customer_last_message_at: customerLastMessage?.created_at,
        admin_last_read_at: adminLastMessage?.created_at,
      };
    }));

    return NextResponse.json({
      leads: enrichedLeads,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

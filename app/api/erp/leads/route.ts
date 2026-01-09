// API route: Create new lead - ERP version
// POST /api/erp/leads

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import type { CreateLeadInput } from '@/lib/types/crm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateLeadInput;

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
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

    try {
      // Insert lead into PostgreSQL database
      const result = await sql`
        INSERT INTO leads (
          name,
          email,
          phone,
          company,
          message,
          status,
          priority,
          source,
          source_url,
          device_type,
          ip_address,
          browser,
          locale,
          assigned_to,
          created_at,
          updated_at,
          unread
        ) VALUES (
          ${body.name},
          ${body.email || null},
          ${body.phone || null},
          ${body.company || null},
          ${body.message || null},
          ${body.status || 'new'},
          ${body.priority || 'medium'},
          ${body.source || 'manual'},
          ${body.source_url || null},
          ${body.device_type || deviceType},
          ${body.ip_address || ipAddress},
          ${userAgent.slice(0, 200)},
          ${body.locale || 'vi'},
          ${body.assigned_to || null},
          NOW(),
          NOW(),
          true
        )
        RETURNING *
      `;

      const lead = result[0];
      console.log('✅ Lead created in PostgreSQL:', lead.id);

      return NextResponse.json({ 
        success: true, 
        lead,
        message: 'Lead created successfully'
      }, { status: 201 });

    } catch (dbError: any) {
      console.error('❌ Database error creating lead:', dbError);
      return NextResponse.json(
        { error: 'Failed to save lead to database: ' + dbError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/erp/leads - Fetching from PostgreSQL');

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const assigned_to = searchParams.get('assigned_to');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📋 Query params:', { status, assigned_to, source, search, limit, offset });

    try {
      // Build WHERE conditions
      let whereConditions = [];
      let params: any[] = [];
      let paramIndex = 1;

      if (status) {
        whereConditions.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (assigned_to) {
        whereConditions.push(`assigned_to = $${paramIndex}`);
        params.push(assigned_to);
        paramIndex++;
      }

      if (source) {
        whereConditions.push(`source = $${paramIndex}`);
        params.push(source);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

      // Get leads from PostgreSQL
      const leads = await sql`
        SELECT * FROM leads
        ${sql.unsafe(whereClause)}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total FROM leads
        ${sql.unsafe(whereClause)}
      `;

      const total = parseInt(countResult[0].total);

      console.log(`✅ Found ${leads.length} leads (total: ${total})`);

      return NextResponse.json({
        success: true,
        leads,
        total,
        limit,
        offset
      });

    } catch (dbError: any) {
      console.error('❌ Database error fetching leads:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch leads: ' + dbError.message },
        { status: 500 }
      );
    }

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

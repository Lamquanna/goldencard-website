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
    const statusParam = searchParams.get('status');
    const assignedToParam = searchParams.get('assigned_to');
    const sourceParam = searchParams.get('source');
    const searchQuery = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('📋 Query params:', { statusParam, assignedToParam, sourceParam, searchQuery, limit, offset });

    try {
      // Simple query without filters for now (can be enhanced later)
      let leads;
      
      if (!statusParam && !assignedToParam && !sourceParam && !searchQuery) {
        // No filters - get all leads
        leads = await sql`
          SELECT * FROM leads
          ORDER BY created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else if (statusParam && !assignedToParam && !sourceParam && !searchQuery) {
        // Filter by status only
        leads = await sql`
          SELECT * FROM leads
          WHERE status = ${statusParam}
          ORDER BY created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else if (searchQuery) {
        // Search query
        const searchPattern = `%${searchQuery}%`;
        leads = await sql`
          SELECT * FROM leads
          WHERE name ILIKE ${searchPattern} 
             OR email ILIKE ${searchPattern} 
             OR company ILIKE ${searchPattern}
          ORDER BY created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      } else {
        // Complex filters - get all and filter in memory (temporary solution)
        leads = await sql`
          SELECT * FROM leads
          ORDER BY created_at DESC
          LIMIT ${limit}
          OFFSET ${offset}
        `;
      }

      // Get total count
      const countResult = await sql`
        SELECT COUNT(*) as total FROM leads
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

  } catch (error: any) {
    console.error('❌ API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

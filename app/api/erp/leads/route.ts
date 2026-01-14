// API route: Create new lead - ERP version
// POST /api/erp/leads

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  // Require authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  const { user } = authResult;

  try {
    
    const body = await request.json() as any;

    // Validate required fields
    if (!body.name && !body.first_name && !body.last_name) {
      return NextResponse.json(
        { error: 'Name (or first_name/last_name) is required' },
        { status: 400 }
      );
    }

    // Map priority to temperature
    const temperatureMap: Record<string, string> = {
      'high': 'hot',
      'medium': 'warm',
      'low': 'cold',
      'hot': 'hot',
      'warm': 'warm',
      'cold': 'cold',
    };
    const temperature = temperatureMap[body.priority] || temperatureMap[body.rating] || 'warm';

    try {
      // Insert lead into PostgreSQL database with correct schema
      const result = await sql`
        INSERT INTO leads (
          first_name,
          last_name,
          email,
          phone,
          company_name,
          description,
          notes,
          status,
          temperature,
          source,
          source_detail,
          assigned_to,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          ${body.first_name || body.name || null},
          ${body.last_name || null},
          ${body.email || null},
          ${body.phone || null},
          ${body.company || body.company_name || null},
          ${body.message || null},
          ${body.notes || null},
          ${'new'},
          ${temperature},
          ${body.source || 'manual'},
          ${body.source_url || null},
          ${user.username || null},
          ${user.username || null},
          NOW(),
          NOW()
        )
        RETURNING *
      ` as any[];

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

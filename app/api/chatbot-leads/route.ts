// API route: Save chatbot leads to ERP CRM (NO AUTH required for public website)
// POST /api/chatbot-leads

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as any;

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    // Get user agent for device info
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = userAgent.includes('Mobile') ? 'mobile' : 
                       userAgent.includes('Tablet') ? 'tablet' : 'desktop';
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    try {
      // Insert lead into PostgreSQL with WEBSITE source (locked)
      const result = await sql`
        INSERT INTO leads (
          first_name,
          email,
          phone,
          description,
          notes,
          status,
          temperature,
          source,
          source_detail,
          created_by,
          created_at,
          updated_at
        ) VALUES (
          ${body.name},
          ${body.email || null},
          ${body.phone},
          ${'Khách hàng từ chatbot website'},
          ${JSON.stringify({
            device: deviceType,
            ip: ipAddress,
            timestamp: new Date().toISOString(),
            conversationPreview: body.conversationPreview || null
          })},
          ${'new'},
          ${'warm'},
          ${'WEBSITE_CHATBOT'},
          ${'AI Chatbot - Golden Energy Website'},
          ${'chatbot_system'},
          NOW(),
          NOW()
        )
        RETURNING id, first_name, email, phone, created_at
      ` as any[];

      const lead = result[0];
      
      console.log('✅ Chatbot lead saved to ERP CRM:', {
        id: lead.id,
        name: lead.first_name,
        phone: lead.phone,
        source: 'WEBSITE_CHATBOT'
      });

      return NextResponse.json({ 
        success: true, 
        leadId: lead.id,
        message: 'Lead information saved successfully'
      }, { status: 201 });

    } catch (dbError: any) {
      console.error('❌ Database error saving chatbot lead:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to save lead information',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ API error in chatbot-leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete old chatbot leads (admin cleanup)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const olderThanDays = parseInt(searchParams.get('days') || '90');
    const source = searchParams.get('source') || 'WEBSITE_CHATBOT';

    if (!olderThanDays || olderThanDays < 30) {
      return NextResponse.json(
        { error: 'Must specify at least 30 days for cleanup' },
        { status: 400 }
      );
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await sql`
      DELETE FROM leads
      WHERE source = ${source}
        AND created_at < ${cutoffDate.toISOString()}
        AND status = 'new'
      RETURNING id
    `;

    console.log(`🗑️  Deleted ${result.length} old chatbot leads (older than ${olderThanDays} days)`);

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.length,
      message: `Deleted ${result.length} leads older than ${olderThanDays} days`
    });

  } catch (error: any) {
    console.error('❌ Error deleting old leads:', error);
    return NextResponse.json(
      { error: 'Failed to delete leads' },
      { status: 500 }
    );
  }
}

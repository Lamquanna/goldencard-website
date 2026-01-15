// API route: Lead operations by ID
// GET/PUT/DELETE /api/erp/leads/[id]

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAuth } from '@/lib/auth/middleware';

// GET /api/erp/leads/[id] - Get single lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const leads = await sql`
      SELECT * FROM leads WHERE id = ${parseInt(id)}
    `;
    
    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      lead: leads[0]
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

// PUT /api/erp/leads/[id] - Update lead
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      company_name, 
      status, 
      temperature, 
      notes 
    } = body;

    const result = await sql`
      UPDATE leads SET
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        company_name = COALESCE(${company_name}, company_name),
        status = COALESCE(${status}, status),
        temperature = COALESCE(${temperature}, temperature),
        notes = COALESCE(${notes}, notes),
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: result[0]
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/erp/leads/[id] - Delete lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Require authentication
  const authResult = requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  try {
    const { id } = await params;
    
    // Hard delete from database
    const result = await sql`
      DELETE FROM leads WHERE id = ${parseInt(id)}
      RETURNING id, first_name, last_name
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const deletedLead = result[0];
    const fullName = `${deletedLead.first_name || ''} ${deletedLead.last_name || ''}`.trim();

    console.log(`✅ Lead ${id} deleted successfully: ${fullName}`);
    
    return NextResponse.json({
      success: true,
      message: `Lead "${fullName || 'Unknown'}" deleted successfully`,
      deletedId: deletedLead.id
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
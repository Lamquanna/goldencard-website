// API route: Update lead (assign, change status, etc.)
// PATCH /api/crm/leads/[id]

import { NextRequest, NextResponse } from 'next/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { UpdateLeadInput } from '@/lib/types/crm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    const body = await request.json() as UpdateLeadInput;

    console.log(`[API] PATCH /api/crm/leads/${id}`, body);

    // For mock mode - skip auth check and allow all updates
    // Get current lead
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentLead) {
      console.log(`[API] Lead ${id} not found`);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Update lead directly using mock
    const { data: lead, error: updateError } = await supabase
      .from('leads')
      .update(body)
      .eq('id', id);

    if (updateError) {
      console.error('[API] Error updating lead:', updateError);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    console.log(`[API] Lead ${id} updated successfully`, lead);
    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = mockSupabase as any;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get events
    const { data: events } = await supabase
      .from('lead_events')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    // Get views (who viewed this lead)
    const { data: views } = await supabase
      .from('lead_views')
      .select('*')
      .eq('lead_id', id)
      .order('viewed_at', { ascending: false });

    return NextResponse.json({ 
      lead, 
      events: events || [],
      views: views || []
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler - soft delete with reason logging
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = mockSupabase as any;
    
    // Get deletion reason from body
    let deleteReason = 'Không có lý do';
    let deletedBy = 'Unknown';
    let deletedByRole = 'unknown';
    
    try {
      const body = await request.json();
      deleteReason = body.reason || deleteReason;
      deletedBy = body.deleted_by || deletedBy;
      deletedByRole = body.deleted_by_role || deletedByRole;
    } catch {
      // No body provided
    }

    console.log(`[API] DELETE /api/crm/leads/${id}`);
    console.log(`[API] Deleted by: ${deletedBy} (${deletedByRole})`);
    console.log(`[API] Reason: ${deleteReason}`);

    // Get current lead before delete
    const { data: currentLead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Soft delete - set deleted_at timestamp
    const { error: deleteError } = await supabase
      .from('leads')
      .update({ 
        deleted_at: new Date().toISOString(),
        deletion_reason: deleteReason,
        deleted_by: deletedBy,
        deleted_by_role: deletedByRole,
      })
      .eq('id', id);

    if (deleteError) {
      console.error('[API] Error deleting lead:', deleteError);
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }

    // Log deletion event
    await supabase
      .from('lead_events')
      .insert({
        lead_id: id,
        event_type: 'deleted',
        description: `Lead "${currentLead.name}" đã bị xóa bởi ${deletedBy}`,
        metadata: {
          reason: deleteReason,
          deleted_by: deletedBy,
          deleted_by_role: deletedByRole,
          lead_name: currentLead.name,
          lead_email: currentLead.email,
          lead_phone: currentLead.phone,
        },
      });

    console.log(`[API] Lead ${id} deleted successfully`);
    return NextResponse.json({ 
      success: true, 
      message: `Lead deleted by ${deletedBy}`,
      deletion_log: {
        lead_id: id,
        lead_name: currentLead.name,
        deleted_by: deletedBy,
        deleted_by_role: deletedByRole,
        reason: deleteReason,
        deleted_at: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
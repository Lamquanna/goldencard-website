// API route: Restore deleted lead
// POST /api/crm/leads/restore

import { NextRequest, NextResponse } from 'next/server';
import { mockSupabase, deletionLogs } from '@/lib/supabase/mock';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lead_id, restored_by, restored_by_role } = body;
    
    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 });
    }

    console.log(`[API] POST /api/crm/leads/restore - lead_id: ${lead_id}`);
    console.log(`[API] Restored by: ${restored_by} (${restored_by_role})`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = mockSupabase as any;

    // Find the deleted lead
    const { data: allLeads } = await supabase
      .from('leads')
      .select('*');
    
    // Find lead including deleted ones
    const deletedLead = (allLeads as unknown as Array<Record<string, unknown>>)?.find(
      (l) => l.id === lead_id && l.deleted_at
    );
    
    if (!deletedLead) {
      return NextResponse.json({ error: 'Lead not found or not deleted' }, { status: 404 });
    }

    // Restore the lead by clearing deleted_at
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        deleted_at: null,
        deletion_reason: null,
        deleted_by: null,
        deleted_by_role: null,
        // Add restore info to metadata
        restored_at: new Date().toISOString(),
        restored_by: restored_by,
        restored_by_role: restored_by_role,
      })
      .eq('id', lead_id);

    if (updateError) {
      console.error('[API] Error restoring lead:', updateError);
      return NextResponse.json({ error: 'Failed to restore lead' }, { status: 500 });
    }

    // Remove from deletion logs
    const logIndex = deletionLogs.findIndex(log => log.lead_id === lead_id);
    if (logIndex !== -1) {
      deletionLogs.splice(logIndex, 1);
      console.log(`[API] Removed deletion log for lead ${lead_id}`);
    }

    // Log restore event
    await supabase
      .from('lead_events')
      .insert({
        lead_id: lead_id,
        event_type: 'restored',
        description: `Lead "${deletedLead.name}" đã được khôi phục bởi ${restored_by}`,
        metadata: {
          restored_by: restored_by,
          restored_by_role: restored_by_role,
          original_deletion_reason: deletedLead.deletion_reason,
        },
      });

    console.log(`[API] Lead ${lead_id} restored successfully`);
    return NextResponse.json({ 
      success: true, 
      message: `Lead restored by ${restored_by}`,
      lead: {
        id: lead_id,
        name: deletedLead.name,
      }
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

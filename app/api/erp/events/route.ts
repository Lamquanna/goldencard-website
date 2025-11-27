// API route: Create lead events
// POST /api/crm/events

import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { mockSupabase } from '@/lib/supabase/mock';
import type { CreateLeadEventInput } from '@/lib/types/crm';

export async function POST(request: NextRequest) {
  try {
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    const body = await request.json() as CreateLeadEventInput;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || !['admin', 'sales'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate
    if (!body.lead_id || !body.event_type || !body.description) {
      return NextResponse.json(
        { error: 'lead_id, event_type, and description are required' },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from('lead_events')
      .insert({
        ...body,
        user_id: user.id,
      })
      .select(`
        *,
        user:user_id(id, full_name, email, avatar_url)
      `)
      .single();

    if (eventError) {
      console.error('Error creating event:', eventError);
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

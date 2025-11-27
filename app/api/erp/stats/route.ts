// API route: Get CRM stats
// GET /api/crm/stats

import { NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
import { mockSupabase } from '@/lib/supabase/mock';

export async function GET() {
  try {
    // Use mock data for local testing
    const supabase = mockSupabase as any;
    console.log('GET /api/crm/stats - Using mock data');

    // Get stats from view
    const { data: stats, error: statsError } = await supabase
      .from('lead_stats')
      .select('*')
      .single();

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get source breakdown
    const { data: sourceStats } = await supabase
      .from('leads')
      .select('source')
      .is('deleted_at', null);

    const sourceBreakdown = (sourceStats || []).reduce((acc: Record<string, number>, item: { source: string }) => {
      const source = item.source;
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      ...stats,
      source_breakdown: sourceBreakdown,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

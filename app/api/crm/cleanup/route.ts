// API route: Cleanup old leads (cron job)
// GET /api/crm/cleanup (protected by cron secret)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'dev-secret-change-in-prod';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Call cleanup function
    const { error } = await supabase.rpc('cleanup_old_leads');

    if (error) {
      console.error('Error running cleanup:', error);
      return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
    }

    // Get counts after cleanup
    const { data: stats } = await supabase
      .from('lead_stats')
      .select('*')
      .single();

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

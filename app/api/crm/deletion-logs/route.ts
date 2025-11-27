// API route: Get deletion logs (Admin only)
// GET /api/crm/deletion-logs

import { NextResponse } from 'next/server';
import { deletionLogs } from '@/lib/supabase/mock';

export async function GET() {
  try {
    // For mock mode - return deletion logs
    console.log('[API] GET /api/crm/deletion-logs');
    
    // Access the deletion logs from mock module (uses globalThis internally)
    const logs = deletionLogs || [];
    console.log(`[API] Total deletion logs: ${logs.length}`);
    if (logs.length > 0) {
      console.log('[API] Logs:', JSON.stringify(logs, null, 2));
    }

    // Sort by deleted_at descending (newest first)
    const sortedLogs = [...logs].sort((a, b) => {
      return new Date(b.deleted_at).getTime() - new Date(a.deleted_at).getTime();
    });

    return NextResponse.json({ 
      logs: sortedLogs,
      total: sortedLogs.length,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

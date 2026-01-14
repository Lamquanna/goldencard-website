import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  generateRequestId,
  ErrorCodes 
} from '@/lib/api/error-handler';
import { getAuditLogs } from '@/lib/audit-log';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET - Fetch audit logs
 * Query params: user_id, entity_type, entity_id, action, start_date, end_date, limit
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      user_id: searchParams.get('user_id') || undefined,
      entity_type: searchParams.get('entity_type') || undefined,
      entity_id: searchParams.get('entity_id') || undefined,
      action: searchParams.get('action') as any || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '100')
    };
    
    logger.debug('Fetching audit logs', { filters, requestId });
    
    const logs = await getAuditLogs(filters);
    
    const duration = Date.now() - startTime;
    logger.apiRequest({ 
      method: 'GET', 
      url: '/api/audit-logs', 
      statusCode: 200, 
      duration, 
      requestId 
    });
    
    return createSuccessResponse({ 
      logs,
      count: logs.length 
    }, requestId);
    
  } catch (error: any) {
    logger.error('Error fetching audit logs', error, { requestId });
    return createErrorResponse(
      'Failed to fetch audit logs',
      ErrorCodes.DATABASE_ERROR,
      500,
      error.message,
      requestId
    );
  }
}

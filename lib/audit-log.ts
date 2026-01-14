import { sql } from '@vercel/postgres';
import { logger } from './logger';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'LOGOUT';

export interface AuditLogEntry {
  user_id: string;
  action: AuditAction;
  entity_type: string; // 'lead', 'project', 'expense', 'user', etc.
  entity_id?: string;
  changes?: Record<string, any>; // Before/after values
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
}

/**
 * Create audit log entry
 * Usage: await createAuditLog({ user_id: '123', action: 'CREATE', entity_type: 'lead', entity_id: '456' })
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const timestamp = new Date().toISOString();
    
    await sql`
      INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        changes,
        ip_address,
        user_agent,
        metadata,
        created_at
      ) VALUES (
        ${entry.user_id},
        ${entry.action},
        ${entry.entity_type},
        ${entry.entity_id || null},
        ${JSON.stringify(entry.changes || {})},
        ${entry.ip_address || null},
        ${entry.user_agent || null},
        ${JSON.stringify(entry.metadata || {})},
        ${timestamp}
      )
    `;
    
    logger.info('Audit log created', {
      user_id: entry.user_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id
    });
  } catch (error: any) {
    // Don't fail the main operation if audit log fails
    logger.error('Failed to create audit log', error, entry);
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action?: AuditAction;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<any[]> {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (filters.user_id) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(filters.user_id);
      paramIndex++;
    }
    
    if (filters.entity_type) {
      query += ` AND entity_type = $${paramIndex}`;
      params.push(filters.entity_type);
      paramIndex++;
    }
    
    if (filters.entity_id) {
      query += ` AND entity_id = $${paramIndex}`;
      params.push(filters.entity_id);
      paramIndex++;
    }
    
    if (filters.action) {
      query += ` AND action = $${paramIndex}`;
      params.push(filters.action);
      paramIndex++;
    }
    
    if (filters.start_date) {
      query += ` AND created_at >= $${paramIndex}`;
      params.push(filters.start_date);
      paramIndex++;
    }
    
    if (filters.end_date) {
      query += ` AND created_at <= $${paramIndex}`;
      params.push(filters.end_date);
      paramIndex++;
    }
    
    query += ' ORDER BY created_at DESC';
    query += ` LIMIT ${filters.limit || 100}`;
    
    const result = await sql.query(query, params);
    return result.rows;
    
  } catch (error: any) {
    logger.error('Failed to fetch audit logs', error);
    throw error;
  }
}

/**
 * Helper: Extract user from request JWT token
 */
export function getUserIdFromRequest(request: Request): string | null {
  try {
    // Import dynamically to avoid circular dependency
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return null;
    }
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    
    // Verify JWT token
    const jwt = require('jsonwebtoken');
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'default-secret-change-in-production';
    const decoded = jwt.verify(token, secret) as { userId: string };
    
    return decoded.userId || null;
  } catch (error) {
    // Token invalid or expired - return null
    return null;
  }
}

/**
 * Helper: Get IP address from request
 */
export function getIpAddress(request: Request): string | undefined {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         undefined;
}

/**
 * Helper: Get user agent from request
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined;
}

/**
 * Middleware helper: Create audit log from request
 */
export async function auditFromRequest(
  request: Request,
  action: AuditAction,
  entity_type: string,
  entity_id?: string,
  changes?: Record<string, any>
): Promise<void> {
  const user_id = getUserIdFromRequest(request);
  if (!user_id) return; // Skip if no authenticated user
  
  await createAuditLog({
    user_id,
    action,
    entity_type,
    entity_id,
    changes,
    ip_address: getIpAddress(request),
    user_agent: getUserAgent(request)
  });
}

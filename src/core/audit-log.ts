/**
 * Audit Log - Before/After Snapshots with Change Tracking
 * 
 * Tracks all user actions across modules with full change diff support.
 * Used by AdminHub for compliance and debugging.
 */

import { AuditLog, AuditAction, AuditDiff, User } from './types';

interface CreateAuditLogOptions {
  userId: string;
  userName: string;
  moduleId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  description?: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

interface AuditLogQuery {
  userId?: string;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

type AuditLogHandler = (log: AuditLog) => void | Promise<void>;

class AuditLogSystem {
  private logs: AuditLog[] = [];
  private handlers: Set<AuditLogHandler> = new Set();
  private fieldsToIgnore: Set<string> = new Set(['updatedAt', 'createdAt', '__v']);

  // ============================================
  // Audit Log Creation
  // ============================================

  /**
   * Create a new audit log entry
   */
  async log(options: CreateAuditLogOptions): Promise<AuditLog> {
    const diff = this.computeDiff(options.beforeData, options.afterData);
    
    const auditLog: AuditLog = {
      id: this.generateId(),
      userId: options.userId,
      userName: options.userName,
      moduleId: options.moduleId,
      entityType: options.entityType,
      entityId: options.entityId,
      action: options.action,
      description: options.description || this.generateDescription(options),
      beforeData: options.beforeData,
      afterData: options.afterData,
      diff: diff.length > 0 ? diff : undefined,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      timestamp: new Date(),
    };

    this.logs.push(auditLog);

    // Notify handlers
    await this.notifyHandlers(auditLog);

    return auditLog;
  }

  /**
   * Log a create action
   */
  async logCreate(
    user: User,
    moduleId: string,
    entityType: string,
    entityId: string,
    data: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId,
      action: 'create',
      afterData: data,
      ...metadata,
    });
  }

  /**
   * Log an update action
   */
  async logUpdate(
    user: User,
    moduleId: string,
    entityType: string,
    entityId: string,
    beforeData: Record<string, unknown>,
    afterData: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId,
      action: 'update',
      beforeData,
      afterData,
      ...metadata,
    });
  }

  /**
   * Log a delete action
   */
  async logDelete(
    user: User,
    moduleId: string,
    entityType: string,
    entityId: string,
    data: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId,
      action: 'delete',
      beforeData: data,
      ...metadata,
    });
  }

  /**
   * Log a view action (for sensitive data access tracking)
   */
  async logView(
    user: User,
    moduleId: string,
    entityType: string,
    entityId: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId,
      action: 'view',
      ...metadata,
    });
  }

  /**
   * Log an export action
   */
  async logExport(
    user: User,
    moduleId: string,
    entityType: string,
    description: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId: 'export',
      action: 'export',
      description,
      ...metadata,
    });
  }

  /**
   * Log login/logout actions
   */
  async logAuth(
    user: User,
    action: 'login' | 'logout',
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId: 'auth',
      entityType: 'session',
      entityId: user.id,
      action,
      ...metadata,
    });
  }

  /**
   * Log approval/rejection actions
   */
  async logApproval(
    user: User,
    approved: boolean,
    moduleId: string,
    entityType: string,
    entityId: string,
    comment?: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuditLog> {
    return this.log({
      userId: user.id,
      userName: user.name,
      moduleId,
      entityType,
      entityId,
      action: approved ? 'approve' : 'reject',
      description: comment,
      ...metadata,
    });
  }

  // ============================================
  // Diff Computation
  // ============================================

  /**
   * Compute difference between before and after data
   */
  private computeDiff(
    beforeData?: Record<string, unknown>,
    afterData?: Record<string, unknown>
  ): AuditDiff[] {
    const diff: AuditDiff[] = [];

    if (!beforeData && !afterData) {
      return diff;
    }

    if (!beforeData && afterData) {
      // Creation - all fields are new
      for (const [key, value] of Object.entries(afterData)) {
        if (this.fieldsToIgnore.has(key)) continue;
        diff.push({ field: key, oldValue: undefined, newValue: value });
      }
      return diff;
    }

    if (beforeData && !afterData) {
      // Deletion - all fields are removed
      for (const [key, value] of Object.entries(beforeData)) {
        if (this.fieldsToIgnore.has(key)) continue;
        diff.push({ field: key, oldValue: value, newValue: undefined });
      }
      return diff;
    }

    // Update - compare fields
    const allKeys = new Set([
      ...Object.keys(beforeData!),
      ...Object.keys(afterData!),
    ]);

    for (const key of allKeys) {
      if (this.fieldsToIgnore.has(key)) continue;

      const oldValue = beforeData![key];
      const newValue = afterData![key];

      if (!this.isEqual(oldValue, newValue)) {
        diff.push({ field: key, oldValue, newValue });
      }
    }

    return diff;
  }

  /**
   * Deep equality check
   */
  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => this.isEqual(item, b[index]));
    }

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a as object);
      const keysB = Object.keys(b as object);
      if (keysA.length !== keysB.length) return false;
      return keysA.every(key => 
        this.isEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key]
        )
      );
    }

    return false;
  }

  // ============================================
  // Query Methods
  // ============================================

  /**
   * Query audit logs
   */
  query(options: AuditLogQuery): { data: AuditLog[]; total: number } {
    let filtered = [...this.logs];

    if (options.userId) {
      filtered = filtered.filter(log => log.userId === options.userId);
    }

    if (options.moduleId) {
      filtered = filtered.filter(log => log.moduleId === options.moduleId);
    }

    if (options.entityType) {
      filtered = filtered.filter(log => log.entityType === options.entityType);
    }

    if (options.entityId) {
      filtered = filtered.filter(log => log.entityId === options.entityId);
    }

    if (options.action) {
      filtered = filtered.filter(log => log.action === options.action);
    }

    if (options.fromDate) {
      filtered = filtered.filter(log => log.timestamp >= options.fromDate!);
    }

    if (options.toDate) {
      filtered = filtered.filter(log => log.timestamp <= options.toDate!);
    }

    // Sort by timestamp descending (most recent first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const total = filtered.length;

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    filtered = filtered.slice(offset, offset + limit);

    return { data: filtered, total };
  }

  /**
   * Get audit log by ID
   */
  getById(id: string): AuditLog | undefined {
    return this.logs.find(log => log.id === id);
  }

  /**
   * Get logs for a specific entity
   */
  getEntityHistory(entityType: string, entityId: string): AuditLog[] {
    return this.logs
      .filter(log => log.entityType === entityType && log.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get recent activity for a user
   */
  getUserActivity(userId: string, limit: number = 20): AuditLog[] {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get recent activity for a module
   */
  getModuleActivity(moduleId: string, limit: number = 50): AuditLog[] {
    return this.logs
      .filter(log => log.moduleId === moduleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get activity statistics
   */
  getStats(options?: { fromDate?: Date; toDate?: Date; moduleId?: string }): {
    totalActions: number;
    byAction: Record<AuditAction, number>;
    byModule: Record<string, number>;
    byUser: Record<string, number>;
    topActiveUsers: { userId: string; userName: string; count: number }[];
  } {
    let filtered = [...this.logs];

    if (options?.fromDate) {
      filtered = filtered.filter(log => log.timestamp >= options.fromDate!);
    }

    if (options?.toDate) {
      filtered = filtered.filter(log => log.timestamp <= options.toDate!);
    }

    if (options?.moduleId) {
      filtered = filtered.filter(log => log.moduleId === options.moduleId);
    }

    const byAction = {} as Record<AuditAction, number>;
    const byModule = {} as Record<string, number>;
    const byUser = {} as Record<string, { name: string; count: number }>;

    filtered.forEach(log => {
      byAction[log.action] = (byAction[log.action] || 0) + 1;
      byModule[log.moduleId] = (byModule[log.moduleId] || 0) + 1;
      
      if (!byUser[log.userId]) {
        byUser[log.userId] = { name: log.userName, count: 0 };
      }
      byUser[log.userId].count++;
    });

    const topActiveUsers = Object.entries(byUser)
      .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: filtered.length,
      byAction,
      byModule,
      byUser: Object.fromEntries(
        Object.entries(byUser).map(([id, data]) => [id, data.count])
      ),
      topActiveUsers,
    };
  }

  // ============================================
  // Subscription
  // ============================================

  /**
   * Subscribe to audit log events
   */
  subscribe(handler: AuditLogHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  private async notifyHandlers(log: AuditLog): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler(log);
      } catch (error) {
        console.error('Audit log handler error:', error);
      }
    }
  }

  // ============================================
  // Configuration
  // ============================================

  /**
   * Add fields to ignore in diff computation
   */
  ignoreFields(...fields: string[]): void {
    fields.forEach(field => this.fieldsToIgnore.add(field));
  }

  /**
   * Remove fields from ignore list
   */
  trackFields(...fields: string[]): void {
    fields.forEach(field => this.fieldsToIgnore.delete(field));
  }

  // ============================================
  // Utility
  // ============================================

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDescription(options: CreateAuditLogOptions): string {
    const actionDescriptions: Record<AuditAction, string> = {
      create: 'created',
      update: 'updated',
      delete: 'deleted',
      view: 'viewed',
      export: 'exported',
      login: 'logged in',
      logout: 'logged out',
      approve: 'approved',
      reject: 'rejected',
      assign: 'assigned',
    };

    return `${options.userName} ${actionDescriptions[options.action]} ${options.entityType} (${options.entityId})`;
  }

  /**
   * Export logs for backup
   */
  export(query?: AuditLogQuery): AuditLog[] {
    if (query) {
      return this.query(query).data;
    }
    return [...this.logs];
  }

  /**
   * Import logs (for restoration)
   */
  import(logs: AuditLog[]): void {
    this.logs.push(...logs);
  }

  /**
   * Clear old logs (retention policy)
   */
  clearOlderThan(date: Date): number {
    const initialCount = this.logs.length;
    this.logs = this.logs.filter(log => log.timestamp >= date);
    return initialCount - this.logs.length;
  }
}

// Singleton instance
export const auditLog = new AuditLogSystem();

// Convenience decorator for tracking changes
export function withAuditLog(
  moduleId: string,
  entityType: string
) {
  return function <T extends Record<string, unknown>>(
    target: T,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args);
      // Audit logging would happen here in a real implementation
      return result;
    };

    return descriptor;
  };
}

export type { CreateAuditLogOptions, AuditLogQuery, AuditLogHandler };

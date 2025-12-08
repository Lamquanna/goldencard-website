/**
 * HOME Platform - Audit Log System
 * Track all changes with before/after snapshots
 */

// =============================================================================
// AUDIT LOG TYPES
// =============================================================================

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'restore'
  | 'view'
  | 'export'
  | 'import'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'assign'

export interface AuditLog {
  id: string
  
  // Action
  action: AuditAction
  module: string
  resourceType: string
  resourceId: string
  resourceName?: string
  
  // Changes
  previousData?: Record<string, unknown>
  newData?: Record<string, unknown>
  changedFields?: string[]
  
  // User
  userId: string
  userName?: string
  userEmail?: string
  
  // Context
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  
  // Metadata
  metadata?: Record<string, unknown>
  
  // Timestamp
  timestamp: Date
}

export interface AuditLogQuery {
  module?: string
  resourceType?: string
  resourceId?: string
  userId?: string
  action?: AuditAction
  fromDate?: Date
  toDate?: Date
  page?: number
  limit?: number
}

// =============================================================================
// AUDIT LOGGER
// =============================================================================

class AuditLogger {
  private logs: AuditLog[] = []
  private listeners: Set<(log: AuditLog) => void> = new Set()

  // Log an action
  log(
    action: AuditAction,
    module: string,
    resourceType: string,
    resourceId: string,
    userId: string,
    options?: {
      resourceName?: string
      previousData?: Record<string, unknown>
      newData?: Record<string, unknown>
      userName?: string
      userEmail?: string
      ipAddress?: string
      userAgent?: string
      metadata?: Record<string, unknown>
    }
  ): AuditLog {
    // Calculate changed fields
    let changedFields: string[] | undefined
    if (options?.previousData && options?.newData) {
      changedFields = this.getChangedFields(options.previousData, options.newData)
    }

    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      module,
      resourceType,
      resourceId,
      resourceName: options?.resourceName,
      previousData: options?.previousData,
      newData: options?.newData,
      changedFields,
      userId,
      userName: options?.userName,
      userEmail: options?.userEmail,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      metadata: options?.metadata,
      timestamp: new Date(),
    }

    this.logs.unshift(log)
    
    // Keep only last 10000 logs in memory
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(0, 10000)
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(log))

    return log
  }

  // Get changed fields between two objects
  private getChangedFields(previous: Record<string, unknown>, current: Record<string, unknown>): string[] {
    const changed: string[] = []
    const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)])

    allKeys.forEach(key => {
      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changed.push(key)
      }
    })

    return changed
  }

  // Query logs
  query(query: AuditLogQuery): { logs: AuditLog[]; total: number } {
    let filtered = this.logs

    if (query.module) {
      filtered = filtered.filter(log => log.module === query.module)
    }
    if (query.resourceType) {
      filtered = filtered.filter(log => log.resourceType === query.resourceType)
    }
    if (query.resourceId) {
      filtered = filtered.filter(log => log.resourceId === query.resourceId)
    }
    if (query.userId) {
      filtered = filtered.filter(log => log.userId === query.userId)
    }
    if (query.action) {
      filtered = filtered.filter(log => log.action === query.action)
    }
    if (query.fromDate) {
      filtered = filtered.filter(log => log.timestamp >= query.fromDate!)
    }
    if (query.toDate) {
      filtered = filtered.filter(log => log.timestamp <= query.toDate!)
    }

    const total = filtered.length
    const page = query.page || 1
    const limit = query.limit || 50
    const start = (page - 1) * limit

    return {
      logs: filtered.slice(start, start + limit),
      total,
    }
  }

  // Get resource history
  getResourceHistory(resourceType: string, resourceId: string): AuditLog[] {
    return this.logs.filter(
      log => log.resourceType === resourceType && log.resourceId === resourceId
    )
  }

  // Subscribe to new logs
  subscribe(listener: (log: AuditLog) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  // Clear all logs (admin only)
  clear(): void {
    this.logs = []
  }
}

// =============================================================================
// AUDIT HELPER FUNCTIONS
// =============================================================================

export function formatAuditAction(action: AuditAction): { label: string; labelVi: string; color: string } {
  const config: Record<AuditAction, { label: string; labelVi: string; color: string }> = {
    create: { label: 'Create', labelVi: 'Tạo mới', color: 'bg-green-100 text-green-800' },
    update: { label: 'Update', labelVi: 'Cập nhật', color: 'bg-blue-100 text-blue-800' },
    delete: { label: 'Delete', labelVi: 'Xóa', color: 'bg-red-100 text-red-800' },
    restore: { label: 'Restore', labelVi: 'Khôi phục', color: 'bg-purple-100 text-purple-800' },
    view: { label: 'View', labelVi: 'Xem', color: 'bg-gray-100 text-gray-800' },
    export: { label: 'Export', labelVi: 'Xuất', color: 'bg-yellow-100 text-yellow-800' },
    import: { label: 'Import', labelVi: 'Nhập', color: 'bg-yellow-100 text-yellow-800' },
    login: { label: 'Login', labelVi: 'Đăng nhập', color: 'bg-emerald-100 text-emerald-800' },
    logout: { label: 'Logout', labelVi: 'Đăng xuất', color: 'bg-gray-100 text-gray-800' },
    approve: { label: 'Approve', labelVi: 'Duyệt', color: 'bg-green-100 text-green-800' },
    reject: { label: 'Reject', labelVi: 'Từ chối', color: 'bg-red-100 text-red-800' },
    assign: { label: 'Assign', labelVi: 'Giao việc', color: 'bg-indigo-100 text-indigo-800' },
  }
  return config[action]
}

export function getFieldChangeSummary(log: AuditLog): string {
  if (!log.changedFields?.length) return ''
  
  if (log.changedFields.length === 1) {
    return `Changed ${log.changedFields[0]}`
  }
  
  if (log.changedFields.length <= 3) {
    return `Changed ${log.changedFields.join(', ')}`
  }
  
  return `Changed ${log.changedFields.length} fields`
}

// =============================================================================
// AUDIT DECORATORS (for use with class methods)
// =============================================================================

export function Audited(module: string, resourceType: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: unknown[]) {
      const result = await originalMethod.apply(this, args)
      
      // Log after successful execution
      // Note: This is a simplified version, real implementation would need context
      console.log(`Audited: ${module}.${resourceType}.${propertyKey}`)
      
      return result
    }

    return descriptor
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const auditLogger = new AuditLogger()

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect, useCallback } from 'react'

export function useAuditLogs(query: AuditLogQuery) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setLoading(true)
    const result = auditLogger.query(query)
    setLogs(result.logs)
    setTotal(result.total)
    setLoading(false)
  }, [query])

  useEffect(() => {
    refresh()
    
    // Subscribe to new logs
    const unsubscribe = auditLogger.subscribe((newLog) => {
      // Check if new log matches query
      if (
        (!query.module || newLog.module === query.module) &&
        (!query.resourceType || newLog.resourceType === query.resourceType) &&
        (!query.resourceId || newLog.resourceId === query.resourceId)
      ) {
        setLogs(prev => [newLog, ...prev].slice(0, query.limit || 50))
        setTotal(prev => prev + 1)
      }
    })

    return unsubscribe
  }, [query, refresh])

  return { logs, total, loading, refresh }
}

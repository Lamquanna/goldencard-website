'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  History,
  ArrowLeftRight
} from 'lucide-react'
import { 
  useAuditLogs, 
  formatAuditAction, 
  getFieldChangeSummary,
  type AuditLog,
  type AuditAction 
} from '@/app/erp/core/audit-log'

interface AuditLogTableProps {
  module?: string
  resourceType?: string
  resourceId?: string
}

export function AuditLogTable({ module, resourceType, resourceId }: AuditLogTableProps) {
  const [page, setPage] = useState(1)
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDetails, setShowDetails] = useState<string | null>(null)

  const { logs, total, loading } = useAuditLogs({
    module,
    resourceType,
    resourceId,
    action: actionFilter || undefined,
    page,
    limit: 20,
  })

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.resourceName?.toLowerCase().includes(query) ||
      log.userName?.toLowerCase().includes(query) ||
      log.userEmail?.toLowerCase().includes(query)
    )
  })

  const totalPages = Math.ceil(total / 20)

  const actions: AuditAction[] = [
    'create', 'update', 'delete', 'restore', 
    'view', 'export', 'import', 
    'login', 'logout', 'approve', 'reject', 'assign'
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Lá»‹ch sá»­ thay Ä‘á»•i
            </h2>
            <span className="text-sm text-gray-500">({total})</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="TÃ¬m kiáº¿m..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as AuditAction | '')}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Táº¥t cáº£ hÃ nh Ä‘á»™ng</option>
              {actions.map(action => (
                <option key={action} value={action}>
                  {formatAuditAction(action).labelVi}
                </option>
              ))}
            </select>

            {/* Export */}
            <button className="p-2 text-gray-500 hover:bg-gray-100:bg-gray-800 rounded-lg">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thá»i gian
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                NgÆ°á»i thá»±c hiá»‡n
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                HÃ nh Ä‘á»™ng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Äá»‘i tÆ°á»£ng
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thay Ä‘á»•i
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Chi tiáº¿t
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Äang táº£i...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  KhÃ´ng cÃ³ dá»¯ liá»‡u
                </td>
              </tr>
            ) : (
              filteredLogs.map(log => {
                const actionConfig = formatAuditAction(log.action)
                const changeSummary = getFieldChangeSummary(log)
                
                return (
                  <tr key={log.id} className="hover:bg-gray-50:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {format(log.timestamp, 'dd/MM/yyyy HH:mm')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(log.timestamp, { addSuffix: true, locale: vi })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {log.userName || log.userId}
                      </div>
                      {log.userEmail && (
                        <div className="text-xs text-gray-500">{log.userEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionConfig.color}`}>
                        {actionConfig.labelVi}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {log.resourceName || log.resourceId}
                      </div>
                      <div className="text-xs text-gray-500">
                        {log.module} / {log.resourceType}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {changeSummary && (
                        <span className="text-sm text-gray-600">
                          {changeSummary}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setShowDetails(showDetails === log.id ? null : log.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600:text-gray-300 hover:bg-gray-100:bg-gray-800 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Trang {page} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-gray-500 hover:bg-gray-100:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-gray-500 hover:bg-gray-100:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && (
        <AuditLogDetails
          log={filteredLogs.find(l => l.id === showDetails)!}
          onClose={() => setShowDetails(null)}
        />
      )}
    </div>
  )
}

// Audit Log Details Modal
function AuditLogDetails({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi tiáº¿t thay Ä‘á»•i
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:bg-gray-100:bg-gray-800 rounded"
          >
            Ã—
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-gray-500 mb-1">Thá»i gian</div>
              <div className="text-sm text-gray-900">
                {format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">NgÆ°á»i thá»±c hiá»‡n</div>
              <div className="text-sm text-gray-900">
                {log.userName || log.userId}
              </div>
            </div>
            {log.ipAddress && (
              <div>
                <div className="text-xs text-gray-500 mb-1">IP Address</div>
                <div className="text-sm text-gray-900 font-mono">
                  {log.ipAddress}
                </div>
              </div>
            )}
            {log.userAgent && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Browser</div>
                <div className="text-sm text-gray-900 truncate">
                  {log.userAgent}
                </div>
              </div>
            )}
          </div>

          {/* Changes */}
          {log.previousData && log.newData && (
            <div>
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                <ArrowLeftRight className="w-4 h-4" />
                CÃ¡c thay Ä‘á»•i
              </div>
              <div className="space-y-3">
                {log.changedFields?.map(field => (
                  <div key={field} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-gray-500 mb-2">{field}</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-red-500 mb-1">TrÆ°á»›c</div>
                        <div className="text-sm bg-red-50 text-red-700 p-2 rounded font-mono">
                          {JSON.stringify(log.previousData![field], null, 2) || '(empty)'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-green-500 mb-1">Sau</div>
                        <div className="text-sm bg-green-50 text-green-700 p-2 rounded font-mono">
                          {JSON.stringify(log.newData![field], null, 2) || '(empty)'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Filter,
  X,
  Activity,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  LogIn,
  LogOut,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Shield,
  Upload,
  Clock,
  User,
  Globe,
  Monitor,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAdminStore, selectFilteredAuditLogs, selectAdminStats } from '../store';
import {
  AuditLog,
  AuditAction,
  ModuleType,
  AUDIT_ACTION_CONFIG,
  MODULE_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface AuditLogViewerProps {
  onLogClick?: (log: AuditLog) => void;
  onExport?: () => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getActionIcon = (action: AuditAction) => {
  const icons: Record<AuditAction, React.ReactNode> = {
    [AuditAction.LOGIN]: <LogIn className="h-4 w-4" />,
    [AuditAction.LOGOUT]: <LogOut className="h-4 w-4" />,
    [AuditAction.CREATE]: <FileText className="h-4 w-4" />,
    [AuditAction.UPDATE]: <Edit className="h-4 w-4" />,
    [AuditAction.DELETE]: <Trash2 className="h-4 w-4" />,
    [AuditAction.VIEW]: <Eye className="h-4 w-4" />,
    [AuditAction.EXPORT]: <Download className="h-4 w-4" />,
    [AuditAction.IMPORT]: <Upload className="h-4 w-4" />,
    [AuditAction.APPROVE]: <CheckCircle className="h-4 w-4" />,
    [AuditAction.REJECT]: <XCircle className="h-4 w-4" />,
    [AuditAction.SETTINGS_CHANGE]: <Settings className="h-4 w-4" />,
    [AuditAction.PERMISSION_CHANGE]: <Shield className="h-4 w-4" />,
  };
  return icons[action];
};

// ============================================================================
// STATS
// ============================================================================

function AuditStatsCards() {
  const stats = useAdminStore(selectAdminStats);
  const auditLogs = useAdminStore((state) => state.auditLogs);

  // Action counts
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.slice(0, 1000).forEach((log) => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return counts;
  }, [auditLogs]);

  const items = [
    {
      label: 'Tổng logs',
      value: stats.totalAuditLogs,
      icon: Activity,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Hoạt động 24h',
      value: stats.recentActivity,
      icon: Clock,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    },
    {
      label: 'Đăng nhập',
      value: actionCounts[AuditAction.LOGIN] || 0,
      icon: LogIn,
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-950',
    },
    {
      label: 'Thay đổi',
      value: (actionCounts[AuditAction.CREATE] || 0) +
             (actionCounts[AuditAction.UPDATE] || 0) +
             (actionCounts[AuditAction.DELETE] || 0),
      icon: Edit,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-2xl text-zinc-900 dark:text-zinc-100">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// LOG DETAILS
// ============================================================================

function LogDetailsPanel({ log }: { log: AuditLog }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!log.changes && !log.details) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          Chi tiết
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-sm">
          {log.changes && (
            <div className="space-y-2">
              <p className="font-medium text-zinc-700 dark:text-zinc-300">Thay đổi:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Trước</p>
                  <pre className="text-xs bg-red-50 dark:bg-red-950 p-2 rounded overflow-auto">
                    {JSON.stringify(log.changes.before, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Sau</p>
                  <pre className="text-xs bg-emerald-50 dark:bg-emerald-950 p-2 rounded overflow-auto">
                    {JSON.stringify(log.changes.after, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
          {log.details && (
            <div className="mt-2">
              <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-1">Chi tiết:</p>
              <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-2 rounded overflow-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AuditLogViewer({
  onLogClick,
  onExport,
}: AuditLogViewerProps) {
  const [showFilters, setShowFilters] = useState(false);

  const { auditFilters, setAuditFilters, clearAuditFilters, selectAuditLog } =
    useAdminStore();

  const logs = useAdminStore(selectFilteredAuditLogs);

  const handleLogView = useCallback(
    (log: AuditLog) => {
      selectAuditLog(log);
      onLogClick?.(log);
    },
    [selectAuditLog, onLogClick]
  );

  const handleSearch = useCallback(
    (value: string) => {
      setAuditFilters({ search: value || undefined });
    },
    [setAuditFilters]
  );

  const hasActiveFilters = useMemo(() => {
    return !!(
      auditFilters.search ||
      auditFilters.action ||
      auditFilters.module ||
      auditFilters.userId
    );
  }, [auditFilters]);

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, AuditLog[]> = {};
    logs.forEach((log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <AuditStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm logs..."
              value={auditFilters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAuditFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh */}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>

          {/* Export */}
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" />
            Xuất
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Action Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Hành động
                    </label>
                    <Select
                      value={auditFilters.action || 'all'}
                      onValueChange={(value) =>
                        setAuditFilters({
                          action: value === 'all' ? undefined : (value as AuditAction),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả hành động" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả hành động</SelectItem>
                        {Object.entries(AUDIT_ACTION_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Module Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Module
                    </label>
                    <Select
                      value={auditFilters.module || 'all'}
                      onValueChange={(value) =>
                        setAuditFilters({
                          module: value === 'all' ? undefined : (value as ModuleType),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả modules</SelectItem>
                        {Object.entries(MODULE_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* User Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      User ID
                    </label>
                    <Input
                      placeholder="Nhập User ID"
                      value={auditFilters.userId || ''}
                      onChange={(e) =>
                        setAuditFilters({ userId: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Từ ngày
                    </label>
                    <Input
                      type="date"
                      value={auditFilters.dateFrom || ''}
                      onChange={(e) =>
                        setAuditFilters({ dateFrom: e.target.value || undefined })
                      }
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Đến ngày
                    </label>
                    <Input
                      type="date"
                      value={auditFilters.dateTo || ''}
                      onChange={(e) =>
                        setAuditFilters({ dateTo: e.target.value || undefined })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logs Timeline */}
      <Card>
        <CardContent className="p-0">
          {Object.entries(groupedLogs).map(([date, dateLogs]) => (
            <div key={date} className="border-b last:border-b-0">
              {/* Date Header */}
              <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {format(new Date(date), 'EEEE, dd MMMM yyyy', { locale: vi })}
                </p>
              </div>

              {/* Logs */}
              <div className="divide-y">
                {dateLogs.map((log) => {
                  const actionConfig = AUDIT_ACTION_CONFIG[log.action];
                  const moduleConfig = MODULE_CONFIG[log.module];

                  return (
                    <div
                      key={log.id}
                      className="px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Action Icon */}
                        <div
                          className={cn(
                            'p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800',
                            actionConfig.color
                          )}
                        >
                          {getActionIcon(log.action)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {/* Action & Resource */}
                              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                <span className={actionConfig.color}>
                                  {actionConfig.label}
                                </span>
                                {log.resourceType && (
                                  <span className="text-zinc-500">
                                    {' '}
                                    {log.resourceType}
                                  </span>
                                )}
                                {log.resourceName && (
                                  <span className="text-zinc-700 dark:text-zinc-300">
                                    {' '}
                                    "{log.resourceName}"
                                  </span>
                                )}
                              </p>

                              {/* User Info */}
                              <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px]">
                                    {getInitials(log.userName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                  {log.userName}
                                </span>
                                <span className="text-xs text-zinc-400">•</span>
                                <span className="text-xs text-zinc-400">
                                  {log.userEmail}
                                </span>
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                                {moduleConfig && (
                                  <Badge variant="outline" className="text-xs">
                                    {moduleConfig.label}
                                  </Badge>
                                )}
                                {log.ipAddress && (
                                  <span className="flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {log.ipAddress}
                                  </span>
                                )}
                                {log.userAgent && (
                                  <span className="flex items-center gap-1">
                                    <Monitor className="h-3 w-3" />
                                    {log.userAgent.slice(0, 30)}...
                                  </span>
                                )}
                              </div>

                              {/* Details */}
                              <LogDetailsPanel log={log} />
                            </div>

                            {/* Time */}
                            <div className="text-right shrink-0">
                              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                {format(new Date(log.timestamp), 'HH:mm:ss')}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {formatDistanceToNow(new Date(log.timestamp), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Empty State */}
      {logs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có logs nào
            </h3>
            <p className="text-sm text-zinc-500">
              {hasActiveFilters
                ? 'Không tìm thấy logs phù hợp với bộ lọc'
                : 'Logs sẽ xuất hiện khi có hoạt động trong hệ thống'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

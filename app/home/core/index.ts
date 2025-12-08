/**
 * HOME Platform Core Systems
 * Export all core modules
 */

// Module Registry (Plugin Engine)
export { moduleRegistry, type NavigationItem } from './module-registry'

// RBAC (Role-Based Access Control)
export { 
  PermissionChecker,
  usePermissions,
  BUILT_IN_ROLES,
  RESOURCES,
  type PermissionAction,
  type Permission,
  type Role,
  type UserPermissions,
} from './rbac'

// Notification System
export {
  useNotificationStore,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationType,
  type Notification,
  type NotificationPreferences,
} from './notification-system'

// Workflow Engine
export {
  WorkflowEngine,
  workflowEngine,
  WORKFLOW_TEMPLATES,
  type WorkflowDefinition,
  type WorkflowStep,
  type WorkflowInstance,
  type WorkflowTrigger,
} from './workflow-engine'

// Audit Log
export {
  auditLogger,
  useAuditLogs,
  formatAuditAction,
  getFieldChangeSummary,
  type AuditLog,
  type AuditAction,
  type AuditLogQuery,
} from './audit-log'

// Global Search
export {
  globalSearch,
  useGlobalSearch,
  commandPaletteItems,
  type SearchResult,
  type SearchableModule,
  type CommandPaletteItem,
} from './global-search'

// File Manager
export {
  fileManager,
  useFileManager,
  formatFileSize,
  fileTypeIcons,
  type FileItem,
  type FileType,
  type FileSource,
} from './file-manager'

// Integration Layer
export {
  integrationManager,
  useIntegration,
  useIntegrations,
  availableIntegrations,
  type IntegrationConfig,
  type IntegrationType,
  type IntegrationStatus,
} from './integration-layer'

// Reporting Engine
export {
  reportEngine,
  useReport,
  useReports,
  useDashboard,
  presetReports,
  getDateRangeFromPreset,
  formatReportValue,
  type ReportConfig,
  type ReportType,
  type Dashboard,
  type DashboardWidget,
} from './reporting-engine'

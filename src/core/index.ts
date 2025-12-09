/**
 * Core Module Exports
 * 
 * Central export point for all core platform functionality.
 */

// Types
export * from './types';

// Module Registry
export { moduleRegistry } from './module-registry';
export type { ModuleManifest, ModulePermission } from './module-registry';

// RBAC
export { rbac, requirePermission } from './rbac';
export type { PermissionCheck, AccessContext } from './rbac';

// Notification System
export { 
  notificationSystem, 
  notify, 
  NotificationTemplates 
} from './notification-system';
export type { 
  NotificationHandler, 
  NotificationFilter, 
  NotificationOptions, 
  BroadcastOptions 
} from './notification-system';

// Workflow Engine
export { workflowEngine } from './workflow-engine';
export type { 
  WorkflowEventHandler, 
  ActionHandler, 
  WorkflowEvent, 
  StartWorkflowOptions, 
  StepActionOptions 
} from './workflow-engine';

// Audit Log
export { auditLog, withAuditLog } from './audit-log';
export type { 
  CreateAuditLogOptions, 
  AuditLogQuery, 
  AuditLogHandler 
} from './audit-log';

// Global Search
export { globalSearch } from './global-search';
export type { 
  SearchProvider, 
  SearchResultGroup, 
  RecentSearch, 
  QuickAction 
} from './global-search';

// File Manager
export { fileManager } from './file-manager';
export type { 
  UploadOptions, 
  CreateFolderOptions, 
  MoveOptions, 
  FileQuery, 
  StorageProvider, 
  FileEvent 
} from './file-manager';

// Integration Layer
export { 
  integrationLayer,
  BaseIntegration,
  MISAIntegration,
  ZaloOAIntegration,
  GmailIntegration,
  GoogleDriveIntegration,
  VNPayIntegration,
} from './integration-layer';
export type {
  IntegrationCredentials,
  IntegrationSettings,
  SyncResult,
  IntegrationEvent,
  MISAInvoice,
  MISACustomer,
  ZaloMessage,
  ZaloOAProfile,
  EmailMessage,
  EmailThread,
  DriveFile,
  VNPayTransaction,
  VNPayResult,
} from './integration-layer';

// Reporting Engine
export { reportingEngine } from './reporting-engine';
export type { 
  ReportData, 
  ChartData, 
  ExportOptions, 
  DataSource, 
  DashboardWidget, 
  Dashboard 
} from './reporting-engine';

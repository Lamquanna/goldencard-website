// ============================================================================
// ORGANIZATION/COMPANY SETTINGS MODULE - INDEX (BARREL EXPORTS)
// GoldenEnergy HOME Platform - Organization Module Entry Point
// ============================================================================

// Types
export * from './types';

// Store
export { 
  useOrganizationStore,
  selectOrganizationSettings,
  selectDepartmentById,
  selectPositionById,
  selectRootDepartments,
  selectDepartmentChildren,
  selectDepartmentMembers,
  selectActiveApprovalChains,
  selectActiveWorkflowTriggers,
  selectStorageUsagePercent,
} from './store';

// Services
export {
  OrganizationService,
  DepartmentService,
  PositionService,
  HierarchyService,
  ApprovalChainService,
  WorkflowTriggerService,
  organizationService,
  departmentService,
  positionService,
  hierarchyService,
  approvalChainService,
  workflowTriggerService,
} from './services';

// ============================================================================
// MODULE CONFIGURATION
// ============================================================================

// Define module config type for organization module
interface OrganizationRoute {
  path: string;
  name: string;
  icon: string;
  permission: string;
}

interface OrganizationModuleConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  permissions: string[];
  routes: OrganizationRoute[];
  initialize: () => Promise<boolean>;
  cleanup: () => Promise<void>;
}

export const moduleConfig: OrganizationModuleConfig = {
  id: 'organization',
  name: 'Quản lý Tổ chức',
  description: 'Cấu hình công ty, phòng ban, chức vụ và quy trình phê duyệt',
  version: '1.0.0',
  dependencies: ['core'],
  permissions: [
    'organization:view',
    'organization:edit',
    'organization:settings',
    'department:view',
    'department:create',
    'department:edit',
    'department:delete',
    'position:view',
    'position:create',
    'position:edit',
    'position:delete',
    'hierarchy:view',
    'hierarchy:edit',
    'approval:view',
    'approval:create',
    'approval:edit',
    'approval:delete',
    'workflow:view',
    'workflow:create',
    'workflow:edit',
    'workflow:delete',
  ],
  routes: [
    {
      path: '/settings/organization',
      name: 'Thông tin Công ty',
      icon: 'Building2',
      permission: 'organization:view',
    },
    {
      path: '/settings/departments',
      name: 'Phòng ban',
      icon: 'Network',
      permission: 'department:view',
    },
    {
      path: '/settings/positions',
      name: 'Chức vụ',
      icon: 'UserCog',
      permission: 'position:view',
    },
    {
      path: '/settings/hierarchy',
      name: 'Sơ đồ Tổ chức',
      icon: 'GitBranch',
      permission: 'hierarchy:view',
    },
    {
      path: '/settings/approvals',
      name: 'Quy trình Phê duyệt',
      icon: 'CheckCircle',
      permission: 'approval:view',
    },
    {
      path: '/settings/workflows',
      name: 'Workflow Mapping',
      icon: 'Workflow',
      permission: 'workflow:view',
    },
    {
      path: '/settings/branding',
      name: 'Thương hiệu',
      icon: 'Palette',
      permission: 'organization:settings',
    },
    {
      path: '/settings/security',
      name: 'Bảo mật',
      icon: 'Shield',
      permission: 'organization:settings',
    },
    {
      path: '/settings/storage',
      name: 'Dung lượng',
      icon: 'HardDrive',
      permission: 'organization:settings',
    },
  ],
  initialize: async () => {
    console.log('[Organization Module] Initializing...');
    // Initialization logic will be added here
    return true;
  },
  cleanup: async () => {
    console.log('[Organization Module] Cleaning up...');
    // Cleanup logic will be added here
  },
};

export default moduleConfig;

// ============================================================================
// ORGANIZATION/COMPANY SETTINGS MODULE - ZUSTAND STORE
// GoldenEnergy HOME Platform - Organization State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';
import type {
  Organization,
  OrganizationSettings,
  Department,
  DepartmentTreeNode,
  DepartmentMember,
  Position,
  HierarchyNode,
  ApprovalChain,
  WorkflowTrigger,
  StorageQuota,
  BrandingSettings,
  SecuritySettings,
  NotificationSettings,
  UpdateOrganizationSettingsDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
  DepartmentStatus,
} from './types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface OrganizationState {
  // Current organization
  currentOrganization: Organization | null;
  
  // Departments
  departments: Department[];
  departmentTree: DepartmentTreeNode[];
  departmentMembers: Map<string, DepartmentMember[]>;
  
  // Positions & Hierarchy
  positions: Position[];
  hierarchyNodes: HierarchyNode[];
  
  // Workflows & Approvals
  approvalChains: ApprovalChain[];
  workflowTriggers: WorkflowTrigger[];
  
  // UI State
  selectedDepartmentId: string | null;
  selectedPositionId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface OrganizationActions {
  // Organization actions
  setCurrentOrganization: (org: Organization | null) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  updateSettings: (settings: UpdateOrganizationSettingsDto) => void;
  updateBranding: (branding: Partial<BrandingSettings>) => void;
  updateSecurity: (security: Partial<SecuritySettings>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  updateStorageQuota: (quota: Partial<StorageQuota>) => void;
  
  // Department actions
  setDepartments: (departments: Department[]) => void;
  addDepartment: (dto: CreateDepartmentDto) => void;
  updateDepartment: (id: string, dto: UpdateDepartmentDto) => void;
  deleteDepartment: (id: string) => void;
  moveDepartment: (id: string, newParentId: string | null) => void;
  reorderDepartments: (parentId: string | null, orderedIds: string[]) => void;
  setDepartmentStatus: (id: string, status: DepartmentStatus) => void;
  buildDepartmentTree: () => void;
  
  // Department member actions
  setDepartmentMembers: (departmentId: string, members: DepartmentMember[]) => void;
  addDepartmentMember: (member: DepartmentMember) => void;
  removeDepartmentMember: (departmentId: string, userId: string) => void;
  setMemberAsPrimary: (departmentId: string, userId: string) => void;
  
  // Position actions
  setPositions: (positions: Position[]) => void;
  addPosition: (dto: CreatePositionDto) => void;
  updatePosition: (id: string, dto: UpdatePositionDto) => void;
  deletePosition: (id: string) => void;
  
  // Hierarchy actions
  setHierarchyNodes: (nodes: HierarchyNode[]) => void;
  updateHierarchyNode: (userId: string, updates: Partial<HierarchyNode>) => void;
  
  // Approval chain actions
  setApprovalChains: (chains: ApprovalChain[]) => void;
  addApprovalChain: (chain: ApprovalChain) => void;
  updateApprovalChain: (id: string, updates: Partial<ApprovalChain>) => void;
  deleteApprovalChain: (id: string) => void;
  
  // Workflow trigger actions
  setWorkflowTriggers: (triggers: WorkflowTrigger[]) => void;
  addWorkflowTrigger: (trigger: WorkflowTrigger) => void;
  updateWorkflowTrigger: (id: string, updates: Partial<WorkflowTrigger>) => void;
  deleteWorkflowTrigger: (id: string) => void;
  
  // UI actions
  setSelectedDepartmentId: (id: string | null) => void;
  setSelectedPositionId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type OrganizationStore = OrganizationState & OrganizationActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: OrganizationState = {
  currentOrganization: null,
  departments: [],
  departmentTree: [],
  departmentMembers: new Map(),
  positions: [],
  hierarchyNodes: [],
  approvalChains: [],
  workflowTriggers: [],
  selectedDepartmentId: null,
  selectedPositionId: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Build department tree from flat list
 */
function buildTree(
  departments: Department[],
  parentId: string | null = null,
  depth: number = 0,
  path: string[] = []
): DepartmentTreeNode[] {
  return departments
    .filter((d) => d.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map((dept) => {
      const currentPath = [...path, dept.id];
      return {
        ...dept,
        depth,
        path: currentPath,
        children: buildTree(departments, dept.id, depth + 1, currentPath),
      };
    });
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useOrganizationStore = create<OrganizationStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // ============================================
          // ORGANIZATION ACTIONS
          // ============================================

          setCurrentOrganization: (org) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.currentOrganization = org as WritableDraft<Organization> | null;
              },
              false,
              'organization/setCurrentOrganization'
            );
          },

          updateOrganization: (updates) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization, updates);
                  state.currentOrganization.updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateOrganization'
            );
          },

          updateSettings: (settings) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization.settings, settings);
                  state.currentOrganization.updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateSettings'
            );
          },

          updateBranding: (branding) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization.settings.branding, branding);
                  state.currentOrganization.updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateBranding'
            );
          },

          updateSecurity: (security) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization.settings.security, security);
                  state.currentOrganization.updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateSecurity'
            );
          },

          updateNotifications: (notifications) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization.settings.notifications, notifications);
                  state.currentOrganization.updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateNotifications'
            );
          },

          updateStorageQuota: (quota) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                if (state.currentOrganization) {
                  Object.assign(state.currentOrganization.storageQuota, quota);
                }
              },
              false,
              'organization/updateStorageQuota'
            );
          },

          // ============================================
          // DEPARTMENT ACTIONS
          // ============================================

          setDepartments: (departments) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.departments = departments as WritableDraft<Department>[];
                state.departmentTree = buildTree(departments) as WritableDraft<DepartmentTreeNode>[];
              },
              false,
              'organization/setDepartments'
            );
          },

          addDepartment: (dto) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const orgId = state.currentOrganization?.id || '';
                const newDept: Department = {
                  id: generateId(),
                  organizationId: orgId,
                  name: dto.name,
                  code: dto.code,
                  description: dto.description,
                  parentId: dto.parentId,
                  managerId: dto.managerId,
                  status: 'ACTIVE' as DepartmentStatus,
                  order: state.departments.filter((d) => d.parentId === dto.parentId).length,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                state.departments.push(newDept as WritableDraft<Department>);
                state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
              },
              false,
              'organization/addDepartment'
            );
          },

          updateDepartment: (id, dto) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.departments.findIndex((d) => d.id === id);
                if (index !== -1) {
                  Object.assign(state.departments[index], dto);
                  state.departments[index].updatedAt = new Date().toISOString();
                  state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
                }
              },
              false,
              'organization/updateDepartment'
            );
          },

          deleteDepartment: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                // Get all descendant IDs
                const getDescendantIds = (parentId: string): string[] => {
                  const children = state.departments.filter((d) => d.parentId === parentId);
                  return children.flatMap((c) => [c.id, ...getDescendantIds(c.id)]);
                };
                const idsToDelete = [id, ...getDescendantIds(id)];
                state.departments = state.departments.filter((d) => !idsToDelete.includes(d.id));
                state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
                
                // Clear members for deleted departments
                idsToDelete.forEach((deptId) => {
                  state.departmentMembers.delete(deptId);
                });
              },
              false,
              'organization/deleteDepartment'
            );
          },

          moveDepartment: (id, newParentId) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.departments.findIndex((d) => d.id === id);
                if (index !== -1) {
                  state.departments[index].parentId = newParentId || undefined;
                  state.departments[index].updatedAt = new Date().toISOString();
                  state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
                }
              },
              false,
              'organization/moveDepartment'
            );
          },

          reorderDepartments: (parentId, orderedIds) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                orderedIds.forEach((id, order) => {
                  const index = state.departments.findIndex((d) => d.id === id);
                  if (index !== -1 && state.departments[index].parentId === parentId) {
                    state.departments[index].order = order;
                  }
                });
                state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
              },
              false,
              'organization/reorderDepartments'
            );
          },

          setDepartmentStatus: (id, status) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.departments.findIndex((d) => d.id === id);
                if (index !== -1) {
                  state.departments[index].status = status;
                  state.departments[index].updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/setDepartmentStatus'
            );
          },

          buildDepartmentTree: () => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.departmentTree = buildTree(state.departments as Department[]) as WritableDraft<DepartmentTreeNode>[];
              },
              false,
              'organization/buildDepartmentTree'
            );
          },

          // ============================================
          // DEPARTMENT MEMBER ACTIONS
          // ============================================

          setDepartmentMembers: (departmentId, members) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.departmentMembers.set(departmentId, members as WritableDraft<DepartmentMember>[]);
              },
              false,
              'organization/setDepartmentMembers'
            );
          },

          addDepartmentMember: (member) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const existing = state.departmentMembers.get(member.departmentId) || [];
                if (!existing.find((m) => m.userId === member.userId)) {
                  state.departmentMembers.set(member.departmentId, [...existing, member] as WritableDraft<DepartmentMember>[]);
                }
              },
              false,
              'organization/addDepartmentMember'
            );
          },

          removeDepartmentMember: (departmentId, userId) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const existing = state.departmentMembers.get(departmentId) || [];
                state.departmentMembers.set(
                  departmentId,
                  existing.filter((m) => m.userId !== userId) as WritableDraft<DepartmentMember>[]
                );
              },
              false,
              'organization/removeDepartmentMember'
            );
          },

          setMemberAsPrimary: (departmentId, userId) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const members = state.departmentMembers.get(departmentId) || [];
                members.forEach((m) => {
                  m.isPrimary = m.userId === userId;
                });
              },
              false,
              'organization/setMemberAsPrimary'
            );
          },

          // ============================================
          // POSITION ACTIONS
          // ============================================

          setPositions: (positions) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.positions = positions as WritableDraft<Position>[];
              },
              false,
              'organization/setPositions'
            );
          },

          addPosition: (dto) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const orgId = state.currentOrganization?.id || '';
                const newPos: Position = {
                  id: generateId(),
                  organizationId: orgId,
                  ...dto,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                state.positions.push(newPos as WritableDraft<Position>);
              },
              false,
              'organization/addPosition'
            );
          },

          updatePosition: (id, dto) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.positions.findIndex((p) => p.id === id);
                if (index !== -1) {
                  Object.assign(state.positions[index], dto);
                  state.positions[index].updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updatePosition'
            );
          },

          deletePosition: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.positions = state.positions.filter((p) => p.id !== id);
              },
              false,
              'organization/deletePosition'
            );
          },

          // ============================================
          // HIERARCHY ACTIONS
          // ============================================

          setHierarchyNodes: (nodes) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.hierarchyNodes = nodes as WritableDraft<HierarchyNode>[];
              },
              false,
              'organization/setHierarchyNodes'
            );
          },

          updateHierarchyNode: (userId, updates) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.hierarchyNodes.findIndex((n) => n.userId === userId);
                if (index !== -1) {
                  Object.assign(state.hierarchyNodes[index], updates);
                }
              },
              false,
              'organization/updateHierarchyNode'
            );
          },

          // ============================================
          // APPROVAL CHAIN ACTIONS
          // ============================================

          setApprovalChains: (chains) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.approvalChains = chains as WritableDraft<ApprovalChain>[];
              },
              false,
              'organization/setApprovalChains'
            );
          },

          addApprovalChain: (chain) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.approvalChains.push(chain as WritableDraft<ApprovalChain>);
              },
              false,
              'organization/addApprovalChain'
            );
          },

          updateApprovalChain: (id, updates) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.approvalChains.findIndex((c) => c.id === id);
                if (index !== -1) {
                  Object.assign(state.approvalChains[index], updates);
                  state.approvalChains[index].updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateApprovalChain'
            );
          },

          deleteApprovalChain: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.approvalChains = state.approvalChains.filter((c) => c.id !== id);
              },
              false,
              'organization/deleteApprovalChain'
            );
          },

          // ============================================
          // WORKFLOW TRIGGER ACTIONS
          // ============================================

          setWorkflowTriggers: (triggers) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.workflowTriggers = triggers as WritableDraft<WorkflowTrigger>[];
              },
              false,
              'organization/setWorkflowTriggers'
            );
          },

          addWorkflowTrigger: (trigger) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.workflowTriggers.push(trigger as WritableDraft<WorkflowTrigger>);
              },
              false,
              'organization/addWorkflowTrigger'
            );
          },

          updateWorkflowTrigger: (id, updates) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                const index = state.workflowTriggers.findIndex((t) => t.id === id);
                if (index !== -1) {
                  Object.assign(state.workflowTriggers[index], updates);
                  state.workflowTriggers[index].updatedAt = new Date().toISOString();
                }
              },
              false,
              'organization/updateWorkflowTrigger'
            );
          },

          deleteWorkflowTrigger: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.workflowTriggers = state.workflowTriggers.filter((t) => t.id !== id);
              },
              false,
              'organization/deleteWorkflowTrigger'
            );
          },

          // ============================================
          // UI ACTIONS
          // ============================================

          setSelectedDepartmentId: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.selectedDepartmentId = id;
              },
              false,
              'organization/setSelectedDepartmentId'
            );
          },

          setSelectedPositionId: (id) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.selectedPositionId = id;
              },
              false,
              'organization/setSelectedPositionId'
            );
          },

          setLoading: (loading) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.isLoading = loading;
              },
              false,
              'organization/setLoading'
            );
          },

          setError: (error) => {
            set(
              (state: WritableDraft<OrganizationState>) => {
                state.error = error;
              },
              false,
              'organization/setError'
            );
          },

          reset: () => {
            set(
              () => initialState,
              false,
              'organization/reset'
            );
          },
        }))
      ),
      {
        name: 'organization-storage',
        partialize: (state) => ({
          currentOrganization: state.currentOrganization,
          departments: state.departments,
          positions: state.positions,
        }),
      }
    ),
    { name: 'OrganizationStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Get organization settings */
export const selectOrganizationSettings = (state: OrganizationStore) =>
  state.currentOrganization?.settings;

/** Get department by ID */
export const selectDepartmentById = (id: string) => (state: OrganizationStore) =>
  state.departments.find((d) => d.id === id);

/** Get position by ID */
export const selectPositionById = (id: string) => (state: OrganizationStore) =>
  state.positions.find((p) => p.id === id);

/** Get root departments (no parent) */
export const selectRootDepartments = (state: OrganizationStore) =>
  state.departments.filter((d) => !d.parentId);

/** Get children of a department */
export const selectDepartmentChildren = (parentId: string) => (state: OrganizationStore) =>
  state.departments.filter((d) => d.parentId === parentId);

/** Get department members */
export const selectDepartmentMembers = (departmentId: string) => (state: OrganizationStore) =>
  state.departmentMembers.get(departmentId) || [];

/** Get active approval chains */
export const selectActiveApprovalChains = (state: OrganizationStore) =>
  state.approvalChains.filter((c) => c.isActive);

/** Get active workflow triggers */
export const selectActiveWorkflowTriggers = (state: OrganizationStore) =>
  state.workflowTriggers.filter((t) => t.isActive);

/** Get storage usage percentage */
export const selectStorageUsagePercent = (state: OrganizationStore) => {
  const quota = state.currentOrganization?.storageQuota;
  if (!quota || quota.totalBytes === 0) return 0;
  return Math.round((quota.usedBytes / quota.totalBytes) * 100);
};

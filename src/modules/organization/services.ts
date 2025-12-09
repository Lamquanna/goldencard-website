// ============================================================================
// ORGANIZATION/COMPANY SETTINGS MODULE - API SERVICES
// GoldenEnergy HOME Platform - Organization API Layer
// ============================================================================

import { api, createCrudApi, type QueryParams, type PaginatedResponse } from '@/core/api';
import type {
  Organization,
  OrganizationSettings,
  Department,
  Position,
  ApprovalChain,
  WorkflowTrigger,
  DepartmentMember,
  HierarchyNode,
  StorageQuota,
  BrandingSettings,
  SecuritySettings,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreatePositionDto,
  UpdatePositionDto,
} from './types';

// ============================================================================
// ORGANIZATION SERVICE
// ============================================================================

export class OrganizationService {
  private basePath = '/organizations';

  /**
   * Get current organization
   */
  async getCurrentOrganization(): Promise<Organization> {
    return api.get<Organization>(`${this.basePath}/current`);
  }

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<Organization> {
    return api.get<Organization>(`${this.basePath}/${id}`);
  }

  /**
   * Get organization by slug
   */
  async getBySlug(slug: string): Promise<Organization> {
    return api.get<Organization>(`${this.basePath}/slug/${slug}`);
  }

  /**
   * Create organization
   */
  async create(dto: CreateOrganizationDto): Promise<Organization> {
    return api.post<Organization>(this.basePath, dto);
  }

  /**
   * Update organization
   */
  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    return api.put<Organization>(`${this.basePath}/${id}`, dto);
  }

  /**
   * Update organization logo
   */
  async updateLogo(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post<{ url: string }>(`${this.basePath}/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  /**
   * Delete organization (soft delete)
   */
  async delete(id: string): Promise<void> {
    return api.delete(`${this.basePath}/${id}`);
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Get organization settings
   */
  async getSettings(organizationId: string): Promise<OrganizationSettings> {
    return api.get<OrganizationSettings>(`${this.basePath}/${organizationId}/settings`);
  }

  /**
   * Update organization settings
   */
  async updateSettings(
    organizationId: string,
    dto: UpdateOrganizationSettingsDto
  ): Promise<OrganizationSettings> {
    return api.patch<OrganizationSettings>(
      `${this.basePath}/${organizationId}/settings`,
      dto
    );
  }

  /**
   * Update branding settings
   */
  async updateBranding(
    organizationId: string,
    branding: Partial<BrandingSettings>
  ): Promise<BrandingSettings> {
    return api.patch<BrandingSettings>(
      `${this.basePath}/${organizationId}/settings/branding`,
      branding
    );
  }

  /**
   * Update security settings
   */
  async updateSecurity(
    organizationId: string,
    security: Partial<SecuritySettings>
  ): Promise<SecuritySettings> {
    return api.patch<SecuritySettings>(
      `${this.basePath}/${organizationId}/settings/security`,
      security
    );
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(
    organizationId: string,
    section?: 'branding' | 'security' | 'notifications' | 'all'
  ): Promise<OrganizationSettings> {
    return api.post<OrganizationSettings>(
      `${this.basePath}/${organizationId}/settings/reset`,
      { section }
    );
  }

  // ============================================
  // STORAGE
  // ============================================

  /**
   * Get storage quota
   */
  async getStorageQuota(organizationId: string): Promise<StorageQuota> {
    return api.get<StorageQuota>(`${this.basePath}/${organizationId}/storage`);
  }

  /**
   * Request storage increase
   */
  async requestStorageIncrease(
    organizationId: string,
    requestedBytes: number,
    reason: string
  ): Promise<{ requestId: string }> {
    return api.post<{ requestId: string }>(
      `${this.basePath}/${organizationId}/storage/request-increase`,
      { requestedBytes, reason }
    );
  }
}

// ============================================================================
// DEPARTMENT SERVICE
// ============================================================================

export class DepartmentService {
  private basePath = '/departments';
  private crud = createCrudApi<Department, CreateDepartmentDto, UpdateDepartmentDto>(
    api,
    this.basePath
  );

  /**
   * Get all departments with pagination
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Department>> {
    return this.crud.getAll(params);
  }

  /**
   * Get all departments (flat list, no pagination)
   */
  async getAllFlat(organizationId: string): Promise<Department[]> {
    return api.get<Department[]>(`${this.basePath}/organization/${organizationId}/all`);
  }

  /**
   * Get department tree structure
   */
  async getTree(organizationId: string): Promise<Department[]> {
    return api.get<Department[]>(`${this.basePath}/organization/${organizationId}/tree`);
  }

  /**
   * Get department by ID
   */
  async getById(id: string): Promise<Department> {
    return this.crud.getById(id);
  }

  /**
   * Create department
   */
  async create(dto: CreateDepartmentDto): Promise<Department> {
    return this.crud.create(dto);
  }

  /**
   * Update department
   */
  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    return this.crud.update(id, dto);
  }

  /**
   * Delete department
   */
  async delete(id: string): Promise<void> {
    return this.crud.delete(id);
  }

  /**
   * Move department to new parent
   */
  async move(id: string, newParentId: string | null): Promise<Department> {
    return api.patch<Department>(`${this.basePath}/${id}/move`, { newParentId });
  }

  /**
   * Reorder departments
   */
  async reorder(parentId: string | null, orderedIds: string[]): Promise<void> {
    return api.patch(`${this.basePath}/reorder`, { parentId, orderedIds });
  }

  // ============================================
  // DEPARTMENT MEMBERS
  // ============================================

  /**
   * Get department members
   */
  async getMembers(departmentId: string): Promise<DepartmentMember[]> {
    return api.get<DepartmentMember[]>(`${this.basePath}/${departmentId}/members`);
  }

  /**
   * Add member to department
   */
  async addMember(
    departmentId: string,
    userId: string,
    role: 'manager' | 'member',
    isPrimary: boolean = false
  ): Promise<DepartmentMember> {
    return api.post<DepartmentMember>(`${this.basePath}/${departmentId}/members`, {
      userId,
      role,
      isPrimary,
    });
  }

  /**
   * Remove member from department
   */
  async removeMember(departmentId: string, userId: string): Promise<void> {
    return api.delete(`${this.basePath}/${departmentId}/members/${userId}`);
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    departmentId: string,
    userId: string,
    role: 'manager' | 'member'
  ): Promise<DepartmentMember> {
    return api.patch<DepartmentMember>(
      `${this.basePath}/${departmentId}/members/${userId}`,
      { role }
    );
  }

  /**
   * Set member as primary
   */
  async setMemberAsPrimary(
    departmentId: string,
    userId: string
  ): Promise<DepartmentMember> {
    return api.patch<DepartmentMember>(
      `${this.basePath}/${departmentId}/members/${userId}/primary`
    );
  }
}

// ============================================================================
// POSITION SERVICE
// ============================================================================

export class PositionService {
  private basePath = '/positions';
  private crud = createCrudApi<Position, CreatePositionDto, UpdatePositionDto>(
    api,
    this.basePath
  );

  /**
   * Get all positions
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<Position>> {
    return this.crud.getAll(params);
  }

  /**
   * Get position by ID
   */
  async getById(id: string): Promise<Position> {
    return this.crud.getById(id);
  }

  /**
   * Get positions by department
   */
  async getByDepartment(departmentId: string): Promise<Position[]> {
    return api.get<Position[]>(`${this.basePath}/department/${departmentId}`);
  }

  /**
   * Create position
   */
  async create(dto: CreatePositionDto): Promise<Position> {
    return this.crud.create(dto);
  }

  /**
   * Update position
   */
  async update(id: string, dto: UpdatePositionDto): Promise<Position> {
    return this.crud.update(id, dto);
  }

  /**
   * Delete position
   */
  async delete(id: string): Promise<void> {
    return this.crud.delete(id);
  }
}

// ============================================================================
// HIERARCHY SERVICE
// ============================================================================

export class HierarchyService {
  private basePath = '/hierarchy';

  /**
   * Get organization hierarchy
   */
  async getHierarchy(organizationId: string): Promise<HierarchyNode[]> {
    return api.get<HierarchyNode[]>(`${this.basePath}/organization/${organizationId}`);
  }

  /**
   * Get user's hierarchy node
   */
  async getUserHierarchy(userId: string): Promise<HierarchyNode> {
    return api.get<HierarchyNode>(`${this.basePath}/user/${userId}`);
  }

  /**
   * Get user's direct reports
   */
  async getDirectReports(userId: string): Promise<HierarchyNode[]> {
    return api.get<HierarchyNode[]>(`${this.basePath}/user/${userId}/reports`);
  }

  /**
   * Get user's reporting chain (managers)
   */
  async getReportingChain(userId: string): Promise<HierarchyNode[]> {
    return api.get<HierarchyNode[]>(`${this.basePath}/user/${userId}/chain`);
  }

  /**
   * Update user's hierarchy
   */
  async updateUserHierarchy(
    userId: string,
    updates: Partial<HierarchyNode>
  ): Promise<HierarchyNode> {
    return api.patch<HierarchyNode>(`${this.basePath}/user/${userId}`, updates);
  }

  /**
   * Assign user to position
   */
  async assignPosition(
    userId: string,
    positionId: string,
    reportsTo?: string
  ): Promise<HierarchyNode> {
    return api.post<HierarchyNode>(`${this.basePath}/assign`, {
      userId,
      positionId,
      reportsTo,
    });
  }
}

// ============================================================================
// APPROVAL CHAIN SERVICE
// ============================================================================

export class ApprovalChainService {
  private basePath = '/approval-chains';
  private crud = createCrudApi<ApprovalChain, Omit<ApprovalChain, 'id' | 'createdAt' | 'updatedAt'>>(
    api,
    this.basePath
  );

  /**
   * Get all approval chains
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<ApprovalChain>> {
    return this.crud.getAll(params);
  }

  /**
   * Get approval chain by ID
   */
  async getById(id: string): Promise<ApprovalChain> {
    return this.crud.getById(id);
  }

  /**
   * Get approval chains by workflow type
   */
  async getByWorkflowType(workflowType: string): Promise<ApprovalChain[]> {
    return api.get<ApprovalChain[]>(`${this.basePath}/workflow/${workflowType}`);
  }

  /**
   * Create approval chain
   */
  async create(
    chain: Omit<ApprovalChain, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApprovalChain> {
    return this.crud.create(chain);
  }

  /**
   * Update approval chain
   */
  async update(id: string, updates: Partial<ApprovalChain>): Promise<ApprovalChain> {
    return this.crud.update(id, updates);
  }

  /**
   * Delete approval chain
   */
  async delete(id: string): Promise<void> {
    return this.crud.delete(id);
  }

  /**
   * Toggle approval chain active status
   */
  async toggleActive(id: string): Promise<ApprovalChain> {
    return api.patch<ApprovalChain>(`${this.basePath}/${id}/toggle-active`);
  }

  /**
   * Clone approval chain
   */
  async clone(id: string, newName: string): Promise<ApprovalChain> {
    return api.post<ApprovalChain>(`${this.basePath}/${id}/clone`, { name: newName });
  }
}

// ============================================================================
// WORKFLOW TRIGGER SERVICE
// ============================================================================

export class WorkflowTriggerService {
  private basePath = '/workflow-triggers';
  private crud = createCrudApi<WorkflowTrigger, Omit<WorkflowTrigger, 'id' | 'createdAt' | 'updatedAt'>>(
    api,
    this.basePath
  );

  /**
   * Get all workflow triggers
   */
  async getAll(params?: QueryParams): Promise<PaginatedResponse<WorkflowTrigger>> {
    return this.crud.getAll(params);
  }

  /**
   * Get workflow trigger by ID
   */
  async getById(id: string): Promise<WorkflowTrigger> {
    return this.crud.getById(id);
  }

  /**
   * Get triggers by event type
   */
  async getByEventType(eventType: string): Promise<WorkflowTrigger[]> {
    return api.get<WorkflowTrigger[]>(`${this.basePath}/event/${eventType}`);
  }

  /**
   * Create workflow trigger
   */
  async create(
    trigger: Omit<WorkflowTrigger, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorkflowTrigger> {
    return this.crud.create(trigger);
  }

  /**
   * Update workflow trigger
   */
  async update(id: string, updates: Partial<WorkflowTrigger>): Promise<WorkflowTrigger> {
    return this.crud.update(id, updates);
  }

  /**
   * Delete workflow trigger
   */
  async delete(id: string): Promise<void> {
    return this.crud.delete(id);
  }

  /**
   * Toggle trigger active status
   */
  async toggleActive(id: string): Promise<WorkflowTrigger> {
    return api.patch<WorkflowTrigger>(`${this.basePath}/${id}/toggle-active`);
  }

  /**
   * Test trigger with sample data
   */
  async testTrigger(
    id: string,
    sampleData: Record<string, unknown>
  ): Promise<{ matched: boolean; workflowId?: string }> {
    return api.post<{ matched: boolean; workflowId?: string }>(
      `${this.basePath}/${id}/test`,
      sampleData
    );
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const organizationService = new OrganizationService();
export const departmentService = new DepartmentService();
export const positionService = new PositionService();
export const hierarchyService = new HierarchyService();
export const approvalChainService = new ApprovalChainService();
export const workflowTriggerService = new WorkflowTriggerService();

// ============================================================================
// API LAYER - CRUD WRAPPER
// GoldenEnergy HOME Platform - Generic CRUD Operations
// ============================================================================

import { BaseAPI } from './base-api';
import {
  CrudApi,
  QueryParams,
  PaginatedResponse,
  BulkOperationResult,
  buildQueryString,
} from './types';

// ============================================================================
// CRUD API WRAPPER
// ============================================================================

/**
 * Generic CRUD API wrapper
 * Provides standard CRUD operations for any entity type
 */
export function createCrudApi<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  api: BaseAPI,
  resourcePath: string
): CrudApi<T, CreateDto, UpdateDto> & {
  bulkCreate: (items: CreateDto[]) => Promise<BulkOperationResult>;
  bulkUpdate: (items: Array<{ id: string; data: UpdateDto }>) => Promise<BulkOperationResult>;
  bulkDelete: (ids: string[]) => Promise<BulkOperationResult>;
  search: (query: string, params?: QueryParams) => Promise<PaginatedResponse<T>>;
  exists: (id: string) => Promise<boolean>;
  count: (filters?: QueryParams['filters']) => Promise<number>;
} {
  return {
    /**
     * Get all items with pagination and filtering
     */
    async getAll(params?: QueryParams): Promise<PaginatedResponse<T>> {
      const queryString = params ? buildQueryString(params) : '';
      const url = queryString ? `${resourcePath}?${queryString}` : resourcePath;
      return api.get<PaginatedResponse<T>>(url);
    },

    /**
     * Get single item by ID
     */
    async getById(id: string): Promise<T> {
      return api.get<T>(`${resourcePath}/${id}`);
    },

    /**
     * Create new item
     */
    async create(data: CreateDto): Promise<T> {
      return api.post<T>(resourcePath, data);
    },

    /**
     * Update existing item
     */
    async update(id: string, data: UpdateDto): Promise<T> {
      return api.put<T>(`${resourcePath}/${id}`, data);
    },

    /**
     * Delete item
     */
    async delete(id: string): Promise<void> {
      return api.delete(`${resourcePath}/${id}`);
    },

    /**
     * Bulk create items
     */
    async bulkCreate(items: CreateDto[]): Promise<BulkOperationResult> {
      return api.post<BulkOperationResult>(`${resourcePath}/bulk`, { items });
    },

    /**
     * Bulk update items
     */
    async bulkUpdate(
      items: Array<{ id: string; data: UpdateDto }>
    ): Promise<BulkOperationResult> {
      return api.put<BulkOperationResult>(`${resourcePath}/bulk`, { items });
    },

    /**
     * Bulk delete items
     */
    async bulkDelete(ids: string[]): Promise<BulkOperationResult> {
      return api.delete<BulkOperationResult>(`${resourcePath}/bulk`, {
        body: { ids },
      });
    },

    /**
     * Search items
     */
    async search(query: string, params?: QueryParams): Promise<PaginatedResponse<T>> {
      const searchParams = { ...params, search: query };
      const queryString = buildQueryString(searchParams);
      return api.get<PaginatedResponse<T>>(`${resourcePath}?${queryString}`);
    },

    /**
     * Check if item exists
     */
    async exists(id: string): Promise<boolean> {
      try {
        // Use GET instead of HEAD since BaseAPI doesn't have head method
        await api.get(`${resourcePath}/${id}`);
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Count items
     */
    async count(filters?: QueryParams['filters']): Promise<number> {
      const params: QueryParams = { filters, limit: 0 };
      const queryString = buildQueryString(params);
      const response = await api.get<{ count: number }>(
        `${resourcePath}/count?${queryString}`
      );
      return response.count;
    },
  };
}

// ============================================================================
// CRUD API WITH SOFT DELETE
// ============================================================================

/**
 * CRUD API with soft delete support
 */
export function createSoftDeleteCrudApi<T extends { deletedAt?: string | null }, CreateDto, UpdateDto = Partial<CreateDto>>(
  api: BaseAPI,
  resourcePath: string
) {
  const baseCrud = createCrudApi<T, CreateDto, UpdateDto>(api, resourcePath);

  return {
    ...baseCrud,

    /**
     * Get all items including soft-deleted
     */
    async getAllIncludingDeleted(params?: QueryParams): Promise<PaginatedResponse<T>> {
      const queryString = params ? buildQueryString(params) : '';
      const separator = queryString ? '&' : '';
      const url = `${resourcePath}?${queryString}${separator}includeDeleted=true`;
      return api.get<PaginatedResponse<T>>(url);
    },

    /**
     * Soft delete item
     */
    async softDelete(id: string): Promise<T> {
      return api.patch<T>(`${resourcePath}/${id}/soft-delete`);
    },

    /**
     * Restore soft-deleted item
     */
    async restore(id: string): Promise<T> {
      return api.patch<T>(`${resourcePath}/${id}/restore`);
    },

    /**
     * Permanently delete item
     */
    async permanentDelete(id: string): Promise<void> {
      return api.delete(`${resourcePath}/${id}/permanent`);
    },
  };
}

// ============================================================================
// CRUD API WITH VERSIONING
// ============================================================================

/**
 * CRUD API with version control support
 */
export function createVersionedCrudApi<
  T extends { version: number },
  CreateDto,
  UpdateDto = Partial<CreateDto>
>(api: BaseAPI, resourcePath: string) {
  const baseCrud = createCrudApi<T, CreateDto, UpdateDto>(api, resourcePath);

  return {
    ...baseCrud,

    /**
     * Get item version history
     */
    async getVersionHistory(id: string): Promise<T[]> {
      return api.get<T[]>(`${resourcePath}/${id}/versions`);
    },

    /**
     * Get specific version
     */
    async getVersion(id: string, version: number): Promise<T> {
      return api.get<T>(`${resourcePath}/${id}/versions/${version}`);
    },

    /**
     * Restore to specific version
     */
    async restoreVersion(id: string, version: number): Promise<T> {
      return api.post<T>(`${resourcePath}/${id}/versions/${version}/restore`);
    },

    /**
     * Update with optimistic locking
     */
    async updateWithVersion(
      id: string,
      data: UpdateDto,
      expectedVersion: number
    ): Promise<T> {
      return api.put<T>(`${resourcePath}/${id}`, data, {
        headers: { 'If-Match': String(expectedVersion) },
      });
    },
  };
}

// ============================================================================
// NESTED RESOURCE CRUD
// ============================================================================

/**
 * CRUD API for nested resources (e.g., /projects/:projectId/tasks)
 */
export function createNestedCrudApi<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  api: BaseAPI,
  parentPath: string,
  resourcePath: string
) {
  const getFullPath = (parentId: string) => `${parentPath}/${parentId}/${resourcePath}`;

  return {
    /**
     * Get all nested items
     */
    async getAll(parentId: string, params?: QueryParams): Promise<PaginatedResponse<T>> {
      const queryString = params ? buildQueryString(params) : '';
      const url = queryString
        ? `${getFullPath(parentId)}?${queryString}`
        : getFullPath(parentId);
      return api.get<PaginatedResponse<T>>(url);
    },

    /**
     * Get nested item by ID
     */
    async getById(parentId: string, id: string): Promise<T> {
      return api.get<T>(`${getFullPath(parentId)}/${id}`);
    },

    /**
     * Create nested item
     */
    async create(parentId: string, data: CreateDto): Promise<T> {
      return api.post<T>(getFullPath(parentId), data);
    },

    /**
     * Update nested item
     */
    async update(parentId: string, id: string, data: UpdateDto): Promise<T> {
      return api.put<T>(`${getFullPath(parentId)}/${id}`, data);
    },

    /**
     * Delete nested item
     */
    async delete(parentId: string, id: string): Promise<void> {
      return api.delete(`${getFullPath(parentId)}/${id}`);
    },

    /**
     * Move item to different parent
     */
    async move(currentParentId: string, id: string, newParentId: string): Promise<T> {
      return api.patch<T>(`${getFullPath(currentParentId)}/${id}/move`, {
        newParentId,
      });
    },
  };
}

// ============================================================================
// CRUD API FACTORY
// ============================================================================

/**
 * Factory for creating API instances with different features
 */
export class CrudApiFactory {
  constructor(private api: BaseAPI) {}

  /**
   * Create basic CRUD API
   */
  basic<T, CreateDto, UpdateDto = Partial<CreateDto>>(resourcePath: string) {
    return createCrudApi<T, CreateDto, UpdateDto>(this.api, resourcePath);
  }

  /**
   * Create CRUD API with soft delete
   */
  withSoftDelete<T extends { deletedAt?: string | null }, CreateDto, UpdateDto = Partial<CreateDto>>(
    resourcePath: string
  ) {
    return createSoftDeleteCrudApi<T, CreateDto, UpdateDto>(this.api, resourcePath);
  }

  /**
   * Create versioned CRUD API
   */
  withVersioning<T extends { version: number }, CreateDto, UpdateDto = Partial<CreateDto>>(
    resourcePath: string
  ) {
    return createVersionedCrudApi<T, CreateDto, UpdateDto>(this.api, resourcePath);
  }

  /**
   * Create nested resource CRUD API
   */
  nested<T, CreateDto, UpdateDto = Partial<CreateDto>>(
    parentPath: string,
    resourcePath: string
  ) {
    return createNestedCrudApi<T, CreateDto, UpdateDto>(
      this.api,
      parentPath,
      resourcePath
    );
  }
}

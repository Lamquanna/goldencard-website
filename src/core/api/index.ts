// ============================================================================
// API LAYER - INDEX (BARREL EXPORTS)
// GoldenEnergy HOME Platform - API Layer Entry Point
// ============================================================================

// Base API
export { BaseAPI } from './base-api';

// Types
export {
  type RequestConfig,
  type ApiResponse,
  type ApiError as ApiErrorType,
  type PaginatedResponse,
  type PaginationMeta,
  type SortConfig,
  type FilterConfig,
  type FilterOperator,
  type QueryParams,
  type CrudApi,
  type BulkOperationResult,
  type UploadProgressCallback,
  type UploadProgress,
  type UploadResult,
  type RetryConfig,
  type CacheEntry,
  type CacheConfig,
  DEFAULT_RETRY_CONFIG,
  DEFAULT_CACHE_CONFIG,
  buildQueryString,
} from './types';

// CRUD Wrapper
export {
  createCrudApi,
  createSoftDeleteCrudApi,
  createVersionedCrudApi,
  createNestedCrudApi,
  CrudApiFactory,
} from './crud-wrapper';

// Error Handling
export {
  API_ERROR_CODES,
  type ApiErrorCode,
  ApiError,
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  RateLimitError,
  ServerError,
  createErrorFromStatus,
  createErrorFromResponse,
  type ErrorInterceptor,
  ErrorInterceptorChain,
  logErrorHandler,
  createToastErrorHandler,
  createAuthErrorHandler,
  isApiError,
  getErrorMessage,
  safeAsync,
  retryWithBackoff,
} from './error-handling';

// ============================================================================
// DEFAULT API INSTANCE
// ============================================================================

import { BaseAPI } from './base-api';

/** Default API instance for the application */
export const api = new BaseAPI(process.env.NEXT_PUBLIC_API_URL || '/api');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

import { CrudApiFactory } from './crud-wrapper';

/** CRUD factory using default API instance */
export const crudFactory = new CrudApiFactory(api);

/**
 * Quick helper to create a typed API endpoint
 */
export function createEndpoint<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  path: string
) {
  return crudFactory.basic<T, CreateDto, UpdateDto>(path);
}

/**
 * Quick helper to create a typed API endpoint with soft delete
 */
export function createSoftDeleteEndpoint<
  T extends { deletedAt?: string | null },
  CreateDto,
  UpdateDto = Partial<CreateDto>
>(path: string) {
  return crudFactory.withSoftDelete<T, CreateDto, UpdateDto>(path);
}

/**
 * Quick helper to create a versioned API endpoint
 */
export function createVersionedEndpoint<
  T extends { version: number },
  CreateDto,
  UpdateDto = Partial<CreateDto>
>(path: string) {
  return crudFactory.withVersioning<T, CreateDto, UpdateDto>(path);
}

/**
 * Quick helper to create a nested API endpoint
 */
export function createNestedEndpoint<T, CreateDto, UpdateDto = Partial<CreateDto>>(
  parentPath: string,
  resourcePath: string
) {
  return crudFactory.nested<T, CreateDto, UpdateDto>(parentPath, resourcePath);
}

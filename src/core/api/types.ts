// ============================================================================
// API LAYER - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - API Types
// ============================================================================

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/** API request configuration */
export interface RequestConfig {
  /** Query parameters */
  params?: Record<string, unknown>;
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: unknown;
  /** Skip authentication */
  skipAuth?: boolean;
  /** Response type */
  responseType?: 'json' | 'blob' | 'text';
  /** Abort signal */
  signal?: AbortSignal;
  /** Request timeout in ms */
  timeout?: number;
}

/** API response wrapper */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers?: Headers;
}

/** API error */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Sort configuration */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/** Filter configuration */
export interface FilterConfig {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

/** Filter operators */
export type FilterOperator = 
  | 'eq'      // equals
  | 'ne'      // not equals
  | 'gt'      // greater than
  | 'gte'     // greater than or equal
  | 'lt'      // less than
  | 'lte'     // less than or equal
  | 'in'      // in array
  | 'nin'     // not in array
  | 'like'    // contains
  | 'ilike'   // contains (case insensitive)
  | 'between' // between range
  | 'null'    // is null
  | 'nnull';  // is not null

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

/** Query parameters for list endpoints */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: SortConfig | SortConfig[];
  filters?: FilterConfig[];
  search?: string;
  include?: string[];
  fields?: string[];
}

/** Build query string from params */
export function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  if (params.sort) {
    const sorts = Array.isArray(params.sort) ? params.sort : [params.sort];
    sorts.forEach((s, i) => {
      searchParams.set(`sort[${i}][field]`, s.field);
      searchParams.set(`sort[${i}][direction]`, s.direction);
    });
  }

  if (params.filters) {
    params.filters.forEach((f, i) => {
      searchParams.set(`filter[${i}][field]`, f.field);
      searchParams.set(`filter[${i}][operator]`, f.operator);
      searchParams.set(`filter[${i}][value]`, String(f.value));
    });
  }

  if (params.include?.length) {
    searchParams.set('include', params.include.join(','));
  }

  if (params.fields?.length) {
    searchParams.set('fields', params.fields.join(','));
  }

  return searchParams.toString();
}

// ============================================================================
// CRUD WRAPPER TYPES
// ============================================================================

/** CRUD API interface */
export interface CrudApi<T, CreateDto, UpdateDto> {
  getAll: (params?: QueryParams) => Promise<PaginatedResponse<T>>;
  getById: (id: string) => Promise<T>;
  create: (data: CreateDto) => Promise<T>;
  update: (id: string, data: UpdateDto) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

/** Bulk operation result */
export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// ============================================================================
// UPLOAD TYPES
// ============================================================================

/** Upload progress callback */
export type UploadProgressCallback = (progress: UploadProgress) => void;

/** Upload progress */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/** Upload result */
export interface UploadResult {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

// ============================================================================
// RETRY CONFIG
// ============================================================================

/** Retry configuration */
export interface RetryConfig {
  /** Maximum number of retries */
  maxRetries: number;
  /** Base delay in ms */
  baseDelay: number;
  /** Maximum delay in ms */
  maxDelay: number;
  /** Retry on these status codes */
  retryOnStatus: number[];
}

/** Default retry configuration */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryOnStatus: [408, 429, 500, 502, 503, 504],
};

// ============================================================================
// CACHE TYPES
// ============================================================================

/** Cache entry */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/** Cache configuration */
export interface CacheConfig {
  /** Enable caching */
  enabled: boolean;
  /** Time to live in ms */
  ttl: number;
  /** Cache key prefix */
  prefix: string;
}

/** Default cache configuration */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enabled: true,
  ttl: 5 * 60 * 1000, // 5 minutes
  prefix: 'api_cache_',
};

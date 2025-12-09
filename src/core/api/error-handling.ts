// ============================================================================
// API LAYER - ERROR HANDLING
// GoldenEnergy HOME Platform - Error Types and Handlers
// ============================================================================

// ============================================================================
// ERROR CODES
// ============================================================================

/** API error codes */
export const API_ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  ABORTED: 'ABORTED',

  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  GATEWAY_TIMEOUT: 'GATEWAY_TIMEOUT',

  // Business errors
  RESOURCE_LOCKED: 'RESOURCE_LOCKED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  OPERATION_FAILED: 'OPERATION_FAILED',

  // Unknown
  UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

// ============================================================================
// ERROR CLASSES
// ============================================================================

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly requestId?: string;

  constructor(
    message: string,
    code: ApiErrorCode = API_ERROR_CODES.UNKNOWN,
    status: number = 500,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date();
    this.requestId = requestId;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      requestId: this.requestId,
    };
  }

  /**
   * Check if error is a specific type
   */
  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Check if error is retryable
   */
  get isRetryable(): boolean {
    return (
      this.code === API_ERROR_CODES.NETWORK_ERROR ||
      this.code === API_ERROR_CODES.TIMEOUT ||
      this.code === API_ERROR_CODES.SERVER_ERROR ||
      this.code === API_ERROR_CODES.SERVICE_UNAVAILABLE ||
      this.code === API_ERROR_CODES.GATEWAY_TIMEOUT
    );
  }

  /**
   * Check if error is auth-related
   */
  get isAuthError(): boolean {
    return (
      this.code === API_ERROR_CODES.UNAUTHORIZED ||
      this.code === API_ERROR_CODES.TOKEN_EXPIRED ||
      this.code === API_ERROR_CODES.INVALID_TOKEN ||
      this.code === API_ERROR_CODES.SESSION_EXPIRED
    );
  }
}

/**
 * Network error (connection failed)
 */
export class NetworkError extends ApiError {
  constructor(message: string = 'Không thể kết nối đến server') {
    super(message, API_ERROR_CODES.NETWORK_ERROR, 0);
    this.name = 'NetworkError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends ApiError {
  constructor(message: string = 'Yêu cầu đã quá thời gian chờ') {
    super(message, API_ERROR_CODES.TIMEOUT, 408);
    this.name = 'TimeoutError';
  }
}

/**
 * Authentication error (401)
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Phiên đăng nhập đã hết hạn') {
    super(message, API_ERROR_CODES.UNAUTHORIZED, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Authorization error (403)
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Bạn không có quyền thực hiện thao tác này') {
    super(message, API_ERROR_CODES.FORBIDDEN, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Không tìm thấy tài nguyên') {
    super(message, API_ERROR_CODES.NOT_FOUND, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends ApiError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string = 'Dữ liệu không hợp lệ',
    fieldErrors: Record<string, string[]> = {}
  ) {
    super(message, API_ERROR_CODES.VALIDATION_ERROR, 400, { fieldErrors });
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }

  /**
   * Get error for specific field
   */
  getFieldError(field: string): string | null {
    return this.fieldErrors[field]?.[0] ?? null;
  }

  /**
   * Check if field has error
   */
  hasFieldError(field: string): boolean {
    return !!this.fieldErrors[field]?.length;
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Dữ liệu đã tồn tại hoặc xung đột') {
    super(message, API_ERROR_CODES.CONFLICT, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends ApiError {
  public readonly retryAfter: number;

  constructor(message: string = 'Quá nhiều yêu cầu, vui lòng thử lại sau', retryAfter: number = 60) {
    super(message, API_ERROR_CODES.RATE_LIMITED, 429, { retryAfter });
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Server error (500)
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Lỗi server, vui lòng thử lại sau') {
    super(message, API_ERROR_CODES.SERVER_ERROR, 500);
    this.name = 'ServerError';
  }
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

/**
 * Create appropriate error from HTTP status code
 */
export function createErrorFromStatus(
  status: number,
  message?: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiError {
  switch (status) {
    case 400:
      return new ValidationError(message || 'Dữ liệu không hợp lệ', details?.fieldErrors as Record<string, string[]>);
    case 401:
      return new UnauthorizedError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError(message);
    case 408:
      return new TimeoutError(message);
    case 409:
      return new ConflictError(message);
    case 429:
      return new RateLimitError(message, details?.retryAfter as number);
    case 500:
      return new ServerError(message);
    case 502:
      return new ApiError(message || 'Bad Gateway', API_ERROR_CODES.SERVER_ERROR, 502, details, requestId);
    case 503:
      return new ApiError(message || 'Service Unavailable', API_ERROR_CODES.SERVICE_UNAVAILABLE, 503, details, requestId);
    case 504:
      return new ApiError(message || 'Gateway Timeout', API_ERROR_CODES.GATEWAY_TIMEOUT, 504, details, requestId);
    default:
      return new ApiError(
        message || 'Đã xảy ra lỗi không xác định',
        status >= 500 ? API_ERROR_CODES.SERVER_ERROR : API_ERROR_CODES.UNKNOWN,
        status,
        details,
        requestId
      );
  }
}

/**
 * Create error from fetch response
 */
export async function createErrorFromResponse(
  response: Response,
  requestId?: string
): Promise<ApiError> {
  let message: string | undefined;
  let details: Record<string, unknown> | undefined;

  try {
    const body = await response.json();
    message = body.message || body.error || body.msg;
    details = body.details || body.errors;
  } catch {
    // Response body is not JSON
    try {
      message = await response.text();
    } catch {
      // Ignore parse errors
    }
  }

  return createErrorFromStatus(response.status, message, details, requestId);
}

// ============================================================================
// ERROR INTERCEPTOR
// ============================================================================

/** Error interceptor function type */
export type ErrorInterceptor = (error: ApiError) => Promise<ApiError | void>;

/**
 * Error interceptor chain
 */
export class ErrorInterceptorChain {
  private interceptors: ErrorInterceptor[] = [];

  /**
   * Add interceptor
   */
  use(interceptor: ErrorInterceptor): () => void {
    this.interceptors.push(interceptor);
    return () => {
      const index = this.interceptors.indexOf(interceptor);
      if (index > -1) {
        this.interceptors.splice(index, 1);
      }
    };
  }

  /**
   * Process error through interceptor chain
   */
  async process(error: ApiError): Promise<ApiError> {
    let currentError: ApiError = error;

    for (const interceptor of this.interceptors) {
      const result = await interceptor(currentError);
      if (result) {
        currentError = result;
      }
    }

    return currentError;
  }

  /**
   * Clear all interceptors
   */
  clear(): void {
    this.interceptors = [];
  }
}

// ============================================================================
// ERROR HANDLERS
// ============================================================================

/**
 * Default error handler that logs errors
 */
export function logErrorHandler(error: ApiError): void {
  console.error('[API Error]', {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.status,
    requestId: error.requestId,
    timestamp: error.timestamp,
    details: error.details,
    stack: error.stack,
  });
}

/**
 * Create toast notification handler
 */
export function createToastErrorHandler(
  showToast: (message: string, type: 'error' | 'warning') => void
): (error: ApiError) => void {
  return (error: ApiError) => {
    // Don't show toast for auth errors (handled separately)
    if (error.isAuthError) return;

    // Show user-friendly message
    showToast(error.message, 'error');
  };
}

/**
 * Create auth error handler for token refresh
 */
export function createAuthErrorHandler(
  onSessionExpired: () => void
): ErrorInterceptor {
  return async (error: ApiError) => {
    if (error.isAuthError) {
      onSessionExpired();
    }
    return error;
  };
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Extract error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Safe error handler wrapper
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logErrorHandler(error instanceof ApiError ? error : new ApiError(getErrorMessage(error)));
    return fallback;
  }
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if error is not retryable
      if (isApiError(error) && !error.isRetryable) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(baseDelay * Math.pow(2, attempt), 10000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

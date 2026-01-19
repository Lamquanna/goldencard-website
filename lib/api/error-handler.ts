// ============================================================================
// API ERROR HANDLER
// GoldenEnergy ERP Platform - Standardized Error Handling
// ============================================================================

import { NextResponse } from 'next/server'

// ============================================================================
// TYPES
// ============================================================================

export interface ApiError {
  success: false
  error: {
    message: string
    code: string
    details?: any
  }
  requestId?: string
}

export interface ApiSuccess<T> {
  success: true
  data: T
  requestId?: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate unique request ID for tracking
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    success: true,
    data,
    requestId,
  })
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  message: string,
  code: ErrorCode = ErrorCodes.INTERNAL_ERROR,
  status: number = 500,
  details?: any,
  requestId?: string
): NextResponse<ApiError> {
  // Log error for monitoring
  console.error(`[API Error ${code}]:`, message, details ? { details } : '')

  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      requestId,
    },
    { status }
  )
}

/**
 * Handle database errors with proper classification
 */
export function handleDatabaseError(
  error: any,
  requestId?: string
): NextResponse<ApiError> {
  // PostgreSQL error codes
  switch (error.code) {
    case '23505': // Unique violation
      return createErrorResponse(
        'A record with this identifier already exists',
        ErrorCodes.CONFLICT,
        409,
        { postgresCode: error.code, constraint: error.constraint },
        requestId
      )

    case '23503': // Foreign key violation
      return createErrorResponse(
        'Referenced resource not found',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { postgresCode: error.code, constraint: error.constraint },
        requestId
      )

    case '23502': // Not null violation
      return createErrorResponse(
        'Required field is missing',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { postgresCode: error.code, column: error.column },
        requestId
      )

    case '22P02': // Invalid text representation
      return createErrorResponse(
        'Invalid data format',
        ErrorCodes.VALIDATION_ERROR,
        400,
        { postgresCode: error.code },
        requestId
      )

    default:
      return createErrorResponse(
        'Database operation failed',
        ErrorCodes.DATABASE_ERROR,
        500,
        process.env.NODE_ENV === 'development' ? { originalError: error.message } : undefined,
        requestId
      )
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[],
  requestId?: string
): NextResponse<ApiError> | null {
  const missingFields = requiredFields.filter(field => {
    const value = body[field]
    return value === undefined || value === null || value === ''
  })

  if (missingFields.length > 0) {
    return createErrorResponse(
      `Missing required fields: ${missingFields.join(', ')}`,
      ErrorCodes.VALIDATION_ERROR,
      400,
      { missingFields },
      requestId
    )
  }

  return null
}

/**
 * Add cache control headers to response
 */
export function addNoCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  return response
}

/**
 * Log API request for monitoring
 */
export function logApiRequest(
  method: string,
  path: string,
  requestId: string,
  startTime: number
) {
  const duration = Date.now() - startTime
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${method} ${path} - ${requestId} (${duration}ms)`);
  }
}

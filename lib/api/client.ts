// ============================================================================
// API CLIENT
// GoldenEnergy ERP Platform - Frontend API Client with Error Handling
// ============================================================================

import { toast } from 'sonner'

// ============================================================================
// TYPES
// ============================================================================

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
  skipErrorToast?: boolean
  retries?: number
  retryDelay?: number
}

export class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ============================================================================
// API CLIENT CLASS
// ============================================================================

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const {
      skipAuth = false,
      skipErrorToast = false,
      retries = 2,
      retryDelay = 1000,
      ...fetchOptions
    } = options

    let lastError: Error | null = null

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        }

        // Merge custom headers
        if (fetchOptions.headers) {
          Object.assign(headers, fetchOptions.headers)
        }

        // Add auth token if available
        if (!skipAuth && typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
        }

        const url = `${this.baseUrl}${endpoint}`

        // Make request
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
        })

        // Parse response
        const data = await response.json()

        // Handle 401 Unauthorized - Token expired or invalid
        if (response.status === 401 && !skipAuth) {
          // Clear auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('erp_token')
            localStorage.removeItem('erp_user')
            localStorage.removeItem('crm_token')
            localStorage.removeItem('crm_user')
            
            // Show error toast
            if (!skipErrorToast) {
              toast.error('Session expired. Please login again.')
            }
            
            // Redirect to login page
            const currentPath = window.location.pathname
            if (currentPath.startsWith('/erp')) {
              window.location.href = '/erp/login'
            } else if (currentPath.startsWith('/admin')) {
              window.location.href = '/admin/login'
            }
          }
          
          const errorMessage = data.error?.message || data.error || 'Authentication required'
          throw new ApiError(
            errorMessage,
            'UNAUTHORIZED',
            401,
            data.error?.details
          )
        }

        // Handle error responses
        if (!response.ok) {
          const errorMessage = data.error?.message || data.error || 'An error occurred'
          const errorCode = data.error?.code || 'UNKNOWN_ERROR'

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            if (!skipErrorToast) {
              toast.error(errorMessage)
            }

            throw new ApiError(
              errorMessage,
              errorCode,
              response.status,
              data.error?.details
            )
          }

          // Retry on server errors (5xx)
          if (attempt < retries) {
            console.warn(`Request failed, retrying (${attempt + 1}/${retries})...`)
            await this.sleep(retryDelay * (attempt + 1))
            continue
          }

          // All retries exhausted
          if (!skipErrorToast) {
            toast.error(errorMessage)
          }

          throw new ApiError(errorMessage, errorCode, response.status, data.error?.details)
        }

        // Handle both response formats: { success: true, data } and direct data
        return data.success !== undefined ? data.data : data

      } catch (error) {
        lastError = error as Error

        // Rethrow ApiError immediately
        if (error instanceof ApiError) {
          throw error
        }

        // Retry on network errors
        if (attempt < retries) {
          console.warn(`Network error, retrying (${attempt + 1}/${retries})...`)
          await this.sleep(retryDelay * (attempt + 1))
          continue
        }
      }
    }

    // All retries failed - network error
    const networkError = new ApiError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0
    )

    if (!skipErrorToast) {
      toast.error(networkError.message)
    }

    throw networkError
  }

  // ============================================================================
  // HTTP METHODS
  // ============================================================================

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const apiClient = new ApiClient()

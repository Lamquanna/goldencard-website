// ============================================================================
// API LAYER - BASE API CLASS
// GoldenEnergy HOME Platform - API Abstraction Layer
// ============================================================================

import { ApiError, ApiResponse, RequestConfig, PaginatedResponse } from './types';

// ============================================================================
// BASE API CLASS
// ============================================================================

export class BaseAPI {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  private tokenRefreshPromise: Promise<string> | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // ====================================================================
  // TOKEN MANAGEMENT
  // ====================================================================

  /**
   * Get current auth token
   */
  protected getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Set auth token
   */
  protected setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get refresh token
   */
  protected getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Clear tokens (logout)
   */
  protected clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Refresh access token
   */
  protected async refreshAccessToken(): Promise<string> {
    // If already refreshing, wait for that promise
    if (this.tokenRefreshPromise) {
      return this.tokenRefreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.tokenRefreshPromise = fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) {
          this.clearTokens();
          throw new Error('Token refresh failed');
        }
        const data = await response.json();
        this.setAuthToken(data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        return data.accessToken;
      })
      .finally(() => {
        this.tokenRefreshPromise = null;
      });

    return this.tokenRefreshPromise;
  }

  // ====================================================================
  // REQUEST HELPERS
  // ====================================================================

  /**
   * Build headers for request
   */
  protected buildHeaders(config?: RequestConfig): HeadersInit {
    const headers: Record<string, string> = { ...this.defaultHeaders };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token && !config?.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge custom headers
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    // Remove Content-Type for FormData
    if (config?.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    return headers;
  }

  /**
   * Build URL with query params
   */
  protected buildUrl(path: string, params?: Record<string, unknown>): string {
    const url = new URL(path.startsWith('http') ? path : `${this.baseUrl}${path}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => url.searchParams.append(key, String(v)));
          } else if (typeof value === 'object') {
            url.searchParams.append(key, JSON.stringify(value));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }

    return url.toString();
  }

  /**
   * Parse error response
   */
  protected async parseError(response: Response): Promise<ApiError> {
    let message = 'An error occurred';
    let code = 'UNKNOWN_ERROR';
    let details: Record<string, unknown> | undefined;

    try {
      const data = await response.json();
      message = data.message || data.error || message;
      code = data.code || code;
      details = data.details || data.errors;
    } catch {
      message = response.statusText || message;
    }

    return {
      message,
      code,
      status: response.status,
      details,
    };
  }

  // ====================================================================
  // CORE REQUEST METHOD
  // ====================================================================

  /**
   * Core fetch method with retry and token refresh
   */
  protected async request<T>(
    method: string,
    path: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, config?.params);
    const headers = this.buildHeaders(config);

    let body: BodyInit | undefined;
    if (config?.body) {
      body = config.body instanceof FormData
        ? config.body
        : JSON.stringify(config.body);
    }

    const fetchConfig: RequestInit = {
      method,
      headers,
      body,
      signal: config?.signal,
    };

    try {
      let response = await fetch(url, fetchConfig);

      // Handle 401 - Try to refresh token
      if (response.status === 401 && !config?.skipAuth) {
        try {
          const newToken = await this.refreshAccessToken();
          
          // Retry request with new token
          const newHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          response = await fetch(url, { ...fetchConfig, headers: newHeaders });
        } catch {
          // Refresh failed, redirect to login
          this.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle non-OK responses
      if (!response.ok) {
        const error = await this.parseError(response);
        throw error;
      }

      // Handle empty responses
      if (response.status === 204) {
        return { data: undefined as T, status: 204 };
      }

      // Handle blob responses
      if (config?.responseType === 'blob') {
        const blob = await response.blob();
        return { data: blob as T, status: response.status };
      }

      // Parse JSON response
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw { message: 'Request cancelled', code: 'CANCELLED', status: 0 };
      }
      throw error;
    }
  }

  // ====================================================================
  // HTTP METHODS
  // ====================================================================

  /**
   * GET request
   */
  async get<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('GET', path, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('POST', path, { ...config, body });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('PUT', path, { ...config, body });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('PATCH', path, { ...config, body });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(path: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>('DELETE', path, config);
    return response.data;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const api = new BaseAPI();

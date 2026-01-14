/**
 * Error Boundary and Error Tracking
 * 
 * Safe error handling for production
 */

import { logger } from './logger';

/**
 * Capture and log unhandled errors
 */
export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', event.reason, {
      action: 'unhandled_rejection',
      promise: String(event.promise),
    });
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    logger.error('Global Error', event.error, {
      action: 'global_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(
        `Error in ${context || fn.name || 'async function'}`,
        error as Error,
        {
          action: 'function_error',
          functionName: context || fn.name,
        }
      );
      throw error;
    }
  }) as T;
}

/**
 * API Error Handler
 */
export function handleApiError(error: any, endpoint: string, method: string = 'GET') {
  const statusCode = error?.response?.status || error?.status || 500;
  const message = error?.message || 'Unknown error';

  logger.apiError(method, endpoint, new Error(message), statusCode);

  // Return user-friendly error
  if (statusCode === 404) {
    return { error: 'Resource not found' };
  } else if (statusCode === 401 || statusCode === 403) {
    return { error: 'Unauthorized access' };
  } else if (statusCode >= 500) {
    return { error: 'Server error, please try again later' };
  } else {
    return { error: 'An error occurred' };
  }
}

/**
 * Safe fetch wrapper with logging
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string; status: number }> {
  const startTime = Date.now();
  const method = options?.method || 'GET';

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    logger.apiRequest(method, url, response.status, duration);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error(`API request failed: ${url}`, new Error(errorText), {
        action: 'api_request_failed',
        method,
        endpoint: url,
        statusCode: response.status,
      });

      return {
        error: `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`API request error: ${url}`, error as Error, {
      action: 'api_request_error',
      method,
      endpoint: url,
      duration,
    });

    return {
      error: 'Network error or invalid response',
      status: 0,
    };
  }
}

/**
 * Monitor performance
 */
export function measurePerformance(name: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    logger.performance(name, Math.round(duration));
    return duration;
  };
}

/**
 * React Error Boundary Component (use in your app)
 */
export class ErrorBoundary extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

/**
 * Production-Safe Logger
 * 
 * Logs errors and important events without exposing sensitive data
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  action?: string;
  endpoint?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: any;
}

class ProductionLogger {
  private isProd = process.env.NODE_ENV === 'production';
  private sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'authorization'];

  /**
   * Sanitize data to remove sensitive information
   */
  private sanitize(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      // Remove sensitive keys
      if (this.sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        sanitized[key] = '[REDACTED]';
        continue;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Format log message
   */
  private format(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? this.sanitize(context) : {};
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitizedContext,
      environment: process.env.NODE_ENV,
    });
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext) {
    if (!this.isProd) {
      console.log(`ℹ️  ${message}`, context);
    } else {
      console.log(this.format('info', message, context));
    }
  }

  /**
   * Log warning
   */
  warn(message: string, context?: LogContext) {
    if (!this.isProd) {
      console.warn(`⚠️  ${message}`, context);
    } else {
      console.warn(this.format('warn', message, context));
    }
  }

  /**
   * Log error - always logs in production
   */
  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorStack: this.isProd ? undefined : error?.stack, // Stack only in dev
      errorName: error?.name,
    };

    if (!this.isProd) {
      console.error(`❌ ${message}`, error, errorContext);
    } else {
      console.error(this.format('error', message, errorContext));
    }
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext) {
    if (!this.isProd) {
      console.debug(`🔍 ${message}`, context);
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, endpoint: string, statusCode: number, duration: number) {
    this.info('API Request', {
      action: 'api_request',
      method,
      endpoint,
      statusCode,
      duration,
    });
  }

  /**
   * Log API error
   */
  apiError(method: string, endpoint: string, error: Error, statusCode?: number) {
    this.error('API Error', error, {
      action: 'api_error',
      method,
      endpoint,
      statusCode,
    });
  }

  /**
   * Log user action
   */
  userAction(userId: string, action: string, metadata?: Record<string, any>) {
    this.info('User Action', {
      action: 'user_action',
      userId,
      actionType: action,
      ...metadata,
    });
  }

  /**
   * Log authentication event
   */
  authEvent(event: 'login' | 'logout' | 'signup' | 'failed', userId?: string) {
    this.info('Auth Event', {
      action: 'auth',
      event,
      userId,
    });
  }

  /**
   * Log performance metric
   */
  performance(metric: string, value: number, unit: string = 'ms') {
    this.info('Performance Metric', {
      action: 'performance',
      metric,
      value,
      unit,
    });
  }

  /**
   * Log business metric
   */
  metric(name: string, value: number, tags?: Record<string, string>) {
    this.info('Business Metric', {
      action: 'metric',
      metricName: name,
      metricValue: value,
      tags,
    });
  }
}

// Export singleton instance
export const logger = new ProductionLogger();

// Export class for testing
export { ProductionLogger };

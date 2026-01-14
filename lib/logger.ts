/**
 * Production Logger Utility
 * Centralized logging with environment-aware behavior
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  requestId?: string;
  userId?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  /**
   * Format log entry for production (JSON) or development (colored console)
   */
  private formatLog(entry: LogEntry): void {
    if (this.isProduction) {
      // Production: JSON format for log aggregation tools (Vercel, Datadog, etc.)
      console.log(JSON.stringify(entry));
    } else {
      // Development: Colored console output
      const colors = {
        debug: '\x1b[36m', // Cyan
        info: '\x1b[32m',  // Green
        warn: '\x1b[33m',  // Yellow
        error: '\x1b[31m', // Red
      };
      const reset = '\x1b[0m';
      const color = colors[entry.level];

      console.log(
        `${color}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`,
        entry.context ? entry.context : ''
      );

      if (entry.error?.stack && this.isDevelopment) {
        console.log(entry.error.stack);
      }
    }
  }

  /**
   * Create base log entry with timestamp
   */
  private createEntry(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  /**
   * Debug logs - only in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.formatLog(this.createEntry('debug', message, context));
    }
  }

  /**
   * Info logs - always logged
   */
  info(message: string, context?: LogContext): void {
    this.formatLog(this.createEntry('info', message, context));
  }

  /**
   * Warning logs - always logged
   */
  warn(message: string, context?: LogContext): void {
    this.formatLog(this.createEntry('warn', message, context));
  }

  /**
   * Error logs - always logged with full details
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const entry = this.createEntry('error', message, context);

    if (error instanceof Error) {
      entry.error = {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        code: (error as any).code,
      };
    } else if (error) {
      entry.error = {
        message: String(error),
      };
    }

    this.formatLog(entry);
  }

  /**
   * API request logging - structured for production monitoring
   */
  apiRequest(params: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    requestId?: string;
    userId?: string;
    error?: Error;
  }): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: params.statusCode >= 500 ? 'error' : params.statusCode >= 400 ? 'warn' : 'info',
      message: `${params.method} ${params.url} - ${params.statusCode} (${params.duration}ms)`,
      requestId: params.requestId,
      userId: params.userId,
      url: params.url,
      method: params.method,
      statusCode: params.statusCode,
      duration: params.duration,
    };

    if (params.error) {
      entry.error = {
        message: params.error.message,
        stack: this.isDevelopment ? params.error.stack : undefined,
      };
    }

    this.formatLog(entry);
  }

  /**
   * Database query logging
   */
  dbQuery(query: string, duration: number, error?: Error): void {
    const level: LogLevel = error ? 'error' : duration > 1000 ? 'warn' : 'debug';
    
    this.formatLog({
      timestamp: new Date().toISOString(),
      level,
      message: `Database query completed in ${duration}ms`,
      context: {
        query: this.isDevelopment ? query : query.substring(0, 100), // Truncate in prod
        duration,
      },
      error: error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : undefined,
    });
  }

  /**
   * External API call logging
   */
  externalApi(params: {
    service: string;
    endpoint: string;
    method: string;
    statusCode?: number;
    duration: number;
    error?: Error;
  }): void {
    const level: LogLevel = params.error ? 'error' : params.statusCode && params.statusCode >= 400 ? 'warn' : 'info';

    this.formatLog({
      timestamp: new Date().toISOString(),
      level,
      message: `External API: ${params.service} ${params.method} ${params.endpoint}`,
      context: {
        service: params.service,
        endpoint: params.endpoint,
        method: params.method,
        statusCode: params.statusCode,
        duration: params.duration,
      },
      error: params.error ? {
        message: params.error.message,
        stack: this.isDevelopment ? params.error.stack : undefined,
      } : undefined,
    });
  }

  /**
   * Authentication events
   */
  auth(event: 'login' | 'logout' | 'failed_login' | 'token_refresh', userId?: string, context?: LogContext): void {
    this.formatLog({
      timestamp: new Date().toISOString(),
      level: event === 'failed_login' ? 'warn' : 'info',
      message: `Auth event: ${event}`,
      userId,
      context,
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Named exports for convenience
export const {
  debug,
  info,
  warn,
  error,
  apiRequest,
  dbQuery,
  externalApi,
  auth,
} = logger;

export default logger;

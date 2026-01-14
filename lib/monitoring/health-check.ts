/**
 * Health Check System
 * 
 * Monitor application health in production
 */

import { logger } from './logger';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    api: boolean;
    [key: string]: boolean;
  };
  uptime: number;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
}

class HealthMonitor {
  private startTime = Date.now();
  private lastCheck: HealthStatus | null = null;

  /**
   * Get current health status
   */
  async getHealth(): Promise<HealthStatus> {
    const checks = {
      database: await this.checkDatabase(),
      api: await this.checkApi(),
    };

    const allHealthy = Object.values(checks).every(v => v === true);
    const someHealthy = Object.values(checks).some(v => v === true);

    const status: HealthStatus = {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      uptime: Date.now() - this.startTime,
    };

    // Add memory info in Node.js environment
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const mem = process.memoryUsage();
      status.memory = {
        used: Math.round(mem.heapUsed / 1024 / 1024),
        total: Math.round(mem.heapTotal / 1024 / 1024),
        percentage: Math.round((mem.heapUsed / mem.heapTotal) * 100),
      };
    }

    this.lastCheck = status;

    // Log if unhealthy
    if (status.status !== 'healthy') {
      logger.warn('Health check failed', {
        action: 'health_check',
        status: status.status,
        checks,
      });
    }

    return status;
  }

  /**
   * Check database connection
   */
  private async checkDatabase(): Promise<boolean> {
    try {
      // Try to query database
      // Replace with your actual database check
      const response = await fetch('/api/health/db', { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.error('Database health check failed', error as Error);
      return false;
    }
  }

  /**
   * Check API availability
   */
  private async checkApi(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.error('API health check failed', error as Error);
      return false;
    }
  }

  /**
   * Get last check result
   */
  getLastCheck(): HealthStatus | null {
    return this.lastCheck;
  }

  /**
   * Start periodic health checks
   */
  startMonitoring(intervalMs: number = 60000) {
    logger.info('Starting health monitoring', { interval: intervalMs });

    setInterval(async () => {
      await this.getHealth();
    }, intervalMs);
  }
}

// Export singleton
export const healthMonitor = new HealthMonitor();

// Export class for testing
export { HealthMonitor };

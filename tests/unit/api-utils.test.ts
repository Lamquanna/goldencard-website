import { describe, it, expect } from 'vitest';

/**
 * API Utility Functions Tests
 */

// Mock API client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  isHealthy(status: number): boolean {
    return status >= 200 && status < 300;
  }

  shouldRetry(status: number): boolean {
    return status >= 500 || status === 429; // Server error or rate limited
  }
}

describe('ApiClient', () => {
  it('constructs with default baseUrl', () => {
    const client = new ApiClient();
    expect(client).toBeDefined();
  });

  it('constructs with custom baseUrl', () => {
    const client = new ApiClient('https://api.example.com');
    expect(client).toBeDefined();
  });

  describe('isHealthy', () => {
    const client = new ApiClient();

    it('returns true for 2xx status codes', () => {
      expect(client.isHealthy(200)).toBe(true);
      expect(client.isHealthy(201)).toBe(true);
      expect(client.isHealthy(204)).toBe(true);
    });

    it('returns false for 4xx status codes', () => {
      expect(client.isHealthy(400)).toBe(false);
      expect(client.isHealthy(401)).toBe(false);
      expect(client.isHealthy(404)).toBe(false);
    });

    it('returns false for 5xx status codes', () => {
      expect(client.isHealthy(500)).toBe(false);
      expect(client.isHealthy(502)).toBe(false);
      expect(client.isHealthy(503)).toBe(false);
    });
  });

  describe('shouldRetry', () => {
    const client = new ApiClient();

    it('returns true for 5xx errors', () => {
      expect(client.shouldRetry(500)).toBe(true);
      expect(client.shouldRetry(502)).toBe(true);
      expect(client.shouldRetry(503)).toBe(true);
    });

    it('returns true for 429 (rate limited)', () => {
      expect(client.shouldRetry(429)).toBe(true);
    });

    it('returns false for 4xx client errors (except 429)', () => {
      expect(client.shouldRetry(400)).toBe(false);
      expect(client.shouldRetry(401)).toBe(false);
      expect(client.shouldRetry(404)).toBe(false);
    });

    it('returns false for 2xx success', () => {
      expect(client.shouldRetry(200)).toBe(false);
      expect(client.shouldRetry(201)).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone: string): boolean => {
    return /^[\d\s\-\+\(\)]{10,}$/.test(phone);
  };

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@company.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@invalid.com')).toBe(false);
      expect(isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (234) 567-8900')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});

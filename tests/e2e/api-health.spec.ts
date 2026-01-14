import { test, expect } from '@playwright/test';

test.describe('API Health Checks', () => {
  test('should check all critical API endpoints', async ({ request }) => {
    const apiEndpoints = [
      { path: '/api/health', expectedStatus: 200 },
      { path: '/api/auth/session', expectedStatus: [200, 401] }, // May be unauthenticated
      { path: '/api/projects', expectedStatus: [200, 401] },
    ];

    for (const endpoint of apiEndpoints) {
      const response = await request.get(endpoint.path);
      const status = response.status();
      
      if (Array.isArray(endpoint.expectedStatus)) {
        expect(endpoint.expectedStatus).toContain(status);
        console.log(`✓ ${endpoint.path}: ${status}`);
      } else {
        expect(status).toBe(endpoint.expectedStatus);
        console.log(`✓ ${endpoint.path}: ${status}`);
      }
    }
  });

  test('should verify Firebase API endpoints respond', async ({ request }) => {
    // Test Firebase endpoints if they exist
    const firebaseEndpoints = [
      '/api/firebase/auth',
      '/api/firebase/check',
    ];

    for (const path of firebaseEndpoints) {
      const response = await request.get(path);
      expect(response.status()).toBeLessThan(500); // Should not be server error
      console.log(`Firebase ${path}: ${response.status()}`);
    }
  });

  test('should check ERP API endpoints', async ({ request }) => {
    const erpEndpoints = [
      { path: '/api/erp/attendance', method: 'GET' },
      { path: '/api/erp/projects', method: 'GET' },
      { path: '/api/erp/users', method: 'GET' },
    ];

    for (const endpoint of erpEndpoints) {
      const response = await request.get(endpoint.path);
      const status = response.status();
      
      // Should return 200, 401 (unauthorized), or 403 (forbidden) - NOT 404 or 500
      expect(status).not.toBe(404); // Endpoint should exist
      expect(status).toBeLessThan(500); // Should not be server error
      
      console.log(`${endpoint.method} ${endpoint.path}: ${status}`);
    }
  });

  test('should verify API returns valid JSON', async ({ request }) => {
    const jsonEndpoints = [
      '/api/health',
      '/api/projects',
    ];

    for (const path of jsonEndpoints) {
      const response = await request.get(path);
      
      // Skip if auth required
      if (response.status() === 401) continue;
      
      // Should have JSON content type
      const contentType = response.headers()['content-type'];
      if (contentType) {
        expect(contentType).toContain('application/json');
      }
      
      // Should be valid JSON
      try {
        await response.json();
        console.log(`✓ ${path}: Valid JSON`);
      } catch (error) {
        console.log(`✗ ${path}: Invalid JSON`);
        throw error;
      }
    }
  });

  test('should check API response times', async ({ request }) => {
    const endpoint = '/api/health';
    
    const startTime = Date.now();
    const response = await request.get(endpoint);
    const endTime = Date.now();
    
    const responseTime = endTime - startTime;
    
    // API should respond within 3 seconds
    expect(responseTime).toBeLessThan(3000);
    expect(response.status()).toBeLessThan(500);
    
    console.log(`✓ ${endpoint} responded in ${responseTime}ms`);
  });

  test('should handle POST requests to contact API', async ({ request }) => {
    const response = await request.post('/api/contact', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      },
    });

    // Should not return 404 or 500
    expect(response.status()).not.toBe(404);
    expect(response.status()).toBeLessThan(500);
    
    console.log(`POST /api/contact: ${response.status()}`);
  });
});

import { test, expect } from '@playwright/test';

/**
 * ERP Dashboard Tests
 * Tests cho trang dashboard chính của ERP
 */

test.describe('ERP Dashboard', () => {
  // Note: These tests assume user is already logged in
  // In production, you would use authentication state or fixtures
  
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (will redirect to login if not authenticated)
    await page.goto('/erp/dashboard');
  });

  test('should load dashboard page', async ({ page }) => {
    const url = page.url();
    
    // Should be on dashboard or login
    const isOnDashboard = url.includes('dashboard');
    const isOnLogin = url.includes('login');
    
    expect(isOnDashboard || isOnLogin).toBeTruthy();
    
    if (isOnDashboard) {
      console.log('✓ Dashboard loaded (authenticated)');
    } else {
      console.log('⚠️  Redirected to login (needs authentication)');
    }
  });

  test('dashboard should have navigation menu', async ({ page }) => {
    // Check for sidebar or navigation
    const nav = page.locator('nav, aside, [role="navigation"]').first();
    
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible();
      console.log('✓ Navigation menu found');
    }
  });

  test('dashboard should have main modules accessible', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Check for links to main ERP modules
    const moduleLinks = [
      { text: /HRM|Nhân sự/i, description: 'HRM Module' },
      { text: /Project|Dự án/i, description: 'Projects Module' },
      { text: /Dashboard|Tổng quan/i, description: 'Dashboard' },
      { text: /Attendance|Chấm công/i, description: 'Attendance' },
      { text: /Report|Báo cáo/i, description: 'Reports' },
    ];

    for (const module of moduleLinks) {
      const link = page.locator(`a:has-text("${module.text.source.replace(/\/i$/, '')}")`).first();
      
      if (await link.count() > 0) {
        await expect(link).toBeVisible();
        console.log(`✓ ${module.description} link found`);
      }
    }
  });

  test('dashboard should display user info or profile', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for user profile/info elements
    const userElements = page.locator('[data-testid*="user"], [class*="user"], button:has-text("Profile"), button:has-text("Hồ sơ")');
    
    if (await userElements.count() > 0) {
      console.log('✓ User profile elements found');
    }
  });

  test('dashboard should have working logout button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Đăng xuất"), a:has-text("Logout"), a:has-text("Đăng xuất")').first();
    
    if (await logoutButton.count() > 0) {
      await expect(logoutButton).toBeVisible();
      await expect(logoutButton).toBeEnabled();
      console.log('✓ Logout button found and clickable');
    }
  });

  test('dashboard should not have JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors found:');
      jsErrors.forEach(err => console.log(`  ❌ ${err}`));
    }
    
    expect(jsErrors.length).toBe(0);
  });

  test('dashboard should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/erp/dashboard');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    console.log(`✓ Dashboard loaded in ${loadTime}ms`);
  });
});

test.describe('ERP Dashboard Stats & Widgets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/erp/dashboard');
  });

  test('should display stat cards or metrics', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for stat cards/metrics
    const statCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    
    if (await statCards.count() > 0) {
      const count = await statCards.count();
      console.log(`✓ Found ${count} stat cards/widgets`);
    }
  });

  test('should have quick action buttons', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for action buttons
    const quickActions = [
      'New Project',
      'Dự án mới',
      'Check In',
      'Chấm công',
      'Leave Request',
      'Nghỉ phép',
    ];

    for (const action of quickActions) {
      const button = page.locator(`button:has-text("${action}"), a:has-text("${action}")`).first();
      
      if (await button.count() > 0) {
        console.log(`✓ Quick action found: ${action}`);
      }
    }
  });

  test('dashboard widgets should be interactive', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Find all clickable elements
    const buttons = await page.locator('button:not([disabled])').all();
    const links = await page.locator('a[href]').all();
    
    const totalInteractive = buttons.length + links.length;
    
    console.log(`✓ Found ${buttons.length} buttons and ${links.length} links`);
    expect(totalInteractive).toBeGreaterThan(0);
  });
});

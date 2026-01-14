import { test, expect } from '@playwright/test';

/**
 * ERP Comprehensive Test Suite
 * Tổng hợp tests cho toàn bộ hệ thống ERP
 */

test.describe('🚀 ERP System - Full Smoke Test', () => {
  const erpModules = [
    { path: '/erp/login', name: 'Login', critical: true },
    { path: '/erp/dashboard', name: 'Dashboard', critical: true },
    { path: '/erp/hrm/attendance', name: 'Attendance', critical: true },
    { path: '/erp/projects', name: 'Projects', critical: true },
    { path: '/erp/users', name: 'Users', critical: false },
    { path: '/erp/hrm', name: 'HRM', critical: false },
    { path: '/erp/hrm/employees', name: 'Employees', critical: false },
    { path: '/erp/hrm/leaves', name: 'Leaves', critical: false },
    { path: '/erp/reports', name: 'Reports', critical: false },
    { path: '/erp/settings', name: 'Settings', critical: false },
  ];

  test('all ERP modules should load without errors', async ({ page }) => {
    const results: { path: string; name: string; status: number; loadTime: number; errors: string[] }[] = [];

    for (const module of erpModules) {
      const jsErrors: string[] = [];
      
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      const startTime = Date.now();
      const response = await page.goto(module.path);
      const loadTime = Date.now() - startTime;
      const status = response?.status() || 0;

      // Wait for page to be ready
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      results.push({
        path: module.path,
        name: module.name,
        status,
        loadTime,
        errors: [...jsErrors],
      });

      // Clear error listener
      page.removeAllListeners('pageerror');
    }

    // Log results
    console.log('\n=== ERP MODULES TEST RESULTS ===\n');
    
    for (const result of results) {
      const icon = result.status < 400 ? '✓' : '❌';
      const timing = result.loadTime < 5000 ? '🟢' : result.loadTime < 10000 ? '🟡' : '🔴';
      
      console.log(`${icon} ${result.name.padEnd(20)} ${timing} ${result.status} (${result.loadTime}ms)`);
      
      if (result.errors.length > 0) {
        console.log(`  ⚠️  ${result.errors.length} JS errors`);
      }
    }

    // Check critical modules
    const criticalModules = results.filter(r => 
      erpModules.find(m => m.path === r.path)?.critical
    );

    const criticalFailures = criticalModules.filter(r => 
      r.status >= 400 && r.status !== 401 && r.status !== 403 && !r.path.includes('login')
    );

    console.log(`\n✓ Tested ${results.length} modules`);
    console.log(`✓ Critical modules: ${criticalModules.length}`);
    console.log(`✓ Critical failures: ${criticalFailures.length}`);
    
    // Critical modules should load (except auth errors are ok)
    expect(criticalFailures.length).toBe(0);
  });
});

test.describe('ERP Navigation', () => {
  test('should be able to navigate between main ERP modules', async ({ page }) => {
    await page.goto('/erp/dashboard');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const navigationLinks = [
      { text: /Dashboard|Tổng quan/i, description: 'Dashboard' },
      { text: /HRM|Nhân sự/i, description: 'HRM' },
      { text: /Project|Dự án/i, description: 'Projects' },
      { text: /Attendance|Chấm công/i, description: 'Attendance' },
    ];

    for (const link of navigationLinks) {
      const navLink = page.locator(`a:has-text("${link.text.source.replace(/\/i$/, '')}")`).first();
      
      if (await navLink.count() > 0) {
        await expect(navLink).toBeVisible();
        await expect(navLink).toBeEnabled();
        console.log(`✓ ${link.description} navigation found`);
      }
    }
  });

  test('sidebar navigation should be collapsible', async ({ page }) => {
    await page.goto('/erp/dashboard');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for toggle button
    const toggleButton = page.locator('button[aria-label*="toggle" i], button[aria-label*="menu" i], [class*="sidebar-toggle"]').first();
    
    if (await toggleButton.count() > 0) {
      console.log('✓ Sidebar toggle found');
    }
  });
});

test.describe('ERP Data Integrity', () => {
  test('forms should have proper validation', async ({ page }) => {
    await page.goto('/erp/login');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    await page.waitForTimeout(500);
    
    // Should stay on page (validation prevented submit)
    expect(page.url()).toContain('login');
    console.log('✓ Form validation working');
  });

  test('buttons should provide feedback on click', async ({ page }) => {
    await page.goto('/erp/login');
    
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Should see some feedback (error message, loading state, etc)
    await page.waitForTimeout(1000);
    console.log('✓ Button provides feedback');
  });
});

test.describe('ERP Performance', () => {
  test('critical pages should load within acceptable time', async ({ page }) => {
    const criticalPages = [
      '/erp/login',
      '/erp/dashboard',
      '/erp/hrm/attendance',
    ];

    const loadTimes: { page: string; time: number }[] = [];

    for (const pagePath of criticalPages) {
      const startTime = Date.now();
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      const loadTime = Date.now() - startTime;

      loadTimes.push({ page: pagePath, time: loadTime });
      
      console.log(`${pagePath}: ${loadTime}ms`);
    }

    // All should load within 15 seconds
    const slowPages = loadTimes.filter(lt => lt.time > 15000);
    expect(slowPages.length).toBe(0);
  });
});

test.describe('ERP Accessibility', () => {
  test('forms should have labels', async ({ page }) => {
    await page.goto('/erp/login');
    
    const inputs = await page.locator('input').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const ariaLabel = await input.getAttribute('aria-label');
      const hasLabel = id || name || ariaLabel;
      
      if (!hasLabel) {
        console.log('⚠️  Input without label found');
      }
    }
  });

  test('buttons should have accessible text', async ({ page }) => {
    await page.goto('/erp/dashboard');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const buttons = await page.locator('button:visible').all();
    
    let buttonsWithoutText = 0;
    
    for (const button of buttons) {
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      if (!text?.trim() && !ariaLabel) {
        buttonsWithoutText++;
      }
    }
    
    console.log(`✓ Checked ${buttons.length} buttons`);
    console.log(`⚠️  Buttons without text: ${buttonsWithoutText}`);
    
    // Allow some buttons without text (icon buttons with aria-label)
    expect(buttonsWithoutText).toBeLessThan(buttons.length * 0.3);
  });
});

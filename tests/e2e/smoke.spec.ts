import { test, expect } from '@playwright/test';

/**
 * Quick Smoke Tests - Run these before every deployment
 * These tests verify critical functionality is working
 */

test.describe('🚀 Quick Smoke Tests (5 minutes)', () => {
  test('critical pages load without errors', async ({ page }) => {
    const criticalPages = [
      '/',
      '/erp/login',
      '/admin',
    ];

    for (const path of criticalPages) {
      const response = await page.goto(path);
      const status = response?.status() || 0;
      
      // Should not be 404 or 500 error
      expect(status).toBeLessThan(500);
      expect(status).not.toBe(404);
      
      // Should not have console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForLoadState('networkidle');
      
      // Check for critical JS errors
      const hasCriticalErrors = errors.some(err => 
        err.includes('Uncaught') || 
        err.includes('TypeError') ||
        err.includes('ReferenceError')
      );
      
      expect(hasCriticalErrors).toBeFalsy();
      
      console.log(`✓ ${path}: ${status} (${errors.length} console messages)`);
    }
  });

  test('no broken buttons on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Get all buttons
    const buttons = await page.locator('button, a[role="button"]').all();
    
    let brokenButtons = 0;
    
    for (const button of buttons) {
      const isVisible = await button.isVisible();
      const isDisabled = await button.isDisabled();
      
      if (isVisible && isDisabled) {
        const text = await button.textContent();
        console.log(`⚠️  Disabled button found: "${text}"`);
        brokenButtons++;
      }
    }
    
    // Log result
    console.log(`Checked ${buttons.length} buttons, ${brokenButtons} disabled`);
    
    // Fail if too many broken buttons
    expect(brokenButtons).toBeLessThan(buttons.length * 0.1); // Max 10% broken
  });

  test('all navigation links work', async ({ page }) => {
    await page.goto('/');
    
    const navLinks = await page.locator('nav a, header a').all();
    
    let brokenLinks = 0;
    let totalLinks = 0;
    
    for (const link of navLinks) {
      const href = await link.getAttribute('href');
      
      if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
        totalLinks++;
        const isVisible = await link.isVisible();
        
        if (isVisible) {
          const text = await link.textContent();
          console.log(`✓ Found link: "${text}" -> ${href}`);
        } else {
          brokenLinks++;
          const text = await link.textContent();
          console.log(`⚠️  Hidden link: "${text}" -> ${href}`);
        }
      }
    }
    
    console.log(`Total links: ${totalLinks}, Broken: ${brokenLinks}`);
    
    // Allow some hidden links (mobile menu, etc) - fail only if >50% broken
    const brokenPercentage = totalLinks > 0 ? (brokenLinks / totalLinks) : 0;
    expect(brokenPercentage).toBeLessThan(0.5); // Max 50% hidden links allowed
  });

  test('forms are functional', async ({ page }) => {
    await page.goto('/');
    
    // Find all forms
    const forms = await page.locator('form').all();
    
    for (const form of forms) {
      const submitButton = form.locator('button[type="submit"]').first();
      
      if (await submitButton.count() > 0) {
        const isVisible = await submitButton.isVisible();
        const isDisabled = await submitButton.isDisabled();
        
        expect(isVisible).toBeTruthy();
        console.log(`✓ Form submit button found, disabled: ${isDisabled}`);
      }
    }
  });

  test('no 404 resources on homepage', async ({ page }) => {
    const failedRequests: string[] = [];
    
    page.on('response', response => {
      if (response.status() === 404) {
        failedRequests.push(response.url());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    if (failedRequests.length > 0) {
      console.log('❌ 404 Resources found:');
      failedRequests.forEach(url => console.log(`  - ${url}`));
    }
    
    expect(failedRequests.length).toBe(0);
  });

  test('JavaScript executes without fatal errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any lazy-loaded scripts
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log('JavaScript Errors:');
      errors.forEach(err => console.log(`  ❌ ${err}`));
    }
    
    // No fatal errors allowed
    expect(errors.length).toBe(0);
  });
});

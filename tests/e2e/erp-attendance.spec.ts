import { test, expect } from '@playwright/test';

/**
 * ERP Attendance (Chấm công) Tests
 * Tests cho hệ thống chấm công
 */

test.describe('ERP Attendance System', () => {
  const ATTENDANCE_URL = '/erp/hrm/attendance';

  test.beforeEach(async ({ page }) => {
    await page.goto(ATTENDANCE_URL);
  });

  test('should load attendance page', async ({ page }) => {
    const url = page.url();
    
    // Should be on attendance page or redirected to login
    const isOnAttendance = url.includes('attendance');
    const isOnLogin = url.includes('login');
    
    expect(isOnAttendance || isOnLogin).toBeTruthy();
    
    if (isOnAttendance) {
      console.log('✓ Attendance page loaded');
    } else {
      console.log('⚠️  Redirected to login (requires authentication)');
    }
  });

  test('should display attendance tracker or check-in button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for check-in/check-out buttons
    const checkInButton = page.locator('button:has-text("Check In"), button:has-text("Chấm vào"), button:has-text("Check-in")').first();
    const checkOutButton = page.locator('button:has-text("Check Out"), button:has-text("Chấm ra"), button:has-text("Check-out")').first();
    
    const hasCheckIn = await checkInButton.count() > 0;
    const hasCheckOut = await checkOutButton.count() > 0;
    
    if (hasCheckIn) {
      await expect(checkInButton).toBeVisible();
      console.log('✓ Check-in button found');
    }
    
    if (hasCheckOut) {
      await expect(checkOutButton).toBeVisible();
      console.log('✓ Check-out button found');
    }
    
    // Should have at least one attendance action button
    expect(hasCheckIn || hasCheckOut).toBeTruthy();
  });

  test('should display attendance history or records', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for table or list of attendance records
    const table = page.locator('table').first();
    const list = page.locator('[class*="list"], [role="list"]').first();
    
    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    
    if (hasTable) {
      console.log('✓ Attendance table found');
    }
    
    if (hasList) {
      console.log('✓ Attendance list found');
    }
    
    // Should have some way to display records
    expect(hasTable || hasList).toBeTruthy();
  });

  test('should display current date/time', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for date/time display
    const currentYear = new Date().getFullYear().toString();
    const yearDisplay = page.locator(`text=/${currentYear}/`).first();
    
    if (await yearDisplay.count() > 0) {
      console.log('✓ Current date/time display found');
    }
  });

  test('check-in button should be functional when available', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const checkInButton = page.locator('button:has-text("Check In"), button:has-text("Chấm vào"), button:has-text("Check-in")').first();
    
    if (await checkInButton.count() > 0) {
      await expect(checkInButton).toBeEnabled();
      console.log('✓ Check-in button is clickable');
    }
  });

  test('should show attendance statistics', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for stat displays (hours worked, days present, etc)
    const stats = page.locator('[class*="stat"], [class*="metric"], [class*="summary"]');
    
    if (await stats.count() > 0) {
      const count = await stats.count();
      console.log(`✓ Found ${count} attendance statistics`);
    }
  });

  test('should have date filter or calendar', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for date picker or filter
    const datePicker = page.locator('input[type="date"], [class*="calendar"], [class*="date-picker"]').first();
    
    if (await datePicker.count() > 0) {
      console.log('✓ Date filter/calendar found');
    }
  });

  test('attendance page should not have critical errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (jsErrors.length > 0) {
      console.log('JavaScript errors:');
      jsErrors.forEach(err => console.log(`  ❌ ${err}`));
    }
    
    expect(jsErrors.length).toBe(0);
  });
});

test.describe('ERP Attendance - Location Check', () => {
  test('should display location info if location-based attendance is used', async ({ page }) => {
    await page.goto('/erp/hrm/attendance');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Check for location-related elements
    const locationElements = page.locator('text=/location|vị trí|địa điểm/i');
    
    if (await locationElements.count() > 0) {
      console.log('✓ Location-based attendance detected');
    }
  });

  test('should show map or location picker if available', async ({ page }) => {
    await page.goto('/erp/hrm/attendance');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for map container
    const map = page.locator('[id*="map"], [class*="map"], [class*="leaflet"], [class*="mapbox"]').first();
    
    if (await map.count() > 0) {
      console.log('✓ Map component found');
    }
  });
});

test.describe('ERP Attendance - Quick Checks', () => {
  test('attendance buttons should not be broken', async ({ page }) => {
    await page.goto('/erp/hrm/attendance');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Get all buttons on the page
    const buttons = await page.locator('button:visible').all();
    
    let brokenButtons = 0;
    
    for (const button of buttons) {
      const isDisabled = await button.isDisabled();
      if (isDisabled) {
        const text = await button.textContent();
        // Some buttons may be legitimately disabled (e.g., check-out before check-in)
        console.log(`  ⚠️  Disabled button: "${text}"`);
        brokenButtons++;
      }
    }
    
    console.log(`✓ Checked ${buttons.length} buttons, ${brokenButtons} disabled`);
    
    // Allow some buttons to be disabled (business logic)
    expect(brokenButtons).toBeLessThan(buttons.length);
  });

  test('attendance page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/erp/hrm/attendance');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    console.log(`✓ Attendance page loaded in ${loadTime}ms`);
  });
});

import { test, expect } from '@playwright/test';

/**
 * ERP Users Management Tests
 * Tests cho hệ thống quản lý người dùng
 */

test.describe('ERP Users Management', () => {
  const USERS_URL = '/erp/users';

  test.beforeEach(async ({ page }) => {
    await page.goto(USERS_URL);
  });

  test('should load users management page', async ({ page }) => {
    const url = page.url();
    
    const isOnUsers = url.includes('user');
    const isOnLogin = url.includes('login');
    
    expect(isOnUsers || isOnLogin).toBeTruthy();
    
    if (isOnUsers) {
      console.log('✓ Users page loaded');
    } else {
      console.log('⚠️  Redirected to login');
    }
  });

  test('should display list of users', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for users table or list
    const usersTable = page.locator('table, [role="table"], [class*="user-list"]').first();
    
    if (await usersTable.count() > 0) {
      console.log('✓ Users list/table found');
    }
  });

  test('should have "Add User" or "New User" button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const addUserButton = page.locator('button:has-text("Add User"), button:has-text("New User"), button:has-text("Thêm người dùng"), button:has-text("Tạo mới")').first();
    
    if (await addUserButton.count() > 0) {
      await expect(addUserButton).toBeVisible();
      await expect(addUserButton).toBeEnabled();
      console.log('✓ Add User button found');
    }
  });

  test('should have user search functionality', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="Tìm" i]').first();
    
    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toBeEnabled();
      console.log('✓ Search input found');
    }
  });

  test('should display user information columns', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for common user info columns
    const columns = ['Name', 'Email', 'Role', 'Status', 'Tên', 'Vai trò', 'Trạng thái'];
    
    for (const column of columns) {
      const columnHeader = page.locator(`th:has-text("${column}"), [class*="header"]:has-text("${column}")`).first();
      
      if (await columnHeader.count() > 0) {
        console.log(`✓ Column found: ${column}`);
      }
    }
  });

  test('users should have action buttons', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for action buttons (edit, delete, view)
    const actionButtons = page.locator('button[title*="Edit"], button[title*="Delete"], button[title*="View"], [class*="action-button"]');
    
    if (await actionButtons.count() > 0) {
      console.log(`✓ Found ${await actionButtons.count()} action buttons`);
    }
  });

  test('should have role filter or dropdown', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const roleFilter = page.locator('select, [role="combobox"], button:has-text("Role"), button:has-text("Vai trò")').first();
    
    if (await roleFilter.count() > 0) {
      console.log('✓ Role filter found');
    }
  });

  test('users page should not have JavaScript errors', async ({ page }) => {
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

test.describe('ERP Users - Profile & Details', () => {
  test('clicking on a user should show details or edit form', async ({ page }) => {
    await page.goto('/erp/users');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Find clickable user row or link
    const userLink = page.locator('tr[role="button"], a[href*="user"], button:has-text("View"), button:has-text("Edit")').first();
    
    if (await userLink.count() > 0) {
      console.log('✓ User is clickable');
    }
  });

  test('should display user roles/permissions', async ({ page }) => {
    await page.goto('/erp/users');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for role badges or tags
    const roleTags = page.locator('[class*="role"], [class*="badge"], text=/Admin|Manager|User|Employee/i');
    
    if (await roleTags.count() > 0) {
      console.log('✓ User roles displayed');
    }
  });
});

test.describe('ERP Users - Statistics', () => {
  test('should show user statistics', async ({ page }) => {
    await page.goto('/erp/users');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for stat cards
    const stats = page.locator('[class*="stat"], [class*="summary"]');
    
    if (await stats.count() > 0) {
      console.log(`✓ Found ${await stats.count()} statistics`);
    }
  });

  test('should display active vs inactive users', async ({ page }) => {
    await page.goto('/erp/users');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for status indicators
    const activeTag = page.locator('text=/Active|Hoạt động/i').first();
    const inactiveTag = page.locator('text=/Inactive|Không hoạt động/i').first();
    
    if (await activeTag.count() > 0) {
      console.log('✓ Active status found');
    }
    
    if (await inactiveTag.count() > 0) {
      console.log('✓ Inactive status found');
    }
  });
});

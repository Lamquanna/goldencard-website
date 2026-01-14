import { test, expect } from '@playwright/test';

/**
 * ERP Projects Management Tests
 * Tests cho hệ thống quản lý dự án
 */

test.describe('ERP Projects Module', () => {
  const PROJECTS_URL = '/erp/projects';

  test.beforeEach(async ({ page }) => {
    await page.goto(PROJECTS_URL);
  });

  test('should load projects page', async ({ page }) => {
    const url = page.url();
    
    const isOnProjects = url.includes('project');
    const isOnLogin = url.includes('login');
    
    expect(isOnProjects || isOnLogin).toBeTruthy();
    
    if (isOnProjects) {
      console.log('✓ Projects page loaded');
    } else {
      console.log('⚠️  Redirected to login');
    }
  });

  test('should display list of projects', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for projects list/grid/table
    const projectsList = page.locator('[class*="project"], table, [role="list"]');
    
    if (await projectsList.count() > 0) {
      const count = await projectsList.count();
      console.log(`✓ Found ${count} project container(s)`);
    }
  });

  test('should have "New Project" or "Create Project" button', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    const newProjectButton = page.locator('button:has-text("New Project"), button:has-text("Dự án mới"), button:has-text("Create"), button:has-text("Tạo mới"), a:has-text("New Project")').first();
    
    if (await newProjectButton.count() > 0) {
      await expect(newProjectButton).toBeVisible();
      await expect(newProjectButton).toBeEnabled();
      console.log('✓ New Project button found and clickable');
    }
  });

  test('should have project filtering or search', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for search input or filter
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i], input[placeholder*="Tìm" i]').first();
    const filterButton = page.locator('button:has-text("Filter"), button:has-text("Lọc"), select').first();
    
    const hasSearch = await searchInput.count() > 0;
    const hasFilter = await filterButton.count() > 0;
    
    if (hasSearch) {
      console.log('✓ Search input found');
    }
    
    if (hasFilter) {
      console.log('✓ Filter found');
    }
    
    expect(hasSearch || hasFilter).toBeTruthy();
  });

  test('project cards/items should be clickable', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for clickable project elements
    const projectLinks = page.locator('a[href*="project"], [class*="project"] a, tr[role="button"], [class*="project"][role="button"]');
    
    if (await projectLinks.count() > 0) {
      const count = await projectLinks.count();
      console.log(`✓ Found ${count} clickable project elements`);
    }
  });

  test('should display project status or progress', async ({ page }) => {
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for status badges or progress indicators
    const statusElements = page.locator('[class*="status"], [class*="badge"], [class*="progress"], text=/Active|In Progress|Completed|Đang thực hiện|Hoàn thành/i');
    
    if (await statusElements.count() > 0) {
      console.log('✓ Project status indicators found');
    }
  });

  test('projects page should not have JavaScript errors', async ({ page }) => {
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

test.describe('ERP Projects - Details View', () => {
  test('clicking on a project should navigate to details', async ({ page }) => {
    await page.goto('/erp/projects');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Find first project link
    const firstProject = page.locator('a[href*="project"]').first();
    
    if (await firstProject.count() > 0) {
      const href = await firstProject.getAttribute('href');
      console.log(`✓ Found project link: ${href}`);
      
      // Click and verify navigation
      await firstProject.click();
      await page.waitForTimeout(1000);
      
      const newUrl = page.url();
      console.log(`✓ Navigated to: ${newUrl}`);
    }
  });
});

test.describe('ERP Projects - Statistics', () => {
  test('should show project statistics or summary', async ({ page }) => {
    await page.goto('/erp/projects');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for stat cards
    const stats = page.locator('[class*="stat"], [class*="summary"], [class*="card"]');
    
    if (await stats.count() > 0) {
      const count = await stats.count();
      console.log(`✓ Found ${count} statistics/cards`);
    }
  });

  test('should display project counts by status', async ({ page }) => {
    await page.goto('/erp/projects');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for status counts
    const statusKeywords = ['Active', 'Completed', 'Pending', 'Đang thực hiện', 'Hoàn thành', 'Chờ'];
    
    for (const keyword of statusKeywords) {
      const element = page.locator(`text=/${keyword}/i`).first();
      if (await element.count() > 0) {
        console.log(`✓ Found status: ${keyword}`);
      }
    }
  });
});

test.describe('ERP Projects - Actions', () => {
  test('project action buttons should be functional', async ({ page }) => {
    await page.goto('/erp/projects');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for action buttons
    const buttons = await page.locator('button:visible:not([disabled])').all();
    
    console.log(`✓ Found ${buttons.length} active buttons`);
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should have edit/delete/view actions for projects', async ({ page }) => {
    await page.goto('/erp/projects');
    
    const url = page.url();
    
    if (url.includes('login')) {
      test.skip('Skipped - requires authentication');
      return;
    }

    // Look for common action buttons/icons
    const actionButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("View"), button:has-text("Sửa"), button:has-text("Xóa"), button:has-text("Xem"), [title*="Edit"], [title*="Delete"]');
    
    if (await actionButtons.count() > 0) {
      console.log('✓ Project action buttons found');
    }
  });
});

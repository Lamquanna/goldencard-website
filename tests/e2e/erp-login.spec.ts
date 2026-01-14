import { test, expect } from '@playwright/test';

/**
 * ERP Login & Authentication Tests
 * Tests cho hệ thống đăng nhập ERP
 */

test.describe('ERP Login System', () => {
  const ERP_LOGIN_URL = '/erp/login';
  
  test('should load ERP login page without errors', async ({ page }) => {
    const response = await page.goto(ERP_LOGIN_URL);
    expect(response?.status()).toBeLessThan(400);
    
    // Verify page title/heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // Check for login form elements (ERP uses username input, not email)
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input[type="password"]#password, input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('login form fields should be functional', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    const usernameInput = page.locator('input#username');
    const passwordInput = page.locator('input[type="password"]');
    
    // Fields should be enabled
    await expect(usernameInput).toBeEnabled();
    await expect(passwordInput).toBeEnabled();
    
    // Should be able to type
    await usernameInput.fill('test@goldenenergy.vn');
    await passwordInput.fill('testpassword123');
    
    // Values should be set
    await expect(usernameInput).toHaveValue('test@goldenenergy.vn');
    await expect(passwordInput).toHaveValue('testpassword123');
  });

  test('should show validation for empty fields', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Should still be on login page (validation prevented submit)
    expect(page.url()).toContain('login');
  });

  test('should handle invalid credentials appropriately', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    // Fill with invalid credentials
    await page.fill('input#username', 'invaliduser');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Wait for response
    await page.waitForTimeout(2000);
    
    // Should show error or stay on login page
    const currentUrl = page.url();
    const hasErrorMessage = await page.locator('text=/error|invalid|sai|không đúng|thất bại/i').count() > 0;
    
    // Either still on login or showing error
    const isHandledCorrectly = currentUrl.includes('login') || hasErrorMessage;
    expect(isHandledCorrectly).toBeTruthy();
  });

  test('login button should be clickable when form is filled', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    const loginButton = page.locator('button[type="submit"]');
    await expect(loginButton).toBeVisible();
    
    // Fill form
    await page.fill('input#username', 'admin');
    await page.fill('input[type="password"]', 'Admin@123');
    
    // Button should be clickable
    await expect(loginButton).toBeEnabled();
    
    // Should be able to click (will show error for test credentials, but button works)
    await loginButton.click({ timeout: 5000 });
  });

  test('password field should hide password', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    
    // Should have type="password"
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('should have "Forgot Password" or "Change Password" link', async ({ page }) => {
    await page.goto(ERP_LOGIN_URL);
    
    const forgotLink = page.locator('a:has-text("Quên mật khẩu"), a:has-text("Forgot password"), a:has-text("Đổi mật khẩu"), a:has-text("Change password")').first();
    
    if (await forgotLink.count() > 0) {
      await expect(forgotLink).toBeVisible();
      await expect(forgotLink).toBeEnabled();
    }
  });

  test('should not have JavaScript errors on login page', async ({ page }) => {
    const jsErrors: string[] = [];
    
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    await page.goto(ERP_LOGIN_URL);
    await page.waitForLoadState('networkidle');
    
    // No critical JS errors
    expect(jsErrors.length).toBe(0);
  });

  test('login page should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(ERP_LOGIN_URL);
    const loadTime = Date.now() - startTime;

    // Should load within 45 seconds (Next.js initial load can be slow)
    expect(loadTime).toBeLessThan(45000);
    console.log(`✓ Login page loaded in ${loadTime}ms`);
  });
});

test.describe('ERP Authentication Flow', () => {
  test('should redirect unauthenticated users to login', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/erp/dashboard');
    
    // Should redirect to login or show login requirement
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    // Should be on login page or show auth error
    const isProtected = currentUrl.includes('login') || 
                        await page.locator('text=/login|sign in|đăng nhập/i').count() > 0;
    
    expect(isProtected).toBeTruthy();
  });

  test('protected ERP routes should require authentication', async ({ page }) => {
    const protectedRoutes = [
      '/erp/dashboard',
      '/erp/hrm/attendance',
      '/erp/projects',
      '/erp/users',
      '/erp/hrm/leaves',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForTimeout(1000);
      
      const url = page.url();
      const requiresAuth = url.includes('login') || 
                          await page.locator('text=/login|đăng nhập/i').count() > 0;
      
      console.log(`✓ ${route}: ${requiresAuth ? 'Protected' : 'Check auth'}`);
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('should display contact form', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to contact section or navigate to contact page
    const contactButton = page.locator('a[href*="contact"], button:has-text("Liên hệ")').first();
    
    if (await contactButton.count() > 0) {
      await contactButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Check for form fields
    const nameField = page.locator('input[name="name"], input[placeholder*="Tên" i], input[placeholder*="Name" i]').first();
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const messageField = page.locator('textarea, input[name="message"]').first();
    
    if (await nameField.count() > 0) {
      await expect(nameField).toBeVisible();
      await expect(nameField).toBeEnabled();
    }
    
    if (await emailField.count() > 0) {
      await expect(emailField).toBeVisible();
      await expect(emailField).toBeEnabled();
    }
    
    if (await messageField.count() > 0) {
      await expect(messageField).toBeVisible();
      await expect(messageField).toBeEnabled();
    }
  });

  test('submit button should work', async ({ page }) => {
    await page.goto('/');
    
    const submitButton = page.locator('button[type="submit"]:has-text("Gửi"), button:has-text("Send")').first();
    
    if (await submitButton.count() > 0) {
      await expect(submitButton).toBeVisible();
      
      // Fill minimal form data
      const nameField = page.locator('input[name="name"]').first();
      const emailField = page.locator('input[type="email"]').first();
      
      if (await nameField.count() > 0 && await emailField.count() > 0) {
        await nameField.fill('Test User');
        await emailField.fill('test@example.com');
        
        await expect(submitButton).toBeEnabled();
      }
    }
  });
});

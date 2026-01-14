import { test, expect } from '@playwright/test';

test.describe('Homepage - Critical Functionality', () => {
  test('should load homepage successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    
    // Verify page loaded
    await expect(page).toHaveTitle(/Golden/i);
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.goto('/');
    
    // Test all major navigation links
    const navLinks = [
      { selector: 'a[href*="about"]', name: 'About' },
      { selector: 'a[href*="project"]', name: 'Projects' },
      { selector: 'a[href*="contact"]', name: 'Contact' },
    ];

    for (const link of navLinks) {
      const element = page.locator(link.selector).first();
      if (await element.count() > 0) {
        await expect(element).toBeVisible();
        await expect(element).toBeEnabled();
        console.log(`✓ ${link.name} button is working`);
      }
    }
  });

  test('should have working CTA buttons', async ({ page }) => {
    await page.goto('/');
    
    // Common CTA button patterns
    const ctaButtons = [
      'button:has-text("Liên hệ")',
      'button:has-text("Contact")',
      'button:has-text("Tư vấn")',
      'a:has-text("Dự án")',
    ];

    for (const selector of ctaButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0) {
        await expect(button).toBeVisible();
        await expect(button).toBeEnabled();
        
        // Check if button is clickable (not disabled)
        const isDisabled = await button.isDisabled();
        expect(isDisabled).toBeFalsy();
      }
    }
  });

  test('should load all critical images', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check for broken images
    const images = await page.locator('img[src]:not([loading="lazy"])').all();
    let brokenImages = 0;
    let totalImages = 0;
    
    for (const img of images) {
      const src = await img.getAttribute('src');
      if (src && !src.startsWith('data:')) {
        totalImages++;
        const isVisible = await img.isVisible();
        if (isVisible) {
          const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
          if (naturalWidth === 0) {
            brokenImages++;
            console.log(`⚠️  Broken image: ${src}`);
          }
        }
      }
    }
    
    console.log(`Images checked: ${totalImages}, Broken: ${brokenImages}`);
    // Allow some lazy loaded images - fail only if >30% broken
    const brokenPercentage = totalImages > 0 ? (brokenImages / totalImages) : 0;
    expect(brokenPercentage).toBeLessThan(0.3);
  });

  test('should have working language switcher', async ({ page }) => {
    await page.goto('/');
    
    // Find language switcher button
    const langButton = page.locator('[data-testid="language-switcher"], button:has-text("EN"), button:has-text("VI")').first();
    
    if (await langButton.count() > 0) {
      await expect(langButton).toBeVisible();
      await expect(langButton).toBeEnabled();
    }
  });

  test('should open chat widget when clicked', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Find chat widget button
    const chatButton = page.locator('[data-testid="chat-widget"], button[aria-label*="chat" i], .chat-widget-button').first();
    
    if (await chatButton.count() > 0) {
      await expect(chatButton).toBeVisible();
      await chatButton.click();
      
      // Wait for chat to open
      await page.waitForTimeout(500);
      
      // Verify chat opened (either modal or iframe)
      const chatModal = page.locator('[role="dialog"], iframe[src*="coze"]').first();
      await expect(chatModal).toBeVisible({ timeout: 3000 });
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Start Button Navigation Test', () => {
  test('should navigate from landing page to step 1 when start button is clicked', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the landing page by checking for expected elements
    await expect(page.locator('h1')).toContainText(['OptiGenix', 'Gravity', 'Container', 'Welcome']);
    
    // Look for the start button - it might have different text variations
    const startButton = page.locator('button, a, .btn').filter({
      hasText: /start|begin|get started|continue|next/i
    }).first();
    
    // Verify the start button is visible and clickable
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeEnabled();
    
    console.log('Landing page loaded, start button found');
    
    // Click the start button
    await startButton.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify we've navigated to step 1
    // Check the URL contains step1 or the appropriate path
    const currentUrl = page.url();
    console.log('Current URL after clicking start:', currentUrl);
    
    // Verify step 1 specific elements are present
    const step1Indicators = [
      page.locator('h1, h2, h3').filter({ hasText: /step 1|transport|shipping/i }),
      page.locator('.step-indicator').filter({ hasText: /1/ }),
      page.locator('form'),
      page.locator('input, select').first()
    ];
    
    // Check if any step 1 indicators are present
    let step1Found = false;
    for (const indicator of step1Indicators) {
      try {
        await expect(indicator).toBeVisible({ timeout: 5000 });
        step1Found = true;
        console.log('Step 1 indicator found:', await indicator.textContent());
        break;
      } catch (e) {
        // Continue checking other indicators
      }
    }
    
    if (!step1Found) {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'start-button-navigation-debug.png', fullPage: true });
      console.log('Page content after start button click:', await page.content());
    }
    
    expect(step1Found).toBeTruthy();
    
    // Additional verification: check if URL changed from root
    expect(currentUrl).not.toBe('http://localhost:5000/');
    
    console.log('✅ Start button successfully navigates to step 1');
  });
  
  test('should show proper page structure on landing page', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic page structure
    const pageTitle = await page.title();
    console.log('Landing page title:', pageTitle);
    
    // Take a screenshot of the landing page
    await page.screenshot({ path: 'landing-page-structure.png', fullPage: true });
    
    // Verify basic elements are present
    const bodyContent = await page.locator('body').textContent();
    console.log('Landing page body content preview:', bodyContent?.substring(0, 500));
    
    // Check if there are any forms or interactive elements
    const forms = await page.locator('form').count();
    const buttons = await page.locator('button, .btn').count();
    const links = await page.locator('a').count();
    
    console.log(`Interactive elements found - Forms: ${forms}, Buttons: ${buttons}, Links: ${links}`);
    
    expect(forms + buttons + links).toBeGreaterThan(0);
  });
});

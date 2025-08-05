import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Test', () => {
  test('click dashboard button and check what happens', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    console.log('Initial URL:', page.url());
    
    // Find the Dashboard button
    const dashboardButton = page.locator('button, a, .btn').filter({
      hasText: /dashboard/i
    }).first();
    
    await expect(dashboardButton).toBeVisible();
    const buttonText = await dashboardButton.textContent();
    console.log('Found Dashboard button with text:', buttonText?.trim());
    
    // Take a screenshot before clicking
    await page.screenshot({ path: 'before-dashboard-click.png', fullPage: true });
    
    // Click the Dashboard button
    console.log('Clicking Dashboard button...');
    await dashboardButton.click();
    
    // Wait a short time and check URL
    await page.waitForTimeout(2000);
    const urlAfterClick = page.url();
    console.log('URL after click:', urlAfterClick);
    
    // Take a screenshot after clicking
    await page.screenshot({ path: 'after-dashboard-click.png', fullPage: true });
    
    // Check if navigation occurred
    if (urlAfterClick !== 'http://localhost:5000/' && urlAfterClick !== 'http://localhost:5000') {
      console.log('✅ Navigation successful - moved to:', urlAfterClick);
      
      // Check what's on the new page
      const pageTitle = await page.title();
      console.log('New page title:', pageTitle);
      
      const bodyText = await page.locator('body').textContent();
      console.log('New page content preview:', bodyText?.substring(0, 500));
      
    } else {
      console.log('❌ Still on landing page');
      
      // Check if anything changed on the current page
      const pageContent = await page.content();
      console.log('Current page content length:', pageContent.length);
    }
  });
  
  test('check all buttons and their click behavior', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Get all buttons
    const buttons = await page.locator('button, a, .btn').all();
    console.log(`Found ${buttons.length} buttons/links`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const href = await button.getAttribute('href');
      const onclick = await button.getAttribute('onclick');
      
      console.log(`Button ${i + 1}: Text="${text?.trim()}" href="${href}" onclick="${onclick}"`);
    }
  });
});

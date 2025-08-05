import { test, expect } from '@playwright/test';

test.describe('Updated Navigation Test', () => {
  test('check what buttons are actually on the landing page', async ({ page }) => {
    // Go to landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Landing page loaded');
    
    // Get all anchor tags and their href attributes
    const allLinks = await page.locator('a').all();
    
    console.log(`Found ${allLinks.length} total links on the page`);
    
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      console.log(`Link ${i + 1}: "${text?.trim()}" → "${href}"`);
    }
    
    // Specifically look for step1 links
    const step1Links = await page.locator('a[href="/step1"]').all();
    console.log(`\nFound ${step1Links.length} links pointing to /step1`);
    
    // Try to click any available start/get started button
    const startButtons = await page.locator('a').filter({ 
      hasText: /start|get started|dashboard|begin/i 
    }).all();
    
    console.log(`Found ${startButtons.length} potential start buttons`);
    
    if (startButtons.length > 0) {
      const firstButton = startButtons[0];
      const buttonText = await firstButton.textContent();
      const buttonHref = await firstButton.getAttribute('href');
      
      console.log(`Clicking first start button: "${buttonText?.trim()}" → "${buttonHref}"`);
      
      await firstButton.click();
      await page.waitForLoadState('domcontentloaded');
      
      const newUrl = page.url();
      console.log(`After click, now at: ${newUrl}`);
      
      // Take screenshot
      await page.screenshot({ path: 'after-start-button-click.png', fullPage: true });
    }
  });
});

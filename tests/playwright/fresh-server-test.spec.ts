import { test, expect } from '@playwright/test';

test.describe('Fresh Server Navigation Test', () => {
  test('test navigation after server restart', async ({ page }) => {
    console.log('Testing with fresh server...');
    
    // Navigate to landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Landing page loaded');
    
    // Check for our debug comment
    const content = await page.content();
    const hasDebugComment = content.includes('Test comment 12345');
    console.log('Debug comment found:', hasDebugComment);
    
    // Check all links
    const allLinks = await page.locator('a').all();
    console.log(`\nFound ${allLinks.length} links:`);
    
    for (let i = 0; i < allLinks.length; i++) {
      const href = await allLinks[i].getAttribute('href');
      const text = await allLinks[i].textContent();
      console.log(`${i + 1}: "${text?.trim()}" → "${href}"`);
    }
    
    // Count specific links
    const step1Links = await page.locator('a[href="/step1"]').count();
    const startLinks = await page.locator('a[href="/start"]').count();
    const dashboardLinks = await page.locator('a[href="/dashboard"]').count();
    
    console.log(`\nLink counts:`);
    console.log(`step1: ${step1Links}, start: ${startLinks}, dashboard: ${dashboardLinks}`);
    
    // If we have any step1 links, try clicking one
    if (step1Links > 0) {
      console.log('Found step1 links! Testing navigation...');
      const step1Link = page.locator('a[href="/step1"]').first();
      
      await step1Link.click();
      await page.waitForURL('**/step1');
      
      console.log('✅ Successfully navigated to step 1!');
      console.log('Current URL:', page.url());
      
      await page.screenshot({ path: 'successful-step1-navigation.png', fullPage: true });
    } else {
      console.log('No step1 links found, testing alternative navigation...');
      
      // Try clicking any available button and see what happens
      const anyButton = page.locator('a').filter({ hasText: /get started|start|dashboard/i }).first();
      if (await anyButton.count() > 0) {
        const buttonText = await anyButton.textContent();
        const buttonHref = await anyButton.getAttribute('href');
        console.log(`Clicking: "${buttonText}" → "${buttonHref}"`);
        
        await anyButton.click();
        await page.waitForTimeout(2000);
        
        console.log('After click, URL:', page.url());
      }
    }
  });
});

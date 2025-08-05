import { test, expect } from '@playwright/test';

test.describe('Cache-busted Navigation Test', () => {
  test('navigate with cache disabled', async ({ page }) => {
    // Disable cache to get fresh content
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
    
    // Force reload to bypass cache
    await page.reload({ waitUntil: 'networkidle' });
    
    console.log('Page loaded with cache disabled');
    
    // Check the raw HTML source
    const pageContent = await page.content();
    console.log('Raw HTML contains:');
    
    // Check for href="/step1"
    const step1Matches = (pageContent.match(/href="\/step1"/g) || []).length;
    console.log(`Found ${step1Matches} instances of href="/step1" in HTML`);
    
    // Check for href="/start" 
    const startMatches = (pageContent.match(/href="\/start"/g) || []).length;
    console.log(`Found ${startMatches} instances of href="/start" in HTML`);
    
    // Check for href="/dashboard"
    const dashboardMatches = (pageContent.match(/href="\/dashboard"/g) || []).length;
    console.log(`Found ${dashboardMatches} instances of href="/dashboard" in HTML`);
    
    // Show actual link elements
    const allLinks = await page.locator('a').all();
    
    for (let i = 0; i < allLinks.length; i++) {
      const link = allLinks[i];
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href?.includes('step1') || href?.includes('start') || href?.includes('dashboard')) {
        console.log(`Important link: "${text?.trim()}" → "${href}"`);
      }
    }
    
    // Try to navigate to step1 directly
    await page.goto('http://localhost:5000/step1', { waitUntil: 'networkidle' });
    console.log('Direct navigation to /step1 successful');
    console.log('Step 1 URL:', page.url());
    
    await page.screenshot({ path: 'direct-step1-navigation.png', fullPage: true });
  });
});

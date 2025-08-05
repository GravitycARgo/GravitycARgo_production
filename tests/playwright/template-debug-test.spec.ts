import { test, expect } from '@playwright/test';

test.describe('Template Debug Test', () => {
  test('check if template changes are reflected', async ({ page }) => {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle' });
    
    const pageContent = await page.content();
    
    // Check if our debug comment is present
    const hasDebugComment = pageContent.includes('Test comment 12345');
    console.log('Debug comment found:', hasDebugComment);
    
    // Show a snippet of the HTML around links
    const linkMatches = pageContent.match(/<a[^>]*href="[^"]*"[^>]*>[^<]*<\/a>/gi);
    console.log('Found links in HTML:');
    linkMatches?.forEach((link, i) => {
      if (link.includes('start') || link.includes('step') || link.includes('dashboard')) {
        console.log(`${i + 1}: ${link}`);
      }
    });
    
    // Also check what the actual DOM elements show
    const domLinks = await page.locator('a').all();
    console.log('\nDOM links:');
    for (let i = 0; i < domLinks.length; i++) {
      const href = await domLinks[i].getAttribute('href');
      const text = await domLinks[i].textContent();
      if (href?.includes('start') || href?.includes('step') || href?.includes('dashboard')) {
        console.log(`DOM ${i + 1}: "${text?.trim()}" → "${href}"`);
      }
    }
  });
});

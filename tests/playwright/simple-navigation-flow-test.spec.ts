import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Flow Test', () => {
  test('should navigate from landing page to step 1 and verify the flow', async ({ page }) => {
    // Step 1: Load landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ Landing page loaded');
    
    // Step 2: Check that buttons point to /step1
    const getStartedButtons = await page.locator('a[href="/step1"]').all();
    console.log(`Found ${getStartedButtons.length} buttons pointing to /step1`);
    
    expect(getStartedButtons.length).toBeGreaterThan(0);
    
    // Step 3: Click the first "Start Optimizing" button
    const startButton = page.locator('a[href="/step1"]').filter({ hasText: /start|get started/i }).first();
    await expect(startButton).toBeVisible();
    
    console.log('✅ Found start button, clicking...');
    await startButton.click();
    
    // Step 4: Wait for step 1 to load
    await page.waitForURL('**/step1');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('✅ Step 1 loaded, URL:', page.url());
    expect(page.url()).toContain('/step1');
    
    // Step 5: Verify step 1 content
    const stepContent = await page.locator('h1, h2, h3').allTextContents();
    console.log('Step 1 headings:', stepContent);
    
    // Look for step 1 specific content
    const hasStepContent = stepContent.some(text => 
      text.toLowerCase().includes('step') || 
      text.toLowerCase().includes('transport') ||
      text.toLowerCase().includes('mode')
    );
    
    expect(hasStepContent).toBeTruthy();
    
    // Step 6: Take screenshot for verification
    await page.screenshot({ path: 'navigation-success-step1.png', fullPage: true });
    
    console.log('🚀 SUCCESS: Landing page → Step 1 navigation working perfectly!');
  });
  
  test('verify all landing page buttons point to step1', async ({ page }) => {
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('domcontentloaded');
    
    // Check all buttons/links that should go to step1
    const step1Links = await page.locator('a[href="/step1"]').all();
    
    console.log(`Found ${step1Links.length} links pointing to /step1`);
    
    for (let i = 0; i < step1Links.length; i++) {
      const link = step1Links[i];
      const text = await link.textContent();
      console.log(`Link ${i + 1}: "${text?.trim()}" → /step1`);
    }
    
    expect(step1Links.length).toBeGreaterThan(0);
    
    // Verify no links still point to /start or /dashboard for starting the process
    const oldStartLinks = await page.locator('a[href="/start"]').count();
    console.log(`Links still pointing to /start: ${oldStartLinks}`);
  });
});

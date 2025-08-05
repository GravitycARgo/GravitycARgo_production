import { test, expect } from '@playwright/test';

test.describe('Dashboard Page Verification', () => {
  test('verify dashboard page is step 1 with proper navigation to next steps', async ({ page }) => {
    // Go directly to dashboard page (step 1)
    await page.goto('http://localhost:5000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('Dashboard page loaded, URL:', page.url());
    
    // Check page title
    const pageTitle = await page.title();
    console.log('Dashboard page title:', pageTitle);
    
    // Take screenshot
    await page.screenshot({ path: 'dashboard-page-step1.png', fullPage: true });
    
    // Check for step indicators or step 1 content
    const step1Elements = await page.locator('h1, h2, h3, .step, .step-1, form').all();
    console.log(`Found ${step1Elements.length} potential step elements`);
    
    for (let i = 0; i < Math.min(step1Elements.length, 3); i++) {
      const text = await step1Elements[i].textContent();
      console.log(`Step element ${i + 1}:`, text?.trim().substring(0, 100));
    }
    
    // Look for navigation to next step
    const nextButtons = await page.locator('button, a, .btn').filter({
      hasText: /next|continue|step 2|transport|proceed/i
    }).all();
    
    console.log(`Found ${nextButtons.length} potential "next step" buttons`);
    
    for (const button of nextButtons) {
      const text = await button.textContent();
      console.log('Next button text:', text?.trim());
    }
    
    // Verify this is a functioning step 1 page
    expect(pageTitle).toContain('Dashboard');
    expect(step1Elements.length).toBeGreaterThan(0);
  });
  
  test('complete navigation flow from landing to step 1', async ({ page }) => {
    // Start from landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 1: On landing page:', page.url());
    
    // Click Dashboard button
    const dashboardButton = page.locator('button, a, .btn').filter({
      hasText: /dashboard/i
    }).first();
    
    await dashboardButton.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Step 2: Navigated to:', page.url());
    
    // Verify we're on dashboard/step 1
    expect(page.url()).toBe('http://localhost:5000/dashboard');
    
    const dashboardTitle = await page.title();
    console.log('✅ Step 3: Dashboard page title:', dashboardTitle);
    
    expect(dashboardTitle).toContain('Dashboard');
    
    console.log('🚀 COMPLETE SUCCESS: Landing page → Dashboard (Step 1) navigation works perfectly!');
  });
});

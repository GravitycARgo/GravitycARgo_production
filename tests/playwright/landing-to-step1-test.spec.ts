import { test, expect } from '@playwright/test';

test.describe('Landing to Step 1 Navigation Test', () => {
  test('should navigate from landing page to step 1 HTML file when clicking start buttons', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 1: Landing page loaded');
    
    // Test the "Get Started" button in navigation
    const getStartedButton = page.locator('a').filter({ hasText: 'Get Started' }).first();
    await expect(getStartedButton).toBeVisible();
    
    const getStartedHref = await getStartedButton.getAttribute('href');
    console.log('Get Started button href:', getStartedHref);
    expect(getStartedHref).toBe('/step1');
    
    // Test the "Start Optimizing" button in hero section
    const startOptimizingButton = page.locator('a').filter({ hasText: 'Start Optimizing' }).first();
    await expect(startOptimizingButton).toBeVisible();
    
    const startOptimizingHref = await startOptimizingButton.getAttribute('href');
    console.log('Start Optimizing button href:', startOptimizingHref);
    expect(startOptimizingHref).toBe('/step1');
    
    // Test the Dashboard button
    const dashboardButton = page.locator('a').filter({ hasText: 'Dashboard' }).first();
    await expect(dashboardButton).toBeVisible();
    
    const dashboardHref = await dashboardButton.getAttribute('href');
    console.log('Dashboard button href:', dashboardHref);
    expect(dashboardHref).toBe('/step1');
    
    console.log('✅ Step 2: All buttons point to /step1');
    
    // Click the "Start Optimizing" button
    await startOptimizingButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify we're on step 1
    const currentUrl = page.url();
    console.log('✅ Step 3: Navigated to:', currentUrl);
    expect(currentUrl).toBe('http://localhost:5000/step1');
    
    // Verify step 1 page content
    await expect(page.locator('h1, h2, h3')).toContainText(['Step 1', 'Transport', 'Mode']);
    
    // Take a screenshot of step 1
    await page.screenshot({ path: 'step1-page-loaded.png', fullPage: true });
    
    console.log('✅ Step 4: Step 1 page loaded successfully');
    
    // Test navigation to step 2
    const nextButton = page.locator('button, a').filter({ hasText: /next|continue|step 2/i }).first();
    
    if (await nextButton.count() > 0) {
      console.log('Found next button, testing step 1 → step 2 navigation');
      
      // First select a transport mode if required
      const transportOption = page.locator('input[name="transport_mode"], select[name="transport_mode"] option').first();
      if (await transportOption.count() > 0) {
        await transportOption.click();
        console.log('Selected transport mode');
      }
      
      await nextButton.click();
      await page.waitForLoadState('networkidle');
      
      const step2Url = page.url();
      console.log('✅ Step 5: Navigated to step 2:', step2Url);
      expect(step2Url).toContain('step2');
      
      await page.screenshot({ path: 'step2-page-loaded.png', fullPage: true });
    }
    
    console.log('🚀 SUCCESS: Multi-step navigation working correctly!');
  });
  
  test('verify step 1 page structure and form elements', async ({ page }) => {
    // Go directly to step 1
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    
    console.log('Step 1 page loaded directly');
    
    // Check page title
    const pageTitle = await page.title();
    console.log('Step 1 page title:', pageTitle);
    
    // Check for form elements
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input, select').count();
    const buttons = await page.locator('button').count();
    
    console.log(`Step 1 elements - Forms: ${forms}, Inputs: ${inputs}, Buttons: ${buttons}`);
    
    // Verify this is actually the step 1 template
    expect(forms).toBeGreaterThan(0);
    expect(inputs + buttons).toBeGreaterThan(0);
    
    // Take screenshot
    await page.screenshot({ path: 'step1-structure-verification.png', fullPage: true });
  });
});

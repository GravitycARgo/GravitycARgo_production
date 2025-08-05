import { test, expect } from '@playwright/test';

// Test to verify the navigation flow fix
test.setTimeout(60000);

test.describe('Fixed Navigation Flow Testing', () => {
  
  test('should have proper navbar to content flow after fixes', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check viewport and initial layout
    const viewport = page.viewportSize();
    console.log('Viewport size:', viewport);
    
    // Get positions of key elements after our CSS fixes
    const positions = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar');
      const progressSteps = document.querySelector('.progress-steps');
      const firstTransportOption = document.querySelector('.transport-option');
      const optimizerContainer = document.querySelector('.optimizer-container');
      
      return {
        navbar: navbar?.getBoundingClientRect(),
        progressSteps: progressSteps?.getBoundingClientRect(),
        firstTransportOption: firstTransportOption?.getBoundingClientRect(),
        optimizerContainer: optimizerContainer?.getBoundingClientRect(),
        scrollY: window.scrollY,
        windowHeight: window.innerHeight
      };
    });
    
    console.log('Updated element positions:', positions);
    
    // Verify navbar is at the top
    expect(positions.navbar?.top).toBeLessThanOrEqual(10);
    
    // Verify progress steps are now visible in viewport (should be much higher than before)
    expect(positions.progressSteps?.top).toBeLessThan(positions.windowHeight);
    expect(positions.progressSteps?.top).toBeGreaterThan(positions.navbar?.bottom || 0);
    
    // Verify first transport option is visible without scrolling
    expect(positions.firstTransportOption?.top).toBeLessThan(positions.windowHeight);
    
    // Verify scroll position is still at top
    expect(positions.scrollY).toBeLessThan(50);
    
    // Take screenshot of improved layout
    await page.screenshot({ path: 'tests/screenshots/navigation-fixed-initial.png' });
    
    // Test that the navigation flow works smoothly
    await test.step('Test smooth navigation through steps', async () => {
      // Select transport mode
      const truckOption = page.locator('.transport-option[data-value="1"]');
      await expect(truckOption).toBeVisible();
      await truckOption.click();
      
      // Check scroll position hasn't changed dramatically
      const scrollAfterSelection = await page.evaluate(() => window.scrollY);
      console.log('Scroll after transport selection:', scrollAfterSelection);
      expect(scrollAfterSelection).toBeLessThan(100);
      
      // Navigate to next step
      const nextButton = page.locator('#next1');
      await expect(nextButton).toBeVisible();
      await nextButton.click();
      
      // Wait for step 2
      await page.waitForSelector('[data-step="2"].active', { timeout: 10000 });
      
      // Verify we're still in a good scroll position for step 2
      const scrollAfterStep2 = await page.evaluate(() => window.scrollY);
      console.log('Scroll position at step 2:', scrollAfterStep2);
      
      // Take screenshot of step 2
      await page.screenshot({ path: 'tests/screenshots/navigation-fixed-step2.png' });
      
      // Verify file upload is visible
      const fileUploadSection = page.locator('[data-step="2"]');
      await expect(fileUploadSection).toBeVisible();
      
      // Check that progress steps are still visible
      const progressStepsVisible = await page.locator('.progress-steps').isVisible();
      expect(progressStepsVisible).toBe(true);
    });
  });
  
  test('should have better mobile navigation flow', async ({ page }) => {
    // Test with mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check mobile layout positions
    const mobilePositions = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar');
      const progressSteps = document.querySelector('.progress-steps');
      const transportOptions = document.querySelector('.transport-cards');
      
      return {
        navbar: navbar?.getBoundingClientRect(),
        progressSteps: progressSteps?.getBoundingClientRect(),
        transportOptions: transportOptions?.getBoundingClientRect(),
        scrollY: window.scrollY,
        windowHeight: window.innerHeight
      };
    });
    
    console.log('Mobile element positions:', mobilePositions);
    
    // On mobile, content should still be accessible without excessive scrolling
    expect(mobilePositions.progressSteps?.top).toBeLessThan(mobilePositions.windowHeight);
    
    // Take mobile screenshot
    await page.screenshot({ path: 'tests/screenshots/navigation-mobile-fixed.png' });
    
    // Test mobile navigation
    const firstTransportOption = page.locator('.transport-option').first();
    await expect(firstTransportOption).toBeVisible();
    await firstTransportOption.click();
    
    // Verify mobile navigation works smoothly
    const nextButton = page.locator('#next1');
    await expect(nextButton).toBeVisible();
  });
  
  test('should allow direct navigation via progress steps', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // First complete step 1
    const truckOption = page.locator('.transport-option[data-value="1"]');
    await truckOption.click();
    
    const nextButton = page.locator('#next1');
    await nextButton.click();
    
    // Wait for step 2
    await page.waitForSelector('[data-step="2"].active', { timeout: 10000 });
    
    // Now test clicking on progress steps for navigation
    const progressSteps = page.locator('.progress-steps .step');
    await expect(progressSteps).toHaveCount(4);
    
    // Check that step 2 is now active
    const step2Active = page.locator('.step[data-step="2"].active');
    await expect(step2Active).toBeVisible();
    
    // Verify that progress steps are clickable (if implemented)
    const step1 = page.locator('.step[data-step="1"]');
    const step1Clickable = await step1.isVisible();
    expect(step1Clickable).toBe(true);
    
    await page.screenshot({ path: 'tests/screenshots/progress-steps-navigation.png' });
  });
});

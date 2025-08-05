import { test, expect } from '@playwright/test';

// Test to identify and fix navigation flow issues
test.setTimeout(60000);

test.describe('Navigation Flow Testing', () => {
  
  test('should start navigation from navbar and progress properly through steps', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check initial page load and navbar position
    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();
    
    // Get navbar position (should be at top)
    const navbarBox = await navbar.boundingBox();
    console.log('Navbar position:', navbarBox);
    
    // Check that progress steps are visible and at the top
    const progressSteps = page.locator('.progress-steps');
    await expect(progressSteps).toBeVisible();
    
    const progressBox = await progressSteps.boundingBox();
    console.log('Progress steps position:', progressBox);
    
    // Ensure progress steps are below navbar but above form content
    expect(progressBox?.y).toBeGreaterThan(navbarBox?.y || 0);
    
    // Check viewport position - user should see the form from the top
    const viewport = page.viewportSize();
    console.log('Viewport size:', viewport);
    
    // Check scroll position - should start at top
    const scrollY = await page.evaluate(() => window.scrollY);
    console.log('Initial scroll position:', scrollY);
    expect(scrollY).toBeLessThan(100); // Should be near top
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/navigation-initial.png' });
    
    // Test step navigation flow
    await test.step('Navigate through steps properly', async () => {
      // Step 1: Select transport mode
      const truckOption = page.locator('.transport-option[data-value="1"]');
      await expect(truckOption).toBeVisible();
      
      // Ensure transport options are visible in viewport
      const truckBox = await truckOption.boundingBox();
      console.log('Transport option position:', truckBox);
      
      await truckOption.click();
      
      // Verify step 1 is still active and visible
      const step1 = page.locator('.step[data-step="1"].active');
      await expect(step1).toBeVisible();
      
      // Click Next to go to Step 2
      const nextButton = page.locator('#next1');
      await expect(nextButton).toBeVisible();
      await nextButton.click();
      
      // Wait for step 2 to become active
      await page.waitForSelector('[data-step="2"].active', { timeout: 10000 });
      
      // Check that we're still at a reasonable scroll position
      const scrollY2 = await page.evaluate(() => window.scrollY);
      console.log('Scroll position after step 2:', scrollY2);
      
      // Take screenshot of step 2
      await page.screenshot({ path: 'tests/screenshots/navigation-step2.png' });
      
      // Verify file upload section is visible
      const fileUploadSection = page.locator('[data-step="2"]');
      await expect(fileUploadSection).toBeVisible();
      
      // Check that progress indicator shows step 2 as active
      const step2 = page.locator('.step[data-step="2"].active');
      await expect(step2).toBeVisible();
    });
  });
  
  test('should maintain proper scroll behavior during navigation', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Record initial scroll positions of key elements
    const positions = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar');
      const progressSteps = document.querySelector('.progress-steps');
      const formSection = document.querySelector('.form-section');
      
      return {
        navbar: navbar?.getBoundingClientRect(),
        progressSteps: progressSteps?.getBoundingClientRect(),
        formSection: formSection?.getBoundingClientRect(),
        scrollY: window.scrollY,
        windowHeight: window.innerHeight
      };
    });
    
    console.log('Initial element positions:', positions);
    
    // Verify that the form starts at the top of the visible area
    expect(positions.scrollY).toBeLessThan(200);
    expect(positions.progressSteps?.top).toBeLessThan(positions.windowHeight);
    
    // Test navigation without unexpected scrolling
    const truckOption = page.locator('.transport-option[data-value="1"]');
    await truckOption.click();
    
    // Check scroll position hasn't jumped to bottom
    const scrollAfterClick = await page.evaluate(() => window.scrollY);
    console.log('Scroll after transport selection:', scrollAfterClick);
    expect(scrollAfterClick).toBeLessThan(positions.scrollY + 100);
  });
  
  test('should have navbar navigation working properly', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Test navbar Home link
    const homeLink = page.locator('.nav-link[href="/"]');
    await expect(homeLink).toBeVisible();
    
    // Test that navbar is always visible (fixed position)
    const navbar = page.locator('.navbar');
    const isFixed = await page.evaluate(() => {
      const nav = document.querySelector('.navbar');
      return nav ? window.getComputedStyle(nav).position : 'not found';
    });
    
    console.log('Navbar position style:', isFixed);
    
    // Scroll down and verify navbar is still visible
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(navbar).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/navbar-scroll-test.png' });
  });
});

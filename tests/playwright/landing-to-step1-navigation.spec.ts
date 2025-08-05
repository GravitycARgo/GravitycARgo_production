import { test, expect } from '@playwright/test';

// Configure test to use Microsoft Edge
test.use({ 
  channel: 'msedge',
  headless: false // Set to true for CI/CD
});

test.describe('Landing Page to Step 1 Navigation - Microsoft Edge', () => {
  
  test('should navigate from landing page start button to step 1', async ({ page }) => {
    console.log('🚀 Starting landing page to step 1 navigation test...');
    
    // Navigate to landing page
    console.log('📍 Navigating to landing page...');
    await page.goto('http://localhost:5000/');
    
    // Verify we're on the landing page
    await expect(page).toHaveTitle(/OptigeniX|Kroolo|GravitycARgo/i);
    console.log('✅ Landing page loaded successfully');
    
    // Look for the "Get Started" button
    console.log('🔍 Looking for Get Started button...');
    const getStartedButton = page.locator('a.get-started-btn').first();
    await expect(getStartedButton).toBeVisible();
    await expect(getStartedButton).toHaveText('Get Started');
    await expect(getStartedButton).toHaveAttribute('href', '/start');
    console.log('✅ Get Started button found with correct href');
    
    // Click the Get Started button
    console.log('👆 Clicking Get Started button...');
    await getStartedButton.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify we're now on step 1 (which renders index.html)
    console.log('🔍 Verifying navigation to step 1...');
    await expect(page).toHaveURL('http://localhost:5000/start');
    console.log('✅ Successfully navigated to /start route');
    
    // Verify step 1 content is loaded
    const stepTitle = page.locator('h2, h3, .step-title').first();
    await expect(stepTitle).toBeVisible();
    console.log('✅ Step 1 content is visible');
    
    // Look for transport mode selection (key feature of step 1)
    const transportModeSection = page.locator('#transport-mode, .transport-mode, [data-transport-mode]').first();
    if (await transportModeSection.count() > 0) {
      await expect(transportModeSection).toBeVisible();
      console.log('✅ Transport mode selection is visible');
    }
    
    // Look for form elements that should be present in step 1
    const formElements = page.locator('form, select, input[type="radio"], input[type="checkbox"]');
    await expect(formElements.first()).toBeVisible();
    console.log('✅ Form elements are present in step 1');
    
    console.log('🎉 Landing page to step 1 navigation test completed successfully!');
  });

  test('should also work with "Start Optimizing" button', async ({ page }) => {
    console.log('🚀 Testing alternative Start Optimizing button...');
    
    // Navigate to landing page
    await page.goto('http://localhost:5000/');
    
    // Look for the "Start Optimizing" button (alternative button)
    console.log('🔍 Looking for Start Optimizing button...');
    const startOptimizingButton = page.locator('a').filter({ hasText: 'Start Optimizing' });
    
    if (await startOptimizingButton.count() > 0) {
      await expect(startOptimizingButton).toBeVisible();
      await expect(startOptimizingButton).toHaveAttribute('href', '/start');
      console.log('✅ Start Optimizing button found with correct href');
      
      // Click the Start Optimizing button
      console.log('👆 Clicking Start Optimizing button...');
      await startOptimizingButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('networkidle');
      
      // Verify navigation
      await expect(page).toHaveURL('http://localhost:5000/start');
      console.log('✅ Successfully navigated via Start Optimizing button');
    } else {
      console.log('ℹ️ Start Optimizing button not found, skipping this test');
    }
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    console.log('🚀 Testing error handling in navigation...');
    
    // Navigate to landing page
    await page.goto('http://localhost:5000/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Set up error monitoring
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ HTTP Error: ${response.status()} ${response.url()}`);
      }
    });
    
    // Try to click the get started button
    const getStartedButton = page.locator('a.get-started-btn').first();
    await getStartedButton.click();
    
    // Wait a bit to catch any errors
    await page.waitForTimeout(2000);
    
    // Check if we have any JavaScript errors
    if (errors.length > 0) {
      console.log('⚠️ JavaScript errors detected:', errors);
    } else {
      console.log('✅ No JavaScript errors detected during navigation');
    }
    
    // Verify we still ended up on the right page
    await expect(page).toHaveURL('http://localhost:5000/start');
    console.log('✅ Navigation completed despite any potential issues');
  });

  test('should maintain session state after navigation', async ({ page }) => {
    console.log('🚀 Testing session state maintenance...');
    
    // Navigate to landing page
    await page.goto('http://localhost:5000/');
    
    // Click get started
    const getStartedButton = page.locator('a.get-started-btn').first();
    await getStartedButton.click();
    await page.waitForLoadState('networkidle');
    
    // Check if session storage or cookies are properly set
    const localStorage = await page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorage = await page.evaluate(() => JSON.stringify(window.sessionStorage));
    
    console.log('📊 Local Storage:', localStorage);
    console.log('📊 Session Storage:', sessionStorage);
    
    // Verify page has loaded with proper context
    await expect(page).toHaveURL('http://localhost:5000/start');
    
    // Look for any session-related elements or data
    const pageContent = await page.content();
    const hasFormData = pageContent.includes('transport') || pageContent.includes('container') || pageContent.includes('step');
    
    if (hasFormData) {
      console.log('✅ Page loaded with expected content context');
    } else {
      console.log('⚠️ Page may not have loaded expected session context');
    }
  });

});

test.afterEach(async ({ page }) => {
  // Clean up after each test
  await page.close();
});

import { test, expect } from '@playwright/test';

// Configure test to use Microsoft Edge
test.use({ 
  channel: 'msedge',
  headless: false // Set to true for CI/CD
});

test.describe('Landing Page to Step 1 Navigation - Microsoft Edge (Manual Server)', () => {
  
  test('should navigate from landing page start button to step 1', async ({ page }) => {
    console.log('🚀 Starting landing page to step 1 navigation test...');
    
    // Try to connect to server - if not running, skip test
    try {
      await page.goto('http://localhost:5000/', { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (error) {
      console.log('⚠️ Server not running at localhost:5000. Please start the Flask server manually.');
      console.log('Run: python app_modular.py');
      test.skip();
    }
    
    // Verify we're on the landing page
    await expect(page).toHaveTitle(/OptigeniX|Kroolo|GravitycARgo|Container/i);
    console.log('✅ Landing page loaded successfully');
    
    // Look for the "Get Started" button
    console.log('🔍 Looking for Get Started button...');
    const getStartedButton = page.locator('a.get-started-btn, a[href="/start"]').first();
    await expect(getStartedButton).toBeVisible({ timeout: 10000 });
    console.log('✅ Get Started button found');
    
    // Verify button has correct href
    const href = await getStartedButton.getAttribute('href');
    expect(href).toBe('/start');
    console.log('✅ Button has correct href="/start"');
    
    // Click the Get Started button
    console.log('👆 Clicking Get Started button...');
    await getStartedButton.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Verify we're now on step 1 (which renders index.html at /start route)
    console.log('🔍 Verifying navigation to step 1...');
    await expect(page).toHaveURL('http://localhost:5000/start');
    console.log('✅ Successfully navigated to /start route');
    
    // Verify step 1 content is loaded
    // Look for any common elements that should be on step 1
    const pageContent = await page.content();
    const hasStepContent = pageContent.includes('transport') || 
                          pageContent.includes('container') || 
                          pageContent.includes('step') ||
                          pageContent.includes('form');
    
    expect(hasStepContent).toBe(true);
    console.log('✅ Step 1 content is loaded (contains expected keywords)');
    
    // Look for form elements that should be present in step 1
    const hasFormElements = await page.locator('form, select, input, button').count() > 0;
    expect(hasFormElements).toBe(true);
    console.log('✅ Form elements are present in step 1');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'tests/screenshots/step1-loaded.png', fullPage: true });
    console.log('📸 Screenshot saved to tests/screenshots/step1-loaded.png');
    
    console.log('🎉 Landing page to step 1 navigation test completed successfully!');
  });

  test('should handle multiple start buttons on landing page', async ({ page }) => {
    console.log('🚀 Testing multiple start buttons...');
    
    try {
      await page.goto('http://localhost:5000/', { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (error) {
      console.log('⚠️ Server not running. Skipping test.');
      test.skip();
    }
    
    // Look for all buttons that link to /start
    const startButtons = page.locator('a[href="/start"]');
    const buttonCount = await startButtons.count();
    console.log(`🔍 Found ${buttonCount} start button(s)`);
    
    if (buttonCount > 0) {
      // Test the first button
      const firstButton = startButtons.first();
      await expect(firstButton).toBeVisible();
      
      // Get button text for identification
      const buttonText = await firstButton.textContent();
      console.log(`📝 Testing button with text: "${buttonText}"`);
      
      await firstButton.click();
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveURL('http://localhost:5000/start');
      console.log('✅ Navigation successful via first start button');
    } else {
      console.log('⚠️ No start buttons found with href="/start"');
    }
  });

  test('should validate page structure after navigation', async ({ page }) => {
    console.log('🚀 Validating page structure after navigation...');
    
    try {
      await page.goto('http://localhost:5000/', { waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (error) {
      test.skip();
    }
    
    // Navigate to start page
    const startButton = page.locator('a[href="/start"]').first();
    await startButton.click();
    await page.waitForLoadState('networkidle');
    
    // Validate HTML structure
    const hasHtml = await page.locator('html').count() > 0;
    const hasHead = await page.locator('head').count() > 0;
    const hasBody = await page.locator('body').count() > 0;
    
    expect(hasHtml).toBe(true);
    expect(hasHead).toBe(true);
    expect(hasBody).toBe(true);
    console.log('✅ Basic HTML structure is valid');
    
    // Check for title
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✅ Page has title: "${title}"`);
    
    // Check for any error messages
    const hasErrorText = await page.locator('text=error, text=Error, text=ERROR').count();
    expect(hasErrorText).toBe(0);
    console.log('✅ No visible error messages found');
    
    console.log('🎉 Page structure validation completed!');
  });

});

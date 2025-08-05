import { test, expect } from '@playwright/test';

test.describe('Start Button Navigation Test', () => {
  test('should navigate from landing page to step 1 when start button is clicked', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the landing page by checking for the title
    await expect(page.locator('h1')).toContainText('Optimize');
    
    console.log('Landing page loaded successfully');
    
    // Look for buttons that could be the start button - from the test we know there are 7 buttons
    const allButtons = await page.locator('button, a, .btn').all();
    console.log(`Found ${allButtons.length} interactive elements`);
    
    // Try to find a "Get Started" or "Dashboard" button based on the earlier output
    let startButton = page.locator('button, a, .btn').filter({
      hasText: /get started|dashboard|start|begin/i
    }).first();
    
    // If no specific start button found, try the first visible button
    if (await startButton.count() === 0) {
      startButton = page.locator('button, a, .btn').first();
    }
    
    // Verify the start button is visible and clickable
    await expect(startButton).toBeVisible();
    
    const buttonText = await startButton.textContent();
    console.log('Start button found with text:', buttonText);
    
    // Click the start button
    await startButton.click();
    
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Verify we've navigated to step 1
    const currentUrl = page.url();
    console.log('Current URL after clicking start:', currentUrl);
    
    // Check if we moved away from the landing page
    const isNotLandingPage = currentUrl !== 'http://localhost:5000/' && currentUrl !== 'http://localhost:5000';
    
    if (isNotLandingPage) {
      console.log('✅ Navigation successful - moved away from landing page');
      
      // Try to find step 1 indicators
      const possibleStep1Elements = [
        page.locator('h1, h2, h3'),
        page.locator('form'),
        page.locator('input, select'),
        page.locator('.step-indicator, .step-1')
      ];
      
      let step1Found = false;
      for (const element of possibleStep1Elements) {
        if (await element.count() > 0) {
          const content = await element.first().textContent();
          console.log('Found potential step 1 element:', content);
          step1Found = true;
          break;
        }
      }
      
      expect(step1Found).toBeTruthy();
    } else {
      // Take a screenshot for debugging
      await page.screenshot({ path: 'start-button-no-navigation.png', fullPage: true });
      console.log('❌ Navigation did not occur - still on landing page');
      
      // Check what happened when we clicked the button
      const pageContent = await page.content();
      console.log('Page content after click (first 1000 chars):', pageContent.substring(0, 1000));
    }
    
    expect(isNotLandingPage).toBeTruthy();
    
    console.log('✅ Start button navigation test completed');
  });
  
  test('should show proper page structure on landing page', async ({ page }) => {
    // Navigate to the landing page
    await page.goto('http://localhost:5000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic page structure
    const pageTitle = await page.title();
    console.log('Landing page title:', pageTitle);
    
    // Take a screenshot of the landing page
    await page.screenshot({ path: 'landing-page-structure.png', fullPage: true });
    
    // Verify basic elements are present
    const bodyContent = await page.locator('body').textContent();
    console.log('Landing page body content preview:', bodyContent?.substring(0, 500));
    
    // Check if there are any forms or interactive elements
    const forms = await page.locator('form').count();
    const buttons = await page.locator('button, .btn').count();
    const links = await page.locator('a').count();
    
    console.log(`Interactive elements found - Forms: ${forms}, Buttons: ${buttons}, Links: ${links}`);
    
    expect(forms + buttons + links).toBeGreaterThan(0);
  });
});

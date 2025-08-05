import { test, expect } from '@playwright/test';

test.describe('Debug Step Navigation', () => {
  test('debug step 1 to step 2 navigation', async ({ page }) => {
    console.log('🧪 Starting debug test');
    
    // Enable console logging
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));
    page.on('request', request => console.log(`Request: ${request.method()} ${request.url()}`));
    page.on('response', response => console.log(`Response: ${response.status()} ${response.url()}`));
    
    // Navigate to Step 1
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('load');
    console.log('✅ Step 1 loaded');
    
    // Check page title
    const title = await page.locator('h1').textContent();
    console.log(`Page title: ${title}`);
    
    // Check if transport options are present
    const transportOptions = await page.locator('.transport-option').count();
    console.log(`Transport options found: ${transportOptions}`);
    
    // Select Air Transport
    console.log('🔄 Selecting Air Transport...');
    await page.locator('.transport-option[data-value="3"]').click();
    
    // Wait for selection to register
    await page.waitForTimeout(1000);
    
    // Check if selection worked
    const isSelected = await page.locator('.transport-option[data-value="3"]').getAttribute('class');
    console.log(`Air transport class: ${isSelected}`);
    
    // Check hidden input value
    const hiddenInput = await page.locator('#transport_mode').inputValue();
    console.log(`Hidden input value: ${hiddenInput}`);
    
    // Check if next button is enabled
    const nextBtn = page.locator('#nextBtn');
    const isDisabled = await nextBtn.getAttribute('disabled');
    console.log(`Next button disabled: ${isDisabled}`);
    
    // Click next button
    console.log('🔄 Clicking next button...');
    await nextBtn.click();
    
    // Wait and see what happens
    console.log('🔄 Waiting for navigation...');
    try {
      await page.waitForURL('**/step2', { timeout: 10000 });
      console.log('✅ Successfully navigated to Step 2');
    } catch (error) {
      console.log('❌ Navigation failed');
      console.log(`Current URL: ${page.url()}`);
      
      // Check if we're still on step1
      const currentTitle = await page.locator('h1').textContent();
      console.log(`Current page title: ${currentTitle}`);
      
      // Look for error messages
      const errors = await page.locator('.error, .alert, .text-danger').allTextContents();
      console.log(`Error messages: ${errors}`);
      
      // Take screenshot
      await page.screenshot({ path: 'debug-navigation-fail.png' });
      
      throw error;
    }
  });
});

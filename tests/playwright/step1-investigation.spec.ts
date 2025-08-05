import { test, expect } from '@playwright/test';

test.describe('Step 1 Page Investigation', () => {
  test('should investigate step1 page structure', async ({ page }) => {
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    
    console.log('Current URL:', page.url());
    
    // Take screenshot of step1 page
    await page.screenshot({ path: 'step1-page-investigation.png', fullPage: true });
    
    // Check for transport mode elements
    const allSelects = await page.locator('select').count();
    console.log(`Found ${allSelects} select elements`);
    
    const allInputs = await page.locator('input').count(); 
    console.log(`Found ${allInputs} input elements`);
    
    const allForms = await page.locator('form').count();
    console.log(`Found ${allForms} form elements`);
    
    // Log all select elements
    const selectElements = await page.locator('select').all();
    for (let i = 0; i < selectElements.length; i++) {
      const name = await selectElements[i].getAttribute('name');
      const id = await selectElements[i].getAttribute('id');
      console.log(`Select ${i}: name="${name}", id="${id}"`);
    }
    
    // Log all button elements
    const buttons = await page.locator('button').all();
    for (let i = 0; i < buttons.length; i++) {
      const text = await buttons[i].textContent();
      const type = await buttons[i].getAttribute('type');
      console.log(`Button ${i}: text="${text}", type="${type}"`);
    }
    
    // Get page content for debugging
    const pageContent = await page.content();
    const hasTransportMode = pageContent.includes('transport_mode');
    console.log(`Page contains 'transport_mode': ${hasTransportMode}`);
    
    if (hasTransportMode) {
      console.log('✅ Transport mode elements found on page');
    } else {
      console.log('❌ No transport mode elements found');
      console.log('Page title:', await page.title());
      
      // Check if we got redirected somewhere
      if (!page.url().includes('/step1')) {
        console.log('⚠️ Page was redirected away from step1');
      }
    }
  });
});

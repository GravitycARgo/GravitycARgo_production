import { test, expect } from '@playwright/test';

test('simple step navigation debug', async ({ page }) => {
  console.log('🧪 Starting simple debug test');
  
  // Navigate to Step 1
  await page.goto('http://localhost:5000/step1');
  await page.waitForLoadState('load');
  console.log('✅ Step 1 loaded');
  
  // Select Air Transport
  await page.locator('.transport-option[data-value="3"]').click();
  await page.waitForTimeout(500);
  
  // Check if selection worked
  const hiddenInput = await page.locator('#transport_mode').inputValue();
  console.log(`Hidden input value: ${hiddenInput}`);
  
  // Click next button
  console.log('🔄 Clicking next button...');
  await page.locator('#nextBtn').click();
  
  // Wait and check
  await page.waitForTimeout(3000);
  console.log(`Current URL: ${page.url()}`);
});

import { test, expect } from '@playwright/test';

test('test direct server access', async ({ page }) => {
  console.log('🧪 Testing direct server access');
  
  // Test if we can access the root page
  try {
    await page.goto('http://localhost:5000/');
    console.log('✅ Root page accessible');
    console.log(`Root page URL: ${page.url()}`);
  } catch (error) {
    console.log('❌ Root page error:', error);
  }
  
  // Test if we can access step1 directly
  try {
    await page.goto('http://localhost:5000/step1');
    console.log('✅ Step1 page accessible');
    console.log(`Step1 page URL: ${page.url()}`);
  } catch (error) {
    console.log('❌ Step1 page error:', error);
  }
  
  // Test if we can access step2 directly
  try {
    await page.goto('http://localhost:5000/step2');
    console.log('✅ Step2 accessible or redirected');
    console.log(`Step2 page URL: ${page.url()}`);
  } catch (error) {
    console.log('❌ Step2 page error:', error);
  }
});

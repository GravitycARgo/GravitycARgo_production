import { test, expect } from '@playwright/test';

test('test manual form submission', async ({ page }) => {
  console.log('🧪 Testing manual form submission');
  
  // Navigate to Step 1
  await page.goto('http://localhost:5000/step1');
  await page.waitForLoadState('load');
  
  // Set the hidden input value and submit form using JavaScript
  await page.evaluate(() => {
    const form = document.getElementById('step1Form') as HTMLFormElement;
    const input = document.getElementById('transport_mode') as HTMLInputElement;
    
    // Set the value
    input.value = '3';
    
    console.log('Form found:', !!form);
    console.log('Form action:', form?.action);
    console.log('Transport mode value set to:', input?.value);
    
    // Submit the form
    form?.submit();
  });
  
  // Wait a bit and check URL
  await page.waitForTimeout(3000);
  console.log(`Current URL after form submit: ${page.url()}`);
});

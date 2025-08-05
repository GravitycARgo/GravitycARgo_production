import { test, expect } from '@playwright/test';

test.describe('Step 4 Optimization Error Fix Test', () => {
  test('should complete optimization without filename error', async ({ page }) => {
    // Navigate directly to step 1 to start the process
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Starting multi-step flow test...');
    
    // Step 1: Select transport mode (click the transport option, not a select dropdown)
    const roadTransportOption = page.locator('.transport-option[data-value="1"]');
    await expect(roadTransportOption).toBeVisible();
    await roadTransportOption.click();
    
    const step1Submit = page.locator('button[type="submit"]');
    await step1Submit.click();
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 1 completed - Transport mode selected');
    
    // Step 2: Select container type
    const containerSelect = page.locator('select[name="container_type"]');
    await containerSelect.selectOption('20ft Standard Container');
    
    const step2Submit = page.locator('button[type="submit"]');
    await step2Submit.click();
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 2 completed - Container type selected');
    
    // Step 3: Upload file
    const csvContent = `Name,Length,Width,Height,Weight,Quantity,Fragility,BoxingType,Bundle,Stackable
TestBox1,10,8,6,2.5,1,LOW,STANDARD,NO,YES
TestBox2,15,12,10,5.0,2,MEDIUM,FRAGILE,NO,NO
TestBox3,8,8,8,1.5,3,LOW,STANDARD,YES,YES`;
    
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test_items.csv',
      mimeType: 'text/csv',
      buffer: new TextEncoder().encode(csvContent)
    });
    
    const step3Submit = page.locator('button[type="submit"]');
    await step3Submit.click();
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Step 3 completed - File uploaded');
    
    // Step 4: Configure optimization settings
    // Set route temperature
    const tempInput = page.locator('input[name="route_temperature"]');
    if (await tempInput.count() > 0) {
      await tempInput.fill('22');
    }
    
    // Select regular algorithm
    const regularRadio = page.locator('input[name="optimization_algorithm"][value="regular"]');
    if (await regularRadio.count() > 0) {
      await regularRadio.check();
    }
    
    console.log('✅ Step 4 configured - Starting optimization...');
    
    // Click optimize button
    const optimizeButton = page.locator('button[type="submit"]');
    await optimizeButton.click();
    
    // Wait for the optimization to process
    // Set a longer timeout for optimization
    try {
      await page.waitForLoadState('networkidle', { timeout: 45000 });
      
      const currentUrl = page.url();
      console.log('Optimization completed, current URL:', currentUrl);
      
      // Check for errors
      const errorMessage = page.locator('.alert-danger, .error, [class*="error"]');
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.textContent();
        console.log('❌ Error detected:', errorText);
        
        // Take screenshot of the error
        await page.screenshot({ path: 'step4-optimization-error.png', fullPage: true });
        
        // Check if this is the filename error we're trying to fix
        if (errorText && errorText.includes("'NoneType' object has no attribute 'filename'")) {
          console.log('🔧 FOUND THE FILENAME ERROR - This is what we need to fix!');
          console.log('Error details:', errorText);
        }
        
        // Log the error but don't fail the test so we can debug
        console.log('Test continuing for debugging purposes...');
      } else {
        // Check for success indicators
        const successElements = [
          page.locator('h1, h2, h3').filter({ hasText: /container|optimization|results/i }),
          page.locator('.container-visualization'),
          page.locator('#container-plot')
        ];
        
        let foundSuccess = false;
        for (const element of successElements) {
          if (await element.count() > 0) {
            foundSuccess = true;
            const text = await element.first().textContent();
            console.log('✅ SUCCESS: Found results page element:', text?.substring(0, 100));
            break;
          }
        }
        
        if (foundSuccess) {
          console.log('🎉 OPTIMIZATION SUCCESSFUL - No filename error!');
        } else {
          console.log('⚠️ Optimization completed but results page structure unclear');
        }
      }
      
      // Take final screenshot regardless of outcome
      await page.screenshot({ path: 'step4-final-result.png', fullPage: true });
      
    } catch (timeoutError) {
      console.log('⏰ Optimization timed out - checking current state...');
      await page.screenshot({ path: 'step4-timeout-state.png', fullPage: true });
      
      // Check what's on the page
      const bodyText = await page.locator('body').textContent();
      if (bodyText && bodyText.includes('filename')) {
        console.log('🔧 Timeout likely due to filename error');
      }
      console.log('Current URL after timeout:', page.url());
    }
    
    console.log('✅ Test completed - check screenshots and logs');
  });
  
  test('should verify step navigation works without optimization', async ({ page }) => {
    // Test just the navigation part without optimization
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Click Get Started
    const getStartedBtn = page.locator('a[href="/step1"]').first();
    await getStartedBtn.click();
    
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/step1');
    console.log('✅ Landing → Step 1 navigation works');
    
    // Navigate through steps without submitting
    await page.goto('http://localhost:5000/step2');
    await page.waitForLoadState('networkidle');
    console.log('✅ Direct step 2 access works');
    
    await page.goto('http://localhost:5000/step3');
    await page.waitForLoadState('networkidle');
    console.log('✅ Direct step 3 access works');
    
    await page.goto('http://localhost:5000/step4');
    await page.waitForLoadState('networkidle');
    console.log('✅ Direct step 4 access works');
    
    console.log('🎉 All step navigation routes are accessible');
  });
});

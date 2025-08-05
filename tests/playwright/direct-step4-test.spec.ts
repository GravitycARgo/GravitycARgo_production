import { test, expect } from '@playwright/test';

test.describe('Direct Step 4 Optimization Test', () => {
  test('should test step 4 optimization error directly', async ({ page }) => {
    // Create test CSV content
    const csvContent = `Name,Length,Width,Height,Weight,Quantity,Fragility,BoxingType,Bundle,Stackable
TestBox1,10,8,6,2.5,1,LOW,STANDARD,NO,YES
TestBox2,15,12,10,5.0,2,MEDIUM,FRAGILE,NO,NO
TestBox3,8,8,8,1.5,3,LOW,STANDARD,YES,YES`;

    // First, let's start by setting up session data by visiting each step
    console.log('📋 Setting up session data...');
    
    // Visit step1 to set up transport mode
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    
    // Click road transport option and see what happens
    const roadTransport = page.locator('.transport-option[data-value="1"]');
    if (await roadTransport.count() > 0) {
      await roadTransport.click();
      console.log('✅ Selected road transport');
      
      // Try to submit step 1
      const submitButtons = await page.locator('button').all();
      for (const button of submitButtons) {
        const text = await button.textContent();
        if (text && text.toLowerCase().includes('next')) {
          await button.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Step 1 submitted');
          break;
        }
      }
    }
    
    // Check if we're on step 2
    if (page.url().includes('step2')) {
      console.log('✅ On step 2');
      
      // Try to select a container
      const containerSelect = page.locator('select[name="container_type"]');
      if (await containerSelect.count() > 0) {
        await containerSelect.selectOption('20ft Standard Container');
        
        const nextButton = page.locator('button').filter({ hasText: /next/i });
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Step 2 submitted');
        }
      }
    }
    
    // Check if we're on step 3
    if (page.url().includes('step3')) {
      console.log('✅ On step 3');
      
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.count() > 0) {
        await fileInput.setInputFiles({
          name: 'test_items.csv',
          mimeType: 'text/csv',
          buffer: new TextEncoder().encode(csvContent)
        });
        
        const nextButton = page.locator('button').filter({ hasText: /next/i });
        if (await nextButton.count() > 0) {
          await nextButton.click();
          await page.waitForLoadState('networkidle');
          console.log('✅ Step 3 submitted');
        }
      }
    }
    
    // Now test step 4 directly
    await page.goto('http://localhost:5000/step4');
    await page.waitForLoadState('networkidle');
    
    console.log('📍 Current URL:', page.url());
    
    // Take screenshot of step 4
    await page.screenshot({ path: 'step4-before-optimization.png', fullPage: true });
    
    // Look for the optimize button or form
    const optimizeButtons = await page.locator('button').all();
    console.log(`Found ${optimizeButtons.length} buttons on step 4`);
    
    for (let i = 0; i < optimizeButtons.length; i++) {
      const text = await optimizeButtons[i].textContent();
      const type = await optimizeButtons[i].getAttribute('type');
      console.log(`Button ${i}: "${text?.trim()}" type="${type}"`);
    }
    
    // Try to submit the form to trigger the optimization
    const optimizeButton = page.locator('button').filter({ hasText: /start optimization/i });
    if (await optimizeButton.count() > 0) {
      console.log('🚀 Clicking "Start Optimization" button...');
      await optimizeButton.click();
      
      // Wait for response
      try {
        await page.waitForLoadState('networkidle', { timeout: 45000 });
        
        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);
        
        // Check for errors first
        const errorElements = await page.locator('.alert-danger, .error, [class*="error"]').all();
        if (errorElements.length > 0) {
          for (const errorEl of errorElements) {
            const errorText = await errorEl.textContent();
            console.log('❌ ERROR:', errorText);
            
            if (errorText && errorText.includes("'NoneType' object has no attribute 'filename'")) {
              console.log('🎯 FOUND THE FILENAME ERROR WE NEED TO FIX!');
              await page.screenshot({ path: 'filename-error-captured.png', fullPage: true });
            }
          }
        } else {
          // Check for optimization success indicators
          const successIndicators = [
            page.locator('h1, h2, h3').filter({ hasText: /container.*visualization|optimization.*complete|results/i }),
            page.locator('.container-visualization'),
            page.locator('#container-plot'),
            page.locator('[class*="plotly"]'),
            page.locator('.alert-success')
          ];
          
          let foundSuccessIndicator = false;
          for (const indicator of successIndicators) {
            if (await indicator.count() > 0) {
              const text = await indicator.first().textContent();
              console.log('✅ SUCCESS INDICATOR:', text?.substring(0, 100));
              foundSuccessIndicator = true;
              break;
            }
          }
          
          if (foundSuccessIndicator) {
            console.log('🎉 OPTIMIZATION SUCCESSFUL - Filename error has been FIXED!');
            await page.screenshot({ path: 'optimization-success-fixed.png', fullPage: true });
          } else {
            console.log('⚠️ No clear success indicators found');
            
            // Check ALL text that contains "error" on the page
            const allElements = await page.locator('*').all();
            for (const element of allElements) {
              try {
                const text = await element.textContent();
                if (text && text.toLowerCase().includes('error')) {
                  console.log('🔍 Found error text:', text.trim().substring(0, 200));
                }
                if (text && text.toLowerCase().includes('filename')) {
                  console.log('🎯 Found filename text:', text.trim().substring(0, 200));
                }
              } catch (e) {
                // Skip elements that can't be read
              }
            }
            
            // Check page content for clues
            const pageText = await page.locator('body').textContent();
            if (pageText) {
              if (pageText.includes('optimization')) {
                console.log('📄 Page contains "optimization" text');
              }
              if (pageText.includes('container')) {
                console.log('📄 Page contains "container" text');
              }
              if (pageText.includes('error')) {
                console.log('⚠️ Page contains "error" text');
              }
            }
            
            await page.screenshot({ path: 'optimization-unclear-result.png', fullPage: true });
          }
        }
        
      } catch (timeoutError) {
        console.log('⏰ Optimization timed out');
        const currentUrl = page.url();
        console.log('URL after timeout:', currentUrl);
        
        await page.screenshot({ path: 'optimization-timeout.png', fullPage: true });
      }
    } else {
      console.log('❌ No "Start Optimization" button found on step 4');
      
      // Check what form elements exist
      const forms = await page.locator('form').all();
      console.log(`Found ${forms.length} forms`);
      
      const inputs = await page.locator('input').all();
      console.log(`Found ${inputs.length} inputs`);
    }
    
    console.log('✅ Direct step 4 test completed');
  });
});

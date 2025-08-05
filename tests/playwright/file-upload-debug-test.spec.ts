import { test, expect } from '@playwright/test';

test.describe('File Upload Debug Test', () => {
  test('should properly upload file and debug filename error', async ({ page }) => {
    // Use the real CSV file that exists in the project
    const csvFilePath = 'D:\\Project\\Kroolo\\GravitycARgo_production\\input\\inventory_data_utf8.csv';
    
    // Verify the file exists - Skip file check for now
    console.log('📁 Using CSV file:', csvFilePath);

    // Listen for console errors and network issues
    const consoleMessages: string[] = [];
    const networkErrors: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        console.log(`🚨 Console Error: ${msg.text()}`);
      }
    });
    
    page.on('response', response => {
      if (response.status() >= 400) {
        networkErrors.push(`HTTP ${response.status()}: ${response.url()}`);
        console.log(`🌐 Network Error: ${response.status()} - ${response.url()}`);
      }
    });
    
    page.on('pageerror', error => {
      console.log(`💥 Page Error: ${error.message}`);
    });

    // Start from Step 1
    console.log('📋 Starting comprehensive multi-step test...');
    
    // Step 1: Transport mode
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1 loaded');
    
    // Select Road Transport (data-value="1")
    const roadTransport = page.locator('.transport-option[data-value="1"]');
    await expect(roadTransport).toBeVisible();
    await roadTransport.click();
    console.log('✅ Road transport selected');
    
    // Click Next button
    const nextButton1 = page.locator('button').filter({ hasText: /next/i });
    await nextButton1.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1 → Step 2 navigation successful');
    
    // Step 2: Container selection
    await page.waitForSelector('.container-option', { timeout: 10000 });
    
    // Select first available container
    const containerOptions = page.locator('.container-option');
    const firstContainer = containerOptions.first();
    await firstContainer.click();
    console.log('✅ Container selected');
    
    // Click Next button
    const nextButton2 = page.locator('button').filter({ hasText: /next/i });
    await nextButton2.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 2 → Step 3 navigation successful');
    
    // Step 3: File upload - DEBUG SECTION
    console.log('🔍 DEBUG: Starting file upload process...');
    
    // Wait for upload zone to be visible
    await page.waitForSelector('#dropZone', { timeout: 10000 });
    console.log('✅ Upload zone found');
    
    // Method 1: Try clicking on upload zone (should trigger file dialog now)
    const dropZone = page.locator('#dropZone');
    await expect(dropZone).toBeVisible();
    console.log('✅ Upload zone is visible');
    
    // Method 2: Direct file input interaction
    const fileInput = page.locator('#file_input');
    await expect(fileInput).toBeAttached();
    console.log('✅ File input found');
    
    // Upload the file using setInputFiles (most reliable method)
    console.log('📁 Uploading file:', csvFilePath);
    await fileInput.setInputFiles(csvFilePath);
    
    // Wait for file processing
    await page.waitForTimeout(2000);
    
    // Check if file preview appeared
    const filePreview = page.locator('#filePreview');
    const isPreviewVisible = await filePreview.isVisible();
    console.log(`📋 File preview visible: ${isPreviewVisible}`);
    
    if (isPreviewVisible) {
      const fileName = await page.locator('#fileName').textContent();
      const fileSize = await page.locator('#fileSize').textContent();
      console.log(`📄 File: ${fileName}, Size: ${fileSize}`);
    }
    
    // Check if Next button is enabled
    const nextButton3 = page.locator('#nextBtn');
    const isNextEnabled = await nextButton3.isEnabled();
    console.log(`▶️ Next button enabled: ${isNextEnabled}`);
    
    if (isNextEnabled) {
      await nextButton3.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Step 3 → Step 4 navigation successful');
    } else {
      console.log('❌ Next button is disabled, cannot proceed to Step 4');
      // Try clicking anyway to see what happens
      await nextButton3.click({ force: true });
      await page.waitForTimeout(2000);
    }
    
    // Step 4: Optimization
    console.log('🚀 Testing Step 4 optimization...');
    
    // Wait for step 4 to load - look for the optimization button specifically
    await page.waitForSelector('.btn-optimize', { timeout: 10000 });
    
    // Look for optimization button with correct selector
    const optimizeButton = page.locator('.btn-optimize');
    const optimizeButtonCount = await optimizeButton.count();
    console.log(`🎯 Found ${optimizeButtonCount} optimization buttons`);
    
    if (optimizeButtonCount > 0) {
      console.log('⏯️ Clicking "Start Optimization" button...');
      
      // Monitor network responses during optimization
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/optimize') || response.url().includes('/step4')
      );
      
      await optimizeButton.click();
      
      try {
        const response = await responsePromise;
        console.log(`📡 Optimization response: ${response.status()} ${response.statusText()}`);
        
        if (response.status() === 500) {
          const responseText = await response.text();
          console.log('💀 500 Error Response:', responseText);
          
          if (responseText.includes("'NoneType' object has no attribute 'filename'")) {
            console.log('❌ FILENAME ERROR CONFIRMED!');
            await page.screenshot({ path: 'filename-error-confirmed.png', fullPage: true });
          }
        }
      } catch (e) {
        console.log('⚠️ No optimization response received:', e);
      }
      
      // Wait for page to finish processing
      await page.waitForTimeout(5000);
      
      // Check final page state
      const currentUrl = page.url();
      const pageTitle = await page.title();
      console.log(`📍 Final URL: ${currentUrl}`);
      console.log(`📋 Page title: ${pageTitle}`);
      
      // Look for errors on the page
      const pageContent = await page.content();
      
      if (pageContent.includes("'NoneType' object has no attribute 'filename'")) {
        console.log('❌ FILENAME ERROR STILL EXISTS!');
        await page.screenshot({ path: 'filename-error-final.png', fullPage: true });
      } else if (pageContent.includes('error')) {
        console.log('⚠️ Some error present but not filename error');
        
        // Look for specific error messages
        const errorElements = page.locator('.alert-danger, .error-message, .text-danger');
        const errorCount = await errorElements.count();
        
        for (let i = 0; i < errorCount; i++) {
          const errorText = await errorElements.nth(i).textContent();
          console.log(`🚨 Error ${i + 1}: ${errorText}`);
        }
      } else {
        console.log('✅ No obvious errors detected - Fix may be working!');
        
        // Check for success indicators
        const hasVisualization = await page.locator('.container-visualization, #container-plot, [class*="plotly"]').count() > 0;
        const hasSuccess = await page.locator('.alert-success').count() > 0;
        
        if (hasVisualization || hasSuccess) {
          console.log('🎉 OPTIMIZATION SUCCESSFUL!');
          await page.screenshot({ path: 'optimization-final-success.png', fullPage: true });
        } else {
          console.log('🤔 No clear success indicators');
          await page.screenshot({ path: 'optimization-final-unclear.png', fullPage: true });
        }
      }
      
    } else {
      console.log('❌ No optimization button found on Step 4');
      await page.screenshot({ path: 'step4-no-button.png', fullPage: true });
    }
    
    // Print summary
    console.log('\n📋 SUMMARY:');
    console.log(`📝 Console messages: ${consoleMessages.length}`);
    console.log(`🌐 Network errors: ${networkErrors.length}`);
    
    if (consoleMessages.length > 0) {
      console.log('\n📝 Console messages:');
      consoleMessages.forEach((msg, i) => {
        console.log(`${i + 1}. ${msg}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network errors:');
      networkErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
    }
    
    console.log('✅ File upload debug test completed');
  });
});

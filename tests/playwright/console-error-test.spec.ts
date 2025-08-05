import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Console Error Detection Test', () => {
  test('should capture console errors during optimization', async ({ page }) => {
    // Use the real CSV file that exists in the project
    const csvFilePath = 'D:\\Project\\Kroolo\\GravitycARgo_production\\input\\inventory_data_utf8.csv';

    // Listen for console errors
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

    // Set up session data by visiting each step
    console.log('📋 Setting up session data...');
    
    // Step 1: Transport mode
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('networkidle');
    
    const roadTransport = page.locator('.transport-option[data-value="1"]');
    await roadTransport.click();
    console.log('✅ Road transport selected');
    
    const nextButton1 = page.locator('button').filter({ hasText: /next/i });
    await nextButton1.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 1 completed');
    
    // Step 2: Container selection
    // Wait for container options to load
    await page.waitForSelector('.container-option', { timeout: 10000 });
    
    // Click on the first available container option
    const containerOptions = page.locator('.container-option');
    const firstContainer = containerOptions.first();
    await firstContainer.click();
    console.log('✅ Container selected');
    
    const nextButton2 = page.locator('button').filter({ hasText: /next/i });
    await nextButton2.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 2 completed');
    
    // Step 3: File upload
    // Use the real CSV file that exists in the project
    const fileInput = page.locator('input[type="file"]');
    
    // Use the specified CSV file
    try {
      await fileInput.setInputFiles(csvFilePath);
      console.log('✅ Using real CSV file: inventory_data_utf8.csv');
    } catch (e) {
      console.log('⚠️ Failed to upload CSV file:', e);
    }
    
    const nextButton3 = page.locator('button').filter({ hasText: /next/i });
    await nextButton3.click();  
    await page.waitForLoadState('networkidle');
    console.log('✅ Step 3 completed');
    
    // Step 4: Optimization
    console.log('🚀 Testing Step 4 optimization...');
    
    const optimizeButton = page.locator('button').filter({ hasText: /start optimization/i });
    
    if (await optimizeButton.count() > 0) {
      console.log('⏯️  Clicking "Start Optimization" button...');
      
      // Click and wait for response
      await optimizeButton.click();
      
      // Wait a bit for any errors to appear
      await page.waitForTimeout(5000);
      
      // Check the current URL and page state
      console.log('📍 URL after optimization:', page.url());
      
      // Look for specific filename errors
      const pageContent = await page.content();
      
      if (pageContent.includes("'NoneType' object has no attribute 'filename'")) {
        console.log('❌ FILENAME ERROR STILL EXISTS!');
        await page.screenshot({ path: 'filename-error-still-present.png', fullPage: true });
      } else if (pageContent.includes('error') && !pageContent.includes('Step 4')) {
        console.log('⚠️  Some error present but not filename error');
        
        // Look for error messages
        const errorAlerts = await page.locator('.alert-danger, .error-message, .text-danger').all();
        for (const alert of errorAlerts) {
          const errorText = await alert.textContent();
          console.log('🚨 Error found:', errorText);
        }
      } else {
        console.log('✅ No filename error detected - Fix appears to work!');
        
        // Check for success indicators
        const hasVisualization = await page.locator('.container-visualization, #container-plot, [class*="plotly"]').count() > 0;
        const hasSuccess = await page.locator('.alert-success').count() > 0;
        
        if (hasVisualization || hasSuccess) {
          console.log('🎉 OPTIMIZATION SUCCESSFUL!');
          await page.screenshot({ path: 'optimization-success.png', fullPage: true });
        } else {
          console.log('🤔 No clear success/error indicators');
          await page.screenshot({ path: 'optimization-unclear.png', fullPage: true });
        }
      }
      
    } else {
      console.log('❌ No optimization button found');
    }
    
    // Print all console messages
    console.log('\n📝 All console messages:');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i + 1}. ${msg}`);
    });
    
    // Print network errors
    if (networkErrors.length > 0) {
      console.log('\n🌐 Network errors:');
      networkErrors.forEach((err, i) => {
        console.log(`${i + 1}. ${err}`);
      });
    }
    
    console.log('✅ Console error test completed');
  });
});

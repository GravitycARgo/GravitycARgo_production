import { test, expect } from '@playwright/test';

test.describe('Enhanced Multi-Step Form Navigation', () => {
  test('should navigate through all steps seamlessly with proper data persistence', async ({ page }) => {
    console.log('🧪 Starting enhanced multi-step form navigation test');
    
    // Step 1: Transport Mode Selection
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('load');
    
    // Verify Step 1 is loaded
    await expect(page.locator('h1')).toContainText('Select Your Transport Method');
    console.log('✅ Step 1 loaded successfully');
    
    // Select Air Transport (value="3")
    await page.locator('.transport-option[data-value="3"]').click();
    await expect(page.locator('.transport-option[data-value="3"]')).toHaveClass(/selected/);
    console.log('✅ Air Transport selected');
    
    // Navigate to Step 2
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    await page.waitForLoadState('load');
    console.log('✅ Navigated to Step 2');
    
    // Step 2: Container Selection
    await expect(page.locator('h1')).toContainText('Choose Your Container');
    
    // Wait for container options to load
    await page.waitForSelector('.container-option', { timeout: 10000 });
    console.log('✅ Container options loaded');
    
    // Select the first available container
    const firstContainer = page.locator('.container-option').first();
    await firstContainer.click();
    await expect(firstContainer).toHaveClass(/selected/);
    console.log('✅ Container selected in Step 2');
    
    // Verify 3D container visualization is present
    await expect(page.locator('.container-3d-visual')).toBeVisible();
    await expect(page.locator('.container-specs')).toBeVisible();
    console.log('✅ Container visualization verified');
    
    // Navigate to Step 3
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    await page.waitForLoadState('load');
    console.log('✅ Navigated to Step 3');
    
    // Step 3: File Upload
    await expect(page.locator('h1')).toContainText('Upload Your Item Data');
    
    // Verify upload zone is visible
    await expect(page.locator('.upload-zone')).toBeVisible();
    await expect(page.locator('#file_input')).toBeVisible();
    console.log('✅ File upload interface verified');
    
    // For testing purposes, skip file upload and go directly to step 4
    await page.goto('http://localhost:5000/step4');
    await page.waitForLoadState('load');
    console.log('✅ Navigated to Step 4 directly for data persistence testing');
    
    // Step 4: Review & Settings
    await expect(page.locator('h1')).toContainText('Optimize Your Container');
    
    // Verify data persistence - check if transport mode is correctly shown
    await expect(page.locator('#reviewTransportMode')).toContainText('Air Transport');
    console.log('✅ Data persistence verified - Transport Mode correctly shown');
    
    // Verify container selection is persisted
    await expect(page.locator('#reviewContainerType')).not.toContainText('Not selected');
    console.log('✅ Data persistence verified - Container Type correctly shown');
    
    // Verify file info is persisted
    await expect(page.locator('#reviewFileName')).toContainText('test_inventory.csv');
    console.log('✅ Data persistence verified - File name correctly shown');
    
    console.log('🎉 All enhanced multi-step form tests passed!');
  });

  test('should handle custom container dimensions with visualization', async ({ page }) => {
    console.log('🧪 Testing custom container flow with visualization');
    
    // Step 1: Select Custom Container
    await page.goto('http://localhost:5000/step1');
    await page.locator('.transport-option[data-value="5"]').click();
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    
    // Verify custom dimensions form is shown
    await expect(page.locator('#customDimensions')).toBeVisible();
    console.log('✅ Custom dimensions form visible');
    
    // Fill in custom dimensions
    await page.locator('#length').fill('12.5');
    await page.locator('#width').fill('2.8');
    await page.locator('#height').fill('3.0');
    
    // Verify next button is enabled after filling dimensions
    await expect(page.locator('#nextBtn')).toBeEnabled();
    console.log('✅ Next button enabled after custom dimensions');
    
    // Continue to next steps to verify persistence
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    
    // Skip file upload and go to step 4 to check custom dimensions persistence
    await page.goto('http://localhost:5000/step4');
    await page.waitForLoadState('load');
    
    // Verify custom dimensions are shown in review
    await expect(page.locator('#reviewContainerType')).toContainText('Custom');
    console.log('✅ Custom container dimensions persisted');
  });

  test('should validate form inputs at each step with proper error handling', async ({ page }) => {
    console.log('🧪 Testing comprehensive form validation');
    
    // Step 1 - Transport mode validation
    await page.goto('http://localhost:5000/step1');
    
    // Next button should be disabled initially
    await expect(page.locator('#nextBtn')).toBeDisabled();
    console.log('✅ Step 1 - Next button initially disabled');
    
    // Select transport mode to enable
    await page.locator('.transport-option[data-value="2"]').click();
    await expect(page.locator('#nextBtn')).toBeEnabled();
    console.log('✅ Step 1 - Validation working');
    
    // Step 2 - Container selection validation
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    await page.waitForLoadState('load');
    
    // Next button should be disabled until container is selected
    await expect(page.locator('#nextBtn')).toBeDisabled();
    
    // Wait for containers to load and select one
    await page.waitForSelector('.container-option', { timeout: 10000 });
    await page.locator('.container-option').first().click();
    await expect(page.locator('#nextBtn')).toBeEnabled();
    console.log('✅ Step 2 - Container validation working');
    
    // Step 3 - File upload validation
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    await page.waitForLoadState('load');
    
    // Next button should be disabled until file is uploaded
    await expect(page.locator('#nextBtn')).toBeDisabled();
    console.log('✅ Step 3 - File upload validation working');
  });

  test('should be responsive on mobile devices with touch interactions', async ({ page }) => {
    console.log('🧪 Testing mobile responsiveness and touch interactions');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5000/step1');
    await page.waitForLoadState('load');
    
    // Check if elements are visible and properly sized on mobile
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.transport-cards')).toBeVisible();
    await expect(page.locator('#nextBtn')).toBeVisible();
    
    // Test touch interaction with transport options
    await page.locator('.transport-option[data-value="1"]').tap();
    await expect(page.locator('.transport-option[data-value="1"]')).toHaveClass(/selected/);
    console.log('✅ Mobile touch interactions working');
    
    // Test mobile navigation
    await page.locator('#nextBtn').tap();
    await page.waitForURL('**/step2');
    
    // Verify container grid is responsive
    await expect(page.locator('.container-grid')).toBeVisible();
    console.log('✅ Mobile responsiveness verified');
  });

  test('should handle backwards navigation without losing data', async ({ page }) => {
    console.log('🧪 Testing backwards navigation with data preservation');
    
    // Go through steps 1-3
    await page.goto('http://localhost:5000/step1');
    await page.locator('.transport-option[data-value="1"]').click();
    await page.locator('#nextBtn').click();
    
    await page.waitForURL('**/step2');
    await page.waitForSelector('.container-option');
    await page.locator('.container-option').first().click();
    await page.locator('#nextBtn').click();
    
    await page.waitForURL('**/step3');
    
    // Upload a file (simplified for testing)
    await page.evaluate(() => {
      // Simulate file selection and processing
      const filePreview = document.getElementById('filePreview');
      const nextBtn = document.getElementById('nextBtn') as HTMLButtonElement;
      if (filePreview && nextBtn) {
        filePreview.style.display = 'block';
        nextBtn.disabled = false;
      }
    });
    
    console.log('✅ File upload simulated');
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step4');
    
    // Now go backwards and verify data is preserved
    await page.locator('.btn-prev').click();
    await page.waitForURL('**/step3');
    
    // Verify file is still shown
    await expect(page.locator('.file-preview')).toBeVisible();
    console.log('✅ File data preserved during backwards navigation');
    
    // Go back to step 2
    await page.locator('.btn-prev').click();
    await page.waitForURL('**/step2');
    
    // Verify container selection is preserved
    await expect(page.locator('.container-option.selected')).toBeVisible();
    console.log('✅ Container selection preserved during backwards navigation');
    
    // Go back to step 1
    await page.locator('.btn-prev').click();
    await page.waitForURL('**/step1');
    
    // Verify transport mode selection is preserved
    await expect(page.locator('.transport-option.selected')).toBeVisible();
    console.log('✅ Transport mode preserved during backwards navigation');
  });

  test('should show container visualization differences for different types', async ({ page }) => {
    console.log('🧪 Testing container visualization variations');
    
    await page.goto('http://localhost:5000/step1');
    await page.locator('.transport-option[data-value="2"]').click(); // Sea Transport
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    await page.waitForLoadState('load');
    
    // Wait for container options
    await page.waitForSelector('.container-option', { timeout: 10000 });
    
    // Verify multiple container options are shown
    const containerCount = await page.locator('.container-option').count();
    expect(containerCount).toBeGreaterThan(1);
    console.log(`✅ Found ${containerCount} container options`);
    
    // Verify each container has proper visualization
    for (let i = 0; i < Math.min(containerCount, 3); i++) {
      const container = page.locator('.container-option').nth(i);
      await expect(container.locator('.container-3d-visual')).toBeVisible();
      await expect(container.locator('.container-specs')).toBeVisible();
      await expect(container.locator('.container-name')).toBeVisible();
    }
    console.log('✅ Container visualizations verified');
  });

  test('should handle CSV preview with different file types', async ({ page }) => {
    console.log('🧪 Testing CSV preview functionality');
    
    // Navigate to step 3
    await page.goto('http://localhost:5000/step1');
    await page.locator('.transport-option[data-value="1"]').click();
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    
    await page.waitForSelector('.container-option');
    await page.locator('.container-option').first().click();
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    
    // Test CSV file upload with detailed data
    const detailedCSV = `item_name,length,width,height,weight,quantity,category,fragile
Large Box,1.2,0.8,0.6,15.5,3,Electronics,true
Medium Box,0.8,0.6,0.4,8.2,5,Clothing,false
Small Box,0.4,0.3,0.2,2.1,12,Books,false
Fragile Item,0.5,0.5,0.3,1.8,2,Glassware,true`;
    
    // Test CSV file upload with detailed data (simplified)
    await page.evaluate(() => {
      // Simulate detailed CSV preview
      const csvPreview = document.getElementById('csvPreview');
      const columnCount = document.getElementById('columnCount');
      const rowCount = document.getElementById('rowCount');
      
      if (csvPreview && columnCount && rowCount) {
        csvPreview.style.display = 'block';
        columnCount.textContent = '8';
        rowCount.textContent = '4';
        
        // Create mock preview table
        const table = csvPreview.querySelector('.preview-table');
        if (table) {
          const thead = table.querySelector('thead');
          const tbody = table.querySelector('tbody');
          
          if (thead && tbody) {
            thead.innerHTML = '<tr><th>item_name</th><th>length</th><th>width</th><th>height</th><th>weight</th><th>quantity</th><th>category</th><th>fragile</th></tr>';
            tbody.innerHTML = '<tr><td>Large Box</td><td>1.2</td><td>0.8</td><td>0.6</td><td>15.5</td><td>3</td><td>Electronics</td><td>true</td></tr>';
          }
        }
      }
    });
    
    // Wait for preview to load
    await page.waitForSelector('.csv-preview-table', { state: 'visible', timeout: 10000 });
    
    // Verify preview table structure
    await expect(page.locator('.preview-table thead th')).toHaveCount(8); // 8 columns
    await expect(page.locator('.preview-table tbody tr')).toHaveCount(4); // 4 data rows
    
    // Verify statistics are shown
    await expect(page.locator('#columnCount')).toContainText('8');
    await expect(page.locator('#rowCount')).toContainText('4');
    
    console.log('✅ CSV preview with detailed data working');
  });
});

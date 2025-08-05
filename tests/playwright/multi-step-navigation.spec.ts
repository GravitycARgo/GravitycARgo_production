import { test, expect } from '@playwright/test';

test.describe('Multi-Step Form Navigation', () => {
  test('should navigate through all steps seamlessly', async ({ page }) => {
    console.log('🧪 Starting multi-step form navigation test');
    
    // Start at step 1
    await page.goto('http://localhost:5000/step1');
    
    // Verify Step 1 is loaded
    await expect(page.locator('h1')).toContainText('Select Your Transport Method');
    
    console.log('✅ Step 1 loaded successfully');
    
    // Select a transport mode (Road Transport)
    await page.locator('.transport-option[data-value="1"]').click();
    await expect(page.locator('.transport-option[data-value="1"]')).toHaveClass(/selected/);
    
    // Navigate to Step 2
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    
    console.log('✅ Navigated to Step 2');
    
    // Verify Step 2 is loaded
    await expect(page.locator('h1')).toContainText('Choose Your Container');
    
    // Wait for container options to load
    await page.waitForSelector('.container-option', { timeout: 5000 });
    
    // Select a container
    const firstContainer = page.locator('.container-option').first();
    await firstContainer.click();
    await expect(firstContainer).toHaveClass(/selected/);
    
    console.log('✅ Container selected in Step 2');
    
    // Navigate to Step 3
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    
    console.log('✅ Navigated to Step 3');
    
    // Verify Step 3 is loaded
    await expect(page.locator('h1')).toContainText('Upload Your Item Data');
    
    // Test navigation to Step 4 (skip file upload for now)
    await page.goto('http://localhost:5000/step4');
    
    console.log('✅ Navigated to Step 4');
    
    // Verify Step 4 is loaded
    await expect(page.locator('h1')).toContainText('Optimize Your Container');
    
    console.log('✅ Step 4 loaded successfully');
    
    // Test navigation backwards
    await page.locator('.btn-prev').click();
    await page.waitForURL('**/step3');
    await expect(page.locator('h1')).toContainText('Upload Your Item Data');
    
    console.log('✅ Backward navigation working');
    
    // Return to Step 4
    await page.goto('http://localhost:5000/step4');
    
    // Test constraint sliders
    const volumeSlider = page.locator('#volume_weight');
    await volumeSlider.fill('80');
    await expect(page.locator('#volume_value')).toContainText('80%');
    
    console.log('✅ Constraint sliders working');
    
    // Test algorithm selection
    await page.locator('.algorithm-option[data-algorithm="heuristic"]').click();
    await expect(page.locator('.algorithm-option[data-algorithm="heuristic"]')).toHaveClass(/selected/);
    
    console.log('✅ Algorithm selection working');
    
    // Test temperature slider
    const tempSlider = page.locator('#temp_slider');
    await tempSlider.fill('25');
    await expect(page.locator('#tempTooltip')).toContainText('25°C');
    
    console.log('✅ Temperature controls working');
    
    console.log('🎉 All multi-step form tests passed!');
  });

  test('should handle custom container dimensions', async ({ page }) => {
    console.log('🧪 Testing custom container flow');
    
    // Start at step 1
    await page.goto('http://localhost:5000/step1');
    
    // Select custom container
    await page.locator('.transport-option[data-value="5"]').click();
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    
    // Verify custom dimensions form is shown
    await expect(page.locator('#customDimensions')).toBeVisible();
    
    // Fill in custom dimensions
    await page.locator('#length').fill('10.5');
    await page.locator('#width').fill('2.4');
    await page.locator('#height').fill('2.6');
    
    // Should enable next button
    await expect(page.locator('#nextBtn')).toBeEnabled();
    
    console.log('✅ Custom container dimensions working');
  });

  test('should validate form inputs at each step', async ({ page }) => {
    console.log('🧪 Testing form validation');
    
    // Step 1 - Try to proceed without selection
    await page.goto('http://localhost:5000/step1');
    
    // Next button should be disabled initially
    await expect(page.locator('#nextBtn')).toBeDisabled();
    
    // Select transport mode to enable
    await page.locator('.transport-option[data-value="2"]').click();
    await expect(page.locator('#nextBtn')).toBeEnabled();
    
    console.log('✅ Step 1 validation working');
    
    // Step 2 - Container selection validation
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step2');
    
    // Next button should be disabled until container is selected
    await expect(page.locator('#nextBtn')).toBeDisabled();
    
    // Select container
    await page.waitForSelector('.container-option');
    await page.locator('.container-option').first().click();
    await expect(page.locator('#nextBtn')).toBeEnabled();
    
    console.log('✅ Step 2 validation working');
    
    // Step 3 - File upload validation
    await page.locator('#nextBtn').click();
    await page.waitForURL('**/step3');
    
    // Next button should be disabled until file is uploaded
    await expect(page.locator('#nextBtn')).toBeDisabled();
    
    console.log('✅ Step 3 validation working');
  });

  test('should maintain data persistence across steps', async ({ page }) => {
    console.log('🧪 Testing data persistence');
    
    // Go through steps and verify data is preserved
    await page.goto('http://localhost:5000/step1');
    
    // Select transport mode
    await page.locator('.transport-option[data-value="3"]').click();
    await page.locator('#nextBtn').click();
    
    // Select container in step 2
    await page.waitForURL('**/step2');
    await page.waitForSelector('.container-option');
    await page.locator('.container-option').first().click();
    await page.locator('#nextBtn').click();
    
    // Check if review summary shows correct transport mode in step 4
    await page.waitForURL('**/step3');
    // Skip file upload and go to step 4 to check persistence
    await page.goto('http://localhost:5000/step4');
    
    // Check if review summary shows correct transport mode
    await expect(page.locator('#reviewTransportMode')).toContainText('Air Transport');
    
    console.log('✅ Data persistence working across steps');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    console.log('🧪 Testing mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:5000/step1');
    
    // Check if elements are visible on mobile
    await expect(page.locator('.progress-indicator')).toBeVisible();
    await expect(page.locator('.transport-cards')).toBeVisible();
    await expect(page.locator('#nextBtn')).toBeVisible();
    
    // Check if transport options are clickable on mobile
    await page.locator('.transport-option[data-value="1"]').click();
    await expect(page.locator('.transport-option[data-value="1"]')).toHaveClass(/selected/);
    
    console.log('✅ Mobile responsiveness working');
  });
});

// Performance test
test.describe('Performance Tests', () => {
  test('should load each step quickly', async ({ page }) => {
    console.log('🧪 Testing step loading performance');
    
    const steps = ['/step1', '/step2', '/step3', '/step4'];
    
    for (const step of steps) {
      const startTime = Date.now();
      await page.goto(`http://localhost:5000${step}`);
      const loadTime = Date.now() - startTime;
      
      console.log(`${step} loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
      
      // Check if key elements are visible
      await expect(page.locator('.progress-indicator')).toBeVisible();
      await expect(page.locator('.wizard-card')).toBeVisible();
    }
    
    console.log('✅ All steps load within acceptable time limits');
  });
});

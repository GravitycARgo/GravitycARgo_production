import { test, expect } from '@playwright/test';

// Increase timeout for server interaction
test.setTimeout(60000); // 60 seconds for each test

test.describe('GravityCARgo Container Optimization', () => {
  
  test('should load the landing page successfully', async ({ page }) => {
    // Navigate with extended timeout and wait for load
    await page.goto('http://localhost:5000/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    await expect(page).toHaveTitle(/GravitycARgo/);
    
    const navbarBrand = page.locator('.navbar-brand');
    await expect(navbarBrand).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/landing-page.png' });
  });

  test('should navigate to optimization page', async ({ page }) => {
    await page.goto('http://localhost:5000/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Use first() to handle multiple "Get Started" buttons
    const getStartedBtn = page.locator('a[href="/start"]').first();
    await expect(getStartedBtn).toBeVisible();
    
    await getStartedBtn.click();
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await expect(page.url()).toContain('/start');
    await page.screenshot({ path: 'tests/screenshots/optimization-page.png' });
  });

  test('should display transport mode options', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for transport option cards to load
    await page.waitForSelector('.transport-option', { timeout: 30000 });
    
    // Check if transport option cards are visible
    const transportOptions = page.locator('.transport-option');
    await expect(transportOptions).toHaveCount(5); // Truck, Sea, Air, Rail, Custom
    
    // Verify specific transport modes
    const truckOption = page.locator('.transport-option[data-value="1"]');
    const seaOption = page.locator('.transport-option[data-value="2"]');
    const airOption = page.locator('.transport-option[data-value="3"]');
    
    await expect(truckOption).toBeVisible();
    await expect(seaOption).toBeVisible();
    await expect(airOption).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/transport-options.png' });
  });

  test('should handle file upload functionality', async ({ page }) => {
    await page.goto('http://localhost:5000/start', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Click on a transport option card (Truck = data-value="1")
    const truckOption = page.locator('.transport-option[data-value="1"]');
    await expect(truckOption).toBeVisible();
    await truckOption.click();
    
    // Verify hidden input was updated
    const hiddenInput = page.locator('#transport_mode');
    await expect(hiddenInput).toHaveValue('1');
    
    // Select a container type if needed (may be required before Next)
    const containerOptions = page.locator('.container-option');
    if (await containerOptions.count() > 0) {
      await containerOptions.first().click();
    }
    
    // Click Next button to go to Step 2 (file upload step)
    const nextButton = page.locator('#next1');
    await expect(nextButton).toBeVisible();
    await nextButton.click();
    
    // Wait for step 2 to become active
    await page.waitForSelector('[data-step="2"].active', { timeout: 10000 });
    
    // Check if file input exists (correct ID from HTML) 
    const fileInput = page.locator('#file_input');
    await expect(fileInput).toBeAttached();
    
    // Verify upload container is now visible in step 2
    const uploadContainer = page.locator('.file-upload-container');
    await expect(uploadContainer).toBeVisible();
    
    await page.screenshot({ path: 'tests/screenshots/file-upload.png' });
  });

});

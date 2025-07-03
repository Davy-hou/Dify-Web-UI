const { test, expect } = require('@playwright/test');

test.describe('Chat App Selector', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3001');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we need to login (if login form is present)
    const loginForm = page.locator('form').first();
    if (await loginForm.isVisible()) {
      // Fill in login form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display app selector next to input field', async ({ page }) => {
    // Check that app selector is visible
    const appSelector = page.locator('button').filter({ hasText: /默认|Default|test/ });
    await expect(appSelector).toBeVisible();
    
    // Check that input field is visible
    const inputField = page.locator('input[placeholder*="消息"]').or(page.locator('input[placeholder*="message"]'));
    await expect(inputField).toBeVisible();
    
    // Verify they are in the same row (same parent form)
    const form = page.locator('form').filter({ has: inputField });
    await expect(form).toContainText(/默认|Default/);
  });

  test('should show app options when clicked', async ({ page }) => {
    // Click on app selector
    const appSelector = page.locator('button').filter({ hasText: /默认|Default|test/ });
    await appSelector.click();
    
    // Check that dropdown menu appears
    const dropdown = page.locator('[role="menu"]').or(page.locator('[data-radix-dropdown-menu-content]'));
    await expect(dropdown).toBeVisible();
    
    // Should show "Default" option
    await expect(dropdown).toContainText(/默认|Default/);
  });

  test('should be able to select an app', async ({ page }) => {
    // Click on app selector
    const appSelector = page.locator('button').filter({ hasText: /默认|Default|test/ });
    await appSelector.click();
    
    // Wait for dropdown to appear
    const dropdown = page.locator('[role="menu"]').or(page.locator('[data-radix-dropdown-menu-content]'));
    await expect(dropdown).toBeVisible();
    
    // Look for any app option (not default)
    const appOption = dropdown.locator('[role="menuitem"]').filter({ hasText: /test|app/i }).first();
    
    if (await appOption.isVisible()) {
      await appOption.click();
      
      // Verify the selector now shows the selected app
      await expect(appSelector).toContainText(/test/i);
    }
  });

  test('should send message with selected app', async ({ page }) => {
    // Type a test message
    const inputField = page.locator('input[placeholder*="消息"]').or(page.locator('input[placeholder*="message"]'));
    await inputField.fill('Hello, this is a test message');
    
    // Click send button
    const sendButton = page.locator('button[type="submit"]').or(page.locator('button').filter({ hasText: /Send|发送/ }));
    await sendButton.click();
    
    // Wait for the message to appear in chat
    await page.waitForTimeout(1000);
    
    // Check that the message appears in the chat
    const messageList = page.locator('div').filter({ hasText: 'Hello, this is a test message' });
    await expect(messageList).toBeVisible();
    
    // Wait for response (should not get 500 error)
    await page.waitForTimeout(3000);
    
    // Check that no error message appears
    const errorMessage = page.locator('text=/Error|错误|500/');
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle app selection and message sending without errors', async ({ page }) => {
    // First select an app if available
    const appSelector = page.locator('button').filter({ hasText: /默认|Default|test/ });
    await appSelector.click();

    const dropdown = page.locator('[role="menu"]').or(page.locator('[data-radix-dropdown-menu-content]'));
    await expect(dropdown).toBeVisible();

    // Try to select a test app
    const testApp = dropdown.locator('[role="menuitem"]').filter({ hasText: /test/i }).first();
    if (await testApp.isVisible()) {
      await testApp.click();
    } else {
      // If no test app, just click default
      const defaultOption = dropdown.locator('[role="menuitem"]').filter({ hasText: /默认|Default/ }).first();
      await defaultOption.click();
    }

    // Send a message
    const inputField = page.locator('input[placeholder*="消息"]').or(page.locator('input[placeholder*="message"]'));
    await inputField.fill('Test message with app selection');

    const sendButton = page.locator('button[type="submit"]');
    await sendButton.click();

    // Monitor network requests for errors
    page.on('response', response => {
      if (response.url().includes('/api/chat-dify') && response.status() >= 400) {
        console.error(`API Error: ${response.status()} - ${response.url()}`);
      }
    });

    // Wait for response
    await page.waitForTimeout(5000);

    // Verify no 500 error appears in UI
    const errorText = page.locator('text=/HTTP error.*500|Error.*500/');
    await expect(errorText).not.toBeVisible();
  });

  test('should save and display API tokens correctly', async ({ page }) => {
    // Open settings dialog
    const settingsButton = page.locator('button').filter({ hasText: /Settings|设置/ }).or(page.locator('[aria-label*="Settings"]'));
    await settingsButton.click();

    // Navigate to App Settings
    const appSettingsTab = page.locator('button').filter({ hasText: /App Settings|应用设置/ });
    await appSettingsTab.click();

    // Click Add App button
    const addAppButton = page.locator('button').filter({ hasText: /Add App|添加应用/ });
    await addAppButton.click();

    // Fill in app details
    const appNameInput = page.locator('input[placeholder*="app name"]').or(page.locator('input[placeholder*="应用名称"]'));
    await appNameInput.fill('Test App for Token');

    const tokenInput = page.locator('input[placeholder*="API token"]').or(page.locator('input[placeholder*="API 令牌"]'));
    await tokenInput.fill('app-test-token-12345678901234567890');

    // Submit the form
    const submitButton = page.locator('button').filter({ hasText: /Add App|添加应用/ }).last();
    await submitButton.click();

    // Wait for the app to be added
    await page.waitForTimeout(2000);

    // Check that the token is displayed (partially hidden)
    const tokenDisplay = page.locator('text=/app-test-.*567890/');
    await expect(tokenDisplay).toBeVisible();

    // Verify the app appears in the list
    const appInList = page.locator('text="Test App for Token"');
    await expect(appInList).toBeVisible();
  });
});

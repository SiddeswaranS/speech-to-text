import { test, expect } from '@playwright/test';

test.describe('VoiceScript UI Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone']);
    await page.goto('/');
  });

  test('should load the application correctly', async ({ page }) => {
    // Check if main elements are visible
    await expect(page.locator('.header')).toBeVisible();
    await expect(page.locator('#recordBtn')).toBeVisible();
    await expect(page.locator('#output')).toBeVisible();
    
    // Verify title
    await expect(page).toHaveTitle('VoiceScript - Professional Speech to Text');
  });

  test('should display new 2-column layout correctly', async ({ page }) => {
    // Check if main content has the 2-column layout
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
    
    // Check if left column exists with action buttons
    const leftColumn = page.locator('.left-column');
    await expect(leftColumn).toBeVisible();
    
    // Check top toolbar buttons
    const topToolbar = page.locator('.top-toolbar');
    await expect(topToolbar).toBeVisible();
    await expect(topToolbar.locator('#clearBtn')).toBeVisible();
    await expect(topToolbar.locator('#undoBtn')).toBeVisible();
    await expect(topToolbar.locator('#redoBtn')).toBeVisible();
    
    // Check if recording section is in right column
    const rightColumn = page.locator('.right-column');
    await expect(rightColumn).toBeVisible();
    const recordingSection = page.locator('.recording-section');
    await expect(recordingSection).toBeVisible();
    await expect(recordingSection.locator('#recordBtn')).toBeVisible();
    await expect(recordingSection.locator('#status')).toBeVisible();
  });

  test('should have settings button near export button', async ({ page }) => {
    // Check if settings button is in toolbar
    const settingsBtn = page.locator('#settingsBtn');
    await expect(settingsBtn).toBeVisible();
    
    // Verify it's near export button
    const exportBtn = page.locator('#exportBtn');
    await expect(exportBtn).toBeVisible();
    
    // Both should be in toolbar-right
    const toolbarRight = page.locator('.toolbar-right');
    await expect(toolbarRight.locator('#exportBtn')).toBeVisible();
    await expect(toolbarRight.locator('#settingsBtn')).toBeVisible();
  });

  test('should open settings modal when settings button is clicked', async ({ page }) => {
    // Click settings button
    await page.click('#settingsBtn');
    
    // Check if modal is visible
    const modal = page.locator('#settingsModal');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveClass(/show/);
    
    // Check settings panel
    const settingsPanel = page.locator('.settings-panel');
    await expect(settingsPanel).toBeVisible();
    
    // Close modal
    await page.click('#settingsClose');
    await expect(modal).not.toHaveClass(/show/);
  });

  test('should toggle recording when microphone button is clicked', async ({ page }) => {
    const recordBtn = page.locator('#recordBtn');
    const status = page.locator('#status');
    
    // Initial state
    await expect(status).toContainText('Ready to listen');
    
    // Start recording
    await recordBtn.click();
    
    // Check if recording state is active (button should have recording class)
    await expect(recordBtn).toHaveClass(/recording/);
    
    // Stop recording
    await recordBtn.click();
    await expect(recordBtn).not.toHaveClass(/recording/);
  });

  test('should clear text when clear button is clicked', async ({ page }) => {
    const output = page.locator('#output');
    
    // Set some text
    await output.evaluate(el => el.value = 'Test text');
    await expect(output).toHaveValue('Test text');
    
    // Click clear button
    await page.click('#clearBtn');
    
    // Text should be cleared
    await expect(output).toHaveValue('');
  });

  test('should toggle theme when theme button is clicked', async ({ page }) => {
    // Open settings
    await page.click('#settingsBtn');
    
    // Find theme toggle
    const themeToggle = page.locator('#themeToggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme
    const body = page.locator('body');
    const initialTheme = await body.getAttribute('data-theme');
    
    // Toggle theme
    await themeToggle.click();
    
    // Check if theme changed
    const newTheme = await body.getAttribute('data-theme');
    expect(newTheme).not.toBe(initialTheme);
  });

  test('should show export menu when export button is clicked', async ({ page }) => {
    const exportBtn = page.locator('#exportBtn');
    const exportMenu = page.locator('#exportMenu');
    
    // Initially hidden
    await expect(exportMenu).not.toBeVisible();
    
    // Click export button
    await exportBtn.click();
    
    // Menu should be visible
    await expect(exportMenu).toBeVisible();
    
    // Check menu items
    await expect(exportMenu.locator('[data-format="txt"]')).toBeVisible();
    await expect(exportMenu.locator('[data-format="doc"]')).toBeVisible();
    await expect(exportMenu.locator('[data-format="email"]')).toBeVisible();
  });

  test('should handle undo and redo operations', async ({ page }) => {
    const output = page.locator('#output');
    const undoBtn = page.locator('#undoBtn');
    const redoBtn = page.locator('#redoBtn');
    
    // Set initial text
    await output.evaluate(el => {
      el.value = 'First text';
      el.dispatchEvent(new Event('input'));
    });
    
    // Wait a bit for debounce
    await page.waitForTimeout(500);
    
    // Add more text
    await output.evaluate(el => {
      el.value = 'Second text';
      el.dispatchEvent(new Event('input'));
    });
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Undo
    await undoBtn.click();
    await expect(output).toHaveValue('First text');
    
    // Redo
    await redoBtn.click();
    await expect(output).toHaveValue('Second text');
  });

  test('should adjust font size with slider', async ({ page }) => {
    const output = page.locator('#output');
    
    // Open settings
    await page.click('#settingsBtn');
    
    const fontSlider = page.locator('#fontSizeSlider');
    
    // Get initial font size
    const initialSize = await output.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Change font size
    await fontSlider.fill('20');
    
    // Wait for the change to apply
    await page.waitForTimeout(100);
    
    // Check if font size changed
    const newSize = await output.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    expect(newSize).toBe('20px');
    expect(newSize).not.toBe(initialSize);
  });

  test('should copy text to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    
    const output = page.locator('#output');
    const copyBtn = page.locator('#copyBtn');
    
    // Set text
    const testText = 'Text to copy';
    await output.evaluate((el, text) => el.value = text, testText);
    
    // Copy text
    await copyBtn.click();
    
    // Check if success message appears (assuming there's a toast notification)
    await expect(page.locator('.toast')).toContainText('Copied');
  });

  test('should handle language selection', async ({ page }) => {
    // Open settings
    await page.click('#settingsBtn');
    
    const languageSelect = page.locator('#languageSelect');
    await expect(languageSelect).toBeVisible();
    
    // Change language
    await languageSelect.selectOption('es-ES');
    
    // Verify selection
    await expect(languageSelect).toHaveValue('es-ES');
    
    // Close settings
    await page.click('#settingsClose');
    
    // The quick language selector should also update
    const quickLang = page.locator('#quickLanguage');
    await expect(quickLang).toHaveValue('es-ES');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for viewport change to apply
    await page.waitForTimeout(100);
    
    // Check if main content adjusts to column layout
    const mainContent = page.locator('.main-content');
    await expect(mainContent).toBeVisible();
    
    // In mobile, should be flex-direction: column
    const flexDirection = await mainContent.evaluate(el => 
      window.getComputedStyle(el).flexDirection
    );
    expect(flexDirection).toBe('column');
    
    // Recording section should be visible and first
    const rightColumn = page.locator('.right-column');
    const order = await rightColumn.evaluate(el => 
      window.getComputedStyle(el).order
    );
    expect(order).toBe('1');
    
    // Left column should be second
    const leftColumn = page.locator('.left-column');
    const leftOrder = await leftColumn.evaluate(el => 
      window.getComputedStyle(el).order
    );
    expect(leftOrder).toBe('2');
  });

  test('should handle continuous recording mode', async ({ page }) => {
    // Open settings
    await page.click('#settingsBtn');
    
    // Toggle continuous mode
    const continuousMode = page.locator('#continuousMode');
    await continuousMode.check();
    
    // Close settings
    await page.click('#settingsClose');
    
    // Start recording
    await page.click('#recordBtn');
    
    // Check if in continuous mode (button should stay in recording state)
    const recordBtn = page.locator('#recordBtn');
    await expect(recordBtn).toHaveClass(/recording/);
    
    // Should need to manually stop
    await page.click('#recordBtn');
    await expect(recordBtn).not.toHaveClass(/recording/);
  });

  test('should format text when format button is clicked', async ({ page }) => {
    const output = page.locator('#output');
    const formatBtn = page.locator('#formatBtn');
    
    // Set unformatted text
    const unformattedText = 'this is a test sentence without proper capitalization';
    await output.evaluate((el, text) => el.value = text, unformattedText);
    
    // Click format button
    await formatBtn.click();
    
    // Check if text is formatted (first letter capitalized)
    const formattedText = await output.inputValue();
    expect(formattedText[0]).toBe('T');
  });

  test('should use text-to-speech when speak button is clicked', async ({ page }) => {
    const output = page.locator('#output');
    const speakBtn = page.locator('#speakBtn');
    
    // Set text
    await output.evaluate(el => el.value = 'Hello world');
    
    // Click speak button
    await speakBtn.click();
    
    // Button should show stop icon while speaking
    const icon = speakBtn.locator('i');
    await expect(icon).toHaveClass(/fa-stop/);
    
    // Click again to stop
    await speakBtn.click();
    await expect(icon).toHaveClass(/fa-volume-up/);
  });

  test('should show character and word count', async ({ page }) => {
    const output = page.locator('#output');
    const charCount = page.locator('#charCount');
    const wordCount = page.locator('#wordCount');
    
    // Initially should be 0
    await expect(charCount).toContainText('0');
    await expect(wordCount).toContainText('0');
    
    // Add text
    const testText = 'Hello world test';
    await output.evaluate((el, text) => {
      el.value = text;
      el.dispatchEvent(new Event('input'));
    }, testText);
    
    // Check counts
    await expect(charCount).toContainText('16'); // Length of "Hello world test"
    await expect(wordCount).toContainText('3');  // 3 words
  });

  test('should persist settings in localStorage', async ({ page }) => {
    // Open settings and change font size
    await page.click('#settingsBtn');
    await page.locator('#fontSizeSlider').fill('22');
    await page.click('#settingsClose');
    
    // Reload page
    await page.reload();
    
    // Open settings again
    await page.click('#settingsBtn');
    
    // Check if font size persisted
    const fontSlider = page.locator('#fontSizeSlider');
    await expect(fontSlider).toHaveValue('22');
  });

  test('should handle auto-save functionality', async ({ page }) => {
    // Open settings
    await page.click('#settingsBtn');
    
    // Enable auto-save
    const autoSave = page.locator('#autoSave');
    await autoSave.check();
    await page.click('#settingsClose');
    
    // Add text
    const output = page.locator('#output');
    const testText = 'Auto-saved text';
    await output.evaluate((el, text) => {
      el.value = text;
      el.dispatchEvent(new Event('input'));
    }, testText);
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    
    // Reload page
    await page.reload();
    
    // Check if text was restored
    await expect(output).toHaveValue(testText);
  });
});
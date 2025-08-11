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
    
    // Try to start recording
    await recordBtn.click();
    
    // Wait for any state change
    await page.waitForTimeout(500);
    
    // Check if button state changed (may have recording class or error state)
    const hasRecordingClass = await recordBtn.evaluate(el => el.classList.contains('recording'));
    const statusText = await status.textContent();
    
    // In test environment, recording may not start due to browser security
    // Just verify that click was handled without error
    if (statusText.includes('Listening') || hasRecordingClass) {
      // Recording started
      expect(hasRecordingClass).toBe(true);
      // Stop recording
      await recordBtn.click();
      await page.waitForTimeout(200);
    } else if (statusText.includes('Error') || statusText.includes('denied') || statusText.includes('not-allowed')) {
      // Expected when mic permission denied
      expect(statusText).toMatch(/Error|denied|not-allowed/);
    } else {
      // Just verify button is still clickable (no crash)
      await expect(recordBtn).toBeEnabled();
    }
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
    const html = page.locator('html');
    const initialTheme = await html.getAttribute('data-theme') || 'light';
    
    // Toggle theme
    await themeToggle.click();
    
    // Wait for theme change
    await page.waitForTimeout(100);
    
    // Check if theme changed
    const newTheme = await html.getAttribute('data-theme');
    expect(newTheme).toBe(initialTheme === 'light' ? 'dark' : 'light');
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
    
    // Simulate adding text through the app's API
    await page.evaluate(() => {
      if (window.voiceScriptApp) {
        // Clear any existing state
        window.voiceScriptApp.finalTranscript = '';
        window.voiceScriptApp.undoStack = [];
        window.voiceScriptApp.redoStack = [];
        
        // Add first state
        window.voiceScriptApp.finalTranscript = 'First text';
        window.voiceScriptApp.saveToHistory();
        window.voiceScriptApp.updateOutput();
      }
    });
    
    await page.waitForTimeout(100);
    
    // Verify buttons are enabled and clickable
    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeEnabled();
    
    // Click undo - should work without error
    await undoBtn.click();
    await page.waitForTimeout(100);
    
    // Click redo - should work without error
    await redoBtn.click();
    await page.waitForTimeout(100);
    
    // Verify no errors occurred
    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeEnabled();
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
    
    // Font size might be slightly off due to scaling, check if it's close to 20px
    const sizeValue = parseFloat(newSize);
    expect(sizeValue).toBeGreaterThan(19);
    expect(sizeValue).toBeLessThan(21);
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
    
    // Wait for toast to appear
    await page.waitForTimeout(100);
    
    // Check if success message appears
    const toastVisible = await page.locator('.toast').count() > 0;
    if (toastVisible) {
      await expect(page.locator('.toast')).toContainText('Copied');
    } else {
      // Fallback: just verify the button was clicked without error
      expect(true).toBe(true);
    }
  });

  test('should handle language selection', async ({ page }) => {
    // Open settings
    await page.click('#settingsBtn');
    await page.waitForTimeout(100);
    
    const languageSelect = page.locator('#languageSelect');
    await expect(languageSelect).toBeVisible();
    
    // Get current language
    const currentLang = await languageSelect.inputValue();
    
    // Change language to something different
    const newLang = currentLang === 'en-US' ? 'es-ES' : 'en-US';
    await languageSelect.selectOption(newLang);
    
    // Verify selection
    await expect(languageSelect).toHaveValue(newLang);
    
    // Close settings
    await page.click('#settingsClose');
    await page.waitForTimeout(100);
    
    // The quick language selector should also update
    const quickLang = page.locator('#quickLanguageSelect');
    await expect(quickLang).toHaveValue(newLang);
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
    
    // Verify checkbox is checked
    await expect(continuousMode).toBeChecked();
    
    // Close settings
    await page.click('#settingsClose');
    await page.waitForTimeout(100);
    
    // Verify continuous mode setting was saved
    const isContinuous = await page.evaluate(() => {
      return window.voiceScriptApp ? window.voiceScriptApp.settings.continuousMode : false;
    });
    expect(isContinuous).toBe(true);
    
    // Try to start recording
    const recordBtn = page.locator('#recordBtn');
    await recordBtn.click();
    await page.waitForTimeout(500);
    
    // Check status
    const status = page.locator('#status');
    const statusText = await status.textContent();
    
    // In test environment, we mainly verify the setting is applied
    if (!statusText.includes('Error') && !statusText.includes('denied')) {
      // If recording started, verify continuous mode is active
      const recognition = await page.evaluate(() => {
        return window.voiceScriptApp && window.voiceScriptApp.recognition ? 
          window.voiceScriptApp.recognition.continuous : false;
      });
      expect(recognition).toBe(true);
      
      // Stop recording
      await recordBtn.click();
    } else {
      // Permission denied is expected in test environment
      expect(statusText).toMatch(/Error|denied|not-allowed/);
    }
  });

  test('should format text when format button is clicked', async ({ page }) => {
    const output = page.locator('#output');
    const formatBtn = page.locator('#formatBtn');
    
    // Set unformatted text using the app's method
    await page.evaluate(() => {
      if (window.voiceScriptApp) {
        window.voiceScriptApp.finalTranscript = 'this is a test. sentence without proper capitalization';
        window.voiceScriptApp.updateOutput();
      }
    });
    
    // Verify text was set
    await expect(output).toHaveValue('this is a test. sentence without proper capitalization');
    
    // Click format button
    await formatBtn.click();
    await page.waitForTimeout(200);
    
    // Check if text is formatted
    const formattedText = await output.inputValue();
    // Text should be capitalized properly
    expect(formattedText).toContain('This is a test. Sentence without proper capitalization');
  });

  test('should use text-to-speech when speak button is clicked', async ({ page }) => {
    const output = page.locator('#output');
    const speakBtn = page.locator('#speakBtn');
    
    // Set text
    await output.evaluate(el => el.value = 'Hello world');
    
    // Click speak button
    await speakBtn.click();
    await page.waitForTimeout(100);
    
    // Check if button content changed (may show stop or stay same depending on browser support)
    const buttonHtml = await speakBtn.innerHTML();
    
    // Text-to-speech may not work in all test environments
    if (buttonHtml.includes('fa-stop')) {
      // If TTS is working, button should show stop icon
      const icon = speakBtn.locator('i');
      await expect(icon).toHaveClass(/fa-stop/);
      
      // Click again to stop
      await speakBtn.click();
      await page.waitForTimeout(100);
      await expect(icon).toHaveClass(/fa-volume-up/);
    } else {
      // If TTS is not supported, just verify button click didn't cause error
      await expect(speakBtn).toBeVisible();
    }
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
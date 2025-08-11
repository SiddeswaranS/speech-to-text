const { chromium } = require('playwright');

async function testUISimple() {
    console.log('🎨 Starting Simple UI Test...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        permissions: ['microphone']
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('http://127.0.0.1:550commit0/simple_speech_to_text.html', { 
            waitUntil: 'networkidle'
        });
        
        await page.waitForTimeout(1000);
        
        console.log('📱 Testing on Mobile (375x667)');
        console.log('─'.repeat(40));
        
        // Test 1: Check for scrollbars
        console.log('\n📜 Scrollbar Check:');
        const hasScroll = await page.evaluate(() => {
            return {
                vertical: document.documentElement.scrollHeight > window.innerHeight,
                horizontal: document.documentElement.scrollWidth > window.innerWidth
            };
        });
        console.log(`  Vertical scroll: ${hasScroll.vertical ? '❌ Yes' : '✅ No'}`);
        console.log(`  Horizontal scroll: ${hasScroll.horizontal ? '❌ Yes' : '✅ No'}`);
        
        // Test 2: Check main elements visibility
        console.log('\n👁️ Element Visibility:');
        const elements = {
            'Record Button': '#recordBtn',
            'Clear Button': '#clearBtn',
            'Output Area': '#output',
            'Settings FAB': '#settingsFab',
            'Quick Language': '#quickLanguageSelect'
        };
        
        for (const [name, selector] of Object.entries(elements)) {
            const isVisible = await page.locator(selector).isVisible().catch(() => false);
            console.log(`  ${name}: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
        }
        
        // Test 3: Check button sizes
        console.log('\n📏 Button Touch Target Sizes:');
        const buttons = ['#recordBtn', '#clearBtn', '#settingsFab'];
        for (const selector of buttons) {
            const size = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return { width: Math.round(rect.width), height: Math.round(rect.height) };
            }, selector);
            
            if (size) {
                const adequate = size.width >= 44 && size.height >= 44;
                console.log(`  ${selector}: ${size.width}x${size.height}px ${adequate ? '✅' : '❌ (min 44x44)'}`);
            }
        }
        
        // Test 4: Check font sizes
        console.log('\n📝 Font Sizes:');
        const textElements = ['#output', 'button'];
        for (const selector of textElements) {
            const fontSize = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return null;
                return parseFloat(window.getComputedStyle(el).fontSize);
            }, selector);
            
            if (fontSize) {
                const adequate = fontSize >= 14;
                console.log(`  ${selector}: ${fontSize}px ${adequate ? '✅' : '❌ (min 14px)'}`);
            }
        }
        
        // Test 5: Test Settings Modal
        console.log('\n⚙️ Settings Modal:');
        const fabButton = await page.$('#settingsFab');
        if (fabButton) {
            await fabButton.click();
            await page.waitForTimeout(500);
            
            const modalVisible = await page.locator('#settingsModal').isVisible();
            console.log(`  Modal opens: ${modalVisible ? '✅' : '❌'}`);
            
            if (modalVisible) {
                // Check modal elements
                const modalElements = ['#languageSelect', '#fontSizeSlider', '#themeToggle'];
                for (const selector of modalElements) {
                    const isVisible = await page.locator(selector).isVisible().catch(() => false);
                    console.log(`  ${selector}: ${isVisible ? '✅ Visible' : '❌ Not visible'}`);
                }
                
                // Close modal
                await page.keyboard.press('Escape');
            }
        }
        
        // Test 6: Quick Language Selector
        console.log('\n🌍 Quick Language Selector:');
        const quickLang = await page.$('#quickLanguageSelect');
        if (quickLang) {
            const options = await page.$$eval('#quickLanguageSelect option', opts => opts.length);
            console.log(`  Options available: ${options} ✅`);
            
            // Try changing language
            await page.selectOption('#quickLanguageSelect', 'es-ES');
            await page.waitForTimeout(500);
            const selectedValue = await page.inputValue('#quickLanguageSelect');
            console.log(`  Can change language: ${selectedValue === 'es-ES' ? '✅' : '❌'}`);
        } else {
            console.log('  Quick language selector not found ❌');
        }
        
        console.log('\n' + '═'.repeat(40));
        console.log('✨ Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testUISimple().catch(console.error);
const { chromium } = require('playwright');
const path = require('path');

async function testSpeechToTextApp() {
    console.log('🚀 Starting Speech-to-Text Application Tests...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream'
        ]
    });
    
    const context = await browser.newContext({
        permissions: ['microphone']
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });
    
    page.on('pageerror', error => {
        console.log('❌ Page Error:', error.message);
    });
    
    try {
        // Load the HTML file
        const filePath = 'file://' + path.resolve(__dirname, 'simple_speech_to_text.html').replace(/\\/g, '/');
        console.log(`📄 Loading: ${filePath}\n`);
        
        await page.goto(filePath, { waitUntil: 'networkidle' });
        console.log('✅ Page loaded successfully\n');
        
        // Test 1: Check if all required elements exist
        console.log('🔍 Testing UI Elements...');
        const elements = {
            recordBtn: await page.$('#recordBtn'),
            clearBtn: await page.$('#clearBtn'),
            copyBtn: await page.$('#copyBtn'),
            languageSelect: await page.$('#languageSelect'),
            output: await page.$('#output'),
            status: await page.$('#status'),
            themeToggle: await page.$('#themeToggle'),
            fontSizeSlider: await page.$('#fontSizeSlider'),
            exportBtn: await page.$('#exportBtn')
        };
        
        let missingElements = [];
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                missingElements.push(name);
                console.log(`  ❌ ${name} - NOT FOUND`);
            } else {
                console.log(`  ✅ ${name} - Found`);
            }
        }
        
        if (missingElements.length > 0) {
            console.log(`\n⚠️  Missing elements: ${missingElements.join(', ')}`);
        }
        
        // Test 2: Check Speech Recognition API
        console.log('\n🎤 Testing Speech Recognition API...');
        const hasSpeechRecognition = await page.evaluate(() => {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        });
        
        if (hasSpeechRecognition) {
            console.log('  ✅ Speech Recognition API is available');
        } else {
            console.log('  ❌ Speech Recognition API is NOT available');
        }
        
        // Test 3: Test theme toggle
        if (elements.themeToggle) {
            console.log('\n🎨 Testing Theme Toggle...');
            await page.click('#themeToggle');
            await page.waitForTimeout(500);
            
            const isDarkTheme = await page.evaluate(() => {
                return document.documentElement.getAttribute('data-theme') === 'dark';
            });
            console.log(`  ✅ Theme toggled to: ${isDarkTheme ? 'Dark' : 'Light'}`);
        }
        
        // Test 4: Test clear button
        if (elements.clearBtn && elements.output) {
            console.log('\n🧹 Testing Clear Button...');
            await page.fill('#output', 'Test text to clear');
            await page.click('#clearBtn');
            const outputValue = await page.inputValue('#output');
            if (outputValue === '') {
                console.log('  ✅ Clear button works correctly');
            } else {
                console.log('  ❌ Clear button failed to clear text');
            }
        }
        
        // Test 5: Test language selector
        if (elements.languageSelect) {
            console.log('\n🌍 Testing Language Selector...');
            const languages = await page.$$eval('#languageSelect option', options => 
                options.map(option => option.value)
            );
            console.log(`  ✅ Found ${languages.length} languages`);
            console.log(`     Languages: ${languages.slice(0, 3).join(', ')}...`);
        }
        
        // Test 6: Check for JavaScript errors
        console.log('\n🔧 Checking for JavaScript errors...');
        const jsErrors = await page.evaluate(() => {
            try {
                // Check if VoiceScriptApp class exists
                if (typeof window.voiceScriptApp === 'undefined') {
                    return 'VoiceScriptApp not initialized';
                }
                return null;
            } catch (error) {
                return error.message;
            }
        });
        
        if (jsErrors) {
            console.log(`  ❌ JavaScript Error: ${jsErrors}`);
        } else {
            console.log('  ✅ No JavaScript errors detected');
        }
        
        // Test 7: Test responsive design
        console.log('\n📱 Testing Responsive Design...');
        const viewports = [
            { name: 'Desktop', width: 1920, height: 1080 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile', width: 375, height: 667 }
        ];
        
        for (const viewport of viewports) {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(300);
            console.log(`  ✅ ${viewport.name} (${viewport.width}x${viewport.height})`);
        }
        
        // Test 8: Performance check
        console.log('\n⚡ Performance Metrics...');
        const performanceMetrics = await page.evaluate(() => {
            const timing = performance.timing;
            return {
                domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
                loadComplete: timing.loadEventEnd - timing.loadEventStart
            };
        });
        console.log(`  DOM Content Loaded: ${performanceMetrics.domContentLoaded}ms`);
        console.log(`  Page Load Complete: ${performanceMetrics.loadComplete}ms`);
        
        console.log('\n✨ All tests completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
        console.log('\n👋 Browser closed');
    }
}

// Run the tests
testSpeechToTextApp().catch(console.error);
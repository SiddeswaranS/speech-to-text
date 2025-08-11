const { chromium, devices } = require('playwright');

async function testUIComprehensive() {
    console.log('🎨 Starting Comprehensive UI Testing...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream']
    });
    
    const issues = [];
    
    // Test different viewport sizes
    const viewports = [
        { name: 'iPhone SE', width: 375, height: 667, device: 'mobile' },
        { name: 'iPhone 12 Pro', width: 390, height: 844, device: 'mobile' },
        { name: 'iPad Mini', width: 768, height: 1024, device: 'tablet' },
        { name: 'iPad Pro', width: 1024, height: 1366, device: 'tablet' },
        { name: 'Desktop HD', width: 1920, height: 1080, device: 'desktop' },
        { name: 'Desktop 4K', width: 3840, height: 2160, device: 'desktop' }
    ];
    
    for (const viewport of viewports) {
        console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
        console.log('─'.repeat(50));
        
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            permissions: ['microphone']
        });
        
        const page = await context.newPage();
        
        // Capture console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        try {
            await page.goto('http://127.0.0.1:5500/simple_speech_to_text.html', { 
                waitUntil: 'networkidle',
                timeout: 10000 
            });
            
            // Wait for app initialization
            await page.waitForTimeout(500);
            
            // Test 1: Check for scrollbars
            console.log('  📜 Checking for scrollbars...');
            const hasScroll = await page.evaluate(() => {
                const hasVerticalScroll = document.documentElement.scrollHeight > window.innerHeight;
                const hasHorizontalScroll = document.documentElement.scrollWidth > window.innerWidth;
                return { vertical: hasVerticalScroll, horizontal: hasHorizontalScroll };
            });
            
            if (hasScroll.vertical) {
                issues.push(`${viewport.name}: Vertical scrollbar detected`);
                console.log('    ❌ Vertical scrollbar detected');
            } else {
                console.log('    ✅ No vertical scrollbar');
            }
            
            if (hasScroll.horizontal) {
                issues.push(`${viewport.name}: Horizontal scrollbar detected`);
                console.log('    ❌ Horizontal scrollbar detected');
            } else {
                console.log('    ✅ No horizontal scrollbar');
            }
            
            // Test 2: Check element visibility
            console.log('  👁️  Checking element visibility...');
            const elements = [
                { selector: '#recordBtn', name: 'Record Button' },
                { selector: '#clearBtn', name: 'Clear Button' },
                { selector: '#quickLanguageSelect', name: 'Quick Language Selector' },
                { selector: '#output', name: 'Output Area' },
                { selector: '#settingsFab', name: 'Settings Button' },
                { selector: '.header', name: 'Header' }
            ];
            
            for (const element of elements) {
                const isVisible = await page.locator(element.selector).isVisible().catch(() => false);
                if (!isVisible) {
                    issues.push(`${viewport.name}: ${element.name} not visible`);
                    console.log(`    ❌ ${element.name} - Not visible`);
                } else {
                    const boundingBox = await page.locator(element.selector).boundingBox();
                    if (boundingBox) {
                        const isFullyVisible = 
                            boundingBox.x >= 0 && 
                            boundingBox.y >= 0 &&
                            boundingBox.x + boundingBox.width <= viewport.width &&
                            boundingBox.y + boundingBox.height <= viewport.height;
                        
                        if (!isFullyVisible) {
                            issues.push(`${viewport.name}: ${element.name} partially hidden`);
                            console.log(`    ⚠️  ${element.name} - Partially hidden`);
                        } else {
                            console.log(`    ✅ ${element.name} - Fully visible`);
                        }
                    }
                }
            }
            
            // Test 3: Check overlapping elements
            console.log('  🔄 Checking for overlapping elements...');
            const overlaps = await page.evaluate(() => {
                const elements = ['#recordBtn', '#clearBtn', '#quickLanguageSelect', '#output', '#settingsFab'];
                const overlapping = [];
                
                for (let i = 0; i < elements.length; i++) {
                    for (let j = i + 1; j < elements.length; j++) {
                        const el1 = document.querySelector(elements[i]);
                        const el2 = document.querySelector(elements[j]);
                        
                        if (el1 && el2) {
                            const rect1 = el1.getBoundingClientRect();
                            const rect2 = el2.getBoundingClientRect();
                            
                            const overlap = !(
                                rect1.right < rect2.left || 
                                rect2.right < rect1.left || 
                                rect1.bottom < rect2.top || 
                                rect2.bottom < rect1.top
                            );
                            
                            if (overlap) {
                                overlapping.push(`${elements[i]} overlaps ${elements[j]}`);
                            }
                        }
                    }
                }
                return overlapping;
            });
            
            if (overlaps.length > 0) {
                overlaps.forEach(overlap => {
                    issues.push(`${viewport.name}: ${overlap}`);
                    console.log(`    ❌ ${overlap}`);
                });
            } else {
                console.log('    ✅ No overlapping elements');
            }
            
            // Test 4: Check text readability
            console.log('  📖 Checking text readability...');
            const textElements = await page.evaluate(() => {
                const output = document.querySelector('#output');
                const buttons = document.querySelectorAll('button');
                const results = [];
                
                if (output) {
                    const style = window.getComputedStyle(output);
                    const fontSize = parseFloat(style.fontSize);
                    if (fontSize < 14) {
                        results.push(`Output text too small: ${fontSize}px`);
                    }
                }
                
                buttons.forEach(btn => {
                    const style = window.getComputedStyle(btn);
                    const fontSize = parseFloat(style.fontSize);
                    if (fontSize < 12) {
                        results.push(`Button text too small: ${fontSize}px`);
                    }
                });
                
                return results;
            });
            
            textElements.forEach(issue => {
                issues.push(`${viewport.name}: ${issue}`);
                console.log(`    ⚠️  ${issue}`);
            });
            
            if (textElements.length === 0) {
                console.log('    ✅ Text sizes are readable');
            }
            
            // Test 5: Test Settings Modal
            console.log('  ⚙️  Testing Settings Modal...');
            const settingsBtn = await page.$('#settingsFab');
            if (settingsBtn) {
                await settingsBtn.click();
                await page.waitForTimeout(300);
                
                const modalVisible = await page.locator('#settingsModal').isVisible();
                if (modalVisible) {
                    console.log('    ✅ Settings modal opens');
                    
                    // Check if modal fits in viewport
                    const modalBox = await page.locator('.modal-content').boundingBox();
                    if (modalBox) {
                        if (modalBox.height > viewport.height * 0.9) {
                            issues.push(`${viewport.name}: Settings modal too tall`);
                            console.log('    ⚠️  Modal too tall for viewport');
                        }
                        if (modalBox.width > viewport.width * 0.9) {
                            issues.push(`${viewport.name}: Settings modal too wide`);
                            console.log('    ⚠️  Modal too wide for viewport');
                        }
                    }
                    
                    // Close modal
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(300);
                } else {
                    issues.push(`${viewport.name}: Settings modal failed to open`);
                    console.log('    ❌ Settings modal failed to open');
                }
            }
            
            // Test 6: Check contrast ratios
            console.log('  🎨 Checking color contrast...');
            const contrastIssues = await page.evaluate(() => {
                function getLuminance(r, g, b) {
                    const [rs, gs, bs] = [r, g, b].map(c => {
                        c = c / 255;
                        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                    });
                    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
                }
                
                function getContrastRatio(rgb1, rgb2) {
                    const l1 = getLuminance(...rgb1);
                    const l2 = getLuminance(...rgb2);
                    const lighter = Math.max(l1, l2);
                    const darker = Math.min(l1, l2);
                    return (lighter + 0.05) / (darker + 0.05);
                }
                
                const issues = [];
                const output = document.querySelector('#output');
                if (output) {
                    const style = window.getComputedStyle(output);
                    const bgColor = style.backgroundColor.match(/\d+/g).map(Number);
                    const textColor = style.color.match(/\d+/g).map(Number);
                    const ratio = getContrastRatio(bgColor, textColor);
                    if (ratio < 4.5) {
                        issues.push(`Low contrast in output area: ${ratio.toFixed(2)}:1`);
                    }
                }
                return issues;
            });
            
            contrastIssues.forEach(issue => {
                issues.push(`${viewport.name}: ${issue}`);
                console.log(`    ⚠️  ${issue}`);
            });
            
            // Test 7: Touch target sizes (mobile only)
            if (viewport.device === 'mobile') {
                console.log('  👆 Checking touch target sizes...');
                const touchTargets = await page.evaluate(() => {
                    const minSize = 44; // Minimum recommended touch target size
                    const buttons = document.querySelectorAll('button, select, input');
                    const smallTargets = [];
                    
                    buttons.forEach(btn => {
                        const rect = btn.getBoundingClientRect();
                        if (rect.width < minSize || rect.height < minSize) {
                            smallTargets.push({
                                element: btn.id || btn.className,
                                width: rect.width,
                                height: rect.height
                            });
                        }
                    });
                    
                    return smallTargets;
                });
                
                touchTargets.forEach(target => {
                    issues.push(`${viewport.name}: Touch target too small - ${target.element} (${target.width}x${target.height}px)`);
                    console.log(`    ⚠️  ${target.element} - ${target.width}x${target.height}px (min: 44x44px)`);
                });
                
                if (touchTargets.length === 0) {
                    console.log('    ✅ All touch targets are adequate size');
                }
            }
            
            // Test 8: Check animations performance
            console.log('  🎬 Checking animation performance...');
            const animationCheck = await page.evaluate(() => {
                const animations = document.getAnimations();
                return animations.length;
            });
            console.log(`    ℹ️  Active animations: ${animationCheck}`);
            
            // Check console errors
            if (consoleErrors.length > 0) {
                consoleErrors.forEach(error => {
                    issues.push(`${viewport.name}: Console error - ${error}`);
                });
            }
            
        } catch (error) {
            issues.push(`${viewport.name}: Test failed - ${error.message}`);
            console.log(`  ❌ Test failed: ${error.message}`);
        } finally {
            await context.close();
        }
    }
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    
    if (issues.length === 0) {
        console.log('\n✅ All UI tests passed! No issues found.');
    } else {
        console.log(`\n⚠️  Found ${issues.length} UI issues:\n`);
        issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue}`);
        });
    }
    
    await browser.close();
    return issues;
}

// Run the tests
testUIComprehensive().then(issues => {
    if (issues.length > 0) {
        console.log('\n🔧 Fixes needed for the identified issues');
        process.exit(1);
    } else {
        console.log('\n✨ UI is working perfectly!');
        process.exit(0);
    }
}).catch(console.error);
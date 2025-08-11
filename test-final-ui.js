const { chromium } = require('playwright');

async function testFinalUI() {
    console.log('🎨 Final UI Test\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--use-fake-device-for-media-stream']
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 },
        permissions: ['microphone']
    });
    
    const page = await context.newPage();
    
    try {
        await page.goto('http://127.0.0.1:5500/simple_speech_to_text.html');
        await page.waitForTimeout(1000);
        
        // Check Settings FAB position
        console.log('📍 Settings FAB Position:');
        const fabPosition = await page.evaluate(() => {
            const fab = document.querySelector('#settingsFab');
            if (!fab) return null;
            const rect = fab.getBoundingClientRect();
            const style = window.getComputedStyle(fab);
            return {
                bottom: Math.round(window.innerHeight - rect.bottom),
                right: Math.round(window.innerWidth - rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                top: Math.round(rect.top)
            };
        });
        
        if (fabPosition) {
            console.log(`  Position from bottom: ${fabPosition.bottom}px`);
            console.log(`  Position from right: ${fabPosition.right}px`);
            console.log(`  Position from top: ${fabPosition.top}px`);
            console.log(`  Size: ${fabPosition.width}x${fabPosition.height}px`);
        }
        
        // Check Export button position
        console.log('\n📤 Export Button Position:');
        const exportPosition = await page.evaluate(() => {
            const exp = document.querySelector('#exportBtn');
            if (!exp) return null;
            const rect = exp.getBoundingClientRect();
            return {
                top: Math.round(rect.top),
                left: Math.round(rect.left),
                bottom: Math.round(rect.bottom),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            };
        });
        
        if (exportPosition) {
            console.log(`  Position: top: ${exportPosition.top}px, left: ${exportPosition.left}px`);
            console.log(`  Bottom: ${exportPosition.bottom}px, right: ${exportPosition.right}px`);
            console.log(`  Size: ${exportPosition.width}x${exportPosition.height}px`);
        }
        
        // Check for overlap between Settings FAB and Export button
        console.log('\n🔍 Overlap Check:');
        const hasOverlap = await page.evaluate(() => {
            const fab = document.querySelector('#settingsFab');
            const exp = document.querySelector('#exportBtn');
            if (!fab || !exp) return { overlap: false, reason: 'Elements not found' };
            
            const fabRect = fab.getBoundingClientRect();
            const expRect = exp.getBoundingClientRect();
            
            const overlap = !(fabRect.right < expRect.left || 
                             expRect.right < fabRect.left || 
                             fabRect.bottom < expRect.top || 
                             expRect.bottom < fabRect.top);
            
            return {
                overlap,
                fabBottom: Math.round(fabRect.bottom),
                expTop: Math.round(expRect.top),
                verticalGap: Math.round(expRect.top - fabRect.bottom)
            };
        });
        
        console.log(`  Overlapping: ${hasOverlap.overlap ? '❌ Yes' : '✅ No'}`);
        if (hasOverlap.verticalGap) {
            console.log(`  Vertical gap: ${hasOverlap.verticalGap}px`);
        }
        
        // Test modal border radius
        console.log('\n🎨 Settings Modal Styles:');
        await page.click('#settingsFab');
        await page.waitForTimeout(500);
        
        const modalStyles = await page.evaluate(() => {
            const panel = document.querySelector('.settings-panel');
            if (!panel) return null;
            
            const style = window.getComputedStyle(panel);
            return {
                borderRadius: style.borderRadius,
                overflow: style.overflow,
                isVisible: panel.offsetWidth > 0 && panel.offsetHeight > 0
            };
        });
        
        if (modalStyles) {
            console.log(`  Border radius: ${modalStyles.borderRadius}`);
            console.log(`  Overflow: ${modalStyles.overflow}`);
            console.log(`  Modal visible: ${modalStyles.isVisible ? '✅' : '❌'}`);
        }
        
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        
        // Test all buttons are accessible
        console.log('\n🎯 Button Accessibility:');
        const buttons = ['#recordBtn', '#clearBtn', '#exportBtn', '#settingsFab'];
        for (const selector of buttons) {
            const isAccessible = await page.evaluate((sel) => {
                const el = document.querySelector(sel);
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return rect.width >= 44 && rect.height >= 44;
            }, selector);
            console.log(`  ${selector}: ${isAccessible ? '✅ Accessible (≥44x44px)' : '❌ Too small'}`);
        }
        
        console.log('\n✨ UI Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await browser.close();
    }
}

testFinalUI().catch(console.error);
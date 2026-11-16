import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join('C:\\Users\\sumay\\AppData\\Local\\Temp\\.playwright-mcp', 'qh-v4-final');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function capture() {
  const browser = await chromium.launch({ headless: true });
  
  const viewports = [
    { name: '1920', width: 1920, height: 1080, deviceScaleFactor: 1 },
    { name: '1440', width: 1440, height: 900, deviceScaleFactor: 1 },
    { name: '390', width: 390, height: 844, deviceScaleFactor: 3, isMobile: true },
  ];
  
  const urls = [
    { path: '/', name: 'home' },
    { path: '/products/gum-arabic/', name: 'gum-arabic' },
    { path: '/products/cotton/', name: 'cotton' },
    { path: '/products/seeds/', name: 'seeds' },
  ];
  
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile || false,
      hasTouch: vp.isMobile || false,
    });
    
    const page = await context.newPage();
    
    for (const url of urls) {
      try {
        await page.goto(`http://127.0.0.1:4400${url.path}`, { 
          waitUntil: 'networkidle', 
          timeout: 30000 
        });
        await page.waitForTimeout(1500); // Let animations settle
        
        // Full page screenshot
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `${url.name}-${vp.name}.png`),
          fullPage: true,
        });
        
        // Above-fold screenshot
        await page.screenshot({
          path: path.join(OUTPUT_DIR, `${url.name}-${vp.name}-fold.png`),
          clip: { x: 0, y: 0, width: vp.width, height: vp.height },
        });
        
        console.log(`✓ ${url.name}-${vp.name}`);
      } catch (e) {
        console.log(`✗ ${url.name}-${vp.name}: ${e.message}`);
      }
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log(`\nScreenshots saved to: ${OUTPUT_DIR}`);
}

capture().catch(console.error);
import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.bottleViewer);
const box=await page.locator('.formula-journey-card h1').boundingBox();assert.ok(box.x>=0&&box.x+box.width<=390);assert.ok(box.height>55);
await page.screenshot({path:'.qa/mobile-final.png'});
console.log(JSON.stringify({titleBox:box,clipped:false}));await browser.close();

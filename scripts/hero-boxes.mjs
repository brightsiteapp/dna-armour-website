import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.bottleViewer);
for(const p of [0,.51]){await page.evaluate(p=>{const s=document.querySelector('.story'),v=document.querySelector('.product-stage');scrollTo(0,(s.offsetHeight-v.offsetHeight)*p/2)},p);await page.waitForTimeout(150);const q='.ingredient-reel li:first-child';console.log(p,q,await page.locator(q).boundingBox());}
await browser.close();

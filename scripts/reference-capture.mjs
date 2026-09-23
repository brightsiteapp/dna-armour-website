import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('https://onething.framer.ai/#effects-timeline',{waitUntil:'networkidle',timeout:60000});
await page.screenshot({path:'.qa/reference-onething.png'});
const target=page.locator('#effects-timeline');
if(await target.count()){await target.scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.screenshot({path:'.qa/reference-effects.png'});}
console.log(JSON.stringify({title:await page.title(),url:page.url(),target:await target.count()}));
await browser.close();

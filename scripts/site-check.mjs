import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.bottleViewer);
 if(name==='desktop'){const data=await page.evaluate(()=>window.bottleViewer.snapshot());await writeFile('assets/bottle-render.png',Buffer.from(data.split(',')[1],'base64'));}
 assert.equal(await page.locator('.site-header nav a').allTextContents().then(x=>x.join('|')),'Home|The Science|Buy or subscribe');
 assert.equal(await page.locator('.science-card').count(),7);
 assert.equal(await page.locator('a[href="shop.html"]').count(),2);
 assert.ok(await page.locator('.formula-journey-card h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))>await page.locator('.lead').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)));
 await page.locator('.faq-section').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
 await page.screenshot({path:`.qa/faq-${name}.png`,fullPage:false});
 await page.locator('.formula-section').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
 await page.screenshot({path:`.qa/science-${name}.png`,fullPage:false});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.goto('http://127.0.0.1:4173/shop.html',{waitUntil:'networkidle'});
 assert.equal(await page.locator('.purchase-option').count(),2);
 await page.getByText('Subscribe',{exact:true}).click();await page.locator('.purchase-action').click();
 assert.ok((await page.locator('.purchase-note').textContent()).includes('Subscription selected'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:`.qa/shop-${name}.png`});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({name,scienceCards:7,purchase:true,overflow:false,errors}));await page.close();
}
await browser.close();

import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.bottleViewer);
 const positions=[];
 for(const p of [.58,1,1.76,1]){
  await page.evaluate(p=>{const s=document.querySelector('.story'),v=document.querySelector('.product-stage');scrollTo({top:(s.offsetHeight-v.offsetHeight)*p/2,behavior:'instant'});},p);
  await page.waitForFunction(p=>Math.abs(Number(document.querySelector('.product-stage').dataset.progress)-p)<.005,p);
  await page.waitForTimeout(350);
  positions.push(await page.evaluate(()=>({y:new DOMMatrix(getComputedStyle(document.querySelector('.ingredient-reel')).transform).m42,count:document.querySelector('[data-ingredient-count]').textContent,active:document.querySelector('.story-step.is-active').dataset.step,overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 assert.ok(positions[0].y>positions[1].y&&positions[1].y>positions[2].y);
 assert.equal(positions[1].y,positions[3].y);
 assert.ok(positions.every(s=>s.active==='1'&&!s.overflow));
 assert.equal(positions[2].count,'11 / 11');
 assert.equal(await page.getByText('Less tired.',{exact:false}).count(),0);
 await page.screenshot({path:`.qa/ingredients-${name}.png`});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(200);
 assert.equal(await page.locator('.ingredient-reel').evaluate(e=>getComputedStyle(e).transform),'none');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({name,positions,reducedMotion:true,errors}));
 await page.close();
}
await browser.close();

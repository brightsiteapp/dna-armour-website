import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-angle=swiftshader']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/science.html',{waitUntil:'networkidle'});await page.waitForTimeout(1200);
  const cards=page.locator('.science-card');assert.equal(await cards.count(),7);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await cards.last().scrollIntoViewIfNeeded();await page.waitForTimeout(1100);await page.screenshot({path:`.qa/science-page-${name}.png`});
  if(name==='desktop'){const bottoms=await cards.evaluateAll(nodes=>nodes.slice(4).map(n=>Math.round(n.getBoundingClientRect().bottom)));assert.equal(new Set(bottoms).size,1);}
  assert.deepEqual(errors,[]);console.log(JSON.stringify({name,cards:7,balanced:true,overflow:false}));await page.close();
}
await browser.close();

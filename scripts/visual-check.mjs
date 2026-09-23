import { chromium } from '/Users/tomconroy/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844],['small',375,667]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.bottleViewer);
 if(name==='desktop'){
  const data=await page.evaluate(()=>window.bottleViewer.snapshot());
  await writeFile('assets/bottle-render.png',Buffer.from(data.split(',')[1],'base64'));
  await page.reload({waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.bottleViewer);
 }
 const states=[];
 for(const step of [0,1,2]){
  await page.evaluate(i=>{const s=document.querySelector('.story'),p=document.querySelector('.product-stage');window.scrollTo({top:(s.offsetHeight-p.offsetHeight)*i/2,behavior:'instant'});},step);
  await page.waitForTimeout(450);
  await page.screenshot({path:`.qa/${name}-${step}.png`});
  states.push(await page.evaluate(()=>({model:window.bottleViewer.info(),progress:document.querySelector('.product-stage').dataset.progress,descend:getComputedStyle(document.querySelector('.product-view')).transform,active:document.querySelector('.story-step.is-active').dataset.step,overflow:document.documentElement.scrollWidth>innerWidth})));
 }
 console.log(JSON.stringify({name,states,errors}));
 await page.close();
}
await browser.close();

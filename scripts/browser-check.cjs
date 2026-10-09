// Uses an existing Playwright installation; no production dependencies.
const {chromium}=require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:8765')&&r.status()>=400) errors.push(`${r.status()} ${r.url()}`)});
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:912});await page.goto('http://127.0.0.1:8765');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow at ${width}`);
  for(const link of await page.locator('a[href^="#"]').all()){
   if(!await link.isVisible())continue;
   const href=await link.getAttribute('href');await link.focus();await link.click();assert.equal(await page.evaluate(()=>location.hash),href);
  }
  console.log(`PASS ${width}px: no overflow; all visible anchor controls navigate`);
 }
 await page.setViewportSize({width:1440,height:912});await page.goto('http://127.0.0.1:8765');
 await page.screenshot({path:path.join(__dirname,'../validation/desktop.png')});
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:8765');
 await page.screenshot({path:path.join(__dirname,'../validation/mobile.png'),fullPage:true});
 await page.screenshot({path:path.join(__dirname,'../validation/mobile-viewport.png')});
 await page.getByRole('link',{name:'Read the project background'}).click();assert(page.url().endsWith('/background.html'));
 await page.getByRole('link',{name:'← Agent Gov Graph home'}).click();assert(page.url().endsWith('/index.html'));
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS background round-trip, reduced motion, no browser errors or failed local requests');
})().catch(e=>{console.error(e);process.exit(1)});

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {chromium}=require('playwright');
const base=process.env.COMP139E_TEST_URL||'http://127.0.0.1:8765/comp139e/desk.html';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  async function select(id){await page.goto(base+'#'+encodeURIComponent(id));await page.reload();await page.waitForFunction(()=>document.querySelector('#run-status').textContent.startsWith('Ready'));}
  async function run(){await page.locator('#run').click();await page.waitForFunction(()=>!document.querySelector('#run').disabled,{},{timeout:95000});}
  await select('tutorial:6');const original=await page.locator('#source-code').inputValue();
  await page.locator('#source-code').fill(original+'\n// saved draft');
  await page.locator('#file-select').selectOption('tutorials/support/Geometry.cpp');await page.locator('#source-code').fill((await page.locator('#source-code').inputValue())+'\n// another draft');
  await page.reload();await page.waitForFunction(()=>document.querySelector('#source-code').value.includes('saved draft'));
  await page.locator('#file-select').selectOption('tutorials/support/Geometry.cpp');assert.match(await page.locator('#source-code').inputValue(),/another draft/);
  page.once('dialog',d=>d.accept());await page.locator('#reset').click();assert.doesNotMatch(await page.locator('#source-code').inputValue(),/another draft/);
  if(process.argv.includes('--live')){
   await run();assert.match(await page.locator('#run-status').textContent(),/Finished/);assert.match(await page.locator('#console').textContent(),/PASS: 3-4-5 triangle/);
   await select('tutorial:12');await run();assert.match(await page.locator('#console').textContent(),/--- File: tutorials\/output/);assert.match(await page.locator('#console').textContent(),/Integer: 12/);
   await select('scratch');await page.locator('#source-code').fill('#include <iostream>\nint main(){int n; std::cin >> n; std::cout << "Result: " << n*2 << " — café";}');await page.locator('#stdin').fill('21');await run();assert.match(await page.locator('#console').textContent(),/Result: 42 — café/);
   await page.locator('#source-code').fill('int main(){ broken C++ }');await run();assert.match(await page.locator('#run-status').textContent(),/Compilation Error/);assert.match(await page.locator('#diagnostics').textContent(),/error:/);
  }
  await select('scratch');
  await page.route('https://ce.judge0.com/**',route=>route.fulfill({status:429,body:'rate limited'}));await run();assert.match(await page.locator('#run-status').textContent(),/rate limit/);
  await page.unroute('https://ce.judge0.com/**');await page.route('https://ce.judge0.com/**',route=>route.abort());await run();assert.match(await page.locator('#run-status').textContent(),/Cannot reach/);
  await page.unroute('https://ce.judge0.com/**');let submitted;
  await page.route('https://ce.judge0.com/**',route=>{const post=route.request().method()==='POST';if(post)submitted=route.request().postDataJSON();return route.fulfill({contentType:'application/json',body:JSON.stringify(post?{token:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'}:{status:{id:1,description:'In Queue'}})});});
  await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#run-status').textContent==='Queued...');assert.equal(submitted.language_id,89);assert.ok(submitted.additional_files);assert.equal(submitted.enable_network,false);
  await page.locator('#stop').click();assert.match(await page.locator('#run-status').textContent(),/Stopped waiting/);assert.ok(await page.locator('#run').isEnabled());
  await page.clock.install();await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#run-status').textContent==='Queued...');await page.clock.fastForward(91000);assert.match(await page.locator('#run-status').textContent(),/too long/);assert.ok(await page.locator('#run').isEnabled());
  await page.unroute('https://ce.judge0.com/**');await select('tutorial:5');
  const folder=path.join(os.tmpdir(),'comp139e-online-check');fs.mkdirSync(folder,{recursive:true});await page.screenshot({path:path.join(folder,'desktop.png'),fullPage:true});
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(folder,'mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS online editor, multi-file drafts, reset, failures, cancellation, timeout, responsive layout'+(process.argv.includes('--live')?', real C++ compilation, Unicode, stdin, file output and diagnostics.':'.'));console.log(folder);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

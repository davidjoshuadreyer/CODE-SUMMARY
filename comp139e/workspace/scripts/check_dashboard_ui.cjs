// Optional browser QA: npm install --prefix build/dashboard-qa --no-save playwright
// Then: node scripts/check_dashboard_ui.cjs
const {chromium} = require('../build/dashboard-qa/node_modules/playwright');
const {spawn} = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const report = path.join(root,'tutorials/output/dashboard-ui-check.txt');
const reportBackup = fs.existsSync(report) ? fs.readFileSync(report) : null;
const server = spawn('python',[path.join(root,'dashboard/server.py'),'--port','0','--no-browser'],{cwd:root,windowsHide:true});
let browser, base, token;
const failures=[];
const ready = new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(Error('Dashboard server did not start')),15000);
  server.stdout.on('data',data=>{const match=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);resolve(match[0]);}});
  server.on('error',reject);server.on('exit',code=>{if(code)reject(Error(`Server exited ${code}`));});
});
async function select(page,query,id){
  await page.getByRole('searchbox',{name:'Search programs'}).fill(query);
  await page.locator(`.program-item[data-id="${id}"]`).click();
  await page.waitForFunction(()=>document.querySelector('#source-code').textContent!=='Loading…');
}
async function finished(page){await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Finished'),{},{timeout:20000});}
(async()=>{
  base=await ready;
  token=(await (await fetch(base+'/api/catalog')).json()).token;
  browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1050}});
  page.on('pageerror',error=>failures.push(error.message));
  page.on('console',message=>{if(message.type()==='error') failures.push(message.text());});
  await page.goto(base);
  await page.waitForFunction(()=>document.querySelectorAll('.program-item').length===85);
  await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('testCircleWithPrivateDataFields'));
  await page.locator('#run').click();
  await finished(page);
  assert.match(await page.locator('#console').innerText(),/circle|Circle/);
  await page.screenshot({path:path.join(root,'build/dashboard-qa/dashboard-desktop.png'),fullPage:true});
  console.log('PASS default reference run, source preview, and desktop render');

  await page.locator('#file-select').selectOption('reference/examples/Objects_and_Classes/CircleWithPrivateDataFields.cpp');
  await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('CircleP::'));
  await select(page,'ComputeAverage','example:computeAverage');
  await page.locator('#run').click();
  await page.waitForFunction(()=>document.querySelector('#console').textContent.includes('Enter three numbers'));
  await page.locator('#program-input').fill('3 6 9');
  await page.locator('#send-input').click();
  await finished(page);
  assert.match(await page.locator('#console').innerText(),/6/);
  console.log('PASS interactive input and supporting source files');

  await select(page,'Surveying','lab:1');
  await page.locator('#sample').click();
  await page.locator('#run').click();
  await finished(page);
  assert.match(await page.locator('#console').innerText(),/5 streetlights/);
  console.log('PASS sample input and Lab 1');

  await select(page,'Input & decisions','tutorial:2');
  await page.locator('#run').click();
  await page.waitForFunction(()=>document.querySelector('#console').textContent.includes('Enter temperature'));
  await page.locator('#stop').click();
  await page.waitForFunction(()=>document.querySelector('#status').textContent==='Stopped');
  await page.locator('#run').click();
  await page.locator('#close-input').click();
  await finished(page);
  assert.match(await page.locator('#console').innerText(),/Input finished/);
  console.log('PASS stop, restart, and EOF');

  await select(page,'Files & text','tutorial:12');
  await page.locator('#output-file').fill('tutorials/output/dashboard-ui-check.txt');
  await page.locator('#run').click();
  await finished(page);
  await page.locator('#outputs-tab').click();
  await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('Word: apple'));
  assert.match(fs.readFileSync(report,'utf8'),/Integer: -3/);
  console.log('PASS file arguments and generated file previews');

  await select(page,'Harmonic motion','lab:8');
  assert.equal(await page.locator('#run').isDisabled(),true);
  assert.match(await page.locator('#program-note').innerText(),/MATLAB/);
  await page.getByRole('searchbox',{name:'Search programs'}).fill('nothing-matches-this');
  assert.equal(await page.locator('.program-item').count(),0);
  assert.match(await page.locator('#programs').innerText(),/No programs found/);

  await page.getByRole('searchbox',{name:'Search programs'}).fill('');
  await page.locator('.filter[data-kind="tutorials"]').click();
  assert.equal(await page.locator('.program-item').count(),18);
  await page.locator('.filter[data-kind="all"]').click();
  await select(page,'TestCircleWithPrivateDataFields','example:testCircleWithPrivateDataFields');
  await page.locator('#build').click();
  await page.waitForFunction(()=>document.querySelector('#run-detail').textContent.startsWith('Build'));
  await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Finished'),{},{timeout:180000});
  assert.match(await page.locator('#console').innerText(),/main.exe/);
  await page.locator('#run').click();
  // A click begins an async request. Do not mistake the previous build's
  // Finished badge for completion of the newly requested program.
  await page.waitForFunction(()=>document.querySelector('#console').textContent.includes('radius 100') && document.querySelector('#status').textContent.includes('Finished'));
  assert.match(await page.locator('#console').innerText(),/radius 100/);
  console.log('PASS build control and running again after compilation');
  await page.setViewportSize({width:390,height:844});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(root,'build/dashboard-qa/dashboard-mobile.png'),fullPage:true});
  assert.deepEqual(failures,[]);
  console.log('PASS category/search filters, MATLAB guidance, mobile layout, and no browser errors');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(base&&token) await fetch(base+'/api/stop',{method:'POST',headers:{'Content-Type':'application/json','X-Dashboard-Token':token},body:'{}'}).catch(()=>{});
  if(browser)await browser.close();
  server.kill();
  if(reportBackup!==null) fs.writeFileSync(report,reportBackup);
  else if(fs.existsSync(report)) fs.unlinkSync(report);
});

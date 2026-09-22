// NODE_PATH points to Playwright. Native integration checks require the built workspace.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {spawn}=require('node:child_process'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),data=require('./comp139e-content.cjs'),programs=require('../comp139e/programs.json');
const output=path.join(os.tmpdir(),'comp139e-check');fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});let native;
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/index.html#course/comp139e');await page.getByRole('heading',{name:'C++ & Engineering Computing',exact:true}).waitFor();
 const catalog=await page.evaluate(()=>window.TESSELATE_CATALOG);assert.equal(catalog.resources.filter(r=>r.courseId==='comp139e').length,24);
 for(const r of catalog.resources.filter(r=>r.courseId==='comp139e'))for(const id of r.referenceIds)assert.ok(catalog.references.some(ref=>ref.id===id));
 for(const file of fs.readdirSync(path.join(root,'comp139e')).filter(f=>f.endsWith('.html'))){
  await page.goto(base+'/comp139e/'+file);
  const links=await page.locator('a[href]').evaluateAll(items=>items.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#')));
  for(const href of links)assert.ok((await page.request.get(new URL(href,page.url()).href.split('#')[0])).ok(),file+' -> '+href);
 }
 await page.goto(base+'/comp139e/desk.html#tutorial%3A5');await page.getByRole('heading',{name:'Pointers & memory',exact:true}).waitFor();await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('makeReadings'));
 assert.equal(await page.locator('.program').count(),85);await page.locator('#category').selectOption('labs');assert.equal(await page.locator('.program').count(),9);
 await page.locator('[data-id="lab:8"]').click();await page.getByRole('heading',{name:'Harmonic motion',exact:true}).waitFor();assert.ok(await page.locator('#local-link').isHidden());assert.match(await page.locator('#program-note').textContent(),/MATLAB/);
 await page.locator('#category').selectOption('all');await page.locator('#search').fill('no-matching-program');assert.match(await page.locator('#programs').textContent(),/No matches/);await page.locator('#search').fill('computeAverage');await page.locator('[data-id="example:computeAverage"]').click();await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('computeAverage'));
 await page.reload();await page.waitForFunction(()=>document.querySelector('#command').textContent.includes('example computeAverage'));
 for(const p of programs)for(const file of p.files)assert.ok(fs.existsSync(path.join(root,'comp139e/workspace',file)),p.id+' '+file);
 for(let topic=0;topic<18;topic++){
  await page.goto(base+'/comp139e/quiz.html?topic='+topic);await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),2);
  for(const field of await page.locator('fieldset').all()){const id=await field.getAttribute('id'),q=data.questions.find(q=>q.id===id);await field.locator(`input[value="${q.correct}"]`).check();await field.locator('[data-check]').click();assert.equal(await field.locator('.feedback strong').textContent(),'Correct');}
  await page.locator('button[type=submit]').click();assert.match(await page.locator('#results h2').textContent(),/2 \/ 2/);
 }
 await page.goto(base+'/comp139e/exam.html');await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),18);assert.match(await page.locator('#timer').textContent(),/(45:00|44:5\d)/);await page.locator('input').first().check();await page.reload();await page.locator('#resume').click();assert.equal(await page.locator('input:checked').count(),1);await page.locator('button[type=submit]').click();assert.match(await page.locator('#results').textContent(),/17 unanswered/);
 await page.setViewportSize({width:390,height:844});
 for(const file of ['review.html','desk.html','labs.html','setup.html','lesson-05.html','lesson-17.html','quiz.html']){await page.goto(base+'/comp139e/'+file);if(file==='quiz.html')await page.locator('#start').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file);}
 await page.goto(base+'/comp139e/lesson-05.html');await page.screenshot({path:path.join(output,'lesson-mobile.png'),fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/comp139e/desk.html#tutorial%3A5');await page.waitForFunction(()=>document.querySelector('#source-code').textContent.includes('makeReadings'));await page.screenshot({path:path.join(output,'desk-desktop.png'),fullPage:true});
 // Check that the downloaded dashboard understands hosted program-selection links.
 native=spawn('python',[path.join(root,'comp139e/workspace/dashboard/server.py'),'--port','0','--no-browser'],{windowsHide:true});
 const local=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Native server startup timed out')),15000);native.once('error',reject);native.stdout.on('data',data=>{const match=data.toString().match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timeout);resolve(match[0]);}});});
 await page.goto(local+'/?program=tutorial%3A1');await page.waitForFunction(()=>document.querySelector('#program-title').textContent==='Variables & arithmetic');await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Finished'));assert.match(await page.locator('#console').textContent(),/3.0 \/ 2 = 1.5/);
 assert.deepEqual(errors,[]);console.log('PASS all 24 pages and links, 85 program entries, 36 answers, saved tests, mobile layouts, and native dashboard deep-link/run.');console.log('Screenshots: '+output);
 }finally{if(native)native.kill();await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

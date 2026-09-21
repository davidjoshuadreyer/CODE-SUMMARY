// NODE_PATH must point to an installation of Playwright; uses isolated Chrome.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),data=require('../engr290/content.json');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/index.html#course/engr290');await page.getByRole('heading',{name:'Engineering Materials',exact:true}).waitFor();
 const catalog=await page.evaluate(()=>window.TESSELATE_CATALOG);assert.equal(catalog.resources.filter(r=>r.courseId==='engr290').length,8);
 for(const r of catalog.resources.filter(r=>r.courseId==='engr290'))for(const id of r.referenceIds)assert.ok(catalog.references.some(s=>s.id===id));
 for(const file of fs.readdirSync(path.join(root,'engr290')).filter(f=>f.endsWith('.html'))){
  await page.goto(base+'/engr290/'+file);
  for(const href of await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.getAttribute('href')).filter(h=>!h.startsWith('http')&&!h.startsWith('#'))))assert.ok((await page.request.get(new URL(href,page.url()).href.split('#')[0])).ok(),href);
 }
 await page.goto(base+'/engr290/quiz.html?topic=0');await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),6);
 await page.locator('[data-check]').first().click();assert.match(await page.locator('[id^=feedback]').first().textContent(),/Choose an answer/);
 for(const field of await page.locator('fieldset').all()){const id=await field.getAttribute('id'),q=data.questions.find(q=>q.id===id);await field.locator(`input[value="${q.correct}"]`).check();await field.locator('[data-check]').click();assert.match(await field.locator('.feedback').textContent(),/Correct/);}
 await page.reload();await page.locator('#resume').click();assert.equal(await page.locator('input:checked').count(),6);
 await page.locator('button[type=submit]').click();assert.match(await page.locator('#results h2').textContent(),/6 \/ 6/);
 await page.goto(base+'/engr290/exam.html');await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),15);assert.equal(await page.locator('.feedback').count(),0);
 await page.locator('input').first().check();await page.reload();await page.locator('#resume').click();assert.equal(await page.locator('input:checked').count(),1);
 await page.locator('button[type=submit]').click();assert.match(await page.locator('#results').textContent(),/14 unanswered/);await page.locator('#retry').click();assert.ok(await page.locator('fieldset').count()>=14);
 await page.evaluate(()=>{let a=JSON.parse(localStorage.getItem('engr290-practice-v1-exam'));a.deadline=Date.now()-1000;localStorage.setItem('engr290-practice-v1-exam',JSON.stringify(a));});await page.reload();await page.locator('#resume').click();assert.match(await page.locator('#results').textContent(),/TIME IS UP/);
 await page.setViewportSize({width:390,height:844});
 for(const file of ['review.html','03-bonding-defects.html','quiz.html','exam.html']){await page.goto(base+'/engr290/'+file);if(file==='quiz.html'||file==='exam.html')await page.locator('#start').click();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file);}
 await page.goto(base+'/engr290/review.html');await page.screenshot({path:path.join(os.tmpdir(),'engr290-mobile.png'),fullPage:true});
 await page.setViewportSize({width:1400,height:1000});await page.goto(base+'/engr290/03-bonding-defects.html');await page.screenshot({path:path.join(os.tmpdir(),'engr290-lesson.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS catalog, source links, all pages, quiz grading, persistence, test submission, retry, timer expiry, and mobile layout');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

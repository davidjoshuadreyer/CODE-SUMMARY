// Run with Playwright available through NODE_PATH; uses isolated Chrome.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),os=require('node:os');
const {chromium}=require('playwright'),data=require('./math250b-content.cjs');
const {format}=require('../assets/study/math.js');
const root=path.resolve(__dirname,'..'),output=path.join(os.tmpdir(),'math250b-check');
fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.woff2':'font/woff2'})[path.extname(p)]||'application/octet-stream');fs.createReadStream(p).pipe(res);});
(async()=>{
 assert.equal(data.questions.length,48);
 assert.match(format(String.raw`\(\frac{1}{2}\)`),/mfrac/);
 assert.ok(format('<img src=x onerror=alert(1)>').startsWith('&lt;img'));
 assert.throws(()=>format(String.raw`\(\unknowncommand{x}\)`));
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)missing.push(r.url());});
  await page.goto(base+'/index.html#course/math250b');await page.getByRole('heading',{name:'Multivariable & Vector Calculus',exact:true}).waitFor();
  const catalog=await page.evaluate(()=>window.TESSELATE_CATALOG);
  assert.equal(catalog.resources.filter(r=>r.courseId==='math250b').length,11);
  assert.equal(catalog.references.filter(r=>r.courseId==='math250b').length,15);
  for(const item of [...catalog.resources,...catalog.references])assert.ok(fs.existsSync(path.join(root,decodeURIComponent(item.url))),item.url);
  // Simulate a returning browser with the old catalog and a personal note.
  await page.evaluate(async()=>{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tesselate-workspace',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});await new Promise((resolve,reject)=>{const tx=db.transaction('state','readwrite'),store=tx.objectStore('state'),req=store.get('workspace');req.onsuccess=()=>{const s=req.result;s.courses=s.courses.filter(c=>c.id!=='math250b');s.resources=s.resources.filter(r=>r.courseId!=='math250b');s.references=s.references.filter(r=>r.courseId!=='math250b');s.resources.push({id:'personal-test',courseId:'engr290',title:'Keep this note',kind:'Study notes',url:'',body:'My existing work',description:'',referenceIds:[]});s.currentSemester='Winter 2026';store.put(s,'workspace');};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();});
  await page.reload();await page.getByRole('heading',{name:'Multivariable & Vector Calculus',exact:true}).waitFor();assert.equal(await page.locator('#semester').inputValue(),'Winter 2026');
  await page.goto(base+'/index.html#note/personal-test');await page.locator('.note-body').waitFor();assert.equal(await page.locator('.note-body').textContent(),'My existing work');
  const noJS=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJS.newPage();await staticPage.goto(base+'/math250b/01-partial-derivatives.html');assert.ok(await staticPage.locator('.mfrac').count()>0);await noJS.close();
  for(let topic=0;topic<8;topic++){
   await page.goto(base+'/math250b/quiz.html?topic='+topic);await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),6);
   for(const field of await page.locator('fieldset').all()){
    const id=await field.getAttribute('id'),q=data.questions.find(q=>q.id===id);await field.locator(`input[value="${q.correct}"]`).check();await field.locator('[data-check]').click();assert.equal(await field.locator('.feedback strong').textContent(),'Correct');
   }
   assert.equal(await page.locator('.katex-error').count(),0);
   await page.locator('button[type=submit]').click();assert.match(await page.locator('#results h2').textContent(),/6 \/ 6/);
  }
  await page.goto(base+'/math250b/quiz.html?topic=0');await page.locator('#start').click();const first=page.locator('fieldset').first(),id=await first.getAttribute('id'),q=data.questions.find(q=>q.id===id);
  await first.locator('[data-check]').click();assert.match(await first.locator('[aria-live]').textContent(),/Choose an answer/);
  await first.locator(`input[value="${(q.correct+1)%4}"]`).check();await first.locator('[data-check]').click();assert.equal(await first.locator('.feedback strong').textContent(),'Incorrect');
  await page.reload();await page.locator('#resume').click();assert.equal(await page.locator('input:checked').count(),1);assert.equal(await page.locator('.feedback strong').textContent(),'Incorrect');
  await page.goto(base+'/math250b/exam.html');await page.locator('#start').click();assert.equal(await page.locator('fieldset').count(),24);assert.equal(await page.locator('.feedback').count(),0);assert.match(await page.locator('#timer').textContent(),/(60:00|59:5\d)/);
  await page.locator('button[type=submit]').click();assert.match(await page.locator('#results').textContent(),/24 unanswered/);await page.locator('#retry').click();assert.equal(await page.locator('fieldset').count(),24);
  await page.evaluate(()=>{let a=JSON.parse(localStorage.getItem('math250b-practice-v1-exam'));a.deadline=Date.now()-1000;localStorage.setItem('math250b-practice-v1-exam',JSON.stringify(a));});await page.reload();await page.locator('#resume').click();assert.match(await page.locator('#results').textContent(),/TIME IS UP/);
  const fits=async file=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),file);
  await page.setViewportSize({width:390,height:844});
  for(const l of data.lessons){await page.goto(base+'/math250b/'+l.slug+'.html');await fits(l.slug);assert.ok(await page.locator('.katex').count()>0);}
  for(let topic=0;topic<8;topic++){await page.goto(base+'/math250b/quiz.html?topic='+topic);await page.locator('#start').click();await fits('quiz '+topic);}
  await page.goto(base+'/math250b/02-gradients.html');await page.screenshot({path:path.join(output,'lesson-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/math250b/06-jacobians-surfaces.html');await page.screenshot({path:path.join(output,'lesson-desktop.png'),fullPage:true});
  await page.locator('#theme').click();await page.screenshot({path:path.join(output,'lesson-dark.png'),fullPage:true});
  await page.goto(base+'/math250b/quiz.html?topic=5');await page.locator('#start').click();await page.screenshot({path:path.join(output,'quiz-desktop.png'),fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log('PASS returning-workspace catalog merge, source paths, offline math assets, static fractions, all 48 answers, wrong/unanswered grading, persistence, timer expiry, and responsive layouts.');
  console.log('Screenshots: '+output);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

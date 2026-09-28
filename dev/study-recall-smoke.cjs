const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile())return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(p)]||'text/plain');fs.createReadStream(p).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/supabase.js',r=>r.fulfill({body:''}));
 await page.route('**/assets/workspace/cloud.js*',r=>r.fulfill({contentType:'text/javascript',body:`window.TesselateCloud={user:{id:'test',email:'test@example.test'},init:async cb=>{window.authCallback=cb;},studyRead:async()=>JSON.parse(localStorage.getItem('test-records')||'{"settings":{"value":{"start":"2026-09-27"}}}'),studyWrite:async(key,value,revision)=>{if(window.failSave)throw Error('Offline test');let rows=await window.TesselateCloud.studyRead();if((rows[key]?.revision||0)!==revision)throw Error('Changed on another device');rows[key]={value,revision:revision+1};localStorage.setItem('test-records',JSON.stringify(rows));if(window.failAfterSave)throw Error('Response lost');return rows[key];}};`}));
 const url='http://127.0.0.1:'+server.address().port+'/study.html';await page.goto(url);
 await page.getByRole('button',{name:'Start morning set',exact:true}).click();await page.locator('.recall-question').waitFor();
 const saved=await page.evaluate(()=>Object.entries(JSON.parse(localStorage.getItem('test-records'))).find(([k])=>k.startsWith('recall-set/'))),key=saved[0],ids=saved[1].value.ids;
 assert.equal(ids.length,10);assert.equal(await page.locator('[data-choice]').count(),5);assert.equal(await page.locator('.recall-explanation').count(),0);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'/tmp/recall-mobile.png'});
 // Failure before commit preserves the pending question and score.
 await page.evaluate(()=>window.failSave=true);await page.locator('[data-choice="-1"]').click();await page.getByRole('button',{name:'Retry saving answer'}).waitFor();
 assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('test-records'))['card-review/'+id],ids[0]),undefined);
 await page.evaluate(()=>window.failSave=false);await page.getByRole('button',{name:'Retry saving answer'}).click();await page.locator('#recall-next').waitFor();
 let value=await page.evaluate(id=>JSON.parse(localStorage.getItem('test-records'))['card-review/'+id].value,ids[0]);assert.equal(value.lastGrade,1);assert.equal(value.answers.length,1);
 await page.locator('#recall-next').click();await page.getByRole('button',{name:'Pause',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Continue morning set'}).click();
 const card=await page.evaluate(id=>window.TESSELATE_STUDY_MCQ.find(c=>c.id===id),ids[1]);assert.equal(await page.locator('.recall-question').textContent(),card.front);
 // Correct guesses use Hard, even after an uncertain successful write.
 await page.locator('#recall-guessed').check();await page.evaluate(()=>window.failAfterSave=true);await page.locator('[data-choice="'+card.correct+'"]').click();await page.locator('#recall-next').waitFor();await page.evaluate(()=>window.failAfterSave=false);
 value=await page.evaluate(id=>JSON.parse(localStorage.getItem('test-records'))['card-review/'+id].value,ids[1]);assert.equal(value.lastGrade,2);assert.equal(value.answers.length,1);
 await page.locator('#recall-next').click();
 for(let i=2;i<10;i++){const correct=await page.evaluate(id=>window.TESSELATE_STUDY_MCQ.find(c=>c.id===id).correct,ids[i]);await page.locator('[data-choice="'+correct+'"]').click();await page.locator('#recall-next').click();}
 await page.getByRole('heading',{name:'Set complete',exact:true}).waitFor();assert.equal(await page.locator('.recall-score').textContent(),'9 / 10 correct');
 assert.equal(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('test-records'))).filter(k=>k.startsWith('topic/')).length),0,'MCQ success must not fabricate whole-topic mastery');
 await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'View today’s results'}).click();await page.getByRole('heading',{name:'Set complete',exact:true}).waitFor();await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'My progress',exact:true}).click();await page.getByRole('heading',{name:'Your recall sessions'}).waitFor();assert.match(await page.locator('#main').textContent(),/10 \/ 10 answered · 9 correct/);
 await page.getByRole('button',{name:'Flashcards',exact:true}).click();await page.locator('#course-filter').selectOption('math252');await page.locator('#recall-topic').selectOption('math252-3');await page.getByRole('button',{name:'Start 2 questions',exact:true}).click();
 const title=await page.locator('.recall-question').textContent();assert(/exact|smooth M/.test(title));await page.getByRole('button',{name:'Pause',exact:true}).click();
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'/tmp/recall-desktop.png'});
 await page.locator('#theme').click();await page.getByRole('button',{name:'Continue set'}).click();await page.screenshot({path:'/tmp/recall-dark.png'});
 // A stale dialog must not overwrite another device's review.
 const secondKey=await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('test-records'))).find(k=>k.includes('/math252/')));
 const firstId=await page.evaluate(k=>JSON.parse(localStorage.getItem('test-records'))[k].value.ids[0],secondKey);
 await page.evaluate(id=>{const rows=JSON.parse(localStorage.getItem('test-records'));rows['card-review/'+id]={value:{note:'Other device'},revision:1};localStorage.setItem('test-records',JSON.stringify(rows));},firstId);
 await page.locator('[data-choice="-1"]').click();await page.getByRole('button',{name:'Retry saving answer'}).waitFor();assert.match(await page.locator('.form-error').textContent(),/another device/);
 assert.equal(await page.evaluate(id=>JSON.parse(localStorage.getItem('test-records'))['card-review/'+id].value.note,firstId),'Other device');
 await page.evaluate(()=>{window.TesselateCloud.user=null;window.authCallback();});await page.locator('#study-dialog').waitFor({state:'hidden'});await page.getByRole('button',{name:'Sign in with Google',exact:true}).first().waitFor();
 assert.deepEqual(errors,[]);console.log('PASS: morning set, scoring, failed/uncertain writes, idempotency, pause/reload/resume, completion, topic filters, preserved topic evidence, conflict protection, account isolation, mobile/dark layout.');
 }finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

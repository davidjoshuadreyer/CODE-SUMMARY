/* Run with Playwright available through NODE_PATH (no site runtime dependency).
   Uses a fresh, isolated browser context and a temporary local HTTP server. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(os.tmpdir(), 'tesselate-workspace-check');
fs.mkdirSync(artifacts, { recursive: true });
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.pdf':'application/pdf'};
const server = http.createServer((req,res)=>{
  const file = path.resolve(root, '.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
  res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);
});
const check = (label) => console.log('PASS '+label);
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1440,height:1050},acceptDownloads:true});
  const page=await context.newPage(),errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(url);await page.locator('h1').waitFor();
  assert.equal(await page.locator('[data-nav=overview]').getAttribute('aria-current'),'page');
  const catalog=await page.evaluate(()=>window.TESSELATE_CATALOG);
  assert.equal(catalog.courses.length,6);assert.equal(catalog.resources.length,44);
  for(const item of [...catalog.resources,...catalog.references])assert.ok(fs.existsSync(path.join(root,decodeURIComponent(item.url))),item.url);
  await page.screenshot({path:path.join(artifacts,'overview-desktop.png'),fullPage:true});
  check('Initial dashboard and all catalog paths');
  await page.locator('[data-nav=archive]').click();assert.equal(await page.locator('.course-card').count(),4);
  await page.locator('[data-action=add-course]').first().click();
  await page.locator('[name=code]').fill('PHYS 200');await page.locator('[name=name]').fill('Engineering Physics');
  await page.locator('[name=semester]').fill('Fall 2026');await page.locator('[name=description]').fill('Motion, energy, and practical problem solving.');
  await page.locator('dialog [type=submit]').click();await page.getByRole('heading',{name:'Engineering Physics',exact:true}).waitFor();
  const courseHash=await page.evaluate(()=>location.hash);
  check('Course creation and course detail');
  await page.locator('[data-action=upload]').first().click();
  const original=Buffer.from('Week 1: velocity = displacement / time.\nOriginal reference bytes.');
  await page.locator('#upload-files').setInputFiles([{name:'week-1.txt',mimeType:'text/plain',buffer:original},{name:'week-2.txt',mimeType:'text/plain',buffer:Buffer.from('Week 2: acceleration.')}]);
  await page.locator('dialog [type=submit]').click();await page.locator('.library-row').first().waitFor();
  assert.equal(await page.locator('.badge.unused').count(),2);
  await page.reload();await page.locator('[data-action=tab-references]').click();
  assert.equal(await page.locator('.library-row').count(),2);
  const firstRow=page.locator('.library-row').filter({hasText:'week-1.txt'});
  const downloadPromise=page.waitForEvent('download');await firstRow.locator('[data-action=download]').click();
  const download=await downloadPromise;assert.deepEqual(fs.readFileSync(await download.path()),original);
  check('Batch uploads, reload persistence, and original file download');
  await firstRow.locator('[data-action=edit-reference]').click();
  await page.locator('[name=stage]').selectOption('working');await page.locator('[name=notes]').fill('Build a short review sheet.');
  await page.locator('dialog [type=submit]').click();await page.locator('.badge.working').waitFor();
  await firstRow.locator('[data-action=edit-reference]').click();await page.locator('[data-action=page-from-reference]').click();
  await page.locator('[name=title]').fill('Week 1 summary');await page.locator('#page-format').selectOption('note');
  assert.equal(await page.locator('#url-field').isVisible(),false);
  await page.locator('[name=body]').fill('Velocity = displacement / time.\n<script>window.injected = true</script>');
  await page.locator('dialog [type=submit]').click();await page.locator('.resource-card').waitFor();
  await page.getByRole('link',{name:'Open page ↗'}).click();await page.locator('.note-body').waitFor();
  assert.ok((await page.locator('.note-body').textContent()).includes('<script>'));assert.equal(await page.evaluate(()=>window.injected),undefined);
  await page.locator('.back').click();await page.locator('[data-action=tab-references]').click();
  assert.equal(await firstRow.locator('.badge').innerText(),'Converted');
  await firstRow.locator('[data-action=edit-reference]').click();await page.locator('[name=pageIds]').uncheck();await page.locator('dialog [type=submit]').click();
  await firstRow.locator('.badge.working').waitFor();assert.equal(await firstRow.locator('.badge').innerText(),'In progress');
  await firstRow.locator('[data-action=edit-reference]').click();await page.locator('[name=pageIds]').check();await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  check('Notes, safe text rendering, source linking, and reversible conversion status');
  await page.locator('[data-nav=references]').click();await page.getByRole('heading',{name:'Reference library',exact:true}).waitFor();await page.locator('#status-filter').selectOption('converted');
  const builtInConverted = new Set(catalog.resources.flatMap(r=>r.referenceIds)).size;
  assert.equal(await page.locator('.library-row').count(),builtInConverted+1);
  await page.locator('#reference-search').fill('no match');assert.equal(await page.locator('.library-row').count(),0);
  await page.locator('#reference-search').fill('week-1');assert.equal(await page.locator('.library-row').count(),1);
  check('Library search and status filtering');
  const backupPromise=page.waitForEvent('download');await page.locator('[data-action=backup]').first().click();
  const backup=await backupPromise,backupPath=path.join(artifacts,'backup.json');await backup.saveAs(backupPath);
  const backupData=JSON.parse(fs.readFileSync(backupPath));assert.equal(backupData.files.length,2);
  const second=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});const restored=await second.newPage();
  await restored.goto(url);await restored.locator('h1').waitFor();
  await restored.locator('#restore-file').setInputFiles(backupPath);await restored.locator('dialog [type=submit]').click();
  await restored.getByRole('link').filter({hasText:'Engineering Physics'}).first().waitFor();
  await restored.goto(url+'/'+courseHash);await restored.locator('[data-action=tab-references]').click();
  const restoredRow=restored.locator('.library-row').filter({hasText:'week-1.txt'});
  assert.equal(await restoredRow.locator('.badge').innerText(),'Converted');
  const restoredDownload=restored.waitForEvent('download');await restoredRow.locator('[data-action=download]').click();
  assert.deepEqual(fs.readFileSync(await (await restoredDownload).path()),original);
  await restored.locator('#restore-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"bad"}')});
  await restored.getByRole('status').filter({hasText:'not a valid'}).waitFor();assert.equal(await restored.locator('.library-row').count(),2);
  check('Backup/restore across isolated browsers, exact file bytes, and invalid backup rejection');
  await page.goto(url+'/'+courseHash);await page.locator('[data-action=edit-page]').click();await page.locator('#page-format').selectOption('link');
  await page.locator('[name=url]').fill('javascript:alert(1)');await page.locator('dialog [type=submit]').click();
  await page.locator('.form-error').filter({hasText:'http(s)'}).waitFor();await page.getByRole('button',{name:'Cancel',exact:true}).click();
  check('Unsafe page URLs rejected');
  const stale=await context.newPage();await stale.goto(url+'/'+courseHash);await stale.locator('[data-action=edit-course]').click();
  await page.locator('[data-action=edit-course]').click();await page.locator('[name=description]').fill('Updated course description');await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  await stale.locator('[name=description]').fill('Stale overwrite');await stale.locator('dialog [type=submit]').click();
  await stale.locator('.form-error').filter({hasText:'another tab'}).waitFor();await stale.close();check('Stale tabs cannot overwrite newer data');
  await page.locator('[data-action=add-page]').first().click();await page.locator('[name=title]').fill('Linked review');await page.locator('[name=url]').fill('chem/review.html');
  await page.locator('[name=referenceIds]').first().check();await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  assert.equal(await page.locator('.resource-card').count(),2);
  const noteCard=page.locator('.resource-card').filter({hasText:'Week 1 summary'});
  await noteCard.locator('[data-action=edit-page]').click();await page.locator('[data-action=delete-page]').click();await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  await page.locator('[data-action=tab-references]').click();assert.equal(await firstRow.locator('.badge').innerText(),'Converted');
  await page.locator('[data-action=tab-pages]').click();await page.locator('[data-action=edit-page]').click();await page.locator('[data-action=delete-page]').click();await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  await page.locator('[data-action=tab-references]').click();assert.equal(await firstRow.locator('.badge').innerText(),'In progress');
  await page.locator('.library-row').filter({hasText:'week-2.txt'}).locator('[data-action=edit-reference]').click();await page.locator('[data-action=delete-reference]').click();await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  assert.equal(await page.locator('.library-row').count(),1);
  check('Linked pages, multiple outputs, and deletion without losing remaining sources');
  await page.locator('#semester').selectOption('__new__');await page.locator('dialog [name=semester]').fill('Winter 2027');await page.locator('dialog [type=submit]').click();await page.locator('dialog').waitFor({state:'hidden'});
  await page.locator('#semester').selectOption('Fall 2026');await page.locator('.course-card').filter({hasText:'Engineering Physics'}).waitFor();
  await page.reload();await page.locator('h1').waitFor();assert.ok((await page.locator('#semester').textContent()).includes('Winter 2027'));
  check('Semester creation and preservation of empty semesters');
  await page.locator('[data-nav=overview]').click();await page.screenshot({path:path.join(artifacts,'populated-desktop.png'),fullPage:true});
  await page.locator('[data-action=theme]').first().click();await page.screenshot({path:path.join(artifacts,'dark-desktop.png'),fullPage:true});
  for(const width of [390,760,1024]){
   await page.setViewportSize({width,height:844});
   for(const hash of ['overview','references','archive',courseHash.slice(1)]){
    await page.goto(url+'/#'+hash);await page.locator('h1').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No horizontal overflow at ${width} / ${hash}`);
   }
  }
  await page.setViewportSize({width:390,height:844});await page.goto(url+'/#overview');await page.locator('h1').waitFor();
  await page.screenshot({path:path.join(artifacts,'mobile.png'),fullPage:true});
  assert.deepEqual(errors,[]);check('Responsive layouts at 390, 760, 1024 px and no browser exceptions');
  // Exercise cloud controls without sending test files to the live project.
  const cloudContext=await browser.newContext();
  await cloudContext.route('**/assets/workspace/cloud.js',route=>route.fulfill({contentType:'text/javascript',body:`
   window.__cloud={versions:[],fail:false};
   window.TesselateCloud={user:{id:'test-owner',email:'test@example.test'},async init(){return this.user;},async signOut(){this.user=null;},async signIn(){},
    async list(){return __cloud.versions.map(v=>({id:v.id,created_at:v.savedAt}));},
    async save(state,files){if(__cloud.fail)throw Error('Test connection failure');const v={id:crypto.randomUUID(),state:structuredClone(state),files:[...files].map(([id,blob])=>({id,blob})),owner:this.user.id,savedAt:new Date().toISOString()};__cloud.versions.push(v);return v;},
    async load(id){return structuredClone(__cloud.versions.find(v=>v.id===id));}}
  `}));
  const cp=await cloudContext.newPage();await cp.goto(url);await cp.locator('h1').waitFor();await cp.locator('#cloud-button').click();
  await cp.locator('[data-action=cloud-save]').click();await cp.locator('#online-versions [data-action=cloud-load]').waitFor();
  await cp.getByRole('button',{name:'Done',exact:true}).click();
  await cp.locator('[data-action=add-course]').first().click();await cp.locator('[name=code]').fill('CLOUD 101');await cp.locator('[name=name]').fill('Cloud test course');await cp.locator('dialog [type=submit]').click();await cp.locator('dialog').waitFor({state:'hidden'});
  await cp.waitForFunction(()=>__cloud.versions.length===2);
  await cp.evaluate(()=>__cloud.fail=true);await cp.locator('[data-action=edit-course]').click();await cp.locator('[name=description]').fill('Retained locally after connection failure');await cp.locator('dialog [type=submit]').click();
  await cp.locator('#cloud-button').filter({hasText:'Upload pending'}).waitFor();
  assert.ok((await cp.locator('main').textContent()).includes('Retained locally'));
  await cp.evaluate(()=>__cloud.fail=false);await cp.locator('#cloud-button').click();await cp.locator('[data-action=cloud-save]').click();await cp.waitForFunction(()=>__cloud.versions.length===3);
  await cp.locator('#online-versions [data-action=cloud-load]').first().click();await cp.locator('dialog [type=submit]').click();await cp.locator('dialog').waitFor({state:'hidden'});
  assert.equal(await cp.locator('.course-card').filter({hasText:'Cloud test course'}).count(),0);
  await cp.locator('#cloud-button').click();await cp.locator('[data-action=cloud-undo]').click();await cp.locator('dialog [type=submit]').click();await cp.locator('dialog').waitFor({state:'hidden'});
  assert.equal(await cp.locator('.course-card').filter({hasText:'Cloud test course'}).count(),1);
  check('Cloud UI: initial save, automatic updates, failure/retry, restore, and local recovery (mock storage)');
  console.log('Artifacts: '+artifacts);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());

// g++ is required. Browser checks additionally require Playwright and Chrome.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http');
const {spawnSync}=require('node:child_process');
const lectures=require('./comp139e-lectures.cjs'),{suggest}=require('../comp139e/completion.js');
const root=path.resolve(__dirname,'..'),temporary=fs.mkdtempSync(path.join(os.tmpdir(),'comp139e-lectures-'));
function hints(code){return suggest(code,code.length)?.items.map(x=>x[0])||[];}
assert.ok(hints('std::string name = "Ada"; name.').includes('length'));
assert.deepEqual(hints('std::string name; name.sub'),['substr']);
assert.ok(hints('string* name = nullptr; name->').includes('length'));
assert.deepEqual(hints('string* name; name.'),[]);
assert.deepEqual(hints('std::string name; // name.'),[]);
assert.deepEqual(hints('std::string name; /* name.'),[]);
assert.deepEqual(hints('std::string name; "name.'),[]);
assert.deepEqual(hints('double number = 3.'),[]);
assert.deepEqual(hints('char* name; name.'),[]);
assert.ok(hints('std::vector<int> values; values.').includes('push_back'));
assert.ok(hints('std::ifstream input; input.').includes('get'));
assert.ok(!hints('std::ifstream input; input.').includes('put'));
assert.ok(!hints('std::ostringstream output; output.').includes('open'));
for(const l of lectures)for(const e of l.examples){
 const source=path.join(root,'comp139e/workspace/lectures',e.id+'.cpp'),binary=path.join(temporary,e.id+'.exe');
 const build=spawnSync('g++',['-std=c++17','-Wall','-Wextra','-pedantic',source,'-o',binary],{encoding:'utf8',windowsHide:true});
 assert.equal(build.status,0,e.id+': '+build.stderr);
 const run=spawnSync(binary,[],{cwd:temporary,input:(e.sample||'')+'\n',encoding:'utf8',windowsHide:true});
 assert.equal(run.status,0,e.id+': '+run.stderr);assert.equal(run.stdout.replace(/\r/g,''),e.expected,e.id);
}
console.log('PASS ten C++17 programs compile and produce their expected output; member hint contexts and filters.');
if(process.argv.includes('--no-browser'))process.exit(0);
const {chromium}=require('playwright');
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/comp139e/slides.html');assert.equal(await page.locator('.lesson-card').count(),5);
  for(const l of lectures){
   await page.goto(base+'/comp139e/slides-'+l.slug+'.html');
   for(const href of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')).filter(x=>!x.startsWith('http'))))assert.ok((await page.request.get(new URL(href,page.url()).href)).ok(),href);
  }
  await page.goto(base+'/comp139e/desk.html#lecture%3Astrings');await page.waitForFunction(()=>!document.querySelector('#run').disabled);
  assert.match(await page.locator('#source-code').inputValue(),/Ada Lovelace/);
  await page.locator('#category').selectOption('lectures');assert.equal(await page.locator('.program').count(),10);
  assert.equal(await page.locator('#lesson-link').getAttribute('href'),'slides-classes.html');
  const editor=page.locator('#source-code');await editor.fill('std::string name = "Ada";\nname');await editor.press('End');await editor.press('.');
  assert.ok(await page.locator('#member-suggestions').isVisible());assert.ok(await page.locator('#member-suggestions').getByRole('option',{name:/length\(\)/}).count());
  await page.screenshot({path:path.join(temporary,'suggestions-desktop.png'),fullPage:true});
  await editor.press('s');await editor.press('u');await editor.press('b');assert.equal(await page.locator('#member-suggestions').getByRole('option').count(),1);
  await editor.press('Tab');assert.match(await editor.inputValue(),/name\.substr\(0, 3\)$/);
  assert.equal(await editor.evaluate(e=>e.value.slice(e.selectionStart,e.selectionEnd)),'0, 3');
  await page.reload();await page.waitForFunction(()=>!document.querySelector('#run').disabled);assert.match(await editor.inputValue(),/substr\(0, 3\)/);
  await editor.fill('string name;\nname.');await editor.press('Escape');assert.ok(await page.locator('#member-suggestions').isHidden());
  await editor.press('Control+Space');assert.ok(await page.locator('#member-suggestions').isVisible());await editor.press('ArrowDown');await editor.press('Enter');assert.match(await editor.inputValue(),/name\.size\(\)$/);
  await editor.fill('string* pointer;\npointer->');assert.ok(await page.locator('#member-suggestions').isVisible());
  await page.locator('#member-suggestions').getByRole('option',{name:/length\(\)/}).click();assert.match(await editor.inputValue(),/pointer->length\(\)$/);
  await editor.fill('string name;\n// name.');assert.ok(await page.locator('#member-suggestions').isHidden());
  await editor.fill('std::string name;\nname.');await page.setViewportSize({width:390,height:844});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('#theme').click();await editor.focus();await editor.press('Control+Space');assert.ok(await page.locator('#member-suggestions').isVisible());await page.screenshot({path:path.join(temporary,'suggestions-mobile-dark.png'),fullPage:true});
  await page.locator('#file-select').selectOption('lectures/strings.cpp');
  assert.deepEqual(errors,[]);console.log('PASS lecture links, filtering, dot/arrow hints, Tab/Enter/mouse insertion, Escape, Ctrl+Space, persistence, and mobile layout. Screenshots: '+temporary);
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});

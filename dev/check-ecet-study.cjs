const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'ecet250e');
const data=require('../ecet250e/study-data.json'),manifest=require('../ecet250e/source-manifest.json');
assert.equal(data.length,172);assert.equal(new Set(data.map(p=>p.id)).size,data.length);
assert.equal(manifest.filter(m=>m.original).length,54);
assert.deepEqual([1,2,3,4,6,7,8].map(ch=>data.filter(p=>p.chapter===ch&&p.kind==='problemset').length),[15,11,10,10,10,9,5]);
assert.equal(data.filter(p=>p.kind==='quiz').length,11);
assert.equal(data.filter(p=>p.chapter===8&&p.kind==='lecture').length,5);
assert.equal(data.filter(p=>p.kind==='extra').length,1);
for(const p of data){assert.ok(p.question&&p.steps.length&&p.answer&&p.check,p.id);assert.ok(['worked','needs-review'].includes(p.status));for(const s of [p.source,p.instructorSolution].filter(Boolean))assert.ok(fs.existsSync(path.join(dir,s.url)),s.url);for(const f of p.figures)assert.ok(fs.existsSync(path.join(dir,f.url)),f.url);}
for(const m of manifest)assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(dir,m.url))).digest('hex'),m.sha256,m.filename);
const html=fs.readFileSync(path.join(dir,'report-study.html'),'utf8');
for(const [,url]of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^(https?:|#)/.test(url))continue;assert.ok(fs.existsSync(path.resolve(dir,url.split(/[?#]/)[0])),url);}
assert.ok(!html.includes('katex-error'));assert.ok(!JSON.stringify(data).includes('C:\\Users'));
// Exercise preference defaults, storage failure, and cross-tab updates without a browser.
for(const [stored,expected]of [[null,'original'],['report','report'],['unexpected','original'],['throws','original']]){
 const listeners={},doc={documentElement:{dataset:{}},querySelectorAll:()=>[],readyState:'loading',addEventListener:()=>{}};
 vm.runInNewContext(fs.readFileSync(path.join(root,'assets/report-theme.js'),'utf8'),{document:doc,localStorage:{getItem:()=>{if(stored==='throws')throw Error('disabled');return stored;}},addEventListener:(name,fn)=>listeners[name]=fn});
 assert.equal(doc.documentElement.dataset.studyStyle,expected);listeners.storage({key:'tesselate-study-style',newValue:'report'});assert.equal(doc.documentElement.dataset.studyStyle,'report');listeners.storage({key:'tesselate-study-style',newValue:null});assert.equal(doc.documentElement.dataset.studyStyle,'original');
}
console.log('PASS: 172 entries, assignment coverage, 54 originals and SHA-256 checks, all source/figure links, math output, preference defaults and storage fallback.');

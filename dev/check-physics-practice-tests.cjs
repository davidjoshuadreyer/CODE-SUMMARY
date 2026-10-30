const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'phys210'),out=path.join(dir,'practice-tests');
const m=require('../phys210/practice-tests/manifest.json'),original=require('../phys210/midterm-2-images.json');
assert.equal(m.tests.length,30);assert.equal(Object.keys(m.coverage).length,86);assert.equal(m.tests.filter(t=>t.kind==='main').length,8);assert.equal(m.tests.filter(t=>t.kind==='bonus').length,6);
const byId=new Map(m.problems.map(p=>[p.id,p]));
for(const t of m.tests){
 assert.equal(new Set(t.ids).size,t.ids.length);
 assert(fs.existsSync(path.join(out,t.pdf)),t.pdf);assert(fs.existsSync(path.join(out,t.id+'.jpg')));
 const key=fs.readFileSync(path.join(out,t.key),'utf8');assert(!key.includes('katex-error'));assert.equal((key.match(/class="solution"/g)||[]).length,t.ids.length);
 for(const id of t.ids){assert(byId.has(id));assert(key.includes('../midterm-2.html#'+id));assert.deepEqual(byId.get(id).shots,original[id]);}
 if(t.kind==='main')assert.deepEqual(t.ids.map(id=>byId.get(id).topic),['collision','gauss','networks','dielectric']);
 if(t.kind==='bonus'){assert.equal(byId.get(t.ids[0]).topic,'bonus-sphere');assert(['bonus-dielectric','tilt'].includes(byId.get(t.ids[1]).topic));}
}
for(const p of m.problems)assert(m.coverage[p.id].length>0);
for(const file of [path.join(dir,'practice-tests.html'),...m.tests.map(t=>path.join(out,t.key))]){
 const html=fs.readFileSync(file,'utf8');
 for(const [,href] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
  if(/^https?:|^#/.test(href))continue;
  assert(fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0].split('?')[0])),href);
 }
}
assert(fs.readFileSync(path.join(dir,'midterm-2.html'),'utf8').includes('href="practice-tests.html"'));
console.log('PASS: 30 papers, 86 unchanged source questions, all main/bonus topic slots, worked keys, previews, downloads and site links.');

const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'phys210'),html=fs.readFileSync(path.join(dir,'midterm-2.html'),'utf8');
const manifest=require('../phys210/midterm-2-manifest.json');
assert.equal(manifest.total,86);assert.equal(new Set(manifest.problems.map(p=>p.id)).size,86);
assert.equal((html.match(/class="worked-solution"/g)||[]).length,86);
assert(!html.includes('katex-error'));assert(!html.includes('href="undefined"'));assert(!html.includes('data:image'));
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));
for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
 if(/^https?:|^data:/.test(url))continue;
 if(url.startsWith('#')){assert(ids.has(url.slice(1)),url);continue;}
 const [file,hash]=url.split('#'),base=file.split('?')[0];
 assert(fs.existsSync(path.resolve(dir,decodeURIComponent(base))),url);
 if(hash&&base.endsWith('.html')&&!base.includes('solutions.html')&&!hash.startsWith('course/')){const other=fs.readFileSync(path.resolve(dir,base),'utf8');assert(other.includes('id="'+hash+'"'),url);}
}
for(const p of manifest.problems){assert(p.topic);assert(ids.has(p.id));if(p.manual)for(const pg of p.manual.pages)assert(Number.isInteger(pg)&&pg>=6&&pg<=471);}
// Independent quadrature checks both spherical Gauss results and the angle solver's capacitance law.
const eps=8.8541878128e-12,near=(a,b,tol=1e-7)=>assert(Math.abs(a-b)<=tol*Math.max(Math.abs(b),1e-25),`${a} != ${b}`);
const integrate=(f,b,n=50000)=>{let s=0;for(let i=0;i<n;i++)s+=f((i+.5)*b/n);return s*b/n;};
for(const r of [.2,.5,2/3,1]){
 const charge=integrate(s=>4*Math.PI*s*s*(1-s),r);
 near(charge/(4*Math.PI*eps*r*r),(r/3-r*r/4)/eps);
 const charge2=integrate(s=>4*Math.PI*s*s*(1-4*s/3),r);
 if(r<1)near(charge2/(4*Math.PI*eps*r*r),(r-r*r)/(3*eps));else assert(Math.abs(charge2)<1e-8);
}
// Run the actual browser calculation helper against an independently integrated local strip model.
const js=fs.readFileSync(path.join(dir,'midterm-2.js'),'utf8'),fn=js.slice(js.indexOf('function capacitance('),js.indexOf('function solveAngle('));
const context={Math};vm.runInNewContext(fn+';this.cap=capacitance;',context);
for(const theta of [0,1e-8,.01,.05]){const value=context.cap(theta,.001,.1,.05,2.5);const numeric=integrate(x=>eps*2.5*.05/(.001+x*Math.tan(theta)),.1);near(value,numeric,1e-7);}
near(context.cap(Math.PI/180,.001,.1,.05,1)*1e12,25.6155588687);
// Independent charge/energy conservation for the new network examples.
near((1/(1/2+1/4))*28,37.3333333333); // a separate two-series check
const c12=1/(1/4+1/4),ceq=1/(1/(c12+4)+1/4);near(ceq*28,67.2);near((67.2/6)*4,44.8);
near((1/(1/18+1/30+1/10)+7.5+6.5)*25,482.352941176);
const qi=2.1e-6*36,vf=3*qi/(21e-6);near(vf,10.8);near(.5*21e-6*vf*vf,.00122472);
near(164*8.9875517923e9*(1.602176634e-19)**2/(9.5e6*1.602176634e-19),2.485833538e-14,1e-6);
// Direct-page parsing rejects invalid input and retains a valid page across the existing login render.
const sol=fs.readFileSync(path.join(root,'assets/workspace/solutions.js'),'utf8');
const parse=sol.slice(sol.indexOf('const params='),sol.indexOf('let owner='));
for(const [query,expected] of [['?manualPage=97',97],['?manualPage=-2',null],['?manualPage=abc',null],['?manualPage=1.5',null],['',null]]){const c={URLSearchParams,location:{search:query}};vm.runInNewContext(parse+'this.answer=directManualPage;',c);assert.equal(c.answer,expected);}
assert(sol.includes('showPage(directManualPage||'));
console.log('PASS: 86 worked solutions, local links/anchors, manual page links, Gauss quadrature, angle capacitance, network conservation and manual URL parsing.');

const shots=require('../phys210/midterm-2-images.json');
assert.equal(Object.keys(shots).length,manifest.total);
for(const p of manifest.problems){
 assert(shots[p.id]?.length,`Missing screenshot for ${p.id}`);
 for(const s of shots[p.id]){assert(fs.existsSync(path.join(dir,s.src)),s.src);assert(s.width>50&&s.height>40);assert(s.page>=1);}
}
assert.equal((html.match(/class="source-screenshots"/g)||[]).length,86);
assert.equal((html.match(/class="manual-screenshots"/g)||[]).length,manifest.problems.filter(p=>p.manual).length);
console.log('PASS: original question screenshots cover all 86 entries; every matched manual has inline image controls.');

const keys=require('../phys210/midterm-2-tutorial-solutions.json'),crops=require('../phys210/midterm-2-manual-crops.json');
assert.equal(Object.keys(keys.solutions).length,18);
assert.equal((html.match(/class="tutorial-screenshots"/g)||[]).length,18);
for(const shots of Object.values(keys.solutions))for(const shot of shots){assert(fs.existsSync(path.join(dir,shot.src)));assert(shot.url.startsWith('https://online.camosun.ca/'));}
for(const p of manifest.problems)if(p.manual){const cs=crops[p.manual.problem];assert.deepEqual([...new Set(cs.map(c=>c.page))],p.manual.pages);for(const c of cs){const [a,b,x,y]=c.box;assert(a>=0&&b>=0&&x<=1&&y<=1&&a<x&&b<y);}}
assert.deepEqual(crops['22.52'].map(c=>c.page),[99,100]);
assert.deepEqual(crops['23.1'].map(c=>c.page),[114,115]);
console.log('PASS: 18 posted tutorial solutions, normalized manual crops and multi-page continuations.');

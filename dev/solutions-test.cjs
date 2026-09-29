const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/workspace/solutions-data.js','utf8'),ctx);
for(const e of Object.values(ctx.window.TESSELATE_SOLUTIONS)){assert(e.sections.length);for(const f of e.files||[])if(!f.url.startsWith('https://'))assert(fs.existsSync(f.url.split(/[?#]/)[0]),f.url);}
const derivative=(f,x)=>(f(x+1e-5)-f(x-1e-5))/2e-5;
for(const x of [.1,.3,.7]){
 const f1=x=>(2-Math.sqrt(1+x*x))**(-1/3),f2=x=>(Math.exp(2*x)*(2*x-1)/4+2)/x**3,f4=x=>-x/(Math.log(x)+5),f5=x=>1/(x*x*(Math.cos(x)+2)),f6=x=>Math.tan(x+Math.PI/4)-1-x;
 for(const [f,lhs,rhs] of [[f1,(y,yp)=>yp,y=>x*y**4/(3*Math.sqrt(1+x*x))],[f2,(y,yp)=>x*x*yp+3*x*y,()=>Math.exp(2*x)],[f4,(y,yp)=>yp,y=>(x*y+y*y)/x**2],[f5,(y,yp)=>x*yp+2*y,y=>x**3*y*y*Math.sin(x)],[f6,(y,yp)=>yp,y=>(1+x+y)**2]]){const y=f(x),a=lhs(y,derivative(f,x)),b=rhs(y);assert(Math.abs(a-b)<2e-4*Math.max(1,Math.abs(b)),`${x}: ${a} versus ${b}`);}
}
assert(Math.abs((2-Math.sqrt(1))**(-1/3)-1)<1e-12);
assert(Math.abs(Math.tan(Math.PI/4)-1)<1e-12);
console.log('PASS: reference file links, differential-equation residuals and initial conditions.');
const S=ctx.window.TESSELATE_SOLUTIONS;
const expectedCounts=[4,5,6,6,8,8,10,9,6,10,8];
for(let i=0;i<expectedCounts.length;i++){
 const entry=S[`f26-${i+2}`];assert.equal(entry.sections.length,expectedCounts[i]);
 assert.equal(new Set(entry.sections.map(s=>s.problem)).size,entry.sections.length);
 for(const s of entry.sections){assert(s.steps.length);if(s.manual){assert(/^\d{2}\.\d+$/.test(s.manual.problem));for(const p of s.manual.pages)assert(Number.isInteger(p)&&p>=6&&p<=471);}}
}
assert(!S['f26-8'].sections.some(s=>s.problem==='26.29'),'Handout explicitly excludes 26.29');
assert.equal(S['f26-7'].sections.find(s=>s.problem==='25.16').manual.problem,'25.18');
assert.equal(S['f26-8'].sections.find(s=>s.problem==='26.28').manual.problem,'26.26');
const near=(a,b,tol=1e-4)=>assert(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),`${a} != ${b}`);
// Independent series-node checks against the published lab table, including reversed lead signs.
const I=12/(1000+4700+2200+3300),nodes=[12,12-I*1000,I*(2200+3300),I*3300,0];
const rows=S['f26-52'].sections[0].table.rows;
for(const [j,a,b] of [[0,0,1],[1,1,2],[2,2,3],[3,3,4],[4,0,2],[5,3,2],[6,4,2]])near(Number(rows[j][1].replace('−','-').split(' ')[0]),nodes[a]-nodes[b]);
near(0.710*8.5e28*1.602176634e-19*Math.PI*(.00205**2)/4/4.85,6.58e3,.001);
near(-.17543859649122806*.0076+(-.2564102564102564)*(-.0052),0);
console.log('PASS: 80-question coverage, edition mappings, circuit polarity and numerical checks.');

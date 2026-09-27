const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/workspace/solutions-data.js','utf8'),ctx);
for(const e of Object.values(ctx.window.TESSELATE_SOLUTIONS)){assert(e.sections.length);for(const f of e.files||[])if(!f.url.startsWith('https://'))assert(fs.existsSync(f.url),f.url);}
const derivative=(f,x)=>(f(x+1e-5)-f(x-1e-5))/2e-5;
for(const x of [.1,.3,.7]){
 const f1=x=>(2-Math.sqrt(1+x*x))**(-1/3),f2=x=>(Math.exp(2*x)*(2*x-1)/4+2)/x**3,f4=x=>-x/(Math.log(x)+5),f5=x=>1/(x*x*(Math.cos(x)+2)),f6=x=>Math.tan(x+Math.PI/4)-1-x;
 for(const [f,lhs,rhs] of [[f1,(y,yp)=>yp,y=>x*y**4/(3*Math.sqrt(1+x*x))],[f2,(y,yp)=>x*x*yp+3*x*y,()=>Math.exp(2*x)],[f4,(y,yp)=>yp,y=>(x*y+y*y)/x**2],[f5,(y,yp)=>x*yp+2*y,y=>x**3*y*y*Math.sin(x)],[f6,(y,yp)=>yp,y=>(1+x+y)**2]]){const y=f(x),a=lhs(y,derivative(f,x)),b=rhs(y);assert(Math.abs(a-b)<2e-4*Math.max(1,Math.abs(b)),`${x}: ${a} versus ${b}`);}
}
assert(Math.abs((2-Math.sqrt(1))**(-1/3)-1)<1e-12);
assert(Math.abs(Math.tan(Math.PI/4)-1)<1e-12);
console.log('PASS: reference file links, differential-equation residuals and initial conditions.');

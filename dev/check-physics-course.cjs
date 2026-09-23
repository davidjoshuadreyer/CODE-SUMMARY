// Independent numerical checks against the instructor-provided homework keys.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const questions=require('./physics-practice.cjs');
function near(actual,expected,tolerance=.005){assert.ok(Math.abs(actual-expected)<=Math.abs(expected)*tolerance,`${actual} != ${expected}`)}
const k=8.988e9,e=1.602e-19;
near(3.20e-9/e,2e10);
near((3.20e-9/e)/((8/207)*6.022e23),8.59e-13);
const f=8.99e9*(1.60e-19)**2/(2e-10)**2;
near(f/1.67e-27,3.4e18,.02);near(f/9.11e-31,6.3e21,.02);
near(Math.sqrt(.220*.150**2/k),7.42e-7);
near(Math.sqrt(.220*.150**2/(4*k)),3.71e-7);
const theta=25*Math.PI/180,q=2*1.20*Math.sin(theta)*Math.sqrt(.015*9.8*Math.tan(theta)/k);
near(q,2.80e-6);
const target=k*q*q/(4*.600**2*.015*9.8);let lo=0,hi=Math.PI/2;
for(let i=0;i<70;i++){const mid=(lo+hi)/2;if(Math.sin(mid)**2*Math.tan(mid)>target)hi=mid;else lo=mid}near((lo+hi)/2*180/Math.PI,39.5,.002);
near(.0123*9.8*Math.tan(17.4*Math.PI/180)/1.11e-6,3.41e4);
near(.0125/(800*(.5*(.260/5000)**2+(.260/5000)*(.560/5000))),2.18e3);
// Midpoint integration independently checks the closed-form rod field.
let integral=0;const a=.14,x=.50,n=100000;for(let j=0;j<n;j++)integral+=(a/n)/(x-(j+.5)*a/n)**2;
near(integral/a,1/(x*(x-a)),1e-8);
assert.equal(questions.length,7);assert.equal(new Set(questions.map(q=>q.id)).size,7);
for(const q of questions)assert.deepEqual(q.steps.map(s=>s[0]),['Identify','Set up','Execute','Evaluate']);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/workspace/learning-paths.js','utf8'),ctx);
for(const course of Object.values(ctx.window.TESSELATE_PATHS))for(const item of [...course.lessons,...course.practice])assert.ok(fs.existsSync(item.url),item.url);
for(const file of fs.readdirSync('phys210').filter(f=>f.startsWith('learn-')||f==='quiz.html'||f==='review.html')){
 const html=fs.readFileSync('phys210/'+file,'utf8');assert.ok(!html.includes('katex-error'));assert.ok(!html.includes('href="undefined"'));
 for(const [,href] of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)){if(!/^https?:/.test(href))assert.ok(fs.existsSync(require('node:path').resolve('phys210',href)),file+': '+href)}
}
console.log('Passed: seven source answer checks, rod integral, solution stages, six course paths, and generated Physics links.');

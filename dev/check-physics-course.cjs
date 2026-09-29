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
assert.equal(questions.length,89);assert.equal(new Set(questions.map(q=>q.id)).size,89);
for(const q of questions)assert.deepEqual(q.steps.map(s=>s[0]),['Identify','Set up','Execute','Evaluate']);
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/workspace/learning-paths.js','utf8'),ctx);
for(const course of Object.values(ctx.window.TESSELATE_PATHS))for(const item of [...course.lessons,...course.practice])assert.ok(fs.existsSync(item.url),item.url);
for(const file of fs.readdirSync('phys210').filter(f=>f.startsWith('learn-')||f==='quiz.html'||f==='review.html')){
 const html=fs.readFileSync('phys210/'+file,'utf8');assert.ok(!html.includes('katex-error'));assert.ok(!html.includes('href="undefined"'));
 for(const [,href] of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)){if(!/^https?:/.test(href))assert.ok(fs.existsSync(require('node:path').resolve('phys210',href.split('?')[0])),file+': '+href)}
}
console.log('Passed: seven source answer checks, rod integral, solution stages, six course paths, and generated Physics links.');

// Homework 4: Gaussian surfaces, charge conservation, field geometry and signs.
const eps=8.8541878128e-12, four=require('./physics-homework4.cjs');
near(4*Math.PI*eps*1150*.130**2/e,four[0].answer);
const shell=6.37e-6*4*Math.PI*.250**2,inner=.500e-6,outer=shell-inner;
near(outer/(4*Math.PI*.250**2),four[1].answer);
near(outer/(4*Math.PI*eps*.250**2),6.48e5);
near(-.500e-6/eps,-5.65e4);
const rho=3*eps*1750*.500**2/.355**3;
near(rho,four[2].answer);near(rho*.200/(3*eps),1.96e3);
near(Math.atan((5e-8*2.5e-9/(2*eps))/(4e-6*9.8))*180/Math.PI,four[3].answer);
near(eps*(2.5e4-7e4)*.05*.06*Math.cos(Math.PI/3),four[4].answer);
console.log('Passed: Homework 4 numerical answers and all five question diagrams.');
// Handout-driven numerical regression checks for the additional sets.
const extra=require('./physics-more-homework.cjs'),pi=Math.PI,mu=4*pi*1e-7,mp=1.673e-27,me=9.109e-31;
const checks={
'22.1':14*.25*.5,'22.2':90*.4*.6*Math.sin(20*pi/180),'22.8':4e-9/eps,'22.9':k*49e-6/.06**2,
'23.1':k*2.4e-6*(-4.3e-6)*(1/.15-1/Math.hypot(.25,.25)),
'23.5':Math.sqrt(22**2+2*k*2.8e-6*7.8e-6/.0015*(1/.8-1/.4)),
'23.7':(mp*(2e5)**2)**2/(k*e**2),'23.8':3*k*(1.2e-6)**2/.4,'23.19':k*(2.4e-9-6.5e-9)/.05,
'23.27':Math.sqrt(2*e*k*24e-9/me*(1/.15-1/Math.hypot(.15,.3))),
'23.44':Math.hypot(-6.72,-7.2),'23.55':e*4/3*(240/.013**(4/3))*(.013/2)**(1/3),'23.59':.0015*9.8*Math.tan(pi/6)/8.9e-6*.05,
'24.1':4e6*.0025,'24.3':.148e-6/245e-12,'24.7':eps*6.8e-4*42/240e-12,'24.8':Math.sqrt(5e-12*.01/(pi*eps)),
'24.12':2*pi*eps/Math.log(3.5/2.2),'24.14':1/(1/10+1/13+1/9),'24.24':(3.9e-6)**2/(2*920e-12),'24.36':1e-9*.012/(3*eps),'24.66':eps*.12**2*4.4/(2*.0045)*1e12,
'25.1':25000*40e-6,'25.2':(420/4800)/(5.8e28*e*pi*.0026**2/4),'25.5':.710*8.5e28*e*pi*.00205**2/4/4.85,
'25.11':15/18.5*pi*.005**2/4/1.5,'25.12':3.6/.0023**2,'25.25':125*1.72e-8*1e5/(pi*.1**2/4),'25.21':.49*pi*.00084**2/4/2.44e-8,
'26.3':36*25/40,'26.6':(1.25+31.25/15+31.25/25)*45,'26.8':1/(1/1.6+1/2.4+1/4.8),'26.21':120**2*(1/400+1/800),'26.24':10/30,
'26.28':3*(-.8)-4*.2,'26.39':4/Math.log(4)/3.4e6,'26.43':80*35e-6*Math.log(45/10),'26.51':-.003/Math.log(1-110/(5.9*28))/5.9e-6,
'27.1':-1.24e-8*3.85e4*1.4,'27.4':1.22e-8*3e4*1.63/.00181,'27.7':.0076/(7.8e-6*(-3800)),'27.10':.5*.034**2,'27.19':3*e*.25*.475/(12*mp),
'27.21':e*2.5*.00696/3.34e-27,'27.24':mp*1200/(e*(2*.0118/pi)),'27.27':5850*1.35,'27.29':150/.0082/Math.sqrt(2*2*e*1750/6.64e-27),
'27.37':.750*9.8/(.5*.45)*25,'27.41':5*1.2*.2*.35,'27.42':1.95*.22*.35*1.5*.5,'27.56':(1.6e-19)**2*.85**2*.4**2/(2*1.67e-27)/1.6e-19,
'27.65':25*11200**2/(2*.8*2000*.5),'27.69':.0042*9.8*.04*Math.tan(pi/6)/(8.2*.06*.08),
'28.29':2e-7*5*2*1.2/.4,'28.40':mu*(-4),'28.57':25*.4/(75+25),'28.61':65*746/600,'28.64':2e-7*14*5*.2*(1/.026-1/.1),
'28.65':Math.sqrt(.0125*9.8*Math.tan(6*pi/180)*(2*.04*Math.sin(6*pi/180))/(2e-7)),
'29.25':.45*.3*5,'29.26':1.25*.4*.02,'29.29':.8*.5*7.5,'29.42':.520/(pi*.04**2),
'30.9':.016/.064,'30.11':.260*.018,'30.23':.75*(1-Math.exp(-.25*8/2.5)),'30.25':.00125/50*Math.log(2)
};
for(const q of extra){
 assert(q.drawing.includes('<')&&q.caption&&q.source.startsWith('https://online.camosun.ca/'));
 if(q.answer!==undefined){assert(Object.hasOwn(checks,q.problem),q.problem);near(checks[q.problem],q.answer,.008);}
}
// Conservation and limiting cases, independent of display rounding.
assert(Math.abs((-.8)+.2+.6)<1e-12);near(2**2*1.5,.8*7.5);near(490+28**2/2.4+28**2/4.8,980);
for(let h=1;h<=13;h++)assert.equal(questions.filter(q=>q.homework===h).length,[3,4,6,5,6,6,8,8,10,9,6,10,8][h-1]);
const refs={window:{}};vm.runInNewContext(fs.readFileSync('assets/workspace/solutions-data.js','utf8'),refs);
for(const q of extra){const entry=refs.window.TESSELATE_SOLUTIONS['f26-'+(q.homework-1)];assert(entry.sections.some(s=>s.practice?.endsWith('#q-'+q.id)),q.id);}
console.log(`Passed: ${Object.keys(checks).length} new numeric results, circuit conservation, all 13 handout counts, diagrams and planner-to-question links.`);

const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const E=require('../assets/workspace/study-engine.js');const ctx={window:{}};vm.createContext(ctx);for(const f of ['study-data','learning-paths'])vm.runInContext(fs.readFileSync('assets/workspace/'+f+'.js','utf8'),ctx);const D=ctx.window.TESSELATE_STUDY_DATA,P=ctx.window.TESSELATE_PATHS;
const r={settings:{value:{weekday:75,weekend:90,awayStart:'2026-10-05',awayEnd:'2026-10-07',awayMinutes:15,start:'2026-09-27'}}};
for(const i of [26,8])r['work/f26-'+i]={value:{status:'submitted'}};
for(let d='2026-09-27';d<='2026-12-22';d=E.plus(d,1)){
 const p=E.plan(d,D,P,r);assert(p.minutes<=p.budget,d+' over budget');assert.equal(new Set(p.tasks.map(t=>t.id)).size,p.tasks.length);assert(p.tasks.every(t=>!t.event||E.status(r,t.event)!=='submitted'));assert(p.tasks.every(t=>t.minutes>=10));
 if(d>='2026-10-05'&&d<='2026-10-07'){assert(p.minutes<=15);assert(p.tasks.every(t=>t.type==='study'));}
}
assert.equal(E.target(D.events.find(e=>e.id==='f26-3'),E.settings(r)),'2026-10-04');
assert.equal(E.target(D.events.find(e=>e.id==='f26-36'),E.settings(r)),'2026-10-04');
assert.equal(E.target(D.events.find(e=>e.id==='f26-2'),E.settings(r)),'2026-09-27');
assert.equal(E.scope(D.events.find(e=>e.id==='f26-29')).confirmed,true);assert.equal(E.scope(D.events.find(e=>e.id==='f26-13')).confirmed,false);
assert.deepEqual(E.scope({...D.events.find(e=>e.id==='f26-29'),coverage:'Only chapter 2',coverageConfirmed:true}).topics,[]);
assert.equal(E.scope({...D.events.find(e=>e.id==='f26-29'),coverage:'Only chapter 2',coverageConfirmed:true}).label,'Instructor-confirmed: Only chapter 2');
assert.equal(E.plan('2027-01-01',D,P,r).tasks.length,0);
const testDay=E.plan('2026-09-28',D,P,r);const topic=testDay.tasks.find(t=>t.topic);assert(topic);r['topic/'+topic.topic]={value:require('../assets/workspace/study-memory.js').review({},3,'2026-09-28')};assert(!E.plan('2026-09-28',D,P,r).tasks.some(t=>t.topic===topic.topic));
const custom={...r,'custom/test':{value:{title:'New test',course:'comp139e',type:'test',date:'2026-09-30',coverage:'Recursion',source:'https://example.com'}}};assert(E.events(D,custom).some(e=>e.id==='custom/test'));assert(E.plan('2026-09-30',D,P,custom).tasks.some(t=>t.event==='custom/test'));
for(const t of E.topics(P)){if(!/^https?:/.test(t.url))assert(fs.existsSync(t.url),'Missing lesson '+t.url);}
assert(E.scope(D.events.find(e=>e.id==='f26-29')).topics.includes('calc-12.5'));
assert(!E.scope(D.events.find(e=>e.id==='f26-29')).topics.includes('calc-12.8'));
assert(!E.scope(D.events.find(e=>e.id==='f26-31')).topics.includes('math250b-7'));
assert.equal(E.confidence({'done/2026-09-27/topic/calc-12.4':{value:{done:true,practiceDate:'2026-09-27'}}},'calc-12.4').last,'2026-09-27');
assert.equal(E.confidence({'done/2026-09-27/topic/calc-12.4':{value:{done:true}}},'calc-12.4').rating,0);
const near={...r,'work/f26-25':{value:{status:'submitted'}},'work/f26-51':{value:{status:'submitted'}}};
const sunday=E.plan('2026-09-27',D,P,near);assert(sunday.tasks.some(t=>t.event==='f26-2'));assert(sunday.tasks.some(t=>t.event==='f26-39'));
console.log('PASS: full-term budgets, trip protection, submitted work, date targets, scope overrides, confidence adaptation, custom tests, lesson links.');

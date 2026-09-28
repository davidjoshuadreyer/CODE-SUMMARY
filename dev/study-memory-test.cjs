const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const M=require('../assets/workspace/study-memory'),E=require('../assets/workspace/study-engine'),F=require('ts-fsrs');
const now='2026-09-28T20:00:00Z';
const direct=F.fsrs({request_retention:0.9,enable_fuzz:false,learning_steps:[],relearning_steps:[]});
for(const grade of [1,2,3,4]){
 const value=M.review({note:'Keep me'},grade,now);
 assert.deepEqual(value.fsrs,JSON.parse(JSON.stringify(direct.next(F.createEmptyCard(new Date(now)),new Date(now),grade).card)));
 assert.equal(value.note,'Keep me');assert.equal(value.reviews.length,1);
 const later=M.review(JSON.parse(JSON.stringify(value)),3,value.fsrs.due);
 assert.equal(later.fsrs.reps,2);assert.equal(later.reviews.length,2);
 assert(later.fsrs.stability>0);assert(later.fsrs.difficulty>=1&&later.fsrs.difficulty<=10);
}
assert.throws(()=>M.review({},0,now));
const good=M.review({},3,now),easy=M.review({},4,now),again=M.review({},1,now);
assert(new Date(easy.fsrs.due)>new Date(good.fsrs.due));assert(new Date(again.fsrs.due)<new Date(good.fsrs.due));
assert.equal(M.status(good,now).tone,'strong');assert.equal(M.status(again,now).tone,'weak');
assert.equal(M.status(good,good.fsrs.due).due,true);assert.equal(M.status(good,'2027-09-28').tone,'weak');
assert.equal(M.status({},now).studied,false);
assert.equal(M.status({rating:3,last:'2026-09-27'},now).due,true);
assert.equal(M.status({rating:3,last:'2026-09-27'},now).recall,null);
assert.throws(()=>M.review(good,3,'2026-09-27'));
const ctx={window:{}};vm.createContext(ctx);for(const f of ['study-data','learning-paths','study-cards'])vm.runInContext(fs.readFileSync('assets/workspace/'+f+'.js','utf8'),ctx);
const D=ctx.window.TESSELATE_STUDY_DATA,P=ctx.window.TESSELATE_PATHS;
const records={'material/custom':{value:{title:'Lab reflection',course:'engr290',summary:'Lab',url:''}},'topic/material/custom':{value:{last:'2026-09-27'}}};
assert(E.topics(P,records).some(t=>t.id==='material/custom'));
assert(E.plan('2026-09-28',{...D,events:[]},P,records).tasks.some(t=>t.topic==='material/custom'));
const before=JSON.stringify(records);M.review({},3,now);assert.equal(JSON.stringify(records),before,'Flashcard review must not update topic evidence');
for(const c of ctx.window.TESSELATE_STUDY_CARDS)assert(E.topics(P).some(t=>t.id===c.topic));
// Use the same vendored browser bundle as the deployed static page.
const browser={};vm.createContext(browser);vm.runInContext(fs.readFileSync('assets/workspace/vendor/ts-fsrs.js','utf8'),browser);
browser.window=browser;vm.runInContext(fs.readFileSync('assets/workspace/study-memory.js','utf8'),browser);
assert.equal(JSON.stringify(browser.TesselateMemory.review({},3,now)),JSON.stringify(good));
console.log('PASS: FSRS parity, ratings, JSON round trips, recall decay, legacy migration, custom material, independent cards, browser bundle.');

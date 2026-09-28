const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const R=require('../assets/workspace/study-recall'),M=require('../assets/workspace/study-memory'),E=require('../assets/workspace/study-engine');
const ctx={window:{}};for(const f of ['learning-paths','study-mcq'])vm.runInNewContext(fs.readFileSync('assets/workspace/'+f+'.js','utf8'),ctx);
const cards=JSON.parse(JSON.stringify(ctx.window.TESSELATE_STUDY_MCQ)),topics=E.topics(ctx.window.TESSELATE_PATHS),date='2026-09-28',now=date+'T20:00:00Z';
assert.equal(cards.length,188);assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
for(const t of topics)assert(cards.filter(c=>R.topicIds(c).includes(t.id)).length>=2,t.id);
for(const c of cards){assert.equal(c.options.length,4);assert.equal(new Set(c.options).size,4);assert(c.back&&c.source);assert(R.topicIds(c).every(id=>topics.some(t=>t.id===id)));assert.deepEqual(R.choices(c,date).map(o=>o.index).sort(),[0,1,2,3]);}
assert(new Set(cards.map(c=>R.choices(c,date).findIndex(o=>o.index===c.correct))).size===4,'Correct choices must appear in varied positions');
const initial=R.select(cards,topics,{},date);assert.equal(initial.ids.length,10);assert(initial.foundation);
assert.equal(new Set(initial.ids.map(id=>topics.find(t=>t.id===cards.find(c=>c.id===id).topic).course)).size,6);
assert.deepEqual(R.select(cards,topics,{},date),initial,'Stable daily selection');
const c=cards[0],wrong=R.answer({},c,1,false,'set-a',now),right=R.answer({},c,0,false,'set-a',now),guess=R.answer({},c,0,true,'set-a',now),unknown=R.answer({},c,-1,false,'set-a',now);
assert.equal(wrong.lastGrade,1);assert.equal(right.lastGrade,3);assert.equal(guess.lastGrade,2);assert.equal(unknown.lastGrade,1);
assert(wrong.fsrs.due<right.fsrs.due);assert(guess.fsrs.due<=right.fsrs.due);
assert.equal(R.answer(wrong,c,0,false,'set-a',now),wrong,'Retries cannot double count a set answer');
assert.throws(()=>R.answer({},c,5,false,'set-a',now));
const records={['card-review/'+c.id]:{value:wrong}};
assert(!R.select(cards,topics,records,date,{scope:'all'}).ids.includes(c.id),'No same-day filler of reviewed cards');
assert.equal(R.select(cards,topics,records,'2026-09-29',{scope:'all'}).ids[0],c.id,'Due missed question precedes new questions');
assert(R.pool(cards,topics,records).cards.some(x=>x.id!==c.id&&x.topic===c.topic),'Introduce other questions in an encountered topic');
assert.deepEqual(R.stats(records,[c.id]),{total:1,correct:0,uncertain:0});
assert.equal(R.result(records,c.id,'set-a').selected,1);
assert.equal(R.result(records,c.id,'other-set'),undefined);
for(const course of ['phys210','math252','math250b','comp139e','engr290','ecet250e']){
 const ids=R.select(cards,topics,{},date,{course,scope:'all'}).ids;assert(ids.length);
 assert(ids.every(id=>topics.find(t=>t.id===cards.find(c=>c.id===id).topic).course===course));
}
const single=R.select(cards,topics,{},date,{topic:'calc-12.4',scope:'all'});assert.equal(single.ids.length,2);assert(single.ids.every(id=>cards.find(c=>c.id===id).topics.includes('calc-12.4')));
const allReviewed=Object.fromEntries(cards.map(c=>['card-review/'+c.id,{value:M.review({},4,now)}]));
assert.equal(R.select(cards,topics,allReviewed,date,{scope:'all'}).ids.length,0);
console.log('PASS: every topic covered, varied choices, balanced stable sets, wrong/correct/guess scoring, due-first selection, no early repeats, idempotent answers, topic/course filters.');

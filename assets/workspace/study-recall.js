/* Pure selection and scoring for a short daily recall set. */
(function(root){
'use strict';
const M=typeof module!=='undefined'&&module.exports?require('./study-memory'):root.TesselateMemory;
const E=typeof module!=='undefined'&&module.exports?require('./study-engine'):root.TesselateStudyEngine;
const topicIds=c=>c.topics||[c.topic];
function hash(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
function choices(card,seed){return card.options.map((text,index)=>({text,index})).sort((a,b)=>hash(seed+card.id+a.index)-hash(seed+card.id+b.index));}
function pool(cards,topics,records,{course='',topic='',scope='studied'}={}){
 const map=new Map(topics.map(t=>[t.id,t]));
 const matching=cards.filter(c=>c.options&&topicIds(c).some(id=>map.has(id)&&(!course||map.get(id).course===course)&&(!topic||id===topic)));
 const introduced=new Set(Object.entries(records).filter(([key,r])=>key.startsWith('card-review/')&&r.value.fsrs).flatMap(([,r])=>r.value.topics||[]));
 const studied=matching.filter(c=>records['card-review/'+c.id]?.value.fsrs||topicIds(c).some(id=>introduced.has(id)||M.status(E.confidence(records,id)).studied));
 // A new account can start immediately with the first two lessons in each course.
 const foundations=matching.filter(c=>topicIds(c).some(id=>/^[a-z]+\d+[a-z]?-[01]$/.test(id)));
 return {cards:scope==='all'?matching:studied.length?studied:foundations,foundation:scope!=='all'&&!studied.length};
}
function select(cards,topics,records,date,options={}){
 const source=pool(cards,topics,records,options),map=new Map(topics.map(t=>[t.id,t])),limit=options.limit||10;
 const candidates=source.cards.map(card=>{const value=records['card-review/'+card.id]?.value||{},s=M.status(value,date);return {card,value,s,course:map.get(card.topic)?.course};})
  .filter(x=>!x.value.fsrs||x.s.due)
  .sort((a,b)=>Number(Boolean(b.value.fsrs))-Number(Boolean(a.value.fsrs))||(a.s.recall??1)-(b.s.recall??1)||hash(date+a.card.id)-hash(date+b.card.id));
 const result=[],counts={},topicCounts={};
 // Fill from overdue reviews first. Balance courses within each priority tier.
 for(const reviewed of [true,false]){
  const tier=candidates.filter(x=>Boolean(x.value.fsrs)===reviewed);
  while(tier.length&&result.length<limit){
   tier.sort((a,b)=>(counts[a.course]||0)-(counts[b.course]||0)||(topicCounts[a.card.topic]||0)-(topicCounts[b.card.topic]||0));
   const x=tier.shift();result.push(x.card.id);counts[x.course]=(counts[x.course]||0)+1;topicCounts[x.card.topic]=(topicCounts[x.card.topic]||0)+1;
  }
 }
 return {ids:result,foundation:source.foundation,eligible:source.cards.length,due:candidates.filter(x=>x.value.fsrs).length};
}
function answer(value,card,selected,guessed,setId,now=new Date()){
 if(!card.options||!Number.isInteger(selected)||selected< -1||selected>=card.options.length)throw new Error('Choose an answer or “I don’t know”.');
 // An uncertain network response can be retried with the same set ID safely.
 if((value.answers||[]).some(a=>a.setId===setId))return value;
 const correct=selected===card.correct,grade=correct?(guessed?2:3):1;
 const next=M.review(value,grade,now);
 return {...next,topics:topicIds(card),answers:[...(value.answers||[]),{setId,selected,correct,guessed:Boolean(guessed),grade,at:new Date(now).toISOString(),date:next.last}]};
}
function result(records,id,setId){return records['card-review/'+id]?.value.answers?.find(a=>a.setId===setId);}
function stats(records,ids){const all=ids.flatMap(id=>records['card-review/'+id]?.value.answers||[]);return {total:all.length,correct:all.filter(a=>a.correct).length,uncertain:all.filter(a=>a.correct&&a.guessed).length};}
const api={topicIds,choices,pool,select,answer,result,stats};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TesselateRecall=api;
})(typeof window!=='undefined'?window:globalThis);

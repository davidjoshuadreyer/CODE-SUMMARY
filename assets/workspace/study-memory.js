/* FSRS-6 via ts-fsrs 5.4.2. Topic reviews and flashcards are separate memories. */
(function(root){
'use strict';
const F=typeof module!=='undefined'&&module.exports?require('ts-fsrs'):root.FSRS;
const scheduler=F.fsrs({request_retention:0.9,enable_fuzz:false,learning_steps:[],relearning_steps:[]});
const day=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
const instant=d=>/^\d{4}-\d{2}-\d{2}$/.test(d)?new Date(d+'T20:00:00Z'):new Date(d);
function card(value={},now=new Date()){
 if(value.fsrs)return {...value.fsrs,due:new Date(value.fsrs.due),last_review:new Date(value.fsrs.last_review)};
 // Legacy self-ratings are not recall evidence. Keep them due for a first FSRS review.
 return F.createEmptyCard(instant(value.last||now));
}
function review(value,grade,now=new Date()){
 if(![1,2,3,4].includes(grade))throw new Error('Choose Again, Hard, Good or Easy.');
 const when=instant(now),before=card(value,when);
 if(before.last_review&&when<before.last_review)throw new Error('Review time cannot precede the previous review.');
 const result=scheduler.next(before,when,grade);
 return {...value,fsrs:JSON.parse(JSON.stringify(result.card)),last:day(when),rating:grade===1?1:grade===2?2:3,lastGrade:grade,
  reviews:[...(value.reviews||[]),JSON.parse(JSON.stringify(result.log))]};
}
function status(value={},now=new Date()){
 const when=instant(now),c=card(value,when),studied=Boolean(value.last||value.fsrs),due=studied&&day(c.due)<=day(when);
 const recall=value.fsrs?scheduler.get_retrievability(c,when,false):null;
 const tone=!studied?'new':!value.fsrs||value.lastGrade===1||(recall!==null&&recall<0.8)?'weak':due||value.lastGrade===2?'due':'strong';
 return {studied,due,recall,tone,label:{new:'Not studied',weak:'Needs focus',due:'Review soon',strong:'On track'}[tone],dueDate:studied?day(c.due):''};
}
function preview(value,now=new Date()){return [1,2,3,4].map(grade=>({grade,due:day(scheduler.next(card(value,now),instant(now),grade).card.due)}));}
const api={review,status,preview};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TesselateMemory=api;
})(typeof window!=='undefined'?window:globalThis);

/* Pure planning functions; the UI stores today's chosen tasks separately. */
(function(root){
'use strict';
const dayMs=86400000;
const plus=(date,n)=>new Date(Date.parse(date+'T12:00:00Z')+n*dayMs).toISOString().slice(0,10);
const days=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/dayMs);
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Vancouver',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const defaults={preset:'fall2026',weekday:75,weekend:90,awayStart:'',awayEnd:'',awayMinutes:15,start:'2026-09-27'};
function settings(records){return {...defaults,...records.settings?.value};}
function events(data,records,includeHidden=false){return [...data.events.map(e=>({...e,...records['event/'+e.id]?.value})),...Object.entries(records).filter(([k])=>k.startsWith('custom/')).map(([k,r])=>({...r.value,id:k}))].filter(e=>includeHidden||!e.archived).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.id.localeCompare(b.id));}
function status(records,id){return records['work/'+id]?.value.status||'new';}
function away(date,s){return Boolean(s.awayStart&&s.awayEnd&&date>=s.awayStart&&date<=s.awayEnd);}
function budget(date,s){return away(date,s)?s.awayMinutes:[0,6].includes(new Date(date+'T12:00:00Z').getUTCDay())?s.weekend:s.weekday;}
function target(event,s){
 if(!event.date)return null;
 let date=plus(event.date,-2);
 // Deadlines during the break or immediately after it are prepared before leaving.
 if(s.awayStart&&s.awayEnd&&event.date>=s.awayStart&&event.date<=plus(s.awayEnd,1))date=plus(s.awayStart,-1);
 return event.date>=s.start&&date<s.start?s.start:date;
}
function topics(paths){
 const all=[];
 for(const [course,path] of Object.entries(paths))path.lessons.forEach((t,i)=>all.push({id:course+'-'+i,course,title:t.title,url:t.url,summary:t.summary}));
 // The calculus lessons span several textbook sections. Test tasks use the
 // actual section names so, for example, Test 1 includes unconstrained
 // optimization but does not pull forward gradients or Lagrange multipliers.
 const calc=[['11.7','Cylinders and quadric surfaces',0],['12.1','Introduction to partial differentiation',0],['12.2','Functions of several variables',0],['12.3','Limits and continuity',0],['12.4','Partial derivatives',0],['12.5','Multivariable optimization problems',2],['12.6','Increments and linear approximations',1],['12.7','The multivariable chain rule',0],['12.8','Directional derivatives and gradients',1],['12.9','Lagrange multipliers and constraints',2],['12.10','Critical points of functions of two variables',2],['13.1','Double integrals',3],['13.2','Double integrals over general regions',3],['13.3','Area and volume by double integration',3],['13.4','Double integrals in polar coordinates',3],['13.5','Applications of double integrals',3],['13.6','Triple integrals',4],['11.8','Cylindrical and spherical coordinates',4],['13.7','Integration in cylindrical and spherical coordinates',4],['13.8','Surface area',5],['13.9','Change of variables and Jacobians',5],['14.1','Vector fields',6],['14.2','Line integrals',6]];
 for(const [section,title,index] of calc)all.push({id:'calc-'+section,course:'math250b',title:'§'+section+' · '+title,url:paths.math250b?.lessons[index]?.url||'math250b/review.html',summary:'2026 outline section '+section+'. Focus on this section; the linked lesson may cover broader material.'});
 // Later circuits chapters do not yet have site lessons: link to the source course.
 [1,2,3,4,6,7,8,9,10,11,5,13,12].forEach(n=>all.push({id:'ecet-ch'+n,course:'ecet250e',title:'Chapter '+n+' · circuit problems',url:'https://online.camosun.ca/d2l/home/347548',summary:'Use the assigned textbook problems and instructor notes.'}));
 return all;
}
const ranges=(course,nums)=>nums.map(i=>course+'-'+i);
function scope(e){
 if(e.coverage)return {label:(e.coverageConfirmed?'Instructor-confirmed: ':'Personal review scope: ')+e.coverage,confirmed:Boolean(e.coverageConfirmed),topics:[]};
 const id=e.id;
 if(id==='f26-29')return {label:'Posted scope: §§11.7, 12.1–12.7. The pacing sheet labels coverage tentative; check for instructor updates.',confirmed:true,topics:['11.7','12.1','12.2','12.3','12.4','12.5','12.6','12.7'].map(s=>'calc-'+s)};
 if(id==='f26-30')return {label:'Posted scope: §§12.8–12.10, 13.1–13.6. Subject to instructor updates.',confirmed:true,topics:['12.8','12.9','12.10','13.1','13.2','13.3','13.4','13.5','13.6'].map(s=>'calc-'+s)};
 if(id==='f26-31')return {label:'Posted scope: §§11.8, 13.7–13.9, 14.1–14.2. Subject to instructor updates.',confirmed:true,topics:['11.8','13.7','13.8','13.9','14.1','14.2'].map(s=>'calc-'+s)};
 if(id==='f26-63')return {label:'Confirmed: chapters 1, 2, 3, 4, 6. X01A / Group A.',confirmed:true,topics:[1,2,3,4,6].map(n=>'ecet-ch'+n)};
 if(['f26-60','f26-61','f26-62'].includes(id)){const ns=id==='f26-60'?[1,2]:id==='f26-61'?[7,8,9]:[10,11,5];return {label:'Confirmed: chapters '+ns.join(', ')+'.',confirmed:true,topics:ns.map(n=>'ecet-ch'+n)};}
 const suggested={'f26-13':ranges('phys210',[0,1,2,3]),'f26-14':ranges('phys210',[3,4,5]),'f26-15':ranges('phys210',[6,7,8,9]),'f26-33':ranges('math252',[0,1,2,3,4,5]),'f26-34':ranges('math252',[6,7,8,9,10,11]),'f26-35':ranges('math252',[12,13,14,15,16,17,18])};
 return {label:e.coverage||'Suggested review from course pacing; exact test scope needs instructor confirmation.',confirmed:Boolean(e.coverageConfirmed),topics:suggested[id]||[]};
}
function confidence(records,id){
 const c={rating:0,last:'',...records['topic/'+id]?.value};
 for(const [key,row] of Object.entries(records)){if(key.startsWith('done/')&&key.endsWith('/topic/'+id)&&row.value.done){const d=row.value.practiceDate||key.slice(5,15);if(d>c.last)c.last=d;}}
 return c;
}
function dueReview(date,c){return !c.last||days(c.last,date)>=[0,1,3,7][c.rating||0];}
function candidates(date,data,paths,records){
 const s=settings(records),ev=events(data,records),ts=topics(paths),out=[];
 const add=x=>out.push(x);
 for(const e of ev){
  if(!e.date||e.date<s.start||status(records,e.id)==='submitted')continue;
  const until=days(date,e.date),aim=target(e,s),ahead=days(date,aim);
  if(e.type==='assignment'&&until>=-14&&ahead<=8){
   const st=status(records,e.id),verb=st==='ready'?'Check and submit':st==='working'?'Continue':'Start';
   add({id:date+'/assignment/'+e.id,type:'assignment',course:e.course,event:e.id,title:verb+' '+e.title,detail:st==='ready'?'Check units, missing pages and upload requirements. Record Submitted only after handing it in.':'Work through the next unsolved questions. Flag blockers, then update the assignment status.',reason:(until<0?'Past posted deadline — check submission status. ':e.certainty!=='posted'?'Date needs confirmation. ':'')+'Aim to finish '+aim+'; due '+e.date+'.',url:e.source,minutes:25,score:100-ahead*6+(st==='ready'?12:0)});
  }
  if(e.type==='test'&&until>=0&&until<=21){
   const sc=scope(e),pool=ts.filter(t=>sc.topics.includes(t.id));
   if(!pool.length)add({id:date+'/test/'+e.id,type:'study',course:e.course,event:e.id,title:'Prepare for '+e.title,detail:e.coverage||'Confirm the scope, then solve three representative problems without notes and correct each error.',reason:'Test '+e.date+'. '+sc.label,url:e.source,minutes:25,score:130-until*4});
   for(const t of pool){const c=confidence(records,t.id),elapsed=c.last?days(c.last,date):100;
    add({id:date+'/topic/'+t.id,type:'study',course:e.course,event:e.id,topic:t.id,title:t.title,detail:'Recall the method without notes. Solve 2–3 problems on this topic, check your work, and explain one mistake. Rate your confidence afterwards. Linked lessons may cover broader material.',reason:e.title+' · '+e.date+'. '+(sc.confirmed?'Linked to posted scope; check for instructor updates.':'Suggested scope — confirm with instructor.'),url:t.url,minutes:25,score:94-until*2+(3-(c.rating||1))*5+(dueReview(date,c)?8:-35)+Math.min(elapsed,10)});
   }
  }
  if(e.type==='labweek'&&until>=-6&&until<=5)add({id:date+'/lab/'+e.id,type:'study',course:e.course,event:e.id,title:'Prepare '+e.title,detail:'Open the lab handout, confirm the next lab and due time, and implement or test one section.',reason:'Week of '+e.date+'; this is not a confirmed deadline.',url:e.source,minutes:25,score:65-Math.abs(until)});
 }
 // A weekly check keeps unknown exams and newly posted assignments visible.
 const weekDay=new Date(date+'T12:00:00Z').getUTCDay();
 if(weekDay===0)add({id:date+'/weekly',type:'check',title:'Look one week further ahead',detail:'Check D2L announcements and new assignments. Confirm any unknown test dates and scope; update Upcoming here. Choose one blocker to ask about in class.',reason:'The imported schedule is a snapshot, not a live D2L connection.',url:'https://online.camosun.ca/d2l/home',minutes:15,score:110});
 // Spaced practice continues between tests, without pulling the entire term forward.
 for(const t of ts){const c=confidence(records,t.id);if(c.last&&dueReview(date,c))add({id:date+'/topic/'+t.id,type:'study',course:t.course,topic:t.id,title:t.title,detail:'Redo one previously missed problem without notes. Explain each step and rate your confidence.',reason:'Spaced review: '+(c.rating===3?'keep a strong topic fresh.':'give a weaker topic another pass.'),url:t.url,minutes:25,score:55+(3-c.rating)*3});}
 return out.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
function plan(date,data,paths,records){
 const s=settings(records),limit=Math.max(0,Number(budget(date,s))||0),out=[],used=new Set();let minutes=0;
 if(date<data.start||date>data.end)return {tasks:[],minutes:0,budget:limit,away:away(date,s)};
 const list=candidates(date,data,paths,records);
 // On an away day, retain a single optional retrieval block. Due work stays visible below.
 if(away(date,s)){const task=list.find(t=>t.type==='study');if(task&&limit>0)out.push({...task,title:'Optional light review · '+task.title,minutes:Math.min(15,limit)});return {tasks:out,minutes:out.reduce((n,t)=>n+t.minutes,0),budget:limit,away:true};}
 // Balance urgent assignment work with exam retrieval rather than filling all slots with one subject.
 const firstAssignment=list.find(t=>t.type==='assignment'),firstStudy=list.find(t=>t.type==='study');
 const preferred=[firstAssignment,firstStudy,...list].filter(Boolean);
 for(const task of preferred){if(used.has(task.id)||minutes>=limit)continue;
  if(out.some(t=>task.topic&&t.topic===task.topic)||out.some(t=>task.event&&t.event===task.event))continue;
  const left=limit-minutes;if(left<10)break;
  if(out.length>=2&&out.some(t=>t.course&&t.course===task.course)&&list.some(x=>!used.has(x.id)&&!out.some(t=>t.course===x.course)&&x.score>50))continue;
  const n=Math.min(task.minutes,left);out.push({...task,minutes:n});minutes+=n;used.add(task.id);
 }
 return {tasks:out,minutes,budget:limit,away:false};
}
const api={today,plus,days,settings,events,status,budget,target,topics,scope,confidence,plan};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TesselateStudyEngine=api;
})(typeof window!=='undefined'?window:globalThis);

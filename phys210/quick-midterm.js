'use strict';
const sets=window.PHYSICS_QUICK_SETS;
const steps=sets.flatMap((g,gi)=>g.steps.map((s,si)=>({...s,gi,si,group:g})));
const key='tesselate-phys210-midterm1-phone-v1';
let index=0,answers={};
try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved&&Number.isInteger(saved.index)&&saved.index>=0&&saved.index<steps.length){index=saved.index;for(const [i,a] of Object.entries(saved.answers||{})){if(steps[i]&&Number.isInteger(a)&&a>=0&&a<steps[i].options.length)answers[i]=a;}}}catch{}
const $=id=>document.getElementById(id);
function save(){try{localStorage.setItem(key,JSON.stringify({index,answers}));}catch{}}
sets.forEach((g,i)=>{const opt=document.createElement('option');opt.value=i;opt.textContent=g.title+(g.bonus?' (optional)':'');$('topic').append(opt);});
function render(focus=false){
 $('card').hidden=false;$('finish').hidden=true;
 const s=steps[index],done=Object.hasOwn(answers,index);
 $('topic').value=s.gi;$('problem-title').textContent=s.group.title;$('setup').textContent=s.group.setup;
 $('question').textContent=s.q;
 $('position').textContent=`Step ${s.si+1} of ${s.group.steps.length} · ${s.group.bonus?'Optional bonus':'Core practice'}`;
 $('score').textContent=`${Object.keys(answers).length}/${steps.length} answered`;
 $('progress').max=steps.length;$('progress').value=Object.keys(answers).length;
 $('options').replaceChildren();
 s.options.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='option';const letter=document.createElement('span');letter.className='letter';letter.textContent='ABC'[i];const content=document.createElement('span');content.textContent=t;b.append(letter,content);
 if(done){b.disabled=true;if(i===s.answer){b.classList.add('correct');content.textContent+=' ✓ Correct';}else if(i===answers[index]){b.classList.add('wrong');content.textContent+=' — Your choice';}}
 b.onclick=()=>{answers[index]=i;save();render();};$('options').append(b);});
 $('feedback').replaceChildren();if(done){const strong=document.createElement('strong');strong.textContent=answers[index]===s.answer?'That’s the next step.':'Here’s the step to use.';$('feedback').append(strong,document.createTextNode(s.why));}
 $('back').disabled=index===0;$('next').disabled=!done;
 $('next').textContent=index===steps.length-1?'See results →':(!s.group.bonus&&steps[index+1].group.bonus?'Core results →':'Next step →');
 if(focus)$('question').focus();
}
function results(coreOnly=false){
 $('card').hidden=true;$('finish').hidden=false;
 const pool=steps.map((s,i)=>({s,i})).filter(({s})=>!coreOnly||!s.group.bonus);
 const answered=pool.filter(({i})=>Object.hasOwn(answers,i));const correct=answered.filter(({s,i})=>answers[i]===s.answer);const missed=answered.filter(({s,i})=>answers[i]!==s.answer);
 $('result-title').textContent=answered.length===pool.length?(coreOnly?'Core walkthrough complete':'Walkthrough complete'):'Your review so far';
 $('result').textContent=`${correct.length} correct first choices out of ${answered.length} answered${answered.length<pool.length?` (${pool.length-answered.length} still unanswered)`:''}.`;
 $('weak').textContent=missed.length?'Revisit: '+[...new Set(missed.map(({s})=>s.group.title))].join('; ')+'.':'Good work. Try explaining each setup aloud without the choices.';
 $('review').disabled=!missed.length;$('review').onclick=()=>{index=missed[0].i;save();render(true);};
 $('restart').textContent=coreOnly?'Try optional bonus →':'Start again';$('restart').onclick=()=>{if(coreOnly){index=steps.findIndex(s=>s.group.bonus);}else{answers={};index=0;}save();render(true);};
 $('finish').scrollIntoView({behavior:'smooth',block:'start'});
}
$('next').onclick=()=>{if(index===steps.length-1)return results();if(!steps[index].group.bonus&&steps[index+1].group.bonus)return results(true);index++;save();render(true);};
$('back').onclick=()=>{if(index>0){index--;save();render(true);}};
$('topic').onchange=()=>{index=steps.findIndex(s=>s.gi===Number($('topic').value));save();render(true);};
render();

(() => {
 'use strict';
 const bank=window.ENGR290, exam=location.pathname.endsWith('/exam.html');
 const $=s=>document.querySelector(s), key='engr290-practice-v1-'+(exam?'exam':'quiz');
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
 const question=id=>bank.questions.find(q=>q.id===id);
 let attempt=null, clock=null, saved=null;
 const requested=new URLSearchParams(location.search).get('topic');
 if(/^[0-4]$/.test(requested||'')) $('#topic').value=requested;
 function persist(){try{localStorage.setItem(key,JSON.stringify(attempt));}catch{$('#storage-note').textContent='Browser storage is unavailable; keep this page open to retain your attempt.';}}
 function valid(a){return a && a.version===1 && Array.isArray(a.ids) && a.ids.length>0 && a.ids.length<=30 && new Set(a.ids).size===a.ids.length && a.ids.every(id=>question(id)) && a.answers && typeof a.answers==='object' && !Array.isArray(a.answers) && Object.entries(a.answers).every(([id,n])=>a.ids.includes(id)&&Number.isInteger(n)&&n>=0&&n<4) && Array.isArray(a.checked) && a.checked.every(id=>a.ids.includes(id)) && typeof a.submitted==='boolean' && Number.isFinite(a.deadline);}
 try{const value=JSON.parse(localStorage.getItem(key));if(valid(value))saved=value;}catch{}
 if(saved){$('#resume').hidden=false;$('#resume').textContent=saved.submitted?'View previous result':'Resume saved attempt';}
 function shuffle(items){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
 function explanation(q){const picked=attempt.answers[q.id],ok=picked===q.correct;return `<div class="feedback"><strong class="${ok?'correct':'incorrect'}">${ok?'Correct':picked===undefined?'Unanswered':'Incorrect'}</strong><p>Answer: ${esc(q.options[q.correct])}</p><p>${esc(q.explanation)}</p><a href="${bank.lessons[q.topic].slug}.html">Review this lesson →</a></div>`;}
 function updateStatus(){const answered=Object.keys(attempt.answers).length;$('#answered').textContent=`${answered} of ${attempt.ids.length} answered`;}
 function timer(){if(!exam||attempt.submitted)return;const seconds=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));$('#timer').textContent=`Time left: ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;if(seconds===0)finish(true);}
 function render(){
  clearInterval(clock);$('#setup').hidden=true;$('#results').hidden=true;$('#session').hidden=false;
  $('#session').innerHTML=`<div class="statusbar"><span id="answered" role="status"></span><span id="timer" role="timer"></span></div><form id="questions">${attempt.ids.map((id,i)=>{const q=question(id),locked=!exam&&attempt.checked.includes(id);return `<fieldset id="${id}"><legend>${i+1}. ${esc(q.prompt)}</legend>${q.options.map((option,n)=>`<label class="option"><input type="radio" name="${id}" value="${n}" ${attempt.answers[id]===n?'checked':''} ${locked?'disabled':''}><span>${esc(option)}</span></label>`).join('')}${!exam?`<button type="button" data-check="${id}" ${locked?'disabled':''}>Check answer</button>`:''}<div id="feedback-${id}" aria-live="polite">${locked?explanation(q):''}</div></fieldset>`;}).join('')}<div class="actions"><button class="primary" type="submit">${exam?'Submit test':'Finish quiz'}</button><button type="button" id="restart">Choose a new attempt</button></div></form>`;
  $('#questions').addEventListener('change',event=>{if(event.target.matches('input[type=radio]')){attempt.answers[event.target.name]=Number(event.target.value);persist();updateStatus();}});
  $('#questions').addEventListener('click',event=>{const button=event.target.closest('[data-check]');if(!button)return;const id=button.dataset.check;if(attempt.answers[id]===undefined){$('#feedback-'+id).textContent='Choose an answer first.';return;}attempt.checked.push(id);persist();$('#feedback-'+id).innerHTML=explanation(question(id));$('#'+id).querySelectorAll('input,button').forEach(el=>el.disabled=true);});
  $('#questions').addEventListener('submit',event=>{event.preventDefault();finish(false);});
  $('#restart').addEventListener('click',()=>{if(confirm('Discard this attempt and choose a new one?'))reset();});
  updateStatus();if(exam){timer();if(!attempt.submitted)clock=setInterval(timer,1000);}
 }
 function finish(expired){attempt.submitted=true;attempt.expired=expired;persist();showResults();}
 function showResults(){
  clearInterval(clock);$('#session').hidden=true;$('#setup').hidden=true;$('#results').hidden=false;
  const correct=attempt.ids.filter(id=>attempt.answers[id]===question(id).correct).length;
  const missed=attempt.ids.filter(id=>attempt.answers[id]!==question(id).correct);
  const topics=[...new Set(missed.map(id=>question(id).topic))];
  $('#results').innerHTML=`<p class="eyebrow">${attempt.expired?'TIME IS UP':'ATTEMPT COMPLETE'}</p><h2>${correct} / ${attempt.ids.length} · ${Math.round(correct/attempt.ids.length*100)}%</h2><p>${attempt.ids.length-Object.keys(attempt.answers).length} unanswered. Each question is worth one point.</p>${topics.length?`<h3>Topics to revisit</h3><ul>${topics.map(t=>`<li><a href="${bank.lessons[t].slug}.html">${esc(bank.lessons[t].title)}</a></li>`).join('')}</ul>`:'<p>All correct. Try another set to reinforce what you know.</p>'}<div class="actions"><button id="again" class="primary">New attempt</button>${missed.length?'<button id="retry">Practise missed questions</button>':''}<button id="print">Print results</button></div>${attempt.ids.map((id,i)=>{const q=question(id);return `<details><summary>${i+1}. ${esc(q.prompt)} — ${attempt.answers[id]===q.correct?'Correct':'Review'}</summary><p>Your answer: ${attempt.answers[id]===undefined?'Unanswered':esc(q.options[attempt.answers[id]])}</p>${explanation(q)}</details>`;}).join('')}`;
  $('#again').addEventListener('click',reset);$('#print').addEventListener('click',()=>window.print());
  if($('#retry'))$('#retry').addEventListener('click',()=>start(missed));
  $('#results').focus();
 }
 function start(ids){attempt={version:1,ids:shuffle(ids),answers:{},checked:[],submitted:false,deadline:Date.now()+30*60*1000};persist();render();}
 function reset(){clearInterval(clock);attempt=null;saved=null;try{localStorage.removeItem(key);}catch{}$('#setup').hidden=false;$('#session').hidden=true;$('#results').hidden=true;$('#resume').hidden=true;$('#start').focus();}
 $('#start').addEventListener('click',()=>{const topic=$('#topic').value;const ids=topic==='all'?bank.lessons.flatMap((_,i)=>shuffle(bank.questions.filter(q=>q.topic===i)).slice(0,exam?3:2).map(q=>q.id)):shuffle(bank.questions.filter(q=>q.topic===Number(topic))).map(q=>q.id);start(ids);});
 $('#resume').addEventListener('click',()=>{attempt=saved;if(attempt.submitted)showResults();else render();});
 document.addEventListener('visibilitychange',()=>{if(attempt&&!attempt.submitted&&exam&&!document.hidden)timer();});
})();

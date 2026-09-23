(()=>{'use strict';
const prefix='tesselate-phys210-practice-v1:';
let storageAvailable=true;
function read(key){try{return localStorage.getItem(prefix+key)}catch{storageAvailable=false;return null}}
function save(key,value){try{localStorage.setItem(prefix+key,value)}catch{storageAvailable=false}status()}
function status(){const el=document.querySelector('#practice-status');if(el)el.textContent=`${document.querySelectorAll('[data-complete]:checked').length} of 7 self-checks complete · ${storageAvailable?'saved on this browser':'storage unavailable; keep this tab open'}`}
document.querySelectorAll('[data-note]').forEach(el=>{el.value=read('note:'+el.dataset.note)||'';el.addEventListener('input',()=>save('note:'+el.dataset.note,el.value))});
document.querySelectorAll('[data-complete]').forEach(el=>{el.checked=read('complete:'+el.dataset.complete)==='1';el.addEventListener('change',()=>save('complete:'+el.dataset.complete,el.checked?'1':'0'))});
document.querySelectorAll('[data-reveal]').forEach(el=>el.addEventListener('click',()=>{const panel=el.closest('.solution-panel');const steps=[...panel.querySelectorAll('.solution-step')];const open=steps.some(s=>!s.open);steps.forEach(s=>s.open=open);el.textContent=open?'Hide worked steps':'Show all worked steps'}));
document.querySelectorAll('.answer-check').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const raw=form.querySelector('input').value.trim();const n=Number(raw);const expected=Number(form.dataset.answer);const output=form.querySelector('.check-feedback');if(!raw||!Number.isFinite(n)){output.textContent='Enter a number; scientific notation such as 2.00e10 works.';return}output.textContent=Math.abs(n-expected)<=Math.abs(expected)*.02?'That value agrees within rounding. Check the units, direction, and other parts in the solution.':'Not quite. Check the unit conversion and setup, or open the worked steps.'}));
const filter=document.querySelector('#practice-filter');if(filter)filter.addEventListener('change',()=>{document.querySelectorAll('[data-homework]').forEach(el=>el.hidden=filter.value!=='all'&&el.dataset.homework!==filter.value);document.querySelectorAll('[data-question-nav]').forEach(el=>el.hidden=filter.value!=='all'&&el.dataset.questionNav!==filter.value)});
status();
})();

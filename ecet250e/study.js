(() => {
 'use strict';
 const key='tesselate-ecet-reviewed-v1',sessionKey='tesselate-ecet-practice-v1';
 let reviewed=new Set(),saved={},storage=true,current=null,matching=[];
 try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))reviewed=new Set(value.filter(x=>typeof x==='string'));const state=JSON.parse(localStorage.getItem(sessionKey)||'{}');if(state&&typeof state==='object')saved=state;}catch{storage=false;}
 const problems=[...document.querySelectorAll('.problem')],chapters=[...document.querySelectorAll('.chapter')];
 const $=id=>document.getElementById(id),search=$('problem-search'),kind=$('kind-filter'),progress=$('progress-filter'),chapter=$('chapter-filter'),jump=$('question-jump'),scratch=$('scratchpad');
 const filters=[search,kind,progress,chapter];
 if(Array.isArray(saved.filters))filters.forEach((el,i)=>{if(typeof saved.filters[i]==='string')el.value=saved.filters[i];if(el.tagName==='SELECT'&&!el.value)el.value='all';});
 function persist(){try{localStorage.setItem(key,JSON.stringify([...reviewed]));localStorage.setItem(sessionKey,JSON.stringify({current:current?.id,filters:filters.map(el=>el.value)}));}catch{storage=false;}note();}
 function note(){ $('progress-note').textContent=storage?'Your place, review checkmarks, and working are saved on this browser. Solutions stay hidden until you open them.':'Browser storage is unavailable. Progress and working may not survive a reload.'; }
 const drafts=new Map();
 function loadDraft(id){if(drafts.has(id))return drafts.get(id);try{return localStorage.getItem('tesselate-ecet-working-'+id)||'';}catch{storage=false;return '';}}
 function render(target){
  const previous=current;current=matching.find(p=>p.id===target)||matching[0]||null;
  problems.forEach(p=>{p.hidden=p!==current;p.open=p===current;p.querySelector('[data-reviewed]').checked=reviewed.has(p.id);p.querySelector('.done-label').hidden=!reviewed.has(p.id);});
  chapters.forEach(ch=>{ch.hidden=!current||!ch.contains(current);ch.open=!ch.hidden;});
  if(current&&previous!==current)current.querySelectorAll('details').forEach(d=>d.open=false);
  const count=matching.filter(p=>reviewed.has(p.id)).length,index=matching.indexOf(current);
  $('problem-count').textContent=`${matching.length} of ${problems.length} problems · ${reviewed.size} reviewed overall`;
  $('empty-state').textContent=progress.value==='unreviewed'&&!current?'No unreviewed problems match this selection. Choose All progress to revisit completed questions, or adjust your filters.':'No problems match. Try fewer search words or adjust your filters.';
  $('empty-state').hidden=!!current;$('quiz-controls').hidden=!current;$('quiz-workspace').hidden=!current;
  $('quiz-position').textContent=current?`Question ${index+1} of ${matching.length} · ${count} reviewed in this selection`:'';
  $('quiz-progress').max=matching.length||1;$('quiz-progress').value=count;
  jump.replaceChildren(...matching.map((p,i)=>new Option(`${i+1}. ${p.querySelector('strong').textContent}`,p.id)));
  jump.value=current?.id||'';scratch.value=current?loadDraft(current.id):'';
  $('previous-problem').disabled=index<=0;$('next-problem').disabled=index<0||index===matching.length-1;
  $('review-next').textContent=index===matching.length-1?'Mark reviewed':'Mark reviewed & next';
  $('quiz-complete').hidden=!matching.length||count!==matching.length;
  if(current){const hash=location.hash.slice(1);if(problems.some(p=>p.id===hash))history.replaceState(null,'','#'+current.id);}
  persist();
 }
 function filter(target=current?.id){const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  matching=problems.filter(p=>{const ch=p.closest('.chapter').dataset.chapter,done=reviewed.has(p.id);return words.every(w=>p.dataset.search.includes(w))&&(kind.value==='all'||p.dataset.kind===kind.value)&&(progress.value==='all'||(progress.value==='reviewed')===done)&&(chapter.value==='all'||chapter.value===ch||(chapter.value==='midterm'&&['0','1','2','3','4','6'].includes(ch)));});
  render(target);
 }
 function navigate(id){render(id);$('quiz-controls').scrollIntoView({block:'start'});current?.querySelector('summary').focus({preventScroll:true});}
 filters.forEach(el=>el.addEventListener('input',()=>filter()));
 jump.addEventListener('change',()=>navigate(jump.value));
 $('previous-problem').addEventListener('click',()=>navigate(matching[matching.indexOf(current)-1]?.id));
 $('next-problem').addEventListener('click',()=>navigate(matching[matching.indexOf(current)+1]?.id));
 function mark(done,advance){const i=matching.indexOf(current),next=matching[i+1]||matching[i-1];if(done)reviewed.add(current.id);else reviewed.delete(current.id);const id=advance?next?.id:current.id;filter(id);if(advance&&current)$('quiz-controls').scrollIntoView({block:'start'});}
 $('review-next').addEventListener('click',()=>mark(true,matching.indexOf(current)<matching.length-1||progress.value==='unreviewed'));
 document.querySelectorAll('[data-reviewed]').forEach(box=>box.addEventListener('change',()=>mark(box.checked,false)));
 scratch.addEventListener('input',()=>{if(!current)return;drafts.set(current.id,scratch.value);try{localStorage.setItem('tesselate-ecet-working-'+current.id,scratch.value);}catch{storage=false;note();}});
 // Keep the active problem and its chapter open; only the solution/diagram disclosures toggle.
 [...problems,...chapters].forEach(el=>el.querySelector(':scope > summary').addEventListener('click',e=>e.preventDefault()));
 function openHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const p=problems.find(p=>p.id===id),ch=chapters.find(c=>c.id===id);if(!p&&!ch)return;search.value='';kind.value='all';progress.value='all';chapter.value=ch?.dataset.chapter||'all';filter(p?.id);$('quiz-controls').scrollIntoView({block:'start'});}
 document.body.classList.add('quiz-mode');window.addEventListener('hashchange',openHash);filter(saved.current);openHash();
})();

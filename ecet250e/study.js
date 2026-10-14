(() => {
 'use strict';
 const key='tesselate-ecet-reviewed-v1';let reviewed=new Set();let storage=true;
 try{const value=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(value))reviewed=new Set(value.filter(x=>typeof x==='string'));}catch{storage=false;}
 const problems=[...document.querySelectorAll('.problem')],chapters=[...document.querySelectorAll('.chapter')];
 const search=document.querySelector('#problem-search'),kind=document.querySelector('#kind-filter'),progress=document.querySelector('#progress-filter');
 function filter(){const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
  problems.forEach(p=>{const done=reviewed.has(p.id);p.querySelector('[data-reviewed]').checked=done;p.querySelector('.done-label').hidden=!done;const visible=words.every(w=>p.dataset.search.includes(w))&&(kind.value==='all'||p.dataset.kind===kind.value)&&(progress.value==='all'||(progress.value==='reviewed')===done);p.hidden=!visible;if(visible)count++;});
  chapters.forEach(ch=>{const count=[...ch.querySelectorAll('.problem')].filter(p=>!p.hidden).length;ch.hidden=!count;ch.querySelector('.chapter-count').textContent=count;if(count&&(words.length||kind.value!=='all'||progress.value!=='all'))ch.open=true;});
  document.querySelector('#problem-count').textContent=`${count} of ${problems.length} problems · ${problems.filter(p=>reviewed.has(p.id)).length} reviewed`;
  document.querySelector('#empty-state').hidden=count!==0;
  if(!storage)document.querySelector('#progress-note').textContent='Review checkmarks are available for this visit; browser storage is unavailable.';
 }
 [search,kind,progress].forEach(el=>el.addEventListener('input',filter));
 document.querySelectorAll('[data-reviewed]').forEach(box=>box.addEventListener('change',()=>{if(box.checked)reviewed.add(box.dataset.reviewed);else reviewed.delete(box.dataset.reviewed);try{localStorage.setItem(key,JSON.stringify([...reviewed]));}catch{storage=false;}filter();}));
 document.querySelector('#collapse-all').addEventListener('click',()=>chapters.forEach(ch=>ch.open=false));
 function openHash(){const id=decodeURIComponent(location.hash.slice(1));const el=document.getElementById(id);if(!el||!el.matches('.problem,.chapter'))return;search.value='';kind.value='all';progress.value='all';filter();if(el.matches('.problem')){el.closest('.chapter').open=true;el.open=true;}else el.open=true;el.scrollIntoView({block:'start'});}
 window.addEventListener('hashchange',openHash);filter();openHash();
})();

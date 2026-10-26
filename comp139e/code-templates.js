(() => {
 'use strict';
 const search=document.getElementById('template-search'),topic=document.getElementById('topic-filter');
 const cards=[...document.querySelectorAll('.template')];
 function filter(){
  const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
  for(const card of cards){card.hidden=(topic.value!=='all'&&card.dataset.group!==topic.value)||!words.every(word=>card.dataset.search.includes(word));if(!card.hidden)count++;document.querySelector(`[data-index="${card.id}"]`).hidden=card.hidden;}
  document.querySelectorAll('.topic').forEach(s=>s.hidden=![...s.querySelectorAll('.template')].some(c=>!c.hidden));
  document.querySelectorAll('.index nav details').forEach(g=>{g.hidden=![...g.querySelectorAll('[data-index]')].some(a=>!a.hidden);if(words.length||topic.value!=='all')g.open=true;});
  document.getElementById('search-count').textContent=`${count} of ${cards.length} examples`;
  document.getElementById('no-results').hidden=count!==0;
 }
 function openTarget(){
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!target)return;
  if(target.classList.contains('template')){if(target.hidden){search.value='';topic.value='all';filter();}target.querySelector('.entry').open=true;}
  else if(target.matches('details'))target.open=true;
  target.scrollIntoView({block:'start'});
 }
 search.addEventListener('input',filter);topic.addEventListener('change',filter);
 document.getElementById('clear-filters').addEventListener('click',()=>{search.value='';topic.value='all';filter();search.focus();});
 window.addEventListener('hashchange',openTarget);
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{if(a.hash===location.hash)openTarget();}));
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();search.focus();search.select();}});
 let timer;
 async function copy(text){try{await navigator.clipboard.writeText(text);const s=document.getElementById('copy-status');s.textContent='Code copied — colours and explanations left out.';clearTimeout(timer);timer=setTimeout(()=>s.textContent='',3000);}catch{const d=document.getElementById('copy-fallback'),f=d.querySelector('textarea');f.value=text;d.showModal();f.focus();f.select();}}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-copy]');if(b)copy(document.getElementById(b.dataset.copy).textContent);});
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-code-target]');if(!button)return;
  const target=document.getElementById(button.dataset.codeTarget);if(!target)return;
  const workspace=button.closest('.code-workspace');
  workspace.querySelectorAll('.selected-line').forEach(line=>line.classList.remove('selected-line'));
  workspace.querySelectorAll('[aria-current]').forEach(b=>b.removeAttribute('aria-current'));
  button.setAttribute('aria-current','true');target.classList.add('selected-line');
  target.scrollIntoView({block:'nearest',inline:'nearest'});target.focus({preventScroll:true});
 });
 const decisionFilter=document.getElementById('decision-filter');
 decisionFilter.addEventListener('change',()=>{
  let count=0;document.querySelectorAll('[data-decision]').forEach(row=>{row.hidden=decisionFilter.value!=='all'&&row.dataset.decision!==decisionFilter.value;if(!row.hidden)count++;});
  document.getElementById('decision-count').textContent=`${count} routes`;
 });
 document.addEventListener('click',e=>{
  const button=e.target.closest('[data-download]');if(!button)return;
  const code=document.getElementById(button.dataset.download).textContent;
  const url=URL.createObjectURL(new Blob([code],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=button.dataset.download.replace(/-program$/,'')+'.cpp';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 let beforePrint=[];
 window.addEventListener('beforeprint',()=>{beforePrint=[...document.querySelectorAll('details')].map(d=>[d,d.open]);document.querySelectorAll('.entry').forEach(d=>{if(!d.closest('.template').hidden)d.open=true;});});
 window.addEventListener('afterprint',()=>beforePrint.forEach(([d,open])=>d.open=open));
 document.getElementById('print-sheet').addEventListener('click',()=>window.print());
 if(location.hash)openTarget();
})();

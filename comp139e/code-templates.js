(() => {
 'use strict';
 const search=document.getElementById('template-search'),topic=document.getElementById('topic-filter');
 const cards=[...document.querySelectorAll('.template')];
 const views={list:'List · compact rows. Open only what you need.',gallery:'Gallery · compare question summaries, then expand a card.',focus:'Focus · one example open at a time, with a wider reading area.'};
 function setView(view){
  if(!views[view])view='list';document.body.dataset.view=view;
  document.querySelectorAll('button[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  document.getElementById('view-description').textContent=views[view];
  if(view==='focus'){let found=false;cards.forEach(c=>{const d=c.querySelector('.entry');if(d.open){if(found)d.open=false;found=true;}});}
  try{localStorage.setItem('comp-reference-view',view);}catch{}
 }
 document.querySelectorAll('button[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
 try{setView(localStorage.getItem('comp-reference-view')||'list');}catch{setView('list');}
 cards.forEach(c=>c.querySelector('.entry').addEventListener('toggle',e=>{if(document.body.dataset.view==='focus'&&e.target.open)cards.forEach(other=>{if(other!==c)other.querySelector('.entry').open=false;});}));
 document.getElementById('collapse-examples').addEventListener('click',()=>cards.forEach(c=>c.querySelectorAll('details').forEach(d=>d.open=false)));
 document.querySelectorAll('[data-task]').forEach(b=>b.addEventListener('click',()=>{topic.value=topic.value===b.dataset.task?'all':b.dataset.task;search.value='';filter();}));
 function filter(){
  const words=search.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let count=0;
  for(const card of cards){card.hidden=(topic.value!=='all'&&!card.dataset.topics.split(' ').includes(topic.value))||!words.every(word=>card.dataset.search.includes(word));if(!card.hidden)count++;document.querySelector(`[data-index="${card.id}"]`).hidden=card.hidden;}
  document.querySelectorAll('.topic').forEach(s=>s.hidden=![...s.querySelectorAll('.template')].some(c=>!c.hidden));
  document.querySelectorAll('.index nav details').forEach(g=>{g.hidden=![...g.querySelectorAll('[data-index]')].some(a=>!a.hidden);g.open=Boolean(words.length||topic.value!=='all');});
  document.querySelectorAll('[data-task]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.task===topic.value)));
  document.getElementById('search-count').textContent=`${count} of ${cards.length} examples`;
  document.getElementById('no-results').hidden=count!==0;
 }
 function openTarget(){
  const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(!target)return;
  if(target.classList.contains('template')){if(target.hidden){search.value='';topic.value='all';filter();}target.querySelector('.entry').open=true;}
  else if(target.matches('details'))target.open=true;
  if(target.classList.contains('code-line')){
   const card=target.closest('.template');if(card.hidden){search.value='';topic.value='all';filter();}card.querySelector('.entry').open=true;
   card.querySelectorAll('.selected-line').forEach(line=>line.classList.remove('selected-line'));target.classList.add('selected-line');target.focus({preventScroll:true});
  }
  for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  target.scrollIntoView({block:'start'});
 }
 search.addEventListener('input',filter);topic.addEventListener('change',filter);
 document.getElementById('clear-filters').addEventListener('click',()=>{search.value='';topic.value='all';filter();search.focus();});
 window.addEventListener('hashchange',openTarget);
 document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{if(a.getAttribute('href')===location.hash)openTarget();}));
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
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-uml-zoom]');if(!b)return;
  const svg=b.closest('.uml-panel').querySelector('svg');
  const current=Number(svg.dataset.zoom||1);
  const zoom=b.dataset.umlZoom==='fit'?1:Math.max(0.5,Math.min(3,current+(b.dataset.umlZoom==='in'?0.25:-0.25)));
  svg.dataset.zoom=zoom;svg.style.width=(zoom*100)+'%';
 });
 let beforePrint=[];
 window.addEventListener('beforeprint',()=>{beforePrint=[...document.querySelectorAll('details')].map(d=>[d,d.open]);document.querySelectorAll('.entry').forEach(d=>{if(!d.closest('.template').hidden)d.open=true;});});
 window.addEventListener('afterprint',()=>beforePrint.forEach(([d,open])=>d.open=open));
 document.getElementById('print-sheet').addEventListener('click',()=>window.print());
 if(location.hash)openTarget();
})();

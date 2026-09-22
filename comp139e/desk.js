(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 let programs=[],selected=null,request=0,source='';
 const fileURL=file=>'workspace/'+file.split('/').map(encodeURIComponent).join('/');
 function list(){
  const query=$('search').value.toLowerCase().trim(),category=$('category').value;
  const matches=programs.filter(p=>(category==='all'||p.kind===category)&&[p.title,p.label,p.group,...p.files].join(' ').toLowerCase().includes(query));
  $('matches').textContent=`${matches.length} of ${programs.length} programs`;
  $('programs').replaceChildren(...matches.map(p=>{const b=document.createElement('button');b.type='button';b.className='program';b.dataset.id=p.id;b.setAttribute('aria-pressed',String(p.id===selected?.id));const title=document.createElement('strong'),sub=document.createElement('span');title.textContent=p.title;sub.textContent=p.label+' · '+p.group;b.append(title,sub);b.addEventListener('click',()=>{if(decodeURIComponent(location.hash.slice(1))===p.id)select(p);else location.hash=encodeURIComponent(p.id);});return b;}));
  if(!matches.length)$('programs').textContent='No matches. Try another search or category.';
 }
 async function loadSource(){
  const ticket=++request,file=$('file-select').value;source='';$('source-code').textContent='Loading source…';$('source-status').textContent='';$('copy-source').disabled=true;
  $('download-source').href=fileURL(file);
  try{const res=await fetch(fileURL(file));if(!res.ok)throw Error('Could not load this source file.');const text=await res.text();if(ticket!==request)return;source=text;$('source-code').textContent=text;$('source-status').textContent=`${file} · ${text.split('\n').length} lines`;$('copy-source').disabled=false;}catch(error){if(ticket!==request)return;$('source-code').textContent='';$('source-status').textContent=error.message;}
 }
 function select(p){
  selected=p;try{localStorage.setItem('comp139e-desk-selection',p.id);}catch{}
  $('program-title').textContent=p.title;$('program-kind').textContent=p.label+' · '+p.group;
  $('program-note').textContent=p.note||(p.kind==='tutorials'?'Commented learning example. Predict its output, then run and modify it locally.':'Read the source and related files, then run the program in your local workspace.');
  $('local-link').hidden=!p.runnable;$('local-link').href='http://127.0.0.1:13900/?program='+encodeURIComponent(p.id);
  const tutorial=p.kind==='tutorials';$('lesson-link').hidden=!tutorial;if(tutorial)$('lesson-link').href='lesson-'+p.id.split(':')[1].padStart(2,'0')+'.html';
  $('input-details').hidden=!p.runnable;$('input-hint').textContent=p.inputHint;$('sample').textContent=p.sample||'No example input required.';
  const [kind,id]=p.id.split(':');$('command').textContent='.\\build\\bin\\main.exe '+(kind==='lab'?id:kind+' '+id);
  if(p.fileArgs)$('command').textContent+=' '+p.inputFile+' '+p.outputFile;
  const files=[...new Set([...p.files,...(p.readme?[p.readme]:[])])];
  $('file-select').replaceChildren(...files.map(file=>{const option=document.createElement('option');option.value=file;option.textContent=file;return option;}));
  list();const active=$('programs').querySelector('[aria-pressed="true"]');if(active)$('programs').scrollTop=active.offsetTop-8;loadSource();
 }
 function fromHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const p=programs.find(p=>p.id===id);if(p)select(p);}
 $('search').addEventListener('input',list);$('category').addEventListener('change',list);$('file-select').addEventListener('change',loadSource);window.addEventListener('hashchange',fromHash);
 $('copy-source').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(source);$('source-status').textContent='Source copied.';}catch{$('source-status').textContent='Select the source text to copy it manually.';}});
 (async()=>{try{const response=await fetch('programs.json');if(!response.ok)throw Error('The program library could not load. Reload to try again.');programs=await response.json();let saved;try{saved=localStorage.getItem('comp139e-desk-selection');}catch{}let requested='';try{requested=decodeURIComponent(location.hash.slice(1));}catch{}select(programs.find(p=>p.id===requested)||programs.find(p=>p.id===saved)||programs.find(p=>p.id==='tutorial:1'));}catch(error){$('program-title').textContent='Code Desk unavailable';$('source-status').textContent=error.message;}})();
})();

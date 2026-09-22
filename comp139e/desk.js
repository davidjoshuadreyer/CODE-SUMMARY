(() => {
 'use strict';
 const $=id=>document.getElementById(id),key='comp139e-online-drafts-v1';
 const scratch={id:'scratch',kind:'scratch',title:'C++ scratchpad',label:'Your program',group:'C++17',runnable:true,source:'main.cpp',sample:'',inputHint:'Enter values for std::cin before running.'};
 const scratchRecipe={files:[{name:'main.cpp',content:'#include <iostream>\n\nint main() {\n    std::cout << "Hello from COMP 139E!\\n";\n    return 0;\n}\n'}],units:[{file:'main.cpp'}],includes:['.'],standard:17,args:[],output:[]};
 let programs=[],recipes={},selected,recipe,files={},originals={},activeFile='',selection=0,controller=null,drafts={};
 try{drafts=JSON.parse(localStorage.getItem(key)||'{}');if(!drafts||Array.isArray(drafts)||typeof drafts!=='object')drafts={};}catch{}
 function save(){
  if(!selected||!activeFile)return;
  files[activeFile]=$('source-code').value;
  drafts[selected.id]={files:Object.fromEntries(Object.entries(files).filter(([name,value])=>value!==originals[name])),input:$('stdin').value};
  try{localStorage.setItem(key,JSON.stringify(drafts));$('save-status').textContent='Edits saved in this browser only.';}catch{$('save-status').textContent='Browser storage is unavailable or full. Copy your edits before closing this page.';}
 }
 function list(){
  const query=$('search').value.toLowerCase().trim(),category=$('category').value;
  const matches=programs.filter(p=>(category==='all'||p.kind===category)&&[p.title,p.label,p.group,...(p.files||[])].join(' ').toLowerCase().includes(query));
  $('matches').textContent=`${matches.length} of ${programs.length} programs`;
  $('programs').replaceChildren(...matches.map(p=>{const b=document.createElement('button');b.type='button';b.className='program';b.dataset.id=p.id;b.setAttribute('aria-pressed',String(p.id===selected?.id));const title=document.createElement('strong'),sub=document.createElement('span');title.textContent=p.title;sub.textContent=p.label+' · '+p.group;b.append(title,sub);b.addEventListener('click',()=>open(p.id));return b;}));
  if(!matches.length)$('programs').textContent='No matches. Try another search or category.';
 }
 function open(id){if(decodeURIComponent(location.hash.slice(1))===id)select(programs.find(p=>p.id===id)||scratch);else location.hash=encodeURIComponent(id);}
 function showFile(){activeFile=$('file-select').value;$('source-code').value=files[activeFile]||'';$('source-status').textContent=activeFile+' · '+$('source-code').value.split('\n').length+' lines';}
 function stop(message){if(controller){controller.abort();controller=null;$('run-status').textContent=message;}$('stop').hidden=true;$('run').disabled=!recipe||!activeFile;}
 async function select(p){
  save();stop('Stopped waiting. The remote run remains time-limited.');const ticket=++selection;selected=p;recipe=null;activeFile='';files={};originals={};
  try{localStorage.setItem('comp139e-desk-selection',p.id);}catch{}
  $('program-title').textContent=p.title;$('program-kind').textContent=p.label+' · '+p.group;
  $('program-note').textContent=p.note||(p.kind==='tutorials'?'Predict the output, run the example, then change the code and try again.':'Edit the source and related files, then compile and run here.');
  const tutorial=p.kind==='tutorials';$('lesson-link').hidden=!tutorial;if(tutorial)$('lesson-link').href='lesson-'+p.id.split(':')[1].padStart(2,'0')+'.html';
  $('stdin').value=typeof drafts[p.id]?.input==='string'?drafts[p.id].input:p.sample||'';$('input-hint').textContent=p.inputHint||scratch.inputHint;
  $('run').disabled=true;$('source-code').disabled=true;$('file-select').disabled=true;$('reset').disabled=true;$('copy-source').disabled=true;
  $('run-status').textContent=p.runnable?'Loading project...':'MATLAB scripts can be edited here; execution requires MATLAB.';
  $('console').textContent='';$('diagnostics').textContent='';$('diagnostics-panel').hidden=true;$('source-code').value='';$('file-select').replaceChildren();$('source-status').textContent='Loading files...';$('save-status').textContent='';list();
  const active=$('programs').querySelector('[aria-pressed="true"]');if(active)$('programs').scrollTop=active.offsetTop-8;
  try{
   const nextRecipe=p.id==='scratch'?scratchRecipe:recipes[p.id];
   const entries=nextRecipe?.files||p.files.map(name=>({name,url:'workspace/'+name}));
   const loaded=await Promise.all(entries.map(async f=>{if(f.content!==undefined)return [f.name,f.content];const response=await fetch(f.url.split('/').map(encodeURIComponent).join('/'));if(!response.ok)throw Error('Could not load '+f.name+'. Reload to try again.');return [f.name,(await response.text()).replace(/^\uFEFF/,'')];}));
   if(ticket!==selection)return;
   originals=Object.fromEntries(loaded);files={...originals};for(const name of Object.keys(files)){if(typeof drafts[p.id]?.files?.[name]==='string')files[name]=drafts[p.id].files[name];}
   recipe=nextRecipe;
   $('file-select').replaceChildren(...Object.keys(files).map(name=>{const option=document.createElement('option');option.value=name;option.textContent=name;return option;}));
   if(p.source in files)$('file-select').value=p.source;showFile();
   $('source-code').disabled=false;$('file-select').disabled=false;$('copy-source').disabled=false;$('reset').disabled=false;$('run').disabled=!recipe;
   if(recipe)$('run-status').textContent=`Ready · C++${recipe.standard} · ${recipe.units.length} source file${recipe.units.length===1?'':'s'}`;
   $('save-status').textContent='Edits save in this browser only; they are separate from workspace backups.';
  }catch(error){if(ticket===selection){$('source-status').textContent=error.message;$('run-status').textContent='Project could not load.';}}
 }
 async function run(){
  if(!recipe||!activeFile||controller)return;save();const current=new AbortController();controller=current;let timedOut=false;
  const timeout=setTimeout(()=>{timedOut=true;current.abort();},90000);
  $('run').disabled=true;$('stop').hidden=false;$('console').textContent='';$('diagnostics').textContent='';$('diagnostics-panel').hidden=true;
  try{
   const input=$('stdin').value;
   const result=await CourseCompiler.run(recipe,{...files},input&&!input.endsWith('\n')?input+'\n':input,{signal:current.signal,onStatus:message=>{if(controller===current)$('run-status').textContent=message;}});
   if(controller!==current)return;
   const success=result.status.id===3;
   $('run-status').textContent=(success?'Finished':result.status.description)+(result.exit_code!=null?` · exit ${result.exit_code}`:'')+(result.time?` · ${result.time}s`:'');
   $('console').textContent=result.stdout||'(No standard output.)';
   $('diagnostics').textContent=[result.compile_output,result.stderr,result.message].filter(Boolean).join('\n');$('diagnostics-panel').hidden=!$('diagnostics').textContent;$('diagnostics-panel').open=!success;
  }catch(error){if(controller===current)$('run-status').textContent=timedOut?'The compiler took too long to respond. Your edits are saved; try again.':current.signal.aborted?'Stopped waiting. The remote run remains time-limited.':error.message;}
  finally{clearTimeout(timeout);if(controller===current){controller=null;$('run').disabled=!recipe;$('stop').hidden=true;}}
 }
 $('search').addEventListener('input',list);$('category').addEventListener('change',list);
 $('file-select').addEventListener('change',()=>{save();showFile();});
 $('source-code').addEventListener('input',save);$('stdin').addEventListener('input',save);
 $('source-code').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const editor=event.target;editor.setRangeText('    ',editor.selectionStart,editor.selectionEnd,'end');save();}});
 $('run').addEventListener('click',run);$('stop').addEventListener('click',()=>stop('Stopped waiting. The remote run remains time-limited.'));
 $('scratch').addEventListener('click',()=>open('scratch'));
 $('sample-input').addEventListener('click',()=>{$('stdin').value=selected?.sample||'';save();});
 $('reset').addEventListener('click',()=>{if(activeFile&&confirm('Reset this file to its original course source? Your edits to this file will be replaced.')){$('source-code').value=originals[activeFile];save();}});
 $('copy-source').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('source-code').value);$('source-status').textContent='Source copied.';}catch{$('source-code').select();$('source-status').textContent='Press Ctrl+C to copy the selected source.';}});
 window.addEventListener('hashchange',()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const p=programs.find(p=>p.id===id);if(p)select(p);});
 (async()=>{try{
  const responses=await Promise.all([fetch('programs.json'),fetch('online.json?v=1')]);if(responses.some(r=>!r.ok))throw Error('The program library could not load. Reload to try again.');
  [programs,recipes]=await Promise.all(responses.map(r=>r.json()));programs.unshift(scratch);
  let saved;try{saved=localStorage.getItem('comp139e-desk-selection');}catch{}let requested='';try{requested=decodeURIComponent(location.hash.slice(1));}catch{}
  await select(programs.find(p=>p.id===requested)||programs.find(p=>p.id===saved)||programs.find(p=>p.id==='tutorial:1'));
 }catch(error){$('program-title').textContent='Code Desk unavailable';$('source-status').textContent=error.message;}})();
})();

/* Static-site workspace. No uploads leave the browser. */
(() => {
'use strict';
const $ = (s, root=document) => root.querySelector(s);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => crypto.randomUUID();
const labels = {unused:'Unused',working:'In progress',converted:'Converted',unreviewed:'Needs review'};
const catalog = window.TESSELATE_CATALOG;
let db, state, tab='pages', search='', courseFilter='', statusFilter='', toastTimer;
const dialog = $('#editor');
const copy = value => structuredClone(value);
const course = id => state.courses.find(c=>c.id===id);
const pages = id => state.resources.filter(r=>!id || r.courseId===id);
const refs = id => state.references.filter(r=>!id || r.courseId===id);
const outputs = id => state.resources.filter(r=>r.referenceIds.includes(id));
const status = r => outputs(r.id).length ? 'converted' : r.stage;
const activeCourses = () => state.courses.filter(c=>c.semester===state.currentSemester);
const activeRefs = () => state.references.filter(r=>activeCourses().some(c=>c.id===r.courseId));
const activePages = () => state.resources.filter(r=>activeCourses().some(c=>c.id===r.courseId));
const button = (action,label,id='',cls='') => `<button type="button" class="${cls}" data-action="${action}" data-id="${esc(id)}">${label}</button>`;
const badge = s => `<span class="badge ${s}">${labels[s]}</span>`;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),5500);}
function safeURL(value){
 const text=String(value).trim();
 if(!text || /[\u0000-\u0020\\]/.test(text)) throw new Error('Use a web URL or a site path with spaces encoded as %20.');
 const resolved=new URL(text,location.href);
 if(!['http:','https:'].includes(resolved.protocol) && !(location.protocol==='file:' && resolved.protocol==='file:' && !/^[a-z]+:/i.test(text))) throw new Error('Use an http(s) URL or a relative site path.');
 return text;
}
function resourceLink(r,label='Open page ↗',cls='button small'){
 return r.body ? `<a class="${cls}" href="#note/${esc(r.id)}">${esc(label)}</a>` : `<a class="${cls}" href="${esc(safeURL(r.url))}" target="_blank" rel="noopener">${esc(label)}</a>`;
}
function openDB(){return new Promise((resolve,reject)=>{
 const req=indexedDB.open('tesselate-workspace',1);
 req.onupgradeneeded=()=>{req.result.createObjectStore('state');req.result.createObjectStore('files');};
 req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
});}
function read(store,key){return new Promise((resolve,reject)=>{const req=db.transaction(store).objectStore(store).get(key);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function commit(next,files=[],removed=[]){
 next.semesters=[...new Set([...(state?.semesters||[]),state?.currentSemester,next.currentSemester,...next.courses.map(c=>c.semester)])].filter(Boolean);
 const expected=state?.revision||0;next.revision=expected+1;
 await new Promise((resolve,reject)=>{
  const tx=db.transaction(['state','files'],'readwrite');let conflict=false;
  const req=tx.objectStore('state').get('workspace');
  req.onsuccess=()=>{
   if((req.result?.revision||0)!==expected){conflict=true;tx.abort();return;}
   tx.objectStore('state').put(next,'workspace');
   for(const item of files)tx.objectStore('files').put(item.blob,item.id);
   for(const id of removed)tx.objectStore('files').delete(id);
  };
  tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error||new Error('Unable to save.'));
  tx.onabort=()=>reject(new Error(conflict?'This workspace changed in another tab. Reload before saving.':'Could not save. Browser storage may be full or unavailable. Export a backup before clearing anything.'));
 });state=next;
}
function heading(eyebrow,title,sub,actions=''){return `<div class="page-heading"><div><p class="eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1><p class="sub">${esc(sub)}</p></div><div class="actions">${actions}</div></div>`;}
function empty(title,description,action=''){return `<div class="empty"><h3>${esc(title)}</h3><p>${esc(description)}</p>${action}</div>`;}
function courseCard(c){return `<a class="course-card" href="#course/${esc(c.id)}"><div class="course-top"><span class="course-symbol">${esc(c.symbol||c.code.slice(0,2))}</span><span class="badge">${esc(c.semester)}</span></div><p class="course-code">${esc(c.code)}</p><h3>${esc(c.name)}</h3><p class="sub">${esc(c.description||'Your notes, practice, and reference materials in one place.')}</p><div class="course-bottom"><span>${pages(c.id).length} study pages</span><span>${refs(c.id).length} references</span><span>↗</span></div></a>`;}
function stats(){return `<div class="stats">${[['Active courses',activeCourses().length,'This semester'],['Study pages',activePages().length,'Ready to study'],['References to use',activeRefs().filter(r=>status(r)!=='converted').length,'Not yet linked to a page']].map(([label,value,note])=>`<div class="stat"><div class="stat-label">${label}<span aria-hidden="true">↗</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`).join('')}</div>`;}
function overview(){
 const current=activeCourses(), previous=state.courses.filter(c=>c.semester!==state.currentSemester), queue=activeRefs().filter(r=>status(r)!=='converted').slice(-4).reverse();
 return heading(state.currentSemester,'A fresh start. A clear head.','Everything you need for the semester, in one place.',button('upload','↑ Upload references')+button('add-course','+ Add course','','primary'))+stats()+
 `<div class="section-heading"><h2>This semester <span class="count">${current.length} courses</span></h2><a href="#courses">View all courses →</a></div>`+
 (current.length?`<div class="course-grid">${current.map(courseCard).join('')}</div>`:`<div class="onboarding"><div class="onboarding-copy"><p class="eyebrow">ROOM FOR WHAT’S NEXT</p><h2>Your new semester starts here.</h2><p class="sub">Add your courses, bring in your lecture slides, and turn your references into a study collection that grows with you.</p><div class="actions">${button('add-course','+ Add your first course','','primary')}<a class="button" href="#archive">Browse past courses →</a></div></div><div class="illustration" aria-hidden="true"><b>↗</b><span></span><span></span><span></span></div></div>`)+
 `<div class="overview-bottom"><section><div class="section-heading"><h2>Up next in your library</h2><a href="#references">Open library →</a></div><div class="panel">${queue.length?queue.map(r=>`<div class="mini-row"><span class="mini-icon">${esc(r.name.split('.').pop().slice(0,4).toUpperCase())}</span><div class="row-copy"><strong>${esc(r.name)}</strong><small>${esc(course(r.courseId)?.code||'Unassigned')}</small></div>${button('edit-reference','Review',r.id,'small')}</div>`).join(''):`<div class="guide"><h3>No loose ends yet.</h3><p class="sub">Upload a reference to start your queue. You’ll always know what still needs a study page.</p>${button('upload','Upload your first reference →','','text-button')}</div>`}</div></section><section><div class="section-heading"><h2>From reference to ready</h2></div><div class="panel guide">${[['Bring it in','Upload lecture slides, readings, or problem sets.'],['Make it useful','Create notes or add a link to a quiz, summary, or study page.'],['Connect the dots','Link the source to the page you made. We’ll mark it converted.']].map(([a,b],i)=>`<div class="guide-step"><span class="step-number">${i+1}</span><div><strong>${a}</strong><p>${b}</p></div></div>`).join('')}</div></section></div>`+
 (previous.length?`<div class="section-heading"><h2>Pick up an old subject</h2><a href="#archive">Past semesters →</a></div><div class="course-grid">${previous.slice(0,3).map(courseCard).join('')}</div>`:'');
}
function courseList(archive){
 const list=state.courses.filter(c=>archive?c.semester!==state.currentSemester:c.semester===state.currentSemester);
 return heading(archive?'YOUR COLLECTION':state.currentSemester,archive?'Past semesters':'My courses',archive?'The semester ends. Your study collection stays.':'A home for every subject you’re studying.',button('add-course','+ Add course','','primary'))+
 `<div class="toolbar"><input class="search" id="course-search" aria-label="Search courses" placeholder="Search by course name or code…" value="${esc(search)}"></div><div id="course-results">${courseResults(list)}</div>`;
}
function courseResults(list){
 list=list.filter(c=>(c.name+' '+c.code+' '+c.semester).toLowerCase().includes(search.toLowerCase()));
 if(!list.length)return empty('No courses here yet.',search?'Try a different search.':'Add a course and choose its semester to get started.',button('add-course','+ Add course','','primary'));
 return [...new Set(list.map(c=>c.semester))].map(semester=>`<div class="section-heading"><h2>${esc(semester)} <span class="count">${list.filter(c=>c.semester===semester).length} courses</span></h2></div><div class="course-grid">${list.filter(c=>c.semester===semester).map(courseCard).join('')}</div>`).join('');
}
function resourceCard(r){return `<article class="resource-card"><span class="badge">${esc(r.kind)}</span><h3>${esc(r.title)}</h3><p>${esc(r.description||'Part of your '+(course(r.courseId)?.name||'study')+' collection.')}</p><p>${r.referenceIds.length?`${r.referenceIds.length} linked source${r.referenceIds.length===1?'':'s'}`:'No sources linked yet'}</p><div class="actions">${resourceLink(r)}${button('edit-page','Edit / link sources',r.id,'small')}</div></article>`;}
function courseView(id){
 const c=course(id);if(!c)return empty('Course not found','Choose a course from your workspace.','<a class="button" href="#courses">My courses</a>');
 return `<a class="back" href="#${c.semester===state.currentSemester?'courses':'archive'}">← Back to courses</a>`+heading(c.semester+' / '+c.code,c.name,c.description||'Build your study collection, one resource at a time.',button('edit-course','Edit course',c.id)+button('upload','↑ Upload references',c.id)+button('add-page','+ Add study page',c.id,'primary'))+
 `<div class="tabs" role="group" aria-label="Course content">${button('tab-pages',`Study pages (${pages(id).length})`,id,tab==='pages'?'active':'')}${button('tab-references',`References (${refs(id).length})`,id,tab==='references'?'active':'')}</div>`+
 (tab==='pages'?(pages(id).length?`<div class="resource-grid">${pages(id).map(resourceCard).join('')}</div>`:empty('Your study collection starts here.','Write a note or link an existing study page, quiz, or practice exam.',button('add-page','+ Add study page',id,'primary'))):library(id));
}
function courseOptions(selected='',unassigned=false){return (unassigned?'<option value="">Unassigned</option>':'')+state.courses.map(c=>`<option value="${esc(c.id)}" ${selected===c.id?'selected':''}>${esc(c.code+' · '+c.name+' ('+c.semester+')')}</option>`).join('');}
function library(id=''){
 return (!id?heading('SOURCE MATERIALS','Reference library','Keep the originals. Track what you turn into something useful.',button('upload','↑ Upload references','','primary')):'')+
 `<div class="toolbar"><input id="reference-search" class="search" aria-label="Search references" placeholder="Search files, notes, or courses…" value="${esc(search)}">${!id?`<select id="course-filter" aria-label="Filter by course"><option value="">All courses & semesters</option><option value="unassigned" ${courseFilter==='unassigned'?'selected':''}>Unassigned</option>${courseOptions(courseFilter)}</select>`:''}<select id="status-filter" aria-label="Filter by status"><option value="">All statuses</option>${Object.entries(labels).map(([k,v])=>`<option value="${k}" ${statusFilter===k?'selected':''}>${v}</option>`).join('')}</select></div>`+
 `<p class="hint">Converted means linked to a study page. Existing files start as “Needs review” until you check their use.</p><div id="reference-results">${referenceResults(id)}</div>`;
}
function referenceResults(id=''){
 const list=refs(id).filter(r=>(!courseFilter||id||(courseFilter==='unassigned'?!r.courseId:r.courseId===courseFilter))&&(!statusFilter||status(r)===statusFilter)&&[r.name,r.notes,course(r.courseId)?.code,course(r.courseId)?.name].join(' ').toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
 return list.length?`<p class="hint">${list.length} reference${list.length===1?'':'s'}</p><div class="panel">${list.map(r=>`<article class="library-row"><div><strong>${esc(r.name)}</strong><p>${esc(course(r.courseId)?.code||'Unassigned')} · ${formatSize(r.size)} · ${r.builtin?'Site file':'Uploaded on this device'}</p>${r.notes?`<p>${esc(r.notes)}</p>`:''}<div class="source-links">${outputs(r.id).map(p=>resourceLink(p,'↗ '+p.title,'')).join('')}</div></div><div>${badge(status(r))}</div><div class="actions">${r.url?`<a class="button small" href="${esc(safeURL(r.url))}" target="_blank" rel="noopener">Open ↗</a>`:button('download','Save file',r.id,'small')}${button('edit-reference','Manage',r.id,'small')}</div></article>`).join('')}</div>`:empty('No references to show.',search||statusFilter||courseFilter?'Try a different search or filter.':'Upload your first file, then link it to what you make.',button('upload','↑ Upload references',id,'primary'));
}
function formatSize(size){return size>=1048576?(size/1048576).toFixed(1)+' MB':Math.max(1,Math.round(size/1024))+' KB';}
function render(){
 const [view,id]=(location.hash.slice(1)||'overview').split('/');
 const nav=view==='course'?(course(id)?.semester===state.currentSemester?'courses':'archive'):view==='note'?'courses':view;
 document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===nav);if(a.dataset.nav===nav)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('#breadcrumb').textContent=({overview:'Overview',courses:'My courses',archive:'Past semesters',references:'Reference library',course:course(id)?.code,note:'Study notes'})[view]||'Overview';
 $('#inbox-count').textContent=state.references.filter(r=>status(r)!=='converted').length;
 const semesters=[...new Set([state.currentSemester,...(state.semesters||[]),...state.courses.map(c=>c.semester)])];
 $('#semester').innerHTML=semesters.map(s=>`<option ${s===state.currentSemester?'selected':''}>${esc(s)}</option>`).join('')+'<option value="__new__">+ New semester…</option>';
 let html;
 if(view==='courses'||view==='archive')html=courseList(view==='archive');
 else if(view==='references')html=library();
 else if(view==='course')html=courseView(id);
 else if(view==='note'){
  const r=state.resources.find(r=>r.id===id);
  html=r?`<a class="back" href="#course/${esc(r.courseId)}">← Back to course</a>`+heading(r.kind,r.title,r.description,button('edit-page','Edit note',r.id))+`<article class="note-body">${esc(r.body)}</article>`:empty('Page not found','Open a study page from a course.');
 } else html=overview();
 $('#main').innerHTML=html+`<div class="mobile-tools"><p class="hint">Courses and uploads are saved in this browser.</p>${button('backup','Export backup','','text-button')}${button('restore','Restore backup','','text-button')}${button('theme','Toggle appearance','','text-button')}<a class="text-button" href="town.html">Tesselate World ↗</a><a class="text-button" href="Tree.html">Fractal tree ↗</a></div>`;
}
function modal(title,description,fields,submit,onSave){
 $('#dialog-content').innerHTML=`<form><div class="dialog-heading"><h2 id="dialog-title">${esc(title)}</h2>${button('close','×','','close')}</div><p class="sub">${esc(description)}</p>${fields}<p class="form-error" role="alert"></p><div class="dialog-actions">${button('close','Cancel')}<button class="primary" type="submit">${esc(submit)}</button></div></form>`;
 $('.close',dialog).setAttribute('aria-label','Close dialog');
 $('form',dialog).onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget, submitButton=$('[type=submit]',form);submitButton.disabled=true;$('.form-error',form).textContent='';
  try{await onSave(new FormData(form),form);dialog.close();render();}catch(err){$('.form-error',form).textContent=err.message;}finally{submitButton.disabled=false;}
 };
 if(!dialog.open)dialog.showModal();
}
function required(data,name){const value=String(data.get(name)||'').trim();if(!value)throw new Error('Please fill in all required fields.');return value;}
function courseEditor(id){
 const c=course(id)||{code:'',name:'',semester:state.currentSemester,description:''};
 modal(id?'Edit course':'Add a course','Give this subject its own home. You can change these details anytime.',`<div class="field-row"><label>Course code<input name="code" maxlength="40" required placeholder="e.g. PHYS 200" value="${esc(c.code)}"></label><label>Semester<input name="semester" maxlength="60" required list="semesters" value="${esc(c.semester)}"><datalist id="semesters">${[...new Set(state.courses.map(c=>c.semester))].map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label></div><label>Course name<input name="name" maxlength="120" required placeholder="e.g. Engineering Physics" value="${esc(c.name)}"></label><label>Description <span class="hint">(optional)</span><textarea name="description" maxlength="500" placeholder="What you’re learning this semester">${esc(c.description)}</textarea></label>`,id?'Save course':'Create course',async data=>{
  const next=copy(state), item={...c,id:id||uid(),code:required(data,'code'),name:required(data,'name'),semester:required(data,'semester'),description:String(data.get('description')).trim()};
  if(next.courses.some(other=>other.id!==item.id&&other.code.toLowerCase()===item.code.toLowerCase()&&other.semester.toLowerCase()===item.semester.toLowerCase()))throw new Error('That course code already exists in this semester.');
  if(id)next.courses[next.courses.findIndex(c=>c.id===id)]=item;else next.courses.push(item);
  await commit(next);location.hash='course/'+item.id;toast(id?'Course updated.':'Course created. Add your first reference or study page.');
 });
}
function semesterEditor(){
 modal('Start a semester','Your existing courses stay available under Past semesters.','<label>Semester name<input name="semester" required maxlength="60" placeholder="e.g. Fall 2026"></label>','Start semester',async data=>{const next=copy(state);next.currentSemester=required(data,'semester');await commit(next);location.hash='overview';toast('Your new semester is ready.');});
}
function uploadEditor(id=''){
 modal('Bring your references in','Upload lecture slides, readings, notes, or problem sets.',`<label>Course<select name="courseId">${courseOptions(id,true)}</select></label><label class="upload-zone">Drop files here or choose files<input name="files" id="upload-files" type="file" multiple required></label><p class="hint">Any file type · Up to 50 MB per file, 100 MB per batch. Originals are stored in this browser, not published to the site.</p><label>Notes <span class="hint">(optional, applied to this batch)</span><textarea name="notes" maxlength="2000" placeholder="e.g. Week 1 — turn into a summary and practice questions"></textarea></label>`,'Upload references',async(data,form)=>{
  const files=[...$('#upload-files',form).files];if(!files.length)throw new Error('Choose at least one file.');
  if(files.some(f=>f.size>50*1024*1024)||files.reduce((sum,f)=>sum+f.size,0)>100*1024*1024)throw new Error('Choose files up to 50 MB each and 100 MB in total.');
  const next=copy(state), newFiles=[];let skipped=0;
  for(const file of files){
   if(next.references.some(r=>!r.builtin&&r.courseId===data.get('courseId')&&r.name===file.name&&r.size===file.size&&r.lastModified===file.lastModified)){skipped++;continue;}
   const id=uid();next.references.push({id,courseId:String(data.get('courseId')),name:file.name,size:file.size,lastModified:file.lastModified,stage:'unused',notes:String(data.get('notes')).trim(),createdAt:new Date().toISOString(),builtin:false});newFiles.push({id,blob:file});
  }
  await commit(next,newFiles);search='';courseFilter='';statusFilter='';tab='references';if(!location.hash.startsWith('#course/'))location.hash='references';toast(`${newFiles.length} reference${newFiles.length===1?'':'s'} saved.${skipped?' '+skipped+' duplicate(s) skipped.':''}`);
 });
 const zone=$('.upload-zone',dialog),input=$('#upload-files');
 zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));
 zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');if(e.dataTransfer.files.length)input.files=e.dataTransfer.files;});
}
function referenceChecks(courseId,selected){
 const list=state.references.filter(r=>r.courseId===courseId||!r.courseId||selected.includes(r.id));
 return list.length?`<div class="checklist">${list.map(r=>`<label><input type="checkbox" name="referenceIds" value="${esc(r.id)}" ${selected.includes(r.id)?'checked':''}>${esc(r.name)}</label>`).join('')}</div>`:'<p class="hint">No source materials yet. You can upload references and link them later.</p>';
}
function pageEditor(id='',courseId='',referenceId=''){
 if(!state.courses.length){toast('Add a course before creating a study page.');courseEditor();return;}
 const r=state.resources.find(r=>r.id===id)||{title:'',kind:'Study notes',description:'',url:'',body:'',referenceIds:referenceId?[referenceId]:[],courseId:courseId||activeCourses()[0]?.id||state.courses[0].id};
 modal(id?'Edit study page':'Add a study page','Write notes here or link a page you’ve made. Linking sources marks them converted.',`<label>Course<select name="courseId" id="page-course">${courseOptions(r.courseId)}</select></label><label>Title<input name="title" required maxlength="180" value="${esc(r.title)}" placeholder="e.g. Week 1 — key concepts"></label><div class="field-row"><label>Type<select name="kind">${['Study notes','Summary','Quiz','Practice exam','Formula sheet','Lab report','Other'].map(k=>`<option ${r.kind===k?'selected':''}>${k}</option>`).join('')}</select></label><label>Content format<select name="format" id="page-format"><option value="link" ${!r.body?'selected':''}>Link to a page</option><option value="note" ${r.body?'selected':''}>Write a note</option></select></label></div><label id="url-field">Page URL or site path<input name="url" placeholder="https://… or chem/review.html" value="${esc(r.url)}"></label><label id="body-field">Your notes<textarea name="body" rows="9" placeholder="Write or paste your study notes. Plain text is supported.">${esc(r.body)}</textarea></label><label>Description <span class="hint">(optional)</span><input name="description" maxlength="500" value="${esc(r.description)}"></label><div class="field-label">Reference materials used</div><p class="hint">Select the originals you used to make this page.</p><div id="source-checks">${referenceChecks(r.courseId,r.referenceIds)}</div>${id&&!r.builtin?button('delete-page','Delete study page',id,'text-button danger'):''}`,id?'Save study page':'Add study page',async data=>{
  const next=copy(state),format=data.get('format'), item={...r,id:id||uid(),title:required(data,'title'),courseId:required(data,'courseId'),kind:String(data.get('kind')),description:String(data.get('description')).trim(),url:format==='link'?safeURL(required(data,'url')):'',body:format==='note'?required(data,'body'):'',referenceIds:data.getAll('referenceIds')};
  if(id)next.resources[next.resources.findIndex(r=>r.id===id)]=item;else next.resources.push(item);
  await commit(next);tab='pages';location.hash='course/'+item.courseId;toast('Study page saved. Linked references are marked converted.');
 });
 const setFormat=()=>{const isNote=$('#page-format').value==='note';$('#url-field').hidden=isNote;$('#body-field').hidden=!isNote;$('[name=url]',dialog).required=!isNote;$('[name=body]',dialog).required=isNote;};
 $('#page-format').onchange=setFormat;setFormat();
 $('#page-course').onchange=()=>{$('#source-checks').innerHTML=referenceChecks($('#page-course').value,[]);};
}
function referenceEditor(id){
 const r=state.references.find(r=>r.id===id);if(!r)return;
 modal('Manage reference',r.name,`<label>Course<select name="courseId">${courseOptions(r.courseId,true)}</select></label><label>Progress when no pages are linked<select name="stage">${['unused','working','unreviewed'].map(s=>`<option value="${s}" ${r.stage===s?'selected':''}>${labels[s]}</option>`).join('')}</select></label><label>Notes<textarea name="notes" maxlength="2000" placeholder="What should you make from this material?">${esc(r.notes)}</textarea></label><div class="field-label">Study pages made from this reference</div><p class="hint">Check each page that uses this source. At least one link marks it converted; removing every link restores the progress above.</p><div class="checklist">${state.resources.filter(p=>p.courseId===r.courseId||p.referenceIds.includes(id)||!r.courseId).map(p=>`<label><input type="checkbox" name="pageIds" value="${esc(p.id)}" ${p.referenceIds.includes(id)?'checked':''}>${esc(p.title)}</label>`).join('')||'<p class="hint">No study pages in this course yet.</p>'}</div><div class="actions" style="margin-top:15px">${button('page-from-reference','+ Create study page',id,'small')}${!r.builtin?button('delete-reference','Delete reference',id,'text-button danger'):''}</div>`,'Save reference',async data=>{
  const next=copy(state),item=next.references.find(r=>r.id===id);item.courseId=String(data.get('courseId'));item.stage=String(data.get('stage'));item.notes=String(data.get('notes')).trim();
  const selected=data.getAll('pageIds');for(const page of next.resources){page.referenceIds=page.referenceIds.filter(ref=>ref!==id);if(selected.includes(page.id))page.referenceIds.push(id);}
  await commit(next);toast('Reference updated.');
 });
}
function confirmDelete(type,id){
 const item=(type==='page'?state.resources:state.references).find(r=>r.id===id);if(!item||item.builtin)return;
 modal('Delete '+(type==='page'?'study page':'reference'),`“${item.title||item.name}” will be removed from this browser.`,type==='page'?'<p class="notice">Source files stay in your library. Any source with no remaining study pages returns to its previous progress.</p>':'<p class="notice">The uploaded original and its links will be removed. Your study pages stay available.</p>','Delete',async()=>{
  const next=copy(state);if(type==='page')next.resources=next.resources.filter(r=>r.id!==id);else{next.references=next.references.filter(r=>r.id!==id);for(const page of next.resources)page.referenceIds=page.referenceIds.filter(r=>r!==id);}
  await commit(next,[],type==='reference'?[id]:[]);toast('Removed from this workspace.');
 });
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
async function downloadReference(id){const r=state.references.find(r=>r.id===id);const blob=await read('files',id);if(!blob)throw new Error('This file is missing from browser storage. Restore a backup containing the original.');downloadBlob(blob,r.name);}
function toDataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});}
async function backup(){
 toast('Preparing backup, including uploaded originals…');
 const snapshot=await new Promise((resolve,reject)=>{const tx=db.transaction(['state','files']),s=tx.objectStore('state').get('workspace'),keys=tx.objectStore('files').getAllKeys(),values=tx.objectStore('files').getAll();tx.oncomplete=()=>resolve({state:s.result,files:new Map(keys.result.map((key,i)=>[key,values.result[i]]))});tx.onerror=()=>reject(tx.error);});
 const files=[];for(const ref of snapshot.state.references.filter(r=>!r.url)){const blob=snapshot.files.get(ref.id);if(!blob)throw new Error('A reference file is missing. Backup was not exported.');files.push({id:ref.id,data:await toDataURL(blob)});}
 downloadBlob(new Blob([JSON.stringify({format:'tesselate-workspace',version:1,exportedAt:new Date().toISOString(),state:snapshot.state,files})],{type:'application/json'}),'tesselate-backup-'+new Date().toISOString().slice(0,10)+'.json');toast('Backup exported with your courses, tracking, and uploaded files.');
}
function validateBackup(data){
 const fail=()=>{throw new Error('This is not a valid Tesselate backup. No data has been changed.');};
 if(data?.format!=='tesselate-workspace'||data.version!==1||!data.state||!Array.isArray(data.files))fail();
 const s=data.state;
 if(typeof s.currentSemester!=='string'||!s.currentSemester.trim())fail();
 for(const key of ['courses','resources','references'])if(!Array.isArray(s[key])||new Set(s[key].map(x=>x?.id)).size!==s[key].length)fail();
 const strings=(x,keys)=>keys.every(k=>typeof x?.[k]==='string');
 for(const c of s.courses)if(!strings(c,['id','code','name','semester'])||!c.id||!c.code.trim()||!c.name.trim()||!c.semester.trim())fail();
 const courseIds=new Set(s.courses.map(c=>c.id)),refIds=new Set(s.references.map(r=>r.id));
 for(const r of s.references){if(!strings(r,['id','courseId','name','stage','notes','createdAt'])||!r.id||!['unused','working','unreviewed'].includes(r.stage)||!Number.isFinite(r.size)||r.size<0||(r.courseId&&!courseIds.has(r.courseId)))fail();if(r.url)safeURL(r.url);}
 for(const p of s.resources){if(!strings(p,['id','courseId','title','kind','url','body','description'])||!p.id||!courseIds.has(p.courseId)||!Array.isArray(p.referenceIds)||p.referenceIds.some(id=>!refIds.has(id)))fail();if(!p.body)safeURL(p.url);}
 if(new Set(data.files.map(f=>f.id)).size!==data.files.length)fail();
 const files=data.files.map(f=>{
  if(!refIds.has(f.id)||typeof f.data!=='string'||!/^data:[^,]*;base64,[A-Za-z0-9+/=]*$/.test(f.data))fail();
  const [header,base64]=f.data.split(','),bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
  const reference=s.references.find(r=>r.id===f.id);if(reference.url||bytes.length!==reference.size)fail();
  return {id:f.id,blob:new Blob([bytes],{type:header.slice(5).split(';')[0]})};
 });
 if(s.references.some(r=>!r.url&&!files.some(f=>f.id===r.id)))fail();
 return {state:s,files};
}
async function restore(file){
 if(!file)return;
 let parsed;try{parsed=JSON.parse(await file.text());}catch{throw new Error('Could not read this JSON backup. No data has been changed.');}
 const imported=validateBackup(parsed);
 modal('Restore workspace backup',`${imported.state.courses.length} courses, ${imported.state.resources.length} study pages, and ${imported.state.references.length} references.`,`<p class="notice">This merges the backup into this browser. Matching entries are updated from the backup; other entries are kept. Uploaded originals are included. The active semester becomes ${esc(imported.state.currentSemester)}.</p>`,'Restore backup',async()=>{
  const next=copy(state);for(const key of ['courses','resources','references']){const map=new Map(next[key].map(item=>[item.id,item]));for(const item of imported.state[key])map.set(item.id,item);next[key]=[...map.values()];}
  next.currentSemester=imported.state.currentSemester;await commit(next,imported.files);location.hash='overview';toast('Backup restored.');
 });
}
document.addEventListener('click',async event=>{
 const el=event.target.closest('[data-action]');if(!el||!state)return;const {action,id}=el.dataset;
 try{
  if(action==='close')dialog.close();
  else if(action==='add-course')courseEditor();
  else if(action==='edit-course')courseEditor(id);
  else if(action==='upload')uploadEditor(id);
  else if(action==='add-page')pageEditor('',id);
  else if(action==='edit-page')pageEditor(id);
  else if(action==='edit-reference')referenceEditor(id);
  else if(action==='page-from-reference'){
   const data=new FormData($('form',dialog)),next=copy(state),item=next.references.find(r=>r.id===id);
   item.courseId=String(data.get('courseId'));item.notes=String(data.get('notes')).trim();item.stage=String(data.get('stage'));
   const selected=data.getAll('pageIds');for(const p of next.resources){p.referenceIds=p.referenceIds.filter(ref=>ref!==id);if(selected.includes(p.id))p.referenceIds.push(id);}
   await commit(next);dialog.close();pageEditor('',item.courseId,id);
  }
  else if(action==='delete-page')confirmDelete('page',id);
  else if(action==='delete-reference')confirmDelete('reference',id);
  else if(action==='download')await downloadReference(id);
  else if(action==='tab-pages'||action==='tab-references'){tab=action.slice(4);search='';courseFilter='';statusFilter='';render();}
  else if(action==='theme'){const dark=document.body.classList.toggle('dark');try{localStorage.setItem('chem-theme',dark?'dark':'light');}catch{}$('#theme-label').textContent=dark?'Light appearance':'Dark appearance';}
  else if(action==='backup'){el.disabled=true;try{await backup();}finally{el.disabled=false;}}
  else if(action==='restore')$('#restore-file').click();
 }catch(error){toast(error.message);}
});
document.addEventListener('input',event=>{
 if(event.target.id==='reference-search'){search=event.target.value;$('#reference-results').innerHTML=referenceResults(location.hash.startsWith('#course/')?location.hash.slice(8):'');}
 if(event.target.id==='course-search'){search=event.target.value;$('#course-results').innerHTML=courseResults(state.courses.filter(c=>location.hash==='#archive'?c.semester!==state.currentSemester:c.semester===state.currentSemester));}
});
document.addEventListener('change',async event=>{
 try{
  if(event.target.id==='semester'){if(event.target.value==='__new__'){render();semesterEditor();}else{const next=copy(state);next.currentSemester=event.target.value;await commit(next);render();}}
  if(event.target.id==='course-filter'||event.target.id==='status-filter'){courseFilter=$('#course-filter')?.value||'';statusFilter=$('#status-filter').value;$('#reference-results').innerHTML=referenceResults(location.hash.startsWith('#course/')?location.hash.slice(8):'');}
  if(event.target.id==='restore-file'){const file=event.target.files[0];event.target.value='';await restore(file);}
 }catch(error){toast(error.message);}
});
window.addEventListener('hashchange',()=>{if(!state)return;search='';courseFilter='';statusFilter='';tab='pages';render();window.scrollTo(0,0);});
async function init(){
 try{
  try{document.body.classList.toggle('dark',localStorage.getItem('chem-theme')==='dark');}catch{}
  $('#theme-label').textContent=document.body.classList.contains('dark')?'Light appearance':'Dark appearance';
  db=await openDB();state=await read('state','workspace');
  if(!state){const year=new Date().getFullYear(),month=new Date().getMonth(),season=month<4?'Winter':month<8?'Summer':'Fall';await commit({version:1,currentSemester:season+' '+year,courses:copy(catalog.courses),resources:copy(catalog.resources),references:copy(catalog.references)});}
  else {const next=copy(state);let changed=false;for(const key of ['courses','resources','references'])for(const item of catalog[key])if(!next[key].some(x=>x.id===item.id)){next[key].push(copy(item));changed=true;}if(changed)await commit(next);}
  render();
 }catch(error){$('#main').innerHTML=empty('Your workspace couldn’t open.',error.message+' Enable browser storage and reload. Existing study pages are still available.')+`<div class="course-grid">${catalog.courses.map(c=>`<a class="course-card" href="${esc(catalog.resources.find(r=>r.courseId===c.id).url)}"><h3>${esc(c.name)}</h3><span>Open existing study pages ↗</span></a>`).join('')}</div>`;}
}
init();
})();

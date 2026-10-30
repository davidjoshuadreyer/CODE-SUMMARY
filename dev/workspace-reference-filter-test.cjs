// Exercise the actual input/change event handlers with course-tab routes.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../assets/workspace/workspace.js'),'utf8');
const start=source.indexOf("document.addEventListener('input',event=>{");
const end=source.indexOf("window.addEventListener('hashchange'",start);
assert.ok(start>=0&&end>start);
const listeners={},elements={'#reference-results':{innerHTML:''},'#status-filter':{value:''},'#course-filter':{value:''}};
const rows=[{courseId:'phys210',name:'Textbook Capacitor report',stage:'working'},{courseId:'phys210',name:'Other report',stage:'unused'},{courseId:'other',name:'Textbook Capacitor elsewhere',stage:'working'}];
const ctx={search:'',courseFilter:'',statusFilter:'',location:{hash:'#course/phys210/references'},document:{addEventListener:(name,fn)=>listeners[name]=fn},$:id=>elements[id],toast:message=>{throw Error(message)}};
ctx.referenceResults=id=>rows.filter(r=>(!id||r.courseId===id)&&(!ctx.courseFilter||r.courseId===ctx.courseFilter)&&(!ctx.statusFilter||r.stage===ctx.statusFilter)&&r.name.toLowerCase().includes(ctx.search.toLowerCase())).map(r=>r.name).join('|');
vm.runInNewContext(source.slice(start,end),ctx);
(async()=>{
listeners.input({target:{id:'reference-search',value:'Textbook Capacitor'}});
assert.equal(elements['#reference-results'].innerHTML,'Textbook Capacitor report');
elements['#status-filter'].value='working';await listeners.change({target:{id:'status-filter'}});
assert.equal(elements['#reference-results'].innerHTML,'Textbook Capacitor report');
elements['#status-filter'].value='unused';await listeners.change({target:{id:'status-filter'}});
assert.equal(elements['#reference-results'].innerHTML,'');
ctx.location.hash='#references';elements['#status-filter'].value='';await listeners.change({target:{id:'status-filter'}});
assert.equal(elements['#reference-results'].innerHTML,'Textbook Capacitor report|Textbook Capacitor elsewhere');
elements['#course-filter'].value='phys210';await listeners.change({target:{id:'course-filter'}});
assert.equal(elements['#reference-results'].innerHTML,'Textbook Capacitor report');
console.log('PASS course reference search/status filtering and global library course filtering');
})().catch(e=>{console.error(e);process.exitCode=1;});

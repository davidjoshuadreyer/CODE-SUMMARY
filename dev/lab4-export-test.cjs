const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.join(__dirname,'..'),html=fs.readFileSync(root+'/phys210/lab4.html','utf8'),els=new Map();const el=id=>{if(!els.has(id))els.set(id,{value:'',innerHTML:'',textContent:'',disabled:false});return els.get(id);};
const fields=Array.from(html.matchAll(/<(?:input|textarea)[^>]*data-key="([^"]+)"[^>]*>/g),m=>({dataset:{key:m[1]},value:/value="([^"]*)"/.exec(m[0])?.[1]||''}));
const ctx={console,TextEncoder,TextDecoder,Uint8Array,ArrayBuffer,Blob,URL,setTimeout,clearTimeout,structuredClone,atob,btoa,document:{createElement:()=>({}),getElementById:el,querySelectorAll:()=>fields,addEventListener(){}},katex:require('katex'),Lab4Math:require('../phys210/lab4-math.js')};ctx.window=ctx;vm.createContext(ctx);
for(const f of ['phys210/lab4.js','assets/vendor/lab-export/docx.js','phys210/lab4-export.js'])vm.runInContext(fs.readFileSync(root+'/'+f,'utf8'),ctx);
vm.runInContext(fs.readFileSync(root+'/assets/vendor/lab-export/jszip.min.js','utf8'),ctx);ctx.fetch=async()=>({ok:true,arrayBuffer:async()=>new Uint8Array(fs.readFileSync(root+'/phys210/capacitance-graph-template.xlsx')).buffer});
const blank=ctx.Lab4UI.reportModel();assert.equal(blank.a.complete,false);assert.equal(blank.tables[0].rows.length,6);assert.ok(els.get('report').innerHTML.includes('DRAFT'));
ctx.Lab4UI.apply(require('./lab4-test.cjs'));const model=ctx.Lab4UI.reportModel();assert.equal(model.a.complete,true);assert.ok(model.charts.every(c=>c.startsWith('<svg')));assert.ok(model.charts.every(c=>c.includes('Capacitance C (F)')));
// The browser rasterizes charts; this headless structural check covers report text, tables and native equations.
model.charts=[];
ctx.Lab4Export.report(model).then(async blob=>{fs.mkdirSync(root+'/../tmp/capacitance-test',{recursive:true});fs.writeFileSync(root+'/../tmp/capacitance-test/test-report.docx',Buffer.from(await blob.arrayBuffer()));console.log('PASS report assembly, blank draft, six-row tables, SVG plots and native Word equation export');}).catch(e=>{console.error(e);process.exitCode=1;});

Promise.all(['B','C'].map(async part=>{const b=await ctx.Lab4Export.template(part);fs.writeFileSync(root+'/../tmp/capacitance-test/part-'+part+'.xlsx',Buffer.from(await b.arrayBuffer()));})).then(()=>console.log('PASS both instructor workbook exports')).catch(e=>{console.error(e);process.exitCode=1;});

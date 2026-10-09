const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const rows=new Map();let conflict=false,fail=false,currentUser={id:'a',email:'a@example.test'},authCallback;
const client={auth:{getSession:async()=>({data:{session:currentUser?{user:currentUser}:null}}),onAuthStateChange:cb=>{authCallback=cb;}},from(){
 let filters=[],op='read',payload,ignore=false;
 const query={select(){return this;},eq(k,v){filters.push([k,v]);return this;},update(v){op='update';payload=v;return this;},upsert(v,opts){op='insert';payload=v;ignore=opts.ignoreDuplicates;return this;},
  async maybeSingle(){if(fail)return {error:{message:'offline'}};return {data:structuredClone(rows.get(filters.find(x=>x[0]==='user_id')[1])||null)};},
  then(resolve,reject){return Promise.resolve().then(()=>{
   if(fail)return {error:{message:'offline'}};
   if(op==='insert'){assert.equal(ignore,true);if(rows.has(payload.user_id))return {data:[]};rows.set(payload.user_id,structuredClone(payload));return {data:[{user_id:payload.user_id}]};}
   const owner=filters.find(x=>x[0]==='user_id')[1],old=rows.get(owner);
   if(conflict){conflict=false;old.progress_json.otherPage={value:'concurrent'};old.updated_at='2099-01-01T00:00:00.000Z';return {data:[]};}
   if(old.updated_at!==filters.find(x=>x[0]==='updated_at')[1])return {data:[]};
   rows.set(owner,{...old,...structuredClone(payload)});return {data:[{user_id:owner}]};
  }).then(resolve,reject);}
 };return query;
}};
const root=require('node:path').resolve(__dirname,'..');
function api(){const ctx={window:{},structuredClone,Date,Error};vm.runInNewContext(fs.readFileSync(root+'/assets/account-progress.js','utf8'),ctx);return ctx.window.TesselateProgress;}
const wait=()=>new Promise(r=>setTimeout(r,15));
async function bench(storage=new Map()){
 const els=new Map(),timers=new Map();let serial=0,shown;
 const element=id=>{if(!els.has(id))els.set(id,{textContent:'',hidden:false,disabled:false});return els.get(id);};
 const context={console,structuredClone,Date,Error,Object,Number,JSON,Set,confirm:()=>true,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{hidden:false,getElementById:element,querySelectorAll:()=>[],addEventListener(){}},
  setTimeout:(fn,ms)=>{if(ms===0){Promise.resolve().then(fn);return 0;}timers.set(++serial,fn);return serial;},clearTimeout:id=>timers.delete(id),
  supabase:{createClient:()=>client},TesselateProgress:api(),
  Lab7UI:{clean:data=>({...data}),apply:(data,step)=>{shown={data:{...data},step};}},addEventListener(){}
 };context.window=context;vm.runInNewContext(fs.readFileSync(root+'/phys210/lab7-account.js','utf8'),context);await wait();
 return {context,els,storage,get shown(){return shown;},async flush(){const list=[...timers.values()];timers.clear();for(const fn of list)await fn();await wait();}};
}
(async()=>{
 const p=api();await p.mutate(client,'a',x=>({...x,quiz:{c:2,w:1}}));
 conflict=true;await p.mutate(client,'a',x=>({...x,__phys210_lab7:{version:1,readings:{o12v:'4'},step:2}}));
 assert.equal(rows.get('a').progress_json.otherPage.value,'concurrent');assert.equal(rows.get('a').progress_json.quiz.c,2);
 await assert.rejects(()=>p.mutate(client,'a',x=>x,()=>false),/Account changed/);
 console.log('PASS CAS conflicts, first-row insert, unrelated progress preservation, account-change guard');
 let b=await bench();assert.equal(b.shown.data.o12v,'4');assert.equal(b.shown.step,2);
 b.context.Lab7Account.capture({o12v:'4.1',done1:true},3);await b.flush();
 assert.equal(rows.get('a').progress_json.__phys210_lab7.readings.o12v,'4.1');assert.equal(rows.get('a').progress_json.__phys210_lab7.step,3);
 assert.match(b.els.get('saveStatus').textContent,/Saved to your account/);
 currentUser={id:'b',email:'b@example.test'};authCallback('SIGNED_IN',{user:currentUser});await wait();
 assert.equal(b.shown.data.o12v,undefined);b.context.Lab7Account.capture({o12v:'5'},1);await b.flush();
 assert.equal(rows.get('b').progress_json.__phys210_lab7.readings.o12v,'5');assert.equal(rows.get('a').progress_json.__phys210_lab7.readings.o12v,'4.1');
 currentUser=null;authCallback('SIGNED_OUT',null);await wait();assert.equal(b.shown.data.o12v,undefined);
 console.log('PASS remote restore, readings and step save, account isolation and sign-out clearing');
 currentUser={id:'a',email:'a@example.test'};authCallback('SIGNED_IN',{user:currentUser});await wait();
 fail=true;b.context.Lab7Account.capture({o12v:'4.2'},4);await b.flush();assert.match(b.els.get('saveStatus').textContent,/pending/);
 const saved=b.storage;b=await bench(saved);assert.equal(b.shown.data.o12v,'4.2');
 fail=false;await b.els.get('retryAccount').onclick();assert.equal(rows.get('a').progress_json.__phys210_lab7.readings.o12v,'4.2');
 assert.equal(rows.get('a').progress_json.quiz.c,2);
 console.log('PASS offline draft persistence, reload and retry; quiz progress retained');
 // Verify every inline script parses after adding the integration hooks.
 for(const file of ['phys210/lab7.html','chem/quiz.html','matrix/quiz.html']){
  const html=fs.readFileSync(root+'/'+file,'utf8');for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 }
 console.log('PASS integrated page scripts parse');
})().catch(e=>{console.error(e);process.exitCode=1;});

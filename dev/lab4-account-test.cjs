const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const rows=new Map();let conflict=false,fail=false,currentUser={id:'a',email:'a@example.test'},authCallback,hangSession=false,hangRead=false;
const client={auth:{getSession:async()=>hangSession?new Promise(()=>{}):({data:{session:currentUser?{user:currentUser}:null}}),onAuthStateChange:cb=>{authCallback=cb;}},from(){
 let filters=[],op='read',payload,ignore=false;
 const query={select(){return this;},eq(k,v){filters.push([k,v]);return this;},update(v){op='update';payload=v;return this;},upsert(v,opts){op='insert';payload=v;ignore=opts.ignoreDuplicates;return this;},
  async maybeSingle(){if(hangRead)return new Promise(()=>{});if(fail)return {error:{message:'offline'}};return {data:structuredClone(rows.get(filters.find(x=>x[0]==='user_id')[1])||null)};},
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
 const els=new Map(),timers=new Map();let serial=0,shown;const fields=[{disabled:false}];
 const element=id=>{if(!els.has(id))els.set(id,{textContent:'',hidden:false,disabled:false});return els.get(id);};
 const context={console,structuredClone,Date,Error,Object,Number,JSON,Set,confirm:()=>true,
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{hidden:false,getElementById:element,querySelectorAll:()=>fields,addEventListener(){}},
  setTimeout:(fn,ms)=>{if(ms===0){Promise.resolve().then(fn);return 0;}timers.set(++serial,{fn,ms});return serial;},clearTimeout:id=>timers.delete(id),
  supabase:{createClient:()=>client},TesselateProgress:api(),
  Lab4UI:{clean:data=>({...data}),apply:(data,step)=>{shown={data:{...data},step};}},addEventListener(){}
 };context.window=context;vm.runInNewContext(fs.readFileSync(root+'/phys210/lab4-account.js','utf8'),context);await wait();
 return {context,els,storage,fields,async expire(){for(const [id,t] of [...timers])if(t.ms===8000){timers.delete(id);t.fn();}await wait();},get shown(){return shown;},async flush(){const list=[...timers.values()];timers.clear();for(const t of list)await t.fn();await wait();}};
}
(async()=>{
 const p=api();await p.mutate(client,'a',x=>({...x,quiz:{c:2,w:1}}));
 conflict=true;await p.mutate(client,'a',x=>({...x,__phys210_lab4:{version:1,readings:{o12v:'4'},step:2}}));
 assert.equal(rows.get('a').progress_json.otherPage.value,'concurrent');assert.equal(rows.get('a').progress_json.quiz.c,2);
 await assert.rejects(()=>p.mutate(client,'a',x=>x,()=>false),/Account changed/);
 console.log('PASS CAS conflicts, first-row insert, unrelated progress preservation, account-change guard');
 let b=await bench();assert.equal(b.shown.data.o12v,'4');assert.equal(b.shown.step,2);
 b.context.Lab4Account.capture({o12v:'4.1',done1:true},3);await b.flush();
 assert.equal(rows.get('a').progress_json.__phys210_lab4.readings.o12v,'4.1');assert.equal(rows.get('a').progress_json.__phys210_lab4.step,3);
 assert.match(b.els.get('saveStatus').textContent,/Saved to your account/);
 currentUser={id:'b',email:'b@example.test'};authCallback('SIGNED_IN',{user:currentUser});await wait();
 assert.equal(b.shown.data.o12v,undefined);b.context.Lab4Account.capture({o12v:'5'},1);await b.flush();
 assert.equal(rows.get('b').progress_json.__phys210_lab4.readings.o12v,'5');assert.equal(rows.get('a').progress_json.__phys210_lab4.readings.o12v,'4.1');
 currentUser=null;authCallback('SIGNED_OUT',null);await wait();assert.equal(b.shown.data.o12v,undefined);
 console.log('PASS remote restore, readings and step save, account isolation and sign-out clearing');
 currentUser={id:'a',email:'a@example.test'};authCallback('SIGNED_IN',{user:currentUser});await wait();
 fail=true;b.context.Lab4Account.capture({o12v:'4.2'},4);await b.flush();assert.match(b.els.get('saveStatus').textContent,/pending/);
 const saved=b.storage;b=await bench(saved);assert.equal(b.shown.data.o12v,'4.2');
 fail=false;await b.els.get('retryAccount').onclick();assert.equal(rows.get('a').progress_json.__phys210_lab4.readings.o12v,'4.2');
 assert.equal(rows.get('a').progress_json.quiz.c,2);
 console.log('PASS offline draft persistence, reload and retry; quiz progress retained');
 // A hanging auth request must unlock the form and preserve a device draft.
 hangSession=true;b=await bench();assert.equal(b.fields[0].disabled,true);await b.expire();
 assert.equal(b.fields[0].disabled,false);assert.equal(b.els.get('load').disabled,false);
 assert.match(b.els.get('saveStatus').textContent,/enter measurements now/);
 b.context.Lab4Account.capture({o12v:'8.5'},0);
 assert.equal(JSON.parse(b.storage.get('phys210-lab4-account-v1:guest')).draft.o12v,'8.5');
 assert.equal(b.els.get('retryAccount').hidden,false);
 await b.expire();hangSession=false;await b.els.get('retryAccount').onclick();
 assert.equal(b.shown.data.o12v,'4.2');assert.equal(b.els.get('adoptLocal').hidden,false);
 // A hanging account read must preserve the owner's cached draft and pending edits.
 hangRead=true;b=await bench(saved);assert.equal(b.fields[0].disabled,true);await b.expire();
 assert.equal(b.fields[0].disabled,false);assert.equal(b.shown.data.o12v,'4.2');
 b.context.Lab4Account.capture({o12v:'4.3'},4);
 hangRead=false;await b.els.get('retryAccount').onclick();
 assert.equal(rows.get('a').progress_json.__phys210_lab4.readings.o12v,'4.3');
 console.log('PASS stalled sign-in and account reads unlock; device drafts and retry recovery preserved');
 // Verify every inline script parses after adding the integration hooks.
 for(const file of ['phys210/lab4.html','chem/quiz.html','matrix/quiz.html']){
  const html=fs.readFileSync(root+'/'+file,'utf8');for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
 }
 console.log('PASS integrated page scripts parse');
})().catch(e=>{console.error(e);process.exitCode=1;});

/*
 Tests for the Business Lab cycle client (mocked Supabase) and, when Postgres 16
 is available, the cycle-key SQL itself:
   node dev/business-lab-cycle-test.cjs
   psql -d <scratch db> -f dev/business-lab-cycle-sql-shim.sql -f dev/supabase_study_plan.sql \
        -f dev/supabase_business_lab_cycle.sql -f dev/business-lab-cycle-sql-test.sql
*/
'use strict';
const assert=require('node:assert/strict');
const {loadCore,config,apply,pull}=require('./business-lab-cycle.cjs');
const core=loadCore();
const KEY='bl1_'+'A'.repeat(43);
const cfg=config({BUSINESS_LAB_KEY:KEY});
assert.throws(()=>config({BUSINESS_LAB_KEY:'nope'}),/BUSINESS_LAB_KEY/);
assert.match(cfg.url,/^https:\/\/.+supabase\.co$/);

// In-memory stand-in for the two RPC functions.
let row=null,calls=[],bump=0;
async function fakeFetch(url,opt){
  const body=JSON.parse(opt.body),name=url.split('/rpc/')[1];calls.push(name);
  assert.equal(opt.headers.apikey,cfg.anon);assert.ok(!url.includes(KEY));
  const reply=(status,json)=>({ok:status<300,status,text:async()=>JSON.stringify(json)});
  if(body.p_key!==KEY)return reply(400,{code:'28000',message:'Invalid cycle key'});
  if(name==='business_lab_cycle_read')return reply(200,row?{revision:row.revision,value:row.value}:{revision:0,value:null});
  if(name==='business_lab_cycle_write'){
    if(bump){bump--;row={revision:(row?.revision||0)+1,value:row?row.value:core.emptyLab()};}
    if((row?.revision||0)!==body.p_revision)return reply(400,{code:'40001',message:'Lab changed since it was read'});
    row={revision:body.p_revision+1,value:JSON.parse(JSON.stringify(body.p_value))};return reply(200,row.revision);
  }
  return reply(404,{message:'no such function'});
}
const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Vancouver'});
const score={cost:3,time:2,demand:2,saturation:2,platform:2,upkeep:2};
const round={kind:'round',model:'claude',date:today,cards:[{category:'apps',title:'Practice timer app',pitch:'p',buyer:'b',channel:'c',price:'$3',redFlags:'Passes.',test:'t',day14:'d14',day30:'d30',links:['https://example.com/a'],score}],rejected:[{category:'video',idea:'Clip reuploads',reason:'Copyright'}]};
const quiet={log:()=>{},fetchImpl:fakeFetch};

(async()=>{
  assert.deepEqual(await pull(cfg,core,fakeFetch),{revision:0,value:null});
  // Dry run validates and merges but writes nothing.
  await apply(cfg,core,round,{...quiet,dryRun:true});assert.equal(row,null);assert.ok(!calls.includes('business_lab_cycle_write'));
  // First real apply creates revision 1 with the card, verified by a re-read.
  const first=await apply(cfg,core,round,quiet);assert.equal(first.revision,1);
  assert.equal(row.value.cards.length,1);assert.equal(row.value.cards[0].id,'c-001');assert.equal(row.value.rejected.length,1);
  // ChatGPT reviews Claude's card on the latest saved state.
  await apply(cfg,core,{kind:'review',model:'chatgpt',date:today,reviews:[{id:'c-001',...score,improvement:'Add a free tier.',redFlag:''}]},quiet);
  assert.equal(row.revision,2);assert.equal(row.value.cards[0].scores.chatgpt.improvement,'Add a free tier.');
  // A save from the page lands mid-cycle: the client re-reads and merges again instead of overwriting.
  bump=1;const lines=[];await apply(cfg,core,{kind:'update',model:'claude',date:today,decisions:[{note:'Cycle note.'}]},{fetchImpl:fakeFetch,log:l=>lines.push(l)});
  assert.equal(row.revision,4);assert.ok(lines.some(l=>/changed while saving/.test(l)));assert.ok(row.value.decisions.some(d=>d.note==='[Claude] Cycle note.'));
  // Bad input is refused before anything is written.
  const before=row.revision;
  await assert.rejects(()=>apply(cfg,core,{kind:'review',model:'claude',date:today,reviews:[{id:'c-001',...score}]},quiet),/cannot score its own card/);
  await assert.rejects(()=>apply(cfg,core,{kind:'round',date:today,cards:[]},quiet),/model/);
  await assert.rejects(()=>apply(cfg,core,{schema:2,asOf:today},quiet),/missing/);
  assert.equal(row.revision,before);
  // Wrong key: clear message, key never echoed.
  await assert.rejects(()=>pull({...cfg,key:'bl1_'+'B'.repeat(43)},core,fakeFetch),e=>/refused/.test(e.message)&&!e.message.includes('BBBB'));
  // Persistent conflicts give up instead of looping.
  bump=5;await assert.rejects(()=>apply(cfg,core,{kind:'update',model:'claude',date:today,decisions:[{note:'x'}]},quiet),/kept changing/);
  console.log('PASS: business lab cycle client (pull, dry run, round, review, conflict re-merge, refused input, bad key, retry cap).');
})().catch(e=>{console.error(e);process.exitCode=1;});

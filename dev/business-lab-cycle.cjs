#!/usr/bin/env node
/*
 Business Lab cycle client: lets a scheduled research cycle read and update the
 private Business Lab without anyone copying or pasting.

   BUSINESS_LAB_KEY=bl1_…  node dev/business-lab-cycle.cjs pull [out.json]
   BUSINESS_LAB_KEY=bl1_…  node dev/business-lab-cycle.cjs apply <file.json> [--dry-run]

 pull   prints (or writes) the saved lab, so the cycle starts from the latest state.
 apply  takes exactly what a model would have pasted into the page: a daily round,
        a cross-review, a weekly update, items for the owner's approval queue
        ({"kind": "round" | "review" | "update" | "queue", ...}) or a full lab
        file (schema 1, 2 or 3). It merges it with the page's own code,
        validates it with the page's own validator, and saves it with a revision
        check. If the lab changed in the meantime it re-reads and merges again
        (up to 3 times), so it never overwrites a newer save.

 The key comes from the environment only, never from arguments or files, and is
 never printed. The key can only read and replace the Business Lab record; see
 dev/supabase_business_lab_cycle.sql. Dates follow BUSINESS_LAB_TZ
 (default America/Vancouver), matching the owner's browser.
*/
'use strict';
process.env.TZ=process.env.BUSINESS_LAB_TZ||'America/Vancouver';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ROOT=path.join(__dirname,'..');

// Load the merge and validation code straight from business-lab.html so the
// script and the page can never disagree about the format.
function loadCore(html=fs.readFileSync(path.join(ROOT,'business-lab.html'),'utf8')){
  const start=html.indexOf("'use strict';",html.indexOf('<script>')),end=html.indexOf('/* ---------- prompts the page hands to each model');
  if(start<0||end<start)throw new Error('Could not find the lab code in business-lab.html.');
  const ctx={location:{protocol:'https:'},document:{getElementById:()=>null},console,URL};
  vm.createContext(ctx);
  vm.runInContext(html.slice(start,end)+'\n;globalThis.__lab={lab,loadLab,merge,extractJSON,emptyLab,MAX_BYTES};',ctx);
  return ctx.__lab;
}
function config(env=process.env){
  const src=fs.readFileSync(path.join(ROOT,'assets/workspace/cloud.js'),'utf8');
  const url=env.SUPABASE_URL||(src.match(/const URL='([^']+)'/)||[])[1],anon=env.SUPABASE_ANON_KEY||(src.match(/const KEY='([^']+)'/)||[])[1];
  const key=env.BUSINESS_LAB_KEY||'';
  if(!url||!anon)throw new Error('Supabase URL or public key not found.');
  if(!/^bl1_[A-Za-z0-9_-]{40,}$/.test(key))throw new Error('Set BUSINESS_LAB_KEY to the cycle key from Business Lab (Backup, restore and full replace → Create cycle key).');
  return {url:url.replace(/\/$/,''),anon,key};
}
async function rpc(cfg,name,body,fetchImpl=fetch){
  const res=await fetchImpl(cfg.url+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:cfg.anon,authorization:'Bearer '+cfg.anon,'content-type':'application/json',accept:'application/json'},body:JSON.stringify({p_key:cfg.key,...body})});
  const text=await res.text();let json=null;try{json=text?JSON.parse(text):null;}catch{}
  if(!res.ok){
    const code=json?.code,msg=json?.message||text.slice(0,200);
    const err=new Error(code==='28000'?'The cycle key was refused. Create a new one in Business Lab.':code==='40001'?'conflict':'Supabase '+res.status+': '+msg);
    err.code=code;throw err;
  }
  return json;
}
async function pull(cfg,core,fetchImpl){
  const row=await rpc(cfg,'business_lab_cycle_read',{},fetchImpl);
  if(!row||!Number.isSafeInteger(row.revision)||row.revision<0)throw new Error('Unexpected reply from Supabase.');
  return {revision:row.revision,value:row.value===null?null:core.loadLab(row.value)};
}
async function apply(cfg,core,input,{dryRun=false,fetchImpl,tries=3,log=console.log}={}){
  for(let n=1;n<=tries;n++){
    const cur=await pull(cfg,core,fetchImpl);
    const res=core.merge(cur.value||core.emptyLab(),input);
    const next=core.lab(JSON.parse(JSON.stringify(res.next)));
    if(JSON.stringify(next).length>core.MAX_BYTES)throw new Error('The lab would be over 2.5 MB. Archive old cards first.');
    for(const l of res.lines)log('  '+l);for(const w of res.warn)log('  warning: '+w);
    if(dryRun){log('Dry run: nothing saved (revision '+cur.revision+').');return {revision:cur.revision,next,res};}
    try{
      const revision=await rpc(cfg,'business_lab_cycle_write',{p_value:next,p_revision:cur.revision},fetchImpl);
      const check=await pull(cfg,core,fetchImpl);
      if(check.revision!==revision||JSON.stringify(check.value)!==JSON.stringify(next))throw new Error('The save could not be verified. Pull again before retrying.');
      log('Saved · revision '+revision+'.');return {revision,next,res};
    }catch(e){if(e.message!=='conflict'||n===tries)throw e.message==='conflict'?new Error('The lab kept changing during the save. Try again later.'):e;log('Lab changed while saving. Merging again…');}
  }
}
async function main(argv=process.argv.slice(2)){
  const [cmd,file,...rest]=argv;const core=loadCore();
  if(cmd==='pull'){
    const cfg=config(),row=await pull(cfg,core);const out=JSON.stringify(row.value,null,2);
    if(file){fs.writeFileSync(file,out+'\n');console.error('Wrote revision '+row.revision+' to '+file+'.');}else process.stdout.write(out+'\n');
  }else if(cmd==='apply'&&file){
    const text=fs.readFileSync(file,'utf8');if(text.length>core.MAX_BYTES)throw new Error('The file is over 2.5 MB.');
    const cfg=config();console.log('Applying '+path.basename(file)+':');
    await apply(cfg,core,core.extractJSON(text),{dryRun:rest.includes('--dry-run')});
  }else{console.error('Usage: node dev/business-lab-cycle.cjs pull [out.json] | apply <file.json> [--dry-run]');process.exitCode=2;}
}
module.exports={loadCore,config,rpc,pull,apply};
if(require.main===module)main().catch(e=>{console.error('Error: '+e.message);process.exitCode=1;});

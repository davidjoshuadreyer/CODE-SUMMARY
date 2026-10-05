/* Lab drafts are scoped to an authenticated owner; guest drafts require an
   explicit import. Pending field patches survive reloads and offline failures. */
(() => {
 'use strict';
 const NS='__ecet250_lab5',BASE='ecet250-lab5-account-v1:',GUEST='ecet250-lab5-bench-v1';
 let client,owner=null,epoch=0,timer,ready=false;
 const inFlight=new Set();
 let pending={},draft={},step=0;
 const label=document.getElementById('accountStatus'),status=document.getElementById('saveStatus');
 const retry=document.getElementById('retryAccount'),adopt=document.getElementById('adoptLocal');
 const hasData=o=>Object.values(o||{}).some(v=>v!==''&&v!==false&&v!==null);
 const guestReadings=()=>get(BASE+'guest')?.draft||get(GUEST)||{};
 const get=k=>{try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}};
 function persist(){try{localStorage.setItem(BASE+(owner||'guest'),JSON.stringify({draft,pending,step}));return true;}catch{status.textContent='Device storage unavailable. Download a readings backup; retry the account save.';return false;}}
 function message(text){status.textContent=text;}
 function lock(value){document.querySelectorAll('[data-key]').forEach(el=>el.disabled=value);document.getElementById('load').disabled=value;}
 function apply(data){draft=Lab5UI.clean(data||{});Lab5UI.apply(draft,step);}
 function schedule(){clearTimeout(timer);if(owner&&ready){message('Saved on this device · saving to your account…');timer=setTimeout(flush,900);}else message('Saved on this device · sign in to sync across devices.');}
 async function flush(){
  if(!owner||!ready||inFlight.has(epoch))return;
  const who=owner,token=epoch,patch=structuredClone(pending);
  if(!Object.keys(patch).length){message('Saved to your account.');return;}
  inFlight.add(token);message('Saving to your account…');
  try{
   const saved=await TesselateProgress.mutate(client,who,all=>{
    const old=all[NS]||{};
    all[NS]={version:1,readings:{...(old.readings||{}),...(patch.readings||{})},step:patch.step??old.step??0};return all;
   },()=>owner===who&&epoch===token);
   if(owner!==who||epoch!==token)return;
   // Clear only values that were actually saved; retain edits made in flight.
   for(const [k,v] of Object.entries(patch.readings||{}))if(pending.readings?.[k]===v)delete pending.readings[k];
   if(pending.readings&&!Object.keys(pending.readings).length)delete pending.readings;
   if(pending.step===patch.step)delete pending.step;
   const remaining=Object.keys(pending).length;
   apply({...saved[NS].readings,...(pending.readings||{})});persist();
   message(remaining?'Saved on this device · more changes waiting to sync.':'Saved to your account.');
  }catch(e){if(owner===who&&epoch===token)message('Account save pending · '+e.message+' Use Retry sync or save a backup.');}
  finally{inFlight.delete(token);if(owner===who&&epoch===token&&Object.keys(pending).length&&status.textContent.startsWith('Saved on this device'))schedule();}
 }
 async function activate(user,force=false){
  const next=user?.id||null;if(!force&&ready&&next===owner)return;
  epoch++;const token=epoch;clearTimeout(timer);ready=false;owner=next;lock(true);
  label.textContent=user?'Signed in as '+(user.email||'your account'):'Not signed in';
  retry.hidden=!user;adopt.hidden=!user||!hasData(guestReadings());
  const local=get(BASE+(owner||'guest'))||{};
  draft=local.draft||{};pending=local.pending||{};step=local.step||0;
  if(!owner){apply(local.draft||get(GUEST)||{});ready=true;lock(false);message('Saved on this device · sign in through the course workspace to sync.');return;}
  apply(draft);message('Loading your account progress…');
  try{
   const row=await TesselateProgress.read(client,owner);
   if(token!==epoch)return;
   const saved=row?.progress_json?.[NS]||{};
   step=pending.step??saved.step??step;
   apply({...saved.readings,...(pending.readings||{})});persist();
   ready=true;lock(false);
   if(Object.keys(pending).length)await flush();else message('Account progress loaded · changes save automatically.');
  }catch(e){if(token===epoch){ready=true;lock(false);message('Could not load account progress · '+e.message+' Local edits will be kept until Retry sync succeeds.');}}
 }
 window.Lab5Account={
  capture(values,currentStep){
   if(!ready)return;
   const clean=Lab5UI.clean(values);
   const changes={};for(const [k,v] of Object.entries(clean))if(draft[k]!==v)changes[k]=v;
   if(Object.keys(changes).length)pending.readings={...(pending.readings||{}),...changes};
   if(currentStep!==step)pending.step=currentStep;
   draft=clean;step=currentStep;persist();schedule();
  }
 };
 retry.onclick=async()=>{if(!ready)return;const {data,error}=await client.auth.getSession();if(error){message(error.message);return;}await activate(data.session?.user||null,true);};
 adopt.onclick=()=>{
  if(!ready||!owner)return;
  if(!confirm('Copy this device’s earlier local Lab 5 readings into the signed-in account? Matching fields will replace that account’s readings.'))return;
  const imported=Lab5UI.clean(guestReadings());
  const merged={...draft,...imported};Lab5Account.capture(merged,step);apply(merged);
 };
 window.addEventListener('online',()=>flush());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
 window.addEventListener('beforeunload',e=>{if(owner&&Object.keys(pending).length){e.preventDefault();e.returnValue='';}});
 async function init(){
  lock(true);
  try{
   if(!window.supabase||!window.TesselateProgress)throw new Error('Sign-in could not load. Reload when connected.');
   client=window.supabase.createClient('https://xsscvdooviztaxzuwbmr.supabase.co','sb_publishable_BTkvBDZodnIPQoJ4nFEhMQ_Wd5me5QY');
   const {data,error}=await client.auth.getSession();if(error)throw error;
   await activate(data.session?.user||null);
   // Defer work outside the Supabase auth callback lock.
   client.auth.onAuthStateChange((_event,session)=>setTimeout(()=>activate(session?.user||null),0));
  }catch(e){owner=null;ready=true;apply(get(BASE+'guest')?.draft||get(GUEST)||{});lock(false);label.textContent='Account connection unavailable';message(e.message+' Entries are saved on this device.');}
 }
 init();
})();

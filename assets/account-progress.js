/* Shared private progress row. Compare-and-swap prevents unrelated page saves
   from replacing one another. Uses the existing tesselate_progress RLS policies. */
(() => {
 'use strict';
 const table='tesselate_progress';
 const fail=e=>{if(e)throw new Error(e.message||'Account storage is unavailable.');};
 async function read(client,owner){
  const {data,error}=await client.from(table).select('progress_json,updated_at').eq('user_id',owner).maybeSingle();
  fail(error);return data;
 }
 window.TesselateProgress={read,
  async mutate(client,owner,transform,isCurrent=()=>true){
   for(let attempt=0;attempt<8;attempt++){
    if(!isCurrent())throw new Error('Account changed. Your draft is kept on this device.');
    const row=await read(client,owner);
    if(!isCurrent())throw new Error('Account changed. Your draft is kept on this device.');
    const progress=transform(structuredClone(row?.progress_json||{}));
    const updated_at=new Date(Math.max(Date.now(),Date.parse(row?.updated_at||0)+1||0)).toISOString();
    let result;
    if(row)result=await client.from(table).update({progress_json:progress,updated_at}).eq('user_id',owner).eq('updated_at',row.updated_at).select('user_id');
    else result=await client.from(table).upsert({user_id:owner,progress_json:progress,updated_at},{onConflict:'user_id',ignoreDuplicates:true}).select('user_id');
    fail(result.error);
    if(result.data?.length)return progress;
   }
   throw new Error('Another page is saving. Retry to save your draft.');
  }
 };
})();

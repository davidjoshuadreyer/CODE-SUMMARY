const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
let auth,hook,reads=0;
const records={
 tesselate_shared_reference_items:[{key:'reference/phys-manual',value:{pages:471,firstPage:6}},{key:'refpage/phys-manual/76',value:{image:'/9j/SHARED'}}],
 tesselate_study_items:[{user_id:'a',key:'refpage/private-manual/6',value:{image:'/9j/PRIVATE'}}]
};
const client={auth:{getSession:async()=>({data:{session:{user:{id:'a'}}}}),onAuthStateChange:f=>auth=f,signOut:async()=>({})},from(table){const filters=[];return {select(){return this;},eq(k,v){filters.push([k,v]);return this;},async maybeSingle(){reads++;if(hook)hook();return {data:records[table].find(r=>filters.every(([k,v])=>r[k]===v))||null};}};}};
const context={window:{supabase:{createClient:()=>client}}};vm.runInNewContext(fs.readFileSync('assets/workspace/cloud.js','utf8'),context);const c=context.window.TesselateCloud;
(async()=>{
 await c.init(()=>{});
 assert.equal((await c.sharedReferenceManifest('phys-manual')).pages,471);
 assert.equal((await c.referencePage('phys-manual',76,'shared')).image,'/9j/SHARED');
 assert.equal((await c.referencePage('private-manual',6)).image,'/9j/PRIVATE');
 auth('SIGNED_IN',{user:{id:'b'}});
 assert.equal((await c.sharedReferenceManifest('phys-manual')).pages,471);
 assert.equal((await c.referencePage('phys-manual',76,'shared')).image,'/9j/SHARED');
 assert.equal(await c.referencePage('private-manual',6),null);
 assert.equal(await c.sharedReferenceManifest('unknown'),null);
 await assert.rejects(()=>c.referencePage('phys-manual',76,'arbitrary'),/Invalid/);
 hook=()=>auth('SIGNED_IN',{user:{id:'c'}});
 await assert.rejects(()=>c.referencePage('phys-manual',76,'shared'),/Account changed/);
 hook=()=>auth('SIGNED_IN',{user:{id:'d'}});
 await assert.rejects(()=>c.sharedReferenceManifest('phys-manual'),/Account changed/);
 hook=null;await c.signOut();const before=reads;
 await assert.rejects(()=>c.sharedReferenceManifest('phys-manual'),/Sign in/);
 await assert.rejects(()=>c.referencePage('phys-manual',76,'shared'),/Sign in/);
 assert.equal(reads,before);
 console.log('PASS: shared access across accounts, private-page isolation, missing references, account changes and signed-out guard.');
})().catch(e=>{console.error(e);process.exitCode=1;});

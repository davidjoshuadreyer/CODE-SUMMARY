// Adapter contract tests. Live Supabase RLS still requires deployment verification.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {webcrypto}=require('node:crypto');
const snapshots=[],objects=new Map();let owner='account-a',uploadFailure=false,insertFailure=false,corrupt=false,authCallback;
const client={
 auth:{getSession:async()=>({data:{session:{user:{id:owner,email:owner+'@example.test'}}}}),onAuthStateChange:cb=>{authCallback=cb;},signOut:async()=>({}),signInWithOAuth:async()=>({})},
 from(){
  let filters=[];
  const query={select(){return this;},eq(k,v){filters.push([k,v]);return this;},order(){return this;},limit(){return this;},
   then(resolve,reject){return Promise.resolve({data:snapshots.filter(r=>filters.every(([k,v])=>r[k]===v))}).then(resolve,reject);},
   async single(){return {data:snapshots.find(r=>filters.every(([k,v])=>r[k]===v))};},
   async insert(row){if(insertFailure)return {error:{message:'Metadata save failed'}};assert.equal(row.user_id,owner);snapshots.push({...row,created_at:new Date().toISOString()});return {};}
  };return query;
 },
 storage:{from(){return {
  async upload(path,blob,options){assert.equal(path.split('/')[0],owner);assert.equal(options.upsert,false);if(uploadFailure)return {error:{message:'Upload failed'}};if(objects.has(path))return {error:{statusCode:409,message:'Already exists'}};objects.set(path,blob);return {};},
  async download(path){assert.equal(path.split('/')[0],owner);return {data:corrupt?new Blob(['corrupt']):objects.get(path)};}
 };}}
};
function adapter(){const context={window:{supabase:{createClient:()=>client},URL},crypto:webcrypto,structuredClone,Blob,Uint8Array,URL,location:{href:'https://tesselate.ca/'}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/workspace/cloud.js'),'utf8'),context);return context.window.TesselateCloud;}
(async()=>{
 const api=adapter();await api.init(()=>{});
 const state={references:[{id:'ref-1',name:'notes.txt'},{id:'ref-2',name:'same.txt'}],cloudOwner:owner,revision:100};
 const original=new Blob(['Original source bytes'],{type:'text/plain'}),files=new Map([['ref-1',original],['ref-2',original]]);
 const saved=await api.save(state,files);assert.equal(objects.size,1);assert.equal(snapshots.length,1);assert.equal(snapshots[0].workspace.cloudOwner,undefined);assert.equal(snapshots[0].workspace.revision,undefined);
 const loaded=await api.load(saved.id);assert.equal(await loaded.files[0].blob.text(),'Original source bytes');assert.equal(loaded.files.length,2);
 console.log('PASS private paths, file deduplication, and verified round trip');
 const fresh=adapter();await fresh.init(()=>{});await fresh.save(state,files);assert.equal(objects.size,1);assert.equal(snapshots.length,2);
 console.log('PASS duplicate files accepted on a different device');
 uploadFailure=true;await assert.rejects(()=>api.save({references:[{id:'new',name:'new.txt'}]},new Map([['new',new Blob(['New bytes'])]])),/Upload failed/);assert.equal(snapshots.length,2);uploadFailure=false;
 insertFailure=true;await assert.rejects(()=>api.save(state,files),/Metadata save failed/);assert.equal(snapshots.length,2);insertFailure=false;
 await assert.rejects(()=>api.save(state,new Map()),/Original missing/);assert.equal(snapshots.length,2);
 console.log('PASS failures never create incomplete restore points');
 corrupt=true;await assert.rejects(()=>api.load(saved.id),/verification failed/);corrupt=false;
 const oldPath=snapshots[0].files[0].path;snapshots[0].files[0].path='account-b/invalid';await assert.rejects(()=>api.load(saved.id),/Invalid file path/);snapshots[0].files[0].path=oldPath;
 owner='account-b';await fresh.init(()=>{});assert.equal((await fresh.list()).length,0);await fresh.save(state,files);assert.equal(objects.size,2);
 await fresh.signOut();await assert.rejects(()=>fresh.save(state,files),/Sign in/);
 console.log('PASS corruption, cross-account paths, account filtering, and signed-out access checks');
})().catch(err=>{console.error(err);process.exitCode=1;});

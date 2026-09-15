/* Private originals + append-only workspace restore points in Supabase. */
(() => {
 'use strict';
 const URL='https://xsscvdooviztaxzuwbmr.supabase.co';
 const KEY='sb_publishable_BTkvBDZodnIPQoJ4nFEhMQ_Wd5me5QY';
 const TABLE='tesselate_workspace_snapshots',BUCKET='workspace-references';
 let client, user=null;
 const knownFiles=new Set();
 const fail=error=>{if(error)throw new Error(error.message||'Online storage is unavailable.');};
 const needUser=()=>{if(!user)throw new Error('Sign in to use online storage.');return user.id;};
 async function hash(blob){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))].map(n=>n.toString(16).padStart(2,'0')).join('');}
 window.TesselateCloud={
  get user(){return user;},
  async init(onChange){
   if(!window.supabase)throw new Error('Sign-in could not load. Check your connection and reload.');
   client=window.supabase.createClient(URL,KEY);
   const {data,error}=await client.auth.getSession();fail(error);user=data.session?.user||null;
   client.auth.onAuthStateChange((_event,session)=>{user=session?.user||null;onChange(user);});
   return user;
  },
  async signIn(){const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:new window.URL('index.html',location.href).href.split('#')[0]}});fail(error);},
  async signOut(){const {error}=await client.auth.signOut();fail(error);user=null;},
  async list(){const owner=needUser();const {data,error}=await client.from(TABLE).select('id,created_at').eq('user_id',owner).order('created_at',{ascending:false}).limit(20);fail(error);return data;},
  async save(workspace,localFiles){
   const owner=needUser(),manifest=[];
   // Check the schema/access before sending any file bytes.
   await this.list();
   for(const ref of workspace.references.filter(r=>!r.url)){
    const blob=localFiles.get(ref.id);if(!blob)throw new Error('Original missing for '+ref.name+'. Restore a local backup before saving online.');
    const digest=await hash(blob),path=owner+'/'+digest;
    if(!knownFiles.has(path)){
     const {error}=await client.storage.from(BUCKET).upload(path,blob,{upsert:false,contentType:'application/octet-stream'});
     if(error && !['409','Duplicate'].includes(String(error.statusCode)) && error.error!=='Duplicate')fail(error);
     knownFiles.add(path);
    }
    manifest.push({id:ref.id,path,sha256:digest,size:blob.size,type:blob.type});
   }
   if(needUser()!==owner)throw new Error('Account changed during upload. Save again after signing in.');
   const clean=structuredClone(workspace);delete clean.cloudOwner;delete clean.cloudSavedAt;delete clean.revision;
   const id=crypto.randomUUID();
   const {error}=await client.from(TABLE).insert({id,user_id:owner,workspace:clean,files:manifest});fail(error);
   return {owner,savedAt:new Date().toISOString(),id};
  },
  async load(id){
   const owner=needUser();const {data,error}=await client.from(TABLE).select('workspace,files,created_at').eq('user_id',owner).eq('id',id).single();fail(error);
   if(!Array.isArray(data.files))throw new Error('Invalid online restore point.');
   const files=[];
   for(const file of data.files){
    if(!/^[a-f0-9]{64}$/.test(file.sha256)||file.path!==owner+'/'+file.sha256)throw new Error('Invalid file path in online restore point.');
    const result=await client.storage.from(BUCKET).download(file.path);fail(result.error);
    if(result.data.size!==file.size||await hash(result.data)!==file.sha256)throw new Error('File verification failed. Your local workspace has not changed.');
    knownFiles.add(file.path);files.push({id:file.id,blob:new Blob([result.data],{type:file.type||'application/octet-stream'})});
   }
   if(needUser()!==owner)throw new Error('Account changed during download. Try again.');
   return {state:data.workspace,files,owner,savedAt:data.created_at};
  }
 };
})();

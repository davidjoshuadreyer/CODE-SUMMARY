// No credentials or local server: Judge0's public CE multi-file API.
// Protocol: https://ce.judge0.com/#submissions-submission-post
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CourseCompiler=api;})(globalThis,()=>{
 'use strict';
 const encoder=new TextEncoder(),decoder=new TextDecoder();
 const base64=bytes=>{let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);};
 const decode=text=>text?decoder.decode(Uint8Array.from(atob(text),c=>c.charCodeAt(0))):'';
 const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
 function zip(files){
  const parts=[],central=[];let offset=0,centralSize=0;
  for(const [name,text] of Object.entries(files)){
   if(name.startsWith('/')||name.split('/').includes('..'))throw Error('Invalid project path.');
   const filename=encoder.encode(name),bytes=encoder.encode(text);let crc=0xffffffff;
   for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
   const local=new Uint8Array(30+filename.length),lv=new DataView(local.buffer);
   lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint32(14,crc,true);lv.setUint32(18,bytes.length,true);lv.setUint32(22,bytes.length,true);lv.setUint16(26,filename.length,true);local.set(filename,30);
   const record=new Uint8Array(46+filename.length),cv=new DataView(record.buffer);
   cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint32(16,crc,true);cv.setUint32(20,bytes.length,true);cv.setUint32(24,bytes.length,true);cv.setUint16(28,filename.length,true);cv.setUint32(42,offset,true);record.set(filename,46);
   parts.push(local,bytes);central.push(record);offset+=local.length+bytes.length;centralSize+=record.length;
  }
  const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,central.length,true);ev.setUint16(10,central.length,true);ev.setUint32(12,centralSize,true);ev.setUint32(16,offset,true);
  const result=new Uint8Array(offset+centralSize+22);let at=0;for(const part of [...parts,...central,end]){result.set(part,at);at+=part.length;}return result;
 }
 const quote=s=>"'"+s.replace(/'/g,"'\\''")+"'";
 function project(recipe,files){
  const flags=`-std=c++${recipe.standard} -O0 -Wall -Wextra ${recipe.includes.map(d=>'-I'+quote(d)).join(' ')}`;
  const compiler='/usr/local/gcc-9.2.0/bin/g++';
  const commands=recipe.units.map((u,i)=>`${compiler} ${flags} ${u.rename?'-Dmain='+u.rename:''} -c ${quote(u.file)} -o online_${i}.o`);
  commands.push(`${compiler} ${recipe.units.map((_,i)=>`online_${i}.o`).join(' ')} -o online_program`);
  const folders=[...new Set(recipe.output.map(f=>f.slice(0,f.lastIndexOf('/'))).filter(Boolean))];
  const run=`#!/bin/bash\n${folders.length?'mkdir -p '+folders.map(quote).join(' ')+'\n':''}LD_LIBRARY_PATH=/usr/local/gcc-9.2.0/lib64 ./online_program ${recipe.args.map(quote).join(' ')}\nresult=$?\n${recipe.output.map(f=>`if [ -f ${quote(f)} ]; then printf '\\n--- File: %s (up to 64 KB) ---\\n' ${quote(f)}; head -c 65536 ${quote(f)}; fi`).join('\n')}\nexit "$result"\n`;
  const archive=zip({...files,compile:'#!/bin/bash\nset -e\n'+commands.join('\n')+'\n',run});
  if(archive.length>2*1024*1024)throw Error('This project is too large. Keep source and data under 2 MB.');
  return archive;
 }
 async function run(recipe,files,input,{signal,onStatus=()=>{}}={}){
  const endpoint='https://ce.judge0.com/submissions';
  async function request(url,options={}){
   let response;
   try{response=await fetch(url,{...options,signal});}catch(e){if(signal?.aborted)throw e;throw Error('Cannot reach the online compiler. Check your connection and try again. Your edits are still here.');}
   if(!response.ok)throw Error(response.status===429?'The online compiler is busy (rate limit). Wait a moment and try again.':`The online compiler is unavailable (HTTP ${response.status}). Try again later. Your edits are still here.`);
   return response.json();
  }
  onStatus('Submitting project...');
  const submission=await request(endpoint+'?base64_encoded=true&wait=false',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({language_id:89,additional_files:base64(project(recipe,files)),stdin:base64(encoder.encode(input)),cpu_time_limit:5,wall_time_limit:10,memory_limit:256000,max_file_size:1024,enable_network:false})});
  if(!/^[\da-f-]{36}$/i.test(submission.token||''))throw Error('The compiler returned an invalid submission. Please try again.');
  for(;;){
   const result=await request(endpoint+'/'+submission.token+'?base64_encoded=true&fields=stdout,stderr,compile_output,message,status,time,memory,exit_code');
   if(!result.status||!Number.isInteger(result.status.id))throw Error('The compiler returned an invalid result. Please try again.');
   if(result.status.id>2){for(const key of ['stdout','stderr','compile_output','message'])result[key]=decode(result[key]);return result;}
   onStatus(result.status.id===1?'Queued...':'Compiling and running...');
   await new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};const timer=setTimeout(()=>{signal?.removeEventListener('abort',abort);resolve();},1200);if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});});
  }
 }
 return {zip,project,run,decode};
});

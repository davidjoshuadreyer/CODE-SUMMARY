/** Synthetic end-to-end validation, NOT a measurement of real-world accuracy. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=new URL('../doppler/',import.meta.url);
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
// Resolve the same module graph as the browser, without changing the site's package mode.
globalThis.Worker=(await import('node:worker_threads')).Worker;
const modules=new Map();
async function moduleURL(name){
 if(modules.has(name))return modules.get(name);
 const url=new URL(name,base);
 if(name.endsWith('.mjs'))return url.href;
 let source=await readFile(url,'utf8');
 const dependencies=[...source.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"]+)['"]/g)].map(match=>match[1]);
 for(const dependency of new Set(dependencies)){
  const absolute=new URL(dependency,url),relative=absolute.pathname.slice(base.pathname.length);
  const replacement=JSON.stringify(await moduleURL(relative));
  source=source.split("'"+dependency+"'").join(replacement).split('"'+dependency+'"').join(replacement);
 }
 const result=asModule(source);modules.set(name,result);return result;
}
const demoUrl=await moduleURL('demo.js');
const {makeDemo}=await import(demoUrl);
const demo=makeDemo(),sr=4000,samples=new Float32Array(demo.duration_s*sr);
// Independent synthesis integrates linearly interpolated reference-event Hz.
// It does not call the browser app's synthesizer or the physics predictor.
let seed=4321;
for(let i=0;i<samples.length;i++){
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 samples[i]=.02*(seed/4294967296-.5);
}
for(const event of demo.events){
 const times=event.times_s,hz=event.frequencies_hz,first=times[0],last=times.at(-1);let phase=0,k=0;
 for(let i=Math.floor((first-3)*sr);i<Math.ceil((last+3)*sr);i++){
   const time=i/sr;while(k<times.length-2&&times[k+1]<time)k++;
   const fraction=Math.max(0,Math.min(1,(time-times[k])/(times[k+1]-times[k])));
   const frequency=hz[k]*(1-fraction)+hz[k+1]*fraction;
   phase+=2*Math.PI*frequency/sr;
   const envelope=Math.max(0,Math.min(1,(time-first+3)/3,(last+3-time)/3));
   samples[i]+=envelope*(.22*Math.sin(phase)+.04*Math.sin(2*phase));
 }
}
// Execute the actual browser worker handler with a minimal message host.
// This validates option forwarding and the summary + best-detail integration.
const messages=[];
globalThis.self={postMessage:message=>messages.push(message)};
await import(await moduleURL('worker.js'));
let id=0;
async function run(kind,payload){
 const current=++id;
 await self.onmessage({data:{id:current,kind,payload}});
 const reply=messages.findLast(m=>m.id===current&&('result'in m||'error'in m));
 assert.ok(reply,`No reply for ${kind}`);assert.equal(reply.error,undefined,reply.error);
 return reply.result;
}
const spec=await run('spectrum',{samples,sr,options:{startS:0,windowS:2,hopS:.1,minHz:90,maxHz:270}});
const events=[];
for(const [i,reference] of demo.events.entries()){
 const ridge=await run('ridge',{spec,options:{startS:reference.times_s[0],endS:reference.times_s.at(-1),minHz:i?120:100,maxHz:i?260:210,maxSlopeHzS:20}});
 events.push({...ridge,flight_id:'auto',synthetic:true});
}
const {results,detail}=await run('search',{events,tracks:demo.tracks,candidates:demo.candidates,recordingStartUtc:demo.recording_start_utc-2,options:{timeOffsetsS:[0,2,4],soundSpeed:343}});
assert.ok(results.length>1);
const best=results[0],latError=Math.abs(best.latitude-demo.observer.latitude),lonError=Math.abs(best.longitude-demo.observer.longitude);
assert.ok(latError<=.0025 && lonError<=.0035,'Recovered location must fall within half a grid cell of synthetic truth');
assert.equal(best.recording_start_utc,demo.recording_start_utc);
assert.ok(best.score<1,`Expected sub-Hz combined error, got ${best.score}`);
assert.equal(detail.per_event.length,2);
assert.deepEqual(detail.per_event.map(e=>e.flight_id),['SYNTHETIC-A','SYNTHETIC-B']);
assert.ok(detail.per_event.every(e=>e.rmse_hz<1));
assert.ok(results.every(r=>!('per_event'in r)));
assert.ok(messages.some(m=>m.id===id&&m.progress===1),'Worker must forward completion progress');
console.log(`PASS synthetic audio → spectrogram → two extracted ridges → worker grid search: ${best.score.toFixed(3)} Hz RMSE; correct location cell, shared clock and both flight assignments. This is not real-world accuracy validation.`);

const automatic=await run('autoPCM',{samples,sr});
assert.equal(automatic.samples.length,samples.length);
assert.equal(automatic.sr,sr);
assert.ok(automatic.overview?.display_only,'Automatic scan must return a display-only overview');
assert.ok(automatic.events.length>=2,'Raw synthetic audio scan must find both flyovers');
for(const reference of demo.events){
 const overlap=automatic.events.some(e=>Math.min(e.times_s.at(-1),reference.times_s.at(-1))-Math.max(e.times_s[0],reference.times_s[0])>40);
 assert.ok(overlap,`Automatic PCM worker missed ${reference.flight_id}`);
}
assert.ok(automatic.events.every(e=>e.provenance==='automatic_audio_detection'));
console.log('PASS worker autoPCM → complete synthetic recording scan → both supported flyover candidates, overview, original timeline and sample transfer payload.');

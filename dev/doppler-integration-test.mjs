/** Synthetic end-to-end validation, NOT a measurement of real-world accuracy. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=new URL('../doppler/',import.meta.url);
const asModule=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const physicsUrl=asModule(await readFile(new URL('physics.js',base),'utf8'));
const audioUrl=asModule(await readFile(new URL('audio.js',base),'utf8'));
const demoUrl=asModule((await readFile(new URL('demo.js',base),'utf8')).replace("'./physics.js'",JSON.stringify(physicsUrl)));
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
const workerSource=(await readFile(new URL('worker.js',base),'utf8')).replace("'./audio.js'",JSON.stringify(audioUrl)).replace("'./physics.js'",JSON.stringify(physicsUrl));
await import(asModule(workerSource));
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

/** Whole-recording scan contracts; all audio here is synthetic. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const base=new URL('../doppler/',import.meta.url),cache=new Map();
const asModule=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
async function moduleURL(name){
 if(cache.has(name))return cache.get(name);
 const url=new URL(name,base);let source=await readFile(url,'utf8');
 for(const dep of new Set([...source.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"]+)['"]/g)].map(m=>m[1]))){
  const absolute=new URL(dep,url),relative=absolute.pathname.slice(base.pathname.length)+absolute.search;
  const resolved=JSON.stringify(await moduleURL(relative));
  source=source.split("'"+dep+"'").join(resolved).split('"'+dep+'"').join(resolved);
 }
 const result=asModule(source);cache.set(name,result);return result;
}
const {scanRecording,deduplicateEvents}=await import(await moduleURL('scan.js'));
const sr=4000,progress=[];
const silent=await scanRecording(new Float32Array(sr*13),sr,{chunkSeconds:8,overlapSeconds:4,onProgress:v=>progress.push(v)});
assert.equal(silent.events.length,0);assert.equal(silent.overview,null);
assert.equal(silent.diagnostics.duration_s,13);
assert.deepEqual(silent.diagnostics.windows.map(w=>[w.start_s,w.end_s]),[[0,8],[4,12],[8,13]]);
assert.ok(silent.diagnostics.windows.every(w=>w.status==='silent'));
assert.equal(progress.at(-1).fraction,1);
await assert.rejects(scanRecording(new Float32Array(100),sr),/four seconds/);
await assert.rejects(scanRecording(new Float32Array(sr*10),sr,{chunkSeconds:5,overlapSeconds:5}),/overlap/);

// An event crosses overlapping chunk boundaries; there is no filename/time hint.
const duration=220,samples=new Float32Array(sr*duration),start=75,end=155,centre=115,tau=12,beta=.20;
let phase=0,seed=38;
for(let i=0;i<samples.length;i++){
 const t=i/sr;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
 samples[i]=.012*(seed/4294967296-.5)+.03*Math.sin(2*Math.PI*136.7*t);
 if(t>=start&&t<=end){
  const x=(t-centre)/tau+beta,y=(x-beta*Math.sqrt(x*x+1-beta*beta))/(1-beta*beta);
  const f=215/(1+beta*y/Math.sqrt(1+y*y));phase+=2*Math.PI*f/sr;
  const envelope=Math.min(1,(t-start)/3,(end-t)/3);
  samples[i]+=envelope*(.2*Math.sin(phase)+.08*Math.sin(2*phase));
 }
}
const scan=await scanRecording(samples,sr,{chunkSeconds:130,overlapSeconds:70});
assert.deepEqual(scan.diagnostics.windows.map(w=>w.start_s),[0,60,120]);
assert.ok(scan.overview.display_only);assert.ok(scan.overview.times_s.at(-1)>200);
assert.ok(scan.events.length>=1,'A clearly supported synthetic Doppler event must be found');
const matches=scan.events.filter(e=>e.start_s<90&&e.end_s>145);
assert.equal(matches.length,1,`Overlapping windows and harmonics must return one complete event: ${JSON.stringify(scan.events.map(e=>({start:e.start_s,end:e.end_s,quality:e.quality,first_hz:e.frequencies_hz[0],last_hz:e.frequencies_hz.at(-1)})))}`);
const event=matches[0];
assert.ok(event.start_s>=start-3&&event.end_s<=end+3,`Event timestamps ${event.start_s}–${event.end_s} must refer to original recording (${start}–${end}), not crop time`);
assert.ok(event.times_s.every((t,i)=>i===0||t>event.times_s[i-1]));
assert.deepEqual(event.frequencies_hz,event.raw_frequencies_hz,'Retain measured points rather than replacing them with a smooth model');
assert.equal(event.provenance,'automatic_audio_detection');
assert.ok(scan.events.every((e,i)=>i===0||scan.events[i-1].quality>=e.quality),'Candidates remain ranked by quality');
const duplicate={...event,quality:event.quality*.9};
assert.equal(deduplicateEvents([event,duplicate]).length,1,'Cross-window identical ridges deduplicate');
const harmonic={...event,quality:event.quality*.8,frequencies_hz:Array.from(event.frequencies_hz,f=>2*f),raw_frequencies_hz:Array.from(event.raw_frequencies_hz,f=>2*f)};
assert.equal(deduplicateEvents([event,harmonic]).length,1,'Coherent harmonics deduplicate');
console.log('PASS scan: silence/overlap coverage, complete chunked synthetic discovery, harmonic deduplication, original timestamps, measured/model separation and quality ranking.');

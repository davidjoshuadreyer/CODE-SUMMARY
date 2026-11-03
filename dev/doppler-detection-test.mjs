import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const moduleUrl=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const root=new URL('../doppler/',import.meta.url);
const {detectDopplerEvents,deduplicateEvents}=await import(moduleUrl(await readFile(new URL('detection.js',root),'utf8')));
const physicsUrl=moduleUrl(await readFile(new URL('physics.js',root),'utf8'));
const {makeDemo}=await import(moduleUrl((await readFile(new URL('demo.js',root),'utf8')).replace("'./physics.js'",JSON.stringify(physicsUrl))));
const demo=makeDemo(),times=Array.from({length:441},(_,i)=>i*.5),frequencies=Array.from({length:1921},(_,i)=>40+i*.5);
function buildSpec(includeEvents=true,linear=false){
 let seed=123;const rows=frequencies.map(f=>Float32Array.from(times,t=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return -85+4*seed/4294967296+55*Math.exp(-(((f-136)/.6)**2))+45*Math.exp(-(((f-360)/.7)**2));}));
 if(includeEvents)for(const event of demo.events)for(let j=0;j<times.length;j++){
  const t=times[j];if(t<event.times_s[0]||t>event.times_s.at(-1))continue;
  const index=Math.round((t-event.times_s[0])/.5),f=linear?190-.6*(t-event.times_s[0]):event.frequencies_hz[index];
  for(let k=0;k<frequencies.length;k++)rows[k][j]+=35*Math.exp(-(((frequencies[k]-f)/.65)**2))+25*Math.exp(-(((frequencies[k]-2*f)/.7)**2));
 }
 return {times_s:times,frequencies_hz:frequencies,power_db:rows};
}
let progress=0;const found=await detectDopplerEvents(buildSpec(),{onProgress:value=>progress=value});
assert.equal(progress,1);assert.ok(found.events.length>=2,JSON.stringify(found.diagnostics));
for(const ref of demo.events){
 const matches=found.events.filter(e=>Math.min(e.end_s,ref.times_s.at(-1))-Math.max(e.start_s,ref.times_s[0])>45);
 assert.ok(matches.length,`Missed synthetic event ${ref.flight_id}`);
 const best=matches.sort((a,b)=>b.quality-a.quality)[0];assert.ok(best.fit_rmse_hz<1);assert.ok(best.coverage>=.7);
 assert.deepEqual(best.frequencies_hz,best.raw_frequencies_hz);
 assert.notStrictEqual(best.frequencies_hz,best.fitted_frequencies_hz);
}
const flat=await detectDopplerEvents(buildSpec(false));assert.equal(flat.events.length,0,'Stationary hum must not become an event');
const linear=await detectDopplerEvents(buildSpec(true,true));assert.equal(linear.events.length,0,'Straight descending chirp alone must fail the curved-Doppler check');
const empty=await detectDopplerEvents({times_s:[0,1,2,3],frequencies_hz:[40,41,42],power_db:[[0,0,0,0],[0,0,0,0],[0,0,0,0]]});assert.equal(empty.events.length,0);
const one=found.events[0],harmonic={...one,quality:one.quality*.9,frequencies_hz:one.frequencies_hz.map(f=>f*2)};
assert.equal(deduplicateEvents([one,harmonic]).length,1);
const middle=Math.floor(one.times_s.length*.55),fragment=(start,end)=>{
 const copy={...one};for(const key of ['times_s','frequencies_hz','raw_frequencies_hz','fitted_frequencies_hz','strength_db'])copy[key]=one[key].slice(start,end);
 copy.start_s=copy.times_s[0];copy.end_s=copy.times_s.at(-1);return copy;
};
const fused=deduplicateEvents([fragment(0,middle+5),fragment(middle-5,one.times_s.length)]);
assert.equal(fused.length,1,'Cross-chunk fragments of one measured ridge should fuse');
assert.equal(fused[0].start_s,one.start_s);assert.equal(fused[0].end_s,one.end_s);
assert.equal(fused[0].merged_fragments,2);assert.ok(fused[0].fit_rmse_hz<1);

// Optional local empirical check: fixtures remain outside the published repository.
if(process.env.DOPPLER_PRIVATE_FIXTURE){const spec=JSON.parse(await readFile(process.env.DOPPLER_PRIVATE_FIXTURE,'utf8'));const actual=await detectDopplerEvents(spec);assert.ok(actual.events.length,'Expected candidate evidence in private visually inspected fixture');console.log('Private fixture candidates:',actual.events.map(e=>({start_s:e.start_s,end_s:e.end_s,fit_rmse_hz:e.fit_rmse_hz,coverage:e.coverage})));}
console.log('PASS automatic synthetic discovery, observed/model separation, stationary-hum rejection, straight-chirp rejection, silent input, and harmonic deduplication. No real-world accuracy claim.');

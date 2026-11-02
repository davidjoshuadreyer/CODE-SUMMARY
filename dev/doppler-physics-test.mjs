import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Data imports let Node test native browser ES modules without changing site package semantics.
const source=await readFile(new URL('../doppler/physics.js',import.meta.url),'utf8');
const physicsUrl='data:text/javascript;base64,'+Buffer.from(source).toString('base64');
const {geodeticToEcef,predictReceivedCurve,scoreCandidate,searchCandidates}=await import(physicsUrl);
const demoSource=(await readFile(new URL('../doppler/demo.js',import.meta.url),'utf8')).replace("'./physics.js'",JSON.stringify(physicsUrl));
const {makeDemo}=await import('data:text/javascript;base64,'+Buffer.from(demoSource).toString('base64'));
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} vs ${b} (tolerance ${tol})`);
geodeticToEcef(0,0,0).forEach((v,i)=>near(v,[6378137,0,0][i]));
geodeticToEcef(90,0,0).forEach((v,i)=>near(v,[0,0,6356752.314245][i],1e-5));
const t=Array.from({length:31},(_,i)=>-30+i*2),x=6379137;
const analytic={flight_id:'analytic',times_utc:t.map(v=>1000+v),latitudes:t.map(()=>0),longitudes:t.map(v=>Math.atan2(100*v,x)*180/Math.PI),altitudes_m:t.map(v=>Math.hypot(x,100*v)-6378137),altitude_datum:'geometric'};
const curve=predictReceivedCurve(analytic,{latitude:0,longitude:0});
curve.emission_times_utc.forEach((emit,i)=>{const dt=emit-1000,r=Math.hypot(1000,100*dt);near(curve.ranges_m[i],r,2e-8);near(curve.times_utc[i],emit+r/343,1e-9);near(curve.frequency_ratio[i],343/(343+10000*dt/r),1e-10);});
const gap={...analytic};for(const key of ['times_utc','latitudes','longitudes','altitudes_m'])gap[key]=[analytic[key][0],analytic[key][1],analytic[key].at(-2),analytic[key].at(-1)];
const missing=scoreCandidate([{flight_id:'analytic',times_s:[98,100,102],frequencies_hz:[150,150,150]}],[gap],{latitude:0,longitude:0},900,{maxGapS:5});assert.equal(missing.valid,false);
const d=makeDemo();let progress=0;
const matches=await searchCandidates(d.events,d.tracks,d.candidates,d.recording_start_utc-3,{timeOffsetsS:[0,3,6],onProgress:p=>{progress=p.fraction;}});
assert.deepEqual(matches[0].observer,d.observer);assert.equal(matches[0].recording_start_utc,d.recording_start_utc);near(matches[0].score,0,1e-9);assert.ok(matches[1].score>.01);assert.equal(progress,1);assert.ok(matches.every(r=>!('per_event'in r)));JSON.stringify(matches);
const auto=scoreCandidate(d.events.map(e=>({...e,flight_id:'auto'})),d.tracks,d.observer,d.recording_start_utc);assert.deepEqual(auto.per_event.map(e=>e.flight_id),['SYNTHETIC-A','SYNTHETIC-B']);
await assert.rejects(()=>searchCandidates(d.events,d.tracks,Array(20001).fill(d.observer),d.recording_start_utc),/limited/);
assert.throws(()=>predictReceivedCurve({...analytic,times_utc:analytic.times_utc.map(()=>1000)},{latitude:0,longitude:0}),/strictly/);
const fixture=JSON.parse(await readFile(new URL('./doppler-physics-fixture.json',import.meta.url),'utf8'));
const actual=predictReceivedCurve(fixture.track,fixture.observer);
for(const key of ['times_utc','frequency_ratio','ranges_m','emission_times_utc','segment_ids']){
 assert.equal(actual[key].length,fixture.curve[key].length);
 actual[key].forEach((v,i)=>near(v,fixture.curve[key][i],key==='times_utc'?5e-7:key==='frequency_ratio'?2e-9:1e-7));
}
const parity=scoreCandidate(fixture.events,fixture.tracks,fixture.observer,fixture.recording_start_utc);near(parity.score,fixture.score,2e-7);parity.per_event.forEach((e,i)=>near(e.f0_hz,fixture.f0_hz[i],2e-7));
console.log('PASS: independent analytic flyby, WGS84, gap rejection, two-flight recovery, shared clock, auto assignment, compact summaries, limits, and Python parity');

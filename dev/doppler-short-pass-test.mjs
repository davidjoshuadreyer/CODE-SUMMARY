import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../doppler/detection.js',import.meta.url),'utf8');
const {detectDopplerEvents,fitDopplerShape,isSupportedShortTransition,deduplicateEvents}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const times=Array.from({length:181},(_,i)=>i*.25),freq=Array.from({length:361},(_,i)=>40+i);
function spec(kind){let seed=998;const rows=freq.map(f=>Float32Array.from(times,()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return -80+5*(seed/4294967296)+30*Math.exp(-(((f-136)/.6)**2));}));
 if(kind!=='noise')for(let j=0;j<times.length;j++){const t=times[j];if(t<10||t>26)continue;const beta=kind==='fast'?.2:.1,tau=3,w=(t-18)/tau,u=(w-beta*Math.sqrt(w*w+1-beta*beta))/(1-beta*beta),f=kind==='step'?(t<18?165:145):kind==='linear'?170-(t-10)*2:150/(1+beta*u/Math.sqrt(1+u*u));for(let k=0;k<freq.length;k++)rows[k][j]+=35*Math.exp(-(((freq[k]-f)/.65)**2));}
 return {times_s:times,frequencies_hz:freq,power_db:rows};}
const options={minDurationS:10,seedMinCoverage:.4,minTimescaleS:2,maxDescendingFractionPerS:.08,requireCenteredTransition:true};
const positive=await detectDopplerEvents(spec('doppler'),options);
assert.ok(positive.events.some(e=>e.start_s<13&&e.end_s>23),'Recover short physically generated tonal descent');
for(const event of positive.events){assert.ok(event.coverage>=.7);assert.deepEqual(event.raw_frequencies_hz,event.frequencies_hz);}
assert.equal((await detectDopplerEvents(spec('noise'),options)).events.length,0,'Noise and stationary hum remain rejected');
assert.equal((await detectDopplerEvents(spec('linear'),options)).events.length,0,'Short straight chirp remains rejected');
assert.equal((await detectDopplerEvents(spec('step'),options)).events.length,0,'Switching stationary tones must not fabricate a pass');

// A long observed tail has no central transition; merging fragments must not
// promote it into a short-pass result, even when a Doppler model fits closely.
const tailTimes=Array.from({length:441},(_,i)=>i*.5),tailF=tailTimes.map(t=>{const beta=.032,tau=349,w=(t+44)/tau+beta,u=(w-beta*Math.sqrt(w*w+1-beta*beta))/(1-beta*beta);return 480/(1+beta*u/Math.sqrt(1+u*u));});
const tail={times_s:tailTimes,frequencies_hz:tailF,ideal_fit:fitDopplerShape(tailTimes,tailF),start_s:0,end_s:220,quality:200,detection_scale:'short_pass'};
assert.equal(isSupportedShortTransition(tail),false,'Off-center near-linear drift has no observed transition');
assert.equal(deduplicateEvents([tail]).length,0,'Post-fusion final validation must reject a drifting rail');
for(const event of positive.events)assert.ok(isSupportedShortTransition(event),'Measured central transition remains accepted');

console.log('PASS short physical descent recovery, measured support, noise/hum, straight chirp, abrupt rails, and off-center drifting-tail rejection.');

for(const kind of ['noise','linear','step'])assert.equal((await detectDopplerEvents(spec(kind),{...options,fastSeeds:true})).events.length,0,`Fast seeds reject ${kind}`);
console.log('PASS supplemental fast-seed negative controls.');

const fastPositive=await detectDopplerEvents(spec('fast'),{...options,fastSeeds:true});
assert.ok(fastPositive.events.some(e=>e.start_s<17&&e.end_s>21),'Fast-seed pass follows a steep physical Doppler transition');
console.log('PASS steep physical transition recovery.');

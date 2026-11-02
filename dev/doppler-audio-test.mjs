import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Load the browser ES module without changing the site's Node package mode.
const source = await readFile(new URL('../doppler/audio.js', import.meta.url), 'utf8');
const {computeSpectrogram, extractRidge} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
let state = 12345;
const noise = () => { state = (1664525 * state + 1013904223) >>> 0; return state / 4294967296 - .5; };
const sr = 4000, samples = new Float32Array(sr * 12), cropStart = 15;
for (let i = 0; i < samples.length; i++) {
  const t = i / sr;
  samples[i] = .4 * Math.sin(2*Math.PI*(240*t-2*t*t)) + .35 * noise();
}
const progress = [];
const spec = await computeSpectrogram(samples, sr, {startS:cropStart, windowS:1, hopS:.1, minHz:150, maxHz:260, onProgress:p=>progress.push(p)});
assert.equal(progress[0], 0); assert.equal(progress.at(-1), 1);
assert.equal(spec.actual_window_s, 1.024);
assert.equal(spec.times_s[0], cropStart + .512);
assert.equal(spec.frequency_resolution_hz, 4000/4096);
const options = {startS:spec.times_s[0], endS:spec.times_s.at(-1), minHz:spec.frequencies_hz[0], maxHz:spec.frequencies_hz.at(-1)};
const ridge = extractRidge(spec, {...options, anchors:[{time_s:20, frequency_hz:220}]});
let error = 0;
for (let i = 0; i < ridge.times_s.length; i++) error += Math.abs(ridge.frequencies_hz[i] - (240-4*(ridge.times_s[i]-cropStart)));
assert.ok(error/ridge.times_s.length < .6, `Mean chirp error ${error/ridge.times_s.length}`);
assert.throws(()=>extractRidge(spec, {...options,endS:100}), /inside/);
assert.throws(()=>extractRidge(spec, {...options,anchors:[{time_s:100,frequency_hz:200}]}), /outside/);
assert.throws(()=>extractRidge(spec, {...options,anchors:[
  {time_s:spec.times_s[0],frequency_hz:options.minHz},
  {time_s:spec.times_s[1],frequency_hz:options.maxHz}]}), /cannot be connected/);
await assert.rejects(computeSpectrogram(new Float32Array(12000), sr), /silent/);
await assert.rejects(computeSpectrogram(samples, sr, {maxHz:3000}), /Nyquist/);
await assert.rejects(computeSpectrogram(new Float32Array([1,2,3,4,5,6,NaN,8]), sr), /shorter/);
const invalid = samples.slice(); invalid[100] = NaN;
await assert.rejects(computeSpectrogram(invalid,sr), /nonfinite/);
await assert.rejects(computeSpectrogram(samples,sr,{hopS:0}), /hop/);
const pure = new Float32Array(sr*4);
for (let i=0;i<pure.length;i++) pure[i]=Math.sin(2*Math.PI*250*i/sr);
const tone = await computeSpectrogram(pure,sr,{windowS:1,minHz:100,maxHz:400});
const peak = tone.power_db.reduce((best,row,index)=>row[0]>tone.power_db[best][0]?index:best,0);
assert.ok(Math.abs(tone.frequencies_hz[peak]-250)<1);
console.log(`Browser audio tests passed: noisy chirp ${ (error/ridge.times_s.length).toFixed(3)} Hz mean error, timing, FFT tone, progress, silence, invalid bounds, anchors and nonfinite inputs.`);

// A deliberately off-bin tone distinguishes interpolation from FFT-bin quantization.
const offBinHz = 250.37, offBin = new Float32Array(sr*5);
for (let i=0;i<offBin.length;i++) offBin[i]=.4*Math.sin(2*Math.PI*offBinHz*i/sr)+.015*noise();
const offSpec=await computeSpectrogram(offBin,sr,{windowS:1,minHz:220,maxHz:280});
const offOptions={startS:offSpec.times_s[0],endS:offSpec.times_s.at(-1),minHz:offSpec.frequencies_hz[0],maxHz:offSpec.frequencies_hz.at(-1)};
const refined=extractRidge(offSpec,offOptions);
const refinedError=Array.from(refined.frequencies_hz).reduce((sum,f)=>sum+Math.abs(f-offBinHz),0)/refined.frequencies_hz.length;
const quantizedError=Math.abs(Math.round(offBinHz/offSpec.frequency_resolution_hz)*offSpec.frequency_resolution_hz-offBinHz);
assert.ok(refinedError<.03 && refinedError<quantizedError/5,`Sub-bin error ${refinedError}, quantized ${quantizedError}`);
const pinned=extractRidge(offSpec,{...offOptions,anchors:[{time_s:offSpec.times_s[3],frequency_hz:offBinHz}]});
assert.equal(pinned.frequencies_hz[3],Math.round(offBinHz/offSpec.frequency_resolution_hz)*offSpec.frequency_resolution_hz);
assert.ok(error/ridge.times_s.length<.15,`Interpolated noisy chirp error ${error/ridge.times_s.length}`);
console.log(`Sub-bin tests passed: off-bin tone ${refinedError.toFixed(4)} Hz vs ${quantizedError.toFixed(4)} Hz quantized; anchored bins preserved.`);

const pureRidge=extractRidge(tone,{startS:tone.times_s[0],endS:tone.times_s.at(-1),minHz:tone.frequencies_hz[0],maxHz:tone.frequencies_hz.at(-1)});
assert.ok(Array.from(pureRidge.frequencies_hz).every(f=>Math.abs(f-250)<.01),'A strong noiseless tone must not plateau across adjacent bins');

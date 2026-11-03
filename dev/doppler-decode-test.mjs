import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// The browser bundle defines an optional Worker subclass even for synchronous decode.
globalThis.Worker=(await import('node:worker_threads')).Worker;
const vendor=new URL('../doppler/vendor/mpg123-decoder-1.0.3.min.mjs',import.meta.url);
const source=(await readFile(new URL('../doppler/decode.js',import.meta.url),'utf8')).replace("'./vendor/mpg123-decoder-1.0.3.min.mjs'",JSON.stringify(vendor.href));
const {createStreamingResampler,decodeMP3}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const sr=44100,outputSR=4000,n=sr*3;
function resample(values,chunk=65536){const r=createStreamingResampler(sr,outputSR),parts=[];for(let i=0;i<values.length;i+=chunk)parts.push(...r.process(values.subarray(i,i+chunk)));parts.push(...r.finish());return Float32Array.from(parts);}
const signal=new Float32Array(n);
for(let i=0;i<n;i++)signal[i]=.5*Math.sin(2*Math.PI*500*i/sr);
const whole=resample(signal,n),chunked=resample(signal,777);
assert.equal(whole.length,12000);assert.deepEqual(whole,chunked,'Resampling must be invariant to chunk boundaries');
const rms=a=>Math.sqrt(a.reduce((sum,v)=>sum+v*v,0)/a.length);
assert.ok(Math.abs(rms(whole.subarray(400))-.5/Math.sqrt(2))<.002);
const high=new Float32Array(n);for(let i=0;i<n;i++)high[i]=.5*Math.sin(2*Math.PI*3500*i/sr);
assert.ok(rms(resample(high).subarray(400))<.0001,'High-frequency tones must not alias into the aircraft band');
await assert.rejects(decodeMP3(new Uint8Array()),/nonempty/);
await assert.rejects(decodeMP3(new Uint8Array([1,2,3])),/No usable/);
await assert.rejects(decodeMP3(new Uint8Array([1]),{targetSR:NaN}),/sample rate/);
assert.throws(()=>createStreamingResampler(0),/Unsupported/);
// A decoder error must abort; discarding damaged frames would shift timestamps.
const realDecoder=globalThis['mpg123-decoder'].MPEGDecoder;
for(const errorKey of ['errors','V']) {
  let freed=false;
  globalThis['mpg123-decoder'].MPEGDecoder=class {
    ready=Promise.resolve();
    decode(){return {[errorKey]:[{message:'simulated corrupt frame'}],samplesDecoded:0};}
    free(){freed=true;}
  };
  await assert.rejects(decodeMP3(new Uint8Array([1,2,3])),/preserve timestamps/);
  assert.equal(freed,true);
}
globalThis['mpg123-decoder'].MPEGDecoder=realDecoder;
console.log('Streaming resampler tests passed: chunk continuity, duration, 500Hz passband, 3500Hz alias rejection, invalid input and error abort.');
if(process.argv[2]) {
  const {openAsBlob}=await import('node:fs');
  const input=await openAsBlob(process.argv[2]);
  let mark=-1;const start=performance.now();
  const result=await decodeMP3(input,{onProgress:p=>{const now=Math.floor(p*10);if(now!==mark){mark=now;console.log(`Decode ${now*10}%`);}}});
  console.log(JSON.stringify({duration:result.duration,samples:result.samples.length,sr:result.sr,channels:result.channels,original_samples:result.original_samples,original_sample_rate:result.original_sample_rate,elapsed_s:(performance.now()-start)/1000,peak_resident_mb:process.resourceUsage().maxRSS/1024}));
  if(process.env.EXPECT_DURATION_S)assert.ok(Math.abs(result.duration-Number(process.env.EXPECT_DURATION_S))<.001);
  if(process.env.EXPECT_SAMPLES)assert.equal(result.samples.length,Number(process.env.EXPECT_SAMPLES));
}

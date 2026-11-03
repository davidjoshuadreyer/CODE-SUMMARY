/** Bounded streaming MP3 decode; no recording bytes leave this device. */
import './vendor/mpg123-decoder-1.0.3.min.mjs';

const CHUNK_BYTES = 256 * 1024;
const pause = () => new Promise(resolve => setTimeout(resolve, 0));

/** Stateful anti-alias resampler for analysis, not high-fidelity playback.
 * A 12th-order Butterworth low-pass at 0.30 * targetSR precedes interpolation.
 * At 4kHz output this preserves the 40–1000Hz analysis band, rolls off above
 * 1200Hz, and rejects input above 2kHz by about 53dB or more (44.1kHz input).
 * Causal filter phase adds approximately 1ms delay in the analysis band;
 * timestamps are not silently shortened to compensate a frequency-dependent delay.
 */
export function createStreamingResampler(sourceSR, targetSR = 4000) {
  if (!Number.isFinite(sourceSR) || sourceSR < 1000 || sourceSR > 192000 ||
      !Number.isInteger(targetSR) || targetSR < 1000 || targetSR > 12000)
    throw new Error('Unsupported resampling rates.');
  const sections = 6, coeff = [], z1 = new Float64Array(sections), z2 = new Float64Array(sections);
  const cutoff = Math.min(.30 * targetSR, .40 * sourceSR), omega = 2*Math.PI*cutoff/sourceSR;
  const cosine = Math.cos(omega), sine = Math.sin(omega);
  for (let k=0;k<sections;k++) {
    const q = 1/(2*Math.cos((2*k+1)*Math.PI/24)), alpha = sine/(2*q), a0=1+alpha;
    coeff.push([(1-cosine)/2/a0,(1-cosine)/a0,(1-cosine)/2/a0,-2*cosine/a0,(1-alpha)/a0]);
  }
  let inputCount=0, outputCount=0, previous=0, closed=false;
  const ratio=sourceSR/targetSR;
  return {
    get inputCount(){return inputCount;},
    get outputCount(){return outputCount;},
    process(input) {
      if(closed)throw new Error('Resampler has already finished.');
      const out=new Float32Array(Math.ceil(input.length/ratio)+3);let used=0;
      for(let i=0;i<input.length;i++) {
        let value=input[i];
        if(!Number.isFinite(value))throw new Error('Decoder produced a nonfinite audio sample.');
        for(let k=0;k<sections;k++) {
          const c=coeff[k], filtered=c[0]*value+z1[k];
          z1[k]=c[1]*value-c[3]*filtered+z2[k];z2[k]=c[2]*value-c[4]*filtered;value=filtered;
        }
        while(outputCount*ratio<=inputCount+1e-8) {
          const fraction=inputCount===0?1:outputCount*ratio-(inputCount-1);
          out[used++]=previous+(value-previous)*Math.max(0,Math.min(1,fraction));
          outputCount++;
        }
        previous=value;inputCount++;
      }
      return out.subarray(0,used);
    },
    finish() {
      if(closed)throw new Error('Resampler has already finished.');closed=true;
      const expected=Math.ceil(inputCount*targetSR/sourceSR-1e-8),tail=new Float32Array(Math.max(0,expected-outputCount));
      tail.fill(previous);outputCount+=tail.length;return tail;
    }
  };
}

/** Decode a File/Blob or Uint8Array sequentially. Run this in the app's worker.
 * Returned samples are mono channel 0 at targetSR, suitable for transfer.
 * Decoding errors abort rather than silently changing the recording timeline.
 */
export async function decodeMP3(fileBlob,{onProgress,maxDurationS=7200,targetSR=4000}={}) {
  if(!Number.isFinite(maxDurationS)||maxDurationS<=0||maxDurationS>7200)
    throw new Error('MP3 duration limit must be between zero and 7200 seconds.');
  if(!Number.isInteger(targetSR)||targetSR<1000||targetSR>12000)
    throw new Error('Analysis sample rate must be an integer from 1000 to 12000 Hz.');
  const isBytes=fileBlob instanceof Uint8Array;
  const size=isBytes?fileBlob.byteLength:fileBlob?.size;
  if(!Number.isInteger(size)||size===0||size>300*1024*1024||(!isBytes&&typeof fileBlob.slice!=='function'))
    throw new Error('Choose a nonempty MP3 File/Blob or Uint8Array under 300 MB.');
  const decoder=new globalThis['mpg123-decoder'].MPEGDecoder({enableGapless:true});
  let resampler=null,sourceRate=null,channels=0,inputSamples=0,total=0;
  const parts=[];
  onProgress?.(0);
  try {
    await decoder.ready;
    for(let offset=0;offset<size;offset+=CHUNK_BYTES) {
      const bytes=isBytes?fileBlob.subarray(offset,offset+CHUNK_BYTES):new Uint8Array(await fileBlob.slice(offset,offset+CHUNK_BYTES).arrayBuffer());
      const decoded=decoder.decode(bytes);
      // Official 1.0.3 minified build mangles the documented errors key to V.
      const errors=decoded.errors??decoded.V??[];
      if(errors.length)throw new Error(`MP3 decoding error; scan stopped to preserve timestamps: ${errors[0].message}`);
      if(decoded.samplesDecoded) {
        if(!Number.isFinite(decoded.sampleRate)||decoded.sampleRate<=0)throw new Error('MP3 decoder returned an invalid sample rate.');
        if(sourceRate!==null&&sourceRate!==decoded.sampleRate)throw new Error('MP3 sample rate changes midstream; convert to a constant-rate audio file first.');
        if(!resampler){sourceRate=decoded.sampleRate;resampler=createStreamingResampler(sourceRate,targetSR);}
        const data=decoded.channelData?.[0];
        if(!data||data.length!==decoded.samplesDecoded)throw new Error('MP3 decoder returned inconsistent sample counts.');
        channels=decoded.channelData.length;inputSamples+=decoded.samplesDecoded;
        if(inputSamples/sourceRate>maxDurationS)throw new Error(`Recording exceeds the ${maxDurationS/60} minute analysis limit.`);
        const output=resampler.process(data);parts.push(output);total+=output.length;
      }
      onProgress?.(Math.min(1,(offset+bytes.length)/size));
      await pause();
    }
    if(!resampler||inputSamples<sourceRate)throw new Error('No usable MP3 audio was decoded (at least one second is required).');
    const tail=resampler.finish();parts.push(tail);total+=tail.length;
    const samples=new Float32Array(total);let at=0;
    for(const part of parts){samples.set(part,at);at+=part.length;}
    return {samples,sr:targetSR,duration:inputSamples/sourceRate,channels,
      original_sample_rate:sourceRate,original_samples:inputSamples,channel:0,
      warnings:['Decoded locally in bounded MP3 chunks; analysis uses channel 0.',
        `Analysis resampling uses a causal low-pass at ${(.30*targetSR).toFixed(0)} Hz; frequencies near output Nyquist are intentionally attenuated.`,
        'The analysis filter adds approximately 1 ms of frequency-dependent delay at 4 kHz output. Original recording timestamps and gapless MP3 trim are preserved.',
        'The decoder reports two output channels, including duplicated channels for mono MP3 sources.']};
  } finally { decoder.free(); }
}

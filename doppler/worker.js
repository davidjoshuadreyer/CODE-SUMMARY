import {computeSpectrogram,extractRidge} from './audio.js';
import {searchCandidates,scoreCandidate} from './physics.js';
import {scanRecording} from './scan.js?v=auto3';
import {decodeMP3} from './decode.js';
self.onmessage=async({data:{id,kind,payload}})=>{
  try {
    const onProgress=(value)=>self.postMessage({id,progress:typeof value==='number'?value:value.fraction,phase:value?.phase});
    let result;
    if(kind==='autoFile') {
      const decoded=await decodeMP3(payload.file,{onProgress:value=>onProgress({fraction:.35*(typeof value==='number'?value:value.fraction),phase:'Decoding MP3 incrementally…'})});
      const scan=await scanRecording(decoded.samples,decoded.sr,{onProgress:value=>onProgress({...value,fraction:.35+.65*value.fraction})});
      result={...scan,samples:decoded.samples,sr:decoded.sr,decode_info:{duration:decoded.duration,channels:decoded.channels,warnings:decoded.warnings}};
    }
    else if(kind==='autoPCM') result={...await scanRecording(payload.samples,payload.sr,{onProgress}),samples:payload.samples,sr:payload.sr};
    else if(kind==='spectrum') result=await computeSpectrogram(payload.samples,payload.sr,{...payload.options,onProgress});
    else if(kind==='ridge') result=extractRidge(payload.spec,payload.options);
    else if(kind==='search') {
      const {events,tracks,candidates,recordingStartUtc,options}=payload;
      const results=await searchCandidates(events,tracks,candidates,recordingStartUtc,{...options,onProgress});
      const best=results[0];
      const detail=best?scoreCandidate(events,tracks,best.observer||best,best.recording_start_utc,options):null;
      result={results,detail};
    } else throw new Error('Unknown analysis operation.');
    self.postMessage({id,result},result.samples?[result.samples.buffer]:[]);
  } catch(error){self.postMessage({id,error:error.message||String(error)});}
};

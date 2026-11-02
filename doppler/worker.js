import {computeSpectrogram,extractRidge} from './audio.js';
import {searchCandidates,scoreCandidate} from './physics.js';
self.onmessage=async({data:{id,kind,payload}})=>{
  try {
    const onProgress=(value)=>self.postMessage({id,progress:typeof value==='number'?value:value.fraction});
    let result;
    if(kind==='spectrum') result=await computeSpectrogram(payload.samples,payload.sr,{...payload.options,onProgress});
    else if(kind==='ridge') result=extractRidge(payload.spec,payload.options);
    else if(kind==='search') {
      const {events,tracks,candidates,recordingStartUtc,options}=payload;
      const results=await searchCandidates(events,tracks,candidates,recordingStartUtc,{...options,onProgress});
      const best=results[0];
      const detail=best?scoreCandidate(events,tracks,best.observer||best,best.recording_start_utc,options):null;
      result={results,detail};
    } else throw new Error('Unknown analysis operation.');
    self.postMessage({id,result});
  } catch(error){self.postMessage({id,error:error.message||String(error)});}
};

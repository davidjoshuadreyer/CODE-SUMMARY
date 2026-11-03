import {computeSpectrogram} from './audio.js';
import {detectDopplerEvents,deduplicateEvents} from './detection.js?v=auto3';
export {deduplicateEvents} from './detection.js?v=auto3';

/** Scan the complete recording in overlapping windows, keeping memory bounded.
 * No file names, expected event times, or reference flight tracks enter detection.
 */
export async function scanRecording(samples,sr,{onProgress,chunkSeconds=600,overlapSeconds=180,maxEvents=20}={}) {
  if(!samples?.length||!Number.isFinite(sr)||sr<1000)throw Error('Decoded audio is missing or invalid.');
  const duration=samples.length/sr;
  if(duration<4)throw Error('Use a recording at least four seconds long.');
  if(duration>7200)throw Error('Automatic scans currently support recordings up to two hours.');
  if(chunkSeconds<=overlapSeconds||overlapSeconds<0)throw Error('Invalid scan-window overlap.');
  const stride=chunkSeconds-overlapSeconds,starts=[];
  for(let start=0;start<duration;start+=stride){starts.push(start);if(start+chunkSeconds>=duration)break;}
  const overviewStep=Math.max(.5,duration/1800),overviewCount=Math.ceil(duration/overviewStep);
  let overview=null;
  const proposals=[],windows=[];
  for(let i=0;i<starts.length;i++){
    const start=starts[i],end=Math.min(duration,start+chunkSeconds);
    onProgress?.({fraction:i/starts.length,phase:`Scanning ${formatTime(start)}–${formatTime(end)} of ${formatTime(duration)}`});
    const audio=samples.subarray(Math.round(start*sr),Math.min(samples.length,Math.round(end*sr)));
    let spec;
    try{spec=await computeSpectrogram(audio,sr,{startS:start,windowS:2,hopS:.5,minHz:40,maxHz:1000,
      onProgress:f=>onProgress?.({fraction:(i+.35*f)/starts.length,phase:`Computing spectrum · ${formatTime(start)}–${formatTime(end)}`})});}
    catch(e){if(/silent|constant DC/.test(e.message)){windows.push({start_s:start,end_s:end,status:'silent',events:0});continue;}throw e;}
    if(!overview){
      const df=Math.max(1,Math.ceil(spec.frequencies_hz.length/700));
      overview={times_s:Float64Array.from({length:overviewCount},(_,k)=>(k+.5)*overviewStep),
        frequencies_hz:Float64Array.from(spec.frequencies_hz.filter((_,k)=>k%df===0)),
        power_db:Array.from({length:Math.ceil(spec.frequencies_hz.length/df)},()=>new Float32Array(overviewCount).fill(-120)),
        actual_window_s:spec.actual_window_s,actual_hop_s:overviewStep,frequency_resolution_hz:spec.frequency_resolution_hz*df,
        display_only:true,frequency_stride:df};
    }
    // Display uses peak power within each time cell so short signals remain visible.
    // Detection always uses the original, uncompressed spectrogram above.
    for(let t=0;t<spec.times_s.length;t++){
      const col=Math.min(overviewCount-1,Math.floor(spec.times_s[t]/overviewStep));
      for(let row=0;row<overview.power_db.length;row++){
        const value=spec.power_db[row*overview.frequency_stride][t];
        if(value>overview.power_db[row][col])overview.power_db[row][col]=value;
      }
    }
    const found=await detectDopplerEvents(spec,{onProgress:value=>{
      const f=typeof value==='number'?value:value.fraction;
      onProgress?.({fraction:(i+.35+.65*(f||0))/starts.length,phase:`Finding curved tonal tracks · ${formatTime(start)}–${formatTime(end)}`});
    }});
    proposals.push(...found.events);
    windows.push({start_s:start,end_s:end,status:'scanned',events:found.events.length,diagnostics:found.diagnostics});
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  const events=deduplicateEvents(proposals).sort((a,b)=>quality(b)-quality(a)).slice(0,maxEvents);
  events.forEach((e,i)=>{e.name=`Tonal candidate ${i+1}`;e.flight_id='auto';e.provenance='automatic_audio_detection';});
  onProgress?.({fraction:1,phase:'Scan complete'});
  return {events,overview,diagnostics:{algorithm_version:'2026-11-02-auto1',duration_s:duration,scan_band_hz:[40,1000],window_s:2,hop_s:.5,windows,
    proposal_count:proposals.length,returned_events:events.length,max_events:maxEvents,
    method:'Automatic tonal-curve detection; candidate sounds are not verified aircraft identities.'}};
}
const quality=e=>Number(e.score??e.quality??e.coverage??0)||0;
function formatTime(seconds){const n=Math.floor(seconds);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}

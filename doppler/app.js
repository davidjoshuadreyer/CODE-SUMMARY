import {parseTracks,candidateGrid,importEvents} from './flights.js';
import {makeDemo} from './demo.js';
import {predictReceivedCurve,interpolateArrival} from './physics.js';
import {createStreamingResampler} from './decode.js';
import {mapMovieTimeline} from './video.js';
const isVideoFile=file=>/\.(mov|mp4|m4v)$/i.test(file?.name||'')||['video/mp4','video/quicktime'].includes(file?.type);

const $=id=>document.getElementById(id);
const state={source:null,spec:null,ridge:null,events:[],tracks:[],result:null,view:null,demo:null,url:null,worker:null,jobKind:null,job:0,sourceRevision:0,detections:[],scan:null};
const number=id=>{const value=$(id).value;if(!value.trim()||!Number.isFinite(Number(value)))throw Error(`Enter a finite value for ${$(id).closest('label')?.firstChild.textContent||id}.`);return Number(value);};
const set=(id,value)=>{$(id).value=value;};
const iso=t=>new Date(t*1000).toISOString();
function status(message,kind=''){ $('status').textContent=message;$('status').className=kind; }
function report(error){status(error.message||String(error),'error');}
function invalidate(){if(state.worker&&state.jobKind==='search')cancel();state.result=null;$('results').hidden=true;$('export-results').disabled=true;}
function json(value){return JSON.stringify(value,(_,v)=>ArrayBuffer.isView(v)?Array.from(v):v,2);}
function download(name,data,type='application/json'){const url=URL.createObjectURL(new Blob([typeof data==='string'?data:json(data)],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function cancel(){if(state.sampleFetch){state.sampleFetch.abort();state.sampleFetch=null;}if(state.worker){state.worker.terminate();state.worker=null;}state.jobKind=null;state.job++;$('progress-row').hidden=true;document.querySelectorAll('[data-busy]').forEach(el=>{el.disabled=false;delete el.dataset.busy;});}
function job(kind,payload){cancel();const id=state.job;return new Promise((resolve,reject)=>{const worker=new Worker(new URL('./worker.js?v=fastseed1',import.meta.url),{type:'module'});state.worker=worker;state.jobKind=kind;$('progress').value=0;$('progress-row').hidden=false;['analyze','extract','search','demo','reference-events','save-event','rescan'].forEach(key=>{const el=$(key);if(!el.disabled){el.disabled=true;el.dataset.busy='1';}});worker.onerror=event=>{if(id!==state.job)return;cancel();reject(Error(event.message||'Analysis worker could not start. Reload the page.'));};worker.onmessage=({data})=>{if(data.id!==state.job)return;if(data.progress!=null){$('progress').value=Math.max(0,Math.min(1,data.progress));if(data.phase)status(data.phase);return;}cancel();if(data.error)reject(Error(data.error));else resolve(data.result);};worker.postMessage({id,kind,payload});});}
$('cancel').onclick=()=>{state.sourceRevision++;cancel();$('rescan').disabled=!(state.source?.samples||isVideoFile(state.source?.file)||state.source?.file?.name?.toLowerCase().endsWith('.mp3')||state.source?.file?.type==='audio/mpeg');status('Analysis cancelled. Existing saved events are unchanged.');};
function resetRecording(){cancel();state.sourceRevision++;state.detections=[];state.scan=null;$('detections').replaceChildren();$('scan-summary').textContent='Scanning will start after local decoding.';$('export-auto').disabled=true;$('rescan').disabled=true;state.spec=null;state.ridge=null;state.events=[];state.tracks=[];state.demo=null;state.view=null;invalidate();$('ridge-details').hidden=true;$('reference-events').hidden=true;$('extract').disabled=true;$('zoom-view').disabled=true;$('reset-view').disabled=true;$('play-selection').disabled=true;$('anchors').value='';$('spectrum-empty').hidden=false;renderEvents();renderTracks();drawSpectrum();}
async function hash(data){if(!crypto.subtle)return null;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(v=>v.toString(16).padStart(2,'0')).join('');}
function wav(samples,sr){const bytes=new ArrayBuffer(44+samples.length*2),v=new DataView(bytes),text=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));text(0,'RIFF');v.setUint32(4,36+samples.length*2,true);text(8,'WAVE');text(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,samples.length*2,true);samples.forEach((s,i)=>v.setInt16(44+2*i,Math.round(Math.max(-1,Math.min(1,s))*32767),true));return new Blob([bytes],{type:'audio/wav'});}
function generateAudio(demo){const sr=4000,samples=new Float32Array(demo.duration_s*sr);let seed=73;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=.025*(seed/4294967296-.5);}for(const event of demo.events){const track=demo.tracks.find(t=>t.flight_id===event.flight_id),curve=predictReceivedCurve(track,demo.observer);let phase=0;const lo=event.times_s[0],hi=event.times_s.at(-1);for(let i=Math.max(0,Math.floor((lo-3)*sr));i<Math.min(samples.length,Math.ceil((hi+3)*sr));i++){const t=i/sr,ratio=interpolateArrival(curve,demo.recording_start_utc+t);if(!Number.isFinite(ratio))continue;phase+=2*Math.PI*event.f0_hz*ratio/sr;const env=Math.max(0,Math.min(1,(t-lo+3)/3,(hi+3-t)/3));samples[i]+=env*(.22*Math.sin(phase)+.04*Math.sin(2*phase));}}return {samples,sr};}
$('demo').onclick=async()=>{try{resetRecording();const demo=makeDemo(),audio=generateAudio(demo);state.demo=demo;state.source={kind:'synthetic',name:'Generated two-flight recording',...audio,duration:audio.samples.length/audio.sr};state.tracks=demo.tracks;if(state.url)URL.revokeObjectURL(state.url);state.url=URL.createObjectURL(wav(audio.samples,audio.sr));$('media-player').hidden=true;$('media-player').pause();$('demo-player').src=state.url;$('demo-player').hidden=false;$('media-file').value='';$('video-file').value='';$('source-name').textContent=state.source.name;$('source-detail').textContent='SYNTHETIC · Two generated flyovers at 25–100 s and 125–200 s. This checks the workflow, not real-world accuracy.';set('crop-start',0);set('crop-duration',220);set('channel',0);set('recording-time',iso(demo.recording_start_utc));set('south',49.24);set('north',49.26);set('west',-123.115);set('east',-123.085);set('elevation',0);$('analyze').disabled=false;$('reference-events').hidden=false;renderTracks();status('Synthetic recording loaded. Scanning for curves automatically…');await runAutomatic();}catch(e){report(e);}};
async function decodeVideoAndScan(file,revision){
  try{return await job('autoVideo',{file});}
  catch(error){
    if(revision!==state.sourceRevision)return null;
    if(!String(error.message).startsWith('VIDEO_NATIVE_FALLBACK:'))throw error;
    status('Preparing audio-only video fallback locally…');
    const prepared=await job('prepareVideoFallback',{file});if(revision!==state.sourceRevision)return null;
    $('progress-row').hidden=false;$('progress').value=.35;status('Decoding the extracted soundtrack locally…');
    const bytes=await prepared.blob.arrayBuffer();if(revision!==state.sourceRevision)return null;
    const context=new OfflineAudioContext(1,1,8000);
    let buffer;try{buffer=await context.decodeAudioData(bytes);}catch{throw Error('This browser cannot decode the extracted AAC audio. Use a newer Safari/Chrome, or export the audio as MP3.');}
    if(revision!==state.sourceRevision)return null;
    const resampler=createStreamingResampler(buffer.sampleRate),parts=[resampler.process(buffer.getChannelData(0)),resampler.finish()],media=new Float32Array(parts[0].length+parts[1].length);media.set(parts[0]);media.set(parts[1],parts[0].length);
    const samples=mapMovieTimeline(media,prepared.meta,4000);buffer=null;
    const output=await job('autoPCM',{samples,sr:4000});
    output.decode_info={channels:prepared.meta.channels,warnings:['AAC extracted locally into an audio-only container and decoded with the browser fallback.','Movie edit-list timing is applied explicitly; analysis retains audio channel 0.']};return output;
  }
}
async function selectMedia(event){
  const file=event.target.files[0];if(!file)return;
  let revision=state.sourceRevision;
  try{
    const isMP3=/\.mp3$/i.test(file.name)||file.type==='audio/mpeg',isVideo=isVideoFile(file);
    if(file.size>(isVideo?2048:isMP3?200:100)*1024**2)throw Error('Use MOV/MP4 under 2 GB, MP3 under 200 MB, or another audio file under 100 MB.');
    resetRecording();revision=state.sourceRevision;state.source={kind:'user_recording',name:file.name,file,size_bytes:file.size};
    $('analyze').disabled=true;$('source-name').textContent=file.name;
    if(state.url)URL.revokeObjectURL(state.url);state.url=URL.createObjectURL(file);
    $('demo-player').pause();$('demo-player').hidden=true;$('media-player').src=state.url;$('media-player').hidden=false;
    $('source-detail').textContent='Processing locally. You can cancel or choose another recording.';
    if(isMP3||isVideo){status(isVideo?'Extracting video audio locally…':'Decoding MP3 incrementally…');const output=isVideo?await decodeVideoAndScan(file,revision):await job('autoFile',{file});if(revision!==state.sourceRevision||!output)return;applyAutomatic(output);}
    else{
      status('Decoding locally at analysis sample rate…');
      const bytes=await file.arrayBuffer();if(revision!==state.sourceRevision)return;
      const context=new OfflineAudioContext(1,1,8000);
      let buffer;try{buffer=await context.decodeAudioData(bytes);}catch{throw Error('This browser cannot decode this file. Try MP3 or WAV.');}
      if(revision!==state.sourceRevision)return;
      if(buffer.duration>7200)throw Error('Automatic scans support at most two hours.');
      const resampler=createStreamingResampler(buffer.sampleRate),first=resampler.process(buffer.getChannelData(0)),last=resampler.finish();
      state.source.samples=new Float32Array(first.length+last.length);state.source.samples.set(first);state.source.samples.set(last,first.length);state.source.sr=4000;state.source.duration=state.source.samples.length/4000;
      state.source.channels=buffer.numberOfChannels;buffer=null;await runAutomatic();
    }
  }catch(e){if(revision!==state.sourceRevision)return;cancel();report(e);$('rescan').disabled=!(state.source?.samples||isVideoFile(state.source?.file)||/\.mp3$/i.test(state.source?.file?.name||'')||state.source?.file?.type==='audio/mpeg');}
}
$('load-sample').onclick=async()=>{
  const id=$('sample-choice').value;if(!/^\d{2}$/.test(id)||Number(id)<1||Number(id)>12)return;
  resetRecording();state.source=null;['recording-time','south','north','west','east'].forEach(id=>set(id,''));$('analyze').disabled=true;$('media-player').pause();$('media-player').hidden=true;$('demo-player').pause();$('demo-player').hidden=true;const revision=state.sourceRevision,controller=new AbortController();state.sampleFetch=controller;
  $('load-sample').disabled=true;$('source-name').textContent=`Sample ${id}`;
  $('source-detail').textContent='Downloading the original audio for local analysis…';
  $('progress-row').hidden=false;$('progress').removeAttribute('value');status(`Downloading sample ${id}…`);
  try{
    const response=await fetch(new URL(`./samples/sample-${id}.wav`,import.meta.url),{signal:controller.signal});
    if(!response.ok)throw Error(`Sample download failed (${response.status}). Try again.`);
    const blob=await response.blob();if(revision!==state.sourceRevision)return;
    state.sampleFetch=null;$('load-sample').disabled=false;
    await selectMedia({target:{files:[new File([blob],`Sample-${id}.wav`,{type:'audio/wav'})]}});
  }catch(error){if(revision===state.sourceRevision&&error.name!=='AbortError'){cancel();report(error);}}
  finally{if(state.sampleFetch===controller)state.sampleFetch=null;$('load-sample').disabled=false;}
};
$('media-file').onchange=selectMedia;$('video-file').onchange=selectMedia;
$('choose-video').onclick=()=>$('video-file').click();$('choose-audio').onclick=()=>$('media-file').click();

async function croppedAudio(){if(!state.source)throw Error('Choose a recording first.');const start=number('crop-start'),duration=number('crop-duration'),channel=number('channel');if(start<0||duration<2||duration>600||start>=state.source.duration||!Number.isInteger(channel)||channel<0)throw Error('Use a valid start, 2–600 seconds of audio, and an integer channel.');const length=Math.min(duration,state.source.duration-start),sr=4000;if(state.source.samples){if(channel!==0)throw Error('Automatic analysis retains channel 0. Select channel 0 for refinement.');const sourceSR=state.source.sr;return {samples:state.source.samples.slice(Math.round(start*sourceSR),Math.round((start+length)*sourceSR)),sr:sourceSR,start:Math.round(start*sourceSR)/sourceSR};}if(channel>=state.source.buffer.numberOfChannels)throw Error('That channel is not present in this recording.');const original=state.source.buffer,first=Math.round(start*original.sampleRate),count=Math.round(length*original.sampleRate),offline=new OfflineAudioContext(1,Math.ceil(length*sr),sr),mono=offline.createBuffer(1,count,original.sampleRate);mono.copyToChannel(original.getChannelData(channel).subarray(first,first+count),0);const source=offline.createBufferSource();source.buffer=mono;source.connect(offline.destination);source.start();const rendered=await offline.startRendering();return {samples:rendered.getChannelData(0).slice(),sr,start:first/original.sampleRate};}
$('analyze').onclick=async()=>{try{status('Building spectrogram…');const revision=state.sourceRevision;const audio=await croppedAudio();if(revision!==state.sourceRevision)return;const spec=await job('spectrum',{samples:audio.samples,sr:audio.sr,options:{startS:audio.start,windowS:number('window'),hopS:number('hop'),minHz:number('spec-low'),maxHz:number('spec-high')}});if(spec.times_s.length<2)throw Error('Choose a longer crop or shorter FFT window; at least two analysis frames are required.');state.spec=spec;state.ridge=null;state.view=null;$('ridge-details').hidden=true;$('anchors').value='';set('event-start',spec.times_s[0]);set('event-end',spec.times_s.at(-1));set('band-low',spec.frequencies_hz[0]);set('band-high',spec.frequencies_hz.at(-1));if(state.demo&&spec.times_s[0]<=25&&spec.times_s.at(-1)>=100&&spec.frequencies_hz[0]<=100&&spec.frequencies_hz.at(-1)>=210){set('event-start',25);set('event-end',100);set('band-low',100);set('band-high',210);}['extract','reset-view','zoom-view','play-selection'].forEach(id=>$(id).disabled=false);$('spectrum-empty').hidden=true;$('resolution').textContent=`${spec.frequency_resolution_hz.toFixed(3)} HZ / ${spec.actual_window_s.toFixed(3)} S WINDOW`;drawSpectrum();status('Spectrogram ready. Select a flyover and extract its curve.','success');$('curves').scrollIntoView({behavior:'smooth',block:'start'});}catch(e){report(e);}};
function bounds(){const s=state.spec;return state.view||{t0:s.times_s[0],t1:s.times_s.at(-1),f0:s.frequencies_hz[0],f1:s.frequencies_hz.at(-1)};}
const plot={left:66,right:20,top:20,bottom:43};
function axes(canvas,b,dark=false,xlabel='Recording time · seconds',ylabel='Frequency · Hz'){b={...b};if(b.t1===b.t0){b.t0-=.0001;b.t1+=.0001;}if(b.f1===b.f0){b.f0-=.0001;b.f1+=.0001;}const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,L=plot.left,R=w-plot.right,T=plot.top,B=h-plot.bottom;c.fillStyle=dark?'#1c2a24':'#fff';c.fillRect(0,0,w,h);c.font='11px system-ui';c.textBaseline='middle';for(let i=0;i<=5;i++){const x=L+(R-L)*i/5,y=B-(B-T)*i/5;c.strokeStyle=dark?'#30283e':'#eee9f4';c.beginPath();c.moveTo(x,T);c.lineTo(x,B);c.moveTo(L,y);c.lineTo(R,y);c.stroke();c.fillStyle=dark?'#b3a6c7':'#94849e';c.textAlign='center';c.fillText((b.t0+(b.t1-b.t0)*i/5).toFixed(xlabel.includes('Longitude')?4:1),x,B+17);c.textAlign='right';c.fillText((b.f0+(b.f1-b.f0)*i/5).toFixed(ylabel.includes('Latitude')?4:0),L-10,y);}c.textAlign='center';c.fillText(xlabel,(L+R)/2,h-6);c.save();c.translate(13,(T+B)/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();return {c,L,R,T,B,x:t=>L+(t-b.t0)/(b.t1-b.t0)*(R-L),y:f=>B-(f-b.f0)/(b.f1-b.f0)*(B-T)};}
function color(v){const stops=[[18,29,25],[38,57,47],[67,85,59],[114,117,70],[189,155,85],[253,225,156]],q=Math.max(0,Math.min(.9999,v))*5,i=Math.floor(q),f=q-i;return stops[i].map((x,k)=>Math.round(x+(stops[i+1][k]-x)*f));}
function drawSpectrum(){const canvas=$('spectrum');if(!state.spec){canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);return;}const s=state.spec,b=bounds(),a=axes(canvas,b,true),{c,L,R,T,B}=a,pw=R-L,ph=B-T,img=c.createImageData(pw,ph),times=s.times_s,freq=s.frequencies_hz,dt=times[1]-times[0],df=freq[1]-freq[0],values=[];for(let f=0;f<freq.length;f+=Math.max(1,Math.floor(freq.length/80)))for(let t=0;t<times.length;t+=Math.max(1,Math.floor(times.length/150)))values.push(s.power_db[f][t]);values.sort((a,b)=>a-b);const low=values[Math.floor(values.length*.35)],high=values[Math.floor(values.length*.998)];for(let y=0;y<ph;y++){const fi=Math.max(0,Math.min(freq.length-1,Math.round((b.f1-(b.f1-b.f0)*y/ph-freq[0])/df)));for(let x=0;x<pw;x++){const ti=Math.max(0,Math.min(times.length-1,Math.round((b.t0+(b.t1-b.t0)*x/pw-times[0])/dt))),rgb=color((s.power_db[fi][ti]-low)/Math.max(1,high-low)),i=4*(y*pw+x);img.data.set([...rgb,255],i);}}c.putImageData(img,L,T);c.save();c.beginPath();c.rect(L,T,pw,ph);c.clip();if(state.ridge){line(c,a,state.ridge.times_s,state.ridge.frequencies_hz,'#61ead4',2.5);}else{for(const event of state.detections)line(c,a,event.times_s,event.frequencies_hz,'#61ead4',2);}try{const anchors=parseAnchors();c.fillStyle='#87ecdf';for(const point of anchors){c.beginPath();c.arc(a.x(point.time_s),a.y(point.frequency_hz),4,0,2*Math.PI);c.fill();}}catch{}try{const t0=number('event-start'),t1=number('event-end'),f0=number('band-low'),f1=number('band-high');c.strokeStyle='#ffffff70';c.setLineDash([5,5]);c.strokeRect(a.x(t0),a.y(f1),a.x(t1)-a.x(t0),a.y(f0)-a.y(f1));}catch{}c.restore();}
function line(c,a,t,f,stroke,width=2){const gaps=Array.from(t).slice(1).map((v,i)=>v-t[i]).sort((x,y)=>x-y),gapLimit=3*(gaps[Math.floor(gaps.length/2)]||Infinity);c.strokeStyle=stroke;c.lineWidth=width;c.beginPath();let active=false;for(let i=0;i<t.length;i++){if(!Number.isFinite(f[i])){active=false;continue;}if(i&&t[i]-t[i-1]>gapLimit)active=false;const x=a.x(t[i]),y=a.y(f[i]);if(!active)c.moveTo(x,y);else c.lineTo(x,y);active=true;}c.stroke();}
function point(event){const canvas=$('spectrum'),rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)*canvas.width/rect.width,y=(event.clientY-rect.top)*canvas.height/rect.height,b=bounds();if(x<plot.left||x>canvas.width-plot.right||y<plot.top||y>canvas.height-plot.bottom)return null;return {time_s:b.t0+(x-plot.left)/(canvas.width-plot.left-plot.right)*(b.t1-b.t0),frequency_hz:b.f1-(y-plot.top)/(canvas.height-plot.top-plot.bottom)*(b.f1-b.f0)};}
$('spectrum').onmousemove=event=>{if(!state.spec)return;const p=point(event);if(p)$('cursor').textContent=`${p.time_s.toFixed(2)} seconds · ${p.frequency_hz.toFixed(2)} Hz`;};
$('spectrum').onclick=event=>{if(!state.spec||!$('anchor-mode').checked)return;const p=point(event);if(!p)return;const old=$('anchors').value.trim();$('anchors').value=(old?old+'\n':'')+`${p.time_s.toFixed(3)},${p.frequency_hz.toFixed(3)}`;$('anchors').closest('details').open=true;drawSpectrum();};
function parseAnchors(){return $('anchors').value.split('\n').filter(s=>s.trim()).map((line,i)=>{const values=line.split(',').map(Number);if(values.length!==2||values.some(v=>!Number.isFinite(v)))throw Error(`Guide point ${i+1}: enter time,frequency.`);return {time_s:values[0],frequency_hz:values[1]};});}
$('anchors').oninput=drawSpectrum;$('clear-anchors').onclick=()=>{$('anchors').value='';drawSpectrum();};
['event-start','event-end','band-low','band-high'].forEach(id=>$(id).addEventListener('change',drawSpectrum));
$('zoom-view').onclick=()=>{try{const b={t0:number('event-start'),t1:number('event-end'),f0:number('band-low'),f1:number('band-high')},s=state.spec;if(!(b.t1>b.t0&&b.f1>b.f0&&b.t0>=s.times_s[0]&&b.t1<=s.times_s.at(-1)&&b.f0>=s.frequencies_hz[0]&&b.f1<=s.frequencies_hz.at(-1)))throw Error('Choose a valid rectangle inside the spectrogram.');state.view=b;drawSpectrum();}catch(e){report(e);}};
$('reset-view').onclick=()=>{state.view=null;drawSpectrum();};
let selectionEnd=null;
$('play-selection').onclick=()=>{try{const player=state.source?.kind==='synthetic'?$('demo-player'):$('media-player');const start=number('event-start'),end=number('event-end');if(start<0||end<=start)throw Error('Choose a valid event interval.');selectionEnd=end;player.currentTime=start;player.play().catch(report);}catch(e){report(e);}};
for(const id of ['media-player','demo-player'])$(id).addEventListener('timeupdate',()=>{if(selectionEnd!=null&&$(id).currentTime>=selectionEnd){$(id).pause();selectionEnd=null;}});
$('extract').onclick=async()=>{try{if(!state.spec)throw Error('Build a spectrogram first.');status('Extracting the continuous tonal ridge…');const options={startS:number('event-start'),endS:number('event-end'),minHz:number('band-low'),maxHz:number('band-high'),maxSlopeHzS:number('slope'),anchors:parseAnchors()};state.ridge=await job('ridge',{spec:state.spec,options});state.ridge.selection=options;state.ridge.provenance=state.source.kind;$('ridge-details').hidden=false;$('ridge-info').textContent=`${state.ridge.times_s.length} trace samples · ${[...new Set(state.ridge.warnings||[])].join(' ')}`;set('event-name',`Flyover ${state.events.length+1}`);drawSpectrum();status('Curve extracted. Inspect the turquoise overlay, then save the event.','success');}catch(e){report(e);}};
$('save-event').onclick=()=>{if(!state.ridge)return;state.events.push({...structuredClone(state.ridge),name:$('event-name').value.trim()||`Flyover ${state.events.length+1}`,flight_id:'auto'});invalidate();renderEvents();status('Event saved. Select a second flyover or continue to flight matching.','success');};
$('reference-events').onclick=()=>{if(!state.demo)return;state.events=state.demo.events.map((e,i)=>({...e,name:`Synthetic reference ${i+1}`,flight_id:'auto',provenance:'synthetic_reference'}));invalidate();renderEvents();status('Synthetic reference curves loaded. These bypass extraction; use them to check the matching stage.','success');};
function renderEvents(){const host=$('events');host.replaceChildren();host.className=state.events.length?'':'empty-list';if(!state.events.length)host.textContent='Extract and save one or more flyovers.';state.events.forEach((event,i)=>{const card=document.createElement('div');card.className='event-card';const text=document.createElement('div'),title=document.createElement('b'),sub=document.createElement('small');title.textContent=event.name||`Event ${i+1}`;sub.textContent=`${event.times_s[0].toFixed(1)}–${event.times_s.at(-1).toFixed(1)} s · ${event.times_s.length} samples${event.synthetic||event.provenance?.includes('synthetic')?' · SYNTHETIC':''}`;text.append(title,sub);card.append(text);const select=document.createElement('select');select.setAttribute('aria-label',`Aircraft for ${event.name||`event ${i+1}`}`);for(const id of ['auto',...state.tracks.map(t=>t.flight_id)]){const option=document.createElement('option');option.value=id;option.textContent=id==='auto'?'Compare all imported flights':id;select.append(option);}if(![...select.options].some(o=>o.value===event.flight_id))event.flight_id='auto';select.value=event.flight_id||'auto';select.onchange=()=>{event.flight_id=select.value;invalidate();};const remove=document.createElement('button');remove.textContent='Remove';remove.onclick=()=>{state.events.splice(i,1);invalidate();renderEvents();};card.append(select,remove);host.append(card);});$('event-count').textContent=state.events.length;$('export-events').disabled=!state.events.length;}
$('export-ridge').onclick=()=>{if(state.ridge)download('doppler-curve.json',state.ridge);};
$('export-events').onclick=()=>download('doppler-events.json',{schema_version:1,source:sourceMetadata(),events:state.events});
function sourceMetadata(){if(!state.source)return {kind:'imported_curves'};return {kind:state.source.kind,name:state.source.name,size_bytes:state.source.size_bytes||null,duration_s:state.source.duration||null,analysis_sample_rate:state.source.sr||null,analysis_channel:0,sha256:state.source.sha256||null};}
$('event-file').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>10*1024**2)throw Error('Curve JSON must be smaller than 10 MB.');const revision=state.sourceRevision;const events=importEvents(await file.text());if(revision!==state.sourceRevision)return;state.events=events;invalidate();renderEvents();status(`Imported ${events.length} events. Check aircraft bindings and the original recording UTC start.`,'success');}catch(e){report(e);}finally{$('event-file').value='';}};
async function fileText(file){if(file.size>64*1024**2)throw Error('Each flight file must be smaller than 64 MB.');if(file.name.toLowerCase().endsWith('.gz')){if(!window.DecompressionStream)throw Error('This browser cannot expand gzip; unzip the trace first.');const reader=file.stream().pipeThrough(new DecompressionStream('gzip')).getReader();const chunks=[];let size=0;while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>64*1024**2){await reader.cancel();throw Error('Expanded trace exceeds 64 MB. Select a smaller track file.');}chunks.push(value);}return new Blob(chunks).text();}return file.text();}
$('track-files').onchange=async event=>{try{const files=[...event.target.files];if(!files.length)return;if(files.length>100)throw Error('Import at most 100 flight files.');if(files.reduce((sum,f)=>sum+f.size,0)>64*1024**2)throw Error('Keep the entire import under 64 MB.');const revision=state.sourceRevision;status('Reading local flight files…');const tracks=[];for(const file of files){const text=await fileText(file);tracks.push(...parseTracks(text,{format:file.name.toLowerCase().endsWith('.csv')?'csv':'json',altitudeSource:$('altitude-source').value}));if(revision!==state.sourceRevision)return;if(tracks.reduce((n,t)=>n+t.times_utc.length,0)>500000||tracks.length>100)throw Error('Keep the combined import under 500,000 points and 100 tracks.');}if(tracks.length>100)throw Error('Use at most 100 candidate flight tracks.');if(new Set(tracks.map(t=>t.flight_id)).size!==tracks.length)throw Error('Duplicate flight IDs. Merge points into one track per aircraft before importing.');state.tracks=tracks;invalidate();renderTracks();renderEvents();status(`Imported ${tracks.length} flight tracks. Enter recording time and search bounds.`,'success');}catch(e){report(e);}finally{$('track-files').value='';}};
function renderTracks(){const host=$('tracks');host.replaceChildren();host.className=state.tracks.length?'':'empty-list';if(!state.tracks.length){host.textContent='No flight tracks imported.';return;}const list=document.createElement('div');for(const track of state.tracks){const row=document.createElement('div');row.className='event-card';const main=document.createElement('div'),title=document.createElement('b'),sub=document.createElement('small');title.textContent=track.flight_id;sub.textContent=`${track.times_utc.length} positions · ${iso(track.times_utc[0])} → ${iso(track.times_utc.at(-1))} · ${track.altitude_datum}`;main.append(title,sub);row.append(main);list.append(row);}host.append(list);const warnings=[...new Set(state.tracks.flatMap(t=>t.warnings||[]))];if(warnings.length){const p=document.createElement('p');p.className='muted';p.textContent=warnings.join(' ');host.append(p);}}
function utc(text){if(!/(Z|[+-]\d{2}:\d{2})$/.test(text.trim()))throw Error('Recording time needs an explicit timezone: for example 2026-11-02T20:37:00Z.');const n=Date.parse(text.trim())/1000;if(!Number.isFinite(n))throw Error('Enter a valid UTC recording timestamp.');return n;}
$('search').onclick=async()=>{try{if(!state.events.length||!state.tracks.length)throw Error('Save or import curves, and load flight tracks before searching.');invalidate();const config={south:number('south'),north:number('north'),west:number('west'),east:number('east'),spacing_m:number('spacing'),elevation_m:number('elevation'),sound_speed_m_s:number('sound-speed'),time_range_s:number('offset-range'),time_step_s:number('offset-step'),recording_start_utc:utc($('recording-time').value)};if(config.spacing_m<25||config.time_range_s<0||config.time_step_s<=0)throw Error('Use grid spacing ≥25 m, a nonnegative time range, and positive time step.');const candidates=candidateGrid(config.south,config.north,config.west,config.east,config.spacing_m,config.elevation_m,2500),n=Math.floor(config.time_range_s/config.time_step_s);if(n>100)throw Error('Use at most 201 time offsets. Narrow the interval or increase its step.');const offsets=Array.from({length:2*n+1},(_,i)=>(i-n)*config.time_step_s),work=candidates.length*offsets.length*state.events.reduce((sum,e)=>sum+(e.flight_id==='auto'?state.tracks.length:1),0);if(work>100000)throw Error(`Search needs ${work.toLocaleString()} comparisons. Narrow the bounds, increase spacing, or bind an aircraft (limit 100,000).`);const events=structuredClone(state.events),tracks=structuredClone(state.tracks),source=sourceMetadata();status(`Comparing ${candidates.length} locations and ${offsets.length} shared time offsets…`);const output=await job('search',{events,tracks,candidates,recordingStartUtc:config.recording_start_utc,options:{timeOffsetsS:offsets,soundSpeed:config.sound_speed_m_s}});if(!output.results.length)throw Error('No candidate has full track coverage for these events. Check UTC time, event timing, and gaps in the imported tracks.');state.result={schema_version:1,source,config,events,tracks,...output,note:'Ranked frequency-fit errors, not confidence probabilities. Constant elevation and sound speed.'};renderResults();status('Comparison complete. Inspect both curve overlays and alternative candidates.','success');}catch(e){report(e);}};
function renderResults(){const {results,detail}=state.result,best=results[0],o=best.observer||best;$('results').hidden=false;$('export-results').disabled=false;$('best-location').textContent=`${o.latitude.toFixed(6)}, ${o.longitude.toFixed(6)}`;$('fit-score').textContent=`${best.score.toFixed(3)} Hz combined RMSE · recording start ${iso(best.recording_start_utc)} · fit score, not confidence`;const body=$('ranking');body.replaceChildren();results.slice(0,15).forEach((r,i)=>{const o=r.observer||r,row=document.createElement('tr');for(const v of [i+1,o.latitude.toFixed(6),o.longitude.toFixed(6),r.score.toFixed(3),iso(r.recording_start_utc)]){const cell=document.createElement('td');cell.textContent=v;row.append(cell);}body.append(row);});const config=state.result.config,a=axes($('location-plot'),{t0:config.west,t1:config.east,f0:config.south,f1:config.north},false,'Longitude','Latitude'),max=results.at(-1).score||1;for(const r of [...results].reverse()){const o=r.observer||r,v=1-r.score/max;a.c.fillStyle=`hsl(${245-80*v},${25+35*v}%,${85-40*v}%)`;a.c.beginPath();a.c.arc(a.x(o.longitude),a.y(o.latitude),4,0,2*Math.PI);a.c.fill();}a.c.strokeStyle='#ed785d';a.c.lineWidth=3;const x=a.x(o.longitude),y=a.y(o.latitude);a.c.beginPath();a.c.moveTo(x-6,y-6);a.c.lineTo(x+6,y+6);a.c.moveTo(x+6,y-6);a.c.lineTo(x-6,y+6);a.c.stroke();const host=$('fit-plots');host.replaceChildren();for(const [i,event] of detail.per_event.entries()){const wrap=document.createElement('div');wrap.className='fit-chart';const title=document.createElement('h4');title.textContent=`Event ${i+1} · ${event.flight_id} · ${event.rmse_hz.toFixed(3)} Hz RMSE · source tone ${event.f0_hz.toFixed(2)} Hz`;const canvas=document.createElement('canvas');canvas.width=1100;canvas.height=280;canvas.setAttribute('aria-label',`Event ${i+1}: extracted and predicted frequency curves`);const caption=document.createElement('p');caption.className='muted';caption.textContent='Rust: extracted trace · Teal: predicted flight curve';wrap.append(title,canvas,caption);host.append(wrap);const frequencies=[...event.observed_frequencies_hz,...event.predicted_frequencies_hz];let min=Infinity,max=-Infinity;for(const f of frequencies){min=Math.min(min,f);max=Math.max(max,f);}const padding=Math.max(2,(max-min)*.1),b={t0:event.times_s[0],t1:event.times_s.at(-1),f0:min-padding,f1:max+padding},p=axes(canvas,b);line(p.c,p,event.times_s,event.observed_frequencies_hz,'#a65a34',3);line(p.c,p,event.times_s,event.predicted_frequencies_hz,'#4aa79e',2);}$('result-warnings').textContent=[...new Set(detail.warnings||[])].join(' ');}
$('export-results').onclick=()=>{if(state.result)download('doppler-analysis.json',state.result);};
// An altered search form must never leave a previous ranking presented as current.
['recording-time','south','north','west','east','spacing','elevation','sound-speed','offset-range','offset-step'].forEach(id=>$(id).addEventListener('input',invalidate));
window.addEventListener('beforeunload',()=>{if(state.worker)state.worker.terminate();if(state.url)URL.revokeObjectURL(state.url);});

function clockLabel(value){const seconds=Math.floor(value),hours=Math.floor(seconds/3600),minutes=Math.floor((seconds%3600)/60);return `${hours?hours+':':''}${hours?String(minutes).padStart(2,'0'):minutes}:${String(seconds%60).padStart(2,'0')}`;}
async function runAutomatic(){
  if(!state.source)throw Error('Choose a recording first.');
  const revision=state.sourceRevision;
  invalidate();
  const output=state.source.samples
    ?await job('autoPCM',{samples:state.source.samples,sr:state.source.sr})
    :isVideoFile(state.source.file)?await decodeVideoAndScan(state.source.file,revision):await job('autoFile',{file:state.source.file});
  if(revision!==state.sourceRevision||!output)return;
  applyAutomatic(output);
}
function applyAutomatic(output){
  state.source.samples=output.samples;state.source.sr=output.sr;
  state.source.duration=output.samples.length/output.sr;
  state.source.channels=output.decode_info?.channels||state.source.channels||1;
  state.scan={diagnostics:output.diagnostics,decode_info:output.decode_info};
  state.detections=output.events.map(e=>({...e,provenance:state.source.kind==='synthetic'?'synthetic_automatic':'automatic_audio_detection'}));
  state.events=state.detections.map(e=>structuredClone(e));
  state.spec=output.overview;state.ridge=null;state.view=null;
  $('ridge-details').hidden=true;$('anchors').value='';
  $('rescan').disabled=false;$('export-auto').disabled=false;$('analyze').disabled=false;
  set('crop-start',0);set('crop-duration',Math.min(120,state.source.duration));set('channel',0);
  $('source-detail').textContent=`${clockLabel(state.source.duration)} scanned · ${(output.sr/1000).toFixed(1)} kHz analysis · channel 0 · ${state.source.kind==='synthetic'?'synthetic demonstration':'local processing'}`;
  $('scan-summary').textContent=state.detections.length
    ?`${state.detections.length} candidate tonal pass${state.detections.length===1?'':'es'} found across ${clockLabel(state.source.duration)}. Strongest traces appear first. Gray points show measured frequencies; rust lines show fitted shapes. Timestamps refer to the original recording.`
    :`Scanned all ${clockLabel(state.source.duration)}. No sufficiently supported descending curves passed the detector. This does not prove there are no aircraft sounds; manual inspection is still available below.`;
  if(state.spec){
    $('spectrum-empty').hidden=true;
    $('resolution').textContent='FULL RECORDING OVERVIEW';
    set('event-start',state.spec.times_s[0]);set('event-end',state.spec.times_s.at(-1));
    set('band-low',state.spec.frequencies_hz[0]);set('band-high',state.spec.frequencies_hz.at(-1));
    ['reset-view','zoom-view','play-selection'].forEach(id=>$(id).disabled=false);$('extract').disabled=true;
  }
  renderDetections();renderEvents();drawSpectrum();
  status(`Automatic scan complete: ${state.detections.length} candidate curve${state.detections.length===1?'':'s'}. No time ranges or guide points required.`,'success');
  $('curves').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderDetections(){
  const host=$('detections');host.replaceChildren();
  for(const [i,event] of state.detections.entries()){
    const card=document.createElement('article');card.className='detection-card';
    const header=document.createElement('div');header.className='detection-head';
    const title=document.createElement('h3');title.textContent=`Curve ${i+1}`;
    const tag=document.createElement('span');tag.className='pill';tag.textContent='AUTOMATIC CANDIDATE';header.append(title,tag);
    const stamp=document.createElement('div');stamp.className='detection-time';stamp.textContent=`${clockLabel(event.times_s[0])}–${clockLabel(event.times_s.at(-1))}`;
    const meta=document.createElement('p');meta.className='muted';
    const raw=event.raw_frequencies_hz||event.frequencies_hz;
    const fitted=event.fitted_frequencies_hz||event.model_frequencies_hz||event.smoothed_frequencies_hz||event.frequencies_hz;
    let lo=Infinity,hi=-Infinity;for(const list of [raw,fitted])for(const f of list)if(Number.isFinite(f)){lo=Math.min(lo,f);hi=Math.max(hi,f);}
    const rmse=event.fit_rmse_hz??event.rmse_hz;
    meta.textContent=`${lo.toFixed(1)}–${hi.toFixed(1)} Hz${Number.isFinite(rmse)?` · ${rmse.toFixed(2)} Hz shape-fit error`:''}${Number.isFinite(event.coverage)?` · ${Math.round(event.coverage*100)}% supported`:''}`;
    const canvas=document.createElement('canvas');canvas.width=650;canvas.height=250;canvas.setAttribute('aria-label',`Detected curve ${i+1} frequency versus original recording time`);
    const actions=document.createElement('div');actions.className='actions';
    const inspect=document.createElement('button');inspect.textContent='Inspect in audio';inspect.onclick=()=>inspectDetection(i).catch(report);
    const play=document.createElement('button');play.textContent='Play interval';play.onclick=()=>{const player=state.source.kind==='synthetic'?$('demo-player'):$('media-player');player.currentTime=event.times_s[0];selectionEnd=event.times_s.at(-1);player.play().catch(report);};
    const exportOne=document.createElement('button');exportOne.textContent='Export';exportOne.onclick=()=>download(`doppler-curve-${i+1}.json`,event);
    actions.append(inspect,play,exportOne);card.append(header,stamp,meta,canvas,actions);host.append(card);
    const padding=Math.max(3,(hi-lo)*.12),a=axes(canvas,{t0:event.times_s[0],t1:event.times_s.at(-1),f0:lo-padding,f1:hi+padding});
    a.c.fillStyle='#a7a0b680';for(let j=0;j<event.times_s.length;j++){if(!Number.isFinite(raw[j]))continue;a.c.beginPath();a.c.arc(a.x(event.times_s[j]),a.y(raw[j]),1.7,0,2*Math.PI);a.c.fill();}
    line(a.c,a,event.times_s,fitted,'#a65a34',2.2);
  }
}
async function inspectDetection(index){
  const event=state.detections[index];if(!event||!state.source?.samples)return;const revision=state.sourceRevision;
  const sr=state.source.sr,start=Math.max(0,event.times_s[0]-10),end=Math.min(state.source.duration,event.times_s.at(-1)+10);
  let low=Infinity,high=-Infinity;for(const f of event.frequencies_hz){low=Math.min(low,f);high=Math.max(high,f);}
  const spec=await job('spectrum',{samples:state.source.samples.slice(Math.floor(start*sr),Math.ceil(end*sr)),sr,
    options:{startS:start,windowS:2,hopS:.1,minHz:Math.max(40,low*.8),maxHz:Math.min(1000,high*1.2)}});
  if(revision!==state.sourceRevision)return;state.spec=spec;state.ridge=event;state.view=null;$('extract').disabled=false;
  set('event-start',Math.max(event.times_s[0],spec.times_s[0]));set('event-end',Math.min(event.times_s.at(-1),spec.times_s.at(-1)));
  set('band-low',spec.frequencies_hz[0]);set('band-high',spec.frequencies_hz.at(-1));set('crop-start',start);set('crop-duration',end-start);
  $('resolution').textContent=`CURVE ${index+1} · ${spec.frequency_resolution_hz.toFixed(3)} HZ BINS`;
  drawSpectrum();$('spectrum').scrollIntoView({behavior:'smooth',block:'center'});
}
$('rescan').onclick=()=>runAutomatic().catch(report);
$('export-auto').onclick=()=>download('detected-doppler-curves.json',{schema_version:2,source:sourceMetadata(),...state.scan,events:state.detections});

$('export-job').onclick=()=>{try{
 if(!state.events.length)throw Error('Analyze a recording or import measured curves first.');
 const suppliedTime=$('recording-time').value.trim();
 const recording=suppliedTime?iso(utc(suppliedTime)):null;
 const completeBounds=['south','north','west','east'].every(id=>$(id).value.trim());
 const bounds=completeBounds?{lat_min:number('south'),lat_max:number('north'),lon_min:number('west'),lon_max:number('east')}:null;
 const job={schema_version:1,workflow_version:'2026-11-02.1',events:structuredClone(state.events),source:sourceMetadata(),recording_start_utc:recording,tracks:['tracks.json'],
 search:{bounds,spacing_m:number('spacing'),elevation_m:number('elevation'),sound_speed_m_s:number('sound-speed'),time_range_s:number('offset-range'),time_step_s:number('offset-step'),max_grid_points:250,max_evaluations:4000,max_refinements:8},
 archive:{date:recording?.slice(0,10)||null,flight_ids:[],max_download_mb:256},reference_location:null,
 notes:['Measured event timestamps retain the original recording clock.','Unknown recording time and bounds must be supplied before matching.','Run python -m doppler_lab check job.json to list missing inputs.']};
 download('job.json',job);$('workflow-info').textContent=`Exported ${state.events.length} measured events. ${recording?'Recording clock supplied.':'Recording clock is still unknown.'} ${bounds?'Search bounds supplied.':'Search bounds are still unknown.'} Open the setup guide to retrieve tracks and run the fit.`;
 status('Matching job exported for the local Python workflow.','success');
}catch(e){report(e);}};

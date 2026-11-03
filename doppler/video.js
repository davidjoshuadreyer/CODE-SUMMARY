/** Private MOV/MP4 AAC audio extraction. No video decoding, transcoding or uploads. */
import {createFile} from './vendor/mp4box-2.5.0/mp4box.all.mjs';
import {createStreamingResampler} from './decode.js';
const MAX_VIDEO_BYTES=2*1024**3,MAX_METADATA_BYTES=32*1024**2,MAX_DURATION=7200;
const typeAt=(bytes,offset)=>String.fromCharCode(...bytes.subarray(offset,offset+4));
function boxes(bytes,start=0,end=bytes.length){
 const out=[];let pos=start;
 while(pos<end){if(end-pos<8)throw Error('Truncated MOV/MP4 box header.');const v=new DataView(bytes.buffer,bytes.byteOffset+pos,end-pos);let size=v.getUint32(0),header=8;if(size===1){if(end-pos<16)throw Error('Truncated extended box header.');size=Number(v.getBigUint64(8));header=16;}if(size===0)size=end-pos;if(!Number.isSafeInteger(size)||size<header||pos+size>end)throw Error('Invalid MOV/MP4 box size.');out.push({type:typeAt(bytes,pos+4),start:pos,size,header,payload:pos+header,end:pos+size});pos+=size;}
 return out;
}
function child(bytes,box,type){return boxes(bytes,box.payload,box.end).find(b=>b.type===type);}
function join(parts){const output=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){output.set(p,offset);offset+=p.length;}return output;}
function box(type,payload){const out=new Uint8Array(8+payload.length);new DataView(out.buffer).setUint32(0,out.length);for(let i=0;i<4;i++)out[4+i]=type.charCodeAt(i);out.set(payload,8);return out;}
const ftyp=box('ftyp',new Uint8Array([77,52,65,32,0,0,0,0,77,52,65,32,105,115,111,109,109,112,52,50]));
function normalizeAudioMetadata(raw){
 const containers=new Set(['moov','trak','mdia','minf','stbl']);
 function rewrite(bytes){const b=boxes(bytes)[0];
  if(containers.has(b.type))return box(b.type,join(boxes(bytes,b.payload,b.end).map(c=>rewrite(bytes.slice(c.start,c.end)))));
  if(b.type==='stsz'||b.type==='stz2'){
   if(b.size<20)throw Error('Truncated audio sample table.');
   const count=new DataView(bytes.buffer,bytes.byteOffset).getUint32(b.payload+8);
   if(count>750000)throw Error('Audio packet count exceeds processing limit.');
  }
  if(b.type==='stts'){
   const view=new DataView(bytes.buffer,bytes.byteOffset),count=view.getUint32(b.payload+4);if(count>750000||b.payload+8+count*8>b.end)throw Error('Invalid audio timing table.');
   let total=0;for(let i=0;i<count;i++)total+=view.getUint32(b.payload+8+i*8);if(total>750000)throw Error('Audio timing count exceeds processing limit.');
  }
  if(b.type!=='stsd')return bytes;
  if(b.size<16)throw Error('Truncated audio descriptions.');
  const head=bytes.slice(b.payload,b.payload+8),entries=boxes(bytes,b.payload+8,b.end).map(entry=>{
   const data=bytes.slice(entry.start,entry.end);if(entry.type!=='mp4a')return data;
   if(data.length<36)throw Error('Truncated AAC description.');const view=new DataView(data.buffer),version=view.getUint16(16);
   if(version!==0&&version!==1)throw Error('Unsupported QuickTime audio description. Export standard AAC audio.');
   const childStart=version===1?52:36;if(data.length<childStart)throw Error('Truncated QuickTime audio description.');
   const children=boxes(data,childStart,data.length);let esds=children.find(c=>c.type==='esds');let descriptor=esds&&data.slice(esds.start,esds.end);
   if(!descriptor){const wave=children.find(c=>c.type==='wave');if(wave){esds=boxes(data,wave.payload,wave.end).find(c=>c.type==='esds');if(esds)descriptor=data.slice(esds.start,esds.end);}}
   if(!descriptor)throw Error('AAC configuration missing from MOV/MP4 audio description.');
   const fixed=data.slice(8,36);new DataView(fixed.buffer).setUint16(8,0);return box('mp4a',join([fixed,descriptor]));
  });
  return box('stsd',join([head,...entries]));
 }
 return rewrite(raw);
}
function audioOnlyMoov(raw,{dropEdits=false,selectedId=null}={}){
 const top=boxes(raw)[0],children=boxes(raw,top.payload,top.end),kept=[];let audioCount=0;
 if(children.some(b=>b.type==='mvex'))throw Error('Fragmented MP4 is not supported yet. Choose the original Camera Roll video or export a standard MOV/MP4.');
 for(const c of children){
  if(c.type==='mvhd'){kept.push(raw.slice(c.start,c.end));continue;}
  if(c.type!=='trak')continue;
  const mdia=child(raw,c,'mdia'),hdlr=mdia&&child(raw,mdia,'hdlr');
  if(!hdlr||typeAt(raw,hdlr.payload+8)!=='soun')continue;
  const tkhd=child(raw,c,'tkhd');if(!tkhd)throw Error('Audio track header missing.');
  const v=new DataView(raw.buffer,raw.byteOffset),id=v.getUint32(tkhd.payload+(raw[tkhd.payload]===1?20:12));
  if(selectedId!=null&&id!==selectedId)continue;
  audioCount++;
  const parts=boxes(raw,c.payload,c.end).filter(b=>!(dropEdits&&b.type==='edts')).map(b=>raw.slice(b.start,b.end));
  kept.push(box('trak',join(parts)));
 }
 if(!audioCount)throw Error('This video has no audio track. Choose a video recorded with sound.');
 return box('moov',join(kept));
}
/** Read top-level headers and bounded metadata; never load the video payload. */
export async function inspectMP4(file){
 if(!file||!Number.isSafeInteger(file.size)||file.size<16||file.size>MAX_VIDEO_BYTES||typeof file.slice!=='function')throw Error('Choose a nonempty MOV/MP4 video under 2 GB.');
 let offset=0,moov=null,count=0;
 while(offset<file.size){
  if(++count>10000)throw Error('Too many media boxes.');
  const head=new Uint8Array(await file.slice(offset,Math.min(file.size,offset+16)).arrayBuffer());if(head.length<8)throw Error('Truncated video container.');
  const view=new DataView(head.buffer);let size=view.getUint32(0),header=8;const type=typeAt(head,4);
  if(size===1){if(head.length<16)throw Error('Truncated video container.');size=Number(view.getBigUint64(8));header=16;}
  if(size===0)size=file.size-offset;
  if(!Number.isSafeInteger(size)||size<header||offset+size>file.size)throw Error('Invalid video container size.');
  if(type==='moov'){if(size>MAX_METADATA_BYTES)throw Error('Video metadata is too large; trim the recording first.');moov=new Uint8Array(await file.slice(offset,offset+size).arrayBuffer());break;}
  if(type==='moof')throw Error('Fragmented MP4 is unsupported; choose an original Camera Roll video.');
  offset+=size;
 }
 if(!moov)throw Error('No movie metadata found. Choose a standard .mov or .mp4 Camera Roll video.');
 const audioMoov=normalizeAudioMetadata(audioOnlyMoov(moov)),metadata=join([ftyp,audioMoov]),parser=createFile();let error=null;
 parser.onError=message=>{error=Error(String(message));};metadata.buffer.fileStart=0;parser.appendBuffer(metadata.buffer);
 if(error)throw error;
 const info=parser.getInfo(),audio=info.audioTracks?.[0];if(!audio)throw Error('This video has no usable audio track.');
 if(!/^mp4a\.40\./.test(audio.codec))throw Error(`This video's audio codec (${audio.codec}) is unsupported. Choose standard AAC audio, or export its audio as MP3/WAV.`);
 const track=parser.getTrackById(audio.id),entry=track.mdia.minf.stbl.stsd.entries[0],esds=entry.esds??entry.wave?.esds;
 const config=esds?.esd?.findDescriptor(4)?.findDescriptor(5)?.data;
 if(!config?.length)throw Error('AAC decoder configuration is missing.');
 const samples=track.samples.map(s=>({offset:s.offset,size:s.size,dts:s.dts,cts:s.cts,duration:s.duration,chunk_index:s.chunk_index}));
 if(!samples.length||samples.length>750000)throw Error('Unsupported or excessive audio packet count.');
 for(const s of samples)if(![s.offset,s.size,s.dts,s.cts,s.duration].every(Number.isFinite)||s.offset<0||s.size<=0||s.size>1024**2||s.offset+s.size>file.size||s.duration<=0)throw Error('Invalid audio sample table.');
 const duration=audio.movie_duration/audio.movie_timescale,mediaDuration=audio.duration/audio.timescale;
 if(!Number.isFinite(duration)||duration<=0||duration>MAX_DURATION||!Number.isFinite(mediaDuration)||mediaDuration<=0||mediaDuration>MAX_DURATION+10)throw Error('Video audio must be no longer than two hours.');
 const edits=audio.edits?.length?audio.edits.map(e=>({movie_duration_s:e.segment_duration/info.timescale,media_start_s:e.media_time<0?-1:e.media_time/audio.timescale,rate:e.media_rate_integer+e.media_rate_fraction/65536})):[{movie_duration_s:mediaDuration,media_start_s:0,rate:1}];
 if(edits.reduce((sum,e)=>sum+e.movie_duration_s,0)>MAX_DURATION)throw Error('Edited audio timeline exceeds two hours.');
 if(edits.some(e=>e.rate!==1||!Number.isFinite(e.movie_duration_s)||e.movie_duration_s<0))throw Error('Slow-motion/time-stretched audio edits are unsupported. Export the video at normal playback speed.');
 return {codec:audio.codec,config:new Uint8Array(config),samples,timescale:audio.timescale,source_sample_rate:audio.audio.sample_rate,channels:audio.audio.channel_count,duration,media_duration_s:mediaDuration,edits,track_id:audio.id,moov:normalizeAudioMetadata(audioOnlyMoov(moov,{selectedId:audio.id})),audio_track_count:info.audioTracks.length,metadata_bytes:metadata.length};
}
function timelineSegments(meta){let movieTime=0;return meta.edits.map(e=>{const out={...e,movie_start_s:movieTime};movieTime+=e.movie_duration_s;return out;});}
/** Place decoded media-time samples on the original movie timeline, including empty edits. */
export function mapMovieTimeline(media,meta,sr){
 const duration=Math.max(meta.duration,meta.edits.reduce((sum,e)=>sum+e.movie_duration_s,0));if(duration>MAX_DURATION)throw Error('Edited audio timeline exceeds two hours.');
 const output=new Float32Array(Math.ceil(duration*sr));
 for(const e of timelineSegments(meta)){
  if(e.media_start_s<0)continue;
  const first=Math.round(e.media_start_s*sr),to=Math.round(e.movie_start_s*sr),length=Math.min(Math.round(e.movie_duration_s*sr),media.length-first,output.length-to);
  if(first<0||length<0)throw Error('Audio edit references unavailable media time.');
  output.set(media.subarray(first,first+length),to);
 }
 return output;
}
/** Repack AAC only as M4A without edits, so native fallback can decode media time.
 * The original movie's edit list is applied explicitly afterward by mapMovieTimeline.
 */
export async function extractAudioM4A(file,{maxAudioBytes=128*1024**2}={}){
 const meta=await inspectMP4(file),moov=audioOnlyMoov(meta.moov,{selectedId:meta.track_id,dropEdits:true});
 const top=boxes(moov)[0],trak=child(moov,top,'trak'),mdia=child(moov,trak,'mdia'),minf=child(moov,mdia,'minf'),stbl=child(moov,minf,'stbl'),offsets=child(moov,stbl,'stco')??child(moov,stbl,'co64');
 if(!offsets)throw Error('Missing audio chunk offsets.');
 const view=new DataView(moov.buffer),count=view.getUint32(offsets.payload+4),sizes=new Float64Array(count),sourceOffsets=new Float64Array(count);
 for(const s of meta.samples){const i=s.chunk_index-1;if(i<0||i>=count)throw Error('Invalid audio chunk index.');if(!sizes[i])sourceOffsets[i]=s.offset;sizes[i]+=s.size;}
 const total=sizes.reduce((a,b)=>a+b,0);if(total>maxAudioBytes)throw Error('Audio is too large for this browser fallback. Use Safari 26 or newer for incremental video extraction.');
 let cursor=ftyp.length+moov.length+8;const parts=[];
 for(let i=0;i<count;i++){if(offsets.type==='co64')view.setBigUint64(offsets.payload+8+i*8,BigInt(cursor));else view.setUint32(offsets.payload+8+i*4,cursor);parts.push(file.slice(sourceOffsets[i],sourceOffsets[i]+sizes[i]));cursor+=sizes[i];}
 const header=new Uint8Array(8);new DataView(header.buffer).setUint32(0,total+8);header.set([109,100,97,116],4);
 return {blob:new Blob([ftyp,moov,header,...parts],{type:'audio/mp4'}),meta};
}
/** Incremental AAC decoding in a worker using native WebCodecs; video pixels never decoded. */
export async function decodeMP4(file,{onProgress,targetSR=4000}={}){
 const meta=await inspectMP4(file);
 if(typeof AudioDecoder==='undefined'||typeof EncodedAudioChunk==='undefined')throw Error('VIDEO_NATIVE_FALLBACK: Incremental video audio decoding needs a newer browser.');
 const config={codec:meta.codec,sampleRate:meta.source_sample_rate,numberOfChannels:meta.channels,description:meta.config};
 const supported=await AudioDecoder.isConfigSupported(config);if(!supported.supported)throw Error('VIDEO_NATIVE_FALLBACK: This browser cannot incrementally decode this AAC profile.');
 const resampler=createStreamingResampler(meta.source_sample_rate,targetSR),segments=timelineSegments(meta);
 const samples=new Float32Array(Math.ceil(Math.max(meta.duration,meta.edits.reduce((sum,e)=>sum+e.movie_duration_s,0))*targetSR));
 let total=0,error=null,expectedFrame=0;
 const append=piece=>{const begin=total,end=total+piece.length;for(const e of segments){if(e.media_start_s<0)continue;const mediaStart=Math.round(e.media_start_s*targetSR),mediaEnd=mediaStart+Math.round(e.movie_duration_s*targetSR),left=Math.max(begin,mediaStart),right=Math.min(end,mediaEnd);if(right>left){const to=Math.round(e.movie_start_s*targetSR)+left-mediaStart;samples.set(piece.subarray(left-begin,Math.min(right-begin,left-begin+samples.length-to)),to);}}total=end;};
 const decoder=new AudioDecoder({error:e=>{error=e;},output:audio=>{
  try{
   if(audio.sampleRate!==meta.source_sample_rate)throw Error('AAC output sample rate changed; unsupported profile.');
   const at=Math.round(audio.timestamp*meta.source_sample_rate/1e6),delta=at-expectedFrame;
   if(delta>1){if(delta>meta.source_sample_rate*30)throw Error('Audio packet gap exceeds 30 seconds.');const gap=resampler.process(new Float32Array(delta));append(gap);}
   const pcm=new Float32Array(audio.numberOfFrames);audio.copyTo(pcm,{planeIndex:0,format:'f32-planar'});
   const skip=Math.max(0,-delta),piece=resampler.process(pcm.subarray(skip));append(piece);expectedFrame=Math.max(expectedFrame,at+pcm.length);
  }catch(e){error=e;}finally{audio.close();}
 }});
 try{
  decoder.configure(supported.config);onProgress?.(0);
  // Group nearby packets into <=512KiB reads; interleaved video is never retained.
  for(let i=0;i<meta.samples.length;){
   const first=meta.samples[i];let end=first.offset+first.size,j=i+1;
   while(j<meta.samples.length&&meta.samples[j].offset>=first.offset&&meta.samples[j].offset+meta.samples[j].size-first.offset<=512*1024){end=Math.max(end,meta.samples[j].offset+meta.samples[j].size);j++;}
   const bytes=new Uint8Array(await file.slice(first.offset,end).arrayBuffer());
   for(;i<j;i++){
    const s=meta.samples[i];if(error)throw error;
    decoder.decode(new EncodedAudioChunk({type:'key',timestamp:Math.round(s.cts/meta.timescale*1e6),duration:Math.round(s.duration/meta.timescale*1e6),data:bytes.subarray(s.offset-first.offset,s.offset-first.offset+s.size)}));
    if(decoder.decodeQueueSize>=16)await decoder.flush();
   }
   onProgress?.(i/meta.samples.length);
  }
  await decoder.flush();if(error)throw error;append(resampler.finish());
  return {samples,sr:targetSR,duration:samples.length/targetSR,channels:meta.channels,original_sample_rate:meta.source_sample_rate,channel:0,
   warnings:['AAC audio extracted locally from MOV/MP4; video frames were not decoded.','Original movie edit-list timing, including leading silence and AAC priming trim, is preserved.','Analysis uses audio channel 0 and a causal low-pass resampler; no media was uploaded.',...(meta.audio_track_count>1?['The first audio track was selected; additional audio tracks were not mixed.']:[])]};
 }finally{if(decoder.state!=='closed')decoder.close();}
}

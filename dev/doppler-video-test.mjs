/** Synthetic container fixtures only; never include private Camera Roll recordings. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
globalThis.Worker=(await import('node:worker_threads')).Worker;
const base=new URL('../doppler/',import.meta.url),cache=new Map();
async function moduleURL(url){url=new URL(url,base);if(cache.has(url.href))return cache.get(url.href);let source=await readFile(url,'utf8');
 for(const dep of new Set([...source.matchAll(/(?:from\s*|import\s*)['"](\.\/[^'"]+)['"]/g)].map(m=>m[1]))){const resolved=JSON.stringify(await moduleURL(new URL(dep,url)));source=source.split("'"+dep+"'").join(resolved).split('"'+dep+'"').join(resolved);}
 const result='data:text/javascript;base64,'+Buffer.from(source).toString('base64');cache.set(url.href,result);return result;
}
const {inspectMP4,extractAudioM4A,mapMovieTimeline}=await import(await moduleURL('video.js'));
assert.deepEqual(Array.from(mapMovieTimeline(Float32Array.from([1,2,3,4,5,6]),{duration:5,edits:[{movie_duration_s:2,media_start_s:-1,rate:1},{movie_duration_s:3,media_start_s:1,rate:1}]},1)),[0,0,2,3,4]);
await assert.rejects(inspectMP4(new Blob([new Uint8Array(64)])),/metadata|size|container/);
const fixtureDir=process.env.DOPPLER_VIDEO_FIXTURES;
if(fixtureDir){
 for(const ext of ['mov','mp4']){
  const original=await readFile(`${fixtureDir}/synthetic-iphone-aac.${ext}`),blob=new Blob([original]);let bytesRead=0,maxRead=0;
  const monitored={size:blob.size,slice:(a,b)=>{bytesRead+=b-a;maxRead=Math.max(maxRead,b-a);return blob.slice(a,b);}};
  const info=await inspectMP4(monitored);assert.match(info.codec,/mp4a\.40\.2/);assert.equal(info.source_sample_rate,48000);assert.ok(info.duration>200);assert.ok(info.samples.length>9000);assert.ok(bytesRead<blob.size*.25,'Metadata inspection must not read video payload');
  const corrupt=Buffer.from(original),stsz=corrupt.indexOf(Buffer.from('stsz'));assert.ok(stsz>=0);for(let at=stsz;at>=0;at=corrupt.indexOf(Buffer.from('stsz'),at+4))corrupt.writeUInt32BE(0xffffffff,at+12);await assert.rejects(inspectMP4(new Blob([corrupt])),/packet count exceeds/);
  const {blob:audio,meta}=await extractAudioM4A(blob);assert.ok(audio.size<blob.size);assert.equal(meta.track_id,info.track_id);
  await writeFile(`${fixtureDir}/extracted-${ext}.m4a`,new Uint8Array(await audio.arrayBuffer()));
  console.log(`${ext}: ${info.samples.length} AAC packets, ${info.duration}s, ${bytesRead} metadata bytes read of ${blob.size}; audio-only ${audio.size} bytes`);
 }
 const hevc=await inspectMP4(new Blob([await readFile(`${fixtureDir}/synthetic-hevc-aac.mov`)]));assert.match(hevc.codec,/mp4a\.40\.2/);assert.equal(hevc.duration,208);
 const silentName=process.env.DOPPLER_SILENT_FIXTURE;if(silentName)await assert.rejects(inspectMP4(new Blob([await readFile(silentName)])),/no audio track/);
}
console.log('PASS video edit-list mapping, malformed input rejection, and supplied synthetic MOV/MP4 metadata/audio-only remux checks.');

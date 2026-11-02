/* Constant emitted tone / stationary observer / still-air model. Fit error is not confidence. */
const A = 6378137, E2 = 6.69437999014e-3;
const finite = Number.isFinite;
function soundCheck(c) { if (!finite(c) || c < 250 || c > 400) throw Error('Sound speed must be between 250 and 400 m/s'); }
export function geodeticToEcef(latitude, longitude, altitude = 0) {
  if (![latitude, longitude, altitude].every(finite) || Math.abs(latitude)>90 || Math.abs(longitude)>180) throw Error('Invalid WGS84 coordinates');
  const lat=latitude*Math.PI/180, lon=longitude*Math.PI/180, n=A/Math.sqrt(1-E2*Math.sin(lat)**2);
  return [(n+altitude)*Math.cos(lat)*Math.cos(lon),(n+altitude)*Math.cos(lat)*Math.sin(lon),(n*(1-E2)+altitude)*Math.sin(lat)];
}
export function predictReceivedCurve(track, observer, {soundSpeed=343,maxGapS=30,emissionStepS=.5}={}) {
  soundCheck(soundSpeed);
  if (!finite(maxGapS)||maxGapS<=0||!finite(emissionStepS)||emissionStepS<.02) throw Error('Invalid track gap or sampling step');
  const t=track.times_utc;
  if (!t || t.length<2 || ![track.latitudes,track.longitudes,track.altitudes_m].every(v=>v?.length===t.length)) throw Error('Track requires matching position arrays and at least two timestamps');
  if (!Array.from(t).every((v,i)=>finite(v)&&(!i||v>t[i-1]))) throw Error('Track timestamps must be finite and strictly increasing');
  const xyz=Array.from(t,(_,i)=>geodeticToEcef(track.latitudes[i],track.longitudes[i],track.altitudes_m[i]));
  const origin=geodeticToEcef(observer.latitude,observer.longitude,observer.elevation_m??0);
  const out={times_utc:[],frequency_ratio:[],emission_times_utc:[],ranges_m:[],segment_ids:[],warnings:[...(track.warnings??[])]};
  if (!['geometric','ellipsoid','ellipsoidal','WGS84'].includes(track.altitude_datum)) out.warnings.push('Aircraft height datum is not verified geometric; height mismatch can bias results.');
  out.warnings.push('ECEF assumes compatible WGS84 ellipsoid heights.','Assumes constant emitted tone, stationary observer, still air and constant sound speed; no terrain or weather correction.');
  let count=0,group=0,gap=false;
  for(let i=0;i<t.length-1;i++) { const d=t[i+1]-t[i]; if(d<=maxGapS) count+=Math.ceil(d/emissionStepS)+1; }
  if(count>200000) throw Error('Track sampling exceeds 200000 points; crop track or increase step');
  for(let i=0;i<t.length-1;i++) {
    const d=t[i+1]-t[i]; if(d>maxGapS){group++;gap=true;continue;}
    const velocity=xyz[i].map((v,k)=>(xyz[i+1][k]-v)/d);
    if(Math.hypot(...velocity)>=soundSpeed) throw Error('Supersonic/invalid track speed unsupported by single-arrival model');
    const n=Math.max(1,Math.ceil(d/emissionStepS)), includeEnd=i===t.length-2||t[i+2]-t[i+1]>maxGapS;
    for(let j=0;j<n+(includeEnd?1:0);j++) {
      const f=j/n, emit=t[i]+f*d, displacement=xyz[i].map((v,k)=>v+f*(xyz[i+1][k]-v)-origin[k]);
      const r=Math.hypot(...displacement); if(r<1) throw Error('Observer lies on trajectory; point-source model undefined');
      const radial=displacement.reduce((sum,v,k)=>sum+v*velocity[k],0)/r, arrival=emit+r/soundSpeed;
      if(out.times_utc.length && arrival<=out.times_utc.at(-1)) throw Error('Nonmonotone arrival times; incompatible track');
      out.times_utc.push(arrival);out.frequency_ratio.push(1/(1+radial/soundSpeed));out.emission_times_utc.push(emit);out.ranges_m.push(r);out.segment_ids.push(group);
    }
  }
  if(!out.times_utc.length) throw Error('No usable track intervals within maximum gap');
  if(gap) out.warnings.push('Large track gaps omitted; predictions never bridge missing coverage.');
  out.warnings=[...new Set(out.warnings)]; return out;
}
export function interpolateArrival(curve, time) {
  const t=curve.times_utc; if(time<t[0]||time>t.at(-1)) return NaN;
  let lo=0,hi=t.length-1;
  while(lo<hi){const mid=Math.floor((lo+hi)/2);if(t[mid]<time)lo=mid+1;else hi=mid;}
  if(t[lo]===time) return curve.frequency_ratio[lo];
  if(!lo||curve.segment_ids[lo]!==curve.segment_ids[lo-1]) return NaN;
  const f=(time-t[lo-1])/(t[lo]-t[lo-1]);return curve.frequency_ratio[lo-1]*(1-f)+curve.frequency_ratio[lo]*f;
}
function invalid(warnings,per_event=[]) {return {valid:false,score:Infinity,rmse_hz:Infinity,per_event,warnings};}
function fixedEvent(event,track,observer,start,options,cache) {
  const fid=String(track.flight_id), times=Array.from(event.times_s??[]), hz=Array.from(event.frequencies_hz??[]);
  if(times.length<3||hz.length!==times.length||!times.every((v,i)=>finite(v)&&v>=0&&(!i||v>times[i-1]))||!hz.every(v=>finite(v)&&v>0)) throw Error('Events require at least three increasing nonnegative times and positive finite frequencies');
  if(!cache.has(fid)) {try{cache.set(fid,predictReceivedCurve(track,observer,options));}catch(e){throw Error(`Track '${fid}' cannot be modelled: ${e.message}. Remove or correct this track before matching.`);}}
  const curve=cache.get(fid), ratios=times.map(t=>interpolateArrival(curve,start+t));
  if(!ratios.every(finite)) return invalid([...curve.warnings,`Insufficient arrival-time coverage for ${fid}; candidate rejected.`]);
  const f0=ratios.reduce((s,r,i)=>s+r*hz[i],0)/ratios.reduce((s,r)=>s+r*r,0), predicted=ratios.map(r=>r*f0), residual=hz.map((v,i)=>v-predicted[i]);
  const rmse=Math.sqrt(residual.reduce((s,v)=>s+v*v,0)/times.length);
  return {valid:true,score:rmse,rmse_hz:rmse,warnings:curve.warnings,per_event:[{flight_id:fid,times_s:times,observed_frequencies_hz:hz,predicted_frequencies_hz:predicted,residuals_hz:residual,f0_hz:f0,rmse_hz:rmse}]};
}
export function scoreCandidate(events,tracks,observer,recordingStartUtc,{soundSpeed=343,maxGapS=30,_cache=new Map()}={}) {
  soundCheck(soundSpeed);if(!finite(recordingStartUtc)||!events.length||!tracks.length)throw Error('Provide events, tracks, and a finite recording UTC start');
  if(new Set(tracks.map(t=>String(t.flight_id))).size!==tracks.length)throw Error('Each track requires a unique flight_id');
  if(events.length>20||tracks.length>100||events.length*tracks.length>500)throw Error('Limit to 20 events, 100 tracks and 500 event/track combinations');
  const per_event=[],warnings=[];let sse=0,count=0,autoUsed=false;
  for(const event of events){
    const auto=event.flight_id==null||event.flight_id===''||event.flight_id==='auto';autoUsed ||= auto;
    const choices=auto?tracks:tracks.filter(t=>String(t.flight_id)===String(event.flight_id));if(!choices.length)throw Error('Unknown assigned flight_id');
    let best=null;
    for(const track of choices){const fit=fixedEvent(event,track,observer,recordingStartUtc,{soundSpeed,maxGapS},_cache);if(fit.valid&&(!best||fit.score<best.score))best=fit;}
    if(!best)return invalid(['No assigned flight fully covers an event in arrival time.'],per_event);
    per_event.push(...best.per_event);warnings.push(...best.warnings);count+=event.times_s.length;sse+=best.score**2*event.times_s.length;
  }
  if(autoUsed)warnings.push('Automatic flight assignment ranks fit error among imported tracks, not identification confidence.');
  const rmse=Math.sqrt(sse/count);return {valid:true,score:rmse,rmse_hz:rmse,per_event,warnings:[...new Set(warnings)]};
}
export async function searchCandidates(events,tracks,candidates,recordingStartUtc,{timeOffsetsS=[0],soundSpeed=343,maxGapS=30,onProgress}={}) {
  if(!timeOffsetsS.length||!Array.from(timeOffsetsS).every(finite))throw Error('Time offsets must be a nonempty finite vector');
  const total=candidates.length*timeOffsetsS.length;if(total>20000)throw Error('Search limited to 20000 candidate/offset pairs');
  let done=0;const results=[];
  for(const observer of candidates){const cache=new Map();for(const offset of timeOffsetsS){
    const start=recordingStartUtc+offset, fit=scoreCandidate(events,tracks,observer,start,{soundSpeed,maxGapS,_cache:cache});
    if(fit.valid){const {per_event,...summary}=fit;results.push({...observer,...summary,observer:{...observer},recording_start_utc:start,time_offset_s:offset,event_fits:per_event.map(e=>({flight_id:e.flight_id,f0_hz:e.f0_hz,rmse_hz:e.rmse_hz}))});}
    done++;if(done%25===0||done===total){onProgress?.({completed:done,total,fraction:done/total});await new Promise(resolve=>setTimeout(resolve,0));}
  }}
  return results.sort((a,b)=>a.score-b.score);
}

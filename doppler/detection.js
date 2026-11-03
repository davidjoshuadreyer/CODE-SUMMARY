/** Automatic tonal-candidate discovery. This does not classify aircraft or locate a recording. */
const pause=()=>new Promise(resolve=>setTimeout(resolve,0));
const median=values=>{const a=Array.from(values).sort((x,y)=>x-y);return a[Math.floor(a.length/2)];};
const quantile=(values,q)=>{const a=Array.from(values).sort((x,y)=>x-y);return a[Math.min(a.length-1,Math.floor(q*a.length))];};
function linearFit(t,y){const n=t.length,tm=t.reduce((a,b)=>a+b,0)/n,ym=y.reduce((a,b)=>a+b,0)/n;let cov=0,varT=0;for(let i=0;i<n;i++){cov+=(t[i]-tm)*(y[i]-ym);varT+=(t[i]-tm)**2;}const b=cov/Math.max(1e-10,varT),a=ym-b*tm;return {a,b,rmse:Math.sqrt(y.reduce((s,v,i)=>s+(v-a-b*t[i])**2,0)/n)};}
// Source motion and finite sound propagation: x = y + beta*sqrt(1+y²).
function ratio(time,tc,tau,beta){const x=(time-tc)/tau+beta,y=(x-beta*Math.sqrt(x*x+1-beta*beta))/(1-beta*beta);return 1/(1+beta*y/Math.sqrt(1+y*y));}
export function fitDopplerShape(times,frequencies){
 const t=Array.from(times),f=Array.from(frequencies),duration=t.at(-1)-t[0],n=t.length;
 if(n<4||duration<=0)return null;
 const flat=median(f),flatRmse=Math.sqrt(f.reduce((s,v)=>s+(v-flat)**2,0)/n),linear=linearFit(t,f);
 let best=null;
 const evaluate=(tc,tau,beta)=>{
   if(tc<t[0]-.2*duration||tc>t.at(-1)+.2*duration||tau<2||tau>duration*2||beta<.025||beta>.85)return {loss:Infinity};
   let numerator=0,denominator=0;const r=t.map(time=>ratio(time,tc,tau,beta));
   for(let i=0;i<n;i++){numerator+=r[i]*f[i];denominator+=r[i]*r[i];}
   const f0=numerator/denominator,pred=r.map(v=>v*f0),rmse=Math.sqrt(f.reduce((s,v,i)=>s+(v-pred[i])**2,0)/n);
   return {tc,tau,beta,f0,pred,loss:rmse};
 };
 for(const fraction of [.25,.5,.75])for(const tauFraction of [.12,.3,.65])for(const beta of [.12,.3,.55]){const fit=evaluate(t[0]+fraction*duration,Math.max(2,tauFraction*duration),beta);if(!best||fit.loss<best.loss)best=fit;}
 let steps=[duration*.15,duration*.15,.12];
 for(let iteration=0;iteration<45;iteration++){
   let improved=false;
   for(let axis=0;axis<3;axis++)for(const direction of [-1,1]){const p=[best.tc,best.tau,best.beta];p[axis]+=direction*steps[axis];const fit=evaluate(...p);if(fit.loss<best.loss){best=fit;improved=true;}}
   if(!improved)steps=steps.map(v=>v*.55);
   if(steps[0]<.03&&steps[1]<.03&&steps[2]<.0005)break;
 }
 return {frequencies_hz:best.pred,rmse_hz:best.loss,flat_rmse_hz:flatRmse,linear_rmse_hz:linear.rmse,linear_slope_hz_s:linear.b,f0_hz:best.f0,beta:best.beta,tau_s:best.tau,closest_arrival_s:best.tc};
}
function overlap(a,b){return Math.max(0,Math.min(a.end_s,b.end_s)-Math.max(a.start_s,b.start_s))/Math.max(1,Math.min(a.end_s-a.start_s,b.end_s-b.start_s));}
// A short unrelated fragment must not hide inside a low pooled error from a long ridge.
function fragmentsAgreeWithFit(times,fit,fragments){
 const byTime=new Map(times.map((time,i)=>[time,fit.frequencies_hz[i]]));
 return fragments.every(part=>{
   const errors=part.t.map((time,i)=>part.f[i]-byTime.get(time));
   const rmse=Math.sqrt(errors.reduce((sum,error)=>sum+error*error,0)/errors.length);
   return rmse<=Math.max(1.5,median(part.f)*.01);
 });
}
function fuseOverlappingEvents(events){
 const pool=events.map(event=>({...event})).sort((a,b)=>a.start_s-b.start_s);
 for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
  const a=pool[i],b=pool[j],lo=Math.max(a.start_s,b.start_s),hi=Math.min(a.end_s,b.end_s);
  if(hi-lo<1||Math.max(a.end_s,b.end_s)-Math.min(a.start_s,b.start_s)<Math.max(a.end_s-a.start_s,b.end_s-b.start_s)*1.1)continue;
  const errors=[];let k=0;
  for(let p=0;p<a.times_s.length;p++){const t=a.times_s[p];if(t<lo||t>hi)continue;while(k<b.times_s.length-1&&b.times_s[k]<t)k++;if(Math.abs(b.times_s[k]-t)<1.1)errors.push(Math.abs(a.frequencies_hz[p]-b.frequencies_hz[k]));}
  if(errors.length<3||median(errors)>Math.max(1.5,median(a.frequencies_hz)*.015))continue;
  const byTime=new Map();for(const event of [a,b])for(let p=0;p<event.times_s.length;p++){const time=event.times_s[p],q=event.strength_db?.[p]??10,old=byTime.get(time);if(!old||old.q<q)byTime.set(time,{f:event.frequencies_hz[p],q});}
  const times=[...byTime.keys()].sort((x,y)=>x-y),frequencies=times.map(t=>byTime.get(t).f),strength=times.map(t=>byTime.get(t).q),fit=fitDopplerShape(times,frequencies);
  if(fit.rmse_hz>Math.max(1.5,a.fit_rmse_hz*1.4,b.fit_rmse_hz*1.4)||!fragmentsAgreeWithFit(times,fit,[{t:a.times_s,f:a.frequencies_hz},{t:b.times_s,f:b.frequencies_hz}]))continue;
  const dt=median(times.slice(1).map((t,p)=>t-times[p])),duration=times.at(-1)-times[0],coverage=Math.min(1,times.length/(duration/dt+1));
  pool[i]={...a,times_s:times,frequencies_hz:frequencies,raw_frequencies_hz:[...frequencies],fitted_frequencies_hz:fit.frequencies_hz,strength_db:strength,start_s:times[0],end_s:times.at(-1),fit_rmse_hz:fit.rmse_hz,ideal_fit:fit,coverage,quality:Math.max(a.quality,b.quality),merged_fragments:(a.merged_fragments??1)+(b.merged_fragments??1)};
  pool.splice(j,1);j--;
 }
 return pool;
}
/** Short-pass recovery needs an observed central transition, not just a
 * weakly curved tail of a drifting tone. Recheck after fragment fusion too. */
export function isSupportedShortTransition(event){
 const fit=event.ideal_fit,t=event.times_s,f=event.frequencies_hz;
 if(!fit||!t?.length||!f?.length)return false;
 const duration=t.at(-1)-t[0],center=fit.closest_arrival_s-fit.beta*fit.tau_s,margin=.25*fit.tau_s;
 const n=Math.max(3,Math.floor(f.length*.15)),drop=median(f.slice(0,n))-median(f.slice(-n));
 return duration>0&&center-margin>=t[0]&&center+margin<=t.at(-1)
   &&fit.tau_s<=duration*.5&&fit.rmse_hz<=fit.linear_rmse_hz*.8
   &&drop>=Math.max(3,median(f)*.05);
}
export function deduplicateEvents(events){
 const kept=[];
 for(const event of fuseOverlappingEvents(events).sort((a,b)=>b.quality-a.quality)){
   if(event.detection_scale==='short_pass'&&!isSupportedShortTransition(event))continue;
   const existing=kept.find(other=>{if(overlap(event,other)<.55)return false;const common=event.times_s.map((t,i)=>{if(t<other.start_s||t>other.end_s)return null;let j=0;while(j<other.times_s.length-1&&other.times_s[j]<t)j++;return event.frequencies_hz[i]/other.frequencies_hz[j];}).filter(v=>v!=null);const r=common.length?median(common):median(event.frequencies_hz)/median(other.frequencies_hz),harmonic=Math.max(r,1/r),integer=Math.round(harmonic),scatter=common.length?median(common.map(v=>Math.abs(v-r)))/r:0;if(scatter>.025)return false;return Math.abs(r-1)<.08||(integer>=2&&integer<=6&&Math.abs(harmonic-integer)<.04*integer);});
   if(existing){existing.harmonic_companions=(existing.harmonic_companions??0)+1;continue;}
   kept.push(event);
 }
 return kept.sort((a,b)=>a.start_s-b.start_s);
}
function trimWeakEdges(track){
 if(track.t.length<10)return track;
 const floor=Math.max(6,median(track.q)*.55);let first=0,last=track.t.length;
 // Sustained loss of ridge prominence marks an event boundary, even if a model
 // can find chance peaks nearby in noise. Never replace these with model values.
 while(last-first>=10&&median(track.q.slice(Math.max(first,last-8),last))<floor)last--;
 while(last-first>=10&&median(track.q.slice(first,Math.min(last,first+8)))<floor)first++;
 return {...track,t:track.t.slice(first,last),f:track.f.slice(first,last),q:track.q.slice(first,last)};
}
function mergeFragments(tracks,dt){
 const pool=tracks.map(trimWeakEdges).filter(t=>t.t.at(-1)-t.t[0]>=10).sort((a,b)=>a.t[0]-b.t[0]);
 const used=new Set(),out=[];let fits=0;
 for(let i=0;i<pool.length;i++){
  if(used.has(i))continue;let current=pool[i];used.add(i);
  for(let round=0;round<5;round++){
   let best=null;
   for(let j=i+1;j<pool.length;j++){
    if(used.has(j))continue;const next=pool[j],gap=next.t[0]-current.t.at(-1);
    if(gap>20||next.t.at(-1)<=current.t.at(-1))continue;
    if(gap<0){
      const differences=[];let k=0;
      for(let p=0;p<next.t.length&&next.t[p]<=current.t.at(-1);p++){while(k<current.t.length-1&&current.t[k]<next.t[p])k++;if(Math.abs(current.t[k]-next.t[p])<=dt*2)differences.push(Math.abs(current.f[k]-next.f[p]));}
      if(differences.length<3||median(differences)>Math.max(1.5,median(next.f)*.015))continue;
    }else{const delta=current.f.at(-1)-next.f[0];if(delta< -1||delta>Math.max(3,current.f.at(-1)*.025*gap))continue;}
    const byTime=new Map();for(const part of [current,next])for(let p=0;p<part.t.length;p++){const old=byTime.get(part.t[p]);if(!old||old.q<part.q[p])byTime.set(part.t[p],{f:part.f[p],q:part.q[p]});}
    const t=[...byTime.keys()].sort((a,b)=>a-b),f=t.map(time=>byTime.get(time).f),q=t.map(time=>byTime.get(time).q),coverage=t.length/((t.at(-1)-t[0])/dt+1);
    if(coverage<.65||fits++>1000)continue;
    const fit=fitDopplerShape(t,f),span=f[0]-f.at(-1);
    if(fit.rmse_hz>Math.max(.65,span*.025)||fit.rmse_hz>fit.flat_rmse_hz*.2||!fragmentsAgreeWithFit(t,fit,[current,next]))continue;
    if(!best||fit.rmse_hz<best.error)best={j,error:fit.rmse_hz,track:{...current,t,f,q}};
   }
   if(!best)break;current=best.track;used.add(best.j);
  }
  out.push(current);
 }
 return out;
}
function extendSupportedTrack(track,fit,peakFrames,times,df,dt){
 let current=track,currentFit=fit;const prominenceFloor=Math.max(6,median(track.q)*.55);const lowerBound=track.t[0]-35,upperBound=track.t.at(-1)+35;
 for(let iteration=0;iteration<3;iteration++){
  const groups=[];let group={t:[],f:[],q:[]};
  for(let j=0;j<times.length;j++){
   const time=times[j];if(time<lowerBound||time>upperBound)continue;
   const expected=currentFit.f0_hz*ratio(time,currentFit.closest_arrival_s,currentFit.tau_s,currentFit.beta);
   const gate=Math.max(1.5,3*df);let best=null;
   for(const peak of peakFrames[j]){const error=Math.abs(peak.f-expected);if(error>gate||peak.q<prominenceFloor)continue;const cost=error/gate-.01*peak.q;if(!best||cost<best.cost)best={...peak,cost};}
   if(!best)continue;
   if(group.t.length&&time-group.t.at(-1)>8){groups.push(group);group={t:[],f:[],q:[]};}
   group.t.push(time);group.f.push(best.f);group.q.push(best.q);
  }
  if(group.t.length)groups.push(group);
  const middle=current.t[Math.floor(current.t.length/2)];
  const selected=groups.filter(g=>g.t[0]<=middle&&g.t.at(-1)>=middle).sort((a,b)=>b.t.length-a.t.length)[0];
  if(!selected||selected.t.length<current.t.length*.9)break;
  const coverage=selected.t.length/((selected.t.at(-1)-selected.t[0])/dt+1);if(coverage<.7)break;
  const nextFit=fitDopplerShape(selected.t,selected.f);if(!nextFit||nextFit.rmse_hz>Math.max(1.2,currentFit.rmse_hz*1.5))break;
  current=trimWeakEdges(selected);currentFit=fitDopplerShape(current.t,current.f);
 }
 return {track:current,fit:currentFit};
}
export async function detectDopplerEvents(spec,{onProgress,minDurationS=20,minCoverage=.7,minProminenceDb=5,maxGapS=2.0,maxEvents=40,minFrequencyHz=40,maxFrequencyHz=1000,seedMinCoverage=minCoverage,minTimescaleS=5,maxDescendingFractionPerS=.025,requireCenteredTransition=false,fastSeeds=false}={}){
 const times=spec?.times_s,freq=spec?.frequencies_hz,power=spec?.power_db;
 if(!times||!freq||!power||times.length<4||freq.length<3)return {events:[],diagnostics:{reason:'Insufficient spectrogram samples'}};
 const nt=times.length,nf=freq.length,dt=times[1]-times[0],df=freq[1]-freq[0];
 if(nt*nf>8e6||nt>2400)throw Error('Automatic detection requires chunks of at most 2400 frames and 8 million spectral cells');
 if(!(dt>0&&df>0)||power.length!==nf||power.some(row=>row.length!==nt))throw Error('Invalid spectrogram dimensions');
 const baseline=new Float32Array(nf);
 for(let k=0;k<nf;k++)baseline[k]=quantile(power[k],.6);
 let active=[],finished=[],nextId=0,peakCount=0;const peakFrames=[];
 const radius=Math.max(3,Math.round(12/df)),prefix=new Float64Array(nf+1),column=new Float32Array(nf),local=new Float32Array(nf);
 onProgress?.(0);
 for(let j=0;j<nt;j++){
   prefix[0]=0;for(let k=0;k<nf;k++){column[k]=power[k][j];prefix[k+1]=prefix[k]+column[k];}
   for(let k=0;k<nf;k++){const lo=Math.max(0,k-radius),hi=Math.min(nf,k+radius+1);local[k]=column[k]-(prefix[hi]-prefix[lo])/(hi-lo);}
   const peaks=[];
   for(let k=1;k<nf-1;k++){
     if(freq[k]<minFrequencyHz||freq[k]>maxFrequencyHz||column[k]<column[k-1]||column[k]<column[k+1])continue;
     const temporal=column[k]-baseline[k],prominence=local[k];
     if(prominence<minProminenceDb||temporal<3)continue;
     const curvature=column[k-1]-2*column[k]+column[k+1],shift=curvature<-.00001?Math.max(-.5,Math.min(.5,.5*(column[k-1]-column[k+1])/curvature)):0;
     peaks.push({time:times[j],f:freq[k]+df*shift,q:Math.min(40,prominence),temporal});
   }
   peaks.sort((a,b)=>b.q-a.q);
   // Frequency-balanced quotas prevent high-frequency noise from crowding out a fundamental.
   const quotas=[0,0,0,0],balanced=[];
   for(const peak of peaks){const band=peak.f<120?0:peak.f<250?1:peak.f<500?2:3;if(quotas[band]++<35)balanced.push(peak);}
   peaks.length=0;peaks.push(...balanced);peakCount+=peaks.length;peakFrames.push(peaks);
   const eligible=[];
   for(const track of active){if(times[j]-track.t.at(-1)>maxGapS){finished.push(track);}else eligible.push(track);}active=eligible;
   const pairs=[];
   for(let a=0;a<active.length;a++){
     const track=active[a],last=track.f.at(-1),elapsed=times[j]-track.t.at(-1),velocity=track.velocity??0,expected=last+velocity*elapsed;
     const gate=fastSeeds&&track.t.length<3 ? Math.max(2,last*maxDescendingFractionPerS)*elapsed+df*.65 : Math.max(1.2*df,last*.007)*elapsed+df*.65;
     for(let p=0;p<peaks.length;p++){
       const delta=peaks[p].f-last,slope=delta/elapsed;
       if(slope>Math.max(.5,last*.003)||slope< -Math.max(2,last*maxDescendingFractionPerS))continue;
       const error=Math.abs(peaks[p].f-expected);if(error>gate)continue;
       pairs.push({a,p,cost:error/gate-.008*peaks[p].q-.001*Math.min(60,track.t.length)});
     }
   }
   pairs.sort((a,b)=>a.cost-b.cost);const usedA=new Set(),usedP=new Set();
   for(const pair of pairs){if(usedA.has(pair.a)||usedP.has(pair.p))continue;usedA.add(pair.a);usedP.add(pair.p);const track=active[pair.a],peak=peaks[pair.p],slope=(peak.f-track.f.at(-1))/(peak.time-track.t.at(-1));track.velocity=track.t.length<3?slope:.6*track.velocity+.4*slope;track.t.push(peak.time);track.f.push(peak.f);track.q.push(peak.q);}
   for(let p=0;p<peaks.length;p++)if(!usedP.has(p)){const peak=peaks[p];active.push({id:nextId++,t:[peak.time],f:[peak.f],q:[peak.q],velocity:0});}
   if(active.length>500){active.sort((a,b)=>b.t.length-a.t.length);finished.push(...active.splice(500));}
   if(j%80===0){onProgress?.(.7*j/nt);await pause();}
 }
 finished.push(...active);
 const mergedTracks=mergeFragments(finished,dt);
 let candidates=mergedTracks.filter(track=>track.t.at(-1)-track.t[0]>=minDurationS);
 const durationPassed=candidates.length,rejectionCounts={coverage:0,insufficient_descending_shift:0,excessive_shift:0};
 // Preselect stable descending evidence before any nonlinear fit.
 candidates=candidates.filter(track=>{const duration=track.t.at(-1)-track.t[0],coverage=track.t.length/(duration/dt+1),span=Math.max(3,Math.floor(track.f.length*.15)),drop=median(track.f.slice(0,span))-median(track.f.slice(-span));if(coverage<seedMinCoverage){rejectionCounts.coverage++;return false;}if(drop<Math.max(3,median(track.f)*.05)){rejectionCounts.insufficient_descending_shift++;return false;}if(drop>=median(track.f)*.8){rejectionCounts.excessive_shift++;return false;}return true;});
 candidates.sort((a,b)=>(b.t.length*median(b.q))-(a.t.length*median(a.q)));candidates=candidates.slice(0,250);
 const events=[];let fitRejected=0;
 for(let i=0;i<candidates.length;i++){
   let track=candidates[i],fit=fitDopplerShape(track.t,track.f);
   if(fit&&fit.tau_s>=minTimescaleS&&fit.rmse_hz<2){const extended=extendSupportedTrack(track,fit,peakFrames,times,df,dt);track=extended.track;fit=extended.fit;}
   const duration=track.t.at(-1)-track.t[0],span=track.f[0]-track.f.at(-1),coverage=track.t.length/(duration/dt+1);
   if(!fit||coverage<minCoverage||fit.tau_s<Math.max(minTimescaleS,duration*.1)||fit.rmse_hz>Math.max(1.5,Math.abs(span)*.12)||fit.rmse_hz>fit.flat_rmse_hz*.35||fit.rmse_hz>fit.linear_rmse_hz*.92){fitRejected++;continue;}
   if(requireCenteredTransition&&!isSupportedShortTransition({ideal_fit:fit,times_s:track.t,frequencies_hz:track.f})){fitRejected++;continue;}
   const transitionCenter=fit.closest_arrival_s-fit.beta*fit.tau_s;
   const coreStart=Math.max(track.t[0],transitionCenter-fit.tau_s*.5),coreEnd=Math.min(track.t.at(-1),transitionCenter+fit.tau_s*.5);
   const coreSupport=track.t.filter(t=>t>=coreStart&&t<=coreEnd).length/Math.max(1,(coreEnd-coreStart)/dt+1);
   if(coreEnd<=coreStart||coreSupport<.65||median(track.q.filter((q,p)=>track.t[p]>=coreStart&&track.t[p]<=coreEnd))<9){fitRejected++;continue;}
   const quality=median(track.q)*coverage*Math.sqrt(duration)*Math.min(1,coreSupport)*(1-fit.rmse_hz/Math.max(.1,fit.flat_rmse_hz));
   events.push({times_s:track.t,frequencies_hz:track.f,raw_frequencies_hz:[...track.f],fitted_frequencies_hz:fit.frequencies_hz,strength_db:track.q,start_s:track.t[0],end_s:track.t.at(-1),quality,fit_rmse_hz:fit.rmse_hz,coverage,transition_coverage:Math.min(1,coreSupport),ideal_fit:fit,flight_id:'auto',...(requireCenteredTransition?{detection_scale:'short_pass'}:{}),provenance:'automatic_observed_ridge',warnings:['Automatically detected descending tonal candidate; aircraft origin is unverified.','Observed supported peaks remain separate from the ideal model overlay. Quality is a ranking score, not a confidence probability.']});
   if(i%15===0){onProgress?.(.7+.3*i/Math.max(1,candidates.length));await pause();}
 }
 const deduped=deduplicateEvents(events).sort((a,b)=>b.quality-a.quality).slice(0,maxEvents).sort((a,b)=>a.start_s-b.start_s);
 onProgress?.(1);
 return {events:deduped,diagnostics:{frames:nt,frequency_bins:nf,peaks_considered:peakCount,tracks:finished.length,longest_raw_track_s:finished.reduce((longest,track)=>Math.max(longest,track.t.at(-1)-track.t[0]),0),merged_tracks:mergedTracks.length,duration_passed:durationPassed,pre_fit_rejections:rejectionCounts,descending_coverage_rejections:durationPassed-candidates.length,duration_candidates:candidates.length,shape_rejections:fitRejected,accepted_before_dedup:events.length,accepted:deduped.length,notes:'Temporal and local spectral whitening, supported peak tracking, descending-shape checks. Non-detection is not evidence of no aircraft.'}};
}

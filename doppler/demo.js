import {predictReceivedCurve, interpolateArrival} from './physics.js';
/** SYNTHETIC generated demonstration. No real aircraft or validation claims. */
export function makeDemo(){
  const epoch=1700000000,observer={latitude:49.25,longitude:-123.10,elevation_m:0},tracks=[];
  for(const [fid,center,eastbound] of [['SYNTHETIC-A',55,true],['SYNTHETIC-B',155,false]]){
    const sec=Array.from({length:81},(_,i)=>center-80+2*i),distance=sec.map(t=>(t-center)*105);
    tracks.push({flight_id:fid,times_utc:sec.map(t=>epoch+t),latitudes:distance.map(d=>observer.latitude+(eastbound?1200:d)/111200),longitudes:distance.map(d=>observer.longitude+(eastbound?d:-1700)/(111200*Math.cos(observer.latitude*Math.PI/180))),altitudes_m:sec.map(()=>eastbound?1800:2200),altitude_datum:'geometric',warnings:['SYNTHETIC generated trajectory, not an actual aircraft.']});
  }
  const events=tracks.map((track,i)=>{const start=i?125:25,end=i?200:100,f0=i?185:150,times=Array.from({length:151},(_,j)=>start+j*.5),curve=predictReceivedCurve(track,observer);return {flight_id:track.flight_id,times_s:times,frequencies_hz:times.map(t=>f0*interpolateArrival(curve,epoch+t)),f0_hz:f0,synthetic:true};});
  const candidates=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)candidates.push({latitude:observer.latitude+dy*.005,longitude:observer.longitude+dx*.007,elevation_m:0});
  return {synthetic:true,label:'SYNTHETIC demonstration: generated tones and trajectories',tracks,events,observer,recording_start_utc:epoch,candidates,duration_s:220};
}

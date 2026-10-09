/* Pure calculations shared by the lab UI and export checks. No sample measurements. */
(function(root){
 'use strict';
 const number=v=>v===null||v===undefined||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null;
 const positive=v=>{const n=number(v);return n!==null&&n>0?n:null;};
 const nonnegative=v=>{const n=number(v);return n!==null&&n>=0?n:null;};
 const area=d=>Math.PI*(d/1000)**2/4;
 const fmt=(n,d=5)=>n===null||n===undefined||!Number.isFinite(n)?'—':n!==0&&(Math.abs(n)>=1e5||Math.abs(n)<.001)?Number(n.toPrecision(d)).toExponential().replace('e+','e'):Number(n.toPrecision(d)).toString();
 function fit(rows){
  if(rows.length<3)return null;
  const x=rows.reduce((s,p)=>s+p.x,0)/rows.length,y=rows.reduce((s,p)=>s+p.y,0)/rows.length;
  const xx=rows.reduce((s,p)=>s+(p.x-x)**2,0);if(!xx)return null;
  const m=rows.reduce((s,p)=>s+(p.x-x)*(p.y-y),0)/xx,b=y-m*x;
  const ss=rows.reduce((s,p)=>s+(p.y-y)**2,0),res=rows.reduce((s,p)=>s+(p.y-m*p.x-b)**2,0);
  return {m,b,r2:ss?Math.max(0,1-res/ss):null,x,y,n:rows.length};
 }
 // All error rectangles must meet a line y=m*x+b. For a fixed positive m,
 // every point gives an interval of possible b; a common intersection is required.
 function intercept(rows,m){
  if(rows.some(p=>p.dx===null||p.dy===null)||!(m>0))return null;
  const lo=Math.max(...rows.map(p=>p.y-p.dy-m*(p.x+p.dx)));
  const hi=Math.min(...rows.map(p=>p.y+p.dy-m*(p.x-p.dx)));
  return lo<=hi+1e-10*Math.max(1,Math.abs(lo),Math.abs(hi))?(lo+hi)/2:null;
 }
 function bounds(rows){
  if(rows.length<3||rows.some(p=>p.dx===null||p.dy===null))return null;
  let lo=0,hi=Infinity;
  for(const a of rows)for(const b of rows){
   const c=b.x-b.dx-a.x-a.dx,r=b.y+b.dy-a.y+a.dy;
   if(c>0)hi=Math.min(hi,r/c);else if(c<0)lo=Math.max(lo,r/c);else if(r<0)return null;
  }
  return hi>=lo&&hi>0&&Number.isFinite(hi)?{min:lo,max:hi}:null;
 }
 function analyze(d){
  const A=[],B=[],issues=[];
  const diameter=positive(d.diameter),dd=nonnegative(d.dDiameter),length=positive(d.lengthB),dl=nonnegative(d.dLengthB);
  const areaA=diameter===null?null:area(diameter),dAreaA=areaA===null||dd===null?null:2*areaA*dd/diameter;
  let startedA=0,startedB=0;
  for(let i=0;i<19;i++){
   const x=positive(d['a'+i+'L']),dx=nonnegative(d['a'+i+'dL']),y=positive(d['a'+i+'R']),dy=nonnegative(d['a'+i+'dR']);
   if(String(d['a'+i+'R']||'').trim())startedA++;
   if(x!==null&&y!==null)A.push({i,x,dx,y,dy});
  }
  const count=Math.max(1,Math.min(20,Number(d.bCount)||6));
  for(let i=0;i<count;i++){
   const dia=positive(d['b'+i+'d']),delta=nonnegative(d['b'+i+'dd']),y=positive(d['b'+i+'R']),dy=nonnegative(d['b'+i+'dR']);
   if(['d','dd','R','dR','g'].some(k=>String(d['b'+i+k]||'').trim()))startedB++;
   if(dia!==null&&y!==null){const a=area(dia),da=delta===null?null:2*a*delta/dia;B.push({i,d:dia,dd:delta,area:a,dArea:da,x:1/a,dx:da===null?null:da/a**2,y,dy});}
  }
  const af=fit(A),bf=fit(B),aBounds=bounds(A),bBounds=bounds(B);
  function uncertainty(prefix,f){
   const min=positive(d[prefix+'Min']),max=positive(d[prefix+'Max']);
   if(!f||min===null||max===null||min>f.m||max<f.m||max<=min)return null;
   return {min,max,dm:(max-min)/2};
  }
  const au=uncertainty('a',af),bu=uncertainty('b',bf);
  const rhoA=af&&af.m>0&&areaA!==null?af.m*areaA:null,rhoB=bf&&bf.m>0&&length!==null?bf.m/length:null;
  const drhoA=rhoA!==null&&au&&dAreaA!==null?rhoA*(au.dm/af.m+dAreaA/areaA):null;
  const drhoB=rhoB!==null&&bu&&dl!==null?rhoB*(bu.dm/bf.m+dl/length):null;
  const accepted=positive(d.accepted),difference=rhoA!==null&&rhoB!==null?Math.abs(rhoA-rhoB):null;
  const combined=drhoA!==null&&drhoB!==null?drhoA+drhoB:null;
  const consistent=difference!==null&&combined!==null?difference<combined:null;
  if(A.length<19)issues.push('Part A: '+A.length+'/19 valid length/resistance pairs.');
  if(B.length<count||B.length<3)issues.push('Part B: '+B.length+'/'+count+' valid diameter/resistance pairs; at least 3 are needed.');
  if(A.some(p=>p.dx===null||p.dy===null)||B.some(p=>p.dx===null||p.dy===null||p.dd===null))issues.push('Enter the uncertainties for every recorded point.');
  if(diameter===null||dd===null||dd>=diameter)issues.push('Enter Part A diameter and its uncertainty (0 ≤ Δd < d).');
  if(length===null||dl===null||dl>=length)issues.push('Enter Part B length and its uncertainty (0 ≤ ΔL < L).');
  if(A.some(p=>p.dx!==null&&p.dx>=p.x)||B.some(p=>p.dd!==null&&p.dd>=p.d))issues.push('Length/diameter uncertainties must be smaller than their values.');
  if(A.some(p=>p.dy!==null&&p.dy>=p.y)||B.some(p=>p.dy!==null&&p.dy>=p.y))issues.push('Resistance uncertainty reaches zero resistance; review the reading/range.');
  if(!af||af.m<=0)issues.push('Part A needs at least 3 distinct-length points with a positive fitted slope.');
  if(!bf||bf.m<=0)issues.push('Part B needs at least 3 distinct-area points with a positive fitted slope.');
  if(!au||!bu)issues.push('Review minimum/maximum slopes: positive, different, and bracketing each best-fit slope.');
  if(!d.slopeNotes?.trim())issues.push('Describe how you chose the maximum and minimum slopes.');
  if(!d.student?.trim()||!d.date?.trim())issues.push('Add your name and experiment date.');
  if(!d.meter?.trim()||!d.uncertaintyNotes?.trim())issues.push('Record meter/range and the uncertainty convention.');
  if(!accepted||!d.acceptedSource?.trim())issues.push('Add the accepted resistivity and its alloy/temperature/source.');
  for(const [key,label] of [['observations','observations'],['discussion','discussion'],['conclusion','conclusion']])if(!d[key]?.trim())issues.push('Write your '+label+'.');
  return {A,B,af,bf,au,bu,aBounds,bBounds,diameter,dd,areaA,dAreaA,length,dl,rhoA,rhoB,drhoA,drhoB,accepted,difference,combined,consistent,issues,complete:issues.length===0,percentA:rhoA!==null&&accepted?100*Math.abs(rhoA-accepted)/accepted:null,percentB:rhoB!==null&&accepted?100*Math.abs(rhoB-accepted)/accepted:null};
 }
 const api={number,positive,nonnegative,area,fmt,fit,bounds,intercept,analyze};
 if(typeof module!=='undefined')module.exports=api;root.Lab7Math=api;
})(typeof window==='undefined'?globalThis:window);

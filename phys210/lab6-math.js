(function(root){'use strict';
const runs=['d1','d2','h1','h2','s','p'];
const keys=['c1','c2','r',...runs.flatMap(x=>['A','B','C'].map(k=>x+k))];
const pattern=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i;
function num(v){const s=String(v??'').trim();return pattern.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
function pos(v){const n=num(v);return n>0?n:null;}
function digit(v){const s=String(v??'').trim();if(num(s)===null)return null;const [m,e='0']=s.toLowerCase().split('e');const u=10**(Number(e)-(m.split('.')[1]||'').length);return Number.isFinite(u)&&u>0?u:null;}
function clean(d){return Object.fromEntries(keys.map(k=>[k,typeof d?.[k]==='string'||typeof d?.[k]==='number'?String(d[k]).slice(0,60):'']));}
function analyze(raw){const d=clean(raw),c1=pos(d.c1),c2=pos(d.c2),r=pos(d.r),issues=[];
for(const k of keys)if(d[k].trim()&&(num(d[k])===null||((['c1','c2','r'].includes(k)||k.endsWith('C'))&&num(d[k])<=0)))issues.push(k+': enter '+(k.endsWith('A')||k.endsWith('B')?'a finite number':'a positive number')+'.');
const tau=Object.fromEntries(runs.map(k=>[k,pos(d[k+'C'])?1/pos(d[k+'C']):null]));
// s / µF = MΩ; s / MΩ = µF.
const ri1=tau.d1&&c1?tau.d1/c1:null,ri2=tau.d2&&c2?tau.d2/c2:null,ri=ri1&&ri2?(ri1+ri2)/2:null;
const effTheory=r&&ri?r*ri/(r+ri):null;
const eff=[tau.h1&&c1?tau.h1/c1:null,tau.h2&&c2?tau.h2/c2:null];
const derived=eff.map(v=>v&&r&&v<r?r*v/(r-v):null);
eff.forEach((v,i)=>{if(v&&r&&v>=r)issues.push('Charging '+(i+1)+': R_eff ≥ R. A positive probe resistance cannot be inferred; check the fit rate, units and wiring.');});
const series=c1&&c2?c1*c2/(c1+c2):null,parallel=c1&&c2?c1+c2:null,seriesMeasured=ri&&tau.s?tau.s/ri:null,parallelMeasured=ri&&tau.p?tau.p/ri:null;
const difference=(a,b)=>a!==null&&b!==null&&b>0?100*Math.abs(a-b)/b:null;
return {d,c1,c2,r,tau,ri1,ri2,ri,effTheory,eff,derived,series,parallel,seriesMeasured,parallelMeasured,probeDifference:difference(ri,1),seriesDifference:difference(seriesMeasured,series),parallelDifference:difference(parallelMeasured,parallel),expectedPlateau:r&&ri?4*ri/(r+ri):null,issues,complete:keys.filter(k=>num(d[k])!==null&&(!(['c1','c2','r'].includes(k)||k.endsWith('C'))||num(d[k])>0)).length};}
const api={runs,keys,num,pos,digit,clean,analyze};root.Lab6Math=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);

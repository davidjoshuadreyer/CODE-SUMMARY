(function(root){'use strict';
const num=v=>v==null||String(v).trim()===''?null:Number.isFinite(Number(v))?Number(v):null,pos=v=>num(v)>0?num(v):null,unc=v=>num(v)!==null&&num(v)>=0?num(v):null;
const fmt=(v,n=6)=>v==null||!Number.isFinite(v)?'—':Number(v.toPrecision(n)).toString();
function rounded(v,u){if(v==null||u==null)return '—';if(u===0)return `${fmt(v)} ± 0`;let place=Math.floor(Math.log10(u)),r=Math.round(u/10**place)*10**place;place=Math.floor(Math.log10(r));return `${(Math.round(v/10**place)*10**place).toFixed(Math.max(0,-place))} ± ${r.toFixed(Math.max(0,-place))}`;}
function fit(rows){if(rows.length<3)return null;const n=rows.length,x=rows.reduce((s,p)=>s+p.x,0)/n,y=rows.reduce((s,p)=>s+p.y,0)/n,xx=rows.reduce((s,p)=>s+(p.x-x)**2,0);if(!xx)return null;const m=rows.reduce((s,p)=>s+(p.x-x)*(p.y-y),0)/xx,b=y-m*x,ss=rows.reduce((s,p)=>s+(p.y-y)**2,0),r2=ss?1-rows.reduce((s,p)=>s+(p.y-m*p.x-b)**2,0)/ss:null;
let dm=null,min=null,max=null,lo=null,hi=null,top=null,bottom=null;
if(m>0&&rows.every(p=>p.dx!==null&&p.dy!==null)){lo=Math.min(...rows.map(p=>p.x-p.dx));hi=Math.max(...rows.map(p=>p.x+p.dx));top=Math.max(...rows.map(p=>p.y+p.dy-m*(p.x-p.dx)-b));bottom=Math.max(...rows.map(p=>m*(p.x+p.dx)+b-p.y+p.dy));if(hi>lo){dm=(top+bottom)/(hi-lo);min=m-dm;max=m+dm;}}
return {m,b,r2,n,dm,min,max,lo,hi,top,bottom};}
function analyze(d){const issues=[],e=8.85e-12,n=pos(d.sheets),T=pos(d.thickness),uT=unc(d.dThickness),validN=n!==null&&Number.isInteger(n),t=validN&&T?T*.001/n:null,ut=t!==null&&uT!==null?uT*.001/n:null;
const l=pos(d.length),w=pos(d.width),ul=unc(d.dLength),uw=unc(d.dWidth),area=l&&w?l*w*1e-4:null,ua=area!==null&&ul!==null&&uw!==null?area*(ul/l+uw/w):null,cn=pos(d.fixedSheets),gap=t&&cn&&Number.isInteger(cn)?t*cn:null,ug=gap!==null&&ut!==null?ut*cn:null;
const B=[],C=[],rawB=[],rawC=[];
for(let i=0;i<6;i++){
 const count=pos(d[`b${i}n`]),cap=pos(d[`b${i}c`]),uc=unc(d[`b${i}u`]),g=t&&count&&Number.isInteger(count)?t*count:null,dg=g!==null&&ut!==null?ut*count:null;
 rawB.push([i+1,d[`b${i}n`],d[`b${i}c`],d[`b${i}u`]]);
 if(g&&cap)B.push({i,x:1/g,dx:dg===null?null:dg/g**2,y:cap*1e-9,dy:uc===null?null:uc*1e-9,g,dg});
 const a=pos(d[`c${i}l`]),b=pos(d[`c${i}w`]),da=unc(d[`c${i}ul`]),db=unc(d[`c${i}uw`]),c=pos(d[`c${i}c`]),u=unc(d[`c${i}u`]),ar=a&&b?a*b*1e-4:null,ur=ar!==null&&da!==null&&db!==null?ar*(da/a+db/b):null;
 rawC.push([i+1,...['l','ul','w','uw','c','u'].map(k=>d[`c${i}${k}`])]);if(ar&&c)C.push({i,x:ar,dx:ur,y:c*1e-9,dy:u===null?null:u*1e-9});
}
const bf=fit(B),cf=fit(C),k1=bf?.m>0&&area?bf.m/(e*area):null,k2=cf?.m>0&&gap?cf.m*gap/e:null,u1=k1!==null&&bf.dm!==null&&ua!==null?k1*(bf.dm/bf.m+ua/area):null,u2=k2!==null&&cf.dm!==null&&ug!==null?k2*(cf.dm/cf.m+ug/gap):null;
const mean=k1!==null&&k2!==null?(k1+k2)/2:null,um=u1!==null&&u2!==null?(u1+u2)/2:null,difference=mean!==null?Math.abs(k1-k2):null,sum=um!==null?u1+u2:null,consistent=sum!==null?difference<=sum:null;
const ref=pos(d.reference),uref=unc(d.dReference),referenceConsistent=mean!==null&&um!==null&&ref!==null&&uref!==null?Math.abs(mean-ref)<=um+uref:null;
if(!validN||!T||uT===null)issues.push('Enter the paper stack thickness, uncertainty and a whole-number sheet count.');
if(area===null||ua===null)issues.push('Enter fixed plate dimensions and their uncertainties.');if(gap===null||ug===null)issues.push('Enter the fixed whole-number sheet gap.');
if(B.length!==6||B.some(p=>p.dx===null||p.dy===null))issues.push('Complete all six gap readings and uncertainties.');if(C.length!==6||C.some(p=>p.dx===null||p.dy===null))issues.push('Complete all six area readings and uncertainties.');
if(!bf||!cf||bf.m<=0||cf.m<=0)issues.push('Both graphs need distinct horizontal values and positive fitted slopes.');
if(!ref||uref===null||!d.acceptedSource?.trim())issues.push('Enter the paper reference value, uncertainty and source (use 0 only if treated as exact).');
for(const key of ['student','date','partners','meter','textbook','uncertaintyNotes','observations','discussion'])if(!d[key]?.trim())issues.push('Complete '+({partners:'partner name (or “none”)',observations:'actual procedure and observations',discussion:'discussion',uncertaintyNotes:'measurement uncertainty notes'}[key]||key)+'.');
return {t,ut,area,ua,gap,ug,B,C,rawB,rawC,bf,cf,k1,k2,u1,u2,mean,um,difference,sum,consistent,ref,uref,referenceConsistent,issues,complete:!issues.length};}
const api={num,pos,unc,fmt,rounded,fit,analyze};if(typeof module!=='undefined')module.exports=api;root.Lab4Math=api;
})(typeof window==='undefined'?globalThis:window);

(function(root){
'use strict';
function analyze(LmH,CnF,R){if([LmH,CnF,R].some(v=>v===null||v===undefined||String(v).trim()===''))return null;const L=Number(LmH)/1000,C=Number(CnF)*1e-9,r=Number(R);if(![L,C,r].every(Number.isFinite)||L<=0||C<=0||r<0)return null;const w0=1/Math.sqrt(L*C),alpha=r/(2*L),zeta=alpha/w0,crit=2*Math.sqrt(L/C);let kind,wd=null,s1=null,s2=null;if(Math.abs(zeta-1)<1e-10){kind='Critical';wd=0;s1=s2=-alpha;}else if(zeta<1){kind='Underdamped';wd=Math.sqrt(w0*w0-alpha*alpha);}else{kind='Overdamped';const q=Math.sqrt(alpha*alpha-w0*w0);s1=-w0*w0/(alpha+q);s2=-alpha-q;}return {L,C,R:r,w0,alpha,zeta,crit,kind,wd,s1,s2,f0:w0/(2*Math.PI)};}
const api={analyze};if(typeof module==='object')module.exports=api;else root.EcetLab7Math=api;
})(typeof window==='undefined'?globalThis:window);

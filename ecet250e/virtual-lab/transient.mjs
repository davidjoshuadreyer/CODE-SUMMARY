// Exact periodic steady-state solution for the handout's series RC / RL circuits.
export function response({kind='RC',r=10000,c=100e-9,l=.1,rg=50,coil=70,f=1000,vs=5}={}){
 if(!['RC','RL'].includes(kind)||![r,c,l,f,vs].every(x=>Number.isFinite(x)&&x>0)||![rg,coil].every(x=>Number.isFinite(x)&&x>=0))throw new Error('Use positive component values and frequency.');
 const total=r+rg+(kind==='RL'?coil:0),tau=kind==='RC'?total*c:l/total,idealTau=kind==='RC'?r*c:l/r,T=1/f,h=T/2,k=Math.exp(-h/tau),final=kind==='RC'?vs:vs/total,max=final/(1+k),min=max*k;
 function at(t){const phase=((t%T)+T)%T,on=phase<h,u=on?phase:phase-h,source=on?vs:0,stored=on?final+(min-final)*Math.exp(-u/tau):max*Math.exp(-u/tau),i=kind==='RC'?(source-stored)/total:stored,vR=i*r,terminal=source-i*rg,vStorage=terminal-vR;return {source:terminal,idealSource:source,vR,vStorage,i,stored}}
 return {kind,r,c,l,rg,coil,f,vs,total,tau,idealTau,T,h,min,max,vmin:kind==='RC'?min:min*r,vmax:kind==='RC'?max:max*r,at};
}
export function cursorTau(vmax,vmin,half){return vmax>vmin&&vmin>0&&half>0?half/Math.log(vmax/vmin):null}
export function arrangement(kind,observe='storage',r=10000,coil=70,precheck=''){
 const storage={id:kind==='RC'?'C1':'L1',type:kind==='RC'?'capacitor':'inductor',from:observe==='storage'?'A25':'A10',to:observe==='storage'?'A40':'A25',label:kind==='RC'?'100 nF':'100 mH'};
 const resistor={id:'R1',type:'resistor',from:observe==='storage'?'A10':'A25',to:observe==='storage'?'A25':'A40',r};
 const wires=[{id:'generator+',type:'wire',from:'G+',to:'C10',color:'#dc973b'},{id:'generator−',type:'wire',from:'G-',to:'C40',color:'#252b2d'}];
 const probes=[{id:'CH1',type:'wire',from:'S1',to:'D10',color:'#e6ca46'},{id:'CH2',type:'wire',from:'S2',to:'D25',color:'#62b9e4'},{id:'CH1 ground',type:'wire',from:'SG1',to:'D40',color:'#252b2d'},{id:'CH2 ground',type:'wire',from:'SG2',to:'E40',color:'#252b2d'}];
 if(precheck){const e=precheck==='coil'?{...storage,type:'resistor',r:coil,id:'Rcoil'}:{...resistor};const original=e.from;e.from='lift:'+e.id;return {edges:[e],red:e.from,black:e.to,lifts:{[e.from]:{hole:original}},removed:wires,powered:false,value:e.r}}
 return {edges:[resistor,storage,...wires,...probes],red:null,black:null,lifts:{},removed:[],powered:false};
}
export function paintScope(ctx,w,h,model,observe,on,cursors){
 ctx.fillStyle='#10232c';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#29424a';ctx.lineWidth=1;
 for(let i=0;i<=10;i++){ctx.beginPath();ctx.moveTo(i*w/10,0);ctx.lineTo(i*w/10,h);ctx.stroke()}for(let i=0;i<=8;i++){ctx.beginPath();ctx.moveTo(0,i*h/8);ctx.lineTo(w,i*h/8);ctx.stroke()}
 const y=v=>h*.52-v/(model.vs*2.6)*h,x=t=>w*.08+t/(2*model.T)*w*.86;
 ctx.font=`${Math.max(12,w/58)}px monospace`;ctx.fillStyle='#e4cb54';ctx.fillText('CH1 source',12,24);ctx.fillStyle='#78c9ef';ctx.fillText('CH2 '+(observe==='storage'?(model.kind==='RC'?'vC':'vL + coil drop'):'vR'),w*.3,24);
 if(on){for(const [key,color]of [['source','#e4cb54'],[observe==='storage'?'vStorage':'vR','#78c9ef']]){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();for(let n=0;n<=1000;n++){const t=n/1000*2*model.T,v=model.at(t)[key];n?ctx.lineTo(x(t),y(v)):ctx.moveTo(x(t),y(v))}ctx.stroke()}
 if(cursors){ctx.setLineDash([5,5]);ctx.strokeStyle='#eee7df';for(const v of [cursors.min,cursors.max]){ctx.beginPath();ctx.moveTo(0,y(v));ctx.lineTo(w,y(v));ctx.stroke()}for(const t of [cursors.x1,cursors.x2]){ctx.beginPath();ctx.moveTo(x(t),40);ctx.lineTo(x(t),h);ctx.stroke()}ctx.setLineDash([])}}else{ctx.fillStyle='#aebfc5';ctx.fillText('OUTPUT OFF · connect, then enable generator',w*.12,h*.5)}
 ctx.fillStyle='#99adb8';ctx.font=`${maxFont(w)}px monospace`;for(const v of [-5,-4,-3,-2,-1,0,1,2,3,4,5]){const yy=y(v);if(yy>35&&yy<h-25)ctx.fillText(v+' V',w-40,yy)}
 ctx.fillStyle='#cfdae0';ctx.fillText(`0        ${(model.T*1000).toFixed(3)} ms / period · DC coupling · 10:1`,12,h-12);
}

function maxFont(w){return Math.max(10,w/65)}

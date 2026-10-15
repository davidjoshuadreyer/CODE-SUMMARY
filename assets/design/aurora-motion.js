/* Gradient ribbons with a flowing particle field. Only visible canvases animate. */
function initAuroraFluid(){
 'use strict';
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const surfaces=new Map(),pointer={x:-10000,y:-10000},ripples=[];
 let frame=0,last=0,phase=0,scrollImpulse=0,previousScroll=scrollY;
 const palettes=[['#d6b7ff','#7771d9','#363e88'],['#e8e1b8','#aaa695','#353248'],['#ff8bd2','#f03f9f','#73265e'],['#ffb3a0','#ff634e','#9c333f']];
 const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
 function wave(x,layer,t,depth=0){return [.38,.55,.64,.87][layer]+Math.sin(x*6.4+t*.22+layer*1.8)*[.075,.085,.14,.09][layer]+Math.sin(x*11-t*.12+layer)*.025+depth;}
 function draw(s,t){
  const {canvas,ctx}=s,rect=canvas.getBoundingClientRect(),w=rect.width,h=rect.height;if(!w||!h)return;
  const dpr=Math.min(devicePixelRatio||1,1.5);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
  const px=(pointer.x-rect.left)/w,py=(pointer.y-rect.top)/h;
  const active=!reduce.matches&&px>-.1&&px<1.1&&py>-.1&&py<1.1;
  function displacement(x,y){let d=0;if(active){const dx=(x-px)*w/h,dy=y-py;const r=Math.sqrt(dx*dx+dy*dy);d+=Math.sin(r*17-t*2)*Math.exp(-r*r*8)*.045;}
   for(const ripple of ripples){const age=t-ripple.t;if(age<0||age>4)continue;const rx=(ripple.x-rect.left)/w,ry=(ripple.y-rect.top)/h;if(ry<-.3||ry>1.3)continue;const dist=Math.hypot((x-rx)*w/h,y-ry);d+=Math.sin(dist*20-age*5)*Math.exp(-Math.pow(dist-age*.17,2)*22)*Math.exp(-age)*.035;}return d+Math.sin(x*8-t)*scrollImpulse*.018;}
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'rgba(250,246,252,0)');sky.addColorStop(.3,'#f9e6f0');sky.addColorStop(.75,'#efb3d7');sky.addColorStop(1,'#edb6bd');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  for(let layer=0;layer<4;layer++){
   const base=[.38,.55,.64,.87][layer],g=ctx.createLinearGradient(0,(base-.12)*h,0,(base+[.48,.30,.48,.5][layer])*h);
   palettes[layer].forEach((color,i)=>g.addColorStop([0,.35,1][i],color));ctx.fillStyle=g;ctx.beginPath();
   for(let x=-.02;x<=1.025;x+=.008){const y=wave(x,layer,t);const yy=(y+displacement(x,y))*h;if(x===-.02)ctx.moveTo(x*w,yy);else ctx.lineTo(x*w,yy);}
   ctx.lineTo(w+8,h+10);ctx.lineTo(-8,h+10);ctx.closePath();ctx.filter='blur(1.3px)';ctx.fill();ctx.filter='none';
   // Thousands of fine points ride the same field as their ribbon, with independent drift.
   const count=Math.round(Math.min(1600,w*1.5));
   for(let i=0;i<count;i++){const seed=i+layer*2000;const x=(random(seed)+t*(.009+layer*.002))%1;const depth=random(seed+67)*.29;const y=wave(x,layer,t,depth);const dy=displacement(x,y);if(y+dy>1.02)continue;
    ctx.fillStyle=i%3===0?'rgba(255,245,255,.35)':'rgba(39,22,65,.19)';const size=.55+random(seed+18)*.9;ctx.fillRect(x*w,(y+dy)*h,size,size);}
  }
  // Static film grain over the moving colors; generated once per surface, never flickers.
  if(!s.grain){const tile=document.createElement('canvas');tile.width=tile.height=160;const c=tile.getContext('2d'),data=c.createImageData(160,160);for(let i=0;i<data.data.length;i+=4){const value=random(i)> .5?255:24;data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=random(i+3)*60;}c.putImageData(data,0,0);s.grain=ctx.createPattern(tile,'repeat');}
  ctx.fillStyle=s.grain;ctx.fillRect(0,0,w,h);
 }
 function allowed(){return !document.hidden&&root.dataset.studyStyle!=='report';}
 function tick(now){frame=0;if(!allowed())return;const dt=last?Math.min((now-last)/1000,.05):0;if(now-last<32){frame=requestAnimationFrame(tick);return;}last=now;
  if(!reduce.matches){phase+=dt;scrollImpulse*=.94;}else scrollImpulse=0;
  for(const [host,s] of surfaces){if(!host.isConnected){observer.unobserve(host);surfaces.delete(host);continue;}if(s.visible)draw(s,reduce.matches?0:phase);}
  while(ripples.length&&phase-ripples[0].t>4)ripples.shift();
  if(!reduce.matches&&[...surfaces.values()].some(s=>s.visible))frame=requestAnimationFrame(tick);
 }
 function wake(){if(!frame&&allowed()){last=0;frame=requestAnimationFrame(tick);}}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const s=surfaces.get(e.target);if(s)s.visible=e.isIntersecting;});wake();},{rootMargin:'40px'});
 function mount(){document.querySelectorAll('.studio-feature-art,.report-cover,body>footer,.shell>footer').forEach(host=>{if(surfaces.has(host))return;const canvas=document.createElement('canvas');canvas.className='aurora-fluid';canvas.setAttribute('aria-hidden','true');const ctx=canvas.getContext('2d');if(!ctx)return;host.append(canvas);host.classList.add('has-fluid');surfaces.set(host,{canvas,ctx,visible:false});observer.observe(host);});wake();}
 addEventListener('pointermove',e=>{pointer.x=e.clientX;pointer.y=e.clientY;},{passive:true});
 addEventListener('pointerdown',e=>{pointer.x=e.clientX;pointer.y=e.clientY;if(!reduce.matches){ripples.push({x:e.clientX,y:e.clientY,t:phase});if(ripples.length>5)ripples.shift();}wake();},{passive:true});
 document.addEventListener('pointerleave',()=>{pointer.x=pointer.y=-10000;});
 addEventListener('scroll',()=>{scrollImpulse=Math.max(-2,Math.min(2,scrollImpulse+(scrollY-previousScroll)*.006));previousScroll=scrollY;wake();},{passive:true});
 addEventListener('resize',wake,{passive:true});reduce.addEventListener('change',()=>{ripples.length=0;wake();});
 document.addEventListener('visibilitychange',()=>{cancelAnimationFrame(frame);frame=0;last=0;wake();});
 new MutationObserver(()=>{cancelAnimationFrame(frame);frame=0;wake();}).observe(root,{attributes:true,attributeFilter:['data-study-style']});
 new MutationObserver(mutations=>{if(mutations.some(m=>[...m.addedNodes].some(n=>n.nodeType===1&&!n.matches('.aurora-fluid'))))mount();}).observe(document.body,{childList:true,subtree:true});
 mount();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initAuroraFluid,{once:true});else initAuroraFluid();

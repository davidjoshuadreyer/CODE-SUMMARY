/* Damped spring response for decorative landscape layers only. No idle loop. */
(() => {
 'use strict';
 const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,last=0,x=0,y=0,vx=0,vy=0,tx=0,ty=0,scroll=0,pointerX=0,pointerY=0;
 const enabled=()=>!reduced.matches&&root.dataset.studyStyle!=='report'&&!document.hidden;
 function paint(){root.style.setProperty('--aurora-x',x.toFixed(2)+'px');root.style.setProperty('--aurora-y',y.toFixed(2)+'px');root.style.setProperty('--aurora-hue',(x*.55+y*.35).toFixed(2)+'deg');root.style.setProperty('--aurora-light-x',(50+x*1.6).toFixed(2)+'%');}
 function reset(){cancelAnimationFrame(frame);frame=0;last=0;x=y=vx=vy=tx=ty=0;paint();}
 function tick(time){if(!enabled()){reset();return;}const dt=last?Math.min((time-last)/1000,1/30):1/60;last=time;
  // Spring force toward input, with near-critical damping to avoid wobbling text nearby.
  vx+=(90*(tx-x)-18*vx)*dt;vy+=(90*(ty-y)-18*vy)*dt;x+=vx*dt;y+=vy*dt;paint();
  if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.035)frame=requestAnimationFrame(tick);else{x=tx;y=ty;paint();frame=0;last=0;}
 }
 function target(){if(!enabled()){reset();return;}tx=pointerX*14;ty=pointerY*8+scroll*7;if(!frame)frame=requestAnimationFrame(tick);}
 function point(e){if(e.pointerType==='touch')return;pointerX=Math.max(-1,Math.min(1,e.clientX/innerWidth*2-1));pointerY=Math.max(-1,Math.min(1,e.clientY/innerHeight*2-1));target();}
 addEventListener('pointermove',point,{passive:true});addEventListener('pointerdown',point,{passive:true});
 document.addEventListener('pointerleave',()=>{pointerX=pointerY=0;target();});
 function scrollTarget(){const range=document.documentElement.scrollHeight-innerHeight;scroll=range>0?(scrollY/range)*2-1:0;target();}
 addEventListener('scroll',scrollTarget,{passive:true});addEventListener('resize',scrollTarget,{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches)reset();else scrollTarget();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();else scrollTarget();});
 new MutationObserver(()=>{if(root.dataset.studyStyle==='report')reset();else scrollTarget();}).observe(root,{attributes:true,attributeFilter:['data-study-style']});
 scrollTarget();
})();

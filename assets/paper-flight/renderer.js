/* Paper flight landscape. All animation is driven by the caller's elapsed seconds. */
(() => {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const palettes = [ ['#d4b5f5','#8679bc','#635e94'], ['#d8d5a8','#b0b18c','#858779'], ['#efa0cf','#c875ab','#a0558a'], ['#f8ae99','#e78c83','#c66e7d'] ];
  const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  class FlightRenderer {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d');
      this.time = 0; this.cameraY = 0; this.trail = []; this.lastPhase = ''; this.trailClock = 0; this.povPitch = 0;
      const noise = document.createElement('canvas'); noise.width = noise.height = 256;
      const nc = noise.getContext('2d'), pixels = nc.createImageData(256, 256);
      for (let i=0;i<pixels.data.length;i+=4) {
        const v = random(i+7), light = v > .5;
        pixels.data[i]=light?255:55; pixels.data[i+1]=light?247:35; pixels.data[i+2]=light?255:63;
        pixels.data[i+3]=Math.floor(12+Math.abs(v-.5)*58);
      }
      nc.putImageData(pixels,0,0); this.grain=this.ctx.createPattern(noise,'repeat');
      this.specks=Array.from({length:140},(_,i)=>({x:random(i+17),y:random(i+480),size:.5+random(i+50)*1.2}));
      this.resize(); this.observer=new ResizeObserver(()=>this.resize()); this.observer.observe(canvas);
    }
    resize() {
      const r=this.canvas.getBoundingClientRect(); this.w=r.width;this.h=r.height;
      this.dpr=Math.min(window.devicePixelRatio||1,2);
      this.canvas.width=Math.round(this.w*this.dpr); this.canvas.height=Math.round(this.h*this.dpr);
      this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);
      if(!this.w||!this.h)return;
      this.sky=this.ctx.createLinearGradient(0,0,this.w*.3,this.h);
      this.sky.addColorStop(0,'#f5eaf7');this.sky.addColorStop(.5,'#f6dfeb');this.sky.addColorStop(1,'#f3cbd6');
      this.glow=this.ctx.createRadialGradient(this.w*.78,this.h*.25,0,this.w*.78,this.h*.25,this.h*.5);
      this.glow.addColorStop(0,'#fff9e7b0');this.glow.addColorStop(.4,'#fff9e735');this.glow.addColorStop(1,'#fff9e700');
      this.wavePaint=palettes.map((colors,i)=>{const g=this.ctx.createLinearGradient(0,this.h*(.45+i*.1),0,this.h*1.13);colors.forEach((c,j)=>g.addColorStop(j/2,c));return g;});
    }
    wave(x,i,offset) {
      return [.64,.74,.83,.96][i]+Math.sin(x*5.1+offset+i*1.8)*[.07,.055,.065,.06][i]+Math.sin(x*10.2-offset*.35+i)*.018;
    }
    draw(state={}, options={}, dt=0) {
      const {ctx:c,w,h}=this;if(!w||!h)return;
      const phase=options.phase||'ready', quiet=!!options.quiet, paused=!!options.paused;
      const step=paused?0:clamp(dt,0,.08), moving=phase==='flying';
      const x=Number(state.x)||0,y=Math.max(0,Number(state.y)||0), scale=w<600?2:2.5;
      if(phase!==this.lastPhase && (phase==='ready'||phase==='charging')){this.trail.length=0;this.trailClock=0;this.cameraY=0;this.povPitch=Number(state.pitch)||0;}
      this.lastPhase=phase;if(this.lastView!==options.view){this.trail.length=0;this.trailClock=0;this.lastView=options.view;}if(!quiet)this.time+=step;
      if(options.view==='pov'){this.drawPOV(state,options,step);return;}
      const targetCamera=Math.max(0,y-(h*.54/scale));
      if(!paused)this.cameraY=quiet?targetCamera:this.cameraY+(targetCamera-this.cameraY)*(1-Math.exp(-step*3.5));
      const t=quiet?0:this.time, px=w*(w<600?.31:.27), ground=h*.79+this.cameraY*scale;
      const py=ground-y*scale + ((!quiet&&(phase==='ready'||phase==='charging'))?Math.sin(t*1.6)*2.5:0);
      c.fillStyle=this.sky;c.fillRect(0,0,w,h);c.fillStyle=this.glow;c.fillRect(0,0,w,h);
      // A faint sun behind the grain gives the atmosphere a warm, printed quality.
      c.beginPath();c.arc(w*.79,h*.24,Math.min(w,h)*.078,0,Math.PI*2);c.fillStyle='#fff7e540';c.fill();
      for(let i=0;i<4;i++) {
        const offset=t*.055+(quiet?0:x*.00085*(i+1));c.fillStyle=this.wavePaint[i];c.beginPath();
        for(let j=0;j<=100;j++){const nx=j/100,wy=this.wave(nx,i,offset)*h+this.cameraY*scale*.08*(i+1);j?c.lineTo(nx*w,wy):c.moveTo(0,wy);}
        c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
        // Contour lines drift with the landscape, never the camera's frame rate.
        c.save();c.clip();c.strokeStyle='#fff9ed28';c.lineWidth=.8;
        for(let line=0;line<3;line++){c.beginPath();for(let j=0;j<=70;j++){const nx=j/70,wy=(this.wave(nx,i,offset)+.014+line*.022)*h+this.cameraY*scale*.08*(i+1);j?c.lineTo(nx*w,wy):c.moveTo(0,wy);}c.stroke();}
        for(let j=0;j<this.specks.length;j++){const p=this.specks[j],sx=((p.x+t*.002*(i+1))%1)*w,sy=(this.wave(sx/w,i,offset)+p.y*.3)*h;c.fillStyle=j%3?'#fff6ed48':'#49365020';c.fillRect(sx,sy,p.size,p.size);}
        c.restore();
      }
      // Thermal columns and the distance ruler are world anchored navigation cues.
      const left=x-px/scale,right=x+(w-px)/scale;
      if(moving||phase==='landed'){
        const first=Math.max(0,Math.floor((left-220-65)/400));
        for(let n=first;220+n*400<right+65;n++)this.thermal(px+(220+n*400-x)*scale,ground,scale,t,quiet);
        c.font='10px ui-monospace, SFMono-Regular, monospace';c.textAlign='center';
        for(let mark=Math.max(0,Math.ceil(left/100)*100);mark<right;mark+=100){const sx=px+(mark-x)*scale;c.strokeStyle='#fff8ed66';c.beginPath();c.moveTo(sx,h-118);c.lineTo(sx,h-112);c.stroke();c.fillStyle='#573d5c';c.fillText(mark+' m',sx,h-100);}
        if(options.best>0){const bx=px+(options.best-x)*scale;if(bx>-50&&bx<w+50){c.save();c.setLineDash([3,6]);c.strokeStyle='#725a8060';c.beginPath();c.moveTo(bx,112);c.lineTo(bx,h-120);c.stroke();c.setLineDash([]);c.fillStyle='#725a80';c.font='10px ui-monospace, monospace';c.fillText('PERSONAL BEST',clamp(bx,55,w-55),103);c.restore();}}
      }
      // Trail stores world positions, so every point follows the same camera.
      if(quiet)this.trail.length=0;
      if(moving&&!paused&&!quiet){this.trailClock+=step;if(this.trailClock>=1/45){this.trail.push({x,y,time:this.time});this.trailClock=0;}}
      if(!paused)while(this.trail.length&&(this.time-this.trail[0].time>2.6||this.trail.length>130))this.trail.shift();
      if(!quiet&&this.trail.length>1){
        for(let side=-1;side<=1;side+=2){c.beginPath();this.trail.forEach((p,i)=>{const tx=px+(p.x-x)*scale-17,ty=ground-p.y*scale+side*7; i?c.lineTo(tx,ty):c.moveTo(tx,ty);});c.strokeStyle=side===1?'#fffaf080':'#fffaf050';c.lineWidth=side===1?1.5:.8;c.stroke();}
      }
      // Paper texture is a cached tile, composited once per frame (no pixel allocation).
      c.save();c.globalAlpha=.54;c.fillStyle=this.grain;c.fillRect(0,0,w,h);c.restore();
      if(phase==='charging'){
        const charge=clamp(options.charge||0,0,1);c.save();c.translate(px,py);c.rotate(-.24);c.setLineDash([2,6]);c.strokeStyle='#80698a65';c.lineWidth=1;c.beginPath();c.moveTo(40,0);c.quadraticCurveTo(85,-15,120+charge*75,-3-charge*22);c.stroke();c.restore();
      }
      this.plane(px,clamp(py,25,h-45),-(Number(state.pitch)||0),options.config||{},w<600?.82:1,phase,state,t,quiet);
    }
    drawPOV(state, options, dt) {
      const {ctx:c,w,h}=this,quiet=!!options.quiet;
      const flying=options.phase==='flying',x=Number(state.x)||0,altitude=Math.max(4,Number(state.y)||0);
      const target=clamp(Number(state.pitch)||0,-.65,.65);
      if(!options.paused)this.povPitch=quiet?0:this.povPitch+(target-this.povPitch)*(1-Math.exp(-dt*5));
      // Camera looks forward along the flight path. Pitch shifts the horizon;
      // distance bands expand toward the viewer using perspective division.
      const horizon=h*(.37+this.povPitch*.36),focal=Math.min(w*.85,h*1.1),cx=w*.5;
      const travel=quiet?0:x,t=quiet?0:this.time;
      const project=(lateral,z,elevation=0)=>({x:cx+lateral*focal/z,y:horizon+(altitude-elevation)*focal/z});
      c.fillStyle=this.sky;c.fillRect(0,0,w,h);c.fillStyle=this.glow;c.fillRect(0,0,w,h);
      c.beginPath();c.arc(w*.74,horizon-h*.13,Math.min(w,h)*.045,0,Math.PI*2);c.fillStyle='#fff8e6b0';c.fill();
      // Distant paper ridges are still the same softly layered coast.
      for(let layer=0;layer<4;layer++){
        c.fillStyle=this.wavePaint[layer];c.beginPath();
        for(let j=0;j<=90;j++){const nx=j/90,y=horizon+layer*12+Math.sin(nx*5+layer*1.7+t*.04+travel*.0004)*h*.025;j?c.lineTo(nx*w,y):c.moveTo(0,y);}
        c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
      }
      const band=42,near=8,far=1700;
      for(let world=Math.ceil((travel+far)/band)*band;world>travel+near;world-=band){
        const zFar=world-travel,zNear=Math.max(near,zFar-band),index=Math.floor(world/band);
        c.beginPath();
        for(let j=0;j<=40;j++){const lateral=(j/40-.5)*4000,elev=Math.sin(lateral*.005+world*.009)*5;const p=project(lateral,zFar,elev);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}
        for(let j=40;j>=0;j--){const lateral=(j/40-.5)*4000,elev=Math.sin(lateral*.005+(world-band)*.009)*5;const p=project(lateral,zNear,elev);c.lineTo(p.x,p.y);}
        c.closePath();c.fillStyle=palettes[((index%4)+4)%4][0];c.globalAlpha=.22;c.fill();c.globalAlpha=1;
        c.beginPath();for(let j=0;j<=40;j++){const lateral=(j/40-.5)*4000;const p=project(lateral,zFar,Math.sin(lateral*.005+world*.009)*5);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.strokeStyle='#fff7ef35';c.lineWidth=.8;c.stroke();
      }
      // World-anchored surface flecks grow as they pass beneath the nose.
      for(let i=0;i<210;i++){const z=15+((random(i+80)*1000-travel%1000+1000)%1000),lateral=(random(i+460)-.5)*1600,p=project(lateral,z);if(p.y<horizon||p.y>h||p.x<0||p.x>w)continue;const size=clamp(110/z,.5,2.8);c.fillStyle=i%3?'#fff4ef65':'#5b3d661e';c.fillRect(p.x,p.y,size,size);}
      // Updrafts line up with the same physical thermal zones as side view.
      if(flying||options.phase==='landed'){
        const next=220+Math.max(0,Math.ceil((x-220)/400))*400,ahead=next-x;
        if(ahead>3&&ahead<900){const depth=Math.max(35,ahead),left=project(-65,depth),right=project(65,depth),top=project(0,depth,135);const topY=clamp(top.y,115,h*.55),bottomY=Math.min(h*.82,left.y),span=Math.min(w*.8,right.x-left.x);
          const glow=c.createLinearGradient(cx-span/2,0,cx+span/2,0);glow.addColorStop(0,'#fffadf00');glow.addColorStop(.5,'#fffadf40');glow.addColorStop(1,'#fffadf00');c.fillStyle=glow;c.fillRect(cx-span/2,topY,span,Math.max(0,bottomY-topY));
          c.strokeStyle='#fffbe5a0';c.lineWidth=1.2;for(let i=0;i<9;i++){const progress=(i/9+t*.16)%1,yy=bottomY-progress*(bottomY-topY),xx=cx+Math.sin(i*2+progress*4)*span*.3;c.globalAlpha=Math.sin(progress*Math.PI)*.75;c.beginPath();c.moveTo(xx-5,yy+4);c.quadraticCurveTo(xx,yy-5,xx+5,yy+4);c.stroke();}c.globalAlpha=1;

        }
        if(state.thermal>.4){c.fillStyle='#fff8de18';c.fillRect(0,0,w,h);}
      }
      c.save();c.globalAlpha=.54;c.fillStyle=this.grain;c.fillRect(0,0,w,h);c.restore();
      // The paper nose and inner folds frame a pilot's-eye view, not a chase camera.
      const nose=h*.67,base=h*1.08,span=w*(.27+clamp(Number(options.config?.wing??50),0,100)*.0012);
      const shape=(points,color)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#9e84ad40';c.lineWidth=1;c.stroke();};
      shape([[cx,nose],[cx-span,base],[cx-12,h*.91]],'#fff9ed');shape([[cx,nose],[cx+span,base],[cx+12,h*.91]],'#eee3ed');shape([[cx,nose],[cx-12,h*.91],[cx,base],[cx+12,h*.91]],'#cbb8d8');
      c.save();c.beginPath();c.moveTo(cx,nose);c.lineTo(cx-span,base);c.lineTo(cx+span,base);c.closePath();c.clip();c.globalAlpha=.3;c.fillStyle=this.grain;c.fillRect(0,nose,w,h-nose);c.restore();
      FlightHUD.draw(c,w,h,state,options,this.povPitch);
    }
    thermal(sx,ground,scale,t,quiet) {
      const c=this.ctx,top=Math.max(54,ground-110*scale),bottom=Math.min(this.h-45,ground),span=65*scale;
      const glow=c.createLinearGradient(sx-span,0,sx+span,0);glow.addColorStop(0,'#fff9dc00');glow.addColorStop(.5,'#fff9dc27');glow.addColorStop(1,'#fff9dc00');c.fillStyle=glow;c.fillRect(sx-span,top,span*2,bottom-top);
      c.save();c.strokeStyle='#fffbed92';c.lineWidth=1.1;
      for(let i=0;i<7;i++) {const progress=(i/7+(quiet?0:t*.13))%1,yy=bottom-progress*(bottom-top),xx=sx+Math.sin(progress*5+i)*span*.44;c.globalAlpha=Math.sin(progress*Math.PI)*.8;c.beginPath();c.moveTo(xx-4,yy+4);c.quadraticCurveTo(xx,yy-4,xx+4,yy+4);c.stroke();}
      c.globalAlpha=.65;c.font='9px ui-monospace, monospace';c.textAlign='center';c.fillStyle='#6d6272';c.fillText('RISING AIR',sx,top-8);c.restore();
    }
    plane(x,y,angle,config,size,phase,state,t,quiet) {
      const c=this.ctx,wing=clamp(Number(config.wing??50),0,100),span=17+wing*.15;
      const flutter=!quiet&&state.stalled?Math.sin(t*24)*.035:0;
      c.save();c.translate(x,y);c.rotate(clamp(angle,-1.2,1.2)+flutter);c.scale(size,size);
      const points=[[-36,-span],[43,0],[-31,span*.88],[-15,2]];
      c.shadowColor='#634e7435';c.shadowBlur=14;c.shadowOffsetY=7;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#fff9ed';c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
      c.beginPath();c.moveTo(-36,-span);c.lineTo(43,0);c.lineTo(-15,2);c.closePath();const g=c.createLinearGradient(0,-span,0,4);g.addColorStop(0,'#fffdf6');g.addColorStop(1,'#eadfeb');c.fillStyle=g;c.fill();
      c.beginPath();c.moveTo(-15,2);c.lineTo(43,0);c.lineTo(-31,span*.88);c.closePath();c.fillStyle='#f2e9e8';c.fill();
      c.beginPath();c.moveTo(-15,2);c.lineTo(43,0);c.lineTo(-10,11);c.closePath();c.fillStyle='#bda9ca';c.fill();
      c.beginPath();c.moveTo(-36,-span);c.lineTo(-15,2);c.lineTo(43,0);c.moveTo(-15,2);c.lineTo(-31,span*.88);c.strokeStyle='#a891b94f';c.lineWidth=.8;c.stroke();
      // A tiny brass balance tab moves with the actual center-of-gravity setting.
      const tab=-12+clamp(Number(config.balance??50),0,100)*.2;c.beginPath();c.moveTo(tab,2);c.lineTo(tab+5,1.8);c.lineTo(tab+2,5);c.closePath();c.fillStyle='#b59b72';c.fill();
      c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.clip();c.globalAlpha=.3;c.fillStyle=this.grain;c.fillRect(-40,-40,90,85);c.restore();c.restore();
    }
    destroy(){this.observer.disconnect();}
  }
  window.FlightRenderer=FlightRenderer;
})();

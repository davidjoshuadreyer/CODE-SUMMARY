/* Paper flight landscape. All animation is driven by the caller's elapsed seconds. */
(() => {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const palettes = [ ['#d4b5f5','#8679bc','#635e94'], ['#d8d5a8','#b0b18c','#858779'], ['#efa0cf','#c875ab','#a0558a'], ['#f8ae99','#e78c83','#c66e7d'] ];
  const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  class FlightRenderer {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d');
      this.crashTime = 0; this.time = 0; this.cameraY = 0; this.trail = []; this.lastPhase = ''; this.trailClock = 0; this.povPitch = 0; this.povRoll = 0;
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
      if(phase==='crashing'&&this.lastPhase!=='crashing')this.crashTime=0;if((phase==='crashing'||phase==='landed')&&!paused)this.crashTime+=step;this.lastPhase=phase;if(this.lastView!==options.view){this.trail.length=0;this.trailClock=0;this.lastView=options.view;}if(!quiet)this.time+=step;
      if(options.view==='pov'){this.drawPOV(state,options,step);return;}
      const targetCamera=Math.max(0,y-(h*.54/scale));
      if(!paused&&phase!=='crashing'&&phase!=='landed')this.cameraY=quiet?targetCamera:this.cameraY+(targetCamera-this.cameraY)*(1-Math.exp(-step*3.5));
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
      this.sideTerrain(state,px,ground,scale,t,quiet);
      // Thermal columns and the distance ruler are world anchored navigation cues.
      const left=x-px/scale,right=x+(w-px)/scale;
      if(moving||phase==='crashing'||phase==='landed'){
        const heading=(Number.isFinite(state.heading)?state.heading:90)*Math.PI/180;
        for(const mark of window.FlightPhysics?.LANDMARKS||[]){if(mark.kind!=='thermal')continue;const de=mark.east-(Number(state.east)||0),dn=mark.north-(Number(state.north)||0),ahead=de*Math.sin(heading)+dn*Math.cos(heading),across=de*Math.cos(heading)-dn*Math.sin(heading);if(Math.abs(across)<mark.radius&&px+ahead*scale>-100&&px+ahead*scale<w+100)this.thermal(px+ahead*scale,ground-(window.FlightPhysics?.terrainHeight?.(mark.east,mark.north)||0)*scale,scale,t,quiet);}
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
      this.weather(state,quiet,t);
      this.plane(px,clamp(py,25,h-45),-(Number(state.pitch)||0),options.config||{},w<600?.82:1,phase,state,t,quiet);
    }
    drawPOV(state, options, dt) {
      const {ctx:c,w,h}=this,quiet=!!options.quiet;
      const flying=options.phase==='flying',x=Number(state.x)||0,altitude=Math.max(4,Number(state.y)||0);
      const target=clamp(Number(state.pitch)||0,-.65,.65);
      if(!options.paused)this.povPitch=quiet?0:this.povPitch+(target-this.povPitch)*(1-Math.exp(-dt*5));
      // Camera looks forward along the flight path. Pitch shifts the horizon;
      // distance bands expand toward the viewer using perspective division.
      this.povRoll=quiet?0:(Number(state.roll)||0);
      const focal=Math.min(w*.85,h*1.1),horizon=h*.37+this.povPitch*focal,cx=w*.5;
      const travel=quiet?0:x,t=quiet?0:this.time, heading=(Number.isFinite(state.heading)?state.heading:90)*Math.PI/180;
      c.save();c.translate(w/2,h*.37);c.rotate(-this.povRoll);const cover=1+Math.abs(Math.sin(this.povRoll))*.95;c.scale(cover,cover);c.translate(-w/2,-h*.37);
      const project=(lateral,z,elevation=0)=>({x:cx+lateral*focal/z,y:horizon+(altitude-elevation)*focal/z});
      c.fillStyle=this.sky;c.fillRect(0,0,w,h);c.fillStyle=this.glow;c.fillRect(0,0,w,h);
      c.beginPath();c.arc(w*.74,horizon-h*.13,Math.min(w,h)*.045,0,Math.PI*2);c.fillStyle='#fff8e6b0';c.fill();
      // Distant paper ridges are still the same softly layered coast.
      for(let layer=0;layer<4;layer++){
        c.fillStyle=this.wavePaint[layer];c.beginPath();
        for(let j=0;j<=90;j++){const nx=j/90,y=horizon+layer*12+Math.sin(nx*5+layer*1.7+heading*2)*h*.025;j?c.lineTo(nx*w,y):c.moveTo(0,y);}
        c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
      }
      const band=42,near=8,far=1700;
      const terrain=(lateral,z)=>window.FlightPhysics?.terrainHeight?.((Number(state.east)||0)+Math.sin(heading)*z+Math.cos(heading)*lateral,(Number(state.north)||0)+Math.cos(heading)*z-Math.sin(heading)*lateral)||0;
      for(let world=Math.ceil((travel+far)/band)*band;world>travel+near;world-=band){
        const zFar=world-travel,zNear=Math.max(near,zFar-band),index=Math.floor(world/band);
        c.beginPath();
        for(let j=0;j<=40;j++){const lateral=(j/40-.5)*4000,elev=terrain(lateral,zFar);const p=project(lateral,zFar,elev);j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}
        for(let j=40;j>=0;j--){const lateral=(j/40-.5)*4000,elev=terrain(lateral,zNear);const p=project(lateral,zNear,elev);c.lineTo(p.x,p.y);}
        c.closePath();c.fillStyle=palettes[((index%4)+4)%4][0];c.globalAlpha=.22;c.fill();c.globalAlpha=1;
        c.beginPath();for(let j=0;j<=40;j++){const lateral=(j/40-.5)*4000;const p=project(lateral,zFar,terrain(lateral,zFar));j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.strokeStyle='#fff7ef35';c.lineWidth=.8;c.stroke();
      }
      // World-anchored surface flecks grow as they pass beneath the nose.
      for(let i=0;i<210;i++){const z=15+((random(i+80)*1000-travel%1000+1000)%1000),lateral=(random(i+460)-.5)*1600,p=project(lateral,z);if(p.y<horizon||p.y>h||p.x<0||p.x>w)continue;const size=clamp(110/z,.5,2.8);c.fillStyle=i%3?'#fff4ef65':'#5b3d661e';c.fillRect(p.x,p.y,size,size);}
      // Navigation uses the same east/north world as the flight model.
      this.world(state, project, focal, horizon, t, quiet,options.navigation);
      this.weather(state,quiet,t);
      c.save();c.globalAlpha=.54;c.fillStyle=this.grain;c.fillRect(0,0,w,h);c.restore();
      c.restore();
      // The paper nose and inner folds frame a pilot's-eye view, not a chase camera.
      c.save(); if(state.crashed)c.globalAlpha=quiet?.35:Math.max(0,1-this.crashTime*2);
      const nose=h*.67,base=h*1.08,span=w*(.27+clamp(Number(options.config?.wing??50),0,100)*.0012);
      const shape=(points,color)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#9e84ad40';c.lineWidth=1;c.stroke();};
      shape([[cx,nose],[cx-span,base],[cx-12,h*.91]],'#fff9ed');shape([[cx,nose],[cx+span,base],[cx+12,h*.91]],'#eee3ed');shape([[cx,nose],[cx-12,h*.91],[cx,base],[cx+12,h*.91]],'#cbb8d8');
      c.save();c.beginPath();c.moveTo(cx,nose);c.lineTo(cx-span,base);c.lineTo(cx+span,base);c.closePath();c.clip();c.globalAlpha=.3;c.fillStyle=this.grain;c.fillRect(0,nose,w,h-nose);c.restore();
      // Narrow folded seams and warm paper edges retain a handmade silhouette.
      c.strokeStyle='#b7a0be75';c.lineWidth=1;c.beginPath();c.moveTo(cx,nose+16);c.lineTo(cx-span*.72,base);c.moveTo(cx,nose+16);c.lineTo(cx+span*.72,base);c.stroke();
      c.fillStyle='#bb9879';c.fillRect(cx-3,h*.91,6,16);c.restore();
      if(state.crashed)this.crumble(cx,h*.74,quiet,2.3);
      if(state.boosting&&!quiet){c.strokeStyle='#fff8dc88';c.lineWidth=1.5;for(let i=0;i<12;i++){const a=i/12*Math.PI*2, r=.35+((t*1.6+i/12)%1)*.3;c.beginPath();c.moveTo(cx+Math.cos(a)*w*r,h*.45+Math.sin(a)*h*r);c.lineTo(cx+Math.cos(a)*w*(r+.055),h*.45+Math.sin(a)*h*(r+.055));c.stroke();}}
      FlightHUD.draw(c,w,h,state,options,this.povPitch,this.povRoll);
    }
    thermal(sx,ground,scale,t,quiet) {
      const c=this.ctx,top=Math.max(54,ground-110*scale),bottom=Math.min(this.h-45,ground),span=65*scale;
      const glow=c.createLinearGradient(sx-span,0,sx+span,0);glow.addColorStop(0,'#fff9dc00');glow.addColorStop(.5,'#fff9dc27');glow.addColorStop(1,'#fff9dc00');c.fillStyle=glow;c.fillRect(sx-span,top,span*2,bottom-top);
      c.save();c.strokeStyle='#fffbed92';c.lineWidth=1.1;
      for(let i=0;i<7;i++) {const progress=(i/7+(quiet?0:t*.13))%1,yy=bottom-progress*(bottom-top),xx=sx+Math.sin(progress*5+i)*span*.44;c.globalAlpha=Math.sin(progress*Math.PI)*.8;c.beginPath();c.moveTo(xx-4,yy+4);c.quadraticCurveTo(xx,yy-4,xx+4,yy+4);c.stroke();}
      c.globalAlpha=.65;c.font='9px ui-monospace, monospace';c.textAlign='center';c.fillStyle='#6d6272';c.fillText('RISING AIR',sx,top-8);c.restore();
    }
    plane(x,y,angle,config,size,phase,state,t,quiet) {
      if(state.crashed){this.crumble(x,y,quiet,size);return;}
      const c=this.ctx,wing=clamp(Number(config.wing??50),0,100),span=17+wing*.15;
      const flutter=!quiet&&state.stalled?Math.sin(t*24)*.035:0;
      c.save();c.translate(x,y);c.rotate(clamp(angle,-1.2,1.2)+flutter);c.scale(size,size);
      if(state.boosting){c.save();c.strokeStyle='#fff2bbaa';c.lineWidth=3;c.beginPath();c.moveTo(-25,0);c.lineTo(-60-(quiet?0:Math.sin(t*35)*8),0);c.stroke();c.restore();}
      const points=[[-36,-span],[43,0],[-31,span*.88],[-15,2]];
      c.shadowColor='#634e7435';c.shadowBlur=14;c.shadowOffsetY=7;c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle='#fff9ed';c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
      c.beginPath();c.moveTo(-36,-span);c.lineTo(43,0);c.lineTo(-15,2);c.closePath();const g=c.createLinearGradient(0,-span,0,4);g.addColorStop(0,'#fffdf6');g.addColorStop(1,'#eadfeb');c.fillStyle=g;c.fill();
      c.beginPath();c.moveTo(-15,2);c.lineTo(43,0);c.lineTo(-31,span*.88);c.closePath();c.fillStyle='#f2e9e8';c.fill();
      c.beginPath();c.moveTo(-15,2);c.lineTo(43,0);c.lineTo(-10,11);c.closePath();c.fillStyle='#bda9ca';c.fill();
      c.beginPath();c.moveTo(-36,-span);c.lineTo(-15,2);c.lineTo(43,0);c.moveTo(-15,2);c.lineTo(-31,span*.88);c.strokeStyle='#a891b94f';c.lineWidth=.8;c.stroke();
      c.strokeStyle='#b7a2bc80';c.lineWidth=.65;c.beginPath();c.moveTo(-29,-span+4);c.lineTo(39,0);c.lineTo(-26,span*.7);c.moveTo(-30,-span*.6);c.lineTo(-15,2);c.lineTo(-26,span*.7);c.stroke();
      c.fillStyle='#b593b166';c.beginPath();c.moveTo(-32,-span+2);c.lineTo(-22,-span*.72);c.lineTo(-18,-span*.57);c.lineTo(-29,-span*.78);c.closePath();c.fill();
      // A tiny brass balance tab moves with the actual center-of-gravity setting.
      const tab=-12+clamp(Number(config.balance??50),0,100)*.2;c.beginPath();c.moveTo(tab,2);c.lineTo(tab+5,1.8);c.lineTo(tab+2,5);c.closePath();c.fillStyle='#b59b72';c.fill();
      c.save();c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.clip();c.globalAlpha=.3;c.fillStyle=this.grain;c.fillRect(-40,-40,90,85);c.restore();c.restore();
    }
    sideTerrain(state,px,ground,scale,t,quiet) {
      const c=this.ctx,w=this.w,h=this.h,physics=window.FlightPhysics;
      if(!physics?.terrainHeight)return;
      const east=Number(state.east)||0,north=Number(state.north)||0,a=(Number.isFinite(state.heading)?state.heading:90)*Math.PI/180;
      const surface=sx=>{const ahead=(sx-px)/scale;return ground-physics.terrainHeight(east+Math.sin(a)*ahead,north+Math.cos(a)*ahead)*scale;};
      // Cross-section of the exact terrain beneath the current flight heading.
      const samples=Array.from({length:101},(_,i)=>i*w/100);samples.push(px);samples.sort((a,b)=>a-b);
      c.save();c.beginPath();samples.forEach((sx,i)=>i?c.lineTo(sx,surface(sx)):c.moveTo(sx,surface(sx)));c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=this.wavePaint[3];c.fill();c.clip();
      for(let contour=1;contour<6;contour++){c.beginPath();samples.forEach((sx,i)=>{const sy=surface(sx)+contour*11;i?c.lineTo(sx,sy):c.moveTo(sx,sy);});c.strokeStyle='#fff5df35';c.lineWidth=.8;c.stroke();}
      c.restore();c.beginPath();samples.forEach((sx,i)=>i?c.lineTo(sx,surface(sx)):c.moveTo(sx,surface(sx)));c.strokeStyle='#fff2d9aa';c.lineWidth=1.4;c.stroke();
      const sidePoint=(e,n,y)=>{const de=e-east,dn=n-north,ahead=de*Math.sin(a)+dn*Math.cos(a),across=de*Math.cos(a)-dn*Math.sin(a);if(Math.abs(across)>75)return null;return {x:px+ahead*scale,y:ground-y*scale,alpha:1-Math.abs(across)/100};};
      for(const target of state.exploration?.targets||[]){if(!target.active)continue;const p=sidePoint(target.east,target.north,target.y);if(!p||p.x<-30||p.x>w+30)continue;c.save();c.globalAlpha=p.alpha;c.translate(p.x,p.y);c.rotate(quiet?0:Math.sin(t+target.phase)*.1);c.fillStyle='#f3bd9f';c.strokeStyle='#7b587c';c.lineWidth=1;c.beginPath();c.moveTo(0,-13);c.lineTo(9,0);c.lineTo(0,13);c.lineTo(-9,0);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,-13);c.lineTo(0,13);c.bezierCurveTo(-9,18,7,21,-3,28);c.stroke();c.restore();}
      if(!quiet)for(const pulse of state.exploration?.pulses||[]){const progress=clamp(pulse.age/pulse.life,0,1),p=sidePoint(pulse.east+(pulse.endEast-pulse.east)*progress,pulse.north+(pulse.endNorth-pulse.north)*progress,pulse.y+(pulse.endY-pulse.y)*progress);if(!p)continue;c.strokeStyle='#fff5bbee';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.stroke();}
    }
    world(state,project,focal,horizon,t,quiet,navigation) {
      const c=this.ctx,w=this.w,h=this.h,physics=window.FlightPhysics;
      if(!physics?.LANDMARKS)return;
      const east=Number(state.east)||0,north=Number(state.north)||0,a=(Number.isFinite(state.heading)?state.heading:90)*Math.PI/180;
      const objects=physics.LANDMARKS.map(mark=>{const de=mark.east-east,dn=mark.north-north;return {...mark,z:de*Math.sin(a)+dn*Math.cos(a),lateral:de*Math.cos(a)-dn*Math.sin(a),distance:Math.hypot(de,dn)};}).filter(mark=>mark.z>12&&mark.distance<1500).sort((a,b)=>b.z-a.z);
      const at=(east,north,y)=>{const de=east-(Number(state.east)||0),dn=north-(Number(state.north)||0),z=de*Math.sin(a)+dn*Math.cos(a);if(z<5)return null;const p=project(de*Math.cos(a)-dn*Math.sin(a),z,y);return {...p,z};};
      const run=state.exploration;
      for(const target of run?.targets||[]){if(!target.active)continue;const p=at(target.east,target.north,target.y);if(!p||p.x<-40||p.x>w+40)continue;const size=clamp(10*focal/p.z,5,45);c.save();c.translate(p.x,p.y);c.rotate(quiet?0:Math.sin(t*1.2+target.phase)*.12);c.fillStyle='#f3bd9f';c.strokeStyle='#7b587c';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-size);c.lineTo(size*.68,0);c.lineTo(0,size);c.lineTo(-size*.68,0);c.closePath();c.fill();c.stroke();c.fillStyle='#d9b4d2';c.beginPath();c.moveTo(0,-size);c.lineTo(size*.68,0);c.lineTo(0,size);c.closePath();c.fill();c.beginPath();c.moveTo(0,size);c.bezierCurveTo(-size,size*1.4,size*.6,size*1.7,-size*.2,size*2.2);c.stroke();c.restore();}
      if(!quiet)for(const pulse of run?.pulses||[]){const progress=clamp(pulse.age/pulse.life,0,1),p=at(pulse.east+(pulse.endEast-pulse.east)*progress,pulse.north+(pulse.endNorth-pulse.north)*progress,pulse.y+(pulse.endY-pulse.y)*progress);if(!p)continue;c.strokeStyle='#fff5bb';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,clamp(7*focal/p.z,2,18),0,Math.PI*2);c.stroke();}
      for(const burst of run?.bursts||[]){const p=at(burst.east,burst.north,burst.y);if(!p)continue;const progress=quiet?1:burst.age/burst.life;c.save();c.globalAlpha=1-progress;for(let i=0;i<9;i++){const angle=i/9*Math.PI*2,r=progress*clamp(30*focal/p.z,8,70);c.fillStyle=['#fff0b6','#e9bdd5','#bdadd4'][i%3];c.fillRect(p.x+Math.cos(angle)*r,p.y+Math.sin(angle)*r,3,6);}c.restore();}
      for(const mark of objects){
        const elevation=physics.terrainHeight?.(mark.east,mark.north)||0,p=project(mark.lateral,mark.z,elevation),top=project(mark.lateral,mark.z,elevation+55),radius=clamp(mark.radius*focal/mark.z,8,w*.45);
        if(p.x < -radius||p.x>w+radius)continue;
        c.save();c.globalAlpha=clamp(1-mark.distance/1800,.25,.95);
        if(mark.kind==='thermal'){
          const glow=c.createLinearGradient(p.x-radius,0,p.x+radius,0);glow.addColorStop(0,'#ffefb800');glow.addColorStop(.5,'#ffefb855');glow.addColorStop(1,'#ffefb800');c.fillStyle=glow;c.fillRect(p.x-radius,top.y,radius*2,Math.max(1,p.y-top.y));
          c.strokeStyle='#fff7d6cc';c.lineWidth=1.4;
          for(let i=0;i<8;i++){const progress=(i/8+(quiet?0:t*.2))%1,yy=p.y-progress*(p.y-top.y),xx=p.x+Math.sin(i*2+progress*5)*radius*.5;c.beginPath();c.moveTo(xx-4,yy+3);c.lineTo(xx,yy-3);c.lineTo(xx+4,yy+3);c.stroke();}
        }else{
          c.fillStyle=mark.kind==='ridge'?'#aaa9a0':'#a28ab2';c.beginPath();c.moveTo(p.x-radius,p.y);c.lineTo(p.x-radius*.45,top.y+12);c.lineTo(p.x,top.y);c.lineTo(p.x+radius*.5,top.y+19);c.lineTo(p.x+radius,p.y);c.closePath();c.fill();c.strokeStyle='#fff5ed88';c.lineWidth=1;c.stroke();
          c.fillStyle='#756a9233';c.beginPath();c.moveTo(p.x,top.y);c.lineTo(p.x+radius,p.y);c.lineTo(p.x+radius*.2,p.y);c.closePath();c.fill();
        }
        c.fillStyle='#47364f';c.font='10px ui-monospace, monospace';c.textAlign='center';const labelY=clamp(top.y-14,112,h-125);const text=mark.name.toUpperCase()+' · '+Math.round(mark.distance)+' m',width=c.measureText(text).width,selected=mark.id===(navigation?.id||'sunfield'),fits=p.x-width/2>72&&p.x+width/2<w-72;if((w>=600||selected)&&fits){c.fillStyle='#fff7eddf';c.fillRect(p.x-width/2-7,labelY-12,width+14,19);c.fillStyle='#594462';c.fillText(text,p.x,labelY);}else{c.fillStyle='#fff3d6b0';c.beginPath();c.arc(p.x,top.y-5,2,0,Math.PI*2);c.fill();}c.restore();
      }
    }
    weather(state,quiet,t) {
      const c=this.ctx,w=this.w,h=this.h,rain=clamp(Number(state.weather?.rain)||0,0,1),storm=clamp(Number(state.weather?.storm)||0,0,1);
      if(rain<=.01&&storm<=.01)return;
      c.save();c.fillStyle=`rgba(78,69,112,${rain*.07+storm*.2})`;c.fillRect(0,0,w,h);
      const cloud=c.createLinearGradient(0,0,0,h*.53);cloud.addColorStop(0,`rgba(82,72,111,${.15+storm*.28})`);cloud.addColorStop(1,'rgba(82,72,111,0)');c.fillStyle=cloud;c.fillRect(0,0,w,h*.53);
      c.strokeStyle='#eee7f799';c.lineWidth=.85;
      for(let i=0;i<Math.floor(rain*100);i++){const speed=130+random(i+94)*170,sy=(random(i+50)*h+(quiet?0:t*speed))%(h+24)-12,sx=(random(i+900)*w+(quiet?0:t*speed*.23))%(w+20)-10;c.globalAlpha=.2+random(i+330)*.4;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx-3-storm*3,sy+8+storm*6);c.stroke();}c.restore();
    }
    crumble(x,y,quiet,size=1) {
      const c=this.ctx,time=quiet?1.5:Math.min(2.4,this.crashTime),spread=Math.min(1,time*3),colors=['#fff8ed','#e8dbe6','#baa9c6','#f6e7db'];
      c.save();c.translate(x,y);c.scale(size,size);
      // Deterministic folded scraps fall, rotate, and settle without a screen shake.
      for(let i=0;i<15;i++){const direction=(random(i+19)-.5)*2,dx=direction*(10+random(i+55)*48)*spread,dy=Math.min(16,(-25-random(i+40)*27)*time+50*time*time),r=4+random(i+70)*7;c.save();c.translate(dx,dy);c.rotate(direction*time*4);c.fillStyle=colors[i%4];c.strokeStyle='#9b80a65a';c.lineWidth=.7;c.beginPath();c.moveTo(-r,-r*.6);c.lineTo(r*.9,-r*.2);c.lineTo(r*.2,r);c.lineTo(-r*.5,r*.25);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-r,-r*.6);c.lineTo(r*.2,r);c.stroke();c.restore();}c.restore();
    }
    destroy(){this.observer.disconnect();}
  }
  window.FlightRenderer=FlightRenderer;
})();

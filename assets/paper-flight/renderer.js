/* Paper flight landscape. All animation is driven by the caller's elapsed seconds. */
(() => {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const palettes = [ ['#d4b5f5','#8679bc','#635e94'], ['#d8d5a8','#b0b18c','#858779'], ['#efa0cf','#c875ab','#a0558a'], ['#f8ae99','#e78c83','#c66e7d'] ];
  const random = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  class FlightRenderer {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d');
      this.crashTime = 0; this.time = 0; this.cameraY = 0; this.trail = []; this.lastPhase = ''; this.trailClock = 0; this.povPitch = 0; this.povRoll = 0; this.visualPitch = 0; this.visualRoll = 0; this.wingFlex = 0; this.boostGlow = 0; this.previousTrail = null;
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
      if(phase!==this.lastPhase && (phase==='ready'||phase==='charging')){this.trail.length=0;this.trailClock=0;this.cameraY=0;this.povPitch=Number(state.pitch)||0;this.visualPitch=Number(state.pitch)||0;this.visualRoll=Number(state.roll)||0;this.wingFlex=0;this.boostGlow=0;this.previousTrail=null;}
      if(phase==='crashing'&&this.lastPhase!=='crashing')this.crashTime=0;if((phase==='crashing'||phase==='landed')&&!paused)this.crashTime+=step;this.lastPhase=phase;if(this.lastView!==options.view){this.trail.length=0;this.trailClock=0;this.lastView=options.view;this.previousTrail=null;}if(!quiet)this.time+=step;
      if(!paused){
        const follow=(value,target,rate)=>value+(target-value)*(1-Math.exp(-step*rate));
        this.visualPitch=follow(this.visualPitch,Number(state.pitch)||0,9);
        this.visualRoll=follow(this.visualRoll,Number(state.roll)||0,7);
        const load=(Number(state.lift)||0)/Math.max(.01,(Number(state._spec?.mass)||.1)*9.81);
        this.wingFlex=follow(this.wingFlex,clamp(load-.8,-.6,1.8),6);
        this.boostGlow=follow(this.boostGlow,state.boosting?1:0,state.boosting?5:3);
      }
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
      // Emit at fixed time intervals, interpolating across frames to avoid dotted trails.
      if(quiet){this.trail.length=0;this.previousTrail=null;}
      if(moving&&!paused&&!quiet){
        const previous=this.previousTrail||{x,y},interval=1/45;
        this.trailClock+=step;
        while(this.trailClock>=interval){this.trailClock-=interval;const f=step?clamp(1-this.trailClock/step,0,1):1;this.trail.push({x:previous.x+(x-previous.x)*f,y:previous.y+(y-previous.y)*f,time:this.time-this.trailClock,roll:this.visualRoll});}
        this.previousTrail={x,y};
      }
      if(!paused)while(this.trail.length&&(this.time-this.trail[0].time>2.6||this.trail.length>130))this.trail.shift();
      if(!quiet&&this.trail.length>1){
        c.save();c.lineCap='round';
        for(let side=-1;side<=1;side+=2)for(let i=1;i<this.trail.length;i++){
          const a=this.trail[i-1],b=this.trail[i],fresh=clamp(1-(this.time-b.time)/2.6,0,1);
          c.globalAlpha=fresh*fresh*(side===1?.55:.34);c.strokeStyle='#fffaf0';c.lineWidth=.25+fresh*1.25;
          c.beginPath();c.moveTo(px+(a.x-x)*scale-23,ground-a.y*scale+side*13*Math.cos(a.roll));c.lineTo(px+(b.x-x)*scale-23,ground-b.y*scale+side*13*Math.cos(b.roll));c.stroke();
        }c.restore();
      }
      // Paper texture is a cached tile, composited once per frame (no pixel allocation).
      c.save();c.globalAlpha=.54;c.fillStyle=this.grain;c.fillRect(0,0,w,h);c.restore();
      if(phase==='charging'){
        const charge=clamp(options.charge||0,0,1);c.save();c.translate(px,py);c.rotate(-.24);c.setLineDash([2,6]);c.strokeStyle='#80698a65';c.lineWidth=1;c.beginPath();c.moveTo(40,0);c.quadraticCurveTo(85,-15,120+charge*75,-3-charge*22);c.stroke();c.restore();
      }
      this.weather(state,quiet,t);
      this.plane(px,clamp(py,25,h-45),-this.visualPitch,options.config||{},w<600?.82:1,phase,state,t,quiet);
    }
    drawPOV(state, options, dt) {
      const {ctx:c,w,h}=this,quiet=!!options.quiet;
      const flying=options.phase==='flying',x=Number(state.x)||0,altitude=Math.max(4,Number(state.y)||0);
      const target=clamp(Number(state.pitch)||0,-.65,.65);
      if(!options.paused)this.povPitch=quiet?0:this.povPitch+(target-this.povPitch)*(1-Math.exp(-dt*5));
      // Camera looks forward along the flight path. Pitch shifts the horizon;
      // distance bands expand toward the viewer using perspective division.
      this.povRoll=quiet?0:this.visualRoll;
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
      const flex=quiet?0:this.wingFlex*3+((state.stalled?Math.sin(t*22):Math.sin(t*2))*(state.stalled?1.5:.25)),nose=h*.67+flex,base=h*1.08,span=w*(.27+clamp(Number(options.config?.wing??50),0,100)*.0012);
      if(state.crashed&&!quiet){const crush=clamp(this.crashTime/.18,0,1);c.translate(cx,h*.74);c.scale(1-crush*.4,1-crush*.65);c.translate(-cx,-h*.74);}
      const shape=(points,color)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#9e84ad40';c.lineWidth=1;c.stroke();};
      shape([[cx,nose],[cx-span,base],[cx-12,h*.91]],'#fff9ed');shape([[cx,nose],[cx+span,base],[cx+12,h*.91]],'#eee3ed');shape([[cx,nose],[cx-12,h*.91],[cx,base],[cx+12,h*.91]],'#cbb8d8');
      c.save();c.beginPath();c.moveTo(cx,nose);c.lineTo(cx-span,base);c.lineTo(cx+span,base);c.closePath();c.clip();c.globalAlpha=.3;c.fillStyle=this.grain;c.fillRect(0,nose,w,h-nose);c.restore();
      // Narrow folded seams and warm paper edges retain a handmade silhouette.
      c.strokeStyle='#b7a0be75';c.lineWidth=1;c.beginPath();c.moveTo(cx,nose+16);c.lineTo(cx-span*.72,base);c.moveTo(cx,nose+16);c.lineTo(cx+span*.72,base);c.stroke();
      c.fillStyle='#bb9879';c.fillRect(cx-3,h*.91,6,16);c.restore();
      if(state.crashed)this.crumble(cx,h*.74,quiet,2.3);
      if(this.boostGlow>.01&&!quiet){c.save();c.globalAlpha=this.boostGlow;c.strokeStyle='#fff8dc88';c.lineWidth=1.5;for(let i=0;i<12;i++){const a=i/12*Math.PI*2, r=.35+((t*1.6+i/12)%1)*.3;c.beginPath();c.moveTo(cx+Math.cos(a)*w*r,h*.45+Math.sin(a)*h*r);c.lineTo(cx+Math.cos(a)*w*(r+.055),h*.45+Math.sin(a)*h*(r+.055));c.stroke();}c.restore();}
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
      const c=this.ctx,wing=clamp(Number(config.wing??50),0,100),span=(17+wing*.15)*Math.cos(this.visualRoll*.8)+(quiet?0:this.wingFlex*1.8+(state.stalled?Math.sin(t*22)*1.1:0));
      const flutter=!quiet&&state.stalled?Math.sin(t*24)*.035:0;
      c.save();c.translate(x,y);c.rotate(clamp(angle,-1.2,1.2)+flutter);c.scale(size,size);
      if(this.boostGlow>.01){c.save();c.globalAlpha=this.boostGlow;const length=20+this.boostGlow*30+(quiet?0:Math.sin(t*18)*3);const flame=c.createLinearGradient(-25-length,0,-25,0);flame.addColorStop(0,'#fff2bb00');flame.addColorStop(1,'#fff2bbcc');c.fillStyle=flame;c.beginPath();c.moveTo(-25,-3);c.quadraticCurveTo(-42,-5,-25-length,0);c.quadraticCurveTo(-42,5,-25,3);c.closePath();c.fill();c.restore();}
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
      const scenery=window.FlightScenery;
      if(scenery)for(const prop of scenery.placements){
        const elevation=(physics.terrainHeight(prop.east,prop.north)||0)+prop.y,p=sidePoint(prop.east,prop.north,elevation),size=prop.size*scale;
        if(!p||p.x<-size||p.x>w+size||p.y-size>h||p.y<0)continue;
        c.save();c.globalAlpha=p.alpha*.85;scenery.draw(c,prop.kind,p.x,p.y,size,t,quiet,this.grain);c.restore();
      }
      for(const ring of state.exploration?.rings||[]){const p=sidePoint(ring.east,ring.north,ring.y);if(!p)continue;const radius=(ring.radius||16)*scale;if(p.x<-radius||p.x>w+radius)continue;this.ribbonRing(p.x,p.y,radius,t,quiet,ring,state.exploration?.time||0,.48,p.alpha);}
      for(const target of state.exploration?.targets||[]){if(!target.active)continue;const p=sidePoint(target.east,target.north,target.y);if(!p||p.x<-30||p.x>w+30)continue;c.save();c.globalAlpha=p.alpha;c.translate(p.x,p.y);c.rotate(quiet?0:Math.sin(t+target.phase)*.1);c.fillStyle='#f3bd9f';c.strokeStyle='#7b587c';c.lineWidth=1;c.beginPath();c.moveTo(0,-13);c.lineTo(9,0);c.lineTo(0,13);c.lineTo(-9,0);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,-13);c.lineTo(0,13);c.bezierCurveTo(-9,18,7,21,-3,28);c.stroke();c.restore();}
      if(!quiet)for(const pulse of state.exploration?.pulses||[]){const progress=clamp(pulse.age/pulse.life,0,1),p=sidePoint(pulse.east+(pulse.endEast-pulse.east)*progress,pulse.north+(pulse.endNorth-pulse.north)*progress,pulse.y+(pulse.endY-pulse.y)*progress);if(!p)continue;c.strokeStyle='#fff5bbee';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.stroke();}
    }
    world(state,project,focal,horizon,t,quiet,navigation) {
      const c=this.ctx,w=this.w,h=this.h,physics=window.FlightPhysics;
      if(!physics?.LANDMARKS)return;
      const east=Number(state.east)||0,north=Number(state.north)||0,a=(Number.isFinite(state.heading)?state.heading:90)*Math.PI/180;
      const objects=physics.LANDMARKS.map(mark=>{const de=mark.east-east,dn=mark.north-north;return {...mark,z:de*Math.sin(a)+dn*Math.cos(a),lateral:de*Math.cos(a)-dn*Math.sin(a),distance:Math.hypot(de,dn)};}).filter(mark=>mark.z>12&&mark.distance<1500).sort((a,b)=>b.z-a.z);
      const at=(east,north,y)=>{const de=east-(Number(state.east)||0),dn=north-(Number(state.north)||0),z=de*Math.sin(a)+dn*Math.cos(a);if(z<5)return null;const p=project(de*Math.cos(a)-dn*Math.sin(a),z,y);return {...p,z};};
      const scenery=window.FlightScenery;
      if(scenery){
        const props=scenery.placements.map(prop=>({...prop,p:at(prop.east,prop.north,(physics.terrainHeight(prop.east,prop.north)||0)+prop.y)})).filter(prop=>prop.p&&prop.p.z<1600).sort((a,b)=>b.p.z-a.p.z);
        for(const prop of props){const p=prop.p,size=clamp(prop.size*focal/p.z,1,200);if(p.x<-size||p.x>w+size||p.y-size>h||p.y<0)continue;c.save();c.globalAlpha=clamp(1-p.z/1900,.18,1);scenery.draw(c,prop.kind,p.x,p.y,size,t,quiet,this.grain);c.restore();}
      }
      const run=state.exploration;
      for(const ring of [...(run?.rings||[])].sort((r,s)=>Math.hypot(s.east-east,s.north-north)-Math.hypot(r.east-east,r.north-north))){const p=at(ring.east,ring.north,ring.y);if(!p)continue;const radius=clamp((ring.radius||16)*focal/p.z,2,180);if(p.x<-radius||p.x>w+radius||p.y<-radius||p.y>h+radius)continue;this.ribbonRing(p.x,p.y,radius,t,quiet,ring,run?.time||0,.85,clamp(1-p.z/1800,.15,1));}
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
        }
        // Destination names live on the HUD and chart; keep scenery clear of instrument text.
        if(mark.id===navigation?.id&&top.y>155&&top.y<h*.62){c.strokeStyle='#fff3d6b0';c.lineWidth=1;c.beginPath();c.arc(p.x,top.y-5,4,0,Math.PI*2);c.stroke();}c.restore();
      }
    }
    ribbonRing(x,y,radius,t,quiet,ring,runTime,aspect=1,opacity=1) {
      if(ring.missed)return;
      if(Number.isFinite(ring.trailIndex)&&!ring.active&&!ring.collected)opacity*=.28;
      const age=ring.collected?Math.max(0,runTime-(ring.collectedAt||0)):0;
      if(ring.collected&&(quiet||age>.7))return;
      const c=this.ctx,progress=ring.collected?clamp(age/.7,0,1):0,turn=quiet?0:Math.sin(t*.6+(Number(ring.east)||0)*.01)*.09;
      c.save();c.translate(x,y);c.rotate(turn);c.scale(1+progress*.35,1+progress*.35);c.globalAlpha=opacity*(1-progress);
      // Broad translucent paper ribbon and a warm inner edge make the opening legible.
      c.strokeStyle='#bd925d66';c.lineWidth=clamp(radius*.14,1.8,6);c.beginPath();c.ellipse(0,0,radius*aspect,radius,0,0,Math.PI*2);c.stroke();
      c.strokeStyle='#fff1bddd';c.lineWidth=clamp(radius*.065,1,3);c.beginPath();c.ellipse(0,0,radius*aspect,radius,0,0,Math.PI*2);c.stroke();
      if(ring.active&&!ring.collected){c.fillStyle='#fff9e8';c.font=Math.max(10,Math.min(24,radius*.45))+'px Georgia';c.textAlign='center';c.fillText(String(ring.trailIndex+1),0,-radius-9);}
      c.fillStyle='#e9c58f';for(const side of [-1,1]){c.beginPath();c.moveTo(side*radius*aspect,radius*.08);c.lineTo(side*(radius*aspect+radius*.13),radius*.4);c.lineTo(side*(radius*aspect-radius*.07),radius*.28);c.closePath();c.fill();}c.restore();
    }
    weather(state,quiet,t) {
      const c=this.ctx,w=this.w,h=this.h,rain=clamp(Number(state.weather?.rain)||0,0,1),storm=clamp(Number(state.weather?.storm)||0,0,1);
      if(rain<=.01&&storm<=.01)return;
      c.save();c.fillStyle=`rgba(78,69,112,${rain*.12+storm*.2})`;c.fillRect(0,0,w,h);
      const cloud=c.createLinearGradient(0,0,0,h*.53);cloud.addColorStop(0,`rgba(82,72,111,${.15+storm*.28})`);cloud.addColorStop(1,'rgba(82,72,111,0)');c.fillStyle=cloud;c.fillRect(0,0,w,h*.53);
      // Three depth layers: fine distant drizzle and broader, quicker foreground drops.
      for(let layer=0;layer<3;layer++){
        c.lineWidth=.8+layer*.55;c.strokeStyle='#fff7ff';
        for(let i=0;i<Math.floor(rain*(82-layer*14));i++){
          const seed=i+layer*137,speed=(95+random(seed+94)*70)*(1+layer*.8),sy=(random(seed+50)*h+(quiet?0:t*speed))%(h+40)-20,sx=(random(seed+900)*w+(quiet?0:t*speed*.23))%(w+40)-20;
          c.globalAlpha=.38+layer*.17+random(seed+330)*.12;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx-3-layer*3-storm*4,sy+11+layer*8+storm*5);
          // A muted ink edge keeps pale drops visible against the grain and bright paper.
          c.strokeStyle='#726886';c.lineWidth=1.5+layer*.6;c.stroke();c.strokeStyle='#fff7ff';c.lineWidth=.8+layer*.55;c.stroke();
        }
      }
      if(!quiet&&storm>.1){
        c.lineWidth=1.2;c.strokeStyle='#f4e9ef';
        for(let i=0;i<7;i++){const phase=(t*.23+i/7)%1,xx=w*(1.2-phase*1.4),yy=h*(.18+random(i+82)*.55);c.globalAlpha=Math.sin(phase*Math.PI)*storm*.16;c.beginPath();c.moveTo(xx-45,yy);c.bezierCurveTo(xx-15,yy-9,xx+25,yy+8,xx+65,yy-3);c.stroke();}
      }
      c.restore();
    }
    crumble(x,y,quiet,size=1) {
      const c=this.ctx,time=quiet?3.2:Math.min(3.2,this.crashTime),colors=['#fff8ed','#e8dbe6','#baa9c6','#f6e7db'];
      c.save();c.translate(x,y);c.scale(size,size);
      // A short compression establishes contact before each folded scrap rebounds.
      if(time<.2){const q=clamp(time/.2,0,1);c.save();c.scale(1-q*.45,1-q*.7);c.fillStyle='#fff8ed';c.strokeStyle='#a58cad';c.lineWidth=1;c.beginPath();c.moveTo(-35,-22);c.lineTo(40,0);c.lineTo(-30,20);c.lineTo(-12,0);c.closePath();c.fill();c.stroke();for(let i=0;i<4;i++){c.beginPath();c.moveTo(-28+i*12,-17+i*3);c.lineTo(-12+i*7,4+q*7);c.lineTo(25-i*4,2);c.stroke();}c.restore();}
      const age=Math.max(0,time-.12);
      for(let i=0;i<15;i++){
        const direction=(random(i+19)-.5)*2,v=24+random(i+40)*26,g=110,floor=13+random(i+90)*7,hit=(v+Math.sqrt(v*v+2*g*floor))/g;
        let dy=-v*age+.5*g*age*age,after=Math.max(0,age-hit),bounceSpeed=(v-g*hit)*-.22,bounceTime=2*bounceSpeed/g;
        if(age>=hit)dy=after<bounceTime?floor-bounceSpeed*after+.5*g*after*after:floor;
        const spread=1-Math.exp(-age*3),dx=direction*(10+random(i+55)*48)*spread,r=4+random(i+70)*7;
        c.save();c.globalAlpha=clamp(age/.1,0,1);c.translate(dx,dy);c.rotate(direction*Math.min(age,hit+bounceTime)*4);c.scale(1,1-.35*clamp((age-hit)/Math.max(.05,bounceTime),0,1));c.fillStyle=colors[i%4];c.strokeStyle='#9b80a65a';c.lineWidth=.7;c.beginPath();c.moveTo(-r,-r*.6);c.lineTo(r*.9,-r*.2);c.lineTo(r*.2,r);c.lineTo(-r*.5,r*.25);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-r,-r*.6);c.lineTo(r*.2,r);c.stroke();c.restore();
      }c.restore();
    }
    destroy(){this.observer.disconnect();}
  }
  window.FlightRenderer=FlightRenderer;
})();

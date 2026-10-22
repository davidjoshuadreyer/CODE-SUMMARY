/* A paper-and-ink head-up display. Units follow the glider model (m, m/s, degrees).
   Heading and bank follow the glider’s coordinated-turn approximation. */
(function(root){
  'use strict';
  const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
  const finite=v=>Number.isFinite(v)?v:0;
  function readings(state={},config={}){
    const pitch=finite(state.pitch)*180/Math.PI,alpha=finite(state.alpha)*180/Math.PI;
    return {speed:Math.max(0,finite(state.airspeed)),altitude:Math.max(0,finite(state.y)),verticalSpeed:finite(state.vy),pitch,alpha,heading:Number.isFinite(state.heading)?state.heading:90,roll:finite(state.roll),
      flightPath:Math.atan2(finite(state.vy),Math.max(.01,finite(state.vx))),
      glideRatio:state.drag>0?Math.max(0,finite(state.lift)/state.drag):0,
      trim:finite(config.trim),thermal:Math.max(0,finite(state.thermal)),stalled:!!state.stalled,
      nextThermal:Math.max(0,220+Math.max(0,Math.ceil((finite(state.x)-220)/400))*400-finite(state.x))};
  }
  function draw(ctx,w,h,state,options,cameraPitch,cameraRoll=0){
    if(options.phase!=='flying')return;
    const r=readings(state,options.config),small=w<600,cx=w/2,axis=h*.37;
    const ink='#644c72',muted='#846c8e',paper='#fff9efdc',rose='#a25976';
    const mono='ui-monospace, SFMono-Regular, Menlo, monospace';
    const text=(value,x,y,size=10,align='center',color=ink)=>{ctx.fillStyle=color;ctx.font=`${size}px ${mono}`;ctx.textAlign=align;ctx.fillText(value,x,y);};
    const line=(x1,y1,x2,y2,color=ink)=>{ctx.strokeStyle=color;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
    const card=(x,y,width,height)=>{ctx.fillStyle=paper;ctx.strokeStyle='#987caa65';ctx.beginPath();ctx.roundRect(x,y,width,height,5);ctx.fill();ctx.stroke();};
    ctx.save();ctx.lineWidth=1;ctx.lineCap='round';ctx.lineJoin='round';
    // Heading tape follows the bank-driven turn, wrapping smoothly through north.
    const compassY=126,half=small?66:105;
    text('HEADING',cx,110,8,'center',muted);
    line(cx-half,compassY,cx+half,compassY,'#8c739b80');
    for(let degrees=Math.ceil((r.heading-30)/5)*5;degrees<=r.heading+30;degrees+=5){const xx=cx+(degrees-r.heading)*half/30;line(xx,compassY,xx,compassY+(degrees%10===0?7:3),'#8c739b99');if(degrees%10===0&&Math.abs(degrees-r.heading)>8)text(String((degrees+360)%360).padStart(3,'0'),xx,compassY+18,8,'center',muted);}
    card(cx-22,compassY-7,44,21);text(String(Math.round(r.heading)%360).padStart(3,'0')+'°',cx,compassY+7,11);
    // Live vertical tapes move behind a stationary numeric window.
    const left=small?18:Math.max(36,w*.14),right=w-left,tapeTop=167,tapeBottom=h*.65,tapeCenter=(tapeTop+tapeBottom)/2;
    function tape(value,x,rightSide,label,unit,increment,pixels){
      const dir=rightSide?-1:1,boxW=small?49:62;
      text(label,x+(rightSide?-boxW/2:boxW/2),154,8,'center',muted);
      ctx.save();ctx.beginPath();ctx.rect(x+(rightSide?-boxW-4:-4),tapeTop,boxW+8,tapeBottom-tapeTop);ctx.clip();
      ctx.fillStyle='#fff8f330';ctx.fillRect(x+(rightSide?-boxW:0),tapeTop,boxW,tapeBottom-tapeTop);
      line(x,tapeTop,x,tapeBottom,'#8c739b88');
      for(let n=Math.max(0,Math.floor(value/increment)-12);n<=Math.ceil(value/increment)+12;n++){
        const tick=n*increment,yy=tapeCenter+(value-tick)*pixels;if(yy<tapeTop||yy>tapeBottom)continue;
        line(x,yy,x+dir*7,yy,'#8c739b99');text(String(tick),x+dir*12,yy+3,9,rightSide?'right':'left',muted);
      }
      ctx.restore();card(x+(rightSide?-boxW:0),tapeCenter-14,boxW,28);text(label==='SPD'?value.toFixed(1):Math.round(value),x+dir*boxW/2,tapeCenter+4,small?13:16);
      text(unit,x+dir*boxW/2,tapeBottom+16,8,'center',muted);
    }
    tape(r.speed,left,false,'SPD','m/s',5,3.6);tape(r.altitude,right,true,'ALT','m AGL',10,1.7);
    // Conformal pitch ladder. The zero-degree line shares the camera horizon.
    const scale=h*.36,halfLadder=small?40:74,clipTop=163,clipBottom=h*.64;
    ctx.save();ctx.beginPath();ctx.rect(cx-(small?70:115),clipTop,small?140:230,clipBottom-clipTop);ctx.clip();ctx.translate(cx,axis);ctx.rotate(-cameraRoll);ctx.translate(-cx,-axis);
    for(let angle=-45;angle<=45;angle+=5){const yy=axis+(cameraPitch-angle*Math.PI/180)*scale;if(yy<clipTop-5||yy>clipBottom+5)continue;
      const width=angle===0?halfLadder+12:halfLadder,tip=angle<0?-4:4;ctx.setLineDash(angle<0?[4,4]:[]);
      line(cx-width,yy,cx-15,yy,'#785982b3');line(cx+15,yy,cx+width,yy,'#785982b3');
      ctx.setLineDash([]);line(cx-width,yy,cx-width,yy+tip,'#785982b3');line(cx+width,yy,cx+width,yy+tip,'#785982b3');
      if(angle%10===0){text(String(angle),cx-width-5,yy+3,8,'right',muted);text(String(angle),cx+width+5,yy+3,8,'left',muted);}
    }
    ctx.restore();
    // Aircraft reference and velocity vector: nose direction versus actual travel.
    ctx.lineWidth=1.6;line(cx-19,axis,cx-7,axis);line(cx-7,axis,cx,axis+5);line(cx,axis+5,cx+7,axis);line(cx+7,axis,cx+19,axis);
    const rawPathY=axis+(cameraPitch-r.flightPath)*scale,pathY=clamp(rawPathY,clipTop+10,clipBottom-12);
    ctx.strokeStyle=ink;ctx.beginPath();ctx.arc(cx,pathY,5,0,Math.PI*2);ctx.stroke();line(cx-13,pathY,cx-5,pathY);line(cx+5,pathY,cx+13,pathY);line(cx,pathY-5,cx,pathY-10);ctx.lineWidth=1;
    // Compact lower instrument rail stays above the flight controls and paper nose.
    const railY=h*.73,railW=Math.min(w-30,480),column=railW/3;
    card(cx-railW/2,railY-17,railW,43);
    const climb=(r.verticalSpeed>=0?'+':'')+r.verticalSpeed.toFixed(1);
    [['V/S',climb+' m/s'],['PITCH',(r.pitch>=0?'+':'')+r.pitch.toFixed(1)+'°'],['BANK',(r.roll>=0?'+':'')+(r.roll*180/Math.PI).toFixed(0)+'°']].forEach(([label,value],i)=>{const xx=cx-railW/2+column*(i+.5);text(label,xx,railY-5,7,'center',muted);text(value,xx,railY+12,small?11:13);if(i)line(cx-railW/2+column*i,railY-8,cx-railW/2+column*i,railY+16,'#b8a2c13d');});
    const mode=options.paused?'FLIGHT PAUSED':r.stalled?'STALL · LOWER THE NOSE':r.thermal>.4?'THERMAL +'+r.thermal.toFixed(1)+' m/s':'NEXT THERMAL · '+Math.round(r.nextThermal)+' m';
    text(mode,cx,h*.65+13,small?8:10,'center',r.stalled?rose:ink);
    ctx.restore();
  }
  root.FlightHUD={readings,draw};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.FlightHUD;
})(typeof globalThis!=='undefined'?globalThis:this);

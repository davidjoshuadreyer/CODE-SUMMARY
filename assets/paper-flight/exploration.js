/* Hand-placed paper landmarks and optional kite tagging. Coordinates are world metres;
 * heading is compass degrees (east = 90). Ribbon trails grant small bounded speed/energy pickups. */
(function (root) {
  'use strict';
  const RAD = Math.PI / 180;
  const landmarks = [
    {id:'sunfield',name:'Sunfield',east:220,north:0,y:40,radius:65,kind:'thermal',color:'#d7ad65'},
    {id:'foldridge',name:'Fold Ridge',east:310,north:170,y:75,radius:80,kind:'ridge',color:'#9ca891'},
    {id:'rainharbor',name:'Rain Harbor',east:460,north:-160,y:45,radius:90,kind:'rain',color:'#8da5b2'},
    {id:'cloudgarden',name:'Cloud Garden',east:620,north:220,y:110,radius:90,kind:'thermal',color:'#d6c3aa'},
    {id:'stormarch',name:'Storm Arch',east:780,north:-260,y:90,radius:105,kind:'storm',color:'#9b8ca9'}
  ];
  const wrap = degrees => ((degrees + 180) % 360 + 360) % 360 - 180;
  const finite = (v, fallback=0) => Number.isFinite(v) ? v : fallback;
  function position(plane) {return {east:finite(plane.east,finite(plane.x)),north:finite(plane.north),y:finite(plane.y)};}
  function relative(plane, target) {
    const p=position(plane), de=target.east-p.east, dn=target.north-p.north;
    const distance=Math.hypot(de,dn), bearing=(Math.atan2(de,dn)/RAD+360)%360;
    return {distance,bearing,relativeBearing:wrap(bearing-finite(plane.heading,90)),
      altitude:target.y,elevation:Math.atan2(target.y-p.y,distance)/RAD,
      range:Math.hypot(distance,target.y-p.y)};
  }
  function create() {
    return {landmarks:landmarks.map(l=>({...l})),selectedWaypoint:0,discoveries:[],bonus:0,tags:0,ringsCollected:0,
      rings:[{east:110,north:0,y:70},{east:265,north:75,y:78},{east:385,north:-90,y:62},{east:525,north:170,y:100},{east:670,north:-210,y:90}].map((r,i)=>({...r,id:"breeze-"+i,radius:16,collected:false,collectedAt:0})),
      targets:[
        {id:'kite-1',east:165,north:0,y:72},
        {id:'kite-2',east:305,north:130,y:83},
        {id:'kite-3',east:455,north:-140,y:62},
        {id:'kite-4',east:595,north:230,y:130},
        {id:'kite-5',east:750,north:-240,y:112}
      ].map((t,i)=>({...t,baseY:t.y,active:true,phase:i*1.7})),
      pulses:[],bursts:[],fireCooldown:0,time:0,lastEvent:null,_pulseId:0};
  }
  function navigation(run, plane) {
    const target=run.landmarks[run.selectedWaypoint];
    return {...relative(plane,target),id:target.id,name:target.name,kind:target.kind,
      discovered:run.discoveries.includes(target.id)};
  }
  function startTrail(run,plane) {
    const origin=position(plane),destination=run.landmarks[run.selectedWaypoint];
    let east=origin.east,north=origin.north,heading=finite(plane.heading,90),passed=false;
    run.trailMode=true;run.trailIndex=0;run.streak=0;run.bestStreak=0;run.trailComplete=false;
    run.trailRewarded=false;run._previous=origin;
    run.rings=Array.from({length:12},(_,i)=>{
      if(i>0){
        if(Math.hypot(destination.east-east,destination.north-north)<95)passed=true;
        const desired=passed?heading+Math.sin(i*.7)*5:Math.atan2(destination.east-east,destination.north-north)/RAD;
        heading+=Math.max(-12,Math.min(12,wrap(desired-heading)));
      }
      const spacing=i===0?85:80;
      east+=Math.sin(heading*RAD)*spacing;north+=Math.cos(heading*RAD)*spacing;
      const terrain=root.FlightPhysics?.terrainHeight?.(east,north)??0;
      const altitude=i<4?[0,4,2,-5][i]:-5-Math.min(15,(i-3)*2)+Math.sin(i*.5)*4;
      const y=Math.max(terrain+40,origin.y+altitude);
      return {east,north,y,id:'trail-'+i,radius:22,collected:false,collectedAt:0,
        missed:false,active:i===0,trailIndex:i,incomingHeading:heading,nearest:Infinity};
    });
    return run;
  }
  function trailNavigation(run,plane) {
    if(!run.trailMode||run.trailComplete)return null;
    const ring=run.rings[run.trailIndex];
    if(!ring)return null;
    return {...relative(plane,ring),id:ring.id,name:'Ribbon '+(run.trailIndex+1)+' / '+run.rings.length,
      kind:'ribbon',index:run.trailIndex,total:run.rings.length,streak:run.streak,discovered:false};
  }
  function advanceTrail(run) {
    run.rings[run.trailIndex].active=false;
    run.trailIndex++;
    if(run.trailIndex>=run.rings.length){
      run.trailComplete=true;
      if(run.ringsCollected>=9&&!run.trailRewarded){
        run.bonus+=40;run.trailRewarded=true;
        run.lastEvent={type:'complete',text:'Ribbon run complete · '+run.ringsCollected+'/12 · +40 breeze',time:run.time};
      }else run.lastEvent={type:'complete',text:'Ribbon run complete · '+run.ringsCollected+'/12 ribbons',time:run.time};
    }else run.rings[run.trailIndex].active=true;
  }
  function cycleWaypoint(run,direction=1) {
    const n=run.landmarks.length;
    run.selectedWaypoint=(run.selectedWaypoint+(direction<0?-1:1)+n)%n;
    return run.landmarks[run.selectedWaypoint];
  }
  function step(run,plane,input={},dt=0) {
    if(!run||!plane||plane.landed) return run;
    dt=Math.max(0,Math.min(.25,finite(dt)));
    run.time+=dt;
    run.fireCooldown=Math.max(0,run.fireCooldown-dt);
    run.pulses.forEach(p=>p.age+=dt);run.pulses=run.pulses.filter(p=>p.age<p.life);
    run.bursts.forEach(p=>p.age+=dt);run.bursts=run.bursts.filter(p=>p.age<p.life);
    for(const target of run.targets) target.y=target.baseY+Math.sin(run.time*.8+target.phase)*3;
    for(const mark of run.landmarks) {
      if(!run.discoveries.includes(mark.id)&&relative(plane,mark).distance<mark.radius) {
        run.discoveries.push(mark.id);run.bonus+=25;
        run.lastEvent={type:'discovery',text:mark.name+' discovered · +25 breeze',time:run.time};
      }
    }
    const current=position(plane),previous=run._previous||current;
    for(const ring of run.rings){
      if(ring.collected||ring.missed||(run.trailMode&&!ring.active))continue;
      const dx=current.east-previous.east,dz=current.north-previous.north,dy=current.y-previous.y,length=dx*dx+dz*dz+dy*dy;
      const along=length?Math.max(0,Math.min(1,((ring.east-previous.east)*dx+(ring.north-previous.north)*dz+(ring.y-previous.y)*dy)/length)):0;
      if(Math.hypot(previous.east+dx*along-ring.east,previous.north+dz*along-ring.north,previous.y+dy*along-ring.y)<ring.radius){
        ring.collected=true;ring.collectedAt=run.time;run.ringsCollected++;
        if(run.trailMode){
          run.streak++;run.bestStreak=Math.max(run.bestStreak,run.streak);
          const reward=5+Math.min(run.streak-1,4)*3;
          run.bonus+=reward;plane.energy=Math.min(1,finite(plane.energy,1)+.32);
          if(Number.isFinite(plane.vx))plane.vx=Math.min(75,plane.vx+2);
          run.lastEvent={type:'ring',text:run.streak+' ribbon streak · +32% energy · +'+reward+' breeze',time:run.time};
          advanceTrail(run);
        }else{
          run.bonus+=5;plane.energy=Math.min(1,finite(plane.energy,1)+.22);
          run.lastEvent={type:'ring',text:'Breeze ribbon · +22% energy · +5 breeze',time:run.time};
        }
      }else if(run.trailMode){
        const range=Math.hypot(current.east-ring.east,current.north-ring.north,current.y-ring.y);
        ring.nearest=Math.min(ring.nearest,range);
        const past=(current.east-ring.east)*Math.sin(ring.incomingHeading*RAD)+(current.north-ring.north)*Math.cos(ring.incomingHeading*RAD);
        if(past>45||(ring.nearest<110&&range>200)){
          ring.missed=true;run.streak=0;
          run.lastEvent={type:'miss',text:'Ribbon missed · next ribbon ahead',time:run.time};
          advanceTrail(run);
        }
      }
    }
    run._previous=current;
    if(input.fire&&run.fireCooldown<=0) {
      run.fireCooldown=.42;
      const pitch=finite(plane.pitch)/RAD;
      const aimed=run.targets.filter(t=>t.active).map(t=>({target:t,nav:relative(plane,t)}))
        .filter(({nav})=>nav.range<=230&&Math.abs(nav.relativeBearing)<8&&Math.abs(nav.elevation-pitch)<9)
        .sort((a,b)=>a.nav.range-b.nav.range)[0];
      const p=position(plane);
      run.pulses.push({id:++run._pulseId,...p,heading:finite(plane.heading,90),pitch:finite(plane.pitch),
        age:0,life:.45,hit:!!aimed,targetId:aimed?.target.id,
        endEast:aimed?.target.east??p.east+Math.sin(finite(plane.heading,90)*RAD)*230,
        endNorth:aimed?.target.north??p.north+Math.cos(finite(plane.heading,90)*RAD)*230,
        endY:aimed?.target.y??p.y+Math.sin(finite(plane.pitch))*230});
      if(aimed) {
        aimed.target.active=false;run.tags++;run.bonus+=10;
        run.bursts.push({id:aimed.target.id,east:aimed.target.east,north:aimed.target.north,y:aimed.target.y,age:0,life:1.2});
        run.lastEvent={type:'tag',text:'Kite tagged · +10 breeze',time:run.time};
      }
    }
    plane.explorationBonus=run.bonus;
    plane.discoveries=run.discoveries.length;
    plane.kitesTagged=run.tags;plane.ribbons=run.ringsCollected;
    return run;
  }
  const api={create,step,navigation,cycleWaypoint,landmarks,relative,startTrail,trailNavigation};
  root.FlightExploration=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

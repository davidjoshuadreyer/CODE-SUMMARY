/* Hand-placed paper landmarks and optional kite tagging. Coordinates are world metres;
 * heading is compass degrees (east = 90). This layer never changes the flight forces. */
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
    return {landmarks:landmarks.map(l=>({...l})),selectedWaypoint:0,discoveries:[],bonus:0,tags:0,
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
    plane.kitesTagged=run.tags;
    return run;
  }
  const api={create,step,navigation,cycleWaypoint,landmarks,relative};
  root.FlightExploration=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);

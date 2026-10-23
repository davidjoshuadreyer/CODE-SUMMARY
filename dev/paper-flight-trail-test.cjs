const assert=require('node:assert/strict');
const P=require('../assets/paper-flight/physics.js');
const E=require('../assets/paper-flight/exploration.js');
const plane=()=>({east:0,north:0,y:70,heading:90,pitch:0,vx:30,energy:0,landed:false});
let run=E.create(),p=plane();
assert.equal(run.trailMode,undefined,'free exploration remains opt-in');
E.startTrail(run,p);
assert.equal(run.rings.length,12);assert.equal(run.rings[0].east,85);
assert.equal(run.rings[0].y,70);assert.equal(run.rings.filter(r=>r.active).length,1);
for(let i=0;i<12;i++){
 const r=run.rings[i];
 assert.ok(r.y>=P.terrainHeight(r.east,r.north)+40);
 if(i){assert.ok(Math.abs(r.incomingHeading-run.rings[i-1].incomingHeading)<=12.00001);assert.ok(Math.abs(Math.hypot(r.east-run.rings[i-1].east,r.north-run.rings[i-1].north)-80)<1e-8);}
}
assert.equal(E.trailNavigation(run,p).name,'Ribbon 1 / 12');
// Visit each gate center; this isolates ordered rewards and guarantees geometric route continuity.
for(let i=0;i<12;i++){
 const r=run.rings[i];Object.assign(p,{east:r.east,north:r.north,y:r.y});
 E.step(run,p,{},1/60);
 assert.equal(run.ringsCollected,i+1);assert.equal(run.streak,i+1);
 assert.equal(run.trailIndex,i+1);assert.ok(p.energy<=1);assert.ok(p.vx<=75);
}
assert.equal(run.bestStreak,12);assert.equal(run.trailComplete,true);assert.equal(run.trailRewarded,true);
assert.equal(E.trailNavigation(run,p),null);assert.equal(run.rings.filter(r=>r.active).length,0);
const reward=run.bonus;E.step(run,p,{},1/60);assert.equal(run.bonus,reward,'completion pays once');
assert.ok(reward>=214,'12 streak gates pay 174 plus 40 completion, aside from discoveries');
// Passing above the first gate misses it and selects the next; no reward or streak.
run=E.create();p=plane();E.startTrail(run,p);p.east=140;p.y=160;E.step(run,p,{},1/60);
assert.equal(run.rings[0].missed,true);assert.equal(run.trailIndex,1);assert.equal(run.streak,0);assert.equal(run.ringsCollected,0);
assert.equal(run.rings[1].active,true);
// A high-speed segment crossing collects the active gate; visiting future gates cannot claim them early.
run=E.create();p=plane();E.startTrail(run,p);p.east=115;E.step(run,p,{},1/60);
assert.equal(run.ringsCollected,1);assert.equal(run.streak,1);
const next=run.rings[1];p.east=next.east+65;p.y=160;E.step(run,p,{},1/60);assert.equal(run.streak,0);assert.equal(run.bestStreak,1);
// All destination choices yield bounded safe gates and preserve the selected destination.
for(let choice=0;choice<5;choice++){
 run=E.create();run.selectedWaypoint=choice;p=plane();E.startTrail(run,p);
 assert.equal(run.selectedWaypoint,choice);
 for(const gate of run.rings)assert.ok([gate.east,gate.north,gate.y].every(Number.isFinite));
}
console.log('Ribbon trails: ordered swept collection, route bounds, combo reset, energy, completion rewards and free-mode compatibility passed.');
// Real fixed-step physics pilot: modest yaw/pitch correction, no teleportation or force edits.
// Each route teaches four gates in ~12s; restrained thrust can finish the entire course.
for(let destination=0;destination<5;destination++){
 for(const allowBoost of [false,true]){
  p=P.create();run=E.create();run.selectedWaypoint=destination;E.startTrail(run,p);
  let fourthTime=Infinity;
  for(let frame=0;frame<60*90&&!p.landed&&!run.trailComplete;frame++){
   const nav=E.trailNavigation(run,p);
   P.step(p,{yaw:Math.max(-1,Math.min(1,nav.relativeBearing/15)),
    pitch:Math.max(-1,Math.min(1,((nav.altitude-p.y)*.12-p.vy*.6)*.25)),
    boost:allowBoost&&p.vx<23&&p.y<nav.altitude},1/60);
   E.step(run,p,{},1/60);
   if(run.ringsCollected>=4&&fourthTime===Infinity)fourthTime=p.time;
  }
  assert.ok(fourthTime<15,'four ribbons reachable within15s on route '+destination);
  assert.ok(run.bestStreak>=4);
  if(allowBoost){assert.equal(run.ringsCollected,12);assert.equal(run.trailComplete,true);assert.equal(run.trailRewarded,true);}
 }
}
console.log('Physics pilots: five routes teach four ribbons in under15s; all12 reachable with restrained thrust.');

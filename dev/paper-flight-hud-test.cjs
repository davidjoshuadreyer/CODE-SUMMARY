const assert=require('node:assert/strict');
const {readings,draw}=require('../assets/paper-flight/hud.js');
const physics=require('../assets/paper-flight/physics.js');
const config={wing:50,balance:50,trim:2,levels:[0,0,0]},s=physics.create(config,1);
for(let i=0;i<240;i++)physics.step(s,{pitch:0},1/120);
const r=readings(s,config);
assert.equal(r.speed,s.airspeed);assert.equal(r.altitude,s.y);assert.equal(r.verticalSpeed,s.vy);
assert.equal(r.pitch,s.pitch*180/Math.PI);assert.equal(r.flightPath,Math.atan2(s.vy,s.vx));assert.equal(r.trim,2);
assert.equal(readings({x:219}).nextThermal,1);assert.equal(readings({x:221}).nextThermal,399);
assert.equal(readings({stalled:true}).stalled,true);
for(const value of Object.values(readings({y:NaN,airspeed:Infinity,pitch:NaN})))assert.ok(typeof value==='boolean'||Number.isFinite(value));
// Exercise both layouts across nominal, stalled and boundary flight states.
const labels=[];const ctx=new Proxy({}, {get:(_,key)=>key==='fillText'?(text,...coords)=>{assert.ok(coords.every(Number.isFinite));labels.push(text);}: (...args)=>{for(const arg of args)if(typeof arg==='number')assert.ok(Number.isFinite(arg));},set:()=>true});
for(const [w,h] of [[350,500],[1160,540]])for(const state of [s,{...s,stalled:true,vy:-20},{...s,y:0,airspeed:0}])draw(ctx,w,h,state,{phase:'flying',config},.2);
assert.ok(labels.includes('COURSE · FIXED'));assert.ok(labels.includes('STALL · LOWER THE NOSE'));assert.ok(labels.includes('SPD'));assert.ok(labels.includes('ALT'));
const count=labels.length;draw(ctx,350,500,s,{phase:'ready',config},0);assert.equal(labels.length,count);
console.log('HUD: live telemetry, flight path, thermal distances, stall cues and responsive draw checks passed.');

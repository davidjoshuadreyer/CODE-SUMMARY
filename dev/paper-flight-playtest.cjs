/* Reproducible pilot scenarios. Run: node dev/paper-flight-playtest.cjs
 * This checks route/reward reachability; it does not replace device/browser playtesting.
 */
'use strict';
const assert = require('node:assert/strict');
const P = require('../assets/paper-flight/physics.js');
const E = require('../assets/paper-flight/exploration.js');
require('../assets/paper-flight/progression.js');
const G = globalThis.FlightProgression;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rows = [];
function fly(name, pilot = () => ({}), destination = null) {
  const plane = P.create({wing:50,balance:50,trim:2,levels:[0,0,0]}, .7);
  const run = E.create();
  let maxRain = 0, maxStorm = 0, stalls = 0, wasStalled = false;
  for (let frame = 0; frame < 60 * 180 && !plane.landed; frame++) {
    const input = pilot(plane, run);
    P.step(plane, input, 1/60);
    E.step(run, plane, input, 1/60);
    maxRain = Math.max(maxRain, plane.weather.rain);
    maxStorm = Math.max(maxStorm, plane.weather.storm);
    if (plane.stalled && !wasStalled) stalls++;
    wasStalled = plane.stalled;
    assert.ok([plane.x,plane.y,plane.heading,plane.energy].every(Number.isFinite), name+' must remain finite');
    if (destination && run.discoveries.includes(destination.id)) break;
  }
  rows.push({scenario:name,seconds:plane.time.toFixed(1),metres:Math.round(plane.x),height:Math.round(plane.y),places:run.discoveries.join(',')||'—',ribbons:run.ringsCollected});
  return {plane,run,maxRain,maxStorm,stalls};
}
const novice = fly('Hands-off first flight');
assert.ok(novice.plane.landed && novice.plane.time > 10 && novice.plane.time < 90, 'Novice flight should offer time to learn and end promptly');
assert.ok(novice.run.discoveries.includes('sunfield'), 'Default route should reveal a destination');
assert.ok(novice.run.ringsCollected >= 1, 'Default route should teach energy ribbons');
const data = G.load({getItem:()=>null}).data;
const result = G.finish(data,{...novice.plane,stalls:novice.stalls,config:{wing:50,balance:50,trim:2}});
assert.ok(result.reward >= G.upgradeCost(data,0), 'First completed run should fund an upgrade');
assert.ok(G.purchase(data,0), 'First-run reward must be spendable');

const thrust = fly('Hold thrust',()=>({boost:true}));
assert.ok(thrust.plane.x > novice.plane.x * 1.25, 'Thrust should provide a meaningful travel advantage');
assert.ok(thrust.plane.energy < .01, 'Holding thrust should consume the finite reserve');
const dive = fly('Dive held',()=>({pitch:-1}));
assert.ok(dive.plane.landed && dive.plane.time > 1 && dive.plane.time < novice.plane.time, 'Dive should have an understandable consequence');
const bank = fly('Half-second bank, then release',s=>({bank:s.time < .5 ? 1 : 0}));
assert.ok(bank.plane.roll > .2, 'Released roll input must retain the requested attitude');

for (const destination of E.landmarks) {
  // A competent pilot follows the bearing cue and conserves the final reserve.
  const route = fly('Navigate: '+destination.name,s=>({
    yaw:clamp(E.relative(s,destination).relativeBearing/12,-1,1),
    boost:s.energy > .02
  }),destination);
  assert.ok(route.run.discoveries.includes(destination.id), destination.name+' must be reachable with the starter plane');
  assert.ok(Math.abs(route.plane.roll) < .001, 'Rudder navigation must not secretly roll the plane');
  if(destination.id==='rainharbor') assert.ok(route.maxRain>.4,'Harbor route should encounter visible rain');
  if(destination.id==='stormarch') assert.ok(route.maxStorm>.5,'Storm route should encounter storm weather');
}
const retry = P.create({trim:2},.7);
assert.equal(retry.energy,1,'A new throw must restore energy');
assert.equal(retry.landed,false,'A new throw must be ready to fly');
assert.equal(retry.roll,0,'A new throw must start level');
console.table(rows);
console.log('Playtest scenarios passed: novice rewards, thrust, failure, held bank, all destinations, weather, retry.');

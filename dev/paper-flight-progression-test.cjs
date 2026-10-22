const assert = require('node:assert/strict');
require('../assets/paper-flight/progression.js');
const P = globalThis.FlightProgression;
const KEY = 'tesselate-paper-flight-v1';
function storage(value) {
  return {getItem:key => { assert.equal(key, KEY); return value; }, setItem:(key, next) => { assert.equal(key, KEY); value = next; }};
}

const old = P.load(storage(JSON.stringify({balance:240, best:805, levels:[2, 1, 3]})));
assert.equal(old.storageOK, true);
assert.equal(old.data.balance, 240);
assert.equal(old.data.best, 805);
assert.deepEqual(old.data.levels, [2, 1, 3]);
assert.deepEqual(old.data.config, {wing:50, balance:50, trim:2});
assert.equal(P.load({getItem(){throw Error('disabled');}}).storageOK, false);
assert.equal(P.save({setItem(){throw Error('full');}}, old.data), false);
assert.equal(P.load(storage('{bad')).data.balance, 0);
const damaged = P.load(storage(JSON.stringify({balance:-1, best:'900', levels:[99,-8,'8'], config:{wing:Infinity,balance:125,trim:-100}, completed:['coast','coast','unknown']}))).data;
assert.deepEqual(damaged.levels, [8,0,0]);
assert.deepEqual(damaged.config, {wing:50,balance:100,trim:-6});
assert.deepEqual(damaged.completed, ['coast']);

const data = P.load(storage(null)).data;
const flight = {x:630,time:23,maxHeight:140,maxSpeed:38,thermalTime:3.3,stalls:0,config:{wing:70,balance:40,trim:3}};
const first = P.finish(data, flight);
assert.equal(first.record, true);
assert.equal(first.previousBest, 0);
assert.equal(first.bonuses.length, 5);
assert.equal(first.reward, first.baseReward + first.bonuses.reduce((sum,b) => sum+b.reward,0));
assert.equal(P.finish(data, flight).bonuses.length, 0, 'Contracts pay once');
assert.equal(P.finish(data, {...flight,x:1000,stalls:2}).bonuses.length, 1);
assert.equal(data.stats.efficientDistance, 630);
for (let i=0; i<10; i++) P.finish(data,{...flight,x:10});
assert.equal(data.history.length, 8);
assert.equal(P.contracts(data).filter(c=>!['chart','atlas','ribbons'].includes(c.id)).every(c=>c.done && c.progress===c.target), true);
const persisted = storage(null);
assert.equal(P.save(persisted, data), true);
assert.deepEqual(P.load(persisted).data, data);
assert.equal(P.purchase(data, -1), false);
assert.equal(P.purchase(data, 0.5), false);
const balance = data.balance, cost = P.upgradeCost(data, 0);
assert.equal(P.purchase(data, 0), true);
assert.equal(data.balance, balance-cost);
assert.equal(data.levels[0], 1);
data.levels[0]=8;
assert.equal(P.purchase(data, 0), false);
const beginner=P.load(storage(null)).data;
P.finish(beginner,{x:0});
assert.equal(P.purchase(beginner,0),true,'First flight affords an upgrade');
console.log('Progression: migration, invalid storage, sanitized saves, rewards, contracts, history and purchases passed.');

// Earn the exploration reward through the actual game module, then round-trip the
// completed flight through storage. A new throw must not inherit its reward.
const E=require('../assets/paper-flight/exploration.js');
const explorer=P.load(storage(null)).data, expedition=E.create();
const craft={x:0,east:0,north:0,y:70,heading:90,pitch:0,landed:false};
E.step(expedition,craft,{fire:true},1/60);
craft.x=craft.east=220;
E.step(expedition,craft,{},1/60);
assert.equal(craft.explorationBonus,40);
craft.landed=true;
const expeditionResult=P.finish(explorer,craft);
assert.equal(expeditionResult.reward,expeditionResult.baseReward+40);
assert.deepEqual(expeditionResult.bonuses,[{label:'Exploration, kites & ribbons',reward:40}]);
const explorationSave=storage(null);
assert.equal(P.save(explorationSave,explorer),true);
const restoredExplorer=P.load(explorationSave).data;
assert.equal(restoredExplorer.balance,expeditionResult.reward);
assert.equal(restoredExplorer.history[0].explorationBonus,40);
assert.equal(restoredExplorer.history[0].discoveries,1);
assert.equal(restoredExplorer.history[0].kitesTagged,1);
assert.equal(restoredExplorer.history[0].ribbons,1);
assert.equal(restoredExplorer.history[0].reward,expeditionResult.reward);
const nextThrow=P.finish(restoredExplorer,{x:220});
assert.equal(nextThrow.reward,nextThrow.baseReward,'exploration bonus does not leak into the next flight');
assert.equal(restoredExplorer.history[0].explorationBonus,0);
assert.equal(restoredExplorer.balance,expeditionResult.reward+nextThrow.baseReward);
console.log('Exploration rewards: actual discovery/tag earnings persist and do not leak across throws.');

// The album preserves actual identities across flights; the old count alone
// cannot prove which places a returning player visited.
assert.deepEqual(old.data.discoveryIds, []);
assert.equal(P.journal(old.data).filter(p=>p.discovered).length, 0);
const journalSave=storage(null), traveller=P.load(journalSave).data;
let reward=P.finish(traveller,{x:10,discoveries:5,discoveryIds:['sunfield','sunfield','invented',null],ribbons:1});
assert.deepEqual(traveller.discoveryIds,['sunfield']);
assert.equal(reward.bonuses.length,0);
reward=P.finish(traveller,{x:10,discoveryIds:['foldridge','rainharbor'],ribbons:2});
assert.deepEqual(reward.bonuses,[{label:'A traveller’s sketchbook',reward:45}]);
assert.equal(P.contracts(traveller).find(c=>c.id==='ribbons').progress,2,'Ribbons require mastery in one flight, not cumulative farming');
assert.equal(P.save(journalSave,traveller),true);
const returned=P.load(journalSave).data;
reward=P.finish(returned,{x:10,discoveryIds:['sunfield','cloudgarden','stormarch'],ribbons:3});
assert.deepEqual(reward.bonuses,[{label:'The whole paper coast',reward:80},{label:'Thread the breeze',reward:45}]);
assert.equal(P.journal(returned).every(p=>p.discovered),true);
assert.equal(P.finish(returned,{x:10,discoveryIds:returned.discoveryIds,ribbons:5}).bonuses.length,0,'Exploration contracts pay once');
const dirty=P.load(storage(JSON.stringify({...returned,discoveryIds:['sunfield','sunfield','invalid'],stats:{ribbons:999}}))).data;
assert.deepEqual(dirty.discoveryIds,['sunfield']);
assert.equal(dirty.stats.ribbons,5);
const copy=P.journal(returned);copy[0].id='corrupted';
assert.equal(P.journal(returned)[0].id,'sunfield','Journal returns independent records');
assert.equal(P.save(journalSave,returned),true);
assert.deepEqual(P.load(journalSave).data,returned);
console.log('Discovery album: legacy migration, identity validation, multi-flight collection and one-time mastery goals passed.');

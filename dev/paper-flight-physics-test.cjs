'use strict';
const assert = require('node:assert/strict');
const P = require('../assets/paper-flight/physics.js');
function fly(config = {}, control = () => 0, hz = 60) {
  const s = P.create(config, 1);
  for (let i = 0; i < hz * 120 && !s.landed; i++) {
    P.step(s, {pitch: control(s)}, 1 / hz);
    for (const key of ['x', 'y', 'vx', 'vy', 'pitch', 'airspeed', 'lift', 'drag']) assert(Number.isFinite(s[key]), `${key} remains finite`);
  }
  assert(s.landed, 'finite flight must end in a landing');
  assert.equal(s.y, 0);
  return s;
}
const baseline = fly();
assert(baseline.x > 350 && baseline.x < 650, 'beginner distance remains in intended range');
assert(baseline.time > 15 && baseline.time < 30, 'beginner flight has brisk pacing');
const dart = fly({wing: 0}), glider = fly({wing: 100});
assert(glider.x > dart.x * 1.25, 'larger wings improve glide range');
assert(dart.x / dart.time > glider.x / glider.time, 'narrow wings trade range for speed');
for (let i = 0; i < 3; i++) {
  const levels = [0, 0, 0]; levels[i] = 1;
  assert(fly({levels}).x > baseline.x + 10, `upgrade ${i} meaningfully improves range`);
}
assert(fly({levels: [8, 8, 8]}).x > baseline.x * 1.6, 'late upgrades offer progression');
const pull = fly({}, () => 1), dive = fly({}, () => -1);
assert(pull.stallTime > 5, 'holding pull-up causes aerodynamic stall');
assert(pull.x < baseline.x, 'holding pull-up forever is not optimal');
assert(dive.maxSpeed > baseline.maxSpeed, 'diving trades altitude for speed');
assert(dive.x < baseline.x, 'diving spends altitude');
const recovery = P.create({}, 1);
for (let i = 0; i < 180; i++) P.step(recovery, {pitch: 1}, 1 / 60);
assert(recovery.stalled, 'high angle of attack stalls');
for (let i = 0; i < 90; i++) P.step(recovery, {pitch: -.5}, 1 / 60);
assert(!recovery.stalled && !recovery.landed, 'lowering nose recovers from stall');
for (const hz of [30, 144]) {
  const comparison = fly({}, () => 0, hz);
  assert(Math.abs(comparison.x - baseline.x) < .00001, `flight independent of ${hz}Hz render rate`);
}
assert.equal(P.thermalAt(0), 0);
assert.equal(P.thermalAt(155), 0);
assert(P.thermalAt(220) > P.thermalAt(200));
assert.equal(P.thermalAt(220), P.thermalAt(620), 'thermal zones repeat predictably');
assert(baseline.thermalTime > 0, 'flight crosses a thermal');
for (const config of [{wing: 0, balance: 100, trim: -6}, {wing: 100, balance: 0, trim: 10, levels: [8, 8, 8]}]) {
  for (const pitch of [-1, 0, 1]) fly(config, () => pitch);
}
const invalid = P.create({wing: NaN, balance: Infinity, trim: NaN, levels: [-9, Infinity, 200]}, Infinity);
P.step(invalid, {pitch: NaN}, Infinity);
assert(Number.isFinite(invalid.x), 'bad input cannot poison the state');
console.log(`Physics checks passed. Baseline: ${baseline.x.toFixed(0)} m / ${baseline.time.toFixed(1)} s. Dart: ${dart.x.toFixed(0)} m. Glider: ${glider.x.toFixed(0)} m.`);

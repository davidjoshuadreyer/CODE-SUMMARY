'use strict';
const assert = require('node:assert/strict');
const scenery = require('../assets/paper-flight/scenery.js');
function recordingContext() {
  const calls = [];
  const stack = [];
  const values = {globalAlpha: 1};
  const ctx = new Proxy(values, {
    get(target, key) {
      if (key in target) return target[key];
      return (...args) => {
        for (const arg of args) if (typeof arg === 'number') assert.ok(Number.isFinite(arg), `${key} receives finite coordinates`);
        calls.push([key, ...args]);
        if (key === 'save') stack.push({...target});
        if (key === 'restore') {
          assert.ok(stack.length, 'restore must have matching save');
          const saved = stack.pop();
          for (const field of Object.keys(target)) delete target[field];
          Object.assign(target, saved);
        }
      };
    },
    set(target, key, value) {
      if (typeof value === 'number') assert.ok(Number.isFinite(value), `${key} must be finite`);
      calls.push(['set', key, value]);target[key] = value;return true;
    }
  });
  return {ctx, calls, stack};
}
for (const kind of scenery.kinds) {
  for (const size of [1, 40, 900]) {
    for (const quiet of [false, true]) {
      const a = recordingContext();
      scenery.draw(a.ctx, kind, 123, 456, size, 10, quiet, {});
      assert.equal(a.stack.length, 0, `${kind} restores canvas state`);
      assert.ok(a.calls.some(call => call[0] === 'fill'), `${kind} draws paper shapes`);
      assert.equal(a.ctx.globalAlpha, 1, `${kind} restores opacity`);
    }
  }
  const a = recordingContext(), b = recordingContext();
  scenery.draw(a.ctx, kind, 100, 200, 50, 0, true);
  scenery.draw(b.ctx, kind, 100, 200, 50, 10, true);
  assert.deepEqual(a.calls, b.calls, `${kind} quiet mode is time-invariant`);
}
assert.equal(new Set(scenery.kinds).size, scenery.kinds.length);
assert.ok(scenery.kinds.length >= 7);
assert.ok(scenery.placements.length >= 15);
for (const placement of scenery.placements) {
  assert.ok(scenery.kinds.includes(placement.kind), 'Placement uses a known asset kind');
  for (const key of ['east', 'north', 'y', 'size']) assert.ok(Number.isFinite(placement[key]), `${key} is finite`);
  assert.ok(placement.size > 0 && placement.y >= 0);
  assert.ok(Math.hypot(placement.east, placement.north) > 0 && Math.hypot(placement.east, placement.north) < 1500, 'Scenery lies on the explorable route');
}
const invalid = recordingContext();
for (const size of [0, -1, NaN, Infinity]) scenery.draw(invalid.ctx, 'pine', 0, 0, size);
scenery.draw(invalid.ctx, 'unknown', 0, 0, 50);
assert.deepEqual(invalid.calls, [], 'Invalid scenery has no canvas side effects');
console.log(`Scenery passed: ${scenery.kinds.length} assets, ${scenery.placements.length} placements, finite drawing, balanced state and quiet time invariance.`);

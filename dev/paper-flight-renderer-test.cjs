/* Canvas API smoke coverage; visual layout is verified separately in the browser. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const physics = require('../assets/paper-flight/physics.js');
const errors = [];
let draws = 0;
const gradient = {addColorStop() {}};
const context = new Proxy({
  globalAlpha: 1,
  createImageData: () => ({data: new Uint8Array(256 * 256 * 4)}),
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
  createPattern: () => ({}),
  measureText: text => ({width: text.length * 6})
}, {
  get(object, key) {
    if (key in object) return object[key];
    return (...args) => {
      if (args.some(value => typeof value === 'number' && !Number.isFinite(value))) errors.push(key);
    };
  },
  set(object, key, value) {
    if (typeof value === 'number' && !Number.isFinite(value)) errors.push(key);
    object[key] = value;
    return true;
  }
});
let width = 800;
const canvas = {getContext: () => context, getBoundingClientRect: () => ({width, height: 500})};
const sandbox = {
  document: {createElement: () => canvas},
  ResizeObserver: class {observe() {} disconnect() {}},
  FlightHUD: {draw() {draws++;}},
  FlightPhysics: physics,
  devicePixelRatio: 1
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/paper-flight/scenery.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/paper-flight/renderer.js'), 'utf8'), sandbox);
const renderer = new sandbox.FlightRenderer(canvas);
let frames = 0;
for (width of [390, 800]) {
  renderer.resize();
  for (const heading of [0, 90, 180, 270]) {
    for (const view of ['pov', 'side']) {
      for (const quiet of [false, true]) {
        for (const weather of [{rain: 0, storm: 0}, {rain: .7, storm: 0}, {rain: 1, storm: 1}]) {
          const state = physics.create();
          Object.assign(state, {heading, east: 310, north: 170, weather, boosting: true});
          const forwardEast = Math.sin(heading * Math.PI / 180);
          const forwardNorth = Math.cos(heading * Math.PI / 180);
          const ahead = distance => ({east: state.east + forwardEast * distance, north: state.north + forwardNorth * distance});
          const target = ahead(80), end = ahead(120);
          state.exploration = {
            time: 2,
            rings: [{...target, id: 'breeze-0', y: 72, radius: 16, collected: false, collectedAt: 0}, {...end, id: 'breeze-1', y: 70, radius: 16, collected: true, collectedAt: 1.7}],
            targets: [{...target, y: 72, phase: 0, active: true}, {...end, y: 70, phase: 1, active: false}],
            pulses: [{east: state.east, north: state.north, y: 70, endEast: end.east, endNorth: end.north, endY: 72, age: .2, life: .45}],
            bursts: [{...target, y: 72, age: .3, life: 1.2}]
          };
          for (const phase of ['ready', 'flying', 'crashing', 'landed']) {
            state.crashed = phase === 'crashing' || phase === 'landed';
            state.y = state.crashed ? physics.terrainHeight(state.east, state.north) : 70;
            renderer.draw(state, {view, quiet, phase, navigation: {id: 'sunfield'}}, .016);
            frames++;
          }
        }
      }
    }
  }
}
// Old save/preview states lack weather, navigation, and exploration fields.
renderer.draw({}, {view: 'pov', phase: 'ready'}, .016);
renderer.draw({}, {view: 'side', phase: 'ready'}, .016);
assert.deepEqual(errors, [], 'Canvas coordinates and numeric properties must stay finite');
assert.ok(draws > 0, 'POV must invoke the flight HUD');
assert.ok(renderer.crashTime > 0, 'Crash animation must advance');
renderer.destroy();

// Identical elapsed time must produce the same visual response on high-refresh displays.
const animatedKeys = ['visualPitch', 'visualRoll', 'wingFlex', 'boostGlow'];
const responses = [];
for (const hz of [30, 60, 120]) {
  const animation = new sandbox.FlightRenderer(canvas);
  const state = physics.create();
  animation.draw(state, {phase: 'ready', view: 'side'}, 0);
  Object.assign(state, {pitch: .42, roll: -.5, lift: state._spec.mass * 9.81 * 1.7, boosting: true});
  for (let frame = 0; frame < hz; frame++) animation.draw(state, {phase: 'flying', view: 'side'}, 1 / hz);
  responses.push(Object.fromEntries(animatedKeys.map(key => [key, animation[key]])));
  assert.ok(animation.visualPitch > .4 && animation.visualRoll < -.48, 'Plane visibly follows flight attitude');
  assert.ok(animation.wingFlex > .8, 'Lift visibly flexes the wings');
  assert.ok(animation.boostGlow > .99, 'Boost reaches its visible powered state');
  // After release, the plume fades instead of disappearing in a single frame.
  state.boosting = false;
  animation.draw(state, {phase: 'flying', view: 'side'}, 1 / hz);
  assert.ok(animation.boostGlow > 0 && animation.boostGlow < responses.at(-1).boostGlow, 'Boost has a release tail');
  animation.destroy();
}
for (const response of responses.slice(1)) for (const key of animatedKeys) {
  assert.ok(Math.abs(response[key] - responses[0][key]) < 1e-10, `${key} is independent of 30/60/120Hz rendering`);
}

const animation = new sandbox.FlightRenderer(canvas), state = physics.create();
const snapshot = () => JSON.stringify(Object.fromEntries(
  [...animatedKeys, 'time', 'crashTime', 'cameraY', 'povPitch', 'povRoll', 'trailClock', 'trail', 'previousTrail'].map(key => [key, animation[key]])
));
animation.draw(state, {phase: 'ready', view: 'side'}, 0);
for (let frame = 1; frame <= 120; frame++) {
  state.x = frame * 2;
  animation.draw(state, {phase: 'flying', view: 'side'}, 1 / 30);
}
assert.ok(animation.trail.length > 100 && animation.trail.length <= 130, 'Trail remains populated and bounded during a long flight');
assert.ok(animation.trail.every(point => animation.time - point.time <= 2.6 + 1e-10), 'Expired trail points are removed');
const beforePause = snapshot();
for (let frame = 0; frame < 10; frame++) animation.draw(state, {phase: 'flying', view: 'side', paused: true}, .08);
assert.equal(snapshot(), beforePause, 'Pause freezes side-view clocks, plume, flex, attitude and trails');
animation.draw(state, {phase: 'flying', view: 'side', quiet: true}, .016);
assert.equal(animation.trail.length, 0, 'Quiet motion clears animated trails');
assert.equal(animation.previousTrail, null, 'Quiet motion clears the trail interpolation anchor');
state.crashed = true;
animation.draw(state, {phase: 'crashing', view: 'pov'}, .016);
const crashPause = snapshot();
for (let frame = 0; frame < 10; frame++) animation.draw(state, {phase: 'crashing', view: 'pov', paused: true}, .08);
assert.equal(snapshot(), crashPause, 'Pause freezes POV camera and crash animation');
animation.destroy();
assert.deepEqual(errors, [], 'Animation lifecycle keeps all Canvas coordinates finite');
console.log('Animation checks passed: refresh-rate independence, boost release, pause freezing, bounded trails and quiet motion.');
console.log(`Renderer smoke passed: ${frames + 2} frames, mobile/desktop, cardinal headings, weather, exploration, crashes, quiet mode and legacy states.`);

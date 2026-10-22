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
console.log(`Renderer smoke passed: ${frames + 2} frames, mobile/desktop, cardinal headings, weather, exploration, crashes, quiet mode and legacy states.`);

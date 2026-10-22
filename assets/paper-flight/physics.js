/* Paper Flight: a deliberately scaled, forgiving glider model, not a flight simulator.
 * L = 1/2 rho V² S CL; D = 1/2 rho V² S CD. Gravity supplies glide energy.
 * References: NASA Glenn, Lift Equation and Vector Balance of Forces — Glider.
 * Positions/speeds are world m and m/s; mass kg, area m², forces N, angles radians.
 * Air density is game-scaled to let a paper craft cross this landscape briskly.
 */
(function (root) {
  'use strict';
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const number = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  const RAD = Math.PI / 180, RHO = .03, G = 9.81, H = 1 / 120;
  function specs(config = {}) {
    const wing = clamp(number(config.wing, 50), 0, 100) / 100;
    const balance = clamp(number(config.balance, 50), 0, 100) / 100;
    const trim = clamp(number(config.trim, 0), -6, 10);
    const levels = [0, 1, 2].map(i => clamp(Math.floor(number(config.levels?.[i], 0)), 0, 8));
    return {
      mass: (.0076 + balance * .0012) * (1 - levels[2] * .018),
      area: .0105 + wing * .007,
      aspectRatio: 2.7 + wing * 2.4 + levels[1] * .19,
      launchSpeed: 32 + levels[0] * 1.65,
      response: .28 + balance * .3,
      trimAlpha: (5.5 + trim * .48 + (0.5 - balance) * 2.4) * RAD,
      stallAlpha: (15 + levels[1] * .22) * RAD,
      profileDrag: (.047 + wing * .008) * (1 - levels[1] * .032 - levels[2] * .012),
      airDensity: RHO, wing, balance, trim, levels
    };
  }
  function thermalAt(x) {
    if (!Number.isFinite(x) || x < 155) return 0;
    const center = 220 + Math.round((x - 220) / 400) * 400;
    const d = Math.abs(x - center) / 65;
    return d < 1 ? 3.6 * Math.pow(Math.cos(d * Math.PI / 2), 2) : 0;
  }
  function create(config = {}, charge = .7) {
    const s = specs(config), speed = s.launchSpeed * (.77 + .23 * clamp(number(charge, .7), 0, 1));
    const gamma = 3 * RAD;
    return {x: 0, y: 70, vx: speed * Math.cos(gamma), vy: speed * Math.sin(gamma),
      roll: 0, heading: 90, pitch: gamma + s.trimAlpha, airspeed: speed, lift: 0, drag: 0, alpha: s.trimAlpha,
      stalled: false, thermal: 0, time: 0, landed: false, maxHeight: 70,
      maxSpeed: speed, thermalTime: 0, stallTime: 0, _spec: s, _accumulator: 0};
  }
  function integrate(s, input, bank) {
    s.roll += (bank * 35 * RAD - s.roll) * (1 - Math.exp(-H * 3.5));
    const p = s._spec;
    // Thermals are finite, spatial updrafts: crossing one trades position for altitude.
    // Fade at altitude and with time so holding a control cannot produce perpetual flight.
    const thermal = thermalAt(s.x) * clamp(1 - s.y / 230, 0, 1) * clamp(1 - s.time / 100, 0, 1);
    const ax = s.vx, ay = s.vy - thermal, v = Math.max(.5, Math.hypot(ax, ay));
    const gamma = Math.atan2(ay, ax);
    const target = gamma + p.trimAlpha + input * 15 * RAD;
    s.pitch += clamp(target - s.pitch, -1, 1) * (1 - Math.exp(-H / p.response));
    const alpha = clamp(s.pitch - gamma, -.65, .8);
    const excess = Math.max(0, Math.abs(alpha) - p.stallAlpha);
    const cl = clamp(.13 + 3.6 * alpha, -.9, 1.25) * Math.exp(-excess * 6);
    const cd = p.profileDrag + cl * cl / (Math.PI * p.aspectRatio * .72) + excess * excess * 2.8;
    const q = .5 * RHO * v * v * p.area;
    const lift = q * cl, drag = q * cd, verticalLift = lift * Math.cos(s.roll);
    s.heading = (s.heading + G * Math.tan(s.roll) / Math.max(8,v) * H / RAD + 360) % 360;
    s.vx += (-drag * ax / v - verticalLift * ay / v) / p.mass * H;
    s.vy += ((verticalLift * ax / v - drag * ay / v) / p.mass - G) * H;
    // Prevent numerical backward looping in a forgiving side-scrolling game.
    s.vx = clamp(s.vx, 2, 75); s.vy = clamp(s.vy, -65, 45);
    s.x += s.vx * H; s.y += s.vy * H; s.time += H;
    Object.assign(s, {airspeed: v, alpha, lift, drag, thermal, stalled: excess > 0});
    s.maxHeight = Math.max(s.maxHeight, s.y); s.maxSpeed = Math.max(s.maxSpeed, v);
    if (thermal > .4) s.thermalTime += H;
    if (s.stalled) s.stallTime += H;
    if (s.y <= 0) {s.y = 0; s.landed = true;}
  }
  function step(state, input = {}, dt = 0) {
    if (!state || state.landed) return state;
    // Same fixed substeps at 30/60/144 Hz; discard tab-suspension time.
    state._accumulator += clamp(number(dt, 0), 0, .25);
    const pitch = clamp(number(input.pitch, 0), -1, 1), bank = clamp(number(input.bank, 0), -1, 1);
    while (state._accumulator + 1e-10 >= H && !state.landed) {
      integrate(state, pitch, bank); state._accumulator -= H;
    }
    return state;
  }
  const api = {create, step, specs, thermalAt};
  root.FlightPhysics = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

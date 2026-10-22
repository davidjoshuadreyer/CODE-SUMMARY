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
  // FAA Glider Flying Handbook: slope lift follows wind over rising terrain;
  // thermal lift follows buoyant heated air. Ground effect reduces induced drag,
  // it is not an upward force. Geometry, density and weather are scaled for play.
  // https://www.faa.gov/sites/faa.gov/files/Glider-Flying-Handbook.pdf
  const LANDMARKS = Object.freeze([
    {id:'sunfield', name:'Sunfield', east:220, north:0, radius:65, kind:'thermal'},
    {id:'foldridge', name:'Fold Ridge', east:310, north:170, radius:80, kind:'ridge'},
    {id:'rainharbor', name:'Rain Harbor', east:460, north:-160, radius:90, kind:'rain'},
    {id:'cloudgarden', name:'Cloud Garden', east:620, north:220, radius:90, kind:'thermal'},
    {id:'stormarch', name:'Storm Arch', east:780, north:-260, radius:105, kind:'storm'}
  ].map(Object.freeze));
  const hill = (e,n,x,z,width,depth,height) => height * Math.exp(-(((e-x)/width)**2+((n-z)/depth)**2));
  function terrainHeight(e,n) {
    return hill(e,n,350,190,105,95,34) + hill(e,n,710,290,150,110,48) + hill(e,n,850,-320,125,100,25);
  }
  function terrainGradient(e,n) {
    return {east:(terrainHeight(e+1,n)-terrainHeight(e-1,n))/2,
      north:(terrainHeight(e,n+1)-terrainHeight(e,n-1))/2};
  }
  function weatherAt(e,n,time=0) {
    const wet=hill(e,n,460,-160,190,140,1), storm=hill(e,n,780,-260,180,145,1);
    const rain=clamp(wet*.82+storm*.95,0,1);
    return {rain,storm,windEast:8+storm*3,windNorth:2,
      gust:storm*(Math.sin(time*2.1+e*.013)*1.2+Math.sin(time*3.7+n*.019)*.7)};
  }
  function updraftAt(e,n,alt,time=0) {
    const groundHeight=terrainHeight(e,n), agl=Math.max(0,alt-groundHeight);
    const weather=weatherAt(e,n,time), gradient=terrainGradient(e,n);
    // Boundary-following wind: w = U·∇h; lift decays away from the ridge.
    const ridgeLift=clamp(weather.windEast*gradient.east+weather.windNorth*gradient.north,-1.5,4)*Math.exp(-agl/80);
    const sun=hill(e,n,220,0,65,75,3.6)+hill(e,n,620,220,90,90,4.8);
    const thermal=sun*clamp(1-alt/270,0,1)*(1-weather.rain*.45)*clamp(1-time/150,0,1);
    return {groundHeight,agl,ridgeLift,thermal,updraft:ridgeLift+thermal+weather.gust,weather};
  }
  function create(config = {}, charge = .7) {
    const s = specs(config), speed = s.launchSpeed * (.77 + .23 * clamp(number(charge, .7), 0, 1));
    const gamma = 3 * RAD;
    return {x: 0, east:0, north:0, groundHeight:terrainHeight(0,0), agl:70-terrainHeight(0,0), energy:1, thrust:0, boosting:false, crashed:false, impactSpeed:0, impactNormal:0, ridgeLift:0, updraft:0, groundEffect:1, weather:weatherAt(0,0), y: 70, vx: speed * Math.cos(gamma), vy: speed * Math.sin(gamma),
      roll: 0, heading: 90, pitch: gamma + s.trimAlpha, airspeed: speed, lift: 0, drag: 0, alpha: s.trimAlpha,
      stalled: false, thermal: 0, time: 0, landed: false, maxHeight: 70,
      maxSpeed: speed, thermalTime: 0, stallTime: 0, _spec: s, _accumulator: 0};
  }
  function integrate(s, input, bank, boost) {
    s.roll += (bank * 35 * RAD - s.roll) * (1 - Math.exp(-H * 3.5));
    const p = s._spec;
    const air=updraftAt(s.east,s.north,s.y,s.time);
    const thermal=air.thermal;
    const ax = s.vx, ay = s.vy - air.updraft, v = Math.max(.5, Math.hypot(ax, ay));
    const gamma = Math.atan2(ay, ax);
    const target = gamma + p.trimAlpha + input * 15 * RAD;
    s.pitch += clamp(target - s.pitch, -1, 1) * (1 - Math.exp(-H / p.response));
    const alpha = clamp(s.pitch - gamma, -.65, .8);
    const excess = Math.max(0, Math.abs(alpha) - p.stallAlpha);
    const cl = clamp(.13 + 3.6 * alpha, -.9, 1.25) * Math.exp(-excess * 6);
    const span=Math.sqrt(p.area*p.aspectRatio);
    // Classical height/span approximation for induced-drag suppression near ground.
    const heightRatio=16*Math.max(.003,air.agl)/span;
    const groundEffect=heightRatio*heightRatio/(1+heightRatio*heightRatio);
    const cd = p.profileDrag*(1+air.weather.rain*.14) + groundEffect*cl*cl/(Math.PI*p.aspectRatio*.72) + excess*excess*2.8;
    const boosting=boost && s.energy>0;
    const thrust=boosting ? p.mass*7.5*Math.min(1,s.energy/(H*.16)) : 0;
    s.energy=clamp(s.energy+(boosting ? -.16 : boost ? 0 : .035)*H,0,1);
    const q = .5 * RHO * v * v * p.area;
    const lift = q * cl, drag = q * cd, verticalLift = lift * Math.cos(s.roll);
    s.heading = (s.heading + G * Math.tan(s.roll) / Math.max(8,v) * H / RAD + 360) % 360;
    s.vx += (thrust*Math.cos(s.pitch)-drag * ax / v - verticalLift * ay / v) / p.mass * H;
    s.vy += ((thrust*Math.sin(s.pitch)+verticalLift * ax / v - drag * ay / v) / p.mass - G) * H;
    // Prevent numerical backward looping in a forgiving side-scrolling game.
    s.vx = clamp(s.vx, 2, 75); s.vy = clamp(s.vy, -65, 45);
    s.x += s.vx * H;
    s.east += s.vx*Math.sin(s.heading*RAD)*H;
    s.north += s.vx*Math.cos(s.heading*RAD)*H;
    s.y += s.vy * H; s.time += H;
    s.groundHeight=terrainHeight(s.east,s.north); s.agl=Math.max(0,s.y-s.groundHeight);
    Object.assign(s, {airspeed: v, alpha, lift, drag, thermal, ridgeLift:air.ridgeLift, updraft:air.updraft, weather:air.weather, groundEffect, thrust, boosting, stalled: excess > 0});
    s.maxHeight = Math.max(s.maxHeight, s.y); s.maxSpeed = Math.max(s.maxSpeed, v);
    if (thermal > .4) s.thermalTime += H;
    if (s.stalled) s.stallTime += H;
    if (s.y <= s.groundHeight) {
      const gradient=terrainGradient(s.east,s.north);
      const terrainRise=s.vx*(gradient.east*Math.sin(s.heading*RAD)+gradient.north*Math.cos(s.heading*RAD));
      s.impactNormal=(s.vy-terrainRise)/Math.hypot(1,gradient.east,gradient.north);
      s.impactSpeed=Math.hypot(s.vx,s.vy); s.crashed=s.impactNormal < -2.5 || Math.abs(s.roll)>20*RAD;
      s.y=s.groundHeight; s.agl=0; s.landed=true; s.boosting=false; s.thrust=0;
    }
  }
  function step(state, input = {}, dt = 0) {
    if (!state || state.landed) return state;
    // Same fixed substeps at 30/60/144 Hz; discard tab-suspension time.
    state._accumulator += clamp(number(dt, 0), 0, .25);
    const pitch = clamp(number(input.pitch, 0), -1, 1), bank = clamp(number(input.bank, 0), -1, 1);
    while (state._accumulator + 1e-10 >= H && !state.landed) {
      integrate(state, pitch, bank, Boolean(input.boost)); state._accumulator -= H;
    }
    return state;
  }
  const api = {create, step, specs, thermalAt, terrainHeight, terrainGradient, weatherAt, updraftAt, LANDMARKS};
  root.FlightPhysics = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

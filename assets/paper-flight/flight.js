/* Interface and input for the Paper Flight laboratory. Physics, drawing and saves
   stay separate so tuning the flight never changes the surrounding workspace. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), P = FlightPhysics, G = FlightProgression;
  let storage; try { storage = localStorage; } catch { storage = null; }
  const loaded = G.load(storage), data = loaded.data;
  let storageOK = loaded.storageOK;
  const renderer = new FlightRenderer($('flight'));
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let quiet = preference.matches, phase = 'ready', paused = false, charge = 0;
  let plane, flightConfig, last = 0, uiClock = 0, stalls = 0, previousStall = false, pulse = 0;
  const inputs = new Set();
  const upgrades = [
    {name:'Launch technique',icon:'↗',description:'A cleaner release adds 1.65 m/s to your full-power launch.'},
    {name:'Precision folds',icon:'〰',description:'Straighter wings reduce drag and tolerate a little more pull-up.'},
    {name:'Paper engineering',icon:'◇',description:'Lighter, smoother stock reduces weight and surface drag.'}
  ];
  const presets = {balanced:{wing:50,balance:50,trim:2},dart:{wing:10,balance:75,trim:0},soarer:{wing:90,balance:35,trim:3}};
  const locked = () => phase === 'flying' || phase === 'charging';
  const config = () => ({...data.config, levels:[...data.levels]});
  function save(){ storageOK = G.save(storage,data); storageNote(); }
  function storageNote(){if(!storageOK)$('save-note').textContent='Device storage is unavailable. You can still fly; progress lasts for this visit.';}
  function designName(c){return Object.entries(presets).find(([,v])=>Object.keys(v).every(k=>v[k]===c[k]))?.[0] || 'custom';}
  function renderDesign(){
    const c = data.config, s = P.specs(config()), name = designName(c);
    $('wing').value=c.wing; $('balance-control').value=c.balance; $('trim').value=c.trim;
    $('wing-value').textContent=c.wing+'%';$('balance-value').textContent=c.balance+'%';$('trim-value').textContent=(c.trim>0?'+':'')+c.trim+'°';
    $('design-name').textContent=name[0].toUpperCase()+name.slice(1)+' fold';
    $('spec-mass').textContent=(s.mass*1000).toFixed(1)+' g';$('spec-area').textContent=Math.round(s.area*10000)+' cm²';$('spec-aspect').textContent=s.aspectRatio.toFixed(1);
    const spread=60+c.wing*.65;$('wing-outline').setAttribute('d',`M150 20 L${150+spread} 150 L150 120 L${150-spread} 150 Z`);$('cg-dot').setAttribute('cy',112-c.balance*.35);
    for(const el of document.querySelectorAll('.tuning input, [data-preset]'))el.disabled=locked();
    document.querySelector('.tuning').classList.toggle('locked',locked());
    for(const el of document.querySelectorAll('[data-preset]'))el.setAttribute('aria-pressed',String(el.dataset.preset===name));
  }
  function renderWorkshop(){
    $('best').innerHTML=`${data.best.toLocaleString()} <small>m</small>`;$('balance').textContent=data.balance;
    $('upgrades').innerHTML=upgrades.map((u,i)=>{const price=G.upgradeCost(data,i),full=data.levels[i]>=8;return `<article class="upgrade"><div class="upgrade-top"><span class="upgrade-icon" aria-hidden="true">${u.icon}</span><span>LEVEL ${data.levels[i]} / 8</span></div><h3>${u.name}</h3><p>${u.description}</p><button data-upgrade="${i}" ${full||data.balance<price||locked()?'disabled':''} aria-label="Upgrade ${u.name}${full?': complete':` for ${price} breeze`}"><span>${full?'Fully developed':'Improve design'}</span><span>${full?'✓':price+' breeze'}</span></button></article>`;}).join('');
    $('contracts').innerHTML=G.contracts(data).map(c=>`<div class="contract ${c.done?'done':''}"><div class="contract-line"><strong>${c.title}</strong><span>${c.done?'✓ Complete':'+'+c.reward+' breeze'}</span></div><p>${c.description}</p><progress aria-label="${c.title}" value="${c.progress}" max="${c.target}"></progress></div>`).join('');
    $('history').innerHTML=data.history.length?data.history.map((f,i)=>`<div class="history-row"><span>#${data.flights-i}</span><div><strong>${f.distance.toLocaleString()} m</strong><small>${f.time.toFixed(1)} s · ${designName(f.config)} · ${f.stalls?'stall recovered / observed':'clean glide'}</small></div><b>+${f.reward}</b></div>`).join(''):'<p class="empty-log">A blank page, for now.<br>Your next flight starts the story. Try a balanced fold, then compare it with a dart.</p>';
    renderDesign();
  }
  $('upgrades').addEventListener('click',e=>{const button=e.target.closest('[data-upgrade]');if(!button||locked())return;const i=Number(button.dataset.upgrade);if(G.purchase(data,i)){if(phase==='landed')ready();save();renderWorkshop();plane=P.create(config(),.7);$('announcement').textContent=upgrades[i].name+' improved.';}});
  for(const [id,field] of [['wing','wing'],['balance-control','balance'],['trim','trim']])$(id).addEventListener('input',()=>{if(locked())return;if(phase==='landed')ready();data.config[field]=Number($(id).value);renderDesign();plane=P.create(config(),.7);save();});
  for(const el of document.querySelectorAll('[data-preset]'))el.addEventListener('click',()=>{if(locked())return;if(phase==='landed')ready();data.config={...presets[el.dataset.preset]};renderDesign();plane=P.create(config(),.7);save();});
  function clearInputs(){inputs.clear();pulse=0;$('pull').classList.remove('is-held');$('dive').classList.remove('is-held');}
  function ready(){phase='ready';paused=false;charge=0;stalls=0;previousStall=false;clearInputs();plane=P.create(config(),.7);$('result').hidden=true;$('invitation').hidden=false;$('launch').hidden=false;$('steering').hidden=true;$('pause').hidden=true;$('charge-display').hidden=false;$('hint').textContent='Hold Space or the button, then release. A quick tap works too.';renderWorkshop();updateHUD();}
  function pressLaunch(){if(phase!=='ready'||paused)return;phase='charging';charge=.3;renderDesign();renderWorkshop();}
  function releaseLaunch(cancel=false){if(phase!=='charging')return;if(cancel){ready();return;}flightConfig=config();plane=P.create(flightConfig,charge);phase='flying';stalls=0;previousStall=false;$('invitation').hidden=true;$('launch').hidden=true;$('charge-display').hidden=true;$('steering').hidden=false;$('pause').hidden=false;$('pause').textContent='Ⅱ';$('pause').setAttribute('aria-label','Pause flight');$('hint').textContent='↑ / Space: pull up briefly · ↓: dive · release: glide · P: pause';$('announcement').textContent='Flight started. Brief pulls trade speed for height. Release to glide.';}
  function land(){phase='landed';clearInputs();const result=G.finish(data,{...plane,stalls,config:flightConfig});save();$('result-label').textContent=result.record?'A NEW PERSONAL HORIZON':'FLIGHT NOTES';$('result-distance').textContent=Math.floor(plane.x).toLocaleString()+' m';$('reward').textContent=`+${result.reward} breeze · ${result.baseReward} for the flight${result.bonuses.length?' + '+result.bonuses.map(b=>b.label+' ('+b.reward+')').join(', '):''}`;$('result-stats').innerHTML=`<span>${plane.time.toFixed(1)} s aloft</span><span>${Math.round(plane.maxSpeed)} m/s peak</span><span>${Math.round(plane.maxHeight)} m high</span>`;
    $('flight-advice').textContent=stalls?'Your wings stalled. Try shorter pull-ups or less positive trim; lower the nose to regain airspeed.':plane.thermalTime>2?'You found the rising air. Compare a wider wing to see how much longer you can ride it.':data.config.wing<35?'The dart is quick through the air. Try wider wings for a longer glide.':'A clean glide. Try the dart for speed, or adjust nose balance and compare your flight log.';
    $('result').hidden=false;$('steering').hidden=true;$('pause').hidden=true;$('hint').textContent='Keep experimenting. Every flight moves your design forward.';renderWorkshop();$('announcement').textContent=`Landed at ${Math.floor(plane.x)} metres. Earned ${result.reward} breeze.`;
  }
  function togglePause(){if(phase!=='flying')return;paused=!paused;clearInputs();$('pause').textContent=paused?'▶':'Ⅱ';$('pause').setAttribute('aria-label',paused?'Resume flight':'Pause flight');$('hint').textContent=paused?'A moment of stillness. Resume whenever you like.':'↑ / Space: pull up briefly · ↓: dive · release: glide · P: pause';updateHUD();}
  function bindHold(id,start,end){const el=$(id);el.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();el.setPointerCapture(e.pointerId);start();});el.addEventListener('pointerup',()=>end(false));el.addEventListener('pointercancel',()=>end(true));el.addEventListener('lostpointercapture',()=>end(false));}
  bindHold('launch',pressLaunch,releaseLaunch);
  for(const [id,sign] of [['pull',1],['dive',-1]]){bindHold(id,()=>{if(phase==='flying'&&!paused){inputs.add(id);$(id).classList.add('is-held');}},()=>{inputs.delete(id);$(id).classList.remove('is-held');});$(id).addEventListener('click',e=>{if(e.detail===0&&phase==='flying'&&!paused)pulse=sign*.35;});}
  $('launch').addEventListener('click',e=>{if(e.detail===0&&phase==='ready'){pressLaunch();charge=.7;releaseLaunch();}});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea,summary,a')||e.target.closest('.design-lab,.upgrades,.science'))return;if(e.code==='KeyP'&&!e.repeat){togglePause();return;}if(e.code==='Space'&&(e.target===document.body||e.target===$('launch')||e.target===$('pull')||e.target===$('dive'))){e.preventDefault();if(!e.repeat&&phase==='ready')pressLaunch();else if(phase==='flying'&&!paused)inputs.add('space');}if(['ArrowUp','ArrowDown','KeyW','KeyS'].includes(e.code)&&phase==='flying'){e.preventDefault();if(!paused)inputs.add(e.code);}});
  document.addEventListener('keyup',e=>{inputs.delete(e.code);if(e.code==='Space'){inputs.delete('space');releaseLaunch();}});
  $('pause').addEventListener('click',togglePause);$('again').addEventListener('click',()=>{ready();$('launch').focus({preventScroll:true});});$('tune').addEventListener('click',()=>{ready();$('wing').focus({preventScroll:true});$('workshop').scrollIntoView({behavior:quiet?'instant':'smooth',block:'start'});});
  function suspend(){clearInputs();releaseLaunch(true);if(phase==='flying'&&!paused)togglePause();last=0;}
  window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();last=0;});
  function motionUI(){$('motion').setAttribute('aria-pressed',String(quiet));$('motion').textContent=quiet?'Quiet motion on':'Quiet motion';}
  $('motion').addEventListener('click',()=>{quiet=!quiet;motionUI();});preference.addEventListener('change',e=>{quiet=e.matches;motionUI();});
  function updateHUD(){
    const active=phase==='flying'||phase==='landed';$('distance').textContent=active?Math.floor(plane.x).toLocaleString():'0';$('speed').innerHTML=`${active?plane.airspeed.toFixed(1):'0'} <small>m/s</small>`;$('altitude').innerHTML=`${Math.round(plane.y)} <small>m</small>`;$('efficiency').textContent=active&&plane.drag>0?Math.max(0,plane.lift/plane.drag).toFixed(1):'—';$('alpha').innerHTML=`${(plane.alpha*180/Math.PI).toFixed(1)} <small>°</small>`;$('air').textContent=plane.thermal>.4?'Rising +'+plane.thermal.toFixed(1):'Still air';$('meter').style.width=charge*100+'%';$('landscape').textContent=plane.x<600?'The lavender coast':plane.x<1000?'The rosewater passage':'The peach horizon';
    $('flight-status').textContent=paused?'Taking a breath':phase==='ready'?'Ready for a little fieldwork':phase==='charging'?(charge>.98?'Ready. Release whenever you like.':'Gathering launch energy…'):phase==='landed'?'A soft landing':plane.stalled?'Wing stall · ease the nose down':plane.thermal>.4?'Rising air · ride the thermal':plane.vy>1?'Climbing · trading speed for height':'Gliding · let the wings do the work';
  }
  function tick(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(!document.hidden){if(!paused){if(phase==='charging')charge=Math.min(1,charge+dt*.95);if(phase==='flying'){const up=inputs.has('pull')||inputs.has('space')||inputs.has('ArrowUp')||inputs.has('KeyW')||pulse>0;const down=inputs.has('dive')||inputs.has('ArrowDown')||inputs.has('KeyS')||pulse<0;P.step(plane,{pitch:Number(up)-Number(down)},dt);if(plane.stalled&&!previousStall)stalls++;previousStall=plane.stalled;if(pulse)pulse=Math.sign(pulse)*Math.max(0,Math.abs(pulse)-dt);if(plane.landed)land();}}renderer.draw(plane,{phase,quiet,paused,charge,config:phase==='flying'?flightConfig:config(),best:data.best},dt);uiClock+=dt;if(uiClock>.08){updateHUD();uiClock=0;}}requestAnimationFrame(tick);}
  ready();storageNote();motionUI();requestAnimationFrame(tick);
})();
